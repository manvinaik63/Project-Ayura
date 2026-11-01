import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard, MessageCircle, FileText, HeartPulse, Bell, Settings, LogOut, Menu, Mic, Siren, Gauge,
} from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Logo } from "./Logo";
import { Button } from "@/components/ui/button";
import { apiFetch, clearAuth, getToken, getUser } from "@/lib/api";
import { speak } from "@/lib/voice";

const nav = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/assistant", label: "AYURA AI", icon: MessageCircle },
  { to: "/reports", label: "Medical Reports", icon: FileText },
  { to: "/caretaker", label: "Caretaker", icon: HeartPulse },
  { to: "/notifications", label: "Reminders", icon: Bell },
  { to: "/settings", label: "Settings", icon: Settings },
  // Uncomment after you create src/routes/metrics.tsx in Step 7e:
  // { to: "/metrics", label: "How accurate?", icon: Gauge },
];

export function AppShell({ children, title }: { children: ReactNode; title?: string }) {
  const [open, setOpen] = useState(false);
  const path = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const [initial, setInitial] = useState("");
  const shown = useRef(new Set<string>());

  // 1. Login guard + avatar letter (runs in the browser only, so SSR is safe)
  useEffect(() => {
    if (!getToken()) {
      navigate({ to: "/login" });
      return;
    }
    setInitial((getUser()?.name ?? "?").charAt(0).toUpperCase());
  }, []);

  // 2. Reminder alerts: ask permission once, then check every minute
  useEffect(() => {
    if (!getToken()) return;
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
    const check = async () => {
      try {
        const due = await apiFetch("/reminders/due");
        const minute = new Date().toISOString().slice(0, 16);
        for (const r of due ?? []) {
          const key = `${r.id}-${minute}`;
          if (shown.current.has(key)) continue;
          shown.current.add(key);
          if ("Notification" in window && Notification.permission === "granted") {
            new Notification("AYURA reminder", { body: r.title });
          }
          speak(`Reminder: ${r.title}`);
        }
      } catch {
        /* backend offline: try again next minute */
      }
    };
    check();
    const id = setInterval(check, 60_000);
    return () => clearInterval(id);
  }, []);

  // 3. SOS: tell the backend, speak the message, show caregiver, open the dialler
  const sos = async () => {
    if (!confirm("Call emergency help now?")) return;
    try {
      const data = await apiFetch("/emergency", { method: "POST" });
      speak(data.message);
      if (data.caregiver?.phone) {
        alert(`${data.message}\n\nAlso call your caregiver ${data.caregiver.name}: ${data.caregiver.phone}`);
      }
    } finally {
      window.location.href = "tel:112"; // opens even if the backend is down
    }
  };

  const signOut = () => {
    clearAuth();
    navigate({ to: "/login" });
  };

  return (
    <div className="flex min-h-screen bg-muted/30">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-72 transform border-r border-sidebar-border bg-sidebar transition-transform lg:relative lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"
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
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-base font-medium transition ${active
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
          <button
            onClick={signOut}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-base font-medium text-muted-foreground hover:bg-sidebar-accent"
          >
            <LogOut className="h-5 w-5" /> Sign out
          </button>
        </div>
      </aside>

      {open && (
        <div className="fixed inset-0 z-30 bg-foreground/30 lg:hidden" onClick={() => setOpen(false)} />
      )}

      <div className="flex min-h-screen flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b border-border bg-background/80 px-4 backdrop-blur lg:px-8">
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setOpen(true)} aria-label="Open menu">
            <Menu className="h-6 w-6" />
          </Button>
          {title && <h1 className="text-xl font-semibold tracking-tight">{title}</h1>}
          <div className="ml-auto flex items-center gap-2">
            <Button
              onClick={sos}
              className="h-11 bg-red-600 px-4 text-base font-bold text-white hover:bg-red-700"
              aria-label="Emergency SOS"
            >
              <Siren className="mr-2 h-5 w-5" /> SOS
            </Button>
            <Link
              to="/notifications"
              aria-label="Reminders"
              className="grid h-10 w-10 place-items-center rounded-md hover:bg-muted"
            >
              <Bell className="h-5 w-5" />
            </Link>
            <div className="grid h-9 w-9 place-items-center rounded-full bg-gradient-primary text-sm font-semibold text-primary-foreground">
              {initial}
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
