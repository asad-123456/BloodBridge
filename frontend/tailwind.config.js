/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#E10600",
          hover: "#C80000",
          light: "#FEE2E2",
        },
      },
    },
  },
  plugins: [],
};
