import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { getTokens } from "next-firebase-auth-edge";
import { authConfig } from "@/lib/firebase/auth-edge";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const tokens = await getTokens(request.cookies, authConfig);
  if (!tokens) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const doc = await adminDb.collection("companies").doc(id).get();
  if (!doc.exists) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ id: doc.id, ...doc.data() });
}
