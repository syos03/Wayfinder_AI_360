'use client';

/**
 * AR360 Switcher Component
 * Switch between Map View, 360 photos, and 360 videos
 */

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import LeafletMapViewer from './LeafletMapViewer';
import Panorama360Viewer from './Panorama360Viewer';
import {
  MultiLocationStreetViewer,
  StreetViewLocation,
} from './MultiLocationStreetViewer';
import { Image, MapPin, Navigation, Video } from 'lucide-react';

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
  streetViewSpots?: Array<{ url: string; title?: string }>;
  streetViewLocations?: StreetViewLocation[];
}

export function AR360Switcher({
  lat,
  lng,
  destinationName,
  panoramaImages = [],
  panoramaHotspots = [],
  youtubeVideos = [],
  streetViewSpots = [],
  streetViewLocations = [],
}: AR360SwitcherProps) {
  const [activeTab, setActiveTab] = useState('street');

  const has360Videos = youtubeVideos.some((video) => video.is360);
  const normalizedStreetViewLocations: StreetViewLocation[] =
    streetViewLocations.length > 0
      ? streetViewLocations
      : streetViewSpots.map((spot, index) => ({
          id: `street-view-${index}`,
          url: spot.url,
          title: spot.title || `Góc nhìn ${index + 1}`,
        }));

  const hasStreetView = normalizedStreetViewLocations.length > 0;
  const totalStreetViews = normalizedStreetViewLocations.length;
  const totalTabs =
    1 +
    (hasStreetView ? 1 : 0) +
    (panoramaImages.length > 0 ? 1 : 0) +
    (has360Videos ? 1 : 0);
  const gridCols =
    totalTabs === 2 ? 'grid-cols-2' : totalTabs === 3 ? 'grid-cols-3' : 'grid-cols-4';

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
            <LeafletMapViewer lat={lat} lng={lng} name={destinationName} />
          </div>
        </TabsContent>

        {hasStreetView && (
          <TabsContent value="streetview" className="mt-4">
            <MultiLocationStreetViewer
              locations={normalizedStreetViewLocations}
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
                .filter((video) => video.is360)
                .map((video) => (
                  <div key={video.videoId} className="rounded-lg overflow-hidden border">
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
