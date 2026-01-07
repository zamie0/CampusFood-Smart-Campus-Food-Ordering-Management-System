"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useNotifications } from "@/contexts/NotificationContext";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import PersonalSection from "./sections/Personal";
import OrdersSection from "./sections/Orders";
import FavoritesSection from "./sections/Favorites";
import NotificationsSection from "./sections/Notifications";
import { User, History, Heart, Bell, Shield, ChevronLeft, LogOut, } from "lucide-react";
import { FoodItem, Vendor, CartItem } from "@/data/mockData";

type TabType = "personal" | "orders" | "favorites" | "notifications" ;

interface Profile {
  id: string;
  fullName: string | null;    
  email: string | null;
  avatarUrl: string | null;   
  notificationsEnabled?: boolean;
  promoNotifications?: boolean;
  orderNotifications?: boolean;
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
  const [allFoodItems, setAllFoodItems] = useState<FoodItem[]>([]);
  const [allVendors, setAllVendors] = useState<Vendor[]>([]);

  const [fullName, setFullName] = useState("");
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [promoNotifications, setPromoNotifications] = useState(true);
  const [orderNotifications, setOrderNotifications] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push("/");
      return;
    }

    const profileData: Profile = {
      id: user.id,
      fullName: user.fullName || null,
      email: user.email || null,
      avatarUrl: user.avatarUrl || null,
      notificationsEnabled: user.notificationsEnabled ?? true,
      promoNotifications: user.promoNotifications ?? true,
      orderNotifications: user.orderNotifications ?? true,
    };

    setProfile(profileData);
    setFullName(profileData.fullName || "");
    setNotificationsEnabled(profileData.notificationsEnabled ?? true);
    setPromoNotifications(profileData.promoNotifications ?? true);
    setOrderNotifications(profileData.orderNotifications ?? true);

    const syncFromHash = () => {
      const hash = window.location.hash.replace('#', '') as TabType;
      const allowed: TabType[] = ["personal","orders","favorites","notifications"];
      setActiveTab(allowed.includes(hash) ? hash : 'personal');
    };
    syncFromHash();
    window.addEventListener('hashchange', syncFromHash);

    loadVendorsAndFoodItems();
    fetchOrders();
    fetchFavorites();

    return () => window.removeEventListener('hashchange', syncFromHash);
  }, [user, router]);

  useEffect(() => {
    if (activeTab === "favorites" && user) {
      loadVendorsAndFoodItems();
      fetchFavorites();
    }
  }, [activeTab, user]);

  const loadVendorsAndFoodItems = () => {
    const storedVendors = JSON.parse(localStorage.getItem("registeredVendors") || "[]");
    setAllVendors(storedVendors);

    const allItems: FoodItem[] = [];
    storedVendors.forEach((vendor: Vendor) => {
      const vendorMenu = JSON.parse(localStorage.getItem(`vendorMenu_${vendor.id}`) || "[]");
      allItems.push(...vendorMenu);
    });
    setAllFoodItems(allItems);
  };

  const fetchOrders = async () => {
    if (!user) return;

    try {
      const res = await fetch(`${window.location.origin}/api/orders?status=completed`, { cache: 'no-store' });
      if (!res.ok) {
        const errText = await res.text();
        console.error('Orders API failed:', errText);
        throw new Error('Failed to fetch orders');
      }
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
                  id: `${vendorId}_${fav.food_item_id}`, 
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

  const handleRemoveFavorite = async (favoriteId: string) => {
    try {
      if (!user) return;
      const parts = favoriteId.split('_');
      if (parts.length < 2) return;
      const vendorId = parts[0];
      const foodItemId = parts.slice(1).join('_');
      
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
    const existingCart: CartItem[] = JSON.parse(
      localStorage.getItem(`cart_${user?.id}`) || "[]"
    );

    const existingItem = existingCart.find((ci) => ci.foodItem.id === item.id);

    if (existingItem) {
      const updatedCart = existingCart.map((ci) =>
        ci.foodItem.id === item.id
          ? { ...ci, quantity: ci.quantity + 1 }
          : ci
      );
      localStorage.setItem(`cart_${user?.id}`, JSON.stringify(updatedCart));
    } else {
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
                    {profile?.avatarUrl ? (
                      <img
                        src={profile.avatarUrl}
                        alt="Avatar"
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <User className="w-8 h-8 text-primary" />
                    )}
                  </div>
                </div>
                <p className="text-sm font-medium">{profile?.fullName || 'User'}</p>
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
                    fullName={fullName}
                    email={user.email || ""}
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
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;
