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
  currentCompanyIds: string[];
  appDevRoles: AppDevRole[];
  cityId?: string;
  graduated?: boolean;
  linkedinUrl?: string;
  instagramUrl?: string;
  role?: "admin" | "member";
  emailNotifications: boolean;
  profileComplete: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Company {
  id: string;
  name: string;
  logoUrl?: string;
}

export interface City {
  id: string;
  name: string;
}

export interface PostAuthor {
  uid: string;
  firstName: string;
  lastName: string;
  classYear: number;
  graduated?: boolean;
  profilePictureUrl?: string;
}

export type PostType = "post" | "job" | "announcement" | "event" | "joined";

interface PostBase {
  id: string;
  authorId: string;
  type: PostType;
  title: string;
  description: string;
  likes: string[];
  createdAt: string;
  author?: PostAuthor;
}

export interface RegularPost extends PostBase { type: "post"; }

export interface JobPost extends PostBase {
  type: "job";
  company: string;
  city?: string;
  applyUrl?: string;
}

export interface AnnouncementPost extends PostBase { type: "announcement"; }

export interface EventPost extends PostBase {
  type: "event";
  eventDate: string;
  cityId?: string;
  city?: string;
  url?: string;
  rsvps: string[];
  rsvpProfiles?: PostAuthor[];
}

export interface JoinedPost extends PostBase { type: "joined"; }

export type Post = RegularPost | JobPost | AnnouncementPost | EventPost | JoinedPost;

// Doc ID = invite code (UUID). Readable by anyone who knows the code.
export interface Invitation {
  code: string;
  email: string;
  firstName: string;
  lastName: string;
  graduated: boolean;
  sentAt: string;
  usedAt?: string;
  sentBy: string;
}
