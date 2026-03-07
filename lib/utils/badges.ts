/**
 * Badge System
 * Auto-assign badges based on user achievements
 */

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  condition: (stats: any) => boolean;
}

export const BADGES: Badge[] = [
  {
    id: 'new_traveler',
    name: 'Du khách mới',
    description: 'Tham gia Wayfinder',
    icon: '🌟',
    condition: () => true, // Everyone gets this
  },
  {
    id: 'first_review',
    name: 'Người đánh giá đầu tiên',
    description: 'Viết đánh giá đầu tiên',
    icon: '✍️',
    condition: (stats) => (stats?.reviewsCount || 0) >= 1,
  },
  {
    id: 'active_reviewer',
    name: 'Người đánh giá tích cực',
    description: 'Viết 5 đánh giá',
    icon: '📝',
    condition: (stats) => (stats?.reviewsCount || 0) >= 5,
  },
  {
    id: 'expert_reviewer',
    name: 'Chuyên gia đánh giá',
    description: 'Viết 20 đánh giá',
    icon: '🏆',
    condition: (stats) => (stats?.reviewsCount || 0) >= 20,
  },
  {
    id: 'explorer',
    name: 'Nhà thám hiểm',
    description: 'Đã đến 10 địa điểm',
    icon: '🗺️',
    condition: (stats) => (stats?.destinationsVisited || 0) >= 10,
  },
  {
    id: 'globe_trotter',
    name: 'Người đi khắp nơi',
    description: 'Đã đến 30 địa điểm',
    icon: '🌍',
    condition: (stats) => (stats?.destinationsVisited || 0) >= 30,
  },
  {
    id: 'popular',
    name: 'Người nổi tiếng',
    description: 'Có 10 người theo dõi',
    icon: '⭐',
    condition: (stats) => (stats?.followersCount || 0) >= 10,
  },
  {
    id: 'influencer',
    name: 'Người ảnh hưởng',
    description: 'Có 50 người theo dõi',
    icon: '💫',
    condition: (stats) => (stats?.followersCount || 0) >= 50,
  },
  {
    id: 'social_butterfly',
    name: 'Người thân thiện',
    description: 'Theo dõi 20 người',
    icon: '🦋',
    condition: (stats) => (stats?.followingCount || 0) >= 20,
  },
];

/**
 * Calculate which badges a user should have
 */
export function calculateBadges(stats: any): string[] {
  return BADGES
    .filter(badge => badge.condition(stats))
    .map(badge => badge.id);
}

/**
 * Get badge details by ID
 */
export function getBadge(badgeId: string): Badge | undefined {
  return BADGES.find(b => b.id === badgeId);
}

/**
 * Format badge for display
 */
export function formatBadge(badgeId: string): string {
  const badge = getBadge(badgeId);
  if (!badge) return badgeId;
  return `${badge.icon} ${badge.name}`;
}

