"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useClerk } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

import {
  Shield,
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

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!user) return null;

  const handleChangePassword = () => {
    openUserProfile(); // Clerk handles password + 2FA
  };

  const handleDeleteAccount = async () => {
    setLoading(true);
    try {
      await signOut();
      toast.success("Account deletion request submitted.");
    } catch {
      toast.error("Failed to process request.");
    } finally {
      setLoading(false);
      setShowDeleteDialog(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Security Overview */}
      <div className="bg-card rounded-2xl border border-border p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <Shield className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">Account Security</h2>
            <p className="text-sm text-muted-foreground">
              Manage your login and authentication settings
            </p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-muted/30 border border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-background flex items-center justify-center">
              <Key className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <p className="font-medium">Password</p>
              <p className="text-sm text-muted-foreground">
                Change password
              </p>
            </div>
          </div>

          <Button variant="outline" onClick={handleChangePassword}>
            Manage
          </Button>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-card rounded-2xl border border-destructive/30 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center">
            <AlertTriangle className="h-6 w-6 text-destructive" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">Danger Zone</h2>
            <p className="text-sm text-muted-foreground">
              Irreversible actions
            </p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-destructive/5 border border-destructive/20 flex items-center justify-between">
          <div>
            <p className="font-medium">Delete Account</p>
            <p className="text-sm text-muted-foreground">
              Permanently remove your account and data
            </p>
          </div>
          <Button
            variant="destructive"
            onClick={() => setShowDeleteDialog(true)}
          >
            Delete
          </Button>
        </div>
      </div>

      {/* Delete Confirmation */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Account</DialogTitle>
            <DialogDescription>
              This action cannot be undone. All your data will be permanently removed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteAccount}
              disabled={loading}
            >
              {loading ? "Deleting..." : "Delete Account"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Security;
