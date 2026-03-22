import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { Resend } from "resend";
import { Timestamp } from "firebase-admin/firestore";
import { getTokens } from "next-firebase-auth-edge";
import { authConfig } from "@/lib/firebase/auth-edge";
import { getPosts } from "@/lib/firestore/posts";
import { z } from "zod";
import { PostType } from "@/types";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
const isDev = process.env.NODE_ENV === "development";

const ADMIN_TYPES: PostType[] = ["announcement", "event"];

const postSchema = z
  .object({
    type: z.enum(["post", "job", "announcement", "event"]),
    title: z.string().min(1, "Title is required"),
    description: z.string().min(1, "Description is required"),
    // job fields
    company: z.string().optional(),
    city: z.string().optional(),
    applyUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
    // event fields
    eventDate: z.string().optional(),
    cityId: z.string().optional(),
    url: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  })
  .superRefine((data, ctx) => {
    if (data.type === "job" && !data.company) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Company is required", path: ["company"] });
    }
    if (data.type === "event" && !data.eventDate) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Event date is required", path: ["eventDate"] });
    }
  });

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

  const validTypes: PostType[] = ["post", "job", "announcement", "event", "joined"];
  const typeParam = request.nextUrl.searchParams.get("type");
  const types = typeParam
    ? (typeParam.split(",").filter((t) => validTypes.includes(t as PostType)) as PostType[])
    : null;
  const filter = types && types.length === 1 ? types[0] : types?.length ? types : undefined;
  const posts = await getPosts(filter);
  return NextResponse.json(posts);
}

export async function POST(request: NextRequest) {
  try {
    const tokens = await getTokens(request.cookies, authConfig);
    if (!tokens) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const parsed = postSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const data = parsed.data;

    if (ADMIN_TYPES.includes(data.type as PostType)) {
      const userDoc = await adminDb.collection("users").doc(tokens.decodedToken.uid).get();
      if (!userDoc.exists || userDoc.data()?.role !== "admin") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    const { type, title, description, company, city, applyUrl, eventDate, cityId, url } = data;

    const postData: Record<string, unknown> = {
      authorId: tokens.decodedToken.uid,
      type,
      title,
      description,
      likes: [],
      createdAt: Timestamp.now(),
    };

    if (type === "job") {
      postData.company = company;
      if (city) postData.city = city;
      if (applyUrl) postData.applyUrl = applyUrl;
    }
    if (type === "event") {
      postData.eventDate = eventDate;
      postData.rsvps = [];
      if (cityId) postData.cityId = cityId;
      if (url) postData.url = url;
    }

    await adminDb.collection("posts").add(postData);

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
