import { NextRequest, NextResponse } from "next/server";
import { getTokens } from "next-firebase-auth-edge";
import { authConfig } from "@/lib/firebase/auth-edge";
import { adminStorage } from "@/lib/firebase/admin";
import { updateUserProfile } from "@/lib/firestore/users";
import sharp from "sharp";

const BUCKET = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!;
const SIZE = 400;

export async function POST(request: NextRequest) {
  const tokens = await getTokens(request.cookies, authConfig);
  if (!tokens) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const uid = tokens.decodedToken.uid;

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const processed = await sharp(buffer)
    .resize(SIZE, SIZE, { fit: "cover" })
    .webp({ quality: 85 })
    .toBuffer();

  const filePath = `profile-pictures/${uid}.webp`;
  const bucket = adminStorage.bucket(BUCKET);
  const fileRef = bucket.file(filePath);
  const token = crypto.randomUUID();

  await fileRef.save(processed, {
    metadata: {
      contentType: "image/webp",
      metadata: { firebaseStorageDownloadTokens: token },
    },
  });

  const host =
    process.env.NODE_ENV === "development"
      ? `http://localhost:9199`
      : `https://firebasestorage.googleapis.com`;

  const url = `${host}/v0/b/${BUCKET}/o/${encodeURIComponent(filePath)}?alt=media&token=${token}`;

  await updateUserProfile(uid, { profilePictureUrl: url });

  return NextResponse.json({ url });
}
