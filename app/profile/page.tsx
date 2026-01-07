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
import NotificationsSection from "./sections/Notifications";
import { User, History, Heart, Bell, Shield, ChevronLeft, LogOut, } from "lucide-react";
import { FoodItem, Vendor, CartItem } from "@/data/mockData";

type TabType = "personal" | "orders" | "notifications" ;

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
const Profile = () => {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('personal');
  const [profile, setProfile] = useState<Profile | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
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
      const allowed: TabType[] = ["personal","orders","notifications"];
      setActiveTab(allowed.includes(hash) ? hash : 'personal');
    };
    syncFromHash();
    window.addEventListener('hashchange', syncFromHash);

    loadVendorsAndFoodItems();
    fetchOrders();

    return () => window.removeEventListener('hashchange', syncFromHash);
  }, [user, router]);

  const loadVendorsAndFoodItems = async () => {
    try {
      const vendorsRes = await fetch('/api/vendors');
      const vendorsData = await vendorsRes.json();
      const vendors: Vendor[] = Array.isArray(vendorsData) ? vendorsData : [];
      setAllVendors(vendors);

      const itemsPromises = vendors.map(async (v) => {
        const menuRes = await fetch(`/api/vendors/${v.id}/menu`);
        const menuData = await menuRes.json();
        return Array.isArray(menuData) ? menuData : [];
      });
      const allMenus = await Promise.all(itemsPromises);
      setAllFoodItems(allMenus.flat());
    } catch (err) {
      console.error(err);
      setAllVendors([]);
      setAllFoodItems([]);
    }
  };

  const fetchOrders = async () => {
    if (!user) return;

    try {
      const res = await fetch(`/api/orders?status=completed`, { cache: 'no-store' });

      if (!res.ok) {
        const errText = await res.text();
        console.error('Orders API failed:', errText);
        setOrders([]);
        return;
      }

      const data = await res.json();

      const list: any[] = Array.isArray(data.orders) ? data.orders : [];
      const filtered = list.filter((o: any) => o.customerId?.email === user.email);
      const mappedOrders: Order[] = filtered.map((order: any) => ({
        id: order._id?.toString?.() || order.id,
        vendor_name: order.vendorId?.name || 'Unknown Vendor',
        items: (order.items || []).map((item: any) => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price,
        })),
        total: order.totalAmount,
        status: order.status,
        order_time: order.createdAt,
      }));

      setOrders(mappedOrders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      setOrders([]);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  const tabs = [
    { id: "personal" as TabType, label: "Personal Info", icon: User },
    { id: "orders" as TabType, label: "Order History", icon: History },
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
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;
