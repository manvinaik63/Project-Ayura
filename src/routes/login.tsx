import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Logo } from "@/components/ayura/Logo";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import type { FormEvent } from "react";
import { login } from "@/lib/api";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Login — AYURA" }, { name: "description", content: "Sign in to your AYURA account." }] }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [show, setShow] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      await navigate({ to: "/dashboard" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }
  return <div className="grid min-h-screen lg:grid-cols-2">
    <div className="hidden bg-gradient-hero p-12 lg:flex lg:flex-col lg:justify-between"><Logo /><div><h2 className="text-4xl font-bold tracking-tight">Welcome back to calmer care.</h2><p className="mt-4 max-w-md text-muted-foreground">Your daily wellbeing, AI insights and caretaker updates — all waiting for you.</p></div><div className="text-sm text-muted-foreground">© AYURA</div></div>
    <div className="flex items-center justify-center p-6 lg:p-12"><div className="w-full max-w-md"><div className="mb-8 lg:hidden"><Logo /></div><h1 className="text-3xl font-bold tracking-tight">Sign in</h1><p className="mt-2 text-muted-foreground">Welcome back, please enter your details.</p>
      <form className="mt-8 space-y-5" onSubmit={submit}>
        <div className="space-y-2"><Label htmlFor="email" className="text-base">Email</Label><Input id="email" value={email} onChange={e => setEmail(e.target.value)} type="email" required placeholder="you@example.com" className="h-12 text-base" /></div>
        <div className="space-y-2"><Label htmlFor="pw" className="text-base">Password</Label><div className="relative"><Input id="pw" value={password} onChange={e => setPassword(e.target.value)} required minLength={8} type={show ? "text" : "password"} placeholder="••••••••" className="h-12 pr-12 text-base" /><button type="button" onClick={() => setShow(!show)} aria-label="Toggle password" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">{show ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}</button></div></div>
        <div className="flex items-center justify-between"><label className="flex items-center gap-2 text-sm"><Checkbox /> Remember me</label><span className="text-sm font-medium text-muted-foreground">Forgot password?</span></div>
        {error && <p className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
        <Button disabled={loading} type="submit" className="h-12 w-full bg-gradient-primary text-base shadow-soft">{loading ? "Signing in…" : "Sign in"}</Button>
        <p className="text-center text-sm text-muted-foreground">No account? <Link to="/signup" className="font-medium text-primary hover:underline">Create one</Link></p>
      </form>
    </div></div>
  </div>;
}