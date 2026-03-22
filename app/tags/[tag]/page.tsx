'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import SafeImage from '@/components/common/SafeImage';
import { MapPin, Star, Tag, ArrowLeft, ChevronRight } from 'lucide-react';

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
}

export default function TagPage({ params }: { params: Promise<{ tag: string }> }) {
  const resolvedParams = use(params);
  const tag = decodeURIComponent(resolvedParams.tag);

  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDestinationsByTag();
  }, [tag]);

  const fetchDestinationsByTag = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/recommendations/by-tag/${encodeURIComponent(tag)}?limit=24`);
      const data = await res.json();

      if (data.success) {
        setDestinations(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch destinations by tag:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTagIcon = (tagName: string) => {
    const icons: Record<string, string> = {
      'Biển': '🏖️',
      'Núi': '⛰️',
      'Văn hóa': '🏛️',
      'Ẩm thực': '🍜',
      'Thiên nhiên': '🌿',
      'Lịch sử': '📜',
      'Nghỉ dưỡng': '🏝️',
      'Phiêu lưu': '🧗',
      'Thành phố': '🏙️',
    };
    return icons[tagName] || '📍';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-12">
          <div className="mb-8 animate-pulse">
            <div className="h-12 bg-gray-200 rounded w-1/3 mb-4" />
            <div className="h-6 bg-gray-200 rounded w-1/2" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="overflow-hidden">
                <div className="h-56 bg-gray-200" />
                <CardContent className="p-4">
                  <div className="h-6 bg-gray-200 rounded mb-2" />
                  <div className="h-4 bg-gray-200 rounded w-2/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        {/* Back Button */}
        <Link href="/discover">
          <Button variant="outline" className="mb-6 gap-2">
            <ArrowLeft className="w-4 h-4" />
            Quay lại Khám phá
          </Button>
        </Link>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-5xl">{getTagIcon(tag)}</span>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">
                {tag}
              </h1>
              <p className="text-gray-600 mt-2">
                {destinations.length} điểm đến được tìm thấy
              </p>
            </div>
          </div>
        </div>

        {/* Destinations Grid */}
        {destinations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {destinations.map((dest) => (
              <Link key={dest._id} href={`/destinations/${dest._id}`}>
                <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group h-full">
                  {/* Image */}
                  <div className="relative h-56 overflow-hidden">
                    <SafeImage
                      src={dest.images[0] || '/placeholder-destination.jpg'}
                      alt={dest.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-300"
                    />

                    {/* Tag Badge */}
                    <div className="absolute top-3 right-3 bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                      <Tag className="w-3 h-3" />
                      {tag}
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

                    {/* Description */}
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {dest.description}
                    </p>

                    {/* View Details */}
                    <div className="flex items-center gap-1 text-blue-600 text-sm font-medium group-hover:gap-2 transition-all pt-2">
                      Xem chi tiết
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-lg border-2 border-dashed border-gray-300">
            <Tag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              Không tìm thấy điểm đến
            </h3>
            <p className="text-gray-500 mb-6">
              Chưa có điểm đến nào với tag "{tag}"
            </p>
            <Link href="/discover">
              <Button>Khám phá các tag khác</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

