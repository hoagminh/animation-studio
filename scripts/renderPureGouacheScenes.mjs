import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

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
 * Shared SVG Filter Definitions:
 * - #gouacheBrush: Warps vector geometry with multi-octave fractalNoise so every edge looks painted by a natural bristle brush
 * - #cloudFractal: Volumetric cumulus cloud texture
 * - #paperGrain: Cold-pressed cotton animation paper texture + horizontal scanlines
 */
function sharedDefs(w, h) {
  return `<defs>
    <!-- Hand-painted gouache bristle edge distortion -->
    <filter id="gouacheBrush" x="-8%" y="-8%" width="116%" height="116%">
      <feTurbulence type="fractalNoise" baseFrequency="0.018 0.024" numOctaves="4" seed="14" result="brushNoise" />
      <feDisplacementMap in="SourceGraphic" in2="brushNoise" scale="7.5" xChannelSelector="R" yChannelSelector="G" result="displaced" />
      <feGaussianBlur in="displaced" stdDeviation="0.45" />
    </filter>

    <!-- Heavy impasto brush for foliage & clouds -->
    <filter id="impastoFoliage" x="-15%" y="-15%" width="130%" height="130%">
      <feTurbulence type="fractalNoise" baseFrequency="0.035 0.045" numOctaves="5" seed="29" result="foliageNoise" />
      <feDisplacementMap in="SourceGraphic" in2="foliageNoise" scale="14" xChannelSelector="R" yChannelSelector="G" result="warped" />
      <feGaussianBlur in="warped" stdDeviation="0.6" />
    </filter>

    <!-- Soft atmospheric cloud diffusion with bristle tooth -->
    <filter id="cloudVolume" x="-25%" y="-25%" width="150%" height="150%">
      <feGaussianBlur in="SourceGraphic" stdDeviation="16" result="blurred" />
      <feTurbulence type="fractalNoise" baseFrequency="0.008 0.012" numOctaves="5" seed="7" result="cloudNoise" />
      <feDisplacementMap in="blurred" in2="cloudNoise" scale="28" xChannelSelector="R" yChannelSelector="G" />
    </filter>

    <!-- Deep background atmospheric haze -->
    <filter id="hazeBlur" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="5" />
    </filter>

    <!-- Fine horizontal animation paper rule lines -->
    <pattern id="paperLines" width="32" height="5" patternUnits="userSpaceOnUse">
      <line x1="0" y1="4" x2="32" y2="4" stroke="#1C1915" stroke-width="0.75" stroke-opacity="0.075" />
    </pattern>

    <!-- Subtle warm cinema lens vignette -->
    <radialGradient id="cinemaVignette" cx="50%" cy="48%" r="72%">
      <stop offset="58%" stop-color="#000000" stop-opacity="0" />
      <stop offset="100%" stop-color="#14110D" stop-opacity="0.28" />
    </radialGradient>

    <!-- Sunlit atmospheric halation bloom -->
    <radialGradient id="sunBloom" cx="48%" cy="38%" r="55%">
      <stop offset="0%" stop-color="#FFE4B5" stop-opacity="0.32" />
      <stop offset="60%" stop-color="#F5B066" stop-opacity="0.08" />
      <stop offset="100%" stop-color="#F5B066" stop-opacity="0" />
    </radialGradient>
  </defs>`;
}

function paperAndVignetteOverlay(w, h) {
  return `
    <rect x="0" y="0" width="${w}" height="${h}" fill="url(#paperLines)" />
    <rect x="0" y="0" width="${w}" height="${h}" fill="url(#cinemaVignette)" />
  `;
}

/**
 * Rich multi-layered cumulus cloud bank with deep blue-grey shadows, warm cream midtones, and bright sunlit silver linings
 */
function paintCumulusBank(cx, cy, rx, ry, seed, light = '#FCFBF7', mid = '#DDE5F0', shadow = '#899FB9', deepShadow = '#6D84A3', opacity = 0.96) {
  const rng = createRng(seed);
  let out = `<g opacity="${opacity}" filter="url(#cloudVolume)">`;

  // 1. Deep shadow base
  for (let i = 0; i < 32; i++) {
    const a = rng() * Math.PI * 2;
    const d = Math.pow(rng(), 0.65) * 0.88;
    const px = (cx + Math.cos(a) * rx * d + rx * 0.05).toFixed(1);
    const py = (cy + Math.sin(a) * ry * d + ry * 0.24).toFixed(1);
    const r = ((0.22 + rng() * 0.34) * Math.min(rx, ry)).toFixed(1);
    out += `<circle cx="${px}" cy="${py}" r="${r}" fill="${i % 3 === 0 ? deepShadow : shadow}" opacity="${(0.45 + rng() * 0.35).toFixed(2)}" />`;
  }

  // 2. Warm cream & lavender mid-body puffs
  for (let i = 0; i < 45; i++) {
    const a = rng() * Math.PI * 2;
    const d = Math.pow(rng(), 0.68) * 0.85;
    const px = (cx + Math.cos(a) * rx * d).toFixed(1);
    const py = (cy + Math.sin(a) * ry * d + ry * 0.05).toFixed(1);
    const r = ((0.20 + rng() * 0.36) * Math.min(rx, ry)).toFixed(1);
    out += `<circle cx="${px}" cy="${py}" r="${r}" fill="${mid}" opacity="${(0.55 + rng() * 0.35).toFixed(2)}" />`;
  }

  // 3. Crisp sunlit upper domes (top-left light source)
  for (let i = 0; i < 55; i++) {
    const a = rng() * Math.PI * 2;
    const d = Math.pow(rng(), 0.72) * 0.82;
    const px = (cx + Math.cos(a) * rx * d - rx * 0.08).toFixed(1);
    const py = (cy + Math.sin(a) * ry * d - ry * 0.12).toFixed(1);
    const r = ((0.16 + rng() * 0.32) * Math.min(rx, ry)).toFixed(1);
    out += `<circle cx="${px}" cy="${py}" r="${r}" fill="${light}" opacity="${(0.65 + rng() * 0.35).toFixed(2)}" />`;
  }

  out += `</g>`;
  return out;
}

