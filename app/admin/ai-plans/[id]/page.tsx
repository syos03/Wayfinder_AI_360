'use client';

/**
 * Admin AI Plan Detail Page
 * View detailed information of a specific AI-generated plan
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Sparkles,
  MapPin,
  Calendar,
  Users,
  DollarSign,
  ArrowLeft,
  Trash2,
  Eye,
  Clock,
  Lightbulb,
  AlertTriangle,
  Bus,
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

interface TripPlan {
  _id: string;
  title: string;
  origin: string;
  destinations: Array<{
    _id: string;
    name: string;
    province: string;
    region: string;
    type: string;
    images: string[];
  }>;
  days: number;
  budget: number;
  travelers: number;
  travelStyle: string;
  interests: string[];
  startDate: string;
  itinerary: Array<{
    day: number;
    date: string;
    morning: {
      activities: string[];
      estimatedCost: number;
    };
    afternoon: {
      activities: string[];
      estimatedCost: number;
    };
    evening: {
      activities: string[];
      estimatedCost: number;
    };
    accommodation: string;
    totalDayCost: number;
  }>;
  transportation: {
    type: string;
    details: string;
    cost: number;
  };
  budgetBreakdown: {
    transportation: number;
    accommodation: number;
    food: number;
    activities: number;
    other: number;
    total: number;
  };
  tips: string[];
  warnings: string[];
  aiModel: string;
  views: number;
  likes: number;
  isPublic: boolean;
  createdAt: string;
  userId: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
    role: string;
  };
}

export default function AdminAIPlanDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [plan, setPlan] = useState<TripPlan | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPlan();
  }, [params.id]);

  const fetchPlan = async () => {
    try {
      const res = await fetch(`/api/admin/ai-plans/${params.id}`, {
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

      setPlan(data.data.plan);
    } catch (error: any) {
      toast.error(error.message || 'Không thể tải kế hoạch');
      router.push('/admin/ai-plans');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!plan || !confirm(`Xóa kế hoạch "${plan.title}"?`)) return;

    toast.promise(
      fetch(`/api/admin/ai-plans/${params.id}`, {
        method: 'DELETE',
        credentials: 'include',
      }).then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        router.push('/admin/ai-plans');
        return data;
      }),
      {
        loading: 'Đang xóa...',
        success: 'Đã xóa kế hoạch!',
        error: (err) => `Lỗi: ${err.message}`,
      }
    );
  };

  if (loading) {
    return (
      <div className="container mx-auto px-6 py-12">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (!plan) return null;

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
              <h1 className="text-3xl font-bold">{plan.title}</h1>
              <Badge className="bg-gradient-to-r from-blue-600 to-purple-600">
                AI Generated
              </Badge>
            </div>
            <p className="text-gray-600">Chi tiết kế hoạch du lịch</p>
          </div>
          <Button variant="destructive" onClick={handleDelete}>
            <Trash2 className="w-4 h-4 mr-2" />
            Xóa kế hoạch
          </Button>
        </div>
      </div>

      {/* User Info */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Thông tin người tạo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full flex items-center justify-center text-white font-bold text-xl">
              {plan.userId.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-medium">{plan.userId.name}</p>
              <p className="text-sm text-gray-600">{plan.userId.email}</p>
              <Badge variant="outline" className="mt-1">{plan.userId.role}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Plan Overview */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Thông tin chuyến đi</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">Lộ trình</p>
                <p className="font-medium">
                  {plan.origin} → {plan.destinations.map(d => d.name).join(', ')}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">Thời gian</p>
                <p className="font-medium">
                  {plan.days} ngày - Khởi hành {new Date(plan.startDate).toLocaleDateString('vi-VN')}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">Số người</p>
                <p className="font-medium">{plan.travelers} người</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <DollarSign className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">Ngân sách</p>
                <p className="font-medium">{(plan.budget / 1000000).toFixed(1)} triệu VNĐ/người</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Thông tin AI & Thống kê</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-blue-400" />
              <div>
                <p className="text-sm text-gray-600">AI Model</p>
                <p className="font-medium">{plan.aiModel}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Eye className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">Lượt xem</p>
                <p className="font-medium">{plan.views}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">Ngày tạo</p>
                <p className="font-medium">{new Date(plan.createdAt).toLocaleString('vi-VN')}</p>
              </div>
            </div>

            <div className="flex gap-2 flex-wrap">
              <Badge>{plan.travelStyle}</Badge>
              {plan.interests.map(interest => (
                <Badge key={interest} variant="secondary">{interest}</Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Budget Breakdown */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Phân bổ ngân sách</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-5 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Phương tiện</p>
              <p className="text-xl font-bold text-blue-600">
                {(plan.budgetBreakdown.transportation / 1000000).toFixed(1)}tr
              </p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Chỗ ở</p>
              <p className="text-xl font-bold text-green-600">
                {(plan.budgetBreakdown.accommodation / 1000000).toFixed(1)}tr
              </p>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Ăn uống</p>
              <p className="text-xl font-bold text-yellow-600">
                {(plan.budgetBreakdown.food / 1000000).toFixed(1)}tr
              </p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Hoạt động</p>
              <p className="text-xl font-bold text-purple-600">
                {(plan.budgetBreakdown.activities / 1000000).toFixed(1)}tr
              </p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Khác</p>
              <p className="text-xl font-bold text-gray-600">
                {(plan.budgetBreakdown.other / 1000000).toFixed(1)}tr
              </p>
            </div>
          </div>
          <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg text-center">
            <p className="text-sm text-gray-600 mb-1">Tổng chi phí</p>
            <p className="text-3xl font-bold text-blue-600">
              {(plan.budgetBreakdown.total / 1000000).toFixed(1)} triệu VNĐ
            </p>
            <p className="text-xs text-gray-600 mt-1">
              Cho {plan.travelers} người × {plan.days} ngày
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Transportation */}
      {plan.transportation && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bus className="w-5 h-5" />
              Phương tiện di chuyển
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p><strong>Loại:</strong> {plan.transportation.type}</p>
              <p><strong>Chi tiết:</strong> {plan.transportation.details}</p>
              <p><strong>Chi phí:</strong> {(plan.transportation.cost / 1000000).toFixed(1)} triệu VNĐ</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Itinerary */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Lịch trình chi tiết</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {plan.itinerary.map((day, index) => (
              <div key={index} className="border-l-4 border-blue-600 pl-4">
                <h3 className="text-xl font-bold mb-3">
                  Ngày {day.day} - {new Date(day.date).toLocaleDateString('vi-VN')}
                </h3>

                {/* Morning */}
                <div className="mb-4">
                  <h4 className="font-semibold text-yellow-600 mb-2">🌅 Buổi sáng</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    {day.morning.activities.map((activity, i) => (
                      <li key={i}>{activity}</li>
                    ))}
                  </ul>
                  <p className="text-xs text-gray-600 mt-1">
                    Chi phí: {(day.morning.estimatedCost / 1000).toFixed(0)}k VNĐ
                  </p>
                </div>

                {/* Afternoon */}
                <div className="mb-4">
                  <h4 className="font-semibold text-orange-600 mb-2">☀️ Buổi chiều</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    {day.afternoon.activities.map((activity, i) => (
                      <li key={i}>{activity}</li>
                    ))}
                  </ul>
                  <p className="text-xs text-gray-600 mt-1">
                    Chi phí: {(day.afternoon.estimatedCost / 1000).toFixed(0)}k VNĐ
                  </p>
                </div>

                {/* Evening */}
                <div className="mb-4">
                  <h4 className="font-semibold text-blue-600 mb-2">🌙 Buổi tối</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    {day.evening.activities.map((activity, i) => (
                      <li key={i}>{activity}</li>
                    ))}
                  </ul>
                  <p className="text-xs text-gray-600 mt-1">
                    Chi phí: {(day.evening.estimatedCost / 1000).toFixed(0)}k VNĐ
                  </p>
                </div>

                <div className="bg-gray-50 p-3 rounded mt-3">
                  <p className="text-sm"><strong>Chỗ ở:</strong> {day.accommodation}</p>
                  <p className="text-sm font-medium text-blue-600 mt-1">
                    Tổng chi phí ngày: {(day.totalDayCost / 1000000).toFixed(2)} triệu VNĐ
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tips & Warnings */}
      <div className="grid md:grid-cols-2 gap-6">
        {plan.tips && plan.tips.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-600">
                <Lightbulb className="w-5 h-5" />
                Lời khuyên hữu ích
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {plan.tips.map((tip, index) => (
                  <li key={index} className="flex gap-2 text-sm">
                    <span className="text-green-600">✓</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {plan.warnings && plan.warnings.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-yellow-600">
                <AlertTriangle className="w-5 h-5" />
                Lưu ý quan trọng
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {plan.warnings.map((warning, index) => (
                  <li key={index} className="flex gap-2 text-sm">
                    <span className="text-yellow-600">⚠</span>
                    <span>{warning}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

