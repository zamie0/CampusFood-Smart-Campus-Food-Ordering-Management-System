import { motion, AnimatePresence } from "framer-motion";
import { X, Heart, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FoodItem } from "@/data/mockData";

interface FavoriteItem {
  id: string;
  foodItem: FoodItem;
  vendorName: string;
}

interface FavoritesSheetProps {
  isOpen: boolean;
  onClose: () => void;
  favorites: FavoriteItem[];
  onAddToCart: (item: FoodItem) => void;
  onRemoveFavorite: (itemId: string) => void;
}

const FavoritesSheet = ({ 
  isOpen, 
  onClose, 
  favorites, 
  onAddToCart,
  onRemoveFavorite 
}: FavoritesSheetProps) => {
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
            className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-50"
          />
          
          {/* Sheet */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-card border-l border-border z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center">
                  <Heart className="h-5 w-5 text-destructive fill-destructive" />
                </div>
                <div>
                  <h2 className="font-semibold text-foreground">Favorites</h2>
                  <p className="text-xs text-muted-foreground">
                    {favorites.length} saved item{favorites.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Favorites List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {favorites.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
                    <Heart className="h-10 w-10 text-muted-foreground" />
                  </div>
                  <h3 className="font-medium text-foreground mb-1">No favorites yet</h3>
                  <p className="text-sm text-muted-foreground">
                    Tap the heart icon on items to save them here
                  </p>
                </div>
              ) : (
                favorites.map((fav) => (
                  <motion.div
                    key={fav.id}
                    layout
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex gap-3 p-3 rounded-xl bg-muted/30 border border-border"
                  >
                    <img
                      src={fav.foodItem.image}
                      alt={fav.foodItem.name}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm text-foreground line-clamp-1">
                        {fav.foodItem.name}
                      </h4>
                      <p className="text-xs text-muted-foreground">{fav.vendorName}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="font-semibold text-primary">
                          ${fav.foodItem.price.toFixed(2)}
                        </span>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7 rounded-lg"
                            onClick={() => onRemoveFavorite(fav.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5 text-destructive" />
                          </Button>
                          <Button
                            variant="warm"
                            size="icon"
                            className="h-7 w-7 rounded-lg"
                            onClick={() => {
                              onAddToCart(fav.foodItem);
                              onClose();
                            }}
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default FavoritesSheet;
