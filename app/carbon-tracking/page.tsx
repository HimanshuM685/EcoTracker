"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/components/auth-provider"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, TrendingDown, Target, Award, BarChart3, Minus, CheckCircle, AlertTriangle } from "lucide-react"

// const monthlyGoals = [
//   { month: "January", goal: 50, actual: 52.1, status: "missed" },
//   { month: "February", goal: 50, actual: 48.7, status: "achieved" },
//   { month: "March", goal: 45, actual: 45.2, status: "close" },
//   { month: "April", goal: 45, actual: 42.8, status: "achieved" },
//   { month: "May", goal: 40, actual: 39.5, status: "achieved" },
//   { month: "June", goal: 40, actual: 37.2, status: "achieved" },
// ]

// const carbonCategories = [
//   { name: "Transportation", current: 15.2, target: 12.0, color: "bg-blue-500" },
//   { name: "Food", current: 18.5, target: 20.0, color: "bg-green-500" },
//   { name: "Energy", current: 8.3, target: 10.0, color: "bg-yellow-500" },
//   { name: "Shopping", current: 6.7, target: 8.0, color: "bg-purple-500" },
// ]

// const achievements = [
//   { title: "First Week Complete", description: "Tracked carbon for 7 days", earned: true, icon: "🎯" },
//   { title: "Goal Achiever", description: "Met monthly goal 3 times", earned: true, icon: "🏆" },
//   { title: "Eco Warrior", description: "Reduced carbon by 20%", earned: true, icon: "🌱" },
//   { title: "Consistency King", description: "30 days of tracking", earned: false, icon: "👑" },
//   { title: "Carbon Neutral", description: "Offset all emissions", earned: false, icon: "⚖️" },
// ]

