import { motion, AnimatePresence } from "framer-motion";
import { X, Clock, CheckCircle2, ChefHat, Package, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Order } from "@/data/mockData";

interface OrderTrackingSheetProps {
  isOpen: boolean;
  onClose: () => void;
  orders: Order[];
}

const OrderTrackingSheet = ({ isOpen, onClose, orders }: OrderTrackingSheetProps) => {
  const getStatusConfig = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return {
          icon: Clock,
          label: 'Order Placed',
          color: 'bg-warning',
          progress: 25,
          message: 'Waiting for vendor to confirm',
        };
      case 'preparing':
        return {
          icon: ChefHat,
          label: 'Preparing',
          color: 'bg-info',
          progress: 60,
          message: 'Your food is being prepared',
        };
      case 'ready':
        return {
          icon: Package,
          label: 'Ready for Pickup',
          color: 'bg-success',
          progress: 100,
          message: 'Head to the counter to collect!',
        };
      case 'completed':
        return {
          icon: CheckCircle2,
          label: 'Completed',
          color: 'bg-success',
          progress: 100,
          message: 'Order completed',
        };
      default:
        return {
          icon: Clock,
          label: 'Unknown',
          color: 'bg-muted',
          progress: 0,
          message: '',
        };
    }
  };

  const activeOrders = orders.filter(o => o.status !== 'completed');

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
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="font-semibold text-foreground">Track Orders</h2>
                  <p className="text-xs text-muted-foreground">
                    {activeOrders.length} active order{activeOrders.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Orders List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {activeOrders.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
                    <Package className="h-10 w-10 text-muted-foreground" />
                  </div>
                  <h3 className="font-medium text-foreground mb-1">No active orders</h3>
                  <p className="text-sm text-muted-foreground">
                    Your order status will appear here
                  </p>
                </div>
              ) : (
                activeOrders.map((order) => {
                  const config = getStatusConfig(order.status);
                  const StatusIcon = config.icon;
                  
                  return (
                    <motion.div
                      key={order.id}
                      layout
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="p-4 rounded-xl bg-muted/30 border border-border space-y-4"
                    >
                      {/* Order Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl ${config.color}/10 flex items-center justify-center`}>
                            <StatusIcon className={`h-5 w-5 ${
                              order.status === 'ready' ? 'text-success' :
                              order.status === 'preparing' ? 'text-info' : 'text-warning'
                            }`} />
                          </div>
                          <div>
                            <h4 className="font-medium text-sm text-foreground">{order.vendorName}</h4>
                            <p className="text-xs text-muted-foreground">Order #{order.id}</p>
                          </div>
                        </div>
                        <Badge variant={
                          order.status === 'ready' ? 'success' :
                          order.status === 'preparing' ? 'preparing' : 'pending'
                        } className="text-[10px]">
                          {config.label}
                        </Badge>
                      </div>

                      {/* Progress Bar */}
                      <div className="space-y-2">
                        <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${config.progress}%` }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className={`h-full rounded-full ${config.color}`}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">{config.message}</p>
                      </div>

                      {/* Items */}
                      <div className="space-y-2">
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
                      <div className="flex items-center justify-between pt-3 border-t border-border">
                        <div>
                          <p className="text-xs text-muted-foreground">Total</p>
                          <p className="text-lg font-bold text-primary">${order.total.toFixed(2)}</p>
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
                })
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default OrderTrackingSheet;
