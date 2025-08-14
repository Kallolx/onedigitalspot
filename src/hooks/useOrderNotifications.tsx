import { useEffect, useRef } from 'react';
import { useNotifications } from '../contexts/NotificationContext';
import { getAllOrders } from '../lib/orders';

interface OrderData {
  id?: string;
  $id?: string;
  orderID: string;
  userName: string;
  userEmail: string;
  productName: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  updatedAt?: string;
}

export const useOrderNotifications = () => {
  const { addNotification } = useNotifications();
  const lastCheckRef = useRef<Date>(new Date());
  const knownOrdersRef = useRef<Set<string>>(new Set());

  // Initialize known orders
  useEffect(() => {
    const initializeKnownOrders = async () => {
      try {
        const orders = await getAllOrders();
        const orderIds = orders.map((order: any) => order.$id || order.id).filter(Boolean);
        knownOrdersRef.current = new Set(orderIds);
      } catch (error) {
        console.error('Error initializing known orders:', error);
      }
    };

    initializeKnownOrders();
  }, []);

  // Check for new orders periodically
  useEffect(() => {
    const checkForNewOrders = async () => {
      try {
        const orders = await getAllOrders();
        const currentTime = new Date();
        
        // Filter for orders created since last check
        const newOrders = orders.filter((order: any) => {
          const orderId = order.$id || order.id;
          const orderTime = new Date(order.createdAt);
          
          // Check if this is a truly new order (not in our known set and created recently)
          const isNewOrder = orderId && !knownOrdersRef.current.has(orderId);
          const isRecent = orderTime > lastCheckRef.current;
          
          if (isNewOrder) {
            knownOrdersRef.current.add(orderId);
          }
          
          return isNewOrder && isRecent;
        });

        // Create notifications for new orders
        newOrders.forEach((order: any) => {
          addNotification({
            type: 'order',
            title: 'New Order Received!',
            message: `${order.userName} placed an order for ${order.productName} - ${order.totalAmount}৳`,
            orderId: order.$id || order.id,
            orderData: order,
            actionUrl: '/admin/orders'
          });
        });

        lastCheckRef.current = currentTime;
      } catch (error) {
        console.error('Error checking for new orders:', error);
      }
    };

    // Check immediately
    checkForNewOrders();

    // Set up polling every 30 seconds
    const interval = setInterval(checkForNewOrders, 30000);

    return () => clearInterval(interval);
  }, [addNotification]);

  // Request notification permission
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  return {
    // You can add methods here to manually trigger notifications
    triggerOrderNotification: (orderData: OrderData) => {
      addNotification({
        type: 'order',
        title: 'New Order Received!',
        message: `${orderData.userName} placed an order for ${orderData.productName} - ${orderData.totalAmount}৳`,
        orderId: orderData.$id || orderData.id,
        orderData,
        actionUrl: '/admin/orders'
      });
    }
  };
};
