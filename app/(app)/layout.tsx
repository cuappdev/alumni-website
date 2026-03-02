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
    </>
  );
}
