"use client";

import { FC } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Bell, Save } from "lucide-react";

interface SettingsProps {
  notificationsEnabled: boolean;
  promoNotifications: boolean;
  orderNotifications: boolean;
  onChangeNotificationsEnabled: (val: boolean) => void;
  onChangePromo: (val: boolean) => void;
  onChangeOrder: (val: boolean) => void;
  saving: boolean;
  onSave: () => void;
}

const Settings: FC<SettingsProps> = ({
  notificationsEnabled,
  promoNotifications,
  orderNotifications,
  onChangeNotificationsEnabled,
  onChangePromo,
  onChangeOrder,
  saving,
  onSave,
}) => {
  return (
    <div className="space-y-6">
      <div className="bg-card rounded-2xl border border-border p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Bell className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Notification Preferences</h3>
            <p className="text-sm text-muted-foreground">Control how you receive alerts</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-border">
            <div>
              <p className="font-medium text-foreground text-sm">Enable All Notifications</p>
              <p className="text-xs text-muted-foreground">Master toggle for all notifications</p>
            </div>
            <Switch checked={notificationsEnabled} onCheckedChange={onChangeNotificationsEnabled} />
          </div>

          <div className="flex items-center justify-between py-3 border-b border-border">
            <div>
              <p className="font-medium text-foreground text-sm">Order Updates</p>
              <p className="text-xs text-muted-foreground">Get notified when your food is ready</p>
            </div>
            <Switch checked={orderNotifications} onCheckedChange={onChangeOrder} disabled={!notificationsEnabled} />
          </div>

          <div className="flex items-center justify-between py-3">
            <div>
              <p className="font-medium text-foreground text-sm">Promotions & Offers</p>
              <p className="text-xs text-muted-foreground">Receive deals and special offers</p>
            </div>
            <Switch checked={promoNotifications} onCheckedChange={onChangePromo} disabled={!notificationsEnabled} />
          </div>
        </div>
      </div>

      <Button variant="warm" className="w-fit" onClick={onSave} disabled={saving}>
        <Save className="h-4 w-4 mr-2" />
        {saving ? "Saving..." : "Save Settings"}
      </Button>
    </div>
  );
};

export default Settings;
