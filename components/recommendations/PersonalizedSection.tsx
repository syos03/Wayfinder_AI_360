'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import SafeImage from '@/components/common/SafeImage';
import { MapPin, Star, Sparkles, ChevronRight } from 'lucide-react';

interface Destination {
  _id: string;
  name: string;
  province: string;
  region: string;
  type: string;
  images: string[];
  rating: number;
  reviewsCount: number;
  description: string;
  source?: 'collaborative' | 'personalized' | 'trending';
}

interface PersonalizedSectionProps {
  limit?: number;
  showHeader?: boolean;
}

export default function PersonalizedSection({
  limit = 12,
  showHeader = true,
}: PersonalizedSectionProps) {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPersonalizedRecommendations();
  }, []);

  const fetchPersonalizedRecommendations = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/recommendations/for-you?limit=${limit}&method=all`, {
        credentials: 'include',
      });
      const data = await res.json();

      if (data.success && data.data && data.data.length > 0) {
        setDestinations(data.data);
      } else {
        if (res.status === 401) {
          setError('Vui lòng đăng nhập để xem gợi ý cá nhân hóa');
        } else {
          await fetchFallbackRecommendations();
        }
      }
    } catch (error) {
      console.error('Failed to fetch personalized recommendations:', error);
      await fetchFallbackRecommendations();
    } finally {
      setLoading(false);
    }
  };

  const fetchFallbackRecommendations = async () => {
    try {
      const res = await fetch('/api/recommendations/trending?limit=4&period=30d');
      const data = await res.json();
      if (data.success) {
        setDestinations(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch fallback recommendations:', error);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {showHeader && (
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-500" />
            Dành riêng cho bạn
          </h2>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="overflow-hidden animate-pulse">
              <div className="h-40 bg-gray-200" />
              <CardContent className="p-4">
                <div className="h-6 bg-gray-200 rounded mb-2" />
                <div className="h-4 bg-gray-200 rounded w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
        <Sparkles className="w-12 h-12 text-yellow-400 mx-auto mb-3" />
        <p className="text-yellow-800 mb-4">{error}</p>
        {error.includes('đăng nhập') && (
          <Link href="/login">
            <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition">
              Đăng nhập ngay
            </button>
          </Link>
        )}
      </div>
    );
  }

  if (destinations.length === 0) {
    return (
      <div className="bg-muted/30 border border-dashed border-border rounded-xl p-8 text-center">
        <Sparkles className="w-12 h-12 text-primary/20 mx-auto mb-4" />
        <h3 className="text-lg font-bold mb-2">Chưa có gợi ý cá nhân hóa</h3>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto text-sm">
          Hãy khám phá và đánh giá một số điểm đến để AI có thể hiểu sở thích của bạn hơn!
        </p>
        <Link href="/explore">
          <Button variant="outline" size="sm" className="rounded-full px-6">
            Khám phá ngay
          </Button>
        </Link>
      </div>
    );
  }

  const isFallback = destinations.every(d => !d.source || d.source === 'trending');

  return (
    <div className="space-y-6">
      {showHeader && (
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            {isFallback ? 'Có thể bạn sẽ thích' : 'Dành riêng cho bạn'}
            <span className="text-xs font-normal text-muted-foreground ml-1">
              {isFallback ? '(Phổ biến)' : `(${destinations.length} gợi ý)`}
            </span>
          </h2>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {destinations.map((dest) => (
          <Link key={dest._id} href={`/destinations/${dest._id}`}>
            <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group h-full">
              {/* Image */}
              <div className="relative h-48 overflow-hidden">
                <SafeImage
                  src={dest.images[0] || '/placeholder-destination.jpg'}
                  alt={dest.name}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-300"
                />

                {/* Source Badge */}
                <div className="absolute top-3 right-3 bg-purple-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  {dest.source === 'collaborative' ? 'Bạn bè thích' : 'Phù hợp'}
                </div>

                {/* Type Badge */}
                <div className="absolute bottom-3 left-3">
                  <Badge className="bg-white/90 text-gray-800 hover:bg-white">
                    {dest.type}
                  </Badge>
                </div>
              </div>

              <CardContent className="p-3 space-y-2">
                {/* Name */}
                <h3 className="font-bold text-base line-clamp-1 group-hover:text-blue-600 transition-colors">
                  {dest.name}
                </h3>

                {/* Location */}
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span className="line-clamp-1">
                    {dest.province}, {dest.region}
                  </span>
                </div>

                {/* Rating */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold">
                      {dest.rating > 0 ? dest.rating.toFixed(1) : 'N/A'}
                    </span>
                  </div>
                  {dest.reviewsCount > 0 && (
                    <span className="text-sm text-gray-500">
                      ({dest.reviewsCount})
                    </span>
                  )}
                </div>

                {/* View Details */}
                <div className="flex items-center gap-1 text-blue-600 text-sm font-medium group-hover:gap-2 transition-all pt-2">
                  Khám phá ngay
                  <ChevronRight className="w-4 h-4" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Info Box */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <p className="text-sm text-purple-800">
          ✨ <strong>Gợi ý cá nhân hóa:</strong> Dựa trên sở thích, lịch sử đánh giá, 
          và những địa điểm mà người dùng tương tự với bạn đã yêu thích.
        </p>
      </div>
    </div>
  );
}

