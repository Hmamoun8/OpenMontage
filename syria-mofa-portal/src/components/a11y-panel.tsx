"use client";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useApp } from "./providers";

export function A11yPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t, prefs, setPrefs } = useApp();
  const Toggle = ({ k, label }: { k: "contrast" | "motion" | "links"; label: string }) => (
    <label className="flex cursor-pointer items-center justify-between rounded-xl border border-navy-700/10 p-4">
      <span className="font-medium">{label}</span>
      <input type="checkbox" className="h-5 w-5 accent-emerald-500" checked={prefs[k]} onChange={(e) => setPrefs({ [k]: e.target.checked })} />
    </label>
  );
  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[80] bg-navy-900/50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
          <motion.aside role="dialog" aria-modal aria-label={t.a11y.title} onClick={(e) => e.stopPropagation()}
            className="absolute inset-y-0 end-0 w-full max-w-sm space-y-4 bg-white p-6 text-navy-700 shadow-2xl"
            initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 30, stiffness: 300 }}>
            <div className="flex items-center justify-between"><h2 className="text-xl font-bold">{t.a11y.title}</h2><button onClick={onClose} aria-label={t.common.close} className="rounded-lg p-2 hover:bg-ivory"><X /></button></div>
            <div className="rounded-xl border border-navy-700/10 p-4">
              <div className="mb-3 font-medium">{t.a11y.text}</div>
              <div className="flex gap-2">
                {[0.9, 1, 1.15, 1.3].map((s) => (
                  <button key={s} onClick={() => setPrefs({ scale: s })} aria-pressed={prefs.scale === s} className={`flex-1 rounded-lg border py-2 font-bold ${prefs.scale === s ? "border-emerald-500 bg-emerald-50 text-emerald-600" : "border-navy-700/10"}`} style={{ fontSize: 12 * s + 2 }}>A</button>
                ))}
              </div>
            </div>
            <Toggle k="contrast" label={t.a11y.contrast} />
            <Toggle k="motion" label={t.a11y.motion} />
            <Toggle k="links" label={t.a11y.links} />
            <button className="btn-ghost w-full" onClick={() => setPrefs({ scale: 1, contrast: false, motion: false, links: false })}>{t.a11y.reset}</button>
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
