import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { Resend } from "resend";
import { SUPER_ADMIN_EMAIL } from "@/lib/constants";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
const isDev = process.env.NODE_ENV === "development";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 });

    if (email !== SUPER_ADMIN_EMAIL) {
      // Allow existing members or those with a valid (unused) invitation
      const [userSnap, invSnap] = await Promise.all([
        adminDb.collection("users").where("email", "==", email).where("profileComplete", "==", true).get(),
        adminDb.collection("invitations").where("email", "==", email).get(),
      ]);

      const hasAccount = !userSnap.empty;
      const hasValidInvitation = !invSnap.empty && !invSnap.docs[0].data().usedAt;

      if (!hasAccount && !hasValidInvitation) {
        return NextResponse.json(
          { error: "No account found for this email." },
          { status: 404 }
        );
      }
    }

    const link = await adminAuth.generateSignInWithEmailLink(email, {
      url: `${APP_URL}/login/verify`,
      handleCodeInApp: true,
    });

    if (isDev) {
      console.log("\n📬 [DEV] Magic sign-in link (not sent)");
      console.log(`   To:   ${email}`);
      console.log(`   Link: ${link}\n`);
    } else {
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from: "AppDev Alumni <noreply@alumni.cornellappdev.com>",
        to: email,
        subject: "Your sign-in link for Cornell AppDev Alumni",
        html: `<p>Hi,</p><p>Click the link below to sign in. This link expires in 1 hour and can only be used once.</p><p><a href="${link}">Sign in to AppDev Alumni</a></p><p>If you didn't request this, you can ignore this email.</p>`,
      });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Send link error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
