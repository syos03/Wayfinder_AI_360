// Backend authentication service
// Calls API routes instead of localStorage

import { identifyUser, resetUser, trackUserRegistered, trackUserLoggedIn, trackUserLoggedOut } from '@/lib/analytics';

export interface User {
  id: string
  email: string
  name: string
  avatar?: string
  bio?: string
  role?: string
  lastLoginAt?: Date
  createdAt: Date
}

export interface AuthResult {
  user: User | null
  error: string | null
}

class BackendAuthService {
  private readonly API_BASE = '/api/auth'

  // Register new user
  async register(email: string, password: string, name: string): Promise<AuthResult> {
    try {
      console.log('🔄 Backend register:', { email, name })
      
      const response = await fetch(`${this.API_BASE}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, name }),
        credentials: 'include' // Include cookies
      })

      const data = await response.json()

      if (!response.ok) {
        console.log('❌ Register failed:', data.error)
        return { user: null, error: data.error || 'Đăng ký thất bại' }
      }

      console.log('✅ Register successful:', data.data.user.id)
      
      // Track registration
      identifyUser(data.data.user.id, {
        email: data.data.user.email,
        name: data.data.user.name,
        role: data.data.user.role || 'User',
      });
      trackUserRegistered({
        userId: data.data.user.id,
        userName: data.data.user.name,
        userEmail: data.data.user.email,
        userRole: data.data.user.role || 'User',
      });
      
      return { user: data.data.user, error: null }

    } catch (error: any) {
      console.error('💥 Register error:', error)
      return { user: null, error: 'Lỗi kết nối, vui lòng thử lại' }
    }
  }

  // Login user
  async login(email: string, password: string): Promise<AuthResult> {
    try {
      console.log('🔄 Backend login:', email)
      
      const response = await fetch(`${this.API_BASE}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include' // Include cookies
      })

      const data = await response.json()

      if (!response.ok) {
        console.log('❌ Login failed:', data.error)
        return { user: null, error: data.error || 'Đăng nhập thất bại' }
      }

      console.log('✅ Login successful:', data.data.user.id)
      
      // Track login
      identifyUser(data.data.user.id, {
        email: data.data.user.email,
        name: data.data.user.name,
        role: data.data.user.role || 'User',
      });
      trackUserLoggedIn({
        userId: data.data.user.id,
        userName: data.data.user.name,
        userEmail: data.data.user.email,
        userRole: data.data.user.role || 'User',
      });
      
      return { user: data.data.user, error: null }

    } catch (error: any) {
      console.error('💥 Login error:', error)
      return { user: null, error: 'Lỗi kết nối, vui lòng thử lại' }
    }
  }

  // Get current user
  async getCurrentUser(): Promise<User | null> {
    try {
      console.log('🔄 Backend getCurrentUser')
      
      const response = await fetch(`${this.API_BASE}/me`, {
        method: 'GET',
        credentials: 'include' // Include cookies
      })

      if (!response.ok) {
        console.log('❌ Get current user failed:', response.status)
        return null
      }

      const data = await response.json()

      if (!data.success) {
        console.log('❌ Get current user failed:', data.error)
        return null
      }

      console.log('✅ Current user found:', data.data.user.id)
      return data.data.user

    } catch (error: any) {
      console.error('💥 Get current user error:', error)
      return null
    }
  }

  // Logout user
  async logout(): Promise<void> {
    try {
      console.log('🔄 Backend logout')
      
      const response = await fetch(`${this.API_BASE}/logout`, {
        method: 'POST',
        credentials: 'include' // Include cookies
      })

      if (response.ok) {
        console.log('✅ Logout successful')
        
        // Track logout and reset user
        trackUserLoggedOut();
        resetUser();
      } else {
        console.log('⚠️ Logout response not ok, but continuing')
      }

    } catch (error: any) {
      console.error('💥 Logout error:', error)
      // Don't throw error, just log it
    }
  }

  // Test backend connection
  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.API_BASE}/me`, {
        method: 'GET',
        credentials: 'include'
      })
      
      // Even 401 means backend is working
      return response.status === 401 || response.status === 200
    } catch (error) {
      console.error('Backend connection test failed:', error)
      return false
    }
  }
}

// Export instance
export const backendAuth = new BackendAuthService()

// Helper exports for easier usage
export const getCurrentUser = () => backendAuth.getCurrentUser()
export const login = (email: string, password: string) => backendAuth.login(email, password)
export const register = (email: string, password: string, name: string) => backendAuth.register(email, password, name)
export const logout = () => backendAuth.logout()

// NOTE: For server-side auth helpers (getCurrentUser for API routes),
// see lib/auth/server-auth.ts
