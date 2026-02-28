import {
  doc,
  getDoc,
  updateDoc,
  serverTimestamp,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { Invitation } from "@/types";

export async function getInvitationByCode(code: string): Promise<Invitation | null> {
  const ref = doc(db, "invitations", code);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return snap.data() as Invitation;
}

export async function getInvitationByEmail(email: string): Promise<Invitation | null> {
  const q = query(collection(db, "invitations"), where("email", "==", email));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  return snap.docs[0].data() as Invitation;
}

export async function markInvitationUsed(code: string): Promise<void> {
  const ref = doc(db, "invitations", code);
  await updateDoc(ref, { usedAt: serverTimestamp() });
}
