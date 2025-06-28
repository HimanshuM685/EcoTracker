import { NextResponse } from "next/server"
import axios from "axios"
import dbConnect from "@/lib/mongodb"
import User from "@/models/User"

type OpenFoodFactsResponse = {
  product: {
    product_name?: string;
    brands?: string;
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

    const estimatedCarbon = Math.random() * 2 + 0.5

    // Update user stats in database if userEmail is provided
    if (userEmail) {
      try {
        await dbConnect()
        
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        
        const user = await User.findOne({ email: userEmail })
        
        if (user) {
          // Update carbon and scan count
          user.monthlyCarbon += estimatedCarbon
          user.totalScanned += 1
          
          // Update streak logic
          const lastScan = user.lastScanDate ? new Date(user.lastScanDate) : null
          const yesterday = new Date(today)
          yesterday.setDate(yesterday.getDate() - 1)
          
          if (!lastScan || lastScan < yesterday) {
            // Reset streak if more than a day gap
            user.streakCount = 1
          } else if (lastScan.getTime() === yesterday.getTime()) {
            // Continue streak if scanned yesterday
            user.streakCount += 1
          }
          // If scanned today already, don't change streak
          
          user.lastScanDate = today
          user.bestStreakCount = Math.max(user.bestStreakCount || 0, user.streakCount)
          
          await user.save()
          
          console.log(`✅ Updated stats for user ${userEmail}: +${estimatedCarbon.toFixed(2)} kg CO₂, +1 scan, streak: ${user.streakCount}`)
        }
      } catch (dbError) {
        console.error("🔥 Failed to update user stats:", dbError)
        // Don't fail the request if DB update fails
      }
    }

    return NextResponse.json({
      productName: product.product_name,
      brand: product.brands || "Unknown",
      carbonEstimate: estimatedCarbon.toFixed(2),
    })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch product info" },
      { status: 500 }
    )
  }
}
