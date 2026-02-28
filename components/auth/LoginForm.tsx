"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  AuthError,
} from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import { getInvitationByEmail } from "@/lib/firestore/invitations";
import { getUserProfile } from "@/lib/firestore/users";
import { ADMIN_EMAIL } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

type FormData = z.infer<typeof schema>;

async function createSession(idToken: string) {
  await fetch("/api/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken }),
  });
}

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") ?? "/feed";
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, data.email, data.password);
      const idToken = await cred.user.getIdToken();
      await createSession(idToken);
      router.push(nextPath);
    } catch {
      toast.error("Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const cred = await signInWithPopup(auth, provider);
      const email = cred.user.email!;

      // Enforce invitation requirement (bypass for admin)
      if (email !== ADMIN_EMAIL) {
        const inv = await getInvitationByEmail(email);
        if (!inv || inv.usedAt) {
          await signOut(auth);
          toast.error("No account found.", {
            description: "Sign up with the link in your invitation email, or ask an admin to send you one.",
          });
          return;
        }
      }

      // Returning Google user who already completed their profile
      const profile = await getUserProfile(cred.user.uid);
      if (profile) {
        const idToken = await cred.user.getIdToken();
        await createSession(idToken);
        router.push(nextPath);
        return;
      }

      // New Google user — send them to complete their profile
      // (no session cookie yet; created after profile completion)
      router.push("/signup/complete");
    } catch (err) {
      const code = (err as AuthError)?.code;
      if (code !== "auth/popup-closed-by-user" && code !== "auth/cancelled-popup-request") {
        toast.error("Google sign-in failed.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader className="items-center text-center">
        <img src="/appdev.svg" alt="Cornell AppDev" className="h-10 mb-2 mx-auto" />
        <CardTitle>Sign in to Cornell AppDev Alumni</CardTitle>
        <CardDescription>View and create posts and browse the alumni directory</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...register("email")} />
            {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
          </div>
          <div className="space-y-1">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" {...register("password")} />
            {errors.password && (
              <p className="text-sm text-destructive">{errors.password.message}</p>
            )}
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Signing in…" : "Sign in"}
          </Button>
        </form>
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">or</span>
          </div>
        </div>
        <Button variant="outline" className="w-full" onClick={handleGoogle} disabled={loading}>
          Continue with Google
        </Button>
        <p className="text-center text-sm text-muted-foreground">
          <span className="font-medium">Need an account?</span> Click the link in your invitation email, or ask an admin to send you one.
        </p>
      </CardContent>
    </Card>
  );
}
