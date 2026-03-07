'use client';

/**
 * Create Destination Page
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import DestinationForm from '../components/DestinationForm';
import { toast } from 'sonner';

export default function CreateDestinationPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (data: any) => {
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/admin/destinations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || 'Có lỗi xảy ra');
      }

      toast.success('Tạo điểm đến thành công!');
      router.push('/admin/destinations');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DestinationForm
      mode="create"
      onSubmit={handleSubmit}
      loading={loading}
      error={error}
    />
  );
}

