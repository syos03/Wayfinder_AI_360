'use client';

/**
 * Web Vitals Monitoring
 * Track Core Web Vitals and send to PostHog
 */

import { useEffect } from 'react';
import { onCLS, onINP, onFCP, onLCP, onTTFB, Metric } from 'web-vitals';

export function WebVitals() {
  useEffect(() => {
    const reportMetric = (metric: Metric) => {
      // Log to console in development
      if (process.env.NODE_ENV === 'development') {
        console.log(`[Web Vitals] ${metric.name}:`, metric.value, metric.rating);
      }

      // Send to PostHog in production
      if (typeof window !== 'undefined' && (window as any).posthog) {
        (window as any).posthog.capture('web_vital', {
          metric_name: metric.name,
          metric_value: metric.value,
          metric_rating: metric.rating,
          metric_id: metric.id,
          metric_delta: metric.delta,
        });
      }

      // Can also send to custom analytics endpoint
      if (process.env.NODE_ENV === 'production') {
        fetch('/api/analytics/web-vitals', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: metric.name,
            value: metric.value,
            rating: metric.rating,
            id: metric.id,
            delta: metric.delta,
          }),
        }).catch((error) => {
          console.error('Failed to send web vital:', error);
        });
      }
    };

    // Register all Core Web Vitals
    onCLS(reportMetric);  // Cumulative Layout Shift
    onINP(reportMetric);  // Interaction to Next Paint (replaces FID)
    onFCP(reportMetric);  // First Contentful Paint
    onLCP(reportMetric);  // Largest Contentful Paint
    onTTFB(reportMetric); // Time to First Byte
  }, []);

  return null; // This component doesn't render anything
}

