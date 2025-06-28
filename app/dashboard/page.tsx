"use client"

import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Leaf, Scan, TrendingDown, Trophy } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Dashboard() {
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!user) {
      router.push("/auth/signin")
    }
  }, [user, router])

  if (!user) {
    return null
  }

  const monthlyGoal = 10 // kg CO₂
  const progressPercentage = (user.monthlyCarbon / monthlyGoal) * 100

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div>
          <h1 className="text-3xl font-bold text-white">Welcome back, {user.name}! 👋</h1>
          <p className="text-gray-400 mt-2">{"Here's your sustainability overview for this month."}</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="dark-card border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Monthly CO₂</CardTitle>
              <TrendingDown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {/* <div className="text-2xl font-bold text-white">{user.monthlyCarbon.toFixed(1)} kg</div> */}
              <p className="text-xs text-gray-500">{progressPercentage < 100 ? "Below" : "Above"} monthly goal</p>
            </CardContent>
          </Card>

          <Card className="dark-card border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Products Scanned</CardTitle>
              <Scan className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
             <div className="text-2xl font-bold text-white">{user.totalScanned}</div>
              <p className="text-xs text-gray-500">This month</p>
            </CardContent>
          </Card>

          <Card className="dark-card border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Sustainability Score</CardTitle>
              <Leaf className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">B+</div>
              <p className="text-xs text-gray-500">Above average</p>
            </CardContent>
          </Card>

          <Card className="dark-card border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Leaderboard Rank</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">#12</div>
              <p className="text-xs text-gray-500">Out of 1,247 users</p>
            </CardContent>
          </Card>
        </div>

        {/* Monthly Progress */}
        <Card className="dark-card border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Monthly Carbon Goal</CardTitle>
            <CardDescription className="text-gray-400">
              Track your progress towards your {monthlyGoal}kg CO₂ monthly goal
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                {/* <span>
                  {user.monthlyCarbon.toFixed(1)}kg / {monthlyGoal}kg
                </span> */}
              </div>
              <Progress value={Math.min(progressPercentage, 100)} className="h-2" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>0kg</span>
                <span>{monthlyGoal}kg</span>
              </div>
            </div>
            {progressPercentage < 100 && (
              <Badge variant="secondary" className="mt-4 bg-green-100 text-green-800">
                🎯 On track to meet your goal!
              </Badge>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="dark-card border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Scan a Product</CardTitle>
              <CardDescription className="text-gray-400">
                Scan or enter a barcode to check its carbon footprint
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/scan">
                <Button className="w-full">
                  <Scan className="mr-2 h-4 w-4" />
                  Start Scanning
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="dark-card border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">View Leaderboard</CardTitle>
              <CardDescription className="text-gray-400">
                See how you rank against other sustainable shoppers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/leaderboard">
                <Button variant="outline" className="w-full">
                  <Trophy className="mr-2 h-4 w-4" />
                  View Rankings
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
