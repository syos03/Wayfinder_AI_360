'use client';

/**
 * Destination Detail Page (Public)
 */

import { use, useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  MapPin, 
  Star,
  Clock,
  DollarSign,
  Calendar,
  ArrowLeft,
  Map,
  Home,
  Utensils,
  AlertTriangle,
  Train,
  Bus,
  Plane,
  Share2
} from 'lucide-react';
import Link from 'next/link';
import SafeImage from '@/components/common/SafeImage';
import { useRouter, useSearchParams } from 'next/navigation';
import { ReviewList } from '@/components/reviews/ReviewList';
import { ReviewForm } from '@/components/reviews/ReviewForm';
import { trackDestinationView } from '@/lib/utils/trackDestinationView';
import SimilarDestinations from '@/components/recommendations/SimilarDestinations';
import { trackDestinationViewed } from '@/lib/analytics';
import { FavoriteButton } from '@/components/favorites/FavoriteButton';
import { useAuth } from '@/hooks/use-auth';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AR360Switcher } from '@/components/ar360/AR360Switcher';
import { shareDestination } from '@/lib/utils/share';
import { toast } from 'sonner';

interface Destination {
  _id: string;
  name: string;
  nameEn?: string;
  province: string;
  region: string;
  type: string;
  rating: number;
  reviewCount: number;
  description: string;
  images: string[];
  duration: string;
  budget: {
    low: number;
    medium: number;
    high: number;
  };
  highlights: string[];
  activities: string[];
  specialties: string[];
  bestTime: string[];
  tips: string[];
  warnings: string[];
  transportation: any;
  accommodation: any;
  coordinates: {
    lat: number;
    lng: number;
  };
  panoramaImages?: string[];
  youtubeVideos?: Array<{
    videoId: string;
    title: string;
    is360: boolean;
  }>;
  panoramaHotspots?: Array<{
    from: string;
    to: string;
    yaw: number;
    pitch: number;
    label?: string;
  }>;
  streetViewSpots?: Array<{
    url: string;
    title?: string;
  }>;
  streetViewLocations?: Array<{
    id?: string;
    url: string;
    title: string;
    description?: string;
    category?: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  }>;
  streetViewUrls?: string[];
  streetViewUrl?: string;
}

