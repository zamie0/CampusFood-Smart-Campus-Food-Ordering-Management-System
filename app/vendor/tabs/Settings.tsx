"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Image } from "lucide-react";
import { toast } from "sonner";

export default function VendorSettingsTab({
  vendor,
  isStoreOpen,
  onToggleStore,
  onUpdateImage,
  phone,
  description,
  onPhoneChange,
  onDescriptionChange,
  onSaveChanges,
}: {
  vendor: any;
  isStoreOpen: boolean;
  onToggleStore: () => void;
  onUpdateImage: (imageData: string) => void;
  phone: string;
  description: string;
  onPhoneChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onSaveChanges: () => void;
}) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Store Image</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-6">
            <div className="relative w-32 h-32 rounded-xl overflow-hidden border-2 border-border bg-muted flex items-center justify-center">
              {vendor?.image ? (
                <img src={vendor.image} alt="Store" className="w-full h-full object-cover" />
              ) : (
                <Image className="w-10 h-10 text-muted-foreground" />
              )}
            </div>
            <div className="flex-1 space-y-3">
              <p className="text-sm text-muted-foreground">Upload your store image. This will be displayed to customers.</p>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    if (file.size > 5 * 1024 * 1024) {
                      toast.error("Image must be less than 5MB");
                      return;
                    }
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      onUpdateImage(reader.result as string);
                    };
                    reader.readAsDataURL(file);
                  }
                }}
              />
              <p className="text-xs text-muted-foreground">Max 5MB. Recommended: 400x400px</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Store Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className={`w-4 h-4 rounded-full ${isStoreOpen ? 'bg-green-500' : 'bg-red-500'}`} />
              <div>
                <p className="font-medium text-foreground">Store is currently {isStoreOpen ? 'Open' : 'Closed'}</p>
                <p className="text-sm text-muted-foreground">{isStoreOpen ? 'Customers can see and order from your store' : 'Your store is hidden from customers'}</p>
              </div>
            </div>
            <Switch checked={isStoreOpen} onCheckedChange={onToggleStore} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Store Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Business Name</Label>
            <Input value={vendor?.name || ""} disabled />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input value={vendor?.email || ""} disabled />
          </div>
          <div className="space-y-2">
            <Label>Phone</Label>
            <Input value={phone} onChange={(e) => onPhoneChange(e.target.value)} placeholder="Add phone number" />
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Input value={description} onChange={(e) => onDescriptionChange(e.target.value)} placeholder="Add description" />
          </div>
          <Button onClick={onSaveChanges}>Save Changes</Button>
        </CardContent>
      </Card>
    </div>
  );
}
