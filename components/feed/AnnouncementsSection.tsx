"use client";

import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Megaphone } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AnnouncementPost } from "@/types";

function AnnouncementCard({ post }: { post: AnnouncementPost }) {
  return (
    <Card className="w-72 min-w-72 flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-1.5 text-xs font-medium text-amber-600 dark:text-amber-400 mb-1">
          <Megaphone className="size-3.5" />
          Announcement
        </div>
        <CardTitle className="text-base leading-snug line-clamp-2">{post.title}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 flex-1">
        <p className="text-sm text-muted-foreground line-clamp-3 whitespace-pre-wrap">
          {post.description}
        </p>
        {post.author && (
          <p className="text-xs text-muted-foreground mt-auto">
            {post.author.firstName} {post.author.lastName} ·{" "}
            {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export function AnnouncementsSection({ refreshKey }: { refreshKey?: number }) {
  const [posts, setPosts] = useState<AnnouncementPost[]>([]);

  useEffect(() => {
    fetch("/api/posts?type=announcement")
      .then((r) => (r.ok ? r.json() : []))
      .then(setPosts)
      .catch(console.error);
  }, [refreshKey]);

  if (posts.length === 0) return null;

  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold">Announcements</h2>
      <div className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4">
        {posts.map((post) => (
          <AnnouncementCard key={post.id} post={post} />
        ))}
      </div>
    </section>
  );
}
