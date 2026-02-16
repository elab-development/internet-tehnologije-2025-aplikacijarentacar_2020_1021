import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { AuthUser } from '../lib/auth'
import { clearStoredAuth, getStoredToken, getStoredUser, setStoredToken } from '../lib/auth'
import { api } from '../lib/api'
import type { TokenResponse, UserResponse } from '../types'

interface AuthContextValue {
  token: string | null
  user: AuthUser | null
  isAuthenticated: boolean
  isAdmin: boolean
  login: (email: string, password: string) => Promise<void>
  register: (data: { full_name: string; email: string; phone_number: string; password: string }) => Promise<void>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() => getStoredToken())
  const [user, setUser] = useState<AuthUser | null>(() => getStoredUser())
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (token) {
      const u = getStoredUser()
      setUser(u)
    } else {
      setUser(null)
    }
    setIsLoading(false)
  }, [token])

  const login = useCallback(async (email: string, password: string) => {
    const res = await api<TokenResponse>('/auth/login', {
      method: 'POST',
      json: { email, password },
    })
    setStoredToken(res.access_token)
    setToken(res.access_token)
    const u = getStoredUser()
    setUser(u)
  }, [])

  const register = useCallback(
    async (data: { full_name: string; email: string; phone_number: string; password: string }) => {
      await api<UserResponse>('/auth/register', {
        method: 'POST',
        json: data,
      })
    },
    []
  )

  const logout = useCallback(() => {
    clearStoredAuth()
    setToken(null)
    setUser(null)
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      token,
      user,
      isAuthenticated: !!token && !!user,
      isAdmin: user?.role === 'admin',
      login,
      register,
      logout,
      isLoading,
    }),
    [token, user, login, register, logout, isLoading]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
