"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useNotifications } from "@/contexts/NotificationContext";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import PersonalSection from "./sections/Personal";
import SecuritySection from "./sections/Security";
import OrdersSection from "./sections/Orders";
import FavoritesSection from "./sections/Favorites";
import NotificationsSection from "./sections/Notifications";
import { User, Camera, History, Heart, Bell, Shield, ChevronLeft, LogOut, } from "lucide-react";
import { FoodItem, Vendor, CartItem } from "@/data/mockData";

type TabType = "personal" | "orders" | "favorites" | "notifications" | "security";

interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
  student_id: string | null;
  student_id_verified?: "pending" | "verified" | "declined" | null;
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
  food_item_id: string;
  vendor_id: string;
}

const Profile = () => {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('personal');
  const [profile, setProfile] = useState<Profile | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const { notifications, markAsRead, refreshNotifications } = useNotifications();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [allFoodItems, setAllFoodItems] = useState<FoodItem[]>([]);
  const [allVendors, setAllVendors] = useState<Vendor[]>([]);

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
    // Sync from hash and set listeners
    const syncFromHash = () => {
      const hash = window.location.hash.replace('#', '') as TabType;
      const allowed: TabType[] = ["personal","orders","favorites","notifications","security"];
      setActiveTab(allowed.includes(hash) ? hash : 'personal');
    };
    syncFromHash();
    window.addEventListener('hashchange', syncFromHash);

    loadVendorsAndFoodItems();
    fetchProfile();
    fetchOrders();
    fetchFavorites();

    return () => window.removeEventListener('hashchange', syncFromHash);
  }, [user, router]);

  // Reload data when favorites tab is active
  useEffect(() => {
    if (activeTab === "favorites" && user) {
      loadVendorsAndFoodItems();
      fetchFavorites();
    }
  }, [activeTab, user]);

  const loadVendorsAndFoodItems = () => {
    // Load vendors from localStorage
    const storedVendors = JSON.parse(localStorage.getItem("registeredVendors") || "[]");
    setAllVendors(storedVendors);

    // Load all food items from all vendor menus
    const allItems: FoodItem[] = [];
    storedVendors.forEach((vendor: Vendor) => {
      const vendorMenu = JSON.parse(localStorage.getItem(`vendorMenu_${vendor.id}`) || "[]");
      allItems.push(...vendorMenu);
    });
    setAllFoodItems(allItems);
  };

  const fetchProfile = async () => {
    if (!user) return;

    try {
      const res = await fetch('/api/user/profile', { cache: 'no-store' });
      if (res.status === 404) {
      const createRes = await fetch('/api/user/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          fullName: user.fullName || null,
          notificationsEnabled: true,
          promoNotifications: true,
          orderNotifications: true,
        })
      });
        if (!createRes.ok) throw new Error('Failed to create profile');
        const created = await createRes.json();
        setProfile(created);
        setFullName(created.full_name || "");
        setStudentId(created.student_id || "");
        setNotificationsEnabled(created.notifications_enabled ?? true);
        setPromoNotifications(created.promo_notifications ?? true);
        setOrderNotifications(created.order_notifications ?? true);
      } else if (res.ok) {
        const data = await res.json();
        setProfile(data);
        setFullName(data.fullName || "");
        setStudentId(data.studentId || ""); 
        setNotificationsEnabled(data.notificationsEnabled ?? true);
        setPromoNotifications(data.promoNotifications ?? true);
        setOrderNotifications(data.orderNotifications ?? true);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    if (!user) return;

    try {
      const res = await fetch(`/api/orders?status=completed`, { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed to fetch orders');
      const data = await res.json();
      const list: any[] = Array.isArray(data.orders) ? data.orders : [];
      const filtered = list.filter((o: any) => o.customerId?.email === user.email);
      const mappedOrders: Order[] = filtered.map((order: any) => ({
        id: order._id?.toString?.() || order.id,
        vendor_name: order.vendorId?.name || 'Unknown Vendor',
        items: (order.items || []).map((item: any) => ({ name: item.name, quantity: item.quantity, price: item.price })),
        total: order.totalAmount,
        status: order.status,
        order_time: order.createdAt,
      }));

      setOrders(mappedOrders);
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  const fetchFavorites = async () => {
    if (!user) return;
    try {
      const allFavorites: Favorite[] = [];
      // Get all localStorage keys
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(`favorites_${user.id}_`)) {
          const vendorId = key.replace(`favorites_${user.id}_`, '');
          const stored = JSON.parse(localStorage.getItem(key) || '[]');
          if (Array.isArray(stored)) {
            stored.forEach((fav: any) => {
              if (fav.food_item_id) {
                allFavorites.push({
                  id: `${vendorId}_${fav.food_item_id}`, // Create unique id
                  food_item_id: fav.food_item_id,
                  vendor_id: vendorId,
                });
              }
            });
          }
        }
      }
      setFavorites(allFavorites);
    } catch (error) {
      console.error("Error fetching favorites:", error);
      setFavorites([]);
    }
  };

  const notifyAdminStudentVerification = (studentIdValue: string) => {
    const existing =
      JSON.parse(localStorage.getItem("adminNotifications") || "[]") || [];

    const newNotification = {
      id: `student_${Date.now()}`,
      type: "student_verification",
      title: "New Student ID submitted",
      message: `${fullName || user?.email || "A student"} submitted ID ${studentIdValue} for verification.`,
      time: new Date().toISOString(),
      isRead: false,
      userId: user?.id,
      studentId: studentIdValue,
    };

    localStorage.setItem(
      "adminNotifications",
      JSON.stringify([newNotification, ...existing])
    );

    // Inform other tabs (e.g., admin dashboard) about the update
    window.dispatchEvent(new Event("storage"));
  };


  const handleSaveProfile = async () => {
    if (!user) return;
    setSaving(true);

    try {
      if (profile?.student_id_verified === "verified" && studentId !== (profile.student_id || "")) {
        toast.error("Verified student IDs cannot be changed.");
        setStudentId(profile.student_id || "");
        setSaving(false);
        return;
      }

      const currentStudentId = profile?.student_id || "";
      const studentIdChanged = studentId !== currentStudentId;

      const updatePayload: any = {
        fullName: fullName || null,
        studentId: studentId || null,
        notificationsEnabled: notificationsEnabled,
        promoNotifications: promoNotifications,
        orderNotifications: orderNotifications,
      };
      if (studentIdChanged && studentId) updatePayload.studentIdVerified = "pending";

      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatePayload)
      });

      if (!res.ok) throw new Error('Failed to update profile');

      if (studentIdChanged && studentId) {
        notifyAdminStudentVerification(studentId);
        toast.success("This student ID was sent to the admin for approval");
      } else {
        toast.success("Profile updated successfully");
      }

      await fetchProfile();
    } catch (error) {
      console.error("Error saving profile:", error);
      toast.error("Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveFavorite = async (favoriteId: string) => {
    try {
      if (!user) return;
      // Parse favoriteId which is in format "vendorId_food_item_id"
      const parts = favoriteId.split('_');
      if (parts.length < 2) return;
      const vendorId = parts[0];
      const foodItemId = parts.slice(1).join('_'); // In case food_item_id contains underscores
      
      const key = `favorites_${user.id}_${vendorId}`;
      const stored = JSON.parse(localStorage.getItem(key) || '[]');
      const next = (Array.isArray(stored) ? stored : []).filter((f: any) => f.food_item_id !== foodItemId);
      localStorage.setItem(key, JSON.stringify(next));
      toast.success("Removed from favorites");
      fetchFavorites();
    } catch (error) {
      console.error("Error removing favorite:", error);
      toast.error("Failed to remove favorite");
    }
  };

  const handleAddToCart = (item: FoodItem, vendorName: string) => {
    // Load existing cart from localStorage
    const existingCart: CartItem[] = JSON.parse(
      localStorage.getItem(`cart_${user?.id}`) || "[]"
    );

    // Check if item already exists in cart
    const existingItem = existingCart.find((ci) => ci.foodItem.id === item.id);

    if (existingItem) {
      // Update quantity
      const updatedCart = existingCart.map((ci) =>
        ci.foodItem.id === item.id
          ? { ...ci, quantity: ci.quantity + 1 }
          : ci
      );
      localStorage.setItem(`cart_${user?.id}`, JSON.stringify(updatedCart));
    } else {
      // Add new item
      const newCart = [
        ...existingCart,
        {
          foodItem: item,
          quantity: 1,
          vendorName: vendorName,
        },
      ];
      localStorage.setItem(`cart_${user?.id}`, JSON.stringify(newCart));
    }

    toast.success(`Added ${item.name} to cart`, {
      description: `$${item.price.toFixed(2)}`,
      action: {
        label: "View Cart",
        onClick: () => router.push("/home"),
      },
    });
  };

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  const tabs = [
    { id: "personal" as TabType, label: "Personal Info", icon: User },
    { id: "orders" as TabType, label: "Order History", icon: History },
    { id: "favorites" as TabType, label: "Favorites", icon: Heart },
    { id: "notifications" as TabType, label: "Notifications", icon: Bell },
    { id: "security" as TabType, label: "Security", icon: Shield },
  ];

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-card/80 backdrop-blur-md border-b border-border">
        <div className="container flex items-center h-16 px-4 md:px-6">
          <Button variant="ghost" size="icon" onClick={() => router.push("/home")}>
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
                    {profile?.avatar_url ? (
                      <img
                        src={profile.avatar_url}
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
                  {profile?.full_name || "Student"}
                </h2>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>

              {/* Nav Tabs */}
              <nav className="space-y-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      window.location.hash = tab.id;
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
                {activeTab === "personal" && (
                  <PersonalSection
                    avatarUrl={profile?.avatar_url}
                    fullName={fullName}
                    email={user.email || ""}
                    studentId={studentId}
                    studentVerification={profile?.student_id_verified || null}
                    onChangeStudentId={setStudentId}
                    saving={saving}
                    onSave={handleSaveProfile}
                  />
                )}

                {activeTab === "orders" && (
                  <OrdersSection orders={orders} onRefresh={fetchOrders} />
                )}

                {activeTab === "notifications" && (
                  <NotificationsSection
                    notifications={notifications as any}
                    onRefresh={refreshNotifications}
                    onMarkRead={markAsRead}
                  />
                )}

                {activeTab === "favorites" && (
                  <FavoritesSection
                    favorites={favorites}
                    allFoodItems={allFoodItems}
                    allVendors={allVendors}
                    onRefresh={() => {
                      loadVendorsAndFoodItems();
                      fetchFavorites();
                    }}
                    onRemove={handleRemoveFavorite}
                    onAddToCart={handleAddToCart}
                    onBrowseMenu={() => router.push("/")}
                  />
                )}

                {activeTab === "security" && (
                  <SecuritySection />
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
