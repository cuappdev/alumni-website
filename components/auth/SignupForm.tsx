"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import { createUserProfile } from "@/lib/firestore/users";
import { getInvitationByCode, markInvitationUsed } from "@/lib/firestore/invitations";
import { uploadProfilePicture } from "@/lib/storage/upload";
import { Invitation, AppDevRole } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AppDevRoleSelector } from "@/components/profile/AppDevRoleSelector";
import { CompanySelector } from "@/components/profile/CompanySelector";
import { toast } from "sonner";
import Link from "next/link";

const schema = z.object({
  firstName: z.string().min(1, "Required"),
  lastName: z.string().min(1, "Required"),
  password: z.string().min(6),
  classYear: z.coerce.number().int().min(1900).max(2100),
  bio: z.string().optional(),
  phoneNumber: z.string().refine((v) => !v || /^\+?[\d\s\-()+]{7,20}$/.test(v), "Invalid phone number").optional(),
});

type FormData = z.infer<typeof schema>;

export function SignupForm({ code }: { code?: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [profileFile, setProfileFile] = useState<File | null>(null);
  const [selectedRoles, setSelectedRoles] = useState<AppDevRole[]>([]);
  const [selectedCompanyIds, setSelectedCompanyIds] = useState<string[]>([]);

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
    getInvitationByCode(code).then((inv) => {
      setInvitation(inv && !inv.usedAt ? inv : null);
      setChecking(false);
    });
  }, [code]);

  const onSubmit = async (data: FormData) => {
    if (!invitation) return;
    setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, invitation.email, data.password);
      const uid = cred.user.uid;

      let profilePictureUrl: string | undefined;
      if (profileFile) {
        profilePictureUrl = await uploadProfilePicture(uid, profileFile);
      }

      await createUserProfile(uid, {
        firstName: data.firstName,
        lastName: data.lastName,
        email: invitation.email,
        classYear: data.classYear,
        bio: data.bio || undefined,
        phoneNumber: data.phoneNumber || undefined,
        companyIds: selectedCompanyIds,
        appDevRoles: selectedRoles,
        emailNotifications: true,
        profilePictureUrl,
      });

      await markInvitationUsed(invitation.code);

      const idToken = await cred.user.getIdToken();
      await fetch("/api/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });

      router.push("/feed");
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
        <CardDescription>Complete your profile to join the alumni network</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="firstName">First name</Label>
              <Input id="firstName" {...register("firstName")} />
              {errors.firstName && (
                <p className="text-sm text-destructive">{errors.firstName.message}</p>
              )}
            </div>
            <div className="space-y-1">
              <Label htmlFor="lastName">Last name</Label>
              <Input id="lastName" {...register("lastName")} />
              {errors.lastName && (
                <p className="text-sm text-destructive">{errors.lastName.message}</p>
              )}
            </div>
          </div>
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
            <Label htmlFor="classYear">Class year</Label>
            <Input id="classYear" type="number" {...register("classYear")} />
            {errors.classYear && (
              <p className="text-sm text-destructive">{errors.classYear.message}</p>
            )}
          </div>
          <div className="space-y-1">
            <Label>AppDev roles</Label>
            <AppDevRoleSelector selected={selectedRoles} onChange={setSelectedRoles} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="bio">Bio (optional)</Label>
            <Textarea
              id="bio"
              rows={3}
              placeholder="Tell the community about yourself. What did you do on AppDev? Where are you now? You can always edit this later."
              {...register("bio")}
            />
          </div>
          <div className="space-y-1">
            <Label>Organizations</Label>
            <p className="text-xs text-muted-foreground">Where have you worked?</p>
            <CompanySelector
              selectedIds={selectedCompanyIds}
              onChange={setSelectedCompanyIds}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="phone">Phone (optional)</Label>
            <Input id="phone" type="tel" {...register("phoneNumber")} />
            {errors.phoneNumber && (
              <p className="text-sm text-destructive">{errors.phoneNumber.message}</p>
            )}
          </div>
          <div className="space-y-1">
            <Label htmlFor="picture">Profile picture (optional)</Label>
            <Input
              id="picture"
              type="file"
              accept="image/*"
              onChange={(e) => setProfileFile(e.target.files?.[0] ?? null)}
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Creating account…" : "Create account"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
