import jwt, { type SignOptions } from 'jsonwebtoken'

const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d'

function getJwtSecret(): string {
  const jwtSecret = process.env.JWT_SECRET
  if (!jwtSecret) {
    throw new Error('JWT_SECRET is not configured')
  }

  return jwtSecret
}

export interface JWTPayload {
  userId: string
  email: string
  iat?: number
  exp?: number
}

export class JWTService {
  static generateToken(payload: { userId: string; email: string }): string {
    try {
      console.log('Generating JWT token for:', payload)
      const options: SignOptions = {
        expiresIn: JWT_EXPIRES_IN as SignOptions['expiresIn'],
        issuer: 'wayfinder-ai',
        audience: 'wayfinder-users',
      }
      const token: string = jwt.sign(payload, getJwtSecret(), options)
      console.log('Generated JWT token:', token.slice(0, 50) + '...')
      return token
    } catch (error) {
      console.error('Error generating JWT token:', error)
      throw new Error('Không thể tạo token xác thực')
    }
  }

  static verifyToken(token: string): JWTPayload | null {
    try {
      const decoded = jwt.verify(token, getJwtSecret(), {
        issuer: 'wayfinder-ai',
        audience: 'wayfinder-users',
      }) as JWTPayload

      console.log('JWT decoded payload:', decoded)
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

  static decodeToken(token: string): JWTPayload | null {
    try {
      return jwt.decode(token) as JWTPayload
    } catch (error) {
      console.error('Error decoding JWT token:', error)
      return null
    }
  }

  static isTokenExpired(token: string): boolean {
    try {
      const decoded = this.decodeToken(token)
      if (!decoded || !decoded.exp) return true

      const currentTime = Math.floor(Date.now() / 1000)
      return decoded.exp < currentTime
    } catch {
      return true
    }
  }

  static refreshToken(token: string): string | null {
    try {
      const decoded = this.verifyToken(token)
      if (!decoded) return null

      return this.generateToken({
        userId: decoded.userId,
        email: decoded.email,
      })
    } catch (error) {
      console.error('Error refreshing token:', error)
      return null
    }
  }

  static getTokenExpiration(token: string): Date | null {
    try {
      const decoded = this.decodeToken(token)
      if (!decoded || !decoded.exp) return null

      return new Date(decoded.exp * 1000)
    } catch {
      return null
    }
  }
}

export const COOKIE_CONFIG = {
  name: 'auth-token',
  options: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/',
  },
}
