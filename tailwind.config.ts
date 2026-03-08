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
        // Muted neon palette
        neon: {
          teal: "hsl(182, 45%, 45%)",
          gold: "hsl(45, 40%, 50%)",
          green: "hsl(150, 40%, 45%)",
          pink: "hsl(328, 40%, 50%)",
          purple: "hsl(284, 35%, 55%)",
          orange: "hsl(16, 55%, 48%)",
        },
        surface: {
          DEFAULT: "hsl(232, 42%, 13%)",
          hover: "hsl(232, 40%, 18%)",
          deep: "hsl(232, 45%, 8%)",
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
          "0%, 100%": { boxShadow: "0 0 10px rgba(0, 245, 255, 0.4)" },
          "50%": { boxShadow: "0 0 25px rgba(0, 245, 255, 0.8), 0 0 50px rgba(0, 245, 255, 0.3)" },
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
        "gradient-teal": "linear-gradient(135deg, #00F5FF, #00D4FF, #0099FF)",
        "gradient-gold": "linear-gradient(135deg, #FFE135, #FFD700, #FFA500)",
        "gradient-green": "linear-gradient(135deg, #00FF88, #00E676, #00C853)",
        "gradient-hero": "linear-gradient(135deg, rgba(0,245,255,0.1) 0%, rgba(183,68,255,0.1) 50%, rgba(255,215,0,0.05) 100%)",
        "gradient-card": "linear-gradient(135deg, #141B3D, #1E2749)",
      },
      boxShadow: {
        "neon-teal": "0 0 20px rgba(0, 245, 255, 0.5), 0 0 40px rgba(0, 245, 255, 0.2)",
        "neon-gold": "0 0 20px rgba(255, 215, 0, 0.5), 0 0 40px rgba(255, 215, 0, 0.2)",
        "neon-green": "0 0 20px rgba(0, 255, 136, 0.5), 0 0 40px rgba(0, 255, 136, 0.2)",
        "neon-pink": "0 0 20px rgba(255, 20, 147, 0.5), 0 0 40px rgba(255, 20, 147, 0.2)",
        "neon-purple": "0 0 20px rgba(183, 68, 255, 0.5), 0 0 40px rgba(183, 68, 255, 0.2)",
        "card-elevated": "0 4px 24px rgba(0, 0, 0, 0.4), 0 0 1px rgba(0, 245, 255, 0.1)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
