/**
 * Analytics Event Definitions
 * All event names and their properties
 */

// ============================================================================
// USER LIFECYCLE EVENTS
// ============================================================================

export const USER_EVENTS = {
  // Registration & Authentication
  REGISTERED: 'user_registered',
  LOGGED_IN: 'user_logged_in',
  LOGGED_OUT: 'user_logged_out',
  
  // Profile Management
  PROFILE_VIEWED: 'profile_viewed',
  PROFILE_UPDATED: 'profile_updated',
  AVATAR_CHANGED: 'avatar_changed',
  COVER_IMAGE_CHANGED: 'cover_image_changed',
  
  // Social Actions
  USER_FOLLOWED: 'user_followed',
  USER_UNFOLLOWED: 'user_unfollowed',
} as const;

// ============================================================================
// DESTINATION EVENTS
// ============================================================================

export const DESTINATION_EVENTS = {
  // Discovery
  DESTINATION_VIEWED: 'destination_viewed',
  DESTINATION_SEARCHED: 'destination_searched',
  DESTINATION_FILTERED: 'destination_filtered',
  DESTINATION_CLICKED: 'destination_clicked',
  
  // Engagement
  DESTINATION_SHARED: 'destination_shared',
  IMAGE_VIEWED: 'destination_image_viewed',
  
  // Admin Actions
  DESTINATION_CREATED: 'destination_created',
  DESTINATION_UPDATED: 'destination_updated',
  DESTINATION_DELETED: 'destination_deleted',
} as const;

// ============================================================================
// SEARCH EVENTS
// ============================================================================

export const SEARCH_EVENTS = {
  SEARCH_PERFORMED: 'search_performed',
  SEARCH_AUTOCOMPLETE_USED: 'search_autocomplete_used',
  FILTER_APPLIED: 'search_filter_applied',
  FILTER_CLEARED: 'search_filter_cleared',
  SEARCH_ZERO_RESULTS: 'search_zero_results',
  POPULAR_SEARCH_CLICKED: 'popular_search_clicked',
} as const;

// ============================================================================
// REVIEW EVENTS
// ============================================================================

export const REVIEW_EVENTS = {
  REVIEW_STARTED: 'review_started',
  REVIEW_SUBMITTED: 'review_submitted',
  REVIEW_EDITED: 'review_edited',
  REVIEW_DELETED: 'review_deleted',
  
  // Admin Actions
  REVIEW_APPROVED: 'review_approved',
  REVIEW_REJECTED: 'review_rejected',
} as const;

// ============================================================================
// RECOMMENDATION EVENTS
// ============================================================================

export const RECOMMENDATION_EVENTS = {
  SIMILAR_VIEWED: 'similar_destinations_viewed',
  TRENDING_VIEWED: 'trending_destinations_viewed',
  PERSONALIZED_VIEWED: 'personalized_recommendations_viewed',
  TAG_CLICKED: 'tag_clicked',
  TAG_DESTINATIONS_VIEWED: 'tag_destinations_viewed',
} as const;

// ============================================================================
// ADMIN EVENTS
// ============================================================================

export const ADMIN_EVENTS = {
  ADMIN_DASHBOARD_VIEWED: 'admin_dashboard_viewed',
  ADMIN_ANALYTICS_VIEWED: 'admin_analytics_viewed',
  USER_BANNED: 'user_banned',
  USER_UNBANNED: 'user_unbanned',
  BULK_ACTION_PERFORMED: 'bulk_action_performed',
} as const;

// ============================================================================
// NAVIGATION EVENTS
// ============================================================================

export const NAVIGATION_EVENTS = {
  PAGE_VIEWED: 'page_viewed',
  LINK_CLICKED: 'link_clicked',
  BUTTON_CLICKED: 'button_clicked',
  TAB_CHANGED: 'tab_changed',
} as const;

// ============================================================================
// EVENT PROPERTY TYPES
// ============================================================================

export interface UserEventProperties {
  userId?: string;
  userName?: string;
  userRole?: string;
  userEmail?: string;
}

export interface DestinationEventProperties {
  destinationId: string;
  destinationName?: string;
  destinationType?: string;
  destinationRegion?: string;
  destinationRating?: number;
}

export interface SearchEventProperties {
  query?: string;
  filters?: Record<string, any>;
  resultsCount?: number;
  source?: string;
}

export interface ReviewEventProperties {
  reviewId?: string;
  destinationId: string;
  destinationName?: string;
  rating: number;
  hasPhotos?: boolean;
  reviewLength?: number;
}

export interface RecommendationEventProperties {
  destinationId?: string;
  recommendationType: 'similar' | 'trending' | 'personalized' | 'tag';
  position?: number;
  tag?: string;
}

export interface AdminEventProperties {
  adminId: string;
  action: string;
  targetType?: 'destination' | 'review' | 'user';
  targetId?: string;
}

// ============================================================================
// ALL EVENTS (for type safety)
// ============================================================================

export const ALL_EVENTS = {
  ...USER_EVENTS,
  ...DESTINATION_EVENTS,
  ...SEARCH_EVENTS,
  ...REVIEW_EVENTS,
  ...RECOMMENDATION_EVENTS,
  ...ADMIN_EVENTS,
  ...NAVIGATION_EVENTS,
} as const;

export type EventName = typeof ALL_EVENTS[keyof typeof ALL_EVENTS];

