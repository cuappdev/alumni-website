import { initializeApp, getApps, applicationDefault } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

if (getApps().length === 0) {
  initializeApp({
    credential: applicationDefault(),
  });
}

export const adminAuth = getAuth();
export const adminDb = getFirestore();

if (process.env.NODE_ENV === "development") {
  process.env.FIREBASE_AUTH_EMULATOR_HOST = "localhost:9099";
  adminDb.settings({ host: "localhost:8080", ssl: false });
}
