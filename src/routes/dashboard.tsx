import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { HeartPulse, Activity, CheckCircle2, Flame, Clock, Plus } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from "recharts";
import { apiFetch } from "@/lib/api";
import { speak } from "@/lib/voice";
import { AppShell } from "@/components/ayura/AppShell";
import { StatCard } from "@/components/ayura/StatCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard - AYURA" }] }),
  component: Dashboard,
});

const RISK_TONE = { low: "success", moderate: "warning", high: "warning" } as const;

function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [analyses, setAnalyses] = useState<any[]>([]);
  const [today, setToday] = useState<any>({ tasks: [], streak: 0 });
  const [reminders, setReminders] = useState<any[]>([]);
  const [bp, setBp] = useState({ systolic_bp: "", diastolic_bp: "", heart_rate: "" });
  const [checking, setChecking] = useState(false);

  const load = () => {
    apiFetch("/auth/me").then(setUser).catch(() => { });
    apiFetch("/analysis").then(setAnalyses).catch(() => { });
    apiFetch("/tasks/today").then(setToday).catch(() => { });
    apiFetch("/reminders").then(setReminders).catch(() => { });
  };
  useEffect(load, []);

  const latest = analyses[analyses.length - 1];          // GET /analysis is oldest first
  const done = today.tasks.filter((t: any) => t.done).length;
  const now = new Date().toTimeString().slice(0, 5);    // "HH:MM"
  const active = reminders.filter((r) => r.active).sort((a, b) => a.time_of_day.localeCompare(b.time_of_day));
  const next = active.find((r) => r.time_of_day >= now) ?? active[0];
  const trend = analyses.map((a) => ({
    date: new Date(a.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
    risk: Math.round(a.risk_score * 100),
    bp: a.inputs?.systolic_bp ?? null,
  }));

  const complete = async (id: string) => {
    await apiFetch(`/tasks/${id}/complete`, { method: "POST" });
    apiFetch("/tasks/today").then(setToday);
  };

  const quickCheck = async () => {
    const clean = Object.fromEntries(Object.entries(bp).filter(([, v]) => v !== "").map(([k, v]) => [k, Number(v)]));
    if (!Object.keys(clean).length) return;
    setChecking(true);
    try {
      const report = await apiFetch("/reports/manual", { method: "POST", body: JSON.stringify(clean) });
      const result = await apiFetch(`/analysis/report/${report.id}`, { method: "POST" });
      const problems = result.flags.filter((f: any) => f.status !== "normal");
      speak(problems.length ? `Please note: ${problems.map((f: any) => `${f.label} is ${f.status}`).join(", ")}.` : "Your readings look normal. Well done.");
      setBp({ systolic_bp: "", diastolic_bp: "", heart_rate: "" });
      load();
    } finally {
      setChecking(false);
    }
  };

  return (
    <AppShell title={user ? `Namaste, ${user.name}` : "Dashboard"}>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={HeartPulse} label="Heart risk" value={latest ? latest.risk_level.toUpperCase() : "No report yet"}
          sub={latest ? `${Math.round(latest.risk_score * 100)}% risk score` : "Upload a report to start"}
          tone={latest ? RISK_TONE[latest.risk_level as keyof typeof RISK_TONE] : "primary"} />
        <StatCard icon={Activity} label="Blood pressure"
          value={latest?.inputs?.systolic_bp ? `${latest.inputs.systolic_bp}/${latest.inputs.diastolic_bp ?? "-"}` : "-"} sub="mm Hg, latest" />
        <StatCard icon={CheckCircle2} label="Today's tasks" value={`${done}/${today.tasks.length}`} tone="success" />
        <StatCard icon={Flame} label="Streak" value={`${today.streak} days`} tone="accent"
          sub={next ? `Next reminder: ${next.title} at ${next.time_of_day}` : "No reminders yet"} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
          <h3 className="text-lg font-semibold">Heart risk over time</h3>
          {trend.length < 2 ? (
            <p className="mt-4 text-muted-foreground">Analyse two or more reports to see your trend.</p>
          ) : (
            <div className="mt-4 h-64">
              <ResponsiveContainer>
                <LineChart data={trend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" /><YAxis />
                  <Tooltip />
                  <Line dataKey="risk" name="Risk %" stroke="hsl(var(--primary))" strokeWidth={3} />
                  <Line dataKey="bp" name="Upper BP" stroke="#ef4444" strokeWidth={2} connectNulls />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
          <h3 className="text-lg font-semibold">Today's tasks</h3>
          <ul className="mt-4 space-y-3">
            {today.tasks.map((t: any) => (
              <li key={t.id} className="flex items-center justify-between gap-3 rounded-xl bg-muted/50 p-4">
                <span className={`text-base ${t.done ? "text-muted-foreground line-through" : ""}`}>{t.title}</span>
                {t.done ? <CheckCircle2 className="h-6 w-6 text-success" /> :
                  <Button size="lg" onClick={() => complete(t.id)}>Done</Button>}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-border bg-card p-6 shadow-card">
        <h3 className="text-lg font-semibold">Quick BP check</h3>
        <p className="text-sm text-muted-foreground">Type today's machine reading. For a full report, go to <Link to="/reports" className="underline">Medical Reports</Link>.</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-4">
          <Input type="number" placeholder="Upper (e.g. 130)" value={bp.systolic_bp} onChange={(e) => setBp({ ...bp, systolic_bp: e.target.value })} className="h-12 text-base" />
          <Input type="number" placeholder="Lower (e.g. 85)" value={bp.diastolic_bp} onChange={(e) => setBp({ ...bp, diastolic_bp: e.target.value })} className="h-12 text-base" />
          <Input type="number" placeholder="Pulse (e.g. 72)" value={bp.heart_rate} onChange={(e) => setBp({ ...bp, heart_rate: e.target.value })} className="h-12 text-base" />
          <Button onClick={quickCheck} disabled={checking} className="h-12 text-base"><Plus className="mr-2 h-5 w-5" />{checking ? "Checking..." : "Check"}</Button>
        </div>
      </div>
    </AppShell>
  );
}