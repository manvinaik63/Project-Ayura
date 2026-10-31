import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/ayura/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mic, Send, Plus, MessageCircle, Sparkles, Globe } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { apiFetch } from "@/lib/api";

export const Route = createFileRoute("/assistant")({ head: () => ({ meta: [{ title: "AYURA AI Assistant" }] }), component: Assistant });
type Msg = { role: "user" | "ai"; text: string };
const conversations=["Sleep pattern this week","Did I miss medication?","Heart-friendly diet tips","Morning walk routine"];
const prompts=["Analyze my sleep pattern","Give me health suggestions","Did I miss medication?","How is my health this week?"];

function Assistant(){
 const [messages,setMessages]=useState<Msg[]>([{role:"ai",text:"Namaste 🙏 — I'm AYURA. How can I support you today?"}]);
 const [input,setInput]=useState(""); 
 const [typing,setTyping]=useState(false); 
 const [lang,setLang]=useState<"EN"|"KN">("EN");
 const [isListening, setIsListening] = useState(false);
 const chatEndRef = useRef<HTMLDivElement>(null);

 // Fetch chat history from Supabase on load
 useEffect(() => {
   apiFetch("/api/chats").then(data => {
     if (Array.isArray(data) && data.length > 0) {
       // Backend sorts newest first, so reverse to show chronologically
       const history = data.reverse().flatMap((c: any) => [
        { role: "user" as const, text: c.message },
        { role: "ai" as const, text: c.reply }
      ]);
       setMessages([{role:"ai",text:"Namaste 🙏 — I'm AYURA. How can I support you today?"}, ...history]);
     }
   }).catch(err => console.log("No previous chats found", err));
 }, []);

 // Auto-scroll to the latest message
 useEffect(() => {
   chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
 }, [messages]);

 const send=async(text:string)=>{if(!text.trim()||typing)return; setMessages(m=>[...m,{role:"user",text}]);setInput("");setTyping(true);try{const data=await apiFetch("/api/ai/chat",{method:"POST",body:JSON.stringify({message:text,language:lang})});setMessages(m=>[...m,{role:"ai",text:data.reply}]);}catch(err){setMessages(m=>[...m,{role:"ai",text:err instanceof Error?err.message:"Sorry, I couldn't reach AYURA."}]);}finally{setTyping(false)}};

 const handleVoiceClick = () => {
   const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
   if (!SpeechRecognition) {
     alert("Voice input is not supported in this browser. Please use Chrome.");
     return;
   }
   const recognition = new SpeechRecognition();
   recognition.lang = lang === "KN" ? "kn-IN" : "en-IN"; 
   recognition.continuous = false;

   recognition.onstart = () => setIsListening(true);
   recognition.onend = () => setIsListening(false);
   recognition.onresult = (event: any) => {
     const transcript = event.results[0][0].transcript;
     setInput(prev => prev ? `${prev} ${transcript}` : transcript);
   };

   if (isListening) {
     recognition.stop();
   } else {
     recognition.start();
   }
 };

 return <AppShell title="AYURA AI"><div className="grid gap-6 lg:grid-cols-[280px_1fr]"><aside className="hidden rounded-2xl border border-border bg-card p-4 shadow-card lg:block"><Button onClick={()=>setMessages([{role:"ai",text:"New chat started. How can I help?"}])} className="w-full bg-gradient-primary shadow-soft"><Plus className="mr-2 h-4 w-4"/> New chat</Button><div className="mt-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Recent</div><ul className="mt-2 space-y-1">{conversations.map(c=><li key={c}><button onClick={()=>send(c)} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm hover:bg-muted"><MessageCircle className="h-4 w-4 text-muted-foreground"/><span className="truncate">{c}</span></button></li>)}</ul></aside><div className="flex h-[calc(100vh-12rem)] flex-col rounded-2xl border border-border bg-card shadow-card"><div className="flex items-center justify-between border-b border-border px-5 py-3"><div className="flex items-center gap-2"><Sparkles className="h-5 w-5 text-primary"/><span className="font-semibold">AYURA Assistant</span></div><button onClick={()=>setLang(lang==="EN"?"KN":"EN")} className="flex items-center gap-1 rounded-full border border-border px-3 py-1 text-sm hover:bg-muted"><Globe className="h-4 w-4"/> {lang==="EN"?"English":"ಕನ್ನಡ"}</button></div><div className="flex-1 space-y-4 overflow-y-auto p-5">{messages.map((m,i)=><div key={i} className={`flex ${m.role==="user"?"justify-end":"justify-start"}`}>{m.role==="user"?<div className="max-w-[75%] rounded-2xl bg-primary px-4 py-3 text-primary-foreground shadow-soft">{m.text}</div>:<div className="flex max-w-[80%] gap-3"><div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-primary text-primary-foreground"><Sparkles className="h-4 w-4"/></div><div className="rounded-2xl bg-muted px-4 py-3 text-foreground">{m.text}</div></div>}</div>)}{typing&&<div className="rounded-2xl bg-muted px-4 py-3 w-fit text-sm">AYURA is thinking…</div>}<div ref={chatEndRef} /></div>{messages.length<=1&&<div className="px-5 pb-2"><div className="flex flex-wrap gap-2">{prompts.map(p=><button key={p} onClick={()=>send(p)} className="rounded-full border border-border bg-background px-4 py-2 text-sm hover:bg-muted">{p}</button>)}</div></div>}<form onSubmit={e=>{e.preventDefault();send(input)}} className="flex items-center gap-2 border-t border-border p-4"><Button onClick={handleVoiceClick} type="button" size="icon" variant="ghost" aria-label="Voice input" className={isListening ? "animate-pulse" : ""}><Mic className={`h-5 w-5 ${isListening ? "text-red-500" : "text-primary"}`}/></Button><Input value={input} onChange={e=>setInput(e.target.value)} placeholder="Ask AYURA anything…" className="h-12 flex-1 text-base"/><Button disabled={typing} type="submit" size="icon" className="h-12 w-12 bg-gradient-primary"><Send className="h-5 w-5"/></Button></form></div></div></AppShell>;
}