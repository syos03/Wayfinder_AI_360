'use client';

/**
 * Street View Viewer Component
 * Display Google Street View panorama
 */

import { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { AlertCircle } from 'lucide-react';

interface StreetViewViewerProps {
  lat: number;
  lng: number;
  className?: string;
}

export function StreetViewViewer({ lat, lng, className = '' }: StreetViewViewerProps) {
  const panoRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY) {
      setError('Google Maps API key is not configured');
      setLoading(false);
      return;
    }

    const loader = new Loader({
      apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY,
      version: 'weekly',
    });

    loader
      .load()
      .then((google) => {
        if (!panoRef.current) return;

        try {
          const panorama = new google.maps.StreetViewPanorama(
            panoRef.current,
            {
              position: { lat, lng },
              pov: { heading: 165, pitch: 0 },
              zoom: 1,
              fullscreenControl: true,
              addressControl: false,
              linksControl: true,
              panControl: true,
              enableCloseButton: false,
            }
          );

          // Check if Street View is available at this location
          const streetViewService = new google.maps.StreetViewService();
          streetViewService.getPanorama(
            { location: { lat, lng }, radius: 100 },
            (data, status) => {
              if (status !== google.maps.StreetViewStatus.OK) {
                setError('Street View không khả dụng tại vị trí này');
              }
              setLoading(false);
            }
          );
        } catch (err) {
          console.error('Street View error:', err);
          setError('Không thể tải Street View');
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('Google Maps loader error:', err);
        setError('Không thể tải Google Maps');
        setLoading(false);
      });
  }, [lat, lng]);

  if (loading) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-sm text-gray-600">Đang tải Street View...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex items-center justify-center bg-gray-50 ${className}`}>
        <div className="text-center p-6">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={panoRef}
      className={`${className}`}
      style={{ minHeight: '400px' }}
    />
  );
}

