"use client";

import { useEffect, useState } from "react";
import { City, UserProfile } from "@/types";
import { CityCard } from "@/components/cities/CityCard";
import { Input } from "@/components/ui/input";

export default function CitiesPage() {
  const [allCities, setAllCities] = useState<City[]>([]);
  const [memberCounts, setMemberCounts] = useState<Record<string, number>>({});
  const [filter, setFilter] = useState("");

  useEffect(() => {
    Promise.all([
      fetch("/api/cities").then((r) => r.json()),
      fetch("/api/users").then((r) => r.json()),
    ]).then(([cities, users]: [City[], UserProfile[]]) => {
      setAllCities(cities);
      const counts: Record<string, number> = {};
      users.forEach((u) => { if (u.cityId) counts[u.cityId] = (counts[u.cityId] ?? 0) + 1; });
      setMemberCounts(counts);
    }).catch(console.error);
  }, []);

  const filtered = allCities
    .filter((c) => !filter || c.name.toLowerCase().includes(filter.toLowerCase()))
    .sort((a, b) => (memberCounts[b.id] ?? 0) - (memberCounts[a.id] ?? 0));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Cities</h1>
      <Input
        placeholder="Search cities…"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        className="max-w-sm"
      />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((c) => (
          <CityCard key={c.id} city={c} memberCount={memberCounts[c.id] ?? 0} />
        ))}
      </div>
      {filtered.length === 0 && (
        <p className="text-center text-muted-foreground py-12">No cities found.</p>
      )}
    </div>
  );
}
