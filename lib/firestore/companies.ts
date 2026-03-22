import { adminDb } from "@/lib/firebase/admin";
import { Company } from "@/types";

export async function getCompanies(): Promise<Company[]> {
  const [companiesSnap, usersSnap] = await Promise.all([
    adminDb.collection("companies").get(),
    adminDb.collection("users").where("profileComplete", "==", true).get(),
  ]);

  const companyIdsWithMembers = new Set<string>(
    usersSnap.docs.flatMap((d) => (d.data().companyIds as string[]) ?? [])
  );

  return companiesSnap.docs
    .map((d) => ({ id: d.id, ...d.data() } as Company))
    .filter((c) => companyIdsWithMembers.has(c.id));
}
