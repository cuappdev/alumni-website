"use client";

import { useEffect, useState } from "react";
import { UserProfile, Organization } from "@/types";
import { DirectoryFilters } from "@/components/directory/DirectoryFilters";
import { AlumniCard } from "@/components/directory/AlumniCard";

export default function DirectoryPage() {
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [nameFilter, setNameFilter] = useState("");
  const [classYearFilter, setClassYearFilter] = useState("");

  useEffect(() => {
    Promise.all([
      fetch("/api/users").then((r) => r.json()),
      fetch("/api/organizations").then((r) => r.json()),
    ]).then(([users, orgs]) => {
      setAllUsers(users);
      setOrganizations(orgs);
    });
  }, []);

  const filtered = allUsers.filter((u) => {
    const matchName =
      !nameFilter ||
      `${u.firstName} ${u.lastName}`.toLowerCase().includes(nameFilter.toLowerCase());
    const matchYear = !classYearFilter || u.classYear === parseInt(classYearFilter);
    return matchName && matchYear;
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Directory</h1>
      <DirectoryFilters
        name={nameFilter}
        classYear={classYearFilter}
        onNameChange={setNameFilter}
        onClassYearChange={setClassYearFilter}
      />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((u) => (
          <AlumniCard key={u.uid} profile={u} organizations={organizations} />
        ))}
      </div>
      {filtered.length === 0 && (
        <p className="text-center text-muted-foreground py-12">No alumni found.</p>
      )}
    </div>
  );
}
