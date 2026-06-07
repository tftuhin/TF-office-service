import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      colors: {
        canteen: {
          bg: "#ffffff",
          card: "#f8f9fa",
          ink: "#1a2b45",
          muted: "#939fa7",
          line: "#e7e1d6",
          accent: "#1a2b45",   // primary dark blue
          accentSoft: "#e8ecf1",
          ok: "#3f6f4f",
          okSoft: "#e3efe6",
          warn: "#b8860b",
        },
        primary: {
          50: "#f0f4f8",
          100: "#dfe7f1",
          200: "#bdd0e3",
          300: "#9bb8d5",
          400: "#7aa1c7",
          500: "#588ab9",
          600: "#3d6ca8",
          700: "#1a2b45",
          800: "#152c48",
          900: "#0f1d2f",
        },
        neutral: {
          50: "#f9fafb",
          100: "#f3f4f6",
          200: "#e5e7eb",
          300: "#d1d5db",
          400: "#9ca3af",
          500: "#939fa7",
          600: "#6b7280",
          700: "#374151",
          800: "#1f2937",
          900: "#111827",
        },
      },
      boxShadow: {
        card: "0 1px 2px rgba(28,25,23,0.04), 0 8px 24px -12px rgba(28,25,23,0.12)",
      },
    },
  },
  plugins: [],
};
export default config;
