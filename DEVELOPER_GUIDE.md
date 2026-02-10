# Developer Guide: Building Face Looker from Scratch

This guide walks you through building the Face Looker widget from zero. By the end, you'll understand every line of code and be able to customize or extend it.

---

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Project Setup](#2-project-setup)
3. [Understanding the Concept](#3-understanding-the-concept)
4. [Step 1: Generate Face Images](#4-step-1-generate-face-images)
5. [Step 2: Create the HTML Structure](#5-step-2-create-the-html-structure)
6. [Step 3: Write the CSS Styles](#6-step-3-write-the-css-styles)
7. [Step 4: Build the JavaScript Logic](#7-step-4-build-the-javascript-logic)
8. [Step 5: Testing and Debugging](#8-step-5-testing-and-debugging)
9. [Step 6: Optimization](#9-step-6-optimization)
10. [Common Issues and Solutions](#10-common-issues-and-solutions)

---

## 1. Prerequisites

### Knowledge Required

- Basic HTML5 (elements, attributes, data attributes)
- CSS3 (positioning, flexbox, transitions)
- JavaScript ES6 (functions, DOM manipulation, events)

### Tools Needed

- A text editor (VS Code, Sublime, etc.)
- A web browser (Chrome, Firefox, Safari)
- A local web server (optional but recommended)
- Image generation tool (Blender, AI tools, or image editor)

### No Build Tools Required

This project intentionally avoids:
- Node.js / npm
- Bundlers (Webpack, Vite, etc.)
- Transpilers (Babel)
- Frameworks (React, Vue, etc.)

---

## 2. Project Setup

### Create the Directory Structure

```bash
mkdir face_looker
cd face_looker

# Create files
touch index.html
touch face-tracker.js
touch FaceTracker.css

# Create faces directory
mkdir faces
```

### Final Structure

```
face_looker/
├── index.html          # Entry point
├── face-tracker.js     # Core logic
├── FaceTracker.css     # Styles
└── faces/              # Image assets
    └── (121 WebP images)
```

---

## 3. Understanding the Concept

### The Core Idea

The face tracker creates an illusion of a face following your cursor by:

1. **Tracking** the mouse/touch position on the screen
2. **Mapping** that position to a coordinate system
3. **Selecting** the appropriate pre-rendered face image
4. **Displaying** that image instantly

### Why Pre-rendered Images?

Real-time 3D rendering in the browser is:
- Computationally expensive
- Requires WebGL knowledge
- May not work on all devices

Pre-rendered images are:
- Instant to display
- Work everywhere
- Predictable file sizes
- Easy to customize (just swap images)

### The Coordinate System

We use a 2D grid where:
- **X-axis**: Horizontal gaze direction (-15 = left, +15 = right)
- **Y-axis**: Vertical gaze direction (-15 = down, +15 = up)
- **Step size**: 3 (giving us values: -15, -12, -9, -6, -3, 0, 3, 6, 9, 12, 15)

This creates an 11 × 11 grid = **121 unique gaze directions**.

```
                    Looking Up (+Y)
                         │
                         │
    Looking Left (-X) ───┼─── Looking Right (+X)
                         │
                         │
                    Looking Down (-Y)
```

---

## 4. Step 1: Generate Face Images

### Image Requirements

| Property | Value |
|----------|-------|
| Format | WebP (recommended) or PNG |
| Dimensions | 256 × 256 pixels |
| Total Count | 121 images (11 × 11 grid) |
| Background | Transparent or solid color |

### Naming Convention

Each image must follow this exact pattern:

```
gaze_px{X}_py{Y}_{SIZE}.webp
```

Where:
- `{X}` = X coordinate with `m` for negative, `p` for decimal point
- `{Y}` = Y coordinate with `m` for negative, `p` for decimal point
- `{SIZE}` = Image dimension (256)

### Naming Examples

| Gaze Direction | X | Y | Filename |
|----------------|---|---|----------|
| Center | 0 | 0 | `gaze_px0p0_py0p0_256.webp` |
| Right | 15 | 0 | `gaze_px15p0_py0p0_256.webp` |
| Left | -15 | 0 | `gaze_pxm15p0_py0p0_256.webp` |
| Up | 0 | 15 | `gaze_px0p0_py15p0_256.webp` |
| Down | 0 | -15 | `gaze_px0p0_pym15p0_256.webp` |
| Top-Right | 15 | 15 | `gaze_px15p0_py15p0_256.webp` |
| Bottom-Left | -15 | -15 | `gaze_pxm15p0_pym15p0_256.webp` |

### Generation Methods

#### Method A: 3D Software (Blender)

1. Create or import a 3D face model
2. Set up a camera at a fixed position
3. Write a script to rotate the eyes/head for each grid position
4. Render 121 frames with transparent background
5. Export as WebP

```python
# Blender Python snippet (conceptual)
import bpy

P_MIN, P_MAX, STEP = -15, 15, 3

for x in range(P_MIN, P_MAX + 1, STEP):
    for y in range(P_MIN, P_MAX + 1, STEP):
        # Rotate eyes to look at (x, y)
        set_eye_rotation(x, y)

        # Render frame
        filename = generate_filename(x, y)
        bpy.context.scene.render.filepath = f"//faces/{filename}"
        bpy.ops.render.render(write_still=True)
```

#### Method B: AI Image Generation

1. Use a consistent base prompt for a face
2. Add gaze direction modifiers ("looking left", "looking up-right", etc.)
3. Generate 121 variations
4. Post-process for consistency
5. Rename files to match convention

#### Method C: Photo Manipulation

1. Take a photo of a face looking center
2. Use Photoshop/GIMP to manually adjust eyes for each direction
3. Export each variation
4. This is tedious but gives full control

### File Generation Script

Create a helper script to generate all required filenames:

```javascript
// generate-filenames.js
const P_MIN = -15;
const P_MAX = 15;
const STEP = 3;
const SIZE = 256;

function sanitize(val) {
  return Number(val).toFixed(1).replace('-', 'm').replace('.', 'p');
}

const filenames = [];
for (let x = P_MIN; x <= P_MAX; x += STEP) {
  for (let y = P_MIN; y <= P_MAX; y += STEP) {
    filenames.push(`gaze_px${sanitize(x)}_py${sanitize(y)}_${SIZE}.webp`);
  }
}

console.log(`Total files needed: ${filenames.length}`);
console.log(filenames.join('\n'));
```

Run with: `node generate-filenames.js`

---

## 5. Step 2: Create the HTML Structure

### Basic HTML Template

Create `index.html`:

```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Face Looker</title>
  <link rel="stylesheet" href="./FaceTracker.css">
</head>
<body>
  <!-- Face tracker container -->
  <div class="face-tracker"
       id="face"
       data-base-path="faces/"
       data-debug="false">
  </div>

  <!-- Load script with defer to ensure DOM is ready -->
  <script src="./face-tracker.js" defer></script>
</body>
</html>
```

### Understanding Each Part

#### The DOCTYPE and HTML Tag

```html
<!doctype html>
<html lang="en">
```
- `<!doctype html>` - Tells the browser to use HTML5 standards mode
- `lang="en"` - Helps screen readers and search engines

#### The Meta Tags

```html
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
```
- `charset="utf-8"` - Ensures proper character encoding
- `viewport` - Makes the page responsive on mobile devices

#### The Face Tracker Element

```html
<div class="face-tracker"
     id="face"
     data-base-path="faces/"
     data-debug="false">
</div>
```

| Attribute | Purpose |
|-----------|---------|
| `class="face-tracker"` | CSS styling and JS selection |
| `id="face"` | Unique identifier (optional) |
| `data-base-path` | Tells JS where to find images |
| `data-debug` | Enables/disables debug overlay |

#### The Script Tag

```html
<script src="./face-tracker.js" defer></script>
```
- `defer` - Waits for HTML to parse before executing
- Alternative: Place script at end of `<body>`

### Adding Page Styling

Add inline styles for the demo page:

```html
<head>
  <!-- ... other head content ... -->
  <style>
    /* Reset and base styles */
    html, body {
      height: 100%;
      margin: 0;
    }

    /* Center the face on the page */
    body {
      display: flex;
      align-items: center;
      justify-content: center;
      background: #fafafa;
    }

    /* Control face container size */
    .container {
      width: 200px;
      height: 200px;
    }

    /* Instruction text */
    .header {
      position: fixed;
      top: 16px;
      left: 50%;
      transform: translateX(-50%);
      font-family: system-ui, sans-serif;
      color: #333;
    }
  </style>
</head>
```

Update the body:

```html
<body>
  <div class="header">Move your cursor around the face</div>
  <div class="container">
    <div class="face-tracker" id="face" data-base-path="faces/" data-debug="false"></div>
  </div>

  <script src="./face-tracker.js" defer></script>
</body>
```

---

## 6. Step 3: Write the CSS Styles

### Create `FaceTracker.css`

Build the stylesheet step by step:

#### Step 3.1: Base Container Styles

```css
.face-tracker {
  position: relative;      /* For positioning children */
  width: 100%;             /* Fill parent container */
  height: 100%;
  min-height: 300px;       /* Minimum usable size */
  background: transparent; /* Or any color you prefer */
  border-radius: 8px;      /* Rounded corners */
  overflow: hidden;        /* Clip content to bounds */
}
```

**Why `position: relative`?**
- Allows absolute positioning of child elements (debug overlay)
- Creates a positioning context

**Why `overflow: hidden`?**
- Prevents image from spilling outside rounded corners
- Clips any oversized content

#### Step 3.2: Image Element Styles

```css
.face-image {
  width: 100%;
  height: 100%;
  object-fit: contain;           /* Maintain aspect ratio */
  transition: opacity 0.1s ease-out; /* Smooth fade between images */
}
```

**Understanding `object-fit`:**
- `contain` - Image scales to fit, maintaining aspect ratio
- `cover` - Image fills container, may crop
- `fill` - Image stretches to fill (distorts aspect ratio)

**The transition property:**
- Creates a subtle fade when images swap
- 0.1s is fast enough to feel responsive
- `ease-out` feels natural (fast start, slow end)

#### Step 3.3: Loading State

```css
.face-loading {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%); /* Perfect centering */
  color: #666;
  font-size: 14px;
}
```

This centers a loading indicator. Not used by default, but available if you want to add one.

#### Step 3.4: Error State

```css
.face-tracker-error {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: #e74c3c;          /* Red text */
  background: #fdf2f2;     /* Light red background */
  border: 1px solid #f5c6cb;
  border-radius: 4px;
  padding: 20px;
}
```

Use this class when images fail to load or an error occurs.

#### Step 3.5: Debug Overlay

```css
.face-debug {
  position: absolute;      /* Position over the image */
  top: 10px;
  left: 10px;
  background: rgba(0, 0, 0, 0.8); /* Semi-transparent black */
  color: white;
  padding: 8px 12px;
  border-radius: 4px;
  font-family: monospace;  /* Fixed-width for coordinates */
  font-size: 12px;
  line-height: 1.4;
}
```

This overlay shows:
- Current mouse coordinates
- Current image filename

#### Step 3.6: Responsive Adjustments

```css
@media (max-width: 768px) {
  .face-tracker {
    min-height: 250px;     /* Smaller minimum on mobile */
  }
}
```

### Complete CSS File

```css
/* FaceTracker.css - Complete */

.face-tracker {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 300px;
  background: transparent;
  border-radius: 8px;
  overflow: hidden;
}

.face-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  transition: opacity 0.1s ease-out;
}

.face-loading {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: #666;
  font-size: 14px;
}

.face-tracker-error {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: #e74c3c;
  background: #fdf2f2;
  border: 1px solid #f5c6cb;
  border-radius: 4px;
  padding: 20px;
}

.face-debug {
  position: absolute;
  top: 10px;
  left: 10px;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 8px 12px;
  border-radius: 4px;
  font-family: monospace;
  font-size: 12px;
  line-height: 1.4;
}

@media (max-width: 768px) {
  .face-tracker {
    min-height: 250px;
  }
}
```

---

## 7. Step 4: Build the JavaScript Logic

### Overview

The JavaScript needs to:
1. Initialize when the DOM is ready
2. Listen for mouse/touch events
3. Convert screen coordinates to grid coordinates
4. Generate the correct filename
5. Update the displayed image

### Step 4.1: Define Constants

```javascript
// Grid configuration - must match your generated images
const P_MIN = -15;    // Minimum grid coordinate
const P_MAX = 15;     // Maximum grid coordinate
const STEP = 3;       // Grid step size
const SIZE = 256;     // Image size (used in filename)
```

**Why these values?**
- Range of -15 to 15 gives good coverage of gaze angles
- Step of 3 creates 11 values per axis (manageable number of images)
- 256px is a good balance of quality and file size

### Step 4.2: Utility Functions

#### The `clamp` Function

```javascript
function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}
```

**Purpose:** Constrain a value within bounds.

**How it works:**
```
clamp(25, 0, 10)  → 10  (25 is above max, return max)
clamp(-5, 0, 10)  → 0   (-5 is below min, return min)
clamp(5, 0, 10)   → 5   (5 is within range, return as-is)
```

**Step-by-step:**
1. `Math.min(max, value)` - Returns the smaller of value and max
2. `Math.max(min, result)` - Returns the larger of min and result

#### The `quantizeToGrid` Function

```javascript
function quantizeToGrid(val) {
  // Step 1: Map [-1, 1] to [-15, 15]
  const raw = P_MIN + (val + 1) * (P_MAX - P_MIN) / 2;

  // Step 2: Snap to nearest grid point
  const snapped = Math.round(raw / STEP) * STEP;

  // Step 3: Ensure result is within bounds
  return clamp(snapped, P_MIN, P_MAX);
}
```

**Purpose:** Convert a normalized coordinate (-1 to 1) to a grid point.

**Detailed breakdown:**

**Step 1: Linear interpolation**
```javascript
const raw = P_MIN + (val + 1) * (P_MAX - P_MIN) / 2;
```

| Input `val` | `val + 1` | `(val + 1) * 30 / 2` | `P_MIN + result` | Output |
|-------------|-----------|----------------------|------------------|--------|
| -1.0 | 0.0 | 0.0 | -15 + 0 | -15.0 |
| -0.5 | 0.5 | 7.5 | -15 + 7.5 | -7.5 |
| 0.0 | 1.0 | 15.0 | -15 + 15 | 0.0 |
| 0.5 | 1.5 | 22.5 | -15 + 22.5 | 7.5 |
| 1.0 | 2.0 | 30.0 | -15 + 30 | 15.0 |

**Step 2: Snap to grid**
```javascript
const snapped = Math.round(raw / STEP) * STEP;
```

| `raw` | `raw / 3` | `round(...)` | `× 3` | Output |
|-------|-----------|--------------|-------|--------|
| -7.5 | -2.5 | -2 | -6 | -6 |
| 7.5 | 2.5 | 2 | 6 | 6 |
| 4.2 | 1.4 | 1 | 3 | 3 |

#### The `sanitize` Function

```javascript
function sanitize(val) {
  const str = Number(val).toFixed(1);  // Ensure one decimal place
  return str.replace('-', 'm').replace('.', 'p');
}
```

**Purpose:** Convert a number to a filename-safe string.

**Why is this needed?**
- Filenames can't contain `-` in some systems
- `.` could be confusing (looks like file extension)

**Examples:**
| Input | `.toFixed(1)` | Replace `-` | Replace `.` | Output |
|-------|---------------|-------------|-------------|--------|
| 0 | "0.0" | "0.0" | "0p0" | "0p0" |
| 15 | "15.0" | "15.0" | "15p0" | "15p0" |
| -15 | "-15.0" | "m15.0" | "m15p0" | "m15p0" |
| -6 | "-6.0" | "m6.0" | "m6p0" | "m6p0" |

#### The `gridToFilename` Function

```javascript
function gridToFilename(px, py) {
  return `gaze_px${sanitize(px)}_py${sanitize(py)}_${SIZE}.webp`;
}
```

**Purpose:** Generate the image filename from grid coordinates.

**Examples:**
| px | py | Output |
|----|-----|--------|
| 0 | 0 | `gaze_px0p0_py0p0_256.webp` |
| 15 | -15 | `gaze_px15p0_pym15p0_256.webp` |
| -6 | 9 | `gaze_pxm6p0_py9p0_256.webp` |

### Step 4.3: Debug Function

```javascript
function updateDebug(debugEl, x, y, filename) {
  if (!debugEl) return;  // Do nothing if debug is disabled
  debugEl.innerHTML = `Mouse: (${Math.round(x)}, ${Math.round(y)})<br/>Image: ${filename}`;
}
```

**Purpose:** Update the debug overlay with current state.

### Step 4.4: Main Initialization Function

```javascript
function initializeFaceTracker(container) {
  // Read configuration from data attributes
  const basePath = container.dataset.basePath || '/faces/';
  const showDebug = String(container.dataset.debug || 'false') === 'true';

  // Create the image element
  const img = document.createElement('img');
  img.className = 'face-image';
  img.alt = 'Face following gaze';
  container.appendChild(img);

  // Create debug overlay if enabled
  let debugEl = null;
  if (showDebug) {
    debugEl = document.createElement('div');
    debugEl.className = 'face-debug';
    container.appendChild(debugEl);
  }

  // ... event handlers defined here (see below)

  // Initialize at center
  const rect = container.getBoundingClientRect();
  setFromClient(rect.left + rect.width / 2, rect.top + rect.height / 2);
}
```

**Breakdown:**

**Reading data attributes:**
```javascript
const basePath = container.dataset.basePath || '/faces/';
```
- `container.dataset.basePath` reads `data-base-path` attribute
- `|| '/faces/'` provides a default if not specified

**Creating DOM elements:**
```javascript
const img = document.createElement('img');
img.className = 'face-image';
container.appendChild(img);
```
- Creates a new `<img>` element
- Adds the CSS class
- Inserts it into the container

### Step 4.5: Coordinate Processing

Inside `initializeFaceTracker`, add:

```javascript
function setFromClient(clientX, clientY) {
  // Get container's position and size
  const rect = container.getBoundingClientRect();

  // Calculate center point
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;

  // Convert to normalized coordinates [-1, 1]
  // X: positive = right, negative = left
  const nx = (clientX - centerX) / (rect.width / 2);

  // Y: positive = up, negative = down (inverted from screen coords)
  const ny = (centerY - clientY) / (rect.height / 2);

  // Clamp to valid range
  const clampedX = clamp(nx, -1, 1);
  const clampedY = clamp(ny, -1, 1);

  // Convert to grid coordinates
  const px = quantizeToGrid(clampedX);
  const py = quantizeToGrid(clampedY);

  // Generate filename and update image
  const filename = gridToFilename(px, py);
  const imagePath = `${basePath}${filename}`;
  img.src = imagePath;

  // Update debug if enabled
  updateDebug(debugEl, clientX - rect.left, clientY - rect.top, filename);
}
```

**Understanding `getBoundingClientRect()`:**

```javascript
const rect = container.getBoundingClientRect();
// Returns: { top, right, bottom, left, width, height, x, y }
```

This gives us the container's position relative to the viewport.

**Coordinate transformation explained:**

```
Screen Coordinates:          Normalized Coordinates:
(0,0)────────────►X         (-1,1)────────(1,1)
  │                            │            │
  │    ┌────────┐              │   ┌────┐   │
  │    │container│             │   │    │   │
  │    │   ●    │              │   │  ● │   │
  │    │ center │              │   │    │   │
  │    └────────┘              │   └────┘   │
  ▼                            │            │
  Y                         (-1,-1)───────(1,-1)
```

**Why invert Y?**
```javascript
const ny = (centerY - clientY) / (rect.height / 2);
//         ↑ subtract clientY from center, not vice versa
```
- Screen Y increases downward
- We want Y to increase upward (looking up = positive Y)

### Step 4.6: Event Handlers

```javascript
function handleMouseMove(e) {
  setFromClient(e.clientX, e.clientY);
}

function handleTouchMove(e) {
  if (e.touches && e.touches.length > 0) {
    const t = e.touches[0];
    setFromClient(t.clientX, t.clientY);
  }
}

// Attach to window (track anywhere on page)
window.addEventListener('mousemove', handleMouseMove);
window.addEventListener('touchmove', handleTouchMove, { passive: true });
```

**Why attach to `window`?**
- Allows tracking cursor anywhere on the page
- Not just when hovering over the face

**Why `{ passive: true }`?**
- Tells browser we won't call `preventDefault()`
- Improves scroll performance on touch devices

### Step 4.7: Auto-initialization

```javascript
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.face-tracker').forEach((el) => {
    initializeFaceTracker(el);
  });
});
```

**What this does:**
1. Waits for DOM to be fully loaded
2. Finds all elements with class `face-tracker`
3. Initializes each one

### Complete JavaScript File

```javascript
// face-tracker.js - Complete

// Grid configuration (must match your generated images)
const P_MIN = -15;
const P_MAX = 15;
const STEP = 3;
const SIZE = 256;

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function quantizeToGrid(val) {
  const raw = P_MIN + (val + 1) * (P_MAX - P_MIN) / 2;
  const snapped = Math.round(raw / STEP) * STEP;
  return clamp(snapped, P_MIN, P_MAX);
}

function sanitize(val) {
  const str = Number(val).toFixed(1);
  return str.replace('-', 'm').replace('.', 'p');
}

function gridToFilename(px, py) {
  return `gaze_px${sanitize(px)}_py${sanitize(py)}_${SIZE}.webp`;
}

function updateDebug(debugEl, x, y, filename) {
  if (!debugEl) return;
  debugEl.innerHTML = `Mouse: (${Math.round(x)}, ${Math.round(y)})<br/>Image: ${filename}`;
}

function initializeFaceTracker(container) {
  const basePath = container.dataset.basePath || '/faces/';
  const showDebug = String(container.dataset.debug || 'false') === 'true';

  const img = document.createElement('img');
  img.className = 'face-image';
  img.alt = 'Face following gaze';
  container.appendChild(img);

  let debugEl = null;
  if (showDebug) {
    debugEl = document.createElement('div');
    debugEl.className = 'face-debug';
    container.appendChild(debugEl);
  }

  function setFromClient(clientX, clientY) {
    const rect = container.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const nx = (clientX - centerX) / (rect.width / 2);
    const ny = (centerY - clientY) / (rect.height / 2);

    const clampedX = clamp(nx, -1, 1);
    const clampedY = clamp(ny, -1, 1);

    const px = quantizeToGrid(clampedX);
    const py = quantizeToGrid(clampedY);

    const filename = gridToFilename(px, py);
    const imagePath = `${basePath}${filename}`;
    img.src = imagePath;
    updateDebug(debugEl, clientX - rect.left, clientY - rect.top, filename);
  }

  function handleMouseMove(e) {
    setFromClient(e.clientX, e.clientY);
  }

  function handleTouchMove(e) {
    if (e.touches && e.touches.length > 0) {
      const t = e.touches[0];
      setFromClient(t.clientX, t.clientY);
    }
  }

  window.addEventListener('mousemove', handleMouseMove);
  window.addEventListener('touchmove', handleTouchMove, { passive: true });

  // Initialize at center
  const rect = container.getBoundingClientRect();
  setFromClient(rect.left + rect.width / 2, rect.top + rect.height / 2);
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.face-tracker').forEach((el) => initializeFaceTracker(el));
});
```

---

## 8. Step 5: Testing and Debugging

### Enable Debug Mode

In `index.html`, change:

```html
<div class="face-tracker" id="face" data-base-path="faces/" data-debug="true"></div>
```

This shows:
- Current mouse coordinates
- Current image filename being loaded

### Testing Checklist

| Test | Expected Result |
|------|-----------------|
| Move cursor to center | Image shows center gaze |
| Move cursor to right edge | Image shows rightward gaze |
| Move cursor to top edge | Image shows upward gaze |
| Move cursor outside container | Gaze stays at maximum angle |
| Touch on mobile | Same behavior as mouse |
| Resize window | Container and tracking adjust |

### Browser DevTools

1. **Network tab** - Verify images are loading
2. **Console** - Check for 404 errors (missing images)
3. **Elements** - Inspect the `<img>` src attribute

### Common Debug Scenarios

**Image not changing:**
- Check if `mousemove` events are firing (add `console.log`)
- Verify `setFromClient` is being called
- Check if `img.src` is being updated

**Wrong image loading:**
- Enable debug overlay
- Check filename generation
- Verify your images match expected naming

**Images not found (404):**
- Check `data-base-path` is correct
- Verify image files exist
- Check filename spelling (m vs -, p vs .)

---

## 9. Step 6: Optimization

### Image Preloading

Add preloading for smoother transitions:

```javascript
function preloadImages(basePath) {
  for (let x = P_MIN; x <= P_MAX; x += STEP) {
    for (let y = P_MIN; y <= P_MAX; y += STEP) {
      const img = new Image();
      img.src = `${basePath}${gridToFilename(x, y)}`;
    }
  }
}
```

Call after initialization:
```javascript
preloadImages(basePath);
```

### Throttling Events

For performance on slower devices:

```javascript
let lastUpdate = 0;
const THROTTLE_MS = 16; // ~60fps

function throttledSetFromClient(clientX, clientY) {
  const now = Date.now();
  if (now - lastUpdate < THROTTLE_MS) return;
  lastUpdate = now;
  setFromClient(clientX, clientY);
}
```

### Image Compression

Optimize your WebP images:
- Use lossy compression (quality 80-90%)
- Target ~5-15KB per image
- Total payload: ~0.6-1.8MB for 121 images

---

## 10. Common Issues and Solutions

### Issue: Images flicker or load slowly

**Cause:** Images loading on-demand

**Solution:** Preload images (see optimization section)

### Issue: Face doesn't track outside container

**Cause:** Events bound to container instead of window

**Solution:** Ensure event listeners are on `window`:
```javascript
window.addEventListener('mousemove', handleMouseMove);
```

### Issue: Y-axis is inverted

**Cause:** Forgot to invert Y coordinate

**Solution:** Use `(centerY - clientY)` not `(clientY - centerY)`

### Issue: Face snaps to wrong angles

**Cause:** Constants don't match image generation

**Solution:** Verify P_MIN, P_MAX, STEP match your images

### Issue: Touch doesn't work on mobile

**Cause:** Missing touch event handler

**Solution:** Add `touchmove` listener with `{ passive: true }`

### Issue: Multiple faces interfere with each other

**Cause:** Shared state between instances

**Solution:** Each instance should have its own closure (current code handles this)

---

## Summary

You've now built a complete face tracking widget from scratch:

1. **HTML** - Simple structure with data attributes for configuration
2. **CSS** - Responsive styling with states for loading/error/debug
3. **JavaScript** - Event handling, coordinate math, and image selection

The key concepts are:
- Normalizing coordinates to a -1 to 1 range
- Quantizing to a discrete grid
- Generating predictable filenames
- Swapping images based on position

From here, you can:
- Create different face styles
- Adjust the grid resolution
- Add animations or effects
- Integrate into larger projects

Happy coding!
