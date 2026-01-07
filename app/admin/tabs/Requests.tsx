"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Store, XCircle } from "lucide-react";

interface VendorRequest {
  id: string;
  name: string;
  email: string;
  phone?: string;
  description?: string;
  status: "pending" | "approved" | "rejected";
  submittedAt: number;
}

export default function RequestsContent({
  requests,
  onApprove,
  onReject,
}: {
  requests: VendorRequest[];
  onApprove: (request: VendorRequest) => void;
  onReject: (request: VendorRequest) => void;
}) {
  const pending = requests.filter((r) => r.status === "pending");
  const processed = requests.filter((r) => r.status !== "pending");

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">Pending Requests ({pending.length})</h3>
        {pending.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <CheckCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No pending requests</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {pending.map((request) => (
              <Card key={request.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Store className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-foreground">{request.name}</h4>
                          <p className="text-sm text-muted-foreground">{request.email}</p>
                        </div>
                      </div>
                      {request.phone && (
                        <p className="text-sm text-muted-foreground">Phone: {request.phone}</p>
                      )}
                      {request.description && (
                        <p className="text-sm text-muted-foreground">{request.description}</p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Submitted: {new Date(request.submittedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="default" size="sm" onClick={() => onApprove(request)}>
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Approve
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => onReject(request)}>
                        <XCircle className="w-4 h-4 mr-1" />
                        Reject
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {processed.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-4">Processed Requests</h3>
          <div className="grid gap-4">
            {processed.map((request) => (
              <Card key={request.id} className="opacity-60">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Store className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <h4 className="font-medium text-foreground">{request.name}</h4>
                        <p className="text-sm text-muted-foreground">{request.email}</p>
                      </div>
                    </div>
                    <Badge variant={request.status === "approved" ? "default" : "destructive"}>
                      {request.status}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
