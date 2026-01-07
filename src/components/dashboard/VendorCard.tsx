import { motion } from "framer-motion";
import { Star, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Vendor } from "@/data/mockData";

interface VendorCardProps {
  vendor: Vendor;
  onClick: () => void;
  index: number;
}

const VendorCard = ({ vendor, onClick, index }: VendorCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="group cursor-pointer bg-card rounded-2xl border border-border overflow-hidden shadow-sm hover:shadow-xl hover:border-primary/30 transition-all duration-300"
    >
      {/* Image */}
      <div className="relative h-32 sm:h-36 md:h-40 overflow-hidden">
        <img
          src={vendor.image}
          alt={vendor.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-transparent to-transparent" />
        
        {/* Status Badge */}
        <div className="absolute top-2 right-2 sm:top-3 sm:right-3">
          {vendor.isOpen ? (
            <Badge variant="success" className="text-[10px] sm:text-xs shadow-lg">Open</Badge>
          ) : (
            <Badge variant="secondary" className="text-[10px] sm:text-xs">Closed</Badge>
          )}
        </div>

        {/* Delivery Time */}
        <div className="absolute bottom-2 right-2 sm:bottom-3 sm:right-3">
          <div className="bg-background/95 backdrop-blur-sm rounded-lg px-2 py-1 flex items-center gap-1 shadow-md">
            <Clock className="h-3 w-3 text-primary" />
            <span className="text-[10px] sm:text-xs font-medium text-foreground">{vendor.deliveryTime}</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-3 sm:p-4 space-y-1.5 sm:space-y-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-sm sm:text-base text-foreground group-hover:text-primary transition-colors line-clamp-1">
            {vendor.name}
          </h3>
          <div className="flex items-center gap-1 shrink-0">
            <Star className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-accent fill-accent" />
            <span className="text-xs sm:text-sm font-semibold text-foreground">{vendor.rating}</span>
          </div>
        </div>
        
        <p className="text-xs sm:text-sm text-muted-foreground line-clamp-1">
          {vendor.description}
        </p>

        {/* Cuisine Tag */}
        <div className="pt-1">
          <Badge variant="soft" className="text-[10px] sm:text-xs">
            {vendor.cuisine}
          </Badge>
        </div>
      </div>
    </motion.div>
  );
};

export default VendorCard;
