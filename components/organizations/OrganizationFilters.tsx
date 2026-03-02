"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface OrganizationFiltersProps {
  name: string;
  onNameChange: (v: string) => void;
}

export function OrganizationFilters({ name, onNameChange }: OrganizationFiltersProps) {
  return (
    <div className="space-y-1 max-w-sm">
      <Label htmlFor="org-search">Search organizations</Label>
      <Input
        id="org-search"
        placeholder="Organization name…"
        value={name}
        onChange={(e) => onNameChange(e.target.value)}
      />
    </div>
  );
}
