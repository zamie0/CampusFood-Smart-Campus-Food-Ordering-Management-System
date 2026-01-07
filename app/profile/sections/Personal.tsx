"use client";

import { FC } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { User, Mail, GraduationCap, Camera, Save, CheckCircle2, XCircle, AlertCircle } from "lucide-react";

export type StudentVerification = "pending" | "verified" | "declined" | null;

export interface PersonalProps {
  avatarUrl?: string | null;
  fullName: string;
  email: string;
  studentId: string;
  studentVerification: StudentVerification;
  onChangeStudentId: (value: string) => void;
  saving: boolean;
  onSave: () => void;
}

const Personal: FC<PersonalProps> = ({
  avatarUrl,
  fullName,
  email,
  studentId,
  studentVerification,
  onChangeStudentId,
  saving,
  onSave,
}) => {
  return (
    <div className="bg-card rounded-2xl border border-border p-6">
      <h3 className="text-lg font-semibold text-foreground mb-6">Personal Information</h3>

      <div className="grid gap-6">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input id="fullName" value={fullName} disabled className="pl-10 bg-muted" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input id="email" value={email || ""} disabled className="pl-10 bg-muted" />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="studentId">Student ID</Label>
            {studentVerification && (
              <Badge
                variant={
                  studentVerification === "verified"
                    ? "success"
                    : studentVerification === "declined"
                    ? "destructive"
                    : "warning"
                }
                className="flex items-center gap-1.5"
              >
                {studentVerification === "verified" ? (
                  <>
                    <CheckCircle2 className="h-3 w-3" /> Verified
                  </>
                ) : studentVerification === "declined" ? (
                  <>
                    <XCircle className="h-3 w-3" /> Declined
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-3 w-3" /> Pending Verification
                  </>
                )}
              </Badge>
            )}
          </div>
          <div className="relative">
            <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="studentId"
              value={studentId}
              onChange={(e) => onChangeStudentId(e.target.value)}
              placeholder="e.g., STU2024001"
              className="pl-10"
              disabled={studentVerification === "verified"}
            />
          </div>
          {studentVerification === "pending" && (
            <p className="text-xs text-muted-foreground">
              Your Student ID is pending admin verification. You'll receive a 5% discount once verified.
            </p>
          )}
          {studentVerification === "verified" && (
            <p className="text-xs text-success flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" /> Verified! You'll receive a 5% discount on all orders.
            </p>
          )}
          {studentVerification === "declined" && (
            <p className="text-xs text-destructive">
              Your Student ID was declined. Please contact support or update your Student ID.
            </p>
          )}
        </div>

        <Button variant="warm" className="w-fit" onClick={onSave} disabled={saving}>
          <Save className="h-4 w-4 mr-2" />
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
};

export default Personal;
