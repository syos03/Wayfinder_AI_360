'use client';

/**
 * Admin AI Plans Management Page
 * List and manage all AI-generated trip plans
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Sparkles,
  Search,
  Calendar,
  MapPin,
  Users,
  DollarSign,
  Eye,
  Trash2,
  TrendingUp,
  BarChart3,
  RefreshCw,
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

interface TripPlan {
  _id: string;
  title: string;
  origin: string;
  destinations: Array<{ _id: string; name: string; province: string }>;
  days: number;
  budget: number;
  travelers: number;
  travelStyle: string;
  views: number;
  createdAt: string;
  userId: {
    _id: string;
    name: string;
    email: string;
  };
}

export default function AdminAIPlansPage() {
  const router = useRouter();
  const [plans, setPlans] = useState<TripPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  
  // Filters
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchPlans();
  }, [page]);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
      });
      
      if (search) {
        params.append('search', search);
      }

      const res = await fetch(`/api/admin/ai-plans?${params}`, {
        credentials: 'include',
      });
      const data = await res.json();

      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          router.push('/login');
          return;
        }
        throw new Error(data.error);
      }

      setPlans(data.data.plans);
      setStats(data.data.stats);
      setTotalPages(data.data.pagination.pages);
    } catch (error: any) {
      toast.error(error.message || 'Không thể tải danh sách');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(1);
    fetchPlans();
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Xóa kế hoạch "${title}"?`)) return;

    toast.promise(
      fetch(`/api/admin/ai-plans/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      }).then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        fetchPlans();
        return data;
      }),
      {
        loading: 'Đang xóa...',
        success: 'Đã xóa kế hoạch!',
        error: (err) => `Lỗi: ${err.message}`,
      }
    );
  };

  if (loading && plans.length === 0) {
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
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold">Quản lý Kế hoạch AI</h1>
          </div>
          <Button asChild variant="outline">
            <Link href="/admin/ai-plans/analytics">
              <BarChart3 className="w-4 h-4 mr-2" />
              Analytics Dashboard
            </Link>
          </Button>
        </div>
        <p className="text-gray-600">Quản lý kế hoạch du lịch được tạo bởi AI</p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Tổng kế hoạch</CardDescription>
              <CardTitle className="text-2xl">{stats.total}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-gray-600">Tất cả thời gian</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Hôm nay</CardDescription>
              <CardTitle className="text-2xl">{stats.today}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-green-600 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                Kế hoạch mới
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>7 ngày qua</CardDescription>
              <CardTitle className="text-2xl">{stats.last7Days}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-gray-600">Xu hướng tăng</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>30 ngày qua</CardDescription>
              <CardTitle className="text-2xl">{stats.last30Days}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-gray-600">Tháng này</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <div className="flex-1">
              <Input
                placeholder="Tìm kiếm theo tiêu đề, điểm xuất phát..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <Button onClick={handleSearch}>
              <Search className="w-4 h-4 mr-2" />
              Tìm kiếm
            </Button>
            <Button variant="outline" onClick={fetchPlans}>
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Plans List */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách kế hoạch ({plans.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {plans.length === 0 ? (
            <div className="text-center py-12">
              <Sparkles className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-600">Chưa có kế hoạch AI nào</p>
            </div>
          ) : (
            <div className="space-y-4">
              {plans.map((plan) => (
                <div
                  key={plan._id}
                  className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-bold text-lg">{plan.title}</h3>
                        <Badge variant="outline" className="bg-gradient-to-r from-blue-50 to-purple-50">
                          <Sparkles className="w-3 h-3 mr-1" />
                          AI
                        </Badge>
                      </div>

                      <div className="grid md:grid-cols-2 gap-2 text-sm mb-3">
                        <div className="flex items-center gap-2 text-gray-600">
                          <MapPin className="w-4 h-4" />
                          <span>
                            {plan.origin} → {plan.destinations.map(d => d.name).join(', ')}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-gray-600">
                          <Calendar className="w-4 h-4" />
                          <span>{plan.days} ngày</span>
                        </div>

                        <div className="flex items-center gap-2 text-gray-600">
                          <Users className="w-4 h-4" />
                          <span>{plan.travelers} người</span>
                        </div>

                        <div className="flex items-center gap-2 text-gray-600">
                          <DollarSign className="w-4 h-4" />
                          <span>{(plan.budget / 1000000).toFixed(1)}tr VNĐ/người</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>👤 {plan.userId.name}</span>
                        <span>📧 {plan.userId.email}</span>
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {plan.views} lượt xem
                        </span>
                        <Badge variant="secondary">{plan.travelStyle}</Badge>
                        <span>🕐 {new Date(plan.createdAt).toLocaleDateString('vi-VN')}</span>
                      </div>
                    </div>

                    <div className="flex gap-2 ml-4">
                      <Button asChild size="sm" variant="outline">
                        <Link href={`/admin/ai-plans/${plan._id}`}>
                          Chi tiết
                        </Link>
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(plan._id, plan.title)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <Button
                variant="outline"
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
              >
                Trước
              </Button>
              <span className="text-sm text-gray-600">
                Trang {page} / {totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => setPage(page + 1)}
                disabled={page === totalPages}
              >
                Sau
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

