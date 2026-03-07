'use client';

/**
 * Destination Form Component
 * Used for both creating and editing destinations
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, MapPin, X, Plus } from 'lucide-react';
import Link from 'next/link';
import ImageUploader from '@/components/admin/ImageUploader';
import { toast } from 'sonner';

interface DestinationFormProps {
  mode: 'create' | 'edit';
  initialData?: any;
  onSubmit: (data: any) => Promise<void>;
  loading: boolean;
  error: string;
}

export default function DestinationForm({
  mode,
  initialData,
  onSubmit,
  loading,
  error,
}: DestinationFormProps) {
  const router = useRouter();

  // Basic Info
  const [name, setName] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [province, setProvince] = useState('');
  const [region, setRegion] = useState('Bắc Bộ');
  const [type, setType] = useState('Thành phố');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);

  // Location
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');

  // Arrays
  const [highlights, setHighlights] = useState<string[]>([]);
  const [highlightInput, setHighlightInput] = useState('');
  
  const [activities, setActivities] = useState<string[]>([]);
  const [activityInput, setActivityInput] = useState('');
  
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [specialtyInput, setSpecialtyInput] = useState('');
  
  const [bestTime, setBestTime] = useState<string[]>([]);
  const [bestTimeInput, setBestTimeInput] = useState('');
  
  const [tips, setTips] = useState<string[]>([]);
  const [tipInput, setTipInput] = useState('');
  
  const [warnings, setWarnings] = useState<string[]>([]);
  const [warningInput, setWarningInput] = useState('');
  
  const [images, setImages] = useState<string[]>([]);

  // Budget
  const [budgetLow, setBudgetLow] = useState('');
  const [budgetMedium, setBudgetMedium] = useState('');
  const [budgetHigh, setBudgetHigh] = useState('');
  
  // Duration
  const [duration, setDuration] = useState('');

  // Transportation
  const [trainInfo, setTrainInfo] = useState('');
  const [trainCost, setTrainCost] = useState('');
  const [busInfo, setBusInfo] = useState('');
  const [busCost, setBusCost] = useState('');
  const [flightInfo, setFlightInfo] = useState('');
  const [flightCost, setFlightCost] = useState('');

  // Accommodation
  const [hostelRange, setHostelRange] = useState('');
  const [hotelRange, setHotelRange] = useState('');
  const [resortRange, setResortRange] = useState('');

  // Initialize form with data in edit mode
  useEffect(() => {
    if (mode === 'edit' && initialData) {
      setName(initialData.name || '');
      setNameEn(initialData.nameEn || '');
      setProvince(initialData.province || '');
      
      // Convert old region format to new format (migration)
      let regionValue = initialData.region || 'Bắc Bộ';
      if (regionValue === 'Miền Bắc' || regionValue === 'Tây Bắc') regionValue = 'Bắc Bộ';
      if (regionValue === 'Miền Trung' || regionValue === 'Tây Nguyên') regionValue = 'Trung Bộ';
      if (regionValue === 'Miền Nam') regionValue = 'Nam Bộ';
      setRegion(regionValue);
      
      setType(initialData.type || 'Thành phố');
      setDescription(initialData.description || '');
      setIsActive(initialData.isActive !== undefined ? initialData.isActive : true);
      
      setLat(initialData.coordinates?.lat?.toString() || '');
      setLng(initialData.coordinates?.lng?.toString() || '');
      
      setHighlights(initialData.highlights || []);
      setActivities(initialData.activities || []);
      setSpecialties(initialData.specialties || []);
      setBestTime(initialData.bestTime || []);
      setTips(initialData.tips || []);
      setWarnings(initialData.warnings || []);
      setImages(initialData.images || []);
      
      setBudgetLow(initialData.budget?.low?.toString() || '');
      setBudgetMedium(initialData.budget?.medium?.toString() || '');
      setBudgetHigh(initialData.budget?.high?.toString() || '');
      
      setDuration(initialData.duration || '');
      
      const trainInfo = initialData.transportation?.train?.info || '';
      const trainCost = initialData.transportation?.train?.cost || '';
      const busInfo = initialData.transportation?.bus?.info || '';
      const busCost = initialData.transportation?.bus?.cost || '';
      const flightInfo = initialData.transportation?.flight?.info || '';
      const flightCost = initialData.transportation?.flight?.cost || '';
      
      const hostelRange = initialData.accommodation?.hostel || '';
      const hotelRange = initialData.accommodation?.hotel || '';
      const resortRange = initialData.accommodation?.resort || '';
      
      setTrainInfo(trainInfo);
      setTrainCost(trainCost);
      setBusInfo(busInfo);
      setBusCost(busCost);
      setFlightInfo(flightInfo);
      setFlightCost(flightCost);
      
      setHostelRange(hostelRange);
      setHotelRange(hotelRange);
      setResortRange(resortRange);
    }
  }, [mode, initialData]);

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!name || !province || !region || !type || !description) {
      toast.error('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    if (!lat || !lng) {
      toast.error('Vui lòng nhập tọa độ');
      return;
    }

    const formData = {
      name: name.trim(),
      nameEn: nameEn.trim() || undefined,
      province: province.trim(),
      region,
      type,
      description,
      isActive,
      coordinates: {
        lat: parseFloat(lat),
        lng: parseFloat(lng),
      },
      highlights,
      activities,
      specialties,
      bestTime,
      tips,
      warnings,
      images,
      budget: {
        low: budgetLow ? parseFloat(budgetLow) : 0,
        medium: budgetMedium ? parseFloat(budgetMedium) : 0,
        high: budgetHigh ? parseFloat(budgetHigh) : 0,
      },
      duration: duration || 'Chưa xác định',
      transportation: {
        ...(trainInfo || trainCost ? { train: { info: trainInfo || '', cost: trainCost || '' } } : {}),
        ...(busInfo || busCost ? { bus: { info: busInfo || '', cost: busCost || '' } } : {}),
        ...(flightInfo || flightCost ? { flight: { info: flightInfo || '', cost: flightCost || '' } } : {}),
      },
      accommodation: {
        ...(hostelRange ? { hostel: hostelRange } : {}),
        ...(hotelRange ? { hotel: hotelRange } : {}),
        ...(resortRange ? { resort: resortRange } : {}),
      },
    };

    await onSubmit(formData);
  };

  // Array helpers
  const addToArray = (value: string, setter: (arr: string[]) => void, array: string[], clearInput: () => void) => {
    if (value.trim()) {
      setter([...array, value.trim()]);
      clearInput();
    }
  };

  const removeFromArray = (index: number, setter: (arr: string[]) => void, array: string[]) => {
    setter(array.filter((_, i) => i !== index));
  };

  return (
    <div className="container mx-auto px-6 py-12">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Button variant="outline" asChild size="sm">
            <Link href="/admin/destinations">
              <ChevronLeft className="w-4 h-4" />
            </Link>
          </Button>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <MapPin className="w-8 h-8 text-blue-600" />
            {mode === 'create' ? 'Tạo điểm đến mới' : 'Chỉnh sửa điểm đến'}
          </h1>
        </div>
        <p className="text-gray-600 ml-12">
          {mode === 'create' 
            ? 'Điền thông tin để thêm điểm đến mới vào hệ thống' 
            : 'Cập nhật thông tin điểm đến'}
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <Card className="mb-6 border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-600">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Form */}
      <form onSubmit={handleSubmitForm} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Thông tin cơ bản</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Tên điểm đến (Tiếng Việt) <span className="text-red-500">*</span>
                </label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Vịnh Hạ Long"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Tên điểm đến (Tiếng Anh)
                </label>
                <Input
                  value={nameEn}
                  onChange={(e) => setNameEn(e.target.value)}
                  placeholder="Ha Long Bay"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Tỉnh/Thành phố <span className="text-red-500">*</span>
                </label>
                <Input
                  value={province}
                  onChange={(e) => setProvince(e.target.value)}
                  placeholder="Quảng Ninh"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Vùng miền <span className="text-red-500">*</span>
                </label>
                <select
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  className="w-full h-9 border border-input rounded-md px-3 py-2 text-sm bg-transparent shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:border-ring"
                  required
                >
                  <option value="Bắc Bộ">Bắc Bộ</option>
                  <option value="Trung Bộ">Trung Bộ</option>
                  <option value="Nam Bộ">Nam Bộ</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Loại <span className="text-red-500">*</span>
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full h-9 border border-input rounded-md px-3 py-2 text-sm bg-transparent shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:border-ring"
                  required
                >
                  <option value="Biển">Biển</option>
                  <option value="Núi">Núi</option>
                  <option value="Thành phố">Thành phố</option>
                  <option value="Văn hóa">Văn hóa</option>
                  <option value="Thiên nhiên">Thiên nhiên</option>
                  <option value="Lịch sử">Lịch sử</option>
                  <option value="Sinh thái">Sinh thái</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Mô tả <span className="text-red-500">*</span>
              </label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Mô tả chi tiết về điểm đến..."
                rows={4}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Thời gian tham quan đề nghị
              </label>
              <Input
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="2-3 ngày"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isActive"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="rounded"
              />
              <label htmlFor="isActive" className="text-sm font-medium cursor-pointer">
                Kích hoạt (hiển thị công khai)
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Location */}
        <Card>
          <CardHeader>
            <CardTitle>Vị trí</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Vĩ độ (Latitude) <span className="text-red-500">*</span>
                </label>
                <Input
                  type="number"
                  step="any"
                  value={lat}
                  onChange={(e) => setLat(e.target.value)}
                  placeholder="20.9101"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Kinh độ (Longitude) <span className="text-red-500">*</span>
                </label>
                <Input
                  type="number"
                  step="any"
                  value={lng}
                  onChange={(e) => setLng(e.target.value)}
                  placeholder="107.1839"
                  required
                />
              </div>
            </div>
            <p className="text-xs text-gray-600">
              💡 Tip: Sử dụng Google Maps để tìm tọa độ chính xác
            </p>
          </CardContent>
        </Card>

        {/* Budget */}
        <Card>
          <CardHeader>
            <CardTitle>Ngân sách (VNĐ/người)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Thấp</label>
                <Input
                  type="number"
                  value={budgetLow}
                  onChange={(e) => setBudgetLow(e.target.value)}
                  placeholder="500000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Trung bình</label>
                <Input
                  type="number"
                  value={budgetMedium}
                  onChange={(e) => setBudgetMedium(e.target.value)}
                  placeholder="1000000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Cao</label>
                <Input
                  type="number"
                  value={budgetHigh}
                  onChange={(e) => setBudgetHigh(e.target.value)}
                  placeholder="2000000"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Highlights */}
        <Card>
          <CardHeader>
            <CardTitle>Điểm nổi bật</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={highlightInput}
                onChange={(e) => setHighlightInput(e.target.value)}
                placeholder="Thêm điểm nổi bật..."
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addToArray(highlightInput, setHighlights, highlights, () => setHighlightInput(''));
                  }
                }}
              />
              <Button
                type="button"
                onClick={() => addToArray(highlightInput, setHighlights, highlights, () => setHighlightInput(''))}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {highlights.map((item, idx) => (
                <Badge key={idx} className="bg-blue-100 text-blue-800 flex items-center gap-1 max-w-full">
                  <span className="truncate">{item}</span>
                  <button
                    type="button"
                    onClick={() => removeFromArray(idx, setHighlights, highlights)}
                    className="ml-1 hover:text-red-600 flex-shrink-0"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Activities */}
        <Card>
          <CardHeader>
            <CardTitle>Hoạt động</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={activityInput}
                onChange={(e) => setActivityInput(e.target.value)}
                placeholder="Thêm hoạt động..."
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addToArray(activityInput, setActivities, activities, () => setActivityInput(''));
                  }
                }}
              />
              <Button
                type="button"
                onClick={() => addToArray(activityInput, setActivities, activities, () => setActivityInput(''))}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {activities.map((item, idx) => (
                <Badge key={idx} className="bg-green-100 text-green-800 flex items-center gap-1 max-w-full">
                  <span className="truncate">{item}</span>
                  <button
                    type="button"
                    onClick={() => removeFromArray(idx, setActivities, activities)}
                    className="ml-1 hover:text-red-600 flex-shrink-0"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Specialties */}
        <Card>
          <CardHeader>
            <CardTitle>Đặc sản</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={specialtyInput}
                onChange={(e) => setSpecialtyInput(e.target.value)}
                placeholder="Thêm đặc sản..."
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addToArray(specialtyInput, setSpecialties, specialties, () => setSpecialtyInput(''));
                  }
                }}
              />
              <Button
                type="button"
                onClick={() => addToArray(specialtyInput, setSpecialties, specialties, () => setSpecialtyInput(''))}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {specialties.map((item, idx) => (
                <Badge key={idx} className="bg-orange-100 text-orange-800 flex items-center gap-1 max-w-full">
                  <span className="truncate">{item}</span>
                  <button
                    type="button"
                    onClick={() => removeFromArray(idx, setSpecialties, specialties)}
                    className="ml-1 hover:text-red-600 flex-shrink-0"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Best Time */}
        <Card>
          <CardHeader>
            <CardTitle>Thời điểm tốt nhất</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={bestTimeInput}
                onChange={(e) => setBestTimeInput(e.target.value)}
                placeholder="VD: Tháng 3-5"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addToArray(bestTimeInput, setBestTime, bestTime, () => setBestTimeInput(''));
                  }
                }}
              />
              <Button
                type="button"
                onClick={() => addToArray(bestTimeInput, setBestTime, bestTime, () => setBestTimeInput(''))}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {bestTime.map((item, idx) => (
                <Badge key={idx} className="bg-purple-100 text-purple-800 flex items-center gap-1 max-w-full">
                  <span className="truncate">{item}</span>
                  <button
                    type="button"
                    onClick={() => removeFromArray(idx, setBestTime, bestTime)}
                    className="ml-1 hover:text-red-600 flex-shrink-0"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Tips */}
        <Card>
          <CardHeader>
            <CardTitle>Lời khuyên</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={tipInput}
                onChange={(e) => setTipInput(e.target.value)}
                placeholder="Thêm lời khuyên..."
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addToArray(tipInput, setTips, tips, () => setTipInput(''));
                  }
                }}
              />
              <Button
                type="button"
                onClick={() => addToArray(tipInput, setTips, tips, () => setTipInput(''))}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="space-y-2">
              {tips.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                  <span className="flex-1">{item}</span>
                  <button
                    type="button"
                    onClick={() => removeFromArray(idx, setTips, tips)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Warnings */}
        <Card>
          <CardHeader>
            <CardTitle>Lưu ý / Cảnh báo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={warningInput}
                onChange={(e) => setWarningInput(e.target.value)}
                placeholder="Thêm lưu ý..."
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addToArray(warningInput, setWarnings, warnings, () => setWarningInput(''));
                  }
                }}
              />
              <Button
                type="button"
                onClick={() => addToArray(warningInput, setWarnings, warnings, () => setWarningInput(''))}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="space-y-2">
              {warnings.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 p-2 bg-yellow-50 rounded">
                  <span className="flex-1">{item}</span>
                  <button
                    type="button"
                    onClick={() => removeFromArray(idx, setWarnings, warnings)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Images */}
        <Card>
          <CardHeader>
            <CardTitle>Hình ảnh</CardTitle>
          </CardHeader>
          <CardContent>
            <ImageUploader
              images={images}
              onChange={setImages}
              maxImages={10}
              folder="destinations"
            />
          </CardContent>
        </Card>

        {/* Transportation */}
        <Card>
          <CardHeader>
            <CardTitle>Phương tiện di chuyển</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Train */}
            <div>
              <h4 className="font-medium mb-2">🚆 Tàu hỏa</h4>
              <div className="grid md:grid-cols-2 gap-4">
                <Input
                  value={trainInfo}
                  onChange={(e) => setTrainInfo(e.target.value)}
                  placeholder="Thông tin (VD: Từ Hà Nội)"
                />
                <Input
                  value={trainCost}
                  onChange={(e) => setTrainCost(e.target.value)}
                  placeholder="Chi phí (VD: 300.000 - 500.000đ)"
                />
              </div>
            </div>

            {/* Bus */}
            <div>
              <h4 className="font-medium mb-2">🚌 Xe khách</h4>
              <div className="grid md:grid-cols-2 gap-4">
                <Input
                  value={busInfo}
                  onChange={(e) => setBusInfo(e.target.value)}
                  placeholder="Thông tin"
                />
                <Input
                  value={busCost}
                  onChange={(e) => setBusCost(e.target.value)}
                  placeholder="Chi phí"
                />
              </div>
            </div>

            {/* Flight */}
            <div>
              <h4 className="font-medium mb-2">✈️ Máy bay</h4>
              <div className="grid md:grid-cols-2 gap-4">
                <Input
                  value={flightInfo}
                  onChange={(e) => setFlightInfo(e.target.value)}
                  placeholder="Thông tin"
                />
                <Input
                  value={flightCost}
                  onChange={(e) => setFlightCost(e.target.value)}
                  placeholder="Chi phí"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Accommodation */}
        <Card>
          <CardHeader>
            <CardTitle>Chỗ ở</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nhà nghỉ / Hostel</label>
              <Input
                value={hostelRange}
                onChange={(e) => setHostelRange(e.target.value)}
                placeholder="VD: 100.000 - 300.000đ/đêm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Khách sạn</label>
              <Input
                value={hotelRange}
                onChange={(e) => setHotelRange(e.target.value)}
                placeholder="VD: 500.000 - 1.000.000đ/đêm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Resort</label>
              <Input
                value={resortRange}
                onChange={(e) => setResortRange(e.target.value)}
                placeholder="VD: 2.000.000 - 5.000.000đ/đêm"
              />
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => router.push('/admin/destinations')}>
            Hủy
          </Button>
          <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={loading}>
            {loading ? 'Đang xử lý...' : mode === 'create' ? 'Tạo điểm đến' : 'Cập nhật'}
          </Button>
        </div>
      </form>
    </div>
  );
}

