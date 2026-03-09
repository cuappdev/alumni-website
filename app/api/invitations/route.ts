import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { Resend } from "resend";
import { Timestamp } from "firebase-admin/firestore";
import { getTokens } from "next-firebase-auth-edge";
import { authConfig } from "@/lib/firebase/auth-edge";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
const isDev = process.env.NODE_ENV === "development";

async function sendInviteEmail(params: {
  to: string;
  firstName: string;
  invitationLink: string;
  inviterEmail: string;
  inviterFirstName: string;
  inviterLastName: string;
}) {
  if (isDev) {
    console.log("\n📬 [DEV] Invitation email (not sent)");
    console.log(`   To:        ${params.to}`);
    console.log(`   Link:      ${params.invitationLink}`);
    console.log(`   Inviter:   ${params.inviterFirstName} ${params.inviterLastName} <${params.inviterEmail}>\n`);
    return;
  }
  const resend = new Resend(process.env.RESEND_API_KEY);
  await resend.emails.send({
    from: "AppDev Alumni <noreply@alumni.cornellappdev.com>",
    to: params.to,
    subject: "You're invited to join the AppDev Alumni Network",
    template: {
      id: "invitation-email",
      variables: {
        firstName: params.firstName,
        invitationLink: params.invitationLink,
        inviterEmail: params.inviterEmail,
        inviterFirstName: params.inviterFirstName,
        inviterLastName: params.inviterLastName,
      },
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    const tokens = await getTokens(request.cookies, authConfig);
    if (!tokens) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const inviterDoc = await adminDb.collection("users").doc(tokens.decodedToken.uid).get();
    const inviterData = inviterDoc.data();
    if (inviterData?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { email, firstName, lastName } = await request.json();
    if (!email || !firstName || !lastName) {
      return NextResponse.json({ error: "Email, firstName, and lastName are required" }, { status: 400 });
    }

    const code = crypto.randomUUID();
    const invitationLink = `${APP_URL}/signup?code=${code}`;

    await sendInviteEmail({
      to: email,
      firstName,
      invitationLink,
      inviterEmail: inviterData?.email ?? tokens.decodedToken.email ?? "",
      inviterFirstName: inviterData?.firstName ?? "",
      inviterLastName: inviterData?.lastName ?? "",
    });

    await adminDb.collection("invitations").doc(code).set({
      code,
      email,
      firstName,
      lastName,
      sentAt: Timestamp.now(),
      sentBy: tokens.decodedToken.uid,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Invitation error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
