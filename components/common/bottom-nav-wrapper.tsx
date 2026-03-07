'use client';

/**
 * Bottom Nav Wrapper
 * Client component to handle user state for bottom nav
 */

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { BottomNav } from './bottom-nav';

export function BottomNavWrapper() {
  const { user, isAuthenticated } = useAuth();
  const [favoritesCount, setFavoritesCount] = useState(0);

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchFavoritesCount();
    }
  }, [isAuthenticated, user]);

  const fetchFavoritesCount = async () => {
    try {
      const res = await fetch('/api/favorites', { credentials: 'include' });
      const data = await res.json();
      if (res.ok) {
        setFavoritesCount(data.data.count || 0);
      }
    } catch (error) {
      // Silently fail
    }
  };

  return (
    <BottomNav 
      favoritesCount={favoritesCount} 
      userId={user?.id} 
    />
  );
}

