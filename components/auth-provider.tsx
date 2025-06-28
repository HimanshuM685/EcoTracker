"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { signInWithPopup, User as FirebaseUser } from "firebase/auth"
import { auth, googleProvider } from "@/lib/firebase"

interface User {
  _id: string
  email: string
  name: string
  monthlyCarbon: number
  totalScanned: number
  joinedAt: string
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  signup: (name: string, email: string, password: string) => Promise<boolean>
  signInWithGoogle: () => Promise<boolean>
  logout: () => void
  updateUserStats: (carbonAdded: number) => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error("useAuth must be used within an AuthProvider")
  return context
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const storedUser = localStorage.getItem("ecotracker-user")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
  }, [])

 // Example in auth-provider.tsx
const signup = async (name: string, email: string, password: string): Promise<boolean> => {
  try {
    const response = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    let data;
    try {
      data = await response.json();
    } catch (jsonErr) {
      console.warn("⚠️ Failed to parse JSON response:", jsonErr);
      data = { error: "Invalid response from server" };
    }

    if (!response.ok) {
      console.error("❌ Signup failed:", data.error);
      return false;
    }

    console.log("✅ Signup successful:", data.user);
    setUser(data.user);
    localStorage.setItem("ecotracker-user", JSON.stringify(data.user));
    return true;
  } catch (err) {
    console.error("🔥 Signup error:", err);
    return false;
  }
};







  const login = async (email: string, password: string): Promise<boolean> => {
  try {
    console.log("📤 Attempting login with:", { email, password })

    const res = await fetch("/api/auth/signin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    })

    const data = await res.json()
    console.log("📥 Response from /api/auth/signin:", data)

    if (res.ok) {
      setUser(data.user)
      localStorage.setItem("ecotracker-user", JSON.stringify(data.user))
      console.log("✅ Login success:", data.user)
      return true
    } else {
      console.warn("❌ Login failed:", data.error)
      return false
    }
  } catch (err) {
    console.error("🔥 Login error:", err)
    return false
  }
}

  const signInWithGoogle = async (): Promise<boolean> => {
    try {
      console.log("🔍 Attempting Google sign-in...")
      
      const result = await signInWithPopup(auth, googleProvider)
      const firebaseUser = result.user
      
      console.log("✅ Google sign-in successful:", firebaseUser)
      
      // Send user data to our backend
      const response = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || "Google User",
          email: firebaseUser.email,
          firebaseUid: firebaseUser.uid
        }),
      })
      
      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
        localStorage.setItem("ecotracker-user", JSON.stringify(data.user))
        console.log("✅ Google user authenticated:", data.user)
        return true
      } else {
        console.error("❌ Failed to authenticate Google user")
        return false
      }
      
    } catch (error) {
      console.error("🔥 Google sign-in error:", error)
      return false
    }
  }


  const logout = () => {
    setUser(null)
    localStorage.removeItem("ecotracker-user")
  }

  const updateUserStats = (carbonAdded: number) => {
    if (user) {
      const updatedUser = {
        ...user,
        monthlyCarbon: user.monthlyCarbon + carbonAdded,
        totalScanned: user.totalScanned + 1,
      }
      setUser(updatedUser)
      localStorage.setItem("ecotracker-user", JSON.stringify(updatedUser))
    }
  }

  return (
    <AuthContext.Provider value={{ user, login, signup, signInWithGoogle, logout, updateUserStats }}>
      {children}
    </AuthContext.Provider>
  )
}

