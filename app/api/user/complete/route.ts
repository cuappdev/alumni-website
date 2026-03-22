import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { getTokens } from "next-firebase-auth-edge";
import { authConfig } from "@/lib/firebase/auth-edge";
import { SUPER_ADMIN_EMAIL } from "@/lib/constants";
import { normalizePhone } from "@/lib/utils";

export async function POST(request: NextRequest) {
  try {
    const tokens = await getTokens(request.cookies, authConfig);
    if (!tokens) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { uid, email } = tokens.decodedToken;

    const body = await request.json();
    const { firstName, lastName, classYear, bio, phoneNumber, companyIds, currentCompanyIds, appDevRoles, profilePictureUrl, cityId, graduated, linkedinUrl, instagramUrl } =
      body;

    const isAdmin = email === SUPER_ADMIN_EMAIL;

    let invCode: string | null = null;
    let invGraduated: boolean | undefined;
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
      invGraduated = invSnap.docs[0].data().graduated as boolean;
    }

    const profileData: Record<string, unknown> = {
      uid,
      email,
      firstName,
      lastName,
      classYear,
      companyIds: companyIds ?? [],
      currentCompanyIds: currentCompanyIds ?? [],
      appDevRoles: appDevRoles ?? [],
      emailNotifications: true,
      profileComplete: true,
      updatedAt: FieldValue.serverTimestamp(),
    };
    if (bio) profileData.bio = bio;
    if (phoneNumber) profileData.phoneNumber = normalizePhone(phoneNumber) ?? phoneNumber;
    if (profilePictureUrl) profileData.profilePictureUrl = profilePictureUrl;
    if (cityId) profileData.cityId = cityId;
    const resolvedGraduated = invGraduated !== undefined ? invGraduated : graduated;
    if (resolvedGraduated !== undefined) profileData.graduated = resolvedGraduated;
    if (linkedinUrl) profileData.linkedinUrl = linkedinUrl;
    if (instagramUrl) profileData.instagramUrl = instagramUrl;
    if (isAdmin) profileData.role = "admin";

    await adminDb.collection("users").doc(uid).set(profileData, { merge: true });

    if (invCode) {
      await adminDb
        .collection("invitations")
        .doc(invCode)
        .update({ usedAt: FieldValue.serverTimestamp() });
    }

    await adminDb.collection("posts").add({
      authorId: uid,
      type: "joined",
      title: "",
      description: "",
      likes: [],
      createdAt: Timestamp.now(),
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Complete profile error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
