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
import StudentVerificationTab from "./tabs/StudentVerification";

type Tab = "dashboard" | "vendors" | "requests" | "orders" | "customers" | "analytics" | "student-verification";

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
  const [studentVerifications, setStudentVerifications] = useState<any[]>([]);

  const loadStudentVerifications = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/student-verifications', { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setStudentVerifications(data.items || data);
    } catch (e) {
      console.error(e);
      toast.error("Failed to load verifications");
    }
  }, []);

  const loadData = useCallback(async () => {
    const requests = JSON.parse(localStorage.getItem("vendorRequests") || "[]");
    setVendorRequests(requests);
    
    const vendors = JSON.parse(localStorage.getItem("approvedVendors") || "[]");
    setApprovedVendors(vendors);

    // Load student verification requests
    await loadStudentVerifications();
  }, [loadStudentVerifications]);

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      router.push("/portal/admin");
      return;
    }

    loadData();
    
    // Poll for updates every 30 seconds
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, [router, loadData]);

  const handleVerifyStudent = async (profileId: string, userId: string) => {
    try {
      const res = await fetch(`/api/admin/student-verifications/${profileId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'verified' }),
      });
      if (!res.ok) throw new Error('Failed to verify');
      toast.success("Student ID verified successfully");
      loadStudentVerifications();
    } catch (e) {
      toast.error("Failed to verify student ID");
    }
  };

  const handleDeclineStudent = async (profileId: string, userId: string) => {
    try {
      const res = await fetch(`/api/admin/student-verifications/${profileId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'declined' }),
      });
      if (!res.ok) throw new Error('Failed to decline');
      toast.success("Student ID declined");
      loadStudentVerifications();
    } catch (e) {
      toast.error("Failed to decline student ID");
    }
  };

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
    { id: "student-verification", label: "Student Verification", icon: GraduationCap },
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
      <main className="flex-1 flex flex-col">
        {/* Header */}
        <header className="h-16 border-b border-border bg-card px-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold text-foreground capitalize">{activeTab}</h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Search..." 
                className="pl-9 w-64"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5" />
              {pendingRequests.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center">
                  {pendingRequests.length}
                </span>
              )}
            </Button>
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
          {activeTab === "student-verification" && (
            <StudentVerificationTab
              verifications={studentVerifications}
              onVerify={handleVerifyStudent}
              onDecline={handleDeclineStudent}
              searchQuery={searchQuery}
            />
          )}
          {activeTab === "orders" && <OrdersTab />}
          {activeTab === "customers" && <CustomersTab />}
          {activeTab === "analytics" && <AnalyticsTab stats={stats} />}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;