'use client';

/**
 * Edit Destination Page
 */

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DestinationForm from '../../components/DestinationForm';
import LocationEditor from '@/components/admin/LocationEditor';
import AR360Editor from '@/components/admin/AR360Editor';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

export default function EditDestinationPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const [destination, setDestination] = useState<any>(null);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDestination();
  }, [resolvedParams.id]);

  const fetchDestination = async () => {
    try {
      console.log('🔄 Fetching destination:', resolvedParams.id);
      const res = await fetch(`/api/admin/destinations/${resolvedParams.id}`, {
        cache: 'no-store',
        // Add timestamp to prevent caching
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Không thể tải điểm đến');
      }

      console.log('✅ Fetched destination:', {
        name: data.data.destination.name,
        streetViewLocations: data.data.destination.streetViewLocations?.length || 0,
        streetViewSpots: data.data.destination.streetViewSpots?.length || 0,
        panoramaHotspots: data.data.destination.panoramaHotspots?.length || 0,
      });
      if (data.data.destination.panoramaHotspots?.length > 0) {
        console.log('🔗 Fetched panoramaHotspots:', JSON.stringify(data.data.destination.panoramaHotspots, null, 2));
      }

      setDestination(data.data.destination);
    } catch (err: any) {
      console.error('❌ Fetch error:', err);
      setError(err.message);
    } finally {
      setFetchLoading(false);
    }
  };

  const handleSubmit = async (data: any) => {
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`/api/admin/destinations/${resolvedParams.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok) {
        console.error('❌ Server error:', result);
        const errorMsg = result.error || 'Có lỗi xảy ra';
        const details = result.details ? JSON.stringify(result.details, null, 2) : '';
        throw new Error(`${errorMsg}\n${details}`);
      }

      toast.success('Cập nhật điểm đến thành công!');
      router.push('/admin/destinations');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div className="container mx-auto px-6 py-12">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (!destination) {
    return (
      <div className="container mx-auto px-6 py-12">
        <div className="text-center text-red-600">Không tìm thấy điểm đến</div>
      </div>
    );
  }

  const normalizedStreetViewSpots =
    (destination.streetViewSpots && destination.streetViewSpots.length > 0
      ? destination.streetViewSpots
      : destination.streetViewUrls && destination.streetViewUrls.length > 0
      ? destination.streetViewUrls.map((url: string) => ({ url, title: '' }))
      : destination.streetViewUrl
      ? [{ url: destination.streetViewUrl, title: '' }]
      : []) ?? [];

  const normalizedStreetViewLocations = destination.streetViewLocations || [];

  const handleLocationSave = (lat: number, lng: number) => {
    // Update local state
    setDestination({
      ...destination,
      coordinates: { lat, lng },
    });
    // Optionally reload data
    fetchDestination();
  };

  return (
    <div className="container mx-auto px-6 py-8">
      <h1 className="text-3xl font-bold mb-6">Chỉnh sửa điểm đến</h1>
      
      <Tabs defaultValue="info" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="info">📝 Thông tin</TabsTrigger>
          <TabsTrigger value="location">📍 Vị trí trên bản đồ</TabsTrigger>
          <TabsTrigger value="ar360">🌐 AR360 Virtual Tour</TabsTrigger>
        </TabsList>

        <TabsContent value="info">
          <DestinationForm
            mode="edit"
            initialData={destination}
            onSubmit={handleSubmit}
            loading={loading}
            error={error}
          />
        </TabsContent>

        <TabsContent value="location">
          <div className="bg-white rounded-lg shadow p-6">
            <LocationEditor
              destinationId={resolvedParams.id}
              initialLat={destination.coordinates.lat}
              initialLng={destination.coordinates.lng}
              destinationName={destination.name}
              onSave={handleLocationSave}
            />
          </div>
        </TabsContent>

        <TabsContent value="ar360">
          <div className="bg-white rounded-lg shadow p-6">
            <AR360Editor
              destinationId={resolvedParams.id}
              destinationName={destination.name}
              initialPanoramaImages={destination.panoramaImages || []}
              initialYoutubeVideos={destination.youtubeVideos || []}
              initialPanoramaHotspots={destination.panoramaHotspots || []}
              initialStreetViewLocations={normalizedStreetViewLocations}
              destinationCoordinates={destination.coordinates}
              onSave={fetchDestination}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

