import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";
import { getTokens } from "next-firebase-auth-edge";
import { authConfig } from "@/lib/firebase/auth-edge";
import { SUPER_ADMIN_EMAIL } from "@/lib/constants";

export async function POST(request: NextRequest) {
  try {
    const tokens = await getTokens(request.cookies, authConfig);
    if (!tokens) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { uid, email } = tokens.decodedToken;

    const body = await request.json();
    const { firstName, lastName, classYear, bio, phoneNumber, organizationIds, appDevRoles, profilePictureUrl } =
      body;

    const isAdmin = email === SUPER_ADMIN_EMAIL;

    let invCode: string | null = null;
    if (!isAdmin) {
      const invSnap = await adminDb
        .collection("invitations")
        .where("email", "==", email)
        .get();
      if (invSnap.empty || invSnap.docs[0].data().usedAt) {
        return NextResponse.json(
          { error: "Invitation not found or already used" },
          { status: 403 }
        );
      }
      invCode = invSnap.docs[0].id;
    }

    const profileData: Record<string, unknown> = {
      uid,
      email,
      firstName,
      lastName,
      classYear,
      organizationIds: organizationIds ?? [],
      appDevRoles: appDevRoles ?? [],
      emailNotifications: true,
      profileComplete: true,
      updatedAt: FieldValue.serverTimestamp(),
    };
    if (bio) profileData.bio = bio;
    if (phoneNumber) profileData.phoneNumber = phoneNumber;
    if (profilePictureUrl) profileData.profilePictureUrl = profilePictureUrl;
    if (isAdmin) profileData.role = "admin";

    await adminDb.collection("users").doc(uid).set(profileData, { merge: true });

    if (invCode) {
      await adminDb
        .collection("invitations")
        .doc(invCode)
        .update({ usedAt: FieldValue.serverTimestamp() });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Complete profile error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
