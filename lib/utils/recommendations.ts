import { IDestination } from '@/lib/models/Destination';
import mongoose from 'mongoose';

/**
 * Calculate similarity score between two destinations (0-100)
 * Based on: type, region, tags, budget range
 */
export function calculateSimilarityScore(
  dest1: IDestination,
  dest2: IDestination
): number {
  let score = 0;
  let maxScore = 0;

  // Type similarity (40 points)
  maxScore += 40;
  if (dest1.type === dest2.type) {
    score += 40;
  }

  // Region similarity (20 points)
  maxScore += 20;
  if (dest1.region === dest2.region) {
    score += 20;
  }

  // Tags similarity (30 points)
  maxScore += 30;
  if (dest1.tags && dest2.tags && dest1.tags.length > 0 && dest2.tags.length > 0) {
    const commonTags = dest1.tags.filter(tag => dest2.tags?.includes(tag));
    const tagScore = (commonTags.length / Math.max(dest1.tags.length, dest2.tags.length)) * 30;
    score += tagScore;
  }

  // Budget similarity (10 points)
  maxScore += 10;
  if (dest1.budget && dest2.budget) {
    const budget1Avg = (dest1.budget.low + dest1.budget.medium + dest1.budget.high) / 3;
    const budget2Avg = (dest2.budget.low + dest2.budget.medium + dest2.budget.high) / 3;
    const budgetDiff = Math.abs(budget1Avg - budget2Avg);
    const maxBudget = Math.max(budget1Avg, budget2Avg);
    
    if (maxBudget > 0) {
      const budgetSimilarity = 1 - (budgetDiff / maxBudget);
      score += budgetSimilarity * 10;
    }
  }

  return Math.round((score / maxScore) * 100);
}

/**
 * Calculate trending score for a destination
 * Based on: recent views, recent reviews, growth rate
 */
export function calculateTrendingScore(destination: {
  views: number;
  clicks: number;
  rating: number;
  reviewsCount: number;
  createdAt: Date;
  recentViews?: number; // views in last 7 days
  recentReviews?: number; // reviews in last 7 days
}): number {
  let score = 0;

  // Recent views score (40 points)
  const recentViews = destination.recentViews || 0;
  const viewsScore = Math.min((recentViews / 100) * 40, 40); // Max at 100 views
  score += viewsScore;

  // Click-through rate (20 points)
  if (destination.views > 0) {
    const ctr = destination.clicks / destination.views;
    score += ctr * 20;
  }

  // Recent reviews activity (20 points)
  const recentReviews = destination.recentReviews || 0;
  const reviewsScore = Math.min((recentReviews / 10) * 20, 20); // Max at 10 reviews
  score += reviewsScore;

  // Rating quality bonus (10 points)
  if (destination.rating >= 4.5) {
    score += 10;
  } else if (destination.rating >= 4.0) {
    score += 5;
  }

  // Newness factor (10 points) - boost new destinations
  const daysSinceCreation = (Date.now() - destination.createdAt.getTime()) / (1000 * 60 * 60 * 24);
  if (daysSinceCreation <= 7) {
    score += 10;
  } else if (daysSinceCreation <= 30) {
    score += 5;
  }

  return Math.round(score);
}

/**
 * Find similar destinations based on content
 */
export async function findSimilarDestinations(
  Destination: any,
  destinationId: string | mongoose.Types.ObjectId,
  limit: number = 6
): Promise<Array<IDestination & { similarityScore: number }>> {
  const sourceDestination = await Destination.findById(destinationId);
  if (!sourceDestination) {
    return [];
  }

  // Find destinations of same type or region
  const candidates = await Destination.find({
    _id: { $ne: destinationId },
    isActive: true,
    $or: [
      { type: sourceDestination.type },
      { region: sourceDestination.region },
      { tags: { $in: sourceDestination.tags || [] } },
    ],
  }).limit(50); // Get more candidates to filter

  // Calculate similarity scores
  const withScores = candidates.map((dest: IDestination) => ({
    ...dest.toObject(),
    similarityScore: calculateSimilarityScore(sourceDestination, dest),
  }));

  // Sort by similarity and return top N
  return withScores
    .sort((a: any, b: any) => b.similarityScore - a.similarityScore)
    .slice(0, limit);
}

/**
 * Get trending destinations
 */
