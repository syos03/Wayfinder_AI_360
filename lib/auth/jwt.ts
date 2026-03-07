import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'wayfinder-ai-super-secret-key-2025-hoangviet24'
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d'

export interface JWTPayload {
  userId: string
  email: string
  iat?: number
  exp?: number
}

export class JWTService {
  // Generate JWT token
  static generateToken(payload: { userId: string; email: string }): string {
    try {
      console.log('🔍 Generating JWT token for:', payload)
      const token = jwt.sign(payload, JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN,
        issuer: 'wayfinder-ai',
        audience: 'wayfinder-users'
      })
      console.log('🔍 Generated JWT token:', token.substring(0, 50) + '...')
      return token
    } catch (error) {
      console.error('Error generating JWT token:', error)
      throw new Error('Không thể tạo token xác thực')
    }
  }

  // Verify JWT token
  static verifyToken(token: string): JWTPayload | null {
    try {
      const decoded = jwt.verify(token, JWT_SECRET, {
        issuer: 'wayfinder-ai',
        audience: 'wayfinder-users'
      }) as JWTPayload

      console.log('🔍 JWT decoded payload:', decoded)
      return decoded
    } catch (error: any) {
      if (error.name === 'TokenExpiredError') {
        console.log('JWT token expired')
      } else if (error.name === 'JsonWebTokenError') {
        console.log('Invalid JWT token')
      } else {
        console.error('JWT verification error:', error)
      }
      return null
    }
  }

  // Decode token without verification (for debugging)
  static decodeToken(token: string): JWTPayload | null {
    try {
      return jwt.decode(token) as JWTPayload
    } catch (error) {
      console.error('Error decoding JWT token:', error)
      return null
    }
  }

  // Check if token is expired
  static isTokenExpired(token: string): boolean {
    try {
      const decoded = this.decodeToken(token)
      if (!decoded || !decoded.exp) return true

      const currentTime = Math.floor(Date.now() / 1000)
      return decoded.exp < currentTime
    } catch (error) {
      return true
    }
  }

  // Refresh token (generate new token with same payload)
  static refreshToken(token: string): string | null {
    try {
      const decoded = this.verifyToken(token)
      if (!decoded) return null

      return this.generateToken({
        userId: decoded.userId,
        email: decoded.email
      })
    } catch (error) {
      console.error('Error refreshing token:', error)
      return null
    }
  }

  // Get token expiration time
  static getTokenExpiration(token: string): Date | null {
    try {
      const decoded = this.decodeToken(token)
      if (!decoded || !decoded.exp) return null

      return new Date(decoded.exp * 1000)
    } catch (error) {
      return null
    }
  }
}

// Cookie configuration for HTTP-only cookies
export const COOKIE_CONFIG = {
  name: 'wayfinder-auth-token',
  options: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
    path: '/'
  }
}
