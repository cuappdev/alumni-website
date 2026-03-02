import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { getTokens } from "next-firebase-auth-edge";
import { authConfig } from "@/lib/firebase/auth-edge";
import { getOrganizations } from "@/lib/firestore/organizations";

export async function GET(request: NextRequest) {
  const tokens = await getTokens(request.cookies, authConfig);
  if (!tokens) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const organizations = await getOrganizations();
  return NextResponse.json(organizations);
}

export async function POST(request: NextRequest) {
  try {
    const tokens = await getTokens(request.cookies, authConfig);
    if (!tokens) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { name, logoUrl } = await request.json();
    if (!name) return NextResponse.json({ error: "Name required" }, { status: 400 });

    const ref = await adminDb.collection("organizations").add({
      name,
      ...(logoUrl && { logoUrl }),
    });

    return NextResponse.json({ id: ref.id });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
