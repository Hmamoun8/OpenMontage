import type { L } from "../i18n";

export type ServiceCategory = "passports" | "civil" | "legal" | "expat";

export interface Service {
  slug: string;
  category: ServiceCategory;
  icon: string;
  title: L;
  summary: L;
  documents: { label: L; required: boolean }[];
  /** Indicative fee in USD. Official fee schedules must be loaded from the admin dashboard. */
  feeUSD: number;
  urgentFeeUSD?: number;
  processingDays: [number, number];
  eligibility: L;
  steps: L[];
  inPerson: boolean;
  popular?: boolean;
  keywords: string;
}

export const CATEGORIES: Record<ServiceCategory, { title: L; icon: string }> = {
  passports: { title: { ar: "جوازات السفر ووثائق السفر", en: "Passports & travel documents" }, icon: "BookUser" },
  civil: { title: { ar: "الأحوال المدنية", en: "Civil registration" }, icon: "Users" },
  legal: { title: { ar: "التصديقات والوكالات", en: "Legalizations & powers of attorney" }, icon: "Stamp" },
  expat: { title: { ar: "خدمات المغتربين والخدمات الإنسانية", en: "Expatriate & humanitarian services" }, icon: "HeartHandshake" },
};

const d = (ar: string, en: string, required = true) => ({ label: { ar, en }, required });
const l = (ar: string, en: string): L => ({ ar, en });

const ID = d("صورة الهوية الوطنية السورية أو إخراج قيد فردي", "Copy of Syrian national ID or individual civil registry extract");
const PHOTO = d("صورتان شخصيتان حديثتان بخلفية بيضاء (٤×٦)", "Two recent passport photos, white background (4×6 cm)");
const RES = d("إثبات الإقامة في بلد البعثة", "Proof of residence in the mission's host country");
const PASS = d("جواز السفر الحالي أو صورة عنه", "Current passport or a copy of it");

const STD_STEPS = (extra?: L): L[] => [
  l("اختر البعثة والخدمة وابدأ الطلب الإلكتروني", "Choose your mission and service and start the online application"),
  l("ارفع الوثائق المطلوبة بصيغة PDF أو JPG", "Upload the required documents as PDF or JPG"),
  l("تحقّق من هويتك برمز التحقق المرسل إليك", "Verify your identity with the one-time code sent to you"),
  extra ?? l("احجز موعداً لتقديم البصمات واستلام الوثيقة", "Book an appointment for biometrics and collection"),
];

