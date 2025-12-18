import { motion } from "framer-motion";
import { Plus, Flame, Leaf } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FoodItem } from "@/data/mockData";

interface FoodItemCardProps {
  item: FoodItem;
  vendorName?: string;
  onAddToCart: (item: FoodItem) => void;
  index: number;
}

const FoodItemCard = ({ item, vendorName, onAddToCart, index }: FoodItemCardProps) => {
  const getTagIcon = (tag: string) => {
    switch (tag) {
      case 'spicy':
        return <Flame className="h-3 w-3" />;
      case 'vegetarian':
      case 'vegan':
        return <Leaf className="h-3 w-3" />;
      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="group bg-card rounded-2xl border border-border overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
    >
      <div className="flex gap-4 p-4">
        {/* Image */}
        <div className="relative w-24 h-24 flex-shrink-0 rounded-xl overflow-hidden">
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
          />
          {item.isPopular && (
            <div className="absolute top-1.5 left-1.5">
              <Badge variant="default" className="text-[9px] px-1.5 py-0.5">
                🔥 Popular
              </Badge>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between gap-2">
              <h4 className="font-semibold text-foreground text-sm line-clamp-1 group-hover:text-primary transition-colors">
                {item.name}
              </h4>
            </div>
            
            {vendorName && (
              <p className="text-xs text-muted-foreground mt-0.5">{vendorName}</p>
            )}
            
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
              {item.description}
            </p>

            {/* Tags */}
            {item.tags.length > 0 && (
              <div className="flex gap-1.5 mt-2">
                {item.tags.slice(0, 2).map((tag) => (
                  <Badge 
                    key={tag} 
                    variant="secondary" 
                    className="text-[10px] px-1.5 py-0 gap-0.5"
                  >
                    {getTagIcon(tag)}
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Price & Add */}
          <div className="flex items-center justify-between mt-3">
            <span className="text-base font-bold text-primary">
              ${item.price.toFixed(2)}
            </span>
            
            <Button
              variant="soft"
              size="sm"
              className="h-8 px-3 text-xs"
              onClick={(e) => {
                e.stopPropagation();
                onAddToCart(item);
              }}
              disabled={!item.isAvailable}
            >
              <Plus className="h-3.5 w-3.5 mr-1" />
              Add
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default FoodItemCard;
