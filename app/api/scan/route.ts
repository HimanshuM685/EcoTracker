import { NextResponse } from "next/server"
import axios from "axios"
import dbConnect from "@/lib/mongodb"
import User from "@/models/User"
import { calculateCarbonFootprint } from "@/lib/carbon-calculator"
import { 
  calculateScanPoints, 
  calculateLevel, 
  checkAchievements, 
  calculateMonthlyBonus,
  confirmPendingPoints,
  shouldConfirmImmediately,
  getUserPointsSummary,
  POINT_REWARDS 
} from "@/lib/rewards-system"

type OpenFoodFactsResponse = {
  product: {
    product_name?: string;
    brands?: string;
    categories?: string;
    ingredients_text?: string;
  };
  status: number;
  code: string;
};

export async function POST(req: Request) {
  const { barcode, userEmail } = await req.json()

  if (!barcode) {
    return NextResponse.json({ error: "Barcode missing" }, { status: 400 })
  }

  try {
    const productRes = await axios.get<OpenFoodFactsResponse>(
      `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`
    );

    const product = productRes.data.product

    if (!product?.product_name) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    // Calculate carbon footprint
    const carbonData = calculateCarbonFootprint(
      product.product_name, 
      product.brands
    )

    // Update user stats in database if userEmail is provided
    if (userEmail) {
      try {
        await dbConnect()
        
        const user = await User.findOne({ email: userEmail })
        
        if (user) {
          const today = new Date()
          today.setHours(0, 0, 0, 0)
          
          const isFirstScan = user.totalScanned === 0;
          
          // Calculate points for this scan
          const pointsData = calculateScanPoints(
            carbonData.carbonFootprint, 
            isFirstScan, 
            user.streakCount,
            user.totalScanned
          );
          
          // Confirm any pending points that are ready
          const confirmationData = confirmPendingPoints(user);
          if (confirmationData.confirmedPoints > 0) {
            user.confirmedPoints = (user.confirmedPoints || 0) + confirmationData.confirmedPoints;
            user.unconfirmedPoints = Math.max(0, (user.unconfirmedPoints || 0) - confirmationData.confirmedPoints);
          }
          
          // Add scan to history
          user.scans.push({
            productName: product.product_name,
            carbonEstimate: parseFloat(carbonData.carbonFootprint.toFixed(2)),
            category: carbonData.category,
            confidence: carbonData.confidence,
            barcode: barcode,
            date: new Date()
          })
          
          // Update totals
          user.monthlyCarbon += carbonData.carbonFootprint
          user.totalScanned += 1
          
          // Calculate streak
          const lastScan = user.lastScanDate ? new Date(user.lastScanDate) : null
          const yesterday = new Date(today)
          yesterday.setDate(yesterday.getDate() - 1)
          
          if (!lastScan) {
            // First scan
            user.streakCount = 1
          } else if (lastScan.getTime() === today.getTime()) {
            // Already scanned today, don't increment streak
          } else if (lastScan.getTime() === yesterday.getTime()) {
            // Scanned yesterday, continue streak
            user.streakCount += 1
          } else {
            // Streak broken
            user.streakCount = 1
          }
          
          user.lastScanDate = today
          user.bestStreakCount = Math.max(user.bestStreakCount || 0, user.streakCount)
          
          // Award points based on confirmation status
          const isConfirmed = pointsData.isConfirmed || shouldConfirmImmediately(isFirstScan ? 'first_scan' : 'daily_scan');
          
          if (isConfirmed) {
            user.confirmedPoints = (user.confirmedPoints || 0) + pointsData.points;
          } else {
            user.unconfirmedPoints = (user.unconfirmedPoints || 0) + pointsData.points;
          }
          
          // Legacy field for backward compatibility
          user.rewardPoints = (user.confirmedPoints || 0) + (user.unconfirmedPoints || 0);
          user.totalPointsEarned = (user.totalPointsEarned || 0) + pointsData.points;
          
          // Add reward transaction
          user.rewardTransactions = user.rewardTransactions || [];
          user.rewardTransactions.push({
            type: 'earned',
            points: pointsData.points,
            pointsType: isConfirmed ? 'confirmed' : 'unconfirmed',
            reason: isFirstScan ? 'first_scan' : 'daily_scan',
            description: pointsData.reasons.join(', '),
            date: new Date(),
            confirmedAt: isConfirmed ? new Date() : null
          });
          
          // Check for level up
          const oldLevel = user.level || 1;
          const levelData = calculateLevel(user.totalPointsEarned);
          user.level = levelData.level;
          user.nextLevelPoints = levelData.nextLevelPoints;
          
          // Award level up bonus (always confirmed)
          if (levelData.level > oldLevel) {
            user.confirmedPoints = (user.confirmedPoints || 0) + POINT_REWARDS.LEVEL_UP;
            user.rewardPoints = (user.confirmedPoints || 0) + (user.unconfirmedPoints || 0);
            user.totalPointsEarned += POINT_REWARDS.LEVEL_UP;
            user.rewardTransactions.push({
              type: 'earned',
              points: POINT_REWARDS.LEVEL_UP,
              pointsType: 'confirmed',
              reason: 'level_up',
              description: `Level up to ${levelData.level}!`,
              date: new Date(),
              confirmedAt: new Date()
            });
          }

          // Check for monthly bonus (first time this month) - always confirmed
          const monthlyBonus = calculateMonthlyBonus(user);
          if (monthlyBonus && (!user.lastMonthlyBonusCheck || 
              new Date(user.lastMonthlyBonusCheck).getMonth() !== new Date().getMonth())) {
            user.confirmedPoints = (user.confirmedPoints || 0) + monthlyBonus.points;
            user.rewardPoints = (user.confirmedPoints || 0) + (user.unconfirmedPoints || 0);
            user.totalPointsEarned += monthlyBonus.points;
            user.rewardTransactions.push({
              type: 'earned',
              points: monthlyBonus.points,
              pointsType: 'confirmed',
              reason: 'monthly_bonus',
              description: monthlyBonus.reason,
              date: new Date(),
              confirmedAt: new Date()
            });
            user.lastMonthlyBonusCheck = new Date();
            user.monthlyBonusesEarned = (user.monthlyBonusesEarned || 0) + 1;
          }
          
          // Check for new achievements
          const newAchievements = checkAchievements(user);
          const earnedAchievements = [];
          
          for (const achievement of newAchievements) {
            // Check if user already has this achievement
            const alreadyHasAchievement = user.achievements?.some((a: any) => a.id === achievement.id);
            if (!alreadyHasAchievement) {
              user.achievements = user.achievements || [];
              user.achievements.push({
                id: achievement.id,
                name: achievement.name,
                description: achievement.description,
                points: achievement.points,
                earnedAt: new Date()
              });
              
              // Achievement points are always confirmed
              user.confirmedPoints = (user.confirmedPoints || 0) + achievement.points;
              user.rewardPoints = (user.confirmedPoints || 0) + (user.unconfirmedPoints || 0);
              user.totalPointsEarned += achievement.points;
              
              user.rewardTransactions.push({
                type: 'earned',
                points: achievement.points,
                pointsType: 'confirmed',
                reason: 'achievement',
                description: `Achievement: ${achievement.name}`,
                date: new Date(),
                confirmedAt: new Date()
              });
              
              earnedAchievements.push(achievement);
            }
          }
          
          await user.save()
          
          // Get point summary for response
          const pointsSummary = getUserPointsSummary(user);
          
          console.log(`✅ Updated stats for user ${userEmail}: +${carbonData.carbonFootprint} kg CO₂, +${pointsData.points} points (${isConfirmed ? 'confirmed' : 'unconfirmed'}), streak: ${user.streakCount}, level: ${user.level}`)
          
          // Return enhanced response with all reward info
          return NextResponse.json({
            productName: product.product_name,
            brand: product.brands || "Unknown",
            carbonEstimate: carbonData.carbonFootprint.toFixed(2),
            category: carbonData.category,
            confidence: carbonData.confidence,
            calculation: carbonData.calculation,
            ingredients: product.ingredients_text || "Not available",
            // Enhanced rewards data with dual point system
            rewards: {
              pointsEarned: pointsData.points,
              pointsType: isConfirmed ? 'confirmed' : 'unconfirmed',
              reasons: pointsData.reasons,
              pointsSummary: pointsSummary,
              level: user.level,
              leveledUp: levelData.level > oldLevel,
              newAchievements: earnedAchievements,
              streakCount: user.streakCount,
              monthlyBonus: monthlyBonus,
              sustainabilityTier: user.monthlyCarbon < 10 && user.totalScanned >= 15 ? 'Platinum' :
                                 user.monthlyCarbon < 20 && user.totalScanned >= 10 ? 'Gold' :
                                 user.monthlyCarbon < 30 && user.totalScanned >= 5 ? 'Silver' :
                                 user.monthlyCarbon < 40 ? 'Bronze' : 'Beginner',
              pendingConfirmationInfo: confirmationData.confirmedPoints > 0 ? {
                pointsConfirmed: confirmationData.confirmedPoints,
                transactionsConfirmed: confirmationData.confirmedTransactions.length
              } : null
            }
          })
        }
      } catch (dbError) {
        console.error("🔥 Failed to update user stats:", dbError)
      }
    }

    return NextResponse.json({
      productName: product.product_name,
      brand: product.brands || "Unknown",
      carbonEstimate: carbonData.carbonFootprint.toFixed(2),
      category: carbonData.category,
      confidence: carbonData.confidence,
      calculation: carbonData.calculation,
      ingredients: product.ingredients_text || "Not available"
    })

  } catch (error) {
    console.error("🔥 Error in scan API:", error)
    return NextResponse.json({ error: "Failed to scan product" }, { status: 500 })
  }
}
