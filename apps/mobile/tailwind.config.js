/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        paw: {
          ink: "#241B18",
          paper: "#FFF9F3",
          coral: "#E25742",
          teal: "#0E6B5B",
          mint: "#DCEFE9",
          sky: "#D8ECFA",
          line: "#E6DDD3",
          muted: "#786A60",
        },
      },
      borderRadius: {
        paw: "14px",
      },
    },
  },
  plugins: [],
};
