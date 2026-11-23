import type { L } from "../i18n";

export type MissionType = "embassy" | "consulate" | "mission";
export type Region = "mena" | "europe" | "asia" | "americas" | "africa";

export interface Mission {
  slug: string;
  type: MissionType;
  region: Region;
  country: L;
  city: L;
  countryCode: string;
  lat: number;
  lng: number;
  /** IANA zone for local working hours. */
  tz: string;
  hours: L;
  /** Workdays (0=Sun … 6=Sat) */
  workdays: number[];
  holidays: { date: string; name: L }[];
  dailyCapacity: number;
  // NOTE: All contact details below are PLACEHOLDERS. Replace with verified ministry records before launch.
  address: L;
  phone: string;
  emergency: string;
  email: string;
  head: { name: L; title: L; bio: L };
  services: string[] | "all";
}

const M = (
  slug: string, type: MissionType, region: Region, cc: string,
  country: [string, string], city: [string, string], lat: number, lng: number, tz: string,
  workdays: number[], holidays: [string, string, string][], dial: string,
): Mission => ({
  slug, type, region, countryCode: cc,
  country: { ar: country[0], en: country[1] }, city: { ar: city[0], en: city[1] }, lat, lng, tz,
  hours: workdays.includes(5) && !workdays.includes(0)
    ? { ar: "الاثنين – الجمعة، ٩:٠٠ – ١٥:٠٠ بالتوقيت المحلي", en: "Mon – Fri, 09:00 – 15:00 local time" }
    : { ar: "الأحد – الخميس، ٩:٠٠ – ١٥:٠٠ بالتوقيت المحلي", en: "Sun – Thu, 09:00 – 15:00 local time" },
  workdays,
  holidays: holidays.map(([date, ar, en]) => ({ date, name: { ar, en } })),
  dailyCapacity: type === "embassy" ? 60 : 40,
  address: { ar: `عنوان البعثة في ${city[0]} — بانتظار التحقق`, en: `Mission address in ${city[1]} — pending verification` },
  phone: `${dial} XXX XXX XXXX`,
  emergency: `${dial} XXX XXX XXXX`,
  email: `consular.${slug}@mofaex.gov.sy`,
  head: {
    name: { ar: "يُعلن لاحقاً", en: "To be announced" },
    title: type === "embassy" ? { ar: "رئيس البعثة", en: "Head of Mission" } : type === "mission" ? { ar: "المندوب الدائم", en: "Permanent Representative" } : { ar: "القنصل العام", en: "Consul General" },
    bio: { ar: "تُنشر السيرة الذاتية الرسمية لرئيس البعثة من قبل الوزارة.", en: "The official biography of the head of mission will be published by the ministry." },
  },
  services: type === "mission" ? ["power-of-attorney", "personal-legalization"] : "all",
});

const MF = [1, 2, 3, 4, 5];
const ST = [0, 1, 2, 3, 4];

