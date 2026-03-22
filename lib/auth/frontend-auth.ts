// Frontend-only authentication
// Uses localStorage for persistence

export interface User {
  id: string
  email: string
  name: string
  avatar?: string
  createdAt: Date
}

export interface AuthResult {
  user: User | null
  error: string | null
}

class FrontendAuthService {
  private readonly STORAGE_KEY = 'wayfinder_user'
  private readonly USERS_KEY = 'wayfinder_users'

  private getStoredUsers(): User[] {
    if (typeof window === 'undefined') return []
    const stored = localStorage.getItem(this.USERS_KEY)
    return stored ? JSON.parse(stored) : []
  }

  private saveUsers(users: User[]) {
    if (typeof window === 'undefined') return
    localStorage.setItem(this.USERS_KEY, JSON.stringify(users))
  }

  getCurrentUser(): User | null {
    if (typeof window === 'undefined') return null
    const stored = localStorage.getItem(this.STORAGE_KEY)
    if (!stored) return null

    try {
      const user = JSON.parse(stored)
      user.createdAt = new Date(user.createdAt)
      return user
    } catch {
      return null
    }
  }

  private setCurrentUser(user: User | null) {
    if (typeof window === 'undefined') return
    if (user) {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(user))
    } else {
      localStorage.removeItem(this.STORAGE_KEY)
    }
  }

  async register(email: string, password: string, name: string): Promise<AuthResult> {
    await new Promise((resolve) => setTimeout(resolve, 300))

    if (!email || !password || !name) {
      return { user: null, error: 'Vui lòng điền đầy đủ thông tin' }
    }

    if (password.length < 6) {
      return { user: null, error: 'Mật khẩu phải có ít nhất 6 ký tự' }
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return { user: null, error: 'Email không hợp lệ' }
    }

    const users = this.getStoredUsers()
    const existingUser = users.find((u) => u.email.toLowerCase() === email.toLowerCase())
    if (existingUser) {
      return { user: null, error: 'Email này đã được sử dụng' }
    }

    const newUser: User = {
      id: Date.now().toString(),
      email: email.toLowerCase(),
      name: name.trim(),
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
      createdAt: new Date(),
    }

    users.push(newUser)
    this.saveUsers(users)
    this.setCurrentUser(newUser)

    return { user: newUser, error: null }
  }

  async login(email: string, password: string): Promise<AuthResult> {
    await new Promise((resolve) => setTimeout(resolve, 300))

    if (!email || !password) {
      return { user: null, error: 'Vui lòng điền email và mật khẩu' }
    }

    const users = this.getStoredUsers()
    const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase())

    if (!user) {
      return { user: null, error: 'Email hoặc mật khẩu không đúng' }
    }

    this.setCurrentUser(user)
    return { user, error: null }
  }

  async logout(): Promise<void> {
    this.setCurrentUser(null)
  }

  getAllUsers(): User[] {
    return this.getStoredUsers()
  }

  clearAllData(): void {
    if (typeof window === 'undefined') return
    localStorage.removeItem(this.STORAGE_KEY)
    localStorage.removeItem(this.USERS_KEY)
  }
}

export const frontendAuth = new FrontendAuthService()

export const getCurrentUser = () => frontendAuth.getCurrentUser()
export const login = (email: string, password: string) => frontendAuth.login(email, password)
export const register = (email: string, password: string, name: string) =>
  frontendAuth.register(email, password, name)
export const logout = () => frontendAuth.logout()
