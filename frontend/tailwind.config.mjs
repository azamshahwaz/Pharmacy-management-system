import daisyui from "daisyui"

/** @type {import('tailwindcss').Config} */
export default {

  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [daisyui],
  daisyui: {
    themes: ["light","dark", "emerald", "corporate", "garden", "forest", "aqua", "lofi", "pastel", "fantasy", "wireframe", "black", "luxury","dracula", "cmyk", "autumn", "business", "acid", "lemonade", "night", "coffee", "winter", "dim"],
  }
}