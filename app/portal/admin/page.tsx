"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Eye,
  EyeOff,
  Shield,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { motion } from "framer-motion";

const AdminPortalAuth = () => {
  const router = useRouter();
  const [adminUser, setAdminUser] = useState("");
  const [adminPass, setAdminPass] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [remember, setRemember] = useState(false);

  // ✅ Check if admin was remembered or already logged in
  useEffect(() => {
    const savedUser = localStorage.getItem("adminRememberUser");
    const savedLoggedIn = localStorage.getItem("adminLoggedIn");

    if (savedUser) setAdminUser(savedUser); // prefill username
    if (savedLoggedIn === "true") {
      toast.success("Welcome back, Admin!");
      router.push("/admin"); // auto-redirect
    }
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/admins/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: adminUser.trim(), password: adminPass }),
      });

      const data = await response.json();

      if (response.ok) {
        if (remember) {
          localStorage.setItem("adminRememberUser", adminUser);
          localStorage.setItem("adminLoggedIn", "true"); // persist login
        } else {
          localStorage.removeItem("adminRememberUser");
          localStorage.setItem("adminLoggedIn", "true"); // session only
        }
        localStorage.setItem("adminToken", data.token);
        localStorage.setItem("currentAdmin", JSON.stringify(data.admin));
        toast.success("Admin login successful!");
        setTimeout(() => router.push("/admin"), 500);
      } else {
        toast.error(data.error || "Invalid admin credentials");
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen grid grid-cols-1 md:grid-cols-2 bg-gradient-to-br from-background via-background to-primary/10">
      {/* LEFT — SECURITY INFO */}
      <div className="hidden md:flex flex-col justify-between p-12 bg-gradient-to-br from-primary/90 to-primary/80 text-primary-foreground relative overflow-hidden">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-fade-slow" />
        <div className="absolute top-12 right-0 w-72 h-72 bg-white/5 rounded-full blur-2xl animate-fade-slow delay-200" />
        <div className="absolute bottom-0 -right-24 w-80 h-80 bg-white/5 rounded-full blur-2xl animate-fade-slow delay-400" />

        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10"
        >
          <div className="flex items-center gap-4 mb-8">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center shadow-lg animate-bounce-slow">
              <Shield className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight">
              Admin Access
            </h1>
          </div>

          <h2 className="text-5xl font-extrabold leading-tight tracking-tight text-white">
            Secure<br />Administration Portal
          </h2>

          <p className="mt-5 text-white/80 max-w-lg text-lg leading-relaxed">
            Restricted access for authorized administrators only. Manage vendors, orders,
            and system settings with maximum security.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="relative z-10 mt-8 grid grid-cols-1 gap-4"
        >
          <GlassFeature icon={Shield} text="Role-based authentication" delay={0} />
          <GlassFeature icon={Shield} text="Protected admin dashboard" delay={100} />
          <GlassFeature icon={Shield} text="Audit-ready access control" delay={200} />
        </motion.div>

        <p className="relative z-10 text-xs text-white/60 mt-8">
          © 2025 CampusFood
        </p>
      </div>

      {/* RIGHT — AUTH */}
      <div className="flex flex-col min-h-screen">
        <div className="p-6">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => router.push("/")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center px-6 pb-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md"
          >
            <div className="bg-card/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-border overflow-hidden">
              {/* Card Header */}
              <div className="p-6 border-b border-border bg-muted/40">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-primary/15 flex items-center justify-center">
                    <Shield className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">
                      Administrator Login
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Authorized personnel only
                    </p>
                  </div>
                </div>
              </div>

            <form onSubmit={handleLogin} className="p-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="admin-user">Email</Label>
                <Input
                  id="admin-user"
                  placeholder="Enter email"
                  value={adminUser}
                  onChange={(e) => setAdminUser(e.target.value)}
                  autoComplete="email"
                  className="h-11"
                />
              </div>

                <div className="space-y-2">
                  <Label htmlFor="admin-pass">Password</Label>
                  <div className="relative">
                    <Input
                      id="admin-pass"
                      type={showPass ? "text" : "password"}
                      placeholder="••••••••"
                      value={adminPass}
                      onChange={(e) => setAdminPass(e.target.value)}
                      autoComplete="current-password"
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

                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={remember}
                      onChange={(e) => setRemember(e.target.checked)}
                      className="rounded border-border"
                    />
                    <span className="text-muted-foreground">Remember me</span>
                  </label>
                </div>

                <Button
                  type="submit"
                  className="w-full h-11 gap-2"
                  disabled={loading}
                >
                  {loading && <Shield className="w-4 h-4 animate-spin" />}
                  {loading ? "Verifying..." : "Secure Sign In"}
                </Button>

              <p className="text-center text-xs text-muted-foreground">
                Demo: email "admin@campusfood.com" / password "admin123"
              </p>
            </form>
          </div>
        </motion.div>
      </div>
    </main>
  );
};

// GlassFeature Component
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

export default AdminPortalAuth;
