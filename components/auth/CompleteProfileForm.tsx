"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import { useAuth } from "@/lib/auth/context";
import { ProfileFormFields } from "@/components/profile/ProfileFormFields";
import { useProfileFormState } from "@/components/profile/useProfileFormState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
  linkedinUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  instagramUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
});

type FormData = z.infer<typeof schema>;

export function CompleteProfileForm() {
  const { user, profile, loading, refreshProfile } = useAuth();
  const router = useRouter();
  const formState = useProfileFormState();
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
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
    try {
      let profilePictureUrl = formState.profilePictureUrl ?? user.photoURL ?? undefined;
      if (formState.pendingPictureFile) {
        const form = new FormData();
        form.append("file", formState.pendingPictureFile, "avatar.jpg");
        const avatarRes = await fetch("/api/user/avatar", { method: "POST", body: form });
        if (!avatarRes.ok) throw new Error("Avatar upload failed");
        profilePictureUrl = (await avatarRes.json()).url;
      }

      const res = await fetch("/api/user/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          bio: data.bio || undefined,
          phoneNumber: data.phoneNumber || undefined,
          companyIds: formState.selectedCompanyIds,
          appDevRoles: formState.selectedRoles,
          cityId: formState.selectedCityId,
          linkedinUrl: data.linkedinUrl || undefined,
          instagramUrl: data.instagramUrl || undefined,
          profilePictureUrl,
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

      await refreshProfile();
      router.push("/feed");
    } catch (err) {
      console.error(err);
      toast.error("Failed to save profile. Please try again.");
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
          <div className="space-y-1">
            <Label>Email</Label>
            <Input value={user.email ?? ""} readOnly className="bg-muted" />
          </div>
          <ProfileFormFields
            register={register}
            errors={errors}
            imageUploadName={user.displayName ?? ""}
            imageUploadCurrentUrl={user.photoURL ?? undefined}
            selectedRoles={formState.selectedRoles}
            onRolesChange={formState.setSelectedRoles}
            selectedCompanyIds={formState.selectedCompanyIds}
            onCompanyIdsChange={formState.setSelectedCompanyIds}
            selectedCityId={formState.selectedCityId}
            onCityIdChange={formState.setSelectedCityId}
            profilePictureUrl={formState.profilePictureUrl}
            onProfilePictureFileSelected={formState.onPictureSelected}
          />
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Saving…" : "Complete sign-up"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
