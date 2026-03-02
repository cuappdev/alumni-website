"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const schema = z.object({
  firstName: z.string().min(1, "Required"),
  lastName: z.string().min(1, "Required"),
  email: z.string().email(),
});

type FormData = z.infer<typeof schema>;

export function InviteForm() {
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const res = await fetch("/api/invitations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error ?? "Failed");
      }
      toast.success(`Invitation sent to ${data.email}`);
      reset();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to send invitation.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-lg font-semibold mb-1">Send an invitation</h2>
      <p className="text-sm text-muted-foreground mb-4">
        The recipient will receive an email with a signup link.
      </p>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-md">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label htmlFor="invite-firstName">First name</Label>
            <Input id="invite-firstName" {...register("firstName")} />
            {errors.firstName && (
              <p className="text-sm text-destructive">{errors.firstName.message}</p>
            )}
          </div>
          <div className="space-y-1">
            <Label htmlFor="invite-lastName">Last name</Label>
            <Input id="invite-lastName" {...register("lastName")} />
            {errors.lastName && (
              <p className="text-sm text-destructive">{errors.lastName.message}</p>
            )}
          </div>
        </div>
        <div className="space-y-1">
          <Label htmlFor="invite-email">Email address</Label>
          <Input
            id="invite-email"
            type="email"
            placeholder="alumni@example.com"
            {...register("email")}
          />
          {errors.email && (
            <p className="text-sm text-destructive">{errors.email.message}</p>
          )}
        </div>
        <Button type="submit" disabled={loading}>
          {loading ? "Sending…" : "Send invite"}
        </Button>
      </form>
    </div>
  );
}
