'use client';

/**
 * Google Maps Embed Viewer
 * Uses Google Maps Embed (100% FREE, no API key needed)
 */

import { Button } from '@/components/ui/button';
import { Navigation } from 'lucide-react';

interface LeafletMapViewerProps {
  lat: number;
  lng: number;
  name: string;
  address?: string;
}

export default function LeafletMapViewer({
  lat,
  lng,
  name,
  address,
}: LeafletMapViewerProps) {
  // Generate Google Maps Embed URL
  const getMapUrl = () => {
    // Google Maps Embed - Shows map with marker
    return `https://maps.google.com/maps?q=${lat},${lng}&hl=vi&z=15&output=embed`;
  };

  // Link để mở Google Maps điều hướng (tự lấy vị trí hiện tại của người dùng)
  const getMapsLink = () => {
    return `https://www.google.com/maps/dir/?api=1&origin=Current+Location&destination=${lat},${lng}&travelmode=driving`;
  };

  return (
    <div className="w-full h-[400px] rounded-lg overflow-hidden border border-gray-200 relative">
      <iframe
        src={getMapUrl()}
        width="100%"
        height="100%"
        style={{ border: 0 }}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        title={`Bản đồ ${name}`}
      />

      <div className="absolute bottom-4 right-4 z-10">
        <a href={getMapsLink()} target="_blank" rel="noopener noreferrer">
          <Button
            size="sm"
            className="shadow-lg bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
          >
            <Navigation className="w-4 h-4" />
            <span>Chỉ đường</span>
          </Button>
        </a>
      </div>
    </div>
  );
}

