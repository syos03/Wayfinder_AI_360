'use client';

/**
 * Enhanced Location Editor Component
 * Advanced management for Street View locations with detailed information
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Plus,
  X,
  MapPin,
  Edit2,
  Check,
  ChevronUp,
  ChevronDown,
  Globe,
  Info,
  Copy,
  Zap,
  Layers,
  RefreshCw,
} from 'lucide-react';

export interface StreetViewLocation {
  id?: string;
  url: string;
  title: string;
  description?: string;
  category?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

interface EnhancedLocationEditorProps {
  locations: StreetViewLocation[];
  onChange: (locations: StreetViewLocation[]) => void;
  destinationCoordinates?: {
    lat: number;
    lng: number;
  };
}

const CATEGORIES = [
  'Cổng chính',
  'Quảng trường',
  'Bãi biển',
  'Khu vui chơi',
  'Nhà hàng',
  'Khách sạn',
  'Đường phố',
  'Công viên',
  'Đền chùa',
  'Bảo tàng',
  'Khu mua sắm',
  'Điểm check-in',
];

export default function EnhancedLocationEditor({
  locations,
  onChange,
  destinationCoordinates,
}: EnhancedLocationEditorProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [previewIndex, setPreviewIndex] = useState<number>(0);

  // Form state for new location
  const [newLocation, setNewLocation] = useState<StreetViewLocation>({
    url: '',
    title: '',
    description: '',
    category: '',
    coordinates: destinationCoordinates,
  });

  const resetNewLocation = () => {
    setNewLocation({
      url: '',
      title: '',
      description: '',
      category: '',
      coordinates: destinationCoordinates,
    });
  };

  const addLocation = () => {
    if (!newLocation.url.trim() || !newLocation.title.trim()) return;

    const location: StreetViewLocation = {
      id: Date.now().toString(),
      url: newLocation.url.trim(),
      title: newLocation.title.trim(),
      description: newLocation.description?.trim() || '',
      category: newLocation.category || '',
      coordinates: newLocation.coordinates,
    };

    onChange([...locations, location]);
    resetNewLocation();
    setPreviewIndex(locations.length);
  };

  const updateLocation = (index: number, updates: Partial<StreetViewLocation>) => {
    const updated = [...locations];
    updated[index] = { ...updated[index], ...updates };
    onChange(updated);
  };

  const removeLocation = (index: number) => {
    const updated = locations.filter((_, i) => i !== index);
    onChange(updated);
    if (previewIndex >= updated.length) {
      setPreviewIndex(Math.max(0, updated.length - 1));
    }
    setEditingIndex(null);
  };

  const moveLocation = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= locations.length) return;

    const updated = [...locations];
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    onChange(updated);
    setPreviewIndex(newIndex);
  };

  const duplicateLocation = (index: number) => {
    const locationToDuplicate = locations[index];
    const duplicated: StreetViewLocation = {
      ...locationToDuplicate,
      id: Date.now().toString(),
      title: `${locationToDuplicate.title} (Copy)`,
    };
    const updated = [...locations];
    updated.splice(index + 1, 0, duplicated);
    onChange(updated);
    setPreviewIndex(index + 1);
  };

  const duplicateMultipleLocations = (index: number, count: number = 3) => {
    const locationToDuplicate = locations[index];
    const duplicated: StreetViewLocation[] = [];
    
    for (let i = 1; i <= count; i++) {
      duplicated.push({
        ...locationToDuplicate,
        id: `${Date.now()}-${i}`,
        title: `${locationToDuplicate.title} ${i}`,
      });
    }
    
    const updated = [...locations];
    updated.splice(index + 1, 0, ...duplicated);
    onChange(updated);
    setPreviewIndex(index + 1);
  };

  const applyTemplateToAll = (sourceIndex: number) => {
    if (locations.length === 0) return;
    
    const sourceLocation = locations[sourceIndex];
    const updated = locations.map((loc, idx) => {
      if (idx === sourceIndex) return loc; // Giữ nguyên địa điểm nguồn
      return {
        ...loc,
        category: sourceLocation.category || loc.category,
        description: sourceLocation.description || loc.description,
        coordinates: sourceLocation.coordinates || loc.coordinates,
      };
    });
    
    onChange(updated);
  };

  const applyTemplateToOthers = (sourceIndex: number) => {
    if (locations.length <= 1) return;
    
    const sourceLocation = locations[sourceIndex];
    const updated = locations.map((loc, idx) => {
      if (idx === sourceIndex) return loc; // Giữ nguyên địa điểm nguồn
      return {
        ...loc,
        category: sourceLocation.category || '',
        description: sourceLocation.description || '',
        coordinates: sourceLocation.coordinates || loc.coordinates,
      };
    });
    
    onChange(updated);
  };

  const extractIframeSrc = (embedCode: string): string => {
    const iframeMatch = embedCode.match(/src=["']([^"']+)["']/);
    return iframeMatch ? iframeMatch[1] : embedCode;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="w-5 h-5 text-blue-600" />
          🗺️ Quản lý Địa điểm Street View (Nâng cao)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Info Section */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-2">
                📌 Hướng dẫn thêm địa điểm Street View:
              </p>
              <ol className="space-y-1 list-decimal list-inside">
                <li>Mở Google Maps → Tìm địa điểm</li>
                <li>Kéo Pegman (con người vàng) vào vị trí Street View</li>
                <li>Click Share → Chọn "Embed a map"</li>
                <li>Copy toàn bộ iframe code hoặc chỉ URL trong src=""</li>
                <li>Điền thông tin chi tiết cho địa điểm</li>
              </ol>
            </div>
          </div>
        </div>

        {/* Quick Add Templates */}
        {locations.length === 0 && (
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Zap className="w-5 h-5 text-purple-600" />
              Gợi ý: Thêm các góc nhìn phổ biến
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {['Cổng chính', 'Quảng trường', 'Bãi biển', 'Khu vui chơi'].map((cat) => (
                <Button
                  key={cat}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setNewLocation({
                      ...newLocation,
                      title: cat,
                      category: cat,
                    });
                  }}
                  className="text-xs"
                >
                  {cat}
                </Button>
              ))}
            </div>
            <p className="text-xs text-gray-600 mt-2">
              💡 Click vào các nút trên để tự động điền tên và phân loại
            </p>
          </div>
        )}

        {/* Add New Location Form */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-gray-900 flex items-center gap-2">
              <Plus className="w-5 h-5 text-green-600" />
              Thêm địa điểm mới
            </h4>
            {locations.length > 0 && (
              <Badge variant="secondary">
                Đã có {locations.length} địa điểm
              </Badge>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="new-title">
                Tên địa điểm <span className="text-red-500">*</span>
              </Label>
              <Input
                id="new-title"
                value={newLocation.title}
                onChange={(e) =>
                  setNewLocation({ ...newLocation, title: e.target.value })
                }
                placeholder="VD: Cổng chính, Quảng trường trung tâm..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-category">Phân loại</Label>
              <select
                id="new-category"
                value={newLocation.category}
                onChange={(e) =>
                  setNewLocation({ ...newLocation, category: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">-- Chọn loại --</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="new-description">Mô tả địa điểm</Label>
            <Textarea
              id="new-description"
              value={newLocation.description}
              onChange={(e) =>
                setNewLocation({ ...newLocation, description: e.target.value })
              }
              placeholder="Mô tả ngắn về địa điểm này..."
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="new-url">
              Street View URL/Embed Code <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="new-url"
              value={newLocation.url}
              onChange={(e) =>
                setNewLocation({ ...newLocation, url: e.target.value })
              }
              placeholder='Paste URL hoặc iframe code, VD: <iframe src="https://www.google.com/maps/embed?pb=!1m0..." width="600" height="450"...</iframe>'
              rows={3}
              className="font-mono text-sm"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="new-lat">Latitude (Optional)</Label>
              <Input
                id="new-lat"
                type="number"
                step="0.000001"
                value={newLocation.coordinates?.lat || ''}
                onChange={(e) =>
                  setNewLocation({
                    ...newLocation,
                    coordinates: {
                      lat: parseFloat(e.target.value) || 0,
                      lng: newLocation.coordinates?.lng || 0,
                    },
                  })
                }
                placeholder="10.762622"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-lng">Longitude (Optional)</Label>
              <Input
                id="new-lng"
                type="number"
                step="0.000001"
                value={newLocation.coordinates?.lng || ''}
                onChange={(e) =>
                  setNewLocation({
                    ...newLocation,
                    coordinates: {
                      lat: newLocation.coordinates?.lat || 0,
                      lng: parseFloat(e.target.value) || 0,
                    },
                  })
                }
                placeholder="106.660172"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              onClick={addLocation}
              disabled={!newLocation.url.trim() || !newLocation.title.trim()}
              className="flex-1"
            >
              <Plus className="w-4 h-4 mr-2" />
              Thêm địa điểm
            </Button>
            <Button
              type="button"
              onClick={() => {
                addLocation();
                // Reset form but keep coordinates
                setNewLocation({
                  url: '',
                  title: '',
                  description: '',
                  category: '',
                  coordinates: destinationCoordinates,
                });
              }}
              disabled={!newLocation.url.trim() || !newLocation.title.trim()}
              variant="outline"
              title="Thêm và tiếp tục thêm địa điểm khác"
            >
              <Zap className="w-4 h-4 mr-2" />
              Thêm & Tiếp tục
            </Button>
          </div>
        </div>

        {/* Existing Locations List */}
        {locations.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h4 className="font-semibold text-gray-900">
                Danh sách địa điểm ({locations.length})
              </h4>
              <div className="flex items-center gap-2">
                {locations.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (confirm('Áp dụng phân loại và mô tả từ địa điểm đầu tiên cho TẤT CẢ các địa điểm khác? (URL và tên sẽ giữ nguyên)')) {
                        applyTemplateToOthers(0);
                      }
                    }}
                    title="Áp dụng format từ địa điểm đầu tiên cho tất cả địa điểm khác"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Áp dụng format cho tất cả
                  </Button>
                )}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const count = prompt('Nhập số lượng địa điểm muốn tạo từ địa điểm đầu tiên (mặc định: 3):', '3');
                    const num = parseInt(count || '3', 10);
                    if (num > 0 && num <= 10 && locations.length > 0) {
                      duplicateMultipleLocations(0, num);
                    } else if (count !== null) {
                      alert('Vui lòng nhập số từ 1 đến 10');
                    }
                  }}
                  title="Tạo nhiều bản sao từ địa điểm đầu tiên"
                >
                  <Layers className="w-4 h-4 mr-2" />
                  Tạo nhiều từ địa điểm đầu
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              {locations.map((location, index) => (
                <div
                  key={location.id || index}
                  className={`border-2 rounded-lg p-4 transition-all ${
                    previewIndex === index
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 bg-white'
                  }`}
                >
                  {/* Location Header */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-semibold">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        {editingIndex === index ? (
                          <Input
                            value={location.title}
                            onChange={(e) =>
                              updateLocation(index, { title: e.target.value })
                            }
                            className="mb-2"
                          />
                        ) : (
                          <h5 className="font-semibold text-gray-900">
                            {location.title}
                          </h5>
                        )}
                        {location.category && (
                          <Badge variant="secondary" className="text-xs mt-1">
                            {location.category}
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
                      >
                        {expandedIndex === index ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          setEditingIndex(editingIndex === index ? null : index)
                        }
                      >
                        {editingIndex === index ? (
                          <Check className="w-4 h-4 text-green-600" />
                        ) : (
                          <Edit2 className="w-4 h-4" />
                        )}
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setPreviewIndex(index)}
                        disabled={previewIndex === index}
                      >
                        Xem
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => moveLocation(index, 'up')}
                        disabled={index === 0}
                      >
                        ↑
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => moveLocation(index, 'down')}
                        disabled={index === locations.length - 1}
                      >
                        ↓
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => duplicateLocation(index)}
                        title="Nhân đôi địa điểm này"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const count = prompt('Nhập số lượng địa điểm muốn tạo (mặc định: 3):', '3');
                          const num = parseInt(count || '3', 10);
                          if (num > 0 && num <= 10) {
                            duplicateMultipleLocations(index, num);
                          } else if (count !== null) {
                            alert('Vui lòng nhập số từ 1 đến 10');
                          }
                        }}
                        title="Tạo nhiều bản sao của địa điểm này"
                      >
                        <Layers className="w-4 h-4" />
                      </Button>
                      {locations.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            if (confirm(`Áp dụng phân loại và mô tả từ "${location.title}" cho TẤT CẢ các địa điểm khác?`)) {
                              applyTemplateToOthers(index);
                            }
                          }}
                          title="Áp dụng format của địa điểm này cho tất cả địa điểm khác"
                        >
                          <RefreshCw className="w-4 h-4" />
                        </Button>
                      )}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeLocation(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {(expandedIndex === index || editingIndex === index) && (
                    <div className="mt-4 space-y-3 pt-3 border-t">
                      <div className="space-y-2">
                        <Label>Mô tả</Label>
                        {editingIndex === index ? (
                          <Textarea
                            value={location.description || ''}
                            onChange={(e) =>
                              updateLocation(index, { description: e.target.value })
                            }
                            rows={2}
                          />
                        ) : (
                          <p className="text-sm text-gray-600">
                            {location.description || 'Chưa có mô tả'}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label>Phân loại</Label>
                        {editingIndex === index ? (
                          <select
                            value={location.category || ''}
                            onChange={(e) =>
                              updateLocation(index, { category: e.target.value })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          >
                            <option value="">-- Chọn loại --</option>
                            {CATEGORIES.map((cat) => (
                              <option key={cat} value={cat}>
                                {cat}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <p className="text-sm text-gray-600">
                            {location.category || 'Chưa phân loại'}
                          </p>
                        )}
                      </div>

                      {location.coordinates && (
                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <Label className="text-xs">Latitude</Label>
                            {editingIndex === index ? (
                              <Input
                                type="number"
                                step="0.000001"
                                value={location.coordinates.lat}
                                onChange={(e) =>
                                  updateLocation(index, {
                                    coordinates: {
                                      ...location.coordinates!,
                                      lat: parseFloat(e.target.value) || 0,
                                    },
                                  })
                                }
                              />
                            ) : (
                              <p className="text-sm text-gray-600 font-mono">
                                {location.coordinates.lat}
                              </p>
                            )}
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Longitude</Label>
                            {editingIndex === index ? (
                              <Input
                                type="number"
                                step="0.000001"
                                value={location.coordinates.lng}
                                onChange={(e) =>
                                  updateLocation(index, {
                                    coordinates: {
                                      ...location.coordinates!,
                                      lng: parseFloat(e.target.value) || 0,
                                    },
                                  })
                                }
                              />
                            ) : (
                              <p className="text-sm text-gray-600 font-mono">
                                {location.coordinates.lng}
                              </p>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="space-y-2">
                        <Label>Street View URL</Label>
                        {editingIndex === index ? (
                          <Textarea
                            value={location.url}
                            onChange={(e) =>
                              updateLocation(index, { url: e.target.value })
                            }
                            rows={3}
                            className="font-mono text-xs"
                          />
                        ) : (
                          <p className="text-xs text-gray-500 font-mono break-all">
                            {location.url.substring(0, 100)}...
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Preview Section */}
        {locations.length > 0 && (
          <div className="border-t pt-4 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium">
                Preview: {locations[previewIndex]?.title}
              </h4>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={previewIndex === 0}
                  onClick={() => setPreviewIndex((prev) => Math.max(prev - 1, 0))}
                >
                  ← Trước
                </Button>
                <span className="text-sm text-gray-500">
                  {previewIndex + 1} / {locations.length}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={previewIndex === locations.length - 1}
                  onClick={() =>
                    setPreviewIndex((prev) =>
                      Math.min(prev + 1, locations.length - 1)
                    )
                  }
                >
                  Sau →
                </Button>
              </div>
            </div>
            <div
              className="w-full h-[400px] rounded-lg overflow-hidden border bg-gray-100"
              dangerouslySetInnerHTML={{
                __html: locations[previewIndex]?.url.includes('<iframe')
                  ? locations[previewIndex]?.url
                  : `<iframe src="${extractIframeSrc(
                      locations[previewIndex]?.url || ''
                    )}" width="100%" height="100%" style="border:0;" allowfullscreen loading="lazy"></iframe>`,
              }}
            />
          </div>
        )}

        {locations.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            <MapPin className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Chưa có địa điểm nào</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

