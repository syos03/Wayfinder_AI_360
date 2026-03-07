'use client';

/**
 * My Plans Page
 * Display user's trip plans
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/common/empty-state';
import {
  Calendar,
  MapPin,
  DollarSign,
  Users,
  Plus,
  Trash2,
  Eye,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

interface TripPlan {
  _id: string;
  title: string;
  origin: string;
  destinations: Array<{ name: string; images: string[] }>;
  days: number;
  budget: number;
  travelers: number;
  startDate: string;
  aiGenerated: boolean;
  views: number;
  createdAt: string;
}

export default function MyPlansPage() {
  const router = useRouter();
  const [plans, setPlans] = useState<TripPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const res = await fetch('/api/trip-plans', { credentials: 'include' });
      const data = await res.json();

      if (!res.ok) {
        if (res.status === 401) {
          router.push('/login');
          return;
        }
        throw new Error(data.error);
      }

      setPlans(data.data.plans);
    } catch (error: any) {
      toast.error(error.message || 'Không thể tải kế hoạch');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    toast.promise(
      fetch(`/api/trip-plans/${id}`, {
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

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <Calendar className="w-8 h-8 text-blue-600" />
              <h1 className="text-3xl font-bold">Kế hoạch của tôi</h1>
            </div>
            <Button asChild className="bg-gradient-to-r from-blue-600 to-purple-600">
              <Link href="/ai-planner">
                <Plus className="mr-2 w-4 h-4" />
                Tạo kế hoạch mới
              </Link>
            </Button>
          </div>
          <p className="text-gray-600">
            {plans.length > 0
              ? `Bạn có ${plans.length} kế hoạch du lịch`
              : 'Chưa có kế hoạch nào'}
          </p>
        </div>

        {/* Empty State */}
        {plans.length === 0 ? (
          <EmptyState
            icon={Sparkles}
            title="Chưa có kế hoạch du lịch"
            description="Sử dụng AI để tạo kế hoạch du lịch hoàn hảo trong vài giây! Chỉ cần nhập thông tin cơ bản và để AI lo phần còn lại."
            primaryAction={{ label: "Tạo kế hoạch với AI", href: "/ai-planner" }}
            secondaryAction={{ label: "Khám phá điểm đến", href: "/explore" }}
          />
        ) : (
          /* Plans Grid */
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {plans.map((plan) => (
              <Card
                key={plan._id}
                className="overflow-hidden hover:shadow-2xl hover:scale-[1.02] hover:-translate-y-1 transition-all duration-300"
              >
                <CardContent className="p-6">
                  {/* AI Badge */}
                  {plan.aiGenerated && (
                    <Badge className="mb-3 bg-gradient-to-r from-blue-600 to-purple-600">
                      <Sparkles className="w-3 h-3 mr-1" />
                      AI Generated
                    </Badge>
                  )}

                  {/* Title */}
                  <h3 className="text-lg font-bold mb-3 line-clamp-2">
                    {plan.title}
                  </h3>

                  {/* Info */}
                  <div className="space-y-2 text-sm mb-4">
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span>
                        {plan.origin} →{' '}
                        {plan.destinations.map((d) => d.name).join(', ')}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {plan.days} ngày (
                        {new Date(plan.startDate).toLocaleDateString('vi-VN')})
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-gray-600">
                      <Users className="w-4 h-4" />
                      <span>{plan.travelers} người</span>
                    </div>

                    <div className="flex items-center gap-2 text-gray-600">
                      <DollarSign className="w-4 h-4" />
                      <span>{(plan.budget / 1000000).toFixed(1)}tr VNĐ/người</span>
                    </div>

                    <div className="flex items-center gap-2 text-gray-600">
                      <Eye className="w-4 h-4" />
                      <span>{plan.views} lượt xem</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button asChild className="flex-1" size="sm">
                      <Link href={`/my-plans/${plan._id}`}>Xem chi tiết</Link>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(plan._id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Created Date */}
                  <p className="text-xs text-gray-500 mt-3">
                    Tạo lúc {new Date(plan.createdAt).toLocaleDateString('vi-VN')}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

