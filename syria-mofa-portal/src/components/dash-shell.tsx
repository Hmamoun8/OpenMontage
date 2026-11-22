"use client";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { useApp } from "./providers";
import { Mark } from "./brand";
import { api } from "@/lib/client";

export type Tab = { id: string; label: string; icon: React.ComponentType<{ className?: string }> };

export function DashShell({ title, user, tabs, tab, setTab, children }: { title: string; user?: string; tabs: Tab[]; tab: string; setTab: (t: string) => void; children: React.ReactNode }) {
  const { locale, t } = useApp();
  const router = useRouter();
  return (
    <div className="min-h-screen bg-ivory-50 pt-[100px]">
      <div className="container-gov grid gap-6 py-6 lg:grid-cols-[240px_1fr]">
        <aside className="lg:sticky lg:top-28 lg:self-start">
          <div className="card overflow-hidden">
            <div className="relative bg-navy-700 p-5 text-white"><div className="pattern absolute inset-0 opacity-15" /><Mark className="relative h-9 w-9" /><div className="relative mt-2 font-bold">{title}</div><div className="relative text-xs text-white/60">{user}</div></div>
            <nav className="flex gap-1 overflow-x-auto p-2 lg:flex-col" aria-label={title}>
              {tabs.map((x) => (
                <button key={x.id} onClick={() => setTab(x.id)} aria-current={tab === x.id} className={`flex shrink-0 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium ${tab === x.id ? "bg-emerald-50 text-emerald-700" : "hover:bg-ivory"}`}><x.icon className="h-4 w-4" />{x.label}</button>
              ))}
              <button onClick={async () => { await api("/api/auth/logout", { method: "POST" }); router.push(`/${locale}/login`); }} className="flex shrink-0 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-flag-red hover:bg-red-50"><LogOut className="h-4 w-4" />{t.dash.signOut}</button>
            </nav>
          </div>
        </aside>
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}

export function Stat({ label, value, accent = "emerald" }: { label: string; value: React.ReactNode; accent?: "emerald" | "gold" | "navy" | "red" }) {
  const c = { emerald: "text-emerald-600", gold: "text-gold-700", navy: "text-navy-700", red: "text-flag-red" }[accent];
  return <div className="card p-5"><div className="text-xs text-navy-300">{label}</div><div className={`mt-1 text-3xl font-bold ${c}`}>{value}</div></div>;
}

export function Bars({ data, labels }: { data: Record<string, number>; labels?: Record<string, string> }) {
  const max = Math.max(1, ...Object.values(data));
  return (
    <ul className="space-y-2.5">
      {Object.entries(data).sort((a, b) => b[1] - a[1]).map(([k, v]) => (
        <li key={k} className="grid grid-cols-[140px_1fr_32px] items-center gap-3 text-sm">
          <span className="truncate text-navy-500">{labels?.[k] ?? k}</span>
          <span className="h-2.5 overflow-hidden rounded-full bg-ivory-200"><span className="block h-full rounded-full bg-gradient-to-r from-emerald-500 to-gold-500" style={{ width: `${(v / max) * 100}%` }} /></span>
          <span className="text-end font-semibold">{v}</span>
        </li>
      ))}
    </ul>
  );
}
