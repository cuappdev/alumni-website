import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { Resend } from "resend";
import { Timestamp } from "firebase-admin/firestore";
import { getTokens } from "next-firebase-auth-edge";
import { authConfig } from "@/lib/firebase/auth-edge";
import { getPosts } from "@/lib/firestore/posts";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
const isDev = process.env.NODE_ENV === "development";

async function sendPostNotifications(
  subscribers: { email: string }[],
  title: string,
  description: string,
  authorName: string
) {
  const feedLink = `${APP_URL}/feed`;

  if (isDev) {
    console.log(`\n📬 [DEV] Post notification (not sent)`);
    console.log(`   Author: ${authorName}`);
    console.log(`   Title:  ${title}`);
    console.log(`   To:     ${subscribers.map((u) => u.email).join(", ")}`);
    console.log(`   Link:   ${feedLink}\n`);
    return;
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  await resend.batch.send(
    subscribers.map((u) => ({
      from: `${authorName} (via AppDev Alumni) <noreply@alumni.cornellappdev.com>`,
      to: u.email,
      subject: `New post: ${title}`,
      html: `
        <p><strong>${authorName}</strong> posted:</p>
        <h2>${title}</h2>
        <p>${description}</p>
        <p><a href="${feedLink}">View in feed</a></p>
      `,
    }))
  );
}

export async function GET(request: NextRequest) {
  const tokens = await getTokens(request.cookies, authConfig);
  if (!tokens) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const posts = await getPosts();
  return NextResponse.json(posts);
}

export async function POST(request: NextRequest) {
  try {
    const tokens = await getTokens(request.cookies, authConfig);
    if (!tokens) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { title, description } = await request.json();

    if (!title || !description) {
      return NextResponse.json({ error: "Title and description required" }, { status: 400 });
    }

    await adminDb.collection("posts").add({
      authorId: tokens.decodedToken.uid,
      title,
      description,
      likes: [],
      createdAt: Timestamp.now(),
    });

    const usersSnap = await adminDb.collection("users").get();
    const allUsers = usersSnap.docs.map((d) => d.data());

    const author = allUsers.find((u) => u.uid === tokens.decodedToken.uid);
    const authorName = author ? `${author.firstName} ${author.lastName}` : "Someone";

    const subscribers = allUsers.filter((u) => u.emailNotifications === true && u.email);

    if (subscribers.length > 0) {
      await sendPostNotifications(subscribers as { email: string }[], title, description, authorName);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Post creation error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
