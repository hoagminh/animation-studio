import React, { useEffect, useMemo, useRef } from 'react';
import { SCROLLY_CHAPTERS } from '../data/studioData';

interface ScrollyCinemaStageProps {
  stageProgress: number;
  onJumpToWorks: () => void;
}


const SCENE_LAYERS: {
  id: string;
  src: string;
  start: number;
  peakStart: number;
  peakEnd: number;
  end: number;
  startScale: number;
  endScale: number;
  startY: number;
  endY: number;
}[] = [
  {
    id: 'scene-01-clouds',
    src: '/assets/generated/gen_scene_01_clouds.jpg',
    start: -0.05,
    peakStart: 0.0,
    peakEnd: 0.14,
    end: 0.22,
    startScale: 1.02,
    endScale: 1.12,
    startY: 0,
    endY: -24,
  },
  {
    id: 'scene-02-avenue',
    src: '/assets/generated/gen_scene_02_avenue.jpg',
    start: 0.13,
    peakStart: 0.20,
    peakEnd: 0.34,
    end: 0.42,
    startScale: 1.10,
    endScale: 1.01,
    startY: 28,
    endY: -14,
  },
  {
    id: 'scene-03-girl',
    src: '/assets/generated/gen_scene_03_girl.jpg',
    start: 0.33,
    peakStart: 0.40,
    peakEnd: 0.53,
    end: 0.60,
    startScale: 1.08,
    endScale: 1.0,
    startY: 22,
    endY: -16,
  },
  {
    id: 'scene-04-lookup',
    src: '/assets/generated/gen_scene_04_lookup.jpg',
    start: 0.52,
    peakStart: 0.58,
    peakEnd: 0.69,
    end: 0.76,
    startScale: 1.0,
    endScale: 1.14,
    startY: 10,
    endY: -10,
  },
  {
    id: 'scene-05-studio',
    src: '/assets/generated/gen_scene_05_studio.jpg',
    start: 0.68,
    peakStart: 0.74,
    peakEnd: 0.84,
    end: 0.90,
    startScale: 1.02,
    endScale: 1.16,
    startY: 8,
    endY: -8,
  },
  {
    id: 'scene-06-skyline',
    src: '/assets/generated/gen_scene_06_skyline.jpg',
    start: 0.82,
    peakStart: 0.88,
    peakEnd: 1.0,
    end: 1.08,
    startScale: 1.09,
    endScale: 1.0,
    startY: 16,
    endY: 0,
  },
];

function clamp01(v: number): number {
  return Math.max(0, Math.min(1, v));
}

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = clamp01((x - edge0) / Math.max(0.0001, edge1 - edge0));
  return t * t * (3 - 2 * t);
}

const BlurRevealHeadline: React.FC<{
  lines: string[];
  chapterLocalProgress: number;
  isLightText: boolean;
  centered?: boolean;
}> = ({ lines, chapterLocalProgress, isLightText, centered = false }) => {
  const enterT = smoothstep(0.0, 0.26, chapterLocalProgress);
  const exitT = smoothstep(0.76, 0.98, chapterLocalProgress);

  const totalChars = useMemo(
    () => lines.reduce((acc, l) => acc + l.length, 0),
    [lines]
  );

  let charCursor = 0;

  return (
    <h1
      className={`font-display font-semibold tracking-[-0.025em] leading-[0.98] select-none ${
        centered
          ? 'text-center text-4xl sm:text-6xl md:text-[68px]'
          : 'text-left text-4xl sm:text-6xl md:text-[74px]'
      } ${
        isLightText
          ? 'text-[#F6F3EB] drop-shadow-[0_4px_24px_rgba(12,10,8,0.45)]'
          : 'text-[#1D1C1A] drop-shadow-[0_2px_16px_rgba(255,255,255,0.45)]'
      }`}
    >
      {lines.map((line, lineIdx) => (
        <span key={lineIdx} className="block">
          {line.split('').map((ch, idx) => {
            const globalIdx = charCursor++;
            const normIdx = globalIdx / Math.max(1, totalChars - 1);

            const waveOffset = Math.sin(globalIdx * 1.35) * 0.12 + normIdx * 0.22;
            const charReveal = clamp01((enterT * 1.35) - waveOffset * 0.65);
            const charHide = clamp01((exitT * 1.35) - (1 - normIdx) * 0.25);

            const visibility = clamp01(charReveal * (1 - charHide));
            const blurPx = (1 - visibility) * 12;
            const opacity = clamp01(visibility * 1.15);

            return (
              <span
                key={idx}
                style={{
                  filter: blurPx > 0.35 ? `blur(${blurPx.toFixed(1)}px)` : 'none',
                  opacity,
                  transform: `translateY(${((1 - visibility) * 6).toFixed(1)}px)`,
                }}
                className="inline-block will-change-[filter,opacity,transform]"
              >
                {ch === ' ' ? '\u00A0' : ch}
              </span>
            );
          })}
        </span>
      ))}
    </h1>
  );
};

