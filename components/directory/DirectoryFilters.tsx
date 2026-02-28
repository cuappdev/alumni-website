"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface DirectoryFiltersProps {
  name: string;
  classYear: string;
  onNameChange: (v: string) => void;
  onClassYearChange: (v: string) => void;
}

export function DirectoryFilters({
  name,
  classYear,
  onNameChange,
  onClassYearChange,
}: DirectoryFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <div className="space-y-1 flex-1">
        <Label htmlFor="filter-name">Search by name</Label>
        <Input
          id="filter-name"
          placeholder="Name…"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
        />
      </div>
      <div className="space-y-1 w-36">
        <Label htmlFor="filter-year">Class year</Label>
        <Input
          id="filter-year"
          type="number"
          placeholder="e.g. 2018"
          value={classYear}
          onChange={(e) => onClassYearChange(e.target.value)}
        />
      </div>
    </div>
  );
}
