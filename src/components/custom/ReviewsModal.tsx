import React, { useState } from "react";
import { Star, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useProductReviews, ProductReview } from "@/hooks/useProductReviews";

interface ReviewsModalProps {
  productName: string;
  isOpen: boolean;
  onClose: () => void;
}

const ReviewsModal: React.FC<ReviewsModalProps> = ({
  productName,
  isOpen,
  onClose,
}) => {
  const { reviews, loading } = useProductReviews(productName);

  if (!isOpen) return null;

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating
                ? "text-retro-yellow fill-retro-yellow"
                : "text-accent"
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <Card className="w-full bg-background max-w-md overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              {productName} Reviews 
            </h2>
            {reviews.length > 0 && (
              <p className="text-sm text-gray-600 mt-1">
                <span className="font-bold text-secondary">({reviews.length})</span> review{reviews.length !== 1 ? 's' : ''}
              </p>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0 rounded-full hover:bg-gray-100"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-4 pt-0">
          {loading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-gray-600">No reviews yet</p>
            </div>
          ) : (
            <div className="relative">
              {/* Scrollable Reviews Container - Shows exactly 2 cards at a time */}
              <div 
                className="h-64 overflow-y-auto space-y-3 pr-2"
                style={{
                  scrollbarWidth: 'none', /* Firefox */
                  msOverflowStyle: 'none', /* IE and Edge */
                }}
              >
                {reviews.map((review, index) => (
                  <Card key={index} className="w-full">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        {/* User Avatar */}
                        <div className="flex-shrink-0">
                          <img
                            src={`/assets/users/${(index % 4) + 1}.png`}
                            alt="User Avatar"
                            className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                            onError={(e) => {
                              // Fallback to a default avatar if image fails to load
                              const target = e.target as HTMLImageElement;
                              target.src = `/assets/users/1.png`;
                            }}
                          />
                        </div>

                        {/* Review Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-semibold text-gray-900 whitespace-nowrap truncate">
                              {review?.userName || "Anonymous Customer"}
                            </span>
                            {review?.isVerified && (
                              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                                Verified Purchase
                              </span>
                            )}
                          </div>

                          {/* Rating Stars */}
                          <div className="mb-2">
                            {renderStars(review?.rating || 0)}
                          </div>

                          {/* Comment */}
                          <p className="text-gray-700 leading-relaxed text-sm">
                            {review?.comment}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default ReviewsModal;