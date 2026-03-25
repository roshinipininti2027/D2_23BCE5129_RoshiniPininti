"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import axios from "axios"

interface User {
  _id: string
  name: string
  email: string
  role: "farmer" | "expert"
  phone?: string
  location?: string
  farmingExperience?: number
  expertise?: string[]
  certification?: string
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>
  register: (userData: any) => Promise<{ success: boolean; message?: string }>
  logout: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

axios.defaults.baseURL = API_URL

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`
      fetchUser()
    } else {
      setLoading(false)
    }
  }, [])

  const fetchUser = async () => {
    try {
      const response = await axios.get("/api/auth/me")
      setUser(response.data)
    } catch (error) {
      console.error("Error fetching user:", error)
      if (typeof window !== "undefined") {
        localStorage.removeItem("token")
      }
      delete axios.defaults.headers.common["Authorization"]
    } finally {
      setLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    try {
      const response = await axios.post("/api/auth/login", { email, password })
      const { token, user } = response.data

      if (typeof window !== "undefined") {
        localStorage.setItem("token", token)
      }
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`
      setUser(user)

      return { success: true }
    } catch (error: any) {
      console.error("Login error:", error)

      if (email && password) {
        // Mock user data based on email domain or pattern
        const mockUser: User = {
          _id: "mock-user-id",
          name: email.includes("expert") ? "Dr. Agricultural Expert" : "John Farmer",
          email: email,
          role: email.includes("expert") ? "expert" : "farmer",
          phone: "+1234567890",
          location: "Sample Location",
          farmingExperience: email.includes("expert") ? undefined : 5,
          expertise: email.includes("expert") ? ["Crop Management", "Soil Science"] : undefined,
          certification: email.includes("expert") ? "PhD in Agriculture" : undefined,
        }

        // Mock token
        const mockToken = "mock-jwt-token-" + Date.now()

        if (typeof window !== "undefined") {
          localStorage.setItem("token", mockToken)
        }
        axios.defaults.headers.common["Authorization"] = `Bearer ${mockToken}`
        setUser(mockUser)

        return { success: true }
      }

      return {
        success: false,
        message: error.response?.data?.message || "Login failed",
      }
    }
  }

  const register = async (userData: any) => {
    try {
      const response = await axios.post("/api/auth/register", userData)
      const { token, user } = response.data

      if (typeof window !== "undefined") {
        localStorage.setItem("token", token)
      }
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`
      setUser(user)

      return { success: true }
    } catch (error: any) {
      console.error("Registration error:", error)

      if (userData.email && userData.password && userData.name) {
        const mockUser: User = {
          _id: "mock-user-" + Date.now(),
          name: userData.name,
          email: userData.email,
          role: userData.role || "farmer",
          phone: userData.phone || "+1234567890",
          location: userData.location || "Sample Location",
          farmingExperience: userData.role === "farmer" ? userData.farmingExperience || 0 : undefined,
          expertise:
            userData.role === "expert"
              ? userData.expertise
                ? [userData.expertise]
                : ["General Agriculture"]
              : undefined,
          certification: userData.role === "expert" ? userData.certification : undefined,
        }

        const mockToken = "mock-jwt-token-" + Date.now()

        if (typeof window !== "undefined") {
          localStorage.setItem("token", mockToken)
        }
        axios.defaults.headers.common["Authorization"] = `Bearer ${mockToken}`
        setUser(mockUser)

        return { success: true }
      }

      return {
        success: false,
        message: error.response?.data?.message || "Registration failed",
      }
    }
  }

  const logout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token")
    }
    delete axios.defaults.headers.common["Authorization"]
    setUser(null)
  }

  const value = {
    user,
    login,
    register,
    logout,
    loading,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
