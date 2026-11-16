import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const OUT_DIR = path.resolve('public/assets/generated');
fs.mkdirSync(OUT_DIR, { recursive: true });

function createRng(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

/**
 * Generate organic gouache cloud cluster SVG paths & soft layered puffs
 */
function svgCloudBank(cx, cy, rx, ry, seed, lightCol = '#FAF8F5', midCol = '#DCE4F0', shadowCol = '#8FA5C2', opacity = 0.95) {
  const rng = createRng(seed);
  let out = `<g opacity="${opacity}">`;

  // Shadow base puffs
  for (let i = 0; i < 36; i++) {
    const a = rng() * Math.PI * 2;
    const d = Math.pow(rng(), 0.65) * 0.85;
    const px = (cx + Math.cos(a) * rx * d).toFixed(1);
    const py = (cy + Math.sin(a) * ry * d + ry * 0.16).toFixed(1);
    const r = ((0.22 + rng() * 0.36) * Math.min(rx, ry)).toFixed(1);
    out += `<circle cx="${px}" cy="${py}" r="${r}" fill="${i % 2 === 0 ? shadowCol : midCol}" opacity="${(0.35 + rng() * 0.35).toFixed(2)}" filter="url(#gouacheBlur)" />`;
  }

  // Sunlit billowing top domes
  for (let i = 0; i < 48; i++) {
    const a = rng() * Math.PI * 2;
    const d = Math.pow(rng(), 0.7) * 0.82;
    const px = (cx + Math.cos(a) * rx * d - rx * 0.06).toFixed(1);
    const py = (cy + Math.sin(a) * ry * d - ry * 0.08).toFixed(1);
    const r = ((0.18 + rng() * 0.34) * Math.min(rx, ry)).toFixed(1);
    out += `<circle cx="${px}" cy="${py}" r="${r}" fill="${lightCol}" opacity="${(0.45 + rng() * 0.45).toFixed(2)}" filter="url(#gouacheSoft)" />`;
  }

  out += `</g>`;
  return out;
}

/**
 * Generate hand-dabbed gouache autumn foliage cluster
 */
function svgFoliageCanopy(cx, cy, rx, ry, seed, palette = ['#5C1D0E', '#9A2E14', '#C8461C', '#E56B24', '#F29A2E', '#F8C846']) {
  const rng = createRng(seed);
  let out = `<g>`;
  const count = 95;
  for (let i = 0; i < count; i++) {
    const pIdx = Math.min(palette.length - 1, Math.floor((i / count) * palette.length));
    const a = rng() * Math.PI * 2;
    const d = Math.pow(rng(), 0.62);
    const sunShiftX = (pIdx / palette.length) * -rx * 0.16;
    const sunShiftY = (pIdx / palette.length) * -ry * 0.22;
    const px = (cx + Math.cos(a) * rx * d + sunShiftX).toFixed(1);
    const py = (cy + Math.sin(a) * ry * d + sunShiftY).toFixed(1);
    const w = (rx * (0.12 + rng() * 0.18)).toFixed(1);
    const h = (w * (0.58 + rng() * 0.32)).toFixed(1);
    const rot = ((rng() - 0.5) * 55).toFixed(1);
    out += `<ellipse cx="${px}" cy="${py}" rx="${w}" ry="${h}" fill="${palette[pIdx]}" opacity="${(0.78 + rng() * 0.2).toFixed(2)}" transform="rotate(${rot} ${px} ${py})" />`;
  }
  out += `</g>`;
  return out;
}

/**
 * Generate a 5-pointed autumn maple leaf SVG
 */
function svgMapleLeaf(cx, cy, size, rotDeg, color = '#E06024', opacity = 0.92) {
  const s = size;
  return `<g transform="translate(${cx.toFixed(1)}, ${cy.toFixed(1)}) rotate(${rotDeg.toFixed(1)}) scale(${(s / 20).toFixed(2)})" opacity="${opacity}">
    <path d="M 0,-22 L 4,-9 L 17,-14 L 10,-2 L 21,5 L 7,9 L 9,19 L 0,12 L -9,19 L -7,9 L -21,5 L -10,-2 L -17,-14 L -4,-9 Z" fill="${color}" />
  </g>`;
}

/**
 * Generate architectural building block with recessed windows and sunlit edge
 */
function svgBuilding(x, y, w, h, bodyCol, litCol, winDarkCol, winLitCol, cols, rows, seed, litSide = 'left') {
  const rng = createRng(seed);
  const edgeW = Math.max(6, w * 0.12);
  let out = `<g>`;
  out += `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${bodyCol}" />`;
  if (litSide === 'left') {
    out += `<rect x="${x}" y="${y}" width="${edgeW}" height="${h}" fill="${litCol}" opacity="0.85" />`;
  } else {
    out += `<rect x="${x + w - edgeW}" y="${y}" width="${edgeW}" height="${h}" fill="${litCol}" opacity="0.85" />`;
  }

  const padX = w * 0.12;
  const padY = 16;
  const cellW = (w - padX * 2) / cols;
  const cellH = (h - padY * 2) / rows;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (rng() > 0.12) {
        const wx = (x + padX + c * cellW + 2).toFixed(1);
        const wy = (y + padY + r * cellH + 2).toFixed(1);
        const ww = Math.max(2.5, cellW - 5).toFixed(1);
        const wh = Math.max(4, cellH - 6).toFixed(1);
        const col = rng() > 0.76 ? winLitCol : winDarkCol;
        const op = (0.35 + rng() * 0.55).toFixed(2);
        out += `<rect x="${wx}" y="${wy}" width="${ww}" height="${wh}" fill="${col}" opacity="${op}" />`;
      }
    }
  }
  out += `</g>`;
  return out;
}

