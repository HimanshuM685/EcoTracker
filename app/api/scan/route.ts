import { NextResponse } from "next/server"
import axios from "axios"
import dbConnect from "@/lib/mongodb"
import User from "@/models/User"
import { calculateCarbonFootprint } from "@/lib/carbon-calculator"

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
          
          await user.save()
          
          console.log(`✅ Updated stats for user ${userEmail}: +${carbonData.carbonFootprint} kg CO₂, streak: ${user.streakCount}`)
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
    return NextResponse.json(
      { error: "Failed to fetch product info" },
      { status: 500 }
    )
  }
}
