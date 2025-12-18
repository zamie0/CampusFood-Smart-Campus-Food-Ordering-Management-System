import { motion } from "framer-motion";
import { Sparkles, Clock, ChefHat } from "lucide-react";
import { Button } from "@/components/ui/button";

interface WelcomeHeroProps {
  userName: string;
  activeOrders: number;
}

const WelcomeHero = ({ userName, activeOrders }: WelcomeHeroProps) => {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/10 via-primary/5 to-accent/10 p-6 md:p-8"
    >
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
      
      <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
            <Sparkles className="h-3.5 w-3.5" />
            Today's specials are live!
          </div>
          
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            Welcome back, <span className="text-primary">{userName}</span>! 👋
          </h1>
          
          <p className="text-muted-foreground max-w-md">
            Check out today's specials and order ahead to skip the queue. Your favorite campus meals are just a tap away.
          </p>

          <div className="flex flex-wrap gap-3 pt-2">
            <Button variant="warm" size="lg">
              <ChefHat className="h-4 w-4 mr-2" />
              Browse Menu
            </Button>
            {activeOrders > 0 && (
              <Button variant="outline" size="lg">
                <Clock className="h-4 w-4 mr-2" />
                Track {activeOrders} Active Order{activeOrders > 1 ? 's' : ''}
              </Button>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="flex gap-4 md:gap-6">
          <div className="text-center p-4 rounded-2xl bg-card/60 backdrop-blur-sm border border-border/50">
            <p className="text-2xl md:text-3xl font-bold text-primary">12</p>
            <p className="text-xs text-muted-foreground">Orders This Month</p>
          </div>
          <div className="text-center p-4 rounded-2xl bg-card/60 backdrop-blur-sm border border-border/50">
            <p className="text-2xl md:text-3xl font-bold text-accent">$86</p>
            <p className="text-xs text-muted-foreground">Total Saved</p>
          </div>
        </div>
      </div>
    </motion.section>
  );
};

export default WelcomeHero;
