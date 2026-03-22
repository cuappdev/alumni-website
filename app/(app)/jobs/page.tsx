"use client";

import { useState } from "react";
import { PostList } from "@/components/feed/PostList";
import { CreatePostDialog } from "@/components/feed/CreatePostDialog";

export default function JobsPage() {
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Jobs</h1>
        <CreatePostDialog
          onSuccess={() => setRefreshKey((k) => k + 1)}
          allowedTypes={["job"]}
          defaultType="job"
          label="Post a job"
        />
      </div>
      <PostList refreshKey={refreshKey} type="job" />
    </div>
  );
}
