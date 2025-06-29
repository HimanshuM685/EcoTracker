import { NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import User from "@/models/User"
import { getUserPointsSummary } from "@/lib/rewards-system"

export async function GET() {
  try {
    await dbConnect()

    // Fetch all users and sort by monthlyCarbon (ascending - lower is better)
    const users = await User.find({})
      .select('name email monthlyCarbon totalScanned createdAt lastScanDate streakCount rewardPoints confirmedPoints unconfirmedPoints totalPointsEarned level achievements purchasedItems activeBadges rewardTransactions')
      .sort({ monthlyCarbon: 1, totalScanned: -1 }) // Primary: lower carbon, Secondary: more scans
      .lean()

    // Calculate rank changes (simulate for now - you'd need historical data for real changes)
    const leaderboardData = users.map((user: any, index) => {
      // Simple change calculation based on user activity
      let change = "same"
      if (user.totalScanned > 5) change = "up"
      else if (user.totalScanned === 0) change = "down"
      
      // Calculate sustainability tier
      const sustainabilityTier = user.monthlyCarbon < 10 && user.totalScanned >= 15 ? 'Platinum' :
                               user.monthlyCarbon < 20 && user.totalScanned >= 10 ? 'Gold' :
                               user.monthlyCarbon < 30 && user.totalScanned >= 5 ? 'Silver' :
                               user.monthlyCarbon < 40 ? 'Bronze' : 'Beginner'
      
      // Get detailed points summary
      const pointsSummary = getUserPointsSummary(user)
      
      return {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        monthlyCarbon: user.monthlyCarbon || 0,
        totalScanned: user.totalScanned || 0,
        rank: index + 1,
        change: change as "up" | "down" | "same",
        joinedAt: user.createdAt,
        streakCount: user.streakCount || 0,
        lastScanDate: user.lastScanDate,
        // Enhanced rewards data with dual point system
        rewardPoints: user.rewardPoints || 0, // Legacy field
        pointsSummary: pointsSummary,
        totalPointsEarned: user.totalPointsEarned || 0,
        level: user.level || 1,
        achievementCount: (user.achievements || []).length,
        sustainabilityTier,
        activeBadges: user.activeBadges || [],
        hasAdvancedFeatures: (user.purchasedItems || []).some((item: any) => 
          ['advanced_analytics', 'streak_protector', 'double_points'].includes(item.itemId))
      }
    })

    // Calculate enhanced stats
    const totalUsers = users.length
    const averageCarbon = totalUsers > 0 
      ? users.reduce((sum, user) => sum + (user.monthlyCarbon || 0), 0) / totalUsers
      : 0
    
    const averageLevel = totalUsers > 0
      ? users.reduce((sum, user) => sum + (user.level || 1), 0) / totalUsers
      : 1

    const totalPointsInSystem = users.reduce((sum, user) => sum + (user.totalPointsEarned || 0), 0)
    
    const tierDistribution = {
      platinum: leaderboardData.filter(u => u.sustainabilityTier === 'Platinum').length,
      gold: leaderboardData.filter(u => u.sustainabilityTier === 'Gold').length,
      silver: leaderboardData.filter(u => u.sustainabilityTier === 'Silver').length,
      bronze: leaderboardData.filter(u => u.sustainabilityTier === 'Bronze').length,
      beginner: leaderboardData.filter(u => u.sustainabilityTier === 'Beginner').length,
    }

    return NextResponse.json({
      leaderboard: leaderboardData,
      stats: {
        totalUsers,
        averageCarbon: averageCarbon.toFixed(2),
        averageLevel: averageLevel.toFixed(1),
        totalPointsInSystem,
        tierDistribution
      }
    })

  } catch (error) {
    console.error("Error fetching leaderboard:", error)
    return NextResponse.json({ error: "Failed to fetch leaderboard" }, { status: 500 })
  }
}
