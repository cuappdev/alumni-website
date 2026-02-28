import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { Resend } from "resend";
import { Timestamp } from "firebase-admin/firestore";

const resend = new Resend(process.env.RESEND_API_KEY);
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
const isDev = process.env.NODE_ENV === "development";

async function sendInviteEmail(to: string, signupLink: string) {
  if (isDev) {
    console.log("\n📬 [DEV] Invitation email (not sent)");
    console.log(`   To:      ${to}`);
    console.log(`   Link:    ${signupLink}\n`);
    return;
  }
  await resend.emails.send({
    from: "AppDev Alumni <noreply@alumni.cornellappdev.com>",
    to,
    subject: "You're invited to join the AppDev Alumni",
    html: `
      <p>You've been invited to join our private alumni network.</p>
      <p><a href="${signupLink}">Click here to create your account</a></p>
      <p>This link is unique to you — please don't share it.</p>
    `,
  });
}

export async function POST(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get("__session")?.value;
    if (!sessionCookie) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = await adminAuth.verifySessionCookie(sessionCookie, true);
    const userDoc = await adminDb.collection("users").doc(decoded.uid).get();
    const userData = userDoc.data();

    if (!userData || userData.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { email } = await request.json();
    if (!email) {
      return NextResponse.json({ error: "Email required" }, { status: 400 });
    }

    const code = crypto.randomUUID();
    const signupLink = `${APP_URL}/signup?code=${code}`;

    await sendInviteEmail(email, signupLink);

    await adminDb.collection("invitations").doc(code).set({
      code,
      email,
      sentAt: Timestamp.now(),
      sentBy: decoded.uid,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Invitation error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
