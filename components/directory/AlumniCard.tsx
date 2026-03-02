import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { UserProfile, Organization } from "@/types";

interface AlumniCardProps {
  profile: UserProfile;
  organizations: Organization[];
}

export function AlumniCard({ profile, organizations }: AlumniCardProps) {
  const fullName = `${profile.firstName} ${profile.lastName}`;
  const initials = `${profile.firstName[0]}${profile.lastName[0]}`.toUpperCase();

  const alumniOrganizations = organizations.filter((o) => profile.organizationIds.includes(o.id));

  return (
    <Link href={`/profile/${profile.uid}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardContent className="pt-4 flex gap-3">
          <Avatar className="h-12 w-12 shrink-0">
            <AvatarImage src={profile.profilePictureUrl} alt={fullName} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="font-semibold text-sm truncate">{fullName}</p>
            <p className="text-xs text-muted-foreground">Class of {profile.classYear}</p>
            {profile.bio && (
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{profile.bio}</p>
            )}
            {alumniOrganizations.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {alumniOrganizations.map((o) => (
                  <Badge key={o.id} variant="secondary" className="text-xs">
                    {o.name}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
