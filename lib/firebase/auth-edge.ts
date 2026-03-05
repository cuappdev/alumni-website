const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY;

if (!projectId || !clientEmail || !privateKey) {
  throw new Error("Missing Firebase credentials");
}

export const authConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  cookieName: "__session",
  cookieSignatureKeys: [
    process.env.COOKIE_SECRET_CURRENT ?? "dev-secret-change-in-production",
  ],
  cookieSerializeOptions: {
    path: "/",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge: 60 * 60 * 24 * 14, // 14 days
  },
  serviceAccount: {
    projectId,
    clientEmail,
    privateKey: privateKey.replace(/\\n/g, "\n"),
  },
};
