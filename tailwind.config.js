/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#02111B",
        secondary: "#171614",
        background: "#eaeaea",
        secondary_bg: "#FFFAFF",
        active: "#170A1C",
        inactive: "#9ca3af",
        green: "#4ade80",
        winner: "#8FF7A7",
        loser: "#FF4D4D",
      },
    },
  },
  plugins: [],
};
