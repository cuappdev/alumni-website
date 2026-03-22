import { adminDb } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";
import { Post, PostAuthor, PostType } from "@/types";

function serializePost(id: string, data: FirebaseFirestore.DocumentData): Post {
  return {
    ...data,
    id,
    type: data.type ?? "post",
    createdAt: data.createdAt?.toDate?.()?.toISOString() ?? new Date().toISOString(),
  } as Post;
}

export async function getPosts(type?: PostType | PostType[]): Promise<Post[]> {
  let query: FirebaseFirestore.Query = adminDb.collection("posts").orderBy("createdAt", "desc");
  if (Array.isArray(type)) {
    query = query.where("type", "in", type);
  } else if (type) {
    query = query.where("type", "==", type);
  }
  const snap = await query.get();
  const posts = snap.docs.map((d) => serializePost(d.id, d.data()));

  // Batch-fetch unique authors
  const authorIds = [...new Set(posts.map((p) => p.authorId))];
  if (authorIds.length === 0) return posts;

  const authorRefs = authorIds.map((uid) => adminDb.collection("users").doc(uid));
  const authorDocs = await adminDb.getAll(...authorRefs);
  const authorMap = new Map<string, PostAuthor>();
  for (const d of authorDocs) {
    if (d.exists) {
      const u = d.data()!;
      authorMap.set(d.id, {
        uid: d.id,
        firstName: u.firstName,
        lastName: u.lastName,
        classYear: u.classYear,
        graduated: u.graduated,
        profilePictureUrl: u.profilePictureUrl,
      });
    }
  }

  const postsWithAuthors = posts.map((p) => ({ ...p, author: authorMap.get(p.authorId) }));

  // Collect all UIDs needed for RSVP hydration not already in authorMap
  const rsvpUids = [...new Set(
    postsWithAuthors.flatMap((p) => p.type === "event" ? ((p as any).rsvps ?? []) as string[] : [])
  )].filter((uid) => !authorMap.has(uid));

  if (rsvpUids.length > 0) {
    const rsvpRefs = rsvpUids.map((uid) => adminDb.collection("users").doc(uid));
    const rsvpDocs = await adminDb.getAll(...rsvpRefs);
    for (const d of rsvpDocs) {
      if (d.exists) {
        const u = d.data()!;
        authorMap.set(d.id, {
          uid: d.id,
          firstName: u.firstName,
          lastName: u.lastName,
          classYear: u.classYear,
          graduated: u.graduated,
          profilePictureUrl: u.profilePictureUrl,
        });
      }
    }
  }

  // Resolve cityIds on event posts
  const cityIds = [...new Set(
    postsWithAuthors
      .filter((p) => p.type === "event" && (p as any).cityId)
      .map((p) => (p as any).cityId as string)
  )];

  const cityMap = new Map<string, string>();
  if (cityIds.length > 0) {
    const cityRefs = cityIds.map((id) => adminDb.collection("cities").doc(id));
    const cityDocs = await adminDb.getAll(...cityRefs);
    for (const d of cityDocs) {
      if (d.exists) cityMap.set(d.id, d.data()!.name);
    }
  }

  return postsWithAuthors.map((p) => {
    if (p.type !== "event") return p;
    const rsvps: string[] = (p as any).rsvps ?? [];
    const rsvpProfiles = rsvps.map((uid) => authorMap.get(uid)).filter(Boolean) as PostAuthor[];
    const cityName = (p as any).cityId ? cityMap.get((p as any).cityId) : undefined;
    return { ...p, rsvpProfiles, ...(cityName ? { city: cityName } : {}) };
  });
}

export async function toggleRsvp(postId: string, uid: string): Promise<void> {
  const ref = adminDb.collection("posts").doc(postId);
  const snap = await ref.get();
  if (!snap.exists) return;
  const rsvps: string[] = snap.data()!.rsvps ?? [];
  if (rsvps.includes(uid)) {
    await ref.update({ rsvps: FieldValue.arrayRemove(uid) });
  } else {
    await ref.update({ rsvps: FieldValue.arrayUnion(uid) });
  }
}

export async function toggleLike(postId: string, uid: string): Promise<void> {
  const ref = adminDb.collection("posts").doc(postId);
  const snap = await ref.get();
  if (!snap.exists) return;
  const likes: string[] = snap.data()!.likes ?? [];
  if (likes.includes(uid)) {
    await ref.update({ likes: FieldValue.arrayRemove(uid) });
  } else {
    await ref.update({ likes: FieldValue.arrayUnion(uid) });
  }
}
