/**
 * Analytics Module
 * Centralized exports for analytics functionality
 */

// PostHog client
export {
  initPostHog,
  identifyUser,
  setUserProperties,
  resetUser,
  trackEvent,
  trackPageView,
  isPostHogEnabled,
  getPostHog,
} from './posthog';

// Event definitions
export {
  USER_EVENTS,
  DESTINATION_EVENTS,
  SEARCH_EVENTS,
  REVIEW_EVENTS,
  RECOMMENDATION_EVENTS,
  ADMIN_EVENTS,
  NAVIGATION_EVENTS,
  ALL_EVENTS,
} from './events';

export type {
  EventName,
  UserEventProperties,
  DestinationEventProperties,
  SearchEventProperties,
  ReviewEventProperties,
  RecommendationEventProperties,
  AdminEventProperties,
} from './events';

// Tracking helpers
export {
  trackUserRegistered,
  trackUserLoggedIn,
  trackUserLoggedOut,
  trackProfileViewed,
  trackProfileUpdated,
  trackUserFollowed,
  trackUserUnfollowed,
  trackDestinationViewed,
  trackDestinationClicked,
  trackDestinationSearched,
  trackDestinationFiltered,
  trackSearchPerformed,
  trackAutocompleteUsed,
  trackFilterApplied,
  trackFilterCleared,
  trackSearchZeroResults,
  trackReviewStarted,
  trackReviewSubmitted,
  trackReviewEdited,
  trackReviewDeleted,
  trackSimilarDestinationsViewed,
  trackTrendingViewed,
  trackPersonalizedViewed,
  trackTagClicked,
  trackTagDestinationsViewed,
  trackAdminDashboardViewed,
  trackAdminAnalyticsViewed,
  trackUserBanned,
  trackPageViewed,
  trackLinkClicked,
  trackButtonClicked,
  trackTabChanged,
} from './tracking';

