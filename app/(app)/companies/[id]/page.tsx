"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Company, UserProfile } from "@/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AlumniCard } from "@/components/directory/AlumniCard";

export default function CompanyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [company, setCompany] = useState<Company | null>(null);
  const [members, setMembers] = useState<UserProfile[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);

  useEffect(() => {
    Promise.all([
      fetch(`/api/companies/${id}`).then((r) => r.json()),
      fetch(`/api/users?companyId=${id}`).then((r) => r.json()),
      fetch("/api/companies").then((r) => r.json()),
    ]).then(([comp, users, allCompanies]: [Company, UserProfile[], Company[]]) => {
      setCompany(comp);
      setMembers(users);
      setCompanies(allCompanies);
    }).catch(console.error);
  }, [id]);

  if (!company) return null;

  const initials = company.name.slice(0, 2).toUpperCase();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Avatar className="h-14 w-14 rounded-md">
          <AvatarImage src={company.logoUrl} alt={company.name} />
          <AvatarFallback className="rounded-md">{initials}</AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-2xl font-semibold">{company.name}</h1>
          <p className="text-sm text-muted-foreground">{members.length} {members.length === 1 ? "member" : "members"}</p>
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {members.map((u) => (
          <AlumniCard key={u.uid} profile={u} companies={companies} />
        ))}
      </div>
      {members.length === 0 && (
        <p className="text-center text-muted-foreground py-12">No members yet.</p>
      )}
    </div>
  );
}
