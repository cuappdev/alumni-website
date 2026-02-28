"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface CompanyFiltersProps {
  name: string;
  onNameChange: (v: string) => void;
}

export function CompanyFilters({ name, onNameChange }: CompanyFiltersProps) {
  return (
    <div className="space-y-1 max-w-sm">
      <Label htmlFor="company-search">Search companies</Label>
      <Input
        id="company-search"
        placeholder="Company name…"
        value={name}
        onChange={(e) => onNameChange(e.target.value)}
      />
    </div>
  );
}
