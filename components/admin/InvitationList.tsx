"use client";

import { useEffect, useState } from "react";
import { Invitation } from "@/types";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export function InvitationList({ refreshKey }: { refreshKey?: number }) {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [revoking, setRevoking] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch("/api/invitations")
      .then((r) => (r.ok ? r.json() : []))
      .then((data: Invitation[]) => setInvitations(data.filter((i) => !i.usedAt)))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [refreshKey]);

  const rescind = async (code: string, name: string) => {
    setRevoking(code);
    try {
      const res = await fetch(`/api/invitations/${code}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed");
      setInvitations((prev) => prev.filter((i) => i.code !== code));
      toast.success(`Invitation to ${name} rescinded.`);
    } catch {
      toast.error("Failed to rescind invitation.");
    } finally {
      setRevoking(null);
    }
  };

  return (
    <div>
      <h2 className="text-lg font-semibold mb-1">Sent invitations</h2>
      <p className="text-sm text-muted-foreground mb-4">
        Pending invitations can be rescinded to invalidate the signup link.
      </p>
      {loading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : invitations.length === 0 ? (
        <p className="text-sm text-muted-foreground">No invitations sent yet.</p>
      ) : (
        <div className="divide-y rounded-md border max-w-2xl">
          {invitations.map((inv) => (
            <div key={inv.code} className="flex items-center justify-between px-4 py-3 gap-4">
              <div className="min-w-0">
                <p className="font-medium truncate">
                  {inv.firstName} {inv.lastName}
                </p>
                <p className="text-sm text-muted-foreground truncate">{inv.email}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Sent {new Date(inv.sentAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <Badge variant="outline">Pending</Badge>
                <button
                  className="text-sm underline text-muted-foreground hover:text-foreground disabled:opacity-50"
                  disabled={revoking === inv.code}
                  onClick={() => rescind(inv.code, `${inv.firstName} ${inv.lastName}`)}
                >
                  {revoking === inv.code ? "Cancelling…" : "Cancel"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
