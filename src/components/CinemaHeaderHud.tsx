import React from 'react';
import { WorkCategory } from '../data/studioData';

export type DrawerSection = 'about' | 'process' | 'journal' | 'careers' | 'project' | null;

interface CinemaHeaderHudProps {
  isLightSurface: boolean;
  timecode: string;
  locationLabel: string;
  sceneCode: string;
  activeCategory: WorkCategory | 'All';
  onSelectCategory: (category: WorkCategory | 'All') => void;
  onOpenDrawer: (section: DrawerSection) => void;
  onScrollToTop: () => void;
  onReplayPreloader: () => void;
}

export const CinemaHeaderHud: React.FC<CinemaHeaderHudProps> = ({
  isLightSurface,
  timecode,
  locationLabel,
  sceneCode,
  activeCategory,
  onSelectCategory,
  onOpenDrawer,
  onScrollToTop,
  onReplayPreloader,
}) => {
  const textPrimary = isLightSurface ? 'text-[#232220]' : 'text-[#F7F4EB]';
  const textSecondary = isLightSurface
    ? 'text-[#232220]/75 hover:text-[#232220]'
    : 'text-[#F7F4EB]/80 hover:text-white';
  const borderTone = isLightSurface
    ? 'border-[#232220]/35'
    : 'border-[#F7F4EB]/45';

  return (
    <header
      className={`fixed top-2.5 sm:top-4 left-2.5 sm:left-4 right-2.5 sm:right-4 z-40 pointer-events-none transition-colors duration-500 ${textPrimary}`}
    >
      <div className="w-full px-5 sm:px-8 pt-4 sm:pt-6 flex items-start justify-between gap-6">
        <div className="flex items-center gap-3 pointer-events-auto shrink-0">
          <button
            type="button"
            onClick={onScrollToTop}
            title="Return to opening sky"
            className="group relative inline-flex items-center justify-center w-9 h-9 text-xl font-display font-semibold tracking-tight transition-transform duration-200 hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D96B27]"
          >
            <span
              className={`absolute top-0.5 left-0.5 w-2.5 h-2.5 border-t border-l transition-colors duration-300 ${borderTone}`}
            />
            <span
              className={`absolute bottom-0.5 right-0.5 w-2.5 h-2.5 border-b border-r transition-colors duration-300 ${borderTone}`}
            />
            <span>層</span>
          </button>

          <button
            type="button"
            onClick={onReplayPreloader}
            className={`hidden xl:inline-block font-mono-code text-[10px] tracking-[0.14em] uppercase opacity-55 hover:opacity-100 transition-opacity whitespace-nowrap shrink-0`}
          >
            ASCII 00%
          </button>
        </div>

        <nav
          aria-label="Studio navigation"
          className="hidden md:grid grid-cols-4 gap-x-10 lg:gap-x-16 text-[13px] leading-[1.45] font-sans-ui pointer-events-auto"
        >
          <div className="flex flex-col items-start space-y-0.5">
            {(['Films', 'Clips', 'Brand films'] as WorkCategory[]).map((cat) => {
              const isSelected = activeCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => onSelectCategory(cat)}
                  className={`text-left whitespace-nowrap shrink-0 transition-colors duration-150 ${
                    isSelected
                      ? 'font-semibold underline underline-offset-4 decoration-1'
                      : textSecondary
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          <div className="flex flex-col items-start space-y-0.5">
            <button
              type="button"
              onClick={() => onOpenDrawer('about')}
              className={`text-left whitespace-nowrap shrink-0 transition-colors duration-150 ${textSecondary}`}
            >
              About
            </button>
            <button
              type="button"
              onClick={() => onOpenDrawer('process')}
              className={`text-left whitespace-nowrap shrink-0 transition-colors duration-150 ${textSecondary}`}
            >
              Process
            </button>
            <button
              type="button"
              onClick={() => onOpenDrawer('journal')}
              className={`text-left whitespace-nowrap shrink-0 transition-colors duration-150 ${textSecondary}`}
            >
              Journal
            </button>
          </div>

          <div className="flex flex-col items-start space-y-0.5">
            <button
              type="button"
              onClick={() => onOpenDrawer('project')}
              className={`text-left whitespace-nowrap shrink-0 transition-colors duration-150 ${textSecondary}`}
            >
              Say hello
            </button>
            <button
              type="button"
              onClick={() => onOpenDrawer('careers')}
              className={`text-left whitespace-nowrap shrink-0 transition-colors duration-150 ${textSecondary}`}
            >
              Careers
            </button>
          </div>

          <div className="flex flex-col items-start font-mono-code text-[11px] leading-[1.35] tracking-[0.08em] select-none">
            <span
              className={`inline-block px-2 py-0.5 border ${borderTone} mb-1 tracking-[0.12em] whitespace-nowrap shrink-0`}
            >
              {timecode}
            </span>
            <span className="opacity-75 whitespace-nowrap shrink-0">
              {locationLabel}
            </span>
            <span className="opacity-65 whitespace-nowrap shrink-0">
              {sceneCode}
            </span>
          </div>
        </nav>

        <div className="flex items-center gap-3 pointer-events-auto shrink-0">
          <button
            type="button"
            onClick={() => onOpenDrawer('project')}
            className={`group inline-flex items-center gap-2.5 text-[13px] font-medium tracking-tight whitespace-nowrap shrink-0 py-1.5 px-3 rounded-full transition-all duration-200 ${
              isLightSurface
                ? 'hover:bg-[#232220]/8 text-[#232220]'
                : 'hover:bg-white/10 text-[#F7F4EB]'
            }`}
          >
            <span>Start a project</span>
            <span
              className={`inline-flex items-center justify-center w-4 h-4 rounded-full border text-[11px] leading-none transition-transform duration-200 group-hover:rotate-90 ${borderTone}`}
            >
              +
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
