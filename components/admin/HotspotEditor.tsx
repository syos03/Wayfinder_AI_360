'use client';

/**
 * Advanced Hotspot Editor Component
 * Allows easy creation and editing of panorama hotspots with visual feedback
 */

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, X, MousePointer2, RotateCw, ArrowUpDown, Target, Info } from 'lucide-react';
import Panorama360Viewer from '@/components/ar360/Panorama360Viewer';
import type { HotspotLink } from '@/components/ar360/Panorama360Viewer';

interface HotspotEditorProps {
  images: string[];
  hotspots: HotspotLink[];
  onHotspotsChange: (hotspots: HotspotLink[]) => void;
}

export default function HotspotEditor({
  images,
  hotspots,
  onHotspotsChange,
}: HotspotEditorProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [selectedFromImage, setSelectedFromImage] = useState<string>('');
  const [selectedToImage, setSelectedToImage] = useState<string>('');
  const [tempYaw, setTempYaw] = useState<number>(0);
  const [tempPitch, setTempPitch] = useState<number>(0);
  const [tempLabel, setTempLabel] = useState<string>('');
  const [clickToPlaceMode, setClickToPlaceMode] = useState<boolean>(false);

  // Extract filename from path
  const getFilename = (path: string): string => {
    const parts = path.split('/');
    return parts[parts.length - 1];
  };

  // Get image options for select dropdowns
  const imageOptions = images.map((img, idx) => ({
    value: getFilename(img),
    label: getFilename(img),
    fullPath: img,
  }));

  const addHotspot = () => {
    if (!selectedFromImage || !selectedToImage) {
      console.warn('Cannot add hotspot: missing from or to image');
      return;
    }
    const newHotspot: HotspotLink = {
      from: selectedFromImage,
      to: selectedToImage,
      yaw: tempYaw,
      pitch: tempPitch,
      label: tempLabel || undefined,
    };
    console.log('Adding new hotspot:', newHotspot);
    onHotspotsChange([...hotspots, newHotspot]);
    // Reset form
    setSelectedFromImage('');
    setSelectedToImage('');
    setTempYaw(0);
    setTempPitch(0);
    setTempLabel('');
  };

  const updateHotspot = (index: number, field: keyof HotspotLink, value: any) => {
    const updated = [...hotspots];
    updated[index] = {
      ...updated[index],
      [field]: field === 'yaw' || field === 'pitch' ? Number(value) || 0 : value,
    };
    onHotspotsChange(updated);
  };

  const removeHotspot = (index: number) => {
    onHotspotsChange(hotspots.filter((_, i) => i !== index));
  };

  const startEdit = (index: number) => {
    const hotspot = hotspots[index];
    setEditingIndex(index);
    setSelectedFromImage(hotspot.from);
    setSelectedToImage(hotspot.to);
    setTempYaw(hotspot.yaw);
    setTempPitch(hotspot.pitch);
    setTempLabel(hotspot.label || '');
  };

  const saveEdit = () => {
    if (editingIndex === null || !selectedFromImage || !selectedToImage) return;
    
    const updated = [...hotspots];
    updated[editingIndex] = {
      from: selectedFromImage,
      to: selectedToImage,
      yaw: tempYaw,
      pitch: tempPitch,
      label: tempLabel || undefined,
    };
    onHotspotsChange(updated);
    setEditingIndex(null);
    setSelectedFromImage('');
    setSelectedToImage('');
    setTempYaw(0);
    setTempPitch(0);
    setTempLabel('');
  };

  const cancelEdit = () => {
    setEditingIndex(null);
    setSelectedFromImage('');
    setSelectedToImage('');
    setTempYaw(0);
    setTempPitch(0);
    setTempLabel('');
  };

  // Create preview hotspots: include existing hotspots + temporary preview hotspot
  const previewHotspots = (() => {
    // If editing, exclude the hotspot being edited from preview (we'll show the temp one instead)
    const allHotspots = editingIndex !== null 
      ? hotspots.filter((_, idx) => idx !== editingIndex)
      : [...hotspots];
    
    // If editing or creating a new hotspot with valid from/to images, add a temporary preview hotspot
    if (selectedFromImage && selectedToImage) {
      const tempHotspot: HotspotLink = {
        from: selectedFromImage,
        to: selectedToImage,
        yaw: tempYaw,
        pitch: tempPitch,
        label: tempLabel || (editingIndex !== null ? 'Đang chỉnh sửa...' : 'Xem trước'),
      };
      
      // Add the temporary hotspot for preview
      allHotspots.push(tempHotspot);
    }
    
    return allHotspots;
  })();

  return (
    <div className="space-y-4">
      {/* Instructions */}
      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1 text-sm">
            <p className="font-semibold text-blue-900 mb-2">🎯 Cách tạo Hotspot dễ dàng:</p>
            <ol className="space-y-1.5 list-decimal list-inside text-blue-800">
              <li>Chọn ảnh <strong>"Từ"</strong> và <strong>"Đến"</strong> từ dropdown</li>
              <li><strong>Cách 1 (Dễ nhất):</strong> Bật "Click để chọn vị trí" → <strong>Giữ Ctrl (hoặc Cmd trên Mac)</strong> và click vào ảnh 360° tại vị trí muốn đặt hotspot</li>
              <li><strong>Cách 2:</strong> Xoay ảnh đến vị trí muốn (click bình thường để xoay), sau đó nhập yaw/pitch thủ công</li>
              <li>Thêm nhãn mô tả (tùy chọn) và bấm <strong>"Thêm hotspot"</strong></li>
              <li>Click vào hotspot trong preview để test chuyển đổi mượt mà</li>
            </ol>
          </div>
        </div>
      </div>

      {/* Add/Edit Hotspot Form */}
      <Card className="border-2 border-dashed border-blue-300">
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Target className="w-5 h-5 text-blue-600" />
              <h4 className="font-semibold text-lg">
                {editingIndex !== null ? '✏️ Chỉnh sửa Hotspot' : '➕ Thêm Hotspot mới'}
              </h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* From Image */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <RotateCw className="w-4 h-4 text-gray-500" />
                  Ảnh nguồn (From)
                </label>
                <Select
                  value={selectedFromImage}
                  onValueChange={setSelectedFromImage}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn ảnh nguồn..." />
                  </SelectTrigger>
                  <SelectContent>
                    {imageOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* To Image */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Target className="w-4 h-4 text-gray-500" />
                  Ảnh đích (To)
                </label>
                <Select
                  value={selectedToImage}
                  onValueChange={setSelectedToImage}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn ảnh đích..." />
                  </SelectTrigger>
                  <SelectContent>
                    {imageOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Click to Place Toggle */}
            <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <input
                type="checkbox"
                id="clickToPlace"
                checked={clickToPlaceMode}
                onChange={(e) => setClickToPlaceMode(e.target.checked)}
                className="w-5 h-5 text-blue-600"
              />
              <label htmlFor="clickToPlace" className="text-sm font-medium text-blue-900 cursor-pointer flex-1">
                🖱️ Click vào ảnh để chọn vị trí hotspot (Giữ <strong>Ctrl</strong> hoặc <strong>Cmd</strong> + Click để chọn, click bình thường để xoay ảnh)
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Yaw */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <RotateCw className="w-4 h-4 text-gray-500" />
                  Yaw (quay ngang)
                </label>
                <Input
                  type="number"
                  value={isNaN(tempYaw) ? '' : Math.round(tempYaw)}
                  onChange={(e) => setTempYaw(Number(e.target.value) || 0)}
                  placeholder="0"
                  min={-180}
                  max={180}
                  step={1}
                />
                <p className="text-xs text-gray-500">
                  {clickToPlaceMode ? 'Có thể nhập thủ công hoặc click vào ảnh để tự động điền' : '-180° đến 180°'}
                </p>
              </div>

              {/* Pitch */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <ArrowUpDown className="w-4 h-4 text-gray-500" />
                  Pitch (lên/xuống)
                </label>
                <Input
                  type="number"
                  value={isNaN(tempPitch) ? '' : Math.round(tempPitch)}
                  onChange={(e) => setTempPitch(Number(e.target.value) || 0)}
                  placeholder="0"
                  min={-90}
                  max={90}
                  step={1}
                />
                <p className="text-xs text-gray-500">
                  {clickToPlaceMode ? 'Có thể nhập thủ công hoặc click vào ảnh để tự động điền' : '-90° đến 90°'}
                </p>
              </div>

              {/* Label */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Nhãn (tùy chọn)</label>
                <Input
                  value={tempLabel}
                  onChange={(e) => setTempLabel(e.target.value)}
                  placeholder="VD: Ra ngoài, Vào trong..."
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              {editingIndex !== null ? (
                <>
                  <Button
                    onClick={saveEdit}
                    disabled={!selectedFromImage || !selectedToImage}
                    className="flex-1"
                  >
                    💾 Lưu thay đổi
                  </Button>
                  <Button
                    onClick={cancelEdit}
                    variant="outline"
                  >
                    Hủy
                  </Button>
                </>
              ) : (
                <Button
                  onClick={addHotspot}
                  disabled={!selectedFromImage || !selectedToImage}
                  className="flex-1"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Thêm Hotspot
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preview Viewer */}
      {images.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4 text-sm text-green-800">
              <p className="font-medium mb-1">👁️ Preview & Test:</p>
              <ul className="space-y-1 list-disc list-inside">
                {clickToPlaceMode && (
                  <li className="font-semibold text-green-900">🖱️ <strong>Giữ Ctrl (hoặc Cmd trên Mac) + Click</strong> vào ảnh để chọn vị trí hotspot! (Click bình thường để xoay ảnh)</li>
                )}
                <li>Xoay ảnh để tìm vị trí đặt hotspot</li>
                <li>Click vào text hotspot để test chuyển đổi mượt mà giữa các ảnh</li>
                <li>Hotspot sẽ hiển thị dưới dạng <strong>text label có hiệu ứng</strong> (dễ nhìn và trực quan hơn)</li>
              </ul>
            </div>
            <div className="border rounded-lg overflow-hidden relative">
              <Panorama360Viewer
                images={images}
                destinationName="Preview"
                hotspots={previewHotspots}
                editMode={clickToPlaceMode}
                onImageClick={(yaw, pitch) => {
                  if (clickToPlaceMode) {
                    // Validate values are numbers before setting
                    const validYaw = isNaN(yaw) || !isFinite(yaw) ? 0 : Math.round(yaw);
                    const validPitch = isNaN(pitch) || !isFinite(pitch) ? 0 : Math.round(pitch);
                    setTempYaw(validYaw);
                    setTempPitch(validPitch);
                    console.log('Hotspot position selected:', { yaw: validYaw, pitch: validPitch });
                  }
                }}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Hotspot List */}
      {hotspots.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-lg">📋 Danh sách Hotspot ({hotspots.length})</h4>
              <Badge variant="secondary">{hotspots.length} hotspot</Badge>
            </div>
            <div className="space-y-3">
              {hotspots.map((h, index) => (
                <div
                  key={index}
                  className="p-4 border rounded-lg bg-gradient-to-r from-white to-blue-50 hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-5 gap-3">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Từ</p>
                        <Badge variant="outline" className="font-mono text-xs">
                          {h.from}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Đến</p>
                        <Badge variant="outline" className="font-mono text-xs">
                          {h.to}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Yaw</p>
                        <Badge variant="secondary">{h.yaw}°</Badge>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Pitch</p>
                        <Badge variant="secondary">{h.pitch}°</Badge>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Nhãn</p>
                        <Badge variant={h.label ? 'default' : 'outline'}>
                          {h.label || 'Không có'}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => startEdit(index)}
                      >
                        ✏️ Sửa
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeHotspot(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {hotspots.length === 0 && (
        <div className="text-center py-8 text-gray-400 border-2 border-dashed rounded-lg">
          <MousePointer2 className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Chưa có hotspot nào. Thêm hotspot để tạo liên kết giữa các ảnh 360°</p>
        </div>
      )}
    </div>
  );
}

