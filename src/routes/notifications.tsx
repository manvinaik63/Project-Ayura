import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Bell, Pill, Droplet, Footprints, CalendarDays, Trash2 } from "lucide-react";
import { AppShell } from "@/components/ayura/AppShell";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiFetch } from "@/lib/api";

export const Route = createFileRoute("/notifications")({
    head: () => ({ meta: [{ title: "Reminders - AYURA" }] }),
    component: Reminders,
});

const ICONS: Record<string, any> = { medicine: Pill, water: Droplet, walk: Footprints, appointment: CalendarDays };

function Reminders() {
    const [items, setItems] = useState<any[]>([]);
    const [form, setForm] = useState({ title: "", kind: "medicine", time_of_day: "08:00" });

    const load = () => apiFetch("/reminders").then(setItems).catch(() => { });
    useEffect(() => { load(); }, []);

    const add = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.title.trim()) return;
        await apiFetch("/reminders", { method: "POST", body: JSON.stringify({ ...form, active: true }) });
        setForm({ ...form, title: "" });
        load();
    };
    const toggle = async (r: any) => {
        await apiFetch(`/reminders/${r.id}`, {
            method: "PUT",
            body: JSON.stringify({ title: r.title, kind: r.kind, time_of_day: r.time_of_day, active: !r.active })
        });
        load();
    };
    const remove = async (id: number) => {
        if (!confirm("Delete this reminder?")) return;
        await apiFetch(`/reminders/${id}`, { method: "DELETE" });
        load();
    };

    return (
        <AppShell title="Reminders">
            <form onSubmit={add} className="rounded-2xl border border-border bg-card p-6 shadow-card">
                <h3 className="text-lg font-semibold">Add a reminder</h3>
                <div className="mt-4 grid gap-3 sm:grid-cols-4">
                    <Input placeholder="e.g. BP tablet" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="h-12 text-base sm:col-span-2" />
                    <select value={form.kind} onChange={(e) => setForm({ ...form, kind: e.target.value })} className="h-12 rounded-md border border-input bg-background px-3 text-base">
                        <option value="medicine">Medicine</option><option value="water">Water</option>
                        <option value="walk">Walk</option><option value="appointment">Doctor visit</option><option value="other">Other</option>
                    </select>
                    <Input type="time" value={form.time_of_day} onChange={(e) => setForm({ ...form, time_of_day: e.target.value })} className="h-12 text-base" />
                </div>
                <Button type="submit" size="lg" className="mt-4">Save reminder</Button>
            </form>

            <div className="mt-6 rounded-2xl border border-border bg-card p-6 shadow-card">
                <h3 className="text-lg font-semibold">Your reminders</h3>
                {items.length === 0 && <p className="mt-3 text-muted-foreground">No reminders yet. Add one above.</p>}
                <ul className="mt-4 space-y-3">
                    {items.map((r) => {
                        const Icon = ICONS[r.kind] ?? Bell;
                        return (
                            <li key={r.id} className="flex items-center justify-between gap-3 rounded-xl bg-muted/50 p-4">
                                <div className="flex items-center gap-4">
                                    <div className="grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary"><Icon className="h-5 w-5" /></div>
                                    <div><div className="font-medium">{r.title}</div><div className="text-sm text-muted-foreground">Every day at {r.time_of_day}</div></div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Switch checked={r.active} onCheckedChange={() => toggle(r)} aria-label="On or off" />
                                    <Button variant="ghost" size="icon" onClick={() => remove(r.id)} aria-label="Delete"><Trash2 className="h-5 w-5" /></Button>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            </div>
        </AppShell>
    );
}