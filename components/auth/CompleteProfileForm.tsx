"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import { useAuth } from "@/lib/auth/context";
import { OrganizationSelector } from "@/components/profile/OrganizationSelector";
import { ImageUpload } from "@/components/profile/ImageUpload";
import { AppDevRole } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AppDevRoleSelector } from "@/components/profile/AppDevRoleSelector";
import { toast } from "sonner";

const schema = z.object({
  firstName: z.string().min(1, "Required"),
  lastName: z.string().min(1, "Required"),
  classYear: z.coerce.number().int().min(1900).max(2100),
  bio: z.string().optional(),
  phoneNumber: z
    .string()
    .refine((v) => !v || /^\+?[\d\s\-()+]{7,20}$/.test(v), "Invalid phone number")
    .optional(),
});

type FormData = z.infer<typeof schema>;

export function CompleteProfileForm() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [profilePictureUrl, setProfilePictureUrl] = useState<string | undefined>(undefined);
  const [selectedRoles, setSelectedRoles] = useState<AppDevRole[]>([]);
  const [selectedOrganizationIds, setSelectedOrganizationIds] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (loading) return;
    if (!user) router.push("/login");
  }, [loading, user, router]);

  useEffect(() => {
    if (profile) reset({ firstName: profile.firstName, lastName: profile.lastName });
  }, [profile, reset]);

  const onSubmit = async (data: FormData) => {
    if (!user) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/user/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: data.firstName,
          lastName: data.lastName,
          classYear: data.classYear,
          bio: data.bio || undefined,
          phoneNumber: data.phoneNumber || undefined,
          organizationIds: selectedOrganizationIds,
          appDevRoles: selectedRoles,
          profilePictureUrl: profilePictureUrl ?? user.photoURL ?? undefined,
        }),
      });

      if (!res.ok) {
        const { error } = await res.json();
        if (res.status === 403) {
          await signOut(auth);
          toast.error(error || "Invitation not found.");
          router.push("/login");
          return;
        }
        throw new Error(error);
      }

      router.push("/feed");
    } catch (err) {
      console.error(err);
      toast.error("Failed to save profile. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !user) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">Loading…</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Complete your profile</CardTitle>
        <CardDescription>Just a few more details before you join the network.</CardDescription>
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
            <Input value={user.email ?? ""} readOnly className="bg-muted" />
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
            <OrganizationSelector
              selectedIds={selectedOrganizationIds}
              onChange={setSelectedOrganizationIds}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="phone">Phone (optional)</Label>
            <Input id="phone" type="tel" {...register("phoneNumber")} />
            {errors.phoneNumber && (
              <p className="text-sm text-destructive">{errors.phoneNumber.message}</p>
            )}
          </div>
          <ImageUpload
            currentUrl={user.photoURL ?? undefined}
            onUploaded={setProfilePictureUrl}
            name={user.displayName ?? undefined}
            label="Profile picture (optional)"
          />
          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? "Saving…" : "Complete sign-up"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
