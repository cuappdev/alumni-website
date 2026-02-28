import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { UserProfile } from "@/types";

export async function createUserProfile(
  uid: string,
  data: Omit<UserProfile, "uid" | "createdAt" | "updatedAt">
): Promise<void> {
  const ref = doc(db, "users", uid);
  await setDoc(ref, {
    ...data,
    uid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return snap.data() as UserProfile;
}

export async function updateUserProfile(
  uid: string,
  data: Partial<Omit<UserProfile, "uid" | "createdAt">>
): Promise<void> {
  const ref = doc(db, "users", uid);
  await updateDoc(ref, { ...data, updatedAt: serverTimestamp() });
}

export async function searchUsers(
  nameFilter?: string,
  classYearFilter?: number
): Promise<UserProfile[]> {
  const snap = await getDocs(collection(db, "users"));
  let users = snap.docs.map((d) => d.data() as UserProfile);

  if (nameFilter) {
    const lower = nameFilter.toLowerCase();
    users = users.filter((u) =>
      `${u.firstName} ${u.lastName}`.toLowerCase().includes(lower)
    );
  }
  if (classYearFilter) {
    users = users.filter((u) => u.classYear === classYearFilter);
  }
  return users;
}
