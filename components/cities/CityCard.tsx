import Link from "next/link";
import { Card, CardHeader } from "@/components/ui/card";
import { MapPin } from "lucide-react";
import { City } from "@/types";

interface CityCardProps {
  city: City;
  memberCount?: number;
}

export function CityCard({ city, memberCount }: CityCardProps) {
  return (
    <Link href={`/cities/${city.id}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardHeader className="flex items-center gap-3">
          <MapPin className="h-5 w-5 text-muted-foreground shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm">{city.name}</p>
            {memberCount !== undefined && (
              <p className="text-xs text-muted-foreground">{memberCount} {memberCount === 1 ? "member" : "members"}</p>
            )}
          </div>
        </CardHeader>
      </Card>
    </Link>
  );
}
