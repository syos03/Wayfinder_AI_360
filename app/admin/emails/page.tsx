'use client';

/**
 * Admin Email Management Page
 * View email logs and statistics
 */

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Mail, TrendingUp, Check, X, Clock } from 'lucide-react';

interface EmailStats {
  overview: {
    total: number;
    today: number;
    last7Days: number;
    last30Days: number;
    deliveryRate: number;
    sent: number;
    delivered: number;
    failed: number;
  };
  byType: Array<{ type: string; count: number }>;
  byStatus: Array<{ status: string; count: number }>;
  byTemplate: Array<{ template: string; count: number }>;
}

interface EmailLog {
  _id: string;
  recipient: string;
  subject: string;
  template: string;
  type: string;
  status: string;
  sentAt: string;
  userId?: { name: string; email: string };
}

export default function AdminEmailsPage() {
  const [stats, setStats] = useState<EmailStats | null>(null);
  const [emails, setEmails] = useState<EmailLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchStats();
    fetchEmails();
  }, [page]);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/emails/stats');
      const data = await res.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const fetchEmails = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/emails?page=${page}&limit=20`);
      const data = await res.json();
      if (data.success) {
        setEmails(data.data.emails);
      }
    } catch (error) {
      console.error('Failed to fetch emails:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'sent':
      case 'delivered':
        return <Badge variant="default">{status}</Badge>;
      case 'failed':
        return <Badge variant="destructive">{status}</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      transactional: 'bg-blue-100 text-blue-800',
      notification: 'bg-green-100 text-green-800',
      marketing: 'bg-purple-100 text-purple-800',
    };
    return (
      <span className={`px-2 py-1 rounded text-xs ${colors[type] || 'bg-gray-100 text-gray-800'}`}>
        {type}
      </span>
    );
  };

  if (!stats) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">📧 Quản lý Email</h1>

      {/* Stats Overview */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng Email</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.overview.total.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Hôm nay: {stats.overview.today}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">7 Ngày Qua</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.overview.last7Days.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              30 ngày: {stats.overview.last30Days}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tỷ Lệ Gửi Thành Công</CardTitle>
            <Check className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.overview.deliveryRate}%</div>
            <p className="text-xs text-muted-foreground">
              Gửi: {stats.overview.sent} / Lỗi: {stats.overview.failed}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Template Phổ Biến</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.byTemplate[0]?.template || 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.byTemplate[0]?.count || 0} emails
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Email Logs */}
      <Card>
        <CardHeader>
          <CardTitle>📋 Email Logs</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Người nhận
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Tiêu đề
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Loại
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Trạng thái
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Thời gian
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {emails.map((email) => (
                    <tr key={email._id}>
                      <td className="px-4 py-3 text-sm">
                        <div className="font-medium">{email.recipient}</div>
                        {email.userId && (
                          <div className="text-xs text-gray-500">{email.userId.name}</div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div className="max-w-xs truncate">{email.subject}</div>
                        <div className="text-xs text-gray-500">{email.template}</div>
                      </td>
                      <td className="px-4 py-3 text-sm">{getTypeBadge(email.type)}</td>
                      <td className="px-4 py-3 text-sm">{getStatusBadge(email.status)}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {new Date(email.sentAt).toLocaleString('vi-VN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="mt-4 flex justify-center gap-2">
            <Button
              variant="outline"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Trang trước
            </Button>
            <span className="px-4 py-2 text-sm text-gray-700">Trang {page}</span>
            <Button
              variant="outline"
              onClick={() => setPage(p => p + 1)}
              disabled={emails.length < 20}
            >
              Trang sau
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

