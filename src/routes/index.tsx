import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ayura/Logo";
import heroImg from "@/assets/hero.jpg";
import {
  Brain, HeartPulse, Shield, Mic, Users, Sparkles, Activity, Bell, Stethoscope,
  ArrowRight, Check, Star
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AYURA — Smart Care for Healthier Living" },
      {
        name: "description",
        content:
          "AYURA is an AI-powered healthcare companion for elderly people and caretakers — track health, get insights, and stay safe.",
      },
      { property: "og:title", content: "AYURA — Smart Care for Healthier Living" },
      { property: "og:description", content: "AI-powered elderly healthcare assistant." },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 lg:px-8">
          <Logo />
          <nav className="hidden items-center gap-8 text-sm font-medium text-muted-foreground md:flex">
            <a href="#features" className="hover:text-foreground">Features</a>
            <a href="#how" className="hover:text-foreground">How it works</a>
            <a href="#caretaker" className="hover:text-foreground">Caretakers</a>
            <a href="#privacy" className="hover:text-foreground">Privacy</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link to="/login"><Button variant="ghost">Login</Button></Link>
            <Link to="/signup"><Button className="bg-gradient-primary shadow-soft">Sign up</Button></Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-hero">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 lg:grid-cols-2 lg:gap-16 lg:px-8 lg:py-24">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-3 py-1 text-xs font-medium text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5 text-primary" /> AI Healthcare for Seniors
            </div>
            <h1 className="mt-5 text-5xl font-bold leading-[1.05] tracking-tight text-foreground lg:text-6xl">
              Smart Care for <span className="text-primary">Healthier Living</span>
            </h1>
            <p className="mt-5 max-w-xl text-lg text-muted-foreground">
              AYURA reads your heart reports, explains them in simple words, and gives you a diet and exercise plan, with daily tasks, reminders and an SOS button.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/signup">
                <Button size="lg" className="h-12 bg-gradient-primary px-6 text-base shadow-soft">
                  Get Started <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
              <Link to="/assistant">
                <Button size="lg" variant="outline" className="h-12 px-6 text-base">
                  <Mic className="mr-2 h-4 w-4" /> Talk to AYURA AI
                </Button>
              </Link>
            </div>
            <div className="mt-8 flex items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2"><Check className="h-4 w-4 text-success" /> HIPAA-aware</div>
              <div className="flex items-center gap-2"><Check className="h-4 w-4 text-success" /> Voice-first</div>
              <div className="flex items-center gap-2"><Check className="h-4 w-4 text-success" /> Multilingual</div>
            </div>
          </div>
          <div className="relative">
            <div className="absolute -inset-6 rounded-[3rem] bg-primary/10 blur-3xl" />
            <div className="relative overflow-hidden rounded-3xl border border-border bg-card shadow-soft">
              <img
                src={heroImg}
                alt="Elderly couple with AI healthcare insights"
                width={1280}
                height={1024}
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
        <SectionHeader eyebrow="Features" title="Everything seniors need, in one calm place" />
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[
            { icon: HeartPulse, title: "Health Tracking", desc: "Monitor sleep, mood, exercise, hydration and medication daily." },
            { icon: Brain, title: "AI Insights", desc: "Personalized lifestyle suggestions based on real patterns." },
            { icon: Mic, title: "Voice Assistant", desc: "Hands-free help in English or Kannada — just ask AYURA." },
            { icon: Users, title: "Caretaker Sync", desc: "Family members get a clear view and emergency alerts." },
            { icon: Bell, title: "Smart Reminders", desc: "Never miss a pill, water break or rest period again." },
            { icon: Stethoscope, title: "Report Analysis", desc: "Upload medical PDFs and get AI-summarised insights." },
          ].map((f) => (
            <div key={f.title} className="rounded-2xl border border-border bg-card p-6 shadow-card transition hover:-translate-y-0.5 hover:shadow-soft">
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-primary/10 text-primary">
                <f.icon className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">{f.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="bg-secondary/40 py-20">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <SectionHeader eyebrow="How AYURA Works" title="Three simple steps" />
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              { n: "01", t: "Set up your profile", d: "Add basic health info and emergency contacts." },
              { n: "02", t: "Track your day", d: "Log activities by voice or tap — AYURA does the rest." },
              { n: "03", t: "Get AI guidance", d: "Receive insights, reminders and risk alerts proactively." },
            ].map((s) => (
              <div key={s.n} className="rounded-2xl border border-border bg-card p-6 shadow-card">
                <div className="text-sm font-bold text-primary">{s.n}</div>
                <h3 className="mt-2 text-xl font-semibold">{s.t}</h3>
                <p className="mt-2 text-muted-foreground">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Health Monitoring */}
      <section className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-20 lg:grid-cols-2 lg:px-8">
        <div>
          <SectionHeader align="left" eyebrow="AI Health Monitoring" title="Insights that learn your routine" />
          <p className="mt-4 text-muted-foreground">
            AYURA reads your cholesterol, blood pressure, sugar and heart test values, predicts your heart risk with a trained model, and explains it in plain language.
          </p>
          <ul className="mt-6 space-y-3">
            {["Heart risk prediction with reasons", "Diet and exercise plan", "Risk trend over time"].map((x) => (
              <li key={x} className="flex items-center gap-3"><Check className="h-5 w-5 text-success" />{x}</li>
            ))}
          </ul>
        </div>
        <div className="rounded-3xl border border-border bg-card p-6 shadow-soft">
          <div className="flex items-center gap-2 text-sm text-muted-foreground"><Activity className="h-4 w-4 text-primary" /> Example</div>
          <div className="mt-2 text-5xl font-bold">87<span className="text-2xl text-muted-foreground">/100</span></div>
          <div className="mt-6 grid grid-cols-7 items-end gap-2 h-32">
            {[60, 72, 65, 80, 75, 90, 87].map((v, i) => (
              <div key={i} className="rounded-t-lg bg-gradient-primary" style={{ height: `${v}%` }} />
            ))}
          </div>
          <div className="mt-2 grid grid-cols-7 text-center text-xs text-muted-foreground">
            {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (<div key={i}>{d}</div>))}
          </div>
        </div>
      </section>

      {/* Caretaker */}
      <section id="caretaker" className="bg-secondary/40 py-20">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 lg:grid-cols-2 lg:px-8">
          <div className="rounded-3xl border border-border bg-card p-6 shadow-soft">
            <div className="flex items-center justify-between">
              <div className="font-semibold">Example</div>
              <span className="rounded-full bg-success/15 px-2 py-0.5 text-xs font-medium text-success">All good</span>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-3 text-center">
              {[{ l: "Heart risk", v: "Low" }, { l: "Tasks", v: "3/4" }, { l: "Streak", v: "5 days" }].map(x => (
                <div key={x.l} className="rounded-xl bg-muted p-3">
                  <div className="text-xs text-muted-foreground">{x.l}</div>
                  <div className="mt-1 text-lg font-semibold">{x.v}</div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <SectionHeader align="left" eyebrow="Caretaker Support" title="Peace of mind for the whole family" />
            <p className="mt-4 text-muted-foreground">
              Your family member gets a one-page summary of your latest heart check, today's tasks and reminders, and the SOS button shows their number in an emergency.
            </p>
          </div>
        </div>
      </section>

      {/* Privacy */}
      <section id="privacy" className="mx-auto max-w-5xl px-4 py-20 text-center lg:px-8">
        <Shield className="mx-auto h-10 w-10 text-primary" />
        <h2 className="mt-4 text-4xl font-bold tracking-tight">Privacy & Security First</h2>
        <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
          End-to-end encrypted data, granular caretaker permissions, and full control over
          what's shared. Your health stays yours.
        </p>
      </section>

      {/* Testimonials */}
      <section className="bg-gradient-hero py-20">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <SectionHeader eyebrow="Loved by families" title="What people say" />
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              { n: "Priya R.", r: "Daughter & caretaker", q: "I finally sleep peacefully knowing AYURA watches over my mother." },
              { n: "Rajan M.", r: "68, retired teacher", q: "The voice assistant in Kannada feels like talking to a friend." },
              { n: "Dr. Asha", r: "Family physician", q: "The weekly summaries help me give better, faster guidance." },
            ].map((t) => (
              <div key={t.n} className="rounded-2xl border border-border bg-card p-6 shadow-card">
                <div className="flex gap-1 text-warning">
                  {Array.from({ length: 5 }).map((_, i) => (<Star key={i} className="h-4 w-4 fill-current" />))}
                </div>
                <p className="mt-3 text-foreground">"{t.q}"</p>
                <div className="mt-4 text-sm font-semibold">{t.n}</div>
                <div className="text-xs text-muted-foreground">{t.r}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 py-20 lg:px-8">
        <div className="rounded-3xl bg-gradient-primary p-10 text-center shadow-soft lg:p-16">
          <h2 className="text-4xl font-bold text-primary-foreground lg:text-5xl">Start caring smarter today</h2>
          <p className="mx-auto mt-4 max-w-xl text-primary-foreground/85">
            Join thousands of families using AYURA to live calmer, healthier lives.
          </p>
          <Link to="/signup">
            <Button size="lg" variant="secondary" className="mt-8 h-12 px-8 text-base">
              Get Started Free <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      <footer className="border-t border-border bg-card">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-8 text-sm text-muted-foreground md:flex-row lg:px-8">
          <Logo />
          <div>© {new Date().getFullYear()} AYURA. Smart Care for Healthier Living.</div>
        </div>
      </footer>
    </div>
  );
}

function SectionHeader({ eyebrow, title, align = "center" }: { eyebrow: string; title: string; align?: "left" | "center" }) {
  return (
    <div className={align === "center" ? "text-center" : ""}>
      <div className="text-sm font-semibold uppercase tracking-widest text-primary">{eyebrow}</div>
      <h2 className="mt-2 text-4xl font-bold tracking-tight lg:text-5xl">{title}</h2>
    </div>
  );
}