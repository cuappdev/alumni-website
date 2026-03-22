"use client";

import { useState } from "react";
import { PostList } from "@/components/feed/PostList";
import { CreatePostDialog } from "@/components/feed/CreatePostDialog";
import { AnnouncementsSection } from "@/components/feed/AnnouncementsSection";
import { EventsSection } from "@/components/feed/EventsSection";

export default function FeedPage() {
  const [refreshKey, setRefreshKey] = useState(0);
  const refresh = () => setRefreshKey((k) => k + 1);

  return (
    <div className="space-y-8">
      <AnnouncementsSection refreshKey={refreshKey} />
      <EventsSection refreshKey={refreshKey} />

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Posts</h1>
          <CreatePostDialog
            onSuccess={refresh}
            allowedTypes={["post", "announcement", "event"]}
            defaultType="post"
          />
        </div>
        <PostList refreshKey={refreshKey} type={["post", "joined"]} />
      </section>
    </div>
  );
}
