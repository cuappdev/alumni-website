import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { getTokens } from "next-firebase-auth-edge";
import { authConfig } from "@/lib/firebase/auth-edge";
import { getUserProfile } from "@/lib/firestore/users";
import { FieldValue } from "firebase-admin/firestore";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ uid: string }> }
) {
  const tokens = await getTokens(request.cookies, authConfig);
  if (!tokens) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { uid } = await params;
  const profile = await getUserProfile(uid);
  if (!profile) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(profile);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ uid: string }> }
) {
  const tokens = await getTokens(request.cookies, authConfig);
  if (!tokens) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Only admins can update other users
  const callerDoc = await adminDb.collection("users").doc(tokens.decodedToken.uid).get();
  if (callerDoc.data()?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { uid } = await params;
  const { role } = await request.json();

  if (role !== "admin" && role !== "member") {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  }

  await adminDb
    .collection("users")
    .doc(uid)
    .update({ role, updatedAt: FieldValue.serverTimestamp() });

  return NextResponse.json({ ok: true });
}
