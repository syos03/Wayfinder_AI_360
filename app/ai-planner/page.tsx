'use client';

/**
 * AI Trip Planner Page
 * Multi-step form to generate AI travel plans
 */

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Users, DollarSign, Heart, Sparkles, ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/use-auth';
import { motion, AnimatePresence } from 'framer-motion';

interface Destination {
  _id: string;
  name: string;
  province: string;
  images: string[];
}

const DRAFT_STORAGE_KEY = 'ai-planner-draft-v1';

export default function AIPlannerPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, user, isLoading } = useAuth();
  const [step, setStep] = useState(1);
  const [generating, setGenerating] = useState(false);

  // Form data
  const [origin, setOrigin] = useState('');
  const [selectedDestinations, setSelectedDestinations] = useState<Destination[]>([]);
  const [days, setDays] = useState(3);
  const [budget, setBudget] = useState(5000000);
  const [travelers, setTravelers] = useState(2);
  const [travelStyle, setTravelStyle] = useState('Khám phá');
  const [interests, setInterests] = useState<string[]>([]);
  const [startDate, setStartDate] = useState('');

  // Autosave state
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);

  // Search destinations
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Destination[]>([]);
  const [searching, setSearching] = useState(false);

  // Auth & default date
  useEffect(() => {
    // Wait for auth check to complete
    if (isLoading) return;

    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập để sử dụng AI Planner');
      router.push('/login');
      return;
    }

    // Set default start date to tomorrow if not set
    if (!startDate) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      setStartDate(tomorrow.toISOString().split('T')[0]);
    }
  }, [isAuthenticated, isLoading, router, startDate]);

  // Load draft from localStorage on mount
  useEffect(() => {
    try {
      const raw = typeof window !== 'undefined' ? window.localStorage.getItem(DRAFT_STORAGE_KEY) : null;
      if (!raw) return;
      const draft = JSON.parse(raw);

      if (draft.origin) setOrigin(draft.origin);
      if (Array.isArray(draft.selectedDestinations)) setSelectedDestinations(draft.selectedDestinations);
      if (typeof draft.days === 'number') setDays(draft.days);
      if (typeof draft.budget === 'number') setBudget(draft.budget);
      if (typeof draft.travelers === 'number') setTravelers(draft.travelers);
      if (typeof draft.travelStyle === 'string') setTravelStyle(draft.travelStyle);
      if (Array.isArray(draft.interests)) setInterests(draft.interests);
      if (typeof draft.startDate === 'string') setStartDate(draft.startDate);
      if (typeof draft.step === 'number') setStep(draft.step);
    } catch {
      // ignore corrupted draft
    }
  }, []);

  // Autosave draft when form data changes (debounced by browser)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const timeout = window.setTimeout(() => {
      const payload = {
        origin,
        selectedDestinations,
        days,
        budget,
        travelers,
        travelStyle,
        interests,
        startDate,
        step,
      };
      window.localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(payload));
      setLastSavedAt(new Date());
    }, 500);

    return () => window.clearTimeout(timeout);
  }, [origin, selectedDestinations, days, budget, travelers, travelStyle, interests, startDate, step]);

  // Separate effect for pre-selecting destination from URL
  useEffect(() => {
    const destId = searchParams.get('destination');
    if (destId && selectedDestinations.length === 0) {
      fetchDestination(destId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const fetchDestination = async (id: string) => {
    try {
      const res = await fetch(`/api/destinations/${id}`);
      const data = await res.json();
      if (data.success) {
        setSelectedDestinations([data.data.destination]);
      }
    } catch (error) {
      console.error('Failed to fetch destination:', error);
    }
  };

  const searchDestinations = async () => {
    if (!searchQuery.trim()) return;

    setSearching(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}&limit=10`);
      const data = await res.json();
      if (data.success) {
        setSearchResults(data.data.destinations);
      }
    } catch (error) {
      toast.error('Không thể tìm kiếm điểm đến');
    } finally {
      setSearching(false);
    }
  };

  const addDestination = (dest: Destination) => {
    if (!(selectedDestinations || []).find((d) => d._id === dest._id)) {
      setSelectedDestinations([...(selectedDestinations || []), dest]);
      setSearchQuery('');
      setSearchResults([]);
    }
  };

  const removeDestination = (id: string) => {
    setSelectedDestinations((selectedDestinations || []).filter((d) => d._id !== id));
  };

  const toggleInterest = (interest: string) => {
    if (interests?.includes(interest)) {
      setInterests(interests.filter((i) => i !== interest));
    } else {
      setInterests([...(interests || []), interest]);
    }
  };

  const handleGenerate = async () => {
    // Validation
    if (!origin.trim()) {
      toast.error('Vui lòng nhập điểm xuất phát');
      return;
    }

    if (!selectedDestinations || selectedDestinations.length === 0) {
      toast.error('Vui lòng chọn ít nhất 1 điểm đến');
      return;
    }

    if (!startDate) {
      toast.error('Vui lòng chọn ngày khởi hành');
      return;
    }

    setGenerating(true);

    toast.promise(
      fetch('/api/ai/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          origin,
          destinationIds: selectedDestinations.map((d) => d._id),
          days,
          budget,
          travelers,
          travelStyle,
          interests,
          startDate,
        }),
      }).then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        setGenerating(false);
        // Clear draft after successful generation
        if (typeof window !== 'undefined') {
          window.localStorage.removeItem(DRAFT_STORAGE_KEY);
        }
        router.push(`/my-plans/${data.data.planId}`);
        return data;
      }),
      {
        loading: '🤖 AI đang tạo kế hoạch cho bạn...',
        success: '✅ Kế hoạch đã sẵn sàng!',
        error: (err) => `❌ ${err.message}`,
      }
    );
  };

  const interestOptions = [
    'Ẩm thực',
    'Văn hóa',
    'Lịch sử',
    'Thiên nhiên',
    'Biển',
    'Núi',
    'Chụp ảnh',
    'Mua sắm',
    'Thư giãn',
    'Phiêu lưu',
  ];

  const travelStyles = ['Khám phá', 'Thư giãn', 'Văn hóa', 'Ẩm thực', 'Phiêu lưu'];

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang kiểm tra...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Enhanced Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            className="flex items-center justify-center gap-3 mb-6"
          >
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/70 rounded-2xl flex items-center justify-center shadow-lg">
              <Sparkles className="w-8 h-8 text-primary-foreground" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold gradient-text-animated">
              AI Lên Kế Hoạch Du Lịch
            </h1>
          </motion.div>
          <p className="text-xl text-muted-foreground">
            Powered by Google Gemini AI - Tạo lịch trình hoàn hảo trong vài giây
          </p>
        </motion.div>

        {/* Enhanced Progress Steps */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex items-center justify-center mb-12"
        >
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className="flex items-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: s * 0.1 }}
                className={`relative w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                  step >= s
                    ? 'bg-gradient-to-br from-primary to-primary/70 text-primary-foreground shadow-lg'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {step > s ? (
                  <CheckCircle2 className="w-6 h-6" />
                ) : (
                  s
                )}
                {step === s && (
                  <motion.div
                    className="absolute inset-0 rounded-full border-2 border-primary"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                )}
              </motion.div>
              {s < 4 && (
                <div className="relative w-20 h-1 mx-2 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    className={`absolute inset-y-0 left-0 rounded-full ${
                      step > s ? 'bg-gradient-to-r from-primary to-primary/70' : 'bg-muted'
                    }`}
                    initial={{ width: 0 }}
                    animate={{ width: step > s ? '100%' : '0%' }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              )}
            </div>
          ))}
        </motion.div>

        {/* Step 1: Origin & Destinations */}
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="card-premium-hover">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-2xl">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/70 rounded-lg flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-primary-foreground" />
                    </div>
                    Xuất phát & Điểm đến
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
              {/* Origin */}
              <div>
                <Label>Điểm xuất phát *</Label>
                <Input
                  placeholder="VD: Hà Nội, TP. Hồ Chí Minh..."
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  className="mt-2"
                />
              </div>

                  {/* Selected Destinations */}
                  <div>
                    <Label className="text-base font-semibold">Điểm đến đã chọn ({selectedDestinations?.length || 0})</Label>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {selectedDestinations && selectedDestinations.map((dest) => (
                        <motion.div
                          key={dest._id}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          whileHover={{ scale: 1.05 }}
                        >
                          <Badge
                            className="px-4 py-2 cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                            onClick={() => removeDestination(dest._id)}
                          >
                            {dest.name} ×
                          </Badge>
                        </motion.div>
                      ))}
                      {(!selectedDestinations || selectedDestinations.length === 0) && (
                        <p className="text-sm text-muted-foreground">Chưa chọn điểm đến nào</p>
                      )}
                    </div>
                  </div>

              {/* Search Destinations */}
              <div>
                <Label>Thêm điểm đến</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    placeholder="Tìm kiếm điểm đến..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && searchDestinations()}
                  />
                  <Button onClick={searchDestinations} disabled={searching}>
                    {searching ? 'Đang tìm...' : 'Tìm'}
                  </Button>
                </div>

                  {/* Search Results */}
                  {searchResults && searchResults.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-4 space-y-2 max-h-64 overflow-y-auto"
                    >
                      {searchResults.map((dest, index) => (
                        <motion.div
                          key={dest._id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="flex items-center justify-between p-4 border border-border rounded-xl hover:border-primary/50 hover:bg-primary/5 cursor-pointer transition-all card-premium-hover"
                          onClick={() => addDestination(dest)}
                        >
                          <div className="flex items-center gap-3">
                            {dest.images?.[0] && (
                              <img
                                src={dest.images[0]}
                                alt={dest.name}
                                className="w-12 h-12 rounded-lg object-cover"
                              />
                            )}
                            <div>
                              <p className="font-semibold">{dest.name}</p>
                              <p className="text-sm text-muted-foreground">{dest.province}</p>
                            </div>
                          </div>
                          <Button size="sm" variant="outline" className="hover:bg-primary hover:text-primary-foreground">
                            Thêm
                          </Button>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
              </div>

                  <Button
                    className="w-full btn-gradient"
                    size="lg"
                    onClick={() => setStep(2)}
                    disabled={!origin || !selectedDestinations || selectedDestinations.length === 0}
                  >
                    Tiếp theo
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Step 2: Time & Budget */}
        <AnimatePresence mode="wait">
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="card-premium-hover">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-2xl">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/70 rounded-lg flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-primary-foreground" />
                    </div>
                    Thời gian & Ngân sách
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label>Ngày khởi hành *</Label>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="mt-2"
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>

                <div>
                  <Label>Số ngày *</Label>
                  <Input
                    type="number"
                    value={days}
                    onChange={(e) => setDays(parseInt(e.target.value) || 1)}
                    className="mt-2"
                    min={1}
                    max={30}
                  />
                </div>
              </div>

              <div>
                <Label>Ngân sách/người (VNĐ) *</Label>
                <Input
                  type="number"
                  value={budget}
                  onChange={(e) => setBudget(parseInt(e.target.value) || 0)}
                  className="mt-2"
                  step={100000}
                />
                <p className="text-sm text-gray-500 mt-1">
                  ≈ {(budget / 1000000).toFixed(1)} triệu VNĐ
                </p>
              </div>

              <div>
                <Label>Số người đi *</Label>
                <Input
                  type="number"
                  value={travelers}
                  onChange={(e) => setTravelers(parseInt(e.target.value) || 1)}
                  className="mt-2"
                  min={1}
                  max={20}
                />
              </div>

                  <div className="flex gap-3">
                    <Button variant="outline" onClick={() => setStep(1)}>
                      <ArrowLeft className="mr-2 w-4 h-4" />
                      Quay lại
                    </Button>
                    <Button className="flex-1 btn-gradient" onClick={() => setStep(3)}>
                      Tiếp theo
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Step 3: Preferences */}
        <AnimatePresence mode="wait">
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="card-premium-hover">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-2xl">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/70 rounded-lg flex items-center justify-center">
                      <Heart className="w-5 h-5 text-primary-foreground" />
                    </div>
                    Sở thích & Phong cách
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label className="text-base font-semibold">Phong cách du lịch</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-3">
                      {travelStyles.map((style) => (
                        <motion.div
                          key={style}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Button
                            variant={travelStyle === style ? 'default' : 'outline'}
                            onClick={() => setTravelStyle(style)}
                            className={`w-full ${travelStyle === style ? 'btn-gradient' : ''}`}
                          >
                            {style}
                          </Button>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label className="text-base font-semibold">Sở thích (chọn nhiều)</Label>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {interestOptions.map((interest) => {
                        const isSelected = interests?.includes(interest);
                        return (
                          <motion.div
                            key={interest}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Badge
                              variant={isSelected ? 'default' : 'outline'}
                              className={`px-4 py-2 cursor-pointer transition-all ${
                                isSelected ? 'bg-primary text-primary-foreground' : 'hover:border-primary/50'
                              }`}
                              onClick={() => toggleInterest(interest)}
                            >
                              {interest}
                              {isSelected && ' ✓'}
                            </Badge>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button variant="outline" onClick={() => setStep(2)}>
                      <ArrowLeft className="mr-2 w-4 h-4" />
                      Quay lại
                    </Button>
                    <Button className="flex-1 btn-gradient" onClick={() => setStep(4)}>
                      Xem tổng quan
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Step 4: Review & Generate */}
        <AnimatePresence mode="wait">
          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="card-premium-hover">
                <CardHeader>
                  <CardTitle className="text-2xl">Xác nhận thông tin</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4 bg-muted/50 p-6 rounded-xl border border-border">
                <div className="flex justify-between">
                  <span className="text-gray-600">Xuất phát:</span>
                  <span className="font-medium">{origin}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Điểm đến:</span>
                  <span className="font-medium">
                    {selectedDestinations?.map((d) => d.name).join(', ') || 'Chưa chọn'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Thời gian:</span>
                  <span className="font-medium">
                    {days} ngày ({startDate})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Ngân sách:</span>
                  <span className="font-medium">
                    {(budget / 1000000).toFixed(1)}tr VNĐ × {travelers} người
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Phong cách:</span>
                  <span className="font-medium">{travelStyle}</span>
                </div>
                {interests && interests.length > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Sở thích:</span>
                    <span className="font-medium">{interests.join(', ')}</span>
                  </div>
                )}
              </div>

                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="text-xs text-muted-foreground">
                      {lastSavedAt
                        ? `Đã lưu nháp tự động lúc ${lastSavedAt.toLocaleTimeString('vi-VN')}`
                        : 'Thông tin của bạn sẽ được lưu nháp tự động'}
                    </div>
                    <Button variant="outline" onClick={() => setStep(3)}>
                      <ArrowLeft className="mr-2 w-4 h-4" />
                      Quay lại
                    </Button>
                    <Button
                      className="flex-1 btn-gradient"
                      size="lg"
                      onClick={handleGenerate}
                      disabled={generating}
                    >
                      <Sparkles className="mr-2 w-5 h-5" />
                      {generating ? 'Đang tạo...' : 'Tạo kế hoạch với AI'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

