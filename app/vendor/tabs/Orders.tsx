"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ShoppingBag } from "lucide-react";

export interface VendorOrder {
  id: string;
  customerName: string;
  items: { name: string; quantity: number; price: number }[];
  total: number;
  status: "pending" | "preparing" | "ready" | "completed";
  orderTime: number;
}

export default function VendorOrdersTab({
  orders,
  onUpdateStatus,
}: {
  orders: VendorOrder[];
  onUpdateStatus: (orderId: string, status: VendorOrder["status"]) => void;
}) {
  const statusOrder = ["pending", "preparing", "ready", "completed"];
  const sortedOrders = [...orders].sort((a, b) => statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">All Orders ({orders.length})</h3>
      </div>

      {orders.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <ShoppingBag className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No orders yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {sortedOrders.map((order) => (
            <Card key={order.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-semibold text-foreground">#{order.id.slice(-6)}</span>
                      <Badge
                        variant={
                          order.status === "pending"
                            ? "destructive"
                            : order.status === "preparing"
                            ? "default"
                            : order.status === "ready"
                            ? "secondary"
                            : "outline"
                        }
                      >
                        {order.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{order.customerName}</p>
                    <div className="mt-2 space-y-1">
                      {order.items.map((item, idx) => (
                        <p key={idx} className="text-sm text-foreground">
                          {item.quantity}x {item.name}
                        </p>
                      ))}
                    </div>
                    <p className="text-sm font-semibold text-foreground mt-2">Total: RM {order.total.toFixed(2)}</p>
                  </div>
                  <div className="flex flex-col gap-2">
                    {order.status === "pending" && (
                      <Button size="sm" onClick={() => onUpdateStatus(order.id, "preparing")}>
                        Start Preparing
                      </Button>
                    )}
                    {order.status === "preparing" && (
                      <Button size="sm" onClick={() => onUpdateStatus(order.id, "ready")}>
                        Mark Ready
                      </Button>
                    )}
                    {order.status === "ready" && (
                      <Button size="sm" onClick={() => onUpdateStatus(order.id, "completed")}>
                        Complete
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
