# Face Looker - Project Summary

## Overview

An interactive face widget that follows the user's cursor, with a portfolio scatter section that animates on scroll. Built with Next.js and React. Features hand-drawn effects using rough-notation.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animation**: rough-notation (hand-drawn effects), CSS keyframes

## Project Structure

```
face_looker/
├── app/
│   ├── globals.css         # Global styles + Tailwind + animations
│   ├── layout.tsx          # Root layout with metadata
│   └── page.tsx            # Main page (hero + scatter sections)
├── components/
│   ├── FaceTracker.tsx     # Face tracking component
│   ├── Navigation.tsx      # Nav buttons with rough-notation
│   ├── RoughNotation.tsx   # React wrapper for rough-notation
│   └── ScatterSection.tsx  # Portfolio scatter animation
├── public/
│   ├── faces/              # 121 WebP face images
│   ├── background.webp     # Page background
│   └── portfolio1.png      # Portfolio card image
├── package.json
├── postcss.config.mjs
├── tsconfig.json
└── next.config.js
```

## Key Components

### FaceTracker (`components/FaceTracker.tsx`)

Displays a face that follows cursor movement.

**How it works:**
1. Listens to `mousemove` and `touchmove` events on window
2. Converts cursor position to normalized coordinates [-1, 1]
3. Quantizes to grid points (-15 to 15, step 3)
4. Generates filename and updates image src

**Props:**
- `basePath`: string (default: "/faces/")
- `debug`: boolean (default: false)
- `className`: string (optional)

**Grid configuration:**
```typescript
const P_MIN = -15    // Min coordinate
const P_MAX = 15     // Max coordinate
const STEP = 3       // Grid step
const SIZE = 256     // Image size
```

**Image naming pattern:**
```
gaze_px{X}_py{Y}_256.webp
```

### Navigation (`components/Navigation.tsx`)

Horizontal navigation buttons with hand-drawn circle effect on hover.

**Nav items:** Home, Portfolio, About, Contact

**Features:**
- Flex layout with responsive gap (24px)
- RoughCircle animation on hover (red #ff1900)
- Gochi Hand font styling

### ScatterSection (`components/ScatterSection.tsx`)

Portfolio section with scroll-based card scatter animation.

**Features:**
- 6 portfolio cards that start stacked at center
- Cards spread outward as user scrolls (30%-80% visibility range)
- Hover effects: z-index boost + giggle animation
- "Portfolio" text overlay with RoughHighlight on hover

**Card configuration:**
```typescript
const items = [
  { endX: -300, endY: -200, stackOffset: 0 },  // top-left
  { endX: 300, endY: -180, stackOffset: 2 },   // top-right
  { endX: -350, endY: 50, stackOffset: 4 },    // left
  { endX: 320, endY: 30, stackOffset: 6 },     // right
  { endX: -280, endY: 200, stackOffset: 8 },   // bottom-left
  { endX: 290, endY: 220, stackOffset: 10 },   // bottom-right
];
```

**Scroll animation logic:**
- `progress = 0`: Cards stacked (< 30% visible)
- `progress = 1`: Cards fully scattered (≥ 80% visible)
- Between: Linear interpolation

### RoughNotation (`components/RoughNotation.tsx`)

Generic React wrapper for rough-notation library with pre-built components.

**Available components:**
- `RoughCircle` - Circle around element
- `RoughHighlight` - Highlight/marker effect
- `RoughUnderline` - Underline beneath element
- `RoughBox` - Box around element
- `RoughStrikeThrough` - Line through text

**Common Props:**
- `show`: boolean - trigger animation
- `color`: string - annotation color
- `strokeWidth`: number (default: 2)
- `padding`: number (default: 8)
- `animationDuration`: number (default: 400)

---

## Page Layout

```
┌─────────────────────────────────────────┐
│  [Navigation Bar]                       │
│  Home | Portfolio | About | Contact     │
├─────────────────────────────────────────┤
│                                         │
│          [Face Tracker]                 │  ← Hero section
│           (follows cursor)              │
│                                         │
├─────────────────────────────────────────┤
│                                         │
│     [Stacked Portfolio Cards]           │  ← Scatter section
│           "Portfolio"                   │     Cards spread on scroll
│     (cards scatter on scroll)           │
│                                         │
└─────────────────────────────────────────┘
```

## CSS Animations

**Giggle Animation** (globals.css):
```css
@keyframes giggle {
  0%, 100% { transform: rotate(0deg); }
  25% { transform: rotate(-2deg); }
  75% { transform: rotate(2deg); }
}

.giggle {
  animation: giggle 0.3s ease-in-out infinite;
  transform-origin: center center;
}
```

## Styling Notes

- Background: Fixed `background.webp` covering full page
- Hero section: Centered with `mt-20`
- Face container: 253x253px white circle with shadow
- Nav gap: `gap-24`, margin `mt-16 md:mt-20`
- Portfolio cards: White with shadow, 16px padding, 300px image height

## Commands

```bash
npm install    # Install dependencies
npm run dev    # Start dev server (localhost:3000)
npm run build  # Production build
npm run start  # Start production server
```

## Dependencies

```json
{
  "next": "^16.1.6",
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "rough-notation": "^0.5.1",
  "tailwindcss": "^4.x"
}
```

## Image Assets

**Face Images:**
- Location: `public/faces/`
- Format: WebP, 256x256
- Total: 121 images (11×11 grid)
- Grid range: -15 to 15, step 3

**Other Assets:**
- `public/background.webp` - Page background
- `public/portfolio1.png` - Portfolio card image

## Development Notes

- All components use `'use client'` directive
- Face images must be in `public/faces/` for static serving
- The `debug` prop on FaceTracker shows mouse coords and filename
- Scroll animations use passive event listeners for performance
- Next.js Image component used for portfolio cards (optimized loading)
