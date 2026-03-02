"use client";

import { useEffect, useState } from "react";
import { Organization } from "@/types";
import { OrganizationFilters } from "@/components/organizations/OrganizationFilters";
import { OrganizationCard } from "@/components/organizations/OrganizationCard";

export default function OrganizationsPage() {
  const [allOrganizations, setAllOrganizations] = useState<Organization[]>([]);
  const [nameFilter, setNameFilter] = useState("");

  useEffect(() => {
    fetch("/api/organizations")
      .then((r) => r.json())
      .then(setAllOrganizations)
      .catch(console.error);
  }, []);

  const filtered = allOrganizations.filter((o) =>
    !nameFilter || o.name.toLowerCase().includes(nameFilter.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Organizations</h1>
      <OrganizationFilters name={nameFilter} onNameChange={setNameFilter} />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((o) => (
          <OrganizationCard key={o.id} organization={o} />
        ))}
      </div>
      {filtered.length === 0 && (
        <p className="text-center text-muted-foreground py-12">No organizations found.</p>
      )}
    </div>
  );
}