/**
 * Rich hand-dabbed autumn tree canopy with natural bristle clusters and dark trunk/branches
 */
function paintAutumnTree(cx, cy, rx, ry, seed, drawTrunk = true, palette = ['#4A180B', '#7C2611', '#B03818', '#D9561E', '#EE7B24', '#F6A832', '#FBE058']) {
  const rng = createRng(seed);
  let out = `<g filter="url(#impastoFoliage)">`;

  if (drawTrunk) {
    const tw = Math.max(4, rx * 0.09);
    out += `<path d="M ${(cx - tw).toFixed(1)},${(cy + ry * 1.15).toFixed(1)} L ${(cx - tw * 0.4).toFixed(1)},${(cy - ry * 0.1).toFixed(1)} L ${(cx + tw * 0.4).toFixed(1)},${(cy - ry * 0.1).toFixed(1)} L ${(cx + tw).toFixed(1)},${(cy + ry * 1.15).toFixed(1)} Z" fill="#2A1C16" />`;
  }

  const count = 135;
  for (let i = 0; i < count; i++) {
    const pIdx = Math.min(palette.length - 1, Math.floor((i / count) * palette.length));
    const a = rng() * Math.PI * 2;
    const d = Math.pow(rng(), 0.6);
    // Sunlit crown bias toward upper-left/center
    const sunBiasX = (pIdx / palette.length) * -rx * 0.18;
    const sunBiasY = (pIdx / palette.length) * -ry * 0.28;
    const px = (cx + Math.cos(a) * rx * d + sunBiasX).toFixed(1);
    const py = (cy + Math.sin(a) * ry * d + sunBiasY).toFixed(1);
    const w = (rx * (0.11 + rng() * 0.16)).toFixed(1);
    const h = (w * (0.52 + rng() * 0.36)).toFixed(1);
    const rot = ((rng() - 0.5) * 65).toFixed(1);
    out += `<ellipse cx="${px}" cy="${py}" rx="${w}" ry="${h}" fill="${palette[pIdx]}" opacity="${(0.82 + rng() * 0.18).toFixed(2)}" transform="rotate(${rot} ${px} ${py})" />`;
  }

  out += `</g>`;
  return out;
}

/**
 * Detailed architectural building with mullions, recessed window bays, cornice ledges, and sky reflections
 */
function paintDetailedBuilding(x, y, w, h, opts) {
  const {
    bodyCol = '#3B4F6B',
    litCol = '#7A99BE',
    shadowCol = '#233044',
    winDark = '#1E2A3B',
    winMid = '#587699',
    winLit = '#F4C47E',
    cols = 8,
    rows = 20,
    seed = 1,
    litSide = 'left',
    cornices = true,
  } = opts;

  const rng = createRng(seed);
  const sideW = w * 0.16;
  let out = `<g filter="url(#gouacheBrush)">`;

  // Main facade mass
  out += `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${w.toFixed(1)}" height="${h.toFixed(1)}" fill="${bodyCol}" />`;

  // 3D sunlit side plane & shadow side plane
  if (litSide === 'left') {
    out += `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${sideW.toFixed(1)}" height="${h.toFixed(1)}" fill="${litCol}" opacity="0.92" />`;
    out += `<rect x="${(x + w - sideW * 0.5).toFixed(1)}" y="${y.toFixed(1)}" width="${(sideW * 0.5).toFixed(1)}" height="${h.toFixed(1)}" fill="${shadowCol}" opacity="0.7" />`;
  } else {
    out += `<rect x="${(x + w - sideW).toFixed(1)}" y="${y.toFixed(1)}" width="${sideW.toFixed(1)}" height="${h.toFixed(1)}" fill="${litCol}" opacity="0.92" />`;
    out += `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${(sideW * 0.5).toFixed(1)}" height="${h.toFixed(1)}" fill="${shadowCol}" opacity="0.7" />`;
  }

  // Horizontal structural floor bands / cornices
  const padX = w * 0.1;
  const padY = 18;
  const cellW = (w - padX * 2) / cols;
  const cellH = (h - padY * 2) / rows;

  if (cornices) {
    for (let r = 0; r <= rows; r += 4) {
      const cy = (y + padY + r * cellH - 2).toFixed(1);
      out += `<rect x="${(x - 3).toFixed(1)}" y="${cy}" width="${(w + 6).toFixed(1)}" height="3.5" fill="${litCol}" opacity="0.55" />`;
    }
  }

  // Vertical pilasters
  for (let c = 0; c <= cols; c++) {
    const px = (x + padX + c * cellW - 1).toFixed(1);
    out += `<rect x="${px}" y="${y.toFixed(1)}" width="2" height="${h.toFixed(1)}" fill="${shadowCol}" opacity="0.4" />`;
  }

  // Recessed windows with painterly reflection variation
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (rng() > 0.08) {
        const wx = (x + padX + c * cellW + 2.5).toFixed(1);
        const wy = (y + padY + r * cellH + 2.5).toFixed(1);
        const ww = Math.max(2.5, cellW - 5.5).toFixed(1);
        const wh = Math.max(4, cellH - 5.5).toFixed(1);
        const roll = rng();
        const col = roll > 0.82 ? winLit : roll > 0.42 ? winMid : winDark;
        const op = (0.42 + rng() * 0.52).toFixed(2);
        out += `<rect x="${wx}" y="${wy}" width="${ww}" height="${wh}" fill="${col}" opacity="${op}" />`;
      }
    }
  }

  out += `</g>`;
  return out;
}

