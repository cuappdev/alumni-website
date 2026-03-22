/**
 * Migration: add type: "post" to any posts documents missing a type field.
 * Run with: npx tsx scripts/migrate-post-types.ts
 */
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import * as path from "path";

const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS
  ?? path.join(process.cwd(), "service-account.json");

if (!getApps().length) {
  initializeApp({ credential: cert(serviceAccountPath) });
}

const db = getFirestore();

async function run() {
  const snap = await db.collection("posts").get();
  const batch = db.batch();
  let count = 0;

  for (const doc of snap.docs) {
    if (!doc.data().type) {
      batch.update(doc.ref, { type: "post" });
      count++;
    }
  }

  if (count === 0) {
    console.log("No posts missing a type field.");
    return;
  }

  await batch.commit();
  console.log(`Updated ${count} post(s) with type: "post".`);
}

run().catch((err) => { console.error(err); process.exit(1); });
