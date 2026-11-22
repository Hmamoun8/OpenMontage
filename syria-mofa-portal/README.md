# Syrian MOFAEX Digital Portal — وزارة الخارجية والمغتربين

A bilingual (Arabic-first, RTL / English, LTR) digital portal connecting Syrian citizens,
expatriates, visitors, missions and ministry staff on one platform.

```bash
npm install
cp .env.example .env.local   # set SESSION_SECRET; optionally ANTHROPIC_API_KEY
npm run dev                  # http://localhost:3000 → /ar
```

## What's in it

| Area | Route | Notes |
|---|---|---|
| Cinematic homepage | `/ar`, `/en` | Three.js / R3F hero (gold khatam star, horseshoe-arch tunnel, floating star tiles, pointer + scroll camera). GSAP-pinned **Story of Syria**: 7 chapters with 3-layer parallax scenes, arch-shaped portal transitions, chapter rail, progress bar in flag colours. |
| Intelligent search | `Ctrl K` anywhere | Bilingual, Arabic-normalised (hamza/ta-marbuta/diacritics), synonym-aware; falls through to the AI assistant. |
| Consular services | `/services`, `/services/[slug]` | 22 services in 4 categories, each with documents, fee, processing time, eligibility, steps, apply/book buttons. |
| Application wizard | `/apply` | 4 stages; PDF/JPG ≤ 5 MB with magic-byte validation and previews; national ID / passport validation; email/SMS OTP; drafts saved on device; `SY-MOFA-YYYY-XXXXX` tracking; QR code. |
| Bilingual receipt | `/receipt?n=…` | Side-by-side Arabic/English, QR; print → PDF. |
| Status tracker | `/track` | Tracking number + national ID; animated timeline over all 8 statuses, officer messages, history, notifications. |
| Document verification | `/verify` | Code entry or live camera QR scan (BarcodeDetector). |
| Embassy directory | `/embassies`, `/embassies/[slug]` | Interactive D3 world map with arcs from Damascus, zoom, region/type filters, per-mission page with live local time, hours, holidays, services, head of mission, 24/7 line. |
| Appointments | `/appointments` | Mission calendar honouring workdays/holidays, slot capacity, reservation, QR ticket, `.ics` with 48 h / 2 h reminders, reschedule & cancel. |
| AI assistant | widget + `/assistant` | Retrieval over the verified service/mission knowledge base; answers cite their sources. With `ANTHROPIC_API_KEY` it uses Claude grounded on the retrieved records; without it, it composes the answer from the records directly. Voice input via Web Speech API. |
| Media, ministry, visitors | `/media`, `/ministry`, `/visitors` | Filterable archive, press kit, structure, history, policy, visa & accreditation info. |
| Mission dashboard | `/dashboard/mission` | Incoming queue, filters, side-by-side document viewer + citizen data, approve / reject / request correction with bilingual templates, calendar, capacity, holidays, stats, activity. |
| Admin dashboard | `/dashboard/admin` | KPIs, mission performance, staff accounts & permissions, fees, statements, audit log. |

Demo staff accounts: `officer.berlin`, `officer.riyadh`, `admin` — password `Demo@2026`, MFA `000000`.
Demo tracking: `SY-MOFA-2026-10427` with national ID `01020304050`.

## Security built in
Role-based access (middleware + every API route), HMAC-signed HttpOnly/SameSite=strict session cookies,
double-submit CSRF tokens + origin checks, per-IP rate limiting, zod validation on every input,
hashed OTPs with expiry and attempt limits, hashed national IDs, non-enumerating tracker responses,
file-type sniffing, strict CSP/HSTS/frame/permissions headers, and an audit log of every state change.

## Before going live (not done here)
- **Data is placeholder.** Mission addresses/phones, heads of mission, fees, news items and the minister's
  biography are clearly marked placeholders and must be replaced with ministry-verified records.
- **Story photographs:** chapters render illustrated scenes; add licensed archival photos via
  `CHAPTERS[].image` (see `public/story/README.md`).
- Connect PostgreSQL (`prisma/schema.prisma`), encrypted object storage + KMS for documents,
  an SMS/email OTP gateway, and the government identity provider (OIDC + TOTP/WebAuthn) in place of the demo login.
- Move rate limiting and sessions to a shared store (Redis), add backups, and digital signatures on issued documents.
- French and Turkish are registered in `src/lib/i18n.ts` but disabled until translated.
