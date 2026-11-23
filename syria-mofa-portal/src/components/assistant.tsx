"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Fragment, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bot, Mic, Send, Sparkles, X } from "lucide-react";
import { api } from "@/lib/client";
import { useApp } from "./providers";
import { Mark } from "./brand";

type Msg = { role: "user" | "assistant"; content: string; sources?: { title: string; href: string }[] };

/** Minimal safe renderer for **bold**, [links](/internal) and bullet lines. */
function Rich({ text }: { text: string }) {
  return (
    <>
      {text.split("\n").map((line, i) => {
        const parts = line.split(/(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g);
        return (
          <p key={i} className={line.startsWith("•") || line.startsWith("- ") ? "ps-2" : line === "" ? "h-2" : ""}>
            {parts.map((p, j) => {
              const b = p.match(/^\*\*(.+)\*\*$/);
              if (b) return <strong key={j}>{b[1]}</strong>;
              const a = p.match(/^\[(.+)\]\((.+)\)$/);
              if (a && a[2].startsWith("/")) return <Link key={j} href={a[2]} className="font-semibold text-emerald-600 underline">{a[1]}</Link>;
              return <Fragment key={j}>{p.replace(/^- /, "• ")}</Fragment>;
            })}
          </p>
        );
      })}
    </>
  );
}

export function AssistantChat({ initial, compact = false }: { initial?: string; compact?: boolean }) {
  const { locale, t } = useApp();
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState(false);
  const [listening, setListening] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const asked = useRef(false);

  // Scroll only the chat pane, never the page.
  useEffect(() => { if (box.current && (msgs.length || busy)) box.current.scrollTo({ top: box.current.scrollHeight, behavior: "smooth" }); }, [msgs, busy]);

  async function ask(text: string) {
    if (!text.trim() || busy) return;
    const next: Msg[] = [...msgs, { role: "user", content: text.trim() }];
    setMsgs(next); setQ(""); setBusy(true);
    const r = await api<{ answer: string; sources: Msg["sources"] }>("/api/assistant", { method: "POST", json: { locale, messages: next.map(({ role, content }) => ({ role, content })) } });
    setMsgs([...next, { role: "assistant", content: r.ok ? r.data.answer : r.status === 429 ? "…" : "⚠︎", sources: r.data.sources }]);
    setBusy(false);
  }

  useEffect(() => { if (initial && !asked.current) { asked.current = true; ask(initial); } }, [initial]); // eslint-disable-line react-hooks/exhaustive-deps

  function voice() {
    const W = window as unknown as { SpeechRecognition?: new () => SpeechRec; webkitSpeechRecognition?: new () => SpeechRec };
    const SR = W.SpeechRecognition ?? W.webkitSpeechRecognition;
    if (!SR) return;
    const rec = new SR();
    rec.lang = locale === "ar" ? "ar-SY" : "en-GB";
    rec.onresult = (e) => ask(e.results[0][0].transcript);
    rec.onend = () => setListening(false);
    setListening(true); rec.start();
  }

  return (
    <div className={`flex flex-col ${compact ? "h-full" : "h-[70vh] min-h-[480px]"}`}>
      <div ref={box} className="flex-1 space-y-4 overflow-y-auto p-4" aria-live="polite">
        {!msgs.length && (
          <div className="space-y-3 py-4 text-center">
            <Mark className="mx-auto h-14 w-14" />
            <p className="text-sm text-navy-300">{t.assistant.lead}</p>
            <div className="flex flex-col gap-2">
              {t.assistant.examples.map((e) => <button key={e} onClick={() => ask(e)} className="rounded-xl border border-navy-700/10 bg-ivory-50 px-4 py-2.5 text-start text-sm hover:border-gold-500">{e}</button>)}
              {locale === "ar" ? <button onClick={() => ask("How do I renew my passport in Saudi Arabia?")} className="rounded-xl border border-navy-700/10 bg-ivory-50 px-4 py-2.5 text-start text-sm hover:border-gold-500" dir="ltr" lang="en">How do I renew my passport in Saudi Arabia?</button>
                : <button onClick={() => ask("كيف أجدد جواز سفري في ألمانيا؟")} className="rounded-xl border border-navy-700/10 bg-ivory-50 px-4 py-2.5 text-start text-sm hover:border-gold-500" dir="rtl" lang="ar">كيف أجدد جواز سفري في ألمانيا؟</button>}
            </div>
          </div>
        )}
        {msgs.map((m, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div dir="auto" className={`max-w-[88%] space-y-1 rounded-2xl px-4 py-3 text-sm ${m.role === "user" ? "rounded-ee-sm bg-emerald-500 text-white" : "rounded-es-sm bg-ivory text-navy-700"}`}>
              {m.role === "assistant" ? <Rich text={m.content} /> : m.content}
              {!!m.sources?.length && (
                <div className="mt-3 border-t border-navy-700/10 pt-2">
                  <div className="mb-1 text-[11px] font-semibold text-navy-300">{t.assistant.sources}</div>
                  <div className="flex flex-wrap gap-1.5">{m.sources.map((s) => <Link key={s.href} href={s.href} className="chip bg-white text-emerald-600 hover:bg-emerald-50">{s.title}</Link>)}</div>
                </div>
              )}
            </div>
          </motion.div>
        ))}
        {busy && <div className="flex items-center gap-2 text-sm text-navy-300"><Sparkles className="h-4 w-4 animate-pulse text-gold-500" />{t.assistant.thinking}</div>}
      </div>
      <form onSubmit={(e) => { e.preventDefault(); ask(q); }} className="flex items-center gap-2 border-t border-navy-700/10 p-3">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t.assistant.placeholder} className="input" dir="auto" aria-label={t.assistant.placeholder} maxLength={2000} />
        <button type="button" onClick={voice} aria-label={t.assistant.voice} className={`rounded-xl border p-3 ${listening ? "animate-pulse border-red-400 text-red-500" : "border-navy-700/15 text-navy-300 hover:text-navy-700"}`}><Mic className="h-4 w-4" /></button>
        <button className="btn-primary !px-4" disabled={busy || !q.trim()} aria-label={t.assistant.send}><Send className="h-4 w-4 rtl:-scale-x-100" /></button>
      </form>
      <p className="px-4 pb-3 text-[11px] text-navy-300">{t.assistant.disclaimer}</p>
    </div>
  );
}

