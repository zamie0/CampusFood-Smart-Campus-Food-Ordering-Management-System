"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  User,
  Mail,
  GraduationCap,
  Camera,
  History,
  Heart,
  Settings,
  Bell,
  Shield,
  ChevronLeft,
  ChevronRight,
  Save,
  LogOut,
  ShoppingBag,
  Plus,
  RefreshCw,
  Clock,
  Trash2,
  Star,
} from "lucide-react";
import { foodItems, vendors } from "@/data/mockData";

type TabType = "personal" | "orders" | "favorites" | "settings" | "security";

interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
  student_id: string | null;
  notifications_enabled: boolean;
  promo_notifications: boolean;
  order_notifications: boolean;
}

interface Order {
  id: string;
  vendor_name: string;
  items: { name: string; quantity: number; price: number }[];
  total: number;
  status: string;
  order_time: string;
}

interface Favorite {
  id: string;
  name: string;
  description: string;
  rating: number;
  cuisine: string;
  image: string;
}

const Profile = () => {
  const { user, updateProfile, signOut } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("personal");
  const [orders, setOrders] = useState<Order[]>([]);
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form state
  const [fullName, setFullName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [promoNotifications, setPromoNotifications] = useState(true);
  const [orderNotifications, setOrderNotifications] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push("/");
      return;
    }

    // Initialize form with user data
    setFullName(user.fullName || "");
    setStudentId(user.studentId || "");
    setNotificationsEnabled(user.notificationsEnabled ?? true);
    setPromoNotifications(user.promoNotifications ?? true);
    setOrderNotifications(user.orderNotifications ?? true);

    fetchOrders();
    fetchFavorites();
    setLoading(false);
  }, [user, router]);

  const fetchOrders = async () => {
    if (!user) return;

    try {
      const response = await fetch('/api/orders?customerId=' + user.id);
      if (response.ok) {
        const data = await response.json();
        // Transform orders to match the interface
        const transformedOrders = data.orders.map((order: any) => ({
          id: order._id,
          vendor_name: order.vendorId?.name || 'Unknown Vendor',
          items: order.items.map((item: any) => ({
            name: item.name,
            quantity: item.quantity,
            price: item.price,
          })),
          total: order.totalAmount,
          status: order.status,
          order_time: new Date(order.createdAt).toLocaleString(),
        }));
        setOrders(transformedOrders);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load orders');
    }
  };

  const fetchFavorites = async () => {
    if (!user) return;

    try {
      // Get customer data including favorites
      const customerResponse = await fetch('/api/customers?email=' + user.email);
      if (customerResponse.ok) {
        const customerData = await customerResponse.json();
        if (customerData.items && customerData.items.length > 0) {
          const customer = customerData.items[0];
          // Get vendor details for favorites
          const favoriteVendors = [];
          for (const vendorId of customer.favorites || []) {
            try {
              const vendorResponse = await fetch(`/api/vendors/${vendorId}`);
              if (vendorResponse.ok) {
                const vendorData = await vendorResponse.json();
                favoriteVendors.push({
                  id: vendorData._id,
                  name: vendorData.name,
                  description: vendorData.details || '',
                  rating: vendorData.rating || 0,
                  cuisine: vendorData.categories?.[0] || 'Various',
                  image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&h=300&fit=crop',
                });
              }
            } catch (error) {
              console.error('Error fetching vendor:', vendorId, error);
            }
          }
          setFavorites(favoriteVendors);
        }
      }
    } catch (error) {
      console.error('Error fetching favorites:', error);
      toast.error('Failed to load favorites');
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    setSaving(true);

    try {
      await updateProfile({
        fullName,
        studentId,
        notificationsEnabled,
        promoNotifications,
        orderNotifications,
      });

      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error("Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveFavorite = async (favoriteId: string) => {
    // TODO: Implement MongoDB favorite removal
    toast.success("Removed from favorites");
    fetchFavorites();
  };

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  const tabs = [
    { id: "personal" as TabType, label: "Personal Info", icon: User },
    { id: "orders" as TabType, label: "Order History", icon: History },
    { id: "favorites" as TabType, label: "Favorites", icon: Heart },
    { id: "settings" as TabType, label: "Settings", icon: Settings },
    { id: "security" as TabType, label: "Security", icon: Shield },
  ];

  const getFoodItem = (id: string) => foodItems.find((f) => f.id === id);
  const getVendor = (id: string) => vendors.find((v) => v.id === id);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-card/80 backdrop-blur-md border-b border-border">
        <div className="container flex items-center h-16 px-4 md:px-6">
          <Button variant="ghost" size="icon" onClick={() => router.push("/")}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h1 className="ml-3 text-lg font-semibold text-foreground">Profile</h1>
        </div>
      </header>

      <main className="container px-4 md:px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <div className="bg-card rounded-2xl border border-border p-6 sticky top-24">
              {/* Profile Preview */}
              <div className="text-center mb-6">
                <div className="relative w-20 h-20 mx-auto mb-4">
                  <div className="w-full h-full rounded-full bg-primary/10 flex items-center justify-center">
                    {user?.avatarUrl ? (
                      <img
                        src={user.avatarUrl}
                        alt="Avatar"
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <User className="w-8 h-8 text-primary" />
                    )}
                  </div>
                  <button className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg hover:bg-primary/90 transition-colors">
                    <Camera className="w-4 h-4" />
                  </button>
                </div>
                <h2 className="font-semibold text-foreground">
                  {user?.fullName || "Student"}
                </h2>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>

              {/* Nav Tabs */}
              <nav className="space-y-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      if (tab.id === "security") {
                        router.push("/security");
                      } else {
                        setActiveTab(tab.id);
                      }
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                      activeTab === tab.id
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <tab.icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                ))}
              </nav>

              {/* Sign Out */}
              <div className="mt-6 pt-6 border-t border-border">
                <Button
                  variant="ghost"
                  className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={handleSignOut}
                >
                  <LogOut className="h-4 w-4 mr-3" />
                  Sign Out
                </Button>
              </div>
            </div>
          </aside>

          {/* Content */}
          <div className="lg:col-span-3">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {/* Personal Info */}
                {activeTab === "personal" && (
                  <div className="bg-card rounded-2xl border border-border p-6">
                    <h3 className="text-lg font-semibold text-foreground mb-6">
                      Personal Information
                    </h3>

                    <div className="grid gap-6">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="fullName">Full Name</Label>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="fullName"
                              value={fullName}
                              onChange={(e) => setFullName(e.target.value)}
                              placeholder="Enter your name"
                              className="pl-10"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="email">Email Address</Label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="email"
                              value={user.email || ""}
                              disabled
                              className="pl-10 bg-muted"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="studentId">Student ID</Label>
                        <div className="relative">
                          <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="studentId"
                            value={studentId}
                            onChange={(e) => setStudentId(e.target.value)}
                            placeholder="e.g., STU2024001"
                            className="pl-10"
                          />
                        </div>
                      </div>

                      <Button
                        variant="warm"
                        className="w-fit"
                        onClick={handleSaveProfile}
                        disabled={saving}
                      >
                        <Save className="h-4 w-4 mr-2" />
                        {saving ? "Saving..." : "Save Changes"}
                      </Button>
                    </div>
                  </div>
                )}

                {/* Order History */}
                {activeTab === "orders" && (
                  <div className="bg-card rounded-2xl border border-border p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-semibold text-foreground">
                        Order History
                      </h3>
                      <Button variant="ghost" size="sm" onClick={fetchOrders}>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Refresh
                      </Button>
                    </div>

                    {orders.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
                          <ShoppingBag className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <p className="text-muted-foreground">No orders yet</p>
                        <Button
                          variant="soft"
                          className="mt-4"
                          onClick={() => router.push("/")}
                        >
                          Start Ordering
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {orders.map((order) => (
                          <div
                            key={order.id}
                            className="p-4 rounded-xl bg-muted/30 border border-border"
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <h4 className="font-medium text-foreground">
                                  {order.vendor_name}
                                </h4>
                                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                                  <Clock className="h-3 w-3" />
                                  {new Date(order.order_time).toLocaleDateString()}
                                </p>
                              </div>
                              <Badge
                                variant={
                                  order.status === "completed"
                                    ? "success"
                                    : order.status === "preparing"
                                    ? "preparing"
                                    : "pending"
                                }
                              >
                                {order.status}
                              </Badge>
                            </div>

                            <div className="space-y-1 mb-3">
                              {(order.items as { name: string; quantity: number; price: number }[]).map((item, idx) => (
                                <div
                                  key={idx}
                                  className="flex justify-between text-sm"
                                >
                                  <span className="text-muted-foreground">
                                    {item.quantity}x {item.name}
                                  </span>
                                  <span className="text-foreground">
                                    ${(item.price * item.quantity).toFixed(2)}
                                  </span>
                                </div>
                              ))}
                            </div>

                            <div className="flex items-center justify-between pt-3 border-t border-border">
                              <span className="font-semibold text-foreground">
                                Total: ${Number(order.total).toFixed(2)}
                              </span>
                              <Button variant="soft" size="sm">
                                Reorder
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Favorites */}
                {activeTab === "favorites" && (
                  <div className="bg-card rounded-2xl border border-border p-6">
                    <h3 className="text-lg font-semibold text-foreground mb-6">
                      Saved Favorites
                    </h3>

                    {favorites.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
                          <Heart className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <p className="text-muted-foreground">
                          No favorites saved yet
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Browse the menu and save your favorite dishes
                        </p>
                        <Button
                          variant="soft"
                          className="mt-4"
                          onClick={() => router.push("/")}
                        >
                          Browse Menu
                        </Button>
                      </div>
                    ) : (
                      <div className="grid md:grid-cols-2 gap-4">
                        {favorites.map((fav) => (
                          <div
                            key={fav.id}
                            className="flex gap-4 p-4 rounded-xl bg-muted/30 border border-border"
                          >
                            <img
                              src={fav.image}
                              alt={fav.name}
                              className="w-20 h-20 rounded-lg object-cover"
                            />
                            <div className="flex-1">
                              <h4 className="font-medium text-foreground text-sm">
                                {fav.name}
                              </h4>
                              <p className="text-xs text-muted-foreground">
                                {fav.cuisine}
                              </p>
                              <div className="flex items-center gap-1 mt-1">
                                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                <span className="text-xs text-muted-foreground">
                                  {fav.rating.toFixed(1)}
                                </span>
                              </div>
                              <div className="flex gap-2 mt-2">
                                <Button
                                  variant="soft"
                                  size="sm"
                                  className="h-7 text-xs"
                                  onClick={() => router.push(`/`)}
                                >
                                  View Menu
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 text-xs text-destructive hover:text-destructive"
                                  onClick={() => handleRemoveFavorite(fav.id)}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Settings */}
                {activeTab === "settings" && (
                  <div className="space-y-6">
                    {/* Notifications */}
                    <div className="bg-card rounded-2xl border border-border p-6">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                          <Bell className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground">
                            Notification Preferences
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Control how you receive alerts
                          </p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center justify-between py-3 border-b border-border">
                          <div>
                            <p className="font-medium text-foreground text-sm">
                              Enable All Notifications
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Master toggle for all notifications
                            </p>
                          </div>
                          <Switch
                            checked={notificationsEnabled}
                            onCheckedChange={setNotificationsEnabled}
                          />
                        </div>

                        <div className="flex items-center justify-between py-3 border-b border-border">
                          <div>
                            <p className="font-medium text-foreground text-sm">
                              Order Updates
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Get notified when your food is ready
                            </p>
                          </div>
                          <Switch
                            checked={orderNotifications}
                            onCheckedChange={setOrderNotifications}
                            disabled={!notificationsEnabled}
                          />
                        </div>

                        <div className="flex items-center justify-between py-3">
                          <div>
                            <p className="font-medium text-foreground text-sm">
                              Promotions & Offers
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Receive deals and special offers
                            </p>
                          </div>
                          <Switch
                            checked={promoNotifications}
                            onCheckedChange={setPromoNotifications}
                            disabled={!notificationsEnabled}
                          />
                        </div>
                      </div>
                    </div>

                    <Button
                      variant="warm"
                      className="w-fit"
                      onClick={handleSaveProfile}
                      disabled={saving}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {saving ? "Saving..." : "Save Settings"}
                    </Button>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;