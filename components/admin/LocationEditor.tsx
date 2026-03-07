'use client';

/**
 * Admin Location Editor - Drag & Drop marker to update destination coordinates
 */

import { useEffect, useState, useRef } from 'react';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { MapPin, Save, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import 'leaflet/dist/leaflet.css';

interface LocationEditorProps {
  destinationId: string;
  initialLat: number;
  initialLng: number;
  destinationName: string;
  onSave?: (lat: number, lng: number) => void;
}

// Dynamic imports for Leaflet components
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
);

const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
);

const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
);

const useMapEvents = dynamic(
  () => import('react-leaflet').then((mod) => mod.useMapEvents),
  { ssr: false }
);

export default function LocationEditor({
  destinationId,
  initialLat,
  initialLng,
  destinationName,
  onSave,
}: LocationEditorProps) {
  const [isClient, setIsClient] = useState(false);
  const [position, setPosition] = useState<[number, number]>([initialLat, initialLng]);
  const [isSaving, setIsSaving] = useState(false);
  const markerRef = useRef<any>(null);

  useEffect(() => {
    setIsClient(true);

    // Fix Leaflet marker icons
    if (typeof window !== 'undefined') {
      const L = require('leaflet');
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });
    }
  }, []);

  // Component to handle marker drag
  function DraggableMarker() {
    const [draggable, setDraggable] = useState(true);

    const eventHandlers = {
      dragend() {
        const marker = markerRef.current;
        if (marker != null) {
          const newPos = marker.getLatLng();
          setPosition([newPos.lat, newPos.lng]);
          toast.info(`📍 Vị trí mới: ${newPos.lat.toFixed(6)}, ${newPos.lng.toFixed(6)}`);
        }
      },
    };

    return (
      <Marker
        draggable={draggable}
        eventHandlers={eventHandlers}
        position={position}
        ref={markerRef}
      />
    );
  }

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch(`/api/admin/destinations/${destinationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          coordinates: {
            lat: position[0],
            lng: position[1],
          },
        }),
      });

      if (!response.ok) throw new Error('Failed to update location');

      toast.success('✅ Đã cập nhật vị trí thành công!');
      if (onSave) onSave(position[0], position[1]);
    } catch (error) {
      console.error('Save location error:', error);
      toast.error('❌ Lỗi khi cập nhật vị trí');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setPosition([initialLat, initialLng]);
    toast.info('🔄 Đã reset về vị trí ban đầu');
  };

  if (!isClient) {
    return (
      <div className="w-full h-[500px] bg-gray-100 rounded-lg flex items-center justify-center">
        <p className="text-gray-500">Đang tải bản đồ...</p>
      </div>
    );
  }

  const hasChanged = position[0] !== initialLat || position[1] !== initialLng;

  return (
    <div className="space-y-4">
      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <MapPin className="w-5 h-5 text-blue-600 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-semibold text-blue-900 mb-1">
              Chỉnh sửa vị trí: {destinationName}
            </h3>
            <p className="text-sm text-blue-700 mb-2">
              🖱️ Kéo thả marker (pin màu xanh) để thay đổi vị trí
            </p>
            <div className="text-xs text-blue-600 space-y-1">
              <div>📍 Vị trí hiện tại: {position[0].toFixed(6)}, {position[1].toFixed(6)}</div>
              <div>📍 Vị trí ban đầu: {initialLat.toFixed(6)}, {initialLng.toFixed(6)}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Map */}
      <div className="relative w-full h-[500px] rounded-lg overflow-hidden border-2 border-gray-300">
        <MapContainer
          center={position}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <DraggableMarker />
        </MapContainer>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button
          onClick={handleSave}
          disabled={!hasChanged || isSaving}
          className="flex-1"
        >
          <Save className="w-4 h-4 mr-2" />
          {isSaving ? 'Đang lưu...' : 'Lưu vị trí mới'}
        </Button>
        
        <Button
          onClick={handleReset}
          variant="outline"
          disabled={!hasChanged || isSaving}
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Reset
        </Button>
      </div>

      {/* Help text */}
      <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
        💡 <strong>Mẹo:</strong> Click vào marker và giữ chuột, sau đó kéo đến vị trí mong muốn. 
        Zoom in/out để tìm vị trí chính xác hơn.
      </div>
    </div>
  );
}

