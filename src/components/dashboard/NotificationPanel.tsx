import { motion } from "framer-motion";
import { Bell, Megaphone, Tag, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  time: string;
  isRead: boolean;
}

interface NotificationPanelProps {
  notifications: Notification[];
  onClose: () => void;
  onMarkAsRead?: (notificationId: string) => void;
  onViewAll?: () => void;
}

const NotificationPanel = ({ notifications, onClose, onMarkAsRead, onViewAll }: NotificationPanelProps) => {
  const getIcon = (type: string) => {
    switch (type) {
      case 'order':
        return <Bell className="h-4 w-4 text-success" />;
      case 'promo':
        return <Tag className="h-4 w-4 text-primary" />;
      case 'announcement':
        return <Megaphone className="h-4 w-4 text-info" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-40" 
        onClick={onClose}
      />
      
      {/* Panel */}
      <motion.div
        initial={{ opacity: 0, y: 10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.95 }}
        className="absolute right-0 top-12 w-80 bg-card rounded-2xl shadow-xl border border-border z-50 overflow-hidden"
      >
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="font-semibold text-foreground">Notifications</h3>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="max-h-80 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-8 text-center">
              <Bell className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No notifications</p>
              <p className="text-xs text-muted-foreground/70 mt-1">You'll see order updates here</p>
            </div>
          ) : (
            notifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-4 border-b border-border last:border-0 transition-colors hover:bg-muted/50 cursor-pointer ${
                !notification.isRead ? 'bg-primary/5' : ''
              }`}
              onClick={() => {
                if (!notification.isRead && onMarkAsRead) {
                  onMarkAsRead(notification.id);
                }
              }}
            >
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                  {getIcon(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-medium text-sm text-foreground">{notification.title}</p>
                    {!notification.isRead && (
                      <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1.5" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                    {notification.message}
                  </p>
                  <p className="text-xs text-muted-foreground/70 mt-1">{notification.time}</p>
                </div>
              </div>
            </div>
            ))
          )}
        </div>

        <div className="p-3 border-t border-border bg-muted/30">
          <Button variant="ghost" size="sm" className="w-full text-xs" onClick={onViewAll}>
            View all notifications
          </Button>
        </div>
      </motion.div>
    </>
  );
};

export default NotificationPanel;
