import { NextRequest, NextResponse } from "next/server";
import { getTokens } from "next-firebase-auth-edge";
import { authConfig } from "@/lib/firebase/auth-edge";
import { searchUsers } from "@/lib/firestore/users";

export async function GET(request: NextRequest) {
  const tokens = await getTokens(request.cookies, authConfig);
  if (!tokens) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const name = request.nextUrl.searchParams.get("name") ?? undefined;
  const classYearStr = request.nextUrl.searchParams.get("classYear");
  const classYear = classYearStr ? parseInt(classYearStr) : undefined;

  const users = await searchUsers(name, classYear);
  return NextResponse.json(users);
}
