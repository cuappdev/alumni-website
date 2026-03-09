import { adminDb } from "@/lib/firebase/admin";
import { City } from "@/types";

export async function getCities(): Promise<City[]> {
  const snap = await adminDb.collection("cities").orderBy("name").get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as City));
}

export async function findOrCreateCity(name: string): Promise<City> {
  const snap = await adminDb.collection("cities").where("name", "==", name).limit(1).get();
  if (!snap.empty) {
    return { id: snap.docs[0].id, name };
  }
  const ref = await adminDb.collection("cities").add({ name });
  return { id: ref.id, name };
}
