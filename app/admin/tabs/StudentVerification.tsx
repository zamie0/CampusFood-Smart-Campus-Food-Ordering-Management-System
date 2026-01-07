"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, CheckCircle2, GraduationCap, XCircle } from "lucide-react";

export interface StudentVerificationItem {
  id: string;
  user_id: string;
  full_name?: string;
  email?: string;
  student_id?: string;
  student_id_verified?: "pending" | "verified" | "declined";
  created_at?: string | number | Date;
}

export default function StudentVerificationContent({ 
  verifications, 
  onVerify, 
  onDecline,
  searchQuery 
}: { 
  verifications: StudentVerificationItem[];
  onVerify: (profileId: string, userId: string) => void;
  onDecline: (profileId: string, userId: string) => void;
  searchQuery: string;
}) {
  const filtered = verifications.filter((v) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      v.full_name?.toLowerCase().includes(query) ||
      v.email?.toLowerCase().includes(query) ||
      v.student_id?.toLowerCase().includes(query)
    );
  });

  const pending = filtered.filter((v) => v.student_id_verified === "pending");
  const verified = filtered.filter((v) => v.student_id_verified === "verified");
  const declined = filtered.filter((v) => v.student_id_verified === "declined");

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-foreground">{pending.length}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-warning" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Verified</p>
                <p className="text-2xl font-bold text-foreground">{verified.length}</p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-success" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Declined</p>
                <p className="text-2xl font-bold text-foreground">{declined.length}</p>
              </div>
              <XCircle className="w-8 h-8 text-destructive" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Student ID Verification Requests</CardTitle>
        </CardHeader>
        <CardContent>
          {filtered.length === 0 ? (
            <div className="text-center py-12">
              <GraduationCap className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No student verification requests</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filtered.map((verification) => (
                <Card key={verification.id} className="border-l-4 border-l-primary">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <GraduationCap className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-semibold text-foreground">
                              {verification.full_name || "Unknown"}
                            </p>
                            <p className="text-sm text-muted-foreground">{verification.email}</p>
                          </div>
                        </div>
                        <div className="ml-13 space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-foreground">Student ID:</span>
                            <span className="text-sm text-muted-foreground">{verification.student_id}</span>
                          </div>
                          <Badge
                            variant={
                              verification.student_id_verified === "verified"
                                ? "success"
                                : verification.student_id_verified === "declined"
                                ? "destructive"
                                : "warning"
                            }
                            className="mt-2"
                          >
                            {verification.student_id_verified === "verified"
                              ? "Verified"
                              : verification.student_id_verified === "declined"
                              ? "Declined"
                              : "Pending"}
                          </Badge>
                        </div>
                      </div>
                      {verification.student_id_verified === "pending" && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => onVerify(verification.id, verification.user_id)}
                            className="gap-2"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            Verify
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => onDecline(verification.id, verification.user_id)}
                            className="gap-2"
                          >
                            <XCircle className="w-4 h-4" />
                            Decline
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
