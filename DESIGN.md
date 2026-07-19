---
name: ArduinoLab
description: Dark, modern-minimal learning platform for Arduino and electronics makers.
colors:
  background: "#121620"
  card: "#1a1f2e"
  background-hover: "#282f42"
  border: "#31394d"
  foreground: "#f5f6fa"
  foreground-muted: "#95999f"
  primary: "#e8930d"
  primary-dark: "#c17614"
  primary-light: "#3b2a0f"
  success: "#379966"
  warning: "#e4be22"
  destructive: "#e0473f"
  brand-purple: "#8368b3"
typography:
  display:
    fontFamily: "Baloo 2, sans-serif"
    fontWeight: 700
  body:
    fontFamily: "Nunito, sans-serif"
    fontWeight: 400
  mono:
    fontFamily: "JetBrains Mono, monospace"
rounded:
  sm: "8px"
  md: "10px"
  lg: "0.75rem"
  pill: "100px"
components:
  nav-item:
    backgroundColor: "transparent"
    textColor: "{colors.foreground-muted}"
    rounded: "{rounded.md}"
    padding: "9px 12px"
  nav-item-active:
    backgroundColor: "{colors.primary-light}"
    textColor: "{colors.primary}"
    rounded: "{rounded.md}"
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "#ffffff"
    rounded: "{rounded.pill}"
    padding: "12px 24px"
  button-primary-hover:
    backgroundColor: "{colors.primary-dark}"
---

# Design System: ArduinoLab

## 1. Overview

**Creative North Star: "The Maker's Bench"**

A clean, well-lit workbench, not a neon arcade. ArduinoLab teaches electronics and Arduino programming, so the interface should feel like a confident tool in a maker's hands: dark, focused, low-glare (good for long sessions staring at code and circuits), with one warm accent color doing the work that a rainbow of hues used to do. The amber accent reads as solder, copper trace, warning-LED — native to the subject matter, not decorative.

This system explicitly rejects: the previous Duolingo-style "bubble" chrome (thick borders + offset drop-shadows on every nav row and pill), a different saturated neon hue per icon/section, and flat near-zero-chroma gray standing in for "muted." Neutrals here are always tinted blue-slate, never plain gray.

**Key Characteristics:**
- One accent (amber), used sparingly — active states, primary actions, XP/level moments.
- Flat surfaces at rest; elevation communicated by a one-step-lighter fill, not borders or shadows.
- Tinted neutrals throughout — every gray has a deliberate cool-slate hue in it.
- Functional colors (success green, destructive red, warning gold) stay separate from the accent and are used only for real state, never decoration.

## 2. Colors

Restrained strategy: tinted neutrals carry the interface, one accent used deliberately and rarely.

### Primary
- **Solder Amber** (`hsl(38 92% 50%)` / `#e8930d`): the one accent. Active nav state, primary buttons, XP/level indicators, streak flame. Used on a small fraction of any given screen — its rarity is what makes it register as "this matters."

### Neutral
- **Deep Slate** (`hsl(228 32% 8%)`): page background.
- **Slate Card** (`hsl(228 28% 12%)`): card/panel surfaces, one step up from background.
- **Slate Hover** (`hsl(228 24% 18%)`): hover fill, active-row backgrounds, muted chip backgrounds.
- **Slate Border** (`hsl(228 20% 22%)`): the only border color; used sparingly (dividers, input outlines), never as decorative per-card framing.
- **Paper** (`hsl(220 24% 97%)`): primary text.
- **Tinted Slate** (`hsl(228 14% 62%)`): secondary/muted text — carries real chroma, not flat gray.

### Functional (not decorative — only for real state)
- **Success Green** (`hsl(142 60% 42%)`): completed states, correct-code checks, positive deltas.
- **Warning Gold** (`hsl(48 88% 52%)`): caution states. Deliberately a different hue from primary amber (48° vs 38°) so the two don't collide.
- **Destructive Red** (`hsl(0 72% 56%)`): errors, delete actions, hearts/lives.
- **Brand Purple** (`hsl(262 45% 58%)`): reserved for the one or two existing purple-badge use cases (e.g. "saved" badge); not a general-purpose accent.

