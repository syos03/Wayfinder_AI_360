'use client';

/**
 * Multi-Location Street View Component
 * Advanced Street View with multiple locations and sidebar navigation
 */

import { useState } from 'react';
import { MapPin, Navigation, Info } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export interface StreetViewLocation {
  id?: string;
  url: string;
  title: string;
  description?: string;
  category?: string; // e.g., "Cổng chính", "Quảng trường", "Bãi biển", "Khu vui chơi"
  coordinates?: {
    lat: number;
    lng: number;
  };
}

interface MultiLocationStreetViewerProps {
  locations: StreetViewLocation[];
  destinationName: string;
  className?: string;
  showSidebar?: boolean;
  defaultCoordinates?: {
    lat: number;
    lng: number;
  };
}

export function MultiLocationStreetViewer({
  locations,
  destinationName,
  className = '',
  showSidebar = true,
  defaultCoordinates,
}: MultiLocationStreetViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  if (!locations || locations.length === 0) {
    return (
      <div className="flex items-center justify-center bg-gray-50 rounded-lg p-8">
        <div className="text-center">
          <Navigation className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">Chưa có địa điểm Street View nào</p>
        </div>
      </div>
    );
  }

  const currentLocation = locations[currentIndex];
  const hasMultipleLocations = locations.length > 1;

  const goToLocation = (index: number) => {
    setCurrentIndex(index);
  };

  const goNext = () => {
    setCurrentIndex((prev) => (prev + 1) % locations.length);
  };

  const goPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + locations.length) % locations.length);
  };

  // Category colors
  const getCategoryColor = (category?: string) => {
    if (!category) return 'bg-gray-100 text-gray-700';
    const colors: Record<string, string> = {
      'Cổng chính': 'bg-blue-100 text-blue-700',
      'Quảng trường': 'bg-purple-100 text-purple-700',
      'Bãi biển': 'bg-cyan-100 text-cyan-700',
      'Khu vui chơi': 'bg-green-100 text-green-700',
      'Nhà hàng': 'bg-orange-100 text-orange-700',
      'Khách sạn': 'bg-pink-100 text-pink-700',
      'Đường phố': 'bg-yellow-100 text-yellow-700',
    };
    return colors[category] || 'bg-gray-100 text-gray-700';
  };

  // Thử trích xuất toạ độ từ URL Street View (Google Maps, wonav, v.v.)
  const extractCoordsFromUrl = (
    rawUrl: string
  ): { lat: number; lng: number } | undefined => {
    if (!rawUrl) return undefined;

    // Nếu là iframe thì lấy src trước
    const iframeMatch = rawUrl.match(/src=["']([^"']+)["']/);
    const url = iframeMatch ? iframeMatch[1] : rawUrl;

    // 1) Dạng Google Maps: .../@lat,lng,...
    const atMatch = url.match(/@(-?\d+\.?\d*),\s*(-?\d+\.?\d*)/);
    if (atMatch) {
      const lat = parseFloat(atMatch[1]);
      const lng = parseFloat(atMatch[2]);
      if (!isNaN(lat) && !isNaN(lng)) return { lat, lng };
    }

    // 2) Dạng Google Maps embed: !3dLAT!4dLNG
    const dMatch = url.match(/!3d(-?\d+\.?\d*)!4d(-?\d+\.?\d*)/);
    if (dMatch) {
      const lat = parseFloat(dMatch[1]);
      const lng = parseFloat(dMatch[2]);
      if (!isNaN(lat) && !isNaN(lng)) return { lat, lng };
    }

    // 3) Query dạng q=lat,lng hoặc center=lat,lng
    const qMatch = url.match(/[?&](?:q|center)=(-?\d+\.?\d*),\s*(-?\d+\.?\d*)/);
    if (qMatch) {
      const lat = parseFloat(qMatch[1]);
      const lng = parseFloat(qMatch[2]);
      if (!isNaN(lat) && !isNaN(lng)) return { lat, lng };
    }

    // 4) Một số dịch vụ (như wonav) có thể dùng lat=..&lng=..
    const latParam = url.match(/[?&]lat=(-?\d+\.?\d*)/);
    const lngParam = url.match(/[?&]lng=(-?\d+\.?\d*)/);
    if (latParam && lngParam) {
      const lat = parseFloat(latParam[1]);
      const lng = parseFloat(lngParam[1]);
      if (!isNaN(lat) && !isNaN(lng)) return { lat, lng };
    }

    return undefined;
  };

  const getMapsLink = (location: StreetViewLocation) => {
    const coords =
      location.coordinates || extractCoordsFromUrl(location.url) || defaultCoordinates;
    if (coords) {
      const { lat, lng } = coords;
      // Directions: origin = vị trí hiện tại, destination = toạ độ location
      return `https://www.google.com/maps/dir/?api=1&origin=Current+Location&destination=${lat},${lng}&travelmode=driving`;
    }
    // Fallback: nếu url đã là link Google Maps thì dùng luôn
    if (location.url.includes('google.com/maps')) {
      return location.url;
    }
    return undefined;
  };

  return (
    <div className={`flex flex-col lg:flex-row gap-4 ${className}`}>
      {/* Sidebar - Location List */}
      {showSidebar && hasMultipleLocations && (
        <div
          className={`lg:w-80 flex-shrink-0 transition-all duration-300 ${
            sidebarOpen ? 'block' : 'hidden lg:block'
          }`}
        >
          <Card className="h-full">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-blue-600" />
                  Địa điểm
                </h3>
                <Badge variant="secondary">{locations.length}</Badge>
              </div>

              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {locations.map((location, index) => (
                  <button
                    key={index}
                    onClick={() => goToLocation(index)}
                    className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                      currentIndex === index
                        ? 'border-blue-500 bg-blue-50 shadow-md'
                        : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                          currentIndex === index
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-200 text-gray-600'
                        }`}
                      >
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className={`font-medium truncate ${
                            currentIndex === index
                              ? 'text-blue-900'
                              : 'text-gray-900'
                          }`}
                        >
                          {location.title}
                        </p>
                        {location.description && (
                          <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                            {location.description}
                          </p>
                        )}
                        {location.category && (
                          <Badge
                            variant="secondary"
                            className={`mt-2 text-xs ${getCategoryColor(
                              location.category
                            )}`}
                          >
                            {location.category}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Street View Area */}
      <div className="flex-1 min-w-0 w-full">
        <div className="relative w-full">
          {/* Street View Embed */}
          <div className="rounded-lg overflow-hidden border shadow-lg bg-gray-100 w-full">
            <div
              className="w-full h-[500px] lg:h-[600px]"
              dangerouslySetInnerHTML={{
                __html: currentLocation.url.includes('<iframe')
                  ? currentLocation.url.replace(/width="[^"]*"/, 'width="100%"').replace(/height="[^"]*"/, 'height="100%"')
                  : `<iframe src="${currentLocation.url}" width="100%" height="100%" style="border:0;width:100%;height:100%;" allowfullscreen loading="lazy"></iframe>`,
              }}
            />
          </div>

          {/* Nút chỉ đường mở Google Maps nếu có toạ độ */}
          {getMapsLink(currentLocation) && (
            <div className="absolute top-4 right-4 z-10">
              <a
                href={getMapsLink(currentLocation)}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button
                  size="sm"
                  className="shadow-lg bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
                >
                  <Navigation className="w-4 h-4" />
                  <span>Chỉ đường</span>
                </Button>
              </a>
            </div>
          )}

          {/* Navigation Arrows (for mobile or when sidebar hidden) */}
          {hasMultipleLocations && (
            <>
              <button
                type="button"
                onClick={goPrev}
                className="absolute top-1/2 left-4 -translate-y-1/2 bg-white/95 hover:bg-white w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110"
                aria-label="Địa điểm trước"
              >
                <div className="w-4 h-4 rounded-full bg-gray-700"></div>
              </button>
              <button
                type="button"
                onClick={goNext}
                className="absolute top-1/2 right-4 -translate-y-1/2 bg-white/95 hover:bg-white w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110"
                aria-label="Địa điểm tiếp theo"
              >
                <div className="w-4 h-4 rounded-full bg-gray-700"></div>
              </button>
            </>
          )}

          {/* Bỏ khung thông tin chèn ở dưới để không che nội dung 360 */}
        </div>

        {/* Quick Navigation Dots (optional, for touch devices) */}
        {hasMultipleLocations && locations.length <= 10 && (
          <div className="flex justify-center gap-2 mt-4">
            {locations.map((_, index) => (
              <button
                key={index}
                onClick={() => goToLocation(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  currentIndex === index
                    ? 'bg-blue-500 w-8'
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`Đến địa điểm ${index + 1}`}
              />
            ))}
          </div>
        )}

        {/* Info Card */}
        <Card className="mt-4 bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
          <CardContent className="p-3 md:p-4">
            <div className="flex items-start gap-2 md:gap-3">
              <Info className="w-4 h-4 md:w-5 md:h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800 flex-1">
                <p className="font-medium mb-1 text-sm md:text-base">
                  💡 Mẹo: Khám phá {destinationName} qua Street View
                </p>
                <ul className="space-y-1 text-xs md:text-sm">
                  <li>• Sử dụng chuột hoặc ngón tay để xoay 360°</li>
                  <li>• Click vào các mũi tên trên đường để di chuyển</li>
                  <li>
                    • Chọn các địa điểm khác nhau từ danh sách bên{' '}
                    {showSidebar ? 'trái' : 'hoặc dùng nút điều hướng'}
                  </li>
                  <li>• Bấm nút fullscreen để trải nghiệm tốt hơn</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

