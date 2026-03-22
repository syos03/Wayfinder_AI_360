'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import SafeImage from '@/components/common/SafeImage';
import { MapPin, Star, TrendingUp, ChevronRight } from 'lucide-react';

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
  similarityScore?: number;
}

interface SimilarDestinationsProps {
  destinationId: string;
  limit?: number;
}

export default function SimilarDestinations({
  destinationId,
  limit = 6,
}: SimilarDestinationsProps) {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSimilarDestinations();
  }, [destinationId]);

  const fetchSimilarDestinations = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/recommendations/similar/${destinationId}?limit=${limit}`);
      const data = await res.json();

      if (data.success) {
        setDestinations(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch similar destinations:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <h2 className="text-lg font-bold">🎯 Điểm đến tương tự</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
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

  if (destinations.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold flex items-center gap-2">
          🎯 Điểm đến tương tự
          <span className="text-xs font-normal text-gray-500">
            ({destinations.length} gợi ý)
          </span>
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                {dest.similarityScore && dest.similarityScore >= 70 && (
                  <div className="absolute top-3 right-3 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    {dest.similarityScore}% khớp
                  </div>
                )}
                <div className="absolute top-3 left-3">
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
                      {dest.rating > 0 ? dest.rating.toFixed(1) : 'Chưa đánh giá'}
                    </span>
                  </div>
                  {dest.reviewsCount > 0 && (
                    <span className="text-sm text-gray-500">
                      ({dest.reviewsCount} đánh giá)
                    </span>
                  )}
                </div>

                {/* Description */}
                <p className="text-sm text-gray-600 line-clamp-2">
                  {dest.description}
                </p>

                {/* View Details */}
                <div className="flex items-center gap-1 text-blue-600 text-sm font-medium group-hover:gap-2 transition-all">
                  Xem chi tiết
                  <ChevronRight className="w-4 h-4" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Why Similar */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          💡 <strong>Gợi ý này dựa trên:</strong> Loại hình du lịch, khu vực địa lý, 
          phong cách, và mức giá tương tự với điểm đến bạn đang xem.
        </p>
      </div>
    </div>
  );
}

