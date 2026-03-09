import { NextRequest, NextResponse } from "next/server";
import { getTokens } from "next-firebase-auth-edge";
import { authConfig } from "@/lib/firebase/auth-edge";
import { adminStorage } from "@/lib/firebase/admin";
import { getUserProfile, updateUserProfile } from "@/lib/firestore/users";
import sharp from "sharp";

const BUCKET = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!;
const SIZE = 400;
const UPLOAD_URL = "https://upload.cornellappdev.com/upload";
const REMOVE_URL = "https://upload.cornellappdev.com/remove";
const APPDEV_BUCKET = "alumni-website";

async function uploadToAppDev(buffer: Buffer, filename: string): Promise<string> {
  const blob = new Blob([buffer], { type: "image/webp" });
  const form = new FormData();
  form.append("bucket", APPDEV_BUCKET);
  form.append("image", blob, filename);
  const res = await fetch(UPLOAD_URL, { method: "POST", body: form });
  if (!res.ok) throw new Error("Upload failed");
  return (await res.text()).trim();
}

async function removeFromAppDev(imageUrl: string): Promise<void> {
  await fetch(REMOVE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ image_url: imageUrl, bucket: APPDEV_BUCKET }),
  });
}

async function uploadToEmulator(buffer: Buffer, uid: string): Promise<string> {
  const filePath = `profile-pictures/${uid}.webp`;
  const bucket = adminStorage.bucket(BUCKET);
  const fileRef = bucket.file(filePath);
  const token = crypto.randomUUID();
  await fileRef.save(buffer, {
    metadata: {
      contentType: "image/webp",
      metadata: { firebaseStorageDownloadTokens: token },
    },
  });
  return `http://localhost:9199/v0/b/${BUCKET}/o/${encodeURIComponent(filePath)}?alt=media&token=${token}`;
}

async function removeFromEmulator(uid: string): Promise<void> {
  try {
    const filePath = `profile-pictures/${uid}.webp`;
    await adminStorage.bucket(BUCKET).file(filePath).delete();
  } catch {
    // file may not exist yet
  }
}

export async function POST(request: NextRequest) {
  const tokens = await getTokens(request.cookies, authConfig);
  if (!tokens) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const uid = tokens.decodedToken.uid;

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

  const arrayBuffer = await file.arrayBuffer();
  const processed = await sharp(Buffer.from(arrayBuffer))
    .resize(SIZE, SIZE, { fit: "cover" })
    .webp({ quality: 85 })
    .toBuffer();

  // Remove old image
  const existing = await getUserProfile(uid);
  if (existing?.profilePictureUrl) {
    if (process.env.NODE_ENV === "development") {
      await removeFromEmulator(uid);
    } else {
      await removeFromAppDev(existing.profilePictureUrl);
    }
  }

  // Upload new image
  const url =
    process.env.NODE_ENV === "development"
      ? await uploadToEmulator(processed, uid)
      : await uploadToAppDev(processed, `${uid}.webp`);

  await updateUserProfile(uid, { profilePictureUrl: url });

  return NextResponse.json({ url });
}
