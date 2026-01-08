"use client";

import { Bell, Search, ShoppingCart, Menu, User, LogIn, Utensils, Clock, MapPin, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useNotifications } from "@/contexts/NotificationContext";
import NotificationPanel from "./NotificationPanel";
import OrderTrackingSheet from "./OrderTrackingSheet";
import { Order, Vendor, FoodItem } from "@/data/mockData";

interface HeaderProps {
  cartItemCount: number;
  onCartClick: () => void;
  onMenuClick: () => void;
  vendors?: Vendor[];
  foodItems?: FoodItem[];
  onVendorClick?: (vendor: Vendor) => void;
  onFoodItemClick?: (foodItem: FoodItem, vendor: Vendor) => void;
}

const Header = ({
  cartItemCount,
  onCartClick,
  onMenuClick,
  vendors = [],
  foodItems = [],
  onVendorClick,
  onFoodItemClick,
}: HeaderProps) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showOrderTracking, setShowOrderTracking] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchDropdownRef = useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const { notifications, unreadCount, markAsRead } = useNotifications();
  const { user } = useAuth();
  const router = useRouter();


  // Search functionality
  const filteredVendors = vendors.filter((vendor) =>
    vendor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    vendor.cuisine.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredFoodItems = foodItems.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Close search dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchDropdownRef.current &&
        !searchDropdownRef.current.contains(event.target as Node) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target as Node)
      ) {
        setShowSearchResults(false);
      }
    };

    if (showSearchResults) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showSearchResults]);

  return (
    <>
      <header className="sticky top-0 z-40 bg-card/80 backdrop-blur-md border-b border-border">
        <div className="container flex items-center justify-between h-16 px-4 md:px-6">
          {/* Logo & Menu */}
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="md:hidden" onClick={onMenuClick}>
              <Menu className="h-5 w-5" />
            </Button>

            <div
              onClick={() => router.push("/")}
              className="flex items-center gap-3 cursor-pointer select-none group"
            >
              {/* Logo Icon */}
              <div
                className="w-10 h-10 rounded-xl bg-primary/15 ring-1 ring-primary/30 
                           flex items-center justify-center 
                           transition-all duration-200 
                           group-hover:bg-primary/25 group-hover:scale-105"
              >
                <Utensils className="w-5 h-5 text-primary" />
              </div>

              {/* Brand Text */}
              <div className="hidden sm:flex flex-col leading-tight">
                <h1 className="text-lg font-semibold tracking-tight text-foreground">CampusFood</h1>
                <p className="text-xs text-muted-foreground">Order ahead, skip the queue</p>
              </div>
            </div>
          </div>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search vendors, dishes..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSearchResults(true);
                }}
                onFocus={() => searchQuery && setShowSearchResults(true)}
                className="w-full h-10 pl-10 pr-4 rounded-xl border border-input bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />

              {/* Search Results Dropdown */}
              {showSearchResults && searchQuery && (
                <div
                  ref={searchDropdownRef}
                  className="absolute top-full left-0 right-0 mt-2 bg-background border border-input rounded-xl shadow-lg z-50 max-h-96 overflow-y-auto scrollbar-hide"
                >
                  {filteredVendors.length === 0 && filteredFoodItems.length === 0 ? (
                    <div className="p-4 text-center text-muted-foreground">
                      No results found for "{searchQuery}"
                    </div>
                  ) : (
                    <>
                      {/* Vendors Section */}
                      {filteredVendors.length > 0 && (
                        <div className="border-b border-input">
                          <div className="px-4 py-2 text-xs font-semibold text-muted-foreground bg-muted/50">
                            VENDORS
                          </div>
                          {filteredVendors.map((vendor) => (
                            <div
                              key={vendor.id}
                              onClick={() => {
                                if (onVendorClick) {
                                  onVendorClick(vendor);
                                } else {
                                  router.push(`/`);
                                }
                                setShowSearchResults(false);
                                setSearchQuery("");
                              }}
                              className="px-4 py-3 hover:bg-muted cursor-pointer transition-colors border-b border-input/50 last:border-b-0"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <p className="font-medium text-sm text-foreground">{vendor.name}</p>
                                  <div className="flex items-center gap-2 mt-1">
                                    <span className="text-xs text-muted-foreground">{vendor.cuisine}</span>
                                    <div className="flex items-center gap-1">
                                      <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                                      <span className="text-xs font-medium">{vendor.rating}</span>
                                      <span className="text-xs text-muted-foreground">({vendor.reviewCount})</span>
                                    </div>
                                  </div>
                                </div>
                                {vendor.isOpen ? (
                                  <Badge className="bg-green-500/20 text-green-700 text-xs">Open</Badge>
                                ) : (
                                  <Badge variant="secondary" className="text-xs">Closed</Badge>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Menu Items Section */}
                      {filteredFoodItems.length > 0 && (
                        <div>
                          <div className="px-4 py-2 text-xs font-semibold text-muted-foreground bg-muted/50">
                            MENU ITEMS
                          </div>
                          {filteredFoodItems.map((item) => {
                            const vendor = vendors.find((v) => v.id === item.vendorId);
                            return (
                              <div
                                key={item.id}
                                onClick={() => {
                                  if (vendor) {
                                    if (onFoodItemClick) {
                                      onFoodItemClick(item, vendor);
                                    } else if (onVendorClick) {
                                      onVendorClick(vendor);
                                    } else {
                                      router.push(`/`);
                                    }
                                  }
                                  setShowSearchResults(false);
                                  setSearchQuery("");
                                }}
                                className="px-4 py-3 hover:bg-muted cursor-pointer transition-colors border-b border-input/50 last:border-b-0"
                              >
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <p className="font-medium text-sm text-foreground">{item.name}</p>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                      {vendor?.name} • {item.category}
                                    </p>
                                    <div className="flex items-center gap-2 mt-1.5">
                                      <span className="font-semibold text-sm text-primary">
                                        ${item.price.toFixed(2)}
                                      </span>
                                      {item.tags.length > 0 && (
                                        <div className="flex gap-1">
                                          {item.tags.slice(0, 2).map((tag) => (
                                            <Badge key={tag} variant="secondary" className="text-[10px] px-1.5">
                                              {tag}
                                            </Badge>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  {!item.isAvailable && (
                                    <Badge variant="secondary" className="text-xs">Out of Stock</Badge>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Search - Mobile */}
            <Button variant="ghost" size="icon" className="md:hidden">
              <Search className="h-5 w-5" />
            </Button>

            {user ? (
              <>
                {/* Track Order */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowOrderTracking(true)}
                  title="Track Order"
                >
                  <Clock className="h-5 w-5" />
                </Button>

                {/* Notifications */}
                <div className="relative">
                  <Button variant="ghost" size="icon" onClick={() => setShowNotifications(!showNotifications)}>
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-primary text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
                        {unreadCount}
                      </span>
                    )}
                  </Button>

                  {showNotifications && (
                    <NotificationPanel
                      notifications={notifications.slice(0, 3)}
                      onClose={() => setShowNotifications(false)}
                      onMarkAsRead={markAsRead}
                      onViewAll={() => {
                        setShowNotifications(false);
                        router.push("/profile#notifications");
                      }}
                    />
                  )}
                </div>

                {/* Profile */}
                <Button variant="ghost" size="icon" onClick={() => router.push("/profile")}>
                  <User className="h-5 w-5" />
                </Button>

                {/* Cart */}
                <Button variant="warm" size="sm" className="gap-2" onClick={onCartClick}>
                  <ShoppingCart className="h-4 w-4" />
                  <span className="hidden sm:inline">Cart</span>
                  {cartItemCount > 0 && (
                    <Badge
                      variant="secondary"
                      className="ml-1 h-5 min-w-5 flex items-center justify-center p-0 text-[10px]"
                    >
                      {cartItemCount}
                    </Badge>
                  )}
                </Button>
              </>
            ) : (
              <Button variant="warm" size="sm" className="gap-2" onClick={() => router.push("/")}>
                <LogIn className="h-4 w-4" />
                <span>Sign In</span>
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Order Tracking Sheet */}
      <OrderTrackingSheet
        isOpen={showOrderTracking}
        onClose={() => setShowOrderTracking(false)}
      />
    </>
  );
};

export default Header;
