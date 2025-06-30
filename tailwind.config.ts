import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))", // Agilenesia Teal
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))", // Agilenesia Accent (Amber)
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Agilenesia Brand Colors
        agile: {
          teal: {
            DEFAULT: "hsl(var(--agile-teal))", // ~ teal-600
            light: "hsl(var(--agile-teal-light))", // ~ teal-500
            dark: "hsl(var(--agile-teal-dark))", // ~ teal-700
            foreground: "hsl(var(--agile-teal-foreground))", // white
          },
          amber: {
            DEFAULT: "hsl(var(--agile-amber))", // ~ amber-500
            light: "hsl(var(--agile-amber-light))", // ~ amber-400
            dark: "hsl(var(--agile-amber-dark))", // ~ amber-600
            foreground: "hsl(var(--agile-amber-foreground))", // dark gray or black
          },
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        heading: ["var(--font-lexend)", "system-ui", "sans-serif"],
      },
      fontSize: {
        xs: [
          "var(--font-size-xs)",
          { lineHeight: "var(--line-height-normal)", letterSpacing: "var(--letter-spacing-wide)" },
        ],
        sm: [
          "var(--font-size-sm)",
          { lineHeight: "var(--line-height-normal)", letterSpacing: "var(--letter-spacing-normal)" },
        ],
        base: [
          "var(--font-size-base)",
          { lineHeight: "var(--line-height-relaxed)", letterSpacing: "var(--letter-spacing-normal)" },
        ],
        lg: [
          "var(--font-size-lg)",
          { lineHeight: "var(--line-height-relaxed)", letterSpacing: "var(--letter-spacing-normal)" },
        ],
        xl: [
          "var(--font-size-xl)",
          { lineHeight: "var(--line-height-normal)", letterSpacing: "var(--letter-spacing-normal)" },
        ],
        "2xl": [
          "var(--font-size-2xl)",
          { lineHeight: "var(--line-height-snug)", letterSpacing: "var(--letter-spacing-tight)" },
        ],
        "3xl": [
          "var(--font-size-3xl)",
          { lineHeight: "var(--line-height-snug)", letterSpacing: "var(--letter-spacing-tight)" },
        ],
        "4xl": [
          "var(--font-size-4xl)",
          { lineHeight: "var(--line-height-tight)", letterSpacing: "var(--letter-spacing-tighter)" },
        ],
        "5xl": [
          "var(--font-size-5xl)",
          { lineHeight: "var(--line-height-tight)", letterSpacing: "var(--letter-spacing-tighter)" },
        ],
        "6xl": [
          "var(--font-size-6xl)",
          { lineHeight: "var(--line-height-tight)", letterSpacing: "var(--letter-spacing-tighter)" },
        ],
        "7xl": [
          "var(--font-size-7xl)",
          { lineHeight: "var(--line-height-tight)", letterSpacing: "var(--letter-spacing-tighter)" },
        ],
      },
      lineHeight: {
        tight: "var(--line-height-tight)",
        snug: "var(--line-height-snug)",
        normal: "var(--line-height-normal)",
        relaxed: "var(--line-height-relaxed)",
        loose: "var(--line-height-loose)",
      },
      letterSpacing: {
        tighter: "-0.05em",
        tight: "-0.025em",
        normal: "0em",
        wide: "0.025em",
        wider: "0.05em",
        widest: "0.1em",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "gradient-animation": {
          "0%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        gradient: "gradient-animation 15s ease infinite",
      },
      backgroundSize: {
        "200%": "200% 200%",
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/line-clamp")],
}
export default config
