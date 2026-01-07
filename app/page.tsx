"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Utensils, Shield, ChefHat, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { SignedIn, SignedOut, SignInButton, SignUpButton, useUser } from "@clerk/nextjs";

const PortalAuth = () => {
  const router = useRouter();
  const { user, isLoaded } = useUser();

  useEffect(() => {
    if (isLoaded && user) {
      router.push("/home");
    }
  }, [user, isLoaded, router]);

  if (!isLoaded) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-background">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            repeat: Infinity,
            repeatType: "mirror",
            duration: 1.2,
          }}
          className="flex flex-col items-center gap-4 p-6 rounded-2xl bg-white/10 backdrop-blur-lg shadow-lg"
        >
          <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center animate-bounce">
            <Utensils className="w-8 h-8 text-white" />
          </div>
          <span className="text-white/80 text-lg font-medium animate-pulse">
            Loading...
          </span>
        </motion.div>
      </main>
    );
  }

  return (
    <main className="min-h-screen grid grid-cols-1 md:grid-cols-2">
      {/* LEFT — INFO */}
      <div className="hidden md:relative md:flex flex-col justify-between p-12 overflow-hidden
        bg-gradient-to-br from-primary/90 via-primary/80 to-primary/70 text-primary-foreground">

        {/* Background glows */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-fade-slow" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-2xl animate-fade-slow delay-200" />
        <div className="absolute top-20 right-0 w-72 h-72 bg-white/5 rounded-full blur-2xl animate-fade-slow delay-400" />

        {/* Hero Content */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10"
        >
          {/* Logo */}
          <div className="flex items-center gap-4 mb-10">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center shadow-lg animate-bounce-slow">
              <Utensils className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight">
                Campus<span className="opacity-90">Food</span>
              </h1>
              <p className="text-xs text-white/70 mt-1">Smart campus dining</p>
            </div>
          </div>

          {/* Headline */}
          <h2 className="text-5xl font-extrabold leading-tight tracking-tight text-white">
            Order smarter.<br />
            <span className="text-white/90">Eat faster.</span>
          </h2>

          <p className="mt-5 text-white/80 max-w-lg text-lg leading-relaxed">
            Skip queues, order ahead, and manage campus food effortlessly
            designed for students, vendors, and admins.
          </p>
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="relative z-10 mt-8 grid grid-cols-1 gap-4"
        >
          <GlassFeature icon={Clock} text="Fast ordering" delay={0} />
          <GlassFeature icon={Utensils} text="Campus vendors" delay={100} />
          <GlassFeature icon={Shield} text="Secure access" delay={200} />
        </motion.div>

        {/* Footer */}
        <p className="relative z-10 text-xs text-white/60 mt-8">
          © 2025 CampusFood
        </p>
      </div>

      {/* RIGHT — AUTH */}
      <div className="flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-background border border-border rounded-2xl shadow-lg p-8 space-y-6"
        >
          <SignedOut>
            <div>
              <h2 className="text-2xl font-bold">Welcome</h2>
              <p className="text-muted-foreground">
                Sign in or create an account to continue
              </p>
            </div>

            <div className="space-y-4">
              <SignInButton mode="modal">
                <Button className="w-full h-12 text-base">
                  Log In
                </Button>
              </SignInButton>

              <SignUpButton mode="modal">
                <Button variant="outline" className="w-full h-12 text-base">
                  Register
                </Button>
              </SignUpButton>
            </div>
          </SignedOut>

          <SignedIn>
            <div className="text-center">
              <h2 className="text-xl font-bold">Welcome back!</h2>
              <p className="text-muted-foreground">Redirecting...</p>
            </div>
          </SignedIn>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Portal access
              </span>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1 gap-2"
              onClick={() => router.push("/portal/admin")}
            >
              <Shield className="w-4 h-4" />
              Admin
            </Button>
            <Button
              variant="outline"
              className="flex-1 gap-2"
              onClick={() => router.push("/portal/vendor")}
            >
              <ChefHat className="w-4 h-4" />
              Vendor
            </Button>
          </div>
        </motion.div>
      </div>
    </main>
  );
};

{/* GlassFeature Component */}
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

const FeatureCard = ({
  icon: Icon,
  title,
  text,
}: {
  icon: any;
  title: string;
  text: string;
}) => (
  <div className="flex items-center gap-4 rounded-xl bg-white/10 backdrop-blur
    px-4 py-3 shadow-sm hover:bg-white/15 transition">
    <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
      <Icon className="w-5 h-5" />
    </div>
    <div>
      <p className="font-semibold leading-none">{title}</p>
      <p className="text-sm text-white/70">{text}</p>
    </div>
  </div>
);


export default PortalAuth;
