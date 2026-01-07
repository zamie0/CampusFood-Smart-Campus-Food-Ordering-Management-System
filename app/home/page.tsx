"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/dashboard/Header";
import WelcomeHero from "@/components/dashboard/WelcomeHero";
import VendorCard from "@/components/dashboard/VendorCard";
import VendorDetailModal from "@/components/dashboard/VendorDetailModal";
import CartSheet from "@/components/dashboard/CartSheet";
import { Badge } from "@/components/ui/badge";
import {
  CartItem,
  FoodItem,
  Vendor
} from "@/data/mockData";
import { Search, Star } from "lucide-react";

const Index = () => {
  const { user } = useAuth();
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [isVendorModalOpen, setIsVendorModalOpen] = useState(false);
  const [userName, setUserName] = useState("Guest");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCuisine, setSelectedCuisine] = useState("All");
  const [activeOrdersCount, setActiveOrdersCount] = useState(0);

  // Load vendors from API
  useEffect(() => {
    const loadVendors = async () => {
      try {
        const response = await fetch('/api/vendors');
        if (response.ok) {
          const vendorsData = await response.json();
          setVendors(vendorsData.items || []);
        } else {
          console.error('Failed to load vendors');
        }
      } catch (error) {
        console.error('Error loading vendors:', error);
      }
    };

    const loadActiveOrders = () => {
      const allOrders = JSON.parse(localStorage.getItem("allCustomerOrders") || "[]");
      const active = allOrders.filter((o: any) => o.customerId === user?.id && o.status !== "completed");
      setActiveOrdersCount(active.length);
    };

    loadVendors();
    loadActiveOrders();
  }, [user?.id]);

  // Get unique cuisines from vendors
  const cuisineFilters = ["All", ...new Set(vendors.map(v => v.cuisine).filter(Boolean))];

  // Fetch user profile name
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) {
        setUserName("Guest");
        return;
      }

      if (user.fullName) {
        setUserName(user.fullName.split(" ")[0]);
      } else {
        setUserName("User");
      }
    };

    fetchProfile();
  }, [user]);

  const handleAddToCart = (item: FoodItem) => {
    const vendor = vendors.find(v => v.id === item.vendorId);
    const existingItem = cartItems.find(ci => ci.foodItem.id === item.id);

    if (existingItem) {
      setCartItems(prev =>
        prev.map(ci =>
          ci.foodItem.id === item.id
            ? { ...ci, quantity: ci.quantity + 1 }
            : ci
        )
      );
    } else {
      setCartItems(prev => [...prev, {
        foodItem: item,
        quantity: 1,
        vendorName: vendor?.name || ''
      }]);
    }

    toast.success(`Added ${item.name} to cart`, {
      description: `$${item.price.toFixed(2)}`,
      action: {
        label: "View Cart",
        onClick: () => setIsCartOpen(true),
      },
    });
  };

  const handleUpdateQuantity = (itemId: string, quantity: number) => {
    setCartItems(prev =>
      prev.map(ci =>
        ci.foodItem.id === itemId ? { ...ci, quantity } : ci
      )
    );
  };

  const handleRemoveItem = (itemId: string) => {
    setCartItems(prev => prev.filter(ci => ci.foodItem.id !== itemId));
  };

  const handleCheckout = () => {
    // Group items by vendor
    const itemsByVendor = cartItems.reduce((acc, item) => {
      const vendorId = item.foodItem.vendorId;
      if (!acc[vendorId]) {
        acc[vendorId] = [];
      }
      acc[vendorId].push(item);
      return acc;
    }, {} as Record<string, typeof cartItems>);

    // Create orders for each vendor
    const allOrders = JSON.parse(localStorage.getItem("allCustomerOrders") || "[]");

    Object.entries(itemsByVendor).forEach(([vendorId, items]) => {
      const vendor = vendors.find(v => v.id === vendorId);
      const orderTotal = items.reduce((sum, item) => sum + item.foodItem.price * item.quantity, 0);

      const newOrder = {
        id: `order_${Date.now()}_${vendorId}`,
        customerId: user?.id,
        customerName: userName,
        customerEmail: user?.email,
        vendorId: vendorId,
        vendorName: vendor?.name || items[0].vendorName,
        items: items.map(item => ({
          name: item.foodItem.name,
          quantity: item.quantity,
          price: item.foodItem.price
        })),
        total: orderTotal,
        status: "pending" as const,
        orderTime: Date.now()
      };

      allOrders.push(newOrder);

      // Also save to vendor-specific orders
      const vendorOrders = JSON.parse(localStorage.getItem(`vendorOrders_${vendorId}`) || "[]");
      vendorOrders.push({
        id: newOrder.id,
        customerName: newOrder.customerName,
        items: newOrder.items,
        total: newOrder.total,
        status: newOrder.status,
        orderTime: newOrder.orderTime
      });
      localStorage.setItem(`vendorOrders_${vendorId}`, JSON.stringify(vendorOrders));
    });

    localStorage.setItem("allCustomerOrders", JSON.stringify(allOrders));

    toast.success("Order placed successfully!", {
      description: "You'll be notified when your food is ready.",
    });
    setCartItems([]);
    setIsCartOpen(false);
  };

  const handleVendorClick = (vendor: Vendor) => {
    setSelectedVendor(vendor);
    setIsVendorModalOpen(true);
  };

  const handleCloseVendorModal = () => {
    setIsVendorModalOpen(false);
    setTimeout(() => setSelectedVendor(null), 300);
  };

  // Filter vendors
  const filteredVendors = vendors.filter(vendor => {
    const matchesSearch = vendor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vendor.cuisine.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCuisine = selectedCuisine === "All" || vendor.cuisine === selectedCuisine;
    return matchesSearch && matchesCuisine;
  });

  const cartItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const openVendorsCount = vendors.filter(v => v.isOpen).length;

  return (
    <div className="min-h-screen bg-background">
      <Header
        cartItemCount={cartItemCount}
        onCartClick={() => setIsCartOpen(true)}
        onMenuClick={() => {}}
      />

      <main className="pb-24 md:pb-8">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-primary/5 to-background px-4 pt-4 pb-6 md:px-6 md:pt-6 md:pb-8">
          <div className="container">
            <WelcomeHero fullName={userName} activeOrders={activeOrdersCount} ordersThisMonth={0} totalSaved={0} />
          </div>
        </section>

        {/* Cuisine Filters */}
        <section className="sticky top-0 z-30 bg-background/95 backdrop-blur-md border-b border-border px-4 py-3 md:px-6">
          <div className="container">
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1 -mx-4 px-4 md:mx-0 md:px-0">
              {cuisineFilters.map((cuisine) => (
                <motion.button
                  key={cuisine}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedCuisine(cuisine)}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all shrink-0 ${
                    selectedCuisine === cuisine
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  }`}
                >
                  {cuisine}
                </motion.button>
              ))}
            </div>
          </div>
        </section>

        {/* Vendors Grid */}
        <section className="px-4 py-6 md:px-6 md:py-8">
          <div className="container">
            {/* Section Header */}
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <div>
                <h2 className="text-lg md:text-xl font-bold text-foreground">
                  {selectedCuisine === "All" ? "All Restaurants" : `${selectedCuisine} Restaurants`}
                </h2>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {openVendorsCount} restaurants open now
                </p>
              </div>
              <Badge variant="soft" className="hidden sm:flex items-center gap-1.5">
                <Star className="h-3.5 w-3.5 text-accent fill-accent" />
                Top Rated
              </Badge>
            </div>

            {/* Vendors Grid - Responsive */}
            {filteredVendors.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4 lg:gap-5">
                {filteredVendors.map((vendor, index) => (
                  <VendorCard
                    key={`${(vendor as any).id || (vendor as any)._id || vendor.name || 'vendor'}-${index}`}
                    vendor={vendor}
                    onClick={() => handleVendorClick(vendor)}
                    index={index}
                  />
                ))}
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <p className="text-muted-foreground">No restaurants found matching your search.</p>
              </motion.div>
            )}
          </div>
        </section>
      </main>

      {/* Vendor Detail Modal */}
      <VendorDetailModal
        vendor={selectedVendor}
        isOpen={isVendorModalOpen}
        onClose={handleCloseVendorModal}
        onAddToCart={handleAddToCart}
      />

      {/* Cart Sheet */}
      <CartSheet
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onCheckout={handleCheckout}
      />
    </div>
  );
};

export default Index;