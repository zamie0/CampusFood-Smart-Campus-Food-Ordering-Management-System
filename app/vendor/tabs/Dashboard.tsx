"use client";

import React from "react";
import { motion } from "framer-motion";
import { AlertCircle, Clock, DollarSign, Eye, Package, Plus, Settings, ShoppingBag, Utensils } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";

export default function VendorDashboardTab({ stats, onAddItem, onViewOrders, onOpenSettings, isStoreOpen, onToggleStore }: { 
  stats: any;
  onAddItem: () => void;
  onViewOrders: () => void;
  onOpenSettings: () => void;
  isStoreOpen: boolean;
  onToggleStore: () => void;
}) {
  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${isStoreOpen ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="font-medium text-foreground">
                Store is {isStoreOpen ? 'Open' : 'Closed'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={isStoreOpen} onCheckedChange={onToggleStore} />
              <span className="text-sm text-muted-foreground">
                {isStoreOpen ? 'Accepting orders' : 'Not accepting orders'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={ShoppingBag} label="Today's Orders" value={stats.todayOrders} />
        <StatCard icon={Clock} label="Pending" value={stats.pendingOrders} />
        <StatCard icon={Package} label="Preparing" value={stats.preparingOrders} />
        <StatCard icon={DollarSign} label="Today's Revenue" value={`RM ${stats.todayRevenue.toFixed(2)}`} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Utensils className="w-5 h-5 text-primary" />
              Menu Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Total Items</span>
                <span className="font-semibold text-foreground">{stats.totalItems}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Available</span>
                <span className="font-semibold text-foreground">{stats.availableItems}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Unavailable</span>
                <span className="font-semibold text-foreground">{stats.totalItems - stats.availableItems}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-primary" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start" variant="outline" onClick={onAddItem}>
              <Plus className="w-4 h-4 mr-2" />
              Add New Menu Item
            </Button>
            <Button className="w-full justify-start" variant="outline" onClick={onViewOrders}>
              <Eye className="w-4 h-4 mr-2" />
              View All Orders
            </Button>
            <Button className="w-full justify-start" variant="outline" onClick={onOpenSettings}>
              <Settings className="w-4 h-4 mr-2" />
              Update Store Settings
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value }: { icon: any; label: string; value: string | number }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border rounded-xl p-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold text-foreground mt-1">{value}</p>
        </div>
        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
          <Icon className="w-6 h-6 text-primary" />
        </div>
      </div>
    </motion.div>
  );
}
