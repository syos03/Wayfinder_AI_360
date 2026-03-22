'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, X, Clock, TrendingUp, MapPin } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';
import { debounce } from 'lodash';

interface AutocompleteResult {
  suggestions: string[];
  destinations: {
    _id: string;
    name: string;
    province: string;
    type: string;
    region: string;
    images: string[];
  }[];
}

interface SearchBarProps {
  defaultValue?: string;
  onSearch?: (query: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
}

export default function SearchBar({
  defaultValue = '',
  onSearch,
  placeholder = 'Tìm kiếm điểm đến...',
  autoFocus = false,
}: SearchBarProps) {
  const router = useRouter();
  const [query, setQuery] = useState(defaultValue);
  const [suggestions, setSuggestions] = useState<AutocompleteResult>({
    suggestions: [],
    destinations: [],
  });
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Debounced autocomplete fetch
  const fetchSuggestions = useCallback(
    debounce(async (searchQuery: string) => {
      if (!searchQuery || searchQuery.length < 2) {
        setSuggestions({ suggestions: [], destinations: [] });
        return;
      }

      setLoading(true);
      try {
        const res = await fetch(`/api/search/autocomplete?q=${encodeURIComponent(searchQuery)}`);
        const data = await res.json();
        
        if (data.success) {
          setSuggestions(data.data);
        }
      } catch (error) {
        console.error('Autocomplete error:', error);
      } finally {
        setLoading(false);
      }
    }, 300),
    []
  );

  useEffect(() => {
    if (query.length >= 2) {
      fetchSuggestions(query);
    } else {
      setSuggestions({ suggestions: [], destinations: [] });
    }
  }, [query, fetchSuggestions]);

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (searchQuery?: string) => {
    const finalQuery = searchQuery || query;
    if (!finalQuery.trim()) return;

    setShowSuggestions(false);
    
    if (onSearch) {
      onSearch(finalQuery);
    } else {
      router.push(`/search?q=${encodeURIComponent(finalQuery)}`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    handleSearch(suggestion);
  };

  const handleDestinationClick = (destinationId: string) => {
    setShowSuggestions(false);
    router.push(`/destinations/${destinationId}`);
  };

  const hasSuggestions =
    suggestions.suggestions.length > 0 || suggestions.destinations.length > 0;

  return (
    <div className="relative w-full">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <Input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setShowSuggestions(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className="pl-10 pr-10 h-12 text-base transition-all duration-300 focus:ring-primary/20 bg-background border-border"
        />
        {query && (
          <button
            onClick={() => {
              setQuery('');
              setSuggestions({ suggestions: [], destinations: [] });
              inputRef.current?.focus();
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Autocomplete Dropdown */}
      {showSuggestions && hasSuggestions && (
        <div
          ref={suggestionsRef}
          className="absolute z-50 w-full mt-3 bg-card/95 dark:bg-card/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-border overflow-hidden"
        >
          {/* Search Suggestions */}
          {suggestions.suggestions.length > 0 && (
            <div className="p-2">
              <div className="px-3 py-2 text-xs font-medium text-gray-500 uppercase">
                {suggestions.suggestions.some(s => s === query) ? (
                  <>
                    <Clock className="w-3 h-3 inline mr-1" />
                    Tìm kiếm gần đây
                  </>
                ) : (
                  <>
                    <TrendingUp className="w-3 h-3 inline mr-1" />
                    Tìm kiếm phổ biến
                  </>
                )}
              </div>
              {suggestions.suggestions.map((suggestion, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="w-full px-4 py-3 text-left hover:bg-primary/10 rounded-xl flex items-center gap-3 group transition-all duration-200"
                >
                  <Search className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
                  <span className="text-foreground/80 group-hover:text-primary font-medium">
                    {suggestion}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Destination Results */}
          {suggestions.destinations.length > 0 && (
            <div className="p-2 border-t">
              <div className="px-3 py-2 text-xs font-medium text-gray-500 uppercase">
                <MapPin className="w-3 h-3 inline mr-1" />
                Điểm đến
              </div>
              {suggestions.destinations.map((destination) => (
                <button
                  key={destination._id}
                  onClick={() => handleDestinationClick(destination._id)}
                  className="w-full px-4 py-3 text-left hover:bg-primary/10 rounded-xl flex items-center gap-4 group transition-all duration-200"
                >
                  {destination.images[0] && (
                    <div className="relative w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 shadow-md">
                      <img
                        src={destination.images[0]}
                        alt={destination.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-foreground group-hover:text-primary truncate transition-colors">
                      {destination.name}
                    </p>
                    <p className="text-sm text-muted-foreground truncate opacity-80">
                      {destination.province} • {destination.type}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="p-4 text-center text-sm text-gray-500">
              Đang tìm kiếm...
            </div>
          )}
        </div>
      )}
    </div>
  );
}

