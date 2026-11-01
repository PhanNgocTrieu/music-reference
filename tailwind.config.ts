import type { Config } from "tailwindcss";

export default {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
      },
      colors: {
        // Taken from logo.png: deep navy circle, gold/yellow flame and script, cream ring.
        navy: {
          50: "#EEF1F8",
          100: "#DCE2F0",
          200: "#B9C5E0",
          300: "#8CA0CB",
          400: "#5A6FA0",
          500: "#394F7E",
          600: "#2B3E68",
          700: "#222F52",
          800: "#1C2745",
          900: "#161E38",
        },
        gold: {
          50: "#FEFBEE",
          100: "#FBF3D1",
          200: "#F6E7A3",
          300: "#F0D96E",
          400: "#EACB4A",
          500: "#DCB92E",
          600: "#B89423",
          700: "#8C701B",
        },
        cream: {
          50: "#FBF9F4",
          100: "#F5F1E7",
          200: "#EDE7D6",
          300: "#E0D7BE",
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
