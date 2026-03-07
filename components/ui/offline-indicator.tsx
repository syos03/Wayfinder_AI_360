'use client';

/**
 * Offline Indicator Component
 * Shows banner when user is offline
 */

import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { WifiOff, Wifi } from 'lucide-react';

export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(true);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Set initial online status
    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      setShowBanner(true);
      // Hide banner after 3 seconds
      setTimeout(() => setShowBanner(false), 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowBanner(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!showBanner && isOnline) return null;

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-50 transform transition-transform duration-300 ${
        showBanner ? 'translate-y-0' : '-translate-y-full'
      }`}
    >
      <div
        className={`${
          isOnline
            ? 'bg-green-500'
            : 'bg-amber-500'
        } text-white px-4 py-3 text-center text-sm font-medium flex items-center justify-center gap-2`}
      >
        {isOnline ? (
          <>
            <Wifi className="h-4 w-4" />
            Đã kết nối internet
          </>
        ) : (
          <>
            <WifiOff className="h-4 w-4" />
            Bạn đang offline - Một số tính năng có thể bị giới hạn
          </>
        )}
      </div>
    </div>
  );
}















