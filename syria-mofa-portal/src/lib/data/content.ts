import type { L } from "../i18n";

const l = (ar: string, en: string): L => ({ ar, en });

export type SceneKind = "heritage" | "revolution" | "conflict" | "liberation" | "diplomacy" | "rebuild" | "future";

export interface Chapter {
  id: SceneKind;
  years: string;
  title: L;
  body: L;
  caption: L;
  /** Optional licensed archival photograph (place files in /public/story). Falls back to the illustrated scene. */
  image?: string;
  credit?: string;
  palette: [string, string, string];
}

export const CHAPTERS: Chapter[] = [
  {
    id: "heritage", years: "— 2010",
    title: l("سوريا قبل الحرب", "Syria before the war"),
    body: l("دمشق، من أقدم المدن المأهولة باستمرار في العالم. قلعة حلب، وأعمدة تدمر، وأسواق تعجّ بالحياة منذ آلاف السنين.",
      "Damascus, among the oldest continuously inhabited cities on earth. The Citadel of Aleppo, the colonnades of Palmyra, and souks alive for millennia."),
    caption: l("دمشق · حلب · تدمر · الأسواق القديمة", "Damascus · Aleppo · Palmyra · the old souks"),
    palette: ["#E9C98B", "#C98F4A", "#6B4423"],
  },
  {
    id: "revolution", years: "2011",
    title: l("ثورة ٢٠١١", "The 2011 revolution"),
    body: l("في آذار ٢٠١١ خرج السوريون في مظاهرات سلمية من درعا إلى كل المدن، مطالبين بالحرية والكرامة.",
      "In March 2011 Syrians took to the streets in peaceful demonstrations, from Daraa to every city, calling for freedom and dignity."),
    caption: l("مظاهرات سلمية · الحرية والكرامة", "Peaceful demonstrations · freedom and dignity"),
    palette: ["#F4E3C1", "#5FB08A", "#123A2A"],
  },
  {
    id: "conflict", years: "2011 – 2024",
    title: l("سنوات الصراع", "Years of conflict"),
    body: l("مدن مدمّرة، وأكثر من نصف السكان أُجبروا على مغادرة بيوتهم. نحمل ذكرى الضحايا وصمود المدنيين في الداخل والشتات.",
      "Shattered cities, and more than half the population forced from their homes. We carry the memory of the victims and the resilience of civilians at home and in exile."),
    caption: l("النزوح · الصمود · الذاكرة", "Displacement · resilience · memory"),
    palette: ["#9AA3AE", "#4A5563", "#1A1F27"],
  },
  {
    id: "liberation", years: "8 · 12 · 2024",
    title: l("كانون الأول ٢٠٢٤", "December 2024"),
    body: l("فجر الثامن من كانون الأول، احتفل السوريون في الساحات وفي كل مدن العالم، ورفرف العلم الأخضر بنجومه الثلاث الحمراء.",
      "At dawn on 8 December, Syrians celebrated in the squares and in cities across the world, as the green flag with its three red stars was raised."),
    caption: l("الساحات · العلم الأخضر · العودة", "The squares · the green flag · return"),
    palette: ["#007A3D", "#FFFFFF", "#CE1126"],
  },
  {
    id: "diplomacy", years: "2025",
    title: l("سوريا الجديدة", "The new Syria"),
    body: l("حكومة جديدة، وعودة سوريا إلى محيطها العربي والدولي، ولقاءات دبلوماسية تعيد فتح الأبواب والسفارات.",
      "A new government, Syria's return to its Arab and international community, and diplomatic meetings reopening doors and embassies."),
    caption: l("الدبلوماسية · الشراكات · العلاقات الدولية", "Diplomacy · partnerships · international relations"),
    palette: ["#16294A", "#C9A14A", "#F7F3EA"],
  },
  {
    id: "rebuild", years: "2025 —",
    title: l("إعادة إعمار سوريا", "Rebuilding Syria"),
    body: l("ورش البناء، وترميم المباني التاريخية، والبنية التحتية، والمدارس، والخدمات العامة — حجراً فوق حجر.",
      "Construction sites, restored heritage, infrastructure, schools and public services — stone upon stone."),
    caption: l("البناء · الترميم · التعليم · الخدمات", "Construction · restoration · education · services"),
    palette: ["#DEC07D", "#0A6B47", "#0B1B33"],
  },
  {
    id: "future", years: "2030 +",
    title: l("مستقبل سوريا", "Syria's future"),
    body: l("مدن تحفظ روحها وتنفتح على العالم: عمارة حديثة، وتقنية، واقتصاد يتسع لكل السوريين.",
      "Cities that keep their soul and open to the world: modern architecture, technology, and an economy with room for every Syrian."),
    caption: l("العمارة · التقنية · التنمية الاقتصادية", "Architecture · technology · economic development"),
    palette: ["#5FB08A", "#C9A14A", "#050D1A"],
  },
];

