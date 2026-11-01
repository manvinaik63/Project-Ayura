import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/ayura/Logo";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import type { FormEvent } from "react";
import { register } from "@/lib/api";

export const Route = createFileRoute("/signup")({ head: () => ({ meta: [{ title: "Sign up — AYURA" }] }), component: SignupPage });

function SignupPage() {
  const navigate = useNavigate();
  const [show, setShow] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [age, setAge] = useState("");
  const [sex, setSex] = useState("");
  const [caregiverName, setCaregiverName] = useState("");
  const [caregiverPhone, setCaregiverPhone] = useState("");

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register({
        name, email, password,
        age: Number(age),
        sex,
        caregiver_name: caregiverName || null,
        caregiver_phone: caregiverPhone || null,
      });
      await navigate({ to: "/dashboard" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Signup failed");
    } finally {
      setLoading(false);
    }
  }

  // Replace the whole one-line `return <div ...>;` in src/routes/signup.tsx with everything below,
  // including the final } (delete your old final } so there is only one).
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          <div className="mb-8"><Logo /></div>
          <h1 className="text-3xl font-bold tracking-tight">Create your account</h1>
          <p className="mt-2 text-muted-foreground">Smart care starts here.</p>
          <form className="mt-8 space-y-5" onSubmit={submit}>
            <div className="space-y-2">
              <Label htmlFor="name" className="text-base">Full name</Label>
              <Input id="name" value={name} onChange={e => setName(e.target.value)} required placeholder="Your name" className="h-12 text-base" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-base">Email</Label>
              <Input id="email" value={email} onChange={e => setEmail(e.target.value)} required type="email" placeholder="you@example.com" className="h-12 text-base" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pw" className="text-base">Password</Label>
              <div className="relative">
                <Input id="pw" value={password} onChange={e => setPassword(e.target.value)} required minLength={8} type={show ? "text" : "password"} placeholder="At least 8 characters" className="h-12 pr-12 text-base" />
                <button type="button" onClick={() => setShow(!show)} aria-label="Toggle password" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  {show ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* NEW: age and sex */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="age" className="text-base">Age</Label>
                <Input id="age" type="number" min={18} max={120} required value={age} onChange={e => setAge(e.target.value)} className="h-12 text-base" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sex" className="text-base">Sex</Label>
                <select id="sex" required value={sex} onChange={e => setSex(e.target.value)} className="h-12 w-full rounded-md border border-input bg-background px-3 text-base">
                  <option value="">Choose</option>
                  <option value="M">Male</option>
                  <option value="F">Female</option>
                </select>
              </div>
            </div>

            {/* NEW: caregiver */}
            <div className="space-y-2">
              <Label htmlFor="cg" className="text-base">Family member to call in an emergency (optional)</Label>
              <Input id="cg" value={caregiverName} onChange={e => setCaregiverName(e.target.value)} placeholder="Name" className="h-12 text-base" />
              <Input value={caregiverPhone} onChange={e => setCaregiverPhone(e.target.value)} placeholder="Phone number" className="h-12 text-base" />
            </div>

            {error && <p className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
            <Button disabled={loading} type="submit" className="h-12 w-full bg-gradient-primary text-base shadow-soft">
              {loading ? "Creating…" : "Create account"}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              Already have an account? <Link to="/login" className="font-medium text-primary hover:underline">Sign in</Link>
            </p>
          </form>
        </div>
      </div>
      <div className="hidden bg-gradient-hero p-12 lg:flex lg:flex-col lg:justify-end">
        <h2 className="text-4xl font-bold tracking-tight">Healthier days, gently guided.</h2>
        <p className="mt-4 max-w-md text-muted-foreground">AYURA combines AI insights with caring design — built especially for elders.</p>
      </div>
    </div>
  );
}
