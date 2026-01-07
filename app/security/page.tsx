"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useClerk } from "@clerk/nextjs";
import {
  Shield,
  ChevronLeft,
  Lock,
  Key,
  AlertTriangle,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const Security = () => {
  const { user, signOut } = useAuth();
  const { openUserProfile } = useClerk();
  const router = useRouter();
  const [showDeleteAccount, setShowDeleteAccount] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push("/");
      return;
    }
  }, [user, router]);

  const handleChangePassword = () => {
    // Open Clerk's user profile modal for password management
    openUserProfile();
  };

  const handleDeleteAccount = async () => {
    setLoading(true);
    try {
      // Sign out and show message
      await signOut();
      toast.success("Account deletion requested. Please contact support.");
      router.push("/");
    } catch (error) {
      toast.error("Failed to process request");
    }
    setLoading(false);
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-card/80 backdrop-blur-md border-b border-border">
        <div className="container flex items-center h-16 px-4 md:px-6">
          <Button variant="ghost" size="icon" onClick={() => router.push("/profile")}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h1 className="ml-3 text-lg font-semibold text-foreground">Security</h1>
        </div>
      </header>

      <main className="container px-4 md:px-6 py-6 max-w-2xl">
        {/* Security Overview */}
        <div className="bg-card rounded-2xl border border-border p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground">
                Account Security
              </h2>
              <p className="text-sm text-muted-foreground">
                Manage your account security settings
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Change Password */}
            <div className="p-4 rounded-xl bg-muted/30 border border-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-background flex items-center justify-center">
                    <Key className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Password</p>
                    <p className="text-sm text-muted-foreground">
                      Change your account password
                    </p>
                  </div>
                </div>
                <Button variant="outline" onClick={handleChangePassword}>
                  Change
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-card rounded-2xl border border-destructive/30 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground">
                Danger Zone
              </h2>
              <p className="text-sm text-muted-foreground">
                Irreversible account actions
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-destructive/5 border border-destructive/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Delete Account</p>
                <p className="text-sm text-muted-foreground">
                  Permanently delete your account and all data
                </p>
              </div>
              <Button
                variant="destructive"
                onClick={() => setShowDeleteAccount(true)}
              >
                Delete Account
              </Button>
            </div>
          </div>
        </div>
      </main>

      {/* Delete Account Dialog */}
      <Dialog open={showDeleteAccount} onOpenChange={setShowDeleteAccount}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Account</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete your account? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteAccount(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteAccount} disabled={loading}>
              {loading ? "Deleting..." : "Delete Account"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Security;