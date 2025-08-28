import { useState, useEffect } from 'react';
import { getProductReviews } from '@/lib/reviews';

export interface ProductReview {
  $id?: string;
  productName: string;
  category: string;
  userId: string;
  userName: string;
  userEmail: string;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
  isVerified: boolean;
  orderId?: string;
}

export const useProductReviews = (productName: string) => {
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalReviews: 0,
    averageRating: 0,
    ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  });

  const fetchReviews = async () => {
    if (!productName) return;
    
    try {
      setLoading(true);
      const productReviews = await getProductReviews(productName);
      setReviews(productReviews);
      
      // Calculate statistics
      if (productReviews.length > 0) {
        const total = productReviews.length;
        const average = productReviews.reduce((sum, review) => sum + review.rating, 0) / total;
        
        const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        productReviews.forEach(review => {
          distribution[review.rating as keyof typeof distribution]++;
        });
        
        setStats({
          totalReviews: total,
          averageRating: Math.round(average * 10) / 10,
          ratingDistribution: distribution
        });
      }
      
      setError(null);
    } catch (err) {
      console.error('Error fetching product reviews:', err);
      setError('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [productName]);

  return {
    reviews,
    loading,
    error,
    stats,
    refetch: fetchReviews
  };
};
