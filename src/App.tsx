/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Lenis from 'lenis';
import { AsciiPreloader } from './components/AsciiPreloader';
import { CinemaHeaderHud, DrawerSection } from './components/CinemaHeaderHud';
import { DualRingWorks } from './components/DualRingWorks';
import { FilmLightboxModal } from './components/FilmLightboxModal';
import { ScrollyCinemaStage } from './components/ScrollyCinemaStage';
import { StudioDrawers } from './components/StudioDrawers';
import { SCROLLY_CHAPTERS, StudioWork, WorkCategory } from './data/studioData';

export default function App() {
  const [showPreloader, setShowPreloader] = useState(true);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [ringAngle, setRingAngle] = useState(0);
  const [ringVelocity, setRingVelocity] = useState(0);

  const scrollProgressRef = useRef(0);
  const currentRingAngleRef = useRef(0);
  const targetRingAngleRef = useRef(0);
  const manualRingOffsetRef = useRef(0);
  const lenisRef = useRef<Lenis | null>(null);

  const [activeCategory, setActiveCategory] = useState<WorkCategory | 'All'>('All');
  const [activeDrawer, setActiveDrawer] = useState<DrawerSection>(null);
  const [selectedWorkForModal, setSelectedWorkForModal] = useState<StudioWork | null>(null);

  const handlePreloaderComplete = useCallback(() => {
    setShowPreloader(false);
  }, []);

  // Initialize Lenis smooth scrolling & unified RAF loop (only updates React state when values actually change)
  useEffect(() => {
    const lenis = new Lenis({
      lerp: 0.075,
      smoothWheel: true,
      wheelMultiplier: 0.85,
      touchMultiplier: 1.5,
    });
    lenisRef.current = lenis;

    lenis.on('scroll', ({ progress }: { progress: number }) => {
      const clamped = Math.max(0, Math.min(1, progress || 0));
      if (Math.abs(clamped - scrollProgressRef.current) > 0.0004) {
        scrollProgressRef.current = clamped;
        setScrollProgress(clamped);
      }

      if (clamped >= 0.70) {
        const worksNorm = (clamped - 0.70) / 0.30;
        targetRingAngleRef.current = -worksNorm * 210 + manualRingOffsetRef.current;
      }
    });

    let rafId: number;
    const raf = (time: number) => {
      lenis.raf(time);

      const diff = targetRingAngleRef.current - currentRingAngleRef.current;
      if (Math.abs(diff) > 0.04) {
        const step = diff * 0.12;
        currentRingAngleRef.current += step;
        setRingAngle(currentRingAngleRef.current);
        setRingVelocity(Math.min(10, Math.abs(step) * 1.6));
      } else if (Math.abs(diff) > 0.001) {
        currentRingAngleRef.current = targetRingAngleRef.current;
        setRingAngle(currentRingAngleRef.current);
        setRingVelocity(0);
      }

      rafId = requestAnimationFrame(raf);
    };

    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  // Pause Lenis when preloader, lightbox modal, or studio drawer is open
  useEffect(() => {
    const lenis = lenisRef.current;
    if (!lenis) return;

    if (showPreloader || activeDrawer || selectedWorkForModal) {
      lenis.stop();
    } else {
      lenis.start();
    }
  }, [showPreloader, activeDrawer, selectedWorkForModal]);

  // Allow infinite wheel & arrow key turning when at the end of the Works scroll track
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (activeDrawer || selectedWorkForModal || showPreloader) return;
      if (scrollProgressRef.current >= 0.97 && e.deltaY > 0) {
        manualRingOffsetRef.current -= e.deltaY * 0.14;
        targetRingAngleRef.current = -210 + manualRingOffsetRef.current;
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeDrawer || selectedWorkForModal || showPreloader) return;
      if (scrollProgressRef.current >= 0.70) {
        if (e.key === 'ArrowRight') {
          manualRingOffsetRef.current -= 30;
          targetRingAngleRef.current -= 30;
        } else if (e.key === 'ArrowLeft') {
          manualRingOffsetRef.current += 30;
          targetRingAngleRef.current += 30;
        }
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: true });
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeDrawer, selectedWorkForModal, showPreloader]);

  const handleRotateDelta = useCallback((deltaDeg: number) => {
    manualRingOffsetRef.current += deltaDeg;
    targetRingAngleRef.current += deltaDeg;
  }, []);

  const scrollToFraction = useCallback((fraction: number) => {
    const maxScroll = Math.max(
      1,
      document.documentElement.scrollHeight - window.innerHeight
    );
    const targetY = fraction * maxScroll;

    if (lenisRef.current) {
      lenisRef.current.scrollTo(targetY, {
        duration: 1.5,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      });
    } else {
      window.scrollTo({ top: targetY, behavior: 'smooth' });
    }
  }, []);

  const handleSelectCategory = useCallback(
    (category: WorkCategory | 'All') => {
      setActiveCategory((prev) => (prev === category ? 'All' : category));
      if (scrollProgressRef.current < 0.74) {
        scrollToFraction(0.80);
      }
    },
    [scrollToFraction]
  );

  const isWorksStage = scrollProgress >= 0.72;
  const scrollyStageProgress = Math.min(1, scrollProgress / 0.72);

  const hudTelemetry = useMemo(() => {
    if (isWorksStage) {
      const ringStep = Math.abs(Math.round(ringAngle / 15)) % 9;
      return {
        timecode: `00:06:5${Math.min(5, Math.max(1, ringStep))}`,
        locationLabel: 'ABOVE THE CITY',
        sceneCode: 'SC 01',
      };
    }

    const chapter =
      SCROLLY_CHAPTERS.find(
        (ch) =>
          scrollyStageProgress >= ch.scrollStart &&
          scrollyStageProgress <= ch.scrollEnd
      ) || SCROLLY_CHAPTERS[SCROLLY_CHAPTERS.length - 1];

    return {
      timecode: chapter.timecode,
      locationLabel: chapter.locationLabel,
      sceneCode: chapter.sceneCode,
    };
  }, [isWorksStage, ringAngle, scrollyStageProgress]);

  const isLightHudSurface = isWorksStage || scrollyStageProgress < 0.11;

  return (
    <div className="relative min-h-[780vh] bg-[#111110]">
      {/* 00:00 ASCII Cloud Preloader */}
      {showPreloader && <AsciiPreloader onComplete={handlePreloaderComplete} />}

      {/* Persistent Top Cinema HUD Navigation */}
      <CinemaHeaderHud
        isLightSurface={isLightHudSurface}
        timecode={hudTelemetry.timecode}
        locationLabel={hudTelemetry.locationLabel}
        sceneCode={hudTelemetry.sceneCode}
        activeCategory={activeCategory}
        onSelectCategory={handleSelectCategory}
        onOpenDrawer={setActiveDrawer}
        onScrollToTop={() => scrollToFraction(0)}
        onReplayPreloader={() => setShowPreloader(true)}
      />

      {/* Pinned Cinema Frame Viewport */}
      <main className="fixed inset-0 p-2.5 sm:p-4 pointer-events-none">
        <div className="relative w-full h-full pointer-events-auto">
          {/* Stage 1: Scrollytelling 2D Hand-Painted Cinema (00:01 - 00:07) */}
          <div
            className={`absolute inset-0 transition-opacity duration-700 ${
              isWorksStage
                ? 'opacity-0 pointer-events-none'
                : 'opacity-100 pointer-events-auto'
            }`}
          >
            <ScrollyCinemaStage
              stageProgress={scrollyStageProgress}
              onJumpToWorks={() => scrollToFraction(0.80)}
            />
          </div>

          {/* Stage 2: 3D Dual-Ring Works Showcase on Lined Paper (00:08 - 00:10) */}
          <div
            className={`absolute inset-0 transition-opacity duration-700 ${
              isWorksStage
                ? 'opacity-100 pointer-events-auto'
                : 'opacity-0 pointer-events-none'
            }`}
          >
            <DualRingWorks
              ringAngle={ringAngle}
              motionBlurAmount={ringVelocity}
              onRotateDelta={handleRotateDelta}
              activeCategory={activeCategory}
              onClearCategory={() => setActiveCategory('All')}
              onSelectWorkForModal={setSelectedWorkForModal}
            />
          </div>
        </div>
      </main>

      {/* Fullscreen Watch Film Lightbox & Paint Bed Inspector */}
      <FilmLightboxModal
        work={selectedWorkForModal}
        onClose={() => setSelectedWorkForModal(null)}
        onSelectWork={setSelectedWorkForModal}
      />

      {/* Studio Editorial Drawers (About, Process, Journal, Careers, Start a Project) */}
      <StudioDrawers
        activeDrawer={activeDrawer}
        onClose={() => setActiveDrawer(null)}
        onChangeDrawer={setActiveDrawer}
        onOpenWork={setSelectedWorkForModal}
      />
    </div>
  );
}
