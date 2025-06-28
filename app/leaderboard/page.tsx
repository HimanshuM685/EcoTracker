"use client"

import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Trophy, Medal, Award, TrendingDown } from "lucide-react"

// Mock leaderboard data
const leaderboardData = [
  { id: "1", name: "You", monthlyCarbon: 4.09, rank: 1, change: "up" },
  { id: "2", name: "Madhurima Khan", monthlyCarbon: 15.7, rank: 2, change: "same" },
  { id: "3", name: "Shatakshi Saha", monthlyCarbon: 18.2, rank: 3, change: "down" },
  { id: "4", name: "Ananya Chatterjee", monthlyCarbon: 22.1, rank: 4, change: "up" },
  { id: "5", name: "Maryada Tudu", monthlyCarbon: 25.4, rank: 5, change: "up" },
  { id: "6", name: "Ashmita Sadhu", monthlyCarbon: 28.9, rank: 6, change: "down" },
  { id: "7", name: "Ayush tudu", monthlyCarbon: 31.2, rank: 7, change: "same" },
  { id: "8", name: "sarnavo saha Sardar", monthlyCarbon: 34.5, rank: 8, change: "up" },
  { id: "9", name: "Ayush Mondal", monthlyCarbon: 37.8, rank: 9, change: "down" },
  { id: "10", name: "Sayan Chatterjee", monthlyCarbon: 41.1, rank: 10, change: "up" },
  { id: "11", name: "Susmita Masat", monthlyCarbon: 43.7, rank: 11, change: "same" },
  { id: "12", name: "Sayan Das", monthlyCarbon: 45.2, rank: 12, change: "up", isCurrentUser: true },
]

export default function LeaderboardPage() {
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-500" />
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />
      case 3:
        return <Award className="h-5 w-5 text-amber-600" />
      default:
        return <span className="text-lg font-bold text-gray-500">#{rank}</span>
    }
  }

  const getChangeIndicator = (change: string) => {
    switch (change) {
      case "up":
        return <span className="text-green-600">↗</span>
      case "down":
        return <span className="text-red-600">↘</span>
      default:
        return <span className="text-gray-400">→</span>
    }
  }

  const getSustainabilityLevel = (carbon: number) => {
    if (carbon < 20) return { level: "Excellent", color: "bg-green-100 text-green-800" }
    if (carbon < 35) return { level: "Good", color: "bg-blue-100 text-blue-800" }
    if (carbon < 50) return { level: "Average", color: "bg-yellow-100 text-yellow-800" }
    return { level: "Needs Improvement", color: "bg-red-100 text-red-800" }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Leaderboard</h1>
          <p className="text-gray-400 mt-2">See how you rank against other sustainable shoppers this month.</p>
        </div>

        {/* Top 3 Podium */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {leaderboardData.slice(0, 3).map((user, index) => (
            <Card key={user.id} className={`dark-card border-gray-700 ${index === 0 ? "ring-2 ring-yellow-400" : ""}`}>
              <CardHeader className="text-center pb-2">
                <div className="flex justify-center mb-2">{getRankIcon(user.rank)}</div>
                <CardTitle className="text-lg text-white">{user.name}</CardTitle>
                <CardDescription className="text-gray-400">{user.monthlyCarbon} kg CO₂ this month</CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <Badge className={getSustainabilityLevel(user.monthlyCarbon).color}>
                  {getSustainabilityLevel(user.monthlyCarbon).level}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Full Leaderboard */}
        <Card className="dark-card border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <TrendingDown className="h-5 w-5" />
              Monthly Rankings
            </CardTitle>
            <CardDescription className="text-gray-400">
              Rankings based on lowest carbon footprint this month
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {leaderboardData.map((user) => (
                <div
                  key={user.id}
                  className={`flex items-center justify-between p-4 rounded-lg border ${
                    user.isCurrentUser ? "bg-900/30 border-700" : "bg-gray-800/50 border-gray-700"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-8">{getRankIcon(user.rank)}</div>
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-gray-100">
                        {user.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium text-white">
                        {user.name}
                        {/* {user.isCurrentUser && (
                          <Badge variant="secondary" className="ml-2 bg-green-900/50 text-green-400 border-green-700">
                            You
                          </Badge>
                        )} */}
                      </div>
                      <div className="text-sm text-gray-400">{user.monthlyCarbon} kg CO₂ this month</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge className={getSustainabilityLevel(user.monthlyCarbon).color}>
                      {getSustainabilityLevel(user.monthlyCarbon).level}
                    </Badge>
                    <div className="text-sm text-gray-500">{getChangeIndicator(user.change)}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="dark-card border-gray-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Your Rank</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">#1</div>
              <p className="text-xs text-gray-500">Out of 1,247 users</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Top 1%</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">Users to beat</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Average CO₂</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">52.3 kg</div>
              <p className="text-xs text-muted-foreground">Community average</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
