import {
  collection,
  getDocs,
  addDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { Company } from "@/types";

export async function getCompanies(): Promise<Company[]> {
  const snap = await getDocs(collection(db, "companies"));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Company));
}

export async function createCompany(
  name: string,
  logoUrl?: string
): Promise<string> {
  const ref = await addDoc(collection(db, "companies"), { name, logoUrl });
  return ref.id;
}