interface SpeechRec { lang: string; start(): void; onresult: (e: { results: { 0: { 0: { transcript: string } } } }) => void; onend: () => void }

export function AssistantWidget() {
  const { t } = useApp();
  const [open, setOpen] = useState(false);
  const path = usePathname();
  if (/\/(dashboard|login|receipt)/.test(path)) return null;
  return (
    <>
      <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: .95 }} onClick={() => setOpen(!open)} aria-label={t.assistant.title} aria-expanded={open}
        className="no-print fixed bottom-5 end-5 z-[60] flex items-center gap-2 rounded-full bg-navy-700 py-3 pe-5 ps-3 text-white shadow-glow">
        <span className="grid h-9 w-9 place-items-center rounded-full bg-gold-500 text-navy-900">{open ? <X className="h-5 w-5" /> : <Bot className="h-5 w-5" />}</span>
        <span className="hidden text-sm font-semibold sm:inline">{t.assistant.title}</span>
      </motion.button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: 20, scale: .96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: .96 }}
            className="no-print fixed bottom-24 end-5 z-[60] flex h-[min(620px,75vh)] w-[min(400px,calc(100vw-2.5rem))] flex-col overflow-hidden rounded-3xl border border-navy-700/10 bg-white shadow-2xl" role="dialog" aria-label={t.assistant.title}>
            <div className="relative overflow-hidden bg-navy-700 px-5 py-4 text-white">
              <div className="pattern absolute inset-0 opacity-20" />
              <div className="relative font-bold">{t.assistant.title}</div>
              <div className="relative text-xs text-white/70">{t.assistant.lead}</div>
            </div>
            <AssistantChat compact />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
