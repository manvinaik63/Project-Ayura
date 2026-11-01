import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/ayura/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, FileText, Sparkles, Mic, Volume2, AlertTriangle } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { apiFetch } from "@/lib/api";
import { speak, startRecording, transcribe } from "@/lib/voice";

export const Route = createFileRoute("/reports")({
  head: () => ({ meta: [{ title: "Medical Reports — AYURA" }] }),
  component: Reports,
});

// [backend field, label, unit] for every number the user can check or type
const FIELDS = [
  ["total_cholesterol", "Total cholesterol", "mg/dL"],
  ["ldl", "LDL cholesterol", "mg/dL"],
  ["hdl", "HDL cholesterol", "mg/dL"],
  ["triglycerides", "Triglycerides", "mg/dL"],
  ["systolic_bp", "Blood pressure, upper", "mm Hg"],
  ["diastolic_bp", "Blood pressure, lower", "mm Hg"],
  ["heart_rate", "Resting heart rate", "bpm"],
  ["fasting_glucose", "Fasting blood sugar", "mg/dL"],
  ["hba1c", "HbA1c", "%"],
  ["max_hr", "Highest heart rate in treadmill test", "bpm"],
  ["oldpeak", "ST depression in treadmill test", "mm"],
] as const;

const STATUS_STYLE: Record<string, string> = {
  normal: "bg-success/15 text-success",
  borderline: "bg-warning/15 text-warning",
  high: "bg-destructive/15 text-destructive",
  critical: "bg-destructive text-destructive-foreground",
};
const RISK_STYLE: Record<string, string> = { low: STATUS_STYLE.normal, moderate: STATUS_STYLE.borderline, high: STATUS_STYLE.high };

type Values = Record<string, number | boolean | string>;

function Reports() {
  const fileInput = useRef<HTMLInputElement>(null);
  const stopRecording = useRef<null | (() => Promise<Blob>)>(null);
  const [reports, setReports] = useState<any[]>([]);
  const [reportId, setReportId] = useState<number | null>(null);   // null = typed or spoken values
  const [values, setValues] = useState<Values | null>(null);
  const [analysis, setAnalysis] = useState<any>(null);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [recording, setRecording] = useState(false);

  const loadReports = () => apiFetch("/reports").then(setReports).catch(() => { });
  useEffect(() => { loadReports(); }, []);

  async function run(message: string, task: () => Promise<void>) {
    setBusy(message);
    setError("");
    try { await task(); }
    catch (e) { setError(e instanceof Error ? e.message : "Something went wrong"); }
    finally { setBusy(""); }
  }

  const upload = (file?: File) => file && run("Reading your report…", async () => {
    const form = new FormData();
    form.append("file", file);                       // the backend expects the field name "file"
    const report = await apiFetch("/reports/upload", { method: "POST", body: form });
    setReportId(report.id);
    setValues(report.values);
    setAnalysis(null);
    loadReports();
  });

  function typeValues() {
    setReportId(null);
    setValues({});
    setAnalysis(null);
  }

  async function toggleVoice() {
    if (!recording) {
      try { stopRecording.current = await startRecording(); setRecording(true); }
      catch { setError("Please allow microphone access in the browser."); }
      return;
    }
    setRecording(false);
    const audio = await stopRecording.current!();
    run("Listening…", async () => {
      const result = await transcribe(audio, "/voice/values");
      if (!values) setReportId(null);
      setValues((v) => ({ ...(v ?? {}), ...result.values }));
      setAnalysis(null);
    });
  }

  const analyse = () => run("Checking your values…", async () => {
    const clean = Object.fromEntries(Object.entries(values ?? {}).filter(([, v]) => v !== "" && v !== null));
    const report = reportId
      ? await apiFetch(`/reports/${reportId}/values`, { method: "PUT", body: JSON.stringify(clean) })
      : await apiFetch("/reports/manual", { method: "POST", body: JSON.stringify(clean) });
    const result = await apiFetch(`/analysis/report/${report.id}`, { method: "POST" });
    setAnalysis(result);
    loadReports();
    if (result.urgent) speak("Some of your results need a doctor today. Please press the SOS button or call 1 1 2.");

    setBusy("Preparing your diet and lifestyle plan. This can take up to a minute…");
    const withPlan = await apiFetch(`/analysis/${result.id}/plan`, { method: "POST" });
    setAnalysis(withPlan);
    speak(withPlan.plan.speak_text);
  });

  const setField = (key: string, value: number | boolean | string) => setValues((v) => ({ ...(v ?? {}), [key]: value }));

  return (
    <AppShell title="Medical Reports">
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* Step 1: get values */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => { e.preventDefault(); upload(e.dataTransfer.files[0]); }}
            className="rounded-3xl border-2 border-dashed border-border bg-card p-10 text-center"
          >
            <input ref={fileInput} hidden type="file" accept="application/pdf,image/png,image/jpeg" onChange={(e) => upload(e.target.files?.[0])} />
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-primary/10 text-primary"><Upload className="h-8 w-8" /></div>
            <h3 className="mt-4 text-2xl font-semibold">Add a heart report</h3>
            <p className="mt-2 text-muted-foreground">Upload a PDF or a clear photo, type your values, or say them aloud.</p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Button disabled={!!busy} onClick={() => fileInput.current?.click()} className="h-12 bg-gradient-primary px-6 text-base shadow-soft">Choose file</Button>
              <Button disabled={!!busy} variant="outline" onClick={typeValues} className="h-12 text-base">Type values</Button>
              <Button disabled={!!busy && !recording} variant="outline" onClick={toggleVoice} className="h-12 text-base">
                <Mic className={`mr-2 h-5 w-5 ${recording ? "animate-pulse text-red-500" : ""}`} />
                {recording ? "Stop and use" : "Speak values"}
              </Button>
            </div>
            {busy && <p className="mt-4 text-sm text-muted-foreground">{busy}</p>}
            {error && <p className="mt-4 text-sm text-destructive">{error}</p>}
          </div>

          {/* Step 2: check values */}
          {values && !analysis && (
            <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
              <h3 className="text-lg font-semibold">Please check these values</h3>
              <p className="mt-1 text-sm text-muted-foreground">Correct anything that looks wrong and leave unknown ones empty.</p>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {FIELDS.map(([key, label, unit]) => (
                  <label key={key} className="text-sm font-medium">
                    {label} ({unit})
                    <Input type="number" step="any" className="mt-1 h-12 text-base"
                      value={(values[key] as number | string) ?? ""}
                      onChange={(e) => setField(key, e.target.value === "" ? "" : Number(e.target.value))} />
                  </label>
                ))}
                <label className="text-sm font-medium">
                  Chest pain when walking or climbing stairs?
                  <select className="mt-1 h-12 w-full rounded-md border border-input bg-background px-3 text-base"
                    value={values.exercise_angina === undefined ? "" : String(values.exercise_angina)}
                    onChange={(e) => setField("exercise_angina", e.target.value === "" ? "" : e.target.value === "true")}>
                    <option value="">Not sure</option><option value="false">No</option><option value="true">Yes</option>
                  </select>
                </label>
              </div>
              <Button disabled={!!busy} onClick={analyse} className="mt-6 h-12 w-full bg-gradient-primary text-base">Analyse my report</Button>
            </div>
          )}

          {/* Steps 3 and 4: results and plan */}
          {analysis && <Results analysis={analysis} busy={busy} />}
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
          <h3 className="text-lg font-semibold">Your reports</h3>
          <ul className="mt-4 divide-y divide-border">
            {reports.length === 0
              ? <li className="py-4 text-sm text-muted-foreground">No reports yet.</li>
              : reports.map((r) => (
                <li key={r.id} className="flex items-center gap-3 py-3">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-muted"><FileText className="h-5 w-5 text-primary" /></div>
                  <div className="flex-1">
                    <div className="font-medium">{r.filename}</div>
                    <div className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleString()}</div>
                  </div>
                  <span className="text-xs text-muted-foreground">{r.confirmed ? "checked" : "not checked"}</span>
                </li>
              ))}
          </ul>
        </div>
      </div>
    </AppShell>
  );
}

