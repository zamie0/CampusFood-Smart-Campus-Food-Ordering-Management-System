import { motion } from "framer-motion";
import { Sparkles} from "lucide-react";

interface WelcomeHeroProps {
  fullName: string;
  activeOrders: number;
  ordersThisMonth: number;
  totalSaved: number;
  onTrackOrders?: () => void;
}

const WelcomeHero = ({ fullName, ordersThisMonth }: WelcomeHeroProps) => {
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
            Welcome back, <span className="text-primary">{fullName}</span>! 👋
          </h1>
          
          <p className="text-muted-foreground max-w-md">
            Check out today's specials and order ahead to skip the queue. Your favorite campus meals are just a tap away.
          </p>
        </div>
      </div>
    </motion.section>
  );
};

export default WelcomeHero;
