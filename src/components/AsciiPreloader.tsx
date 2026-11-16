import React, { useEffect, useMemo, useRef, useState } from 'react';

interface AsciiPreloaderProps {
  onComplete: () => void;
}

const COLS = 88;
const ROWS = 28;
const CHAR_RAMP = [' ', '.', '-', '+', '=', '#', '@'];

export const AsciiPreloader: React.FC<AsciiPreloaderProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(1);
  const [tick, setTick] = useState(0);
  const [exiting, setExiting] = useState(false);
  const onCompleteRef = useRef(onComplete);
  const completedRef = useRef(false);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  const finishLoading = () => {
    if (completedRef.current) return;
    completedRef.current = true;
    setExiting(true);
    window.setTimeout(() => {
      onCompleteRef.current();
    }, 320);
  };

  useEffect(() => {
    const durationMs = 1800;
    const startTime = performance.now();
    let rafId: number;

    const step = (now: number) => {
      const elapsed = now - startTime;
      const ratio = Math.min(1, elapsed / durationMs);
      const eased = 1 - Math.pow(1 - ratio, 2.1);
      const currentPct = Math.max(1, Math.min(100, Math.round(eased * 100)));

      setProgress(currentPct);
      setTick(elapsed * 0.003);

      if (ratio < 1) {
        rafId = requestAnimationFrame(step);
      } else {
        finishLoading();
      }
    };

    rafId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafId);
  }, []);

  const asciiLines = useMemo(() => {
    const lines: string[] = [];
    const revealThreshold = progress / 100;

    for (let r = 0; r < ROWS; r++) {
      let rowStr = '';
      const ny = r / ROWS;

      for (let c = 0; c < COLS; c++) {
        const nx = c / COLS;

        const wave1 = Math.sin(nx * 6.8 - tick * 1.4 + Math.cos(ny * 4.2));
        const wave2 = Math.cos(nx * 13.5 + ny * 7.0 - tick * 0.9) * 0.55;
        const wave3 = Math.sin((nx - ny) * 9.2 + tick * 1.1) * 0.35;

        const lobeA = Math.exp(-Math.pow((nx - 0.28) / 0.26, 2) - Math.pow((ny - 0.32) / 0.28, 2));
        const lobeB = Math.exp(-Math.pow((nx - 0.56) / 0.24, 2) - Math.pow((ny - 0.45) / 0.32, 2));
        const lobeC = Math.exp(-Math.pow((nx - 0.80) / 0.22, 2) - Math.pow((ny - 0.38) / 0.34, 2));
        const horizonBand = ny < 0.14 ? 0.55 : ny > 0.85 ? 0.15 : 0.3;

        const density =
          (lobeA * 0.85 + lobeB * 0.95 + lobeC * 0.9 + horizonBand) +
          (wave1 * 0.22 + wave2 * 0.16 + wave3 * 0.12);

        const cellOrder = nx * 0.65 + ny * 0.35;
        if (cellOrder > revealThreshold * 1.18) {
          rowStr += ' ';
          continue;
        }

        const clamped = Math.max(0, Math.min(1, density * 0.72));
        const idx = Math.min(
          CHAR_RAMP.length - 1,
          Math.floor(clamped * CHAR_RAMP.length)
        );
        rowStr += CHAR_RAMP[idx];
      }
      lines.push(rowStr);
    }
    return lines;
  }, [progress, tick]);

  const formattedPct = String(progress).padStart(3, '0') + '%';

  return (
    <div
      onClick={finishLoading}
      role="status"
      aria-label="Loading Layers 2D Animation Studio"
      className={`fixed inset-0 z-50 flex items-center justify-center bg-[#111110] p-2.5 sm:p-4 cursor-pointer transition-opacity duration-300 ${
        exiting ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <div className="relative w-full h-full rounded-[18px] paper-texture overflow-hidden flex flex-col justify-between p-6 sm:p-10 shadow-2xl border border-black/10">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3 text-[#232220]">
            <span className="relative inline-flex items-center justify-center w-8 h-8 text-lg font-display font-semibold tracking-tight">
              <span className="absolute top-0 left-0 w-2 h-2 border-t border-l border-[#232220]/70" />
              <span className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-[#232220]/70" />
              層
            </span>
            <span className="font-sans-ui text-base sm:text-lg font-medium tracking-tight text-[#232220]">
              Layers
            </span>
          </div>

          <div className="font-mono-code text-[11px] sm:text-xs tracking-[0.14em] text-[#4A4742] uppercase text-right">
            HAND-PAINTED 2D ANIMATION STUDIO
          </div>
        </div>

        <div className="my-auto flex items-center justify-center overflow-hidden py-4 select-none">
          <pre
            aria-hidden="true"
            className="font-mono-code text-[7px] xs:text-[8.5px] sm:text-[10.5px] md:text-[12px] lg:text-[13px] leading-[1.12] tracking-[0.06em] text-[#52658C] font-medium whitespace-pre text-center"
          >
            {asciiLines.join('\n')}
          </pre>
        </div>

        <div className="flex items-end justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="font-mono-code text-[11px] sm:text-xs tracking-[0.16em] text-[#3A3733] uppercase">
              DRAWING THE CITY
            </span>
          </div>

          <div className="font-mono-code text-2xl sm:text-4xl md:text-[42px] leading-none font-normal tracking-tight text-[#232220]">
            {formattedPct}
          </div>
        </div>
      </div>
    </div>
  );
};
