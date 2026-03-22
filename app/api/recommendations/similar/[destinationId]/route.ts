import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db/mongodb'
import { Destination } from '@/lib/models'
import { findSimilarDestinations } from '@/lib/utils/recommendations'
import { recommendationCache, cacheKeys, cacheTTL } from '@/lib/utils/cache'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ destinationId: string }> }
) {
  try {
    await connectDB()
    const { destinationId } = await params

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '6')

    const cacheKey = cacheKeys.similar(destinationId, limit)
    const cached = recommendationCache.get<Awaited<ReturnType<typeof findSimilarDestinations>>>(cacheKey)
    if (cached) {
      return NextResponse.json({
        success: true,
        data: cached,
        count: cached.length,
        cached: true,
      })
    }

    const similarDestinations = await findSimilarDestinations(Destination, destinationId, limit)

    recommendationCache.set(cacheKey, similarDestinations, cacheTTL.similar)

    return NextResponse.json({
      success: true,
      data: similarDestinations,
      count: similarDestinations.length,
      cached: false,
    })
  } catch (error: any) {
    console.error('Get similar destinations error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
