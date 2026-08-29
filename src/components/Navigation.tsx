import React, { useState, useEffect } from 'react';
import { Shield, Volume2, VolumeX, Menu, X, FileText, Lock, Play, UserPlus, Key } from 'lucide-react';
import { ambientSound } from '../utils/ambientAudio';

interface NavigationProps {
  onOpenClassified: () => void;
  onOpenCaseFileSequence?: () => void;
  onOpenJoinModal?: () => void;
  onOpenPilotAccess?: () => void;
  activeSection: string;
}

export const Navigation: React.FC<NavigationProps> = ({ 
  onOpenClassified, 
  onOpenCaseFileSequence, 
  onOpenJoinModal,
  onOpenPilotAccess,
  activeSection 
}) => {
  const [isAudioPlaying, setIsAudioPlaying] = useState<boolean>(false);
  const [isScrolled, setIsScrolled] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleSound = () => {
    const playing = ambientSound.toggle();
    setIsAudioPlaying(playing);
  };

  const navLinks = [
    { label: 'ABOUT', href: '#about', id: 'about' },
    { label: 'LEADERSHIP', href: '#leadership', id: 'leadership' },
    { label: 'ARCHIVE', href: '#archive', id: 'archive' },
    { label: 'OPERATIONS', href: '#operations', id: 'operations' },
    { label: 'CODE', href: '#code', id: 'code' },
    { label: 'BULLETIN', href: '#bulletin', id: 'bulletin' },
    { label: 'CONTACT', href: '#contact', id: 'contact' },
  ];

  return (
    <header
      id="main-navigation"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled
          ? 'bg-[#0b0d10]/95 backdrop-blur-md border-b border-[#c5a059]/25 py-3 shadow-[0_10px_30px_rgba(0,0,0,0.8)]'
          : 'bg-gradient-to-b from-[#08090a]/90 to-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Brand / Crest */}
        <a
          href="#hero"
          id="nav-brand-logo"
          className="flex items-center gap-3 group focus:outline-none"
        >
          <div className="w-9 h-9 border border-[#c5a059]/60 flex items-center justify-center bg-[#15181c] relative transform rotate-45 group-hover:border-[#e5cb91] transition-all duration-300 shadow-[0_0_15px_rgba(197,160,89,0.15)]">
            <span className="font-cinzel text-xs font-bold text-[#c5a059] transform -rotate-45 group-hover:text-white">
              R4V
            </span>
          </div>
          <div className="flex flex-col">
            <span className="font-cinzel tracking-[0.25em] text-sm sm:text-base font-bold text-[#e3ded4] group-hover:text-[#c5a059] transition-colors">
              TEAM R4V
            </span>
            <span className="font-mono-vintage text-[10px] tracking-[0.3em] text-[#8c6d32] uppercase">
              EST. BIRMINGHAM // 1924
            </span>
          </div>
        </a>

        {/* Desktop Navigation Links */}
        <nav id="desktop-nav-links" className="hidden lg:flex items-center gap-1 border-x border-[#c5a059]/20 px-4 py-1">
          {navLinks.map((link) => {
            const isActive = activeSection === link.id;
            return (
              <a
                key={link.id}
                href={link.href}
                id={`nav-link-${link.id}`}
                className={`font-cinzel text-xs tracking-[0.2em] px-3 py-1.5 transition-all duration-300 uppercase relative ${
                  isActive
                    ? 'text-[#e5cb91] font-semibold'
                    : 'text-[#9c9589] hover:text-[#e3ded4] hover:bg-[#181a1f]/60'
                }`}
              >
                {link.label}
                {isActive && (
                  <span className="absolute bottom-0 left-2 right-2 h-[1px] bg-[#c5a059]" />
                )}
              </a>
            );
          })}
        </nav>

        {/* Controls & Dossier CTA */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Ambient Sound Toggle (Gramophone / Rain) */}
          <button
            id="nav-ambient-sound-toggle"
            onClick={toggleSound}
            title={isAudioPlaying ? 'Mute 1920s Ambient Audio' : 'Play 1920s Rain & Vinyl Ambience'}
            className={`p-2 border transition-all duration-300 flex items-center gap-1.5 text-xs font-mono-vintage ${
              isAudioPlaying
                ? 'border-[#c5a059] bg-[#380b0e]/50 text-[#e5cb91] shadow-[0_0_12px_rgba(197,160,89,0.25)]'
                : 'border-[#272a30] bg-[#121417]/80 text-[#8c8273] hover:border-[#c5a059]/50 hover:text-[#e3ded4]'
            }`}
          >
            {isAudioPlaying ? <Volume2 size={15} className="text-[#c5a059] animate-pulse" /> : <VolumeX size={15} />}
            <span className="hidden sm:inline text-[10px] tracking-wider uppercase">
              {isAudioPlaying ? 'AMB ON' : 'AMB OFF'}
            </span>
          </button>

          {/* Case File Sequence Trigger */}
          {onOpenCaseFileSequence && (
            <button
              id="nav-case-sequence-btn"
              onClick={onOpenCaseFileSequence}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-[#8c1d1d] bg-[#2a0e10] hover:bg-[#401216] hover:border-[#df878b] text-[#f2a2a6] text-xs font-mono-vintage tracking-wider transition-all duration-300 shadow-[0_2px_10px_rgba(140,29,29,0.3)] group cursor-pointer"
              title="Watch Cinematic Case File Sequence"
            >
              <Play size={12} className="text-[#df878b] group-hover:scale-125 transition-transform" />
              <span className="hidden md:inline">CASE:</span>
              <span className="font-bold">R4V-NEW-001</span>
            </button>
          )}

          {/* Classified Dossier Modal Trigger */}
          <button
            id="nav-classified-dossier-btn"
            onClick={onOpenClassified}
            className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 border border-[#591619] bg-[#220a0c] hover:bg-[#380b0e] hover:border-[#991b1b] text-[#e3ded4] text-xs font-mono-vintage tracking-wider transition-all duration-300 shadow-[0_2px_10px_rgba(0,0,0,0.5)] group cursor-pointer"
          >
            <Lock size={13} className="text-[#c5a059] group-hover:rotate-12 transition-transform" />
            <span className="hidden xs:inline">FILE:</span>
            <span className="text-[#e5cb91] font-bold">R4V-001</span>
          </button>

          {/* Prominent JOIN R4V CTA */}
          {onOpenJoinModal && (
            <button
              id="nav-join-r4v-btn"
              onClick={onOpenJoinModal}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-gradient-to-r from-[#8c6d32] via-[#c5a059] to-[#dfc181] hover:brightness-110 text-black font-cinzel font-bold text-xs tracking-widest uppercase transition-all duration-300 shadow-[0_2px_15px_rgba(197,160,89,0.35)] cursor-pointer"
            >
              <UserPlus size={13} className="text-black" />
              <span>JOIN R4V</span>
            </button>
          )}

          {/* Mobile Menu Toggle */}
          <button
            id="nav-mobile-menu-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-[#e3ded4] hover:text-[#c5a059] border border-[#272a30] bg-[#15181c]"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div
          id="mobile-navigation-drawer"
          className="lg:hidden bg-[#0e1013] border-b border-[#c5a059]/30 px-6 py-6 space-y-4 shadow-2xl animate-in fade-in slide-in-from-top-4 duration-300"
        >
          <div className="flex items-center justify-between pb-3 border-b border-[#23262d]">
            <div className="flex items-center gap-2">
              <FileText size={16} className="text-[#c5a059]" />
              <span className="font-mono-vintage text-xs tracking-widest text-[#9c9589]">
                EXECUTIVE DIRECTORY
              </span>
            </div>
            <span className="stamp-classified text-[10px] py-0.5 px-2">INTERNAL</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {navLinks.map((link) => (
              <a
                key={link.id}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="font-cinzel text-xs tracking-widest p-2.5 text-[#cdc5b4] hover:text-[#e5cb91] hover:bg-[#181b20] border border-[#1e2229] flex items-center justify-between"
              >
                <span>{link.label}</span>
                <span className="text-[10px] text-[#8c6d32] font-mono-vintage">→</span>
              </a>
            ))}
          </div>

          <div className="pt-2 space-y-2">
            {onOpenJoinModal && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenJoinModal();
                }}
                className="w-full py-3 bg-gradient-to-r from-[#8c6d32] via-[#c5a059] to-[#dfc181] text-black font-cinzel font-bold text-xs tracking-widest uppercase flex items-center justify-center gap-2 shadow-lg"
              >
                <UserPlus size={15} className="text-black" />
                JOIN TEAM R4V
              </button>
            )}

            {onOpenCaseFileSequence && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenCaseFileSequence();
                }}
                className="w-full py-2.5 bg-[#401216] border border-[#8c1d1d] text-[#f2a2a6] text-xs font-mono-vintage tracking-widest flex items-center justify-center gap-2"
              >
                <Play size={14} className="text-[#df878b]" />
                CASE FILE #R4V-NEW-001 SEQUENCE
              </button>
            )}

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenClassified();
              }}
              className="w-full py-2.5 bg-[#380b0e] border border-[#991b1b] text-[#fff6e5] text-xs font-mono-vintage tracking-widest flex items-center justify-center gap-2 cursor-pointer"
            >
              <Lock size={14} className="text-[#c5a059]" />
              OPEN CLASSIFIED DOSSIER
            </button>

            {onOpenPilotAccess && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenPilotAccess();
                }}
                className="w-full py-2 bg-[#090b0e] hover:bg-[#12151c] border border-[#3a3020] hover:border-[#c5a059] text-[#c5a059] text-[11px] font-mono-vintage tracking-widest flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <Key size={13} className="text-[#c5a059]" />
                ACCESS THE PILOT
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
