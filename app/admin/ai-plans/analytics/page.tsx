'use client';

/**
 * Admin AI Plans Analytics Dashboard
 * Comprehensive analytics for AI trip planner
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  TrendingUp,
  Users,
  Sparkles,
  DollarSign,
  Calendar,
  Download,
  RefreshCw,
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import UsageChart from '@/components/admin/ai-plans/UsageChart';
import DestinationsChart from '@/components/admin/ai-plans/DestinationsChart';
import TrendsCharts from '@/components/admin/ai-plans/TrendsCharts';

export default function AIPlansAnalyticsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('30days');

  // Data states
  const [stats, setStats] = useState<any>(null);
  const [usageData, setUsageData] = useState<any>(null);
  const [destinationsData, setDestinationsData] = useState<any>(null);
  const [trendsData, setTrendsData] = useState<any>(null);

  useEffect(() => {
    fetchAllData();
  }, [period]);

  const fetchAllData = async () => {
    try {
      setLoading(true);

      // Fetch all analytics data in parallel
      const [statsRes, usageRes, destinationsRes, trendsRes] = await Promise.all([
        fetch('/api/admin/ai-plans/stats', { credentials: 'include' }),
        fetch(`/api/admin/ai-plans/analytics/usage?period=${period}`, { credentials: 'include' }),
        fetch('/api/admin/ai-plans/analytics/destinations', { credentials: 'include' }),
        fetch('/api/admin/ai-plans/analytics/trends', { credentials: 'include' }),
      ]);

      if (!statsRes.ok || !usageRes.ok || !destinationsRes.ok || !trendsRes.ok) {
        if (statsRes.status === 401 || statsRes.status === 403) {
          router.push('/login');
          return;
        }
        throw new Error('Failed to fetch analytics');
      }

      const [statsData, usageDataRes, destinationsDataRes, trendsDataRes] = await Promise.all([
        statsRes.json(),
        usageRes.json(),
        destinationsRes.json(),
        trendsRes.json(),
      ]);

      setStats(statsData.data);
      setUsageData(usageDataRes.data);
      setDestinationsData(destinationsDataRes.data);
      setTrendsData(trendsDataRes.data);
    } catch (error: any) {
      toast.error(error.message || 'Không thể tải analytics');
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    if (!stats) return;

    // Create CSV content
    const headers = ['Metric', 'Value'];
    const rows = [
      ['Total Plans', stats.overview.totalPlans],
      ['Plans Today', stats.overview.plansToday],
      ['Plans Last 7 Days', stats.overview.plansLast7Days],
      ['Plans Last 30 Days', stats.overview.plansLast30Days],
      ['Unique Users', stats.overview.uniqueUsers],
      ['Average Days', stats.averages.avgDays?.toFixed(1) || 0],
      ['Average Budget (VNĐ)', stats.averages.avgBudget?.toFixed(0) || 0],
      ['Average Travelers', stats.averages.avgTravelers?.toFixed(1) || 0],
    ];

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-plans-analytics-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();

    toast.success('Đã export dữ liệu!');
  };

  const exportToJSON = () => {
    const data = {
      stats,
      usageData,
      destinationsData,
      trendsData,
      exportedAt: new Date().toISOString(),
    };

    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-plans-analytics-${new Date().toISOString().split('T')[0]}.json`;
    a.click();

    toast.success('Đã export dữ liệu!');
  };

  if (loading && !stats) {
    return (
      <div className="container mx-auto px-6 py-12">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-12">
      {/* Header */}
      <div className="mb-8">
        <Button variant="outline" asChild className="mb-4">
          <Link href="/admin/ai-plans">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại danh sách
          </Link>
        </Button>

        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-8 h-8 text-blue-600" />
              <h1 className="text-3xl font-bold">AI Planner Analytics</h1>
            </div>
            <p className="text-gray-600">Thống kê và phân tích chi tiết</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={fetchAllData} disabled={loading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button variant="outline" onClick={exportToCSV}>
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
            <Button variant="outline" onClick={exportToJSON}>
              <Download className="w-4 h-4 mr-2" />
              Export JSON
            </Button>
          </div>
        </div>
      </div>

      {stats && (
        <>
          {/* Overview Stats */}
          <div className="grid gap-4 md:grid-cols-5 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Tổng kế hoạch</CardDescription>
                <CardTitle className="text-2xl">{stats.overview.totalPlans}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-gray-600">Tất cả thời gian</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Hôm nay</CardDescription>
                <CardTitle className="text-2xl text-green-600">{stats.overview.plansToday}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-1 text-xs text-green-600">
                  <TrendingUp className="w-3 h-3" />
                  Kế hoạch mới
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription>7 ngày qua</CardDescription>
                <CardTitle className="text-2xl">{stats.overview.plansLast7Days}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-gray-600">Tuần này</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription>30 ngày qua</CardDescription>
                <CardTitle className="text-2xl">{stats.overview.plansLast30Days}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-gray-600">Tháng này</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Người dùng</CardDescription>
                <CardTitle className="text-2xl text-blue-600">{stats.overview.uniqueUsers}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-1 text-xs text-blue-600">
                  <Users className="w-3 h-3" />
                  Đã tạo plan
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Averages */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Chỉ số trung bình</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-4 gap-6">
                <div className="text-center">
                  <Calendar className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                  <p className="text-2xl font-bold">{stats.averages.avgDays?.toFixed(1) || 0}</p>
                  <p className="text-sm text-gray-600">Ngày trung bình</p>
                </div>
                <div className="text-center">
                  <DollarSign className="w-8 h-8 mx-auto mb-2 text-green-600" />
                  <p className="text-2xl font-bold">
                    {((stats.averages.avgBudget || 0) / 1000000).toFixed(1)}tr
                  </p>
                  <p className="text-sm text-gray-600">Ngân sách TB</p>
                </div>
                <div className="text-center">
                  <Users className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                  <p className="text-2xl font-bold">{stats.averages.avgTravelers?.toFixed(1) || 0}</p>
                  <p className="text-sm text-gray-600">Số người TB</p>
                </div>
                <div className="text-center">
                  <Sparkles className="w-8 h-8 mx-auto mb-2 text-yellow-600" />
                  <p className="text-2xl font-bold">{stats.averages.totalViews || 0}</p>
                  <p className="text-sm text-gray-600">Tổng lượt xem</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Growth Rate */}
          {trendsData && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Tốc độ tăng trưởng</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center gap-4">
                  <TrendingUp className={`w-12 h-12 ${trendsData.growthRate >= 0 ? 'text-green-600' : 'text-red-600'}`} />
                  <div>
                    <p className={`text-4xl font-bold ${trendsData.growthRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {trendsData.growthRate >= 0 ? '+' : ''}{trendsData.growthRate}%
                    </p>
                    <p className="text-sm text-gray-600">So với tháng trước</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Usage Chart */}
      {usageData && (
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Kế hoạch được tạo theo thời gian</CardTitle>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={period === '7days' ? 'default' : 'outline'}
                  onClick={() => setPeriod('7days')}
                >
                  7 ngày
                </Button>
                <Button
                  size="sm"
                  variant={period === '30days' ? 'default' : 'outline'}
                  onClick={() => setPeriod('30days')}
                >
                  30 ngày
                </Button>
                <Button
                  size="sm"
                  variant={period === '90days' ? 'default' : 'outline'}
                  onClick={() => setPeriod('90days')}
                >
                  90 ngày
                </Button>
              </div>
            </div>
            <CardDescription>Theo dõi xu hướng tạo kế hoạch</CardDescription>
          </CardHeader>
          <CardContent>
            <UsageChart data={usageData.plansOverTime} period={period} />
          </CardContent>
        </Card>
      )}

      {/* Top Destinations */}
      {destinationsData && destinationsData.topDestinations && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Top điểm đến trong kế hoạch AI</CardTitle>
            <CardDescription>Các địa điểm được AI gợi ý nhiều nhất</CardDescription>
          </CardHeader>
          <CardContent>
            <DestinationsChart data={destinationsData.topDestinations} />
          </CardContent>
        </Card>
      )}

      {/* Destinations Distribution */}
      {destinationsData && (
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle>Phân bố theo khu vực</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {destinationsData.byRegion.map((region: any, index: number) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="font-medium">{region._id || 'Chưa xác định'}</span>
                    <Badge>{region.count} kế hoạch</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Phân bố theo loại hình</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {destinationsData.byType.map((type: any, index: number) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="font-medium">{type._id || 'Chưa xác định'}</span>
                    <Badge variant="secondary">{type.count} kế hoạch</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Trends Charts */}
      {trendsData && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Xu hướng du lịch</CardTitle>
            <CardDescription>Phân tích sở thích và phong cách</CardDescription>
          </CardHeader>
          <CardContent>
            <TrendsCharts
              budgetTrends={trendsData.budgetTrends || []}
              travelStyles={trendsData.travelStyles || []}
              popularInterests={trendsData.popularInterests || []}
            />
          </CardContent>
        </Card>
      )}

      {/* Days Distribution */}
      {trendsData && trendsData.daysDistribution && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Phân bố số ngày</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-5 md:grid-cols-10 gap-3">
              {trendsData.daysDistribution.map((item: any) => (
                <div key={item._id} className="text-center p-3 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">{item._id}</p>
                  <p className="text-xs text-gray-600">{item.count} plans</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

