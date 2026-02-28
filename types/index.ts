import { Timestamp } from "firebase/firestore";

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
  companyIds: string[];
  appDevRoles: AppDevRole[];
  role?: "admin" | "member";
  emailNotifications: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Company {
  id: string;
  name: string;
  logoUrl?: string;
}

export interface Post {
  id: string;
  authorId: string;
  title: string;
  description: string;
  likes: string[];
  createdAt: Timestamp;
}

// Doc ID = invite code (UUID). Readable by anyone who knows the code.
export interface Invitation {
  code: string;
  email: string;
  sentAt: Timestamp;
  usedAt?: Timestamp;
  sentBy: string;
}
