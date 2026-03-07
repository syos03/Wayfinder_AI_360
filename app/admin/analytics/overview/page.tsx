'use client';

/**
 * Admin Analytics Overview Page
 * Simplified and organized analytics dashboard
 */

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Users,
  MapPin,
  Star,
  TrendingUp,
  Eye,
  Search,
  MousePointerClick,
  ArrowUp,
  Download,
} from 'lucide-react';
import { LineChart } from '@/components/admin/charts/LineChart';
import {
  exportKPIsToCSV,
  exportTopDestinationsToCSV,
  exportAllAnalyticsToJSON,
} from '@/lib/utils/export';

interface KPIs {
  users: {
    total: number;
    dau: number;
    wau: number;
    mau: number;
    stickiness: number;
    newLast7Days: number;
    growthRate: number;
  };
  destinations: {
    total: number;
    active: number;
  };
  reviews: {
    total: number;
    last7Days: number;
    averageRating: number;
    growthRate: number;
  };
  engagement: {
    totalViews: number;
    viewsLast7Days: number;
    totalSearches: number;
    searchesLast7Days: number;
    totalClicks: number;
    ctr: number;
  };
}

export default function AnalyticsOverviewPage() {
  const [kpis, setKpis] = useState<KPIs | null>(null);
  const [growthData, setGrowthData] = useState<any>(null);
  const [topDestinations, setTopDestinations] = useState<any[]>([]);
  const [popularSearches, setPopularSearches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('30d');

  useEffect(() => {
    fetchData();
  }, [period]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch only essential data
      const [kpisRes, growthRes, topRes, searchesRes] = await Promise.all([
        fetch('/api/analytics/kpis'),
        fetch(`/api/analytics/user-growth?period=${period}`),
        fetch('/api/analytics/top-destinations?sortBy=views&limit=5'),
        fetch(`/api/analytics/popular-searches?limit=5&period=${period}`),
      ]);

      const [kpisData, growthData, topData, searchesData] = await Promise.all([
        kpisRes.json(),
        growthRes.json(),
        topRes.json(),
        searchesRes.json(),
      ]);

      if (kpisData.success) setKpis(kpisData.data);
      if (growthData.success) setGrowthData(growthData.data);
      if (topData.success) setTopDestinations(topData.data.destinations);
      if (searchesData.success) setPopularSearches(searchesData.data.searches);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportAll = () => {
    const allData = {
      kpis,
      growthData,
      topDestinations,
      popularSearches,
      exportedAt: new Date().toISOString(),
      period,
    };
    exportAllAnalyticsToJSON(allData);
  };

  if (loading || !kpis) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">📊 Tổng Quan Phân Tích</h1>
          <p className="text-gray-600">Các chỉ số quan trọng và xu hướng chính</p>
        </div>
        <Button variant="outline" size="sm" onClick={handleExportAll}>
          <Download className="h-4 w-4 mr-2" />
          Xuất Dữ Liệu
        </Button>
      </div>

      {/* Section 1: Key Metrics - 4 Main KPIs */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        {/* Total Users */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng Người Dùng</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis.users.total.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              +{kpis.users.newLast7Days} trong 7 ngày qua
            </p>
            {kpis.users.growthRate > 0 && (
              <Badge variant="default" className="mt-2">
                <ArrowUp className="h-3 w-3 mr-1" />
                Tăng {kpis.users.growthRate}%
              </Badge>
            )}
          </CardContent>
        </Card>

        {/* Active Destinations */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Điểm Đến</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis.destinations.active}</div>
            <p className="text-xs text-muted-foreground mt-1">
              / {kpis.destinations.total} tổng cộng
            </p>
            <Badge variant="secondary" className="mt-2">
              Đang hoạt động
            </Badge>
          </CardContent>
        </Card>

        {/* Total Reviews */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đánh Giá</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis.reviews.total.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              ⭐ {kpis.reviews.averageRating.toFixed(1)} / 5.0 trung bình
            </p>
            {kpis.reviews.growthRate > 0 && (
              <Badge variant="default" className="mt-2">
                <ArrowUp className="h-3 w-3 mr-1" />
                Tăng {kpis.reviews.growthRate}%
              </Badge>
            )}
          </CardContent>
        </Card>

        {/* Engagement CTR */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tỷ Lệ Tương Tác</CardTitle>
            <MousePointerClick className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis.engagement.ctr}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              {kpis.engagement.totalClicks.toLocaleString()} nhấp / {kpis.engagement.totalViews.toLocaleString()} lượt xem
            </p>
            <Badge variant="secondary" className="mt-2">
              CTR
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Section 2: Growth Trends */}
      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>📈 Xu Hướng Tăng Trưởng</CardTitle>
            <div className="flex gap-2">
              <Button
                variant={period === '7d' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPeriod('7d')}
              >
                7 Ngày
              </Button>
              <Button
                variant={period === '30d' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPeriod('30d')}
              >
                30 Ngày
              </Button>
              <Button
                variant={period === '90d' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPeriod('90d')}
              >
                90 Ngày
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {growthData && (
            <LineChart
              data={growthData.users.map((user: any, index: number) => ({
                date: user.date,
                'Người dùng mới': user.count,
                'Đánh giá mới': growthData.reviews[index]?.count || 0,
              }))}
              dataKeys={[
                { key: 'Người dùng mới', color: '#3b82f6', name: 'Người dùng mới' },
                { key: 'Đánh giá mới', color: '#10b981', name: 'Đánh giá mới' },
              ]}
              xKey="date"
              height={300}
            />
          )}
        </CardContent>
      </Card>

      {/* Section 3: Top Content */}
      <div className="grid gap-6 md:grid-cols-2 mb-8">
        {/* Top Destinations */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>🔥 Top 5 Điểm Đến</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => exportTopDestinationsToCSV(topDestinations)}
              >
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topDestinations.map((dest, index) => (
                <div key={dest.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="text-xl font-bold text-gray-400 w-8">#{index + 1}</div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold truncate">{dest.name}</div>
                    <div className="text-sm text-gray-600 truncate">
                      {dest.province} • {dest.type}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-blue-600">{dest.views.toLocaleString()}</div>
                    <div className="text-xs text-gray-500">lượt xem</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Popular Searches */}
        <Card>
          <CardHeader>
            <CardTitle>🔍 Từ Khóa Tìm Kiếm</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {popularSearches.map((search, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="text-lg font-bold text-gray-400 w-8">#{search.rank}</div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold truncate">{search.term}</div>
                    <div className="text-sm text-gray-600">
                      {search.searches} lượt tìm
                    </div>
                  </div>
                  <Badge variant={parseFloat(search.ctr) > 10 ? 'default' : 'secondary'}>
                    {search.ctr}%
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Section 4: Engagement Details */}
      <div className="grid gap-6 md:grid-cols-3 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4" />
              Người Dùng
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Hôm nay</span>
                <span className="font-semibold">{kpis.users.dau}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Tuần này</span>
                <span className="font-semibold">{kpis.users.wau}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Tháng này</span>
                <span className="font-semibold">{kpis.users.mau}</span>
              </div>
              <div className="pt-2 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Độ gắn kết</span>
                  <Badge variant="secondary">{kpis.users.stickiness}%</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Lượt Xem
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Tổng cộng</span>
                <span className="font-semibold">{kpis.engagement.totalViews.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">7 ngày qua</span>
                <span className="font-semibold">{kpis.engagement.viewsLast7Days.toLocaleString()}</span>
              </div>
              <div className="pt-2 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Tỷ lệ nhấp</span>
                  <Badge variant="default">{kpis.engagement.ctr}%</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Search className="h-4 w-4" />
              Tìm Kiếm
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Tổng cộng</span>
                <span className="font-semibold">{kpis.engagement.totalSearches.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">7 ngày qua</span>
                <span className="font-semibold">{kpis.engagement.searchesLast7Days.toLocaleString()}</span>
              </div>
              <div className="pt-2 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Đánh giá 7 ngày</span>
                  <span className="font-semibold">{kpis.reviews.last7Days}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
