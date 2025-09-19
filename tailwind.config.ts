import type { Config } from "tailwindcss";

const config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/patterns/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/redux/provider.tsx",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Primary brand colors
        primary: {
          DEFAULT: "#634833",
          50: "#f8f6f4",
          100: "#f0ebe6",
          200: "#ddd3c8",
          300: "#c8b9a4",
          400: "#b09a7e",
          500: "#9c8578",
          600: "#8a7166",
          700: "#735d55",
          800: "#634833",
          900: "#52392a",
          950: "#2d1f17",
          foreground: "#ffffff",
        },

        // Semantic colors
        success: {
          DEFAULT: "#33cc33",
          50: "#f0fdf0",
          100: "#dcfce7",
          200: "#bbf7d0",
          300: "#86efac",
          400: "#4ade80",
          500: "#33cc33",
          600: "#16a34a",
          700: "#15803d",
          800: "#166534",
          900: "#14532d",
        },

        warning: {
          DEFAULT: "#ffb020",
          50: "#fffbeb",
          100: "#fef3c7",
          200: "#fde68a",
          300: "#fcd34d",
          400: "#fbbf24",
          500: "#ffb020",
          600: "#d97706",
          700: "#b45309",
          800: "#92400e",
          900: "#78350f",
        },

        danger: {
          DEFAULT: "#ff3a3a",
          50: "#fef2f2",
          100: "#fee2e2",
          200: "#fecaca",
          300: "#fca5a5",
          400: "#f87171",
          500: "#ff3a3a",
          600: "#dc2626",
          700: "#b91c1c",
          800: "#991b1b",
          900: "#7f1d1d",
        },

        // Custom grays
        gray: {
          DEFAULT: "#121212",
          50: "#f9fafb",
          100: "#f3f4f6",
          200: "#e5e7eb",
          300: "#d1d5db",
          400: "#9ca3af",
          500: "#6b7280",
          600: "#4b5563",
          700: "#374151",
          800: "#1f2937",
          900: "#111827",
          950: "#030712",
        },

        // Utility colors
        "section-header": "#121212",
        "dark-blue": "#1a1a25",
        outline: "#3e1c01",
        "border-color": "#cdcdcd",
        dark: "#000000",

        // Legacy color mappings for backward compatibility
        "primary-100": "#634833",
        "primary-200": "#9c8578",
        "primary-300": "#d4cfca",
        "success-100": "rgba(51, 204, 51, 0.7)",
        "success-200": "rgba(51, 204, 51, 0.4)",
        "success-300": "rgba(51, 204, 51, 0.1)",
        "warning-100": "#ffdd77",
        "warning-200": "#ffecb2",
        "warning-300": "#fff7de",
        "danger-100": "#ff6161",
        "danger-200": "#ffaaaa",
        "gray-100": "#495057",
        "gray-200": "#acb5bd",
        "gray-300": "#dde2e5",
        "gray-400": "#f8f9fa",
        "gray-500": "#acb5bd",
        "gray-600": "#7a7777",
        "gray-700": "#dde2e5",
      },

      spacing: {
        "18": "4.5rem",
        "88": "22rem",
        "128": "32rem",
      },

      fontSize: {
        xs: ["0.75rem", { lineHeight: "1rem" }],
        sm: ["0.875rem", { lineHeight: "1.25rem" }],
        base: ["1rem", { lineHeight: "1.5rem" }],
        lg: ["1.125rem", { lineHeight: "1.75rem" }],
        xl: ["1.25rem", { lineHeight: "1.75rem" }],
        "2xl": ["1.5rem", { lineHeight: "2rem" }],
        "3xl": ["1.875rem", { lineHeight: "2.25rem" }],
        "4xl": ["2.25rem", { lineHeight: "2.5rem" }],
        "5xl": ["3rem", { lineHeight: "1" }],
        "6xl": ["3.75rem", { lineHeight: "1" }],
      },

      borderRadius: {
        none: "0",
        sm: "0.125rem",
        DEFAULT: "0.25rem",
        md: "0.375rem",
        lg: "0.5rem",
        xl: "0.75rem",
        "2xl": "1rem",
        "3xl": "1.5rem",
        full: "9999px",
      },

      boxShadow: {
        sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
        DEFAULT:
          "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
        md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
        lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
        xl: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
        "2xl": "0 25px 50px -12px rgb(0 0 0 / 0.25)",
        inner: "inset 0 2px 4px 0 rgb(0 0 0 / 0.05)",
        custom: "0px 0.72px 5.73px 0px rgba(0, 0, 0, 0.05)",
      },

      animation: {
        "fade-in": "fadeIn 0.5s ease-in-out",
        "fade-out": "fadeOut 0.5s ease-in-out",
        "slide-up": "slideUp 0.3s ease-out",
        "slide-down": "slideDown 0.3s ease-out",
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },

      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        fadeOut: {
          "0%": { opacity: "1" },
          "100%": { opacity: "0" },
        },
        slideUp: {
          "0%": { transform: "translateY(100%)" },
          "100%": { transform: "translateY(0)" },
        },
        slideDown: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(0)" },
        },
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },

      gridTemplateColumns: {
        "auto-fill-minmax": "repeat(auto-fill, minmax(75px, max-content))",
        "auto-fit-minmax": "repeat(auto-fit, minmax(200px, 1fr))",
      },

      screens: {
        xs: "475px",
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1280px",
        "2xl": "1536px",
      },
    },
  },
  plugins: [],
} satisfies Config;

export default config;
