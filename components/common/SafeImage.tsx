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

  // Check if it's an external URL
  const isExternal = src?.startsWith('http://') || src?.startsWith('https://');

  // For external images, use regular img tag to avoid hostname configuration issues
  // This allows any external image to work without needing to add hostname to next.config.js
  if (isExternal || useFallback) {
    if (fill) {
      return (
        <img
          src={src}
          alt={alt}
          className={className}
          style={{ objectFit: 'cover', width: '100%', height: '100%' }}
          onError={(e) => {
            console.error('Image load error:', src);
            // Image will show broken image icon, but won't crash the app
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
        onError={(e) => {
          console.error('Image load error:', src);
        }}
        {...props}
      />
    );
  }

  // For local images, use Next.js Image for optimization
  try {
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
  } catch (error) {
    // Fallback to regular img if Image component fails
    setUseFallback(true);
    if (fill) {
      return (
        <img
          src={src}
          alt={alt}
          className={className}
          style={{ objectFit: 'cover', width: '100%', height: '100%' }}
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
        {...props}
      />
    );
  }
}

