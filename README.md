<div align="center">

# 層 Layers — Hand-Painted 2D Animation Studio

*"We paint the city one frame at a time."*

Interactive **Scrollytelling Cinema** and **3D Dual-Ring Showcase** portfolio for **Layers (層)** — an independent hand-painted 2D gouache animation studio.

[![React 19](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-7.0-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite 8](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)](https://vite.dev/)
[![Tailwind CSS 4](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Lenis](https://img.shields.io/badge/Lenis-Smooth_Scroll-FF5E5B)](https://lenis.darkroom.engineering/)

</div>

---

## Overview

**層 Layers** is an interactive web cinema experience celebrating traditional hand-painted 2D animation crafted on 240gsm cotton paper. The application guides visitors through two primary stages along a unified smooth-scroll track (`780vh`):

1. **Stage 1 — Scrollytelling 2D Hand-Painted Cinema (`00:01 – 00:07`)**: A scroll-driven journey across five urban chapters (*Clouds Opening*, *Autumn Avenue*, *Girl Looking Up*, *Facade Clouds*, and *Studio Window*), synchronizing scroll progress with multiplane visuals, timecode telemetry, and procedural gouache scenes.
2. **Stage 2 — 3D Dual-Ring Works Showcase (`00:08 – 00:10`)**: A lined-paper exhibition space presenting six studio works via an interactive **3D Dual-Ring Carousel** supporting infinite wheel turning, drag/pointer rotation, keyboard navigation, and velocity-based motion blur.

---

## Key Features

- **ASCII Cloud Preloader (`00:00`)**: An animated ASCII cloud opening sequence with cinema timecode readout and a replay option from the top HUD.
- **Persistent Cinema HUD Navigation**: Fixed top navigation bar displaying real-time telemetry (`Timecode`, `Location Label`, `Scene Code`), category filters (`Films`, `Clips`, `Brand films`), and direct access to studio drawers.
- **Scrollytelling Multiplane Stage**:
  - Driven by `Lenis` smooth scrolling and a unified `requestAnimationFrame` loop.
  - Combines pre-rendered frames/video playback with procedural gouache canvas rendering (`gouacheArtGenerator`).
- **3D Dual-Ring Works Carousel**:
  - Two synchronized 3D rings controllable via mouse wheel, drag interaction, or `ArrowLeft` / `ArrowRight` keys.
  - Displays project metadata including director, duration, paint beds, frame rate, and color palette.
- **Watch Film Lightbox & Paint Bed Inspector**:
  - Fullscreen film modal with a four-layer craft breakdown (**Sketch**, **Layout**, **Gouache**, **Composite**) and palette swatches.
- **Studio Editorial Drawers**:
  - Slide-out drawers for **About**, **Process** (4-step workflow from cork storyboard wall to 24 FPS multiplane composite), **Journal**, **Careers**, and **Start a Project**.

---

## Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Core Framework** | [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) |
| **Bundler & Dev Server** | [Vite 8](https://vite.dev/) (`@vitejs/plugin-react`) |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) (`@tailwindcss/vite`) |
| **Smooth Scrolling** | [Lenis](https://github.com/darkroomengineering/lenis) |
| **Animation & Icons** | [Motion](https://motion.dev/) + [Lucide React](https://lucide.dev/) |
| **Typography** | `Cormorant Garamond`, `Plus Jakarta Sans`, `JetBrains Mono` |
| **AI & Asset Tooling** | `@google/genai`, `sharp` |

---

## Project Structure

```text
layers-—-hand-painted-2d-animation-studio/
├── public/
│   └── assets/
│       ├── aistudio/                 # Source demo video for scrollytelling
│       ├── frames/                   # Extracted frames for scrubbing
│       ├── generated/                # Generated gouache scenes & card previews
│       └── seq/                      # Image sequences
├── scripts/
│   ├── generateMasterArtworks.mjs    # Artwork generation script using Gemini API
│   ├── renderPureGouacheScenes.mjs   # Gouache scene rendering script
│   └── synthesizeGouacheMasterpieces.mjs
├── src/
│   ├── components/
│   │   ├── AsciiPreloader.tsx        # ASCII cloud preloader (00:00)
│   │   ├── CinemaHeaderHud.tsx       # Persistent navigation & telemetry HUD
│   │   ├── ScrollyCinemaStage.tsx    # Stage 1 scrollytelling cinema viewport
│   │   ├── DualRingWorks.tsx         # Stage 2 3D dual-ring works showcase
│   │   ├── FilmLightboxModal.tsx     # Fullscreen film & paint bed inspector modal
│   │   └── StudioDrawers.tsx         # Editorial drawers (About, Process, Journal, Careers)
│   ├── data/
│   │   └── studioData.ts             # Chapters, studio works, process steps & journal data
│   ├── utils/
│   │   └── gouacheArtGenerator.ts    # Procedural gouache canvas generator
│   ├── App.tsx                       # Lenis scroll orchestration, stage & modal state
│   ├── index.css                     # Global styles and typography setup
│   └── main.tsx                      # React application entry point
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## Getting Started

### 1. Prerequisites

- **Node.js** `>= 18.x` (or **Bun**)
- **npm** / **pnpm** / **bun**

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Variables (Optional)

Create a `.env.local` file from `.env.example` if you intend to run the Gemini API asset generation scripts:

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

### 4. Run Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

### 5. Build for Production

```bash
# Type-check with TypeScript
npm run lint

# Build production bundle into dist/
npm run build

# Preview production build
npm run preview
```

---

## Available Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts the Vite development server on port `3000` (`--host=0.0.0.0`) |
| `npm run build` | Builds the optimized production bundle into `dist/` |
| `npm run preview` | Serves the production build locally for preview |
| `npm run lint` | Runs TypeScript type-checking (`tsc --noEmit`) |
| `npm run clean` | Removes `dist` and `server.js` |

---

## Featured Studio Works

1. **Upstairs** *(Short film · 7:40 · 2025)* — Directed by Haruka Sato & Kenji Mori (`4 Gouache Multiplane Beds`)
2. **Paper Weather** *(Short film · 6:15 · 2025)* — Directed by Aoi Takahashi (`5 Cloud Cel & Paper Beds`)
3. **Last Tram** *(Short film · 9:10 · 2024)* — Directed by Renjiro Kurosawa (`4 Paint Beds · Gouache`)
4. **Red Canopy** *(Music film · 3:52 · 2025)* — Directed by Haruka Sato (`3 Cel + 2 Gouache Beds`)
5. **Quiet Facade** *(Brand film · 2:15 · 2025)* — Directed by Kenji Mori (`4 Paint Beds · Poster Color`)
6. **Autumn Draft** *(Brand film · 4:05 · 2024)* — Directed by Aoi Takahashi (`4 Paint Beds · Gouache`)

---

## License

Licensed under the **Apache-2.0** License.
