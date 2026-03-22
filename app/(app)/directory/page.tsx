"use client";

import { useEffect, useState } from "react";
import { UserProfile, Company, City } from "@/types";
import { DirectoryFilters } from "@/components/directory/DirectoryFilters";
import { AlumniCard } from "@/components/directory/AlumniCard";

export default function DirectoryPage() {
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [nameFilter, setNameFilter] = useState("");
  const [classYearFilter, setClassYearFilter] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [companyFilter, setCompanyFilter] = useState("");

  useEffect(() => {
    Promise.all([
      fetch("/api/users").then((r) => r.json()),
      fetch("/api/companies").then((r) => r.json()),
      fetch("/api/cities").then((r) => r.json()),
    ]).then(([users, comps, cityList]) => {
      setAllUsers(users);
      setCompanies(comps);
      setCities(cityList);
    });
  }, []);

  const filtered = allUsers.filter((u) => {
    const matchName =
      !nameFilter ||
      `${u.firstName} ${u.lastName}`.toLowerCase().includes(nameFilter.toLowerCase());
    const matchYear = !classYearFilter || u.classYear === parseInt(classYearFilter);
    const matchCity = !cityFilter || u.cityId === cityFilter;
    const matchCompany = !companyFilter || u.companyIds.includes(companyFilter);
    return matchName && matchYear && matchCity && matchCompany;
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Directory</h1>
      <DirectoryFilters
        name={nameFilter}
        classYear={classYearFilter}
        cityId={cityFilter}
        companyId={companyFilter}
        cities={cities}
        companies={companies}
        onNameChange={setNameFilter}
        onClassYearChange={setClassYearFilter}
        onCityChange={setCityFilter}
        onCompanyChange={setCompanyFilter}
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
