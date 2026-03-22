'use client';

/**
 * Favorites Page
 * Displays user's favorited destinations
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/common/empty-state';
import { Heart, MapPin, Star, Trash2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { toast } from 'sonner';

interface Destination {
  _id: string;
  name: string;
  province: string;
  region: string;
  type: string;
  rating: number;
  reviewCount: number;
  images: string[];
  description: string;
}

export default function FavoritesPage() {
  const router = useRouter();
  const [favorites, setFavorites] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      const res = await fetch('/api/favorites', {
        credentials: 'include',
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 401) {
          router.push('/login');
          return;
        }
        throw new Error(data.error);
      }

      setFavorites(data.data.favorites);
    } catch (error: any) {
      toast.error(error.message || 'Không thể tải danh sách yêu thích');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (destinationId: string) => {
    try {
      const res = await fetch(`/api/favorites/${destinationId}`, {
        method: 'POST',
        credentials: 'include',
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error);
      }

      toast.success('Đã bỏ khỏi yêu thích');
      fetchFavorites(); // Refresh list
    } catch (error: any) {
      toast.error(error.message || 'Không thể xóa');
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1.5">
            <Heart className="w-6 h-6 text-red-500 fill-current" />
            <h1 className="text-xl font-bold">Điểm đến yêu thích</h1>
          </div>
          <p className="text-sm text-gray-600">
            {favorites.length > 0
              ? `Bạn đã lưu ${favorites.length} điểm đến`
              : 'Chưa có điểm đến yêu thích'}
          </p>
        </div>

        {/* Empty State */}
        {favorites.length === 0 ? (
          <EmptyState
            icon={Heart}
            title="Chưa có điểm đến yêu thích"
            description="Bắt đầu lưu những nơi bạn muốn đến để dễ dàng quay lại sau này!"
            primaryAction={{ label: "Khám phá ngay", href: "/explore" }}
            secondaryAction={{ label: "Xem trending", href: "/discover" }}
          />
        ) : (
          /* Favorites Grid */
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {favorites.map((destination) => (
              <Card
                key={destination._id}
                className="overflow-hidden hover:shadow-2xl hover:scale-[1.02] hover:-translate-y-1 transition-all duration-300"
              >
                {/* Image */}
                <Link href={`/destinations/${destination._id}`}>
                  <div className="relative h-40 bg-gray-200">
                    {destination.images[0] && (
                      <Image
                        src={destination.images[0]}
                        alt={destination.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    )}
                  </div>
                </Link>

                <CardContent className="p-4">
                  {/* Title */}
                  <Link href={`/destinations/${destination._id}`}>
                    <h3 className="text-lg font-bold mb-2 hover:text-blue-600 transition-colors line-clamp-1">
                      {destination.name}
                    </h3>
                  </Link>

                  {/* Location & Type */}
                  <div className="flex items-center gap-2 mb-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span>{destination.province}</span>
                    <span>•</span>
                    <span>{destination.type}</span>
                  </div>

                  {/* Rating */}
                  {destination.rating > 0 && (
                    <div className="flex items-center gap-1 mb-3">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">
                        {destination.rating.toFixed(1)}
                      </span>
                      <span className="text-sm text-gray-600">
                        ({destination.reviewCount} đánh giá)
                      </span>
                    </div>
                  )}

                  {/* Description */}
                  <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                    {destination.description}
                  </p>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button asChild className="flex-1" size="sm">
                      <Link href={`/destinations/${destination._id}`}>
                        Xem chi tiết
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemove(destination._id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

