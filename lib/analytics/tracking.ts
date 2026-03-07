/**
 * Analytics Tracking Helpers
 * High-level functions for tracking specific events
 */

import { trackEvent } from './posthog';
import {
  USER_EVENTS,
  DESTINATION_EVENTS,
  SEARCH_EVENTS,
  REVIEW_EVENTS,
  RECOMMENDATION_EVENTS,
  ADMIN_EVENTS,
  NAVIGATION_EVENTS,
  type UserEventProperties,
  type DestinationEventProperties,
  type SearchEventProperties,
  type ReviewEventProperties,
  type RecommendationEventProperties,
  type AdminEventProperties,
} from './events';

// ============================================================================
// USER TRACKING
// ============================================================================

export const trackUserRegistered = (properties: UserEventProperties) => {
  trackEvent(USER_EVENTS.REGISTERED, {
    ...properties,
    registration_date: new Date().toISOString(),
  });
};

export const trackUserLoggedIn = (properties: UserEventProperties) => {
  trackEvent(USER_EVENTS.LOGGED_IN, {
    ...properties,
    login_date: new Date().toISOString(),
  });
};

export const trackUserLoggedOut = (properties?: UserEventProperties) => {
  trackEvent(USER_EVENTS.LOGGED_OUT, properties);
};

export const trackProfileViewed = (properties: { profileUserId: string; viewerUserId?: string }) => {
  trackEvent(USER_EVENTS.PROFILE_VIEWED, {
    profile_user_id: properties.profileUserId,
    viewer_user_id: properties.viewerUserId,
    is_own_profile: properties.profileUserId === properties.viewerUserId,
  });
};

export const trackProfileUpdated = (properties: { userId: string; fieldsUpdated: string[] }) => {
  trackEvent(USER_EVENTS.PROFILE_UPDATED, {
    user_id: properties.userId,
    fields_updated: properties.fieldsUpdated,
    fields_count: properties.fieldsUpdated.length,
  });
};

export const trackUserFollowed = (properties: { followerId: string; followedUserId: string }) => {
  trackEvent(USER_EVENTS.USER_FOLLOWED, properties);
};

export const trackUserUnfollowed = (properties: { followerId: string; unfollowedUserId: string }) => {
  trackEvent(USER_EVENTS.USER_UNFOLLOWED, properties);
};

// ============================================================================
// DESTINATION TRACKING
// ============================================================================

export const trackDestinationViewed = (properties: DestinationEventProperties & { source?: string }) => {
  trackEvent(DESTINATION_EVENTS.DESTINATION_VIEWED, {
    destination_id: properties.destinationId,
    destination_name: properties.destinationName,
    destination_type: properties.destinationType,
    destination_region: properties.destinationRegion,
    destination_rating: properties.destinationRating,
    source: properties.source || 'direct',
  });
};

export const trackDestinationClicked = (properties: DestinationEventProperties & { source: string; position?: number }) => {
  trackEvent(DESTINATION_EVENTS.DESTINATION_CLICKED, {
    destination_id: properties.destinationId,
    destination_name: properties.destinationName,
    source: properties.source,
    position: properties.position,
  });
};

export const trackDestinationSearched = (properties: SearchEventProperties) => {
  trackEvent(DESTINATION_EVENTS.DESTINATION_SEARCHED, {
    query: properties.query,
    filters: properties.filters,
    results_count: properties.resultsCount,
    has_filters: properties.filters ? Object.keys(properties.filters).length > 0 : false,
  });
};

export const trackDestinationFiltered = (properties: { filters: Record<string, any>; resultsCount: number }) => {
  trackEvent(DESTINATION_EVENTS.DESTINATION_FILTERED, {
    filters: properties.filters,
    filter_types: Object.keys(properties.filters),
    results_count: properties.resultsCount,
  });
};

// ============================================================================
// SEARCH TRACKING
// ============================================================================

export const trackSearchPerformed = (properties: SearchEventProperties) => {
  trackEvent(SEARCH_EVENTS.SEARCH_PERFORMED, {
    query: properties.query,
    filters: properties.filters,
    results_count: properties.resultsCount,
    source: properties.source || 'search_bar',
    has_results: (properties.resultsCount || 0) > 0,
  });
};

