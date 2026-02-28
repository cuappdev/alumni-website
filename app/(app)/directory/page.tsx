"use client";

import { useEffect, useState } from "react";
import { searchUsers } from "@/lib/firestore/users";
import { getCompanies } from "@/lib/firestore/companies";
import { UserProfile, Company } from "@/types";
import { DirectoryFilters } from "@/components/directory/DirectoryFilters";
import { AlumniCard } from "@/components/directory/AlumniCard";

export default function DirectoryPage() {
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [nameFilter, setNameFilter] = useState("");
  const [classYearFilter, setClassYearFilter] = useState("");

  useEffect(() => {
    searchUsers().then(setAllUsers);
    getCompanies().then(setCompanies);
  }, []);

  const filtered = allUsers.filter((u) => {
    const matchName = !nameFilter || `${u.firstName} ${u.lastName}`.toLowerCase().includes(nameFilter.toLowerCase());
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
          <AlumniCard key={u.uid} profile={u} companies={companies} />
        ))}
      </div>
      {filtered.length === 0 && (
        <p className="text-center text-muted-foreground py-12">No alumni found.</p>
      )}
    </div>
  );
}
