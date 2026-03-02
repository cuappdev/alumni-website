import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  if (!code) return NextResponse.json({ error: "Code required" }, { status: 400 });

  const snap = await adminDb.collection("invitations").doc(code).get();
  if (!snap.exists) return NextResponse.json({ invitation: null });

  const data = snap.data()!;
  if (data.usedAt) return NextResponse.json({ invitation: null });

  return NextResponse.json({
    invitation: {
      code: data.code,
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      sentAt: data.sentAt?.toDate?.()?.toISOString() ?? null,
    },
  });
}
