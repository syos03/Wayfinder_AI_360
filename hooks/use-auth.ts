"use client"

import { useState, useEffect, useCallback } from 'react'
import { backendAuth, type User } from '@/lib/auth/backend-auth'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Check auth status
  const checkAuth = useCallback(async () => {
    try {
      const user = await backendAuth.getCurrentUser()
      setUser(user)
      setIsAuthenticated(!!user)
    } catch (error) {
      console.error('Auth check failed:', error)
      setUser(null)
      setIsAuthenticated(false)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Initialize auth on mount
  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  // Login function
  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      const result = await backendAuth.login(email, password)
      if (result.user) {
        setUser(result.user)
        setIsAuthenticated(true)
        // Force a re-check to ensure state is consistent
        setTimeout(() => checkAuth(), 100)
      }
      return { user: result.user, error: result.error }
    } finally {
      setIsLoading(false)
    }
  }

  // Register function
  const register = async (email: string, password: string, name: string) => {
    setIsLoading(true)
    try {
      const result = await backendAuth.register(email, password, name)
      if (result.user) {
        setUser(result.user)
        setIsAuthenticated(true)
        // Force a re-check to ensure state is consistent
        setTimeout(() => checkAuth(), 100)
      }
      return { user: result.user, error: result.error }
    } finally {
      setIsLoading(false)
    }
  }

  // Logout function
  const logout = async () => {
    setIsLoading(true)
    try {
      await backendAuth.logout()
      setUser(null)
      setIsAuthenticated(false)
    } finally {
      setIsLoading(false)
    }
  }

  // Test backend connection
  const testBackend = async () => {
    return await backendAuth.testConnection()
  }

  // Refresh auth state (useful for manual refresh)
  const refreshAuth = () => {
    checkAuth()
  }

  return {
    user,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    testBackend,
    refreshAuth,
  }
}