import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        emerald: { DEFAULT: "#0A6B47", 50: "#E8F4EE", 100: "#C9E5D6", 300: "#5FB08A", 500: "#0A6B47", 600: "#085A3C", 700: "#06452E", 900: "#032619" },
        navy: { DEFAULT: "#0B1B33", 300: "#4A5F82", 500: "#16294A", 700: "#0B1B33", 900: "#050D1A" },
        gold: { DEFAULT: "#C9A14A", 100: "#F5EBD3", 300: "#DEC07D", 500: "#C9A14A", 700: "#9A7A32" },
        ivory: { DEFAULT: "#F7F3EA", 50: "#FBF9F4", 200: "#EDE6D6" },
        flag: { green: "#007A3D", black: "#000000", red: "#CE1126" },
      },
      fontFamily: {
        sans: ["var(--font-ui)", "Inter Variable", "IBM Plex Sans Arabic", "system-ui", "sans-serif"],
        arabic: ["IBM Plex Sans Arabic", "system-ui", "sans-serif"],
      },
      boxShadow: {
        gov: "0 1px 2px rgba(11,27,51,.06), 0 8px 24px -8px rgba(11,27,51,.18)",
        glow: "0 0 0 1px rgba(201,161,74,.35), 0 10px 40px -10px rgba(201,161,74,.45)",
      },
      keyframes: {
        rise: { "0%": { opacity: "0", transform: "translateY(16px)" }, "100%": { opacity: "1", transform: "none" } },
        shimmer: { "0%": { backgroundPosition: "-200% 0" }, "100%": { backgroundPosition: "200% 0" } },
      },
      animation: { rise: "rise .6s cubic-bezier(.2,.7,.2,1) both", shimmer: "shimmer 6s linear infinite" },
    },
  },
  plugins: [],
} satisfies Config;
