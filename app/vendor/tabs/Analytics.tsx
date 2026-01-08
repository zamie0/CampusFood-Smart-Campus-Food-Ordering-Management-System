"use client";

import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/src/components/ui/chart";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";

export interface VendorAnalyticsStats {
  totalItems: number;
}

export interface VendorAnalyticsOrder {
  id: string;
  total: number;
  status: "pending" | "confirmed" | "preparing" | "ready" | "picked_up" | "delivered" | "cancelled" | "completed";
  orderTime: number;
  items?: { name: string; quantity: number; price: number }[];
}

function daysBack(n: number) {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - n);
  return d;
}

function fmtShort(d: Date) {
  return d.toLocaleDateString(undefined, { day: "2-digit", month: "2-digit" });
}

export default function VendorAnalyticsTab({ stats, orders }: { stats: VendorAnalyticsStats; orders: VendorAnalyticsOrder[] }) {
  const { revenueSeries, ordersSeries, statusSeries, topItems } = useMemo(() => {
    const days = Array.from({ length: 7 }).map((_, i) => daysBack(6 - i));
    const byKey: Record<string, { revenue: number; count: number }> = {};
    days.forEach((d) => (byKey[d.toISOString()] = { revenue: 0, count: 0 }));

    const statusCount: Record<string, number> = { 
      pending: 0, 
      confirmed: 0, 
      preparing: 0, 
      ready: 0, 
      picked_up: 0, 
      delivered: 0, 
      cancelled: 0, 
      completed: 0 
    };
    const itemCount: Record<string, number> = {};

    for (const o of orders) {
      const day = new Date(o.orderTime);
      day.setHours(0, 0, 0, 0);
      const key = day.toISOString();
      if (!byKey[key]) byKey[key] = { revenue: 0, count: 0 };
      byKey[key].revenue += o.total;
      byKey[key].count += 1;
      statusCount[o.status] = (statusCount[o.status] || 0) + 1;
      if (o.items) {
        for (const it of o.items) {
          itemCount[it.name] = (itemCount[it.name] || 0) + it.quantity;
        }
      }
    }

    const revenueSeries = days.map((d) => ({
      date: fmtShort(d),
      revenue: Number((byKey[d.toISOString()]?.revenue || 0).toFixed(2)),
    }));

    const ordersSeries = days.map((d) => ({
      date: fmtShort(d),
      orders: byKey[d.toISOString()]?.count || 0,
    }));

    const statusSeries = [
      { name: "Pending", key: "pending", value: statusCount.pending || 0 },
      { name: "Confirmed", key: "confirmed", value: statusCount.confirmed || 0 },
      { name: "Preparing", key: "preparing", value: statusCount.preparing || 0 },
      { name: "Ready", key: "ready", value: statusCount.ready || 0 },
      { name: "Picked Up", key: "picked_up", value: statusCount.picked_up || 0 },
      { name: "Delivered", key: "delivered", value: statusCount.delivered || 0 },
      { name: "Completed", key: "completed", value: statusCount.completed || 0 },
      { name: "Cancelled", key: "cancelled", value: statusCount.cancelled || 0 },
    ];

    const topItems = Object.entries(itemCount)
      .map(([name, qty]) => ({ name, qty }))
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5);

    return { revenueSeries, ordersSeries, statusSeries, topItems };
  }, [orders]);

  const chartConfigRevenue: ChartConfig = {
    revenue: { label: "Revenue (RM)", color: "hsl(var(--primary))" },
  };

  const chartConfigOrders: ChartConfig = {
    orders: { label: "Orders", color: "hsl(var(--chart-2, var(--muted-foreground)))" },
  };

  const chartConfigStatus: ChartConfig = {
    pending: { label: "Pending", color: "hsl(var(--destructive))" },
    confirmed: { label: "Confirmed", color: "hsl(var(--primary))" },
    preparing: { label: "Preparing", color: "hsl(var(--primary))" },
    ready: { label: "Ready", color: "hsl(var(--secondary-foreground))" },
    picked_up: { label: "Picked Up", color: "hsl(var(--chart-2))" },
    delivered: { label: "Delivered", color: "hsl(var(--foreground))" },
    completed: { label: "Completed", color: "hsl(var(--foreground))" },
    cancelled: { label: "Cancelled", color: "hsl(var(--destructive))" },
  };

  const statusColors: Record<string, string> = {
    pending: "hsl(var(--destructive))",
    confirmed: "hsl(var(--primary))",
    preparing: "hsl(var(--primary))",
    ready: "hsl(var(--secondary-foreground))",
    picked_up: "hsl(var(--chart-2))",
    delivered: "hsl(var(--foreground))",
    completed: "hsl(var(--foreground))",
    cancelled: "hsl(var(--destructive))",
  };

  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Key Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <p className="text-2xl font-bold text-foreground">{orders.length}</p>
              <p className="text-sm text-muted-foreground">Total Orders</p>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <p className="text-2xl font-bold text-foreground">RM {totalRevenue.toFixed(2)}</p>
              <p className="text-sm text-muted-foreground">Total Revenue</p>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <p className="text-2xl font-bold text-foreground">{stats.totalItems}</p>
              <p className="text-sm text-muted-foreground">Menu Items</p>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <p className="text-2xl font-bold text-foreground">
                {orders.length > 0 ? (totalRevenue / orders.length).toFixed(2) : 0}
              </p>
              <p className="text-sm text-muted-foreground">Avg Order Value</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Revenue (Last 7 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfigRevenue} className="w-full">
            <LineChart data={revenueSeries} margin={{ left: 12, right: 12 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} />
              <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
              <Line type="monotone" dataKey="revenue" stroke="var(--color-revenue)" strokeWidth={2} dot={false} />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Orders (Last 7 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfigOrders} className="w-full">
            <BarChart data={ordersSeries} margin={{ left: 12, right: 12 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tickLine={false} axisLine={false} />
              <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
              <ChartTooltip cursor={{ fill: "hsl(var(--muted))" }} content={<ChartTooltipContent />} />
              <Bar dataKey="orders" fill="var(--color-orders)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Order Status Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfigStatus} className="w-full">
              <PieChart>
                <Pie data={statusSeries} dataKey="value" nameKey="name" outerRadius={90} innerRadius={50} paddingAngle={4}>
                  {statusSeries.map((entry) => (
                    <Cell key={entry.key} fill={statusColors[entry.key]} />
                  ))}
                </Pie>
                <ChartLegend verticalAlign="bottom" content={<ChartLegendContent nameKey="name" />} />
                <ChartTooltip content={<ChartTooltipContent nameKey="name" />} />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Items</CardTitle>
          </CardHeader>
          <CardContent>
            {topItems.length === 0 ? (
              <p className="text-muted-foreground">No item data yet</p>
            ) : (
              <div className="space-y-2">
                {topItems.map((it) => (
                  <div key={it.name} className="flex items-center justify-between p-2 rounded-md bg-muted/50">
                    <span className="text-sm text-foreground">{it.name}</span>
                    <span className="text-sm font-mono text-foreground">{it.qty}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
