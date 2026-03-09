"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { City, Company, UserProfile } from "@/types";
import { MapPin } from "lucide-react";
import { AlumniCard } from "@/components/directory/AlumniCard";

export default function CityDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [city, setCity] = useState<City | null>(null);
  const [members, setMembers] = useState<UserProfile[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);

  useEffect(() => {
    Promise.all([
      fetch(`/api/cities/${id}`).then((r) => r.json()),
      fetch(`/api/users?cityId=${id}`).then((r) => r.json()),
      fetch("/api/companies").then((r) => r.json()),
    ]).then(([city, users, allCompanies]: [City, UserProfile[], Company[]]) => {
      setCity(city);
      setMembers(users);
      setCompanies(allCompanies);
    }).catch(console.error);
  }, [id]);

  if (!city) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <MapPin className="h-10 w-10 text-muted-foreground" />
        <div>
          <h1 className="text-2xl font-semibold">{city.name}</h1>
          <p className="text-sm text-muted-foreground">{members.length} {members.length === 1 ? "member" : "members"}</p>
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {members.map((u) => (
          <AlumniCard key={u.uid} profile={u} companies={companies} />
        ))}
      </div>
      {members.length === 0 && (
        <p className="text-center text-muted-foreground py-12">No members in this city yet.</p>
      )}
    </div>
  );
}
