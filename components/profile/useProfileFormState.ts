"use client";

import { useState } from "react";
import { AppDevRole, UserProfile } from "@/types";

export function useProfileFormState(initial?: Partial<UserProfile>) {
  const [selectedRoles, setSelectedRoles] = useState<AppDevRole[]>(initial?.appDevRoles ?? []);
  const [selectedCompanyIds, setSelectedCompanyIds] = useState<string[]>(initial?.companyIds ?? []);
  const [selectedCityId, setSelectedCityId] = useState<string | undefined>(initial?.cityId);
  const [profilePictureUrl, setProfilePictureUrl] = useState<string | undefined>(initial?.profilePictureUrl);
  return {
    selectedRoles, setSelectedRoles,
    selectedCompanyIds, setSelectedCompanyIds,
    selectedCityId, setSelectedCityId,
    profilePictureUrl, setProfilePictureUrl,
  };
}
