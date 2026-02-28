"use client";

import { useEffect, useRef, useState } from "react";
import { Plus, X } from "lucide-react";
import { getCompanies, createCompany } from "@/lib/firestore/companies";
import { Company } from "@/types";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface CompanySelectorProps {
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}

export function CompanySelector({ selectedIds, onChange }: CompanySelectorProps) {
  const [allCompanies, setAllCompanies] = useState<Company[]>([]);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getCompanies().then(setAllCompanies);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const selected = allCompanies.filter((c) => selectedIds.includes(c.id));
  const filtered = allCompanies.filter(
    (c) =>
      !selectedIds.includes(c.id) &&
      c.name.toLowerCase().includes(search.toLowerCase())
  );
  const exactMatch = allCompanies.some(
    (c) => c.name.toLowerCase() === search.trim().toLowerCase()
  );
  const showDropdown = open && (filtered.length > 0 || (search.trim() && !exactMatch));

  const handleSelect = (company: Company) => {
    onChange([...selectedIds, company.id]);
    setSearch("");
    setOpen(false);
  };

  const handleRemove = (id: string) => {
    onChange(selectedIds.filter((i) => i !== id));
  };

  const handleCreate = async () => {
    const name = search.trim();
    if (!name || creating) return;
    setCreating(true);
    try {
      const id = await createCompany(name);
      const newCompany: Company = { id, name };
      setAllCompanies((prev) => [...prev, newCompany]);
      onChange([...selectedIds, id]);
      setSearch("");
      setOpen(false);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div ref={containerRef} className="space-y-2">
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {selected.map((c) => (
            <Badge key={c.id} variant="secondary" className="gap-1 pr-1">
              {c.name}
              <button
                type="button"
                onClick={() => handleRemove(c.id)}
                className="ml-1 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
      <div className="relative">
        <Input
          placeholder="Search organizations…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onFocus={() => setOpen(true)}
        />
        {showDropdown && (
          <div className="absolute z-10 top-full mt-1 w-full bg-background border rounded-md shadow-md max-h-48 overflow-y-auto">
            {filtered.map((c) => (
              <button
                key={c.id}
                type="button"
                className="w-full text-left px-3 py-2 text-sm hover:bg-muted"
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleSelect(c);
                }}
              >
                {c.name}
              </button>
            ))}
            {search.trim() && !exactMatch && (
              <button
                type="button"
                className="w-full text-left px-3 py-2 text-sm hover:bg-muted flex items-center gap-2 text-primary border-t"
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleCreate();
                }}
                disabled={creating}
              >
                <Plus className="h-4 w-4" />
                {creating ? "Creating…" : `Create "${search.trim()}"`}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
