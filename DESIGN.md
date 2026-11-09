---
name: ArduinoLab
description: Playful, chunky, light learning platform for Arduino and electronics makers, in the Duolingo mould.
colors:
  background: "#ecfaf2"
  card: "#ffffff"
  background-hover: "#dff3e8"
  border: "#cfe3d6"
  foreground: "#3d3d3d"
  foreground-muted: "#696969"
  primary: "#2f8a00"
  primary-dark: "#1f6000"
  green-bright: "#58cc02"
  secondary: "#006eb2"
  blue-bright: "#1cb0f6"
  gold: "#ad7a00"
  gold-bright: "#ffc800"
  orange: "#c25e00"
  orange-bright: "#ff9600"
  destructive: "#d32f2f"
  purple: "#9b2fd6"
typography:
  display:
    fontFamily: "Nunito, system-ui, sans-serif"
    fontWeight: 800
  body:
    fontFamily: "Nunito, system-ui, sans-serif"
    fontWeight: 600
  mono:
    fontFamily: "JetBrains Mono, monospace"
rounded:
  md: "12px"
  lg: "16px"
  pill: "999px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "#ffffff"
    rounded: "{rounded.lg}"
    padding: "12px 20px"
  button-ghost:
    backgroundColor: "{colors.card}"
    textColor: "{colors.secondary}"
    rounded: "{rounded.lg}"
  nav-item-active:
    backgroundColor: "#e6f6ff"
    textColor: "{colors.secondary}"
    rounded: "{rounded.md}"
---

# Design System: ArduinoLab

## 1. Overview

**North Star: "The Game Board."** Learning Arduino should feel like levelling up, not reading a manual. Every tile (button, card, lesson node) sits on a thick bottom edge and presses down into it. Colour carries meaning: green = go and progress, gold = XP, orange = streak, blue = secondary actions and the current nav row.

The page surface is a soft mint with a faint dot grid (solder pads). Cards are white so they pop off it. Landing sections alternate tinted bands (sky, butter, mint, lilac) to keep the page lively.

**Mascot:** Volt, a friendly chip-bot (`components/Mascot.tsx`): green body with thick edge, big eyes, gold pins and LED antenna. Used on the landing hero, dashboard welcome, auth and error-explainer moments.

## 2. Colors
- **Primary green** `#2f8a00` is the button fill (AA with white text). **Bright green** `#58cc02` is for non-text fills: progress bars, path nodes, wordmark.
- **Gold** (XP, completed nodes), **Orange** (streak), **Blue** (secondary buttons, active nav), **Purple** (saved) each have a bright fill and a darker text variant that meets AA.
- Never put white text on a bright variant; use the dark variant for text.

## 3. Typography
Nunito throughout, weights 600–900. Buttons and nav are uppercase with 0.06em tracking. Small labels (`.silk`) are 0.72rem, 800, uppercase, grey. JetBrains Mono for code only.

## 4. Elevation
No soft shadows. Depth is a 4px bottom border darker than the fill (`border-b-4`). Active press: translate down 2px and shrink the edge to 2px.

## 5. Components
- **Buttons** (`.clay-btn`, shadcn `Button`): 16px radius, uppercase, thick bottom edge. Primary green, ghost white with blue text, danger red.
- **Cards** (`.clay-card`): 2px border, 4px bottom, 16px radius.
- **Progress** (`.clay-progress-*`): 16px pill track, bright green fill with a highlight stripe.
- **Lesson nodes** (`.lesson-node-*`): 72px circles on an 8px edge. Current = green with a bouncing START bubble, done = gold, locked = grey.
- **Top bar:** streak (orange flame) and XP (gold bolt), icon + bold number.
- **Sidebar:** white, uppercase rows; active row is a pale blue fill with a blue outline.

## 6. Do's and Don'ts
- **Do** keep copy short, encouraging and in sentence-level plain words.
- **Do** pair every colour state with an icon or label.
- **Don't** use dark mode chrome. Only the code editor and IDE panels are dark.
- **Don't** add soft drop shadows or gradients.
- **Don't** use emoji as UI chrome; project data may still carry emoji thumbnails.
- **Don't** claim anything commercial (free, pricing) that the product has not confirmed.
