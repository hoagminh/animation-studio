import React, { useEffect, useState } from 'react';
import {
  CAREERS_OPENINGS,
  JOURNAL_ENTRIES,
  PROCESS_STEPS,
  STUDIO_WORKS,
  StudioWork,
} from '../data/studioData';
import { getSharpGouacheCardUrl } from '../utils/gouacheArtGenerator';
import { DrawerSection } from './CinemaHeaderHud';

interface StudioDrawersProps {
  activeDrawer: DrawerSection;
  onClose: () => void;
  onChangeDrawer: (section: DrawerSection) => void;
  onOpenWork: (work: StudioWork) => void;
}

export const StudioDrawers: React.FC<StudioDrawersProps> = ({
  activeDrawer,
  onClose,
  onChangeDrawer,
  onOpenWork,
}) => {
  const [senderName, setSenderName] = useState('');
  const [senderEmail, setSenderEmail] = useState('');
  const [projectFormat, setProjectFormat] = useState<'Short film' | 'Music clip' | 'Brand film'>('Brand film');
  const [timeline, setTimeline] = useState('Q1 2027 · 8–12 weeks');
  const [briefNotes, setBriefNotes] = useState('');
  const [submittedBrief, setSubmittedBrief] = useState<{
    name: string;
    format: string;
    timeline: string;
  } | null>(null);
  const [appliedRole, setAppliedRole] = useState<string | null>(null);

  useEffect(() => {
    if (!activeDrawer) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [activeDrawer, onClose]);

  if (!activeDrawer) return null;

  const handleProjectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!senderName.trim() || !senderEmail.trim()) return;
    setSubmittedBrief({
      name: senderName.trim(),
      format: projectFormat,
      timeline,
    });
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Studio Editorial Sheet"
      data-lenis-prevent
      className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm p-2.5 sm:p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl h-full rounded-[16px] paper-texture text-[#1E1D1B] shadow-2xl border border-black/15 flex flex-col justify-between overflow-hidden"
      >
        <div className="px-6 sm:px-8 py-5 border-b border-[#232220]/10 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            {(
              [
                { id: 'about', label: 'About' },
                { id: 'process', label: 'Process' },
                { id: 'journal', label: 'Journal' },
                { id: 'careers', label: 'Careers' },
                { id: 'project', label: 'Start a project' },
              ] as { id: DrawerSection; label: string }[]
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => onChangeDrawer(tab.id)}
                className={`px-3 py-1.5 rounded-md font-mono-code text-xs tracking-[0.08em] uppercase transition-colors whitespace-nowrap shrink-0 ${
                  activeDrawer === tab.id
                    ? 'bg-[#232220] text-[#F7F4EB]'
                    : 'text-[#4A4742] hover:text-[#18181B] hover:bg-[#232220]/8'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="font-mono-code text-xs tracking-[0.14em] uppercase px-3 py-1.5 rounded border border-[#232220]/25 hover:bg-[#232220] hover:text-[#F7F4EB] transition-colors whitespace-nowrap shrink-0"
          >
            CLOSE ✕
          </button>
        </div>

        <div
          data-lenis-prevent
          className="flex-1 overflow-y-auto px-6 sm:px-8 py-8 space-y-8"
        >
          {activeDrawer === 'about' && (
            <div className="space-y-8">
              <div>
                <div className="font-mono-code text-xs tracking-[0.14em] text-[#6E6A63] uppercase">
                  TOKYO & KYOTO · FOUNDED 2021 · 14 ARTISTS
                </div>
                <h2 className="mt-2 font-display text-4xl sm:text-5xl font-medium tracking-tight leading-[1.06]">
                  Small team. Slow pencils. Big skies.
                </h2>
                <p className="mt-4 font-sans-ui text-[15px] leading-relaxed text-[#3A3733]">
                  Layers (「層」) is an independent 2D animation studio dedicated to
                  hand-painted backgrounds and frame-by-frame cel storytelling. Every cloud bank,
                  brick facade, and autumn canopy in our films is brushed with mineral gouache on
                  heavy cotton paper before meeting the camera rostrum.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-4 py-5 border-y border-[#232220]/10">
                <div>
                  <div className="font-mono-code text-2xl sm:text-3xl font-medium text-[#18181B]">
                    24 FPS
                  </div>
                  <div className="mt-1 font-mono-code text-[11px] text-[#6E6A63] uppercase">
                    Hand-timed on 2s & 3s
                  </div>
                </div>
                <div>
                  <div className="font-mono-code text-2xl sm:text-3xl font-medium text-[#18181B]">
                    4–5 Beds
                  </div>
                  <div className="mt-1 font-mono-code text-[11px] text-[#6E6A63] uppercase">
                    Gouache multiplane depth
                  </div>
                </div>
                <div>
                  <div className="font-mono-code text-2xl sm:text-3xl font-medium text-[#18181B]">
                    240 GSM
                  </div>
                  <div className="mt-1 font-mono-code text-[11px] text-[#6E6A63] uppercase">
                    Cold-pressed cotton paper
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-mono-code text-xs tracking-[0.14em] text-[#4A4742] uppercase mb-4">
                  SELECTED STUDIO ARCHIVE (CLICK TO SCREEN)
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {STUDIO_WORKS.slice(0, 3).map((work) => (
                    <button
                      key={work.id}
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenWork(work);
                      }}
                      className="group text-left rounded overflow-hidden border border-black/10 bg-[#D8D2C5] transition-transform duration-200 hover:-translate-y-0.5"
                    >
                      <div className="aspect-[3/4] overflow-hidden">
                        <img
                          src={work.heroCard}
                          alt={work.title}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <div className="p-2.5 bg-[#EBE6DC]">
                        <div className="font-sans-ui text-xs font-semibold text-[#18181B] truncate">
                          {work.title}
                        </div>
                        <div className="font-mono-code text-[10px] text-[#6E6A63]">
                          {work.duration} · {work.year}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeDrawer === 'process' && (
            <div className="space-y-8">
              <div>
                <div className="font-mono-code text-xs tracking-[0.14em] text-[#6E6A63] uppercase">
                  FOUR PAINT BEDS · GOUACHE WORKFLOW
                </div>
                <h2 className="mt-2 font-display text-4xl sm:text-5xl font-medium tracking-tight leading-[1.06]">
                  Sketch, layout, paint, motion.
                </h2>
                <p className="mt-3 font-sans-ui text-[15px] leading-relaxed text-[#3A3733]">
                  Sketches go up on one wall. Every layer is painted by hand and moves at its own
                  pace. Here is how a single shot travels through our studio.
                </p>
              </div>

              <div className="divide-y divide-[#232220]/10 border-y border-[#232220]/10">
                {PROCESS_STEPS.map((step) => (
                  <div key={step.number} className="py-5 space-y-2">
                    <div className="flex items-baseline justify-between gap-4">
                      <h3 className="font-display text-2xl font-semibold text-[#18181B]">
                        {step.number}. {step.title}
                      </h3>
                      <span className="font-mono-code text-[11px] text-[#6E6A63]">
                        {step.subtitle}
                      </span>
                    </div>
                    <p className="font-sans-ui text-sm leading-relaxed text-[#3A3733]">
                      {step.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeDrawer === 'journal' && (
            <div className="space-y-7">
              <div>
                <div className="font-mono-code text-xs tracking-[0.14em] text-[#6E6A63] uppercase">
                  STUDIO NOTES & PIGMENT DIARIES
                </div>
                <h2 className="mt-2 font-display text-4xl sm:text-5xl font-medium tracking-tight">
                  From the Paint Desk
                </h2>
              </div>

              <div className="divide-y divide-[#232220]/10 border-y border-[#232220]/10">
                {JOURNAL_ENTRIES.map((entry, idx) => (
                  <article key={idx} className="py-6 space-y-2">
                    <div className="font-mono-code text-xs text-[#6E6A63]">
                      {entry.date} · {entry.readTime}
                    </div>
                    <h3 className="font-display text-2xl sm:text-3xl font-semibold text-[#18181B]">
                      {entry.title}
                    </h3>
                    <p className="font-sans-ui text-sm leading-relaxed text-[#3A3733]">
                      {entry.excerpt}
                    </p>
                  </article>
                ))}
              </div>
            </div>
          )}

          {activeDrawer === 'careers' && (
            <div className="space-y-7">
              <div>
                <div className="font-mono-code text-xs tracking-[0.14em] text-[#6E6A63] uppercase">
                  OPEN BENCH SEATS · TOKYO & REMOTE
                </div>
                <h2 className="mt-2 font-display text-4xl sm:text-5xl font-medium tracking-tight">
                  Paint With Us
                </h2>
                <p className="mt-3 font-sans-ui text-sm leading-relaxed text-[#3A3733]">
                  We review traditional sketchbooks, gouache sky studies, and pencil tests on the
                  first Monday of every month.
                </p>
              </div>

              <div className="divide-y divide-[#232220]/10 border-y border-[#232220]/10">
                {CAREERS_OPENINGS.map((job) => {
                  const isApplied = appliedRole === job.role;
                  return (
                    <div key={job.role} className="py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-1.5">
                        <div className="font-mono-code text-[11px] text-[#6E6A63]">
                          {job.department} · {job.type}
                        </div>
                        <h3 className="font-sans-ui text-base font-semibold text-[#18181B]">
                          {job.role}
                        </h3>
                        <p className="font-sans-ui text-xs sm:text-sm text-[#3A3733]">
                          {job.summary}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setAppliedRole(job.role);
                          onChangeDrawer('project');
                          setBriefNotes(`Applying for ${job.role} — Portfolio reel link: `);
                        }}
                        className="self-start sm:self-center px-4 py-2 rounded font-mono-code text-xs tracking-[0.1em] uppercase bg-[#232220] text-[#F7F4EB] hover:bg-[#D96B27] transition-colors whitespace-nowrap shrink-0"
                      >
                        {isApplied ? 'SELECTED' : 'SEND REEL →'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeDrawer === 'project' && (
            <div className="space-y-6">
              <div>
                <div className="font-mono-code text-xs tracking-[0.14em] text-[#6E6A63] uppercase">
                  COMMISSION A FILM · NEW INQUIRIES
                </div>
                <h2 className="mt-2 font-display text-4xl sm:text-5xl font-medium tracking-tight">
                  Start a project
                </h2>
                <p className="mt-2 font-sans-ui text-sm leading-relaxed text-[#3A3733]">
                  Tell us about the story, atmosphere, or brand film you want to paint. Our
                  producers respond within two studio days.
                </p>
              </div>

              {submittedBrief ? (
                <div className="p-6 rounded-xl border border-[#232220]/20 bg-white/45 space-y-4">
                  <div className="font-mono-code text-xs tracking-[0.14em] text-[#D96B27] uppercase">
                    STORYBOARD BRIEF LOGGED · 24 FPS ROSTRUM
                  </div>
                  <h3 className="font-display text-3xl font-semibold text-[#18181B]">
                    Thank you, {submittedBrief.name}.
                  </h3>
                  <p className="font-sans-ui text-sm text-[#3A3733] leading-relaxed">
                    We have pinned your <strong>{submittedBrief.format}</strong> brief ({submittedBrief.timeline}) to our studio cork wall. Producer Haruka Sato will follow up with availability and a custom gouache test schedule.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSubmittedBrief(null);
                      setSenderName('');
                      setSenderEmail('');
                      setBriefNotes('');
                    }}
                    className="px-4 py-2 rounded font-mono-code text-xs tracking-[0.12em] uppercase border border-[#232220]/30 hover:bg-[#232220] hover:text-[#F7F4EB] transition-colors"
                  >
                    SEND ANOTHER BRIEF
                  </button>
                </div>
              ) : (
                <form onSubmit={handleProjectSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-mono-code text-[11px] tracking-[0.1em] text-[#4A4742] uppercase mb-1.5">
                        Your Name / Studio *
                      </label>
                      <input
                        type="text"
                        required
                        value={senderName}
                        onChange={(e) => setSenderName(e.target.value)}
                        placeholder="Elena Vance — Studio Nord"
                        className="w-full px-3.5 py-2.5 rounded border border-[#232220]/20 bg-white/60 text-sm text-[#18181B] focus:outline-none focus:border-[#D96B27]"
                      />
                    </div>
                    <div>
                      <label className="block font-mono-code text-[11px] tracking-[0.1em] text-[#4A4742] uppercase mb-1.5">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        value={senderEmail}
                        onChange={(e) => setSenderEmail(e.target.value)}
                        placeholder="elena@studionord.com"
                        className="w-full px-3.5 py-2.5 rounded border border-[#232220]/20 bg-white/60 text-sm text-[#18181B] focus:outline-none focus:border-[#D96B27]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-mono-code text-[11px] tracking-[0.1em] text-[#4A4742] uppercase mb-1.5">
                      Format & Medium
                    </label>
                    <div className="grid grid-cols-3 gap-2 p-1 bg-[#232220]/8 rounded-lg">
                      {(['Brand film', 'Music clip', 'Short film'] as const).map((fmt) => (
                        <button
                          key={fmt}
                          type="button"
                          onClick={() => setProjectFormat(fmt)}
                          className={`py-2 px-3 rounded-md font-mono-code text-xs transition-colors whitespace-nowrap shrink-0 ${
                            projectFormat === fmt
                              ? 'bg-[#232220] text-[#F7F4EB]'
                              : 'text-[#232220]/75 hover:text-[#232220]'
                          }`}
                        >
                          {fmt}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block font-mono-code text-[11px] tracking-[0.1em] text-[#4A4742] uppercase mb-1.5">
                      Target Production Window
                    </label>
                    <select
                      value={timeline}
                      onChange={(e) => setTimeline(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded border border-[#232220]/20 bg-white/60 text-sm text-[#18181B] focus:outline-none focus:border-[#D96B27]"
                    >
                      <option value="Q4 2026 · 6–8 weeks">Q4 2026 · 6–8 weeks</option>
                      <option value="Q1 2027 · 8–12 weeks">Q1 2027 · 8–12 weeks</option>
                      <option value="Spring 2027 · Full Short Film">Spring 2027 · Full Short Film</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-mono-code text-[11px] tracking-[0.1em] text-[#4A4742] uppercase mb-1.5">
                      Scene & Story Notes
                    </label>
                    <textarea
                      rows={4}
                      value={briefNotes}
                      onChange={(e) => setBriefNotes(e.target.value)}
                      placeholder="Describe the setting, mood, duration, or visual references..."
                      className="w-full px-3.5 py-2.5 rounded border border-[#232220]/20 bg-white/60 text-sm text-[#18181B] focus:outline-none focus:border-[#D96B27]"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 px-5 rounded-lg bg-[#232220] text-[#F7F4EB] hover:bg-[#D96B27] font-mono-code text-xs tracking-[0.14em] uppercase transition-colors"
                  >
                    PIN BRIEF TO STUDIO WALL →
                  </button>
                </form>
              )}
            </div>
          )}
        </div>

        <div className="px-6 sm:px-8 py-4 border-t border-[#232220]/10 flex items-center justify-between text-[11px] font-mono-code text-[#6E6A63]">
          <span>LAYERS STUDIO · SHIBUYA-KU, TOKYO</span>
          <span>HELLO@LAYERS-STUDIO.JP</span>
        </div>
      </div>
    </div>
  );
};
