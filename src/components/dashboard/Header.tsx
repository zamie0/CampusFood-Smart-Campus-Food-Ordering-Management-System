"use client";

import { Bell, Search, ShoppingCart, Menu, User, LogIn, Heart, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useNotifications } from "@/contexts/NotificationContext";
import NotificationPanel from "./NotificationPanel";
import OrderStatusCard from "./OrderStatusCard";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

interface HeaderProps {
  cartItemCount: number;
  onCartClick: () => void;
  onMenuClick: () => void;
  onFavoritesClick?: () => void;
  onOrderTrackingClick?: () => void;
  favoritesCount?: number;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
}

const Header = ({ cartItemCount, onCartClick, onMenuClick, onFavoritesClick, onOrderTrackingClick, favoritesCount = 0, searchQuery = "", onSearchChange }: HeaderProps) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const { notifications, unreadCount, markAsRead } = useNotifications();
  const { user } = useAuth();
  const [showTrack, setShowTrack] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Scrolling down and past 100px
        setIsVisible(false);
      } else if (currentScrollY < lastScrollY) {
        // Scrolling up
        setIsVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [lastScrollY]);

  return (
    <header className={`sticky top-0 z-40 bg-card/80 backdrop-blur-md border-b border-border transition-transform duration-300 ${
      isVisible ? 'translate-y-0' : '-translate-y-full'
    }`}>
      <div className="container flex items-center justify-between h-16 px-4 md:px-6">
        {/* Logo & Menu */}
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden"
            onClick={onMenuClick}
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => router.push("/")}>
            <div className="w-10 h-10 rounded-xl bg-primary/10 ring-1 ring-primary/20 flex items-center justify-center">
              <span className="font-extrabold text-sm text-primary">CF</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-semibold tracking-tight text-foreground">CampusFood</h1>
              <p className="text-xs text-muted-foreground -mt-0.5">Order ahead, skip the queue</p>
            </div>
          </div>
        </div>

        {/* Search Bar - Desktop */}
        <div className="hidden md:flex flex-1 max-w-md mx-8">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search vendors, dishes..."
              value={searchQuery}
              onChange={(e) => onSearchChange?.(e.target.value)}
              className="w-full h-10 pl-10 pr-4 rounded-xl border border-input bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
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
                onClick={() => setShowTrack(true)}
                title="Track Order"
              >
                <Clock className="h-5 w-5" />
              </Button>

              {/* Notifications */}
              <div className="relative">
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => setShowNotifications(!showNotifications)}
                >
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-primary text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </Button>
                
                {showNotifications && (
                  <NotificationPanel 
                    notifications={notifications} 
                    onClose={() => setShowNotifications(false)}
                    onMarkAsRead={markAsRead}
                    onViewAll={() => {
                      setShowNotifications(false);
                      router.push("/profile#orders");
                    }}
                  />
                )}
              </div>

              {/* Profile */}
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => router.push("/profile")}
              >
                <User className="h-5 w-5" />
              </Button>

              {/* Cart */}
              <Button 
                variant="warm" 
                size="sm" 
                className="gap-2"
                onClick={onCartClick}
              >
                <ShoppingCart className="h-4 w-4" />
                <span className="hidden sm:inline">Cart</span>
                {cartItemCount > 0 && (
                  <Badge variant="secondary" className="ml-1 h-5 min-w-5 flex items-center justify-center p-0 text-[10px]">
                    {cartItemCount}
                  </Badge>
                )}
              </Button>
            </>
          ) : (
            <Button 
              variant="warm" 
              size="sm" 
              className="gap-2"
              onClick={() => router.push("/")}
            >
              <LogIn className="h-4 w-4" />
              <span>Sign In</span>
            </Button>
          )}
        </div>
      </div>

      {/* Track Order Sheet */}
      <Sheet open={showTrack} onOpenChange={setShowTrack}>
        <SheetContent side="right" className="w-full sm:w-[480px] p-0">
          <div className="p-4 border-b border-border">
            <SheetHeader>
              <SheetTitle>Track Order</SheetTitle>
            </SheetHeader>
          </div>
          <div className="p-4">
            {/* If you have user.customerId in your auth context, pass here. Fallback to user?.id */}
            <OrderStatusCard customerId={(user as any)?.customerId || (user as any)?.id} />
          </div>
        </SheetContent>
      </Sheet>
    </header>
  );
};

export default Header;
