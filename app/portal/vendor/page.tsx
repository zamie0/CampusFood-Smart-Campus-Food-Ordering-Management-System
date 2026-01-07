"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Eye,
  EyeOff,
  ChefHat,
  Utensils,
  ArrowLeft,
  Store,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { motion } from "framer-motion";

type VendorTab = "login" | "register";

const VendorPortalAuth = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<VendorTab>("login");

  // Login
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  // Register
  const [regData, setRegData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      toast.error("Please enter email and password");
      return;
    }

    setLoading(true);

    const approvedVendors = JSON.parse(
      localStorage.getItem("approvedVendors") || "[]"
    );
    const vendor = approvedVendors.find(
      (v: any) => v.email === email.trim()
    );

    setTimeout(() => {
      if (vendor) {
        localStorage.setItem("vendorLoggedIn", "true");
        localStorage.setItem("currentVendor", JSON.stringify(vendor));
        toast.success("Vendor login successful!");
        setTimeout(() => router.push("/vendor"), 600);
      } else {
        const requests = JSON.parse(
          localStorage.getItem("vendorRequests") || "[]"
        );
        const pending = requests.find(
          (r: any) => r.email === email.trim() && r.status === "pending"
        );

        if (pending) {
          toast.error("Your registration is pending admin approval");
        } else {
          toast.error("Invalid credentials or not registered");
        }
        setLoading(false);
      }
    }, 600);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regData.name || !regData.email || !regData.password) {
      toast.error("Please fill all required fields");
      return;
    }

    const requests = JSON.parse(
      localStorage.getItem("vendorRequests") || "[]"
    );

    if (requests.find((r: any) => r.email === regData.email)) {
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

    localStorage.setItem(
      "vendorRequests",
      JSON.stringify([newRequest, ...requests])
    );

    toast.success("Registration submitted for admin approval");
    setActiveTab("login");
    setRegData({ name: "", email: "", password: "", phone: "" });
  };

  return (
    <main className="min-h-screen grid grid-cols-1 md:grid-cols-2 bg-gradient-to-br from-background via-background to-primary/10">
      {/* LEFT — VENDOR INFO */}
      <div className="hidden md:flex flex-col justify-between p-12 bg-gradient-to-br from-primary/90 to-primary/80 text-primary-foreground relative overflow-hidden">
        {/* Layered Glows */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-fade-slow" />
        <div className="absolute top-10 right-0 w-64 h-64 bg-white/5 rounded-full blur-2xl animate-fade-slow delay-200" />
        <div className="absolute bottom-0 -right-24 w-80 h-80 bg-white/5 rounded-full blur-2xl animate-fade-slow delay-400" />

        {/* Header + Hero Text */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10"
        >
          <div className="flex items-center gap-4 mb-8">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center shadow-lg animate-bounce-slow">
              <ChefHat className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight">
              Vendor Portal
            </h1>
          </div>

          <h2 className="text-5xl font-extrabold leading-tight tracking-tight text-white">
            Grow your<br />Campus Business
          </h2>

          <p className="mt-5 text-white/80 max-w-lg text-lg leading-relaxed">
            Manage menus, orders, and daily operations with ease designed exclusively
            for campus food vendors.
          </p>
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="relative z-10 mt-8 grid grid-cols-1 gap-4"
        >
          <GlassFeature icon={Store} text="Manage your storefront" delay={0} />
          <GlassFeature icon={Utensils} text="Handle incoming orders" delay={100} />
          <GlassFeature icon={CheckCircle} text="Admin-approved vendors only" delay={200} />
        </motion.div>

        {/* Footer */}
        <p className="relative z-10 text-xs text-white/60 mt-8">
          © 2025 CampusFood
        </p>
      </div>

      {/* RIGHT — AUTH */}
      <div className="flex flex-col min-h-screen">
        {/* Header */}
        <div className="p-6">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => router.push("/")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Card */}
        <div className="flex-1 flex items-center justify-center px-6 pb-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md"
          >
            <div className="bg-card/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-border overflow-hidden">
              {/* Header */}
              <div className="p-6 border-b border-border bg-muted/40">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-primary/15 flex items-center justify-center">
                    <ChefHat className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Vendor Access</h2>
                    <p className="text-sm text-muted-foreground">
                      {activeTab === "login"
                        ? "Sign in to manage your store"
                        : "Register your business"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-border">
                {["login", "register"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab as VendorTab)}
                    className={`flex-1 py-3 text-sm font-semibold transition ${
                      activeTab === tab
                        ? "bg-card border-b-2 border-primary"
                        : "bg-muted/30 text-muted-foreground hover:bg-muted/50"
                    }`}
                  >
                    {tab === "login" ? "Login" : "Register"}
                  </button>
                ))}
              </div>

              {/* Forms */}
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
                          {showPass ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className="w-full h-11 gap-2"
                      disabled={loading}
                    >
                      {loading && (
                        <ChefHat className="w-4 h-4 animate-spin" />
                      )}
                      {loading ? "Signing in..." : "Login"}
                    </Button>
                  </form>
                ) : (
                  <form onSubmit={handleRegister} className="space-y-3">
                    <FormInput
                      label="Business Name *"
                      value={regData.name}
                      onChange={(v) =>
                        setRegData({ ...regData, name: v })
                      }
                      placeholder="Your Store Name"
                    />
                    <FormInput
                      label="Email *"
                      type="email"
                      value={regData.email}
                      onChange={(v) =>
                        setRegData({ ...regData, email: v })
                      }
                      placeholder="contact@yourstore.com"
                    />
                    <FormInput
                      label="Phone"
                      value={regData.phone}
                      onChange={(v) =>
                        setRegData({ ...regData, phone: v })
                      }
                      placeholder="+60 12-345 6789"
                    />
                    <FormInput
                      label="Password *"
                      type="password"
                      value={regData.password}
                      onChange={(v) =>
                        setRegData({ ...regData, password: v })
                      }
                      placeholder="Create a password"
                    />

                    <Button type="submit" className="w-full h-10">
                      Register
                    </Button>

                    <p className="text-xs text-muted-foreground text-center">
                      Registration requires admin approval
                    </p>
                  </form>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </main>
  );
};

const VendorFeature = ({
  icon: Icon,
  text,
}: {
  icon: any;
  text: string;
}) => (
  <div className="flex items-center gap-3 bg-white/10 backdrop-blur rounded-xl px-4 py-3">
    <Icon className="w-4 h-4" />
    <span className="text-sm">{text}</span>
  </div>
);

{/* Components */}
const GlassFeature = ({
  icon: Icon,
  text,
  delay = 0,
}: {
  icon: any;
  text: string;
  delay?: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: delay / 1000, duration: 0.6 }}
    className="flex items-center gap-4 bg-white/10 backdrop-blur-lg rounded-xl px-5 py-3 shadow-md hover:bg-white/20 transition-all cursor-default"
  >
    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shadow-inner animate-bounce-slow">
      <Icon className="w-5 h-5 text-white" />
    </div>
    <span className="text-white font-medium">{text}</span>
  </motion.div>
);

const FormInput = ({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  type?: string;
}) => (
  <div className="space-y-1">
    <Label className="text-sm">{label}</Label>
    <Input
      type={type}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className="h-10"
    />
  </div>
);

export default VendorPortalAuth;
