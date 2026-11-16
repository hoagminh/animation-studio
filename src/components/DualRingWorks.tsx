import React, { useMemo, useRef } from 'react';
import {
  BOTTOM_RING_CARDS,
  STUDIO_WORKS,
  StudioWork,
  TOP_RING_CARDS,
  WorkCategory,
} from '../data/studioData';

interface DualRingWorksProps {
  ringAngle: number;
  motionBlurAmount?: number;
  onRotateDelta: (deltaDeg: number) => void;
  activeCategory: WorkCategory | 'All';
  onClearCategory: () => void;
  onSelectWorkForModal: (work: StudioWork) => void;
}

export const DualRingWorks: React.FC<DualRingWorksProps> = ({
  ringAngle,
  motionBlurAmount = 0,
  onRotateDelta,
  activeCategory,
  onClearCategory,
  onSelectWorkForModal,
}) => {
  const isDraggingRef = useRef(false);
  const lastXRef = useRef(0);
  const velocityRef = useRef(0);

  // Filter works if a category is active, otherwise all 6 works
  const filteredWorks = useMemo(() => {
    if (activeCategory === 'All') return STUDIO_WORKS;
    return STUDIO_WORKS.filter((w) => w.category === activeCategory);
  }, [activeCategory]);

  // Determine active work from current ringAngle (every 30 degrees = 1 slot)
  const activeWork = useMemo(() => {
    const normalized = ((-ringAngle % 360) + 360) % 360;
    const slotIdx = Math.round(normalized / 30) % 12;
    const pool = filteredWorks.length > 0 ? filteredWorks : STUDIO_WORKS;
    return pool[slotIdx % pool.length];
  }, [ringAngle, filteredWorks]);

  const handlePointerDown = (e: React.PointerEvent) => {
    isDraggingRef.current = true;
    lastXRef.current = e.clientX;
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    const dx = e.clientX - lastXRef.current;
    lastXRef.current = e.clientX;
    velocityRef.current = dx * 0.32;
    onRotateDelta(dx * 0.32);
  };

  const handlePointerUp = () => {
    isDraggingRef.current = false;
  };

  // Radius scales nicely for desktop vs mobile
  const cylinderRadius = typeof window !== 'undefined' && window.innerWidth < 768 ? 360 : 580;

  return (
    <section
      aria-label="Selected Works 3D Ring"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      className="relative w-full h-full rounded-[18px] paper-texture overflow-hidden flex flex-col justify-between select-none cursor-grab active:cursor-grabbing shadow-2xl"
    >
      {/* Top 3D Cylindrical Ring */}
      <div
        className="relative w-full h-[34%] flex items-center justify-center pt-12 sm:pt-16"
        style={{ perspective: '1500px' }}
      >
        <div
          className="relative w-36 h-48"
          style={{
            transformStyle: 'preserve-3d',
            transform: `translateZ(${-cylinderRadius * 0.35}px) rotateX(-11deg) rotateY(${ringAngle}deg)`,
          }}
        >
          {TOP_RING_CARDS.map((card) => {
            const slotDeg = card.slotIndex * 30;
            const work = STUDIO_WORKS[card.workIndex % STUDIO_WORKS.length];
            const isCategoryMatch =
              activeCategory === 'All' || work.category === activeCategory;

            // Calculate front-facing visibility so back-of-ring cards fade softly
            const relAngle = (((slotDeg + ringAngle) % 360) + 360) % 360;
            const distFromFront = Math.min(relAngle, 360 - relAngle);
            const isFrontHemisphere = distFromFront < 105;

            return (
              <button
                key={`top-${card.slotIndex}`}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectWorkForModal(work);
                }}
                style={{
                  transform: `rotateY(${slotDeg}deg) translateZ(${cylinderRadius}px)`,
                  opacity: isFrontHemisphere
                    ? isCategoryMatch
                      ? Math.max(0.28, 1 - distFromFront / 115)
                      : 0.18
                    : 0.06,
                  pointerEvents: isFrontHemisphere ? 'auto' : 'none',
                }}
                className="group absolute inset-0 w-32 sm:w-36 h-44 sm:h-48 -ml-16 sm:-ml-18 rounded-[3px] overflow-hidden bg-[#D8D2C5] shadow-[0_12px_28px_rgba(24,22,18,0.16)] border border-black/10 transition-transform duration-200 hover:scale-105 focus-visible:outline-2 focus-visible:outline-[#D96B27]"
              >
                <img
                  src={card.imageUrl}
                  alt={card.title}
                  referrerPolicy="no-referrer"
                  draggable={false}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-colors" />
              </button>
            );
          })}
        </div>
      </div>

      {/* Center Horizon: Active Film Title with Motion-Blur Character Reveal */}
      <div className="relative z-20 my-auto flex flex-col items-center justify-center text-center px-6 py-2 pointer-events-auto">
        {activeCategory !== 'All' && (
          <div className="mb-2 flex items-center gap-2 font-mono-code text-[11px] tracking-[0.14em] text-[#57534E] uppercase">
            <span>FILTER: {activeCategory}</span>
            <span>·</span>
            <button
              type="button"
              onClick={onClearCategory}
              className="underline underline-offset-4 hover:text-[#18181B]"
            >
              SHOW ALL 06
            </button>
          </div>
        )}

        <button
          type="button"
          onClick={() => onSelectWorkForModal(activeWork)}
          className="group focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#D96B27]"
        >
          <h2
            aria-label={activeWork.title}
            className="font-sans-ui text-4xl sm:text-6xl md:text-[68px] font-medium tracking-[-0.03em] text-[#1E1D1B] leading-none transition-transform duration-200 group-hover:scale-[1.02]"
          >
            {activeWork.title.split('').map((ch, idx, arr) => {
              // Center-outward progressive blur matching 00:08 "Paper Weather"
              const mid = (arr.length - 1) / 2;
              const distFromCenter = Math.abs(idx - mid) / Math.max(1, mid);
              const charBlur = motionBlurAmount * (0.35 + (1 - distFromCenter) * 0.85);
              return (
                <span
                  key={idx}
                  style={{
                    filter: charBlur > 0.3 ? `blur(${charBlur.toFixed(1)}px)` : 'none',
                    opacity: charBlur > 3 ? 0.72 : 1,
                  }}
                  className="inline-block transition-[filter,opacity] duration-150"
                >
                  {ch === ' ' ? '\u00A0' : ch}
                </span>
              );
            })}
          </h2>
        </button>

        {/* Unboxed Editorial Metadata (Zero-Pill Discipline) */}
        <div
          style={{
            filter: motionBlurAmount > 1.5 ? `blur(${(motionBlurAmount * 0.4).toFixed(1)}px)` : 'none',
          }}
          className="mt-3 flex items-center justify-center gap-2.5 font-mono-code text-xs sm:text-[13px] tracking-[0.06em] text-[#6E6A63] transition-[filter] duration-150"
        >
          <span>{activeWork.typeLabel}</span>
          <span aria-hidden="true">·</span>
          <span>{activeWork.duration}</span>
          <span aria-hidden="true">·</span>
          <span>{activeWork.year}</span>
        </div>
      </div>

      {/* Bottom 3D Cylindrical Ring */}
      <div
        className="relative w-full h-[34%] flex items-center justify-center pb-10 sm:pb-14"
        style={{ perspective: '1500px' }}
      >
        <div
          className="relative w-36 h-48"
          style={{
            transformStyle: 'preserve-3d',
            transform: `translateZ(${-cylinderRadius * 0.35}px) rotateX(11deg) rotateY(${-ringAngle * 0.85 + 15}deg)`,
          }}
        >
          {BOTTOM_RING_CARDS.map((card) => {
            const slotDeg = card.slotIndex * 30;
            const work = STUDIO_WORKS[card.workIndex % STUDIO_WORKS.length];
            const isCategoryMatch =
              activeCategory === 'All' || work.category === activeCategory;

            const currentRot = -ringAngle * 0.85 + 15;
            const relAngle = (((slotDeg + currentRot) % 360) + 360) % 360;
            const distFromFront = Math.min(relAngle, 360 - relAngle);
            const isFrontHemisphere = distFromFront < 105;

            return (
              <button
                key={`bottom-${card.slotIndex}`}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectWorkForModal(work);
                }}
                style={{
                  transform: `rotateY(${slotDeg}deg) translateZ(${cylinderRadius}px)`,
                  opacity: isFrontHemisphere
                    ? isCategoryMatch
                      ? Math.max(0.28, 1 - distFromFront / 115)
                      : 0.18
                    : 0.06,
                  pointerEvents: isFrontHemisphere ? 'auto' : 'none',
                }}
                className="group absolute inset-0 w-32 sm:w-36 h-44 sm:h-48 -ml-16 sm:-ml-18 rounded-[3px] overflow-hidden bg-[#D8D2C5] shadow-[0_12px_28px_rgba(24,22,18,0.16)] border border-black/10 transition-transform duration-200 hover:scale-105 focus-visible:outline-2 focus-visible:outline-[#D96B27]"
              >
                <img
                  src={card.imageUrl}
                  alt={card.title}
                  referrerPolicy="no-referrer"
                  draggable={false}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-colors" />
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom Bar: SCROLL TO TURN THE RING & 01 / 06 WATCH FILM */}
      <div className="relative z-30 px-6 sm:px-8 pb-5 sm:pb-6 flex items-center justify-between gap-4 pointer-events-auto">
        <div className="flex items-center gap-3">
          <span className="font-mono-code text-[10px] sm:text-[11px] tracking-[0.14em] text-[#4A4742] uppercase whitespace-nowrap">
            SCROLL TO TURN THE RING
          </span>
          <div className="hidden sm:flex items-center gap-1">
            <button
              type="button"
              onClick={() => onRotateDelta(30)}
              aria-label="Previous work in ring"
              className="w-6 h-6 flex items-center justify-center rounded border border-[#232220]/20 text-xs text-[#232220] hover:bg-[#232220]/10 transition-colors"
            >
              ←
            </button>
            <button
              type="button"
              onClick={() => onRotateDelta(-30)}
              aria-label="Next work in ring"
              className="w-6 h-6 flex items-center justify-center rounded border border-[#232220]/20 text-xs text-[#232220] hover:bg-[#232220]/10 transition-colors"
            >
              →
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onSelectWorkForModal(activeWork)}
          className="group flex items-center gap-2 font-mono-code text-[11px] sm:text-xs tracking-[0.12em] text-[#232220] uppercase whitespace-nowrap shrink-0 py-1 px-2 rounded hover:bg-[#232220]/8 transition-colors"
        >
          <span className="text-[#6E6A63]">{activeWork.indexLabel}</span>
          <span className="underline underline-offset-4 decoration-[#232220]/60 group-hover:decoration-[#232220] font-medium">
            {activeWork.title}
          </span>
          <span aria-hidden="true">·</span>
          <span className="group-hover:text-[#D96B27] transition-colors">
            WATCH FILM
          </span>
        </button>
      </div>
    </section>
  );
};