/**
 * Shared SVG defs for gouache paper grain, soft brush blur, and horizontal paper scanlines
 */
function commonDefs(w, h) {
  return `<defs>
    <filter id="gouacheSoft" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="14" />
    </filter>
    <filter id="gouacheBlur" x="-25%" y="-25%" width="150%" height="150%">
      <feGaussianBlur stdDeviation="24" />
    </filter>
    <filter id="cloudVeil" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="36" />
    </filter>
    <pattern id="paperLines" width="20" height="5" patternUnits="userSpaceOnUse">
      <line x1="0" y1="4" x2="20" y2="4" stroke="#1E1B18" stroke-width="0.7" stroke-opacity="0.065" />
    </pattern>
    <radialGradient id="vignette" cx="50%" cy="50%" r="70%">
      <stop offset="55%" stop-color="#000000" stop-opacity="0" />
      <stop offset="100%" stop-color="#14110E" stop-opacity="0.26" />
    </radialGradient>
  </defs>`;
}

function paperOverlay(w, h) {
  return `<rect x="0" y="0" width="${w}" height="${h}" fill="url(#paperLines)" />
  <rect x="0" y="0" width="${w}" height="${h}" fill="url(#vignette)" />`;
}

// ============================================================================
// SCENE 1: CLOUDS OPENING (00:01)
// ============================================================================
function buildScene01Clouds(w = 1600, h = 1040) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">
    ${commonDefs(w, h)}
    <defs>
      <linearGradient id="sky01" x1="0" y1="0" x2="0.2" y2="1">
        <stop offset="0%" stop-color="#6989B5" />
        <stop offset="48%" stop-color="#8FAAD0" />
        <stop offset="100%" stop-color="#C8D6E8" />
      </linearGradient>
    </defs>
    <rect width="${w}" height="${h}" fill="url(#sky01)" />
    ${svgCloudBank(w * 0.72, h * 0.28, w * 0.36, h * 0.26, 11, '#FFFFFF', '#E6ECF5', '#9AB0CC')}
    ${svgCloudBank(w * 0.38, h * 0.48, w * 0.38, h * 0.28, 22, '#FAF9F6', '#DFE7F2', '#8C9FB9')}
    ${svgCloudBank(w * 0.78, h * 0.64, w * 0.42, h * 0.32, 33, '#FFFFFF', '#DCE4F0', '#8398B4')}
    ${svgCloudBank(w * 0.24, h * 0.78, w * 0.45, h * 0.28, 44, '#F5F4F0', '#CFD9E8', '#7589A6')}
    ${paperOverlay(w, h)}
  </svg>`;
}

// ============================================================================
// SCENE 2: AUTUMN AVENUE (00:02)
// ============================================================================
function buildScene02Avenue(w = 1600, h = 1040) {
  const rng = createRng(202);
  let leaves = '';
  for (let i = 0; i < 8; i++) {
    leaves += svgMapleLeaf(w * (0.18 + rng() * 0.68), h * (0.12 + rng() * 0.75), 14 + rng() * 14, rng() * 360, '#D95B24', 0.78);
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">
    ${commonDefs(w, h)}
    <defs>
      <linearGradient id="sky02" x1="0" y1="0" x2="0" y2="0.7">
        <stop offset="0%" stop-color="#5B7EA8" />
        <stop offset="55%" stop-color="#9EB7D0" />
        <stop offset="100%" stop-color="#F2CBA0" />
      </linearGradient>
      <linearGradient id="roadGrad" x1="0" y1="0.55" x2="0" y2="1">
        <stop offset="0%" stop-color="#4A5264" />
        <stop offset="100%" stop-color="#272D3A" />
      </linearGradient>
    </defs>
    <rect width="${w}" height="${h}" fill="url(#sky02)" />
    ${svgCloudBank(w * 0.5, h * 0.24, w * 0.35, h * 0.16, 201, '#FAF6F0', '#D8E2EE', '#9BB0C8', 0.75)}

    <!-- Distant Hazy Skyline -->
    ${svgBuilding(w * 0.41, h * 0.14, w * 0.055, h * 0.45, '#8A9FB8', '#B6C8DC', '#6D829B', '#DCE8F5', 4, 14, 1)}
    ${svgBuilding(w * 0.47, h * 0.19, w * 0.05, h * 0.40, '#96ABC2', '#C2D2E4', '#788DA6', '#E4EEF8', 4, 12, 2)}
    ${svgBuilding(w * 0.53, h * 0.11, w * 0.06, h * 0.48, '#7E94AE', '#B0C4D8', '#647A94', '#DCE8F5', 5, 16, 3)}
    ${svgBuilding(w * 0.35, h * 0.22, w * 0.055, h * 0.38, '#758CA6', '#A5BBD2', '#5A7089', '#D6E4F2', 4, 11, 4)}

    <!-- Left & Right Tall Glass Skyscrapers -->
    ${svgBuilding(w * 0.17, -20, w * 0.22, h * 0.78, '#364B68', '#6B88AC', '#26364D', '#8FB2D8', 8, 22, 10, 'right')}
    ${svgBuilding(w * 0.65, -20, w * 0.21, h * 0.80, '#2E4059', '#8AB0D6', '#1F2D40', '#7BA0C8', 8, 22, 11, 'left')}
    ${svgBuilding(w * 0.82, h * 0.04, w * 0.20, h * 0.82, '#253347', '#D98248', '#1A2433', '#6884A6', 7, 20, 12, 'left')}

    <!-- Central Perspective Road -->
    <polygon points="${w * 0.44},${h * 0.56} ${w * 0.56},${h * 0.56} ${w * 0.74},${h} ${w * 0.26},${h}" fill="url(#roadGrad)" />
    <!-- Golden Afternoon Sunlight Band Across Avenue -->
    <polygon points="${w * 0.38},${h * 0.72} ${w * 0.62},${h * 0.72} ${w * 0.66},${h * 0.83} ${w * 0.34},${h * 0.83}" fill="#F6C482" opacity="0.65" />
    <!-- Road Center Line -->
    <line x1="${w * 0.5}" y1="${h * 0.56}" x2="${w * 0.5}" y2="${h}" stroke="#E5A952" stroke-width="3" opacity="0.85" />
    <line x1="${w * 0.47}" y1="${h * 0.56}" x2="${w * 0.38}" y2="${h}" stroke="#DCE2EC" stroke-width="1.5" stroke-dasharray="12 14" opacity="0.45" />
    <line x1="${w * 0.53}" y1="${h * 0.56}" x2="${w * 0.62}" y2="${h}" stroke="#DCE2EC" stroke-width="1.5" stroke-dasharray="12 14" opacity="0.45" />

    <!-- Left Foreground Classical Stone Buildings -->
    ${svgBuilding(-20, h * 0.44, w * 0.33, h * 0.58, '#85776E', '#C9B5A4', '#3D3530', '#E6C299', 9, 10, 20, 'right')}
    ${svgBuilding(-10, h * 0.62, w * 0.23, h * 0.42, '#635852', '#B5A090', '#2E2825', '#DEC09E', 6, 7, 21, 'right')}

    <!-- Right Foreground Mansard Stone Building -->
    <polygon points="${w * 0.73},${h * 0.56} ${w * 0.78},${h * 0.47} ${w * 1.02},${h * 0.47} ${w * 1.02},${h * 0.56}" fill="#708E82" />
    ${svgBuilding(w * 0.73, h * 0.55, w * 0.29, h * 0.48, '#9C8C7E', '#DFCFC0', '#423A34', '#F2D2A9', 8, 8, 22, 'left')}

    <!-- Glowing Autumn Trees Lining Both Sides of the Avenue -->
    ${svgFoliageCanopy(w * 0.42, h * 0.57, w * 0.045, h * 0.055, 301)}
    ${svgFoliageCanopy(w * 0.58, h * 0.57, w * 0.045, h * 0.055, 302)}
    ${svgFoliageCanopy(w * 0.39, h * 0.65, w * 0.065, h * 0.075, 303)}
    ${svgFoliageCanopy(w * 0.61, h * 0.65, w * 0.065, h * 0.075, 304)}
    ${svgFoliageCanopy(w * 0.35, h * 0.76, w * 0.085, h * 0.095, 305)}
    ${svgFoliageCanopy(w * 0.65, h * 0.76, w * 0.085, h * 0.095, 306)}
    ${svgFoliageCanopy(w * 0.29, h * 0.91, w * 0.11, h * 0.12, 307)}
    ${svgFoliageCanopy(w * 0.70, h * 0.91, w * 0.11, h * 0.12, 308)}

    ${leaves}
    ${paperOverlay(w, h)}
  </svg>`;
}