export type NewsKind = "statement" | "press" | "meeting" | "treaty";
export interface NewsItem { slug: string; kind: NewsKind; date: string; title: L; excerpt: L; body: L; tags: string[] }

// Demonstration items only — replace via the admin dashboard "Publish statement" workflow.
export const NEWS: NewsItem[] = [
  { slug: "consular-portal-launch", kind: "press", date: "2026-11-18", tags: ["services"],
    title: l("إطلاق البوابة القنصلية الرقمية الموحدة", "Launch of the unified digital consular portal"),
    excerpt: l("أصبح بإمكان السوريين في الخارج تقديم طلباتهم وتتبّعها إلكترونياً عبر جميع البعثات.", "Syrians abroad can now submit and track applications online across all missions."),
    body: l("أعلنت الوزارة إطلاق البوابة الرقمية التي تربط المواطنين والبعثات في منصة واحدة. (نص تجريبي)", "The ministry announced the launch of the digital portal connecting citizens and missions on one platform. (Demonstration text)") },
  { slug: "embassy-hours-holidays", kind: "statement", date: "2026-11-10", tags: ["missions"],
    title: l("تعديل ساعات عمل عدد من البعثات خلال موسم الأعياد", "Adjusted mission hours during the holiday season"),
    excerpt: l("تنشر كل بعثة مواعيد العطل المحلية على صفحتها الخاصة.", "Each mission publishes local holiday closures on its dedicated page."),
    body: l("يرجى مراجعة صفحة البعثة قبل حجز الموعد. (نص تجريبي)", "Please check the mission page before booking. (Demonstration text)") },
  { slug: "bilateral-consultations", kind: "meeting", date: "2026-10-28", tags: ["diplomacy"],
    title: l("جولة مشاورات سياسية ثنائية", "Round of bilateral political consultations"),
    excerpt: l("بحث الجانبان التعاون القنصلي وتسهيل عودة المواطنين.", "Both sides discussed consular cooperation and facilitating citizens' return."),
    body: l("نص تجريبي لأغراض العرض.", "Demonstration text for display purposes.") },
  { slug: "document-verification-qr", kind: "press", date: "2026-10-15", tags: ["services"],
    title: l("اعتماد رمز QR للتحقق من الوثائق الصادرة عن البعثات", "QR verification adopted for mission-issued documents"),
    excerpt: l("يمكن لأي جهة التحقق فوراً من صحة الوثائق السورية.", "Any institution can now instantly verify Syrian documents."),
    body: l("نص تجريبي لأغراض العرض.", "Demonstration text for display purposes.") },
  { slug: "reconstruction-partnerships", kind: "statement", date: "2026-09-30", tags: ["reconstruction"],
    title: l("بيان حول شراكات إعادة الإعمار", "Statement on reconstruction partnerships"),
    excerpt: l("تؤكد الوزارة التزامها بالشفافية في الشراكات الدولية.", "The ministry affirms its commitment to transparency in international partnerships."),
    body: l("نص تجريبي لأغراض العرض.", "Demonstration text for display purposes.") },
  { slug: "cultural-cooperation-mou", kind: "treaty", date: "2026-09-12", tags: ["culture"],
    title: l("مذكرة تفاهم للتعاون الثقافي وحماية التراث", "MoU on cultural cooperation and heritage protection"),
    excerpt: l("تعاون في ترميم المواقع الأثرية وتبادل الخبرات.", "Cooperation on restoring archaeological sites and exchanging expertise."),
    body: l("نص تجريبي لأغراض العرض.", "Demonstration text for display purposes.") },
];

export const NEWS_KIND: Record<NewsKind, L> = {
  statement: l("بيان رسمي", "Official statement"), press: l("بيان صحفي", "Press release"),
  meeting: l("لقاء دولي", "International meeting"), treaty: l("اتفاقية", "Treaty / agreement"),
};

