import Link from "next/link";
import { Card, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Company } from "@/types";

interface CompanyCardProps {
  company: Company;
  memberCount?: number;
}

export function CompanyCard({ company, memberCount }: CompanyCardProps) {
  return (
    <Link href={`/companies/${company.id}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardHeader className="flex items-center gap-3">
          <Avatar className="h-10 w-10 rounded-md">
            <AvatarImage src={company.logoUrl} alt={company.name} />
            <AvatarFallback className="rounded-md text-xs">
              {company.name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm">{company.name}</p>
            {memberCount !== undefined && (
              <p className="text-xs text-muted-foreground">{memberCount} {memberCount === 1 ? "member" : "members"}</p>
            )}
          </div>
        </CardHeader>
      </Card>
    </Link>
  );
}