// ============================================================================
// SCENE 3: GIRL LOOKING UP AT TERRACOTTA BUILDINGS (00:04)
// ============================================================================
function buildScene03Girl(w = 1600, h = 1040) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">
    ${commonDefs(w, h)}
    <defs>
      <linearGradient id="sky03" x1="0.2" y1="0" x2="0.8" y2="1">
        <stop offset="0%" stop-color="#5B7BA1" />
        <stop offset="55%" stop-color="#9EB6CE" />
        <stop offset="100%" stop-color="#E6BA8A" />
      </linearGradient>
    </defs>
    <rect width="${w}" height="${h}" fill="url(#sky03)" />
    ${svgCloudBank(w * 0.82, h * 0.24, w * 0.28, h * 0.22, 310, '#F7F3EB', '#CFDCEB', '#8CA2BC', 0.88)}

    <!-- Center-Top Towering High-Rise in Perspective -->
    <g transform="translate(${w * 0.50}, ${h * 0.36}) rotate(-10)">
      ${svgBuilding(-w * 0.11, -h * 0.45, w * 0.22, h * 0.95, '#9E7D64', '#DFC2A6', '#594335', '#F5C98E', 6, 20, 41, 'right')}
    </g>

    <!-- Right Dark Blue Glass Skyscraper & Midground Cream Building -->
    <g transform="translate(${w * 0.72}, ${h * 0.58}) rotate(-12)">
      ${svgBuilding(-w * 0.12, -h * 0.42, w * 0.24, h * 0.90, '#3C4A63', '#2980B9', '#252F42', '#7FB8E6', 6, 18, 42, 'left')}
      ${svgBuilding(-w * 0.16, -h * 0.12, w * 0.22, h * 0.65, '#C49A76', '#EDD1B4', '#6E513B', '#F7D7A8', 7, 14, 43, 'left')}
    </g>

    <!-- Left Dramatic Angled Terracotta Apartment Building -->
    <g transform="translate(${w * 0.18}, ${h * 0.52}) rotate(18)">
      ${svgBuilding(-w * 0.28, -h * 0.58, w * 0.52, h * 1.25, '#8A4229', '#D97236', '#472114', '#F5B066', 9, 18, 44, 'right')}
    </g>

    <!-- Autumn Maple Trees Overhanging Left & Center -->
    ${svgFoliageCanopy(w * 0.10, h * 0.66, w * 0.16, h * 0.22, 331)}
    ${svgFoliageCanopy(w * 0.44, h * 0.28, w * 0.08, h * 0.07, 332)}
    ${svgFoliageCanopy(w * 0.53, h * 0.52, w * 0.07, h * 0.07, 333)}

    <!-- Foreground Anime Girl Looking Up (Detailed Multi-Layer Illustration) -->
    <g transform="translate(${w * 0.49}, ${h * 0.74}) scale(1.22)">
      <!-- Left & Right Arms -->
      <path d="M -52,-10 L -95,125 L -76,132 L -36,10 Z" fill="#D99B78" />
      <path d="M 42,-8 L 92,118 L 74,126 L 28,12 Z" fill="#E8AE8A" />
      <path d="M 45,-8 L 92,118 L 86,121 L 40,-4 Z" fill="#FCE0C8" />

      <!-- Pleated Dark Navy Skirt -->
      <path d="M -44,28 L 42,24 L 78,165 L -74,168 Z" fill="#1D1F29" />
      <path d="M -24,28 L -42,166 M 0,26 L -6,166 M 24,25 L 36,165" stroke="#2E3244" stroke-width="2.5" />

      <!-- White Sailor Blouse with Soft Folds & Rim Light -->
      <path d="M -46,-78 L 42,-82 L 58,-12 L 40,30 L -44,32 L -64,-18 Z" fill="#CEC9C4" />
      <path d="M 8,-80 L 42,-82 L 58,-12 L 40,30 L 14,28 Z" fill="#F7F3EB" />
      <!-- Red Ribbon Tie at Chest -->
      <path d="M 46,-36 L 64,-22 L 54,2 L 42,-14 Z" fill="#C92A2A" />

      <!-- Navy Sailor Collar with White Stripes -->
      <path d="M -48,-78 L 40,-82 L 24,-32 L -56,-24 Z" fill="#232736" />
      <path d="M -45,-72 L 35,-76 L 21,-36 L -51,-29" fill="none" stroke="#F2EFE9" stroke-width="2.5" />

      <!-- Short Chestnut Bob Hair with Sunlit Rim Strands -->
      <path d="M -38,-148 C -15,-172 28,-170 44,-142 C 56,-118 62,-88 46,-68 C 22,-58 -28,-58 -48,-72 C -62,-92 -56,-126 -38,-148 Z" fill="#3B2723" />
      <!-- Golden Rim Highlight on Hair Crown -->
      <path d="M -38,-148 C -15,-172 28,-170 44,-142" fill="none" stroke="#FBE0B4" stroke-width="5" stroke-linecap="round" />
      <path d="M -48,-72 C -62,-95 -55,-126 -38,-148" fill="none" stroke="#F5B870" stroke-width="3.5" stroke-linecap="round" />
    </g>

    <!-- Soft Cloud Wisp in Bottom-Left Foreground -->
    ${svgCloudBank(w * 0.05, h * 0.85, w * 0.16, h * 0.22, 399, '#F7F4EE', '#E5E0D8', '#C7C0B6', 0.85)}
    ${svgMapleLeaf(w * 0.83, h * 0.49, 24, 32, '#E68A2E', 0.88)}
    ${paperOverlay(w, h)}
  </svg>`;
}

// ============================================================================
// SCENE 4: CLASSICAL FACADE BEHIND PARTING CLOUDS (00:05)
// ============================================================================
function buildScene04Lookup(w = 1600, h = 1040) {
  let windows = '';
  const bx = w * 0.17;
  const bw = w * 0.66;
  const cols = 4;
  const gap = bw * 0.055;
  const winW = (bw - gap * (cols + 1)) / cols;

  for (let r = 0; r < 3; r++) {
    const wy = h * (0.04 + r * 0.30);
    const wh = h * 0.22;
    for (let c = 0; c < cols; c++) {
      const wx = bx + gap + c * (winW + gap);
      windows += `<rect x="${wx.toFixed(1)}" y="${wy.toFixed(1)}" width="${winW.toFixed(1)}" height="${wh.toFixed(1)}" fill="#677A8E" stroke="#5A4738" stroke-width="4" />`;
      windows += `<line x1="${(wx + winW * 0.5).toFixed(1)}" y1="${wy.toFixed(1)}" x2="${(wx + winW * 0.5).toFixed(1)}" y2="${(wy + wh).toFixed(1)}" stroke="#5A4738" stroke-width="3" />`;
      windows += `<line x1="${wx.toFixed(1)}" y1="${(wy + wh * 0.55).toFixed(1)}" x2="${(wx + winW).toFixed(1)}" y2="${(wy + wh * 0.55).toFixed(1)}" stroke="#5A4738" stroke-width="3" />`;
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">
    ${commonDefs(w, h)}
    <rect width="${w}" height="${h}" fill="#859BB5" />

    <!-- Classical Limestone Heritage Building Elevation -->
    <rect x="${bx}" y="0" width="${bw}" height="${h}" fill="#C7AC92" />
    <!-- Horizontal Cornice Ledges -->
    <rect x="${bx - 16}" y="${h * 0.28}" width="${bw + 32}" height="24" fill="#DFC7AE" stroke="#9E8268" stroke-width="2" />
    <rect x="${bx - 12}" y="${h * 0.58}" width="${bw + 24}" height="18" fill="#DFC7AE" stroke="#9E8268" stroke-width="2" />
    ${windows}

    <!-- Parting Foreground Clouds (Left, Right, and Bottom) -->
    ${svgCloudBank(w * 0.14, h * 0.62, w * 0.38, h * 0.44, 401, '#F5F2EC', '#DCE3EE', '#9BAEC4', 0.96)}
    ${svgCloudBank(w * 0.86, h * 0.66, w * 0.38, h * 0.44, 402, '#F5F2EC', '#DCE3EE', '#9BAEC4', 0.96)}
    ${svgCloudBank(w * 0.50, h * 0.92, w * 0.48, h * 0.24, 403, '#F5F2EC', '#DCE3EE', '#92A5BC', 0.94)}
    ${paperOverlay(w, h)}
  </svg>`;
}

