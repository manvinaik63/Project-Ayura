import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { apiFetch, getUser } from "@/lib/api";
import { AppShell } from "@/components/ayura/AppShell";
import { StatCard } from "@/components/ayura/StatCard";
import { Moon, Smile, Activity, Pill, Droplet, Sparkles, AlertTriangle, CalendarDays, Clock, Plus } from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid, BarChart, Bar,
} from "recharts";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — AYURA" }] }),
  component: Dashboard,
});

const sleepData = [
  { d: "Mon", h: 6.5 }, { d: "Tue", h: 7.2 }, { d: "Wed", h: 6.8 },
  { d: "Thu", h: 7.5 }, { d: "Fri", h: 8.0 }, { d: "Sat", h: 7.8 }, { d: "Sun", h: 7.5 },
];
const moodData = [
  { d: "Mon", v: 6 }, { d: "Tue", v: 7 }, { d: "Wed", v: 5 },
  { d: "Thu", v: 8 }, { d: "Fri", v: 8 }, { d: "Sat", v: 9 }, { d: "Sun", v: 8 },
];

function Dashboard() {
  const [data, setData] = useState<any>(null);
  const [logType, setLogType] = useState("Heart Rate");
  const [logValue, setLogValue] = useState("");
  const [user, setUser] = useState<any>(null);
  
  const fetchDashboardData = () => {
    apiFetch("/api/dashboard").then(setData).catch(() => {});
  };

  useEffect(() => { 
    // Safely run client-side to prevent SSR crashes
    setUser(getUser());
    fetchDashboardData(); 
  }, []);

  const handleLogSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    
    if (!logValue) {
      alert("Please enter a value first!");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/logs", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({ type: logType, value: Number(logValue) }) 
      });

      if (response.ok) {
        setLogValue("");
        fetchDashboardData(); 
        alert("Success! Health metric saved.");
      } else {
        const errText = await response.text();
        alert(`Backend Error: ${errText}`);
      }
    } catch (err: any) {
      alert(`Network Error: ${err.message}`);
    }
  };

  const displayName = data?.user?.name || user?.name || "there";
  const recentSleep = data?.healthLogs?.filter((x:any) => x.type === "sleep").slice(-1)[0];
  
  return (
    <AppShell title="Dashboard">
      <div className="space-y-6">
        <div className="rounded-3xl bg-gradient-hero p-6 lg:p-8">
          <div className="text-sm font-medium text-primary">Good morning, {displayName} ☀️</div>
          <h2 className="mt-2 text-3xl font-bold tracking-tight lg:text-4xl">You're doing wonderfully today.</h2>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
          <div className="flex items-center gap-2 mb-4">
            <Plus className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Log Health Metric</h3>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="w-full sm:w-1/3">
              <label className="text-sm font-medium text-foreground mb-1 block">Metric Type</label>
              <select 
                value={logType} 
                onChange={(e) => setLogType(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm"
              >
                <option value="Heart Rate">Heart Rate (bpm)</option>
                <option value="Blood Pressure">Blood Pressure (mmHg)</option>
                <option value="Sleep">Sleep (hours)</option>
                <option value="Weight">Weight (kg)</option>
              </select>
            </div>
            <div className="w-full sm:w-1/3">
              <label className="text-sm font-medium text-foreground mb-1 block">Value</label>
              <input 
                type="text" 
                value={logValue} 
                onChange={(e) => setLogValue(e.target.value)}
                placeholder="e.g., 72"
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm"
              />
            </div>
            <button 
              type="button" 
              onClick={handleLogSubmit}
              className="w-full sm:w-auto rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Save to AYURA
            </button>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          <StatCard icon={Moon} label="Sleep" value={recentSleep ? `${recentSleep.value}${recentSleep.unit ? ` ${recentSleep.unit}` : ""}` : "7.5h"} sub="Last night" tone="primary" />
          <StatCard icon={Smile} label="Mood" value="Happy" sub="Self-reported" tone="success" />
          <StatCard icon={Activity} label="Exercise" value="32 min" sub="Walked 2.1 km" tone="accent" />
          <StatCard icon={Pill} label="Medication" value="3 / 3" sub="Today taken" tone="success" />
          <StatCard icon={Droplet} label="Water" value="6 / 8" sub="Glasses today" tone="warning" />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <ChartCard title="Sleep trend (hours)">
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={sleepData}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.92 0.01 210)" />
                <XAxis dataKey="d" stroke="oklch(0.5 0.03 220)" />
                <YAxis stroke="oklch(0.5 0.03 220)" />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid oklch(0.92 0.01 210)" }} />
                <Area type="monotone" dataKey="h" stroke="oklch(0.62 0.11 195)" fill="oklch(0.62 0.11 195)" strokeWidth={2.5} />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>
          <ChartCard title="Mood tracking">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={moodData}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.92 0.01 210)" />
                <XAxis dataKey="d" stroke="oklch(0.5 0.03 220)" />
                <YAxis stroke="oklch(0.5 0.03 220)" />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid oklch(0.92 0.01 210)" }} />
                <Bar dataKey="v" fill="oklch(0.66 0.13 160)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      </div>
    </AppShell>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
      <h3 className="text-lg font-semibold">{title}</h3>
      <div className="mt-4">{children}</div>
    </div>
  );
}