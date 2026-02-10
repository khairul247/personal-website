# Face Looker

An interactive face widget that follows your cursor using plain HTML, CSS, and JavaScript. No frameworks, no dependencies, no build step required.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Project Structure](#project-structure)
- [Quick Start](#quick-start)
- [How It Works](#how-it-works)
- [Configuration](#configuration)
- [Customization](#customization)
- [API Reference](#api-reference)
- [Browser Support](#browser-support)
- [License](#license)

---

## Overview

Face Looker is a lightweight vanilla JavaScript widget that creates an interactive face which appears to follow the user's cursor. It works by dynamically swapping between a grid of pre-generated face images based on pointer position.

The project is designed to be:
- **Zero dependency** - No npm packages or external libraries
- **Framework agnostic** - Pure vanilla JavaScript
- **No build step** - Just open in a browser and it works

---

## Features

- Interactive cursor-following face animation
- Mouse and touch event support (works on mobile)
- Multiple independent face instances on a single page
- Debug overlay mode for development
- Responsive design with CSS customization
- Lightweight (~3KB total JS + CSS)
- MIT licensed for personal and commercial use

---

## Project Structure

```
face_looker/
├── index.html          # Main HTML entry point
├── face-tracker.js     # Core JavaScript logic (89 lines)
├── FaceTracker.css     # Styling and animations
├── faces/              # Pre-generated face images
│   ├── index.csv       # Image metadata
│   └── gaze_px*_py*_256.webp  # 121 face images
├── README.md           # This documentation
└── LICENSE             # MIT License
```

### File Descriptions

| File | Purpose |
|------|---------|
| `index.html` | Entry point with demo container and script loading |
| `face-tracker.js` | Core logic for coordinate mapping and image selection |
| `FaceTracker.css` | Styles for the tracker container, image, debug overlay, and error states |
| `faces/` | Directory containing 121 WebP images representing different gaze directions |

---

## Quick Start

### 1. Prepare Face Images

Place your gaze images in a `faces/` folder using this naming pattern:

```
gaze_px{X}_py{Y}_{SIZE}.webp
```

**Default parameters expected by the script:**
- `P_MIN = -15` (minimum coordinate)
- `P_MAX = 15` (maximum coordinate)
- `STEP = 3` (grid step size: -15, -12, -9, ..., 0, 3, 6, ..., 15)
- `SIZE = 256` (image dimensions in filename)

**Example filenames:**
| Filename | Gaze Direction |
|----------|----------------|
| `gaze_px0p0_py0p0_256.webp` | Center (looking straight) |
| `gaze_px15p0_py0p0_256.webp` | Right |
| `gaze_pxm15p0_py0p0_256.webp` | Left |
| `gaze_px0p0_py15p0_256.webp` | Down |
| `gaze_px0p0_pym15p0_256.webp` | Up |

**Naming convention:**
- Negative numbers use `m` prefix (e.g., `-15` becomes `m15`)
- Decimal points use `p` (e.g., `0.0` becomes `0p0`)

### 2. Open in Browser

Open `index.html` directly in a browser or serve the folder with any static server:

```bash
# Python 3
python -m http.server 8000

# Node.js (with npx)
npx serve .

# PHP
php -S localhost:8000
```

### 3. Move Your Cursor

That's it! Move your cursor around the page and watch the face follow.

---

## How It Works

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        User Input                               │
│              (mousemove / touchmove events)                     │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Event Handlers                               │
│         handleMouseMove() / handleTouchMove()                   │
│              Extract clientX, clientY                           │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                    setFromClient()                              │
│                                                                 │
│  1. Get container bounds (getBoundingClientRect)                │
│  2. Calculate center point of container                         │
│  3. Convert client coords to normalized [-1, 1] range           │
│  4. Clamp values to valid bounds                                │
│  5. Quantize to nearest grid point                              │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                   gridToFilename()                              │
│                                                                 │
│  Convert grid coordinates (px, py) to filename:                 │
│  gaze_px{sanitized_x}_py{sanitized_y}_256.webp                  │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Update DOM                                   │
│                                                                 │
│  img.src = basePath + filename                                  │
│  (Browser loads and displays new face image)                    │
└─────────────────────────────────────────────────────────────────┘
```

### Coordinate Mapping

The system converts pointer position through several transformations:

#### Step 1: Screen to Normalized Coordinates

```javascript
// Get container center
const centerX = rect.left + rect.width / 2;
const centerY = rect.top + rect.height / 2;

// Convert to normalized [-1, 1] range
const nx = (clientX - centerX) / (rect.width / 2);
const ny = (centerY - clientY) / (rect.height / 2);  // Y is inverted
```

- Moving right → positive X
- Moving left → negative X
- Moving up → positive Y (note: screen Y is inverted)
- Moving down → negative Y

#### Step 2: Quantize to Grid

```javascript
function quantizeToGrid(val) {
  // Map [-1, 1] to [-15, 15]
  const raw = P_MIN + (val + 1) * (P_MAX - P_MIN) / 2;

  // Snap to nearest grid point (multiples of STEP=3)
  const snapped = Math.round(raw / STEP) * STEP;

  // Clamp to valid range
  return clamp(snapped, P_MIN, P_MAX);
}
```

**Example mapping:**
| Normalized Value | Raw Value | Snapped Grid Point |
|------------------|-----------|-------------------|
| -1.0 | -15.0 | -15 |
| -0.5 | -7.5 | -6 |
| 0.0 | 0.0 | 0 |
| 0.5 | 7.5 | 9 |
| 1.0 | 15.0 | 15 |

#### Step 3: Generate Filename

```javascript
function sanitize(val) {
  const str = Number(val).toFixed(1);  // e.g., 0 → "0.0"
  return str.replace('-', 'm').replace('.', 'p');  // "0.0" → "0p0"
}

function gridToFilename(px, py) {
  return `gaze_px${sanitize(px)}_py${sanitize(py)}_${SIZE}.webp`;
}
```

### Image Grid

The project uses a grid of **121 images** (11 x 11):

```
Y (py)
  15  ┌───┬───┬───┬───┬───┬───┬───┬───┬───┬───┬───┐
      │   │   │   │   │   │   │   │   │   │   │   │
  12  ├───┼───┼───┼───┼───┼───┼───┼───┼───┼───┼───┤
      │   │   │   │   │   │   │   │   │   │   │   │
   9  ├───┼───┼───┼───┼───┼───┼───┼───┼───┼───┼───┤
      │   │   │   │   │   │   │   │   │   │   │   │
   6  ├───┼───┼───┼───┼───┼───┼───┼───┼───┼───┼───┤
      │   │   │   │   │   │   │   │   │   │   │   │
   3  ├───┼───┼───┼───┼───┼───┼───┼───┼───┼───┼───┤
      │   │   │   │   │   │   │   │   │   │   │   │
   0  ├───┼───┼───┼───┼───┼───┼───┼───┼───┼───┼───┤
      │   │   │   │   │ ● │   │   │   │   │   │   │  ← Center (0,0)
  -3  ├───┼───┼───┼───┼───┼───┼───┼───┼───┼───┼───┤
      │   │   │   │   │   │   │   │   │   │   │   │
  -6  ├───┼───┼───┼───┼───┼───┼───┼───┼───┼───┼───┤
      │   │   │   │   │   │   │   │   │   │   │   │
  -9  ├───┼───┼───┼───┼───┼───┼───┼───┼───┼───┼───┤
      │   │   │   │   │   │   │   │   │   │   │   │
 -12  ├───┼───┼───┼───┼───┼───┼───┼───┼───┼───┼───┤
      │   │   │   │   │   │   │   │   │   │   │   │
 -15  └───┴───┴───┴───┴───┴───┴───┴───┴───┴───┴───┘
     -15 -12  -9  -6  -3   0   3   6   9  12  15   X (px)
```

Each cell represents one face image. Total: 11 × 11 = **121 unique gaze directions**.

---

## Configuration

### HTML Data Attributes

Configure the face tracker via data attributes on the `.face-tracker` element:

```html
<div class="face-tracker"
     data-base-path="faces/"
     data-debug="false">
</div>
```

| Attribute | Default | Description |
|-----------|---------|-------------|
| `data-base-path` | `/faces/` | Path to the directory containing face images |
| `data-debug` | `false` | Show debug overlay with coordinates and filename |

### JavaScript Constants

If your generated images use different parameters, update these constants in `face-tracker.js`:

```javascript
const P_MIN = -15;   // Minimum grid coordinate
const P_MAX = 15;    // Maximum grid coordinate
const STEP = 3;      // Grid step size
const SIZE = 256;    // Image size (used in filename)
```

### Multiple Instances

Support multiple independent face trackers on the same page:

```html
<div class="face-tracker" data-base-path="faces/face1/"></div>
<div class="face-tracker" data-base-path="faces/face2/"></div>
<div class="face-tracker" data-base-path="faces/face3/"></div>
```

Each instance tracks the cursor independently and can use different face image sets.

---

## Customization

### CSS Classes

| Class | Description |
|-------|-------------|
| `.face-tracker` | Main container element |
| `.face-image` | The img element displaying the current face |
| `.face-debug` | Debug overlay (when enabled) |
| `.face-loading` | Loading indicator (unused by default) |
| `.face-tracker-error` | Error state styling |

### Styling Examples

**Change container size:**
```css
.face-tracker {
  width: 300px;
  height: 300px;
  min-height: auto;
}
```

**Add border and shadow:**
```css
.face-tracker {
  border: 2px solid #333;
  border-radius: 50%;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}
```

**Circular face:**
```css
.face-tracker {
  border-radius: 50%;
  overflow: hidden;
}
```

**Custom background:**
```css
.face-tracker {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
```

---

## API Reference

### Functions

#### `initializeFaceTracker(container)`

Initializes a face tracker on a DOM element.

**Parameters:**
- `container` (HTMLElement): A DOM element with class `face-tracker`

**Behavior:**
1. Creates an `<img>` element for displaying face images
2. Sets up mouse and touch event listeners on `window`
3. Optionally creates a debug overlay
4. Initializes face to center position

#### `clamp(value, min, max)`

Constrains a value within a range.

**Parameters:**
- `value` (number): The value to clamp
- `min` (number): Minimum bound
- `max` (number): Maximum bound

**Returns:** number

#### `quantizeToGrid(val)`

Converts a normalized coordinate [-1, 1] to a grid point.

**Parameters:**
- `val` (number): Normalized coordinate in range [-1, 1]

**Returns:** number (grid coordinate, e.g., -15, -12, ..., 0, ..., 12, 15)

#### `sanitize(val)`

Converts a number to filename-safe format.

**Parameters:**
- `val` (number): Grid coordinate

**Returns:** string (e.g., `-15` → `"m15p0"`, `0` → `"0p0"`)

#### `gridToFilename(px, py)`

Generates filename from grid coordinates.

**Parameters:**
- `px` (number): X grid coordinate
- `py` (number): Y grid coordinate

**Returns:** string (e.g., `"gaze_px0p0_py0p0_256.webp"`)

---

## Browser Support

| Browser | Supported |
|---------|-----------|
| Chrome 32+ | Yes |
| Firefox 65+ | Yes |
| Safari 14+ | Yes |
| Edge 18+ | Yes |
| IE 11 | No (no WebP support) |

**Requirements:**
- WebP image format support
- ES6 JavaScript (arrow functions, template literals, const/let)
- Standard DOM APIs

---

## Generating Face Images

The face images need to be generated separately. They should be:

- **Format:** WebP (for optimal compression)
- **Size:** 256×256 pixels (or update `SIZE` constant)
- **Grid:** 11×11 = 121 images covering all gaze directions
- **Naming:** Follow the `gaze_px{X}_py{Y}_{SIZE}.webp` pattern

You can generate these images using:
- 3D rendering software (Blender, Unity, etc.)
- AI image generation
- Photo compositing
- Any tool that can produce consistent gaze directions

---

## Performance Considerations

- **Total image payload:** ~1.1 MB (121 images × ~9KB each)
- **Images are loaded on demand** (no preloading by default)
- **Browser caching:** Images are cached after first load
- **Smooth transitions:** 0.1s opacity transition on image changes

For better performance:
- Use aggressive caching headers on your server
- Consider preloading images for faster initial response
- WebP format provides ~25-30% smaller files than PNG

---

## License

MIT License - Use freely in personal and commercial projects.

See [LICENSE](LICENSE) for full details.
