"use client";

import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UserProfile } from "@/types";
import { toast } from "sonner";

export function MemberList({ currentUid }: { currentUid: string }) {
  const [members, setMembers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

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
                  <span className="text-muted-foreground font-normal">
                    &apos;{String(m.classYear).slice(-2)}
                  </span>
                </p>
                <p className="text-xs text-muted-foreground truncate">{m.email}</p>
              </div>
              {m.role === "admin" && (
                <Badge variant="secondary" className="shrink-0">
                  Admin
                </Badge>
              )}
              <Button
                size="sm"
                variant="outline"
                disabled={isCurrentUser || updating === m.uid}
                onClick={() => toggleRole(m)}
                className="shrink-0"
              >
                {updating === m.uid
                  ? "Saving…"
                  : m.role === "admin"
                    ? "Remove admin"
                    : "Make admin"}
              </Button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
