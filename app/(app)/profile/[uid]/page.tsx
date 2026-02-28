"use client";

import { use, useEffect, useState } from "react";
import { notFound } from "next/navigation";
import { getUserProfile } from "@/lib/firestore/users";
import { getCompanies } from "@/lib/firestore/companies";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { UserProfile, Company } from "@/types";

export default function ProfilePage({
  params,
}: {
  params: Promise<{ uid: string }>;
}) {
  const { uid } = use(params);
  const [profile, setProfile] = useState<UserProfile | null | "loading">("loading");
  const [companies, setCompanies] = useState<Company[]>([]);

  useEffect(() => {
    Promise.all([getUserProfile(uid), getCompanies()]).then(([p, c]) => {
      setProfile(p);
      setCompanies(c);
    });
  }, [uid]);

  if (profile === "loading") {
    return <div className="max-w-2xl mx-auto py-12 text-center text-muted-foreground">Loading…</div>;
  }

  if (!profile) {
    notFound();
  }

  return (
    <div className="max-w-2xl mx-auto">
      <ProfileHeader initialProfile={profile} companies={companies} />
    </div>
  );
}
