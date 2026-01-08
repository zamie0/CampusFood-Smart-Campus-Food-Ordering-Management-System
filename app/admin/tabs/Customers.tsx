"use client";

import React, { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, RefreshCw } from "lucide-react";
import { toast } from "sonner";

interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  orders: number;
  totalSpent: number;
  createdAt?: string;
}

export default function CustomersContent() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/customers');
      if (!response.ok) {
        throw new Error('Failed to fetch customers');
      }
      const data = await response.json();
      setCustomers(data.customers || []);
    } catch (error) {
      console.error('Error fetching customers:', error);
      toast.error('Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
    const interval = setInterval(fetchCustomers, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Customers ({customers.length})</h3>
        <Button variant="outline" size="sm" onClick={fetchCustomers} disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {loading ? (
        <Card>
          <CardContent className="py-12 text-center">
            <RefreshCw className="w-12 h-12 text-muted-foreground mx-auto mb-4 animate-spin" />
            <p className="text-muted-foreground">Loading customers...</p>
          </CardContent>
        </Card>
      ) : customers.length === 0 ? (
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
                      {customer.phone && (
                        <p className="text-xs text-muted-foreground">{customer.phone}</p>
                      )}
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
