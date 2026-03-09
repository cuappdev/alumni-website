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
  const body = await request.json();
  const updates: Record<string, unknown> = { updatedAt: FieldValue.serverTimestamp() };

  if ("role" in body) {
    if (body.role !== "admin" && body.role !== "member") {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }
    updates.role = body.role;
  }

  if ("graduated" in body) {
    if (typeof body.graduated !== "boolean") {
      return NextResponse.json({ error: "graduated must be a boolean" }, { status: 400 });
    }
    updates.graduated = body.graduated;
  }

  await adminDb.collection("users").doc(uid).update(updates);

  return NextResponse.json({ ok: true });
}
