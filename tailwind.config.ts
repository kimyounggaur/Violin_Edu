import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ["Pretendard", "system-ui", "-apple-system", "BlinkMacSystemFont", "sans-serif"]
      },
      colors: {
        app: {
          bg: "#F9F9F7",
          surface: "#FFFFFF",
          ink: "#2D2D2D",
          muted: "#8A8275",
          action: "#2EAADC",
          ebony: "#241E18",
          darkBg: "#0E0E10",
          darkSurface: "#1B1B1F"
        },
        finger: {
          open: "#64748B",
          one: "#2563EB",
          two: "#16A34A",
          three: "#EA580C",
          four: "#9333EA"
        }
      },
      boxShadow: {
        soft: "0 10px 28px rgba(36, 30, 24, 0.10)",
        glow: "0 0 0 7px rgba(46, 170, 220, 0.16)"
      }
    }
  },
  plugins: []
} satisfies Config;
