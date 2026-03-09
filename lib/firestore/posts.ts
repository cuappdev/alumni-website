import { adminDb } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";
import { Post, PostAuthor } from "@/types";

function serializePost(id: string, data: FirebaseFirestore.DocumentData): Post {
  return {
    ...data,
    id,
    createdAt: data.createdAt?.toDate?.()?.toISOString() ?? new Date().toISOString(),
  } as Post;
}

export async function getPosts(): Promise<Post[]> {
  const snap = await adminDb.collection("posts").orderBy("createdAt", "desc").get();
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

  return posts.map((p) => ({ ...p, author: authorMap.get(p.authorId) }));
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
