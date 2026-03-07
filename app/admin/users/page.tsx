'use client';

/**
 * Admin User Management Page
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  Users, 
  Search, 
  UserX, 
  UserCheck,
  Shield,
  ChevronLeft,
  ChevronRight,
  Edit,
  Trash2,
  UserPlus
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  isBanned: boolean;
  createdAt: string;
  lastLogin?: string;
  loginCount: number;
}

export default function AdminUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentUserRole, setCurrentUserRole] = useState('');
  
  // Create user dialog
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    email: '',
    name: '',
    password: '',
    role: 'user',
  });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchCurrentUser();
    fetchUsers();
  }, [page, search, roleFilter, statusFilter]);

  const fetchCurrentUser = async () => {
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      if (res.ok && data.data?.user) {
        setCurrentUserRole(data.data.user.role || '');
      }
    } catch (err) {
      console.error('Failed to fetch current user:', err);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...(search && { search }),
        ...(roleFilter && { role: roleFilter }),
        ...(statusFilter === 'active' && { isActive: 'true', isBanned: 'false' }),
        ...(statusFilter === 'banned' && { isBanned: 'true' }),
        ...(statusFilter === 'inactive' && { isActive: 'false' }),
      });

      const res = await fetch(`/api/admin/users?${params}`, {
        credentials: 'include', // FIX: Send auth cookie
      });
      const data = await res.json();

      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          router.push('/login');
          return;
        }
        throw new Error(data.error || 'Failed to fetch users');
      }

      setUsers(data.data.users);
      setTotalPages(data.data.pagination.pages);
      setTotal(data.data.pagination.total);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBanUser = async (userId: string, shouldBan: boolean) => {
    const action = shouldBan ? 'cấm' : 'bỏ cấm';
    
    toast.promise(
      fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          isBanned: shouldBan,
          banReason: shouldBan ? 'Bị cấm bởi quản trị viên' : undefined,
        }),
        credentials: 'include',
      }).then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        fetchUsers();
        return data;
      }),
      {
        loading: `Đang ${action} người dùng...`,
        success: `${action.charAt(0).toUpperCase() + action.slice(1)} người dùng thành công!`,
        error: (err) => `Lỗi: ${err.message}`,
      }
    );
  };

  const handleDeleteUser = async (userId: string) => {
    toast.promise(
      fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        credentials: 'include',
      }).then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        fetchUsers();
        return data;
      }),
      {
        loading: 'Đang xóa người dùng...',
        success: 'Xóa người dùng thành công!',
        error: (err) => `Lỗi: ${err.message}`,
      }
    );
  };

  const handleCreateUser = async () => {
    // Validation
    if (!newUser.email || !newUser.name || !newUser.password) {
      toast.error('Vui lòng điền đầy đủ thông tin!');
      return;
    }

    if (newUser.password.length < 6) {
      toast.error('Mật khẩu phải có ít nhất 6 ký tự!');
      return;
    }

    setCreating(true);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser),
        credentials: 'include',
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      // Reset form
      setNewUser({ email: '', name: '', password: '', role: 'user' });
      setCreateDialogOpen(false);
      
      // Refresh list
      fetchUsers();
      
      toast.success('Tạo người dùng thành công!');
    } catch (err: any) {
      toast.error('Lỗi: ' + err.message);
    } finally {
      setCreating(false);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'super_admin': return 'bg-red-600 text-white';
      case 'admin': return 'bg-orange-600 text-white';
      case 'moderator': return 'bg-blue-600 text-white';
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
              <Users className="w-8 h-8 text-blue-600" />
              Quản lý người dùng
            </h1>
          </div>
          
          {/* Create User Button */}
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <UserPlus className="w-4 h-4 mr-2" />
                Tạo người dùng
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Tạo người dùng mới</DialogTitle>
                <DialogDescription>
                  Tạo tài khoản mới cho user, moderator hoặc admin
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="user@example.com"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  />
                </div>

                {/* Name */}
                <div className="space-y-2">
                  <Label htmlFor="name">Tên *</Label>
                  <Input
                    id="name"
                    placeholder="Nguyễn Văn A"
                    value={newUser.name}
                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  />
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <Label htmlFor="password">Mật khẩu *</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Tối thiểu 6 ký tự"
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  />
                </div>

                {/* Role */}
                <div className="space-y-2">
                  <Label htmlFor="role">Vai trò *</Label>
                  <select
                    id="role"
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                    className="w-full border rounded-md px-3 py-2"
                  >
                    <option value="user">User - Người dùng thường</option>
                    {/* 🔒 Moderator can only create User */}
                    {currentUserRole !== 'moderator' && (
                      <option value="moderator">Moderator - Kiểm duyệt viên</option>
                    )}
                    {/* 🔒 Only Admin and Super Admin can create Admin */}
                    {(currentUserRole === 'admin' || currentUserRole === 'super_admin') && (
                      <option value="admin">Admin - Quản trị viên</option>
                    )}
                    {/* 🔒 Only Super Admin can create Super Admin */}
                    {currentUserRole === 'super_admin' && (
                      <option value="super_admin">Super Admin - Quản trị tối cao</option>
                    )}
                  </select>
                  {newUser.role === 'admin' || newUser.role === 'super_admin' ? (
                    <p className="text-xs text-orange-600">
                      ⚠️ Chỉ Super Admin mới có thể tạo Admin/Super Admin
                    </p>
                  ) : null}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => setCreateDialogOpen(false)}
                  disabled={creating}
                >
                  Hủy
                </Button>
                <Button
                  onClick={handleCreateUser}
                  disabled={creating}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {creating ? 'Đang tạo...' : 'Tạo người dùng'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        <p className="text-gray-600 ml-12">
          Tổng cộng {total} người dùng
        </p>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="grid gap-4 md:grid-cols-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Tìm kiếm theo tên hoặc email..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="pl-10"
              />
            </div>

            {/* Role Filter */}
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setPage(1);
              }}
              className="border rounded-md px-3 py-2"
            >
              <option value="">Tất cả vai trò</option>
              <option value="user">User</option>
              {/* 🔒 Moderator only sees User */}
              {currentUserRole !== 'moderator' && (
                <option value="moderator">Moderator</option>
              )}
              {/* 🔒 Only Admin and Super Admin see Admin */}
              {(currentUserRole === 'admin' || currentUserRole === 'super_admin') && (
                <option value="admin">Admin</option>
              )}
              {/* 🔒 Only Super Admin sees Super Admin */}
              {currentUserRole === 'super_admin' && (
                <option value="super_admin">Super Admin</option>
              )}
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="border rounded-md px-3 py-2"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="active">Đang hoạt động</option>
              <option value="inactive">Không hoạt động</option>
              <option value="banned">Bị cấm</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
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
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Người dùng
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Vai trò
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Trạng thái
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Hoạt động
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Ngày tạo
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        Thao tác
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {users.map((user) => (
                      <tr key={user._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium">{user.name}</p>
                            <p className="text-sm text-gray-600">{user.email}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Badge className={getRoleBadgeColor(user.role)}>
                            {user.role}
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          {user.isBanned ? (
                            <Badge variant="destructive">Bị cấm</Badge>
                          ) : user.isActive ? (
                            <Badge className="bg-green-600 text-white">Hoạt động</Badge>
                          ) : (
                            <Badge variant="outline">Không hoạt động</Badge>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm">
                            <p className="text-gray-900">{user.loginCount} lần đăng nhập</p>
                            {user.lastLogin && (
                              <p className="text-gray-600">
                                {new Date(user.lastLogin).toLocaleDateString('vi-VN')}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {/* 🔒 Only Super Admin can ban/delete Admin/Super Admin */}
                            {(user.role === 'admin' || user.role === 'super_admin') && currentUserRole !== 'super_admin' ? (
                              <Badge variant="outline" className="text-gray-500">
                                <Shield className="w-3 h-3 mr-1" />
                                Chỉ Super Admin
                              </Badge>
                            ) : (
                              <>
                                {user.isBanned ? (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleBanUser(user._id, false)}
                                  >
                                    <UserCheck className="w-4 h-4 mr-1" />
                                    Bỏ cấm
                                  </Button>
                                ) : (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleBanUser(user._id, true)}
                                  >
                                    <UserX className="w-4 h-4 mr-1" />
                                    Cấm
                                  </Button>
                                )}
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleDeleteUser(user._id)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </>
                            )}
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

