"use client";

import { FC } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, ShoppingBag, Clock } from "lucide-react";

export interface OrderItem { name: string; quantity: number; price: number }
export interface OrderRow {
  id: string;
  vendor_name: string;
  items: OrderItem[];
  total: number;
  status: string;
  order_time: string;
}

interface OrdersProps {
  orders: OrderRow[];
  onRefresh: () => void;
  onReorder?: (order: OrderRow) => void;
}

const Orders: FC<OrdersProps> = ({ orders, onRefresh, onReorder }) => {
  return (
    <div className="bg-card rounded-2xl border border-border p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground">Order History</h3>
        <Button variant="ghost" size="sm" onClick={onRefresh}>
          <RefreshCw className="h-4 w-4 mr-2" /> Refresh
        </Button>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
            <ShoppingBag className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground">No orders yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="p-4 rounded-xl bg-muted/30 border border-border">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-medium text-foreground">{order.vendor_name}</h4>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                    <Clock className="h-3 w-3" />
                    {new Date(order.order_time).toLocaleDateString()}
                  </p>
                </div>
                <Badge
                  variant={
                    order.status === "completed"
                      ? "success"
                      : order.status === "preparing"
                      ? "preparing"
                      : "pending"
                  }
                >
                  {order.status}
                </Badge>
              </div>

              <div className="space-y-1 mb-3">
                {order.items.map((item, idx) => (
                  <div key={`${order.id}-${idx}`} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{item.quantity}x {item.name}</span>
                    <span className="text-foreground">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-border">
                <span className="font-semibold text-foreground">Total: ${Number(order.total).toFixed(2)}</span>
                <Button variant="soft" size="sm" onClick={() => onReorder?.(order)}>Reorder</Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;
