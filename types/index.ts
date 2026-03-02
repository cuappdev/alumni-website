export const APPDEV_ROLES = ["iOS", "Android", "Backend", "Design", "Marketing"] as const;
export type AppDevRole = (typeof APPDEV_ROLES)[number];

export interface UserProfile {
  uid: string;
  firstName: string;
  lastName: string;
  email: string;
  classYear: number;
  bio?: string;
  profilePictureUrl?: string;
  phoneNumber?: string;
  organizationIds: string[];
  appDevRoles: AppDevRole[];
  role?: "admin" | "member";
  emailNotifications: boolean;
  profileComplete: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Organization {
  id: string;
  name: string;
  logoUrl?: string;
}

export interface PostAuthor {
  uid: string;
  firstName: string;
  lastName: string;
  classYear: number;
  profilePictureUrl?: string;
}

export interface Post {
  id: string;
  authorId: string;
  title: string;
  description: string;
  likes: string[];
  createdAt: string;
  author?: PostAuthor;
}

// Doc ID = invite code (UUID). Readable by anyone who knows the code.
export interface Invitation {
  code: string;
  email: string;
  firstName: string;
  lastName: string;
  sentAt: string;
  usedAt?: string;
  sentBy: string;
}
