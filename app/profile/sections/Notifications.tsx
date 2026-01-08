"use client";

import { FC } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, Bell, Tag, Megaphone } from "lucide-react";

export interface NotificationRow {
  id: string;
  type: 'order' | 'promo' | string;
  title: string;
  message: string;
  time: string;
  isRead: boolean;
}

interface NotificationsProps {
  notifications: NotificationRow[];
  onRefresh: () => void;
  onMarkRead: (id: string) => void;
}

const Notifications: FC<NotificationsProps> = ({ notifications, onRefresh, onMarkRead }) => {
  return (
    <div className="bg-card rounded-2xl border border-border p-6 flex flex-col max-h-[calc(1000vh-14rem)]">
      <div className="flex items-center justify-between mb-6 flex-shrink-0">
        <h3 className="text-lg font-semibold text-foreground">Notifications</h3>
        <Button variant="ghost" size="sm" onClick={onRefresh}>
          <RefreshCw className="h-4 w-4 mr-2" /> Refresh
        </Button>
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-12 flex-1 flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
            <Bell className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground">No notifications yet</p>
          <p className="text-sm text-muted-foreground mt-1">You'll see order updates and promotions here</p>
        </div>
      ) : (
        <div className="space-y-2 overflow-y-auto flex-1 min-h-0 pr-2" style={{ scrollbarWidth: 'thin', scrollbarColor: 'var(--border) transparent' }}>
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-4 rounded-xl border border-border transition-colors hover:bg-muted/50 cursor-pointer ${
                !notification.isRead ? 'bg-primary/5' : 'bg-muted/30'
              }`}
              onClick={() => {
                if (!notification.isRead) onMarkRead(notification.id);
              }}
            >
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                  {notification.type === 'order' ? (
                    <Bell className="h-5 w-5 text-success" />
                  ) : notification.type === 'promo' ? (
                    <Tag className="h-5 w-5 text-primary" />
                  ) : (
                    <Megaphone className="h-5 w-5 text-info" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-medium text-sm text-foreground">{notification.title}</p>
                    {!notification.isRead && <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1.5" />}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                  <p className="text-xs text-muted-foreground/70 mt-2">{notification.time}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;
