import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/ayura/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Eye, Sun, Moon, User } from "lucide-react";
import { useState, useEffect } from "react";
import { apiFetch, getToken, setAuth } from "@/lib/api";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "Settings - AYURA" }, { name: "description", content: "Customize your AYURA experience." }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const [dark, setDark] = useState(false);
  const [font, setFont] = useState([100]);
  const [loaded, setLoaded] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  // Load saved preferences and the profile (browser only)
  useEffect(() => {
    try {
      setFont([Number(localStorage.getItem("ayura_font")) || 100]);
      setDark(localStorage.getItem("ayura_dark") === "1");
    } catch { /* storage blocked: keep defaults */ }
    setLoaded(true);
    apiFetch("/auth/me").then(setProfile).catch(() => { });
  }, []);

  // Apply dark mode to the whole app and remember it
  useEffect(() => {
    if (!loaded) return;
    document.documentElement.classList.toggle("dark", dark);
    try { localStorage.setItem("ayura_dark", dark ? "1" : "0"); } catch { }
  }, [dark, loaded]);

  // Apply font size to the whole app and remember it
  useEffect(() => {
    if (!loaded) return;
    document.documentElement.style.fontSize = `${font[0]}%`;
    try { localStorage.setItem("ayura_font", String(font[0])); } catch { }
  }, [font, loaded]);

  const update = (field: string, value: string) => setProfile({ ...profile, [field]: value });

  async function saveProfile() {
    setSaving(true);
    setMessage("");
    try {
      const { name, age, sex, caregiver_name, caregiver_phone } = profile;
      const user = await apiFetch("/auth/me", {
        method: "PUT",
        body: JSON.stringify({
          name,
          age: Number(age),
          sex,
          caregiver_name: caregiver_name || null,
          caregiver_phone: caregiver_phone || null,
        }),
      });
      setAuth(getToken()!, user); // keeps the saved name in sync for the avatar
      setProfile(user);
      setMessage("Profile saved.");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Could not save. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <AppShell title="Settings">
      <div className="grid gap-6 lg:grid-cols-2">
        <Section icon={User} title="My profile" className="lg:col-span-2">
          {!profile ? (
            <p className="text-muted-foreground">Loading your profile…</p>
          ) : (
            <>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-base">Full name</Label>
                  <Input id="name" value={profile.name ?? ""} onChange={(e) => update("name", e.target.value)} className="h-12 text-base" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="age" className="text-base">Age</Label>
                    <Input id="age" type="number" min={18} max={120} value={profile.age ?? ""} onChange={(e) => update("age", e.target.value)} className="h-12 text-base" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sex" className="text-base">Sex</Label>
                    <select id="sex" value={profile.sex ?? ""} onChange={(e) => update("sex", e.target.value)} className="h-12 w-full rounded-md border border-input bg-background px-3 text-base">
                      <option value="M">Male</option>
                      <option value="F">Female</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cgname" className="text-base">Family member to call in an emergency</Label>
                  <Input id="cgname" value={profile.caregiver_name ?? ""} onChange={(e) => update("caregiver_name", e.target.value)} placeholder="Name" className="h-12 text-base" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cgphone" className="text-base">Their phone number</Label>
                  <Input id="cgphone" type="tel" value={profile.caregiver_phone ?? ""} onChange={(e) => update("caregiver_phone", e.target.value)} placeholder="Phone number" className="h-12 text-base" />
                </div>
              </div>
              <div className="mt-5 flex items-center gap-4">
                <Button onClick={saveProfile} disabled={saving} className="h-12 bg-gradient-primary px-6 text-base shadow-soft">
                  {saving ? "Saving…" : "Save profile"}
                </Button>
                {message && <span className="text-base text-muted-foreground">{message}</span>}
              </div>
            </>
          )}
        </Section>

        <Section icon={dark ? Moon : Sun} title="Appearance">
          <div className="flex items-center justify-between rounded-xl bg-muted/50 p-4">
            <span className="text-base">Dark mode</span>
            <Switch checked={dark} onCheckedChange={setDark} />
          </div>
        </Section>

        <Section icon={Eye} title="Text size">
          <Label className="text-base">Font size: {font[0]}%</Label>
          <Slider value={font} onValueChange={setFont} min={90} max={140} step={5} className="mt-4" />
          <p className="mt-3 text-sm text-muted-foreground">Makes all pages bigger or smaller.</p>
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
