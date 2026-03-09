import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { getTokens } from "next-firebase-auth-edge";
import { authConfig } from "@/lib/firebase/auth-edge";
import { deleteInvitation } from "@/lib/firestore/invitations";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const tokens = await getTokens(request.cookies, authConfig);
    if (!tokens) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const userDoc = await adminDb.collection("users").doc(tokens.decodedToken.uid).get();
    if (userDoc.data()?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { code } = await params;
    await deleteInvitation(code);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Delete invitation error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
