/**
 * Track Destination View Analytics
 * Call this when user visits a destination page
 */

export async function trackDestinationView(
  destinationId: string,
  source: 'search' | 'recommendation' | 'direct' | 'explore' | 'profile' | 'review' | 'similar' = 'direct'
) {
  try {
    await fetch('/api/analytics/track-view', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        destinationId,
        source,
        timestamp: new Date().toISOString(),
      }),
    });
  } catch (error) {
    console.error('Failed to track view:', error);
    // Silent fail - don't block user experience
  }
}

export async function trackDestinationClick(
  destinationId: string,
  searchQuery?: string,
  source: string = 'search'
) {
  try {
    await fetch('/api/analytics/track-click', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        destinationId,
        searchQuery,
        source,
        timestamp: new Date().toISOString(),
      }),
    });
  } catch (error) {
    console.error('Failed to track click:', error);
    // Silent fail
  }
}

