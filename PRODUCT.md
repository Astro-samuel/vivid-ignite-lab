# Product

## Register

product

## Users

Hobbyists and students learning electronics and Arduino programming — from complete beginners working through guided lessons to more confident makers building their own projects in the free-form IDE. They're at a desk with a computer (and often a physical Arduino board) nearby, moving between reading a concept, writing code, and testing it against real or simulated hardware. The job to be done: understand a concept, write working code, see it run (in simulation or on a physical board), and track progress over time.

## Product Purpose

ArduinoLab is a learning platform for electronics and Arduino: structured lessons and learning paths, a project catalog, a component/kit inventory, a code editor with a real remote compiler and Web-Serial flashing to physical boards, a circuit simulator, AI-assisted debugging, and gamified progress (XP, levels, streaks, achievements). Success looks like a learner going from "never touched an Arduino" to shipping their own working project, with the app staying out of the way of that process.

## Brand Personality

Modern and minimal, still playful. Clean, restrained, hierarchy-driven UI — not the loud neobrutalist/Duolingo bubble-and-neon look it launched with — but not a cold enterprise tool either. It's for learners, so it should still carry warmth and a sense of momentum (progress, streaks, leveling up) without leaning on saturated rainbow colors or heavy drop-shadow "clay" chrome to do it. Confidence and clarity over cuteness.

## Anti-references

- The current per-item "bubble" nav pills (thick borders, offset box-shadow per row) — reads busy/heavy, not clean.
- Neon/saturated hue-per-icon coloring (a different vivid color for every nav icon) — reads like a rainbow, not a considered palette.
- Flat, dull, low-contrast grays used as a default filler color in muted text/borders/hover states — reads unfinished rather than restrained.
- Generic default-Bootstrap or generic-SaaS look — the app should still feel like a distinct product, just a quieter one.

## Design Principles

- Hierarchy through structure and type weight, not decoration (borders, shadows, saturated color-per-element).
- One considered accent color used deliberately, not a different bright hue per icon/section.
- Progress and gamification (XP, levels, streaks) stay visible and motivating, expressed through restrained, purposeful color and motion rather than loud chrome.
- Persistent chrome (nav, header) should behave predictably — nothing pinned or split off from its natural scroll context without a clear reason.
- Dark-mode-native: the app is dark-themed by default: neutrals need real intentional tuning (tinted, not just gray), not just contrast-safe gray fallbacks.

## Accessibility & Inclusion

WCAG AA contrast minimum (body text ≥4.5:1, large/bold text ≥3:1). Respect `prefers-reduced-motion`. No color-only signal for state (active/error/success states pair color with icon, weight, or position, not hue alone).
