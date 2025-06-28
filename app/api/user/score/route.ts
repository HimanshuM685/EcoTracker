// app/api/user/score/route.ts

import { NextResponse } from "next/server"

let userDB: { [email: string]: { score: number; scans: any[] } } = {}

export async function POST(req: Request) {
  const { email, productName, carbonEstimate } = await req.json()

  if (!userDB[email]) {
    userDB[email] = { score: 0, scans: [] }
  }

  userDB[email].score += parseFloat(carbonEstimate)
  userDB[email].scans.push({
    productName,
    carbonEstimate: parseFloat(carbonEstimate),
    date: new Date().toISOString().split("T")[0],
  })

  return NextResponse.json({
    success: true,
    newScore: userDB[email].score.toFixed(2),
  })
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const email = searchParams.get("email")

  if (!email || !userDB[email]) {
    return NextResponse.json({ scans: [] })
  }

  return NextResponse.json({ scans: userDB[email].scans })
}
