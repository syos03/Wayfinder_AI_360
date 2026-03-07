'use client';

/**
 * AR360 Switcher Component
 * Switch between Map View, 360 photos, and 360 videos
 * Now using FREE Google Maps Embed (no API key needed!)
 */

import { useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import LeafletMapViewer from './LeafletMapViewer';
import Panorama360Viewer from './Panorama360Viewer';
import GoogleMapsEmbed from './GoogleMapsEmbed';
import {
  MultiLocationStreetViewer,
  StreetViewLocation,
} from './MultiLocationStreetViewer';
import { MapPin, Image, Video, Navigation } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export type PanoramaHotspot = {
  from: string;
  to: string;
  yaw: number;
  pitch: number;
  label?: string;
};

interface AR360SwitcherProps {
  lat: number;
  lng: number;
  destinationName: string;
  panoramaImages?: string[];
  panoramaHotspots?: PanoramaHotspot[];
  youtubeVideos?: Array<{ videoId: string; title: string; is360: boolean }>;
  streetViewLocations?: StreetViewLocation[];
}

export function AR360Switcher({
  lat,
  lng,
  destinationName,
  panoramaImages = [],
  panoramaHotspots = [],
  youtubeVideos = [],
  streetViewLocations = [],
}: AR360SwitcherProps) {
  const [activeTab, setActiveTab] = useState('street');

  const has360Videos = youtubeVideos.filter((v) => v.is360).length > 0;
  
  // Only use enhanced mode (streetViewLocations)
  const hasStreetView = streetViewLocations.length > 0;
  const totalStreetViews = streetViewLocations.length;

  const totalTabs = 1 + (hasStreetView ? 1 : 0) + (panoramaImages.length > 0 ? 1 : 0) + (has360Videos ? 1 : 0);
  const gridCols = totalTabs === 2 ? 'grid-cols-2' : totalTabs === 3 ? 'grid-cols-3' : 'grid-cols-4';

  return (
    <div className="w-full">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className={`grid w-full ${gridCols}`}>
          <TabsTrigger value="street" className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            <span className="hidden sm:inline">Bản đồ</span>
          </TabsTrigger>

          {hasStreetView && (
            <TabsTrigger value="streetview" className="flex items-center gap-2">
              <Navigation className="w-4 h-4" />
              <span className="hidden sm:inline">Street View ({totalStreetViews})</span>
            </TabsTrigger>
          )}
          
          {panoramaImages.length > 0 && (
            <TabsTrigger value="panorama" className="flex items-center gap-2">
              <Image className="w-4 h-4" />
              <span className="hidden sm:inline">Ảnh 360°</span>
            </TabsTrigger>
          )}

          {has360Videos && (
            <TabsTrigger value="youtube" className="flex items-center gap-2">
              <Video className="w-4 h-4" />
              <span className="hidden sm:inline">Video 360°</span>
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="street" className="mt-4">
          <div className="rounded-lg overflow-hidden">
            <LeafletMapViewer
              lat={lat}
              lng={lng}
              name={destinationName}
            />
          </div>
        </TabsContent>

        {hasStreetView && (
          <TabsContent value="streetview" className="mt-4">
            <MultiLocationStreetViewer
              locations={streetViewLocations}
              destinationName={destinationName}
              showSidebar={true}
              defaultCoordinates={{ lat, lng }}
            />
          </TabsContent>
        )}

        {panoramaImages.length > 0 && (
          <TabsContent value="panorama" className="mt-4">
            <Panorama360Viewer
              images={panoramaImages}
              destinationName={destinationName}
              hotspots={panoramaHotspots}
            />
          </TabsContent>
        )}

        {has360Videos && (
          <TabsContent value="youtube" className="mt-4">
            <div className="space-y-4">
              {youtubeVideos
                .filter((v) => v.is360)
                .map((video) => (
                  <div
                    key={video.videoId}
                    className="rounded-lg overflow-hidden border"
                  >
                    <div className="aspect-video">
                      <iframe
                        src={`https://www.youtube.com/embed/${video.videoId}?rel=0`}
                        title={video.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                        className="w-full h-full"
                      />
                    </div>
                    <div className="p-3 bg-white">
                      <p className="font-medium">{video.title}</p>
                    </div>
                  </div>
                ))}
            </div>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}

/**
 * Basic Street View with Sidebar Component
 * For basic mode (streetViewSpots) with sidebar navigation
 */
interface BasicStreetViewWithSidebarProps {
  streetViewSpots: Array<{ url: string; title?: string }>;
  destinationName: string;
  currentIndex: number;
  onIndexChange: (index: number) => void;
  lat: number;
  lng: number;
}

function BasicStreetViewWithSidebar({
  streetViewSpots,
  destinationName,
  currentIndex,
  onIndexChange,
  lat,
  lng,
}: BasicStreetViewWithSidebarProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const currentSpot = streetViewSpots[currentIndex];
  const hasMultipleSpots = streetViewSpots.length > 1;

  const goToSpot = (index: number) => {
    onIndexChange(index);
  };

  const goPrev = () => {
    onIndexChange((currentIndex - 1 + streetViewSpots.length) % streetViewSpots.length);
  };

  const goNext = () => {
    onIndexChange((currentIndex + 1) % streetViewSpots.length);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-4">
      {/* Sidebar - Spot List */}
      {hasMultipleSpots && (
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
                  Góc nhìn
                </h3>
                <Badge variant="secondary">{streetViewSpots.length}</Badge>
              </div>

              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {streetViewSpots.map((spot, index) => (
                  <button
                    key={index}
                    onClick={() => goToSpot(index)}
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
                          {spot.title || `Góc nhìn ${index + 1}`}
                        </p>
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
          <GoogleMapsEmbed
            lat={lat}
            lng={lng}
            destinationName={destinationName}
            mode="streetview"
            embedUrl={currentSpot?.url}
          />

          {/* Navigation Arrows */}
          {hasMultipleSpots && (
            <>
              <button
                type="button"
                onClick={goPrev}
                className="absolute top-1/2 left-4 -translate-y-1/2 bg-white/95 hover:bg-white w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110"
                aria-label="Góc trước"
              >
                <div className="w-4 h-4 rounded-full bg-gray-700"></div>
              </button>
              <button
                type="button"
                onClick={goNext}
                className="absolute top-1/2 right-4 -translate-y-1/2 bg-white/95 hover:bg-white w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110"
                aria-label="Góc tiếp theo"
              >
                <div className="w-4 h-4 rounded-full bg-gray-700"></div>
              </button>
            </>
          )}

          {/* Info Overlay */}
          <div className="absolute bottom-4 left-4 right-4 z-10">
            <Card className="bg-white/95 backdrop-blur-sm shadow-xl">
              <CardContent className="p-3 md:p-4">
                <div className="flex items-start gap-2 md:gap-3">
                  <div className="flex-shrink-0 bg-blue-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm">
                    {currentIndex + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900 text-sm md:text-base">
                      {currentSpot?.title || `Góc nhìn ${currentIndex + 1}`}
                    </h4>
                    <div className="flex items-center flex-wrap gap-3 mt-2 text-xs text-gray-500">
                      <span>
                        {currentIndex + 1} / {streetViewSpots.length}
                      </span>
                    </div>
                  </div>
                  {hasMultipleSpots && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSidebarOpen(!sidebarOpen)}
                      className="lg:hidden flex-shrink-0"
                    >
                      {sidebarOpen ? 'Ẩn' : 'Hiện'}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Quick Navigation Dots */}
        {hasMultipleSpots && streetViewSpots.length <= 10 && (
          <div className="flex justify-center gap-2 mt-4">
            {streetViewSpots.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSpot(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  currentIndex === index
                    ? 'bg-blue-500 w-8'
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`Đến góc nhìn ${index + 1}`}
              />
            ))}
          </div>
        )}

        {/* Info Card - Tips */}
        <Card className="mt-4 bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
          <CardContent className="p-3 md:p-4">
            <div className="flex items-start gap-2 md:gap-3">
              <Navigation className="w-4 h-4 md:w-5 md:h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800 flex-1">
                <p className="font-medium mb-1 text-sm md:text-base">
                  💡 Mẹo: Khám phá {destinationName} qua Street View
                </p>
                <ul className="space-y-1 text-xs md:text-sm">
                  <li>• Sử dụng chuột hoặc ngón tay để xoay 360°</li>
                  <li>• Click vào các mũi tên trên đường để di chuyển</li>
                  <li>
                    • Chọn các góc nhìn khác nhau từ danh sách bên{' '}
                    {hasMultipleSpots ? 'trái' : 'hoặc dùng nút điều hướng'}
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

