/**
 * Expandable localization system.
 * - Arabic is the primary language (RTL); English is LTR.
 * - French and Turkish are registered but disabled until their dictionaries are complete.
 *   To enable one: fill in `dictionaries.fr`, add `fr` to every `L` content object
 *   (missing keys fall back to English), and flip `enabled` to true.
 */
export const LOCALES = {
  ar: { label: "العربية", short: "ع", dir: "rtl", enabled: true, intl: "ar-SY" },
  en: { label: "English", short: "EN", dir: "ltr", enabled: true, intl: "en-GB" },
  fr: { label: "Français", short: "FR", dir: "ltr", enabled: false, intl: "fr-FR" },
  tr: { label: "Türkçe", short: "TR", dir: "ltr", enabled: false, intl: "tr-TR" },
} as const;

export type Locale = keyof typeof LOCALES;
export const DEFAULT_LOCALE: Locale = "ar";
export const ACTIVE_LOCALES = (Object.keys(LOCALES) as Locale[]).filter((l) => LOCALES[l].enabled);

export function isLocale(x: string | undefined): x is Locale {
  return !!x && x in LOCALES && LOCALES[x as Locale].enabled;
}

/** Bilingual content value. Other locales are optional and fall back to English. */
export type L = { ar: string; en: string } & Partial<Record<Locale, string>>;

export function tr(v: L | undefined, locale: Locale): string {
  if (!v) return "";
  return v[locale] ?? v.en;
}

export const dir = (l: Locale) => LOCALES[l].dir;

export function fmtDate(d: string | Date, locale: Locale, opts: Intl.DateTimeFormatOptions = { dateStyle: "long" }) {
  return new Intl.DateTimeFormat(LOCALES[locale].intl + (locale === "ar" ? "-u-nu-latn" : ""), opts).format(new Date(d));
}

