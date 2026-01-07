"use client";

import { FC } from "react";
import { Shield } from "lucide-react";

const Security: FC = () => {
  return (
    <div className="bg-card rounded-2xl border border-border p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Shield className="h-5 w-5 text-primary" />
        </div>
        <h3 className="text-lg font-semibold text-foreground">Security</h3>
      </div>
      <p className="text-sm text-muted-foreground">Manage your security settings on the dedicated page.</p>
    </div>
  );
};

export default Security;
