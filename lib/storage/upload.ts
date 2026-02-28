import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebase/client";

export async function uploadProfilePicture(uid: string, file: File): Promise<string> {
  const storageRef = ref(storage, `profile-pictures/${uid}`);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
}

export async function uploadCompanyLogo(companyId: string, file: File): Promise<string> {
  const storageRef = ref(storage, `company-logos/${companyId}`);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
}
