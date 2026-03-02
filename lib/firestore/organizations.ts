import { adminDb } from "@/lib/firebase/admin";
import { Organization } from "@/types";

export async function getOrganizations(): Promise<Organization[]> {
  const snap = await adminDb.collection("organizations").get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Organization));
}
