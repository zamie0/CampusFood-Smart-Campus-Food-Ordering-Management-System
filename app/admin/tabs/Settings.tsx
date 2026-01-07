"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SettingsContent() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Platform Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
          <div>
            <p className="font-medium text-foreground">Commission Rate</p>
            <p className="text-sm text-muted-foreground">Platform fee per order</p>
          </div>
          <span className="font-semibold text-foreground">10%</span>
        </div>
        <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
          <div>
            <p className="font-medium text-foreground">Auto-approve Vendors</p>
            <p className="text-sm text-muted-foreground">Skip manual approval</p>
          </div>
          <Badge variant="secondary">Disabled</Badge>
        </div>
        <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
          <div>
            <p className="font-medium text-foreground">Maintenance Mode</p>
            <p className="text-sm text-muted-foreground">Disable customer access</p>
          </div>
          <Badge variant="secondary">Off</Badge>
        </div>
      </CardContent>
    </Card>
  );
}
