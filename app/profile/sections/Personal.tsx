"use client";

import { User, Mail, Shield, Key, AlertTriangle } from "lucide-react";
import { useClerk } from "@clerk/nextjs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

export interface PersonalProps {
  fullName: string;
  email: string;
}

export default function Personal({ fullName, email }: PersonalProps) {
  const { user} = useAuth();
  const { openUserProfile } = useClerk();

  if (!user) return null;

  const handleChangePassword = () => {
    openUserProfile(); 
  };

  return (
    <div className="space-y-6">
      {/* Personal Info */}
      <div className="bg-card rounded-2xl border border-border p-6">
        <h3 className="text-lg font-semibold mb-6">Personal Information</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="fullName"
                value={fullName}
                disabled
                className="pl-10 bg-muted"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                value={email}
                disabled
                className="pl-10 bg-muted"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Security */}
      <div className="bg-card rounded-2xl border border-border p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <Shield className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">Account Security</h2>
            <p className="text-sm text-muted-foreground">
              Manage authentication and password
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-background flex items-center justify-center">
              <Key className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <p className="font-medium">Password or Delete</p>
              <p className="text-sm text-muted-foreground">Change password or delete account</p>
            </div>
          </div>

          <Button variant="outline" onClick={handleChangePassword}>
            Manage
          </Button>
        </div>
      </div>
    </div>
  );
}