// ============================================================================
// SCENE 5: ANIMATOR AT DESK FACING OPEN STUDIO WINDOW (00:06)
// ============================================================================
function buildScene05Studio(w = 1600, h = 1040) {
  let wallSketches = '';
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 4; c++) {
      const sx = w * 0.78 + c * (w * 0.048);
      const sy = h * 0.15 + r * (h * 0.12) - c * 8;
      wallSketches += `<rect x="${sx.toFixed(1)}" y="${sy.toFixed(1)}" width="${(w * 0.038).toFixed(1)}" height="${(h * 0.095).toFixed(1)}" fill="#C9B9A6" opacity="0.72" rx="2" />`;
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">
    ${commonDefs(w, h)}
    <defs>
      <radialGradient id="roomGlow" cx="48%" cy="40%" r="65%">
        <stop offset="0%" stop-color="#8C6D53" />
        <stop offset="55%" stop-color="#4A382B" />
        <stop offset="100%" stop-color="#241B14" />
      </radialGradient>
      <linearGradient id="winSky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#A8C4DC" />
        <stop offset="100%" stop-color="#F7E5CE" />
      </linearGradient>
    </defs>

    <!-- Warm Interior Walls & Floor -->
    <rect width="${w}" height="${h}" fill="url(#roomGlow)" />
    <polygon points="0,${h * 0.75} ${w},${h * 0.75} ${w},${h} 0,${h}" fill="#2B2017" />
    <!-- Sunlight Patch on Studio Floor -->
    <polygon points="${w * 0.36},${h * 0.77} ${w * 0.56},${h * 0.77} ${w * 0.62},${h * 0.90} ${w * 0.32},${h * 0.90}" fill="#A68263" opacity="0.55" />

    <!-- Center 3-Bay Wooden Window Opening -->
    <g transform="translate(${w * 0.31}, ${h * 0.22})">
      <rect x="0" y="0" width="${w * 0.35}" height="${h * 0.33}" fill="url(#winSky)" />
      <!-- Distant City Outside Window -->
      <rect x="${w * 0.03}" y="${h * 0.14}" width="${w * 0.06}" height="${h * 0.19}" fill="#C7D4E0" />
      <rect x="${w * 0.24}" y="${h * 0.10}" width="${w * 0.07}" height="${h * 0.23}" fill="#BFD0DE" />
      <!-- Overhead Wires Outside -->
      <path d="M 0,${h * 0.04} Q ${w * 0.12},${h * 0.22} ${w * 0.22},0" fill="none" stroke="#5C5248" stroke-width="2" />
      <!-- Timber Window Mullions -->
      <rect x="0" y="0" width="${w * 0.35}" height="${h * 0.33}" fill="none" stroke="#3D2D20" stroke-width="10" />
      <line x1="${w * 0.115}" y1="0" x2="${w * 0.115}" y2="${h * 0.33}" stroke="#3D2D20" stroke-width="8" />
      <line x1="${w * 0.235}" y1="0" x2="${w * 0.235}" y2="${h * 0.33}" stroke="#3D2D20" stroke-width="8" />
      <line x1="0" y1="${h * 0.16}" x2="${w * 0.35}" y2="${h * 0.16}" stroke="#3D2D20" stroke-width="6" />
    </g>

    <!-- Left Window & Billowing Translucent White Curtain -->
    <polygon points="0,${h * 0.12} ${w * 0.15},${h * 0.22} ${w * 0.15},${h * 0.56} 0,${h * 0.62}" fill="#E6D2BA" opacity="0.65" />
    <path d="M ${w * 0.02},${h * 0.08} Q ${w * 0.16},${h * 0.35} ${w * 0.27},${h * 0.48} L ${w * 0.16},${h * 0.62} Q ${w * 0.05},${h * 0.45} 0,${h * 0.35} Z" fill="#F5EFE6" opacity="0.92" />

    <!-- Pinned Storyboard Sketches on Right Wall -->
    ${wallSketches}

    <!-- Animator Desk, Glowing Monitor & Seated Artist -->
    <g>
      <!-- Glowing Monitor Showing Painted Landscape -->
      <rect x="${w * 0.58}" y="${h * 0.39}" width="${w * 0.12}" height="${h * 0.15}" rx="4" fill="#2A5C8A" stroke="#1E1915" stroke-width="4" />
      <circle cx="${w * 0.61}" cy="${h * 0.48}" r="${w * 0.035}" fill="#E87A2E" opacity="0.85" />
      <!-- Timber Desk -->
      <rect x="${w * 0.54}" y="${h * 0.58}" width="${w * 0.34}" height="${h * 0.028}" fill="#6E5038" />
      <rect x="${w * 0.56}" y="${h * 0.608}" width="${w * 0.018}" height="${h * 0.32}" fill="#4A3525" />
      <rect x="${w * 0.84}" y="${h * 0.608}" width="${w * 0.018}" height="${h * 0.32}" fill="#4A3525" />

      <!-- Animator Seated from Behind -->
      <!-- Legs -->
      <path d="M ${w * 0.63},${h * 0.65} L ${w * 0.61},${h * 0.88} L ${w * 0.645},${h * 0.88} L ${w * 0.67},${h * 0.66} Z" fill="#1C1D24" />
      <path d="M ${w * 0.70},${h * 0.65} L ${w * 0.69},${h * 0.88} L ${w * 0.725},${h * 0.88} L ${w * 0.74},${h * 0.65} Z" fill="#1C1D24" />
      <!-- Dark Blue Sweater Torso & Shoulders -->
      <rect x="${w * 0.61}" y="${h * 0.41}" width="${w * 0.145}" height="${h * 0.25}" rx="36" fill="#2B3344" />
      <!-- Head & Dark Hair -->
      <circle cx="${w * 0.682}" cy="${h * 0.345}" r="${w * 0.032}" fill="#261E1B" />
      <!-- Wooden Stool -->
      <rect x="${w * 0.635}" y="${h * 0.66}" width="${w * 0.095}" height="${h * 0.022}" rx="4" fill="#7C5C42" />
      <line x1="${w * 0.65}" y1="${h * 0.68}" x2="${w * 0.64}" y2="${h * 0.94}" stroke="#3D2C1E" stroke-width="8" />
      <line x1="${w * 0.715}" y1="${h * 0.68}" x2="${w * 0.725}" y2="${h * 0.94}" stroke="#3D2C1E" stroke-width="8" />
    </g>

    <!-- Drifting Autumn Maple Leaves Inside Studio -->
    ${svgMapleLeaf(w * 0.24, h * 0.74, 34, -18, '#E87A24', 0.9)}
    ${svgMapleLeaf(w * 0.39, h * 0.79, 28, 24, '#D95B24', 0.85)}
    ${svgMapleLeaf(w * 0.35, h * 0.92, 22, -12, '#C8461C', 0.8)}
    ${paperOverlay(w, h)}
  </svg>`;
}

// ============================================================================
// SCENE 6: PANORAMIC AUTUMN SKYLINE & FLOATING LEAVES (00:07)
// ============================================================================
function buildScene06Skyline(w = 1600, h = 1040) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">
    ${commonDefs(w, h)}
    <defs>
      <linearGradient id="sky06" x1="0" y1="0" x2="0" y2="0.68">
        <stop offset="0%" stop-color="#386FA4" />
        <stop offset="55%" stop-color="#7EB0D6" />
        <stop offset="100%" stop-color="#EED6B5" />
      </linearGradient>
    </defs>
    <rect width="${w}" height="${h}" fill="url(#sky06)" />
    ${svgCloudBank(w * 0.52, h * 0.42, w * 0.45, h * 0.14, 601, '#FAF6F0', '#D8E5F2', '#9AB4CC', 0.65)}

    <!-- Distant City Horizon Buildings -->
    ${svgBuilding(w * 0.23, h * 0.53, w * 0.06, h * 0.18, '#8EA6BE', '#C4D4E4', '#6E87A0', '#E4EEF7', 4, 8, 61)}
    ${svgBuilding(w * 0.32, h * 0.56, w * 0.08, h * 0.16, '#96ADC4', '#CAD8E6', '#7890A8', '#E4EEF7', 5, 6, 62)}
    ${svgBuilding(w * 0.44, h * 0.54, w * 0.07, h * 0.18, '#88A0B8', '#BDD0E2', '#6B839B', '#E4EEF7', 4, 8, 63)}
    ${svgBuilding(w * 0.66, h * 0.49, w * 0.055, h * 0.22, '#7E98B2', '#B5C8DC', '#627B96', '#E4EEF7', 4, 10, 64)}

    <!-- Left Glass Tower & Right White Landmark Skyscraper -->
    ${svgBuilding(w * 0.06, h * 0.30, w * 0.105, h * 0.58, '#4B7298', '#E2A679', '#345373', '#9CC2E6', 6, 18, 65, 'left')}
    ${svgBuilding(w * 0.82, h * 0.22, w * 0.095, h * 0.62, '#8CA6BE', '#F5F2EC', '#5E7891', '#D6E4F0', 5, 20, 66, 'left')}

    <!-- Sea of Golden-Orange Autumn Treetops Across Bottom Half -->
    ${svgFoliageCanopy(w * 0.12, h * 0.84, w * 0.16, h * 0.18, 611)}
    ${svgFoliageCanopy(w * 0.28, h * 0.78, w * 0.18, h * 0.18, 612)}
    ${svgFoliageCanopy(w * 0.48, h * 0.74, w * 0.20, h * 0.19, 613)}
    ${svgFoliageCanopy(w * 0.68, h * 0.79, w * 0.18, h * 0.18, 614)}
    ${svgFoliageCanopy(w * 0.88, h * 0.84, w * 0.18, h * 0.19, 615)}
    ${svgFoliageCanopy(w * 0.38, h * 0.92, w * 0.24, h * 0.16, 616)}
    ${svgFoliageCanopy(w * 0.62, h * 0.94, w * 0.24, h * 0.16, 617)}

    <!-- Floating Autumn Maple Leaves Across the Sky -->
    ${svgMapleLeaf(w * 0.20, h * 0.09, 28, -25, '#D94E1F', 0.94)}
    ${svgMapleLeaf(w * 0.36, h * 0.19, 22, 18, '#E86F24', 0.92)}
    ${svgMapleLeaf(w * 0.69, h * 0.22, 34, -14, '#D95322', 0.95)}
    ${svgMapleLeaf(w * 0.29, h * 0.39, 18, 42, '#E57A28', 0.88)}
    ${svgMapleLeaf(w * 0.44, h * 0.48, 20, -32, '#D95322', 0.90)}
    ${svgMapleLeaf(w * 0.95, h * 0.33, 24, 15, '#C84218', 0.90)}
    ${paperOverlay(w, h)}
  </svg>`;
}

