import { NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import User from "@/models/User"
import bcrypt from "bcryptjs"

export async function POST(req: Request) {
  try {
    console.log("✅ Signup endpoint hit")

    await dbConnect()
    console.log("✅ Connected to DB")

    const body = await req.json()
    console.log("📦 Request body:", body)

    const { name, email, password } = body

    const existing = await User.findOne({ email })
    if (existing) {
      console.warn("⚠️ User already exists:", email)
      return NextResponse.json({ error: "User already exists" }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    console.log("🔒 Password hashed")

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      monthlyCarbon: 0,         // ✅ ADD these if they exist in the schema
      totalScanned: 0,          // ✅ Same here
      joinedAt: new Date().toISOString(), // ✅ Required field?
    })

    console.log("✅ User created:", user)

    return NextResponse.json({ user }, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown server error"
    console.error("🔥 Signup API error:", message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}