export const MINISTRY = {
  minister: {
    name: l("وزير الخارجية والمغتربين", "Minister of Foreign Affairs and Expatriates"),
    bio: l("تُنشر السيرة الرسمية للوزير من قبل المكتب الإعلامي للوزارة عبر لوحة إدارة المحتوى.",
      "The Minister's official biography is published by the ministry's media office through the content dashboard."),
  },
  structure: [
    { t: l("مكتب الوزير", "Office of the Minister"), c: [l("المكتب الإعلامي", "Media Office"), l("المراسم", "Protocol")] },
    { t: l("الإدارات السياسية", "Political departments"), c: [l("الشؤون العربية", "Arab Affairs"), l("أوروبا والأمريكيتان", "Europe & the Americas"), l("آسيا وأفريقيا", "Asia & Africa"), l("المنظمات الدولية", "International Organizations")] },
    { t: l("الشؤون القنصلية والمغتربين", "Consular & Expatriate Affairs"), c: [l("الجوازات والأحوال المدنية", "Passports & Civil Registry"), l("التصديقات", "Legalizations"), l("رعاية المغتربين", "Expatriate Care")] },
    { t: l("الإدارات الداعمة", "Support departments"), c: [l("التحول الرقمي", "Digital Transformation"), l("الشؤون القانونية والمعاهدات", "Legal Affairs & Treaties"), l("الموارد البشرية", "Human Resources")] },
  ],
  history: [
    { y: "1945", t: l("سوريا عضو مؤسس في الأمم المتحدة وجامعة الدول العربية", "Syria a founding member of the United Nations and the Arab League") },
    { y: "1946", t: l("الجلاء والاستقلال وتأسيس السلك الدبلوماسي السوري", "Evacuation Day, full independence and founding of the Syrian diplomatic service") },
    { y: "2024", t: l("بداية مرحلة جديدة في العلاقات الخارجية", "A new chapter in foreign relations begins") },
    { y: "2025", t: l("إعادة فتح بعثات وتوسيع الشراكات الدولية", "Missions reopen and international partnerships expand") },
  ],
  policy: [
    l("احترام السيادة الوطنية ووحدة الأراضي السورية", "Respect for national sovereignty and Syria's territorial integrity"),
    l("علاقات متوازنة مع المحيط العربي والدولي", "Balanced relations with the Arab region and the world"),
    l("خدمة المواطنين السوريين وحمايتهم في الخارج", "Serving and protecting Syrian citizens abroad"),
    l("دعم إعادة الإعمار والعودة الطوعية والآمنة", "Supporting reconstruction and voluntary, safe return"),
  ],
};

export const VISITORS = [
  { id: "entry", t: l("متطلبات الدخول", "Entry requirements"), b: l("جواز سفر ساري لستة أشهر على الأقل، وتأشيرة مسبقة أو عند الوصول حسب الجنسية.", "A passport valid for at least six months and a visa in advance or on arrival depending on nationality.") },
  { id: "tourist", t: l("التأشيرة السياحية", "Tourist visa"), b: l("دخول لمرة واحدة أو متعدد لأغراض السياحة وزيارة العائلة.", "Single or multiple entry for tourism and family visits.") },
  { id: "business", t: l("تأشيرة الأعمال", "Business visa"), b: l("للمستثمرين والمشاركين في المعارض والاجتماعات التجارية مع خطاب دعوة.", "For investors and trade-fair or business-meeting participants with an invitation letter.") },
  { id: "diplomatic", t: l("التأشيرات الدبلوماسية والرسمية", "Diplomatic & official visas"), b: l("تُطلب عبر مذكرة شفهية من البعثة أو الجهة الرسمية.", "Requested by note verbale from the sending mission or official body.") },
  { id: "accreditation", t: l("اعتماد البعثات الأجنبية", "Foreign mission accreditation"), b: l("تتولى إدارة المراسم اعتماد أعضاء البعثات الدبلوماسية والقنصلية.", "The Protocol Department accredits diplomatic and consular staff.") },
  { id: "ngo", t: l("اعتماد المنظمات الدولية وغير الحكومية", "International organization & NGO accreditation"), b: l("تسجيل المنظمات وتنسيق عملها الإنساني والتنموي.", "Registration of organizations and coordination of humanitarian and development work.") },
  { id: "culture", t: l("الثقافة والسياحة", "Culture & tourism"), b: l("ستة مواقع على قائمة التراث العالمي لليونسكو، من دمشق القديمة إلى قلعة الحصن.", "Six UNESCO World Heritage sites, from Ancient Damascus to Crac des Chevaliers.") },
];
