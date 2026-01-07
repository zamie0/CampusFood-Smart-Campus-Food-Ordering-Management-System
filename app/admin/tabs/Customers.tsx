"use client";

import React, { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Users } from "lucide-react";

interface CustomerOrder {
  id: string;
  customerId?: string;
  customerName: string;
  customerEmail?: string;
  vendorId: string;
  vendorName: string;
  items: { name: string; quantity: number; price: number }[];
  total: number;
  status: "pending" | "preparing" | "ready" | "completed";
  orderTime: number;
}

export default function CustomersContent() {
  const [customers, setCustomers] = useState<{
    name: string;
    email: string;
    orders: number;
    totalSpent: number;
  }[]>([]);

  useEffect(() => {
    const allOrders = JSON.parse(localStorage.getItem("allCustomerOrders") || "[]") as CustomerOrder[];
    const customerMap = new Map<string, { name: string; email: string; orders: number; totalSpent: number }>();

    allOrders.forEach((order) => {
      const key = order.customerEmail || order.customerName;
      const existing = customerMap.get(key);
      if (existing) {
        existing.orders += 1;
        existing.totalSpent += order.total;
      } else {
        customerMap.set(key, {
          name: order.customerName,
          email: order.customerEmail || "N/A",
          orders: 1,
          totalSpent: order.total,
        });
      }
    });

    setCustomers(Array.from(customerMap.values()));
  }, []);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-foreground">Customers ({customers.length})</h3>

      {customers.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No customers yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {customers.map((customer, idx) => (
            <Card key={idx}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Users className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{customer.name}</p>
                      <p className="text-sm text-muted-foreground">{customer.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Orders</p>
                      <p className="font-semibold text-foreground">{customer.orders}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Total Spent</p>
                      <p className="font-semibold text-foreground">RM {customer.totalSpent.toFixed(2)}</p>
                    </div>
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
