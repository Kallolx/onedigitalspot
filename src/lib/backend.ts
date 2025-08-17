// Backend API service for frontend
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

export class BackendAPI {
  static async request(endpoint: string, options: RequestInit = {}) {
    try {
      const response = await fetch(`${BACKEND_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...(options.headers || {})
        },
        ...options
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error(`Backend API Error (${endpoint}):`, error);
      throw error;
    }
  }

  // Email services
  static async sendWelcomeEmail(email, name) {
    return this.request('/api/email/welcome', {
      method: 'POST',
      body: JSON.stringify({ email, name })
    });
  }

  static async sendOrderInvoice(email, name, orderDetails) {
    return this.request('/api/email/order-invoice', {
      method: 'POST',
      body: JSON.stringify({ email, name, orderDetails })
    });
  }

  static async sendVerificationEmail(email, name, verificationLink) {
    return this.request('/api/email/verification', {
      method: 'POST',
      body: JSON.stringify({ email, name, verificationLink })
    });
  }

  static async sendDeliveryEmail(email, name, orderDetails, productData) {
    return this.request('/api/email/delivery', {
      method: 'POST',
      body: JSON.stringify({ email, name, orderDetails, productData })
    });
  }

  // Order services
  static async getUserOrders(userId) {
    return this.request(`/api/orders/user/${userId}`);
  }

  static async getOrderById(orderId) {
    return this.request(`/api/orders/${orderId}`);
  }

  static async updateOrderStatus(orderId, status) {
    return this.request(`/api/orders/${orderId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
  }

  static async getOrderStats() {
    return this.request('/api/orders/stats/overview');
  }

  // User services
  static async getUserStats(userId) {
    return this.request(`/api/users/${userId}/stats`);
  }

  static async updateUserPreferences(userId, preferences) {
    return this.request(`/api/users/${userId}/preferences`, {
      method: 'PATCH',
      body: JSON.stringify({ preferences })
    });
  }

  // Health check
  static async healthCheck() {
    return this.request('/health');
  }
}

// Unified backend service for modern usage
export const backendService = {
  async sendEmail(type: string, data: any) {
    switch (type) {
      case 'welcome':
        return BackendAPI.sendWelcomeEmail(data.email, data.name);
      case 'order-invoice':
        return BackendAPI.sendOrderInvoice(data.email, data.name, data.orderDetails);
      case 'verification':
        return BackendAPI.sendVerificationEmail(data.email, data.name, data.verificationLink);
      case 'delivery':
        return BackendAPI.sendDeliveryEmail(data.email, data.name, data.orderDetails, data.productData);
      default:
        throw new Error(`Unknown email type: ${type}`);
    }
  },

  async healthCheck() {
    return BackendAPI.healthCheck();
  }
};