const en = {
  ministry: "Ministry of Foreign Affairs and Expatriates",
  republic: "Syrian Arab Republic",
  skip: "Skip to main content",
  nav: {
    home: "Home", services: "Consular Services", apply: "Apply", track: "Track Application",
    embassies: "Embassies & Consulates", appointments: "Appointments", media: "Media Center",
    ministry: "The Ministry", visitors: "Visit Syria", assistant: "AI Assistant", verify: "Verify Document",
    staff: "Staff Portal",
  },
  search: { placeholder: "Search services, embassies, documents…", hint: "Try “passport renewal Germany” or «تجديد جواز»", empty: "No results. Ask the AI assistant instead.", ask: "Ask the assistant", kbd: "Ctrl K" },
  hero: {
    eyebrow: "One Syria · One Portal · Everywhere",
    title: "Serving Syrians wherever they are in the world",
    lead: "Passports, civil registration, legalizations and emergency support from 40+ diplomatic missions — online, in Arabic and English.",
    cta1: "Start an application", cta2: "Track your application", scroll: "Scroll to begin the story of Syria",
  },
  home: {
    popular: "Most requested services", popularLead: "Complete these online and attend in person only when required.",
    quick: { book: "Book an appointment", bookD: "Choose your embassy, service and time slot.", track: "Track status", trackD: "Use your SY-MOFA tracking number.", emergency: "Emergency assistance", emergencyD: "24/7 hotlines for Syrians in distress abroad.", verify: "Verify a document", verifyD: "Scan the QR code on any ministry certificate." },
    map: "A global network of missions", mapLead: "Find your nearest embassy or consulate, its hours, services and emergency line.",
    news: "Official statements & news", allNews: "All news",
    assistant: "Ask the consular assistant", assistantLead: "Ask in Arabic or English. Answers are grounded in published ministry procedures.",
    stats: { missions: "Diplomatic missions", services: "Online services", languages: "Languages", hours: "Emergency support" },
  },
  story: { label: "The story of Syria", chapter: "Chapter", reduced: "Motion reduced — chapters shown as a timeline." },
  service: {
    docs: "Required documents", fee: "Official fee", time: "Processing time", eligibility: "Eligibility", steps: "How to apply",
    apply: "Apply online", book: "Book an appointment", inPerson: "Requires in-person visit", online: "Fully online",
    all: "All services", category: "Category", feeNote: "Fees are payable in local currency at the mission's published exchange rate.",
  },
  wizard: {
    title: "Citizen application", draftSaved: "Draft saved on this device", resume: "Resume your draft", discard: "Discard draft",
    steps: ["Service & mission", "Documents", "Identity & OTP", "Submit & receipt"],
    country: "Country of residence", mission: "Diplomatic mission", service: "Service", next: "Continue", back: "Back",
    checklist: "Checklist", upload: "Upload", dropHint: "PDF or JPG, up to 5 MB each", tooLarge: "File exceeds 5 MB", badType: "Only PDF and JPG files are accepted",
    nationalId: "National ID number (11 digits)", passport: "Passport number", fullName: "Full name (as in passport)", dob: "Date of birth",
    email: "Email", phone: "Phone (international format)", channel: "Send the code by", sendOtp: "Send verification code", otp: "6-digit code",
    verifyOtp: "Verify", verified: "Identity verified", demoCode: "Demo environment — your code is", consent: "I confirm the information provided is accurate and consent to its processing by the Ministry.",
    submit: "Submit application", submitted: "Application submitted", trackingNo: "Tracking number", printReceipt: "Print / save PDF receipt", goTrack: "Track this application",
    required: "Required", optional: "Optional", invalidId: "National ID must be 11 digits", invalidPassport: "Passport number must be 6–9 letters/digits",
  },
  tracker: {
    title: "Application status", lead: "Enter your tracking number and national ID to view the progress of your application.",
    tracking: "Tracking number", nationalId: "National ID", check: "Check status", notFound: "No application matches these details.",
    timeline: "Progress", messages: "Messages from the mission", history: "History", notify: "Notify me of changes", notifyOn: "Notifications enabled",
    demo: "Demo: try SY-MOFA-2026-10427 with ID 01020304050",
  },
  status: {
    submitted: "Submitted", under_review: "Under review", correction_requested: "Correction requested", approved: "Approved",
    rejected: "Rejected", ready_for_pickup: "Ready for pickup", dispatched: "Dispatched", completed: "Completed",
  },
  embassies: {
    title: "Embassies & Consulates", lead: "Syria's diplomatic network around the world.", search: "Search by country or city",
    all: "All", embassy: "Embassy", consulate: "Consulate General", mission: "Permanent Mission", region: "Region", type: "Type",
    hours: "Working hours", holidays: "Local holidays", services: "Consular services", emergency: "24/7 emergency hotline", ambassador: "Head of mission",
    address: "Address", contact: "Contact", book: "Book at this mission", sample: "Contact data shown is placeholder data pending verification by the ministry.",
    regions: { mena: "Middle East & North Africa", europe: "Europe", asia: "Asia & Pacific", americas: "Americas", africa: "Sub-Saharan Africa" },
  },
  appt: {
    title: "Embassy appointments", lead: "Reserve, reschedule or cancel an appointment at any mission.", pick: "Select a date", slots: "Available times",
    full: "Fully booked", closed: "Closed", reserve: "Reserve appointment", confirmed: "Appointment confirmed", ticket: "Confirmation ticket",
    manage: "Manage an appointment", code: "Appointment code", find: "Find", reschedule: "Reschedule", cancel: "Cancel appointment", cancelled: "Cancelled",
    reminder: "You'll receive reminders 48 h and 2 h before your appointment.", name: "Full name",
  },
  assistant: {
    title: "Consular Assistant", lead: "Grounded in verified ministry information", placeholder: "Ask about passports, documents, embassies…",
    send: "Send", examples: ["How do I renew my passport in Germany?", "What documents are needed to register a marriage?", "Where is the embassy in Saudi Arabia?"],
    sources: "Sources", disclaimer: "The assistant can make mistakes. Official requirements are on each service page.", voice: "Voice input", thinking: "Searching ministry sources…",
  },
  a11y: { title: "Accessibility", text: "Text size", contrast: "High contrast", motion: "Reduce motion", links: "Underline links", reset: "Reset" },
  footer: { rights: "All rights reserved.", privacy: "Privacy", terms: "Terms of use", accessibility: "Accessibility statement", contact: "Contact the ministry", sitemap: "Sitemap" },
  common: { learnMore: "Learn more", viewAll: "View all", close: "Close", loading: "Loading…", minutes: "min", days: "working days", free: "Free", print: "Print", back: "Back", demo: "Demonstration data" },
  dash: {
    mission: "Mission workspace", admin: "Ministry administration", signIn: "Staff sign-in", signOut: "Sign out", username: "Username", password: "Password", mfa: "Authenticator code",
    incoming: "Incoming applications", filter: "Filter", allStatuses: "All statuses", allServices: "All services", citizen: "Citizen", documents: "Documents",
    approve: "Approve", reject: "Reject", correction: "Request correction", template: "Response template", sendMsg: "Send to citizen", calendar: "Appointment calendar",
    capacity: "Daily capacity", holidays: "Holiday management", stats: "Statistics", activity: "Activity log", missions: "Missions", staff: "Staff & permissions",
    fees: "Services & fees", content: "Content", statements: "Publish statement", audit: "Security & audit log", performance: "Mission performance", save: "Save",
  },
};

