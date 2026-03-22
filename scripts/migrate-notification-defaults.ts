/**
 * Migration: set default notification preferences on existing users that are missing them.
 * New users get these set at signup; this backfills everyone else.
 *
 * Defaults:
 *   notifyPosts: true
 *   notifyJobs: true
 *   notifyAnnouncements: true
 *   notifyEventsInCity: true
 *   notifyEventsAll: false
 *
 * Run with: npx tsx scripts/migrate-notification-defaults.ts
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

const DEFAULTS = {
  notifyPosts: true,
  notifyJobs: true,
  notifyAnnouncements: true,
  notifyEventsInCity: true,
  notifyEventsAll: false,
};

async function run() {
  const snap = await db.collection("users").get();

  const batch = db.batch();
  let count = 0;

  for (const doc of snap.docs) {
    const data = doc.data();
    const missing: Partial<typeof DEFAULTS> = {};

    for (const [key, defaultValue] of Object.entries(DEFAULTS) as [keyof typeof DEFAULTS, boolean][]) {
      if (!(key in data)) missing[key] = defaultValue;
    }

    if (Object.keys(missing).length > 0) {
      batch.update(doc.ref, missing);
      count++;
    }
  }

  if (count === 0) {
    console.log("All users already have notification preferences set.");
    return;
  }

  await batch.commit();
  console.log(`Updated ${count} user(s) with default notification preferences.`);
}

run().catch((err) => { console.error(err); process.exit(1); });
