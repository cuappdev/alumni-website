import { adminDb } from "@/lib/firebase/admin";
import { Company } from "@/types";

export async function getCompanies(): Promise<Company[]> {
  const snap = await adminDb.collection("companies").get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Company));
}
