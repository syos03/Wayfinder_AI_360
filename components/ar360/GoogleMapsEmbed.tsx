 'use client';
 
 /**
  * Google Maps/Street View Embed (FREE - No API key needed!)
  * Directly embed Google Maps iframe
  */
 
 import { Button } from '@/components/ui/button';
 import { Navigation } from 'lucide-react';
 
 interface GoogleMapsEmbedProps {
   lat?: number;
   lng?: number;
   destinationName: string;
   mode?: 'streetview' | 'satellite' | 'roadmap';
   embedUrl?: string; // Admin-provided Street View URL
 }
 
 export default function GoogleMapsEmbed({
  lat,
  lng,
  destinationName,
  mode = 'streetview',
  embedUrl,
}: GoogleMapsEmbedProps) {
  // Extract URL from iframe if admin pasted full iframe code
  const extractUrl = (urlOrIframe: string) => {
    if (urlOrIframe.includes('<iframe')) {
      const srcMatch = urlOrIframe.match(/src="([^"]+)"/);
      return srcMatch ? srcMatch[1] : urlOrIframe;
    }
    return urlOrIframe;
  };

  // Generate Google Maps embed URL (100% FREE, no API key needed!)
  const getEmbedUrl = () => {
    // If admin provided custom Street View URL, use that
    if (embedUrl) {
      return extractUrl(embedUrl);
    }
    
    // Fallback: Simple Google Maps embed with marker
    return `https://maps.google.com/maps?q=${lat},${lng}&hl=en&z=15&output=embed`;
  };

  // Link to open in Google Maps app/website with Directions from current location
  const getMapsLink = () => {
    if (lat !== undefined && lng !== undefined) {
      // Directions: origin = current location, destination = destination coordinates
      return `https://www.google.com/maps/dir/?api=1&origin=Current+Location&destination=${lat},${lng}&travelmode=driving`;
    }

    // Fallback: search by destination name
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      destinationName
    )}`;
  };

  return (
    <div className="w-full h-[500px] rounded-lg overflow-hidden border-2 border-gray-200 relative">
      <iframe
        src={getEmbedUrl()}
        width="100%"
        height="100%"
        style={{ border: 0 }}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        allow="accelerometer; gyroscope; magnetometer; geolocation"
        title={`Google Maps - ${destinationName}`}
      />

      {/* Nút chỉ đường mở Google Maps */}
      {lat !== undefined && lng !== undefined && (
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
      )}
    </div>
  );
}

