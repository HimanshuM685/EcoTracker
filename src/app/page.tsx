"use client"

import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Leaf, 
  Scan, 
  TrendingDown, 
  Trophy, 
  Users, 
  BarChart3, 
  Zap, 
  Shield, 
  Sparkles,
  ArrowRight,
  Star,
  CheckCircle,
  Globe,
  Target,
  Award
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import GoogleSignInButton from "@/components/google-signin-button"

export default function LandingPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
    if (user) {
      router.push("/dashboard")
    }
  }, [user, router])

  if (user) {
    return null // Will redirect to dashboard
  }

  const stats = [
    { number: "15K+", label: "Active Users", icon: Users },
    { number: "2.3M", label: "Products Scanned", icon: Scan },
    { number: "850T", label: "CO₂ Saved", icon: Leaf },
    { number: "94%", label: "User Satisfaction", icon: Star },
  ]

  const features = [
    {
      icon: Scan,
      title: "Smart Barcode Scanner",
      description: "AI-powered scanning with instant product recognition and sustainability analysis",
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      icon: TrendingDown,
      title: "Real-time Carbon Tracking",
      description: "Monitor your environmental impact with detailed analytics and personalized insights",
      gradient: "from-green-500 to-emerald-500"
    },
    {
      icon: Trophy,
      title: "Global Leaderboards",
      description: "Compete with eco-warriors worldwide and unlock achievement badges",
      gradient: "from-yellow-500 to-orange-500"
    },
    {
      icon: BarChart3,
      title: "Advanced Analytics",
      description: "Deep insights into your shopping patterns with predictive sustainability scoring",
      gradient: "from-purple-500 to-pink-500"
    },
    {
      icon: Shield,
      title: "Data Privacy First",
      description: "Your data is encrypted and secure with complete transparency and control",
      gradient: "from-indigo-500 to-blue-500"
    },
    {
      icon: Globe,
      title: "Global Impact Network",
      description: "Connect with a worldwide community making real environmental change",
      gradient: "from-teal-500 to-green-500"
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-green-500/10 blur-3xl animate-pulse"></div>
        <div className="absolute top-60 -left-40 w-60 h-60 rounded-full bg-blue-500/10 blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-40 right-20 w-40 h-40 rounded-full bg-purple-500/10 blur-2xl animate-pulse delay-2000"></div>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-gray-800/50 bg-gray-900/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Leaf className="h-8 w-8 text-green-400" />
                <div className="absolute inset-0 h-8 w-8 text-green-400 animate-ping opacity-20">
                  <Leaf className="h-8 w-8" />
                </div>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-green-400 to-emerald-300 bg-clip-text text-transparent">
                EcoTracker
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden sm:block">
                <GoogleSignInButton 
                  text="Continue with Google" 
                  className="bg-white hover:bg-gray-50 text-gray-900 border-none shadow-lg hover:shadow-xl transition-all duration-300" 
                />
              </div>
              <Link href="/auth/signin">
                <Button variant="ghost" className="text-gray-300 hover:text-white hover:bg-gray-800/50 transition-all duration-300">
                  Sign In
                </Button>
              </Link>
              <Link href="/auth/signup">
                <Button className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 shadow-lg shadow-green-500/25 transition-all duration-300 hover:shadow-green-500/40">
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-24 px-4 overflow-hidden">
        <div className="container mx-auto relative z-10">
          <div className={`text-center transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <Badge className="mb-6 bg-gradient-to-r from-green-900/50 to-emerald-900/50 text-green-400 hover:from-green-800/50 hover:to-emerald-800/50 border-green-500/50 transition-all duration-300">
              <Sparkles className="mr-2 h-4 w-4" />
              Track Your Impact
            </Badge>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-8 leading-tight">
              <span className="text-white">Shop</span>{" "}
              <span className="bg-gradient-to-r from-green-400 via-emerald-400 to-cyan-400 bg-clip-text text-transparent animate-pulse">
                Sustainably
              </span>
              <br />
              <span className="text-white">Change the</span>{" "}
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                World
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed">
              Join the revolution of conscious consumption. Scan products, track your carbon footprint, 
              and compete with a global community of eco-warriors making real change.
            </p>
            
            {/* Primary CTA Section with Google Sign-in */}
            <div className="flex flex-col items-center gap-6 mb-16">
              {/* Google Sign-in as Primary CTA */}
              <div className="w-full max-w-md">
                <GoogleSignInButton 
                  text="Continue with Google" 
                  className="w-full bg-white hover:bg-gray-50 text-gray-900 border-none shadow-2xl hover:shadow-3xl py-4 text-lg font-semibold transition-all duration-300 transform hover:scale-105" 
                />
              </div>
              
              {/* Divider */}
              <div className="flex items-center gap-4 w-full max-w-md">
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-600 to-transparent"></div>
                <span className="text-gray-400 text-sm px-3">or</span>
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-600 to-transparent"></div>
              </div>
              
              {/* Traditional Sign-up Options */}
              <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
                <Link href="/auth/signup" className="flex-1">
                  <Button size="lg" className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white px-6 py-4 text-lg font-semibold shadow-xl shadow-green-500/25 hover:shadow-green-500/40 transition-all duration-300 transform hover:scale-105">
                    <Zap className="mr-2 h-5 w-5" />
                    Sign Up Free
                  </Button>
                </Link>
                <Link href="/demo" className="flex-1">
                  <Button size="lg" variant="outline" className="w-full border-2 border-gray-600 text-gray-300 hover:bg-gray-800/50 hover:border-gray-500 px-6 py-4 text-lg font-semibold backdrop-blur-sm transition-all duration-300">
                    <ArrowRight className="mr-2 h-5 w-5" />
                    Demo
                  </Button>
                </Link>
              </div>
            </div>

            {/* Trust Indicators */}
            <div className="text-center mb-12">
              <p className="text-sm text-gray-500 mb-4">
                Trusted by eco-conscious users worldwide • Secure Google Authentication
              </p>
              <div className="flex justify-center items-center gap-8 opacity-60">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-green-400" />
                  <span className="text-xs text-gray-400">SSL Secured</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="h-4 w-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  <span className="text-xs text-gray-400">Google Protected</span>
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-purple-400" />
                  <span className="text-xs text-gray-400">Free Forever</span>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              {stats.map((stat, index) => (
                <div key={index} className={`text-center transition-all duration-1000 delay-${index * 200} ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                  <div className="flex justify-center mb-3">
                    <div className="p-3 rounded-full bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30">
                      <stat.icon className="h-6 w-6 text-green-400" />
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-white mb-1">{stat.number}</div>
                  <div className="text-sm text-gray-400">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4 relative">
        <div className="container mx-auto">
          <div className="text-center mb-20">
            <Badge className="mb-4 bg-blue-900/50 text-blue-400 border-blue-500/50">
              <Target className="mr-2 h-4 w-4" />
              Features
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Everything You Need for
              <br />
              <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                Sustainable Living
              </span>
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Powerful AI-driven tools designed to make sustainable shopping effortless and rewarding.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className={`group dark-card border-gray-700/50 hover:border-gray-600 transition-all duration-500 hover:transform hover:scale-105 hover:shadow-2xl hover:shadow-gray-900/50 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} style={{transitionDelay: `${index * 100}ms`}}>
                <CardHeader className="relative overflow-hidden">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-lg bg-gradient-to-r ${feature.gradient} bg-opacity-20 group-hover:scale-110 transition-transform duration-300`}>
                      <feature.icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-gray-800 to-gray-700 opacity-20 group-hover:opacity-40 transition-opacity duration-300"></div>
                  </div>
                  <CardTitle className="text-xl text-white mb-3 group-hover:text-green-400 transition-colors duration-300">
                    {feature.title}
                  </CardTitle>
                  <CardDescription className="text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors duration-300">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-4 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900">
        <div className="container mx-auto">
          <div className="text-center mb-20">
            <Badge className="mb-4 bg-purple-900/50 text-purple-400 border-purple-500/50">
              <Award className="mr-2 h-4 w-4" />
              Testimonials
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Loved by{" "}
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Eco-Warriors
              </span>
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              See what our community says about their sustainable shopping journey.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                name: "Sarah Johnson",
                role: "Environmental Activist",
                content: "EcoTracker has completely transformed how I shop. I've reduced my carbon footprint by 40% in just 3 months!",
                rating: 5
              },
              {
                name: "Mike Chen",
                role: "Tech Professional",
                content: "The barcode scanner is incredibly accurate. I love competing with friends on the leaderboard - it makes sustainability fun!",
                rating: 5
              },
              {
                name: "Emma Rodriguez",
                role: "Student",
                content: "As a college student, this app helps me make better choices on a budget. The analytics are incredibly detailed.",
                rating: 5
              }
            ].map((testimonial, index) => (
              <Card key={index} className="dark-card border-gray-700/50 hover:border-gray-600 transition-all duration-300 hover:transform hover:scale-105">
                <CardHeader>
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <CardDescription className="text-gray-300 text-lg mb-6 leading-relaxed">
                    "{testimonial.content}"
                  </CardDescription>
                  <div className="flex items-center">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-green-400 to-emerald-400 flex items-center justify-center text-white font-bold text-lg mr-4">
                      {testimonial.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-semibold text-white">{testimonial.name}</div>
                      <div className="text-sm text-gray-400">{testimonial.role}</div>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-green-900/20 via-emerald-900/20 to-green-900/20"></div>
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-green-500/5 via-transparent to-emerald-500/5"></div>
        </div>
        <div className="container mx-auto text-center relative z-10">
          <div className="max-w-4xl mx-auto">
            <Badge className="mb-6 bg-gradient-to-r from-green-900/50 to-emerald-900/50 text-green-400 border-green-500/50">
              <CheckCircle className="mr-2 h-4 w-4" />
              Join Now
            </Badge>
            <h2 className="text-4xl md:text-6xl font-bold mb-8 text-white leading-tight">
              Ready to{" "}
              <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                Change Everything?
              </span>
            </h2>
            <p className="text-xl md:text-2xl mb-12 text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Join over 15,000 eco-conscious shoppers who are already making a real impact. 
              Start your sustainable journey today - it's completely free.
            </p>
            <div className="flex flex-col items-center gap-6">
              {/* Primary Google CTA */}
              <div className="w-full max-w-md">
                <GoogleSignInButton 
                  text="Get Started with Google" 
                  className="w-full bg-white hover:bg-gray-50 text-gray-900 border-none shadow-2xl hover:shadow-3xl py-4 text-lg font-semibold transition-all duration-300 transform hover:scale-105" 
                />
              </div>
              
              {/* Alternative CTA */}
              <Link href="/auth/signup">
                <Button size="lg" className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white px-12 py-6 text-xl font-semibold shadow-2xl shadow-green-500/25 hover:shadow-green-500/40 transition-all duration-300 transform hover:scale-105">
                  <Sparkles className="mr-3 h-6 w-6" />
                  Or Sign Up with Email
                </Button>
              </Link>
            </div>
            <p className="text-sm text-gray-500 mt-6">
              No credit card required • Free forever • Join in 30 seconds
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-950 text-white py-16 px-4 border-t border-gray-800">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="relative">
                  <Leaf className="h-8 w-8 text-green-400" />
                  <div className="absolute inset-0 h-8 w-8 text-green-400 animate-ping opacity-20">
                    <Leaf className="h-8 w-8" />
                  </div>
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-green-400 to-emerald-300 bg-clip-text text-transparent">
                  EcoTracker
                </span>
              </div>
              <p className="text-gray-400 mb-6 text-lg leading-relaxed max-w-md">
                Making sustainable shopping accessible to everyone. Join the movement towards a greener future.
              </p>
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center cursor-pointer transition-colors duration-300">
                  <Globe className="h-5 w-5 text-gray-400 hover:text-white" />
                </div>
                <div className="w-10 h-10 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center cursor-pointer transition-colors duration-300">
                  <Users className="h-5 w-5 text-gray-400 hover:text-white" />
                </div>
                <div className="w-10 h-10 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center cursor-pointer transition-colors duration-300">
                  <Trophy className="h-5 w-5 text-gray-400 hover:text-white" />
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold text-white mb-4 text-lg">Product</h3>
              <ul className="space-y-3 text-gray-400">
                <li><Link href="/features" className="hover:text-white transition-colors duration-300">Features</Link></li>
                <li><Link href="/pricing" className="hover:text-white transition-colors duration-300">Pricing</Link></li>
                <li><Link href="/api" className="hover:text-white transition-colors duration-300">API</Link></li>
                <li><Link href="/integrations" className="hover:text-white transition-colors duration-300">Integrations</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-white mb-4 text-lg">Company</h3>
              <ul className="space-y-3 text-gray-400">
                <li><Link href="/about" className="hover:text-white transition-colors duration-300">About</Link></li>
                <li><Link href="/careers" className="hover:text-white transition-colors duration-300">Careers</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors duration-300">Contact</Link></li>
                <li><Link href="/blog" className="hover:text-white transition-colors duration-300">Blog</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-400 mb-4 md:mb-0">
                © 2025 EcoTracker. All rights reserved.
              </p>
              <div className="flex gap-6 text-sm text-gray-400">
                <Link href="/privacy" className="hover:text-white transition-colors duration-300">
                  Privacy Policy
                </Link>
                <Link href="/terms" className="hover:text-white transition-colors duration-300">
                  Terms of Service
                </Link>
                <Link href="/cookies" className="hover:text-white transition-colors duration-300">
                  Cookie Policy
                </Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
