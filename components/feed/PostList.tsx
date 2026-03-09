"use client";

import { useEffect, useState } from "react";
import { Post } from "@/types";
import { PostCard } from "./PostCard";

export function PostList({ refreshKey }: { refreshKey?: number }) {
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    fetch("/api/posts")
      .then((r) => (r.ok ? r.json() : []))
      .then(setPosts)
      .catch(console.error);
  }, [refreshKey]);

  if (posts.length === 0) {
    return <p className="text-center text-muted-foreground py-12">No posts yet. Be the first!</p>;
  }

  return (
    <div className="space-y-4 mx-auto max-w-[600px]">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}