function paintMapleLeaf(cx, cy, size, rotDeg, color = '#E05A22', highlight = '#F7A838', opacity = 0.94) {
  const s = size / 22;
  return `<g transform="translate(${cx.toFixed(1)}, ${cy.toFixed(1)}) rotate(${rotDeg.toFixed(1)}) scale(${s.toFixed(2)})" opacity="${opacity}" filter="url(#gouacheBrush)">
    <path d="M 0,-24 L 4,-10 L 18,-15 L 11,-3 L 23,5 L 8,9 L 10,20 L 0,13 L -10,20 L -8,9 L -23,5 L -11,-3 L -18,-15 L -4,-10 Z" fill="${color}" />
    <path d="M 0,-24 L 3,-10 L 14,-13 L 7,-3 L 0,10 L -4,-8 Z" fill="${highlight}" opacity="0.55" />
  </g>`;
}

// ============================================================================
// 1. CLOUDS SCENE (00:01)
// ============================================================================
function scene01Clouds(w = 1600, h = 1040) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">
    ${sharedDefs(w, h)}
    <defs>
      <linearGradient id="sky1" x1="0" y1="0" x2="0.25" y2="1">
        <stop offset="0%" stop-color="#6384B0" />
        <stop offset="45%" stop-color="#89A6CC" />
        <stop offset="100%" stop-color="#C5D4E6" />
      </linearGradient>
    </defs>
    <rect width="${w}" height="${h}" fill="url(#sky1)" />
    ${paintCumulusBank(w * 0.74, h * 0.26, w * 0.38, h * 0.28, 101)}
    ${paintCumulusBank(w * 0.36, h * 0.46, w * 0.42, h * 0.30, 102)}
    ${paintCumulusBank(w * 0.78, h * 0.62, w * 0.44, h * 0.34, 103)}
    ${paintCumulusBank(w * 0.25, h * 0.78, w * 0.48, h * 0.30, 104, '#F7F6F2', '#D4DFEC', '#7C92B0', '#607694')}
    ${paintCumulusBank(w * 0.58, h * 0.88, w * 0.45, h * 0.24, 105, '#F2F0EC', '#C9D6E6', '#7288A6', '#566C8A')}
    ${paperAndVignetteOverlay(w, h)}
  </svg>`;
}

// ============================================================================
// 2. AUTUMN AVENUE SCENE (00:02)
// ============================================================================
function scene02Avenue(w = 1600, h = 1040) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">
    ${sharedDefs(w, h)}
    <defs>
      <linearGradient id="sky2" x1="0" y1="0" x2="0" y2="0.68">
        <stop offset="0%" stop-color="#5679A3" />
        <stop offset="52%" stop-color="#9BB5CE" />
        <stop offset="100%" stop-color="#F5CCA0" />
      </linearGradient>
      <linearGradient id="asphalt2" x1="0" y1="0.54" x2="0" y2="1">
        <stop offset="0%" stop-color="#525B6E" />
        <stop offset="45%" stop-color="#384050" />
        <stop offset="100%" stop-color="#222733" />
      </linearGradient>
    </defs>
    <rect width="${w}" height="${h}" fill="url(#sky2)" />
    ${paintCumulusBank(w * 0.50, h * 0.22, w * 0.36, h * 0.16, 201, '#FAF6F0', '#DCE6F2', '#9BB2CA', '#7F97B2', 0.78)}

    <!-- Distant Hazy City Skyline at Vanishing Point -->
    <g filter="url(#hazeBlur)" opacity="0.85">
      ${paintDetailedBuilding(w * 0.37, h * 0.20, w * 0.055, h * 0.40, { bodyCol: '#7B92AC', litCol: '#ADC2D8', cols: 4, rows: 14, seed: 21 })}
      ${paintDetailedBuilding(w * 0.42, h * 0.13, w * 0.055, h * 0.46, { bodyCol: '#889FB8', litCol: '#B8CCE0', cols: 4, rows: 16, seed: 22 })}
      ${paintDetailedBuilding(w * 0.475, h * 0.22, w * 0.048, h * 0.38, { bodyCol: '#95ACC4', litCol: '#C5D6E8', cols: 4, rows: 12, seed: 23 })}
      ${paintDetailedBuilding(w * 0.525, h * 0.10, w * 0.062, h * 0.48, { bodyCol: '#7E95AF', litCol: '#B2C6DC', cols: 5, rows: 18, seed: 24 })}
    </g>

    <!-- Towering Left & Right Glass Skyscrapers -->
    ${paintDetailedBuilding(w * 0.16, -30, w * 0.22, h * 0.76, { bodyCol: '#344966', litCol: '#6D8DB2', shadowCol: '#1E2C40', winDark: '#1D2B3E', winMid: '#4D6E94', winLit: '#9CC0E6', cols: 8, rows: 24, seed: 25, litSide: 'right' })}
    ${paintDetailedBuilding(w * 0.64, -30, w * 0.21, h * 0.78, { bodyCol: '#2D3F58', litCol: '#8CB2D8', shadowCol: '#1B2738', winDark: '#1A2636', winMid: '#4A6B91', winLit: '#A5C8EC', cols: 8, rows: 24, seed: 26, litSide: 'left' })}
    ${paintDetailedBuilding(w * 0.81, h * 0.02, w * 0.21, h * 0.84, { bodyCol: '#243246', litCol: '#DF8448', shadowCol: '#16202E', winDark: '#16202E', winMid: '#3E5878', winLit: '#F2B078', cols: 7, rows: 22, seed: 27, litSide: 'left' })}

    <!-- Central Perspective 4-Lane Avenue -->
    <polygon points="${w * 0.44},${h * 0.55} ${w * 0.56},${h * 0.55} ${w * 0.74},${h} ${w * 0.26},${h}" fill="url(#asphalt2)" filter="url(#gouacheBrush)" />

    <!-- Golden Afternoon Sunlight Beam Across the Street -->
    <polygon points="${w * 0.39},${h * 0.70} ${w * 0.61},${h * 0.70} ${w * 0.65},${h * 0.82} ${w * 0.35},${h * 0.82}" fill="#F7C986" opacity="0.72" filter="url(#gouacheBrush)" />
    <!-- Long Building Shadows Across Road -->
    <polygon points="${w * 0.41},${h * 0.64} ${w * 0.53},${h * 0.65} ${w * 0.55},${h * 0.69} ${w * 0.39},${h * 0.68}" fill="#232936" opacity="0.65" />

    <!-- Road Markings & Stylized Cars / Bus -->
    <line x1="${w * 0.50}" y1="${h * 0.55}" x2="${w * 0.50}" y2="${h}" stroke="#E6AA50" stroke-width="3" opacity="0.88" />
    <line x1="${w * 0.47}" y1="${h * 0.55}" x2="${w * 0.38}" y2="${h}" stroke="#DCE4F0" stroke-width="1.5" stroke-dasharray="12 16" opacity="0.45" />
    <line x1="${w * 0.53}" y1="${h * 0.55}" x2="${w * 0.62}" y2="${h}" stroke="#DCE4F0" stroke-width="1.5" stroke-dasharray="12 16" opacity="0.45" />
    <!-- White Bus & Cars on Avenue -->
    <rect x="${w * 0.445}" y="${h * 0.65}" width="18" height="22" rx="3" fill="#EAE6DF" stroke="#2D3340" stroke-width="1.5" />
    <rect x="${w * 0.535}" y="${h * 0.71}" width="16" height="14" rx="3" fill="#DCE2EC" stroke="#2D3340" stroke-width="1.5" />
    <rect x="${w * 0.425}" y="${h * 0.88}" width="24" height="18" rx="4" fill="#6D7A8E" stroke="#1E232E" stroke-width="1.5" />

    <!-- Left Foreground Classical Stone Buildings -->
    ${paintDetailedBuilding(-20, h * 0.44, w * 0.33, h * 0.58, { bodyCol: '#82746B', litCol: '#CBB7A6', shadowCol: '#4A403A', winDark: '#2E2723', winMid: '#594D45', winLit: '#E8C59B', cols: 9, rows: 10, seed: 28, litSide: 'right' })}
    ${paintDetailedBuilding(-10, h * 0.62, w * 0.23, h * 0.42, { bodyCol: '#615650', litCol: '#B5A090', shadowCol: '#38302C', winDark: '#241F1C', winMid: '#4A403A', winLit: '#DFC09C', cols: 6, rows: 7, seed: 29, litSide: 'right' })}

    <!-- Right Foreground Mansard-Roof Heritage Building -->
    <polygon points="${w * 0.725},${h * 0.55} ${w * 0.775},${h * 0.46} ${w * 1.02},${h * 0.46} ${w * 1.02},${h * 0.55}" fill="#6E8E82" filter="url(#gouacheBrush)" />
    ${paintDetailedBuilding(w * 0.725, h * 0.54, w * 0.29, h * 0.49, { bodyCol: '#9E8D7F', litCol: '#E2D2C3', shadowCol: '#5E5248', winDark: '#362E28', winMid: '#63564C', winLit: '#F5D5AC', cols: 8, rows: 8, seed: 30, litSide: 'left' })}

    <!-- Glowing Autumn Maple & Ginkgo Trees Lining Both Sides of Avenue -->
    ${paintAutumnTree(w * 0.42, h * 0.56, w * 0.042, h * 0.052, 211)}
    ${paintAutumnTree(w * 0.58, h * 0.56, w * 0.042, h * 0.052, 212)}
    ${paintAutumnTree(w * 0.39, h * 0.64, w * 0.062, h * 0.072, 213)}
    ${paintAutumnTree(w * 0.61, h * 0.64, w * 0.062, h * 0.072, 214)}
    ${paintAutumnTree(w * 0.35, h * 0.75, w * 0.082, h * 0.092, 215)}
    ${paintAutumnTree(w * 0.65, h * 0.75, w * 0.082, h * 0.092, 216)}
    ${paintAutumnTree(w * 0.29, h * 0.90, w * 0.11, h * 0.12, 217)}
    ${paintAutumnTree(w * 0.70, h * 0.90, w * 0.11, h * 0.12, 218)}

    <rect width="${w}" height="${h}" fill="url(#sunBloom)" />
    ${paperAndVignetteOverlay(w, h)}
  </svg>`;
}

