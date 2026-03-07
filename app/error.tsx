'use client';

/**
 * Root Error Boundary
 * Catches errors in the entire application
 */

import { useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Global error caught:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="max-w-md w-full">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center text-center">
            <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
            <h2 className="text-xl font-bold mb-2">Đã có lỗi xảy ra</h2>
            <p className="text-gray-600 mb-4">
              {error.message || 'Ứng dụng gặp sự cố. Vui lòng thử lại.'}
            </p>
            {error.digest && (
              <p className="text-xs text-gray-500 mb-4">
                Mã lỗi: {error.digest}
              </p>
            )}
            <div className="flex gap-3 w-full">
              <Button onClick={reset} className="flex-1">
                Thử lại
              </Button>
              <Button 
                variant="outline" 
                onClick={() => window.location.href = '/'} 
                className="flex-1"
              >
                Về trang chủ
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

