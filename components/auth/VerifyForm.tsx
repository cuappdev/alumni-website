"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isSignInWithEmailLink, signInWithEmailLink, signOut } from "firebase/auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { auth } from "@/lib/firebase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth/context";

export const EMAIL_KEY = "emailForSignIn";

const schema = z.object({ email: z.string().email() });
type FormData = z.infer<typeof schema>;

export function VerifyForm() {
  const router = useRouter();
  const { refreshProfile } = useAuth();
  const [needsEmail, setNeedsEmail] = useState(false);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const completeSignIn = async (email: string) => {
    setLoading(true);
    try {
      const cred = await signInWithEmailLink(auth, email, window.location.href);
      window.localStorage.removeItem(EMAIL_KEY);
      const idToken = await cred.user.getIdToken();

      await fetch("/api/login", {
        method: "GET",
        headers: { Authorization: `Bearer ${idToken}` },
      });

      const sessionRes = await fetch("/api/session", { method: "POST" });
      if (!sessionRes.ok) {
        await signOut(auth);
        const body = await sessionRes.json().catch(() => ({}));
        toast.error(body.error || "Sign-in failed.");
        router.push("/login");
        return;
      }

      const { profileComplete } = await sessionRes.json();
      await refreshProfile();
      router.push(profileComplete ? "/feed" : "/signup/complete");
    } catch (err) {
      console.error(err);
      toast.error("Sign-in failed. The link may have expired.");
      router.push("/login");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isSignInWithEmailLink(auth, window.location.href)) {
      router.push("/login");
      return;
    }
    const email = window.localStorage.getItem(EMAIL_KEY);
    if (email) {
      completeSignIn(email);
    } else {
      setNeedsEmail(true);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!needsEmail) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">
            {loading ? "Signing you in…" : "Verifying…"}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="items-center text-center">
        <img src="/appdev.svg" alt="Cornell AppDev" className="h-10 mb-2 mx-auto" />
        <CardTitle>Confirm your email</CardTitle>
        <CardDescription>
          Enter the email address you used to request the sign-in link.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit((d) => completeSignIn(d.email))} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" autoComplete="email" {...register("email")} />
            {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Signing in…" : "Confirm"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
