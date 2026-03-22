"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Heart, Briefcase, Megaphone, CalendarDays, MapPin, ExternalLink, CalendarCheck } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth/context";
import { Post, JobPost, EventPost } from "@/types";
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

const TYPE_BADGE: Record<Post["type"], { label: string; className: string; icon: React.ReactNode } | null> = {
  post: null,
  job: {
    label: "Job listing",
    className: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    icon: <Briefcase className="size-3" />,
  },
  announcement: {
    label: "Announcement",
    className: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    icon: <Megaphone className="size-3" />,
  },
  event: {
    label: "Event",
    className: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
    icon: <CalendarDays className="size-3" />,
  },
  joined: null,
};

function JobMeta({ post }: { post: JobPost }) {
  return (
    <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
      <span className="font-medium text-foreground">{post.company}</span>
      {post.city && (
        <span className="flex items-center gap-1">
          <MapPin className="size-3" />
          {post.city}
        </span>
      )}
      {post.applyUrl && (
        <a
          href={post.applyUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-auto flex items-center gap-1 text-blue-600 hover:underline dark:text-blue-400"
          onClick={(e) => e.stopPropagation()}
        >
          Apply <ExternalLink className="size-3" />
        </a>
      )}
    </div>
  );
}

function EventMeta({ post }: { post: EventPost }) {
  const { user, profile } = useAuth();
  const [rsvps, setRsvps] = useState<string[]>(post.rsvps ?? []);
  const [rsvpProfiles, setRsvpProfiles] = useState(post.rsvpProfiles ?? []);
  const going = user ? rsvps.includes(user.uid) : false;
  const date = new Date(post.eventDate);

  const handleRsvp = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user || !profile) return;
    const wasGoing = going;
    setRsvps((prev) => wasGoing ? prev.filter((id) => id !== user.uid) : [...prev, user.uid]);
    if (!wasGoing) {
      setRsvpProfiles((prev) => {
        if (prev.find((p) => p.uid === user.uid)) return prev;
        return [...prev, { uid: user.uid, firstName: profile.firstName, lastName: profile.lastName, classYear: profile.classYear, graduated: profile.graduated, profilePictureUrl: profile.profilePictureUrl }];
      });
    } else {
      setRsvpProfiles((prev) => prev.filter((p) => p.uid !== user.uid));
    }
    await fetch(`/api/posts/${post.id}/rsvp`, { method: "POST" });
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
        <span className="flex items-center gap-1 font-medium text-foreground">
          <CalendarDays className="size-3.5" />
          {format(date, "EEE, MMM d · h:mm a")}
        </span>
        {post.city && (
          <span className="flex items-center gap-1">
            <MapPin className="size-3" />
            {post.city}
          </span>
        )}
        {post.url && (
          <a
            href={post.url}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto flex items-center gap-1 text-blue-600 hover:underline dark:text-blue-400"
            onClick={(e) => e.stopPropagation()}
          >
            Details <ExternalLink className="size-3" />
          </a>
        )}
      </div>
      <div className="space-y-2">
        <button
          type="button"
          onClick={handleRsvp}
          className={`cursor-pointer flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors ${going
            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
            : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
        >
          <CalendarCheck className="size-3.5" />
          {going ? "Going" : "Mark as going"}
          {rsvps.length > 0 && <span className="ml-0.5">· {rsvps.length}</span>}
        </button>
        {rsvpProfiles.length > 0 && (
          <div className="flex flex-wrap gap-x-3 gap-y-1">
            {rsvpProfiles.map((p) => (
              <Link
                key={p.uid}
                href={`/profile/${p.uid}`}
                className="flex items-center gap-1.5 group"
                onClick={(e) => e.stopPropagation()}
              >
                <Avatar className="size-5">
                  <AvatarImage src={p.profilePictureUrl} alt={`${p.firstName} ${p.lastName}`} />
                  <AvatarFallback className="text-[9px]">{p.firstName[0]}{p.lastName[0]}</AvatarFallback>
                </Avatar>
                <span className="text-xs text-muted-foreground group-hover:text-foreground group-hover:underline">
                  {p.firstName} {p.lastName}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function JoinedSpan({ post }: { post: Post }) {
  const { author } = post;
  if (!author) return null;
  const name = `${author.firstName} ${author.lastName}`;
  const initials = `${author.firstName[0]}${author.lastName[0]}`.toUpperCase();
  return (
    <Link
      href={`/profile/${author.uid}`}
      className="flex items-center gap-3 py-2 px-1 rounded-lg hover:bg-muted/50 transition-colors group"
    >
      <Avatar className="size-8 shrink-0">
        <AvatarImage src={author.profilePictureUrl} alt={name} />
        <AvatarFallback className="text-xs">{initials}</AvatarFallback>
      </Avatar>
      <span className="text-sm text-muted-foreground">
        <span className="font-medium text-foreground group-hover:underline">{name}</span>
        {" just joined! "}
        <span className="text-xs">{classLabel(author.classYear, author.graduated ?? false)}</span>
      </span>
      <span className="text-xs text-muted-foreground ml-auto shrink-0">
        {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
      </span>
    </Link>
  );
}

export function PostCard({ post }: { post: Post }) {
  if (post.type === "joined") return <JoinedSpan post={post} />;
  const { user } = useAuth();
  const [likes, setLikes] = useState<string[]>(post.likes);
  const liked = user ? likes.includes(user.uid) : false;

  const handleLike = async () => {
    if (!user) return;
    setLikes((prev) => (liked ? prev.filter((id) => id !== user.uid) : [...prev, user.uid]));
    await fetch(`/api/posts/${post.id}/like`, { method: "POST" });
  };

  const createdAt = new Date(post.createdAt);
  const { author } = post;
  const authorName = author ? `${author.firstName} ${author.lastName}` : null;
  const initials = author ? `${author.firstName[0]}${author.lastName[0]}`.toUpperCase() : "?";
  const classLabelText = classLabel(author?.classYear ?? 0, author?.graduated ?? false);

  const badge = TYPE_BADGE[post.type];

  return (
    <Card className="gap-6">
      <CardHeader className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
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
          {badge && (
            <span
              className={`flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${badge.className}`}
            >
              {badge.icon}
              {badge.label}
            </span>
          )}
        </div>
        <CardTitle>{post.title}</CardTitle>
        {post.type === "job" && <JobMeta post={post} />}
        {post.type === "event" && <EventMeta post={post} />}
      </CardHeader>
      <CardContent>
        <p className="text-sm whitespace-pre-wrap">{linkify(post.description)}</p>
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
