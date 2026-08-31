import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  ArrowDown, 
  Shield, 
  FileText, 
  ChevronRight, 
  Eye, 
  Play, 
  UserPlus, 
  ShieldAlert, 
  CheckCircle2, 
  Scale, 
  Copy,
  Sparkles,
  Crown,
  Download,
  Terminal
} from 'lucide-react';
import { SITE_INFO, ASSETS, STATISTICS } from '../data/config';
import { ambientSound } from '../utils/ambientAudio';

interface HeroProps {
  onEnter: () => void;
  onOpenClassified: () => void;
  onOpenCaseFileSequence?: () => void;
  onOpenJoinModal?: () => void;
  onNotify?: (msg: string, type?: 'info' | 'success' | 'alert' | 'copy') => void;
}

export const Hero: React.FC<HeroProps> = ({ 
  onEnter, 
  onOpenClassified, 
  onOpenCaseFileSequence,
  onOpenJoinModal,
  onNotify
}) => {
  const [activeTab, setActiveTab] = useState<'WATCHLIST' | 'PROTOCOL' | 'CREED'>('WATCHLIST');

  const handleActionClick = (fn?: () => void) => {
    ambientSound.playClick();
    if (fn) fn();
  };

  const handleCopyMotto = () => {
    ambientSound.playTelegraph();
    navigator.clipboard.writeText(SITE_INFO.motto);
    if (onNotify) {
      onNotify('R4V IRREVOCABLE MANDATE COPIED TO CLIPBOARD.', 'copy');
    }
  };

  return (
    <section
      id="hero"
      className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-[#070809] film-grain pt-12 pb-20"
    >
      {/* Background Image with Cinematic Noir Gradients & Vignette */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="w-full h-full transform scale-105 transition-transform duration-1000">
          <img
            src={ASSETS.heroOffice}
            alt="1920s Birmingham Private Bureau Office at Night"
            className="w-full h-full object-cover object-center filter grayscale-[30%] contrast-[115%] brightness-[55%]"
            referrerPolicy="no-referrer"
          />
        </div>

        {/* Noir Vignette & Atmospheric Radial Shadow */}
        <div className="absolute inset-0 bg-radial from-transparent via-[#08090a]/75 to-[#050607]/95" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#08090a] via-transparent to-[#08090a]/85" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#08090a]/90 via-transparent to-[#08090a]/90" />
      </div>

      {/* Decorative Archival Corner Borders */}
      <div className="absolute top-12 left-8 w-16 h-16 border-t-2 border-l-2 border-[#c5a059]/40 pointer-events-none hidden md:block" />
      <div className="absolute top-12 right-8 w-16 h-16 border-t-2 border-r-2 border-[#c5a059]/40 pointer-events-none hidden md:block" />
      <div className="absolute bottom-8 left-8 w-16 h-16 border-b-2 border-l-2 border-[#c5a059]/40 pointer-events-none hidden md:block" />
      <div className="absolute bottom-8 right-8 w-16 h-16 border-b-2 border-r-2 border-[#c5a059]/40 pointer-events-none hidden md:block" />

      {/* Central Content Container */}
      <div className="relative z-20 max-w-4xl mx-auto px-4 sm:px-6 text-center flex flex-col items-center">
        {/* Vintage Archival Top Classification Stamp + King of Banning Crown */}
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="mb-6 flex flex-col items-center gap-2.5"
        >
          {/* King of Banning / Com Supreme Authority Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1 bg-[#1c150c] border border-[#c5a059] shadow-[0_0_20px_rgba(197,160,89,0.3)] rounded-full">
            <Crown size={14} className="text-[#e5cb91] animate-pulse" />
            <span className="font-cinzel text-xs font-bold uppercase tracking-[0.25em] text-[#e5cb91]">
              KING OF BANNING // MOST POWERFUL IN COM
            </span>
            <Sparkles size={12} className="text-[#c5a059]" />
          </div>

          <div className="flex items-center justify-center gap-3">
            <span className="h-[1px] w-10 sm:w-14 bg-gradient-to-r from-transparent to-[#c5a059]/60" />
            <div className="flex items-center gap-2 px-3.5 py-1 bg-[#15181c]/90 border border-[#c5a059]/40 shadow-lg">
              <Eye size={13} className="text-[#c5a059]" />
              <span className="font-mono-vintage text-[11px] uppercase tracking-[0.25em] text-[#dfc181]">
                INTELLIGENCE BUREAU // PRIVATE ARCHIVE
              </span>
            </div>
            <span className="h-[1px] w-10 sm:w-14 bg-gradient-to-l from-transparent to-[#c5a059]/60" />
          </div>
        </motion.div>

        {/* Center Diamond Crest */}
        <motion.div
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.9, delay: 0.15 }}
          className="mb-7 relative"
        >
          <div className="w-24 h-24 sm:w-28 sm:h-28 mx-auto border-2 border-[#c5a059] bg-[#0f1114]/95 p-2 transform rotate-45 flex items-center justify-center shadow-[0_0_35px_rgba(197,160,89,0.25)] relative group cursor-pointer hover:border-[#dfc181] transition-all">
            <div className="w-full h-full border border-[#8c6d32]/60 flex items-center justify-center group-hover:bg-[#1a1e26] transition-colors">
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

        {/* Title: TEAM R4V */}
        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="font-cinzel text-4xl sm:text-6xl md:text-7xl font-black text-[#f3efe6] tracking-[0.18em] uppercase drop-shadow-[0_4px_24px_rgba(0,0,0,0.9)] mb-3"
        >
          {SITE_INFO.name}
        </motion.h1>

        {/* Subtitle: THE WATCHERS */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.45 }}
          className="mb-6 flex items-center justify-center gap-3"
        >
          <span className="h-[1px] w-8 sm:w-16 bg-[#c5a059]/50" />
          <h2 className="font-cinzel text-lg sm:text-2xl md:text-3xl font-semibold text-[#c5a059] tracking-[0.35em] uppercase">
            {SITE_INFO.subname}
          </h2>
          <span className="h-[1px] w-8 sm:w-16 bg-[#c5a059]/50" />
        </motion.div>

        {/* Hero Quote */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="font-editorial italic text-xl sm:text-2xl md:text-3xl text-[#d4cdbd] max-w-2xl mx-auto mb-6 leading-relaxed"
        >
          “{SITE_INFO.heroQuote}”
        </motion.p>

        {/* Taglines */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.7 }}
          className="space-y-1.5 mb-9"
        >
          <div className="font-cinzel text-xs sm:text-sm md:text-base tracking-[0.25em] text-[#e3ded4] font-bold uppercase">
            {SITE_INFO.mainTagline}
          </div>
          <div className="font-mono-vintage text-xs tracking-[0.2em] text-[#9c9589] uppercase">
            {SITE_INFO.secondaryTagline}
          </div>
        </motion.div>

        {/* Call to Actions Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.8 }}
          className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-3 sm:gap-4 w-full max-w-3xl mb-12"
        >
          {/* Main ENTER CTA */}
          <button
            id="hero-enter-btn"
            onClick={() => handleActionClick(onEnter)}
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
              onClick={() => handleActionClick(onOpenJoinModal)}
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
              onClick={() => handleActionClick(onOpenCaseFileSequence)}
              className="w-full sm:w-auto px-6 py-3.5 bg-[#2d0e11]/90 hover:bg-[#481419] border border-[#8c1d1d] hover:border-[#df878b] text-[#f2a2a6] font-mono-vintage text-xs tracking-[0.2em] uppercase transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-[0_4px_20px_rgba(140,29,29,0.35)] group"
            >
              <Play size={14} className="text-[#df878b] group-hover:scale-125 transition-transform" />
              <span>CASE #R4V-NEW-001</span>
            </button>
          )}

          {/* New Methods & Protocols Public Repository CTA */}
          <button
            id="hero-methods-btn"
            onClick={() => {
              ambientSound.playClick();
              const methodsSection = document.getElementById('methods');
              if (methodsSection) {
                methodsSection.scrollIntoView({ behavior: 'smooth' });
              }
            }}
            className="w-full sm:w-auto px-6 py-3.5 bg-[#171a22] hover:bg-[#202530] border border-[#c5a059] text-[#e5cb91] font-cinzel font-bold text-xs sm:text-sm tracking-[0.2em] uppercase transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-[0_4px_20px_rgba(197,160,89,0.2)] group"
          >
            <Download size={14} className="text-[#c5a059] group-hover:scale-110 transition-transform" />
            <span>OPERATIONAL METHODS</span>
          </button>

          {/* Secondary Classified CTA */}
          <button
            id="hero-classified-file-btn"
            onClick={() => handleActionClick(onOpenClassified)}
            className="w-full sm:w-auto px-6 py-3.5 bg-[#14161a]/90 hover:bg-[#20242b] border border-[#591619] hover:border-[#991b1b] text-[#e3ded4] font-mono-vintage text-xs tracking-[0.2em] uppercase transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-lg"
          >
            <FileText size={15} className="text-[#c5a059]" />
            <span>OPEN CLASSIFIED FILE</span>
          </button>
        </motion.div>

        {/* Live Bureau Quick Matrix (Interactive Mini HUD) */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.9 }}
          className="w-full max-w-2xl bg-[#0e1014]/90 border border-[#262b35] p-4 text-left shadow-2xl relative"
        >
          {/* Tab Selector */}
          <div className="flex items-center justify-between border-b border-[#20242c] pb-2 mb-3">
            <div className="flex items-center gap-1 sm:gap-2">
              <button
                onClick={() => {
                  ambientSound.playClick(1000);
                  setActiveTab('WATCHLIST');
                }}
                className={`px-2.5 py-1 text-[11px] font-mono-vintage tracking-wider transition-colors cursor-pointer ${
                  activeTab === 'WATCHLIST'
                    ? 'bg-[#c5a059] text-black font-bold'
                    : 'text-[#8c8273] hover:text-[#ede8dd]'
                }`}
              >
                ACTIVE AUDITS ({STATISTICS.documentedCases})
              </button>
              <button
                onClick={() => {
                  ambientSound.playClick(1000);
                  setActiveTab('PROTOCOL');
                }}
                className={`px-2.5 py-1 text-[11px] font-mono-vintage tracking-wider transition-colors cursor-pointer ${
                  activeTab === 'PROTOCOL'
                    ? 'bg-[#c5a059] text-black font-bold'
                    : 'text-[#8c8273] hover:text-[#ede8dd]'
                }`}
              >
                5-TIER PIPELINE
              </button>
              <button
                onClick={() => {
                  ambientSound.playClick(1000);
                  setActiveTab('CREED');
                }}
                className={`px-2.5 py-1 text-[11px] font-mono-vintage tracking-wider transition-colors cursor-pointer ${
                  activeTab === 'CREED'
                    ? 'bg-[#c5a059] text-black font-bold'
                    : 'text-[#8c8273] hover:text-[#ede8dd]'
                }`}
              >
                R4V CREED
              </button>
            </div>

            <span className="font-mono-vintage text-[10px] text-[#8c6d32] hidden sm:inline">
              LIVE BUREAU DATA
            </span>
          </div>

          {/* Tab Contents */}
          {activeTab === 'WATCHLIST' && (
            <div className="space-y-2 text-xs font-mono-vintage">
              <div className="flex items-center justify-between text-[#cdc5b4]">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#f87171] animate-pulse" />
                  <span className="text-[#f87171] font-bold">CASE #R4V-NEW-001</span>
                  <span>// Digital Harassment & Impersonation Ring</span>
                </div>
                <span className="text-[#c5a059] hidden sm:inline">STAGE 02 REVIEW</span>
              </div>
              <div className="flex items-center justify-between text-[#8c8273] pt-1 border-t border-[#181b22]">
                <span>Platform Escalation Compliance Rate:</span>
                <span className="text-[#4ade80] font-bold">99.4% VERIFIED</span>
              </div>
            </div>
          )}

          {activeTab === 'PROTOCOL' && (
            <div className="text-xs font-mono-vintage text-[#cdc5b4] flex flex-wrap items-center gap-1.5 sm:gap-2">
              <span className="text-[#dfc181] font-bold">1. SOURCE</span> →
              <span>2. CONTENT</span> →
              <span>3. CONTEXT</span> →
              <span>4. RULES</span> →
              <span className="text-[#4ade80] font-bold">5. ADJUDICATION</span>
            </div>
          )}

          {activeTab === 'CREED' && (
            <div className="flex items-center justify-between text-xs font-mono-vintage">
              <span className="text-[#ede8dd] italic">
                “{SITE_INFO.motto}”
              </span>
              <button
                onClick={handleCopyMotto}
                className="text-[#c5a059] hover:text-[#fff] p-1 ml-2 transition-colors cursor-pointer"
                title="Copy Creed"
              >
                <Copy size={13} />
              </button>
            </div>
          )}
        </motion.div>
      </div>

      {/* Bottom Scroll Indicator */}
      <div
        className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex flex-col items-center gap-1 cursor-pointer opacity-70 hover:opacity-100 transition-opacity"
        onClick={() => handleActionClick(onEnter)}
      >
        <span className="font-mono-vintage text-[10px] tracking-[0.3em] text-[#8c6d32] uppercase">
          SCROLL TO INSPECT
        </span>
        <ArrowDown size={14} className="text-[#c5a059] animate-bounce" />
      </div>
    </section>
  );
};
