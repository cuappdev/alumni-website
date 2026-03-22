"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth/context";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { UserProfile } from "@/types";
import { toast } from "sonner";

type NotifyField = "notifyPosts" | "notifyJobs" | "notifyAnnouncements" | "notifyEventsInCity" | "notifyEventsAll";

const NOTIFICATION_PREFS: { field: NotifyField; label: string; description: string }[] = [
  { field: "notifyAnnouncements", label: "Announcements", description: "When an announcement is made." },
  { field: "notifyEventsInCity", label: "Events in my city", description: "When a new event is posted in your city." },
  { field: "notifyEventsAll", label: "All events", description: "When any new event is posted." },
  { field: "notifyPosts", label: "New posts", description: "When a member makes a new post." },
  { field: "notifyJobs", label: "Job listings", description: "When a new job listing is posted." },
];

export default function SettingsPage() {
  const { profile, refreshProfile } = useAuth();
  const [saving, setSaving] = useState<string | null>(null);

  if (!profile) return null;

  const handleToggle = async (field: NotifyField, checked: boolean) => {
    setSaving(field);
    try {
      const res = await fetch("/api/user", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: checked }),
      });
      if (!res.ok) throw new Error();
      await refreshProfile();
    } catch {
      toast.error("Failed to save.");
    } finally {
      setSaving(null);
    }
  };

  return (
    <div className="max-w-lg space-y-8">
      <h1 className="text-2xl font-semibold">Settings</h1>
      <div className="space-y-4">
        <h2 className="font-semibold">Email Notifications</h2>
        <div className="divide-y rounded-lg border">
          {NOTIFICATION_PREFS.map(({ field, label, description }) => (
            <div key={field} className="flex items-center justify-between gap-4 px-4 py-3">
              <div>
                <Label htmlFor={field} className="text-sm font-medium cursor-pointer">{label}</Label>
                <p className="text-sm text-muted-foreground">{description}</p>
              </div>
              <Switch
                id={field}
                checked={profile[field] ?? false}
                onCheckedChange={(checked) => handleToggle(field, checked)}
                disabled={saving === field}
                className="cursor-pointer"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
