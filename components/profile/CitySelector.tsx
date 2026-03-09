"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { City } from "@/types";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface CitySelectorProps {
  selectedId: string | undefined;
  onChange: (cityId: string | undefined) => void;
}

export function CitySelector({ selectedId, onChange }: CitySelectorProps) {
  const [allCities, setAllCities] = useState<City[]>([]);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [search, setSearch] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Load existing DB cities to resolve the selected one
  useEffect(() => {
    fetch("/api/cities")
      .then((r) => r.json())
      .then((cities: City[]) => {
        setAllCities(cities);
        if (selectedId) {
          const found = cities.find((c) => c.id === selectedId);
          if (found) setSelectedCity(found);
        }
      })
      .catch(console.error);
  }, [selectedId]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSearch = async (value: string) => {
    setSearch(value);
    setHighlightedIndex(0);
    if (!value.trim()) {
      setSuggestions([]);
      setOpen(false);
      return;
    }
    setOpen(true);
    const res = await fetch(`/api/cities?q=${encodeURIComponent(value)}`);
    if (res.ok) setSuggestions(await res.json());
  };

  const handleSelect = async (name: string) => {
    if (creating) return;
    setCreating(true);
    try {
      const res = await fetch("/api/cities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) return;
      const city: City = await res.json();
      setSelectedCity(city);
      setAllCities((prev) => (prev.find((c) => c.id === city.id) ? prev : [...prev, city]));
      onChange(city.id);
    } finally {
      setCreating(false);
      setSearch("");
      setSuggestions([]);
      setOpen(false);
    }
  };

  const handleRemove = () => {
    setSelectedCity(null);
    onChange(undefined);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open || suggestions.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (suggestions[highlightedIndex]) handleSelect(suggestions[highlightedIndex]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div ref={containerRef} className="space-y-2">
      {selectedCity && (
        <Badge variant="secondary" className="gap-1 pr-1">
          {selectedCity.name}
          <button type="button" onClick={handleRemove} className="ml-1 hover:text-destructive">
            <X className="h-3 w-3" />
          </button>
        </Badge>
      )}
      {!selectedCity && (
        <div className="relative">
          <Input
            placeholder="Search cities…"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            onFocus={() => { if (suggestions.length > 0) setOpen(true); }}
            onKeyDown={handleKeyDown}
            disabled={creating}
          />
          {open && suggestions.length > 0 && (
            <div className="absolute z-10 top-full mt-1 w-full bg-background border rounded-md shadow-md max-h-48 overflow-y-auto">
              {suggestions.map((name, i) => (
                <button
                  key={name}
                  type="button"
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-muted ${i === highlightedIndex ? "bg-muted" : ""}`}
                  onMouseDown={(e) => { e.preventDefault(); handleSelect(name); }}
                  onMouseEnter={() => setHighlightedIndex(i)}
                >
                  {name}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
