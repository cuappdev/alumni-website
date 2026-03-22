"use client";

import { useEffect, useState } from "react";
import { Post, PostType } from "@/types";
import { PostCard } from "./PostCard";

interface PostListProps {
  refreshKey?: number;
  type?: PostType | PostType[];
}

export function PostList({ refreshKey, type }: PostListProps) {
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    const typeParam = Array.isArray(type) ? type.join(",") : type;
    const url = typeParam ? `/api/posts?type=${typeParam}` : "/api/posts";
    fetch(url)
      .then((r) => (r.ok ? r.json() : []))
      .then(setPosts)
      .catch(console.error);
  }, [refreshKey, type]);

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
