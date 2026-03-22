"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth/context";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { UserProfile } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ProfileFormFields } from "./ProfileFormFields";
import { useProfileFormState } from "./useProfileFormState";
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

type ProfileUpdates = Partial<Omit<UserProfile, "profilePictureUrl">> & { profilePictureUrl?: string | null };

interface ProfileEditFormProps {
  profile: UserProfile;
  onUpdated: (updated: ProfileUpdates) => void;
}

export function ProfileEditForm({ profile, onUpdated }: ProfileEditFormProps) {
  const [open, setOpen] = useState(false);
  const { refreshProfile } = useAuth();
  const formState = useProfileFormState(profile);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      firstName: profile.firstName,
      lastName: profile.lastName,
      classYear: profile.classYear,
      bio: profile.bio ?? "",
      phoneNumber: profile.phoneNumber ?? "",
      linkedinUrl: profile.linkedinUrl ?? "",
      instagramUrl: profile.instagramUrl ?? "",
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      let profilePictureUrl: string | null | undefined = formState.profilePictureUrl;
      if (formState.pendingPictureFile) {
        const form = new FormData();
        form.append("file", formState.pendingPictureFile, "avatar.jpg");
        const res = await fetch("/api/user/avatar", { method: "POST", body: form });
        if (!res.ok) throw new Error("Avatar upload failed");
        profilePictureUrl = (await res.json()).url;
      } else if (profilePictureUrl === undefined && profile.profilePictureUrl) {
        profilePictureUrl = null;
      }

      const updates = {
        ...data,
        bio: data.bio || undefined,
        phoneNumber: data.phoneNumber || undefined,
        appDevRoles: formState.selectedRoles,
        companyIds: formState.selectedCompanyIds,
        currentCompanyIds: formState.selectedCurrentCompanyIds,
        cityId: formState.selectedCityId,
        linkedinUrl: data.linkedinUrl || undefined,
        instagramUrl: data.instagramUrl || undefined,
        profilePictureUrl,
      };
      const res = await fetch("/api/user", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error("Failed");
      onUpdated(updates);
      await refreshProfile();
      toast.success("Profile updated!");
      setOpen(false);
    } catch {
      toast.error("Failed to update profile.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Edit profile
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit profile</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <ProfileFormFields
            register={register}
            errors={errors}
            imageUploadName={`${profile.firstName} ${profile.lastName}`}
            imageUploadCurrentUrl={profile.profilePictureUrl}
            selectedRoles={formState.selectedRoles}
            onRolesChange={formState.setSelectedRoles}
            selectedCompanyIds={formState.selectedCompanyIds}
            onCompanyIdsChange={formState.setSelectedCompanyIds}
            currentCompanyIds={formState.selectedCurrentCompanyIds}
            onCurrentCompanyIdsChange={formState.setSelectedCurrentCompanyIds}
            selectedCityId={formState.selectedCityId}
            onCityIdChange={formState.setSelectedCityId}
            profilePictureUrl={formState.profilePictureUrl}
            onProfilePictureFileSelected={formState.onPictureSelected}
            onProfilePictureRemoved={formState.onPictureRemoved}
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving…" : "Save"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