function Results({ analysis, busy }: { analysis: any; busy: string }) {
  const plan = analysis.plan;
  return (
    <div className="space-y-6">
      {analysis.urgent && (
        <div className="flex items-center gap-3 rounded-2xl bg-destructive p-5 text-destructive-foreground">
          <AlertTriangle className="h-6 w-6 shrink-0" />
          <span className="text-lg font-semibold">Some results need a doctor today. Press SOS or call 112.</span>
        </div>
      )}

      <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-lg font-semibold">Your results</h3>
          <span className={`rounded-full px-4 py-1 text-sm font-semibold ${RISK_STYLE[analysis.risk_level]}`}>
            Heart risk: {analysis.risk_level} ({Math.round(analysis.risk_score * 100)}%)
          </span>
        </div>
        <ul className="mt-4 divide-y divide-border">
          {analysis.flags.map((f: any) => (
            <li key={f.field} className="flex items-center justify-between gap-3 py-3">
              <div>
                <div className="font-medium">{f.label}: {String(f.value)} {f.unit}</div>
                <div className="text-sm text-muted-foreground">{f.note}</div>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${STATUS_STYLE[f.status]}`}>{f.status}</span>
            </li>
          ))}
        </ul>
        {analysis.reasons.length > 0 && (
          <p className="mt-4 text-sm">Main reasons for this score: {analysis.reasons.map((r: any) => r.factor).join(", ")}.</p>
        )}
        <p className="mt-4 text-xs text-muted-foreground">{analysis.disclaimer}</p>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="flex items-center gap-2 text-lg font-semibold"><Sparkles className="h-5 w-5 text-primary" /> Your diet and lifestyle plan</h3>
          {plan && <Button variant="outline" onClick={() => speak(plan.speak_text)}><Volume2 className="mr-2 h-4 w-4" /> Read aloud</Button>}
        </div>
        {!plan ? (
          <p className="mt-4 animate-pulse text-sm text-muted-foreground">{busy || "Preparing your plan…"}</p>
        ) : (
          <div className="mt-4 space-y-4 text-base">
            <p>{plan.summary}</p>
            <PlanList title="Eat more" items={plan.eat_more} />
            <PlanList title="Eat less" items={plan.limit} />
            <div>
              <div className="font-semibold">A sample day</div>
              <ul className="mt-1 list-disc pl-5">
                {Object.entries(plan.sample_day).map(([meal, food]) => (
                  <li key={meal}><span className="capitalize">{meal.replace("_", " ")}</span>: {String(food)}</li>
                ))}
              </ul>
            </div>
            <PlanList title="Exercise" items={plan.exercise} />
            <PlanList title="Daily habits" items={plan.lifestyle} />
            <p className="font-medium">{plan.see_doctor}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function PlanList({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <div className="font-semibold">{title}</div>
      <ul className="mt-1 list-disc pl-5">{items.map((item) => <li key={item}>{item}</li>)}</ul>
    </div>
  );
}