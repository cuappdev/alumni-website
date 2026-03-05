"use client";

import { useEffect, useRef, useState } from "react";
import { Plus, X } from "lucide-react";
import { Organization } from "@/types";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface OrganizationSelectorProps {
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}

export function OrganizationSelector({ selectedIds, onChange }: OrganizationSelectorProps) {
  const [allOrganizations, setAllOrganizations] = useState<Organization[]>([]);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/organizations")
      .then((r) => r.json())
      .then(setAllOrganizations)
      .catch(console.error);
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

  const selected = allOrganizations.filter((o) => selectedIds.includes(o.id));
  const filtered = allOrganizations.filter(
    (o) =>
      !selectedIds.includes(o.id) && o.name.toLowerCase().includes(search.toLowerCase())
  );
  const exactMatch = allOrganizations.some(
    (o) => o.name.toLowerCase() === search.trim().toLowerCase()
  );
  const showDropdown = open && (filtered.length > 0 || (search.trim() && !exactMatch));
  // Total items in dropdown: filtered orgs + optional "Create" row
  const dropdownCount = filtered.length + (search.trim() && !exactMatch ? 1 : 0);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showDropdown) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((i) => Math.min(i + 1, dropdownCount - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (highlightedIndex < filtered.length) {
        handleSelect(filtered[highlightedIndex]);
      } else {
        handleCreate();
      }
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  const handleSelect = (org: Organization) => {
    onChange([...selectedIds, org.id]);
    setSearch("");
    setOpen(false);
    setHighlightedIndex(0);
  };

  const handleRemove = (id: string) => {
    onChange(selectedIds.filter((i) => i !== id));
  };

  const handleCreate = async () => {
    const name = search.trim();
    if (!name || creating) return;
    setCreating(true);
    try {
      const res = await fetch("/api/organizations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const { id } = await res.json();
      const newOrg: Organization = { id, name };
      setAllOrganizations((prev) => [...prev, newOrg]);
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
          {selected.map((o) => (
            <Badge key={o.id} variant="secondary" className="gap-1 pr-1">
              {o.name}
              <button
                type="button"
                onClick={() => handleRemove(o.id)}
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
          onChange={(e) => { setSearch(e.target.value); setHighlightedIndex(0); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
        />
        {showDropdown && (
          <div className="absolute z-10 top-full mt-1 w-full bg-background border rounded-md shadow-md max-h-48 overflow-y-auto">
            {filtered.map((o, i) => (
              <button
                key={o.id}
                type="button"
                className={`w-full text-left px-3 py-2 text-sm hover:bg-muted ${i === highlightedIndex ? "bg-muted" : ""}`}
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleSelect(o);
                }}
                onMouseEnter={() => setHighlightedIndex(i)}
              >
                {o.name}
              </button>
            ))}
            {search.trim() && !exactMatch && (
              <button
                type="button"
                className={`w-full text-left px-3 py-2 text-sm hover:bg-muted flex items-center gap-2 text-primary border-t ${highlightedIndex === filtered.length ? "bg-muted" : ""}`}
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleCreate();
                }}
                onMouseEnter={() => setHighlightedIndex(filtered.length)}
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
