import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export function StatCard({
  icon: Icon, label, value, sub, tone = "primary", children,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  sub?: string;
  tone?: "primary" | "success" | "warning" | "accent";
  children?: ReactNode;
}) {
  const toneMap = {
    primary: "bg-primary/10 text-primary",
    success: "bg-success/10 text-success",
    warning: "bg-warning/15 text-warning",
    accent: "bg-accent/30 text-accent-foreground",
  } as const;
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-card transition hover:shadow-soft">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-sm font-medium text-muted-foreground">{label}</div>
          <div className="mt-2 text-3xl font-bold tracking-tight text-foreground">{value}</div>
          {sub && <div className="mt-1 text-xs text-muted-foreground">{sub}</div>}
        </div>
        <div className={`grid h-11 w-11 place-items-center rounded-xl ${toneMap[tone]}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      {children && <div className="mt-4">{children}</div>}
    </div>
  );
}
