import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Utensils, Shield, ChefHat, Mail, Lock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
import { SignedIn, SignedOut, useClerk } from "@clerk/nextjs";

type ViewMode = "login" | "register";

const PortalAuth = () => {
  const navigate = useNavigate();
  const { signIn, signUp, user } = useAuth();
  const [viewMode, setViewMode] = useState<ViewMode>("login");
  
  // Form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Redirect if already logged in
  if (user) {
    navigate("/home");
    return null;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      toast.error("Please enter email and password");
      return;
    }
    
    setLoading(true);
    const { error } = await signIn(email, password);
    
    if (error) {
      toast.error(error.message || "Login failed");
      setLoading(false);
    } else {
      toast.success("Welcome back!");
      navigate("/home");
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password || !fullName.trim()) {
      toast.error("Please fill all fields");
      return;
    }
    
    setLoading(true);
    const { error } = await signUp(email, password, fullName);
    
    if (error) {
      toast.error(error.message || "Registration failed");
      setLoading(false);
    } else {
      toast.success("Account created! Welcome to CampusFood!");
      navigate("/home");
    }
  };

  return (
    <main className="min-h-screen bg-background flex flex-col px-6 py-8">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3"
      >
        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
          <span className="text-primary font-bold text-lg">CF</span>
        </div>
        <div>
          <h1 className="text-xl font-bold text-foreground">
            Campus<span className="text-primary">Food</span>
          </h1>
          <p className="text-muted-foreground text-sm">Order ahead, skip the queue</p>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col justify-center max-w-md w-full mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-6"
        >
          {viewMode === "login" ? (
            <>
              <div>
                <h2 className="text-2xl font-bold text-foreground">Welcome back</h2>
                <p className="text-muted-foreground mt-1">Sign in to continue ordering</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@university.edu"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-12 pl-11"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-12 pl-11 pr-11"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-12 text-base font-semibold gap-2" 
                  disabled={loading}
                >
                  {loading ? "Signing in..." : "Sign In"}
                  {!loading && <ArrowRight className="w-4 h-4" />}
                </Button>
              </form>

              <p className="text-center text-sm text-muted-foreground">
                Don't have an account?{" "}
                <button
                  onClick={() => setViewMode("register")}
                  className="text-primary font-medium hover:underline"
                >
                  Sign up
                </button>
              </p>
            </>
          ) : (
            <>
              <div>
                <h2 className="text-2xl font-bold text-foreground">Create account</h2>
                <p className="text-muted-foreground mt-1">Join CampusFood and start ordering</p>
              </div>

              <form onSubmit={handleRegister} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="John Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="h-12"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reg-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="reg-email"
                      type="email"
                      placeholder="you@university.edu"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-12 pl-11"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reg-password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="reg-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-12 pl-11 pr-11"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-12 text-base font-semibold gap-2" 
                  disabled={loading}
                >
                  {loading ? "Creating account..." : "Sign Up"}
                  {!loading && <ArrowRight className="w-4 h-4" />}
                </Button>
              </form>

              <p className="text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <button
                  onClick={() => setViewMode("login")}
                  className="text-primary font-medium hover:underline"
                >
                  Sign in
                </button>
              </p>
            </>
          )}

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or continue as</span>
            </div>
          </div>

          {/* Admin/Vendor Buttons */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1 h-12 gap-2"
              onClick={() => navigate("/portal/admin")}
            >
              <Shield className="w-4 h-4" />
              Admin
            </Button>
            <Button
              variant="outline"
              className="flex-1 h-12 gap-2"
              onClick={() => navigate("/portal/vendor")}
            >
              <ChefHat className="w-4 h-4" />
              Vendor
            </Button>
          </div>
        </motion.div>
      </div>

      {/* Footer */}
      <p className="text-center text-xs text-muted-foreground mt-8">
        © 2025 CampusFood • All rights reserved
      </p>
    </main>
  );
};

export default PortalAuth;
