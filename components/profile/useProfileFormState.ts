"use client";

import { useState } from "react";
import { AppDevRole, UserProfile } from "@/types";

export function useProfileFormState(initial?: Partial<UserProfile>) {
  const [selectedRoles, setSelectedRoles] = useState<AppDevRole[]>(initial?.appDevRoles ?? []);
  const [selectedCompanyIds, setSelectedCompanyIds] = useState<string[]>(initial?.companyIds ?? []);
  const [selectedCurrentCompanyIds, setSelectedCurrentCompanyIds] = useState<string[]>(initial?.currentCompanyIds ?? []);
  const [selectedCityId, setSelectedCityId] = useState<string | undefined>(initial?.cityId);
  const [profilePictureUrl, setProfilePictureUrl] = useState<string | undefined>(initial?.profilePictureUrl);
  const [pendingPictureFile, setPendingPictureFile] = useState<Blob | null>(null);

  const onPictureSelected = (blob: Blob, previewUrl: string) => {
    setPendingPictureFile(blob);
    setProfilePictureUrl(previewUrl);
  };

  return {
    selectedRoles, setSelectedRoles,
    selectedCompanyIds, setSelectedCompanyIds,
    selectedCurrentCompanyIds, setSelectedCurrentCompanyIds,
    selectedCityId, setSelectedCityId,
    profilePictureUrl,
    pendingPictureFile,
    onPictureSelected,
  };
}
