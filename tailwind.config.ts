import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: { "2xl": "1400px" },
    },
    extend: {
      fontFamily: {
        sans: ['Space Grotesk', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
        orbitron: ['Orbitron', 'sans-serif'],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
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
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
        neon: {
          teal: "hsl(190, 35%, 42%)",
          gold: "hsl(40, 30%, 48%)",
          green: "hsl(155, 30%, 42%)",
          pink: "hsl(340, 25%, 50%)",
          purple: "hsl(270, 25%, 52%)",
          orange: "hsl(12, 45%, 46%)",
        },
        surface: {
          DEFAULT: "hsl(228, 25%, 14%)",
          hover: "hsl(228, 22%, 18%)",
          deep: "hsl(228, 28%, 10%)",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
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
        "neon-pulse": {
          "0%, 100%": { boxShadow: "0 0 8px rgba(80, 180, 190, 0.2)" },
          "50%": { boxShadow: "0 0 16px rgba(80, 180, 190, 0.35), 0 0 32px rgba(80, 180, 190, 0.15)" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" },
        },
        "shimmer": {
          "0%": { backgroundPosition: "-200% center" },
          "100%": { backgroundPosition: "200% center" },
        },
        "fade-in-up": {
          from: { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "spin-slow": {
          from: { transform: "rotate(0deg)" },
          to: { transform: "rotate(360deg)" },
        },
        "progress-bar": {
          from: { width: "0%" },
          to: { width: "100%" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "neon-pulse": "neon-pulse 2s ease-in-out infinite",
        "float": "float 3s ease-in-out infinite",
        "shimmer": "shimmer 4s linear infinite",
        "fade-in-up": "fade-in-up 0.5s ease-out forwards",
        "spin-slow": "spin-slow 8s linear infinite",
        "progress-bar": "progress-bar 2s ease-out forwards",
      },
      backgroundImage: {
        "gradient-teal": "linear-gradient(135deg, hsl(190,35%,42%), hsl(200,30%,38%))",
        "gradient-gold": "linear-gradient(135deg, hsl(42,28%,52%), hsl(40,30%,48%))",
        "gradient-green": "linear-gradient(135deg, hsl(155,30%,42%), hsl(150,28%,39%))",
        "gradient-hero": "linear-gradient(135deg, hsl(190 35% 42% / 0.04) 0%, hsl(270 25% 52% / 0.04) 50%, hsl(40 30% 48% / 0.02) 100%)",
        "gradient-card": "linear-gradient(135deg, hsl(228,25%,14%), hsl(228,22%,18%))",
      },
      boxShadow: {
        "neon-teal": "0 2px 12px hsl(190 35% 42% / 0.15)",
        "neon-gold": "0 2px 12px hsl(40 30% 48% / 0.15)",
        "neon-green": "0 2px 12px hsl(155 30% 42% / 0.15)",
        "neon-pink": "0 2px 12px hsl(340 25% 50% / 0.15)",
        "neon-purple": "0 2px 12px hsl(270 25% 52% / 0.15)",
        "card-elevated": "0 4px 20px hsl(0 0% 0% / 0.3)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
