'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Filter, 
  X, 
  MapPin, 
  Mountain, 
  Star, 
  Clock,
  DollarSign 
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface FilterValues {
  region: string;
  type: string;
  minBudget: number;
  maxBudget: number;
  minRating: number;
  duration: string;
  sort: string;
}

interface AdvancedFiltersProps {
  filters: FilterValues;
  onChange: (filters: FilterValues) => void;
  onReset: () => void;
}

const REGIONS = ['Bắc Bộ', 'Trung Bộ', 'Nam Bộ'];

const TYPES = [
  'Biển',
  'Núi',
  'Thành phố',
  'Văn hóa',
  'Lịch sử',
  'Thiên nhiên',
  'Sinh thái',
  'Nghỉ dưỡng',
];

const DURATIONS = [
  '1 ngày',
  '2-3 ngày',
  '4-5 ngày',
  'Trên 5 ngày',
];

const BUDGET_RANGES = [
  { label: '< 1 triệu', min: 0, max: 1000000 },
  { label: '1-3 triệu', min: 1000000, max: 3000000 },
  { label: '3-5 triệu', min: 3000000, max: 5000000 },
  { label: '5-10 triệu', min: 5000000, max: 10000000 },
  { label: '> 10 triệu', min: 10000000, max: 999999999 },
];

const SORT_OPTIONS = [
  { value: 'popularity', label: 'Phổ biến nhất' },
  { value: 'rating', label: 'Đánh giá cao' },
  { value: 'newest', label: 'Mới nhất' },
  { value: 'name', label: 'Tên A-Z' },
  { value: 'price-low', label: 'Giá thấp' },
  { value: 'price-high', label: 'Giá cao' },
];

export default function AdvancedFilters({
  filters,
  onChange,
  onReset,
}: AdvancedFiltersProps) {
  const [showFilters, setShowFilters] = useState(false);

  const updateFilter = (key: keyof FilterValues, value: any) => {
    onChange({ ...filters, [key]: value });
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.region) count++;
    if (filters.type) count++;
    if (filters.minBudget > 0 || filters.maxBudget < 999999999) count++;
    if (filters.minRating > 0) count++;
    if (filters.duration) count++;
    return count;
  };

  const activeCount = getActiveFiltersCount();

  return (
    <div className="space-y-4">
      {/* Filter Toggle Button */}
      <div className="flex items-center justify-between gap-4">
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="gap-2"
        >
          <Filter className="w-4 h-4" />
          Bộ lọc
          {activeCount > 0 && (
            <Badge className="ml-1 bg-primary text-primary-foreground shadow-sm">
              {activeCount}
            </Badge>
          )}
        </Button>

        {/* Sort Dropdown */}
        <Select value={filters.sort} onValueChange={(value) => updateFilter('sort', value)}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Sắp xếp" />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {activeCount > 0 && (
          <Button variant="ghost" onClick={onReset} className="gap-2">
            <X className="w-4 h-4" />
            Xóa bộ lọc
          </Button>
        )}
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-card/90 dark:bg-card/80 backdrop-blur-xl border border-border rounded-2xl p-6 space-y-6 shadow-2xl animate-in fade-in slide-in-from-top-4 duration-300">
          {/* Region Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Khu vực
            </label>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={filters.region === '' ? 'default' : 'outline'}
                size="sm"
                onClick={() => updateFilter('region', '')}
              >
                Tất cả
              </Button>
              {REGIONS.map((region) => (
                <Button
                  key={region}
                  variant={filters.region === region ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => updateFilter('region', region)}
                >
                  {region}
                </Button>
              ))}
            </div>
          </div>

          {/* Type Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Mountain className="w-4 h-4" />
              Loại hình
            </label>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={filters.type === '' ? 'default' : 'outline'}
                size="sm"
                onClick={() => updateFilter('type', '')}
              >
                Tất cả
              </Button>
              {TYPES.map((type) => (
                <Button
                  key={type}
                  variant={filters.type === type ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => updateFilter('type', type)}
                >
                  {type}
                </Button>
              ))}
            </div>
          </div>

          {/* Budget Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Ngân sách
            </label>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={filters.minBudget === 0 && filters.maxBudget === 999999999 ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  updateFilter('minBudget', 0);
                  updateFilter('maxBudget', 999999999);
                }}
              >
                Tất cả
              </Button>
              {BUDGET_RANGES.map((range) => (
                <Button
                  key={range.label}
                  variant={
                    filters.minBudget === range.min && filters.maxBudget === range.max
                      ? 'default'
                      : 'outline'
                  }
                  size="sm"
                  onClick={() => {
                    updateFilter('minBudget', range.min);
                    updateFilter('maxBudget', range.max);
                  }}
                >
                  {range.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Rating Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Star className="w-4 h-4" />
              Đánh giá
            </label>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={filters.minRating === 0 ? 'default' : 'outline'}
                size="sm"
                onClick={() => updateFilter('minRating', 0)}
              >
                Tất cả
              </Button>
              {[4, 4.5, 5].map((rating) => (
                <Button
                  key={rating}
                  variant={filters.minRating === rating ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => updateFilter('minRating', rating)}
                  className="gap-1"
                >
                  <Star className="w-3 h-3 fill-current" />
                  ≥ {rating}
                </Button>
              ))}
            </div>
          </div>

          {/* Duration Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Thời gian
            </label>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={filters.duration === '' ? 'default' : 'outline'}
                size="sm"
                onClick={() => updateFilter('duration', '')}
              >
                Tất cả
              </Button>
              {DURATIONS.map((duration) => (
                <Button
                  key={duration}
                  variant={filters.duration === duration ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => updateFilter('duration', duration)}
                >
                  {duration}
                </Button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Active Filters Display */}
      {activeCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters.region && (
            <Badge variant="secondary" className="gap-1">
              {filters.region}
              <button onClick={() => updateFilter('region', '')}>
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}
          {filters.type && (
            <Badge variant="secondary" className="gap-1">
              {filters.type}
              <button onClick={() => updateFilter('type', '')}>
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}
          {(filters.minBudget > 0 || filters.maxBudget < 999999999) && (
            <Badge variant="secondary" className="gap-1">
              {filters.minBudget > 0 ? `≥${(filters.minBudget / 1000000).toFixed(0)}tr` : ''}
              {filters.maxBudget < 999999999 ? ` - ${(filters.maxBudget / 1000000).toFixed(0)}tr` : ''}
              <button
                onClick={() => {
                  updateFilter('minBudget', 0);
                  updateFilter('maxBudget', 999999999);
                }}
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}
          {filters.minRating > 0 && (
            <Badge variant="secondary" className="gap-1">
              ≥{filters.minRating}★
              <button onClick={() => updateFilter('minRating', 0)}>
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}
          {filters.duration && (
            <Badge variant="secondary" className="gap-1">
              {filters.duration}
              <button onClick={() => updateFilter('duration', '')}>
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}

