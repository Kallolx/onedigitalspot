import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { databases } from '../lib/appwrite';
import { Query } from 'appwrite';
import { mobileGames, pcGames, giftCards, aiTools, subscriptions, productivity } from '../lib/products';

export interface SearchResult {
  id: string;
  title: string;
  image: string;
  price?: string;
  category: string;
  route?: string;
  source: 'database' | 'static';
  description?: string;
  rating?: number;
}

export const useSearch = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  // Combine all static products
  const allStaticProducts = [
    ...mobileGames,
    ...pcGames,
    ...giftCards,
    ...aiTools,
    ...subscriptions,
    ...productivity,
  ];

  // Search database first, then fallback to static products
  const searchProducts = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsLoading(true);
    const results: SearchResult[] = [];

    try {
      // First, try to search in database (if you have a products collection)
      const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
      const PRODUCTS_COLLECTION_ID = import.meta.env.VITE_APPWRITE_COLLECTION_PRODUCTS_ID;

      if (DATABASE_ID && PRODUCTS_COLLECTION_ID) {
        try {
          const dbProducts = await databases.listDocuments(
            DATABASE_ID,
            PRODUCTS_COLLECTION_ID,
            [
              Query.search('title', query),
              Query.limit(10)
            ]
          );

          // Add database results
          dbProducts.documents.forEach((product: any) => {
            results.push({
              id: product.$id,
              title: product.title,
              image: product.image || '/assets/placeholder.svg',
              price: product.price,
              category: product.category,
              route: product.route,
              source: 'database',
              description: product.description,
              rating: product.rating,
            });
          });
        } catch (dbError) {
          console.log('Database search failed, using static products only:', dbError);
        }
      }

      // Search in static products (fallback or supplement)
      const staticResults = allStaticProducts.filter(product =>
        product.title.toLowerCase().includes(query.toLowerCase()) ||
        product.category.toLowerCase().includes(query.toLowerCase())
      );

      // Add static results that aren't already in database results
      staticResults.forEach(product => {
        const exists = results.some(r => r.title.toLowerCase() === product.title.toLowerCase());
        if (!exists) {
          results.push({
            id: `static-${product.title.replace(/\s+/g, '-').toLowerCase()}`,
            title: product.title,
            image: product.image,
            price: product.price,
            category: product.category,
            route: product.route,
            source: 'static',
            rating: product.rating,
          });
        }
      });

      // Sort results by relevance (exact matches first, then partial matches)
      const sortedResults = results.sort((a, b) => {
        const aExact = a.title.toLowerCase().startsWith(query.toLowerCase());
        const bExact = b.title.toLowerCase().startsWith(query.toLowerCase());
        
        if (aExact && !bExact) return -1;
        if (!aExact && bExact) return 1;
        
        return a.title.localeCompare(b.title);
      });

      setSearchResults(sortedResults.slice(0, 8)); // Limit to 8 results
    } catch (error) {
      console.error('Search error:', error);
      // Fallback to static search only
      const staticResults = allStaticProducts.filter(product =>
        product.title.toLowerCase().includes(query.toLowerCase()) ||
        product.category.toLowerCase().includes(query.toLowerCase())
      );

      setSearchResults(
        staticResults.slice(0, 8).map(product => ({
          id: `static-${product.title.replace(/\s+/g, '-').toLowerCase()}`,
          title: product.title,
          image: product.image,
          price: product.price,
          category: product.category,
          route: product.route,
          source: 'static',
          rating: product.rating,
        }))
      );
    } finally {
      setIsLoading(false);
    }
  }, [allStaticProducts]);

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim()) {
        searchProducts(searchQuery);
        setIsOpen(true);
      } else {
        setSearchResults([]);
        setIsOpen(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, searchProducts]);

  const handleResultClick = (result: SearchResult) => {
    if (result.route) {
      navigate(result.route);
    } else {
      // Generate route based on category and title if no specific route
      const categoryRoute = {
        'Mobile Games': '/mobile-games/',
        'PC Games': '/pc-games/',
        'Gift Cards': '/gift-cards/',
        'AI Assistant': '/ai-tools/',
        'AI Coding': '/ai-tools/',
        'Entertainment': '/subscriptions/',
        'Gaming': '/subscriptions/',
        'Productivity': '/subscriptions/',
        'Security': '/subscriptions/',
        'Social': '/subscriptions/',
      }[result.category] || '/';

      const productSlug = result.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      navigate(`${categoryRoute}${productSlug}`);
    }
    
    setIsOpen(false);
    setSearchQuery('');
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setIsOpen(false);
  };

  return {
    searchQuery,
    setSearchQuery,
    searchResults,
    isLoading,
    isOpen,
    setIsOpen,
    handleResultClick,
    clearSearch,
  };
};
