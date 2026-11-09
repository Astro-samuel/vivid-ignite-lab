# Product

## Register

product

## Users

Hobbyists and students learning electronics and Arduino programming — from complete beginners working through guided lessons to more confident makers building their own projects in the free-form IDE. They're at a desk with a computer (and often a physical Arduino board) nearby, moving between reading a concept, writing code, and testing it against real or simulated hardware. The job to be done: understand a concept, write working code, see it run (in simulation or on a physical board), and track progress over time.

## Product Purpose

ArduinoLab is a learning platform for electronics and Arduino: structured lessons and learning paths, a project catalog, a component/kit inventory, a code editor with a real remote compiler and Web-Serial flashing to physical boards, a circuit simulator, AI-assisted debugging, and gamified progress (XP, levels, streaks, achievements). Success looks like a learner going from "never touched an Arduino" to shipping their own working project, with the app staying out of the way of that process.

## Brand Personality

Playful, lively and game-like, in the Duolingo mould (updated Nov 2026 at the owner's request, replacing the earlier "minimal dark" direction). Light surface, chunky pressable tiles, bright green progress, a friendly mascot (Volt), and visible XP / streak / levels. Warmth and momentum first; clarity still beats cuteness.

## Anti-references

- The previous dark slate + amber look — dull for a learning app.
- Plain white pages with no colour or personality.
- Generic default-Bootstrap or generic-SaaS look.
- Emoji as UI chrome; colour used without meaning (each colour maps to one concept: green go, gold XP, orange streak, blue secondary).

## Design Principles

- Hierarchy through structure and type weight, not decoration (borders, shadows, saturated color-per-element).
- One considered accent color used deliberately, not a different bright hue per icon/section.
- Progress and gamification (XP, levels, streaks) stay visible and motivating, expressed through restrained, purposeful color and motion rather than loud chrome.
- Persistent chrome (nav, header) should behave predictably — nothing pinned or split off from its natural scroll context without a clear reason.
- Dark-mode-native: the app is dark-themed by default: neutrals need real intentional tuning (tinted, not just gray), not just contrast-safe gray fallbacks.

## Accessibility & Inclusion

WCAG AA contrast minimum (body text ≥4.5:1, large/bold text ≥3:1). Respect `prefers-reduced-motion`. No color-only signal for state (active/error/success states pair color with icon, weight, or position, not hue alone).