// ============================================================================
// 3. GIRL LOOKING UP AT TERRACOTTA BUILDINGS (00:04)
// ============================================================================
function scene03Girl(w = 1600, h = 1040) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">
    ${sharedDefs(w, h)}
    <defs>
      <linearGradient id="sky3" x1="0.2" y1="0" x2="0.8" y2="1">
        <stop offset="0%" stop-color="#58789E" />
        <stop offset="52%" stop-color="#9EB8D0" />
        <stop offset="100%" stop-color="#E8BD8E" />
      </linearGradient>
    </defs>
    <rect width="${w}" height="${h}" fill="url(#sky3)" />
    ${paintCumulusBank(w * 0.84, h * 0.22, w * 0.28, h * 0.22, 301, '#FAF6EE', '#D4E0EE', '#8CA2BC', '#6E86A2', 0.9)}

    <!-- Center-Top Converging Skyscraper -->
    <g transform="translate(${w * 0.50}, ${h * 0.35}) rotate(-10)">
      ${paintDetailedBuilding(-w * 0.11, -h * 0.46, w * 0.22, h * 0.96, { bodyCol: '#9E7D64', litCol: '#E2C5A8', shadowCol: '#5E4636', winDark: '#473428', winMid: '#7D5F4A', winLit: '#F7CE94', cols: 6, rows: 22, seed: 31, litSide: 'right' })}
    </g>

    <!-- Right Dark Blue Glass Tower & Warm Cream Mid-Rise -->
    <g transform="translate(${w * 0.72}, ${h * 0.56}) rotate(-12)">
      ${paintDetailedBuilding(-w * 0.12, -h * 0.44, w * 0.24, h * 0.92, { bodyCol: '#384862', litCol: '#2A82BA', shadowCol: '#222D40', winDark: '#1E283A', winMid: '#48688E', winLit: '#85C0EC', cols: 6, rows: 18, seed: 32, litSide: 'left' })}
      ${paintDetailedBuilding(-w * 0.16, -h * 0.12, w * 0.22, h * 0.66, { bodyCol: '#C49A76', litCol: '#EED3B6', shadowCol: '#785A42', winDark: '#523C2B', winMid: '#8C6B50', winLit: '#FBE0B4', cols: 7, rows: 14, seed: 33, litSide: 'left' })}
    </g>

    <!-- Left Steeply Angled Warm Terracotta Apartment Block -->
    <g transform="translate(${w * 0.18}, ${h * 0.52}) rotate(18)">
      ${paintDetailedBuilding(-w * 0.28, -h * 0.58, w * 0.52, h * 1.25, { bodyCol: '#8A4128', litCol: '#DE7638', shadowCol: '#4A2012', winDark: '#3B190E', winMid: '#70341F', winLit: '#F7B568', cols: 9, rows: 18, seed: 34, litSide: 'right' })}
    </g>

    <!-- Fiery Red-Orange Autumn Maple Branches Overhanging Left & Center -->
    ${paintAutumnTree(w * 0.10, h * 0.68, w * 0.16, h * 0.22, 311, true)}
    ${paintAutumnTree(w * 0.44, h * 0.27, w * 0.075, h * 0.065, 312, false)}
    ${paintAutumnTree(w * 0.53, h * 0.51, w * 0.07, h * 0.065, 313, false)}

    <!-- Foreground Anime Girl Looking Up (Crisp Hand-Painted Cel & Gouache Shading) -->
    <g transform="translate(${w * 0.49}, ${h * 0.74}) scale(1.24)" filter="url(#gouacheBrush)">
      <!-- Left & Right Sunlit Arms -->
      <path d="M -52,-10 L -96,126 L -76,133 L -36,10 Z" fill="#D99B78" />
      <path d="M 42,-8 L 94,120 L 75,128 L 28,12 Z" fill="#E6AC88" />
      <path d="M 45,-8 L 94,120 L 87,123 L 40,-4 Z" fill="#FDE2CA" />

      <!-- High-Waisted Dark Navy Pleated Skirt -->
      <path d="M -44,28 L 42,24 L 80,168 L -76,170 Z" fill="#1C1E28" />
      <path d="M -26,28 L -45,168 M -4,26 L -10,168 M 18,25 L 28,166 M 34,25 L 54,166" stroke="#2E3346" stroke-width="2.5" />

      <!-- White Short-Sleeved Sailor Blouse with Warm Shadow & Rim Light -->
      <path d="M -46,-78 L 42,-82 L 60,-12 L 40,30 L -44,32 L -65,-18 Z" fill="#CFCAC4" />
      <path d="M 6,-80 L 42,-82 L 60,-12 L 40,30 L 12,28 Z" fill="#FAF6EE" />
      <path d="M -18,-45 L -32,28 M 16,-48 L 24,26" stroke="#B5AEA6" stroke-width="2" />

      <!-- Crimson Sailor Tie -->
      <path d="M 46,-36 L 65,-22 L 55,4 L 42,-14 Z" fill="#C92A2A" />

      <!-- Navy Sailor Collar with Double White Stripes -->
      <path d="M -48,-78 L 40,-82 L 24,-30 L -56,-22 Z" fill="#222636" />
      <path d="M -44,-72 L 35,-76 L 21,-35 L -50,-28" fill="none" stroke="#F4F0E8" stroke-width="2.5" />
      <path d="M -41,-67 L 31,-71 L 19,-39 L -47,-33" fill="none" stroke="#F4F0E8" stroke-width="1.2" />

      <!-- Wind-Swept Chestnut Bob Hair with Golden Sunset Rim Light -->
      <path d="M -38,-150 C -15,-174 28,-172 45,-144 C 58,-118 64,-88 46,-68 C 22,-58 -28,-58 -48,-72 C -64,-92 -56,-128 -38,-150 Z" fill="#3A2521" />
      <path d="M -18,-158 C -6,-125 -12,-90 -26,-64" stroke="#291916" stroke-width="3" fill="none" />
      <path d="M 12,-156 C 22,-122 18,-88 8,-64" stroke="#4D332D" stroke-width="3" fill="none" />
      <!-- Golden Rim Highlight Around Hair Crown -->
      <path d="M -38,-150 C -15,-174 28,-172 45,-144" fill="none" stroke="#FCE2B6" stroke-width="5" stroke-linecap="round" />
      <path d="M -48,-72 C -62,-95 -55,-128 -38,-150" fill="none" stroke="#F5B870" stroke-width="3.5" stroke-linecap="round" />
    </g>

    ${paintCumulusBank(w * 0.05, h * 0.86, w * 0.16, h * 0.22, 399, '#F7F4EE', '#E5E0D8', '#C7C0B6', '#A8A096', 0.84)}
    ${paintMapleLeaf(w * 0.83, h * 0.49, 26, 32, '#E68A2E', '#FBE078', 0.9)}
    <rect width="${w}" height="${h}" fill="url(#sunBloom)" />
    ${paperAndVignetteOverlay(w, h)}
  </svg>`;
}

// ============================================================================
// 4. CLASSICAL FACADE BEHIND PARTING CLOUDS (00:05)
// ============================================================================
function scene04Lookup(w = 1600, h = 1040) {
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
      windows += `<g filter="url(#gouacheBrush)">
        <rect x="${wx.toFixed(1)}" y="${wy.toFixed(1)}" width="${winW.toFixed(1)}" height="${wh.toFixed(1)}" fill="#64788E" stroke="#594637" stroke-width="4.5" />
        <rect x="${(wx + 4).toFixed(1)}" y="${(wy + 4).toFixed(1)}" width="${(winW * 0.42).toFixed(1)}" height="${(wh - 8).toFixed(1)}" fill="#7B92AA" opacity="0.45" />
        <line x1="${(wx + winW * 0.5).toFixed(1)}" y1="${wy.toFixed(1)}" x2="${(wx + winW * 0.5).toFixed(1)}" y2="${(wy + wh).toFixed(1)}" stroke="#594637" stroke-width="3.5" />
        <line x1="${wx.toFixed(1)}" y1="${(wy + wh * 0.55).toFixed(1)}" x2="${(wx + winW).toFixed(1)}" y2="${(wy + wh * 0.55).toFixed(1)}" stroke="#594637" stroke-width="3.5" />
      </g>`;
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">
    ${sharedDefs(w, h)}
    <rect width="${w}" height="${h}" fill="#849BB5" />

    <!-- Classical Limestone Heritage Building Elevation -->
    <g filter="url(#gouacheBrush)">
      <rect x="${bx}" y="0" width="${bw}" height="${h}" fill="#C7AC92" />
      <rect x="${bx - 16}" y="${h * 0.28}" width="${bw + 32}" height="24" fill="#DFC7AE" stroke="#9E8268" stroke-width="2.5" />
      <rect x="${bx - 12}" y="${h * 0.58}" width="${bw + 24}" height="18" fill="#DFC7AE" stroke="#9E8268" stroke-width="2.5" />
    </g>
    ${windows}

    <!-- Parting Foreground Clouds -->
    ${paintCumulusBank(w * 0.14, h * 0.62, w * 0.39, h * 0.45, 401, '#F7F4EE', '#DCE4F0', '#9BAEC4', '#7E94AE', 0.96)}
    ${paintCumulusBank(w * 0.86, h * 0.66, w * 0.39, h * 0.45, 402, '#F7F4EE', '#DCE4F0', '#9BAEC4', '#7E94AE', 0.96)}
    ${paintCumulusBank(w * 0.50, h * 0.93, w * 0.48, h * 0.25, 403, '#F7F4EE', '#DCE4F0', '#92A5BC', '#768BA4', 0.95)}
    ${paperAndVignetteOverlay(w, h)}
  </svg>`;
}

