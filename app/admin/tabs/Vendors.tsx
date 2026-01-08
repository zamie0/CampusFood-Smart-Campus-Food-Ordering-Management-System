"use client";

import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, Filter, ShoppingBag, Store } from "lucide-react";

interface ApprovedVendor {
  id: string;
  name: string;
  email: string;
  phone?: string;
  description?: string;
  isActive: boolean;
  totalOrders: number;
  revenue: number;
  approvedAt: number;
}

interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: string;
  description?: string;
  isAvailable: boolean;
  isPopular: boolean;
  prepTime: number;
}

interface CustomerOrder {
  id: string;
  customerId?: string;
  customerName: string;
  customerEmail?: string;
  vendorId: string;
  vendorName: string;
  items: { name: string; quantity: number; price: number }[];
  total: number;
  status: "pending" | "confirmed" | "preparing" | "ready" | "picked_up" | "delivered" | "cancelled" | "completed";
  orderTime: number;
}

export default function VendorsContent({ 
  vendors, 
  onToggleStatus, 
  searchQuery 
}: { 
  vendors: ApprovedVendor[]; 
  onToggleStatus: (id: string) => void;
  searchQuery: string;
}) {
  const [selectedVendor, setSelectedVendor] = useState<ApprovedVendor | null>(null);
  const [vendorMenu, setVendorMenu] = useState<MenuItem[]>([]);
  const [vendorOrders, setVendorOrders] = useState<CustomerOrder[]>([]);

  const filteredVendors = vendors.filter((v) =>
    v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const viewVendorDetails = async (vendor: ApprovedVendor) => {
    setSelectedVendor(vendor);
    try {
      const response = await fetch(`/api/admin/vendors/${vendor.id}/details`);
      if (!response.ok) {
        throw new Error('Failed to fetch vendor details');
      }
      const data = await response.json();
      setVendorMenu(data.menu || []);
      setVendorOrders(data.orders || []);
    } catch (error) {
      console.error('Error fetching vendor details:', error);
      setVendorMenu([]);
      setVendorOrders([]);
    }
  };

  if (selectedVendor) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => setSelectedVendor(null)} className="mb-4">
          ← Back to Vendors
        </Button>
        
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center">
            <Store className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-foreground">{selectedVendor.name}</h3>
            <p className="text-muted-foreground">{selectedVendor.email}</p>
          </div>
          <Badge variant={selectedVendor.isActive ? "default" : "secondary"} className="ml-auto">
            {selectedVendor.isActive ? "Active" : "Inactive"}
          </Badge>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Menu Items ({vendorMenu.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {vendorMenu.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No menu items yet</p>
            ) : (
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {vendorMenu.map((item) => (
                  <div key={item.id} className="p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-foreground">{item.name}</p>
                        <p className="text-sm text-muted-foreground">{item.category}</p>
                      </div>
                      <Badge variant={item.isAvailable ? "default" : "secondary"} className="text-xs">
                        {item.isAvailable ? "Available" : "Unavailable"}
                      </Badge>
                    </div>
                    <p className="text-sm font-semibold text-foreground mt-2">RM {item.price.toFixed(2)}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-primary" />
              Orders ({vendorOrders.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {vendorOrders.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No orders yet</p>
            ) : (
              <div className="space-y-3">
                {vendorOrders.map((order) => (
                  <div key={order.id} className="p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-medium text-foreground">#{order.id.slice(-6)}</p>
                        <p className="text-sm text-muted-foreground">{order.customerName}</p>
                      </div>
                      <Badge variant={
                        order.status === "delivered" || order.status === "completed" ? "default" :
                        order.status === "pending" || order.status === "cancelled" ? "destructive" : "secondary"
                      }>
                        {order.status === "picked_up" ? "Picked Up" : order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {order.items.map((item, idx) => (
                        <span key={idx}>{item.quantity}x {item.name}{idx < order.items.length - 1 ? ", " : ""}</span>
                      ))}
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-sm text-muted-foreground">
                        {new Date(order.orderTime).toLocaleString()}
                      </span>
                      <span className="font-semibold text-foreground">RM {order.total.toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">All Vendors ({filteredVendors.length})</h3>
        <Button variant="outline" size="sm">
          <Filter className="w-4 h-4 mr-2" />
          Filter
        </Button>
      </div>

      {filteredVendors.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Store className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No vendors found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredVendors.map((vendor) => (
            <Card key={vendor.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Store className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">{vendor.name}</h4>
                      <p className="text-sm text-muted-foreground">{vendor.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Orders</p>
                      <p className="font-semibold text-foreground">{vendor.totalOrders}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Revenue</p>
                      <p className="font-semibold text-foreground">RM {vendor.revenue.toFixed(2)}</p>
                    </div>
                    <Badge variant={vendor.isActive ? "default" : "secondary"}>
                      {vendor.isActive ? "Active" : "Inactive"}
                    </Badge>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => viewVendorDetails(vendor)}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => onToggleStatus(vendor.id)}
                    >
                      {vendor.isActive ? "Suspend" : "Activate"}
                    </Button>
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
