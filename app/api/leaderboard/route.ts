import { NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import User from "@/models/User"

export async function GET() {
  try {
    await dbConnect()

    // Fetch all users and sort by monthlyCarbon (ascending - lower is better)
    const users = await User.find({})
      .select('name email monthlyCarbon totalScanned createdAt lastScanDate streakCount')
      .sort({ monthlyCarbon: 1, totalScanned: -1 }) // Primary: lower carbon, Secondary: more scans
      .lean()

    // Calculate rank changes (simulate for now - you'd need historical data for real changes)
    const leaderboardData = users.map((user: any, index) => {
      // Simple change calculation based on user activity
      let change = "same"
      if (user.totalScanned > 5) change = "up"
      else if (user.totalScanned === 0) change = "down"
      
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
        lastScanDate: user.lastScanDate
      }
    })

    // Calculate stats
    const totalUsers = users.length
    const averageCarbon = totalUsers > 0 
      ? users.reduce((sum, user) => sum + (user.monthlyCarbon || 0), 0) / totalUsers
      : 0

    return NextResponse.json({
      leaderboard: leaderboardData,
      stats: {
        totalUsers,
        averageCarbon: averageCarbon.toFixed(2)
      }
    })

  } catch (error) {
    console.error("🔥 Leaderboard API error:", error)
    return NextResponse.json(
      { error: "Failed to fetch leaderboard data" },
      { status: 500 }
    )
  }
}
