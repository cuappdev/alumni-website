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
import { Label } from "@/components/ui/label";
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
  emailNotifications: z.boolean(),
});

type FormData = z.infer<typeof schema>;

interface ProfileEditFormProps {
  profile: UserProfile;
  onUpdated: (updated: Partial<UserProfile>) => void;
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
      emailNotifications: profile.emailNotifications,
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      let profilePictureUrl = formState.profilePictureUrl;
      if (formState.pendingPictureFile) {
        const form = new FormData();
        form.append("file", formState.pendingPictureFile, "avatar.jpg");
        const res = await fetch("/api/user/avatar", { method: "POST", body: form });
        if (!res.ok) throw new Error("Avatar upload failed");
        profilePictureUrl = (await res.json()).url;
      }

      const updates = {
        ...data,
        bio: data.bio || undefined,
        phoneNumber: data.phoneNumber || undefined,
        appDevRoles: formState.selectedRoles,
        companyIds: formState.selectedCompanyIds,
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
            selectedCityId={formState.selectedCityId}
            onCityIdChange={formState.setSelectedCityId}
            profilePictureUrl={formState.profilePictureUrl}
            onProfilePictureFileSelected={formState.onPictureSelected}
          />
          <div className="flex items-center gap-2">
            <input
              id="edit-notifications"
              type="checkbox"
              {...register("emailNotifications")}
              className="h-4 w-4"
            />
            <Label htmlFor="edit-notifications">Email notifications for new posts</Label>
          </div>
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
