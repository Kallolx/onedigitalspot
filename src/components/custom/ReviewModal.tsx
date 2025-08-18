import React, { useState } from 'react';
import { Star, X, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface OrderData {
  id?: string;
  $id?: string;
  orderID: string;
  productName: string;
  itemLabel: string;
  quantity: number;
  totalAmount: number;
}

interface ReviewModalProps {
  order: OrderData;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (orderId: string, rating: number, comment: string) => Promise<void>;
}

const ReviewModal: React.FC<ReviewModalProps> = ({
  order,
  isOpen,
  onClose,
  onSubmit
}) => {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      alert('Please select a rating before submitting.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(order.$id || order.id || '', rating, comment);
      onClose();
      setRating(0);
      setComment('');
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Failed to submit review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <Card className="w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-bold text-gray-900">Rate Your Order</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Product Info */}
        <div className="p-4 border-b">
          <h3 className="font-semibold text-gray-900">{order.productName}</h3>
          <p className="text-sm text-gray-600">{order.itemLabel}</p>
          <p className="text-sm text-gray-900 font-semibold">৳{order.totalAmount}</p>
        </div>

        {/* Rating Section */}
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
            How was your experience?
          </h3>

          {/* Star Rating */}
          <div className="flex justify-center space-x-1 mb-4">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className={`p-1 transition-colors ${
                  star <= (hoveredRating || rating)
                    ? 'text-yellow-400'
                    : 'text-gray-300'
                } hover:text-yellow-400`}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
              >
                <Star
                  className="w-8 h-8"
                  fill={star <= (hoveredRating || rating) ? 'currentColor' : 'none'}
                />
              </button>
            ))}
          </div>

          {/* Comment Section */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Share your feedback (optional)
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tell us about your experience..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary resize-none"
              rows={3}
              maxLength={255}
            />
            <div className="text-right text-xs text-gray-500 mt-1">
              {comment.length}/255 characters
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="border-t bg-gray-50 p-4">
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isSubmitting}
            >
              Skip
            </Button>
            <Button
              onClick={handleSubmit}
              className="flex-1"
              disabled={rating === 0 || isSubmitting}
            >
              {isSubmitting ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Submitting...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Send className="w-4 h-4" />
                  <span>Submit Review</span>
                </div>
              )}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ReviewModal;
