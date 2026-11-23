import type { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { fail, guard, json } from "@/lib/server/api";
import { missionFacts, searchKB, serviceFacts } from "@/lib/kb";
import { tr, type Locale } from "@/lib/i18n";

const Body = z.object({
  locale: z.enum(["ar", "en"]),
  messages: z.array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().max(2000) })).min(1).max(20),
});

const SYSTEM = `You are the official consular assistant of the Syrian Ministry of Foreign Affairs and Expatriates portal.
Rules:
- Answer ONLY from the VERIFIED MINISTRY RECORDS provided in the latest user turn. If the records do not contain the answer, say so and suggest contacting the relevant mission or using the site search.
- Reply in the language of the user's question (Arabic or English). Use Modern Standard Arabic for Arabic.
- Be concise: a one-sentence answer, then a short list of documents/steps, then the relevant page link(s) exactly as given in the records (paths starting with /ar/ or /en/).
- Never invent fees, phone numbers, addresses, names of officials, or legal requirements.
- For emergencies (detention, danger, medical), direct the user first to the mission's 24/7 emergency hotline page.
- Do not give political opinions; you assist with consular services and site navigation only.`;

export async function POST(req: NextRequest) {
  const g = guard(req, "assistant", 20);
  if (g) return g;
  const p = Body.safeParse(await req.json().catch(() => null));
  if (!p.success) return fail("invalid_input");
  const { messages } = p.data;
  const q = messages[messages.length - 1].content;
  const loc: Locale = /[؀-ۿ]/.test(q) ? "ar" : "en";
  const ar = loc === "ar";

  const { services, missions } = searchKB(q + " " + messages.slice(-3, -1).map((m) => m.content).join(" "));
  const topS = services.slice(0, 3);
  const topM = missions.slice(0, 2);
  const sources = [
    ...topS.map((s) => ({ title: tr(s.title, loc), href: `/${loc}/services/${s.slug}` })),
    ...topM.map((m) => ({ title: `${tr(m.city, loc)} — ${tr(m.country, loc)}`, href: `/${loc}/embassies/${m.slug}` })),
  ];
  const records = [...topS.map((s) => serviceFacts(s, loc)), ...topM.map((m) => missionFacts(m, loc))].join("\n\n");

  if (process.env.ANTHROPIC_API_KEY) {
    try {
      const client = new Anthropic();
      const history = messages.slice(0, -1).map((m) => ({ role: m.role, content: m.content }));
      const res = await client.beta.messages.create({
        model: "claude-opus-5-5",
        max_tokens: 2000,
        betas: ["server-side-fallback-2026-07-01"],
        fallbacks: "default",
        output_config: { effort: "low" },
        system: [{ type: "text", text: SYSTEM, cache_control: { type: "ephemeral" } }],
        messages: [
          ...history,
          { role: "user", content: `VERIFIED MINISTRY RECORDS:\n${records || "(no matching records)"}\n\nQUESTION:\n${q}` },
        ],
      } as Parameters<typeof client.beta.messages.create>[0]) as Anthropic.Beta.BetaMessage;
      if (res.stop_reason !== "refusal") {
        const text = res.content.map((b) => (b.type === "text" ? b.text : "")).join("").trim();
        if (text) return json({ answer: text, sources, mode: "ai" });
      }
    } catch (e) {
      console.error("assistant: model call failed, using knowledge-base answer", e instanceof Anthropic.APIError ? e.status : e);
    }
  }

  // Deterministic, grounded answer composed directly from the knowledge base.
  if (!topS.length && !topM.length) {
    return json({
      answer: ar
        ? "لم أجد إجابة موثقة لسؤالك. جرّب صياغة أخرى (مثل «تجديد جواز» أو «تسجيل ولادة»)، أو تواصل مع أقرب بعثة."
        : "I couldn't find a verified answer. Try rephrasing (e.g. “passport renewal”, “birth registration”) or contact your nearest mission.",
      sources: [{ title: ar ? "جميع الخدمات" : "All services", href: `/${loc}/services` }, { title: ar ? "السفارات" : "Embassies", href: `/${loc}/embassies` }],
      mode: "kb",
    });
  }
  const parts: string[] = [];
  const s = topS[0];
  if (s) {
    const [a, b] = s.processingDays;
    parts.push(ar ? `**${tr(s.title, loc)}** — ${tr(s.summary, loc)}` : `**${tr(s.title, loc)}** — ${tr(s.summary, loc)}`);
    parts.push((ar ? "**الوثائق المطلوبة:**\n" : "**Required documents:**\n") + s.documents.map((d) => `• ${tr(d.label, loc)}${d.required ? "" : ar ? " (اختياري)" : " (optional)"}`).join("\n"));
    parts.push(ar
      ? `**الرسم:** ${s.feeUSD ? `${s.feeUSD} دولار تقريباً` : "مجاني"} · **المدة:** ${b ? `${a}–${b} يوم عمل` : "حسب الحالة"}`
      : `**Fee:** ${s.feeUSD ? `approx. USD ${s.feeUSD}` : "free"} · **Processing:** ${b ? `${a}–${b} working days` : "case by case"}`);
  }
  if (topM.length) {
    const m = topM[0];
    parts.push(ar
      ? `**البعثة المختصة:** ${tr(m.city, loc)}، ${tr(m.country, loc)} — ${tr(m.hours, loc)}`
      : `**Your mission:** ${tr(m.city, loc)}, ${tr(m.country, loc)} — ${tr(m.hours, loc)}`);
  }
  if (s) parts.push(ar ? `يمكنك البدء من صفحة الخدمة أو [تقديم الطلب مباشرة](/${loc}/apply?service=${s.slug}${topM[0] ? `&mission=${topM[0].slug}` : ""}).` : `Start from the service page or [apply directly](/${loc}/apply?service=${s.slug}${topM[0] ? `&mission=${topM[0].slug}` : ""}).`);
  return json({ answer: parts.join("\n\n"), sources, mode: "kb" });
}
