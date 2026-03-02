"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import Link from "next/link";

const schema = z
  .object({
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type FormData = z.infer<typeof schema>;

interface InvitationInfo {
  email: string;
  firstName: string;
  lastName: string;
}

export function SignupForm({ code }: { code?: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [invitation, setInvitation] = useState<InvitationInfo | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (!code) {
      setChecking(false);
      return;
    }
    fetch(`/api/invitations/validate?code=${code}`)
      .then((r) => r.json())
      .then(({ invitation: inv }) => {
        setInvitation(inv ?? null);
        setChecking(false);
      });
  }, [code]);

  const onSubmit = async (data: FormData) => {
    if (!invitation) return;
    setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, invitation.email, data.password);
      const idToken = await cred.user.getIdToken();
      // Step 1: create signed cookie
      await fetch("/api/login", {
        method: "GET",
        headers: { Authorization: `Bearer ${idToken}` },
      });
      // Step 2: create user stub
      await fetch("/api/session", { method: "POST" });
      router.push("/signup/complete");
    } catch (err) {
      console.error(err);
      toast.error("Sign-up failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">Checking invitation…</p>
        </CardContent>
      </Card>
    );
  }

  if (!invitation) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Invalid invitation</CardTitle>
          <CardDescription>
            This link is invalid, has already been used, or was not found. Ask an admin to send
            you a new invitation.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/login" className="underline text-sm">
            Back to login
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create your account</CardTitle>
        <CardDescription>Set a password to get started. You&apos;ll complete your profile next.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1">
            <Label>Email</Label>
            <Input value={invitation.email} readOnly className="bg-muted" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" {...register("password")} />
            {errors.password && (
              <p className="text-sm text-destructive">{errors.password.message}</p>
            )}
          </div>
          <div className="space-y-1">
            <Label htmlFor="confirmPassword">Confirm password</Label>
            <Input id="confirmPassword" type="password" {...register("confirmPassword")} />
            {errors.confirmPassword && (
              <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
            )}
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Creating account…" : "Continue"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
