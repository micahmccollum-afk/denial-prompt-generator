import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        storesight: {
          primary: "#6D36FF",
          "primary-light": "#ECE5FF",
          banner: "#4E339C",
          background: "#F4F9FF",
          text: "#1a1a2e",
          "text-muted": "#6b7280",
          border: "#e2e0f0",
          card: "#ffffff",
          ring: "#9C77EA",
          // Dark mode
          "dark-bg": "#0a0b0f",
          "dark-card": "#141620",
          "dark-text": "#e4e5ea",
          "dark-muted": "#a3a8bb",
          "dark-border": "#222436",
          "dark-primary": "#9C77EA",
          "tech-accent": "#00d4aa",
        },
      },
      animation: {
        "glow": "glow-pulse 3s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
export default config;
