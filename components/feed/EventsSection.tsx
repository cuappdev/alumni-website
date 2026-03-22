"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { CalendarDays, MapPin, ExternalLink, CalendarCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { EventPost, PostAuthor } from "@/types";
import { useAuth } from "@/lib/auth/context";

function EventCard({ post }: { post: EventPost }) {
  const { user, profile } = useAuth();
  const [rsvps, setRsvps] = useState<string[]>(post.rsvps ?? []);
  const [rsvpProfiles, setRsvpProfiles] = useState<PostAuthor[]>(post.rsvpProfiles ?? []);
  const going = user ? rsvps.includes(user.uid) : false;
  const eventDate = new Date(post.eventDate);

  const handleRsvp = async () => {
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
    <Card className="w-72 min-w-72 flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-1.5 text-xs font-medium text-purple-600 dark:text-purple-400 mb-1">
          <CalendarDays className="size-3.5" />
          Event
        </div>
        <CardTitle className="text-base leading-snug line-clamp-2">{post.title}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2 flex-1">
        <div className="flex items-center gap-1.5 text-sm font-medium">
          <CalendarDays className="size-3.5 text-muted-foreground shrink-0" />
          {format(eventDate, "EEE, MMM d · h:mm a")}
        </div>
        {post.city && (
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <MapPin className="size-3.5 shrink-0" />
            {post.city}
          </div>
        )}
        {post.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 whitespace-pre-wrap mt-1">
            {post.description}
          </p>
        )}
        <div className="mt-auto pt-1 space-y-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleRsvp}
              className={`cursor-pointer flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                going
                  ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              <CalendarCheck className="size-3.5" />
              {going ? "Going" : "Mark as going"}
              {rsvps.length > 0 && <span className="ml-0.5">· {rsvps.length}</span>}
            </button>
            {post.url && (
              <a
                href={post.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-blue-600 hover:underline dark:text-blue-400"
              >
                Details <ExternalLink className="size-3" />
              </a>
            )}
          </div>
          {rsvpProfiles.length > 0 && (
            <div className="flex flex-wrap gap-x-2 gap-y-1">
              {rsvpProfiles.map((p) => (
                <Link key={p.uid} href={`/profile/${p.uid}`} className="flex items-center gap-1 group">
                  <Avatar className="size-4">
                    <AvatarImage src={p.profilePictureUrl} alt={`${p.firstName} ${p.lastName}`} />
                    <AvatarFallback className="text-[8px]">{p.firstName[0]}{p.lastName[0]}</AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-muted-foreground group-hover:text-foreground group-hover:underline">
                    {p.firstName}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function EventsSection({ refreshKey }: { refreshKey?: number }) {
  const [posts, setPosts] = useState<EventPost[]>([]);

  useEffect(() => {
    fetch("/api/posts?type=event")
      .then((r) => (r.ok ? r.json() : []))
      .then(setPosts)
      .catch(console.error);
  }, [refreshKey]);

  if (posts.length === 0) return null;

  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold">Events</h2>
      <div className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4">
        {posts.map((post) => (
          <EventCard key={post.id} post={post} />
        ))}
      </div>
    </section>
  );
}
