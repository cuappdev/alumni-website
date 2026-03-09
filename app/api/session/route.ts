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

    // Check if user doc exists; if not, create a stub
    const userRef = adminDb.collection("users").doc(uid);
    const userDoc = await userRef.get();

    let profileComplete = false;

    if (!userDoc.exists) {
      if (email !== SUPER_ADMIN_EMAIL) {
        // Require a valid, unused invitation
        const invSnap = await adminDb
          .collection("invitations")
          .where("email", "==", email)
          .get();
        if (invSnap.empty || invSnap.docs[0].data().usedAt) {
          return NextResponse.json({ error: "No valid invitation" }, { status: 403 });
        }
        const inv = invSnap.docs[0].data();
        await userRef.set({
          uid,
          email,
          firstName: inv.firstName,
          lastName: inv.lastName,
          profileComplete: false,
          companyIds: [],
          appDevRoles: [],
          emailNotifications: true,
          createdAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
        });
      } else {
        // Super admin — create stub without invitation
        const displayParts = (tokens.decodedToken.name ?? "").split(" ");
        await userRef.set({
          uid,
          email,
          firstName: displayParts[0] ?? "",
          lastName: displayParts.slice(1).join(" ") ?? "",
          profileComplete: false,
          companyIds: [],
          appDevRoles: [],
          emailNotifications: true,
          role: "admin",
          createdAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
        });
      }
      profileComplete = false;
    } else {
      profileComplete = userDoc.data()?.profileComplete ?? false;
    }

    return NextResponse.json({ ok: true, profileComplete });
  } catch (error) {
    console.error("Session error:", error);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
