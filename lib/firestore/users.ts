import { adminDb } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";
import { UserProfile } from "@/types";

function serializeUser(data: FirebaseFirestore.DocumentData): UserProfile {
  return {
    ...data,
    createdAt: data.createdAt?.toDate?.()?.toISOString() ?? new Date().toISOString(),
    updatedAt: data.updatedAt?.toDate?.()?.toISOString() ?? new Date().toISOString(),
  } as UserProfile;
}

export async function createUserStub(
  uid: string,
  data: { email: string; firstName: string; lastName: string }
): Promise<void> {
  await adminDb.collection("users").doc(uid).set({
    ...data,
    uid,
    profileComplete: false,
    companyIds: [],
    appDevRoles: [],
    emailNotifications: true,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });
}

export async function createUserProfile(
  uid: string,
  data: Omit<UserProfile, "uid" | "createdAt" | "updatedAt">
): Promise<void> {
  const { profilePictureUrl, bio, phoneNumber, role, ...rest } = data;
  await adminDb.collection("users").doc(uid).set({
    ...rest,
    ...(profilePictureUrl && { profilePictureUrl }),
    ...(bio && { bio }),
    ...(phoneNumber && { phoneNumber }),
    ...(role && { role }),
    uid,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const snap = await adminDb.collection("users").doc(uid).get();
  if (!snap.exists) return null;
  return serializeUser(snap.data()!);
}

export async function updateUserProfile(
  uid: string,
  data: Partial<Omit<UserProfile, "uid" | "createdAt">>
): Promise<void> {
  const OPTIONAL_STRINGS = ["profilePictureUrl", "bio", "phoneNumber", "linkedinUrl", "instagramUrl"] as const;
  const sanitized = { ...data };
  for (const key of OPTIONAL_STRINGS) {
    if (key in sanitized && !sanitized[key]) delete sanitized[key];
  }
  await adminDb.collection("users").doc(uid).update({ ...sanitized, updatedAt: FieldValue.serverTimestamp() });
}

export async function searchUsers(
  nameFilter?: string,
  classYearFilter?: number,
  companyId?: string,
  cityId?: string,
): Promise<UserProfile[]> {
  const snap = await adminDb.collection("users").where("profileComplete", "==", true).get();
  let users = snap.docs.map((d) => serializeUser(d.data()));

  if (nameFilter) {
    const lower = nameFilter.toLowerCase();
    users = users.filter((u) =>
      `${u.firstName} ${u.lastName}`.toLowerCase().includes(lower)
    );
  }
  if (classYearFilter) {
    users = users.filter((u) => u.classYear === classYearFilter);
  }
  if (companyId) {
    users = users.filter((u) => u.companyIds.includes(companyId));
  }
  if (cityId) {
    users = users.filter((u) => u.cityId === cityId);
  }
  return users;
}
