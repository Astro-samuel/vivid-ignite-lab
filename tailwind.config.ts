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
        "gradient-teal": "linear-gradient(135deg, hsl(182,45%,45%), hsl(197,40%,40%), hsl(210,40%,45%))",
        "gradient-gold": "linear-gradient(135deg, hsl(48,35%,55%), hsl(45,40%,50%), hsl(35,40%,48%))",
        "gradient-green": "linear-gradient(135deg, hsl(150,40%,45%), hsl(143,38%,42%), hsl(144,38%,38%))",
        "gradient-hero": "linear-gradient(135deg, rgba(80,180,190,0.08) 0%, rgba(150,90,200,0.08) 50%, rgba(190,170,80,0.04) 100%)",
        "gradient-card": "linear-gradient(135deg, hsl(232,42%,13%), hsl(232,40%,18%))",
      },
      boxShadow: {
        "neon-teal": "0 0 12px rgba(80, 180, 190, 0.25), 0 0 24px rgba(80, 180, 190, 0.1)",
        "neon-gold": "0 0 12px rgba(190, 170, 80, 0.25), 0 0 24px rgba(190, 170, 80, 0.1)",
        "neon-green": "0 0 12px rgba(80, 180, 120, 0.25), 0 0 24px rgba(80, 180, 120, 0.1)",
        "neon-pink": "0 0 12px rgba(190, 80, 130, 0.25), 0 0 24px rgba(190, 80, 130, 0.1)",
        "neon-purple": "0 0 12px rgba(150, 90, 200, 0.25), 0 0 24px rgba(150, 90, 200, 0.1)",
        "card-elevated": "0 4px 24px rgba(0, 0, 0, 0.4), 0 0 1px rgba(80, 180, 190, 0.08)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
