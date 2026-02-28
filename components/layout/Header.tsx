"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import { useAuth } from "@/lib/auth/context";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MobileSidebar } from "./MobileSidebar";
import { toast } from "sonner";

const navLinks = [
  { href: "/feed", label: "Feed" },
  { href: "/directory", label: "Directory" },
  { href: "/companies", label: "Companies" },
];

export function Header() {
  const { user, profile } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut(auth);
    await fetch("/api/session", { method: "DELETE" });
    toast.success("Signed out.");
    router.push("/login");
  };

  const initials = profile
    ? `${profile.firstName[0]}${profile.lastName[0]}`.toUpperCase()
    : user?.displayName
      ? user.displayName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
      : "";

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <MobileSidebar />
          <Link href="/feed" className="font-semibold text-sm">
            AppDev Alumni
          </Link>
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-md px-3 py-1.5 text-sm font-medium hover:bg-muted"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                <Avatar className="h-8 w-8 cursor-pointer">
                  <AvatarImage
                    src={profile?.profilePictureUrl}
                    alt={profile ? `${profile.firstName} ${profile.lastName}` : undefined}
                  />
                  <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem asChild>
                <Link href={`/profile/${user.uid}`}>Profile</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  );
}
