import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search, Star, Filter, SortAsc, Grid, List } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { useSearch, SearchResult } from '../hooks/useSearch';
import { cn } from '../lib/utils';

const SearchResultsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get('q') || '';
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('relevance');
  const [filterCategory, setFilterCategory] = useState('all');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const { searchQuery, setSearchQuery, handleResultClick } = useSearch();

  useEffect(() => {
    if (query) {
      setSearchQuery(query);
      performSearch(query);
    }
  }, [query, setSearchQuery]);

  const performSearch = async (searchTerm: string) => {
    setIsLoading(true);
    // Use the search hook logic or implement direct search here
    // For now, we'll use a simplified version
    setTimeout(() => {
      // This would be replaced with actual search logic
      const mockResults: SearchResult[] = [
        {
          id: '1',
          title: 'PUBG Mobile UC',
          image: '/products/mobile-games/pubg-mobile.avif',
          price: '499',
          category: 'Mobile Games',
          route: '/mobile-games/pubg-mobile',
          source: 'static',
          rating: 5,
        },
        // Add more mock results...
      ];
      setResults(mockResults);
      setIsLoading(false);
    }, 500);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSearchParams({ q: searchQuery.trim() });
    }
  };

  const filteredResults = results.filter(result => 
    filterCategory === 'all' || result.category === filterCategory
  );

  const sortedResults = [...filteredResults].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return parseInt(a.price || '0') - parseInt(b.price || '0');
      case 'price-high':
        return parseInt(b.price || '0') - parseInt(a.price || '0');
      case 'name':
        return a.title.localeCompare(b.title);
      case 'rating':
        return (b.rating || 0) - (a.rating || 0);
      default:
        return 0; // relevance
    }
  });

  const categories = Array.from(new Set(results.map(r => r.category)));

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Search Header */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Search Results
            {query && (
              <span className="text-lg font-normal text-gray-600 ml-2">
                for "{query}"
              </span>
            )}
          </h1>
          
          {/* Search Form */}
          <form onSubmit={handleSearchSubmit} className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for products..."
                className="pl-10 h-12 border-2 border-gray-200 focus:border-primary"
              />
            </div>
            <Button type="submit" className="h-12 px-6">
              Search
            </Button>
          </form>

          {/* Results Count */}
          <p className="text-gray-600">
            {isLoading ? 'Searching...' : `${sortedResults.length} products found`}
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 sticky top-8">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Filter className="w-5 h-5" />
                Filters
              </h3>

              {/* Category Filter */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-700 mb-3">Category</h4>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="category"
                      value="all"
                      checked={filterCategory === 'all'}
                      onChange={(e) => setFilterCategory(e.target.value)}
                      className="mr-2"
                    />
                    All Categories
                  </label>
                  {categories.map(category => (
                    <label key={category} className="flex items-center">
                      <input
                        type="radio"
                        name="category"
                        value={category}
                        checked={filterCategory === category}
                        onChange={(e) => setFilterCategory(e.target.value)}
                        className="mr-2"
                      />
                      {category}
                    </label>
                  ))}
                </div>
              </div>

              {/* Sort Options */}
              <div>
                <h4 className="font-medium text-gray-700 mb-3">Sort By</h4>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                >
                  <option value="relevance">Relevance</option>
                  <option value="name">Name A-Z</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Rating</option>
                </select>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="flex-1">
            {/* View Mode Toggle */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Results Grid/List */}
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 animate-pulse">
                    <div className="w-full h-48 bg-gray-200 rounded-xl mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  </div>
                ))}
              </div>
            ) : sortedResults.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-200 text-center">
                <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-600 mb-6">
                  Try adjusting your search terms or filters
                </p>
                <Button onClick={() => {
                  setSearchQuery('');
                  setFilterCategory('all');
                  setSortBy('relevance');
                }}>
                  Clear Filters
                </Button>
              </div>
            ) : (
              <div className={cn(
                viewMode === 'grid'
                  ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                  : 'space-y-4'
              )}>
                {sortedResults.map((result) => (
                  <div
                    key={result.id}
                    onClick={() => handleResultClick(result)}
                    className={cn(
                      "bg-white rounded-2xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 cursor-pointer group",
                      viewMode === 'grid' ? 'p-6' : 'p-4 flex items-center gap-4'
                    )}
                  >
                    <div className={cn(
                      "overflow-hidden bg-gray-100 flex-shrink-0",
                      viewMode === 'grid' ? 'w-full h-48 rounded-xl mb-4' : 'w-16 h-16 rounded-lg'
                    )}>
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

                    <div className="flex-1">
                      <div className={cn(
                        "flex items-start justify-between",
                        viewMode === 'list' ? 'items-center' : 'mb-2'
                      )}>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 group-hover:text-primary transition-colors truncate">
                            {result.title}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">
                            {result.category}
                          </p>
                          
                          {result.rating && (
                            <div className="flex items-center gap-1 mt-1">
                              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                              <span className="text-sm text-gray-600">{result.rating}</span>
                            </div>
                          )}
                        </div>

                        {result.price && (
                          <div className="text-right ml-4">
                            <span className="font-bold text-primary text-lg">
                              ৳{result.price}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between mt-2">
                        <span
                          className={cn(
                            "text-xs px-2 py-1 rounded-full font-medium",
                            result.source === 'database'
                              ? "bg-green-100 text-green-700"
                              : "bg-blue-100 text-blue-700"
                          )}
                        >
                          {result.source === 'database' ? 'Live' : 'Catalog'}
                        </span>

                        {viewMode === 'grid' && (
                          <Button size="sm" className="mt-2">
                            View Details
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchResultsPage;
