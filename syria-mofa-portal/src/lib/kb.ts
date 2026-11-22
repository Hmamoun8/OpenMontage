/**
 * Verified knowledge base + bilingual retrieval used by both the site search and the AI assistant.
 * The assistant only answers from records returned here, so every answer is traceable to a page.
 */
import { SERVICES, CATEGORIES, type Service } from "./data/services";
import { MISSIONS, type Mission } from "./data/missions";
import { tr, type Locale } from "./i18n";

export function normalize(s: string) {
  return s
    .toLowerCase()
    .replace(/[ً-ٰٟـ]/g, "") // tashkeel + tatweel
    .replace(/[أإآٱ]/g, "ا").replace(/ة/g, "ه").replace(/ى/g, "ي").replace(/ؤ/g, "و").replace(/ئ/g, "ي")
    .replace(/[^\p{L}\p{N}\s-]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const SYN: Record<string, string> = {
  اجدد: "تجديد", جدد: "تجديد", يجدد: "تجديد", renew: "renewal", passports: "passport", جوازي: "جواز", باسبور: "جواز",
  اوراق: "وثائق", الاوراق: "وثائق", documents: "docs", مولود: "ولاده", طفلي: "ولاده", اسجل: "تسجيل",
  wedding: "marriage", married: "marriage", تزوجت: "زواج", lost: "lost", ضاع: "ضايع", فقدت: "مفقود",
  attest: "attestation", certify: "attestation", شهادتي: "شهاده", proxy: "attorney", توكيل: "وكاله",
  appointment: "appointment", موعد: "موعد", embassy: "embassy", سفاره: "سفاره", السفاره: "سفاره",
};
const STOP = new Set(["how", "do", "i", "my", "in", "the", "a", "to", "for", "what", "are", "is", "of", "needed", "required", "كيف", "في", "ما", "هي", "من", "الى", "على", "عن", "المطلوبه", "مطلوب", "هل", "انا"]);

export function tokens(q: string) {
  return normalize(q).split(" ").filter((t) => t.length > 1 && !STOP.has(t)).flatMap((t) => {
    const out = [t];
    if (SYN[t]) out.push(SYN[t]);
    if (t.startsWith("ال") && t.length > 4) out.push(t.slice(2));
    if (t.startsWith("وال") && t.length > 5) out.push(t.slice(3));
    return out;
  });
}

const serviceText = (s: Service) => normalize(`${s.title.ar} ${s.title.en} ${s.keywords} ${s.summary.en} ${tr(CATEGORIES[s.category].title, "ar")} ${CATEGORIES[s.category].title.en}`);
const missionText = (m: Mission) => normalize(`${m.country.ar} ${m.country.en} ${m.city.ar} ${m.city.en} ${m.countryCode}`);
const S_IDX = SERVICES.map((s) => ({ s, text: serviceText(s), title: normalize(s.title.ar + " " + s.title.en) }));
const M_IDX = MISSIONS.map((m) => ({ m, text: missionText(m) }));

const COUNTRY_ALIASES: Record<string, string> = { السعوديه: "SA", saudi: "SA", ksa: "SA", germany: "DE", المانيا: "DE", usa: "US", america: "US", امريكا: "US", uk: "GB", britain: "GB", بريطانيا: "GB", turkey: "TR", تركيا: "TR", emirates: "AE", uae: "AE", الامارات: "AE" };

export function searchKB(q: string) {
  const toks = tokens(q);
  const services = S_IDX.map(({ s, text, title }) => ({
    s, score: toks.reduce((acc, t) => acc + (title.includes(t) ? 3 : text.includes(t) ? 1 : 0), 0),
  })).filter((x) => x.score > 0).sort((a, b) => b.score - a.score).map((x) => x.s);

  const ccs = new Set(toks.map((t) => COUNTRY_ALIASES[t]).filter(Boolean));
  const missions = M_IDX.filter(({ m, text }) => ccs.has(m.countryCode) || toks.some((t) => t.length > 2 && text.includes(t)))
    .map((x) => x.m)
    .sort((a, b) => (a.type === "embassy" ? -1 : 1) - (b.type === "embassy" ? -1 : 1));
  return { services, missions };
}

export function serviceFacts(s: Service, locale: Locale) {
  const ar = locale === "ar";
  const [a, b] = s.processingDays;
  return [
    `${tr(s.title, locale)} — /${locale}/services/${s.slug}`,
    `${ar ? "الوثائق" : "Documents"}: ${s.documents.map((d) => tr(d.label, locale) + (d.required ? "" : ar ? " (اختياري)" : " (optional)")).join("؛ ")}`,
    `${ar ? "الرسم" : "Fee"}: ${s.feeUSD ? `${s.feeUSD} USD${s.urgentFeeUSD ? ` (${ar ? "مستعجل" : "urgent"} ${s.urgentFeeUSD} USD)` : ""}` : ar ? "مجاني" : "free"}`,
    `${ar ? "المدة" : "Processing"}: ${b ? `${a}–${b} ${ar ? "يوم عمل" : "working days"}` : ar ? "فوري/حسب الحالة" : "immediate / case by case"}`,
    `${ar ? "الأهلية" : "Eligibility"}: ${tr(s.eligibility, locale)}`,
    `${ar ? "الخطوات" : "Steps"}: ${s.steps.map((x, i) => `${i + 1}. ${tr(x, locale)}`).join(" ")}`,
    `${ar ? "الحضور الشخصي" : "In person"}: ${s.inPerson ? (ar ? "نعم" : "yes") : ar ? "لا" : "no"}`,
  ].join("\n");
}

export function missionFacts(m: Mission, locale: Locale) {
  const ar = locale === "ar";
  return `${tr(m.city, locale)}, ${tr(m.country, locale)} (${ar ? { embassy: "سفارة", consulate: "قنصلية", mission: "بعثة دائمة" }[m.type] : m.type}) — /${locale}/embassies/${m.slug}\n${tr(m.hours, locale)}`;
}
