import { adminDb } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";
import { Invitation } from "@/types";

function serializeInvitation(data: FirebaseFirestore.DocumentData): Invitation {
  return {
    ...data,
    sentAt: data.sentAt?.toDate?.()?.toISOString() ?? new Date().toISOString(),
    usedAt: data.usedAt?.toDate?.()?.toISOString() ?? undefined,
  } as Invitation;
}

export async function getInvitationByCode(code: string): Promise<Invitation | null> {
  const snap = await adminDb.collection("invitations").doc(code).get();
  if (!snap.exists) return null;
  return serializeInvitation(snap.data()!);
}

export async function getInvitationByEmail(email: string): Promise<Invitation | null> {
  const snap = await adminDb.collection("invitations").where("email", "==", email).get();
  if (snap.empty) return null;
  return serializeInvitation(snap.docs[0].data());
}

export async function markInvitationUsed(code: string): Promise<void> {
  await adminDb.collection("invitations").doc(code).update({ usedAt: FieldValue.serverTimestamp() });
}

export async function listInvitations(): Promise<Invitation[]> {
  const snap = await adminDb.collection("invitations").orderBy("sentAt", "desc").get();
  return snap.docs.map((d) => serializeInvitation(d.data()));
}

export async function deleteInvitation(code: string): Promise<void> {
  await adminDb.collection("invitations").doc(code).delete();
}
