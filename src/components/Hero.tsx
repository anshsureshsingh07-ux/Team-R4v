import React from 'react';
import { motion } from 'motion/react';
import { ArrowDown, Shield, FileText, ChevronRight, Eye, Play, UserPlus } from 'lucide-react';
import { SITE_INFO, ASSETS } from '../data/config';

interface HeroProps {
  onEnter: () => void;
  onOpenClassified: () => void;
  onOpenCaseFileSequence?: () => void;
  onOpenJoinModal?: () => void;
}

export const Hero: React.FC<HeroProps> = ({ 
  onEnter, 
  onOpenClassified, 
  onOpenCaseFileSequence,
  onOpenJoinModal 
}) => {
  return (
    <section
      id="hero"
      className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-[#070809] film-grain"
    >
      {/* Background Image with Cinematic Noir Gradients & Vignette */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <motion.div
          initial={{ scale: 1.12, opacity: 0.8 }}
          animate={{ scale: 1.02, opacity: 0.9 }}
          transition={{ duration: 18, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }}
          className="w-full h-full"
        >
          <img
            src={ASSETS.heroOffice}
            alt="1920s Birmingham Private Bureau Office at Night"
            className="w-full h-full object-cover object-center filter grayscale-[30%] contrast-[115%] brightness-[60%]"
            referrerPolicy="no-referrer"
          />
        </motion.div>

        {/* Noir Vignette & Atmospheric Radial Shadow */}
        <div className="absolute inset-0 bg-radial from-transparent via-[#08090a]/70 to-[#050607]/95" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#08090a] via-transparent to-[#08090a]/80" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#08090a]/90 via-transparent to-[#08090a]/90" />
      </div>

      {/* Decorative Archival Corner Borders */}
      <div className="absolute top-8 left-8 w-16 h-16 border-t-2 border-l-2 border-[#c5a059]/40 pointer-events-none hidden md:block" />
      <div className="absolute top-8 right-8 w-16 h-16 border-t-2 border-r-2 border-[#c5a059]/40 pointer-events-none hidden md:block" />
      <div className="absolute bottom-8 left-8 w-16 h-16 border-b-2 border-l-2 border-[#c5a059]/40 pointer-events-none hidden md:block" />
      <div className="absolute bottom-8 right-8 w-16 h-16 border-b-2 border-r-2 border-[#c5a059]/40 pointer-events-none hidden md:block" />

      {/* Central Content Container */}
      <div className="relative z-20 max-w-4xl mx-auto px-4 sm:px-6 text-center py-24 flex flex-col items-center">
        {/* Vintage Archival Top Classification Stamp */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.2 }}
          className="mb-6 flex items-center justify-center gap-3"
        >
          <span className="h-[1px] w-12 bg-gradient-to-r from-transparent to-[#c5a059]/60" />
          <div className="flex items-center gap-2 px-3 py-1 bg-[#15181c]/90 border border-[#c5a059]/30 rounded-none shadow-lg">
            <Eye size={13} className="text-[#c5a059]" />
            <span className="font-mono-vintage text-[11px] uppercase tracking-[0.25em] text-[#dfc181]">
              INTELLIGENCE BUREAU // PRIVATE ARCHIVE
            </span>
          </div>
          <span className="h-[1px] w-12 bg-gradient-to-l from-transparent to-[#c5a059]/60" />
        </motion.div>

        {/* Center Logo / Crest */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.2, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="mb-8 relative"
        >
          <div className="w-24 h-24 sm:w-28 sm:h-28 mx-auto border-2 border-[#c5a059] bg-[#0f1114]/90 p-2 transform rotate-45 flex items-center justify-center shadow-[0_0_40px_rgba(197,160,89,0.25)] relative group">
            <div className="w-full h-full border border-[#8c6d32]/60 flex items-center justify-center">
              <div className="transform -rotate-45 text-center">
                <span className="font-cinzel text-2xl sm:text-3xl font-black tracking-widest text-[#fff6e5] block leading-none drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
                  R4V
                </span>
                <span className="font-mono-vintage text-[8px] tracking-[0.2em] text-[#c5a059] block mt-1">
                  1926
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Step 1: TEAM R4V */}
        <motion.h1
          initial={{ opacity: 0, letterSpacing: '0.4em' }}
          animate={{ opacity: 1, letterSpacing: '0.18em' }}
          transition={{ duration: 1.4, delay: 0.7 }}
          className="font-cinzel text-4xl sm:text-6xl md:text-7xl font-black text-[#f3efe6] tracking-[0.18em] uppercase drop-shadow-[0_4px_24px_rgba(0,0,0,0.9)] mb-3"
        >
          {SITE_INFO.name}
        </motion.h1>

        {/* Step 2: THE WATCHERS */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1, delay: 1.2 }}
          className="mb-6 flex items-center justify-center gap-3"
        >
          <span className="h-[1px] w-8 sm:w-16 bg-[#c5a059]/40" />
          <h2 className="font-cinzel text-lg sm:text-2xl md:text-3xl font-semibold text-[#c5a059] tracking-[0.35em] uppercase">
            {SITE_INFO.subname}
          </h2>
          <span className="h-[1px] w-8 sm:w-16 bg-[#c5a059]/40" />
        </motion.div>

        {/* Step 3: “Every action leaves a trace.” */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, delay: 1.8 }}
          className="font-editorial italic text-xl sm:text-2xl md:text-3xl text-[#d4cdbd] max-w-2xl mx-auto mb-6 leading-relaxed"
        >
          “{SITE_INFO.heroQuote}”
        </motion.p>

        {/* Taglines */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 2.3 }}
          className="space-y-2 mb-10"
        >
          <div className="font-cinzel text-xs sm:text-sm md:text-base tracking-[0.25em] text-[#e3ded4] font-bold uppercase">
            {SITE_INFO.mainTagline}
          </div>
          <div className="font-mono-vintage text-xs tracking-[0.2em] text-[#9c9589] uppercase">
            {SITE_INFO.secondaryTagline}
          </div>
        </motion.div>

        {/* Call to Actions */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 2.8 }}
          className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-3 sm:gap-4 w-full max-w-3xl"
        >
          {/* Main ENTER CTA */}
          <button
            id="hero-enter-btn"
            onClick={onEnter}
            className="w-full sm:w-auto px-7 py-3.5 bg-gradient-to-r from-[#8c6d32] via-[#c5a059] to-[#dfc181] hover:brightness-110 text-[#0f1114] font-cinzel font-bold text-xs sm:text-sm tracking-[0.25em] uppercase transition-all duration-300 shadow-[0_4px_25px_rgba(197,160,89,0.35)] flex items-center justify-center gap-2 group cursor-pointer"
          >
            <span>ENTER R4V</span>
            <ChevronRight
              size={16}
              className="group-hover:translate-x-1.5 transition-transform duration-300"
            />
          </button>

          {/* Prominent JOIN R4V CTA */}
          {onOpenJoinModal && (
            <button
              id="hero-join-r4v-btn"
              onClick={onOpenJoinModal}
              className="w-full sm:w-auto px-6 py-3.5 bg-[#181d26] hover:bg-[#222836] border-2 border-[#c5a059] text-[#fff5dc] font-cinzel font-bold text-xs sm:text-sm tracking-[0.2em] uppercase transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-[0_4px_20px_rgba(197,160,89,0.25)] group"
            >
              <UserPlus size={15} className="text-[#c5a059] group-hover:scale-110 transition-transform" />
              <span>JOIN R4V</span>
            </button>
          )}

          {/* New Case Sequence CTA */}
          {onOpenCaseFileSequence && (
            <button
              id="hero-case-sequence-btn"
              onClick={onOpenCaseFileSequence}
              className="w-full sm:w-auto px-6 py-3.5 bg-[#2d0e11]/90 hover:bg-[#481419] border border-[#8c1d1d] hover:border-[#df878b] text-[#f2a2a6] font-mono-vintage text-xs tracking-[0.2em] uppercase transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-[0_4px_20px_rgba(140,29,29,0.35)] group"
            >
              <Play size={14} className="text-[#df878b] group-hover:scale-125 transition-transform" />
              <span>CASE #R4V-NEW-001</span>
            </button>
          )}

          {/* Secondary Classified CTA */}
          <button
            id="hero-classified-file-btn"
            onClick={onOpenClassified}
            className="w-full sm:w-auto px-6 py-3.5 bg-[#14161a]/90 hover:bg-[#20242b] border border-[#591619] hover:border-[#991b1b] text-[#e3ded4] font-mono-vintage text-xs tracking-[0.2em] uppercase transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-lg"
          >
            <FileText size={15} className="text-[#c5a059]" />
            <span>OPEN CLASSIFIED FILE</span>
          </button>
        </motion.div>
      </div>

      {/* Bottom Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.6 }}
        transition={{ delay: 3.2, duration: 1 }}
        className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex flex-col items-center gap-2 cursor-pointer"
        onClick={onEnter}
      >
        <span className="font-mono-vintage text-[10px] tracking-[0.3em] text-[#8c6d32] uppercase">
          SCROLL TO INSPECT
        </span>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <ArrowDown size={14} className="text-[#c5a059]" />
        </motion.div>
      </motion.div>
    </section>
  );
};
