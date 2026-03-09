import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getTokens } from "next-firebase-auth-edge";
import { adminDb } from "@/lib/firebase/admin";
import { authConfig } from "@/lib/firebase/auth-edge";
import { Header } from "@/components/layout/Header";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const tokens = await getTokens(await cookies(), authConfig);
  if (tokens) {
    const { uid } = tokens.decodedToken;
    const userDoc = await adminDb.collection("users").doc(uid).get();
    if (!userDoc.exists || !userDoc.data()?.profileComplete) {
      redirect("/signup/complete");
    }
  }

  return (
    <>
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
      <footer className="mt-12 py-6 text-center text-xs text-muted-foreground space-y-1">
        <p>&copy; {new Date().getFullYear()} Cornell AppDev Alumni</p>
        <p>
          Feedback?{" "}
          <a href="mailto:admin@alumni.cornellappdev.com" className="hover:underline">
            admin@alumni.cornellappdev.com
          </a>
          {" · "}
          <a href="https://github.com/cuappdev/alumni-website" target="_blank" rel="noopener noreferrer" className="hover:underline">
            GitHub
          </a>
        </p>
      </footer>
    </>
  );
}
