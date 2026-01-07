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

  const fetchNotifications = async () => {
    if (!user) {
      setNotifications([]);
      setLoading(false);
      return;
    }

    // Load customer-specific notifications from localStorage
    const customerNotifications = JSON.parse(localStorage.getItem(`customer_notifications_${user.id}`) || "[]");

    // TODO: Replace with actual database query when notifications table is created
    // For now, using mock data structure plus customer notifications
    const mockNotifications: Notification[] = [
      {
        id: 'n1',
        type: 'order',
        title: 'Order Ready!',
        message: 'Your order from Pizza Palace is ready for pickup.',
        time: '5 minutes ago',
        isRead: false,
      },
      {
        id: 'n2',
        type: 'promo',
        title: 'Special Offer',
        message: 'Get 20% off on all burgers today!',
        time: '1 hour ago',
        isRead: false,
      },
      {
        id: 'n3',
        type: 'announcement',
        title: 'New Vendor Added',
        message: 'Check out the new sushi restaurant on campus!',
        time: '2 hours ago',
        isRead: true,
      },
    ];

    // Combine mock notifications with customer notifications
    const allNotifications = [...customerNotifications, ...mockNotifications];

    // Load read status from localStorage to persist across sessions
    const savedReadStatus = localStorage.getItem(`notifications_read_${user.id}`);
    if (savedReadStatus) {
      const readIds = JSON.parse(savedReadStatus) as string[];
      const updatedNotifications = allNotifications.map(notif => ({
        ...notif,
        isRead: readIds.includes(notif.id),
      }));
      setNotifications(updatedNotifications);
    } else {
      setNotifications(allNotifications);
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
    fetchNotifications();
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

