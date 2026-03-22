'use client';

/**
 * Safe Image Component
 * Automatically handles external images that may not be configured in next.config.js
 * Falls back to regular img tag for external images to avoid hostname configuration issues
 */

import { useState } from 'react';
import Image from 'next/image';

interface SafeImageProps {
  src: string;
  alt: string;
  fill?: boolean;
  width?: number;
  height?: number;
  className?: string;
  sizes?: string;
  priority?: boolean;
  [key: string]: any;
}

export default function SafeImage({
  src,
  alt,
  fill,
  width,
  height,
  className = '',
  sizes,
  priority,
  ...props
}: SafeImageProps) {
  const [useFallback, setUseFallback] = useState(false);

  // List of hostnames configured in next.config.js to avoid "unconfigured host" errors
  const ALLOWED_HOSTS = [
    'res.cloudinary.com',
    'unsplash.com',
    'images.unsplash.com',
    'picsum.photos',
    'googleusercontent.com',
    'lh3.googleusercontent.com',
    'ytimg.com',
    'i.ytimg.com',
    'wikimedia.org',
    'upload.wikimedia.org',
    'vtv.vn',
    'pexels.com',
    'images.pexels.com',
    'vetaucondao.vn',
    'vietnamairlines.com',
    'www.vietnamairlines.com',
    'letsflytravel.vn',
    'mia.vn',
    'phongnhatourist.com',
    'bizweb.dktcdn.net',
    'dktcdn.net',
    'xanhsm.com',
    'quangbinhtravel.vn',
    'dulichso.vn',
    'ivivu.com',
    'klook.com',
    'imagekit.io'
  ];

  // List of hostnames known to be problematic with Next.js Image optimization
  // (e.g. they block head-less fetches, have hotlink protection, or are very slow)
  const OPTIMIZATION_BLACKLIST = [
    'quangbinhtravel.vn'
  ];

  const isConfiguredHost = (url: string) => {
    try {
      if (url.startsWith('/') || url.startsWith('./') || url.startsWith('../')) return true;
      const hostname = new URL(url).hostname;
      
      // Don't optimize blacklisted hosts
      if (OPTIMIZATION_BLACKLIST.some(host => hostname === host || hostname.endsWith('.' + host))) {
        return false;
      }

      return ALLOWED_HOSTS.some(host => hostname === host || hostname.endsWith('.' + host));
    } catch {
      return false;
    }
  };

  const canUseNextImage = !useFallback && isConfiguredHost(src);

  if (canUseNextImage) {
    if (fill) {
      return (
        <Image
          src={src}
          alt={alt}
          fill
          className={className}
          sizes={sizes}
          priority={priority}
          onError={() => setUseFallback(true)}
          {...props}
        />
      );
    }
    return (
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={className}
        sizes={sizes}
        priority={priority}
        onError={() => setUseFallback(true)}
        {...props}
      />
    );
  }

  // Fallback to regular img tag
  if (fill) {
    return (
      <img
        src={src}
        alt={alt}
        className={className}
        style={{ objectFit: 'cover', width: '100%', height: '100%' }}
        loading="lazy"
        onError={(e) => {
          console.error('Image load error:', src);
        }}
        {...props}
      />
    );
  }
  return (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      loading="lazy"
      onError={(e) => {
        console.error('Image load error:', src);
      }}
      {...props}
    />
  );
}

