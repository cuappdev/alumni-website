"use client";

import { APPDEV_ROLES, AppDevRole } from "@/types";
import { cn } from "@/lib/utils";

interface AppDevRoleSelectorProps {
  selected: AppDevRole[];
  onChange: (roles: AppDevRole[]) => void;
}

export function AppDevRoleSelector({ selected, onChange }: AppDevRoleSelectorProps) {
  const toggle = (role: AppDevRole) => {
    if (selected.includes(role)) {
      onChange(selected.filter((r) => r !== role));
    } else {
      onChange([...selected, role]);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {APPDEV_ROLES.map((role) => (
        <button
          key={role}
          type="button"
          onClick={() => toggle(role)}
          className={cn(
            "rounded-full px-3 py-1 text-sm border transition-colors",
            selected.includes(role)
              ? "bg-primary text-primary-foreground border-primary"
              : "border-input hover:bg-muted"
          )}
        >
          {role}
        </button>
      ))}
    </div>
  );
}
