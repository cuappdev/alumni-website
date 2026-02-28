"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ProfileEditForm } from "./ProfileEditForm";
import { useAuth } from "@/lib/auth/context";
import { UserProfile, Company } from "@/types";

interface ProfileHeaderProps {
  initialProfile: UserProfile;
  companies: Company[];
}

export function ProfileHeader({ initialProfile, companies }: ProfileHeaderProps) {
  const { user } = useAuth();
  const [profile, setProfile] = useState(initialProfile);
  const isOwner = user?.uid === profile.uid;

  const fullName = `${profile.firstName} ${profile.lastName}`;
  const initials = `${profile.firstName[0]}${profile.lastName[0]}`.toUpperCase();
  const profileCompanies = companies.filter((c) => profile.companyIds.includes(c.id));
  const roles = profile.appDevRoles ?? [];

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-4">
        <Avatar className="h-20 w-20">
          <AvatarImage src={profile.profilePictureUrl} alt={fullName} />
          <AvatarFallback className="text-lg">{initials}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-semibold">{fullName}</h1>
            {isOwner && (
              <ProfileEditForm
                profile={profile}
                onUpdated={(updates) => setProfile((prev) => ({ ...prev, ...updates }))}
              />
            )}
          </div>
          <p className="text-muted-foreground text-sm">Class of {profile.classYear}</p>
          {profile.phoneNumber && (
            <p className="text-sm text-muted-foreground">{profile.phoneNumber}</p>
          )}
          {roles.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {roles.map((r) => (
                <Badge key={r} variant="outline" className="text-xs">
                  {r}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>

      {profile.bio && <p className="text-sm whitespace-pre-wrap">{profile.bio}</p>}

      {profileCompanies.length > 0 && (
        <>
          <Separator />
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">
              Organizations
            </p>
            <div className="flex flex-wrap gap-2">
              {profileCompanies.map((c) => (
                <Badge key={c.id} variant="secondary">
                  {c.name}
                </Badge>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