export const trackAutocompleteUsed = (properties: { query: string; selectedSuggestion: string; suggestionType: string }) => {
  trackEvent(SEARCH_EVENTS.SEARCH_AUTOCOMPLETE_USED, properties);
};

export const trackFilterApplied = (properties: { filterType: string; filterValue: any; resultsCount: number }) => {
  trackEvent(SEARCH_EVENTS.FILTER_APPLIED, properties);
};

export const trackFilterCleared = () => {
  trackEvent(SEARCH_EVENTS.FILTER_CLEARED, {});
};

export const trackSearchZeroResults = (properties: { query: string; filters?: Record<string, any> }) => {
  trackEvent(SEARCH_EVENTS.SEARCH_ZERO_RESULTS, properties);
};

// ============================================================================
// REVIEW TRACKING
// ============================================================================

export const trackReviewStarted = (properties: { destinationId: string; destinationName?: string }) => {
  trackEvent(REVIEW_EVENTS.REVIEW_STARTED, properties);
};

export const trackReviewSubmitted = (properties: ReviewEventProperties) => {
  trackEvent(REVIEW_EVENTS.REVIEW_SUBMITTED, {
    review_id: properties.reviewId,
    destination_id: properties.destinationId,
    destination_name: properties.destinationName,
    rating: properties.rating,
    has_photos: properties.hasPhotos || false,
    review_length: properties.reviewLength || 0,
  });
};

export const trackReviewEdited = (properties: { reviewId: string; destinationId: string }) => {
  trackEvent(REVIEW_EVENTS.REVIEW_EDITED, properties);
};

export const trackReviewDeleted = (properties: { reviewId: string; destinationId: string }) => {
  trackEvent(REVIEW_EVENTS.REVIEW_DELETED, properties);
};

// ============================================================================
// RECOMMENDATION TRACKING
// ============================================================================

export const trackSimilarDestinationsViewed = (properties: { sourceDestinationId: string; similarCount: number }) => {
  trackEvent(RECOMMENDATION_EVENTS.SIMILAR_VIEWED, properties);
};

export const trackTrendingViewed = (properties: { period: string; trendingCount: number }) => {
  trackEvent(RECOMMENDATION_EVENTS.TRENDING_VIEWED, properties);
};

export const trackPersonalizedViewed = (properties: { userId: string; recommendationCount: number }) => {
  trackEvent(RECOMMENDATION_EVENTS.PERSONALIZED_VIEWED, properties);
};

export const trackTagClicked = (properties: { tag: string; source: string }) => {
  trackEvent(RECOMMENDATION_EVENTS.TAG_CLICKED, properties);
};

export const trackTagDestinationsViewed = (properties: { tag: string; destinationCount: number }) => {
  trackEvent(RECOMMENDATION_EVENTS.TAG_DESTINATIONS_VIEWED, properties);
};

// ============================================================================
// ADMIN TRACKING
// ============================================================================

export const trackAdminDashboardViewed = (properties: { adminId: string }) => {
  trackEvent(ADMIN_EVENTS.ADMIN_DASHBOARD_VIEWED, properties);
};

export const trackAdminAnalyticsViewed = (properties: { adminId: string; section: string }) => {
  trackEvent(ADMIN_EVENTS.ADMIN_ANALYTICS_VIEWED, {
    admin_id: properties.adminId,
    section: properties.section,
  });
};

export const trackUserBanned = (properties: { adminId: string; bannedUserId: string; reason?: string }) => {
  trackEvent(ADMIN_EVENTS.USER_BANNED, properties);
};

// ============================================================================
// NAVIGATION TRACKING
// ============================================================================

export const trackPageViewed = (properties: { pagePath: string; pageTitle?: string }) => {
  trackEvent(NAVIGATION_EVENTS.PAGE_VIEWED, {
    page_path: properties.pagePath,
    page_title: properties.pageTitle || document.title,
  });
};

export const trackLinkClicked = (properties: { linkText: string; linkHref: string; source: string }) => {
  trackEvent(NAVIGATION_EVENTS.LINK_CLICKED, properties);
};

export const trackButtonClicked = (properties: { buttonText: string; buttonId?: string; source: string }) => {
  trackEvent(NAVIGATION_EVENTS.BUTTON_CLICKED, properties);
};

export const trackTabChanged = (properties: { tabName: string; source: string }) => {
  trackEvent(NAVIGATION_EVENTS.TAB_CHANGED, properties);
};