export const MISSIONS: Mission[] = [
  M("berlin", "embassy", "europe", "DE", ["ألمانيا", "Germany"], ["برلين", "Berlin"], 52.52, 13.405, "Europe/Berlin", MF, [["2026-12-25", "عيد الميلاد", "Christmas Day"], ["2027-01-01", "رأس السنة", "New Year's Day"]], "+49"),
  M("paris", "embassy", "europe", "FR", ["فرنسا", "France"], ["باريس", "Paris"], 48.857, 2.352, "Europe/Paris", MF, [["2026-12-25", "عيد الميلاد", "Christmas Day"]], "+33"),
  M("london", "embassy", "europe", "GB", ["المملكة المتحدة", "United Kingdom"], ["لندن", "London"], 51.507, -0.128, "Europe/London", MF, [["2026-12-25", "عيد الميلاد", "Christmas Day"], ["2026-12-28", "عطلة يوم الصناديق", "Boxing Day (substitute)"]], "+44"),
  M("stockholm", "embassy", "europe", "SE", ["السويد", "Sweden"], ["ستوكهولم", "Stockholm"], 59.329, 18.069, "Europe/Stockholm", MF, [["2026-12-24", "ليلة الميلاد", "Christmas Eve"]], "+46"),
  M("vienna", "embassy", "europe", "AT", ["النمسا", "Austria"], ["فيينا", "Vienna"], 48.208, 16.373, "Europe/Vienna", MF, [["2026-12-08", "عيد الحبل بلا دنس", "Immaculate Conception"]], "+43"),
  M("athens", "embassy", "europe", "GR", ["اليونان", "Greece"], ["أثينا", "Athens"], 37.983, 23.727, "Europe/Athens", MF, [["2026-12-25", "عيد الميلاد", "Christmas Day"]], "+30"),
  M("ankara", "embassy", "europe", "TR", ["تركيا", "Türkiye"], ["أنقرة", "Ankara"], 39.933, 32.859, "Europe/Istanbul", MF, [["2027-01-01", "رأس السنة", "New Year's Day"]], "+90"),
  M("istanbul", "consulate", "europe", "TR", ["تركيا", "Türkiye"], ["إسطنبول", "Istanbul"], 41.008, 28.978, "Europe/Istanbul", MF, [["2027-01-01", "رأس السنة", "New Year's Day"]], "+90"),
  M("gaziantep", "consulate", "europe", "TR", ["تركيا", "Türkiye"], ["غازي عنتاب", "Gaziantep"], 37.066, 37.383, "Europe/Istanbul", MF, [], "+90"),
  M("moscow", "embassy", "europe", "RU", ["روسيا", "Russia"], ["موسكو", "Moscow"], 55.756, 37.617, "Europe/Moscow", MF, [["2027-01-07", "عيد الميلاد الأرثوذكسي", "Orthodox Christmas"]], "+7"),
  M("geneva", "mission", "europe", "CH", ["سويسرا", "Switzerland"], ["جنيف", "Geneva"], 46.204, 6.143, "Europe/Zurich", MF, [], "+41"),
  M("riyadh", "embassy", "mena", "SA", ["السعودية", "Saudi Arabia"], ["الرياض", "Riyadh"], 24.713, 46.675, "Asia/Riyadh", ST, [["2027-02-22", "يوم التأسيس", "Founding Day"]], "+966"),
  M("jeddah", "consulate", "mena", "SA", ["السعودية", "Saudi Arabia"], ["جدة", "Jeddah"], 21.485, 39.192, "Asia/Riyadh", ST, [], "+966"),
  M("abu-dhabi", "embassy", "mena", "AE", ["الإمارات", "United Arab Emirates"], ["أبوظبي", "Abu Dhabi"], 24.454, 54.377, "Asia/Dubai", MF, [["2026-12-02", "عيد الاتحاد", "National Day"]], "+971"),
  M("dubai", "consulate", "mena", "AE", ["الإمارات", "United Arab Emirates"], ["دبي", "Dubai"], 25.205, 55.271, "Asia/Dubai", MF, [["2026-12-02", "عيد الاتحاد", "National Day"]], "+971"),
  M("doha", "embassy", "mena", "QA", ["قطر", "Qatar"], ["الدوحة", "Doha"], 25.286, 51.531, "Asia/Qatar", ST, [["2026-12-18", "اليوم الوطني", "National Day"]], "+974"),
  M("kuwait", "embassy", "mena", "KW", ["الكويت", "Kuwait"], ["الكويت", "Kuwait City"], 29.376, 47.977, "Asia/Kuwait", ST, [], "+965"),
  M("amman", "embassy", "mena", "JO", ["الأردن", "Jordan"], ["عمّان", "Amman"], 31.954, 35.911, "Asia/Amman", ST, [], "+962"),
  M("beirut", "embassy", "mena", "LB", ["لبنان", "Lebanon"], ["بيروت", "Beirut"], 33.894, 35.502, "Asia/Beirut", MF, [["2026-11-22", "عيد الاستقلال", "Independence Day"]], "+961"),
  M("baghdad", "embassy", "mena", "IQ", ["العراق", "Iraq"], ["بغداد", "Baghdad"], 33.315, 44.366, "Asia/Baghdad", ST, [], "+964"),
  M("erbil", "consulate", "mena", "IQ", ["العراق", "Iraq"], ["أربيل", "Erbil"], 36.191, 44.009, "Asia/Baghdad", ST, [], "+964"),
  M("cairo", "embassy", "mena", "EG", ["مصر", "Egypt"], ["القاهرة", "Cairo"], 30.044, 31.236, "Africa/Cairo", ST, [], "+20"),
  M("algiers", "embassy", "mena", "DZ", ["الجزائر", "Algeria"], ["الجزائر", "Algiers"], 36.754, 3.059, "Africa/Algiers", ST, [], "+213"),
  M("tunis", "embassy", "mena", "TN", ["تونس", "Tunisia"], ["تونس", "Tunis"], 36.806, 10.181, "Africa/Tunis", MF, [], "+216"),
  M("muscat", "embassy", "mena", "OM", ["عُمان", "Oman"], ["مسقط", "Muscat"], 23.588, 58.383, "Asia/Muscat", ST, [], "+968"),
  M("tehran", "embassy", "asia", "IR", ["إيران", "Iran"], ["طهران", "Tehran"], 35.689, 51.389, "Asia/Tehran", [6, 0, 1, 2, 3], [], "+98"),
  M("beijing", "embassy", "asia", "CN", ["الصين", "China"], ["بكين", "Beijing"], 39.904, 116.407, "Asia/Shanghai", MF, [], "+86"),
  M("tokyo", "embassy", "asia", "JP", ["اليابان", "Japan"], ["طوكيو", "Tokyo"], 35.676, 139.65, "Asia/Tokyo", MF, [], "+81"),
  M("kuala-lumpur", "embassy", "asia", "MY", ["ماليزيا", "Malaysia"], ["كوالالمبور", "Kuala Lumpur"], 3.139, 101.687, "Asia/Kuala_Lumpur", MF, [], "+60"),
  M("new-delhi", "embassy", "asia", "IN", ["الهند", "India"], ["نيودلهي", "New Delhi"], 28.614, 77.209, "Asia/Kolkata", MF, [], "+91"),
  M("new-york", "mission", "americas", "US", ["الأمم المتحدة", "United Nations"], ["نيويورك", "New York"], 40.749, -73.968, "America/New_York", MF, [], "+1"),
  M("washington", "embassy", "americas", "US", ["الولايات المتحدة", "United States"], ["واشنطن", "Washington, D.C."], 38.907, -77.037, "America/New_York", MF, [["2026-11-26", "عيد الشكر", "Thanksgiving Day"]], "+1"),
  M("ottawa", "embassy", "americas", "CA", ["كندا", "Canada"], ["أوتاوا", "Ottawa"], 45.421, -75.697, "America/Toronto", MF, [], "+1"),
  M("brasilia", "embassy", "americas", "BR", ["البرازيل", "Brazil"], ["برازيليا", "Brasília"], -15.794, -47.882, "America/Sao_Paulo", MF, [], "+55"),
  M("buenos-aires", "embassy", "americas", "AR", ["الأرجنتين", "Argentina"], ["بوينس آيرس", "Buenos Aires"], -34.604, -58.382, "America/Argentina/Buenos_Aires", MF, [], "+54"),
  M("caracas", "embassy", "americas", "VE", ["فنزويلا", "Venezuela"], ["كاراكاس", "Caracas"], 10.48, -66.904, "America/Caracas", MF, [], "+58"),
  M("pretoria", "embassy", "africa", "ZA", ["جنوب أفريقيا", "South Africa"], ["بريتوريا", "Pretoria"], -25.747, 28.229, "Africa/Johannesburg", MF, [["2026-12-16", "يوم المصالحة", "Day of Reconciliation"]], "+27"),
  M("khartoum", "embassy", "africa", "SD", ["السودان", "Sudan"], ["الخرطوم", "Khartoum"], 15.501, 32.56, "Africa/Khartoum", ST, [], "+249"),
  M("nairobi", "embassy", "africa", "KE", ["كينيا", "Kenya"], ["نيروبي", "Nairobi"], -1.292, 36.822, "Africa/Nairobi", MF, [["2026-12-12", "يوم الجمهورية", "Jamhuri Day"]], "+254"),
  M("canberra", "embassy", "asia", "AU", ["أستراليا", "Australia"], ["كانبرا", "Canberra"], -35.281, 149.13, "Australia/Sydney", MF, [], "+61"),
];

export const getMission = (slug: string) => MISSIONS.find((m) => m.slug === slug);
export const missionTypeLabel = { embassy: "embassy", consulate: "consulate", mission: "mission" } as const;
