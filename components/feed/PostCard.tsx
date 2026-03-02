"use client";

import { useState } from "react";
import Link from "next/link";
import { Heart } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth/context";
import { Post } from "@/types";

export function PostCard({ post }: { post: Post }) {
  const { user } = useAuth();
  const [likes, setLikes] = useState<string[]>(post.likes);
  const liked = user ? likes.includes(user.uid) : false;

  const handleLike = async () => {
    if (!user) return;
    setLikes((prev) => (liked ? prev.filter((id) => id !== user.uid) : [...prev, user.uid]));
    await fetch(`/api/posts/${post.id}/like`, { method: "POST" });
  };

  const createdAt = post.createdAt ? new Date(post.createdAt) : null;
  const { author } = post;
  const authorName = author ? `${author.firstName} ${author.lastName}` : null;
  const initials = author
    ? `${author.firstName[0]}${author.lastName[0]}`.toUpperCase()
    : "?";
  const classYearTag = author ? `'${String(author.classYear).slice(-2)}` : null;

  return (
    <Card>
      <CardHeader className="pb-2">
        {author && (
          <Link
            href={`/profile/${author.uid}`}
            className="flex items-center gap-2 mb-2 w-fit group"
          >
            <Avatar className="h-7 w-7">
              <AvatarImage src={author.profilePictureUrl} alt={authorName ?? ""} />
              <AvatarFallback className="text-xs">{initials}</AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium group-hover:underline">{authorName}</span>
            <span className="text-sm text-muted-foreground">{classYearTag}</span>
          </Link>
        )}
        <CardTitle className="text-base">{post.title}</CardTitle>
        {createdAt && (
          <p className="text-xs text-muted-foreground">
            {formatDistanceToNow(createdAt, { addSuffix: true })}
          </p>
        )}
      </CardHeader>
      <CardContent>
        <p className="text-sm whitespace-pre-wrap">{post.description}</p>
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
    </Card>
  );
}
