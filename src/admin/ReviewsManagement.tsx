import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Eye, 
  EyeOff, 
  Trash2, 
  Search, 
  Filter, 
  Star, 
  User, 
  Calendar,
  AlertTriangle,
  CheckCircle,
  XCircle
} from "lucide-react";
import { toast } from "@/components/ui/sonner";
import { databases, ID } from "@/lib/appwrite";
import { appwriteConfig } from "@/lib/appwrite";

interface Review {
  $id: string;
  productName: string;
  category: string;
  rating: number;
  comment: string;
  userName?: string;
  userId: string;
  isVerified: boolean;
  isHidden: boolean;
  createdAt: string;
  updatedAt: string;
}

const ReviewsManagement: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [filteredReviews, setFilteredReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedRating, setSelectedRating] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedReviews, setSelectedReviews] = useState<string[]>([]);

  // Fetch all reviews
  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.reviewsCollectionId
      );
      setReviews(response.documents as Review[]);
      setFilteredReviews(response.documents as Review[]);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      toast.error("Failed to fetch reviews");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  // Filter reviews based on search and filters
  useEffect(() => {
    let filtered = reviews;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(review =>
        review.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        review.comment.toLowerCase().includes(searchTerm.toLowerCase()) ||
        review.userName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (selectedCategory !== "all") {
      filtered = filtered.filter(review => review.category === selectedCategory);
    }

    // Rating filter
    if (selectedRating !== "all") {
      const rating = parseInt(selectedRating);
      filtered = filtered.filter(review => review.rating === rating);
    }

    // Status filter
    if (selectedStatus !== "all") {
      if (selectedStatus === "hidden") {
        filtered = filtered.filter(review => review.isHidden);
      } else if (selectedStatus === "visible") {
        filtered = filtered.filter(review => !review.isHidden);
      }
    }

    setFilteredReviews(filtered);
  }, [reviews, searchTerm, selectedCategory, selectedRating, selectedStatus]);

  // Toggle review visibility
  const toggleReviewVisibility = async (reviewId: string, currentStatus: boolean) => {
    try {
      await databases.updateDocument(
        appwriteConfig.databaseId,
        appwriteConfig.reviewsCollectionId,
        reviewId,
        {
          isHidden: !currentStatus
        }
      );
      
      toast.success(`Review ${currentStatus ? 'hidden' : 'shown'} successfully`);
      fetchReviews(); // Refresh the list
    } catch (error) {
      console.error("Error updating review:", error);
      toast.error("Failed to update review");
    }
  };

  // Delete review
  const deleteReview = async (reviewId: string) => {
    if (!confirm("Are you sure you want to delete this review? This action cannot be undone.")) {
      return;
    }

    try {
      await databases.deleteDocument(
        appwriteConfig.databaseId,
        appwriteConfig.reviewsCollectionId,
        reviewId
      );
      
      toast.success("Review deleted successfully");
      fetchReviews(); // Refresh the list
    } catch (error) {
      console.error("Error deleting review:", error);
      toast.error("Failed to delete review");
    }
  };

  // Bulk actions
  const handleBulkAction = async (action: 'hide' | 'show' | 'delete') => {
    if (selectedReviews.length === 0) {
      toast.error("Please select reviews first");
      return;
    }

    if (action === 'delete' && !confirm(`Are you sure you want to delete ${selectedReviews.length} review(s)? This action cannot be undone.`)) {
      return;
    }

    try {
      for (const reviewId of selectedReviews) {
        if (action === 'delete') {
          await databases.deleteDocument(
            appwriteConfig.databaseId,
            appwriteConfig.reviewsCollectionId,
            reviewId
          );
        } else {
          await databases.updateDocument(
            appwriteConfig.databaseId,
            appwriteConfig.reviewsCollectionId,
            reviewId,
            {
              isHidden: action === 'hide'
            }
          );
        }
      }

      const actionText = action === 'delete' ? 'deleted' : action === 'hide' ? 'hidden' : 'shown';
      toast.success(`${selectedReviews.length} review(s) ${actionText} successfully`);
      
      setSelectedReviews([]);
      fetchReviews(); // Refresh the list
    } catch (error) {
      console.error(`Error performing bulk ${action}:`, error);
      toast.error(`Failed to ${action} reviews`);
    }
  };

  // Get unique categories
  const categories = [...new Set(reviews.map(review => review.category))];

  // Render star rating
  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating
                ? "text-yellow-400 fill-yellow-400"
                : "text-gray-300"
            }`}
          />
        ))}
        <span className="ml-1 text-sm text-gray-600">({rating})</span>
      </div>
    );
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reviews Management</h1>
          <p className="text-gray-600 mt-2">
            Manage and moderate product reviews across all categories
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-sm">
            Total: {reviews.length}
          </Badge>
          <Badge variant="outline" className="text-sm">
            Visible: {reviews.filter(r => !r.isHidden).length}
          </Badge>
          <Badge variant="destructive" className="text-sm">
            Hidden: {reviews.filter(r => r.isHidden).length}
          </Badge>
        </div>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search reviews..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>

            {/* Rating Filter */}
            <select
              value={selectedRating}
              onChange={(e) => setSelectedRating(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">All Status</option>
              <option value="visible">Visible</option>
              <option value="hidden">Hidden</option>
            </select>
          </div>

          {/* Bulk Actions */}
          {selectedReviews.length > 0 && (
            <div className="flex items-center gap-2 pt-4 border-t">
              <span className="text-sm text-gray-600">
                {selectedReviews.length} review(s) selected
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkAction('show')}
              >
                <Eye className="w-4 h-4 mr-2" />
                Show All
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkAction('hide')}
              >
                <EyeOff className="w-4 h-4 mr-2" />
                Hide All
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleBulkAction('delete')}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete All
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Reviews List */}
      <Card>
        <CardHeader>
          <CardTitle>Reviews ({filteredReviews.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredReviews.map((review) => (
              <div
                key={review.$id}
                className={`p-4 border rounded-lg ${
                  review.isHidden ? 'bg-gray-50 border-gray-200' : 'bg-white border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <input
                        type="checkbox"
                        checked={selectedReviews.includes(review.$id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedReviews([...selectedReviews, review.$id]);
                          } else {
                            setSelectedReviews(selectedReviews.filter(id => id !== review.$id));
                          }
                        }}
                        className="rounded border-gray-300"
                      />
                      
                      <h3 className="font-semibold text-gray-900">
                        {review.productName}
                      </h3>
                      
                      <Badge variant="outline">{review.category}</Badge>
                      
                      {review.isVerified && (
                        <Badge variant="default" className="bg-green-100 text-green-800">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                      
                      {review.isHidden && (
                        <Badge variant="secondary">
                          <EyeOff className="w-3 h-3 mr-1" />
                          Hidden
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-4 mb-3 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        {review.userName || 'Anonymous'}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {formatDate(review.createdAt)}
                      </div>
                    </div>

                    <div className="mb-3">
                      {renderStars(review.rating)}
                    </div>

                    <p className="text-gray-700">{review.comment}</p>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleReviewVisibility(review.$id, review.isHidden)}
                      title={review.isHidden ? 'Show Review' : 'Hide Review'}
                    >
                      {review.isHidden ? (
                        <Eye className="w-4 h-4" />
                      ) : (
                        <EyeOff className="w-4 h-4" />
                      )}
                    </Button>
                    
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteReview(review.$id)}
                      title="Delete Review"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}

            {filteredReviews.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No reviews found matching your criteria
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReviewsManagement;
