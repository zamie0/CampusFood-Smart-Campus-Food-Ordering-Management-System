"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Utensils, Shield, ChefHat } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { SignedIn, SignedOut, SignInButton, SignUpButton, useUser } from "@clerk/nextjs";

const PortalAuth = () => {
  const router = useRouter();
  const { user, isLoaded } = useUser();

  // Redirect if already logged in
  useEffect(() => {
    if (isLoaded && user) {
      router.push("/home");
    }
  }, [user, isLoaded, router]);

  if (!isLoaded) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <span className="text-primary font-bold text-lg">CF</span>
          </div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </main>
    );
  }

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
          <SignedOut>
            <div>
              <h2 className="text-2xl font-bold text-foreground">Welcome to CampusFood</h2>
              <p className="text-muted-foreground mt-1">Sign in or create an account to start ordering</p>
            </div>

            <div className="space-y-4">
              <SignInButton mode="modal">
                <Button className="w-full h-12 text-base font-semibold">
                  Log In
                </Button>
              </SignInButton>

              <SignUpButton mode="modal">
                <Button variant="outline" className="w-full h-12 text-base font-semibold">
                  Register
                </Button>
              </SignUpButton>
            </div>
          </SignedOut>

          <SignedIn>
            <div className="text-center">
              <h2 className="text-2xl font-bold text-foreground">Welcome back!</h2>
              <p className="text-muted-foreground mt-1">Redirecting to dashboard...</p>
            </div>
          </SignedIn>

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
              onClick={() => router.push("/portal/admin")}
            >
              <Shield className="w-4 h-4" />
              Admin
            </Button>
            <Button
              variant="outline"
              className="flex-1 h-12 gap-2"
              onClick={() => router.push("/portal/vendor")}
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
