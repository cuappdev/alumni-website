"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/context";
import { InviteForm } from "@/components/admin/InviteForm";
import { MemberList } from "@/components/admin/MemberList";

export default function AdminPage() {
  const { user, isAdmin, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAdmin) {
      router.push("/feed");
    }
  }, [loading, isAdmin, router]);

  if (loading || !isAdmin || !user) return null;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Admin</h1>
      <InviteForm />
      <MemberList currentUid={user.uid} />
    </div>
  );
}
