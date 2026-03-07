'use client';

/**
 * Favorite Button Component
 * Allows users to add/remove destinations from favorites
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';

interface FavoriteButtonProps {
  destinationId: string;
  initialFavorited: boolean;
  className?: string;
  variant?: 'default' | 'outline';
}

export function FavoriteButton({
  destinationId,
  initialFavorited,
  className = '',
  variant,
}: FavoriteButtonProps) {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [isFavorited, setIsFavorited] = useState(initialFavorited);
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập để lưu điểm đến');
      router.push('/login');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`/api/favorites/${destinationId}`, {
        method: 'POST',
        credentials: 'include',
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Có lỗi xảy ra');
      }

      setIsFavorited(data.data.isFavorited);

      toast.success(
        data.data.isFavorited
          ? '❤️ Đã lưu vào yêu thích!'
          : 'Đã bỏ khỏi yêu thích'
      );
    } catch (error: any) {
      toast.error(error.message || 'Không thể cập nhật yêu thích');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant={variant || (isFavorited ? 'default' : 'outline')}
      onClick={handleToggle}
      disabled={loading}
      className={`flex items-center gap-2 ${className}`}
    >
      <Heart
        className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`}
      />
      {isFavorited ? 'Đã lưu' : 'Lưu điểm đến'}
    </Button>
  );
}

