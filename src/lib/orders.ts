import { databases, account } from "./appwrite";
import { ID, Query } from "appwrite";

export interface OrderData {
  reviews: any;
  deliveryInfo: string; // JSON string of delivery information
  id?: string;
  $id?: string; // Appwrite document ID
  orderID: string; // Auto-generated 6-character order ID (matches Appwrite attribute name)
  userId: string;
  userName: string;
  userEmail: string;
  productType: string;
  productName: string;
  productImage: string;
  itemLabel: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  playerId?: string;    // For most mobile games (PUBG, Mobile Legends, etc.)
  zoneId?: string;      // For games that require zone/server info
  uuid?: string;        // For games like Genshin Impact that use UID
  paymentMethod: string;
  paymentAccountNumber: string;
  transactionId: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const ORDERS_COLLECTION_ID = import.meta.env.VITE_APPWRITE_COLLECTION_ORDERS_ID;

// Generate a unique 6-character order ID
const generateOrderId = (productType: string, productName: string): string => {
  // Company identifier: "1DS" for OneDigital Spot
  const companyCode = "1DS";
  
  // Product type code mapping
  const productTypeCode = {
    "Mobile Games": "MG",
    "PC Games": "PC", 
    "Gift Cards": "GC",
    "AI Tools": "AI",
    "Subscriptions": "SB"
  }[productType] || "PD";
  
  // Generate 2 random characters (numbers + letters)
  const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let randomCode = "";
  for (let i = 0; i < 2; i++) {
    randomCode += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return companyCode + productTypeCode + randomCode; // Total: 6 characters
};

export const createOrder = async (orderData: Omit<OrderData, 'id' | '$id' | 'orderID' | 'createdAt' | 'updatedAt'>) => {
  try {
    const now = new Date().toISOString();
    
    // Generate unique order ID
    const orderID = generateOrderId(orderData.productType, orderData.productName);
    
    const order = await databases.createDocument(
      DATABASE_ID,
      ORDERS_COLLECTION_ID,
      ID.unique(),
      {
        ...orderData,
        orderID,
        createdAt: now,
        updatedAt: now,
      }
    );
    
    return order;
  } catch (error) {
    console.error("Error creating order:", error);
    throw error;
  }
};

export const getUserOrders = async (userId: string) => {
  try {
    const orders = await databases.listDocuments(
      DATABASE_ID,
      ORDERS_COLLECTION_ID,
      [
        Query.equal('userId', userId),
        Query.orderDesc('$createdAt')
      ]
    );
    
    return orders.documents;
  } catch (error) {
    console.error("Error fetching user orders:", error);
    throw error;
  }
};

export const getAllOrders = async () => {
  try {
    const orders = await databases.listDocuments(
      DATABASE_ID,
      ORDERS_COLLECTION_ID,
      [
        Query.orderDesc('$createdAt')
      ]
    );
    
    return orders.documents;
  } catch (error) {
    console.error("Error fetching all orders:", error);
    throw error;
  }
};

export const updateOrderStatus = async (orderId: string, status: string) => {
  try {
    console.log('Attempting to update order:', { 
      orderId, 
      status, 
      DATABASE_ID, 
      ORDERS_COLLECTION_ID 
    });

    // Validate environment variables
    if (!DATABASE_ID) {
      throw new Error('DATABASE_ID is not configured. Please check your environment variables.');
    }
    
    if (!ORDERS_COLLECTION_ID) {
      throw new Error('ORDERS_COLLECTION_ID is not configured. Please check your environment variables.');
    }

    // Validate input parameters with specific error messages
    if (!orderId || orderId.trim() === '') {
      throw new Error('Order ID is required and cannot be empty');
    }
    
    if (!status || status.trim() === '') {
      throw new Error('Status is required and cannot be empty');
    }

    const updatedOrder = await databases.updateDocument(
      DATABASE_ID,
      ORDERS_COLLECTION_ID,
      orderId.trim(),
      {
        status: status.trim(),
        updatedAt: new Date().toISOString(),
      }
    );
    
    console.log('Order updated successfully:', updatedOrder);
    return updatedOrder;
  } catch (error: any) {
    console.error("Error updating order status:", error);
    console.error("Error details:", {
      message: error.message,
      code: error.code,
      type: error.type,
      DATABASE_ID,
      ORDERS_COLLECTION_ID,
      orderId,
      status
    });
    throw error;
  }
};

export const updateOrderReview = async (orderId: string, reviewData: { rating: number; comment: string }) => {
  try {
    const reviewJson = JSON.stringify({
      ...reviewData,
      submittedAt: new Date().toISOString()
    });

    const updatedOrder = await databases.updateDocument(
      DATABASE_ID,
      ORDERS_COLLECTION_ID,
      orderId.trim(),
      {
        reviews: reviewJson,
        updatedAt: new Date().toISOString(),
      }
    );
    
    return updatedOrder;
  } catch (error: any) {
    console.error("Error updating order review:", error);
    throw error;
  }
};

export const deleteOrder = async (orderId: string) => {
  try {
    if (!DATABASE_ID) {
      throw new Error('DATABASE_ID is not configured.');
    }
    if (!ORDERS_COLLECTION_ID) {
      throw new Error('ORDERS_COLLECTION_ID is not configured.');
    }
    if (!orderId || orderId.trim() === '') {
      throw new Error('Order ID is required for deletion.');
    }

    const deleted = await databases.deleteDocument(
      DATABASE_ID,
      ORDERS_COLLECTION_ID,
      orderId.trim()
    );

    return deleted;
  } catch (error: any) {
    console.error('Error deleting order:', error);
    throw error;
  }
};

export const getCurrentUser = async () => {
  try {
    const user = await account.get();
    return user;
  } catch (error) {
    console.error("Error getting current user:", error);
    throw error;
  }
};

export const getProductReviews = async (productName: string) => {
  try {
    if (!DATABASE_ID || !ORDERS_COLLECTION_ID) {
      throw new Error('Database configuration is missing');
    }

    // Query orders by product name and filter those with reviews
    const orders = await databases.listDocuments(
      DATABASE_ID,
      ORDERS_COLLECTION_ID,
      [
        Query.equal('productName', productName),
        Query.equal('status', 'completed'),
        Query.isNotNull('reviews')
      ]
    );

    // Parse reviews and return them
    const reviews = orders.documents
      .filter(order => order.reviews)
      .map(order => {
        try {
          const reviewData = JSON.parse(order.reviews);
          return {
            rating: reviewData.rating,
            comment: reviewData.comment,
            submittedAt: reviewData.submittedAt,
            orderId: order.$id,
            customerName: order.userName
          };
        } catch (parseError) {
          console.error('Error parsing review data:', parseError);
          return null;
        }
      })
      .filter(Boolean)
      .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()); // Sort by newest first

    return reviews;
  } catch (error) {
    console.error("Error fetching product reviews:", error);
    throw error;
  }
};
