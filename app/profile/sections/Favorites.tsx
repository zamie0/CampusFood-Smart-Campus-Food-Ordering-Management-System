"use client";

import { FC } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, Heart, Trash2, Store, Star, Plus } from "lucide-react";
import { Vendor, FoodItem } from "@/data/mockData";

export interface FavoriteRow {
  id: string;
  food_item_id: string;
  vendor_id: string;
}

interface FavoritesProps {
  favorites: FavoriteRow[];
  allFoodItems: FoodItem[];
  allVendors: Vendor[];
  onRefresh: () => void;
  onRemove: (favoriteId: string) => void;
  onAddToCart: (item: FoodItem, vendorName: string) => void;
  onBrowseMenu: () => void;
}

const Favorites: FC<FavoritesProps> = ({ favorites, allFoodItems, allVendors, onRefresh, onRemove, onAddToCart, onBrowseMenu }) => {
  const getFoodItem = (id: string) => allFoodItems.find((f) => f.id === id);
  const getVendor = (id: string) => allVendors.find((v) => v.id === id);

  return (
    <div className="bg-card rounded-2xl border border-border p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground">Saved Favorites</h3>
        <Button variant="ghost" size="sm" onClick={onRefresh}>
          <RefreshCw className="h-4 w-4 mr-2" /> Refresh
        </Button>
      </div>

      {favorites.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
            <Heart className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground">No favorites saved yet</p>
          <p className="text-sm text-muted-foreground mt-1">Browse the menu and save your favorite dishes</p>
          <Button variant="soft" className="mt-4" onClick={onBrowseMenu}>Browse Menu</Button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {favorites.map((fav) => {
            const item = getFoodItem(fav.food_item_id);
            const vendor = getVendor(fav.vendor_id);

            if (!item) {
              return (
                <div key={fav.id} className="flex gap-4 p-4 rounded-xl bg-muted/30 border border-border opacity-50">
                  <div className="w-20 h-20 rounded-lg bg-muted flex items-center justify-center">
                    <Heart className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-foreground text-sm">Item not found</h4>
                    <p className="text-xs text-muted-foreground">{fav.food_item_id}</p>
                    <Button variant="ghost" size="sm" className="h-7 text-xs text-destructive hover:text-destructive mt-2" onClick={() => onRemove(fav.id)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              );
            }

            return (
              <div key={fav.id} className="flex gap-4 p-4 rounded-xl bg-muted/30 border border-border hover:border-primary/30 transition-all">
                <img src={item.image} alt={item.name} className="w-20 h-20 rounded-lg object-cover" />
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-foreground text-sm">{item.name}</h4>

                  {vendor ? (
                    <div className="flex items-center gap-1.5 mt-1 mb-2">
                      <Store className="h-3 w-3 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground font-medium">{vendor.name}</p>
                      {vendor.rating && (
                        <div className="flex items-center gap-0.5 ml-1">
                          <Star className="h-3 w-3 fill-accent text-accent" />
                          <span className="text-xs text-muted-foreground">{vendor.rating}</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground mt-1 mb-2">Vendor: {fav.vendor_id}</p>
                  )}

                  <p className="text-primary font-semibold text-base mb-2">${item.price.toFixed(2)}</p>

                  <div className="flex gap-2">
                    <Button variant="warm" size="sm" className="h-8 text-xs flex-1" onClick={() => onAddToCart(item, vendor?.name || "")} disabled={!item.isAvailable}>
                      <Plus className="h-3.5 w-3.5 mr-1" /> Add to Cart
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10" title="Remove from favorites" onClick={() => onRemove(fav.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Favorites;
