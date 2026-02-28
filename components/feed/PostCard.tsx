"use client";

import { Heart } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toggleLike } from "@/lib/firestore/posts";
import { useAuth } from "@/lib/auth/context";
import { Post } from "@/types";

export function PostCard({ post }: { post: Post }) {
  const { user } = useAuth();
  const liked = user ? post.likes.includes(user.uid) : false;

  const handleLike = async () => {
    if (!user) return;
    await toggleLike(post.id, user.uid, liked);
  };

  const createdAt = post.createdAt?.toDate?.();

  return (
    <Card>
      <CardHeader>
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
          {post.likes.length}
        </Button>
      </CardFooter>
    </Card>
  );
}
