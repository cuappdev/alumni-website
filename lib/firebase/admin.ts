import { initializeApp, getApps, applicationDefault } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

if (process.env.NODE_ENV === "development") {
  process.env.FIRESTORE_EMULATOR_HOST = "localhost:8080";
  process.env.FIREBASE_AUTH_EMULATOR_HOST = "localhost:9099";
  process.env.FIREBASE_STORAGE_EMULATOR_HOST = "localhost:9199";
}

if (getApps().length === 0) {
  initializeApp({
    credential: applicationDefault(),
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  });
}

export const adminAuth = getAuth();
export const adminDb = getFirestore();
