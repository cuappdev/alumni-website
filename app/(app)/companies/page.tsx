"use client";

import { useEffect, useState } from "react";
import { Company, UserProfile } from "@/types";
import { CompanyFilters } from "@/components/companies/CompanyFilters";
import { CompanyCard } from "@/components/companies/CompanyCard";

export default function CompaniesPage() {
  const [allCompanies, setAllCompanies] = useState<Company[]>([]);
  const [memberCounts, setMemberCounts] = useState<Record<string, number>>({});
  const [nameFilter, setNameFilter] = useState("");

  useEffect(() => {
    Promise.all([
      fetch("/api/companies").then((r) => r.json()),
      fetch("/api/users").then((r) => r.json()),
    ]).then(([companies, users]: [Company[], UserProfile[]]) => {
      setAllCompanies(companies);
      const counts: Record<string, number> = {};
      users.forEach((u) => u.companyIds.forEach((id) => { counts[id] = (counts[id] ?? 0) + 1; }));
      setMemberCounts(counts);
    }).catch(console.error);
  }, []);

  const filtered = allCompanies
    .filter((c) => !nameFilter || c.name.toLowerCase().includes(nameFilter.toLowerCase()))
    .sort((a, b) => (memberCounts[b.id] ?? 0) - (memberCounts[a.id] ?? 0));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Companies</h1>
      <CompanyFilters name={nameFilter} onNameChange={setNameFilter} />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((c) => (
          <CompanyCard key={c.id} company={c} memberCount={memberCounts[c.id] ?? 0} />
        ))}
      </div>
      {filtered.length === 0 && (
        <p className="text-center text-muted-foreground py-12">No companies found.</p>
      )}
    </div>
  );
}
