'use client';

/**
 * Admin Destination Management Page
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  MapPin, 
  Search, 
  ChevronLeft,
  ChevronRight,
  Edit,
  Trash2,
  Plus,
  Eye,
  EyeOff,
  CheckSquare
} from 'lucide-react';
import Link from 'next/link';
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
  isActive: boolean;
  createdAt: string;
  images: string[];
}

export default function AdminDestinationsPage() {
  const router = useRouter();
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [regionFilter, setRegionFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('active'); // FIX: Default to active only
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    fetchDestinations();
  }, [page, search, regionFilter, typeFilter, statusFilter]);

  const fetchDestinations = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...(search && { search }),
        ...(regionFilter && { region: regionFilter }),
        ...(typeFilter && { type: typeFilter }),
        ...(statusFilter === 'active' && { isActive: 'true' }),
        ...(statusFilter === 'inactive' && { isActive: 'false' }),
      });

      const res = await fetch(`/api/admin/destinations?${params}`, {
        credentials: 'include', // FIX: Send auth cookie
      });
      const data = await res.json();

      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          router.push('/login');
          return;
        }
        throw new Error(data.error || 'Failed to fetch destinations');
      }

      setDestinations(data.data.destinations);
      setTotalPages(data.data.pagination.pages);
      setTotal(data.data.pagination.total);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    const action = currentStatus ? 'vô hiệu hóa' : 'kích hoạt';
    
    toast.promise(
      fetch(`/api/admin/destinations/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus }),
        credentials: 'include',
      }).then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        fetchDestinations();
        return data;
      }),
      {
        loading: `Đang ${action}...`,
        success: `${action.charAt(0).toUpperCase() + action.slice(1)} thành công!`,
        error: (err) => `Lỗi: ${err.message}`,
      }
    );
  };

  const handleDelete = async (id: string, name: string) => {
    // Confirm before delete - warn about permanent deletion
    if (!confirm(`Bạn có chắc chắn muốn XÓA VĨNH VIỄN điểm đến "${name}"?\n\n⚠️ CẢNH BÁO: Hành động này không thể hoàn tác!\n\nĐiểm đến và tất cả dữ liệu liên quan (đánh giá, lượt xem, v.v.) sẽ bị xóa vĩnh viễn.`)) {
      return;
    }

    toast.promise(
      fetch(`/api/admin/destinations/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      }).then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Không thể xóa điểm đến');
        
        // Hard delete - item is permanently removed from database
        // Always refetch to get updated list
        fetchDestinations();
        
        return data;
      }),
      {
        loading: 'Đang xóa điểm đến...',
        success: 'Xóa điểm đến thành công!',
        error: (err) => `Lỗi: ${err.message}`,
      }
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === destinations.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(destinations.map(d => d._id));
    }
  };

  const handleSelectOne = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(selectedId => selectedId !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleBulkAction = async (action: 'activate' | 'deactivate' | 'delete') => {
    if (selectedIds.length === 0) {
      toast.error('Vui lòng chọn ít nhất một điểm đến');
      return;
    }

    const actionText = action === 'activate' ? 'kích hoạt' : action === 'deactivate' ? 'vô hiệu hóa' : 'xóa';
    
    // Confirm before bulk action
    if (action === 'delete') {
      if (!confirm(`Bạn có chắc chắn muốn XÓA VĨNH VIỄN ${selectedIds.length} điểm đến?\n\n⚠️ CẢNH BÁO: Hành động này không thể hoàn tác!\n\nCác điểm đến và tất cả dữ liệu liên quan sẽ bị xóa vĩnh viễn.`)) {
        return;
      }
    } else {
      if (!confirm(`Bạn có chắc chắn muốn ${actionText} ${selectedIds.length} điểm đến?`)) {
        return;
      }
    }
    
    toast.promise(
      fetch('/api/admin/destinations/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, ids: selectedIds }),
        credentials: 'include',
      }).then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Không thể thực hiện thao tác');
        
        // Hard delete - items are permanently removed from database
        // Always refetch to get updated list
        setSelectedIds([]);
        fetchDestinations();
        return data;
      }),
      {
        loading: `Đang ${actionText} ${selectedIds.length} điểm đến...`,
        success: (data) => data.message || `${actionText.charAt(0).toUpperCase() + actionText.slice(1)} thành công ${selectedIds.length} điểm đến!`,
        error: (err) => `Lỗi: ${err.message}`,
      }
    );
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
    <div className="container mx-auto px-6 py-12">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <Button variant="outline" asChild size="sm">
              <Link href="/admin">
                <ChevronLeft className="w-4 h-4" />
              </Link>
            </Button>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <MapPin className="w-8 h-8 text-blue-600" />
              Quản lý điểm đến
            </h1>
          </div>
          
          {/* Create Button */}
          <Button className="bg-blue-600 hover:bg-blue-700" asChild>
            <Link href="/admin/destinations/create">
              <Plus className="w-4 h-4 mr-2" />
              Tạo điểm đến
            </Link>
          </Button>
        </div>
        <p className="text-gray-600 ml-12">
          Tổng cộng {total} điểm đến
        </p>
      </div>

      {/* Bulk Actions */}
      {selectedIds.length > 0 && (
        <Card className="mb-4 border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <p className="font-medium text-blue-900">
                Đã chọn {selectedIds.length} điểm đến
              </p>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => handleBulkAction('activate')}>
                  <Eye className="w-4 h-4 mr-1" />
                  Kích hoạt
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleBulkAction('deactivate')}>
                  <EyeOff className="w-4 h-4 mr-1" />
                  Vô hiệu hóa
                </Button>
                <Button size="sm" variant="destructive" onClick={() => handleBulkAction('delete')}>
                  <Trash2 className="w-4 h-4 mr-1" />
                  Xóa
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="grid gap-4 md:grid-cols-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Tìm kiếm..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="pl-10"
              />
            </div>

            {/* Region Filter */}
            <select
              value={regionFilter}
              onChange={(e) => {
                setRegionFilter(e.target.value);
                setPage(1);
              }}
              className="w-full h-9 border border-input rounded-md px-3 py-2 text-sm bg-transparent shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:border-ring"
            >
              <option value="">Tất cả vùng miền</option>
              <option value="Bắc Bộ">Bắc Bộ</option>
              <option value="Trung Bộ">Trung Bộ</option>
              <option value="Nam Bộ">Nam Bộ</option>
            </select>

            {/* Type Filter */}
            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setPage(1);
              }}
              className="w-full h-9 border border-input rounded-md px-3 py-2 text-sm bg-transparent shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:border-ring"
            >
              <option value="">Tất cả loại</option>
              <option value="Biển">Biển</option>
              <option value="Núi">Núi</option>
              <option value="Thành phố">Thành phố</option>
              <option value="Văn hóa">Văn hóa</option>
              <option value="Thiên nhiên">Thiên nhiên</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="w-full h-9 border border-input rounded-md px-3 py-2 text-sm bg-transparent shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:border-ring"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="active">Đang hoạt động</option>
              <option value="inactive">Không hoạt động</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Destinations Table */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : error ? (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-600">{error}</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left">
                        <input
                          type="checkbox"
                          checked={selectedIds.length === destinations.length && destinations.length > 0}
                          onChange={handleSelectAll}
                          className="rounded"
                        />
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Điểm đến
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Tỉnh/TP
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Vùng miền
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Loại
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Đánh giá
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Trạng thái
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        Thao tác
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {destinations.map((dest) => (
                      <tr key={dest._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(dest._id)}
                            onChange={() => handleSelectOne(dest._id)}
                            className="rounded"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium">{dest.name}</p>
                            {dest.nameEn && (
                              <p className="text-sm text-gray-600">{dest.nameEn}</p>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {dest.province}
                        </td>
                        <td className="px-6 py-4">
                          <Badge className={getRegionBadgeColor(dest.region)}>
                            {dest.region}
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant="outline">{dest.type}</Badge>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm">
                            <p className="text-gray-900">⭐ {dest.rating.toFixed(1)}</p>
                            <p className="text-gray-600">{dest.reviewCount} đánh giá</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {dest.isActive ? (
                            <Badge className="bg-green-600 text-white">Hoạt động</Badge>
                          ) : (
                            <Badge variant="outline">Không hoạt động</Badge>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleToggleActive(dest._id, dest.isActive)}
                            >
                              {dest.isActive ? (
                                <EyeOff className="w-4 h-4" />
                              ) : (
                                <Eye className="w-4 h-4" />
                              )}
                            </Button>
                            <Button size="sm" variant="outline" asChild>
                              <Link href={`/admin/destinations/${dest._id}/edit`}>
                                <Edit className="w-4 h-4" />
                              </Link>
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDelete(dest._id, dest.name)}
                              title="Xóa điểm đến"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-sm text-gray-600">
                Trang {page} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