export const ScrollyCinemaStage: React.FC<ScrollyCinemaStageProps> = ({
  stageProgress,
  onJumpToWorks,
}) => {
  const leafCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const progressRef = useRef(stageProgress);

  useEffect(() => {
    progressRef.current = stageProgress;
  }, [stageProgress]);

  useEffect(() => {
    const canvas = leafCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const updateSize = () => {
      if (!canvas) return;
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const rect = canvas.getBoundingClientRect();
      canvas.width = Math.max(1, Math.floor(rect.width * dpr));
      canvas.height = Math.max(1, Math.floor(rect.height * dpr));
    };

    updateSize();
    window.addEventListener('resize', updateSize);

    const leaves = Array.from({ length: 11 }, (_, i) => ({
      x: (i * 0.13 + 0.08) % 1,
      y: (i * 0.19 + 0.05) % 1,
      size: 10 + (i % 4) * 4.5,
      speedX: -0.00025 - (i % 3) * 0.00012,
      speedY: 0.00035 + (i % 4) * 0.00014,
      rot: i * 0.7,
      rotSpeed: (i % 2 === 0 ? 1 : -1) * 0.012,
      color: i % 3 === 0 ? '#D95322' : i % 3 === 1 ? '#E87A24' : '#F29B30',
    }));

    let rafId: number;
    const renderLeaves = () => {
      const cw = canvas.width;
      const ch = canvas.height;
      ctx.clearRect(0, 0, cw, ch);

      const p = progressRef.current;
      const leafDensityAlpha =
        p < 0.14
          ? 0
          : p > 0.54 && p < 0.72
          ? 0.18
          : 0.75;

      if (leafDensityAlpha > 0.02) {
        const count = p > 0.78 ? 10 : 5;
        for (let i = 0; i < count; i++) {
          const lf = leaves[i];
          lf.x = (lf.x + lf.speedX + 1) % 1;
          lf.y = (lf.y + lf.speedY + 1) % 1;
          lf.rot += lf.rotSpeed;

          const px = lf.x * cw;
          const py = ((lf.y + p * 0.35) % 1) * ch;

          ctx.save();
          ctx.translate(px, py);
          ctx.rotate(lf.rot);
          const s = (lf.size * (cw / 1280)) / 18;
          ctx.scale(s, s * (0.72 + 0.28 * Math.sin(lf.rot * 1.5)));
          ctx.globalAlpha = leafDensityAlpha * 0.85;
          ctx.fillStyle = lf.color;

          ctx.beginPath();
          ctx.moveTo(0, -18);
          ctx.lineTo(3.5, -7);
          ctx.lineTo(14, -11);
          ctx.lineTo(8, -1.5);
          ctx.lineTo(17, 4);
          ctx.lineTo(5.5, 7.5);
          ctx.lineTo(7, 15);
          ctx.lineTo(0, 9.5);
          ctx.lineTo(-7, 15);
          ctx.lineTo(-5.5, 7.5);
          ctx.lineTo(-17, 4);
          ctx.lineTo(-8, -1.5);
          ctx.lineTo(-14, -11);
          ctx.lineTo(-3.5, -7);
          ctx.closePath();
          ctx.fill();
          ctx.restore();
        }
      }

      rafId = requestAnimationFrame(renderLeaves);
    };

    rafId = requestAnimationFrame(renderLeaves);
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', updateSize);
    };
  }, []);

  const activeChapterInfo = useMemo(() => {
    const p = clamp01(stageProgress);
    const chapter =
      SCROLLY_CHAPTERS.find((c) => p >= c.scrollStart && p <= c.scrollEnd) ||
      SCROLLY_CHAPTERS[SCROLLY_CHAPTERS.length - 1];
    const span = Math.max(0.001, chapter.scrollEnd - chapter.scrollStart);
    const localProgress = clamp01((p - chapter.scrollStart) / span);
    return { chapter, localProgress };
  }, [stageProgress]);

  const cloudVeilOpacity = useMemo(() => {
    const p = stageProgress;
    const pulse1 = Math.exp(-Math.pow((p - 0.17) / 0.032, 2)) * 0.55;
    const pulse2 = Math.exp(-Math.pow((p - 0.37) / 0.035, 2)) * 0.72;
    const pulse3 = Math.exp(-Math.pow((p - 0.56) / 0.035, 2)) * 0.58;
    return Math.min(0.78, pulse1 + pulse2 + pulse3);
  }, [stageProgress]);

  const isBrightOpening = stageProgress < 0.16;
  const { chapter, localProgress } = activeChapterInfo;

  return (
    <div className="relative w-full h-full rounded-[18px] overflow-hidden bg-[#191816] select-none shadow-2xl">
      <div className="absolute inset-0 overflow-hidden">
        {SCENE_LAYERS.map((layer, index) => {
          const fadeIn =
            index === 0
              ? 1
              : smoothstep(layer.start, layer.peakStart, stageProgress);
          const fadeOut =
            index === SCENE_LAYERS.length - 1
              ? 1
              : 1 - smoothstep(layer.peakEnd, layer.end, stageProgress);
          const opacity = clamp01(fadeIn * fadeOut);

          if (opacity <= 0.005) return null;

          const layerSpan = Math.max(0.001, layer.end - layer.start);
          const t = clamp01((stageProgress - layer.start) / layerSpan);
          const scale = layer.startScale + (layer.endScale - layer.startScale) * t;
          const translateY = layer.startY + (layer.endY - layer.startY) * t;

          return (
            <img
              key={layer.id}
              src={layer.src}
              alt=""
              decoding="async"
              draggable={false}
              style={{
                opacity,
                transform: `translate3d(0, ${translateY.toFixed(1)}px, 0) scale(${scale.toFixed(4)})`,
              }}
              className="absolute inset-0 w-full h-full object-cover will-change-[transform,opacity]"
            />
          );
        })}
      </div>

      {cloudVeilOpacity > 0.01 && (
        <div
          aria-hidden="true"
          style={{ opacity: cloudVeilOpacity }}
          className="absolute inset-0 pointer-events-none z-10 overflow-hidden"
        >
          <img
            src="/assets/generated/gen_scene_01_clouds.jpg"
            alt=""
            className="w-full h-full object-cover scale-110 blur-md brightness-105"
          />
        </div>
      )}

      <canvas
        ref={leafCanvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-15"
      />

      <div
        aria-hidden="true"
        className={`absolute top-0 left-0 right-0 h-28 pointer-events-none z-15 transition-opacity duration-500 ${
          isBrightOpening
            ? 'bg-gradient-to-b from-[#DCE4EE]/55 to-transparent'
            : 'bg-gradient-to-b from-black/50 to-transparent'
        }`}
      />

      <div
        aria-hidden="true"
        className={`absolute bottom-0 left-0 right-0 h-56 pointer-events-none z-15 transition-opacity duration-500 ${
          isBrightOpening
            ? 'bg-gradient-to-t from-[#CED8E6]/45 to-transparent'
            : 'bg-gradient-to-t from-black/55 via-black/20 to-transparent'
        }`}
      />

      {chapter.id === 'chapter-clouds' && (
        <div
          style={{
            opacity: smoothstep(0.0, 0.25, localProgress) * (1 - smoothstep(0.75, 0.98, localProgress)),
          }}
          className="hidden md:block absolute top-24 right-16 z-20 max-w-xs font-sans-ui text-[13px] leading-relaxed text-[#232220]/85 pointer-events-none"
        >
          We make animated films the slow way:
          <br />
          pencil first, paint second, software last.
        </div>
      )}

      <div className="relative z-20 w-full h-full flex flex-col justify-between p-6 sm:p-10 md:p-12 pointer-events-none">
        <div />

        {chapter.alignment === 'center' && (
          <div className="my-auto flex items-center justify-center px-4">
            <BlurRevealHeadline
              lines={chapter.headlineLines}
              chapterLocalProgress={localProgress}
              isLightText={true}
              centered={true}
            />
          </div>
        )}

        <div className="w-full flex flex-col md:flex-row md:items-end justify-between gap-6 pb-4 sm:pb-6">
          {chapter.alignment !== 'center' ? (
            <div className="max-w-3xl">
              <BlurRevealHeadline
                lines={chapter.headlineLines}
                chapterLocalProgress={localProgress}
                isLightText={!isBrightOpening}
                centered={false}
              />
            </div>
          ) : (
            <div />
          )}

          <div className="flex items-end justify-between md:justify-end gap-8">
            {chapter.id === 'chapter-avenue' && (
              <p
                style={{
                  opacity:
                    smoothstep(0.1, 0.3, localProgress) *
                    (1 - smoothstep(0.75, 0.98, localProgress)),
                }}
                className="hidden sm:block max-w-[270px] font-sans-ui text-xs sm:text-[13px] leading-relaxed text-[#F7F4EB]/90 drop-shadow"
              >
                Eleven artists who still start on paper. Every shot is painted in
                layers, so it can breathe, move and change without starting over.
              </p>
            )}

            {chapter.id === 'chapter-stories' && (
              <p
                style={{
                  opacity:
                    smoothstep(0.1, 0.3, localProgress) *
                    (1 - smoothstep(0.75, 0.98, localProgress)),
                }}
                className="hidden sm:block max-w-[260px] font-sans-ui text-xs sm:text-[13px] leading-relaxed text-[#F7F4EB]/90 drop-shadow"
              >
                From a fifteen-second loop to a seven-minute short, for musicians,
                brands and festivals.
              </p>
            )}

            {chapter.sideNote && (
              <p
                style={{
                  opacity: smoothstep(0.12, 0.35, localProgress),
                }}
                className="max-w-[260px] font-sans-ui text-xs sm:text-[13px] leading-relaxed text-[#F7F4EB]/90 drop-shadow"
              >
                {chapter.sideNote}
              </p>
            )}

            <div
              className={`hidden sm:flex flex-col items-center gap-1 font-mono-code text-[10px] tracking-[0.12em] ${
                isBrightOpening ? 'text-[#232220]/75' : 'text-[#F7F4EB]/85'
              }`}
            >
              <span className="writing-vertical-rl text-xs tracking-[0.2em] font-medium leading-tight">
                {chapter.showStamp
                  ? '描く'
                  : chapter.id === 'chapter-stories'
                  ? '見上げ'
                  : '秋の街'}
              </span>
              <span className="text-[8px] uppercase opacity-75">
                {chapter.showStamp ? 'DRAW' : 'CITY'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {chapter.showTicker && (
        <div className="absolute bottom-0 left-0 right-0 z-20 py-2 border-t border-[#232220]/15 bg-[#DCE4EE]/35 backdrop-blur-[2px] overflow-hidden pointer-events-none">
          <div className="animate-marquee flex items-center gap-8 whitespace-nowrap font-mono-code text-[10px] tracking-[0.16em] text-[#232220]/80 uppercase">
            <span>SCENE 01 — SKY OVER THE CITY</span>
            <span>•</span>
            <span>FRAME 0001 / 0450</span>
            <span>•</span>
            <span>24 FPS</span>
            <span>•</span>
            <span>PAINTED BY HAND</span>
            <span>•</span>
            <span>ABOVE THE CITY, 15:40</span>
            <span>•</span>
            <span>SCENE 01 — SKY OVER THE CITY</span>
            <span>•</span>
            <span>FRAME 0001 / 0450</span>
            <span>•</span>
            <span>24 FPS</span>
            <span>•</span>
            <span>PAINTED BY HAND</span>
            <span>•</span>
            <span>ABOVE THE CITY, 15:40</span>
          </div>
        </div>
      )}

      <div className="absolute bottom-3 right-6 z-30 hidden sm:flex items-center gap-3 pointer-events-auto">
        <button
          type="button"
          onClick={onJumpToWorks}
          className={`font-mono-code text-[10px] tracking-[0.14em] uppercase px-2.5 py-1 rounded border backdrop-blur-xs transition-colors whitespace-nowrap shrink-0 ${
            isBrightOpening
              ? 'border-[#232220]/25 bg-white/30 text-[#232220] hover:bg-[#232220]/15'
              : 'border-[#F7F4EB]/25 bg-black/30 text-[#F7F4EB] hover:bg-white/15'
          }`}
        >
          WORKS RING ↓
        </button>
      </div>
    </div>
  );
};
