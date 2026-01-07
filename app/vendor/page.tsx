"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { 
  ShoppingBag, DollarSign, TrendingUp, Clock, Package,
  CheckCircle, LogOut, Bell, Settings, Menu, Plus,
  ChefHat, Eye, Edit, Trash2, BarChart3, Utensils,
  Star, Users, Calendar, AlertCircle, Upload, Image
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

import VendorDashboardTab from "./tabs/Dashboard";
import VendorOrdersTab from "./tabs/Orders";
import VendorMenuTab from "./tabs/Menu";
import VendorAnalyticsTab from "./tabs/Analytics";
import VendorSettingsTab from "./tabs/Settings";

type Tab = "dashboard" | "orders" | "menu" | "analytics" | "settings";

interface MenuItem {
  id: string;
  vendorId?: string;
  name: string;
  price: number;
  category: string;
  description?: string;
  isAvailable: boolean;
  isPopular: boolean;
  image?: string;
  prepTime: number;
  tags?: string[];
}

interface Order {
  id: string;
  customerName: string;
  items: { name: string; quantity: number; price: number }[];
  total: number;
  status: "pending" | "preparing" | "ready" | "completed";
  orderTime: number;
}

const VendorDashboard = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [vendor, setVendor] = useState<any>(null);
  const [isStoreOpen, setIsStoreOpen] = useState(true);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newItem, setNewItem] = useState({
    name: "",
    price: "",
    category: "Main",
    description: "",
    prepTime: "15",
    image: "",
    tags: "",
  });
  const [phone, setPhone] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("vendorToken");
    if (!token) {
      router.push("/portal/vendor");
      return;
    }

    const currentVendor = JSON.parse(localStorage.getItem("currentVendor") || "{}");
    setVendor(currentVendor);
    
    // Check if vendor is approved
    if (currentVendor.status !== 'active') {
      // Start polling for status updates
      const pollStatus = async () => {
        try {
          const response = await fetch(`/api/vendors/${currentVendor.id}`);
          if (response.ok) {
            const vendorData = await response.json();
            if (vendorData.status === 'active') {
              // Vendor approved! Update local storage and reload
              const updatedVendor = { ...currentVendor, status: 'active' };
              localStorage.setItem("currentVendor", JSON.stringify(updatedVendor));
              setVendor(updatedVendor);
              toast.success("Your account has been approved! Welcome to the platform.");
              loadData(currentVendor.id);
            } else if (vendorData.status === 'suspended') {
              // Vendor rejected
              toast.error("Your registration has been rejected. Please contact support.");
              handleLogout();
            }
          }
        } catch (error) {
          console.error('Error polling status:', error);
        }
      };

      // Poll every 30 seconds
      const interval = setInterval(pollStatus, 30000);
      return () => clearInterval(interval);
    }
    
    loadData(currentVendor.id);

    // Load store open status from vendor data
    setIsStoreOpen(currentVendor.isOnline ?? true);
  }, [router]);

  const loadData = async (vendorId: string) => {
    try {
      // Fetch vendor data including menu
      const vendorResponse = await fetch(`/api/vendors/${vendorId}`);
      if (vendorResponse.ok) {
        const vendorData = await vendorResponse.json();
        setMenuItems(vendorData.menu || []);
        setIsStoreOpen(vendorData.isOnline ?? true);
      }

      // Fetch orders for this vendor
      const ordersResponse = await fetch(`/api/orders?vendorId=${vendorId}`);
      if (ordersResponse.ok) {
        const ordersData = await ordersResponse.json();
        setOrders(ordersData.orders || []);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load data');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("vendorToken");
    localStorage.removeItem("currentVendor");
    toast.success("Logged out successfully");
    router.push("/");
  };

  const toggleStoreOpen = async () => {
    const newStatus = !isStoreOpen;
    setIsStoreOpen(newStatus);

    try {
      const response = await fetch(`/api/vendors/${vendor?.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isOnline: newStatus }),
      });

      if (response.ok) {
        toast.success(newStatus ? "Store is now open!" : "Store is now closed");
      } else {
        toast.error('Failed to update store status');
        setIsStoreOpen(!newStatus); // Revert on error
      }
    } catch (error) {
      console.error('Error updating store status:', error);
      toast.error('Failed to update store status');
      setIsStoreOpen(!newStatus); // Revert on error
    }
  };

  const handleUpdateVendorImage = (imageData: string) => {
    const updatedVendor = { ...vendor, image: imageData };
    setVendor(updatedVendor);
    localStorage.setItem("currentVendor", JSON.stringify(updatedVendor));
    
    // Update in registeredVendors for customer view
    const registeredVendors = JSON.parse(localStorage.getItem("registeredVendors") || "[]");
    const updatedVendors = registeredVendors.map((v: any) => 
      v.id === vendor?.id ? { ...v, image: imageData } : v
    );
    localStorage.setItem("registeredVendors", JSON.stringify(updatedVendors));
    toast.success("Store image updated!");
  };

  const handleSaveChanges = () => {
    const updatedVendor = { ...vendor, phone, description };
    setVendor(updatedVendor);
    localStorage.setItem("currentVendor", JSON.stringify(updatedVendor));
    
    // Update in registeredVendors for customer view
    const registeredVendors = JSON.parse(localStorage.getItem("registeredVendors") || "[]");
    const updatedVendors = registeredVendors.map((v: any) => 
      v.id === vendor?.id ? { ...v, phone, description } : v
    );
    localStorage.setItem("registeredVendors", JSON.stringify(updatedVendors));
    toast.success("Store details updated!");
  };

  const handleAddMenuItem = async () => {
    if (!newItem.name || !newItem.price) {
      toast.error("Please fill in required fields");
      return;
    }

    const item: MenuItem = {
      id: `item_${Date.now()}`,
      vendorId: vendor?.id,
      name: newItem.name,
      price: parseFloat(newItem.price),
      category: newItem.category,
      description: newItem.description,
      isAvailable: true,
      isPopular: false,
      prepTime: parseInt(newItem.prepTime),
      image: newItem.image || "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=300&h=200&fit=crop",
      tags: newItem.tags ? newItem.tags.split(",").map(t => t.trim()).filter(Boolean) : [],
    };

    const updatedMenu = [...menuItems, item];
    setMenuItems(updatedMenu);

    // Update in database
    try {
      await fetch(`/api/vendors/${vendor?.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ menu: updatedMenu }),
      });
      toast.success("Menu item added!");
    } catch (error) {
      console.error('Error adding menu item:', error);
      toast.error('Failed to add menu item');
      setMenuItems(menuItems); // Revert
      return;
    }

    setNewItem({ name: "", price: "", category: "Main", description: "", prepTime: "15", image: "", tags: "" });
    setShowAddModal(false);
  };

  const toggleItemAvailability = async (itemId: string) => {
    const updatedMenu = menuItems.map(item =>
      item.id === itemId ? { ...item, isAvailable: !item.isAvailable } : item
    );
    setMenuItems(updatedMenu);

    try {
      await fetch(`/api/vendors/${vendor?.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ menu: updatedMenu }),
      });
      toast.success("Availability updated");
    } catch (error) {
      console.error('Error updating availability:', error);
      toast.error('Failed to update availability');
      setMenuItems(menuItems); // Revert
    }
  };

  const deleteMenuItem = async (itemId: string) => {
    const updatedMenu = menuItems.filter(item => item.id !== itemId);
    setMenuItems(updatedMenu);

    try {
      await fetch(`/api/vendors/${vendor?.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ menu: updatedMenu }),
      });
      toast.success("Item deleted");
    } catch (error) {
      console.error('Error deleting item:', error);
      toast.error('Failed to delete item');
      setMenuItems(menuItems); // Revert
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: Order["status"]) => {
    const updatedOrders = orders.map(order =>
      order.id === orderId ? { ...order, status: newStatus } : order
    );
    setOrders(updatedOrders);

    try {
      await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });
      toast.success(`Order marked as ${newStatus}`);
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Failed to update order status');
      setOrders(orders); // Revert
    }
  };

  const stats = {
    todayOrders: orders.filter(o => o.orderTime > Date.now() - 86400000).length,
    pendingOrders: orders.filter(o => o.status === "pending").length,
    preparingOrders: orders.filter(o => o.status === "preparing").length,
    todayRevenue: orders
      .filter(o => o.orderTime > Date.now() - 86400000 && o.status === "completed")
      .reduce((sum, o) => sum + o.total, 0),
    totalItems: menuItems.length,
    availableItems: menuItems.filter(m => m.isAvailable).length,
  };

  const menuItems_list = [
    { id: "dashboard", label: "Dashboard", icon: BarChart3 },
    { id: "orders", label: "Orders", icon: ShoppingBag, badge: stats.pendingOrders },
    { id: "menu", label: "Menu", icon: Utensils },
    { id: "analytics", label: "Analytics", icon: TrendingUp },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  // Show pending approval screen if vendor is not approved
  if (vendor && vendor.status !== 'active') {
    return (
      <div className="h-screen bg-background flex items-center justify-center">
        <div className="max-w-md mx-auto text-center p-8">
          <div className="w-16 h-16 rounded-full bg-yellow-100 flex items-center justify-center mx-auto mb-4">
            <Clock className="w-8 h-8 text-yellow-600" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Account Pending Approval</h1>
          <p className="text-muted-foreground mb-6">
            Your vendor registration is currently under review by our administrators. 
            You will be notified once your account is approved.
          </p>
          <Button onClick={handleLogout} variant="outline">
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-background flex overflow-hidden">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? "w-64" : "w-20"} bg-card border-r border-border transition-all duration-300 flex flex-col flex-shrink-0`}>
        <div className="p-4 border-b border-border flex items-center justify-between">
          {sidebarOpen && (
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                <ChefHat className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="font-bold text-foreground text-sm truncate max-w-[140px]">
                  {vendor?.name || "Vendor"}
                </h1>
                <p className="text-xs text-muted-foreground">Vendor Portal</p>
              </div>
            </div>
          )}
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)}>
            <Menu className="w-5 h-5" />
          </Button>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {menuItems_list.map((item) => (
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
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5" />
              {stats.pendingOrders > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center">
                  {stats.pendingOrders}
                </span>
              )}
            </Button>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 p-6 overflow-auto">
          {activeTab === "dashboard" && (
            <VendorDashboardTab 
              stats={stats} 
              onAddItem={() => setShowAddModal(true)}
              onViewOrders={() => setActiveTab("orders")}
              onOpenSettings={() => setActiveTab("settings")}
              isStoreOpen={isStoreOpen}
              onToggleStore={toggleStoreOpen}
            />
          )}
          {activeTab === "orders" && (
            <VendorOrdersTab 
              orders={orders} 
              onUpdateStatus={updateOrderStatus}
            />
          )}
          {activeTab === "menu" && (
            <VendorMenuTab 
              items={menuItems}
              onToggleAvailability={toggleItemAvailability}
              onDelete={deleteMenuItem}
              onAdd={() => setShowAddModal(true)}
            />
          )}
          {activeTab === "analytics" && <VendorAnalyticsTab stats={stats} orders={orders} />}
          {activeTab === "settings" && (
            <VendorSettingsTab 
              vendor={vendor} 
              isStoreOpen={isStoreOpen} 
              onToggleStore={toggleStoreOpen}
              onUpdateImage={handleUpdateVendorImage}
              phone={phone}
              description={description}
              onPhoneChange={setPhone}
              onDescriptionChange={setDescription}
              onSaveChanges={handleSaveChanges}
            />
          )}
        </div>
      </main>

      {/* Add Menu Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card border border-border rounded-xl p-6 w-full max-w-md"
          >
            <h3 className="text-lg font-semibold text-foreground mb-4">Add New Menu Item</h3>
            <div className="space-y-3 max-h-[70vh] overflow-y-auto">
              <div>
                <Label>Name *</Label>
                <Input
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  placeholder="Item name"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Price (RM) *</Label>
                  <Input
                    type="number"
                    value={newItem.price}
                    onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label>Prep Time (mins)</Label>
                  <Input
                    type="number"
                    value={newItem.prepTime}
                    onChange={(e) => setNewItem({ ...newItem, prepTime: e.target.value })}
                    placeholder="15"
                  />
                </div>
              </div>
              <div>
                <Label>Category</Label>
                <select
                  value={newItem.category}
                  onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                  className="w-full h-10 px-3 rounded-md border border-input bg-background text-foreground"
                >
                  <option value="Main">Main Course</option>
                  <option value="Appetizers">Appetizers</option>
                  <option value="Drinks">Drinks</option>
                  <option value="Snacks">Snacks</option>
                  <option value="Dessert">Dessert</option>
                  <option value="Sides">Sides</option>
                  <option value="Breakfast">Breakfast</option>
                  <option value="Lunch">Lunch</option>
                  <option value="Dinner">Dinner</option>
                  <option value="Combo">Combo Meals</option>
                </select>
              </div>
              <div>
                <Label>Description</Label>
                <Input
                  value={newItem.description}
                  onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                  placeholder="Brief description of the item"
                />
              </div>
              <div>
                <Label>Food Image</Label>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          if (file.size > 5 * 1024 * 1024) {
                            toast.error("Image must be less than 5MB");
                            return;
                          }
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setNewItem({ ...newItem, image: reader.result as string });
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="flex-1"
                    />
                  </div>
                  {newItem.image && (
                    <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-border">
                      <img src={newItem.image} alt="Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setNewItem({ ...newItem, image: "" })}
                        className="absolute top-1 right-1 w-5 h-5 bg-destructive rounded-full flex items-center justify-center text-destructive-foreground text-xs"
                      >
                        ×
                      </button>
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground">Max 5MB. Leave empty for default image.</p>
                </div>
              </div>
              <div>
                <Label>Tags (comma separated)</Label>
                <Input
                  value={newItem.tags}
                  onChange={(e) => setNewItem({ ...newItem, tags: e.target.value })}
                  placeholder="spicy, popular, vegetarian"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <Button onClick={handleAddMenuItem} className="flex-1">
                  Add Item
                </Button>
                <Button variant="outline" onClick={() => setShowAddModal(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

const VendorDashboardContent = ({ stats, onAddItem, onViewOrders, onOpenSettings, isStoreOpen, onToggleStore }: { 
  stats: any;
  onAddItem: () => void;
  onViewOrders: () => void;
  onOpenSettings: () => void;
  isStoreOpen: boolean;
  onToggleStore: () => void;
}) => (
  <div className="space-y-6">
    {/* Store Status */}
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

    {/* Stats Grid */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard icon={ShoppingBag} label="Today's Orders" value={stats.todayOrders} />
      <StatCard icon={Clock} label="Pending" value={stats.pendingOrders} />
      <StatCard icon={Package} label="Preparing" value={stats.preparingOrders} />
      <StatCard icon={DollarSign} label="Today's Revenue" value={`RM ${stats.todayRevenue.toFixed(2)}`} />
    </div>

    {/* Quick Actions */}
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

const StatCard = ({ icon: Icon, label, value }: { icon: any; label: string; value: string | number }) => (
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

const OrdersContent = ({ orders, onUpdateStatus }: {
  orders: Order[];
  onUpdateStatus: (orderId: string, status: Order["status"]) => void;
}) => {
  const statusOrder = ["pending", "preparing", "ready", "completed"];
  const sortedOrders = [...orders].sort((a, b) => {
    const aIndex = statusOrder.indexOf(a.status);
    const bIndex = statusOrder.indexOf(b.status);
    return aIndex - bIndex;
  });

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
                      <Badge variant={
                        order.status === "pending" ? "destructive" :
                        order.status === "preparing" ? "default" :
                        order.status === "ready" ? "secondary" : "outline"
                      }>
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
                    <p className="text-sm font-semibold text-foreground mt-2">
                      Total: RM {order.total.toFixed(2)}
                    </p>
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
};

const MenuContent = ({ items, onToggleAvailability, onDelete, onAdd }: {
  items: MenuItem[];
  onToggleAvailability: (id: string) => void;
  onDelete: (id: string) => void;
  onAdd: () => void;
}) => (
  <div className="space-y-4">
    <div className="flex items-center justify-between">
      <h3 className="text-lg font-semibold text-foreground">Menu Items ({items.length})</h3>
      <Button onClick={onAdd}>
        <Plus className="w-4 h-4 mr-2" />
        Add Item
      </Button>
    </div>

    {items.length === 0 ? (
      <Card>
        <CardContent className="py-12 text-center">
          <Utensils className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground mb-4">No menu items yet</p>
          <Button onClick={onAdd}>
            <Plus className="w-4 h-4 mr-2" />
            Add Your First Item
          </Button>
        </CardContent>
      </Card>
    ) : (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <Card key={item.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-semibold text-foreground">{item.name}</h4>
                  <p className="text-sm text-muted-foreground">{item.category}</p>
                </div>
                <Badge variant={item.isAvailable ? "default" : "secondary"}>
                  {item.isAvailable ? "Available" : "Unavailable"}
                </Badge>
              </div>
              {item.description && (
                <p className="text-sm text-muted-foreground mb-3">{item.description}</p>
              )}
              <div className="flex items-center justify-between mb-3">
                <span className="text-lg font-bold text-foreground">RM {item.price.toFixed(2)}</span>
                <span className="text-xs text-muted-foreground">{item.prepTime} mins</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={item.isAvailable}
                    onCheckedChange={() => onToggleAvailability(item.id)}
                  />
                  <span className="text-sm text-muted-foreground">Available</span>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon">
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-destructive"
                    onClick={() => onDelete(item.id)}
                  >
                    <Trash2 className="w-4 h-4" />
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

const VendorAnalyticsContent = ({ stats, orders }: { stats: any; orders: Order[] }) => (
  <div className="grid gap-6">
    <Card>
      <CardHeader>
        <CardTitle>Sales Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-muted/50 rounded-lg">
            <p className="text-2xl font-bold text-foreground">{orders.length}</p>
            <p className="text-sm text-muted-foreground">Total Orders</p>
          </div>
          <div className="text-center p-4 bg-muted/50 rounded-lg">
            <p className="text-2xl font-bold text-foreground">
              RM {orders.reduce((sum, o) => sum + o.total, 0).toFixed(2)}
            </p>
            <p className="text-sm text-muted-foreground">Total Revenue</p>
          </div>
          <div className="text-center p-4 bg-muted/50 rounded-lg">
            <p className="text-2xl font-bold text-foreground">{stats.totalItems}</p>
            <p className="text-sm text-muted-foreground">Menu Items</p>
          </div>
          <div className="text-center p-4 bg-muted/50 rounded-lg">
            <p className="text-2xl font-bold text-foreground">
              {orders.length > 0 ? (orders.reduce((sum, o) => sum + o.total, 0) / orders.length).toFixed(2) : 0}
            </p>
            <p className="text-sm text-muted-foreground">Avg Order Value</p>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
);

const VendorSettingsContent = ({ vendor, isStoreOpen, onToggleStore, onUpdateImage, phone, description, onPhoneChange, onDescriptionChange, onSaveChanges }: { 
  vendor: any;
  isStoreOpen: boolean;
  onToggleStore: () => void;
  onUpdateImage: (imageData: string) => void;
  phone: string;
  description: string;
  onPhoneChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onSaveChanges: () => void;
}) => (
  <div className="space-y-6">
    <Card>
      <CardHeader>
        <CardTitle>Store Image</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-start gap-6">
          <div className="relative w-32 h-32 rounded-xl overflow-hidden border-2 border-border bg-muted flex items-center justify-center">
            {vendor?.image ? (
              <img src={vendor.image} alt="Store" className="w-full h-full object-cover" />
            ) : (
              <Image className="w-10 h-10 text-muted-foreground" />
            )}
          </div>
          <div className="flex-1 space-y-3">
            <p className="text-sm text-muted-foreground">
              Upload your store image. This will be displayed to customers.
            </p>
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  if (file.size > 5 * 1024 * 1024) {
                    toast.error("Image must be less than 5MB");
                    return;
                  }
                  const reader = new FileReader();
                  reader.onloadend = () => {
                    onUpdateImage(reader.result as string);
                  };
                  reader.readAsDataURL(file);
                }
              }}
            />
            <p className="text-xs text-muted-foreground">Max 5MB. Recommended: 400x400px</p>
          </div>
        </div>
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle>Store Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-3">
            <div className={`w-4 h-4 rounded-full ${isStoreOpen ? 'bg-green-500' : 'bg-red-500'}`} />
            <div>
              <p className="font-medium text-foreground">
                Store is currently {isStoreOpen ? 'Open' : 'Closed'}
              </p>
              <p className="text-sm text-muted-foreground">
                {isStoreOpen ? 'Customers can see and order from your store' : 'Your store is hidden from customers'}
              </p>
            </div>
          </div>
          <Switch checked={isStoreOpen} onCheckedChange={onToggleStore} />
        </div>
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle>Store Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Business Name</Label>
          <Input value={vendor?.name || ""} disabled />
        </div>
        <div className="space-y-2">
          <Label>Email</Label>
          <Input value={vendor?.email || ""} disabled />
        </div>
        <div className="space-y-2">
          <Label>Phone</Label>
          <Input 
            value={phone} 
            onChange={(e) => onPhoneChange(e.target.value)}
            placeholder="Add phone number" 
          />
        </div>
        <div className="space-y-2">
          <Label>Description</Label>
          <Input 
            value={description} 
            onChange={(e) => onDescriptionChange(e.target.value)}
            placeholder="Add description" 
          />
        </div>
        <Button onClick={onSaveChanges}>Save Changes</Button>
      </CardContent>
    </Card>
  </div>
);

export default VendorDashboard;