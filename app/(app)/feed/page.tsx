"use client";

import { useState } from "react";
import { PostList } from "@/components/feed/PostList";
import { CreatePostDialog } from "@/components/feed/CreatePostDialog";

export default function FeedPage() {
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Posts</h1>
        <CreatePostDialog onSuccess={() => setRefreshKey((k) => k + 1)} />
      </div>
      <PostList refreshKey={refreshKey} />
    </div>
  );
}
