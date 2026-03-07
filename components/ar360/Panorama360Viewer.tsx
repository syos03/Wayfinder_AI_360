'use client';

/**
 * Panorama 360° Image Viewer
 * Displays equirectangular 360° images with pan/zoom via Pannellum (CDN)
 */

import { useEffect, useRef, useState } from 'react';
import { Image as ImageIcon, Maximize2 } from 'lucide-react';
import Image from 'next/image';
import { useMemo } from 'react';

type PannellumViewer = {
  loadScene?: (id: string, config?: Record<string, unknown>, duration?: number) => void;
  destroy?: () => void;
};

export type HotspotLink = {
  from: string; // filename or url substring to match source panorama
  to: string;   // filename or url substring to find target panorama
  yaw: number;
  pitch: number;
  label?: string;
};

interface Panorama360ViewerProps {
  images: string[];
  destinationName: string;
  hotspots?: HotspotLink[];
  onImageClick?: (yaw: number, pitch: number) => void; // Callback when clicking on image (for hotspot placement)
  editMode?: boolean; // Enable click-to-place hotspot mode
}

const PANELLUM_JS = 'https://cdn.jsdelivr.net/npm/pannellum@2.5.6/build/pannellum.js';
const PANELLUM_CSS = 'https://cdn.jsdelivr.net/npm/pannellum@2.5.6/build/pannellum.css';

// Simple loader to avoid injecting scripts multiple times
const loadOnce = (url: string, tag: 'script' | 'link') =>
  new Promise<void>((resolve, reject) => {
    if (
      document.querySelector(
        `${tag === 'script' ? 'script' : 'link[href]'}[data-url="${url}"]`
      )
    ) {
      resolve();
      return;
    }
    if (tag === 'script') {
      const s = document.createElement('script');
      s.src = url;
      s.async = true;
      s.dataset.url = url;
      s.onload = () => resolve();
      s.onerror = () => reject(new Error(`Failed to load ${url}`));
      document.head.appendChild(s);
    } else {
      const l = document.createElement('link');
      l.rel = 'stylesheet';
      l.href = url;
      l.dataset.url = url;
      l.onload = () => resolve();
      l.onerror = () => reject(new Error(`Failed to load ${url}`));
      document.head.appendChild(l);
    }
  });

