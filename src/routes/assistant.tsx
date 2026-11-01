import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/ayura/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mic, Send, Plus, MessageCircle, Sparkles } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { apiFetch } from "@/lib/api";
import { startRecording, transcribe, speak } from "@/lib/voice";

export const Route = createFileRoute("/assistant")({
  head: () => ({ meta: [{ title: "AYURA AI Assistant" }] }),
  component: Assistant,
});

type Msg = { role: "user" | "ai"; text: string };

const GREETING: Msg = { role: "ai", text: "Namaste 🙏 I'm AYURA. Ask me anything about your heart health, food or exercise." };
const prompts = ["Explain my last report", "What should I eat today?", "Is walking safe for me?", "How can I lower my BP?"];

function Assistant() {
  const [messages, setMessages] = useState<Msg[]>([GREETING]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [emergency, setEmergency] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const stopRef = useRef<null | (() => Promise<Blob>)>(null);

  // Auto-scroll to the latest message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  const send = async (text: string, spoken = false) => {
    if (!text.trim() || typing) return;
    // Recent conversation, so the model remembers what was said (greeting skipped)
    const history = messages.slice(1).map((m) => ({
      role: m.role === "ai" ? "assistant" : "user",
      content: m.text,
    }));
    setMessages((m) => [...m, { role: "user", text }]);
    setInput("");
    setTyping(true);
    try {
      const data = await apiFetch("/assistant/chat", {
        method: "POST",
        body: JSON.stringify({ message: text, history }),
      });
      setMessages((m) => [...m, { role: "ai", text: data.reply }]);
      setEmergency(Boolean(data.emergency));
      if (spoken || data.emergency) speak(data.reply);
    } catch (err) {
      setMessages((m) => [...m, { role: "ai", text: err instanceof Error ? err.message : "Sorry, I couldn't reach AYURA." }]);
    } finally {
      setTyping(false);
    }
  };

  // First press: start recording. Second press: stop, send to Whisper, ask the question.
  const handleVoiceClick = async () => {
    if (!isListening) {
      try {
        stopRef.current = await startRecording();
        setIsListening(true);
      } catch {
        alert("Please allow microphone access to talk to AYURA.");
      }
      return;
    }
    setIsListening(false);
    const audio = await stopRef.current!();
    try {
      const text = await transcribe(audio);
      if (text) send(text, true);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Could not understand the recording.");
    }
  };

  const newChat = () => {
    setMessages([GREETING]);
    setEmergency(false);
  };

  return (
    <AppShell title="AYURA AI">
      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <aside className="hidden rounded-2xl border border-border bg-card p-4 shadow-card lg:block">
          <Button onClick={newChat} className="w-full bg-gradient-primary shadow-soft">
            <Plus className="mr-2 h-4 w-4" /> New chat
          </Button>
          <div className="mt-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Try asking</div>
          <ul className="mt-2 space-y-1">
            {prompts.map((c) => (
              <li key={c}>
                <button onClick={() => send(c)} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm hover:bg-muted">
                  <MessageCircle className="h-4 w-4 text-muted-foreground" />
                  <span className="truncate">{c}</span>
                </button>
              </li>
            ))}
          </ul>
        </aside>

        <div className="flex h-[calc(100vh-12rem)] flex-col rounded-2xl border border-border bg-card shadow-card">
          <div className="flex items-center gap-2 border-b border-border px-5 py-3">
            <Sparkles className="h-5 w-5 text-primary" />
            <span className="font-semibold">AYURA Assistant</span>
          </div>

          {emergency && (
            <div className="mx-5 mt-4 rounded-xl bg-red-600 p-4 text-base font-semibold text-white">
              This may be an emergency. <a href="tel:112" className="underline">Tap here to call 112</a> or press SOS.
            </div>
          )}

          <div className="flex-1 space-y-4 overflow-y-auto p-5">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                {m.role === "user" ? (
                  <div className="max-w-[75%] rounded-2xl bg-primary px-4 py-3 text-primary-foreground shadow-soft">{m.text}</div>
                ) : (
                  <div className="flex max-w-[80%] gap-3">
                    <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-primary text-primary-foreground">
                      <Sparkles className="h-4 w-4" />
                    </div>
                    <div className="rounded-2xl bg-muted px-4 py-3 text-foreground">{m.text}</div>
                  </div>
                )}
              </div>
            ))}
            {typing && <div className="w-fit rounded-2xl bg-muted px-4 py-3 text-sm">AYURA is thinking…</div>}
            <div ref={chatEndRef} />
          </div>

          {messages.length <= 1 && (
            <div className="px-5 pb-2">
              <div className="flex flex-wrap gap-2">
                {prompts.map((p) => (
                  <button key={p} onClick={() => send(p)} className="rounded-full border border-border bg-background px-4 py-2 text-sm hover:bg-muted">
                    {p}
                  </button>
                ))}
              </div>
            </div>
          )}

          <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="flex items-center gap-2 border-t border-border p-4">
            <Button
              onClick={handleVoiceClick}
              type="button"
              size="icon"
              variant="ghost"
              aria-label={isListening ? "Stop and send" : "Speak your question"}
              className={`h-12 w-12 ${isListening ? "animate-pulse" : ""}`}
            >
              <Mic className={`h-6 w-6 ${isListening ? "text-red-500" : "text-primary"}`} />
            </Button>
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={isListening ? "Listening… press the mic again when done" : "Ask AYURA anything…"}
              className="h-12 flex-1 text-base"
            />
            <Button disabled={typing} type="submit" size="icon" className="h-12 w-12 bg-gradient-primary">
              <Send className="h-5 w-5" />
            </Button>
          </form>
        </div>
      </div>
    </AppShell>
  );
}
