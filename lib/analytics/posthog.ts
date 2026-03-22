import posthog from 'posthog-js';

// PostHog configuration
const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY || '';
const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com';

let isInitialized = false;

/**
 * Initialize PostHog client
 * Only runs on client-side
 */
export const initPostHog = () => {
  // Only initialize on client-side and if key is provided
  if (typeof window === 'undefined') return;
  
  if (!POSTHOG_KEY) {
    console.warn('⚠️ PostHog key not found. Analytics disabled. Set NEXT_PUBLIC_POSTHOG_KEY in .env.local');
    return;
  }

  if (isInitialized) return;

  try {
    posthog.init(POSTHOG_KEY, {
      api_host: POSTHOG_HOST,
      
      // Capture settings
      autocapture: false, // Manual tracking for better control
      capture_pageview: true, // Auto track page views
      capture_pageleave: true, // Track when users leave
      
      // Session recording settings
      disable_session_recording: false,
      session_recording: {
        maskAllInputs: true, // Mask all input fields for privacy
        recordCrossOriginIframes: false,
      },
      
      // Person profiles
      person_profiles: 'identified_only', // Only track logged-in users as persons
      
      // Privacy
      respect_dnt: true, // Respect Do Not Track
      opt_out_capturing_by_default: false,
      
      // Performance
      loaded: (posthog) => {
        if (process.env.NODE_ENV === 'development') {
          console.log('✅ PostHog initialized');
        }
      },
    });

    isInitialized = true;
  } catch (error) {
    console.error('❌ PostHog initialization error:', error);
  }
};

/**
 * Identify user in PostHog
 * Call after login
 */
export const identifyUser = (userId: string, properties?: Record<string, any>) => {
  if (!isInitialized || !userId) return;
  
  try {
    posthog.identify(userId, {
      ...properties,
      identified_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error('❌ PostHog identify error:', error);
  }
};

/**
 * Set user properties
 */
export const setUserProperties = (properties: Record<string, any>) => {
  if (!isInitialized) return;
  
  try {
    posthog.people.set(properties);
  } catch (error) {
    console.error('❌ PostHog set properties error:', error);
  }
};

/**
 * Reset user (call on logout)
 */
export const resetUser = () => {
  if (!isInitialized) return;
  
  try {
    posthog.reset();
  } catch (error) {
    console.error('❌ PostHog reset error:', error);
  }
};

/**
 * Track custom event
 */
export const trackEvent = (eventName: string, properties?: Record<string, any>) => {
  if (!isInitialized) return;
  
  try {
    posthog.capture(eventName, {
      ...properties,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('❌ PostHog track event error:', error);
  }
};

/**
 * Track page view (manual)
 */
export const trackPageView = (pagePath?: string) => {
  if (!isInitialized) return;
  
  try {
    posthog.capture('$pageview', {
      $current_url: pagePath || window.location.href,
    });
  } catch (error) {
    console.error('❌ PostHog pageview error:', error);
  }
};

/**
 * Check if PostHog is initialized
 */
export const isPostHogEnabled = () => isInitialized;

/**
 * Get PostHog instance (for advanced usage)
 */
export const getPostHog = () => {
  if (!isInitialized) {
    console.warn('⚠️ PostHog not initialized');
    return null;
  }
  return posthog;
};

export default posthog;

