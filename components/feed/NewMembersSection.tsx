"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Sparkles } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { JoinedPost } from "@/types";
import { classLabel } from "@/lib/utils";

function NewMemberCard({ post }: { post: JoinedPost }) {
  const { author } = post;
  if (!author) return null;

  const name = `${author.firstName} ${author.lastName}`;
  const initials = `${author.firstName[0]}${author.lastName[0]}`.toUpperCase();

  return (
    <Link href={`/profile/${author.uid}`}>
      <Card className="w-52 min-w-52 hover:bg-muted/50 transition-colors cursor-pointer">
        <CardContent className="pt-4 flex flex-col items-center text-center gap-2">
          <Avatar className="size-12">
            <AvatarImage src={author.profilePictureUrl} alt={name} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium leading-tight">{name}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {classLabel(author.classYear, author.graduated ?? false)}
            </p>
          </div>
          <p className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}

export function NewMembersSection({ refreshKey }: { refreshKey?: number }) {
  const [posts, setPosts] = useState<JoinedPost[]>([]);

  useEffect(() => {
    fetch("/api/posts?type=joined")
      .then((r) => (r.ok ? r.json() : []))
      .then(setPosts)
      .catch(console.error);
  }, [refreshKey]);

  if (posts.length === 0) return null;

  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold flex items-center gap-2">
        <Sparkles className="size-4 text-muted-foreground" />
        New members
      </h2>
      <div className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4">
        {posts.map((post) => (
          <NewMemberCard key={post.id} post={post} />
        ))}
      </div>
    </section>
  );
}
