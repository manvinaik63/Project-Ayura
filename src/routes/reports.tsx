import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/ayura/AppShell";
import { Button } from "@/components/ui/button";
import { Upload, FileText, Sparkles, CheckCircle2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { apiFetch } from "@/lib/api";

export const Route=createFileRoute("/reports")({head:()=>({meta:[{title:"Medical Reports — AYURA"}]}),component:Reports});
type Report={id:string;name:string;size:number;uploadedAt:string;analysis?:{message?:string;status?:string}};

function Reports(){
  const inputRef=useRef<HTMLInputElement>(null);
  const [drag,setDrag]=useState(false);
  const [reports,setReports]=useState<Report[]>([]);
  const [uploading,setUploading]=useState(false);
  const [error,setError]=useState("");
  
  // ADDED: State to hold the AI summary response
  const [aiSummary, setAiSummary] = useState<string>("");

  const load=async()=>{try{setReports(await apiFetch("/api/reports"))}catch(e){console.log("Could not load previous reports")}};
  useEffect(()=>{load()},[]);
 
  const upload=async(file?:File)=>{
    if(!file)return;
    if(file.type!=="application/pdf"){setError("Please choose a PDF file.");return}
    
    setUploading(true);
    setError("");
    setAiSummary(""); // Clear any old summary when uploading a new file
    
    try{
      const form=new FormData();
      form.append("report",file);
      
      // Capture the response from our new backend route
      const data = await apiFetch("/api/reports",{method:"POST",body:form});
      
      // Save the summary to state so it renders in the UI
      if (data && data.summary) {
        setAiSummary(data.summary);
      }
      
      await load()
    }catch(e){
      setError(e instanceof Error?e.message:"Upload failed")
    }finally{
      setUploading(false)
    }
  };
 
  return (
    <AppShell title="Medical Reports">
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div onDragOver={e=>{e.preventDefault();setDrag(true)}} onDragLeave={()=>setDrag(false)} onDrop={e=>{e.preventDefault();setDrag(false);upload(e.dataTransfer.files[0])}} className={`rounded-3xl border-2 border-dashed p-12 text-center transition ${drag?"border-primary bg-primary/5":"border-border bg-card"}`}>
            <input ref={inputRef} hidden type="file" accept="application/pdf" onChange={e=>upload(e.target.files?.[0])}/>
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-primary/10 text-primary"><Upload className="h-8 w-8"/></div>
            <h3 className="mt-4 text-2xl font-semibold">Drag & drop a PDF report</h3>
            <p className="mt-2 text-muted-foreground">or click to browse</p>
            <Button disabled={uploading} onClick={()=>inputRef.current?.click()} className="mt-6 h-11 bg-gradient-primary px-6 shadow-soft">{uploading?"Analyzing PDF…":"Choose file"}</Button>
            {error&&<p className="mt-4 text-sm text-destructive">{error}</p>}
          </div>
          
          <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
            <h3 className="text-lg font-semibold">Uploaded reports</h3>
            <ul className="mt-4 divide-y divide-border">
              {reports.length===0?<li className="py-4 text-sm text-muted-foreground">No reports uploaded yet.</li>:reports.map(r=><li key={r.id} className="flex items-center justify-between py-3"><div className="flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-xl bg-muted"><FileText className="h-5 w-5 text-primary"/></div><div><div className="font-medium">{r.name}</div><div className="text-xs text-muted-foreground">{new Date(r.uploadedAt).toLocaleString()} · {(r.size/1024).toFixed(0)} KB</div></div></div><span className="text-xs text-muted-foreground">{r.analysis?.status||"uploaded"}</span></li>)}
            </ul>
          </div>
        </div>
        
        <div className="space-y-6">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
            <div className="flex items-center gap-2"><Sparkles className="h-5 w-5 text-primary"/><h3 className="font-semibold">AI Analysis</h3></div>
            
            {/* ADDED: Dynamic display for the AI Summary */}
            {uploading ? (
              <div className="mt-4 animate-pulse space-y-2">
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-4 bg-muted rounded w-full"></div>
                <div className="h-4 bg-muted rounded w-5/6"></div>
                <p className="text-xs text-muted-foreground mt-2">Reading and summarizing report...</p>
              </div>
            ) : aiSummary ? (
              <div className="mt-4 text-sm text-foreground space-y-3 whitespace-pre-wrap rounded-xl bg-primary/5 p-4 border border-primary/20">
                {aiSummary}
              </div>
            ) : (
              <>
                <p className="mt-3 text-sm text-muted-foreground">Upload a medical PDF report to instantly get a plain-language summary and key takeaways from AYURA.</p>
                <ul className="mt-4 space-y-2 text-sm">
                  <li className="flex gap-2"><CheckCircle2 className="h-4 w-4 shrink-0 text-success"/>Secure API upload flow is connected.</li>
                  <li className="flex gap-2"><CheckCircle2 className="h-4 w-4 shrink-0 text-success"/>PDF validation is enabled.</li>
                </ul>
              </>
            )}
          </div>
          
          <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
            <h3 className="font-semibold">Medical timeline</h3>
            <p className="mt-4 text-sm text-muted-foreground">Timeline can be populated from your database once you add structured medical-history records.</p>
          </div>
        </div>
      </div>
    </AppShell>
  );
}