export async function getTrendingDestinations(
  Destination: any,
  DestinationView: any,
  Review: any,
  period: '7d' | '30d' = '7d',
  limit: number = 12
): Promise<Array<IDestination & { trendingScore: number }>> {
  const daysAgo = period === '7d' ? 7 : 30;
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysAgo);

  // Aggregate recent views
  const recentViewsData = await DestinationView.aggregate([
    { $match: { viewedAt: { $gte: cutoffDate } } },
    { $group: { _id: '$destinationId', count: { $sum: 1 } } },
  ]);

  const viewsMap: Record<string, number> = {};
  recentViewsData.forEach((item: any) => {
    viewsMap[item._id.toString()] = item.count;
  });

  // Aggregate recent reviews
  const recentReviewsData = await Review.aggregate([
    { 
      $match: { 
        createdAt: { $gte: cutoffDate },
        isApproved: true 
      } 
    },
    { $group: { _id: '$destinationId', count: { $sum: 1 } } },
  ]);

  const reviewsMap: Record<string, number> = {};
  recentReviewsData.forEach((item: any) => {
    reviewsMap[item._id.toString()] = item.count;
  });

  // Get all active destinations
  const destinations = await Destination.find({
    isActive: true,
  });

  // Calculate trending scores
  const withScores = destinations.map((dest: IDestination) => {
    const destId = dest._id.toString();
    const trendingScore = calculateTrendingScore({
      views: dest.views || 0,
      clicks: dest.clicks || 0,
      rating: dest.rating || 0,
      reviewsCount: dest.reviewsCount || 0,
      createdAt: dest.createdAt,
      recentViews: viewsMap[destId] || 0,
      recentReviews: reviewsMap[destId] || 0,
    });

    return {
      ...dest.toObject(),
      trendingScore,
    };
  });

  // Sort by trending score and return top N
  return withScores
    .sort((a: any, b: any) => b.trendingScore - a.trendingScore)
    .slice(0, limit);
}

/**
 * Get popular destinations by tag
 */
export async function getPopularByTag(
  Destination: any,
  tag: string,
  limit: number = 12
): Promise<IDestination[]> {
  return await Destination.find({
    isActive: true,
    tags: tag,
  })
    .sort({ views: -1, rating: -1 })
    .limit(limit);
}

/**
 * Get personalized recommendations based on user preferences
 */
export async function getPersonalizedRecommendations(
  Destination: any,
  UserPreferences: any,
  Review: any,
  userId: mongoose.Types.ObjectId,
  limit: number = 12
): Promise<IDestination[]> {
  // Get user preferences
  const preferences = await UserPreferences.findOne({ userId });

  // Get user's reviewed destinations
  const userReviews = await Review.find({ userId }).select('destinationId rating');
  const reviewedDestinationIds = userReviews.map((r: any) => r.destinationId);

  // Build query based on preferences
  const query: any = {
    isActive: true,
    _id: { $nin: reviewedDestinationIds }, // Exclude already reviewed
  };

  if (preferences) {
    // Filter by preferred regions
    if (preferences.preferredRegions && preferences.preferredRegions.length > 0) {
      query.region = { $in: preferences.preferredRegions };
    }

    // Filter by preferred types
    if (preferences.preferredTypes && preferences.preferredTypes.length > 0) {
      query.type = { $in: preferences.preferredTypes };
    }

    // Filter by budget range
    if (preferences.budgetRange) {
      query['budget.medium'] = {
        $gte: preferences.budgetRange.min,
        $lte: preferences.budgetRange.max,
      };
    }

    // Filter by interests (tags)
    if (preferences.interests && preferences.interests.length > 0) {
      query.tags = { $in: preferences.interests };
    }
  }

  // Get destinations and sort by rating + views
  return await Destination.find(query)
    .sort({ rating: -1, views: -1 })
    .limit(limit);
}

/**
 * Collaborative filtering: Find users with similar taste
 */
export async function getCollaborativeRecommendations(
  Destination: any,
  Review: any,
  userId: mongoose.Types.ObjectId,
  limit: number = 12
): Promise<IDestination[]> {
  // Get current user's high-rated reviews (≥4 stars)
  const userReviews = await Review.find({
    userId,
    rating: { $gte: 4 },
  }).select('destinationId rating');

  if (userReviews.length === 0) {
    return [];
  }

  const userDestinationIds = userReviews.map((r: any) => r.destinationId);

  // Find other users who also liked the same destinations
  const similarUsersReviews = await Review.find({
    destinationId: { $in: userDestinationIds },
    rating: { $gte: 4 },
    userId: { $ne: userId },
  }).select('userId destinationId rating');

  // Count how many common destinations each user has
  const userSimilarity: Record<string, number> = {};
  similarUsersReviews.forEach((review: any) => {
    const otherUserId = review.userId.toString();
    userSimilarity[otherUserId] = (userSimilarity[otherUserId] || 0) + 1;
  });

  // Get top similar users (who liked at least 2 common destinations)
  const similarUserIds = Object.entries(userSimilarity)
    .filter(([_, count]) => count >= 2)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([uid, _]) => new mongoose.Types.ObjectId(uid));

  if (similarUserIds.length === 0) {
    return [];
  }

  // Get destinations that similar users liked but current user hasn't reviewed
  const recommendations = await Review.aggregate([
    {
      $match: {
        userId: { $in: similarUserIds },
        rating: { $gte: 4 },
        destinationId: { $nin: userDestinationIds },
      },
    },
    {
      $group: {
        _id: '$destinationId',
        avgRating: { $avg: '$rating' },
        count: { $sum: 1 },
      },
    },
    {
      $sort: { count: -1, avgRating: -1 },
    },
    {
      $limit: limit,
    },
  ]);

  const recommendedDestinationIds = recommendations.map((r: any) => r._id);

  // Get full destination data
  return await Destination.find({
    _id: { $in: recommendedDestinationIds },
    isActive: true,
  });
}

