import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const OUT_DIR = path.resolve('public/assets/generated');
fs.mkdirSync(OUT_DIR, { recursive: true });

const W = 1600;
const H = 1040;

function createRng(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function clamp(v, lo, hi) {
  return v < lo ? lo : v > hi ? hi : v;
}

function rgbToHex(r, g, b) {
  return (
    '#' +
    [r, g, b]
      .map((c) => clamp(Math.round(c), 0, 255).toString(16).padStart(2, '0'))
      .join('')
  );
}

async function loadRgb(filePath) {
  const { data } = await sharp(filePath)
    .resize(W, H, { fit: 'fill', kernel: 'lanczos3' })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  return new Uint8Array(data);
}

/**
 * Copy a rectangular patch from src to dst with smooth cosine feathered border
 */
function copyPatch(
  dst,
  src,
  dstX,
  dstY,
  w,
  h,
  srcX,
  srcY,
  feather = 32,
  brightnessScale = [1, 1, 1]
) {
  for (let dy = 0; dy < h; dy++) {
    const ty = dstY + dy;
    const sy = clamp(srcY + dy, 0, H - 1);
    if (ty < 0 || ty >= H) continue;

    // Do not feather edges that touch the outer canvas boundary (0 or W-1/H-1)
    const wyTop = dstY <= 0 ? 1 : dy < feather ? dy / feather : 1;
    const wyBot = dstY + h >= H ? 1 : h - 1 - dy < feather ? (h - 1 - dy) / feather : 1;
    const wy = Math.min(wyTop, wyBot);

    for (let dx = 0; dx < w; dx++) {
      const tx = dstX + dx;
      const sx = clamp(srcX + dx, 0, W - 1);
      if (tx < 0 || tx >= W) continue;

      const wxLeft = dstX <= 0 ? 1 : dx < feather ? dx / feather : 1;
      const wxRight = dstX + w >= W ? 1 : w - 1 - dx < feather ? (w - 1 - dx) / feather : 1;
      const wx = Math.min(wxLeft, wxRight);

      const alpha = 0.5 - 0.5 * Math.cos(Math.PI * Math.min(wx, wy));
      const dIdx = (ty * W + tx) * 3;
      const sIdx = (sy * W + sx) * 3;

      dst[dIdx] = clamp(
        dst[dIdx] * (1 - alpha) + src[sIdx] * brightnessScale[0] * alpha,
        0,
        255
      );
      dst[dIdx + 1] = clamp(
        dst[dIdx + 1] * (1 - alpha) + src[sIdx + 1] * brightnessScale[1] * alpha,
        0,
        255
      );
      dst[dIdx + 2] = clamp(
        dst[dIdx + 2] * (1 - alpha) + src[sIdx + 2] * brightnessScale[2] * alpha,
        0,
        255
      );
    }
  }
}

/**
 * Copy an elliptical organic puff from src to dst (zero rectangular seams!)
 */
function copyEllipticalPuff(
  dst,
  src,
  dstCx,
  dstCy,
  rx,
  ry,
  srcCx,
  srcCy,
  scale = [1, 1, 1]
) {
  const x0 = Math.max(0, Math.floor(dstCx - rx));
  const x1 = Math.min(W - 1, Math.ceil(dstCx + rx));
  const y0 = Math.max(0, Math.floor(dstCy - ry));
  const y1 = Math.min(H - 1, Math.ceil(dstCy + ry));

  for (let y = y0; y <= y1; y++) {
    const ny = (y - dstCy) / ry;
    for (let x = x0; x <= x1; x++) {
      const nx = (x - dstCx) / rx;
      const dist = Math.hypot(nx, ny);
      if (dist >= 1) continue;

      // Smooth radial falloff from center (1.0) to rim (0.0)
      const t = dist < 0.45 ? 1 : 0.5 + 0.5 * Math.cos((Math.PI * (dist - 0.45)) / 0.55);
      const sx = clamp(Math.round(srcCx + (x - dstCx)), 0, W - 1);
      const sy = clamp(Math.round(srcCy + (y - dstCy)), 0, H - 1);

      const dIdx = (y * W + x) * 3;
      const sIdx = (sy * W + sx) * 3;

      dst[dIdx] = clamp(dst[dIdx] * (1 - t) + src[sIdx] * scale[0] * t, 0, 255);
      dst[dIdx + 1] = clamp(dst[dIdx + 1] * (1 - t) + src[sIdx + 1] * scale[1] * t, 0, 255);
      dst[dIdx + 2] = clamp(dst[dIdx + 2] * (1 - t) + src[sIdx + 2] * scale[2] * t, 0, 255);
    }
  }
}

/**
 * Remove horizontal CRT/video scanlines and perform edge-preserving gouache smoothing
 */
function deScanlineAndSmoothGouache(buf) {
  const tmp = new Uint8Array(buf.length);
  for (let y = 0; y < H; y++) {
    const ym2 = Math.max(0, y - 2) * W * 3;
    const ym1 = Math.max(0, y - 1) * W * 3;
    const y0 = y * W * 3;
    const yp1 = Math.min(H - 1, y + 1) * W * 3;
    const yp2 = Math.min(H - 1, y + 2) * W * 3;

    for (let x = 0; x < W; x++) {
      const x3 = x * 3;
      for (let c = 0; c < 3; c++) {
        const v0 = buf[y0 + x3 + c];
        const vm1 = Math.abs(buf[ym1 + x3 + c] - v0) < 28 ? buf[ym1 + x3 + c] : v0;
        const vp1 = Math.abs(buf[yp1 + x3 + c] - v0) < 28 ? buf[yp1 + x3 + c] : v0;
        const vm2 = Math.abs(buf[ym2 + x3 + c] - v0) < 24 ? buf[ym2 + x3 + c] : v0;
        const vp2 = Math.abs(buf[yp2 + x3 + c] - v0) < 24 ? buf[yp2 + x3 + c] : v0;

        tmp[y0 + x3 + c] = (v0 * 4 + vm1 * 3 + vp1 * 3 + vm2 * 2 + vp2 * 2) / 14;
      }
    }
  }

  const out = new Uint8Array(buf.length);
  for (let y = 0; y < H; y++) {
    const y0 = y * W * 3;
    for (let x = 0; x < W; x++) {
      const xm2 = Math.max(0, x - 2) * 3;
      const xm1 = Math.max(0, x - 1) * 3;
      const x0 = x * 3;
      const xp1 = Math.min(W - 1, x + 1) * 3;
      const xp2 = Math.min(W - 1, x + 2) * 3;

      for (let c = 0; c < 3; c++) {
        const v0 = tmp[y0 + x0 + c];
        const vm1 = Math.abs(tmp[y0 + xm1 + c] - v0) < 24 ? tmp[y0 + xm1 + c] : v0;
        const vp1 = Math.abs(tmp[y0 + xp1 + c] - v0) < 24 ? tmp[y0 + xp1 + c] : v0;
        const vm2 = Math.abs(tmp[y0 + xm2 + c] - v0) < 20 ? tmp[y0 + xm2 + c] : v0;
        const vp2 = Math.abs(tmp[y0 + xp2 + c] - v0) < 20 ? tmp[y0 + xp2 + c] : v0;

        out[y0 + x0 + c] = (v0 * 4 + vm1 * 3 + vp1 * 3 + vm2 + vp2) / 12;
      }
    }
  }
  return out;
}

/**
 * Generate 11,500+ oriented SVG gouache brush strokes guided by the structure tensor field
 */
function buildOrientedGouacheBrushSvg(cleanRgb, seed) {
  const rng = createRng(seed);
  let strokes = '';

  const stepX = 16;
  const stepY = 14;
  for (let y = 6; y < H - 6; y += stepY) {
    for (let x = 6; x < W - 6; x += stepX) {
      const jx = clamp(Math.round(x + (rng() - 0.5) * 12), 3, W - 4);
      const jy = clamp(Math.round(y + (rng() - 0.5) * 10), 3, H - 4);
      const idx = (jy * W + jx) * 3;

      const r = cleanRgb[idx];
      const g = cleanRgb[idx + 1];
      const b = cleanRgb[idx + 2];

      const idxL = (jy * W + (jx - 3)) * 3;
      const idxR = (jy * W + (jx + 3)) * 3;
      const idxU = ((jy - 3) * W + jx) * 3;
      const idxD = ((jy + 3) * W + jx) * 3;

      const lumL = cleanRgb[idxL] * 0.3 + cleanRgb[idxL + 1] * 0.59 + cleanRgb[idxL + 2] * 0.11;
      const lumR = cleanRgb[idxR] * 0.3 + cleanRgb[idxR + 1] * 0.59 + cleanRgb[idxR + 2] * 0.11;
      const lumU = cleanRgb[idxU] * 0.3 + cleanRgb[idxU + 1] * 0.59 + cleanRgb[idxU + 2] * 0.11;
      const lumD = cleanRgb[idxD] * 0.3 + cleanRgb[idxD + 1] * 0.59 + cleanRgb[idxD + 2] * 0.11;

      const gx = lumR - lumL;
      const gy = lumD - lumU;
      const mag = Math.hypot(gx, gy);

      const angleDeg =
        mag > 8
          ? ((Math.atan2(gy, gx) + Math.PI * 0.5) * 180) / Math.PI
          : (rng() - 0.5) * 28;

      const rx = mag > 26 ? 5 + rng() * 5 : 11 + rng() * 10;
      const ry = mag > 26 ? 2.2 + rng() * 2 : 4.5 + rng() * 4.5;

      const delta = (rng() - 0.48) * 8;
      const hex = rgbToHex(r + delta * 1.1, g + delta * 0.9, b + delta * 0.7);
      const op = mag > 32 ? 0.4 : 0.52;

      strokes += `<ellipse cx="${jx}" cy="${jy}" rx="${rx.toFixed(1)}" ry="${ry.toFixed(1)}" fill="${hex}" fill-opacity="${op}" transform="rotate(${angleDeg.toFixed(0)} ${jx} ${jy})" />`;
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
    <defs>
      <pattern id="cottonGrain" width="24" height="6" patternUnits="userSpaceOnUse">
        <line x1="0" y1="3" x2="24" y2="3" stroke="#231F1C" stroke-width="0.6" stroke-opacity="0.03" />
      </pattern>
      <radialGradient id="softFrame" cx="50%" cy="50%" r="72%">
        <stop offset="70%" stop-color="#000000" stop-opacity="0" />
        <stop offset="100%" stop-color="#14110E" stop-opacity="0.12" />
      </radialGradient>
    </defs>
    <g>${strokes}</g>
    <rect width="${W}" height="${H}" fill="url(#cottonGrain)" />
    <rect width="${W}" height="${H}" fill="url(#softFrame)" />
  </svg>`;
}

async function renderFinalScene(name, rawCleanRgb, seed, card1Crop, card2Crop) {
  const smoothed = deScanlineAndSmoothGouache(rawCleanRgb);
  const brushSvg = buildOrientedGouacheBrushSvg(smoothed, seed);

  const outJpg = path.join(OUT_DIR, `${name}.jpg`);
  const card1Jpg = path.join(OUT_DIR, `${name}_card1.jpg`);
  const card2Jpg = path.join(OUT_DIR, `${name}_card2.jpg`);

  const masterBuf = await sharp(Buffer.from(smoothed.buffer), {
    raw: { width: W, height: H, channels: 3 },
  })
    .modulate({ saturation: 1.12, brightness: 1.02 })
    .composite([{ input: Buffer.from(brushSvg), top: 0, left: 0 }])
    .sharpen({ sigma: 1.15, m1: 1.2, m2: 2.2 })
    .jpeg({ quality: 95, chromaSubsampling: '4:4:4' })
    .toBuffer();

  await fs.promises.writeFile(outJpg, masterBuf);

  await sharp(masterBuf)
    .extract(card1Crop)
    .resize(720, 960, { fit: 'cover', kernel: 'lanczos3' })
    .sharpen({ sigma: 0.9 })
    .jpeg({ quality: 94, chromaSubsampling: '4:4:4' })
    .toFile(card1Jpg);

  await sharp(masterBuf)
    .extract(card2Crop)
    .resize(720, 960, { fit: 'cover', kernel: 'lanczos3' })
    .sharpen({ sigma: 0.9 })
    .jpeg({ quality: 94, chromaSubsampling: '4:4:4' })
    .toFile(card2Jpg);

  console.log('Synthesized clean 1600x1040 gouache scene:', outJpg);
}

async function main() {
  // ==========================================================================
  // 1. SCENE 01: CLOUDS OPENING (00:01) — Organic Elliptical Cumulus Synthesis
  // ==========================================================================
  const s1 = await loadRgb('public/assets/seq/frame_014.jpg');
  const s1Src = new Uint8Array(s1);

  // Clean top-right text ("We make animated films...") using soft elliptical cloud puffs from upper sky
  copyEllipticalPuff(s1, s1Src, 1280, 145, 310, 110, 740, 130, [0.97, 0.98, 1.0]);
  copyEllipticalPuff(s1, s1Src, 1140, 145, 220, 95, 660, 120, [0.98, 0.99, 1.0]);

  // Clean bottom-left headline ("We paint the city one frame at a time.") & bottom ticker using overlapping elliptical cloud domes!
  copyEllipticalPuff(s1, s1Src, 75, 785, 190, 175, 290, 420, [0.97, 0.98, 0.99]);
  copyEllipticalPuff(s1, s1Src, 220, 790, 290, 180, 440, 430, [0.97, 0.98, 0.99]);
  copyEllipticalPuff(s1, s1Src, 520, 810, 320, 185, 690, 350, [0.95, 0.96, 0.98]);
  copyEllipticalPuff(s1, s1Src, 820, 835, 290, 175, 590, 460, [0.94, 0.95, 0.98]);
  copyEllipticalPuff(s1, s1Src, 160, 960, 280, 140, 360, 480, [0.95, 0.96, 0.98]);
  copyEllipticalPuff(s1, s1Src, 560, 965, 360, 135, 680, 440, [0.94, 0.95, 0.98]);
  copyEllipticalPuff(s1, s1Src, 980, 965, 360, 135, 1180, 620, [0.95, 0.96, 0.98]);
  copyEllipticalPuff(s1, s1Src, 1450, 955, 360, 150, 1290, 620, [0.97, 0.98, 0.99]);
  // Clean bottom-right vertical stamp ("秋の街 AUTUMN CITY")
  copyEllipticalPuff(s1, s1Src, 1535, 815, 115, 150, 1360, 640, [0.98, 0.98, 1.0]);
  // Clean bottom black border
  copyPatch(s1, s1, 0, 1005, 1600, 35, 0, 945, 12, [1, 1, 1]);

  await renderFinalScene(
    'gen_scene_01_clouds',
    s1,
    101,
    { left: 120, top: 40, width: 720, height: 960 },
    { left: 740, top: 40, width: 720, height: 960 }
  );

  // ==========================================================================
  // 2. SCENE 02: AUTUMN AVENUE (00:02) — Complete Bottom-Left & Bottom-Right Restoration
  // ==========================================================================
  const s2 = await loadRgb('public/assets/seq/frame_024.jpg');
  const s2Src = new Uint8Array(s2);

  // 1. Remove cursor blur patch on right orange tree (x: 1020..1150, y: 470..610)
  copyEllipticalPuff(s2, s2Src, 1085, 540, 85, 85, 960, 535, [1.02, 0.98, 0.95]);

  // 2. Clean entire bottom-left headline ("Small team. Slow pencils. Big skies." at x: 0..640, y: 680..1030)
  // Paint lush dark-orange & crimson foreground maple tree clusters on the left (x: 0..560, y: 660..1040)
  copyEllipticalPuff(s2, s2Src, 180, 770, 240, 160, 340, 590, [0.88, 0.84, 0.82]);
  copyEllipticalPuff(s2, s2Src, 420, 735, 185, 115, 515, 575, [0.92, 0.88, 0.86]);
  copyEllipticalPuff(s2, s2Src, 150, 920, 250, 165, 350, 580, [0.76, 0.72, 0.72]);
  copyEllipticalPuff(s2, s2Src, 330, 860, 210, 160, 540, 580, [0.82, 0.78, 0.78]);
  copyEllipticalPuff(s2, s2Src, 310, 975, 220, 120, 540, 595, [0.74, 0.70, 0.72]);
  // Reconstruct the shaded asphalt road lanes on (x: 380..660, y: 760..1040) from the clean central shaded road (x: 620..880, y: 750..1010)
  copyPatch(s2, s2Src, 385, 765, 285, 270, 625, 750, 42, [0.94, 0.94, 0.96]);

  // 3. Clean bottom-right text ("Eleven artists..." & "秋") at (x: 1030..1580, y: 790..960)
  copyEllipticalPuff(s2, s2Src, 1280, 865, 280, 130, 1260, 670, [0.85, 0.82, 0.82]);
  copyEllipticalPuff(s2, s2Src, 1480, 860, 160, 130, 1360, 680, [0.82, 0.80, 0.80]);
  copyPatch(s2, s2, 0, 1008, 1600, 32, 0, 965, 10, [1, 1, 1]);

  await renderFinalScene(
    'gen_scene_02_avenue',
    s2,
    202,
    { left: 260, top: 40, width: 720, height: 960 },
    { left: 540, top: 40, width: 720, height: 960 }
  );

  // ==========================================================================
  // 3. SCENE 03: GIRL LOOKING UP AT TERRACOTTA SKYSCRAPERS (00:04)
  // ==========================================================================
  const s3 = await loadRgb('public/assets/seq/frame_045.jpg');
  const s3Src = new Uint8Array(s3);
  // Clean tiny kanji at bottom-right (x: 1500..1580, y: 760..910)
  copyPatch(s3, s3Src, 1490, 750, 100, 170, 1380, 750, 24, [1, 1, 1]);
  copyPatch(s3, s3Src, 1035, 495, 95, 95, 955, 495, 20, [0.98, 0.98, 1.0]);
  copyPatch(s3, s3, 0, 1010, 1600, 30, 0, 975, 10, [1, 1, 1]);

  await renderFinalScene(
    'gen_scene_03_girl',
    s3,
    303,
    { left: 420, top: 50, width: 720, height: 960 },
    { left: 80, top: 40, width: 720, height: 960 }
  );

  // ==========================================================================
  // 4. SCENE 04: CLASSICAL FACADE BEHIND PARTING CLOUDS (00:05)
  // ==========================================================================
  const s4 = await loadRgb('public/assets/seq/frame_068.jpg');
  const s4Src = new Uint8Array(s4);
  // Completely replace "When did you last look up?" (x: 575..1020, y: 365..520)
  // Top half of text (y: 365..465) replaced with upper window panes (y: 275..375)
  copyPatch(s4, s4Src, 575, 365, 445, 105, 575, 275, 18, [0.98, 0.96, 0.95]);
  // Bottom half of text on window sill/mullion (y: 445..525) replaced with upper stone cornice/ledge (y: 185..265)
  copyPatch(s4, s4Src, 575, 450, 445, 78, 575, 190, 18, [0.94, 0.92, 0.91]);
  // Clean tiny mark on bottom-right cloud (x: 1500..1585, y: 765..840)
  copyEllipticalPuff(s4, s4Src, 1545, 800, 65, 55, 1410, 800, [1, 1, 1]);
  copyPatch(s4, s4, 0, 1010, 1600, 30, 0, 975, 10, [1, 1, 1]);

  await renderFinalScene(
    'gen_scene_04_lookup',
    s4,
    404,
    { left: 440, top: 40, width: 720, height: 960 },
    { left: 160, top: 40, width: 720, height: 960 }
  );

  // ==========================================================================
  // 5. SCENE 05: STUDIO ANIMATOR AT DESK & BILLOWING CURTAIN (00:06)
  // ==========================================================================
  const s5 = await loadRgb('public/assets/seq/frame_080.jpg');
  const s5Src = new Uint8Array(s5);
  copyPatch(s5, s5Src, 1035, 495, 90, 95, 965, 495, 20, [1, 1, 1]);
  copyPatch(s5, s5, 0, 1010, 1600, 30, 0, 975, 10, [1, 1, 1]);

  await renderFinalScene(
    'gen_scene_05_studio',
    s5,
    505,
    { left: 110, top: 40, width: 720, height: 960 },
    { left: 740, top: 40, width: 720, height: 960 }
  );

  // ==========================================================================
  // 6. SCENE 06: PANORAMIC AUTUMN SKYLINE & FLOATING LEAVES (00:07)
  // ==========================================================================
  const s6 = await loadRgb('public/assets/generated/_temp_sky_03.jpg');
  const s6Late = await loadRgb('public/assets/generated/_temp_sky_06.jpg');
  const s6Src = new Uint8Array(s6);

  // 1. Completely erase mouse cursor arrow at (x: 1055..1125, y: 525..615)
  copyPatch(s6, s6Src, 1045, 515, 95, 125, 935, 515, 16, [1, 1, 1]);

  // 2. Clean bottom-right text ("Sketches go up on one wall...") and "描く" stamp using s6Late + organic golden canopy puffs
  copyPatch(s6, s6Late, 1030, 820, 570, 220, 1030, 820, 32, [1.02, 1.02, 1.02]);
  copyEllipticalPuff(s6, s6Src, 1210, 925, 220, 115, 760, 710, [0.95, 0.93, 0.90]);
  copyEllipticalPuff(s6, s6Src, 1480, 925, 160, 115, 1440, 720, [0.94, 0.92, 0.90]);

  // 3. Clean entire bottom-left headline ("Sketch, layout, paint, motion.") right down to y=1040 using organic autumn tree canopy puffs!
  copyEllipticalPuff(s6, s6Src, 190, 845, 240, 130, 250, 650, [0.95, 0.93, 0.90]);
  copyEllipticalPuff(s6, s6Src, 490, 855, 260, 135, 520, 660, [0.94, 0.92, 0.90]);
  copyEllipticalPuff(s6, s6Src, 650, 845, 160, 110, 740, 675, [0.94, 0.92, 0.90]);
  copyEllipticalPuff(s6, s6Src, 180, 965, 250, 110, 280, 680, [0.92, 0.90, 0.88]);
  copyEllipticalPuff(s6, s6Src, 480, 965, 260, 110, 560, 690, [0.90, 0.88, 0.86]);
  copyPatch(s6, s6, 0, 1005, 1600, 35, 0, 950, 10, [1, 1, 1]);

  await renderFinalScene(
    'gen_scene_06_skyline',
    s6,
    606,
    { left: 30, top: 40, width: 720, height: 960 },
    { left: 840, top: 40, width: 720, height: 960 }
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