// ============================================================================
// 5. ANIMATOR AT DESK FACING OPEN STUDIO WINDOW (00:06)
// ============================================================================
function scene05Studio(w = 1600, h = 1040) {
  let wallSketches = '';
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 4; c++) {
      const sx = w * 0.78 + c * (w * 0.048);
      const sy = h * 0.15 + r * (h * 0.12) - c * 8;
      wallSketches += `<rect x="${sx.toFixed(1)}" y="${sy.toFixed(1)}" width="${(w * 0.038).toFixed(1)}" height="${(h * 0.095).toFixed(1)}" fill="#CEBFA8" stroke="#6E5B48" stroke-width="1" opacity="0.78" rx="2" filter="url(#gouacheBrush)" />`;
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">
    ${sharedDefs(w, h)}
    <defs>
      <radialGradient id="roomLight5" cx="48%" cy="38%" r="65%">
        <stop offset="0%" stop-color="#947458" />
        <stop offset="52%" stop-color="#4E3B2C" />
        <stop offset="100%" stop-color="#221912" />
      </radialGradient>
      <linearGradient id="winSky5" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#A6C4DE" />
        <stop offset="100%" stop-color="#F7E6CF" />
      </linearGradient>
    </defs>

    <!-- Warm Interior Walls & Floor -->
    <rect width="${w}" height="${h}" fill="url(#roomLight5)" />
    <polygon points="0,${h * 0.75} ${w},${h * 0.75} ${w},${h} 0,${h}" fill="#2A1F16" filter="url(#gouacheBrush)" />
    <polygon points="${w * 0.35},${h * 0.77} ${w * 0.57},${h * 0.77} ${w * 0.63},${h * 0.91} ${w * 0.31},${h * 0.91}" fill="#B08A68" opacity="0.58" filter="url(#gouacheBrush)" />

    <!-- Center 3-Bay Wooden Casement Window -->
    <g transform="translate(${w * 0.31}, ${h * 0.22})" filter="url(#gouacheBrush)">
      <rect x="0" y="0" width="${w * 0.35}" height="${h * 0.33}" fill="url(#winSky5)" />
      <!-- Distant City Silhouettes Outside Window -->
      <rect x="${w * 0.025}" y="${h * 0.13}" width="${w * 0.065}" height="${h * 0.20}" fill="#C5D4E2" />
      <rect x="${w * 0.10}" y="${h * 0.18}" width="${w * 0.05}" height="${h * 0.15}" fill="#D0DCE8" />
      <rect x="${w * 0.24}" y="${h * 0.09}" width="${w * 0.075}" height="${h * 0.24}" fill="#BCCEDE" />
      <!-- Power Lines Outside -->
      <path d="M 0,${h * 0.03} Q ${w * 0.11},${h * 0.22} ${w * 0.21},0" fill="none" stroke="#5C5248" stroke-width="2" />
      <path d="M ${w * 0.06},0 Q ${w * 0.14},${h * 0.18} ${w * 0.25},${h * 0.02}" fill="none" stroke="#5C5248" stroke-width="1.5" />
      <!-- Timber Window Frame & Mullions -->
      <rect x="0" y="0" width="${w * 0.35}" height="${h * 0.33}" fill="none" stroke="#3D2C1E" stroke-width="10" />
      <line x1="${w * 0.115}" y1="0" x2="${w * 0.115}" y2="${h * 0.33}" stroke="#3D2C1E" stroke-width="8" />
      <line x1="${w * 0.235}" y1="0" x2="${w * 0.235}" y2="${h * 0.33}" stroke="#3D2C1E" stroke-width="8" />
      <line x1="0" y1="${h * 0.16}" x2="${w * 0.35}" y2="${h * 0.16}" stroke="#3D2C1E" stroke-width="6" />
    </g>

    <!-- Left Window & Billowing Translucent White Curtain -->
    <g filter="url(#gouacheBrush)">
      <polygon points="0,${h * 0.12} ${w * 0.15},${h * 0.22} ${w * 0.15},${h * 0.56} 0,${h * 0.62}" fill="#E8D4BC" opacity="0.68" />
      <path d="M ${w * 0.02},${h * 0.08} Q ${w * 0.16},${h * 0.35} ${w * 0.275},${h * 0.48} L ${w * 0.16},${h * 0.62} Q ${w * 0.05},${h * 0.45} 0,${h * 0.35} Z" fill="#F7F2E9" opacity="0.93" />
      <path d="M ${w * 0.04},${h * 0.12} Q ${w * 0.15},${h * 0.38} ${w * 0.23},${h * 0.52}" fill="none" stroke="#DFD6C8" stroke-width="3" />
    </g>

    ${wallSketches}

    <!-- Animator Desk, Glowing Monitor & Seated Animator -->
    <g filter="url(#gouacheBrush)">
      <!-- Glowing Monitor Showing Painted Landscape -->
      <rect x="${w * 0.58}" y="${h * 0.39}" width="${w * 0.125}" height="${h * 0.15}" rx="4" fill="#2A5E8E" stroke="#1C1713" stroke-width="4" />
      <path d="M ${w * 0.58},${h * 0.48} Q ${w * 0.63},${h * 0.42} ${w * 0.705},${h * 0.52} L ${w * 0.705},${h * 0.54} L ${w * 0.58},${h * 0.54} Z" fill="#E87C2E" opacity="0.9" />
      <!-- Timber Desk -->
      <rect x="${w * 0.54}" y="${h * 0.58}" width="${w * 0.34}" height="${h * 0.028}" fill="#705239" />
      <rect x="${w * 0.56}" y="${h * 0.608}" width="${w * 0.018}" height="${h * 0.32}" fill="#4A3524" />
      <rect x="${w * 0.84}" y="${h * 0.608}" width="${w * 0.018}" height="${h * 0.32}" fill="#4A3524" />

      <!-- Animator Seated from Behind -->
      <path d="M ${w * 0.63},${h * 0.65} L ${w * 0.61},${h * 0.88} L ${w * 0.645},${h * 0.88} L ${w * 0.67},${h * 0.66} Z" fill="#1C1D24" />
      <path d="M ${w * 0.70},${h * 0.65} L ${w * 0.69},${h * 0.88} L ${w * 0.725},${h * 0.88} L ${w * 0.74},${h * 0.65} Z" fill="#1C1D24" />
      <rect x="${w * 0.61}" y="${h * 0.41}" width="${w * 0.145}" height="${h * 0.25}" rx="36" fill="#2B3446" />
      <!-- Sunlit Rim on Left Shoulder -->
      <path d="M ${w * 0.61},${h * 0.46} Q ${w * 0.61},${h * 0.41} ${w * 0.65},${h * 0.41}" fill="none" stroke="#9CB4CE" stroke-width="4" stroke-linecap="round" />
      <circle cx="${w * 0.682}" cy="${h * 0.345}" r="${w * 0.032}" fill="#261E1B" />

      <!-- Wooden Stool -->
      <rect x="${w * 0.635}" y="${h * 0.66}" width="${w * 0.095}" height="${h * 0.022}" rx="4" fill="#805E42" />
      <line x1="${w * 0.65}" y1="${h * 0.68}" x2="${w * 0.64}" y2="${h * 0.94}" stroke="#3D2C1E" stroke-width="8" />
      <line x1="${w * 0.715}" y1="${h * 0.68}" x2="${w * 0.725}" y2="${h * 0.94}" stroke="#3D2C1E" stroke-width="8" />
    </g>

    ${paintMapleLeaf(w * 0.24, h * 0.74, 34, -18, '#E87A24', '#FBE078', 0.92)}
    ${paintMapleLeaf(w * 0.39, h * 0.79, 28, 24, '#D95B24', '#F7A838', 0.88)}
    ${paintMapleLeaf(w * 0.35, h * 0.92, 22, -12, '#C8461C', '#F28C28', 0.84)}
    ${paperAndVignetteOverlay(w, h)}
  </svg>`;
}

// ============================================================================
// 6. PANORAMIC AUTUMN SKYLINE & FLOATING LEAVES (00:07)
// ============================================================================
function scene06Skyline(w = 1600, h = 1040) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">
    ${sharedDefs(w, h)}
    <defs>
      <linearGradient id="sky6" x1="0" y1="0" x2="0" y2="0.68">
        <stop offset="0%" stop-color="#366CA2" />
        <stop offset="54%" stop-color="#7CB0D6" />
        <stop offset="100%" stop-color="#F0D8B6" />
      </linearGradient>
    </defs>
    <rect width="${w}" height="${h}" fill="url(#sky6)" />
    ${paintCumulusBank(w * 0.52, h * 0.42, w * 0.46, h * 0.14, 601, '#FAF6F0', '#D8E5F2', '#9AB4CC', '#7E98B2', 0.68)}

    <!-- Distant City Horizon Silhouettes -->
    <g filter="url(#hazeBlur)" opacity="0.88">
      ${paintDetailedBuilding(w * 0.22, h * 0.53, w * 0.06, h * 0.18, { bodyCol: '#8EA6BE', litCol: '#C4D4E4', cols: 4, rows: 8, seed: 61 })}
      ${paintDetailedBuilding(w * 0.31, h * 0.56, w * 0.08, h * 0.16, { bodyCol: '#96ADC4', litCol: '#CAD8E6', cols: 5, rows: 6, seed: 62 })}
      ${paintDetailedBuilding(w * 0.43, h * 0.54, w * 0.07, h * 0.18, { bodyCol: '#88A0B8', litCol: '#BDD0E2', cols: 4, rows: 8, seed: 63 })}
      ${paintDetailedBuilding(w * 0.65, h * 0.49, w * 0.055, h * 0.22, { bodyCol: '#7E98B2', litCol: '#B5C8DC', cols: 4, rows: 10, seed: 64 })}
    </g>

    <!-- Left Glass Skyscraper & Right White Landmark Tower -->
    ${paintDetailedBuilding(w * 0.06, h * 0.30, w * 0.105, h * 0.58, { bodyCol: '#4B7298', litCol: '#E5A87A', shadowCol: '#2E4A68', winDark: '#263E58', winMid: '#5882AA', winLit: '#B2D4F2', cols: 6, rows: 18, seed: 65, litSide: 'left' })}
    ${paintDetailedBuilding(w * 0.82, h * 0.22, w * 0.095, h * 0.62, { bodyCol: '#8CA6BE', litCol: '#F7F4EE', shadowCol: '#5E7891', winDark: '#4D657C', winMid: '#7D98B2', winLit: '#E4EEF7', cols: 5, rows: 20, seed: 66, litSide: 'left' })}

    <!-- Lush Golden-Orange Autumn Canopy Across Bottom Half -->
    ${paintAutumnTree(w * 0.10, h * 0.84, w * 0.16, h * 0.18, 611, false)}
    ${paintAutumnTree(w * 0.26, h * 0.78, w * 0.18, h * 0.18, 612, false)}
    ${paintAutumnTree(w * 0.46, h * 0.74, w * 0.20, h * 0.19, 613, false)}
    ${paintAutumnTree(w * 0.66, h * 0.79, w * 0.18, h * 0.18, 614, false)}
    ${paintAutumnTree(w * 0.86, h * 0.84, w * 0.18, h * 0.19, 615, false)}
    ${paintAutumnTree(w * 0.36, h * 0.92, w * 0.24, h * 0.16, 616, false)}
    ${paintAutumnTree(w * 0.62, h * 0.94, w * 0.24, h * 0.16, 617, false)}

    <!-- Tumbling Autumn Maple Leaves Across the Sky -->
    ${paintMapleLeaf(w * 0.20, h * 0.09, 28, -25, '#D94E1F', '#F7A838', 0.95)}
    ${paintMapleLeaf(w * 0.36, h * 0.19, 22, 18, '#E86F24', '#FBE078', 0.92)}
    ${paintMapleLeaf(w * 0.69, h * 0.22, 34, -14, '#D95322', '#F7A838', 0.95)}
    ${paintMapleLeaf(w * 0.29, h * 0.39, 18, 42, '#E57A28', '#FBE078', 0.88)}
    ${paintMapleLeaf(w * 0.44, h * 0.48, 20, -32, '#D95322', '#F7A838', 0.90)}
    ${paintMapleLeaf(w * 0.95, h * 0.33, 24, 15, '#C84218', '#F28C28', 0.90)}
    ${paperAndVignetteOverlay(w, h)}
  </svg>`;
}

