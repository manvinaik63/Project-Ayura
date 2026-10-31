import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard, MessageCircle, FileText, HeartPulse, Bell, Settings, LogOut, Menu, Mic
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { Logo } from "./Logo";
import { Button } from "@/components/ui/button";

const nav = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/assistant", label: "AYURA AI", icon: MessageCircle },
  { to: "/reports", label: "Medical Reports", icon: FileText },
  { to: "/caretaker", label: "Caretaker", icon: HeartPulse },
  { to: "/notifications", label: "Notifications", icon: Bell },
  { to: "/settings", label: "Settings", icon: Settings },
];

export function AppShell({ children, title }: { children: ReactNode; title?: string }) {
  const [open, setOpen] = useState(false);
  const path = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="flex min-h-screen bg-muted/30">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-72 transform border-r border-sidebar-border bg-sidebar transition-transform lg:relative lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center px-6">
          <Logo />
        </div>
        <nav className="flex flex-col gap-1 px-4 py-2">
          {nav.map((item) => {
            const active = path === item.to || path.startsWith(item.to + "/");
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-base font-medium transition ${
                  active
                    ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-soft"
                    : "text-sidebar-foreground hover:bg-sidebar-accent"
                }`}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="absolute bottom-4 left-4 right-4">
          <Link
            to="/login"
            className="flex items-center gap-3 rounded-xl px-4 py-3 text-base font-medium text-muted-foreground hover:bg-sidebar-accent"
          >
            <LogOut className="h-5 w-5" /> Sign out
          </Link>
        </div>
      </aside>

      {open && (
        <div
          className="fixed inset-0 z-30 bg-foreground/30 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <div className="flex min-h-screen flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b border-border bg-background/80 px-4 backdrop-blur lg:px-8">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="h-6 w-6" />
          </Button>
          {title && <h1 className="text-xl font-semibold tracking-tight">{title}</h1>}
          <div className="ml-auto flex items-center gap-2">
            <Button variant="ghost" size="icon" aria-label="Notifications">
              <Bell className="h-5 w-5" />
            </Button>
            <div className="grid h-9 w-9 place-items-center rounded-full bg-gradient-primary text-sm font-semibold text-primary-foreground">
              R
            </div>
          </div>
        </header>

        <main className="flex-1 px-4 py-6 lg:px-8 lg:py-8">{children}</main>

        {/* Floating voice assistant */}
        <Link
          to="/assistant"
          aria-label="Talk to AYURA"
          className="fixed bottom-6 right-6 z-30 grid h-14 w-14 place-items-center rounded-full bg-gradient-primary text-primary-foreground shadow-soft transition hover:scale-105"
        >
          <Mic className="h-6 w-6" />
        </Link>
      </div>
    </div>
  );
}
