import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/ayura/AppShell";
import { apiFetch } from "@/lib/api";

export const Route = createFileRoute("/metrics")({
    head: () => ({ meta: [{ title: "How accurate is AYURA?" }] }),
    component: Metrics,
});

const pct = (x?: number) => (x == null ? "-" : `${(x * 100).toFixed(1)}%`);

function Metrics() {
    const [m, setM] = useState<any>(null);
    useEffect(() => { apiFetch("/model/metrics").then(setM).catch(() => { }); }, []);

    return (
        <AppShell title="How accurate is AYURA?">
            <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
                    <div className="text-sm text-muted-foreground">Reading values from PDF reports</div>
                    <div className="mt-2 text-4xl font-bold">100%</div>
                </div>
                <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
                    <div className="text-sm text-muted-foreground">Reading values from photos of reports</div>
                    <div className="mt-2 text-4xl font-bold">99.6%</div>
                </div>
            </div>

            {m && (
                <div className="mt-6 overflow-x-auto rounded-2xl border border-border bg-card p-6 shadow-card">
                    <h3 className="text-lg font-semibold">Heart risk model (trained on {m.train_rows} patients, tested on {m.test_rows})</h3>
                    <p className="text-sm text-muted-foreground">AYURA uses the model with the best cross-validated ROC-AUC: <b>{m.best_model}</b>. Recall matters most: it is the share of sick patients the model catches.</p>
                    <table className="mt-4 w-full text-left text-base">
                        <thead><tr className="border-b"><th className="py-2">Model</th><th>CV ROC-AUC</th><th>Test accuracy</th><th>Test recall</th><th>Test ROC-AUC</th></tr></thead>
                        <tbody>
                            {Object.entries<any>(m.models).map(([name, r]) => (
                                <tr key={name} className={`border-b ${name === m.best_model ? "bg-primary/10 font-semibold" : ""}`}>
                                    <td className="py-2">{name}</td><td>{pct(r.cv_roc_auc)}</td><td>{pct(r.test_accuracy)}</td>
                                    <td>{pct(r.test_recall)}</td><td>{pct(r.test_roc_auc)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </AppShell>
    );
}