export default function CarbonTrackingPage() {
  const [selectedPeriod, setSelectedPeriod] = useState("week")
  const [dailyEntries, setDailyEntries] = useState<any[]>([])
  const { user } = useAuth()

  useEffect(() => {
    const fetchUserScans = async () => {
      if (!user?.email) return

      const res = await fetch(`/api/user/score?email=${user.email}`)
      const data = await res.json()

      const uniqueEntries = Array.from(
        new Map(
          data.scans.map((entry: any) => [
            `${new Date(entry.date).toDateString()}_${entry.productName}`,
            entry,
          ])
        ).values()
      )

      setDailyEntries(uniqueEntries)
    }

    fetchUserScans()
  }, [user?.email])

  const uniqueScanDates = Array.from(
    new Set(dailyEntries.map((entry) => new Date(entry.date).toDateString()))
  ).sort((a, b) => new Date(b).getTime() - new Date(a).getTime())

  const getStreakCount = () => {
    let streak = 0
    let today = new Date()

    for (let dateStr of uniqueScanDates) {
      const entryDate = new Date(dateStr)
      if (entryDate.toDateString() === today.toDateString()) {
        streak++
        today.setDate(today.getDate() - 1)
      } else {
        break // Streak broken
      }
    }

    return streak
  }

  const streakCount = getStreakCount()

  const currentMonthCarbon = dailyEntries.reduce((sum, entry) => sum + entry.carbonEstimate, 0)
  const monthlyGoal = 40
  const progressPercentage = (currentMonthCarbon / monthlyGoal) * 100

  // const getStatusColor = (status: string) => {
  //   switch (status) {
  //     case "achieved":
  //       return "text-green-400"
  //     case "close":
  //       return "text-yellow-400"
  //     case "missed":
  //       return "text-red-400"
  //     default:
  //       return "text-gray-400"
  //   }
  // }

  // const getStatusIcon = (status: string) => {
  //   switch (status) {
  //     case "achieved":
  //       return <CheckCircle className="h-4 w-4 text-green-400" />
  //     case "close":
  //       return <AlertTriangle className="h-4 w-4 text-yellow-400" />
  //     case "missed":
  //       return <Minus className="h-4 w-4 text-red-400" />
  //     default:
  //       return <AlertTriangle className="h-4 w-4 text-gray-400" />
  //   }
  // }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Carbon Tracking</h1>
          <p className="text-gray-400 mt-2">
            Monitor your daily carbon footprint and track progress towards your sustainability goals.
          </p>
        </div>

        {/* Current Month Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="dark-card border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">This Month</CardTitle>
              <Calendar className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{currentMonthCarbon.toFixed(1)} kg</div>
              <p className="text-xs text-gray-500">CO₂ emissions</p>
            </CardContent>
          </Card>

          <Card className="dark-card border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Daily Average</CardTitle>
              <TrendingDown className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {(currentMonthCarbon / dailyEntries.length).toFixed(1)} kg
              </div>
              <p className="text-xs text-gray-500">per day</p>
            </CardContent>
          </Card>

          <Card className="dark-card border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Goal Progress</CardTitle>
              <Target className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{progressPercentage.toFixed(0)}%</div>
              <p className="text-xs text-gray-500">of monthly goal</p>
            </CardContent>
          </Card>

          <Card className="dark-card border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Streak</CardTitle>
              <Award className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">7 days</div>
              <p className="text-xs text-gray-500">tracking streak</p>
            </CardContent>
          </Card>
        </div>

        {/* Monthly Goal Progress */}
        <Card className="dark-card border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Monthly Goal Progress</CardTitle>
            <CardDescription className="text-gray-400">
              Track your progress towards your {monthlyGoal}kg CO₂ monthly goal
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-300">Progress</span>
                <span className="text-gray-300">
                  {currentMonthCarbon.toFixed(1)}kg / {monthlyGoal}kg
                </span>
              </div>
              <Progress value={Math.min(progressPercentage, 100)} className="h-3" />
              <div className="flex justify-between text-xs text-gray-500">
                <span>0kg</span>
                <span>{monthlyGoal}kg</span>
              </div>
              {progressPercentage < 100 && (
                <Badge className="bg-green-900/50 text-green-400 border-green-700">
                  🎯 On track to meet your goal!
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="daily" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-gray-800 border-gray-700">
            <TabsTrigger value="daily" className="data-[state=active]:bg-green-600">
              Daily
            </TabsTrigger>
            {/* <TabsTrigger value="goals" className="data-[state=active]:bg-green-600">
              Goals
            </TabsTrigger>
            <TabsTrigger value="categories" className="data-[state=active]:bg-green-600">
              Categories
            </TabsTrigger>
            <TabsTrigger value="achievements" className="data-[state=active]:bg-green-600">
              Achievements
            </TabsTrigger> */}
          </TabsList>

          <TabsContent value="daily" className="space-y-6">
            <Card className="dark-card border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Calendar className="h-5 w-5" />
                  Daily Carbon Entries
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Your carbon footprint for each day this week
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dailyEntries.map((entry) => (
                    <div key={entry.date} className="...">
                      <div>
                        <div className="font-medium text-white">
                          {new Date(entry.date).toLocaleDateString("en-US", {
                            weekday: "long",
                            month: "short",
                            day: "numeric",
                          })}
                        </div>
                        <div className="text-sm text-gray-400">{entry.productName}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-white">{entry.carbonEstimate} kg</div>
                        <div className="text-xs text-gray-500">CO₂</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* <TabsContent value="goals" className="space-y-6">
            <Card className="dark-card border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Target className="h-5 w-5" />
                  Monthly Goals History
                </CardTitle>
                <CardDescription className="text-gray-400">Track your goal achievement over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {monthlyGoals.map((goal) => (
                    <div
                      key={goal.month}
                      className="flex items-center justify-between p-4 rounded-lg bg-gray-800/50 border border-gray-700"
                    >
                      <div className="flex items-center gap-3">
                        {getStatusIcon(goal.status)}
                        <div>
                          <div className="font-medium text-white">{goal.month}</div>
                          <div className="text-sm text-gray-400">
                            Goal: {goal.goal}kg | Actual: {goal.actual}kg
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge
                          className={`${
                            goal.status === "achieved"
                              ? "bg-green-900/50 text-green-400 border-green-700"
                              : goal.status === "close"
                                ? "bg-yellow-900/50 text-yellow-400 border-yellow-700"
                                : "bg-red-900/50 text-red-400 border-red-700"
                          }`}
                        >
                          {goal.status === "achieved" ? "Achieved" : goal.status === "close" ? "Close" : "Missed"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="categories" className="space-y-6">
            <Card className="dark-card border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <BarChart3 className="h-5 w-5" />
                  Carbon by Category
                </CardTitle>
                <CardDescription className="text-gray-400">Break down your emissions by category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {carbonCategories.map((category) => (
                    <div key={category.name} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-300">{category.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-400">
                            {category.current}kg / {category.target}kg
                          </span>
                          {category.current <= category.target && <CheckCircle className="h-4 w-4 text-green-400" />}
                        </div>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${category.color}`}
                          style={{ width: `${Math.min((category.current / category.target) * 100, 100)}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>0kg</span>
                        <span>{category.target}kg target</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="achievements" className="space-y-6">
            <Card className="dark-card border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Award className="h-5 w-5" />
                  Sustainability Achievements
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Unlock achievements as you progress on your sustainability journey
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {achievements.map((achievement, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-lg border ${
                        achievement.earned ? "bg-green-900/20 border-green-700" : "bg-gray-800/50 border-gray-700"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <span className={`text-2xl ${achievement.earned ? "" : "grayscale opacity-50"}`}>
                          {achievement.icon}
                        </span>
                        <div className="flex-1">
                          <h4 className={`font-medium mb-1 ${achievement.earned ? "text-white" : "text-gray-400"}`}>
                            {achievement.title}
                          </h4>
                          <p className={`text-sm ${achievement.earned ? "text-gray-300" : "text-gray-500"}`}>
                            {achievement.description}
                          </p>
                          {achievement.earned && (
                            <Badge className="mt-2 bg-green-900/50 text-green-400 border-green-700">Earned</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent> */}
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
