"use client";

import { useState, useEffect, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Shield, ArrowLeft } from "lucide-react";
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

  const ADMIN_EMAIL = "admin@campusfood.com";
  const ADMIN_PASSWORD = "admin123"; 

  useEffect(() => {
    if (typeof window === "undefined") return;

    const token = localStorage.getItem("adminToken");
    const savedUser = localStorage.getItem("adminRememberUser");

    if (savedUser) setAdminUser(savedUser);

    if (token) {
      router.replace("/admin"); 
    }
  }, [router]);

  const handleLogin = (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      // check credentials directly
      if (
        adminUser.trim().toLowerCase() === ADMIN_EMAIL &&
        adminPass === ADMIN_PASSWORD
      ) {
        // save localStorage
        localStorage.setItem("adminToken", "dummy-token");
        localStorage.setItem(
          "currentAdmin",
          JSON.stringify({ email: ADMIN_EMAIL, name: "CampusFood Admin", role: "superadmin" })
        );
        localStorage.setItem("adminLoggedIn", "true");

        if (remember) {
          localStorage.setItem("adminRememberUser", adminUser);
        } else {
          localStorage.removeItem("adminRememberUser");
        }

        toast.success("Admin login successful!");
        router.push("/admin");
      } else {
        toast.error("Invalid admin credentials");
      }

      setLoading(false);
    }, 500); // fake delay for UX
  };

  return (
    <main className="min-h-screen grid grid-cols-1 md:grid-cols-2 bg-gradient-to-br from-background via-background to-primary/10">
      {/* LEFT PANEL */}
      <div className="hidden md:flex flex-col justify-between p-12 bg-gradient-to-br from-primary/90 to-primary/80 text-primary-foreground relative overflow-hidden">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 -right-24 w-80 h-80 bg-white/5 rounded-full blur-2xl" />

        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="flex items-center gap-4 mb-8">
            <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center">
              <Shield className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-3xl font-extrabold">Admin Access</h1>
          </div>

          <h2 className="text-5xl font-extrabold leading-tight">
            Secure<br />Administration Portal
          </h2>

          <p className="mt-5 text-white/80 max-w-lg text-lg">
            Restricted access for authorized administrators only.
          </p>
        </motion.div>

        <div className="mt-10 space-y-4">
          <GlassFeature icon={Shield} text="Role-based authentication" />
          <GlassFeature icon={Shield} text="Protected admin dashboard" />
          <GlassFeature icon={Shield} text="Audit-ready access control" />
        </div>

        <p className="text-xs text-white/60 mt-10">
          © 2025 CampusFood
        </p>
      </div>

      {/* RIGHT PANEL */}
      <div className="flex flex-col min-h-screen">
        <div className="p-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/")}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </div>

        <div className="flex-1 flex items-center justify-center px-6 pb-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md"
          >
            <div className="bg-card/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-border">
              <div className="p-6 border-b bg-muted/40">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-primary/15 flex items-center justify-center">
                    <Shield className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Administrator Login</h2>
                    <p className="text-sm text-muted-foreground">
                      Authorized personnel only
                    </p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleLogin} className="p-6 space-y-4">
                <div>
                  <Label>Email</Label>
                  <Input
                    value={adminUser}
                    onChange={(e) => setAdminUser(e.target.value)}
                    autoComplete="email"
                    required
                  />
                </div>

                <div>
                  <Label>Password</Label>
                  <div className="relative">
                    <Input
                      type={showPass ? "text" : "password"}
                      value={adminPass}
                      onChange={(e) => setAdminPass(e.target.value)}
                      required
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                    >
                      {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                  />
                  Remember me
                </label>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? "Verifying..." : "Secure Sign In"}
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  Demo: admin@campusfood.com / admin123
                </p>
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </main>
  );
};

/* ---------------- Glass Feature ---------------- */

const GlassFeature = ({
  icon: Icon,
  text,
}: {
  icon: React.ElementType;
  text: string;
}) => (
  <div className="flex items-center gap-4 bg-white/10 backdrop-blur-lg rounded-xl px-5 py-3">
    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
      <Icon className="w-5 h-5 text-white" />
    </div>
    <span className="text-white font-medium">{text}</span>
  </div>
);

export default AdminPortalAuth;
