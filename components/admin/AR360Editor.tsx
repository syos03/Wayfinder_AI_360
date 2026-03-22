'use client';

/**
 * AR360 Editor Component
 * Manage panorama images and YouTube videos for destinations
 */

import { useEffect, useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Plus, X, Save, Image as ImageIcon, Video, Globe, Compass } from 'lucide-react';
import { toast } from 'sonner';
import EnhancedLocationEditor, {
  StreetViewLocation,
} from './EnhancedLocationEditor';
import HotspotEditor from './HotspotEditor';

interface AR360EditorProps {
  destinationId: string;
  destinationName: string;
  initialPanoramaImages?: string[];
  initialYoutubeVideos?: Array<{
    videoId: string;
    title: string;
    is360: boolean;
  }>;
  initialStreetViewLocations?: StreetViewLocation[];
  initialPanoramaHotspots?: Array<{
    from: string;
    to: string;
    yaw: number;
    pitch: number;
    label?: string;
  }>;
  destinationCoordinates?: {
    lat: number;
    lng: number;
  };
  onSave?: () => void;
}

export default function AR360Editor({
  destinationId,
  destinationName,
  initialPanoramaImages = [],
  initialYoutubeVideos = [],
  initialStreetViewLocations = [],
  initialPanoramaHotspots = [],
  destinationCoordinates,
  onSave,
}: AR360EditorProps) {
  const [panoramaImages, setPanoramaImages] = useState<string[]>(initialPanoramaImages);
  const [panoramaInput, setPanoramaInput] = useState('');
  
  const [youtubeVideos, setYoutubeVideos] = useState<Array<{ videoId: string; title: string; is360: boolean }>>(
    initialYoutubeVideos
  );
  const [youtubeVideoId, setYoutubeVideoId] = useState('');
  const [youtubeVideoTitle, setYoutubeVideoTitle] = useState('');
  const [youtubeIs360, setYoutubeIs360] = useState(false);
  
  const [streetViewLocations, setStreetViewLocations] = useState<StreetViewLocation[]>(
    initialStreetViewLocations
  );

  const [panoramaHotspots, setPanoramaHotspots] = useState<
    Array<{ from: string; to: string; yaw: number; pitch: number; label?: string }>
  >(initialPanoramaHotspots);
  
  const [isSaving, setIsSaving] = useState(false);

  // Create a stable string representation for comparison
  const initialHotspotsKey = useMemo(() => 
    JSON.stringify(initialPanoramaHotspots || []), 
    [initialPanoramaHotspots]
  );
  const initialImagesKey = useMemo(() => 
    JSON.stringify(initialPanoramaImages || []), 
    [initialPanoramaImages]
  );
  const initialVideosKey = useMemo(() => 
    JSON.stringify(initialYoutubeVideos || []), 
    [initialYoutubeVideos]
  );
  const initialLocationsKey = useMemo(() => 
    JSON.stringify(initialStreetViewLocations || []), 
    [initialStreetViewLocations]
  );

  // Sync local state when parent provides new initial data (e.g. after save or switching destination)
  useEffect(() => {
    console.log('📥 Received new props:', {
      panoramaImages: initialPanoramaImages.length,
      youtubeVideos: initialYoutubeVideos.length,
      streetViewLocations: initialStreetViewLocations.length,
      panoramaHotspots: initialPanoramaHotspots.length,
    });
    if (initialPanoramaHotspots.length > 0) {
      console.log('🔗 Initial panoramaHotspots:', JSON.stringify(initialPanoramaHotspots, null, 2));
    }

    // Always update state from props to ensure sync
    setPanoramaImages(initialPanoramaImages);
    setYoutubeVideos(initialYoutubeVideos);
    setStreetViewLocations(initialStreetViewLocations);
    setPanoramaHotspots(initialPanoramaHotspots);
    
    setPanoramaInput('');
    setYoutubeVideoId('');
    setYoutubeVideoTitle('');
    setYoutubeIs360(false);
  }, [
    initialImagesKey,
    initialVideosKey,
    initialLocationsKey,
    initialHotspotsKey,
  ]);

  // Deep comparison for hotspots (handle undefined/empty arrays)
  const hotspotsEqual = (a: any[], b: any[]) => {
    if (!a && !b) return true;
    if (!a || !b) return false;
    if (a.length !== b.length) return false;
    return a.every((item, idx) => {
      const other = b[idx];
      return (
        item.from === other.from &&
        item.to === other.to &&
        Math.abs(item.yaw - other.yaw) < 0.01 &&
        Math.abs(item.pitch - other.pitch) < 0.01 &&
        (item.label || '') === (other.label || '')
      );
    });
  };

  const hasChanges =
    JSON.stringify(panoramaImages) !== JSON.stringify(initialPanoramaImages) ||
    JSON.stringify(youtubeVideos) !== JSON.stringify(initialYoutubeVideos) ||
    JSON.stringify(streetViewLocations) !== JSON.stringify(initialStreetViewLocations) ||
    !hotspotsEqual(panoramaHotspots, initialPanoramaHotspots);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      console.log('💾 Saving AR360 data:', {
        panoramaImages: panoramaImages.length,
        youtubeVideos: youtubeVideos.length,
        streetViewLocations: streetViewLocations.length,
        panoramaHotspots: panoramaHotspots.length,
      });
      if (panoramaHotspots.length > 0) {
        console.log('🔗 Current panoramaHotspots before save:', JSON.stringify(panoramaHotspots, null, 2));
      } else {
        console.warn('⚠️ No hotspots to save! panoramaHotspots is empty');
      }

      // Prepare request body - only send enhanced mode data
      const requestBody: any = {
        panoramaImages,
        youtubeVideos,
        streetViewLocations,
        panoramaHotspots,
      };

      console.log('📤 Sending request body:', {
        panoramaImages: requestBody.panoramaImages?.length || 0,
        youtubeVideos: requestBody.youtubeVideos?.length || 0,
        streetViewLocations: requestBody.streetViewLocations?.length || 0,
        panoramaHotspots: requestBody.panoramaHotspots?.length || 0,
      });
      if (requestBody.panoramaHotspots?.length > 0) {
        console.log('🔗 panoramaHotspots being sent:', JSON.stringify(requestBody.panoramaHotspots, null, 2));
      }

      const response = await fetch(`/api/admin/destinations/${destinationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update AR360 content');
      }

      const result = await response.json();
      console.log('✅ Save successful, returned data:', {
        panoramaImages: result.data?.destination?.panoramaImages?.length || 0,
        panoramaHotspots: result.data?.destination?.panoramaHotspots?.length || 0,
      });
      if (result.data?.destination?.panoramaHotspots?.length > 0) {
        console.log('🔗 Returned panoramaHotspots:', JSON.stringify(result.data.destination.panoramaHotspots, null, 2));
      }

      // Update local state immediately from response to ensure UI reflects saved data
      if (result.data?.destination) {
        const saved = result.data.destination;
        console.log('🔄 Updating local state from saved data...');
        if (saved.panoramaImages) {
          setPanoramaImages(saved.panoramaImages);
          console.log('  📸 Updated panoramaImages:', saved.panoramaImages.length);
        }
        if (saved.panoramaHotspots !== undefined) {
          setPanoramaHotspots(saved.panoramaHotspots || []);
          console.log('  🔗 Updated panoramaHotspots:', saved.panoramaHotspots?.length || 0);
        }
        if (saved.youtubeVideos) {
          setYoutubeVideos(saved.youtubeVideos);
          console.log('  📹 Updated youtubeVideos:', saved.youtubeVideos.length);
        }
        if (saved.streetViewLocations !== undefined) {
          setStreetViewLocations(saved.streetViewLocations || []);
          console.log('  🗺️ Updated streetViewLocations:', saved.streetViewLocations?.length || 0);
        }
      }

      toast.success('✅ Đã cập nhật AR360 Virtual Tour thành công!');
      
      // Wait a bit before calling onSave to ensure database is updated
      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (onSave) {
        console.log('🔄 Calling onSave to refresh data...');
        await onSave();
      }
    } catch (error) {
      console.error('❌ Save AR360 error:', error);
      toast.error('❌ Lỗi khi cập nhật AR360 content');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setPanoramaImages(initialPanoramaImages);
    setStreetViewLocations(initialStreetViewLocations);
    setPanoramaHotspots(initialPanoramaHotspots);
    setYoutubeVideos(initialYoutubeVideos);
    setPanoramaInput('');
    setYoutubeVideoId('');
    setYoutubeVideoTitle('');
    setYoutubeIs360(false);
    toast.info('🔄 Đã reset về dữ liệu ban đầu');
  };

  const addPanoramaImage = () => {
    if (panoramaInput.trim()) {
      setPanoramaImages([...panoramaImages, panoramaInput.trim()]);
      setPanoramaInput('');
    }
  };

  const removePanoramaImage = (index: number) => {
    setPanoramaImages(panoramaImages.filter((_, i) => i !== index));
  };

  const addYoutubeVideo = () => {
    if (youtubeVideoId.trim() && youtubeVideoTitle.trim()) {
      setYoutubeVideos([
        ...youtubeVideos,
        {
          videoId: youtubeVideoId.trim(),
          title: youtubeVideoTitle.trim(),
          is360: youtubeIs360,
        },
      ]);
      setYoutubeVideoId('');
      setYoutubeVideoTitle('');
      setYoutubeIs360(false);
    }
  };

  const removeYoutubeVideo = (index: number) => {
    setYoutubeVideos(youtubeVideos.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Globe className="w-6 h-6 text-blue-600 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-semibold text-blue-900 mb-1">
              🌐 Quản lý AR360 Virtual Tour - {destinationName}
            </h3>
            <p className="text-sm text-blue-700">
              Thêm ảnh panorama 360° và video YouTube để nâng cao trải nghiệm người dùng
            </p>
          </div>
        </div>
      </div>

      {/* Enhanced Mode - Multi Location Editor */}
      <EnhancedLocationEditor
        locations={streetViewLocations}
        onChange={setStreetViewLocations}
        destinationCoordinates={destinationCoordinates}
      />

      {/* Panorama 360° Images */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-purple-600" />
            📸 Ảnh Panorama 360°
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">Hướng dẫn</h4>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Upload ảnh panorama 360° lên Cloudinary hoặc Imgur</li>
              <li>• Copy URL ảnh và paste vào ô bên dưới</li>
              <li>• Khuyến nghị: 3-5 ảnh/điểm đến, độ phân giải min 2000x1000px</li>
              <li>• Format: JPG, PNG</li>
            </ul>
          </div>

          <div className="flex gap-2">
            <Input
              value={panoramaInput}
              onChange={(e) => setPanoramaInput(e.target.value)}
              placeholder="https://example.com/panorama-360.jpg"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addPanoramaImage();
                }
              }}
            />
            <Button
              type="button"
              onClick={addPanoramaImage}
              variant="outline"
              disabled={!panoramaInput.trim()}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          {panoramaImages.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">
                Danh sách ảnh ({panoramaImages.length}):
              </p>
              <div className="space-y-2">
                {panoramaImages.map((img, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-white border rounded-lg"
                  >
                    <div className="flex-1 flex items-center gap-3">
                      <span className="text-sm text-gray-500">#{index + 1}</span>
                      <span className="text-sm truncate max-w-md">{img}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removePanoramaImage(index)}
                      className="text-red-600 hover:text-red-800 p-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {panoramaImages.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Chưa có ảnh panorama 360° nào</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Panorama Hotspots (Navigation links) - Advanced Editor */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-amber-600" />
            🔗 Điểm nhảy giữa các ảnh 360° (hotspot)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <HotspotEditor
            images={panoramaImages}
            hotspots={panoramaHotspots}
            onHotspotsChange={setPanoramaHotspots}
          />
        </CardContent>
      </Card>

      {/* YouTube 360 Videos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Video className="w-5 h-5 text-red-600" />
            📹 Video YouTube
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">Hướng dẫn</h4>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Tìm video YouTube (VD: https://youtube.com/watch?v=<strong>dQw4w9WgXcQ</strong>)</li>
              <li>• Copy phần <strong>Video ID</strong> (dQw4w9WgXcQ)</li>
              <li>• Nhập tiêu đề mô tả cho video</li>
              <li>• Check "Video 360°" nếu đây là video 360 độ</li>
            </ul>
          </div>

          <div className="space-y-3 p-4 border rounded-lg bg-white">
            <Input
              value={youtubeVideoId}
              onChange={(e) => setYoutubeVideoId(e.target.value)}
              placeholder="Video ID (VD: dQw4w9WgXcQ)"
            />
            <Input
              value={youtubeVideoTitle}
              onChange={(e) => setYoutubeVideoTitle(e.target.value)}
              placeholder="Tiêu đề video"
            />
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is360"
                checked={youtubeIs360}
                onChange={(e) => setYoutubeIs360(e.target.checked)}
                className="w-4 h-4"
              />
              <label htmlFor="is360" className="text-sm font-medium">
                Đây là video 360°
              </label>
            </div>
            <Button
              type="button"
              onClick={addYoutubeVideo}
              variant="outline"
              className="w-full"
              disabled={!youtubeVideoId.trim() || !youtubeVideoTitle.trim()}
            >
              <Plus className="w-4 h-4 mr-2" />
              Thêm video
            </Button>
          </div>

          {youtubeVideos.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">
                Danh sách video ({youtubeVideos.length}):
              </p>
              <div className="space-y-2">
                {youtubeVideos.map((video, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-white border rounded-lg"
                  >
                    <div className="flex-1">
                      <p className="font-medium">{video.title}</p>
                      <p className="text-sm text-gray-600">
                        ID: {video.videoId}
                        {video.is360 && (
                          <Badge variant="secondary" className="ml-2">
                            360°
                          </Badge>
                        )}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeYoutubeVideo(index)}
                      className="text-red-600 hover:text-red-800 p-1"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {youtubeVideos.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              <Video className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Chưa có video YouTube nào</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Save Actions */}
      <div className="flex gap-3 sticky bottom-4 bg-white p-4 rounded-lg border shadow-lg">
        <Button
          onClick={handleSave}
          disabled={!hasChanges || isSaving}
          className="flex-1"
          size="lg"
        >
          <Save className="w-5 h-5 mr-2" />
          {isSaving ? 'Đang lưu...' : 'Lưu AR360 Content'}
        </Button>
        
        <Button
          onClick={handleReset}
          variant="outline"
          disabled={!hasChanges || isSaving}
          size="lg"
        >
          <X className="w-5 h-5 mr-2" />
          Reset
        </Button>
      </div>

      {/* Summary */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h4 className="font-semibold text-green-900 mb-2">📊 Tóm tắt</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-green-700">Ảnh Panorama 360°:</span>
            <span className="ml-2 font-bold text-green-900">{panoramaImages.length}</span>
          </div>
          <div>
            <span className="text-green-700">Video YouTube:</span>
            <span className="ml-2 font-bold text-green-900">
              {youtubeVideos.length}
              {youtubeVideos.filter((v) => v.is360).length > 0 && (
                <span className="text-xs ml-1">({youtubeVideos.filter((v) => v.is360).length} video 360°)</span>
              )}
            </span>
          </div>
          <div>
            <span className="text-green-700">
              Địa điểm Street View:
            </span>
            <span className="ml-2 font-bold text-green-900">
              {streetViewLocations.length}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
