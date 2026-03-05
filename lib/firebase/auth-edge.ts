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
    get projectId() {
      return process.env.FIREBASE_PROJECT_ID!;
    },
    get clientEmail() {
      return process.env.FIREBASE_CLIENT_EMAIL!;
    },
    get privateKey() {
      return process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, "\n");
    },
  },
};
