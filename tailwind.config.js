/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#F28500",
        "primary-light": "#FFA64D",
        "primary-dark": "#B36000",
      },
    },
  },
  plugins: [],
};
