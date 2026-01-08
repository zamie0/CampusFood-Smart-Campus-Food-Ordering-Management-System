import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useAuth } from "./AuthContext";

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  time: string;
  isRead: boolean;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (notificationId: string) => Promise<void>;
  refreshNotifications: () => Promise<void>;
  addNotification: (notification: Omit<Notification, 'id' | 'time' | 'isRead'>) => void;
  loading: boolean;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const formatTimeAgo = (dateString: string | Date | undefined): string => {
    if (!dateString) return 'Just now';
    
    try {
      const now = new Date();
      const then = typeof dateString === 'string' ? new Date(dateString) : dateString;
      
      if (isNaN(then.getTime())) return 'Just now';
      
      const diffInSeconds = Math.floor((now.getTime() - then.getTime()) / 1000);

      if (diffInSeconds < 0) return 'Just now';
      if (diffInSeconds < 60) return 'Just now';
      if (diffInSeconds < 3600) {
        const minutes = Math.floor(diffInSeconds / 60);
        return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
      }
      if (diffInSeconds < 86400) {
        const hours = Math.floor(diffInSeconds / 3600);
        return `${hours} hour${hours > 1 ? 's' : ''} ago`;
      }
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    } catch {
      return 'Just now';
    }
  };

  const fetchNotifications = async () => {
    if (!user) {
      setNotifications([]);
      setLoading(false);
      return;
    }

    try {
      // Fetch orders for the current user
      const ordersResponse = await fetch('/api/orders', {
        cache: 'no-store',
      });

      if (ordersResponse.ok) {
        const ordersData = await ordersResponse.json();
        const orders = ordersData.orders || [];

        // Create notifications from order status changes
        // Get the most recent status for each order to avoid duplicates
        const orderStatusMap = new Map<string, any>();
        
        orders.forEach((order: any) => {
          const existing = orderStatusMap.get(order.id);
          if (!existing || new Date(order.orderTime || order.createdAt) > new Date(existing.orderTime || existing.createdAt)) {
            orderStatusMap.set(order.id, order);
          }
        });

        const orderNotifications: Notification[] = Array.from(orderStatusMap.values())
          .filter((order: any) => 
            order.status !== 'completed' && 
            order.status !== 'cancelled' &&
            order.status !== 'delivered'
          )
          .map((order: any) => {
            let title = '';
            let message = '';
            const status = order.status;

            switch (status) {
              case 'pending':
                title = 'Order Placed';
                message = `Your order from ${order.vendorName} has been placed and is waiting for confirmation.`;
                break;
              case 'confirmed':
                title = 'Order Confirmed';
                message = `${order.vendorName} has confirmed your order and will start preparing it soon.`;
                break;
              case 'preparing':
                title = 'Order Being Prepared';
                message = `Your order from ${order.vendorName} is being prepared right now!`;
                break;
              case 'ready':
                title = 'Order Ready for Pickup!';
                message = `Your order from ${order.vendorName} is ready! Head to the counter to collect it.`;
                break;
              case 'picked_up':
                title = 'Order Picked Up';
                message = `Your order from ${order.vendorName} has been picked up. Enjoy your meal!`;
                break;
              default:
                title = 'Order Update';
                message = `Your order from ${order.vendorName} status has been updated.`;
            }

            const orderDate = order.orderTime || order.createdAt;
            return {
              id: `order-${order.id}-${status}`,
              type: 'order',
              title,
              message,
              time: formatTimeAgo(orderDate),
              isRead: false,
              orderId: order.id,
              orderStatus: status,
            } as Notification & { orderId?: string; orderStatus?: string };
          })
          .sort((a: any, b: any) => {
            // Sort by most recent first based on order ID or timestamp
            // Since we don't have timestamp in the notification, sort by ID (which includes timestamp)
            return b.id.localeCompare(a.id);
          });

        // Load read status from localStorage
        const savedReadStatus = localStorage.getItem(`notifications_read_${user.id}`);
        const readIds = savedReadStatus ? JSON.parse(savedReadStatus) as string[] : [];

        // Mark notifications as read based on saved status
        const updatedNotifications = orderNotifications.map(notif => ({
          ...notif,
          isRead: readIds.includes(notif.id),
        }));

        setNotifications(updatedNotifications);
      } else {
        // Fallback to empty if API fails
        setNotifications([]);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setNotifications([]);
    }
    
    setLoading(false);
  };

  const markAsRead = async (notificationId: string) => {
    if (!user) return;

    setNotifications((prev) => {
      const updated = prev.map((notification) =>
        notification.id === notificationId
          ? { ...notification, isRead: true }
          : notification
      );

      // Save read status to localStorage
      const readIds = updated
        .filter(n => n.isRead)
        .map(n => n.id);
      localStorage.setItem(`notifications_read_${user.id}`, JSON.stringify(readIds));

      return updated;
    });
  };

  const refreshNotifications = async () => {
    setLoading(true);
    await fetchNotifications();
  };

  const addNotification = (notificationData: Omit<Notification, 'id' | 'time' | 'isRead'>) => {
    if (!user) return;

    const newNotification: Notification = {
      ...notificationData,
      id: `n${Date.now()}`,
      time: 'Just now',
      isRead: false,
    };

    setNotifications((prev) => [newNotification, ...prev]);

    // Also save to customer notifications in localStorage
    const customerNotifications = JSON.parse(localStorage.getItem(`customer_notifications_${user.id}`) || "[]");
    customerNotifications.unshift(newNotification);
    // Keep only last 10 notifications
    if (customerNotifications.length > 10) {
      customerNotifications.splice(10);
    }
    localStorage.setItem(`customer_notifications_${user.id}`, JSON.stringify(customerNotifications));
  };

  useEffect(() => {
    if (!user) {
      setNotifications([]);
      setLoading(false);
      return;
    }

    fetchNotifications();
    
    // Poll for new notifications every 10 seconds
    const interval = setInterval(() => {
      fetchNotifications();
    }, 10000); // Poll every 10 seconds
    
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        refreshNotifications,
        addNotification,
        loading,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
}

