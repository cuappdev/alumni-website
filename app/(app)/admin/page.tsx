"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/context";
import { InviteForm } from "@/components/admin/InviteForm";
import { MemberList } from "@/components/admin/MemberList";
import { InvitationList } from "@/components/admin/InvitationList";

export default function AdminPage() {
  const { user, isAdmin, loading } = useAuth();
  const router = useRouter();
  const [inviteRefreshKey, setInviteRefreshKey] = useState(0);

  useEffect(() => {
    if (!loading && !isAdmin) {
      router.push("/feed");
    }
  }, [loading, isAdmin, router]);

  if (loading || !isAdmin || !user) return null;

  return (
    <div className="space-y-10">
      <h1 className="text-2xl font-semibold">Admin</h1>
      <InviteForm onSuccess={() => setInviteRefreshKey((k) => k + 1)} />
      <InvitationList refreshKey={inviteRefreshKey} />
      <MemberList currentUid={user.uid} />
    </div>
  );
}
