'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Star, TrendingUp, Flame, ChevronRight } from 'lucide-react';

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
  trendingScore?: number;
}

interface TrendingSectionProps {
  period?: '7d' | '30d';
  limit?: number;
  showHeader?: boolean;
}

export default function TrendingSection({
  period = '7d',
  limit = 12,
  showHeader = true,
}: TrendingSectionProps) {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d'>(period);

  useEffect(() => {
    fetchTrendingDestinations();
  }, [selectedPeriod]);

  const fetchTrendingDestinations = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `/api/recommendations/trending?period=${selectedPeriod}&limit=${limit}`
      );
      const data = await res.json();

      if (data.success) {
        setDestinations(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch trending destinations:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTrendingBadgeColor = (score: number) => {
    if (score >= 80) return 'bg-red-500';
    if (score >= 60) return 'bg-orange-500';
    if (score >= 40) return 'bg-yellow-500';
    return 'bg-gray-500';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {showHeader && (
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Flame className="w-6 h-6 text-orange-500" />
              Điểm đến đang Hot
            </h2>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="overflow-hidden animate-pulse">
              <div className="h-56 bg-gray-200" />
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

  if (destinations.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <TrendingUp className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500">Chưa có điểm đến trending</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {showHeader && (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Flame className="w-6 h-6 text-orange-500" />
            Điểm đến đang Hot
            <span className="text-sm font-normal text-gray-500">
              ({destinations.length} địa điểm)
            </span>
          </h2>

          {/* Period Toggle */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Xem theo:</span>
            <Button
              variant={selectedPeriod === '7d' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedPeriod('7d')}
            >
              7 ngày
            </Button>
            <Button
              variant={selectedPeriod === '30d' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedPeriod('30d')}
            >
              30 ngày
            </Button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {destinations.map((dest, index) => (
          <Link key={dest._id} href={`/destinations/${dest._id}`}>
            <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group h-full">
              {/* Image */}
              <div className="relative h-56 overflow-hidden">
                <img
                  src={dest.images[0] || '/placeholder-destination.jpg'}
                  alt={dest.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />

                {/* Trending Badge */}
                {dest.trendingScore && (
                  <div
                    className={`absolute top-3 right-3 ${getTrendingBadgeColor(
                      dest.trendingScore
                    )} text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg`}
                  >
                    <Flame className="w-3 h-3" />
                    {dest.trendingScore}
                  </div>
                )}

                {/* Rank Badge */}
                <div className="absolute top-3 left-3 bg-black/70 text-white px-3 py-1 rounded-full text-sm font-bold">
                  #{index + 1}
                </div>

                {/* Type Badge */}
                <div className="absolute bottom-3 left-3">
                  <Badge className="bg-white/90 text-gray-800 hover:bg-white">
                    {dest.type}
                  </Badge>
                </div>
              </div>

              <CardContent className="p-4 space-y-3">
                {/* Name */}
                <h3 className="font-bold text-lg line-clamp-1 group-hover:text-blue-600 transition-colors">
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
      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
        <p className="text-sm text-orange-800">
          🔥 <strong>Điểm đến Hot:</strong> Được tính dựa trên lượt xem, đánh giá mới, 
          và tốc độ tăng trưởng phổ biến trong {selectedPeriod === '7d' ? '7 ngày' : '30 ngày'} qua.
        </p>
      </div>
    </div>
  );
}

