'use client';

/**
 * Image Uploader Component - URL Based
 * Supports multiple images via URL
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Image as ImageIcon, Plus, Link as LinkIcon } from 'lucide-react';
import { toast } from 'sonner';

interface ImageUploaderProps {
  images: string[];
  onChange: (images: string[]) => void;
  maxImages?: number;
  folder?: string;
}

export default function ImageUploader({
  images,
  onChange,
  maxImages = 10,
  folder = 'destinations',
}: ImageUploaderProps) {
  const [urlInput, setUrlInput] = useState('');

  const handleRemoveImage = (index: number) => {
    onChange(images.filter((_, i) => i !== index));
  };

  const validateImageUrl = (url: string): boolean => {
    try {
      const urlObj = new URL(url.trim());
      // Check if it's a valid HTTP/HTTPS URL
      if (!['http:', 'https:'].includes(urlObj.protocol)) {
        return false;
      }
      // Check if it looks like an image URL (has image extension or common image host)
      const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
      const pathname = urlObj.pathname.toLowerCase();
      const hasImageExtension = imageExtensions.some(ext => pathname.endsWith(ext));
      const isImageHost = urlObj.hostname.includes('unsplash') || 
                         urlObj.hostname.includes('pexels') ||
                         urlObj.hostname.includes('cloudinary') ||
                         urlObj.hostname.includes('imgur') ||
                         urlObj.hostname.includes('images') ||
                         urlObj.hostname.includes('cdn');
      
      return hasImageExtension || isImageHost || urlObj.searchParams.has('w') || urlObj.searchParams.has('width');
    } catch {
      return false;
    }
  };

  const handleAddUrl = () => {
    const trimmedUrl = urlInput.trim();
    
    if (!trimmedUrl) {
      toast.error('Vui lòng nhập URL ảnh');
      return;
    }

    if (images.length >= maxImages) {
      toast.error(`Đã đạt giới hạn ${maxImages} ảnh`);
      return;
    }

    // Validate URL format
    if (!validateImageUrl(trimmedUrl)) {
      toast.error('URL không hợp lệ hoặc không phải là ảnh. Vui lòng kiểm tra lại URL.');
      return;
    }

    // Check for duplicates
    if (images.includes(trimmedUrl)) {
      toast.warning('Ảnh này đã được thêm rồi');
      return;
    }

    // Add image
    onChange([...images, trimmedUrl]);
    setUrlInput('');
    toast.success('Đã thêm ảnh thành công');
  };

  const canUploadMore = images.length < maxImages;

  return (
    <div className="space-y-4">
      {/* URL Input */}
      {canUploadMore && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
            <LinkIcon className="w-4 h-4" />
            Thêm ảnh bằng URL
          </label>
          <div className="flex gap-2">
            <Input
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://images.unsplash.com/photo-xxx?w=1200"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddUrl();
                }
              }}
              className="flex-1"
            />
            <Button
              type="button"
              onClick={handleAddUrl}
              disabled={!urlInput.trim()}
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              Thêm
            </Button>
          </div>
          <p className="text-xs text-gray-500">
            💡 Paste URL ảnh từ <a href="https://unsplash.com" target="_blank" className="text-blue-600 underline">Unsplash</a>, Pexels, hoặc bất kỳ nguồn nào
          </p>
        </div>
      )}

      {/* Image Grid */}
      {images.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((url, idx) => (
            <div key={idx} className="relative group">
              <div className="aspect-square rounded-lg overflow-hidden border-2 border-gray-200 bg-gray-100">
                <img
                  src={url}
                  alt={`Image ${idx + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    console.error('Image load error:', url);
                    toast.error(`Không thể tải ảnh #${idx + 1}. Vui lòng kiểm tra URL hoặc hostname đã được cấu hình trong next.config.js`);
                    // Optionally remove the broken image
                    // onChange(images.filter((_, i) => i !== idx));
                  }}
                  onLoad={() => {
                    console.log('Image loaded successfully:', url);
                  }}
                />
              </div>
              
              {/* Remove Button */}
              <button
                type="button"
                onClick={() => handleRemoveImage(idx)}
                className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition shadow-lg hover:bg-red-700"
                title="Xóa ảnh"
              >
                <X className="w-4 h-4" />
              </button>
              
              {/* Image Number Badge */}
              <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                #{idx + 1}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed">
          <ImageIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Chưa có ảnh nào</p>
          <p className="text-gray-400 text-xs">Thêm ảnh bằng URL để bắt đầu</p>
        </div>
      )}

      {/* Info */}
      {images.length > 0 && (
        <div className="flex items-center justify-between text-sm">
          <p className="text-gray-600">
            {images.length} / {maxImages} ảnh
          </p>
          {images.length === maxImages && (
            <p className="text-orange-600 font-medium">
              Đã đạt giới hạn số ảnh
            </p>
          )}
        </div>
      )}

      {/* Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm font-medium text-blue-900 mb-2">💡 Lời khuyên:</p>
        <ul className="text-xs text-blue-800 space-y-1">
          <li>• Sử dụng ảnh chất lượng cao để thu hút người dùng</li>
          <li>• Ảnh đầu tiên sẽ là ảnh đại diện chính</li>
          <li>• Khuyến nghị kích thước: tối thiểu 1200x800px</li>
          <li>• Nên thêm 5-8 ảnh đa dạng về điểm đến</li>
          <li>• Nguồn gợi ý: <a href="https://unsplash.com" target="_blank" className="underline font-medium">Unsplash</a>, <a href="https://pexels.com" target="_blank" className="underline font-medium">Pexels</a></li>
        </ul>
      </div>
    </div>
  );
}

