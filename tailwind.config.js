/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    fontFamily: { sans: ['"Poppins", sans-serif'] },
    extend: {
      animation: {
        flash: "flash .5s ease-in-out",
        flasInfinite: "flash2 1.25s ease-in-out infinite",
      },

      keyframes: {
        flash: {
          from: { opacity: 0 },
          to: { opacity: 1 },
        },
        flash2: {
          "0%": { opacity: 0.6 },
          "50%": { opacity: 0.4 },
          "100%": { opacity: 0.6 },
        },
      },

      colors: {
        primaryBgColor: "#FFFFE8",
        tertiaryColor: "#d3d3d3",

        sideColor: "#ece0d2",
        btnHover: "#181717",
        orangeColor: "#f45f31",
        orangeLight: "#f45f31c0",

        isSending: "rgb(251 146 60)",
        isError: "rgb(220 38 38 )",
        lightBlack: "#000000e8",
      },
    },
  },
  plugins: [],
};
