import {
  collection,
  addDoc,
  onSnapshot,
  orderBy,
  query,
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { Post } from "@/types";

export async function createPost(
  authorId: string,
  title: string,
  description: string
): Promise<string> {
  const ref = await addDoc(collection(db, "posts"), {
    authorId,
    title,
    description,
    likes: [],
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export function subscribeToPosts(callback: (posts: Post[]) => void): () => void {
  const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
  return onSnapshot(q, (snap) => {
    const posts = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Post));
    callback(posts);
  });
}

export async function toggleLike(postId: string, uid: string, liked: boolean): Promise<void> {
  const ref = doc(db, "posts", postId);
  await updateDoc(ref, {
    likes: liked ? arrayRemove(uid) : arrayUnion(uid),
  });
}
