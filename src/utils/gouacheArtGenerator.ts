/**
 * High-Resolution Hand-Painted 2D Gouache Art Generator & Multiplane Renderer
 * Produces crisp, retina-grade gouache illustrations with authentic bristle texture,
 * cold-pressed cotton paper grain, architectural depth, and atmospheric lighting.
 */

export type ArtworkSceneId =
  | 'clouds_opening'
  | 'clouds_horizon'
  | 'autumn_avenue'
  | 'avenue_dusk'
  | 'girl_looking_up'
  | 'terracotta_tower'
  | 'facade_clouds'
  | 'window_artist'
  | 'window_curtain'
  | 'skyline_canopy'
  | 'skyline_east'
  | 'tram_crossing';

const artworkCache = new Map<string, string>();

// Deterministic pseudo-random generator for consistent brush strokes
function createRng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

/**
 * Paint organic gouache cumulus cloud bank with layered bristle dabs
 */
function paintCloudBank(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  seed: number,
  highlightColor = '#FCFBF7',
  midColor = '#DCE4EE',
  shadowColor = '#8FA2BC'
) {
  const rng = createRng(seed);

  // Base shadow belly
  for (let i = 0; i < 28; i++) {
    const angle = rng() * Math.PI * 2;
    const dist = Math.pow(rng(), 0.7) * 0.85;
    const px = cx + Math.cos(angle) * rx * dist;
    const py = cy + Math.sin(angle) * ry * dist + ry * 0.18;
    const rad = (0.22 + rng() * 0.35) * Math.min(rx, ry);

    const grad = ctx.createRadialGradient(px, py - rad * 0.2, rad * 0.1, px, py, rad);
    grad.addColorStop(0, shadowColor);
    grad.addColorStop(0.7, midColor);
    grad.addColorStop(1, 'rgba(220, 228, 238, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(px, py, rad, 0, Math.PI * 2);
    ctx.fill();
  }

  // Billowing sunlit top domes
  for (let i = 0; i < 42; i++) {
    const t = (i / 41) * Math.PI - Math.PI;
    const spreadX = Math.cos(t) * rx * (0.65 + rng() * 0.35);
    const spreadY = Math.sin(t) * ry * (0.45 + rng() * 0.45);
    const px = cx + spreadX;
    const py = cy + spreadY * 0.75 - ry * 0.1;
    const rad = (0.2 + rng() * 0.38) * Math.min(rx, ry);

    const grad = ctx.createRadialGradient(
      px - rad * 0.25,
      py - rad * 0.25,
      rad * 0.08,
      px,
      py,
      rad
    );
    grad.addColorStop(0, highlightColor);
    grad.addColorStop(0.65, '#F2EFE9');
    grad.addColorStop(1, 'rgba(242, 239, 233, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(px, py, rad, 0, Math.PI * 2);
    ctx.fill();
  }
}

/**
 * Paint gouache autumn foliage cluster with individual bristle dabs
 */
function paintFoliageCluster(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  seed: number,
  palette = ['#7C2D12', '#C2410C', '#EA580C', '#F59E0B', '#FDE047']
) {
  const rng = createRng(seed);
  const count = 65;

  for (let i = 0; i < count; i++) {
    const colorIdx = Math.min(
      palette.length - 1,
      Math.floor((i / count) * palette.length)
    );
    const angle = rng() * Math.PI * 2;
    const r = Math.pow(rng(), 0.65) * radius;
    // Shift brighter colors toward top-left sun
    const sunBiasX = (colorIdx / palette.length) * -radius * 0.18;
    const sunBiasY = (colorIdx / palette.length) * -radius * 0.22;
    const px = cx + Math.cos(angle) * r + sunBiasX;
    const py = cy + Math.sin(angle) * r * 0.82 + sunBiasY;
    const dabW = radius * (0.14 + rng() * 0.18);
    const dabH = dabW * (0.55 + rng() * 0.35);

    ctx.save();
    ctx.translate(px, py);
    ctx.rotate((rng() - 0.5) * 0.9);
    ctx.fillStyle = palette[colorIdx];
    ctx.globalAlpha = 0.85;
    ctx.beginPath();
    ctx.ellipse(0, 0, dabW, dabH, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

/**
 * Paint architectural skyscraper or building block with painterly window reflections
 */
function paintBuildingBlock(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  baseColor: string,
  litEdgeColor: string,
  windowColor: string,
  seed: number,
  litSide: 'left' | 'right' = 'left'
) {
  const rng = createRng(seed);

  // Main architectural mass
  const grad = ctx.createLinearGradient(x, y, x + w, y + h);
  if (litSide === 'left') {
    grad.addColorStop(0, litEdgeColor);
    grad.addColorStop(0.28, baseColor);
    grad.addColorStop(1, '#1E2633');
  } else {
    grad.addColorStop(0, '#1E2633');
    grad.addColorStop(0.72, baseColor);
    grad.addColorStop(1, litEdgeColor);
  }
  ctx.fillStyle = grad;
  ctx.fillRect(x, y, w, h);

  // Window grid with painterly variations
  const cols = Math.max(3, Math.floor(w / 18));
  const rows = Math.max(6, Math.floor(h / 24));
  const padX = w * 0.1;
  const padY = 18;
  const cellW = (w - padX * 2) / cols;
  const cellH = (h - padY * 2) / rows;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (rng() > 0.18) {
        const wx = x + padX + c * cellW + 2;
        const wy = y + padY + r * cellH + 2;
        const ww = Math.max(3, cellW - 5);
        const wh = Math.max(5, cellH - 6);

        ctx.fillStyle =
          rng() > 0.78
            ? '#F7C97E'
            : rng() > 0.45
            ? windowColor
            : 'rgba(255,255,255,0.12)';
        ctx.globalAlpha = 0.35 + rng() * 0.5;
        ctx.fillRect(wx, wy, ww, wh);
      }
    }
  }
  ctx.globalAlpha = 1;
}

/**
 * Apply cold-pressed cotton paper grain & subtle horizontal rule lines
 */
function applyPaperTextureOverlay(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number
) {
  ctx.save();
  ctx.strokeStyle = 'rgba(30, 27, 24, 0.045)';
  ctx.lineWidth = 1;
  for (let y = 0; y < h; y += 6) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }

  // Warm vignette
  const vig = ctx.createRadialGradient(
    w * 0.5,
    h * 0.5,
    Math.min(w, h) * 0.35,
    w * 0.5,
    h * 0.5,
    Math.max(w, h) * 0.75
  );
  vig.addColorStop(0, 'rgba(0,0,0,0)');
  vig.addColorStop(1, 'rgba(18, 15, 12, 0.22)');
  ctx.fillStyle = vig;
  ctx.fillRect(0, 0, w, h);
  ctx.restore();
}

/**
 * Paint a specific scene onto any target Canvas2D context at arbitrary resolution
 */
export function renderGouacheSceneToCanvas(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  sceneId: ArtworkSceneId,
  parallaxOffset = 0
) {
  ctx.save();
  ctx.clearRect(0, 0, w, h);

  const pxShift = parallaxOffset * w * 0.04;

  switch (sceneId) {
    case 'clouds_opening':
    case 'clouds_horizon': {
      // Cerulean & cobalt gouache sky gradient
      const sky = ctx.createLinearGradient(0, 0, 0, h);
      sky.addColorStop(0, '#5A78A0');
      sky.addColorStop(0.55, '#86A4C6');
      sky.addColorStop(1, '#DCE5EF');
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, w, h);

      // Towering cumulus cloud beds
      paintCloudBank(
        ctx,
        w * 0.25 + pxShift * 0.4,
        h * 0.36,
        w * 0.38,
        h * 0.28,
        101
      );
      paintCloudBank(
        ctx,
        w * 0.72 - pxShift * 0.5,
        h * 0.42,
        w * 0.42,
        h * 0.34,
        202
      );
      paintCloudBank(
        ctx,
        w * 0.48 + pxShift * 0.8,
        h * 0.68,
        w * 0.55,
        h * 0.32,
        303,
        '#FFFFFF',
        '#E6EDF5',
        '#9FB2C9'
      );
      break;
    }

    case 'autumn_avenue':
    case 'avenue_dusk':
    case 'tram_crossing': {
      // Golden hour sky between skyscrapers
      const sky = ctx.createLinearGradient(0, 0, 0, h * 0.72);
      sky.addColorStop(0, '#5B7DA6');
      sky.addColorStop(0.5, '#9BB4CC');
      sky.addColorStop(1, '#F3C78B');
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, w, h);

      // Distant hazy skyline
      paintBuildingBlock(ctx, w * 0.38, h * 0.18, w * 0.08, h * 0.45, '#7E95B0', '#A5BBD0', '#DCE7F3', 11);
      paintBuildingBlock(ctx, w * 0.48, h * 0.12, w * 0.09, h * 0.5, '#7289A6', '#9CB3CA', '#DCE7F3', 12);
      paintBuildingBlock(ctx, w * 0.56, h * 0.22, w * 0.07, h * 0.42, '#869BB4', '#B2C5D8', '#DCE7F3', 13);

      // Perspective avenue road
      ctx.fillStyle = '#363C48';
      ctx.beginPath();
      ctx.moveTo(w * 0.43, h * 0.58);
      ctx.lineTo(w * 0.57, h * 0.58);
      ctx.lineTo(w * 0.86, h);
      ctx.lineTo(w * 0.14, h);
      ctx.closePath();
      ctx.fill();

      // Golden sunlight shaft across avenue
      const sunShaft = ctx.createLinearGradient(w * 0.2, h * 0.65, w * 0.8, h * 0.85);
      sunShaft.addColorStop(0, 'rgba(245, 178, 92, 0.55)');
      sunShaft.addColorStop(1, 'rgba(245, 178, 92, 0.05)');
      ctx.fillStyle = sunShaft;
      ctx.fillRect(w * 0.15, h * 0.66, w * 0.7, h * 0.16);

      // Center road markings
      ctx.strokeStyle = '#E5B869';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(w * 0.5, h * 0.58);
      ctx.lineTo(w * 0.5, h);
      ctx.stroke();

      // Left & Right canyon glass/concrete buildings
      paintBuildingBlock(
        ctx,
        -w * 0.02 + pxShift * 0.3,
        -h * 0.05,
        w * 0.28,
        h * 0.95,
        '#384B63',
        '#6D87A6',
        '#89A8C9',
        21,
        'right'
      );
      paintBuildingBlock(
        ctx,
        w * 0.16 + pxShift * 0.15,
        h * 0.32,
        w * 0.2,
        h * 0.55,
        '#8A796D',
        '#C7A98E',
        '#4A3F39',
        22,
        'right'
      );
      paintBuildingBlock(
        ctx,
        w * 0.68 - pxShift * 0.2,
        h * 0.08,
        w * 0.18,
        h * 0.78,
        '#4A5E78',
        '#89A3BE',
        '#B8CDE0',
        23,
        'left'
      );
      paintBuildingBlock(
        ctx,
        w * 0.8 - pxShift * 0.35,
        -h * 0.04,
        w * 0.24,
        h * 0.98,
        '#2C3A4E',
        '#D97B38',
        '#6A839E',
        24,
        'left'
      );

      // Glowing autumn maple & ginkgo trees lining both sides of the avenue
      for (let i = 0; i < 5; i++) {
        const depth = i / 4;
        const lx = w * (0.39 - depth * 0.22);
        const rx = w * (0.61 + depth * 0.22);
        const ty = h * (0.56 + depth * 0.36);
        const rad = w * (0.045 + depth * 0.065);

        paintFoliageCluster(ctx, lx, ty, rad, 300 + i);
        paintFoliageCluster(ctx, rx, ty, rad, 400 + i);
      }
      break;
    }

    case 'girl_looking_up':
    case 'terracotta_tower': {
      // Warm late-afternoon sky
      const sky = ctx.createLinearGradient(0, 0, w, h);
      sky.addColorStop(0, '#6A83A4');
      sky.addColorStop(0.5, '#C89B7B');
      sky.addColorStop(1, '#E6A15C');
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, w, h);

      // Dramatic upward-perspective terracotta apartment & office blocks
      ctx.save();
      ctx.translate(w * 0.5, h * 0.5);
      ctx.rotate(-0.18);
      paintBuildingBlock(
        ctx,
        -w * 0.48,
        -h * 0.55,
        w * 0.46,
        h * 1.2,
        '#8C432B',
        '#D97438',
        '#F2B36D',
        51,
        'right'
      );
      paintBuildingBlock(
        ctx,
        w * 0.04,
        -h * 0.5,
        w * 0.38,
        h * 1.1,
        '#B88C6E',
        '#EBD2B7',
        '#785A46',
        52,
        'left'
      );
      ctx.restore();

      // Rich red-orange maple canopy overhanging top-left and mid-right
      paintFoliageCluster(ctx, w * 0.18, h * 0.18, w * 0.16, 501);
      paintFoliageCluster(ctx, w * 0.52, h * 0.32, w * 0.14, 502);
      paintFoliageCluster(ctx, w * 0.78, h * 0.62, w * 0.18, 503);

      // Stylized 2D anime character in white sailor shirt looking up (if girl_looking_up)
      if (sceneId === 'girl_looking_up') {
        const cx = w * 0.52 + pxShift * 0.5;
        const cy = h * 0.68;
        const scale = Math.min(w, h) * 0.0014;

        ctx.save();
        ctx.translate(cx, cy);
        ctx.scale(scale, scale);

        // Pleated dark skirt
        ctx.fillStyle = '#23252C';
        ctx.beginPath();
        ctx.moveTo(-42, 110);
        ctx.lineTo(48, 110);
        ctx.lineTo(68, 240);
        ctx.lineTo(-62, 240);
        ctx.closePath();
        ctx.fill();

        // Crisp white sunlit sailor blouse
        ctx.fillStyle = '#F5F0E6';
        ctx.beginPath();
        ctx.moveTo(-36, -15);
        ctx.lineTo(38, -10);
        ctx.lineTo(52, 115);
        ctx.lineTo(-46, 115);
        ctx.closePath();
        ctx.fill();

        // Navy sailor collar fluttering in breeze
        ctx.fillStyle = '#273042';
        ctx.beginPath();
        ctx.moveTo(-38, -15);
        ctx.lineTo(36, -12);
        ctx.lineTo(24, 38);
        ctx.lineTo(-48, 28);
        ctx.closePath();
        ctx.fill();

        // Neck & chin tilted upward
        ctx.fillStyle = '#F2C6A0';
        ctx.beginPath();
        ctx.ellipse(-6, -52, 24, 28, -0.25, 0, Math.PI * 2);
        ctx.fill();

        // Wind-swept dark chestnut bob hair with golden rim light
        ctx.fillStyle = '#332421';
        ctx.beginPath();
        ctx.arc(4, -58, 38, -Math.PI * 0.85, Math.PI * 0.65);
        ctx.lineTo(-32, -20);
        ctx.closePath();
        ctx.fill();

        // Rim highlight on hair
        ctx.strokeStyle = '#F5B062';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(-4, -62, 37, -Math.PI * 0.85, -Math.PI * 0.2);
        ctx.stroke();

        ctx.restore();
      }
      break;
    }

    case 'facade_clouds': {
      // Soft limestone classical facade framed by parting white clouds
      ctx.fillStyle = '#8FA4BE';
      ctx.fillRect(0, 0, w, h);

      // Classical heritage building facade in center
      const bx = w * 0.18;
      const bw = w * 0.64;
      ctx.fillStyle = '#C9B39B';
      ctx.fillRect(bx, h * 0.08, bw, h * 0.86);

      // Cornice & moldings
      ctx.fillStyle = '#DFCBB5';
      ctx.fillRect(bx - 10, h * 0.24, bw + 20, 14);
      ctx.fillRect(bx - 6, h * 0.54, bw + 12, 10);

      // Tall arched/casement windows
      const winCols = 4;
      const winW = (bw * 0.72) / winCols;
      const gap = (bw * 0.28) / (winCols + 1);
      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < winCols; c++) {
          const wx = bx + gap + c * (winW + gap);
          const wy = h * (0.11 + r * 0.26);
          ctx.fillStyle = '#536475';
          ctx.fillRect(wx, wy, winW, h * 0.18);
          ctx.strokeStyle = '#EAE0D3';
          ctx.lineWidth = 2;
          ctx.strokeRect(wx, wy, winW, h * 0.18);
        }
      }

      // Foreground parting cloud curtains on left & right
      paintCloudBank(
        ctx,
        w * 0.12 - pxShift * 0.9,
        h * 0.52,
        w * 0.36,
        h * 0.45,
        601
      );
      paintCloudBank(
        ctx,
        w * 0.88 + pxShift * 0.9,
        h * 0.56,
        w * 0.38,
        h * 0.45,
        602
      );
      break;
    }

    case 'window_artist':
    case 'window_curtain': {
      // Warm interior studio room looking out a wide timber window onto the city
      ctx.fillStyle = '#4B392C';
      ctx.fillRect(0, 0, w, h);

      // Warm sunlit wall gradient
      const wallGrad = ctx.createRadialGradient(
        w * 0.48,
        h * 0.42,
        w * 0.1,
        w * 0.5,
        h * 0.5,
        w * 0.75
      );
      wallGrad.addColorStop(0, '#7D6049');
      wallGrad.addColorStop(1, '#2E231B');
      ctx.fillStyle = wallGrad;
      ctx.fillRect(0, 0, w, h);

      // Center window opening with sky & distant buildings outside
      const wx = w * 0.27;
      const wy = h * 0.18;
      const ww = w * 0.44;
      const wh = h * 0.42;

      const outSky = ctx.createLinearGradient(wx, wy, wx, wy + wh);
      outSky.addColorStop(0, '#8AB0D0');
      outSky.addColorStop(1, '#F5DEC2');
      ctx.fillStyle = outSky;
      ctx.fillRect(wx, wy, ww, wh);

      // Distant city silhouettes outside window
      paintBuildingBlock(ctx, wx + ww * 0.1, wy + wh * 0.35, ww * 0.16, wh * 0.65, '#9BB0C4', '#C4D4E2', '#EAF0F6', 71);
      paintBuildingBlock(ctx, wx + ww * 0.68, wy + wh * 0.25, ww * 0.18, wh * 0.75, '#92A8BE', '#BDD0E0', '#EAF0F6', 72);

      // Timber window mullions
      ctx.strokeStyle = '#3B2B20';
      ctx.lineWidth = 6;
      ctx.strokeRect(wx, wy, ww, wh);
      ctx.beginPath();
      ctx.moveTo(wx + ww * 0.33, wy);
      ctx.lineTo(wx + ww * 0.33, wy + wh);
      ctx.moveTo(wx + ww * 0.66, wy);
      ctx.lineTo(wx + ww * 0.66, wy + wh);
      ctx.moveTo(wx, wy + wh * 0.55);
      ctx.lineTo(wx + ww, wy + wh * 0.55);
      ctx.stroke();

      // Blowing translucent white curtain on left side
      ctx.fillStyle = 'rgba(248, 244, 236, 0.88)';
      ctx.beginPath();
      ctx.moveTo(w * 0.08, h * 0.08);
      ctx.quadraticCurveTo(w * 0.22 + pxShift * 0.5, h * 0.38, w * 0.29, h * 0.52);
      ctx.lineTo(w * 0.14, h * 0.68);
      ctx.quadraticCurveTo(w * 0.06, h * 0.42, w * 0.04, h * 0.12);
      ctx.closePath();
      ctx.fill();

      // Pinned storyboard sketches on right wall
      const rng = createRng(707);
      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
          const sx = w * 0.77 + c * (w * 0.055);
          const sy = h * 0.18 + r * (h * 0.12);
          ctx.fillStyle = 'rgba(235, 226, 212, 0.78)';
          ctx.fillRect(sx, sy, w * 0.042, h * 0.09 + (rng() - 0.5) * 6);
        }
      }

      // Animator desk & glowing monitor on right
      ctx.fillStyle = '#5C4433';
      ctx.fillRect(w * 0.52, h * 0.62, w * 0.34, h * 0.03);
      ctx.fillRect(w * 0.55, h * 0.65, w * 0.02, h * 0.28);
      ctx.fillRect(w * 0.81, h * 0.65, w * 0.02, h * 0.28);

      // Animator silhouette seated at desk
      if (sceneId === 'window_artist') {
        ctx.fillStyle = '#2B3548';
        ctx.beginPath();
        ctx.roundRect(w * 0.61, h * 0.46, w * 0.13, h * 0.22, 24);
        ctx.fill();
        ctx.fillStyle = '#231D1A';
        ctx.beginPath();
        ctx.arc(w * 0.675, h * 0.39, w * 0.032, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    }

    case 'skyline_canopy':
    case 'skyline_east': {
      // Expansive blue sky over golden autumn city forest
      const sky = ctx.createLinearGradient(0, 0, 0, h * 0.65);
      sky.addColorStop(0, '#4A78A8');
      sky.addColorStop(0.55, '#89B2D4');
      sky.addColorStop(1, '#F2D5A7');
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, w, h);

      // Left & Right landmark glass towers
      paintBuildingBlock(
        ctx,
        w * 0.08 + pxShift * 0.25,
        h * 0.28,
        w * 0.12,
        h * 0.62,
        '#4E7396',
        '#90B8DC',
        '#CBE2F5',
        81,
        'right'
      );
      paintBuildingBlock(
        ctx,
        w * 0.81 - pxShift * 0.25,
        h * 0.22,
        w * 0.11,
        h * 0.68,
        '#7A9BB8',
        '#EBF2F7',
        '#9AB6CE',
        82,
        'left'
      );

      // Distant city horizon blocks
      for (let i = 0; i < 9; i++) {
        paintBuildingBlock(
          ctx,
          w * (0.22 + i * 0.065),
          h * (0.52 + (i % 3) * 0.03),
          w * 0.05,
          h * 0.22,
          '#8EA4B8',
          '#C5D4E2',
          '#E2EBF2',
          800 + i
        );
      }

      // Lush sea of golden-orange autumn treetops across bottom third
      for (let i = 0; i < 11; i++) {
        const cx = (w * i) / 10;
        const cy = h * (0.76 + (i % 2) * 0.06);
        paintFoliageCluster(ctx, cx, cy, w * 0.13, 900 + i);
      }
      break;
    }
  }

  applyPaperTextureOverlay(ctx, w, h);
  ctx.restore();
}

/**
 * Generate and cache a crisp high-resolution data URL for 3D Ring Cards & Stills
 */
export function getSharpGouacheCardUrl(
  sceneId: ArtworkSceneId,
  width = 600,
  height = 800
): string {
  const key = `${sceneId}_${width}x${height}`;
  const cached = artworkCache.get(key);
  if (cached) return cached;

  if (typeof document === 'undefined') return '';
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  renderGouacheSceneToCanvas(ctx, width, height, sceneId, 0);
  const dataUrl = canvas.toDataURL('image/jpeg', 0.94);
  artworkCache.set(key, dataUrl);
  return dataUrl;
}
