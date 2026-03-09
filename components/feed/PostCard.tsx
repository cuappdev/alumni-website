"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Heart } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth/context";
import { Post } from "@/types";
import { classLabel } from "@/lib/utils";

const URL_REGEX = /https?:\/\/[^\s<>"]+[^\s<>".,;:!?)]/g;

function linkify(text: string) {
  const parts: React.ReactNode[] = [];
  let last = 0;
  for (const match of text.matchAll(URL_REGEX)) {
    if (match.index > last) parts.push(text.slice(last, match.index));
    parts.push(
      <a
        key={match.index}
        href={match[0]}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 hover:underline dark:text-blue-400"
        onClick={(e) => e.stopPropagation()}
      >
        {match[0]}
      </a>
    );
    last = match.index + match[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}

export function PostCard({ post }: { post: Post }) {
  const { user } = useAuth();
  const [likes, setLikes] = useState<string[]>(post.likes);
  const liked = user ? likes.includes(user.uid) : false;

  const handleLike = async () => {
    if (!user) return;
    setLikes((prev) => (liked ? prev.filter((id) => id !== user.uid) : [...prev, user.uid]));
    await fetch(`/api/posts/${post.id}/like`, { method: "POST" });
  };

  const createdAt = new Date(post.createdAt)
  const { author } = post;
  const authorName = author ? `${author.firstName} ${author.lastName}` : null;
  const initials = author
    ? `${author.firstName[0]}${author.lastName[0]}`.toUpperCase()
    : "?";
  const classLabelText = classLabel(author?.classYear ?? 0, author?.graduated ?? false);

  return (
    <Card>
      <CardHeader className="flex flex-col gap-4">
        {author && (
          <Link href={`/profile/${author.uid}`} className="flex flex-row gap-2 group">
            <Avatar className="size-9">
              <AvatarImage src={author.profilePictureUrl} alt={authorName ?? ""} />
              <AvatarFallback className="text-xs">{initials}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <div className="flex flex-row gap-2">
                <span className="text-sm font-medium group-hover:underline">{authorName}</span>
                <span className="text-sm text-muted-foreground">{classLabelText}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(createdAt, { addSuffix: true })}
              </p>
            </div>
          </Link>
        )}
        <CardTitle>{post.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm whitespace-pre-wrap">
          {linkify(post.description)}
        </p>
      </CardContent>
      <CardFooter>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLike}
          className={liked ? "text-red-500 hover:text-red-600" : ""}
        >
          <Heart className={`mr-1 h-4 w-4 ${liked ? "fill-current" : ""}`} />
          {likes.length}
        </Button>
      </CardFooter>
    </Card >
  );
}
