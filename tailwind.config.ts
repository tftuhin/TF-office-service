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
          bg: "#fbf7f0",
          card: "#ffffff",
          ink: "#1c1917",
          muted: "#78716c",
          line: "#e7e1d6",
          accent: "#b4451f",   // terracotta
          accentSoft: "#f4e3d8",
          ok: "#3f6f4f",
          okSoft: "#e3efe6",
          warn: "#b8860b",
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
