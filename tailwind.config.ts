import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      gridTemplateColumns: {
        'auto-fill-minmax': 'repeat(auto-fill, minmax(75px, max-content))',
      },
      colors: {
        // Keep existing custom colors
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
          100: 'rgba(99, 72, 51, 1)',
          200: 'rgba(156, 133, 120, 1)',
          300: 'rgba(212, 207, 202, 1)',
        },
        sectionHeader: { 
          DEFAULT: '#121212' 
        },
        success: {
          DEFAULT: 'rgba(51, 204, 51, 1)',
          100: 'rgba(51, 204, 51, 0.7)',
          200: 'rgba(51, 204, 51, 0.4)',
          300: 'rgba(51, 204, 51, 0.1)',
        },
        warning: {
          DEFAULT: '#FFB020',
          100: 'rgba(255, 221, 119, 1)',
          200: 'rgba(255, 236, 178, 1)',
          300: 'rgba(255, 247, 222, 1)',
        },
        danger: {
          DEFAULT: 'rgba(255, 58, 58, 1)',
          100: 'rgba(255, 97, 97, 1)',
          200: 'rgba(255, 170, 170, 1)',
        },
        gray: {
          DEFAULT: 'rgba(18, 18, 18, 1)',
          100: 'rgba(73, 80, 87, 1)',
          200: 'rgba(172, 181, 189, 1)',
          300: 'rgba(221, 226, 229, 1)',
          400: 'rgba(248, 249, 250, 1)',
          500: '#ACB5BD',
          600: '#7A7777',
          700: '#DDE2E5',
        },
        darkBlue: {
          DEFAULT: '#1A1A25'
        },
        outline: {
          DEFAULT: '#3E1C01',
        },
        shadow: {
          DEFAULT: '#AEAEC026'
        },
        borderColor: {
          DEFAULT: '#CDCDCD'
        },
        // shadcn/ui colors
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [
    require('tailwind-scrollbar-hide'),
    require('@tailwindcss/typography'),
  ],
}

export default config