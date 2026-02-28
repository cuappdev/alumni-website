"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { updateUserProfile } from "@/lib/firestore/users";
import { uploadProfilePicture } from "@/lib/storage/upload";
import { UserProfile, AppDevRole } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ImageUpload } from "./ImageUpload";
import { AppDevRoleSelector } from "./AppDevRoleSelector";
import { CompanySelector } from "./CompanySelector";
import { toast } from "sonner";

const schema = z.object({
  firstName: z.string().min(1, "Required"),
  lastName: z.string().min(1, "Required"),
  classYear: z.coerce.number().int().min(1900).max(2100),
  bio: z.string().optional(),
  phoneNumber: z.string().refine((v) => !v || /^\+?[\d\s\-()+]{7,20}$/.test(v), "Invalid phone number").optional(),
  emailNotifications: z.boolean(),
});

type FormData = z.infer<typeof schema>;

interface ProfileEditFormProps {
  profile: UserProfile;
  onUpdated: (updated: Partial<UserProfile>) => void;
}

export function ProfileEditForm({ profile, onUpdated }: ProfileEditFormProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newFile, setNewFile] = useState<File | null>(null);
  const [selectedRoles, setSelectedRoles] = useState<AppDevRole[]>(profile.appDevRoles ?? []);
  const [selectedCompanyIds, setSelectedCompanyIds] = useState<string[]>(profile.companyIds);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      firstName: profile.firstName,
      lastName: profile.lastName,
      classYear: profile.classYear,
      bio: profile.bio ?? "",
      phoneNumber: profile.phoneNumber ?? "",
      emailNotifications: profile.emailNotifications,
    },
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      let profilePictureUrl = profile.profilePictureUrl;
      if (newFile) {
        profilePictureUrl = await uploadProfilePicture(profile.uid, newFile);
      }
      const updates = {
        ...data,
        bio: data.bio || undefined,
        phoneNumber: data.phoneNumber || undefined,
        appDevRoles: selectedRoles,
        companyIds: selectedCompanyIds,
        profilePictureUrl,
      };
      await updateUserProfile(profile.uid, updates);
      onUpdated(updates);
      toast.success("Profile updated!");
      setOpen(false);
    } catch {
      toast.error("Failed to update profile.");
    } finally {
      setLoading(false);
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
          <ImageUpload
            currentUrl={profile.profilePictureUrl}
            onFileSelect={setNewFile}
            label="Profile picture"
          />
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="edit-firstName">First name</Label>
              <Input id="edit-firstName" {...register("firstName")} />
              {errors.firstName && (
                <p className="text-sm text-destructive">{errors.firstName.message}</p>
              )}
            </div>
            <div className="space-y-1">
              <Label htmlFor="edit-lastName">Last name</Label>
              <Input id="edit-lastName" {...register("lastName")} />
              {errors.lastName && (
                <p className="text-sm text-destructive">{errors.lastName.message}</p>
              )}
            </div>
          </div>
          <div className="space-y-1">
            <Label htmlFor="edit-year">Class year</Label>
            <Input id="edit-year" type="number" {...register("classYear")} />
            {errors.classYear && (
              <p className="text-sm text-destructive">{errors.classYear.message}</p>
            )}
          </div>
          <div className="space-y-1">
            <Label>AppDev roles</Label>
            <AppDevRoleSelector selected={selectedRoles} onChange={setSelectedRoles} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="edit-bio">Bio (optional)</Label>
            <Textarea
              id="edit-bio"
              rows={3}
              placeholder="Tell the community about yourself. What did you do on AppDev? Where are you now? You can always edit this later."
              {...register("bio")}
            />
          </div>
          <div className="space-y-1">
            <Label>Organizations</Label>
            <p className="text-xs text-muted-foreground">Where have you worked?</p>
            <CompanySelector selectedIds={selectedCompanyIds} onChange={setSelectedCompanyIds} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="edit-phone">Phone (optional)</Label>
            <Input id="edit-phone" type="tel" {...register("phoneNumber")} />
            {errors.phoneNumber && (
              <p className="text-sm text-destructive">{errors.phoneNumber.message}</p>
            )}
          </div>
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
            <Button type="submit" disabled={loading}>
              {loading ? "Saving…" : "Save"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
