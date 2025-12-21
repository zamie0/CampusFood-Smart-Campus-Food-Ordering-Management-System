"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { 
  Users, Store, ShoppingBag, DollarSign, TrendingUp, Clock,
  CheckCircle, XCircle, Eye, LogOut, Bell, Settings, Menu,
  ChefHat, AlertCircle, BarChart3, Calendar, Search, Filter
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

type Tab = "dashboard" | "vendors" | "requests" | "orders" | "customers" | "analytics" | "settings";

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

  useEffect(() => {
    const isAdmin = localStorage.getItem("adminLoggedIn");
    if (!isAdmin) {
      router.push("/portal");
      return;
    }
    
    loadData();
  }, [router]);

  const loadData = () => {
    const requests = JSON.parse(localStorage.getItem("vendorRequests") || "[]");
    setVendorRequests(requests);
    
    const vendors = JSON.parse(localStorage.getItem("approvedVendors") || "[]");
    setApprovedVendors(vendors);
  };

  const handleLogout = () => {
    localStorage.removeItem("adminLoggedIn");
    toast.success("Logged out successfully");
    router.push("/");
  };

  const handleApproveVendor = (request: VendorRequest) => {
    // Update request status
    const updatedRequests = vendorRequests.map(r => 
      r.id === request.id ? { ...r, status: "approved" as const } : r
    );
    localStorage.setItem("vendorRequests", JSON.stringify(updatedRequests));
    setVendorRequests(updatedRequests);

    const vendorId = `vendor_${Date.now()}`;
    
    // Add to approved vendors (for admin)
    const newVendor: ApprovedVendor = {
      id: vendorId,
      name: request.name,
      email: request.email,
      phone: request.phone,
      description: request.description,
      isActive: true,
      totalOrders: 0,
      revenue: 0,
      approvedAt: Date.now(),
    };
    const updatedVendors = [...approvedVendors, newVendor];
    localStorage.setItem("approvedVendors", JSON.stringify(updatedVendors));
    setApprovedVendors(updatedVendors);

    // Also add to registeredVendors (for customer view)
    const registeredVendors = JSON.parse(localStorage.getItem("registeredVendors") || "[]");
    const vendorForCustomer = {
      id: vendorId,
      name: request.name,
      description: request.description || "Fresh and delicious food",
      rating: 4.5,
      reviewCount: 0,
      image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=300&fit=crop",
      cuisine: "Local",
      deliveryTime: "15-25 min",
      isOpen: true,
    };
    localStorage.setItem("registeredVendors", JSON.stringify([...registeredVendors, vendorForCustomer]));

    toast.success(`${request.name} has been approved!`);
  };

  const handleRejectVendor = (request: VendorRequest) => {
    const updatedRequests = vendorRequests.map(r => 
      r.id === request.id ? { ...r, status: "rejected" as const } : r
    );
    localStorage.setItem("vendorRequests", JSON.stringify(updatedRequests));
    setVendorRequests(updatedRequests);
    toast.error(`${request.name} has been rejected`);
  };

  const toggleVendorStatus = (vendorId: string) => {
    const updatedVendors = approvedVendors.map(v => 
      v.id === vendorId ? { ...v, isActive: !v.isActive } : v
    );
    localStorage.setItem("approvedVendors", JSON.stringify(updatedVendors));
    setApprovedVendors(updatedVendors);
    toast.success("Vendor status updated");
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
    { id: "settings", label: "Settings", icon: Settings },
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
            <DashboardContent stats={stats} pendingRequests={pendingRequests} />
          )}
          {activeTab === "vendors" && (
            <VendorsContent 
              vendors={approvedVendors} 
              onToggleStatus={toggleVendorStatus}
              searchQuery={searchQuery}
            />
          )}
          {activeTab === "requests" && (
            <RequestsContent 
              requests={vendorRequests}
              onApprove={handleApproveVendor}
              onReject={handleRejectVendor}
            />
          )}
          {activeTab === "orders" && <OrdersContent />}
          {activeTab === "customers" && <CustomersContent />}
          {activeTab === "analytics" && <AnalyticsContent stats={stats} />}
          {activeTab === "settings" && <SettingsContent />}
        </div>
      </main>
    </div>
  );
};