export default function Panorama360Viewer({
  images,
  destinationName,
  hotspots = [],
  onImageClick,
  editMode = false,
}: Panorama360ViewerProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Normalize URLs: separate for Pannellum (absolute) and Next/Image (relative)
  const isAbsolute = (url: string) =>
    url.startsWith('http://') ||
    url.startsWith('https://') ||
    url.startsWith('//') ||
    url.startsWith('data:') ||
    url.startsWith('blob:');

  // For Pannellum viewer - needs absolute URLs
  const pannellumUrls = useMemo(() => {
    return (images || []).map((url) => {
      if (!url) return url;
      if (isAbsolute(url)) return url;
      
      // Clean up path: remove "public/" prefix if present
      let cleaned = url.trim().replace(/^public[\\/]/, '');
      if (!cleaned.startsWith('/')) {
        cleaned = '/' + cleaned;
      }
      
      // Convert to absolute URL for Pannellum
      if (typeof window !== 'undefined') {
        // Pannellum can handle spaces, but encode the full path properly
        // Split path and encode each segment, but keep slashes
        const parts = cleaned.split('/');
        const encodedParts = parts.map((part, index) => {
          if (!part) return ''; // Empty segments (leading/trailing slashes)
          // Encode the segment but allow common safe chars
          return encodeURIComponent(part);
        });
        const encodedPath = encodedParts.join('/');
        const fullUrl = `${window.location.origin}${encodedPath}`;
        console.log('Pannellum URL:', { original: url, cleaned, encodedPath, fullUrl });
        return fullUrl;
      }
      return cleaned;
    });
  }, [images]);

  // For Next/Image thumbnails - needs relative paths
  const thumbnailUrls = useMemo(() => {
    return (images || []).map((url) => {
      if (!url) return url;
      if (isAbsolute(url)) return url;
      
      // Clean up path: remove "public/" prefix if present
      let cleaned = url.trim().replace(/^public[\\/]/, '');
      if (!cleaned.startsWith('/')) {
        cleaned = '/' + cleaned;
      }
      return cleaned;
    });
  }, [images]);

  const viewerContainerRef = useRef<HTMLDivElement | null>(null);
  const viewerRef = useRef<PannellumViewer | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Extract filename from URL/path for matching
  const extractFilename = (url: string): string => {
    if (!url) return '';
    // Remove query params and hash
    const cleanUrl = url.split('?')[0].split('#')[0];
    // Extract filename from path
    const parts = cleanUrl.split('/');
    const filename = parts[parts.length - 1].toLowerCase();
    // Also handle encoded filenames
    try {
      return decodeURIComponent(filename);
    } catch {
      return filename;
    }
  };
  
  // Normalize string for matching (remove spaces, special chars)
  const normalizeForMatch = (str: string): string => {
    return str.toLowerCase().trim().replace(/\s+/g, ' ').replace(/[^\w\s.-]/g, '');
  };

  // Inject custom CSS for text-based hotspots (no arrow, just label)
  useEffect(() => {
    const styleId = 'pannellum-hotspot-custom-style';
    if (document.getElementById(styleId)) return;

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      /* Text-based hotspot style - Clean and modern */
      .pnlm-hotspot-base {
        cursor: pointer !important;
        transition: all 0.2s ease !important;
        pointer-events: auto !important;
        z-index: 100 !important;
      }
      
      /* Main text label - always visible */
      .pnlm-hotspot-base.text-label-hotspot {
        background: rgba(0, 0, 0, 0.75) !important;
        color: white !important;
        padding: 10px 16px !important;
        border-radius: 8px !important;
        font-size: 14px !important;
        font-weight: 600 !important;
        white-space: nowrap !important;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5) !important;
        border: 2px solid rgba(255, 255, 255, 0.3) !important;
        backdrop-filter: blur(4px) !important;
        /* Stable layout */
        display: inline-block !important;
        text-align: center !important;
        line-height: 1.3 !important;
        /* Ensure clickable */
        pointer-events: auto !important;
        user-select: none !important;
        -webkit-user-select: none !important;
      }
      
      /* Hover effect - brighter and larger */
      .pnlm-hotspot-base.text-label-hotspot:hover {
        background: rgba(37, 99, 235, 0.9) !important;
        border-color: rgba(255, 255, 255, 0.8) !important;
        box-shadow: 0 6px 20px rgba(37, 99, 235, 0.5), 0 0 0 4px rgba(37, 99, 235, 0.2) !important;
      }
      
      /* Active/click effect */
      .pnlm-hotspot-base.text-label-hotspot:active {
        opacity: 0.8 !important;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4) !important;
      }
      
      /* Optional: Add icon before text */
      .pnlm-hotspot-base.text-label-hotspot::before {
        content: '👉 ' !important;
        font-size: 14px !important;
      }
      
      /* Pulsing animation to draw attention */
      @keyframes hotspot-pulse {
        0%, 100% {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5), 0 0 0 0 rgba(255, 255, 255, 0.7);
        }
        50% {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5), 0 0 0 10px rgba(255, 255, 255, 0);
        }
      }
      
      .pnlm-hotspot-base.text-label-hotspot {
        animation: hotspot-pulse 2.5s ease-in-out infinite !important;
      }
      
      .pnlm-hotspot-base.text-label-hotspot:hover {
        animation: none !important;
      }
      
      /* Hide the default .pnlm-info tooltip since we're using the label itself */
      .pnlm-hotspot-base.text-label-hotspot .pnlm-info {
        display: none !important;
      }
      
      /* Smooth transition for scene changes - Crossfade effect */
      .pnlm-container {
        transition: opacity 0.8s ease-in-out, filter 0.8s ease-in-out !important;
      }
      
      /* Crossfade animation during scene transition */
      .pnlm-container.transitioning {
        opacity: 0.7 !important;
        filter: blur(2px) brightness(0.9) !important;
      }
      
      /* Hide loading spinner during transitions */
      .pnlm-load-box {
        display: none !important;
      }
      
      /* Smooth scene fade */
      .pnlm-render-container {
        transition: opacity 0.8s cubic-bezier(0.4, 0, 0.2, 1) !important;
      }
    `;
    document.head.appendChild(style);

    return () => {
      const existingStyle = document.getElementById(styleId);
      if (existingStyle) existingStyle.remove();
    };
  }, []);

  // Build hotspots for a specific scene using provided hotspots
  const buildHotspotsForScene = (currentIndex: number) => {
    if (!hotspots || hotspots.length === 0) {
      console.log('No hotspots provided for scene', currentIndex);
      return [];
    }
    
    const currentImage = images[currentIndex] || '';
    const currentFilename = extractFilename(currentImage);
    const currentName = currentImage.toLowerCase();
    
    console.log('Building hotspots for scene', currentIndex, {
      currentImage,
      currentFilename,
      hotspotsCount: hotspots.length,
    });
    
    const matchedLinks = hotspots.filter((link) => {
      const fromMatch = normalizeForMatch(link.from);
      const normalizedCurrentFilename = normalizeForMatch(currentFilename);
      const normalizedCurrentPath = normalizeForMatch(currentName);
      
      // Match by filename (exact or partial) or full path
      const matchesFilename = normalizedCurrentFilename.includes(fromMatch) || fromMatch.includes(normalizedCurrentFilename);
      const matchesPath = normalizedCurrentPath.includes(fromMatch) || fromMatch.includes(normalizedCurrentPath);
      const matches = matchesFilename || matchesPath;
      
      if (matches) {
        console.log('✅ Matched hotspot:', { 
          from: link.from, 
          to: link.to, 
          currentFilename,
          normalizedFrom: fromMatch,
          normalizedCurrent: normalizedCurrentFilename,
        });
      }
      
      return matches;
    });
    
    if (matchedLinks.length === 0) {
      console.log('No matching hotspots found for image:', currentFilename);
      return [];
    }

    console.log('Found', matchedLinks.length, 'matching hotspots');

    return matchedLinks
      .map((link) => {
        const toMatch = normalizeForMatch(link.to);
        const targetIndex = images.findIndex((img) => {
          const imgFilename = extractFilename(img);
          const imgName = img.toLowerCase();
          const normalizedImgFilename = normalizeForMatch(imgFilename);
          const normalizedImgPath = normalizeForMatch(imgName);
          const matchesFilename = normalizedImgFilename.includes(toMatch) || toMatch.includes(normalizedImgFilename);
          const matchesPath = normalizedImgPath.includes(toMatch) || toMatch.includes(normalizedImgPath);
          return matchesFilename || matchesPath;
        });
        
        if (targetIndex === -1) {
          console.warn(`Hotspot target not found: "${link.to}" in images:`, images.map(extractFilename));
          return null;
        }
        
        // Use 'scene' type for smoother transitions
        // Create text-based hotspot with visible label
        const hotspotLabel = link.label || `Đến ${link.to}`;
        
        console.log('🎯 Creating hotspot:', {
          from: link.from,
          to: link.to,
          targetIndex,
          yaw: link.yaw,
          pitch: link.pitch,
          sceneId: `scene_${targetIndex}`,
          originalLabel: link.label,
          displayLabel: hotspotLabel,
        });
        
        return {
          pitch: link.pitch,
          yaw: link.yaw,
          type: 'scene',
          sceneId: `scene_${targetIndex}`,
          // Add CSS class for text label styling
          cssClass: 'text-label-hotspot',
          // Custom createTooltipFunc to display text inside the hotspot
          createTooltipFunc: (hotSpotDiv: HTMLElement) => {
            // Clear default Pannellum content
            while (hotSpotDiv.firstChild) {
              hotSpotDiv.removeChild(hotSpotDiv.firstChild);
            }
            // Add text directly to the div
            const textNode = document.createTextNode(hotspotLabel);
            hotSpotDiv.appendChild(textNode);
            
            // Wait for next frame to get accurate dimensions
            requestAnimationFrame(() => {
              const width = hotSpotDiv.offsetWidth;
              const height = hotSpotDiv.offsetHeight;
              
              // Center the hotspot using negative margin
              // This works better than trying to modify left/top
              hotSpotDiv.style.marginLeft = `${-(width / 2)}px`;
              hotSpotDiv.style.marginTop = `${-(height / 2)}px`;
              
              console.log('✅ Hotspot centered:', {
                text: hotspotLabel,
                yaw: link.yaw,
                pitch: link.pitch,
                width,
                height,
                marginLeft: -(width / 2),
                marginTop: -(height / 2),
              });
            });
          },
        };
      })
      .filter(Boolean);
  };

  useEffect(() => {
    if (!pannellumUrls || pannellumUrls.length === 0) return;

    let cancelled = false;

    const init = async () => {
      try {
        await loadOnce(PANELLUM_CSS, 'link');
        await loadOnce(PANELLUM_JS, 'script');

        if (cancelled || !viewerContainerRef.current) return;

        // @ts-expect-error - pannellum is injected globally
        const pannellum = window.pannellum;
        if (!pannellum) throw new Error('Pannellum not available on window');

        // Destroy previous instance if any
        if (viewerRef.current?.destroy) {
          viewerRef.current.destroy();
        }

        const panoramaUrl = pannellumUrls[selectedImage];
        console.log('Loading panorama:', panoramaUrl);
        
        // Test if image exists before loading
        const testImage = document.createElement('img');
        testImage.onload = () => {
          console.log('✅ Image exists and can be loaded:', panoramaUrl);
        };
        testImage.onerror = () => {
          console.error('❌ Image failed to load:', panoramaUrl);
          setError(`Không thể tải ảnh: ${panoramaUrl}. Vui lòng kiểm tra đường dẫn.`);
        };
        testImage.src = panoramaUrl;
        
        // Build all scenes configuration for smooth navigation
        const scenes: Record<string, any> = {};
        pannellumUrls.forEach((url, index) => {
          const sceneHotspots = buildHotspotsForScene(index);
          console.log(`📍 Scene ${index} (${extractFilename(images[index])}) hotspots:`, sceneHotspots);
          if (sceneHotspots.length > 0) {
            console.log(`  └─ ${sceneHotspots.length} hotspot(s) configured for this scene`);
          }
          scenes[`scene_${index}`] = {
            type: 'equirectangular',
            panorama: url,
            autoLoad: true,
            hfov: 110,
            hotSpots: sceneHotspots,
          };
        });
        
        console.log('✅ All scenes configured:', Object.keys(scenes));
        const totalHotspots = Object.values(scenes).reduce((sum: number, scene: any) => sum + (scene.hotSpots?.length || 0), 0);
        console.log(`🎯 Total hotspots across all scenes: ${totalHotspots}`);

        const viewer = pannellum.viewer(viewerContainerRef.current, {
          default: {
            firstScene: `scene_${selectedImage}`,
            sceneFadeDuration: 800, // Longer fade for smoother transition
          },
          scenes: scenes,
          autoLoad: true,
          showZoomCtrl: true,
          autoRotate: 0,
          compass: false,
          backgroundColor: [0, 0, 0],
          // Smooth scene transitions
          autoRotateInactivityDelay: 0,
          // Disable default hotspot styling
          disableKeyboardCtrl: false,
        });

        // Add click handler for edit mode (to get yaw/pitch from click position)
        // Use drag detection to distinguish between click and drag (rotation)
        let mouseDownPos: { x: number; y: number } | null = null;
        let hasDragged = false;
        let dragThreshold = 5; // pixels - if mouse moves more than this, it's a drag
        
          // Helper function to calculate yaw/pitch from click event
        const calculateYawPitchFromClick = (event: MouseEvent): { yaw: number; pitch: number } | null => {
          try {
            // First, try Pannellum's built-in method (most accurate)
            if (typeof (viewer as any).mouseEventToCoords === 'function') {
              const coords = (viewer as any).mouseEventToCoords(event);
              if (coords && Array.isArray(coords) && coords.length >= 2) {
                // ⚠️ IMPORTANT: Pannellum mouseEventToCoords returns [pitch, yaw] NOT [yaw, pitch]!
                // pitch: -90 to 90, yaw: -180 to 180
                let pitch = Number(coords[0]);
                let yaw = Number(coords[1]);
                
                console.log('🔍 Raw coords from mouseEventToCoords:', { coords, pitch, yaw });
                
                // Validate
                if (isNaN(yaw) || isNaN(pitch) || !isFinite(yaw) || !isFinite(pitch)) {
                  console.warn('⚠️ Invalid coords from mouseEventToCoords, trying fallback');
                } else {
                  // Normalize yaw to -180 to 180 range
                  while (yaw > 180) yaw -= 360;
                  while (yaw < -180) yaw += 360;
                  // Normalize pitch to -90 to 90 range
                  pitch = Math.max(-90, Math.min(90, pitch));
                  
                  console.log('✅ Using Pannellum mouseEventToCoords:', { 
                    raw: { pitch: coords[0], yaw: coords[1] },
                    normalized: { yaw: yaw.toFixed(2), pitch: pitch.toFixed(2) }
                  });
                  return { yaw, pitch };
                }
              }
            }
          } catch (err) {
            console.warn('⚠️ mouseEventToCoords error, using fallback:', err);
          }
          
          // Fallback: Manual calculation
          const canvas = viewerContainerRef.current?.querySelector('canvas');
          if (!canvas) return null;
          
          const canvasRect = canvas.getBoundingClientRect();
          const clickX = event.clientX - canvasRect.left;
          const clickY = event.clientY - canvasRect.top;
          
          const currentYaw = viewer.getYaw();
          const currentPitch = viewer.getPitch();
          const currentHfov = viewer.getHfov();
          
          const canvasWidth = canvas.width || canvas.clientWidth;
          const canvasHeight = canvas.height || canvas.clientHeight;
          
          // Calculate relative position (0 to 1)
          const relativeX = clickX / canvasWidth;
          const relativeY = clickY / canvasHeight;
          
          // Calculate VFOV
          const aspectRatio = canvasWidth / canvasHeight;
          const hfovRad = (currentHfov * Math.PI) / 180;
          const vfovRad = 2 * Math.atan(Math.tan(hfovRad / 2) / aspectRatio);
          const vfovDeg = (vfovRad * 180) / Math.PI;
          
          // Calculate yaw and pitch using equirectangular projection
          // In Pannellum's equirectangular projection:
          // - The canvas shows a portion of the 360° panorama
          // - The visible portion is centered at currentYaw with width = currentHfov
          // - Left edge (relativeX = 0) = currentYaw - hfov/2
          // - Center (relativeX = 0.5) = currentYaw  
          // - Right edge (relativeX = 1) = currentYaw + hfov/2
          // Formula: yaw = currentYaw + (relativeX - 0.5) * hfov
          const yaw = currentYaw + ((relativeX - 0.5) * currentHfov);
          
          // For pitch:
          // - Top edge (relativeY = 0) = currentPitch + vfov/2
          // - Center (relativeY = 0.5) = currentPitch
          // - Bottom edge (relativeY = 1) = currentPitch - vfov/2
          // Formula: pitch = currentPitch - (relativeY - 0.5) * vfov
          const pitch = currentPitch - ((relativeY - 0.5) * vfovDeg);
          
          // Validate
          if (isNaN(yaw) || isNaN(pitch) || !isFinite(yaw) || !isFinite(pitch)) {
            console.error('❌ Invalid calculated coordinates');
            return null;
          }
          
          // Normalize
          let normalizedYaw = yaw;
          if (normalizedYaw > 180) normalizedYaw -= 360;
          if (normalizedYaw < -180) normalizedYaw += 360;
          const normalizedPitch = Math.max(-90, Math.min(90, pitch));
          
          console.log('📐 Manual calculation:', {
            click: { x: clickX.toFixed(1), y: clickY.toFixed(1) },
            relative: { x: relativeX.toFixed(3), y: relativeY.toFixed(3) },
            current: { yaw: currentYaw.toFixed(2), pitch: currentPitch.toFixed(2), hfov: currentHfov.toFixed(2) },
            calculated: { yaw: normalizedYaw.toFixed(2), pitch: normalizedPitch.toFixed(2) }
          });
          
          return { yaw: normalizedYaw, pitch: normalizedPitch };
        };
        
        // Attach click handler directly to Pannellum container
        const attachCanvasClickHandler = () => {
          const container = viewerContainerRef.current;
          if (!container || !editMode || !onImageClick) return;
          
          const containerClickHandler = (event: MouseEvent) => {
            // Only process if Ctrl/Cmd is held
            if (!event.ctrlKey && !event.metaKey) return;
            
            // Don't trigger if clicking on controls or hotspots
            const target = event.target as HTMLElement;
            if (target.closest('.pnlm-controls') || target.closest('.pnlm-hotspot-base')) {
              return;
            }
            
            const coords = calculateYawPitchFromClick(event);
            if (coords) {
              onImageClick(coords.yaw, coords.pitch);
            }
          };
          
          // Use capture phase to catch event before Pannellum processes it
          // But stop propagation to prevent Pannellum from rotating the view
          const wrappedHandler = (event: MouseEvent) => {
            if (event.ctrlKey || event.metaKey) {
              event.stopPropagation(); // Prevent Pannellum from handling the click
              containerClickHandler(event);
            }
          };
          
          container.addEventListener('click', wrappedHandler, true);
          return () => container.removeEventListener('click', wrappedHandler, true);
        };
        
        const handleMouseDown = (event: MouseEvent) => {
          // Only track if clicking inside viewer container
          if (!viewerContainerRef.current || !viewerContainerRef.current.contains(event.target as Node)) {
            return;
          }
          
          // Don't track if clicking on controls or hotspots
          const target = event.target as HTMLElement;
          if (target.closest('.pnlm-controls') || target.closest('.pnlm-hotspot-base')) {
            return;
          }
          
          // Only track if Ctrl/Cmd key is pressed (allows normal rotation when not pressed)
          if (!event.ctrlKey && !event.metaKey) {
            return;
          }
          
          mouseDownPos = { x: event.clientX, y: event.clientY };
          hasDragged = false;
        };
        
        const handleMouseMove = (event: MouseEvent) => {
          if (mouseDownPos) {
            const dx = Math.abs(event.clientX - mouseDownPos.x);
            const dy = Math.abs(event.clientY - mouseDownPos.y);
            if (dx > dragThreshold || dy > dragThreshold) {
              hasDragged = true; // User is dragging, not clicking
            }
          }
        };
        
        const handleMouseUp = (event: MouseEvent) => {
          // Only trigger if it was a click (not a drag) and we're in edit mode
          if (!editMode || !onImageClick || !viewerContainerRef.current) {
            mouseDownPos = null;
            hasDragged = false;
            return;
          }
          
          // Only process clicks inside viewer container
          if (!viewerContainerRef.current.contains(event.target as Node)) {
            mouseDownPos = null;
            hasDragged = false;
            return;
          }
          
          // Don't trigger if clicking on controls or hotspots
          const target = event.target as HTMLElement;
          if (target.closest('.pnlm-controls') || target.closest('.pnlm-hotspot-base')) {
            mouseDownPos = null;
            hasDragged = false;
            return;
          }
          
          // Only process if Ctrl/Cmd was held and it was a click (not a drag)
          if (!event.ctrlKey && !event.metaKey) {
            mouseDownPos = null;
            hasDragged = false;
            return;
          }
          
          // Only process if it was a click (not a drag)
          if (hasDragged || !mouseDownPos) {
            mouseDownPos = null;
            hasDragged = false;
            return;
          }
          
          // Use the shared calculation function
          const coords = calculateYawPitchFromClick(event);
          if (coords) {
            onImageClick(coords.yaw, coords.pitch);
          }
          
          // Reset
          mouseDownPos = null;
          hasDragged = false;
        };
        
        if (editMode && onImageClick && viewerContainerRef.current) {
          // Attach click handler directly to container (more accurate, uses mouseEventToCoords if available)
          // Wait a bit for canvas to be rendered
          setTimeout(() => {
            const cleanup = attachCanvasClickHandler();
            if (cleanup) {
              (viewerRef.current as any)._canvasClickCleanup = cleanup;
            }
          }, 500);
          
          // Note: We're using attachCanvasClickHandler which handles clicks directly
          // The handleMouseUp fallback is disabled to avoid duplicate calculations
        }

        // Listen for scene changes to add smooth transitions
        viewer.on('scenechange', () => {
          setIsTransitioning(true);
          setTimeout(() => setIsTransitioning(false), 800);
        });

        viewerRef.current = viewer;

        setIsReady(true);
        setError(null);
      } catch (err) {
        console.error('Pannellum init error:', err);
        setError('Không thể tải viewer 360° (cần kết nối mạng để tải thư viện).');
      }
    };

    init();

    return () => {
      cancelled = true;
      // Cleanup canvas click handler
      if ((viewerRef.current as any)?._canvasClickCleanup) {
        (viewerRef.current as any)._canvasClickCleanup();
      }
      // Cleanup click handlers from document
      if ((viewerRef.current as any)?._clickHandlers) {
        const handlers = (viewerRef.current as any)._clickHandlers;
        document.removeEventListener('mousedown', handlers.mousedown);
        document.removeEventListener('mousemove', handlers.mousemove);
        document.removeEventListener('mouseup', handlers.mouseup);
      }
      if (viewerRef.current?.destroy) {
        viewerRef.current.destroy();
      }
    };
  }, [pannellumUrls, selectedImage, hotspots, editMode, onImageClick]);

  // When changing image via thumbnail, update viewer scene with smooth animation
  useEffect(() => {
    if (!isReady || !viewerRef.current) return;
    try {
      setIsTransitioning(true);
      
      // Add smooth crossfade effect
      if (viewerContainerRef.current) {
        viewerContainerRef.current.classList.add('transitioning');
      }
      
      // Use Pannellum's built-in scene transition for smooth navigation
      const sceneId = `scene_${selectedImage}`;
      viewerRef.current.loadScene?.(sceneId, undefined, 800);
      
      // Remove transition class after animation
      setTimeout(() => {
        if (viewerContainerRef.current) {
          viewerContainerRef.current.classList.remove('transitioning');
        }
        setIsTransitioning(false);
      }, 800);
    } catch (err) {
      console.error('Pannellum change scene error:', err);
      setIsTransitioning(false);
      if (viewerContainerRef.current) {
        viewerContainerRef.current.classList.remove('transitioning');
      }
    }
  }, [isReady, selectedImage]);

  if (!pannellumUrls || pannellumUrls.length === 0) {
    return (
      <div className="w-full h-[500px] bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <ImageIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Chưa có ảnh 360° nào</p>
          <p className="text-sm text-gray-500 mt-2">
            Admin có thể thêm ảnh panorama 360° cho điểm đến này
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Main 360° Viewer */}
      <div className="relative w-full h-[500px] rounded-lg overflow-hidden border-2 border-gray-200 bg-black">
        {editMode && (
          <div className="absolute top-4 left-4 z-20 bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-medium shadow-lg">
            🖱️ Click vào ảnh để chọn vị trí hotspot
          </div>
        )}
        <div 
          ref={viewerContainerRef} 
          className={`w-full h-full ${isTransitioning ? 'transitioning' : ''}`}
          style={{
            cursor: editMode ? 'crosshair' : 'default',
          }}
        />

        {/* Fullscreen button overlay (uses browser fullscreen) */}
        <button
          onClick={() => setIsFullscreen(!isFullscreen)}
          className="absolute top-4 right-4 bg-white/90 hover:bg-white p-2 rounded-lg shadow-lg transition-all"
          title="Xem toàn màn hình"
        >
          <Maximize2 className="w-5 h-5 text-gray-700" />
        </button>

        {/* Image counter */}
        <div className="absolute bottom-4 left-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
          {selectedImage + 1} / {pannellumUrls.length}
        </div>

        {error && (
          <div className="absolute inset-0 bg-black/70 text-white flex items-center justify-center p-4 text-center text-sm">
            {error}
        </div>
        )}
      </div>

      {/* Image thumbnails */}
      {thumbnailUrls.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {thumbnailUrls.map((image, index) => (
            <button
              key={index}
              onClick={() => setSelectedImage(index)}
              className={`relative flex-shrink-0 w-24 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                selectedImage === index
                  ? 'border-blue-600 ring-2 ring-blue-200'
                  : 'border-gray-300 hover:border-blue-400'
              }`}
            >
              <Image
                src={image}
                alt={`Thumbnail ${index + 1}`}
                fill
                className="object-cover"
                sizes="96px"
              />
            </button>
          ))}
        </div>
      )}

      {/* Info banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <ImageIcon className="w-5 h-5 text-blue-600 mt-0.5" />
          <div className="flex-1 text-sm">
            <p className="font-semibold text-blue-900 mb-1">
              📸 Ảnh Panorama 360° - {destinationName}
            </p>
            <p className="text-blue-700">
              🖱️ Dùng chuột/trackpad để xoay 360°. <strong>Click vào text hotspot</strong> để di chuyển giữa các góc nhìn khác nhau
            </p>
            <p className="text-blue-600 text-xs mt-1">
              💡 Mẹo: Di chuột qua hotspot để xem hiệu ứng. Click vào ảnh nhỏ bên dưới để chuyển nhanh
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

