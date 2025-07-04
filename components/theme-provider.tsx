"use client"

import React, { createContext, useContext, useEffect, useState } from "react"

type Theme = "dark" | "light" | "system"

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
}

type ThemeProviderState = {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const ThemeProviderContext = createContext<ThemeProviderState | undefined>(undefined)

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "vite-ui-theme",
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(defaultTheme)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const storedTheme = localStorage.getItem(storageKey) as Theme
    if (storedTheme) {
      setThemeState(storedTheme)
    }
    setMounted(true)
  }, [storageKey])

  useEffect(() => {
    if (!mounted) return

    const root = window.document.documentElement
    root.classList.remove("dark")

    if (theme === "dark") {
      root.classList.add("dark")
    } else if (theme === "system") {
      const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches
      if (systemDark) root.classList.add("dark")
    }

    localStorage.setItem(storageKey, theme)
  }, [theme, mounted, storageKey])

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme)
  }

  const value = {
    theme,
    setTheme,
  }

  return (
    <ThemeProviderContext.Provider value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)
  if (!context) throw new Error("useTheme must be used within a ThemeProvider")
  return context
}

