"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, TrendingUp, DollarSign, ShoppingBag, Users, Store, Calendar, BarChart3 } from "lucide-react";
import { toast } from "sonner";

interface AnalyticsData {
  overview: {
    totalVendors: number;
    activeVendors: number;
    totalCustomers: number;
    totalOrders: number;
    totalRevenue: number;
    recentRevenue: number;
    avgOrderValue: number;
  };
  ordersByStatus: Record<string, number>;
  revenueByDay: Array<{ _id: string; revenue: number; orders: number }>;
  topVendors: Array<{ vendorId: string; vendorName: string; revenue: number; orders: number }>;
  ordersByDayOfWeek: Array<{ day: string; count: number }>;
  period: number;
}

export default function AnalyticsContent() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState(30);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/analytics?days=${period}`);
      if (!response.ok) {
        throw new Error('Failed to fetch analytics');
      }
      const analyticsData = await response.json();
      setData(analyticsData);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  if (loading || !data) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <RefreshCw className="w-12 h-12 text-muted-foreground mx-auto mb-4 animate-spin" />
          <p className="text-muted-foreground">Loading analytics...</p>
        </CardContent>
      </Card>
    );
  }

  const { overview, ordersByStatus, revenueByDay, topVendors, ordersByDayOfWeek } = data;

  // Calculate growth percentage (comparing recent period to previous period)
  const previousPeriodRevenue = revenueByDay.length > 0 
    ? revenueByDay.slice(0, Math.floor(revenueByDay.length / 2))
        .reduce((sum, day) => sum + day.revenue, 0)
    : 0;
  const recentPeriodRevenue = revenueByDay.length > 0
    ? revenueByDay.slice(Math.floor(revenueByDay.length / 2))
        .reduce((sum, day) => sum + day.revenue, 0)
    : 0;
  const revenueGrowth = previousPeriodRevenue > 0
    ? ((recentPeriodRevenue - previousPeriodRevenue) / previousPeriodRevenue * 100)
    : 0;

  // Find peak day
  const peakDay = revenueByDay.length > 0
    ? revenueByDay.reduce((max, day) => day.revenue > max.revenue ? day : max, revenueByDay[0])
    : null;

  return (
    <div className="space-y-6">
      {/* Period Selector */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-muted-foreground" />
          <h3 className="text-lg font-semibold text-foreground">Analytics Overview</h3>
        </div>
        <div className="flex items-center gap-2">
          {[7, 30, 90].map((days) => (
            <Button
              key={days}
              variant={period === days ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setPeriod(days)}
            >
              {days} Days
            </Button>
          ))}
          <Button variant="outline" className="cursor-pointer" onClick={fetchAnalytics}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
            <DollarSign className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">RM {overview.totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Recent {period} days: RM {overview.recentRevenue.toFixed(2)}
            </p>
            {revenueGrowth !== 0 && (
              <p className={`text-xs mt-1 ${revenueGrowth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {revenueGrowth > 0 ? '↑' : '↓'} {Math.abs(revenueGrowth).toFixed(1)}% vs previous period
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Orders</CardTitle>
            <ShoppingBag className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{overview.totalOrders}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Recent {period} days: {revenueByDay.reduce((sum, day) => sum + day.orders, 0)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Avg Order Value: RM {overview.avgOrderValue.toFixed(2)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Vendors</CardTitle>
            <Store className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{overview.activeVendors}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Out of {overview.totalVendors} total vendors
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Active Rate: {overview.totalVendors > 0 
                ? ((overview.activeVendors / overview.totalVendors) * 100).toFixed(0) 
                : 0}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Customers</CardTitle>
            <Users className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{overview.totalCustomers}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Avg Orders per Customer: {overview.totalCustomers > 0 
                ? (overview.totalOrders / overview.totalCustomers).toFixed(1) 
                : 0}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Revenue Trend (Last {period} Days)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {revenueByDay.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No revenue data available</p>
          ) : (
            <div className="space-y-4">
              <div className="h-64 flex items-end gap-1">
                {revenueByDay.map((day, index) => {
                  const maxRevenue = Math.max(...revenueByDay.map(d => d.revenue), 1);
                  const height = (day.revenue / maxRevenue) * 100;
                  return (
                    <div key={index} className="flex-1 flex flex-col items-center group">
                      <div
                        className="w-full bg-primary rounded-t transition-all hover:bg-primary/80 cursor-pointer"
                        style={{ height: `${height}%` }}
                        title={`${day._id}: RM ${day.revenue.toFixed(2)}`}
                      />
                      <span className="text-xs text-muted-foreground mt-2 transform -rotate-45 origin-top-left whitespace-nowrap">
                        {new Date(day._id).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  );
                })}
              </div>
              {peakDay && (
                <div className="text-sm text-muted-foreground text-center">
                  Peak Day: {new Date(peakDay._id).toLocaleDateString()} - RM {peakDay.revenue.toFixed(2)}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Orders by Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              Orders by Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(ordersByStatus).map(([status, count]) => {
                const total = Object.values(ordersByStatus).reduce((sum, c) => sum + c, 0);
                const percentage = total > 0 ? (count / total) * 100 : 0;
                return (
                  <div key={status} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-foreground capitalize">
                        {status === "picked_up" ? "Picked Up" : status}
                      </span>
                      <span className="font-semibold text-foreground">{count} ({percentage.toFixed(1)}%)</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Orders by Day of Week */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              Orders by Day of Week
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {ordersByDayOfWeek.map((dayData, index) => {
                const maxCount = Math.max(...ordersByDayOfWeek.map(d => d.count), 1);
                const percentage = (dayData.count / maxCount) * 100;
                return (
                  <div key={index} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-foreground">{dayData.day}</span>
                      <span className="font-semibold text-foreground">{dayData.count} orders</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Vendors */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Store className="w-5 h-5 text-primary" />
            Top Vendors by Revenue
          </CardTitle>
        </CardHeader>
        <CardContent>
          {topVendors.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No vendor data available</p>
          ) : (
            <div className="space-y-3">
              {topVendors.map((vendor, index) => (
                <div key={vendor.vendorId} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-semibold text-primary">#{index + 1}</span>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{vendor.vendorName}</p>
                      <p className="text-sm text-muted-foreground">{vendor.orders} orders</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-foreground">RM {vendor.revenue.toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground">
                      Avg: RM {vendor.orders > 0 ? (vendor.revenue / vendor.orders).toFixed(2) : '0.00'}
                    </p>
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
