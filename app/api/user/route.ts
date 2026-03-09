import { NextRequest, NextResponse } from "next/server";
import { getTokens } from "next-firebase-auth-edge";
import { authConfig } from "@/lib/firebase/auth-edge";
import { getUserProfile, updateUserProfile } from "@/lib/firestore/users";
import { normalizePhone } from "@/lib/utils";

export async function GET(request: NextRequest) {
  const tokens = await getTokens(request.cookies, authConfig);
  if (!tokens) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const profile = await getUserProfile(tokens.decodedToken.uid);
  if (!profile) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(profile);
}

export async function PATCH(request: NextRequest) {
  const tokens = await getTokens(request.cookies, authConfig);
  if (!tokens) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const data = await request.json();
    if (data.phoneNumber) data.phoneNumber = normalizePhone(data.phoneNumber) ?? data.phoneNumber;
    await updateUserProfile(tokens.decodedToken.uid, data);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
