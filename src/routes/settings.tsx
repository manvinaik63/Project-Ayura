import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/ayura/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Globe, Eye, Sun, Moon, Shield, PhoneCall, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "Settings — AYURA" }, { name: "description", content: "Customize your AYURA experience." }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const [dark, setDark] = useState(false);
  const [font, setFont] = useState([100]);
  const [lang, setLang] = useState<"EN" | "KN">("EN");
  const [contacts, setContacts] = useState<any[]>([]);
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  useEffect(() => { apiFetch("/api/emergency-contacts").then(setContacts).catch(() => {}); }, []);
  async function addContact() { if (!contactName || !contactPhone) return; const c = await apiFetch("/api/emergency-contacts", { method: "POST", body: JSON.stringify({ name: contactName, phone: contactPhone }) }); setContacts(x => [...x, c]); setContactName(""); setContactPhone(""); }

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  return (
    <AppShell title="Settings">
      <div className="grid gap-6 lg:grid-cols-2" style={{ fontSize: `${font[0]}%` }}>
        <Section icon={Globe} title="Language">
          <div className="flex gap-2">
            {(["EN","KN"] as const).map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className={`rounded-xl border px-5 py-3 font-medium ${
                  lang === l ? "border-primary bg-primary/10 text-primary" : "border-border bg-background"
                }`}
              >
                {l === "EN" ? "English" : "ಕನ್ನಡ Kannada"}
              </button>
            ))}
          </div>
        </Section>

        <Section icon={dark ? Moon : Sun} title="Appearance">
          <div className="flex items-center justify-between rounded-xl bg-muted/50 p-4">
            <span>Dark mode</span>
            <Switch checked={dark} onCheckedChange={setDark} />
          </div>
        </Section>

        <Section icon={Eye} title="Accessibility">
          <Label className="text-base">Font size: {font[0]}%</Label>
          <Slider value={font} onValueChange={setFont} min={90} max={140} step={5} className="mt-4" />
          <div className="mt-6 flex items-center justify-between rounded-xl bg-muted/50 p-4">
            <span>High contrast text</span>
            <Switch />
          </div>
          <div className="mt-3 flex items-center justify-between rounded-xl bg-muted/50 p-4">
            <span>Voice-first navigation</span>
            <Switch defaultChecked />
          </div>
        </Section>

        <Section icon={Shield} title="Privacy">
          <div className="flex items-center justify-between rounded-xl bg-muted/50 p-4">
            <span>Share data with caretaker</span>
            <Switch defaultChecked />
          </div>
          <div className="mt-3 flex items-center justify-between rounded-xl bg-muted/50 p-4">
            <span>Allow anonymous AI improvement</span>
            <Switch />
          </div>
          <Button variant="outline" className="mt-4 w-full"><Trash2 className="mr-2 h-4 w-4" /> Delete my data</Button>
        </Section>

        <Section icon={PhoneCall} title="Emergency contacts" className="lg:col-span-2">
          <div className="space-y-3">
            {contacts.map((c) => (
              <div key={c.id} className="flex items-center justify-between rounded-xl bg-muted/50 p-4">
                <div><div className="font-medium">{c.name}</div><div className="text-sm text-muted-foreground">{c.phone}</div></div>
                <Button variant="outline" size="sm" onClick={async()=>{await apiFetch(`/api/emergency-contacts/${c.id}`,{method:"DELETE"});setContacts(x=>x.filter(v=>v.id!==c.id))}}>Delete</Button>
              </div>
            ))}
            <div className="grid gap-3 md:grid-cols-2"><Input value={contactName} onChange={e=>setContactName(e.target.value)} placeholder="Name" className="h-12" /><Input value={contactPhone} onChange={e=>setContactPhone(e.target.value)} placeholder="Phone number" className="h-12" /></div>
            <Button onClick={addContact} className="bg-gradient-primary shadow-soft">Add contact</Button>
          </div>
        </Section>
      </div>
    </AppShell>
  );
}

function Section({
  icon: Icon, title, children, className = "",
}: { icon: React.ComponentType<{ className?: string }>; title: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-border bg-card p-6 shadow-card ${className}`}>
      <h3 className="flex items-center gap-2 text-lg font-semibold">
        <Icon className="h-5 w-5 text-primary" /> {title}
      </h3>
      <div className="mt-4">{children}</div>
    </div>
  );
}
