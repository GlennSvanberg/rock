# Rock — Design System

Rock uses a **dark-only** interface with **neon green** as the sole accent color. There is no light theme. All surfaces, typography, and interactive states are built on deep charcoal backgrounds with electric green highlights and glow.

## Principles

1. **Dark always** — No light mode toggle. The app ships in dark theme only.
2. **Neon green everywhere** — Links, buttons, borders, focus rings, kickers, and glow effects use the neon green palette. Avoid other accent hues (no teal, blue, or amber accents).
3. **Glow over flat** — Primary actions and key UI use subtle green glow (`box-shadow`, radial gradients) to reinforce the neon aesthetic.
4. **High contrast text** — Body copy is soft off-white; muted text is desaturated green-gray. Never use pure white on large areas.
5. **Restrained motion** — Short ease transitions (≈180ms). Entrance animations are subtle rises, not bounces.

## Color Palette

| Token | Hex | Usage |
|-------|-----|-------|
| `--bg-base` | `#060a06` | Page background |
| `--bg-elevated` | `#0c120c` | Cards, panels |
| `--surface` | `rgba(12, 22, 14, 0.82)` | Glass surfaces |
| `--surface-strong` | `rgba(10, 18, 12, 0.94)` | Opaque panels |
| `--neon` | `#39ff14` | Primary accent, CTAs, active states |
| `--neon-bright` | `#6dff4a` | Hover, highlights |
| `--neon-deep` | `#22c55e` | Links, secondary accent |
| `--neon-dim` | `#166534` | Muted accent, borders |
| `--neon-glow` | `rgba(57, 255, 20, 0.35)` | Shadows and radial glows |
| `--ink` | `#e4ffe4` | Primary text |
| `--ink-soft` | `#8fb88f` | Secondary text |
| `--line` | `rgba(57, 255, 20, 0.14)` | Borders, dividers |
| `--kicker` | `#6dff4a` | Labels, uppercase kickers |

### shadcn / Tailwind tokens

Mapped in `src/styles.css` under `:root` (dark-only):

- `--background` → near-black green tint
- `--foreground` → `--ink`
- `--primary` → neon green
- `--primary-foreground` → near-black
- `--muted` / `--muted-foreground` → dark surface + soft green-gray text
- `--border` / `--input` / `--ring` → green-tinted dark borders and focus ring

## Typography

| Role | Font | Weight |
|------|------|--------|
| Display / headings | **Space Grotesk** | 600–700 |
| Body / UI | **Manrope** | 400–700 |

- Display titles use `.display-title` (Space Grotesk).
- Kickers use `.island-kicker` — uppercase, letter-spaced, neon green.
- Code blocks: dark panel (`#0a140a`) with neon-tinted text.

## Layout

- **Max content width**: `1080px` via `.page-wrap`
- **Page padding**: `2rem` horizontal minimum
- **Border radius**: `0.625rem` base (`--radius`)

## Components

### `.island-shell`

Primary container — dark glass panel with neon border and green glow shadow.

### `.feature-card`

Interactive card — lifts on hover with brighter neon border.

### `.nav-link`

Navigation link with neon green underline animation on hover/active.

### `.rise-in`

Entry animation — fade + 12px rise, 700ms ease.

## Background

The page body uses layered radial gradients:

1. Top-left neon glow (`--hero-a`)
2. Top-right secondary glow (`--hero-b`)
3. Bottom-center subtle green wash
4. Dark base gradient from `--bg-elevated` to `--bg-base`

A fixed grid overlay (`body::after`) adds a subtle tech texture, masked to fade at edges.

## Interactive States

| State | Treatment |
|-------|-----------|
| Hover | Brighter neon (`--neon-bright`), slight lift on cards |
| Focus | `--ring` neon green at 50% opacity |
| Active nav | Full neon underline, `--ink` text |
| Links | `--neon-deep` with green underline; hover → `--neon` |

## Do / Don't

**Do**

- Use `text-primary`, `bg-background`, `border-border` Tailwind tokens
- Add `class="dark"` on `<html>` for shadcn compatibility
- Use neon glow on primary buttons and hero elements

**Don't**

- Add a light theme or theme toggle
- Use non-green accent colors for UI chrome
- Use pure `#ffffff` for body text
- Mix in the old lagoon/teal palette

## File Reference

| File | Purpose |
|------|---------|
| `src/styles.css` | CSS variables, global styles, utility classes |
| `src/routes/__root.tsx` | `dark` class on `<html>`, meta theme-color |
| `components.json` | shadcn config (`baseColor: zinc`, cssVariables) |
