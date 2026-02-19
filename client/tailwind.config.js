/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{ts,tsx,js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          // GreenLoop brand color palette
          // Sampled from the live screenshot — solid rich forest green
          //
          // HOW TO CHANGE THE DESCRIPTION PANEL COLOR:
          // The left panel gradient is: from-brand-900 via-brand-800 to-brand-700
          //   → Change brand-900 / brand-800 / brand-700 to adjust the panel background
          // Text colors on the panel:
          //   brand-200  → description body text + pill text
          //   brand-300  → subtitle, stat labels, icon, "Back to Home" link
          // Form side (right panel):
          //   brand-600  → buttons, step numbers, focus rings, links
          //   brand-50   → light highlight backgrounds (e.g. business info box)
          //   brand-100  → borders of highlight boxes
          //   brand-700  → text inside highlight boxes
          //
          50:  "#f0fdf4",
          100: "#dcfce7",
          200: "#bbf7d0",  // panel: description body text
          300: "#86efac",  // panel: subtitle / "Back to Home" / stat labels
          400: "#4ade80",
          500: "#22c55e",
          600: "#1e7a40",  // form: primary buttons, links, rings
          700: "#22843c",  // panel gradient end   ← bottom-right (lightest)
          800: "#1e7035",  // panel gradient mid   ← main visible panel color
          900: "#1a5c32",  // panel gradient start ← top-left (darkest)
          950: "#0f3d20",
        },
      },
    },
  },
  plugins: [],
};