"use client";

import { use, useEffect, useState } from "react";
import { notFound } from "next/navigation";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { UserProfile, Organization } from "@/types";

export default function ProfilePage({
  params,
}: {
  params: Promise<{ uid: string }>;
}) {
  const { uid } = use(params);
  const [profile, setProfile] = useState<UserProfile | null | "loading">("loading");
  const [organizations, setOrganizations] = useState<Organization[]>([]);

  useEffect(() => {
    Promise.all([
      fetch(`/api/users/${uid}`).then((r) => (r.ok ? r.json() : null)),
      fetch("/api/organizations").then((r) => r.json()),
    ]).then(([p, o]) => {
      setProfile(p);
      setOrganizations(o);
    });
  }, [uid]);

  if (profile === "loading") {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center text-muted-foreground">Loading…</div>
    );
  }

  if (!profile) {
    notFound();
  }

  return (
    <div className="max-w-2xl mx-auto">
      <ProfileHeader initialProfile={profile} organizations={organizations} />
    </div>
  );
}
