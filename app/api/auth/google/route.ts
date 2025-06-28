import { NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import User from "@/models/User"

export async function POST(req: Request) {
  try {
    console.log("✅ Google auth endpoint hit")

    await dbConnect()
    console.log("✅ Connected to DB")

    const body = await req.json()
    console.log("📦 Request body:", body)

    const { name, email, firebaseUid } = body

    // Check if user already exists
    let user = await User.findOne({ email })
    
    if (user) {
      console.log("✅ Existing Google user found:", user)
      const userData = {
        _id: user._id,
        email: user.email,
        name: user.name,
        monthlyCarbon: user.monthlyCarbon || 0,
        totalScanned: user.totalScanned || 0,
        joinedAt: user.createdAt?.toISOString().split("T")[0] || new Date().toISOString().split("T")[0],
      }
      return NextResponse.json({ user: userData }, { status: 200 })
    } else {
      // Create new user for Google sign-in
      user = await User.create({
        name,
        email,
        password: firebaseUid, // Use Firebase UID as password for Google users
        monthlyCarbon: 0,
        totalScanned: 0,
        joinedAt: new Date().toISOString(),
        authProvider: 'google',
        firebaseUid: firebaseUid,
      })

      console.log("✅ New Google user created:", user)
      
      const userData = {
        _id: user._id,
        email: user.email,
        name: user.name,
        monthlyCarbon: user.monthlyCarbon || 0,
        totalScanned: user.totalScanned || 0,
        joinedAt: user.createdAt?.toISOString().split("T")[0] || new Date().toISOString().split("T")[0],
      }

      return NextResponse.json({ user: userData }, { status: 201 })
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown server error"
    console.error("🔥 Google auth API error:", message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
