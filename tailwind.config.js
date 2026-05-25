/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#0EA5B7",
        "primary-light": "#22D3EE",
        "primary-dark": "#0891B2",
      },
    },
  },
  plugins: [],
};
