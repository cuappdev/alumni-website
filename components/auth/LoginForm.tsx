"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { GoogleAuthProvider, signInWithPopup, signOut, AuthError } from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { EMAIL_KEY } from "@/components/auth/VerifyForm";
import { useAuth } from "@/lib/auth/context";

const schema = z.object({ email: z.string().email() });
type FormData = z.infer<typeof schema>;

export function LoginForm() {
  const router = useRouter();
  const { refreshProfile } = useAuth();
  const [sent, setSent] = useState(false);
  const [sentEmail, setSentEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/send-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.email }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        toast.error(body.error || "Failed to send sign-in link.");
        return;
      }
      window.localStorage.setItem(EMAIL_KEY, data.email);
      setSentEmail(data.email);
      setSent(true);
    } catch {
      toast.error("Failed to send sign-in link. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const cred = await signInWithPopup(auth, provider);
      const idToken = await cred.user.getIdToken();

      await fetch("/api/login", {
        method: "GET",
        headers: { Authorization: `Bearer ${idToken}` },
      });

      const sessionRes = await fetch("/api/session", { method: "POST" });
      if (!sessionRes.ok) {
        await signOut(auth);
        const body = await sessionRes.json().catch(() => ({}));
        toast.error(body.error || "No account found.", {
          description: "Ask an admin to send you an invitation.",
        });
        return;
      }

      const { profileComplete } = await sessionRes.json();
      await refreshProfile();
      router.push(profileComplete ? "/feed" : "/signup/complete");
    } catch (err) {
      const code = (err as AuthError)?.code;
      if (code !== "auth/popup-closed-by-user" && code !== "auth/cancelled-popup-request") {
        toast.error("Google sign-in failed.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <Card>
        <CardHeader className="items-center text-center">
          <img src="/appdev.svg" alt="Cornell AppDev" className="h-10 mb-2 mx-auto" />
          <CardTitle>Check your email</CardTitle>
          <CardDescription>
            We sent a sign-in link to <strong>{sentEmail}</strong>. Click it to continue.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="items-center text-center">
        <img src="/appdev.svg" alt="Cornell AppDev" className="h-10 mb-2 mx-auto" />
        <CardTitle>Sign in to Cornell AppDev Alumni</CardTitle>
        <CardDescription>Enter your email to receive a sign-in link</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" autoComplete="email" {...register("email")} />
            {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Sending…" : "Send sign-in link"}
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

      </CardContent>
    </Card>
  );
}