const DashboardContent = ({ stats, pendingRequests }: { stats: any; pendingRequests: VendorRequest[] }) => (
  <div className="space-y-6">
    {/* Stats Grid */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard icon={Store} label="Total Vendors" value={stats.totalVendors} color="primary" />
      <StatCard icon={Users} label="Active Vendors" value={stats.activeVendors} color="success" />
      <StatCard icon={Clock} label="Pending Requests" value={stats.pendingRequests} color="warning" />
      <StatCard icon={ShoppingBag} label="Total Orders" value={stats.totalOrders} color="info" />
    </div>

    {/* Quick Actions */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-primary" />
            Pending Approvals
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pendingRequests.length === 0 ? (
            <p className="text-muted-foreground text-sm">No pending requests</p>
          ) : (
            <div className="space-y-3">
              {pendingRequests.slice(0, 5).map((request) => (
                <div key={request.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div>
                    <p className="font-medium text-foreground">{request.name}</p>
                    <p className="text-sm text-muted-foreground">{request.email}</p>
                  </div>
                  <Badge variant="outline">Pending</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Quick Stats
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Platform Revenue</span>
              <span className="font-semibold text-foreground">RM {stats.totalRevenue.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Active Rate</span>
              <span className="font-semibold text-foreground">
                {stats.totalVendors > 0 ? ((stats.activeVendors / stats.totalVendors) * 100).toFixed(0) : 0}%
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Avg Orders/Vendor</span>
              <span className="font-semibold text-foreground">
                {stats.totalVendors > 0 ? (stats.totalOrders / stats.totalVendors).toFixed(1) : 0}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
);

const StatCard = ({ icon: Icon, label, value, color }: { icon: any; label: string; value: number; color: string }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-card border border-border rounded-xl p-6"
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-3xl font-bold text-foreground mt-1">{value}</p>
      </div>
      <div className={`w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center`}>
        <Icon className="w-6 h-6 text-primary" />
      </div>
    </div>
  </motion.div>
);

const VendorsContent = ({ vendors, onToggleStatus, searchQuery }: { 
  vendors: ApprovedVendor[]; 
  onToggleStatus: (id: string) => void;
  searchQuery: string;
}) => {
  const [selectedVendor, setSelectedVendor] = useState<ApprovedVendor | null>(null);
  const [vendorMenu, setVendorMenu] = useState<MenuItem[]>([]);
  const [vendorOrders, setVendorOrders] = useState<CustomerOrder[]>([]);

  const filteredVendors = vendors.filter(v => 
    v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const viewVendorDetails = (vendor: ApprovedVendor) => {
    setSelectedVendor(vendor);
    const menu = JSON.parse(localStorage.getItem(`vendorMenu_${vendor.id}`) || "[]");
    setVendorMenu(menu);
    const allOrders = JSON.parse(localStorage.getItem("allCustomerOrders") || "[]");
    const orders = allOrders.filter((o: CustomerOrder) => o.vendorId === vendor.id);
    setVendorOrders(orders);
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

        {/* Menu Items */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ChefHat className="w-5 h-5 text-primary" />
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

        {/* Vendor Orders */}
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
                        order.status === "completed" ? "default" :
                        order.status === "pending" ? "destructive" : "secondary"
                      }>
                        {order.status}
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
};

const RequestsContent = ({ requests, onApprove, onReject }: {
  requests: VendorRequest[];
  onApprove: (request: VendorRequest) => void;
  onReject: (request: VendorRequest) => void;
}) => {
  const pending = requests.filter(r => r.status === "pending");
  const processed = requests.filter(r => r.status !== "pending");

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">Pending Requests ({pending.length})</h3>
        {pending.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <CheckCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No pending requests</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {pending.map((request) => (
              <Card key={request.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Store className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-foreground">{request.name}</h4>
                          <p className="text-sm text-muted-foreground">{request.email}</p>
                        </div>
                      </div>
                      {request.phone && (
                        <p className="text-sm text-muted-foreground">Phone: {request.phone}</p>
                      )}
                      {request.description && (
                        <p className="text-sm text-muted-foreground">{request.description}</p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Submitted: {new Date(request.submittedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="default" 
                        size="sm"
                        onClick={() => onApprove(request)}
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Approve
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => onReject(request)}
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        Reject
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {processed.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-4">Processed Requests</h3>
          <div className="grid gap-4">
            {processed.map((request) => (
              <Card key={request.id} className="opacity-60">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Store className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <h4 className="font-medium text-foreground">{request.name}</h4>
                        <p className="text-sm text-muted-foreground">{request.email}</p>
                      </div>
                    </div>
                    <Badge variant={request.status === "approved" ? "default" : "destructive"}>
                      {request.status}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const OrdersContent = () => {
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>("all");

  useEffect(() => {
    const allOrders = JSON.parse(localStorage.getItem("allCustomerOrders") || "[]");
    setOrders(allOrders);
  }, []);

  const filteredOrders = filterStatus === "all" 
    ? orders 
    : orders.filter(o => o.status === filterStatus);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">All Orders ({orders.length})</h3>
        <div className="flex gap-2">
          {["all", "pending", "preparing", "ready", "completed"].map((status) => (
            <Button 
              key={status}
              variant={filterStatus === status ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterStatus(status)}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <ShoppingBag className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No orders found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredOrders.map((order) => (
            <Card key={order.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground">#{order.id.slice(-6)}</span>
                      <Badge variant={
                        order.status === "completed" ? "default" :
                        order.status === "pending" ? "destructive" : "secondary"
                      }>
                        {order.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      <span className="font-medium">Customer:</span> {order.customerName}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      <span className="font-medium">Vendor:</span> {order.vendorName}
                    </p>
                    <div className="text-sm text-muted-foreground">
                      {order.items.map((item, idx) => (
                        <span key={idx}>{item.quantity}x {item.name}{idx < order.items.length - 1 ? ", " : ""}</span>
                      ))}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-foreground">RM {order.total.toFixed(2)}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(order.orderTime).toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

const CustomersContent = () => {
  const [customers, setCustomers] = useState<{name: string; email: string; orders: number; totalSpent: number}[]>([]);

  useEffect(() => {
    const allOrders = JSON.parse(localStorage.getItem("allCustomerOrders") || "[]") as CustomerOrder[];
    const customerMap = new Map<string, {name: string; email: string; orders: number; totalSpent: number}>();
    
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
          totalSpent: order.total
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
};

const AnalyticsContent = ({ stats }: { stats: any }) => (
  <div className="grid gap-6">
    <Card>
      <CardHeader>
        <CardTitle>Platform Analytics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-muted/50 rounded-lg">
            <p className="text-2xl font-bold text-foreground">{stats.totalVendors}</p>
            <p className="text-sm text-muted-foreground">Total Vendors</p>
          </div>
          <div className="text-center p-4 bg-muted/50 rounded-lg">
            <p className="text-2xl font-bold text-foreground">{stats.totalOrders}</p>
            <p className="text-sm text-muted-foreground">Total Orders</p>
          </div>
          <div className="text-center p-4 bg-muted/50 rounded-lg">
            <p className="text-2xl font-bold text-foreground">RM {stats.totalRevenue.toFixed(2)}</p>
            <p className="text-sm text-muted-foreground">Total Revenue</p>
          </div>
          <div className="text-center p-4 bg-muted/50 rounded-lg">
            <p className="text-2xl font-bold text-foreground">{stats.activeVendors}</p>
            <p className="text-sm text-muted-foreground">Active Vendors</p>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
);

const SettingsContent = () => (
  <Card>
    <CardHeader>
      <CardTitle>Platform Settings</CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
        <div>
          <p className="font-medium text-foreground">Commission Rate</p>
          <p className="text-sm text-muted-foreground">Platform fee per order</p>
        </div>
        <span className="font-semibold text-foreground">10%</span>
      </div>
      <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
        <div>
          <p className="font-medium text-foreground">Auto-approve Vendors</p>
          <p className="text-sm text-muted-foreground">Skip manual approval</p>
        </div>
        <Badge variant="secondary">Disabled</Badge>
      </div>
      <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
        <div>
          <p className="font-medium text-foreground">Maintenance Mode</p>
          <p className="text-sm text-muted-foreground">Disable customer access</p>
        </div>
        <Badge variant="secondary">Off</Badge>
      </div>
    </CardContent>
  </Card>
);

export default AdminDashboard;