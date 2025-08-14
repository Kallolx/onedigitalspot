import React, { useRef, useEffect } from 'react';
import { Search, X, Star, Loader2 } from 'lucide-react';
import { Input } from './ui/input';
import { useSearch } from '../hooks/useSearch';
import { cn } from '../lib/utils';

interface SearchComponentProps {
  className?: string;
  placeholder?: string;
  showFullResults?: boolean;
}

  // Utility to convert English digits to Bangla digits
  const toBanglaNumber = (num: string | number) => {
    const en = "0123456789";
    const bn = "০১২৩৪৫৬৭৮৯";
    // Format with commas (Indian system)
    const formatted = Number(num).toLocaleString("en-IN");
    // Convert to Bangla digits
    return formatted
      .split("")
      .map((c) => (en.includes(c) ? bn[en.indexOf(c)] : c))
      .join("");
  };

const SearchComponent: React.FC<SearchComponentProps> = ({
  className,
  placeholder = "Search any products...",
  showFullResults = true,
}) => {
  const {
    searchQuery,
    setSearchQuery,
    searchResults,
    isLoading,
    isOpen,
    setIsOpen,
    handleResultClick,
    clearSearch,
  } = useSearch();

  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [setIsOpen]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  const formatPrice = (price?: string) => {
    if (!price) return '';
    return `৳${price}`;
  };

  return (
    <div ref={searchRef} className={cn("relative w-full max-w-md", className)}>
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (searchQuery.trim() && searchResults.length > 0) {
              setIsOpen(true);
            }
          }}
          placeholder={placeholder}
          className="pl-10 pr-10 h-12 rounded-full border-2 border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200"
        />
        
        {/* Loading or Clear Button */}
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
          ) : searchQuery ? (
            <button
              onClick={clearSearch}
              className="p-1 rounded-full hover:bg-gray-100 transition-colors"
              type="button"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          ) : (
            <button
              className="p-2 bg-primary text-white rounded-full hover:bg-primary/90 transition-colors"
              type="button"
              onClick={() => {
                if (searchQuery.trim()) {
                  // Trigger search or navigate to search results page
                  console.log('Search for:', searchQuery);
                }
              }}
            >
              <Search className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Search Results Dropdown */}
      {isOpen && searchQuery.trim() && showFullResults && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-background rounded-2xl shadow-xl border border-gray-200 z-50 max-h-96 overflow-hidden">
          {/* Results Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            <span className="text-sm font-medium text-gray-700">
              {isLoading ? 'Searching...' : `${searchResults.length} results found`}
            </span>
            {searchResults.length > 0 && (
              <button
                onClick={() => setIsOpen(false)}
                className="text-xs text-gray-500 hover:text-gray-700"
              >
                Close
              </button>
            )}
          </div>

          {/* Results List */}
          <div className="max-h-80 overflow-y-auto">
            {searchResults.length === 0 && !isLoading ? (
              <div className="p-8 text-center">
                <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 font-medium mb-2">No products found</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {searchResults.map((result) => (
                  <div
                    key={result.id}
                    onClick={() => handleResultClick(result)}
                    className="flex items-center gap-4 p-4 hover:bg-gray-50 cursor-pointer transition-colors group"
                  >
                    {/* Product Image */}
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                      <img
                        src={result.image}
                        alt={result.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/assets/placeholder.svg';
                        }}
                      />
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-foreground">
                            {result.title}
                          </h3>
                        </div>

                        {/* Price */}
                        {result.price && (
                          <div className="text-right ml-2">
                            <span className="font-bold font-anekbangla text-secondary">
                              ৳{toBanglaNumber(result.price)}
                            </span>
                          </div>
                        )}
                      </div>                      
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* View All Results Footer */}
          {searchResults.length > 0 && (
            <div className="border-t border-gray-100 p-3">
              <button
                onClick={() => {
                  // Navigate to full search results page
                  console.log('View all results for:', searchQuery);
                  setIsOpen(false);
                }}
                className="w-full text-center text-sm text-secondary hover:text-primary/80 font-medium transition-colors"
              >
                View all results for "{searchQuery}"
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchComponent;
