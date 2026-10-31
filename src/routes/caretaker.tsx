import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/ayura/AppShell";
import { StatCard } from "@/components/ayura/StatCard";
import { Moon, Smile, Pill, AlertTriangle, Bell, Sparkles } from "lucide-react";
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar } from "recharts";

export const Route = createFileRoute("/caretaker")({
  head: () => ({ meta: [{ title: "Caretaker Dashboard — AYURA" }, { name: "description", content: "Monitor your loved one's health." }] }),
  component: Caretaker,
});

const sleep = [{d:"Mon",h:6.5},{d:"Tue",h:7.2},{d:"Wed",h:6.8},{d:"Thu",h:7.5},{d:"Fri",h:8},{d:"Sat",h:7.8},{d:"Sun",h:7.5}];
const mood = [{d:"Mon",v:6},{d:"Tue",v:7},{d:"Wed",v:5},{d:"Thu",v:8},{d:"Fri",v:8},{d:"Sat",v:9},{d:"Sun",v:8}];
const meds = [{d:"Mon",v:100},{d:"Tue",v:100},{d:"Wed",v:67},{d:"Thu",v:100},{d:"Fri",v:100},{d:"Sat",v:100},{d:"Sun",v:100}];

function Caretaker() {
  return (
    <AppShell title="Caretaker Dashboard">
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl bg-gradient-hero p-6 lg:p-8">
          <div>
            <div className="text-sm font-medium text-primary">Monitoring</div>
            <h2 className="mt-1 text-3xl font-bold tracking-tight">Mom — Lakshmi Devi, 72</h2>
            <p className="mt-1 text-muted-foreground">All vitals look healthy today.</p>
          </div>
          <span className="rounded-full bg-success/15 px-4 py-2 text-sm font-semibold text-success">All good</span>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard icon={Moon} label="Avg sleep" value="7.4h" sub="This week" tone="primary" />
          <StatCard icon={Smile} label="Mood avg" value="7.3/10" sub="Stable" tone="success" />
          <StatCard icon={Pill} label="Med adherence" value="95%" sub="1 missed" tone="warning" />
          <StatCard icon={AlertTriangle} label="Alerts" value="0" sub="Last 24h" tone="success" />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Chart title="Sleep trends">
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={sleep}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.92 0.01 210)" />
                <XAxis dataKey="d" /><YAxis /><Tooltip contentStyle={{ borderRadius: 12 }} />
                <Line type="monotone" dataKey="h" stroke="oklch(0.62 0.11 195)" strokeWidth={3} dot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </Chart>
          <Chart title="Mood tracking">
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={mood}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.92 0.01 210)" />
                <XAxis dataKey="d" /><YAxis /><Tooltip contentStyle={{ borderRadius: 12 }} />
                <Line type="monotone" dataKey="v" stroke="oklch(0.66 0.13 160)" strokeWidth={3} dot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </Chart>
          <Chart title="Medication adherence (%)">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={meds}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.92 0.01 210)" />
                <XAxis dataKey="d" /><YAxis /><Tooltip contentStyle={{ borderRadius: 12 }} />
                <Bar dataKey="v" fill="oklch(0.62 0.11 195)" radius={[8,8,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </Chart>

          <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
            <div className="flex items-center gap-2"><Bell className="h-5 w-5 text-primary" /><h3 className="font-semibold">Notification center</h3></div>
            <ul className="mt-4 space-y-3">
              {[
                { t: "Missed evening BP medication", time: "Wed 9:15 PM", tone: "warning" },
                { t: "Logged 8h sleep", time: "Fri 8:00 AM", tone: "success" },
                { t: "Walked 2.4 km", time: "Sat 6:30 AM", tone: "success" },
              ].map((n,i)=>(
                <li key={i} className="flex items-center justify-between rounded-xl bg-muted/50 px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span className={`h-2 w-2 rounded-full ${n.tone === "warning" ? "bg-warning" : "bg-success"}`} />
                    <span>{n.t}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{n.time}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
          <div className="flex items-center gap-2"><Sparkles className="h-5 w-5 text-primary" /><h3 className="font-semibold">AI recommendations</h3></div>
          <ul className="mt-4 grid gap-3 md:grid-cols-3">
            {[
              "Encourage a 15-min morning walk to maintain mood improvements.",
              "Set a Wednesday evening reminder — that's when meds were missed.",
              "Sunlight exposure recommended for vitamin D support.",
            ].map((r,i)=>(
              <li key={i} className="rounded-xl bg-muted/50 p-4 text-sm">{r}</li>
            ))}
          </ul>
        </div>
      </div>
    </AppShell>
  );
}

function Chart({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
      <h3 className="font-semibold">{title}</h3>
      <div className="mt-4">{children}</div>
    </div>
  );
}
