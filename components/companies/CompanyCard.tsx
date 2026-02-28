import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Company } from "@/types";

export function CompanyCard({ company }: { company: Company }) {
  return (
    <Card>
      <CardContent className="pt-4 flex items-center gap-3">
        <Avatar className="h-10 w-10 rounded-md">
          <AvatarImage src={company.logoUrl} alt={company.name} />
          <AvatarFallback className="rounded-md text-xs">
            {company.name.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <p className="font-medium text-sm">{company.name}</p>
      </CardContent>
    </Card>
  );
}
