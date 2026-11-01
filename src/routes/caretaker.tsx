import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/ayura/AppShell";
import { Button } from "@/components/ui/button";
import { HeartPulse, Phone, CheckCircle2, Circle, Bell, AlertTriangle, Printer } from "lucide-react";
import { apiFetch } from "@/lib/api";

export const Route = createFileRoute("/caretaker")({
  head: () => ({ meta: [{ title: "For my caregiver - AYURA" }] }),
  component: Caretaker,
});

const STATUS_STYLE: Record<string, string> = {
  normal: "bg-success/15 text-success",
  borderline: "bg-warning/15 text-warning",
  high: "bg-destructive/15 text-destructive",
  critical: "bg-destructive text-destructive-foreground",
};
const RISK_STYLE: Record<string, string> = {
  low: STATUS_STYLE.normal,
  moderate: STATUS_STYLE.borderline,
  high: STATUS_STYLE.high,
};

function Caretaker() {
  const [user, setUser] = useState<any>(null);
  const [analyses, setAnalyses] = useState<any[]>([]);
  const [today, setToday] = useState<any>({ tasks: [], streak: 0 });
  const [reminders, setReminders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      apiFetch("/auth/me").then(setUser),
      apiFetch("/analysis").then(setAnalyses),
      apiFetch("/tasks/today").then(setToday),
      apiFetch("/reminders").then(setReminders),
    ])
      .catch(() => { })
      .finally(() => setLoading(false));
  }, []);

  const latest = analyses[analyses.length - 1]; // GET /analysis is oldest first
  const problems = latest ? latest.flags.filter((f: any) => f.status !== "normal") : [];
  const done = today.tasks.filter((t: any) => t.done).length;
  const active = reminders
    .filter((r) => r.active)
    .sort((a, b) => a.time_of_day.localeCompare(b.time_of_day));

  if (loading) {
    return <AppShell title="For my caregiver"><p className="text-muted-foreground">Loading…</p></AppShell>;
  }

  return (
    <AppShell title="For my caregiver">
      <p className="mb-6 max-w-2xl text-base text-muted-foreground">
        A one-page summary to show or print for your family member or doctor.
      </p>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Caregiver contact */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
          <h3 className="flex items-center gap-2 text-lg font-semibold"><Phone className="h-5 w-5 text-primary" /> Caregiver</h3>
          {user?.caregiver_phone ? (
            <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="text-xl font-semibold">{user.caregiver_name || "Caregiver"}</div>
                <div className="text-base text-muted-foreground">{user.caregiver_phone}</div>
              </div>
              <Button asChild className="h-12 bg-gradient-primary px-6 text-base shadow-soft">
                <a href={`tel:${user.caregiver_phone}`}><Phone className="mr-2 h-5 w-5" /> Call now</a>
              </Button>
            </div>
          ) : (
            <p className="mt-4 text-muted-foreground">
              No caregiver added yet. <Link to="/settings" className="font-medium text-primary underline">Add one in Settings</Link>.
            </p>
          )}
          {user && (
            <p className="mt-4 text-sm text-muted-foreground">
              Patient: {user.name}, {user.age} years, {user.sex === "F" ? "female" : "male"}
            </p>
          )}
        </div>

        {/* Latest heart check */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
          <h3 className="flex items-center gap-2 text-lg font-semibold"><HeartPulse className="h-5 w-5 text-primary" /> Latest heart check</h3>
          {!latest ? (
            <p className="mt-4 text-muted-foreground">
              No report analysed yet. <Link to="/reports" className="font-medium text-primary underline">Upload one</Link>.
            </p>
          ) : (
            <>
              <div className="mt-4 flex items-center gap-3">
                <span className={`rounded-full px-4 py-1 text-base font-semibold ${RISK_STYLE[latest.risk_level] ?? ""}`}>
                  {latest.risk_level.toUpperCase()} RISK
                </span>
                <span className="text-sm text-muted-foreground">
                  {Math.round(latest.risk_score * 100)}% · {new Date(latest.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                </span>
              </div>
              {problems.length === 0 ? (
                <p className="mt-4 flex items-center gap-2 text-base"><CheckCircle2 className="h-5 w-5 text-success" /> All values in the normal range.</p>
              ) : (
                <ul className="mt-4 space-y-2">
                  {problems.map((f: any) => (
                    <li key={f.label} className="flex items-center justify-between rounded-xl bg-muted/50 p-3">
                      <span className="text-base">{f.label}: <b>{f.value}</b></span>
                      <span className={`rounded-full px-3 py-0.5 text-sm font-medium ${STATUS_STYLE[f.status] ?? ""}`}>{f.status}</span>
                    </li>
                  ))}
                </ul>
              )}
              {problems.some((f: any) => f.status === "critical") && (
                <p className="mt-4 flex items-center gap-2 rounded-xl bg-destructive p-3 text-base font-semibold text-destructive-foreground">
                  <AlertTriangle className="h-5 w-5" /> A critical value was found. Please see a doctor soon.
                </p>
              )}
            </>
          )}
        </div>

        {/* Today's tasks */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
          <h3 className="flex items-center gap-2 text-lg font-semibold"><CheckCircle2 className="h-5 w-5 text-primary" /> Today's tasks</h3>
          <p className="mt-1 text-sm text-muted-foreground">{done} of {today.tasks.length} done · {today.streak}-day streak</p>
          <ul className="mt-4 space-y-2">
            {today.tasks.map((t: any) => (
              <li key={t.id} className="flex items-center gap-3 rounded-xl bg-muted/50 p-3 text-base">
                {t.done ? <CheckCircle2 className="h-5 w-5 shrink-0 text-success" /> : <Circle className="h-5 w-5 shrink-0 text-muted-foreground" />}
                <span className={t.done ? "text-muted-foreground line-through" : ""}>{t.title}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Reminders */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
          <h3 className="flex items-center gap-2 text-lg font-semibold"><Bell className="h-5 w-5 text-primary" /> Daily reminders</h3>
          {active.length === 0 ? (
            <p className="mt-4 text-muted-foreground">
              No reminders yet. <Link to="/notifications" className="font-medium text-primary underline">Add one</Link>.
            </p>
          ) : (
            <ul className="mt-4 space-y-2">
              {active.map((r) => (
                <li key={r.id} className="flex items-center justify-between rounded-xl bg-muted/50 p-3 text-base">
                  <span>{r.title}</span>
                  <span className="font-medium">{r.time_of_day}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <Button variant="outline" onClick={() => window.print()} className="mt-6 h-12 text-base">
        <Printer className="mr-2 h-5 w-5" /> Print this summary
      </Button>
    </AppShell>
  );
}
