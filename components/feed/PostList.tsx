"use client";

import { useEffect, useState } from "react";
import { subscribeToPosts } from "@/lib/firestore/posts";
import { Post } from "@/types";
import { PostCard } from "./PostCard";

export function PostList() {
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    const unsubscribe = subscribeToPosts(setPosts);
    return unsubscribe;
  }, []);

  if (posts.length === 0) {
    return <p className="text-center text-muted-foreground py-12">No posts yet. Be the first!</p>;
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}
