"use client";

import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UserProfile } from "@/types";
import { classLabel } from "@/lib/utils";
import { toast } from "sonner";

export function MemberList({ currentUid }: { currentUid: string }) {
  const [members, setMembers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [updatingGrad, setUpdatingGrad] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/users")
      .then((r) => r.json())
      .then((users) => {
        setMembers(users);
        setLoading(false);
      });
  }, []);

  const toggleRole = async (member: UserProfile) => {
    const newRole = member.role === "admin" ? "member" : "admin";
    setUpdating(member.uid);
    try {
      const res = await fetch(`/api/users/${member.uid}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });
      if (!res.ok) throw new Error();
      setMembers((prev) =>
        prev.map((m) => (m.uid === member.uid ? { ...m, role: newRole } : m))
      );
      toast.success(
        newRole === "admin"
          ? `${member.firstName} is now an admin.`
          : `${member.firstName} is now a member.`
      );
    } catch {
      toast.error("Failed to update role.");
    } finally {
      setUpdating(null);
    }
  };

  const toggleGraduated = async (member: UserProfile) => {
    const newValue = !member.graduated;
    setUpdatingGrad(member.uid);
    try {
      const res = await fetch(`/api/users/${member.uid}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ graduated: newValue }),
      });
      if (!res.ok) throw new Error();
      setMembers((prev) =>
        prev.map((m) => (m.uid === member.uid ? { ...m, graduated: newValue } : m))
      );
      toast.success(
        newValue
          ? `${member.firstName} marked as graduated.`
          : `${member.firstName} marked as student.`
      );
    } catch {
      toast.error("Failed to update graduation status.");
    } finally {
      setUpdatingGrad(null);
    }
  };

  return (
    <div>
      <h2 className="text-lg font-semibold mb-1">Members</h2>
      <p className="text-sm text-muted-foreground mb-4">
        {loading ? "Loading…" : `${members.length} members`}
      </p>
      <ul className="divide-y border-t border-b">
        {members.map((m) => {
          const fullName = `${m.firstName} ${m.lastName}`;
          const initials = `${m.firstName[0]}${m.lastName[0]}`.toUpperCase();
          const isCurrentUser = m.uid === currentUid;
          return (
            <li key={m.uid} className="flex items-center gap-3 py-3">
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarImage src={m.profilePictureUrl} alt={fullName} />
                <AvatarFallback className="text-xs">{initials}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {fullName}{" "}
                  <span className="text-muted-foreground font-normal text-xs">
                    {classLabel(m.classYear, m.graduated)}
                  </span>
                </p>
                <p className="text-xs text-muted-foreground truncate">{m.email}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {m.graduated && (
                  <Badge variant="outline" className="text-xs">Graduated</Badge>
                )}
                {m.role === "admin" && (
                  <Badge variant="secondary" className="text-xs">Admin</Badge>
                )}
              </div>
              <div className="flex gap-2 shrink-0">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={updatingGrad === m.uid}
                  onClick={() => toggleGraduated(m)}
                >
                  {updatingGrad === m.uid
                    ? "Saving…"
                    : m.graduated
                      ? "Ungraduate"
                      : "Graduate"}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={isCurrentUser || updating === m.uid}
                  onClick={() => toggleRole(m)}
                >
                  {updating === m.uid
                    ? "Saving…"
                    : m.role === "admin"
                      ? "Remove admin"
                      : "Make admin"}
                </Button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
