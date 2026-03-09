"use client";

import { FieldErrors, UseFormRegister } from "react-hook-form";
// Phone validation is intentionally loose — the server normalizes to E.164
import { AppDevRole } from "@/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ImageUpload } from "./ImageUpload";
import { AppDevRoleSelector } from "./AppDevRoleSelector";
import { CompanySelector } from "./CompanySelector";
import { CitySelector } from "./CitySelector";

interface ProfileFormFieldsProps {
  register: UseFormRegister<any>;
  errors: FieldErrors<any>;
  imageUploadName: string;
  imageUploadCurrentUrl?: string;
  selectedRoles: AppDevRole[];
  onRolesChange: (roles: AppDevRole[]) => void;
  selectedCompanyIds: string[];
  onCompanyIdsChange: (ids: string[]) => void;
  selectedCityId: string | undefined;
  onCityIdChange: (id: string | undefined) => void;
  profilePictureUrl: string | undefined;
  onProfilePictureUploaded: (url: string) => void;
}

export function ProfileFormFields({
  register,
  errors,
  imageUploadName,
  imageUploadCurrentUrl,
  selectedRoles,
  onRolesChange,
  selectedCompanyIds,
  onCompanyIdsChange,
  selectedCityId,
  onCityIdChange,
  profilePictureUrl: _profilePictureUrl,
  onProfilePictureUploaded,
}: ProfileFormFieldsProps) {
  return (
    <>
      <ImageUpload
        currentUrl={imageUploadCurrentUrl}
        onUploaded={onProfilePictureUploaded}
        name={imageUploadName}
        label="Profile picture"
      />
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label htmlFor="firstName">First name</Label>
          <Input id="firstName" {...register("firstName")} />
          {errors.firstName && (
            <p className="text-sm text-destructive">{String(errors.firstName.message)}</p>
          )}
        </div>
        <div className="space-y-1">
          <Label htmlFor="lastName">Last name</Label>
          <Input id="lastName" {...register("lastName")} />
          {errors.lastName && (
            <p className="text-sm text-destructive">{String(errors.lastName.message)}</p>
          )}
        </div>
      </div>
      <div className="space-y-1">
        <Label htmlFor="classYear">Class year</Label>
        <Input id="classYear" type="number" {...register("classYear")} />
        {errors.classYear && (
          <p className="text-sm text-destructive">{String(errors.classYear.message)}</p>
        )}
      </div>
      <div className="space-y-1">
        <Label>AppDev roles</Label>
        <AppDevRoleSelector selected={selectedRoles} onChange={onRolesChange} />
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
        <Label>Companies</Label>
        <p className="text-xs text-muted-foreground">Where have you worked?</p>
        <CompanySelector selectedIds={selectedCompanyIds} onChange={onCompanyIdsChange} />
      </div>
      <div className="space-y-1">
        <Label>City (optional)</Label>
        <CitySelector selectedId={selectedCityId} onChange={onCityIdChange} />
      </div>
      <div className="space-y-1">
        <Label htmlFor="phone">Phone (optional)</Label>
        <Input id="phone" type="tel" {...register("phoneNumber")} />
        {errors.phoneNumber && (
          <p className="text-sm text-destructive">{String(errors.phoneNumber.message)}</p>
        )}
      </div>
      <div className="space-y-1">
        <Label htmlFor="linkedinUrl">LinkedIn (optional)</Label>
        <Input id="linkedinUrl" type="url" placeholder="https://linkedin.com/in/…" {...register("linkedinUrl")} />
        {errors.linkedinUrl && (
          <p className="text-sm text-destructive">{String(errors.linkedinUrl.message)}</p>
        )}
      </div>
      <div className="space-y-1">
        <Label htmlFor="instagramUrl">Instagram (optional)</Label>
        <Input id="instagramUrl" type="url" placeholder="https://instagram.com/…" {...register("instagramUrl")} />
        {errors.instagramUrl && (
          <p className="text-sm text-destructive">{String(errors.instagramUrl.message)}</p>
        )}
      </div>
    </>
  );
}
