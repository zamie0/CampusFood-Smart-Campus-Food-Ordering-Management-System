import { motion, AnimatePresence } from "framer-motion";
import { X, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CartItem } from "@/data/mockData";

interface CartSheetProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onRemoveItem: (itemId: string) => void;
  onCheckout: () => void;
}

const CartSheet = ({ 
  isOpen, 
  onClose, 
  items, 
  onUpdateQuantity, 
  onRemoveItem,
  onCheckout 
}: CartSheetProps) => {
  const subtotal = items.reduce(
    (sum, item) => sum + item.foodItem.price * item.quantity,
    0
  );
  const serviceFee = 0.99;
  const total = subtotal + serviceFee;

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
                  <ShoppingBag className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="font-semibold text-foreground">Your Cart</h2>
                  <p className="text-xs text-muted-foreground">{items.length} item{items.length !== 1 ? 's' : ''}</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
                    <ShoppingBag className="h-10 w-10 text-muted-foreground" />
                  </div>
                  <h3 className="font-medium text-foreground mb-1">Your cart is empty</h3>
                  <p className="text-sm text-muted-foreground">
                    Browse the menu and add some delicious items!
                  </p>
                </div>
              ) : (
                items.map((item) => (
                  <motion.div
                    key={item.foodItem.id}
                    layout
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex gap-3 p-3 rounded-xl bg-muted/30 border border-border"
                  >
                    <img
                      src={item.foodItem.image}
                      alt={item.foodItem.name}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm text-foreground line-clamp-1">
                        {item.foodItem.name}
                      </h4>
                      <p className="text-xs text-muted-foreground">{item.vendorName}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="font-semibold text-primary">
                          ${(item.foodItem.price * item.quantity).toFixed(2)}
                        </span>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7 rounded-lg"
                            onClick={() => 
                              item.quantity > 1 
                                ? onUpdateQuantity(item.foodItem.id, item.quantity - 1)
                                : onRemoveItem(item.foodItem.id)
                            }
                          >
                            {item.quantity === 1 ? (
                              <Trash2 className="h-3.5 w-3.5 text-destructive" />
                            ) : (
                              <Minus className="h-3.5 w-3.5" />
                            )}
                          </Button>
                          <span className="w-6 text-center text-sm font-medium">
                            {item.quantity}
                          </span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7 rounded-lg"
                            onClick={() => onUpdateQuantity(item.foodItem.id, item.quantity + 1)}
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

            {/* Footer */}
            {items.length > 0 && (
              <div className="p-4 border-t border-border space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="text-foreground">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Service Fee</span>
                    <span className="text-foreground">${serviceFee.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-base font-semibold pt-2 border-t border-border">
                    <span className="text-foreground">Total</span>
                    <span className="text-primary">${total.toFixed(2)}</span>
                  </div>
                </div>
                
                <Button 
                  variant="warm" 
                  size="xl" 
                  className="w-full"
                  onClick={onCheckout}
                >
                  Checkout • ${total.toFixed(2)}
                </Button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartSheet;
