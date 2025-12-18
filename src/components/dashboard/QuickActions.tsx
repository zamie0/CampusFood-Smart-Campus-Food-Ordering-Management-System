import { motion } from "framer-motion";
import { UtensilsCrossed, Clock, Heart, History } from "lucide-react";
import { Button } from "@/components/ui/button";

interface QuickActionsProps {
  onNavigate: (section: string) => void;
}

const QuickActions = ({ onNavigate }: QuickActionsProps) => {
  const actions = [
    {
      id: 'menu',
      icon: UtensilsCrossed,
      label: 'Browse Menu',
      description: 'Explore all vendors',
      color: 'text-primary',
      bg: 'bg-primary/10',
    },
    {
      id: 'orders',
      icon: Clock,
      label: 'Active Orders',
      description: 'Track your food',
      color: 'text-info',
      bg: 'bg-info/10',
    },
    {
      id: 'favorites',
      icon: Heart,
      label: 'Favorites',
      description: 'Quick reorder',
      color: 'text-destructive',
      bg: 'bg-destructive/10',
    },
    {
      id: 'history',
      icon: History,
      label: 'Order History',
      description: 'Past orders',
      color: 'text-muted-foreground',
      bg: 'bg-muted',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {actions.map((action, index) => (
        <motion.button
          key={action.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onNavigate(action.id)}
          className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-card border border-border hover:border-primary/30 hover:shadow-md transition-all duration-300 text-center"
        >
          <div className={`w-12 h-12 rounded-xl ${action.bg} flex items-center justify-center`}>
            <action.icon className={`h-5 w-5 ${action.color}`} />
          </div>
          <div>
            <p className="font-medium text-sm text-foreground">{action.label}</p>
            <p className="text-xs text-muted-foreground">{action.description}</p>
          </div>
        </motion.button>
      ))}
    </div>
  );
};

export default QuickActions;
