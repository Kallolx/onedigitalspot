import React, { useState, useEffect } from "react";
import { Star, X, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "../ui/textarea";
import { createReview, updateReview, getUserReviews } from "@/lib/reviews";
import { account } from "@/lib/appwrite";
import { toast } from "@/components/ui/sonner";

interface OrderData {
  id?: string;
  $id?: string;
  orderID: string;
  productName: string;
  itemLabel: string;
  quantity: number;
  totalAmount: number;
  productImage?: string;
}

interface ReviewModalProps {
  order: OrderData;
  isOpen: boolean;
  onClose: () => void;
  onReviewSubmitted?: () => void; // Optional callback to refresh reviews
}

const ReviewModal: React.FC<ReviewModalProps> = ({
  order,
  isOpen,
  onClose,
  onReviewSubmitted,
}) => {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingReview, setExistingReview] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user already reviewed this product
  useEffect(() => {
    const checkExistingReview = async () => {
      try {
        const currentUser = await account.get();
        if (currentUser) {
          const userReviews = await getUserReviews(currentUser.$id);
          const existing = userReviews.find(
            (review: any) => review.productName === order.productName
          );
          if (existing) {
            setExistingReview(existing);
            setRating(existing.rating);
            setComment(existing.comment || "");
          }
        }
      } catch (error) {
        console.error("Error checking existing review:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen) {
      checkExistingReview();
    }
  }, [isOpen, order.productName]);

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error("Please select a rating before submitting.");
      return;
    }

    setIsSubmitting(true);
    try {
      if (existingReview) {
        // Update existing review
        await updateReview(existingReview.$id, {
          rating,
          comment: comment.trim(),
        });
        toast.success("Review updated successfully!");
      } else {
        // Create new review
        await createReview({
          productName: order.productName,
          category: "Games", // You can make this dynamic based on your needs
          rating,
          comment: comment.trim(),
          orderId: order.$id || order.id, // Link to the order for verification
        });
        toast.success("Review submitted successfully!");
      }
      
      // Call the callback to refresh reviews if provided
      if (onReviewSubmitted) {
        onReviewSubmitted();
      }
      
      onClose();
      setRating(0);
      setComment("");
      setExistingReview(null);
    } catch (error) {
      console.error("Error submitting review:", error);
      toast.error("Failed to submit review. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <Card className="w-full max-w-md p-8">
          <div className="flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            <span className="ml-2">Loading...</span>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <Card className="w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-bold text-gray-900">
            {existingReview ? "Edit Your Review" : "Rate Your Order"}
          </h2>

          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Product Info with Image */}
        <div className="p-6 border-b">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-md bg-gray-100 overflow-hidden flex-shrink-0">
              <img
                src={order.productImage || "/assets/placeholder.svg"}
                alt={order.productName}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    "/assets/placeholder.svg";
                }}
              />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">
                {order.productName}
              </h3>
              <p className="text-sm text-gray-600">{order.itemLabel}</p>
              <p className="text-sm text-gray-900 font-semibold">
                ৳{order.totalAmount}
              </p>
            </div>

            {/* Reorder ghost button placed to the far right of this row */}
            <div className="ml-auto">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  // open product page by slugifying productName; fallback to home
                  const slug = String(order.productName || "")
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, "-")
                    .replace(/(^-|-$)/g, "");
                  const url = slug ? `/products/${slug}` : "/products";
                  try {
                    window.open(url, "_blank");
                  } catch (e) {
                    window.location.href = url;
                  }
                }}
                disabled={isSubmitting}
                className="text-sm"
                title={`Reorder ${order.productName}`}
              >
                Reorder
              </Button>
            </div>
          </div>
        </div>

        {/* Rating Section */}
        <div className="p-6 pt-2">
          <h3 className="text-lg font-medium text-muted-foreground mb-2 text-center">
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
                    ? "text-retro-yellow"
                    : "text-retro-yellow"
                } hover:text-yellow-400`}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
              >
                <Star
                  className="w-8 h-8"
                  fill={
                    star <= (hoveredRating || rating) ? "currentColor" : "none"
                  }
                />
              </button>
            ))}
          </div>

          {/* Comment Section */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              Share your feedback (optional)
            </label>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="type here..."
              className="w-full px-3 py-2 bg-popover"
              rows={3}
              maxLength={255}
            />
            <div className="text-right text-xs text-gray-500 mt-2">
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
                  <span>{existingReview ? "Update Review" : "Submit Review"}</span>
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
