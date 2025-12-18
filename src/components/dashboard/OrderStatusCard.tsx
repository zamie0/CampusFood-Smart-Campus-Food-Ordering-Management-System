import { motion } from "framer-motion";
import { Clock, CheckCircle2, ChefHat, Package } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Order } from "@/data/mockData";

interface OrderStatusCardProps {
  order: Order;
}

const OrderStatusCard = ({ order }: OrderStatusCardProps) => {
  const getStatusConfig = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return {
          icon: Clock,
          label: 'Order Placed',
          variant: 'pending' as const,
          progress: 25,
          message: 'Waiting for vendor to confirm',
        };
      case 'preparing':
        return {
          icon: ChefHat,
          label: 'Preparing',
          variant: 'preparing' as const,
          progress: 60,
          message: 'Your food is being prepared',
        };
      case 'ready':
        return {
          icon: Package,
          label: 'Ready for Pickup',
          variant: 'ready' as const,
          progress: 100,
          message: 'Head to the counter to collect!',
        };
      case 'completed':
        return {
          icon: CheckCircle2,
          label: 'Completed',
          variant: 'success' as const,
          progress: 100,
          message: 'Order completed',
        };
      default:
        return {
          icon: Clock,
          label: 'Unknown',
          variant: 'secondary' as const,
          progress: 0,
          message: '',
        };
    }
  };

  const config = getStatusConfig(order.status);
  const StatusIcon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-card rounded-2xl border border-border p-5 shadow-sm"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h4 className="font-semibold text-foreground">{order.vendorName}</h4>
          <p className="text-xs text-muted-foreground mt-0.5">Order #{order.id}</p>
        </div>
        <Badge variant={config.variant} className="text-[10px]">
          <StatusIcon className="h-3 w-3 mr-1" />
          {config.label}
        </Badge>
      </div>

      {/* Progress Bar */}
      <div className="relative h-2 bg-muted rounded-full overflow-hidden mb-3">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${config.progress}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className={`h-full rounded-full ${
            order.status === 'ready' 
              ? 'bg-success' 
              : order.status === 'preparing'
              ? 'bg-info'
              : 'bg-warning'
          }`}
        />
      </div>

      <p className="text-sm text-muted-foreground mb-4">{config.message}</p>

      {/* Items */}
      <div className="space-y-2 mb-4">
        {order.items.map((item, idx) => (
          <div key={idx} className="flex justify-between text-sm">
            <span className="text-muted-foreground">
              {item.quantity}x {item.name}
            </span>
            <span className="text-foreground font-medium">
              ${(item.price * item.quantity).toFixed(2)}
            </span>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-border">
        <div>
          <p className="text-xs text-muted-foreground">Total</p>
          <p className="text-lg font-bold text-foreground">${order.total.toFixed(2)}</p>
        </div>
        {order.estimatedReady && order.status !== 'ready' && (
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Est. Ready</p>
            <p className="text-sm font-medium text-foreground">{order.estimatedReady}</p>
          </div>
        )}
        {order.status === 'ready' && (
          <Button variant="warm" size="sm">
            I'm Here
          </Button>
        )}
      </div>
    </motion.div>
  );
};

export default OrderStatusCard;
