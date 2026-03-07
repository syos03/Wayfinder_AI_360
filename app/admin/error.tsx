'use client';

/**
 * Admin Error Boundary
 * Catches errors in admin pages
 */

import { useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Admin error caught:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="max-w-md w-full">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center text-center">
            <div className="relative mb-4">
              <Shield className="w-12 h-12 text-orange-500" />
              <AlertTriangle className="w-6 h-6 text-red-500 absolute -top-1 -right-1" />
            </div>
            <h2 className="text-xl font-bold mb-2">Lỗi Admin Dashboard</h2>
            <p className="text-gray-600 mb-4">
              {error.message || 'Có lỗi xảy ra trong khu vực quản trị.'}
            </p>
            <div className="flex flex-col gap-2 w-full">
              <Button onClick={reset} className="w-full">
                Thử lại
              </Button>
              <Button variant="outline" asChild className="w-full">
                <Link href="/admin">Về Admin Dashboard</Link>
              </Button>
              <Button variant="ghost" asChild className="w-full">
                <Link href="/">Về trang chủ</Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

