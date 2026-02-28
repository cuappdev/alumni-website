"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { toast } from "sonner";

const navLinks = [
  { href: "/feed", label: "Feed" },
  { href: "/directory", label: "Directory" },
  { href: "/companies", label: "Companies" },
];

export function MobileSidebar() {
  const router = useRouter();

  const handleLogout = async () => {
    await signOut(auth);
    await fetch("/api/session", { method: "DELETE" });
    toast.success("Signed out.");
    router.push("/login");
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Open menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64">
        <SheetHeader>
          <SheetTitle>AppDev Alumni</SheetTitle>
        </SheetHeader>
        <nav className="mt-6 flex flex-col gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-md px-3 py-2 text-sm font-medium hover:bg-muted"
            >
              {link.label}
            </Link>
          ))}
          <button
            onClick={handleLogout}
            className="rounded-md px-3 py-2 text-sm font-medium text-left hover:bg-muted text-destructive"
          >
            Sign out
          </button>
        </nav>
      </SheetContent>
    </Sheet>
  );
}
