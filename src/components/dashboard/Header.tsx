import { Bell, Search, ShoppingCart, Menu, User, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import NotificationPanel from "./NotificationPanel";
import { notifications } from "@/data/mockData";

interface HeaderProps {
  cartItemCount: number;
  onCartClick: () => void;
  onMenuClick: () => void;
}

const Header = ({ cartItemCount, onCartClick, onMenuClick }: HeaderProps) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const unreadCount = notifications.filter(n => !n.isRead).length;
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 bg-card/80 backdrop-blur-md border-b border-border">
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
          
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/")}>
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
                  />
                )}
              </div>

              {/* Profile */}
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => navigate("/profile")}
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
              onClick={() => navigate("/")}
            >
              <LogIn className="h-4 w-4" />
              <span>Sign In</span>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
