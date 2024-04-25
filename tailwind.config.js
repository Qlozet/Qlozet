/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {},
    colors: {
      white: "rgba(255, 255, 255, 1)",
      dark: "rgba(18, 18, 18, 1)",
      primary: {
        DEFAULT: "rgba(62, 28, 1, 1)",
        100: "rgba(99, 72, 51, 1)",
        200: "rgba(156, 133, 120, 1)",
        300: "rgba(212, 207, 202, 1)",
      },
      success: {
        DEFAULT: "rgba(51, 204, 51, 1)",
        100: "rgba(51, 204, 51, 0.7)",
        200: "rgba(51, 204, 51, 0.4)",
        300: "rgba(51, 204, 51, 0.1)",
      },

      warning: {
        DEFAULT: "#FFB020",
        100: "rgba(255, 221, 119, 1)",
        200: "rgba(255, 236, 178, 1)",
        300: "rgba(255, 247, 222, 1)",
      },
      danger: {
        DEFAULT: "rgba(255, 58, 58, 1)",
        100: "rgba(255, 97, 97, 1)",
        200: "rgba(255, 170, 170, 1)",
      },
      gray: {
        DEFAULT: "rgba(18, 18, 18, 1)",
        100: "rgba(73, 80, 87, 1)",
        200: "rgba(172, 181, 189, 1)",
        300: "rgba(221, 226, 229, 1)",
        400: "rgba(248, 249, 250, 1)",
      },
    },
    screens: {
      sm: "640px", // Small screens (e.g., phones)
      md: "768px", // Medium screens (e.g., tablets)
      lg: "1024px", // Large screens (e.g., laptops)
      xl: "1280px", // Extra large screens (e.g., desktops)
      "2xl": "1536px", // 2xl screens (e.g., large desktops)
    },
  },
  plugins: [],
};
