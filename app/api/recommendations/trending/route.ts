import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db/mongodb'
import { Destination, DestinationView, Review } from '@/lib/models'
import { getTrendingDestinations } from '@/lib/utils/recommendations'
import { recommendationCache, cacheKeys, cacheTTL } from '@/lib/utils/cache'

export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const period = (searchParams.get('period') as '7d' | '30d') || '7d'
    const limit = parseInt(searchParams.get('limit') || '12')

    const cacheKey = cacheKeys.trending(period, limit)
    const cached = recommendationCache.get<Awaited<ReturnType<typeof getTrendingDestinations>>>(cacheKey)
    if (cached) {
      return NextResponse.json({
        success: true,
        data: cached,
        count: cached.length,
        period,
        cached: true,
      })
    }

    const trendingDestinations = await getTrendingDestinations(
      Destination,
      DestinationView,
      Review,
      period,
      limit
    )

    recommendationCache.set(cacheKey, trendingDestinations, cacheTTL.trending)

    return NextResponse.json({
      success: true,
      data: trendingDestinations,
      count: trendingDestinations.length,
      period,
      cached: false,
    })
  } catch (error: any) {
    console.error('Get trending destinations error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