export const SERVICES: Service[] = [
  // Passports
  {
    slug: "passport-first-issue", category: "passports", icon: "BookPlus", popular: true,
    title: l("إصدار جواز سفر لأول مرة", "First-time passport issuance"),
    summary: l("إصدار جواز سفر سوري للمواطنين المقيمين في الخارج للمرة الأولى، بما في ذلك القاصرين.", "Issue a first Syrian passport for citizens living abroad, including minors."),
    documents: [ID, PHOTO, RES, d("موافقة ولي الأمر للقاصرين", "Guardian consent for minors", false)],
    feeUSD: 300, urgentFeeUSD: 800, processingDays: [10, 21],
    eligibility: l("كل مواطن سوري مقيم في نطاق البعثة.", "Any Syrian citizen residing within the mission's jurisdiction."),
    steps: STD_STEPS(), inPerson: true, keywords: "passport new first جواز جديد اول مرة",
  },
  {
    slug: "passport-renewal", category: "passports", icon: "RefreshCw", popular: true,
    title: l("تجديد جواز السفر", "Passport renewal"),
    summary: l("تجديد جواز سفر ساري المفعول أو قارب على الانتهاء خلال ستة أشهر.", "Renew a valid passport or one expiring within six months."),
    documents: [PASS, PHOTO, RES],
    feeUSD: 300, urgentFeeUSD: 800, processingDays: [7, 15],
    eligibility: l("حاملو جوازات سفر سورية سارية أو تنتهي خلال ستة أشهر.", "Holders of a Syrian passport that is valid or expires within six months."),
    steps: STD_STEPS(), inPerson: true, keywords: "passport renew renewal تجديد جواز سفر",
  },
  {
    slug: "passport-expired-renewal", category: "passports", icon: "CalendarX",
    title: l("تجديد جواز سفر منتهي الصلاحية", "Expired passport renewal"),
    summary: l("إصدار جواز جديد بدلاً من جواز منتهي الصلاحية.", "Issue a new passport to replace an expired one."),
    documents: [d("جواز السفر المنتهي", "The expired passport"), PHOTO, ID, RES],
    feeUSD: 300, urgentFeeUSD: 800, processingDays: [10, 21],
    eligibility: l("حاملو جوازات سفر سورية منتهية الصلاحية.", "Holders of an expired Syrian passport."),
    steps: STD_STEPS(), inPerson: true, keywords: "expired passport منتهي جواز",
  },
  {
    slug: "passport-lost-damaged", category: "passports", icon: "ShieldAlert",
    title: l("بدل ضائع أو تالف لجواز السفر", "Lost or damaged passport replacement"),
    summary: l("استبدال جواز مفقود أو مسروق أو تالف بعد التبليغ الرسمي.", "Replace a lost, stolen or damaged passport after an official report."),
    documents: [d("ضبط شرطة محلي بالفقدان أو الجواز التالف", "Local police report of loss, or the damaged passport"), PHOTO, ID, RES],
    feeUSD: 350, processingDays: [14, 30],
    eligibility: l("المواطنون الذين فقدوا جوازهم أو تلف.", "Citizens whose passport was lost, stolen or damaged."),
    steps: STD_STEPS(), inPerson: true, keywords: "lost stolen damaged passport ضائع مفقود تالف بدل",
  },
  {
    slug: "emergency-travel-document", category: "passports", icon: "Plane", popular: true,
    title: l("وثيقة سفر طارئة", "Emergency travel document"),
    summary: l("وثيقة مرور لرحلة واحدة للعودة إلى سوريا في الحالات الطارئة.", "Single-journey document to return to Syria in urgent situations."),
    documents: [ID, PHOTO, d("حجز تذكرة السفر", "Flight booking")],
    feeUSD: 50, processingDays: [1, 2],
    eligibility: l("المواطنون الذين لا يحملون جوازاً صالحاً ويحتاجون للعودة بشكل عاجل.", "Citizens without a valid passport who must return urgently."),
    steps: STD_STEPS(l("احضر إلى البعثة لاستلام الوثيقة في اليوم ذاته عند الإمكان", "Attend the mission to collect the document, same day where possible")), inPerson: true,
    keywords: "emergency travel document laissez passer وثيقة سفر طارئة مرور عودة",
  },
  // Civil
  ...([
    ["birth-registration", "Baby", "تسجيل الولادة", "Birth registration", "تسجيل المواليد السوريين المولودين في الخارج في السجل المدني.", "Register Syrian children born abroad in the civil registry.",
      [d("شهادة الولادة المحلية مصدّقة", "Legalized local birth certificate"), d("وثيقة زواج الوالدين", "Parents' marriage certificate"), d("هويتا الوالدين", "Parents' IDs")], 0, [15, 30], true, true, "birth baby newborn ولادة مولود تسجيل"],
    ["marriage-registration", "Heart", "تسجيل الزواج", "Marriage registration", "تثبيت عقد زواج تم في الخارج في السجل المدني السوري.", "Record a marriage concluded abroad in the Syrian civil registry.",
      [d("عقد الزواج المحلي مصدّقاً ومترجماً", "Legalized and translated local marriage contract"), d("إخراجا قيد فردي للزوجين", "Individual registry extracts for both spouses"), d("صور جوازات الزوجين", "Both spouses' passport copies"), d("شاهدان مع هوياتهما", "Two witnesses with IDs", false)], 25, [20, 45], false, true, "marriage wedding زواج عقد تسجيل"],
    ["divorce-registration", "Unlink", "تسجيل الطلاق", "Divorce registration", "تسجيل حكم أو وثيقة طلاق صادرة في الخارج.", "Register a divorce judgment or certificate issued abroad.",
      [d("حكم الطلاق مصدّقاً ومترجماً", "Legalized, translated divorce judgment"), d("إخراج قيد عائلي", "Family registry extract"), PASS], 25, [20, 45], false, false, "divorce طلاق"],
    ["death-registration", "Flower2", "تسجيل الوفاة", "Death registration", "تسجيل وفاة مواطن سوري في الخارج.", "Register the death of a Syrian citizen abroad.",
      [d("شهادة الوفاة المحلية مصدّقة", "Legalized local death certificate"), d("جواز أو هوية المتوفى", "Deceased's passport or ID"), d("هوية المُبلّغ", "Informant's ID")], 0, [10, 20], false, false, "death وفاة"],
    ["individual-registry-extract", "FileText", "إخراج قيد فردي", "Individual civil registry extract", "وثيقة رسمية بالبيانات المدنية للفرد.", "Official extract of an individual's civil record.",
      [ID], 10, [3, 7], false, true, "extract individual civil registry قيد فردي اخراج"],
    ["family-registry-extract", "Users", "إخراج قيد عائلي", "Family civil registry extract", "بيان عائلي يضم أفراد الأسرة المسجلين.", "Family statement listing registered family members.",
      [ID, d("إثبات صلة القرابة", "Proof of relationship", false)], 10, [3, 7], false, false, "family extract بيان عائلي قيد عائلي"],
  ] as const).map(([slug, icon, tar, ten, sar, sen, docs, fee, days, popular, inPerson, kw]) => ({
    slug, icon, category: "civil" as const, popular, title: l(tar, ten), summary: l(sar, sen), documents: [...docs], feeUSD: fee,
    processingDays: [...days] as [number, number],
    eligibility: l("المواطنون السوريون وذووهم المقيمون في نطاق البعثة.", "Syrian citizens and their relatives within the mission's jurisdiction."),
    steps: STD_STEPS(inPerson ? undefined : l("استلم الوثيقة إلكترونياً مع رمز QR للتحقق", "Receive the document digitally with a verification QR code")),
    inPerson, keywords: kw,
  })),
  // Legal
  ...([
    ["academic-attestation", "GraduationCap", "تصديق الشهادات الجامعية", "Academic certificate attestation", [d("الشهادة الأصلية مصدّقة من خارجية بلد الإصدار", "Original certificate legalized by the issuing country's foreign ministry"), PASS], 30, [3, 7], true, "academic degree certificate attestation تصديق شهادة جامعية"],
    ["commercial-attestation", "Briefcase", "تصديق الوثائق التجارية", "Commercial document attestation", [d("الوثيقة التجارية مصدّقة من غرفة التجارة", "Document certified by the chamber of commerce"), d("السجل التجاري", "Commercial registration")], 60, [3, 7], false, "commercial invoice origin تجاري تصديق"],
    ["personal-legalization", "Stamp", "تصديق الوثائق الشخصية", "Personal document legalization", [d("الوثيقة الأصلية", "Original document"), PASS], 25, [2, 5], true, "legalization legalize personal تصديق وثيقة شخصية"],
    ["power-of-attorney", "FileSignature", "الوكالات العامة والخاصة", "General & special powers of attorney", [PASS, d("بيانات الوكيل وصورة هويته", "Agent's details and ID copy"), d("وصف موضوع الوكالة", "Description of the power's scope")], 40, [1, 3], true, "power of attorney proxy وكالة عامة خاصة"],
    ["poa-revocation", "FileX", "عزل الوكالات", "Revocation of powers of attorney", [PASS, d("نسخة الوكالة المراد عزلها", "Copy of the power to revoke")], 20, [1, 3], false, "revoke revocation عزل وكالة الغاء"],
    ["certificate-verification", "QrCode", "التحقق الرقمي من الوثائق", "Digital certificate verification (QR)", [d("الوثيقة الحاملة لرمز QR", "The document bearing the QR code")], 0, [0, 0], false, "verify qr certificate تحقق رمز"],
  ] as const).map(([slug, icon, tar, ten, docs, fee, days, popular, kw]) => ({
    slug, icon, category: "legal" as const, popular, title: l(tar, ten),
    summary: slug === "certificate-verification"
      ? l("تحقق فوري من صحة أي وثيقة صادرة عن البعثات عبر مسح رمز QR.", "Instantly verify any mission-issued document by scanning its QR code.")
      : l(`${tar} للاستخدام الرسمي داخل سوريا وخارجها.`, `${ten} for official use inside and outside Syria.`),
    documents: [...docs], feeUSD: fee, processingDays: [...days] as [number, number],
    eligibility: l("المواطنون السوريون والأجانب الذين يحتاجون وثائق للاستخدام في سوريا.", "Syrian citizens, and foreign nationals needing documents for use in Syria."),
    steps: slug === "certificate-verification"
      ? [l("امسح رمز QR أو أدخل رقم الوثيقة", "Scan the QR code or enter the document number"), l("قارن البيانات المعروضة بالوثيقة", "Compare the displayed data with the document")]
      : STD_STEPS(l("احضر للبعثة بالوثائق الأصلية للتوقيع والختم", "Attend the mission with originals for signature and stamping")),
    inPerson: slug !== "certificate-verification", keywords: kw,
  })),
  // Expat & humanitarian
  ...([
    ["expat-registration", "Globe2", "تسجيل السوريين المقيمين في الخارج", "Registration of Syrians abroad", "سجّل إقامتك لدى البعثة لتلقي الإشعارات والمساعدة في الأزمات.", "Register your residence with the mission to receive alerts and crisis assistance.", [ID, RES], 0, [1, 3], true, false, "register expatriate abroad تسجيل مغترب اقامة"],
    ["missing-citizen-inquiry", "Search", "الاستعلام عن مواطن مفقود", "Missing citizen inquiry", "تقديم بلاغ أو استعلام عن مواطن مفقود، بالتنسيق مع الجهات المختصة والهيئة الوطنية للمفقودين.", "File a report or inquiry about a missing citizen, coordinated with competent authorities.", [d("بيانات المفقود وصورته", "Missing person's details and photo"), d("هوية مقدم الطلب وصلة القرابة", "Applicant's ID and relationship")], 0, [0, 0], false, false, "missing person مفقود استعلام"],
    ["detained-citizen-assistance", "Scale", "مساعدة المواطنين المحتجزين", "Assistance for detained citizens", "زيارات قنصلية ومتابعة قانونية للمواطنين المحتجزين في الخارج.", "Consular visits and legal follow-up for citizens detained abroad.", [d("بيانات المحتجز ومكان الاحتجاز", "Detainee details and place of detention")], 0, [0, 0], false, false, "detained arrest prison محتجز موقوف سجن"],
    ["emergency-consular-support", "Siren", "الدعم القنصلي الطارئ", "Emergency consular support", "مساعدة عاجلة في الحوادث والكوارث والأزمات الصحية والأمنية.", "Urgent help in accidents, disasters, medical and security crises.", [d("لا تُشترط وثائق مسبقة", "No documents required in advance", false)], 0, [0, 0], true, false, "emergency help urgent طارئ مساعدة عاجل"],
    ["to-whom-it-may-concern", "ScrollText", "شهادة لمن يهمه الأمر", "To Whom It May Concern certificate", "شهادة رسمية لغرض محدد كإثبات الجنسية أو عدم الممانعة.", "Official certificate for a stated purpose such as proof of nationality.", [PASS, d("بيان الغرض من الشهادة", "Statement of purpose")], 15, [2, 5], false, false, "to whom it may concern certificate لمن يهمه الامر شهادة"],
  ] as const).map(([slug, icon, tar, ten, sar, sen, docs, fee, days, popular, inPerson, kw]) => ({
    slug, icon, category: "expat" as const, popular, title: l(tar, ten), summary: l(sar, sen), documents: [...docs], feeUSD: fee,
    processingDays: [...days] as [number, number],
    eligibility: l("المواطنون السوريون في الخارج وذووهم.", "Syrian citizens abroad and their families."),
    steps: STD_STEPS(l("ستتواصل معك البعثة خلال يوم عمل واحد", "The mission will contact you within one working day")), inPerson, keywords: kw,
  })),
];

export const getService = (slug: string) => SERVICES.find((s) => s.slug === slug);
