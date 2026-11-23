"use client";
import { useEffect, useState } from "react";
import { LOCALES, type Locale } from "@/lib/i18n";

export function LocalClock({ tz, locale }: { tz: string; locale: Locale }) {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => { setNow(new Date()); const i = setInterval(() => setNow(new Date()), 30_000); return () => clearInterval(i); }, []);
  if (!now) return null;
  const s = new Intl.DateTimeFormat(LOCALES[locale].intl + "-u-nu-latn", { timeZone: tz, weekday: "short", hour: "2-digit", minute: "2-digit" }).format(now);
  return <div className="mt-1 text-xs font-semibold text-gold-700">{locale === "ar" ? "الوقت المحلي الآن: " : "Local time now: "}{s}</div>;
}
