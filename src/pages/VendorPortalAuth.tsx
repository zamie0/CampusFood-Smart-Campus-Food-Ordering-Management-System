import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, ChefHat, Utensils, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { motion } from "framer-motion";

type VendorTab = "login" | "register";

const VendorPortalAuth = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<VendorTab>("login");
  
  // Login state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  // Register state
  const [regData, setRegData] = useState({
    name: "",
    email: "",
    password: "",
    phone: ""
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      toast.error("Please enter email and password");
      return;
    }
    
    setLoading(true);
    
    // Check if vendor is approved
    const approvedVendors = JSON.parse(localStorage.getItem("approvedVendors") || "[]");
    const vendor = approvedVendors.find((v: any) => v.email === email.trim());
    
    setTimeout(() => {
      if (vendor) {
        localStorage.setItem("vendorLoggedIn", "true");
        localStorage.setItem("currentVendor", JSON.stringify(vendor));
        toast.success("Vendor login successful!");
        setTimeout(() => navigate("/vendor"), 500);
      } else {
        // Check if pending
        const requests = JSON.parse(localStorage.getItem("vendorRequests") || "[]");
        const pending = requests.find((r: any) => r.email === email.trim() && r.status === "pending");
        
        if (pending) {
          toast.error("Your registration is still pending admin approval");
        } else {
          toast.error("Invalid credentials or not registered");
        }
        setLoading(false);
      }
    }, 500);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regData.name || !regData.email || !regData.password) {
      toast.error("Please fill all required fields");
      return;
    }
    
    const requests = JSON.parse(localStorage.getItem("vendorRequests") || "[]");
    
    // Check if already registered
    const existing = requests.find((r: any) => r.email === regData.email);
    if (existing) {
      toast.error("This email is already registered");
      return;
    }
    
    const newRequest = {
      id: `vr${Date.now()}`,
      name: regData.name,
      email: regData.email,
      phone: regData.phone,
      status: "pending",
      submittedAt: Date.now(),
    };
    localStorage.setItem("vendorRequests", JSON.stringify([newRequest, ...requests]));
    
    toast.success("Registration submitted! Awaiting admin approval.");
    setActiveTab("login");
    setRegData({ name: "", email: "", password: "", phone: "" });
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex flex-col">
      {/* Header */}
      <div className="p-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="w-10 h-10 rounded-xl bg-primary shadow-lg flex items-center justify-center">
            <Utensils className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground">
              Campus<span className="text-primary">Food</span>
            </h1>
            <p className="text-muted-foreground text-xs">Vendor Portal</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 pb-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="bg-card rounded-2xl shadow-xl border border-border overflow-hidden">
            <div className="p-6 border-b border-border bg-muted/30">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <ChefHat className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground">Vendor Portal</h2>
                  <p className="text-sm text-muted-foreground">
                    {activeTab === "login" ? "Sign in to manage your store" : "Register your business"}
                  </p>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-border">
              <button
                onClick={() => setActiveTab("login")}
                className={`flex-1 py-3 text-sm font-semibold transition-all ${
                  activeTab === "login"
                    ? "bg-card text-foreground border-b-2 border-primary"
                    : "bg-muted/30 text-muted-foreground hover:bg-muted/50"
                }`}
              >
                Login
              </button>
              <button
                onClick={() => setActiveTab("register")}
                className={`flex-1 py-3 text-sm font-semibold transition-all ${
                  activeTab === "register"
                    ? "bg-card text-foreground border-b-2 border-primary"
                    : "bg-muted/30 text-muted-foreground hover:bg-muted/50"
                }`}
              >
                Register
              </button>
            </div>

            <div className="p-6">
              {activeTab === "login" ? (
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input
                      type="email"
                      placeholder="vendor@campus.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Password</Label>
                    <div className="relative">
                      <Input
                        type={showPass ? "text" : "password"}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="h-11 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPass(!showPass)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <Button type="submit" className="w-full h-11" disabled={loading}>
                    {loading ? "Signing in..." : "Login"}
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleRegister} className="space-y-3">
                  <div className="space-y-1">
                    <Label className="text-sm">Business Name *</Label>
                    <Input
                      placeholder="Your Store Name"
                      value={regData.name}
                      onChange={(e) => setRegData({ ...regData, name: e.target.value })}
                      className="h-10"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-sm">Email *</Label>
                    <Input
                      type="email"
                      placeholder="contact@yourstore.com"
                      value={regData.email}
                      onChange={(e) => setRegData({ ...regData, email: e.target.value })}
                      className="h-10"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-sm">Phone</Label>
                    <Input
                      type="tel"
                      placeholder="+60 12-345 6789"
                      value={regData.phone}
                      onChange={(e) => setRegData({ ...regData, phone: e.target.value })}
                      className="h-10"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-sm">Password *</Label>
                    <Input
                      type="password"
                      placeholder="Create a password"
                      value={regData.password}
                      onChange={(e) => setRegData({ ...regData, password: e.target.value })}
                      className="h-10"
                    />
                  </div>
                  <Button type="submit" className="w-full h-10 mt-2">
                    Register
                  </Button>
                  <p className="text-xs text-muted-foreground text-center">
                    Registration requires admin approval.
                  </p>
                </form>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </main>
  );
};

export default VendorPortalAuth;
