'use client';

/**
 * Analytics Page - Redirects to Overview
 * This page redirects to the new Phase 5 analytics overview
 */

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AnalyticsRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the new analytics overview page
    router.replace('/admin/analytics/overview');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Redirecting to Analytics Overview...</p>
      </div>
    </div>
  );
}
