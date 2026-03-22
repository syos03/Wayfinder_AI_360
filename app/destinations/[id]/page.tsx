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

function DestinationDetailContent({ params }: { params: Promise<{ id: string }> }) {
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
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
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
    <div className="min-h-screen bg-background">
      {/* Hero Image */}
      {destination.images.length > 0 && (
        <div className="relative h-48 md:h-56 bg-gray-900 shadow-2xl overflow-hidden">
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
          <div className="absolute top-4 left-4 z-20">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => router.push('/explore')}
              className="bg-background/20 backdrop-blur-md border-white/20 text-white hover:bg-white/20 transition-all"
            >
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
                <Badge variant="outline" className="bg-white/20 text-white border-white/40 backdrop-blur-md">
                  {destination.type}
                </Badge>
              </div>
              <h1 className="text-2xl md:text-3xl font-black mb-1.5 tracking-tight drop-shadow-lg">{destination.name}</h1>
              {destination.nameEn && (
                <p className="text-base text-gray-200/90 font-medium drop-shadow-md">{destination.nameEn}</p>
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
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Overview */}
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-xl shadow-primary/5">
              <CardContent className="pt-4 px-4 pb-4">
                <h2 className="text-lg font-black mb-3 tracking-tight gradient-text-animated inline-block">Tổng quan</h2>
                <p className="text-foreground/80 text-sm leading-relaxed break-words overflow-hidden font-medium">
                  {destination.description}
                </p>
                
                <div className="grid grid-cols-3 gap-3 mt-6 p-4 rounded-lg bg-muted/20 border border-border/50">
                  <div className="flex items-center gap-2 text-xs group">
                    <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                      <Clock className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <p className="text-muted-foreground text-[9px] uppercase tracking-tighter font-bold">Thời gian</p>
                      <p className="text-foreground font-bold leading-none">{destination.duration}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs group">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform">
                      <DollarSign className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <p className="text-muted-foreground text-[9px] uppercase tracking-tighter font-bold">Ngân sách</p>
                      <p className="text-foreground font-bold leading-none">
                        {destination.budget.medium > 0 ? formatPrice(destination.budget.medium) : 'Linh hoạt'}
                      </p>
                    </div>
                  </div>
                  {destination.bestTime.length > 0 && (
                    <div className="flex items-center gap-2 text-xs group">
                      <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500 group-hover:scale-110 transition-transform">
                        <Calendar className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <p className="text-muted-foreground text-[9px] uppercase tracking-tighter font-bold">Thời điểm</p>
                        <p className="text-foreground font-bold leading-none">{destination.bestTime[0]}</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Highlights */}
            {destination.highlights.length > 0 && (
              <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                <CardContent className="pt-4 px-4 pb-4">
                  <h2 className="text-base font-bold mb-3 flex items-center gap-2">
                    <div className="w-1 h-5 bg-primary rounded-full" />
                    Điểm nổi bật
                  </h2>
                  <div className="grid md:grid-cols-2 gap-x-4 gap-y-1">
                    {destination.highlights.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2 p-1.5 rounded hover:bg-muted/50 transition-colors group">
                        <span className="text-primary flex-shrink-0 bg-primary/10 w-4 h-4 rounded-full flex items-center justify-center text-[8px]">✓</span>
                        <span className="text-foreground/90 font-medium text-xs truncate">{item}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Activities */}
            {destination.activities.length > 0 && (
              <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                <CardContent className="pt-4 px-4 pb-4">
                  <h2 className="text-base font-bold mb-3 flex items-center gap-2">
                    <div className="w-1 h-5 bg-blue-500 rounded-full" />
                    Hoạt động
                  </h2>
                  <div className="flex flex-wrap gap-1.5">
                    {destination.activities.map((item, idx) => (
                      <Badge key={idx} className="px-2 py-1 text-[10px] font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                        {item}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Specialties */}
            {destination.specialties.length > 0 && (
              <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                <CardContent className="pt-4 px-4 pb-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Utensils className="w-4 h-4 text-orange-500" />
                    <h2 className="text-base font-bold">Đặc sản</h2>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {destination.specialties.map((item, idx) => (
                      <Badge key={idx} className="bg-orange-500/5 text-orange-600 dark:text-orange-400 border border-orange-500/10 px-2 py-1 text-[10px] font-bold">
                        {item}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Tips */}
            {destination.tips.length > 0 && (
              <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                <CardContent className="pt-6 px-6">
                  <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
                    <div className="w-1 h-5 bg-emerald-500 rounded-full" />
                    💡 Lời khuyên hữu ích
                  </h2>
                  <ul className="space-y-3">
                    {destination.tips.map((tip, idx) => (
                      <li key={idx} className="flex items-start gap-3 group">
                        <span className="text-emerald-500 mt-1 flex-shrink-0 bg-emerald-500/10 w-5 h-5 rounded-full flex items-center justify-center text-[10px] group-hover:scale-110 transition-transform">•</span>
                        <span className="text-foreground/80 font-medium break-words overflow-hidden leading-relaxed text-sm">{tip}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Warnings */}
            {destination.warnings.length > 0 && (
              <Card className="border-amber-500/20 bg-amber-500/5 backdrop-blur-md">
                <CardContent className="pt-6 px-6">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400">
                      <AlertTriangle className="w-4 h-4" />
                    </div>
                    <h2 className="text-lg font-bold text-amber-900 dark:text-amber-400">Lưu ý quan trọng</h2>
                  </div>
                  <ul className="space-y-3">
                    {destination.warnings.map((warning, idx) => (
                      <li key={idx} className="flex items-start gap-3 p-2.5 rounded-lg bg-amber-500/5 border border-amber-500/10">
                        <span className="text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0 text-sm">⚠</span>
                        <span className="text-amber-900/80 dark:text-amber-200/80 font-bold break-words overflow-hidden leading-relaxed text-sm">{warning}</span>
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
            <Card className="border-border/50 bg-card/80 backdrop-blur-md shadow-2xl">
              <CardContent className="p-3 pb-3">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <FavoriteButton
                      destinationId={destination._id}
                      initialFavorited={isFavorited}
                      className="flex-1 h-9 text-xs font-bold"
                    />
                    <Button 
                      onClick={() => router.push(`/ai-planner?destination=${destination._id}`)}
                      className="flex-1 h-9 text-xs font-bold btn-gradient"
                    >
                      <Calendar className="mr-1.5 w-3.5 h-3.5" />
                      Lên kế hoạch
                    </Button>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full h-9 text-xs font-medium border"
                    onClick={() => shareDestination({
                      name: destination.name,
                      description: destination.description,
                      id: destination._id
                    })}
                  >
                    <Share2 className="mr-1.5 w-3.5 h-3.5 text-primary" />
                    Chia sẻ
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Transportation */}
            {destination.transportation && Object.keys(destination.transportation).length > 0 && (
              <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                <CardContent className="p-4">
                  <h3 className="font-bold text-base mb-4 flex items-center gap-2 tracking-tight">
                    <Train className="w-4 h-4 text-primary" />
                    Di chuyển
                  </h3>
                  <div className="space-y-4">
                    {destination.transportation.train && (
                      <div className="flex items-start gap-3 group">
                        <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                          <Train className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
                        </div>
                        <div className="overflow-hidden">
                          <p className="font-bold text-sm truncate">Tàu hỏa</p>
                          <p className="text-muted-foreground text-[11px] leading-snug">{destination.transportation.train.info}</p>
                          <p className="text-primary font-bold text-xs mt-0.5">{destination.transportation.train.cost}</p>
                        </div>
                      </div>
                    )}
                    {destination.transportation.bus && (
                      <div className="flex items-start gap-3 group">
                        <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                          <Bus className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
                        </div>
                        <div className="overflow-hidden">
                          <p className="font-bold text-sm truncate">Xe khách</p>
                          <p className="text-muted-foreground text-[11px] leading-snug">{destination.transportation.bus.info}</p>
                          <p className="text-primary font-bold text-xs mt-0.5">{destination.transportation.bus.cost}</p>
                        </div>
                      </div>
                    )}
                    {destination.transportation.flight && (
                      <div className="flex items-start gap-3 group">
                        <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                          <Plane className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
                        </div>
                        <div className="overflow-hidden">
                          <p className="font-bold text-sm truncate">Máy bay</p>
                          <p className="text-muted-foreground text-[11px] leading-snug">{destination.transportation.flight.info}</p>
                          <p className="text-primary font-bold text-xs mt-0.5">{destination.transportation.flight.cost}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Accommodation */}
            {destination.accommodation && Object.keys(destination.accommodation).length > 0 && (
              <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                <CardContent className="pt-6 px-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Home className="w-5 h-5 text-primary flex-shrink-0" />
                    <h3 className="font-bold text-lg tracking-tight">Chỗ ở</h3>
                  </div>
                  <div className="space-y-3">
                    {destination.accommodation.hostel && (
                      <div className="p-3 rounded-lg bg-muted/50 border border-border/50 hover:bg-muted transition-colors">
                        <p className="font-bold text-foreground text-xs uppercase tracking-wider mb-1">Nhà nghỉ</p>
                        <p className="text-muted-foreground text-sm leading-relaxed">{destination.accommodation.hostel}</p>
                      </div>
                    )}
                    {destination.accommodation.hotel && (
                      <div className="p-3 rounded-lg bg-muted/50 border border-border/50 hover:bg-muted transition-colors">
                        <p className="font-bold text-foreground text-xs uppercase tracking-wider mb-1">Khách sạn</p>
                        <p className="text-muted-foreground text-sm leading-relaxed">{destination.accommodation.hotel}</p>
                      </div>
                    )}
                    {destination.accommodation.resort && (
                      <div className="p-3 rounded-lg bg-muted/50 border border-border/50 hover:bg-muted transition-colors">
                        <p className="font-bold text-foreground text-xs uppercase tracking-wider mb-1">Resort / Villa</p>
                        <p className="text-muted-foreground text-sm leading-relaxed">{destination.accommodation.resort}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* AR360 Virtual Tour Section - FREE with OpenStreetMap */}
        <div className="mt-8 bg-card/30 backdrop-blur-md rounded-xl p-4 border border-border/50">
          <h2 className="text-lg font-black mb-4 flex items-center gap-2 tracking-tight">
            <Map className="w-6 h-6 text-primary" />
            Bản đồ & Virtual Tour 360°
          </h2>
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
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-black tracking-tight">Đánh giá từ du khách</h2>
            <Button 
              onClick={() => setShowReviewForm(!showReviewForm)}
              variant={showReviewForm ? "ghost" : "default"}
              size="sm"
              className="rounded-full px-4"
            >
              {showReviewForm ? 'Hủy bỏ' : 'Viết đánh giá'}
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

import { Suspense } from 'react';

export default function DestinationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    }>
      <DestinationDetailContent params={params} />
    </Suspense>
  );
}

