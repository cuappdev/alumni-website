"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { City, Company } from "@/types";

interface DirectoryFiltersProps {
  name: string;
  classYear: string;
  cityId: string;
  companyId: string;
  cities: City[];
  companies: Company[];
  onNameChange: (v: string) => void;
  onClassYearChange: (v: string) => void;
  onCityChange: (v: string) => void;
  onCompanyChange: (v: string) => void;
}

export function DirectoryFilters({
  name,
  classYear,
  cityId,
  companyId,
  cities,
  companies,
  onNameChange,
  onClassYearChange,
  onCityChange,
  onCompanyChange,
}: DirectoryFiltersProps) {
  return (
    <div className="flex flex-wrap gap-3">
      <div className="space-y-1 flex-1 min-w-40">
        <Label htmlFor="filter-name">Name</Label>
        <Input
          id="filter-name"
          placeholder="Search…"
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
      {companies.length > 0 && (
        <div className="space-y-1">
          <Label>Company</Label>
          <Select value={companyId || "all"} onValueChange={(v) => onCompanyChange(v === "all" ? "" : v)}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="All companies" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All companies</SelectItem>
              {companies.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      {cities.length > 0 && (
        <div className="space-y-1">
          <Label>City</Label>
          <Select value={cityId || "all"} onValueChange={(v) => onCityChange(v === "all" ? "" : v)}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="All cities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All cities</SelectItem>
              {cities.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
}
