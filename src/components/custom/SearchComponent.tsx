import React, { useRef, useEffect, useState } from "react";
import { Search, X, Loader2 } from "lucide-react";
import { Input } from "../ui/input";
import { useSearch } from "../../hooks/useSearch";
import { cn } from "../../lib/utils";

interface SearchComponentProps {
  className?: string;
  placeholder?: string;
  showFullResults?: boolean;
}

// Utility to convert English digits to Bangla digits
const toBanglaNumber = (num: string | number) => {
  const en = "0123456789";
  const bn = "০১২৩৪৫৬৭৮৯";
  const formatted = Number(num).toLocaleString("en-IN");
  return formatted
    .split("")
    .map((c) => (en.includes(c) ? bn[en.indexOf(c)] : c))
    .join("");
};

const rotatingPlaceholders = [
  "netflix",
  "spotify",
  "chatgpt",
  "mobile legends",
  "pubg mobile",
  "free fire",
  "steam wallet",
  "google play",
  "playstation",
  "itunes",
  "amazon",
  "discord nitro",
  "roblox",
  "valorant",
  "genshin impact",
  "canva pro",
  "grammarly",
  "youtube premium",
  "hulu",
  "apple music",
  "google one",
  "office 365",
  "photoshop",
  "fifa mobile",
  "clash royale",
  "icloud+",
];

const SearchComponent: React.FC<SearchComponentProps> = ({
  className,
  placeholder = "search",
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

  const [index, setIndex] = useState(0);
  const [subIndex, setSubIndex] = useState(0);
  const [deleting, setDeleting] = useState(false);
  const [isFocused, setIsFocused] = useState(false); // NEW

  // Typewriter placeholder effect
  useEffect(() => {
    if (searchQuery || isFocused) return; // stop animating when user types OR clicks input
    const currentWord = rotatingPlaceholders[index];
    let timeout: NodeJS.Timeout;

    if (!deleting && subIndex < currentWord.length) {
      timeout = setTimeout(() => setSubIndex(subIndex + 1), 120);
    } else if (deleting && subIndex > 0) {
      timeout = setTimeout(() => setSubIndex(subIndex - 1), 60);
    } else if (!deleting && subIndex === currentWord.length) {
      timeout = setTimeout(() => setDeleting(true), 1200);
    } else if (deleting && subIndex === 0) {
      setDeleting(false);
      setIndex((prev) => (prev + 1) % rotatingPlaceholders.length);
    }

    return () => clearTimeout(timeout);
  }, [subIndex, deleting, index, searchQuery, isFocused]);

  const animatedPlaceholder =
    !searchQuery && !isFocused && subIndex > 0
      ? `search ${rotatingPlaceholders[index].substring(0, subIndex)}|`
      : "search"; // freeze when focused

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [setIsOpen]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  // Typewriter placeholder effect (only when input is empty)
  useEffect(() => {
    if (searchQuery) return;
    const currentWord = rotatingPlaceholders[index];
    let timeout: NodeJS.Timeout;

    if (!deleting && subIndex < currentWord.length) {
      timeout = setTimeout(() => setSubIndex(subIndex + 1), 120);
    } else if (deleting && subIndex > 0) {
      timeout = setTimeout(() => setSubIndex(subIndex - 1), 60);
    } else if (!deleting && subIndex === currentWord.length) {
      timeout = setTimeout(() => setDeleting(true), 1200);
    } else if (deleting && subIndex === 0) {
      setDeleting(false);
      setIndex((prev) => (prev + 1) % rotatingPlaceholders.length);
    }

    return () => clearTimeout(timeout);
  }, [subIndex, deleting, index, searchQuery]);

  return (
    <div ref={searchRef} className={cn("relative w-full max-w-md", className)}>
      {/* Search Input */}
      <div className="relative">
        <Input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            setIsFocused(true); // stop typewriter on focus
            if (searchQuery.trim() && searchResults.length > 0) {
              setIsOpen(true);
            }
          }}
          onBlur={() => setIsFocused(false)} // resume animation when unfocused
          placeholder={animatedPlaceholder}
          className="pl-6 pr-10 h-12 rounded-full border-2 border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200"
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
                  console.log("Search for:", searchQuery);
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
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            <span className="text-sm font-medium text-gray-700">
              {isLoading
                ? "Searching..."
                : `${searchResults.length} results found`}
            </span>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {searchResults.length === 0 && !isLoading ? (
              <div className="p-8 text-center">
                <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 font-medium mb-2">
                  No products found
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {searchResults.map((result) => (
                  <div
                    key={result.id}
                    onClick={() => handleResultClick(result)}
                    className="flex items-center gap-4 p-4 hover:bg-gray-50 cursor-pointer transition-colors group"
                  >
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                      <img
                        src={result.image}
                        alt={result.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = "/assets/placeholder.svg";
                        }}
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-foreground">
                            {result.title}
                          </h3>
                        </div>

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
        </div>
      )}
    </div>
  );
};

export default SearchComponent;
