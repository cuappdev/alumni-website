"use client";

import { useEffect, useState } from "react";
import { getCompanies } from "@/lib/firestore/companies";
import { Company } from "@/types";
import { CompanyFilters } from "@/components/companies/CompanyFilters";
import { CompanyCard } from "@/components/companies/CompanyCard";

export default function CompaniesPage() {
  const [allCompanies, setAllCompanies] = useState<Company[]>([]);
  const [nameFilter, setNameFilter] = useState("");

  useEffect(() => {
    getCompanies().then(setAllCompanies);
  }, []);

  const filtered = allCompanies.filter((c) =>
    !nameFilter || c.name.toLowerCase().includes(nameFilter.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Companies</h1>
      <CompanyFilters name={nameFilter} onNameChange={setNameFilter} />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((c) => (
          <CompanyCard key={c.id} company={c} />
        ))}
      </div>
      {filtered.length === 0 && (
        <p className="text-center text-muted-foreground py-12">No companies found.</p>
      )}
    </div>
  );
}
