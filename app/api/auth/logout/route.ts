/**
 * POST /api/auth/logout
 * Logout user
 */

import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    // Create response
    const response = NextResponse.json({
      success: true,
      message: 'Đăng xuất thành công',
    })

    // Clear auth cookie
    response.cookies.delete('auth-token')

    return response

  } catch (error: any) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { success: false, error: 'Lỗi server' },
      { status: 500 }
    )
  }
}
