'use client';

/**
 * Enhanced Explore Destinations Page
 * With Advanced Search & Filters
 */

import type { Metadata } from "next";
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import SafeImage from '@/components/common/SafeImage';
import SearchBar from '@/components/search/SearchBar';
import AdvancedFilters from '@/components/search/AdvancedFilters';
import { 
  MapPin, 
  Star,
  Clock,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  Loader2
} from 'lucide-react';
import Link from 'next/link';
import { motion } from "framer-motion";
import { trackDestinationClick } from '@/lib/utils/trackDestinationView';
import { trackSearchPerformed, trackDestinationClicked as trackDestinationClickedPostHog, trackFilterApplied, trackFilterCleared } from '@/lib/analytics';

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
  tags?: string[];
}

interface FilterValues {
  region: string;
  type: string;
  minBudget: number;
  maxBudget: number;
  minRating: number;
  duration: string;
  sort: string;
}

const DEFAULT_FILTERS: FilterValues = {
  region: '',
  type: '',
  minBudget: 0,
  maxBudget: 999999999,
  minRating: 0,
  duration: '',
  sort: 'popularity',
};

export default function ExplorePage() {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<FilterValues>(DEFAULT_FILTERS);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  });

  useEffect(() => {
    fetchDestinations();
  }, [page, query, filters]);

  const fetchDestinations = async () => {
    setLoading(true);
    setError('');
    
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '12',
        ...(query && { q: query }),
        ...(filters.region && { region: filters.region }),
        ...(filters.type && { type: filters.type }),
        ...(filters.minBudget > 0 && { minBudget: filters.minBudget.toString() }),
        ...(filters.maxBudget < 999999999 && { maxBudget: filters.maxBudget.toString() }),
        ...(filters.minRating > 0 && { minRating: filters.minRating.toString() }),
        ...(filters.duration && { duration: filters.duration }),
        ...(filters.sort && { sort: filters.sort }),
      });

      const res = await fetch(`/api/search?${params}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Không thể tải danh sách điểm đến');
      }

      setDestinations(data.data.destinations);
      setPagination(data.data.pagination);
    } catch (err: any) {
      console.error('Fetch error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (searchQuery: string) => {
    setQuery(searchQuery);
    setPage(1); // Reset to first page on new search
    
    // Track search with PostHog
    if (searchQuery) {
      trackSearchPerformed({
        query: searchQuery,
        filters: filters,
        source: 'explore_page',
      });
    }
  };

  const handleFiltersChange = (newFilters: FilterValues) => {
    setFilters(newFilters);
    setPage(1); // Reset to first page on filter change
    
    // Track filter application with PostHog
    const filterKeys = Object.keys(newFilters).filter(key => {
      const value = newFilters[key as keyof FilterValues];
      return value !== '' && value !== 'all';
    });
    
    if (filterKeys.length > 0) {
      filterKeys.forEach(key => {
        trackFilterApplied({
          filterType: key,
          filterValue: newFilters[key as keyof FilterValues],
          resultsCount: destinations.length,
        });
      });
    }
  };

  const handleResetFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setPage(1);
    
    // Track filter reset with PostHog
    trackFilterCleared();
  };

  const formatBudget = (budget: any) => {
    if (budget.medium > 0) {
      return `${(budget.medium / 1000000).toFixed(1)}tr VNĐ`;
    }
    if (budget.low > 0) {
      return `Từ ${(budget.low / 1000000).toFixed(1)}tr VNĐ`;
    }
    return 'Liên hệ';
  };

  const getRegionBadgeColor = (region: string) => {
    switch (region) {
      case 'Bắc Bộ': return 'bg-blue-600 text-white';
      case 'Trung Bộ': return 'bg-green-600 text-white';
      case 'Nam Bộ': return 'bg-orange-600 text-white';
      default: return 'bg-gray-600 text-white';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Visual Header Section */}
      <section className="relative py-10 px-6 overflow-hidden bg-muted/30 border-b border-border/50">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5" />
        <div className="container mx-auto relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20 px-3 py-1.5 text-xs hover:bg-primary/20 transition-colors">
              <MapPin className="w-3.5 h-3.5 mr-1.5" />
              Khám phá Việt Nam
            </Badge>
            <h1 className="text-3xl md:text-4xl font-black text-foreground mb-4 tracking-tighter">
              <span className="gradient-text-animated">Tìm Kiếm</span> Điểm Đến
            </h1>
            <p className="text-muted-foreground text-base max-w-xl mx-auto font-medium leading-relaxed">
              {pagination.total} địa danh tuyệt đẹp đang chờ bạn khám phá. Lên kế hoạch cho hành trình của bạn ngay hôm nay.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="container mx-auto px-4 max-w-7xl py-8">

        {/* Search Bar */}
        <div className="mb-6 max-w-2xl mx-auto">
          <SearchBar
            defaultValue={query}
            onSearch={handleSearch}
            placeholder="Tìm kiếm điểm đến, tỉnh thành..."
          />
        </div>

        {/* Advanced Filters */}
        <div className="mb-8">
          <AdvancedFilters
            filters={filters}
            onChange={handleFiltersChange}
            onReset={handleResetFilters}
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg mb-6 shadow-sm">
            <p className="font-medium">Lỗi: {error}</p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">Đang tìm kiếm...</span>
          </div>
        )}

        {/* Destinations Grid */}
        {!loading && destinations.length > 0 && (
          <>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
              {destinations.map((destination) => (
                <Link
                  key={destination._id}
                  href={`/destinations/${destination._id}?source=explore`}
                  onClick={() => {
                    trackDestinationClick(destination._id, query, 'explore');
                    trackDestinationClickedPostHog({
                      destinationId: destination._id,
                      destinationName: destination.name,
                      destinationType: destination.type,
                      destinationRegion: destination.region,
                      source: 'explore',
                      position: destinations.indexOf(destination) + 1,
                    });
                  }}
                >
                  <Card className="card-premium-hover overflow-hidden h-full group cursor-pointer border-border/50 bg-card/50 backdrop-blur-sm">
                    {/* Image */}
                    <div className="relative h-56 bg-muted overflow-hidden">
                      {destination.images[0] ? (
                        <SafeImage
                          src={destination.images[0]}
                          alt={destination.name}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
                          <MapPin className="w-12 h-12 text-primary/40" />
                        </div>
                      )}
                      
                      {/* Gradient Overlay on Hover */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      
                      {/* Region Badge */}
                      <Badge className={`absolute top-3 right-3 text-[10px] px-2 py-0.5 ${getRegionBadgeColor(destination.region)} shadow-lg backdrop-blur-sm`}>
                        {destination.region}
                      </Badge>
                    </div>

                    {/* Content */}
                    <CardHeader className="pb-2 px-4 pt-4">
                      <CardTitle className="text-lg font-bold line-clamp-1 group-hover:text-primary transition-colors duration-300 tracking-tight">
                        {destination.name}
                      </CardTitle>
                      <div className="flex items-center gap-2 text-muted-foreground font-medium">
                        <MapPin className="w-4 h-4 text-primary opacity-70 group-hover:opacity-100 transition-opacity" />
                        <span>{destination.province}</span>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-3 px-4 pb-4">
                      {/* Description */}
                      <p className="text-muted-foreground text-[13px] line-clamp-2 leading-snug">
                        {destination.description}
                      </p>

                      {/* Meta Info */}
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        <Badge variant="outline" className="gap-1 bg-background/50 border-border/50 font-medium px-2 py-0.5 text-[10px]">
                          {destination.type}
                        </Badge>
                        <Badge variant="outline" className="gap-1 bg-background/50 border-border/50 font-medium px-2 py-0.5 text-[10px]">
                          <Clock className="w-3 h-3 text-primary/70" />
                          {destination.duration}
                        </Badge>
                        <Badge variant="outline" className="gap-1 bg-background/50 border-border/50 font-medium px-2 py-0.5 text-[10px]">
                          <DollarSign className="w-3 h-3 text-emerald-500/80" />
                          {formatBudget(destination.budget)}
                        </Badge>
                      </div>

                      {/* Rating */}
                      <div className="flex items-center justify-between pt-2 border-t border-border/50">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center">
                            <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                            <span className="font-semibold ml-1 text-foreground text-xs">
                              {destination.rating.toFixed(1)}
                            </span>
                          </div>
                          <span className="text-muted-foreground text-[11px]">
                            ({destination.reviewCount} đánh giá)
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-4">
                <Button
                  variant="outline"
                  onClick={() => setPage(page - 1)}
                  disabled={!pagination.hasPrev || loading}
                  className="gap-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Trước
                </Button>

                <div className="flex items-center gap-2">
                  {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                    const pageNum = i + 1;
                    return (
                      <Button
                        key={pageNum}
                        variant={page === pageNum ? 'default' : 'outline'}
                        onClick={() => setPage(pageNum)}
                        disabled={loading}
                        size="sm"
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                  {pagination.totalPages > 5 && (
                    <>
                      <span className="text-gray-500">...</span>
                      <Button
                        variant={page === pagination.totalPages ? 'default' : 'outline'}
                        onClick={() => setPage(pagination.totalPages)}
                        disabled={loading}
                        size="sm"
                      >
                        {pagination.totalPages}
                      </Button>
                    </>
                  )}
                </div>

                <Button
                  variant="outline"
                  onClick={() => setPage(page + 1)}
                  disabled={!pagination.hasNext || loading}
                  className="gap-2"
                >
                  Sau
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </>
        )}

        {/* No Results */}
        {!loading && destinations.length === 0 && !error && (
          <div className="text-center py-20 fade-in-up">
            <div className="relative w-28 h-28 mx-auto mb-8">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/10 to-primary/5 rounded-full blur-xl" />
              <div className="relative w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 dark:from-primary/30 dark:to-primary/10 rounded-full flex items-center justify-center border border-primary/20 float-animation">
                <MapPin className="w-14 h-14 text-primary" />
              </div>
            </div>
            <h3 className="text-3xl font-bold text-foreground mb-3 tracking-tight">
              Không tìm thấy kết quả
            </h3>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto text-lg leading-relaxed">
              Thử điều chỉnh bộ lọc hoặc tìm kiếm với từ khóa khác
            </p>
            <Button onClick={handleResetFilters} variant="outline" size="lg">
              Xóa bộ lọc
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
