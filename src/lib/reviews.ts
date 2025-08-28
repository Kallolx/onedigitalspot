import { databases, account } from './appwrite';
import { ID, Query } from 'appwrite';

// Database and collection IDs
const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const REVIEWS_COLLECTION_ID = 'reviews';

export interface Review {
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
  isHidden: boolean;
  orderId?: string;
}

export interface CreateReviewData {
  productName: string;
  category: string;
  rating: number;
  comment: string;
  orderId?: string;
}

// Create a new review
export const createReview = async (reviewData: CreateReviewData) => {
  try {
    if (!DATABASE_ID || !REVIEWS_COLLECTION_ID) {
      throw new Error('Database configuration is missing');
    }

    // Get current user info
    const currentUser = await account.get();
    
    const now = new Date().toISOString();
    
    const review = await databases.createDocument(
      DATABASE_ID,
      REVIEWS_COLLECTION_ID,
      ID.unique(),
      {
        ...reviewData,
        userId: currentUser.$id,
        userName: currentUser.name || 'Anonymous',
        userEmail: currentUser.email,
        isHidden: false,
      }
    );
    
    return review;
  } catch (error) {
    console.error('Error creating review:', error);
    throw error;
  }
};

// Get reviews for a specific product
export const getProductReviews = async (productName: string) => {
  try {
    if (!DATABASE_ID || !REVIEWS_COLLECTION_ID) {
      throw new Error('Database configuration is missing');
    }

    const reviews = await databases.listDocuments(
      DATABASE_ID,
      REVIEWS_COLLECTION_ID,
      [
        Query.equal('productName', productName),
        Query.equal('isHidden', false), // Only show visible reviews
      ]
    );

    return reviews.documents as unknown as Review[];
  } catch (error) {
    console.error('Error fetching product reviews:', error);
    throw error;
  }
};

// Get reviews by category
export const getCategoryReviews = async (category: string) => {
  try {
    if (!DATABASE_ID || !REVIEWS_COLLECTION_ID) {
      throw new Error('Database configuration is missing');
    }

    const reviews = await databases.listDocuments(
      DATABASE_ID,
      REVIEWS_COLLECTION_ID,
      [
        Query.equal('category', category),
      ]
    );

    return reviews.documents as unknown as Review[];
  } catch (error) {
    console.error('Error fetching category reviews:', error);
    throw error;
  }
};

// Get user's reviews
export const getUserReviews = async (userId: string) => {
  try {
    if (!DATABASE_ID || !REVIEWS_COLLECTION_ID) {
      throw new Error('Database configuration is missing');
    }

    const reviews = await databases.listDocuments(
      DATABASE_ID,
      REVIEWS_COLLECTION_ID,
      [
        Query.equal('userId', userId),
      ]
    );

    return reviews.documents as unknown as Review[];
  } catch (error) {
    console.error('Error fetching user reviews:', error);
    throw error;
  }
};

// Update a review
export const updateReview = async (reviewId: string, reviewData: Partial<CreateReviewData>) => {
  try {
    if (!DATABASE_ID || !REVIEWS_COLLECTION_ID) {
      throw new Error('Database configuration is missing');
    }

    const updatedReview = await databases.updateDocument(
      DATABASE_ID,
      REVIEWS_COLLECTION_ID,
      reviewId,
      {
        ...reviewData,
      }
    );
    
    return updatedReview;
  } catch (error) {
    console.error('Error updating review:', error);
    throw error;
  }
};

// Delete a review
export const deleteReview = async (reviewId: string) => {
  try {
    if (!DATABASE_ID || !REVIEWS_COLLECTION_ID) {
      throw new Error('Database configuration is missing');
    }

    const deleted = await databases.deleteDocument(
      DATABASE_ID,
      REVIEWS_COLLECTION_ID,
      reviewId
    );

    return deleted;
  } catch (error) {
    console.error('Error deleting review:', error);
    throw error;
  }
};

export const hasUserReviewedProduct = async (userId: string, productName: string) => {
  try {
    if (!DATABASE_ID || !REVIEWS_COLLECTION_ID) {
      throw new Error('Database configuration is missing');
    }

    const reviews = await databases.listDocuments(
      DATABASE_ID,
      REVIEWS_COLLECTION_ID,
      [
        Query.equal('userId', userId),
        Query.equal('productName', productName)
      ]
    );

    return reviews.documents.length > 0;
  } catch (error) {
    console.error('Error checking user review:', error);
    return false;
  }
};
