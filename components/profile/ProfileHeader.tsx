"use client";

import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { MapPin, Linkedin, Instagram } from "lucide-react";
import { ProfileEditForm } from "./ProfileEditForm";
import { useAuth } from "@/lib/auth/context";
import { UserProfile, Company, City } from "@/types";
import { classLabel, formatPhone } from "@/lib/utils";

interface ProfileHeaderProps {
  initialProfile: UserProfile;
  initialCompanies: Company[];
}

export function ProfileHeader({ initialProfile, initialCompanies }: ProfileHeaderProps) {
  const { user } = useAuth();
  const [profile, setProfile] = useState(initialProfile);
  const [allCompanies, setAllCompanies] = useState(initialCompanies);
  const [cityName, setCityName] = useState<string | null>(null);
  const isOwner = user?.uid === profile.uid;

  useEffect(() => {
    if (!profile.cityId) { setCityName(null); return; }
    fetch("/api/cities")
      .then((r) => r.json())
      .then((cities: City[]) => {
        const found = cities.find((c) => c.id === profile.cityId);
        setCityName(found?.name ?? null);
      })
      .catch(console.error);
  }, [profile.cityId]);

  // Re-fetch companies whenever companyIds changes so newly created ones appear
  useEffect(() => {
    fetch("/api/companies")
      .then((r) => r.json())
      .then(setAllCompanies)
      .catch(console.error);
  }, [profile.companyIds]);

  const fullName = `${profile.firstName} ${profile.lastName}`;
  const initials = `${profile.firstName[0]}${profile.lastName[0]}`.toUpperCase();
  const profileCompanies = allCompanies.filter((c) => profile.companyIds.includes(c.id));
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
          <p className="text-muted-foreground text-sm">{classLabel(profile.classYear, profile.graduated)}</p>
          {cityName && (
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              {cityName}
            </p>
          )}
          <p className="text-sm text-muted-foreground">{profile.email}</p>
          {profile.phoneNumber && (
            <p className="text-sm text-muted-foreground">{formatPhone(profile.phoneNumber)}</p>
          )}
          {(profile.linkedinUrl || profile.instagramUrl) && (
            <div className="flex items-center gap-3 mt-1">
              {profile.linkedinUrl && (
                <a href={profile.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
                  <Linkedin className="h-4 w-4" />
                </a>
              )}
              {profile.instagramUrl && (
                <a href={profile.instagramUrl} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
                  <Instagram className="h-4 w-4" />
                </a>
              )}
            </div>
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
              Companies
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