export type Dict = typeof en;

const ar: Dict = {
  ministry: "وزارة الخارجية والمغتربين",
  republic: "الجمهورية العربية السورية",
  skip: "انتقل إلى المحتوى الرئيسي",
  nav: {
    home: "الرئيسية", services: "الخدمات القنصلية", apply: "تقديم طلب", track: "تتبّع الطلب",
    embassies: "السفارات والقنصليات", appointments: "المواعيد", media: "المركز الإعلامي",
    ministry: "الوزارة", visitors: "زيارة سوريا", assistant: "المساعد الذكي", verify: "التحقق من وثيقة",
    staff: "بوابة الموظفين",
  },
  search: { placeholder: "ابحث عن خدمة أو سفارة أو وثيقة…", hint: "جرّب «تجديد جواز ألمانيا» أو “passport renewal”", empty: "لا توجد نتائج. اسأل المساعد الذكي.", ask: "اسأل المساعد", kbd: "Ctrl K" },
  hero: {
    eyebrow: "سوريا واحدة · بوابة واحدة · في كل مكان",
    title: "في خدمة السوريين أينما كانوا في العالم",
    lead: "جوازات السفر والأحوال المدنية والتصديقات والدعم الطارئ عبر أكثر من ٤٠ بعثة دبلوماسية — إلكترونياً وباللغتين العربية والإنجليزية.",
    cta1: "ابدأ طلباً جديداً", cta2: "تتبّع طلبك", scroll: "مرّر لتبدأ حكاية سوريا",
  },
  home: {
    popular: "الخدمات الأكثر طلباً", popularLead: "أنجزها إلكترونياً، واحضر شخصياً فقط عند الحاجة.",
    quick: { book: "حجز موعد", bookD: "اختر السفارة والخدمة والوقت المناسب.", track: "تتبّع الحالة", trackD: "باستخدام رقم التتبّع SY-MOFA.", emergency: "المساعدة الطارئة", emergencyD: "خطوط ساخنة على مدار الساعة للسوريين في الخارج.", verify: "التحقق من وثيقة", verifyD: "امسح رمز QR على أي شهادة صادرة عن الوزارة." },
    map: "شبكة بعثات حول العالم", mapLead: "اعثر على أقرب سفارة أو قنصلية وساعات عملها وخدماتها وخطها الطارئ.",
    news: "البيانات الرسمية والأخبار", allNews: "كل الأخبار",
    assistant: "اسأل المساعد القنصلي", assistantLead: "اسأل بالعربية أو الإنجليزية. الإجابات مستندة إلى الإجراءات المنشورة للوزارة.",
    stats: { missions: "بعثة دبلوماسية", services: "خدمة إلكترونية", languages: "لغات", hours: "دعم طارئ" },
  },
  story: { label: "حكاية سوريا", chapter: "الفصل", reduced: "تم تقليل الحركة — تُعرض الفصول كخط زمني." },
  service: {
    docs: "الوثائق المطلوبة", fee: "الرسم الرسمي", time: "مدة الإنجاز", eligibility: "الأهلية", steps: "خطوات التقديم",
    apply: "قدّم إلكترونياً", book: "احجز موعداً", inPerson: "تتطلب الحضور الشخصي", online: "إلكترونية بالكامل",
    all: "جميع الخدمات", category: "الفئة", feeNote: "تُستوفى الرسوم بالعملة المحلية وفق سعر الصرف المعتمد لدى البعثة.",
  },
  wizard: {
    title: "طلب المواطن", draftSaved: "تم حفظ المسودة على هذا الجهاز", resume: "متابعة المسودة", discard: "حذف المسودة",
    steps: ["الخدمة والبعثة", "الوثائق", "الهوية والرمز", "الإرسال والإيصال"],
    country: "بلد الإقامة", mission: "البعثة الدبلوماسية", service: "الخدمة", next: "متابعة", back: "رجوع",
    checklist: "قائمة التحقق", upload: "رفع", dropHint: "PDF أو JPG، بحد أقصى ٥ ميغابايت للملف", tooLarge: "حجم الملف يتجاوز ٥ ميغابايت", badType: "يُقبل فقط ملفات PDF و JPG",
    nationalId: "الرقم الوطني (١١ رقماً)", passport: "رقم جواز السفر", fullName: "الاسم الكامل (كما في الجواز)", dob: "تاريخ الميلاد",
    email: "البريد الإلكتروني", phone: "الهاتف (بالصيغة الدولية)", channel: "إرسال الرمز عبر", sendOtp: "أرسل رمز التحقق", otp: "الرمز المكوّن من ٦ أرقام",
    verifyOtp: "تحقّق", verified: "تم التحقق من الهوية", demoCode: "بيئة تجريبية — رمزك هو", consent: "أقر بصحة المعلومات المقدمة وأوافق على معالجتها من قبل الوزارة.",
    submit: "إرسال الطلب", submitted: "تم إرسال الطلب", trackingNo: "رقم التتبّع", printReceipt: "طباعة / حفظ الإيصال PDF", goTrack: "تتبّع هذا الطلب",
    required: "مطلوب", optional: "اختياري", invalidId: "يجب أن يتكون الرقم الوطني من ١١ رقماً", invalidPassport: "رقم الجواز من ٦ إلى ٩ أحرف/أرقام",
  },
  tracker: {
    title: "حالة الطلب", lead: "أدخل رقم التتبّع والرقم الوطني لمتابعة مراحل طلبك.",
    tracking: "رقم التتبّع", nationalId: "الرقم الوطني", check: "عرض الحالة", notFound: "لا يوجد طلب مطابق لهذه البيانات.",
    timeline: "المراحل", messages: "رسائل البعثة", history: "السجل", notify: "أعلمني بالتغييرات", notifyOn: "الإشعارات مفعّلة",
    demo: "تجريبي: جرّب SY-MOFA-2026-10427 مع الرقم 01020304050",
  },
  status: {
    submitted: "مُقدَّم", under_review: "قيد المراجعة", correction_requested: "مطلوب تصحيح", approved: "مقبول",
    rejected: "مرفوض", ready_for_pickup: "جاهز للاستلام", dispatched: "تم الإرسال", completed: "مكتمل",
  },
  embassies: {
    title: "السفارات والقنصليات", lead: "الشبكة الدبلوماسية السورية حول العالم.", search: "ابحث بالدولة أو المدينة",
    all: "الكل", embassy: "سفارة", consulate: "قنصلية عامة", mission: "بعثة دائمة", region: "المنطقة", type: "النوع",
    hours: "ساعات العمل", holidays: "العطل المحلية", services: "الخدمات القنصلية", emergency: "الخط الساخن الطارئ ٢٤/٧", ambassador: "رئيس البعثة",
    address: "العنوان", contact: "التواصل", book: "احجز في هذه البعثة", sample: "بيانات التواصل المعروضة بيانات مؤقتة بانتظار التحقق من قبل الوزارة.",
    regions: { mena: "الشرق الأوسط وشمال أفريقيا", europe: "أوروبا", asia: "آسيا والمحيط الهادئ", americas: "الأمريكيتان", africa: "أفريقيا جنوب الصحراء" },
  },
  appt: {
    title: "مواعيد السفارات", lead: "احجز موعداً أو عدّله أو ألغه في أي بعثة.", pick: "اختر التاريخ", slots: "الأوقات المتاحة",
    full: "محجوز بالكامل", closed: "مغلق", reserve: "تأكيد الحجز", confirmed: "تم تأكيد الموعد", ticket: "تذكرة التأكيد",
    manage: "إدارة موعد", code: "رمز الموعد", find: "بحث", reschedule: "تغيير الموعد", cancel: "إلغاء الموعد", cancelled: "ملغى",
    reminder: "ستصلك تذكيرات قبل ٤٨ ساعة وقبل ساعتين من موعدك.", name: "الاسم الكامل",
  },
  assistant: {
    title: "المساعد القنصلي", lead: "مستند إلى معلومات الوزارة الموثّقة", placeholder: "اسأل عن الجوازات أو الوثائق أو السفارات…",
    send: "إرسال", examples: ["كيف أجدد جواز سفري في ألمانيا؟", "ما هي الأوراق المطلوبة لتسجيل الزواج؟", "أين السفارة في السعودية؟"],
    sources: "المصادر", disclaimer: "قد يخطئ المساعد. المتطلبات الرسمية منشورة في صفحة كل خدمة.", voice: "الإدخال الصوتي", thinking: "جارٍ البحث في مصادر الوزارة…",
  },
  a11y: { title: "إمكانية الوصول", text: "حجم النص", contrast: "تباين عالٍ", motion: "تقليل الحركة", links: "تسطير الروابط", reset: "إعادة الضبط" },
  footer: { rights: "جميع الحقوق محفوظة.", privacy: "الخصوصية", terms: "شروط الاستخدام", accessibility: "بيان إمكانية الوصول", contact: "تواصل مع الوزارة", sitemap: "خريطة الموقع" },
  common: { learnMore: "اعرف المزيد", viewAll: "عرض الكل", close: "إغلاق", loading: "جارٍ التحميل…", minutes: "دقيقة", days: "أيام عمل", free: "مجاناً", print: "طباعة", back: "رجوع", demo: "بيانات تجريبية" },
  dash: {
    mission: "مساحة عمل البعثة", admin: "الإدارة المركزية للوزارة", signIn: "دخول الموظفين", signOut: "تسجيل الخروج", username: "اسم المستخدم", password: "كلمة المرور", mfa: "رمز المصادقة",
    incoming: "الطلبات الواردة", filter: "تصفية", allStatuses: "كل الحالات", allServices: "كل الخدمات", citizen: "المواطن", documents: "الوثائق",
    approve: "قبول", reject: "رفض", correction: "طلب تصحيح", template: "نموذج الرد", sendMsg: "إرسال للمواطن", calendar: "تقويم المواعيد",
    capacity: "السعة اليومية", holidays: "إدارة العطل", stats: "الإحصاءات", activity: "سجل النشاط", missions: "البعثات", staff: "الموظفون والصلاحيات",
    fees: "الخدمات والرسوم", content: "المحتوى", statements: "نشر بيان", audit: "سجل الأمن والتدقيق", performance: "أداء البعثات", save: "حفظ",
  },
};

export const dictionaries: Partial<Record<Locale, Dict>> = { ar, en };
export const getDict = (l: Locale): Dict => dictionaries[l] ?? en;
