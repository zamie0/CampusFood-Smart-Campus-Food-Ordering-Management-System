import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Star, Clock, MapPin, ArrowLeft, Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Vendor, FoodItem } from "@/data/mockData";

interface VendorDetailModalProps {
  vendor: Vendor | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (item: FoodItem) => void;
}

const VendorDetailModal = ({
  vendor,
  isOpen,
  onClose,
  onAddToCart,
}: VendorDetailModalProps) => {
  const [vendorItems, setVendorItems] = useState<FoodItem[]>([]);

  // Load menu items from localStorage
  useEffect(() => {
    if (vendor) {
      const storedMenu = JSON.parse(localStorage.getItem(`vendorMenu_${vendor.id}`) || "[]");
      setVendorItems(storedMenu);
    }
  }, [vendor]);

  if (!vendor) return null;

  // Group items by category
  const categories = vendorItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, FoodItem[]>);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-foreground/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: "100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-50 md:inset-4 md:rounded-2xl overflow-hidden bg-background flex flex-col"
          >
            {/* Header Image */}
            <div className="relative h-48 md:h-64 shrink-0">
              <img
                src={vendor.image}
                alt={vendor.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent" />

              {/* Back Button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="absolute top-4 left-4 bg-background/90 backdrop-blur-sm hover:bg-background rounded-full h-10 w-10"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>

              {/* Vendor Info Overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <Badge
                      variant={vendor.isOpen ? "success" : "secondary"}
                      className="mb-2"
                    >
                      {vendor.isOpen ? "Open Now" : "Closed"}
                    </Badge>
                    <h1 className="text-2xl md:text-3xl font-bold text-background">
                      {vendor.name}
                    </h1>
                    <p className="text-background/80 text-sm mt-1">
                      {vendor.description}
                    </p>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-4 mt-3">
                  <div className="flex items-center gap-1.5 text-background">
                    <Star className="h-4 w-4 fill-accent text-accent" />
                    <span className="font-semibold">{vendor.rating}</span>
                    <span className="text-background/70 text-sm">
                      ({vendor.reviewCount} reviews)
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-background/80">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm">{vendor.deliveryTime}</span>
                  </div>
                  <Badge variant="soft" className="bg-background/20 text-background border-0">
                    {vendor.cuisine}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Menu Content */}
            <ScrollArea className="flex-1">
              <div className="p-4 md:p-6 space-y-6">
                {Object.entries(categories).map(([category, items]) => (
                  <div key={category}>
                    <h2 className="text-lg font-semibold text-foreground mb-3 sticky top-0 bg-background py-2">
                      {category}
                    </h2>
                    <div className="space-y-3">
                      {items.map((item) => (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex gap-4 p-3 rounded-xl bg-card border border-border hover:border-primary/30 transition-all group"
                        >
                          {/* Item Image */}
                          <div className="relative w-24 h-24 md:w-28 md:h-28 shrink-0 rounded-lg overflow-hidden">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            {item.isPopular && (
                              <Badge
                                variant="default"
                                className="absolute top-1 left-1 text-[10px] px-1.5 py-0.5"
                              >
                                Popular
                              </Badge>
                            )}
                          </div>

                          {/* Item Details */}
                          <div className="flex-1 flex flex-col justify-between py-1">
                            <div>
                              <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                                {item.name}
                              </h3>
                              <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                                {item.description}
                              </p>
                              {item.tags.length > 0 && (
                                <div className="flex gap-1 mt-2">
                                  {item.tags.map((tag) => (
                                    <Badge
                                      key={tag}
                                      variant="soft"
                                      className="text-[10px] capitalize"
                                    >
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </div>

                            <div className="flex items-center justify-between mt-2">
                              <span className="text-lg font-bold text-primary">
                                ${item.price.toFixed(2)}
                              </span>
                              <Button
                                size="sm"
                                onClick={() => onAddToCart(item)}
                                disabled={!item.isAvailable}
                                className="rounded-full h-9 px-4"
                              >
                                <Plus className="h-4 w-4 mr-1" />
                                Add
                              </Button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default VendorDetailModal;