async function run() {
  const specs = [
    { name: 'gen_scene_01_clouds', svg: scene01Clouds(1600, 1040), c1: { left: 100, top: 40 }, c2: { left: 760, top: 40 } },
    { name: 'gen_scene_02_avenue', svg: scene02Avenue(1600, 1040), c1: { left: 240, top: 40 }, c2: { left: 440, top: 40 } },
    { name: 'gen_scene_03_girl', svg: scene03Girl(1600, 1040), c1: { left: 380, top: 60 }, c2: { left: 80, top: 40 } },
    { name: 'gen_scene_04_lookup', svg: scene04Lookup(1600, 1040), c1: { left: 440, top: 40 }, c2: { left: 180, top: 40 } },
    { name: 'gen_scene_05_studio', svg: scene05Studio(1600, 1040), c1: { left: 60, top: 40 }, c2: { left: 740, top: 40 } },
    { name: 'gen_scene_06_skyline', svg: scene06Skyline(1600, 1040), c1: { left: 60, top: 40 }, c2: { left: 800, top: 40 } },
  ];

  for (const sp of specs) {
    const buf = Buffer.from(sp.svg);
    const mainOut = path.join(OUT_DIR, `${sp.name}.jpg`);
    const card1Out = path.join(OUT_DIR, `${sp.name}_card1.jpg`);
    const card2Out = path.join(OUT_DIR, `${sp.name}_card2.jpg`);

    await sharp(buf).jpeg({ quality: 95, chromaSubsampling: '4:4:4' }).toFile(mainOut);
    await sharp(mainOut).extract({ left: sp.c1.left, top: sp.c1.top, width: 720, height: 960 }).jpeg({ quality: 95 }).toFile(card1Out);
    await sharp(mainOut).extract({ left: sp.c2.left, top: sp.c2.top, width: 720, height: 960 }).jpeg({ quality: 95 }).toFile(card2Out);
    console.log('Rendered:', mainOut);
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