### Named Rules
**The One Accent Rule.** Amber is the only color allowed to mean "this is active / this is the primary action / this is special." A nav icon, a card border, a badge that isn't actually in one of those three states does not get amber — it gets neutral.

**The No Rainbow Rule.** Never assign a different hue per sibling item (per nav icon, per stat card, per badge in a list) purely for visual variety. If items need to be told apart, use icon shape, label, and layout — not hue.

## 3. Typography

**Display Font:** Baloo 2 (headings, nav labels, buttons)
**Body Font:** Nunito (paragraph text, descriptions)
**Mono Font:** JetBrains Mono (code editor, snippets)

**Character:** A rounded, friendly display face paired with a clean humanist body face — keeps the "still playful" brief without tipping into cutesy; the restraint comes from color and layout, not typography.

### Hierarchy
- **Display** (800, 1.5–2.25rem): page titles.
- **Headline** (700, 1.125–1.25rem): section headers, card titles.
- **Body** (400–600, 0.875–0.95rem): descriptions, paragraph copy. Cap at 65–75ch.
- **Label** (700, 0.7–0.75rem, uppercase, wide tracking): nav section labels, small stat labels.

## 4. Elevation

Flat by default. Depth is conveyed by a one-step lighter fill (background → card → hover), not by shadows or borders. The one exception is `clay-card`/`clay-btn` components inherited from the app's original claymorphism system (used on marketing-ish cards like achievement tiles) — those keep their offset box-shadow because it's a deliberate signature texture there, not because every surface needs one. Nav rows, list items, and buttons in the redesigned chrome use flat fills exclusively.

### Named Rules
**The Flat-Row Rule.** Nav items, list rows, and toolbar buttons never get a border or offset box-shadow at rest. Hover and active states change background fill and text color/weight only.

## 5. Components

### Buttons
- **Shape:** pill (100px) for primary CTAs, 8–10px radius for compact toolbar buttons.
- **Primary:** amber fill, white text, darkens on hover (`primary` → `primary-dark`).
- **Outline/Ghost:** transparent fill, amber text, `border-primary/30`, fills to `primary/10` on hover.

### Navigation
- Flat rows, `foreground-muted` text/icon at rest, `background-hover` fill on hover.
- Active: `primary-light` fill, `primary` text/icon, bold weight. No stripe, no border, no shadow.
- Profile and Sign Out are ordinary rows inside the same scrolling nav list (an "Account" section), not a pinned footer — persistent chrome should behave predictably, not split off from its scroll context.
- Section labels: small, bold, uppercase, `foreground-muted` — not literal gray.

### Cards / Containers
- **Corner Style:** 12–20px depending on size.
- **Background:** `card`, one step lighter than page `background`.
- **Border:** only when it separates two adjacent surfaces of the same fill (rare); not used as decorative per-card framing.

### Stat Pills (top bar)
- Flat `background-hover/60%` fill, no border, no shadow. Icon + value both use functional/accent color only when the stat itself is the accent's subject (XP, streak); otherwise neutral foreground.

## 6. Do's and Don'ts

### Do:
- **Do** use amber (`primary`) only for active state, primary actions, and XP/level/streak moments — per the One Accent Rule.
- **Do** use tinted-slate neutrals (`foreground-muted`, `border`, `background-hover`) for everything that isn't primary or functional — never a flat/plain gray value.
- **Do** keep success/warning/destructive strictly functional — they appear only when that real state is true.
- **Do** convey elevation with a lighter fill step, not a border or shadow, outside the legacy clay-card components.

### Don't:
- **Don't** assign a different saturated hue per nav icon, stat card, or badge for visual variety (the old Duolingo-bubble palette). One accent, used rarely.
- **Don't** add a thick border + offset drop-shadow "bubble" to nav rows or list items at rest.
- **Don't** pin Profile/Sign Out (or any nav-adjacent action) outside the natural scroll container without a specific reason.
- **Don't** use a flat, near-zero-chroma gray for muted text/borders/hover fills — every neutral in this system carries a deliberate slate tint.
- **Don't** introduce a new hardcoded Tailwind palette color (`bg-indigo-950`, `text-purple-400`, etc.) where a design token (`bg-card`, `text-muted-foreground`, `text-primary`) already covers the same role.
