'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import type { User, AuthResponse } from '@/types'

interface AuthContextType {
  user: User | null
  token: string | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (email: string, password: string, fullName: string) => Promise<string>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // On mount: restore session from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('token')
    if (!saved) {
      setLoading(false)
      return
    }
    setToken(saved)
    api
      .get<User>('/api/auth/me')
      .then(setUser)
      .catch(() => {
        localStorage.removeItem('token')
        setToken(null)
      })
      .finally(() => setLoading(false))
  }, [])

  async function login(email: string, password: string) {
    const data = await api.post<AuthResponse>('/api/auth/login', { email, password })
    if (!data.access_token) throw new Error('Login failed — no token returned.')
    localStorage.setItem('token', data.access_token)
    setToken(data.access_token)
    setUser(data.user)
    router.push('/dashboard')
  }

  async function signup(email: string, password: string, fullName: string): Promise<string> {
    const data = await api.post<AuthResponse>('/api/auth/signup', {
      email,
      password,
      full_name: fullName,
    })
    if (data.access_token) {
      localStorage.setItem('token', data.access_token)
      setToken(data.access_token)
      setUser(data.user)
      router.push('/dashboard')
    }
    return data.message
  }

  function logout() {
    localStorage.removeItem('token')
    setToken(null)
    setUser(null)
    router.push('/login')
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
