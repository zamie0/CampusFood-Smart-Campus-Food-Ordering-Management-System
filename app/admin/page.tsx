"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { 
  Users, Store, ShoppingBag, DollarSign, TrendingUp, Clock,
  CheckCircle, XCircle, Eye, LogOut, Bell, Menu,
  ChefHat, AlertCircle, BarChart3, Calendar, Search, Filter,
  GraduationCap, CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

import DashboardTab from "./tabs/Dashboard";
import VendorsTab from "./tabs/Vendors";
import RequestsTab from "./tabs/Requests";
import OrdersTab from "./tabs/Orders";
import CustomersTab from "./tabs/Customers";
import AnalyticsTab from "./tabs/Analytics";

type Tab = "dashboard" | "vendors" | "requests" | "orders" | "customers" | "analytics" ;

interface VendorRequest {
  id: string;
  name: string;
  email: string;
  phone?: string;
  description?: string;
  status: "pending" | "approved" | "rejected";
  submittedAt: number;
  rejectionReason?: string;
}

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
  status: "pending" | "preparing" | "ready" | "completed";
  orderTime: number;
}

const AdminDashboard = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [vendorRequests, setVendorRequests] = useState<VendorRequest[]>([]);
  const [approvedVendors, setApprovedVendors] = useState<ApprovedVendor[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const loadData = useCallback(async () => {
    try {
      // Fetch pending vendors from API
      const res = await fetch('/api/admin/vendors/pending');
      if (res.ok) {
        const data = await res.json();
        setVendorRequests(data.items); // your backend already maps status: inactive -> pending
      } else {
        console.error("Failed to load pending vendors");
      }

      // Fetch approved vendors
      const approvedRes = await fetch('/api/vendors?status=active');
      if (approvedRes.ok) {
        const approvedData = await approvedRes.json();
        // Fetch analytics to get real order and revenue data
        const analyticsRes = await fetch('/api/admin/analytics');
        const vendorStats: Record<string, { orders: number; revenue: number }> = {};
        
        if (analyticsRes.ok) {
          const analyticsData = await analyticsRes.json();
          // Map vendor stats from top vendors
          analyticsData.topVendors?.forEach((v: any) => {
            vendorStats[v.vendorId] = { orders: v.orders, revenue: v.revenue };
          });
        }

        const transformedVendors = approvedData.items.map((v: any) => {
          const stats = vendorStats[v._id] || { orders: 0, revenue: 0 };
          return {
            id: v._id,
            name: v.name,
            email: v.email,
            phone: v.phone,
            description: v.details,
            isActive: v.isOnline,
            totalOrders: stats.orders,
            revenue: stats.revenue,
            approvedAt: new Date(v.updatedAt).getTime(),
          };
        });
        setApprovedVendors(transformedVendors);
      }
    } catch (err) {
      console.error("Error loading dashboard data:", err);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      router.push("/portal/admin");
      return;
    }

    loadData();

    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, [router, loadData]);

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("currentAdmin");
    toast.success("Logged out successfully");
    router.push("/");
  };

  const handleApproveVendor = async (request: VendorRequest) => {
    try {
      const response = await fetch(`/api/admin/vendors/${request.id}/decision`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'approve' }),
      });

      if (response.ok) {
        // Remove from pending requests
        setVendorRequests(prev => prev.filter(r => r.id !== request.id));

        // Reload approved vendors
        const approvedResponse = await fetch('/api/vendors?status=active');
        if (approvedResponse.ok) {
          const approvedData = await approvedResponse.json();
          const transformedVendors = approvedData.items.map((v: any) => ({
            id: v._id,
            name: v.name,
            email: v.email,
            phone: v.phone,
            description: v.details,
            isActive: v.isOnline,
            totalOrders: 0,
            revenue: 0,
            approvedAt: new Date(v.updatedAt).getTime(),
          }));
          setApprovedVendors(transformedVendors);
        }

        toast.success(`${request.name} has been approved!`);
      } else {
        toast.error('Failed to approve vendor');
      }
    } catch (error) {
      console.error('Error approving vendor:', error);
      toast.error('Failed to approve vendor');
    }
  };

  const handleRejectVendor = async (request: VendorRequest) => {
    try {
      const response = await fetch(`/api/admin/vendors/${request.id}/decision`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'reject' }),
      });

      if (response.ok) {
        // Remove from pending requests
        setVendorRequests(prev => prev.filter(r => r.id !== request.id));
        toast.error(`${request.name} has been rejected`);
      } else {
        toast.error('Failed to reject vendor');
      }
    } catch (error) {
      console.error('Error rejecting vendor:', error);
      toast.error('Failed to reject vendor');
    }
  };

  const toggleVendorStatus = async (vendorId: string) => {
    const vendor = approvedVendors.find(v => v.id === vendorId);
    if (!vendor) return;

    try {
      const response = await fetch(`/api/vendors/${vendorId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isOnline: !vendor.isActive }),
      });

      if (response.ok) {
        setApprovedVendors(prev => prev.map(v =>
          v.id === vendorId ? { ...v, isActive: !v.isActive } : v
        ));
        toast.success("Vendor status updated");
      } else {
        toast.error('Failed to update vendor status');
      }
    } catch (error) {
      console.error('Error updating vendor status:', error);
      toast.error('Failed to update vendor status');
    }
  };

  const pendingRequests = vendorRequests.filter(r => r.status === "pending");
  
  // Calculate stats from approved vendors
  const stats = {
    totalVendors: approvedVendors.length,
    activeVendors: approvedVendors.filter(v => v.isActive).length,
    pendingRequests: pendingRequests.length,
    totalRevenue: approvedVendors.reduce((sum, v) => sum + v.revenue, 0),
    totalOrders: approvedVendors.reduce((sum, v) => sum + v.totalOrders, 0),
  };

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: BarChart3 },
    { id: "vendors", label: "Vendors", icon: Store },
    { id: "requests", label: "Requests", icon: Clock, badge: pendingRequests.length },
    { id: "orders", label: "Orders", icon: ShoppingBag },
    { id: "customers", label: "Customers", icon: Users },
    { id: "analytics", label: "Analytics", icon: TrendingUp },
  ];

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? "w-64" : "w-20"} bg-card border-r border-border transition-all duration-300 flex flex-col`}>
        <div className="p-4 border-b border-border flex items-center justify-between">
          {sidebarOpen && (
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                <ChefHat className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="font-bold text-foreground">CampusFood</h1>
                <p className="text-xs text-muted-foreground">Admin Portal</p>
              </div>
            </div>
          )}
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)}>
            <Menu className="w-5 h-5" />
          </Button>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as Tab)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                activeTab === item.id 
                  ? "bg-primary text-primary-foreground" 
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {sidebarOpen && (
                <>
                  <span className="flex-1 text-left text-sm font-medium">{item.label}</span>
                  {item.badge && item.badge > 0 && (
                    <Badge variant="destructive" className="text-xs">
                      {item.badge}
                    </Badge>
                  )}
                </>
              )}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-border">
          <Button 
            variant="ghost" 
            className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive"
            onClick={handleLogout}
          >
            <LogOut className="w-5 h-5" />
            {sidebarOpen && <span>Logout</span>}
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col mt-1">
        {/* Header */}
        <header className="border-b border-border bg-card px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold text-foreground capitalize">{activeTab}</h2>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 p-6 overflow-auto">
          {activeTab === "dashboard" && (
            <DashboardTab stats={stats} pendingRequests={pendingRequests} />
          )}
          {activeTab === "vendors" && (
            <VendorsTab 
              vendors={approvedVendors} 
              onToggleStatus={toggleVendorStatus}
              searchQuery={searchQuery}
            />
          )}
          {activeTab === "requests" && (
            <RequestsTab 
              requests={vendorRequests}
              onApprove={handleApproveVendor}
              onReject={handleRejectVendor}
            />
          )}
          {activeTab === "orders" && <OrdersTab />}
          {activeTab === "customers" && <CustomersTab />}
          {activeTab === "analytics" && <AnalyticsTab />}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;