export default function DestinationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { user } = useAuth();
  const resolvedParams = use(params);
  const searchParams = useSearchParams();
  const [destination, setDestination] = useState<Destination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [reviewListKey, setReviewListKey] = useState(0);

  useEffect(() => {
    fetchDestination();
    checkFavoriteStatus();
  }, [resolvedParams.id, user]);

  const checkFavoriteStatus = async () => {
    if (!user) return;

    try {
      const res = await fetch('/api/favorites', { credentials: 'include' });
      const data = await res.json();

      if (res.ok) {
        const favorited = data.data.favorites.some(
          (fav: any) => fav._id === resolvedParams.id
        );
        setIsFavorited(favorited);
      }
    } catch (error) {
      // Silently fail - not critical
      console.error('Failed to check favorite status:', error);
    }
  };

  const fetchDestination = async () => {
    try {
      // Use public API - get by ID
      const res = await fetch(`/api/destinations/${resolvedParams.id}`, {
        cache: 'no-store',
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Không thể tải thông tin điểm đến');
      }

      setDestination(data.data.destination);
      
      // Track view analytics
      const source = searchParams.get('source') || 'direct';
      trackDestinationView(
        resolvedParams.id,
        source as any
      );
      
      // Track with PostHog
      trackDestinationViewed({
        destinationId: data.data.destination._id,
        destinationName: data.data.destination.name,
        destinationType: data.data.destination.type,
        destinationRegion: data.data.destination.region,
        destinationRating: data.data.destination.rating,
        source: source,
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return `${(price / 1000000).toFixed(1)}tr VNĐ`;
  };

  const getRegionBadgeColor = (region: string) => {
    switch (region) {
      case 'Bắc Bộ': return 'bg-blue-600 text-white';
      case 'Trung Bộ': return 'bg-green-600 text-white';
      case 'Nam Bộ': return 'bg-orange-600 text-white';
      default: return 'bg-gray-600 text-white';
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

  if (error || !destination) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-600">{error || 'Không tìm thấy điểm đến'}</p>
            <Button className="mt-4" onClick={() => router.push('/explore')}>
              Quay lại danh sách
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const normalizedStreetViewSpots =
    (destination.streetViewSpots && destination.streetViewSpots.length > 0
      ? destination.streetViewSpots
      : destination.streetViewUrls && destination.streetViewUrls.length > 0
      ? destination.streetViewUrls.map((url) => ({ url, title: '' }))
      : destination.streetViewUrl
      ? [{ url: destination.streetViewUrl, title: '' }]
      : []) ?? [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Image */}
      {destination.images.length > 0 && (
        <div className="relative h-96 bg-gray-900">
          <SafeImage
            src={destination.images[0]}
            alt={destination.name}
            fill
            priority
            className="object-cover opacity-90"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          
          {/* Breadcrumb */}
          <div className="absolute top-6 left-6">
            <Button variant="outline" size="sm" onClick={() => router.push('/explore')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Quay lại
            </Button>
          </div>

          {/* Title Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
            <div className="container mx-auto">
              <div className="flex items-center gap-3 mb-3 flex-wrap">
                <Badge className={getRegionBadgeColor(destination.region)}>
                  {destination.region}
                </Badge>
                <Badge variant="outline" className="bg-white/20 text-white border-white/40 break-words max-w-[250px]">
                  {destination.type}
                </Badge>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-2">{destination.name}</h1>
              {destination.nameEn && (
                <p className="text-xl text-gray-200">{destination.nameEn}</p>
              )}
              <div className="flex items-center gap-4 mt-4 text-sm">
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>{destination.province}</span>
                </div>
                {destination.rating > 0 && (
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-current text-yellow-400" />
                    <span>{destination.rating.toFixed(1)}</span>
                    <span className="text-gray-300">({destination.reviewCount} đánh giá)</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Overview */}
            <Card>
              <CardContent className="pt-6">
                <h2 className="text-2xl font-bold mb-4">Tổng quan</h2>
                <p className="text-gray-700 leading-relaxed break-words overflow-hidden">{destination.description}</p>
                
                <div className="grid md:grid-cols-3 gap-4 mt-6">
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="font-medium">Thời gian</p>
                      <p className="text-gray-600">{destination.duration}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <DollarSign className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="font-medium">Ngân sách</p>
                      <p className="text-gray-600">
                        {destination.budget.medium > 0 ? formatPrice(destination.budget.medium) : 'Linh hoạt'}
                      </p>
                    </div>
                  </div>
                  {destination.bestTime.length > 0 && (
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-5 h-5 text-purple-600" />
                      <div>
                        <p className="font-medium">Thời điểm tốt nhất</p>
                        <p className="text-gray-600">{destination.bestTime[0]}</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Highlights */}
            {destination.highlights.length > 0 && (
              <Card>
                <CardContent className="pt-6">
                  <h2 className="text-2xl font-bold mb-4">Điểm nổi bật</h2>
                  <div className="grid md:grid-cols-2 gap-3">
                    {destination.highlights.map((item, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <span className="text-blue-600 mt-1 flex-shrink-0">✓</span>
                        <span className="text-gray-700 break-words overflow-hidden">{item}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Activities */}
            {destination.activities.length > 0 && (
              <Card>
                <CardContent className="pt-6">
                  <h2 className="text-2xl font-bold mb-4">Hoạt động</h2>
                  <div className="flex flex-wrap gap-2">
                    {destination.activities.map((item, idx) => (
                      <Badge key={idx} variant="outline" className="px-3 py-1 whitespace-normal break-words max-w-full">
                        {item}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Specialties */}
            {destination.specialties.length > 0 && (
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Utensils className="w-6 h-6 text-orange-600" />
                    <h2 className="text-2xl font-bold">Đặc sản</h2>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {destination.specialties.map((item, idx) => (
                      <Badge key={idx} className="bg-orange-100 text-orange-800 px-3 py-1 whitespace-normal break-words max-w-full">
                        {item}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Tips */}
            {destination.tips.length > 0 && (
              <Card>
                <CardContent className="pt-6">
                  <h2 className="text-2xl font-bold mb-4">💡 Lời khuyên</h2>
                  <ul className="space-y-2">
                    {destination.tips.map((tip, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-blue-600 mt-1 flex-shrink-0">•</span>
                        <span className="text-gray-700 break-words overflow-hidden">{tip}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Warnings */}
            {destination.warnings.length > 0 && (
              <Card className="border-yellow-200 bg-yellow-50">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-4">
                    <AlertTriangle className="w-6 h-6 text-yellow-600" />
                    <h2 className="text-2xl font-bold text-yellow-900">Lưu ý</h2>
                  </div>
                  <ul className="space-y-2">
                    {destination.warnings.map((warning, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-yellow-600 mt-1 flex-shrink-0">⚠</span>
                        <span className="text-yellow-900 break-words overflow-hidden">{warning}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <FavoriteButton
                      destinationId={destination._id}
                      initialFavorited={isFavorited}
                      className="flex-1"
                    />
                    <Button 
                      onClick={() => router.push(`/ai-planner?destination=${destination._id}`)}
                      className="flex-1 bg-blue-600"
                    >
                      <Calendar className="mr-2 w-4 h-4" />
                      Lên kế hoạch
                    </Button>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => shareDestination({
                      name: destination.name,
                      description: destination.description,
                      id: destination._id
                    })}
                  >
                    <Share2 className="mr-2 w-4 h-4" />
                    Chia sẻ
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Transportation */}
            {destination.transportation && Object.keys(destination.transportation).length > 0 && (
              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-bold mb-4">🚗 Phương tiện di chuyển</h3>
                  <div className="space-y-3 text-sm">
                    {destination.transportation.train && (
                      <div className="flex items-start gap-2">
                        <Train className="w-4 h-4 mt-1 text-gray-600 flex-shrink-0" />
                        <div className="overflow-hidden">
                          <p className="font-medium break-words">Tàu hỏa</p>
                          <p className="text-gray-600 break-words">{destination.transportation.train.info}</p>
                          <p className="text-gray-600 break-words">{destination.transportation.train.cost}</p>
                        </div>
                      </div>
                    )}
                    {destination.transportation.bus && (
                      <div className="flex items-start gap-2">
                        <Bus className="w-4 h-4 mt-1 text-gray-600 flex-shrink-0" />
                        <div className="overflow-hidden">
                          <p className="font-medium break-words">Xe khách</p>
                          <p className="text-gray-600 break-words">{destination.transportation.bus.info}</p>
                          <p className="text-gray-600 break-words">{destination.transportation.bus.cost}</p>
                        </div>
                      </div>
                    )}
                    {destination.transportation.flight && (
                      <div className="flex items-start gap-2">
                        <Plane className="w-4 h-4 mt-1 text-gray-600 flex-shrink-0" />
                        <div className="overflow-hidden">
                          <p className="font-medium break-words">Máy bay</p>
                          <p className="text-gray-600 break-words">{destination.transportation.flight.info}</p>
                          <p className="text-gray-600 break-words">{destination.transportation.flight.cost}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Accommodation */}
            {destination.accommodation && Object.keys(destination.accommodation).length > 0 && (
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Home className="w-5 h-5 text-gray-600 flex-shrink-0" />
                    <h3 className="font-bold">Chỗ ở</h3>
                  </div>
                  <div className="space-y-2 text-sm">
                    {destination.accommodation.hostel && (
                      <div className="overflow-hidden">
                        <p className="font-medium break-words">Nhà nghỉ</p>
                        <p className="text-gray-600 break-words">{destination.accommodation.hostel}</p>
                      </div>
                    )}
                    {destination.accommodation.hotel && (
                      <div className="overflow-hidden">
                        <p className="font-medium break-words">Khách sạn</p>
                        <p className="text-gray-600 break-words">{destination.accommodation.hotel}</p>
                      </div>
                    )}
                    {destination.accommodation.resort && (
                      <div className="overflow-hidden">
                        <p className="font-medium break-words">Resort</p>
                        <p className="text-gray-600 break-words">{destination.accommodation.resort}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* AR360 Virtual Tour Section - FREE with OpenStreetMap */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6">🗺️ Bản đồ & Virtual Tour</h2>
          <AR360Switcher
            lat={destination.coordinates.lat}
            lng={destination.coordinates.lng}
            destinationName={destination.name}
            panoramaImages={destination.panoramaImages || []}
            panoramaHotspots={destination.panoramaHotspots || []}
            youtubeVideos={destination.youtubeVideos || []}
            streetViewSpots={normalizedStreetViewSpots}
            streetViewLocations={destination.streetViewLocations || []}
          />
        </div>

        {/* Reviews Section */}
        <div className="mt-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Đánh giá từ du khách</h2>
            <Button onClick={() => setShowReviewForm(!showReviewForm)}>
              {showReviewForm ? 'Hủy' : 'Viết đánh giá'}
            </Button>
          </div>

          {showReviewForm && (
            <div className="mb-8">
              <ReviewForm
                destinationId={destination._id}
                destinationName={destination.name}
                onSuccess={() => {
                  setShowReviewForm(false);
                  // Force refresh review list by changing key (no page reload needed)
                  setReviewListKey(prev => prev + 1);
                  // Also refetch destination to update review count and rating
                  fetchDestination();
                  // Show success notification
                  toast.success('Đánh giá của bạn đã được gửi và đang chờ duyệt!');
                }}
                onCancel={() => setShowReviewForm(false)}
              />
            </div>
          )}

          <ReviewList key={reviewListKey} destinationId={destination._id} />
        </div>

        {/* Image Gallery */}
        {destination.images.length > 1 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6">Hình ảnh</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {destination.images.slice(1).map((img, idx) => (
                <div key={idx} className="relative aspect-square rounded-lg overflow-hidden">
                  <SafeImage
                    src={img}
                    alt={`${destination.name} ${idx + 2}`}
                    fill
                    className="object-cover hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Similar Destinations */}
        <div className="mt-16">
          <SimilarDestinations destinationId={destination._id} limit={6} />
        </div>
      </div>
    </div>
  );
}

