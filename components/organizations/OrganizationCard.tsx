import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Organization } from "@/types";

export function OrganizationCard({ organization }: { organization: Organization }) {
  return (
    <Card>
      <CardContent className="pt-4 flex items-center gap-3">
        <Avatar className="h-10 w-10 rounded-md">
          <AvatarImage src={organization.logoUrl} alt={organization.name} />
          <AvatarFallback className="rounded-md text-xs">
            {organization.name.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <p className="font-medium text-sm">{organization.name}</p>
      </CardContent>
    </Card>
  );
}
