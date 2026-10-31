import { Link } from "@tanstack/react-router";
import { Activity } from "lucide-react";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link to="/" className={`flex items-center gap-2 ${className}`}>
      <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-primary shadow-soft">
        <Activity className="h-5 w-5 text-primary-foreground" strokeWidth={2.5} />
      </div>
      <div className="leading-none">
        <div className="text-xl font-bold tracking-tight text-foreground">AYURA</div>
        <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Smart Care</div>
      </div>
    </Link>
  );
}
