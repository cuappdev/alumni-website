import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { Resend } from "resend";
import { Timestamp } from "firebase-admin/firestore";

const resend = new Resend(process.env.RESEND_API_KEY);
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
const isDev = process.env.NODE_ENV === "development";

async function sendPostNotifications(
  subscribers: { email: string }[],
  title: string,
  description: string
) {
  const feedLink = `${APP_URL}/feed`;

  if (isDev) {
    console.log(`\n📬 [DEV] Post notification (not sent)`);
    console.log(`   Title:  ${title}`);
    console.log(`   To:     ${subscribers.map((u) => u.email).join(", ")}`);
    console.log(`   Link:   ${feedLink}\n`);
    return;
  }

  await resend.batch.send(
    subscribers.map((u) => ({
      from: "AppDev Alumni <noreply@alumni.cornellappdev.com>",
      to: u.email,
      subject: `New post: ${title}`,
      html: `
        <h2>${title}</h2>
        <p>${description}</p>
        <p><a href="${feedLink}">View in feed</a></p>
      `,
    }))
  );
}

export async function POST(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get("__session")?.value;
    if (!sessionCookie) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = await adminAuth.verifySessionCookie(sessionCookie, true);
    const { title, description } = await request.json();

    if (!title || !description) {
      return NextResponse.json({ error: "Title and description required" }, { status: 400 });
    }

    const postRef = await adminDb.collection("posts").add({
      authorId: decoded.uid,
      title,
      description,
      likes: [],
      createdAt: Timestamp.now(),
    });

    const usersSnap = await adminDb.collection("users").get();
    const subscribers = usersSnap.docs
      .map((d) => d.data())
      .filter((u) => u.emailNotifications !== false && u.email);

    if (subscribers.length > 0) {
      await sendPostNotifications(subscribers as { email: string }[], title, description);
    }

    return NextResponse.json({ id: postRef.id });
  } catch (error) {
    console.error("Post creation error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