const scenes = [
  { name: 'gen_scene_01_clouds', svg: buildScene01Clouds(1600, 1040), cardCrop: '720x960+120+40', card2Crop: '720x960+760+40' },
  { name: 'gen_scene_02_avenue', svg: buildScene02Avenue(1600, 1040), cardCrop: '720x960+260+40', card2Crop: '720x960+440+40' },
  { name: 'gen_scene_03_girl', svg: buildScene03Girl(1600, 1040), cardCrop: '720x960+360+60', card2Crop: '720x960+80+40' },
  { name: 'gen_scene_04_lookup', svg: buildScene04Lookup(1600, 1040), cardCrop: '720x960+440+40', card2Crop: '720x960+180+40' },
  { name: 'gen_scene_05_studio', svg: buildScene05Studio(1600, 1040), cardCrop: '720x960+80+40', card2Crop: '720x960+740+40' },
  { name: 'gen_scene_06_skyline', svg: buildScene06Skyline(1600, 1040), cardCrop: '720x960+60+40', card2Crop: '720x960+820+40' },
];

for (const sc of scenes) {
  const svgPath = path.join(OUT_DIR, `${sc.name}.svg`);
  const jpgPath = path.join(OUT_DIR, `${sc.name}.jpg`);
  const card1Path = path.join(OUT_DIR, `${sc.name}_card1.jpg`);
  const card2Path = path.join(OUT_DIR, `${sc.name}_card2.jpg`);

  fs.writeFileSync(svgPath, sc.svg, 'utf8');
  execSync(`convert -quality 95 "${svgPath}" "${jpgPath}"`);
  execSync(`convert "${jpgPath}" -crop ${sc.cardCrop} +repage -quality 95 "${card1Path}"`);
  execSync(`convert "${jpgPath}" -crop ${sc.card2Crop} +repage -quality 95 "${card2Path}"`);
  console.log('Generated:', jpgPath);
}
