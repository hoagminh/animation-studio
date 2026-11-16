import React, { useEffect, useRef, useState } from 'react';
import { DEMO_VIDEO_PATH, STUDIO_WORKS, StudioWork } from '../data/studioData';

interface FilmLightboxModalProps {
  work: StudioWork | null;
  onClose: () => void;
  onSelectWork: (work: StudioWork) => void;
}

type LayerViewMode = 'composite' | 'gouache' | 'layout' | 'sketch';

export const FilmLightboxModal: React.FC<FilmLightboxModalProps> = ({
  work,
  onClose,
  onSelectWork,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [layerMode, setLayerMode] = useState<LayerViewMode>('composite');
  const [showOriginalVideo, setShowOriginalVideo] = useState(false);

  useEffect(() => {
    setLayerMode('composite');
    setShowOriginalVideo(false);
  }, [work]);

  useEffect(() => {
    if (!work) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [work, onClose]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !work || !showOriginalVideo) return;

    video.currentTime = work.videoStart;
    video.play().catch(() => {});

    const onTimeUpdate = () => {
      if (video.currentTime >= work.videoEnd || video.currentTime < work.videoStart) {
        video.currentTime = work.videoStart;
      }
    };

    video.addEventListener('timeupdate', onTimeUpdate);
    return () => video.removeEventListener('timeupdate', onTimeUpdate);
  }, [work, showOriginalVideo]);

  if (!work) return null;

  const currentIdx = STUDIO_WORKS.findIndex((w) => w.id === work.id);
  const prevWork =
    STUDIO_WORKS[(currentIdx - 1 + STUDIO_WORKS.length) % STUDIO_WORKS.length];
  const nextWork = STUDIO_WORKS[(currentIdx + 1) % STUDIO_WORKS.length];

  const layerFilterStyle: React.CSSProperties =
    layerMode === 'sketch'
      ? { filter: 'grayscale(1) contrast(1.55) brightness(1.12) sepia(0.18)' }
      : layerMode === 'layout'
      ? { filter: 'grayscale(0.75) contrast(1.25) brightness(1.04) sepia(0.25)' }
      : layerMode === 'gouache'
      ? { filter: 'saturate(1.28) contrast(1.06)' }
      : {};

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${work.title} film screening`}
      data-lenis-prevent
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-6 overflow-y-auto"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-6xl rounded-[18px] paper-texture text-[#1E1D1B] shadow-2xl border border-white/15 overflow-hidden my-auto"
      >
        <div className="flex items-center justify-between gap-4 px-6 sm:px-8 py-4 border-b border-[#232220]/10">
          <div className="flex items-center gap-3 font-mono-code text-xs tracking-[0.12em] text-[#4A4742] uppercase">
            <span>{work.indexLabel}</span>
            <span aria-hidden="true">·</span>
            <span>{work.category}</span>
            <span aria-hidden="true">·</span>
            <span>{work.frameRate}</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-2 font-mono-code text-xs tracking-[0.14em] uppercase px-3 py-1.5 rounded border border-[#232220]/25 hover:bg-[#232220] hover:text-[#F7F4EB] transition-colors whitespace-nowrap shrink-0"
          >
            <span>CLOSE</span>
            <span aria-hidden="true">✕</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12">
          <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-[#232220]/10">
            <div className="relative aspect-[16/10] w-full rounded-xl overflow-hidden bg-[#161514] shadow-inner border border-black/15">
              <img
                src={work.scenePreview}
                alt={work.title}
                referrerPolicy="no-referrer"
                style={layerFilterStyle}
                className="w-full h-full object-cover transition-[filter] duration-300"
              />
              {showOriginalVideo && (
                <video
                  ref={videoRef}
                  src={DEMO_VIDEO_PATH}
                  muted
                  playsInline
                  style={layerFilterStyle}
                  className="absolute inset-0 z-10 w-full h-full object-cover scale-[1.035] transition-[filter] duration-300"
                />
              )}

              {(layerMode === 'sketch' || layerMode === 'layout') && (
                <div className="absolute inset-0 z-20 pointer-events-none border-8 border-[#EFECE6]/70 flex flex-col justify-between p-3">
                  <div className="flex items-center justify-center gap-6">
                    <span className="w-3 h-3 rounded-full border border-[#232220]/60 bg-[#EFECE6]" />
                    <span className="w-8 h-2 rounded-sm border border-[#232220]/60 bg-[#EFECE6]" />
                    <span className="w-3 h-3 rounded-full border border-[#232220]/60 bg-[#EFECE6]" />
                  </div>
                  <div className="font-mono-code text-[10px] tracking-[0.18em] text-[#232220] bg-[#EFECE6]/85 px-2 py-0.5 self-start uppercase">
                    PEGBAR BED: {layerMode.toUpperCase()} PASS
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={() => setShowOriginalVideo((p) => !p)}
                className="absolute bottom-3 right-3 z-30 font-mono-code text-[10px] tracking-[0.14em] uppercase px-3 py-1.5 rounded bg-black/75 text-[#F7F4EB] hover:bg-black transition-colors"
              >
                {showOriginalVideo ? 'VIEW SHARP MASTER STILL' : 'PLAY 24FPS LOOP'}
              </button>
            </div>

            <div className="mt-5">
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono-code text-[11px] tracking-[0.12em] text-[#57534E] uppercase">
                  INSPECT MULTIPLANE PAINT BEDS
                </span>
                <span className="font-mono-code text-[11px] text-[#57534E]">
                  {work.paintBeds}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-1 bg-[#232220]/8 rounded-lg">
                {(
                  [
                    { id: 'composite', label: '04. Composite' },
                    { id: 'gouache', label: '03. Gouache' },
                    { id: 'layout', label: '02. Layout' },
                    { id: 'sketch', label: '01. Sketch' },
                  ] as { id: LayerViewMode; label: string }[]
                ).map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setLayerMode(tab.id)}
                    className={`py-2 px-3 rounded-md font-mono-code text-xs transition-colors whitespace-nowrap shrink-0 ${
                      layerMode === tab.id
                        ? 'bg-[#232220] text-[#F7F4EB] shadow-sm'
                        : 'text-[#232220]/75 hover:text-[#232220]'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <p className="mt-3 font-sans-ui text-xs sm:text-sm text-[#3F3C38] leading-relaxed">
                {work.layerNotes[layerMode]}
              </p>
            </div>
          </div>

          <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <div className="font-mono-code text-xs tracking-[0.08em] text-[#6E6A63]">
                {work.typeLabel} · {work.duration} · {work.year}
              </div>

              <h2 className="mt-1 font-display text-4xl sm:text-5xl font-semibold tracking-tight text-[#18181B]">
                {work.title}
              </h2>

              <p className="mt-4 font-sans-ui text-sm sm:text-[15px] leading-relaxed text-[#3A3733]">
                {work.synopsis}
              </p>

              <div className="mt-6 pt-5 border-t border-[#232220]/10 space-y-3 text-xs font-sans-ui">
                <div className="flex items-center justify-between">
                  <span className="text-[#6E6A63]">Directed by</span>
                  <span className="font-medium text-[#18181B]">{work.director}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#6E6A63]">Medium</span>
                  <span className="font-medium text-[#18181B]">
                    Nicker Poster Color & Gouache on Cotton
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#6E6A63]">Gouache Key Swatches</span>
                  <div className="flex items-center gap-1.5">
                    {work.palette.map((hex) => (
                      <span
                        key={hex}
                        title={hex}
                        style={{ backgroundColor: hex }}
                        className="w-4 h-4 rounded-sm border border-black/15"
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <div className="aspect-[3/4] rounded overflow-hidden border border-black/10 bg-[#D8D2C5]">
                  <img
                    src={work.heroCard}
                    alt={`${work.title} background key A`}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="aspect-[3/4] rounded overflow-hidden border border-black/10 bg-[#D8D2C5]">
                  <img
                    src={work.secondaryCard}
                    alt={`${work.title} background key B`}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-[#232220]/10 flex items-center justify-between gap-4">
              <button
                type="button"
                onClick={() => onSelectWork(prevWork)}
                className="font-mono-code text-xs tracking-[0.08em] text-[#3A3733] hover:text-[#D96B27] transition-colors whitespace-nowrap shrink-0"
              >
                ← {prevWork.title}
              </button>
              <button
                type="button"
                onClick={() => onSelectWork(nextWork)}
                className="font-mono-code text-xs tracking-[0.08em] text-[#3A3733] hover:text-[#D96B27] transition-colors whitespace-nowrap shrink-0"
              >
                {nextWork.title} →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
