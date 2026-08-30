import React, { useState, useEffect } from 'react';
import { Shield, Volume2, VolumeX, Menu, X, FileText, Lock, Play, UserPlus, Key } from 'lucide-react';
import { ambientSound } from '../utils/ambientAudio';

interface NavigationProps {
  onOpenClassified: () => void;
  onOpenCaseFileSequence?: () => void;
  onOpenJoinModal?: () => void;
  onOpenPilotAccess?: () => void;
  activeSection: string;
  onNotify?: (msg: string, type?: 'info' | 'success' | 'alert' | 'copy') => void;
}

export const Navigation: React.FC<NavigationProps> = ({ 
  onOpenClassified, 
  onOpenCaseFileSequence, 
  onOpenJoinModal,
  onOpenPilotAccess,
  activeSection,
  onNotify
}) => {
  const [isAudioPlaying, setIsAudioPlaying] = useState<boolean>(ambientSound.getStatus());
  const [isScrolled, setIsScrolled] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setIsScrolled(window.scrollY > 40);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleSound = () => {
    const playing = ambientSound.toggle();
    setIsAudioPlaying(playing);
    ambientSound.playClick(playing ? 1100 : 700);
    if (onNotify) {
      onNotify(playing ? '1920s Rain & Vinyl Ambience Engaged.' : 'Ambient Gramophone Muted.', 'info');
    }
  };

  const handleNavClick = (href: string) => {
    ambientSound.playClick();
    setMobileMenuOpen(false);
    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
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
      className={`sticky top-0 left-0 right-0 z-40 transition-all duration-300 ${
        isScrolled
          ? 'bg-[#0b0d10]/95 backdrop-blur-md border-b border-[#c5a059]/30 py-2.5 shadow-[0_10px_30px_rgba(0,0,0,0.85)]'
          : 'bg-[#08090a]/90 backdrop-blur-xs border-b border-[#1a1d24] py-3.5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Brand / Crest */}
        <a
          href="#hero"
          id="nav-brand-logo"
          onClick={(e) => {
            e.preventDefault();
            handleNavClick('#hero');
          }}
          className="flex items-center gap-3 group focus:outline-none cursor-pointer"
        >
          <div className="w-8 h-8 sm:w-9 sm:h-9 border border-[#c5a059]/70 flex items-center justify-center bg-[#15181c] relative transform rotate-45 group-hover:border-[#e5cb91] transition-all duration-300 shadow-[0_0_15px_rgba(197,160,89,0.15)]">
            <span className="font-cinzel text-xs font-bold text-[#c5a059] transform -rotate-45 group-hover:text-white">
              R4V
            </span>
          </div>
          <div className="flex flex-col">
            <span className="font-cinzel tracking-[0.25em] text-sm sm:text-base font-bold text-[#e3ded4] group-hover:text-[#c5a059] transition-colors leading-tight">
              TEAM R4V
            </span>
            <span className="font-mono-vintage text-[9px] sm:text-[10px] tracking-[0.3em] text-[#8c6d32] uppercase">
              EST. BIRMINGHAM // 1924
            </span>
          </div>
        </a>

        {/* Desktop Navigation Links */}
        <nav id="desktop-nav-links" className="hidden lg:flex items-center gap-1 border-x border-[#c5a059]/20 px-3 py-1">
          {navLinks.map((link) => {
            const isActive = activeSection === link.id;
            return (
              <a
                key={link.id}
                href={link.href}
                id={`nav-link-${link.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  handleNavClick(link.href);
                }}
                className={`font-cinzel text-xs tracking-[0.2em] px-2.5 py-1.5 transition-all duration-200 uppercase relative cursor-pointer ${
                  isActive
                    ? 'text-[#e5cb91] font-bold'
                    : 'text-[#9c9589] hover:text-[#e3ded4] hover:bg-[#181a1f]/60'
                }`}
              >
                {link.label}
                {isActive && (
                  <span className="absolute bottom-0 left-2 right-2 h-[2px] bg-[#c5a059]" />
                )}
              </a>
            );
          })}
        </nav>

        {/* Controls & Dossier CTA */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Ambient Sound Toggle */}
          <button
            id="nav-ambient-sound-toggle"
            onClick={toggleSound}
            title={isAudioPlaying ? 'Mute 1920s Ambient Audio (M)' : 'Play 1920s Rain & Vinyl Ambience (M)'}
            className={`p-2 border transition-all duration-200 flex items-center gap-1.5 text-xs font-mono-vintage cursor-pointer ${
              isAudioPlaying
                ? 'border-[#c5a059] bg-[#380b0e]/60 text-[#e5cb91] shadow-[0_0_12px_rgba(197,160,89,0.25)]'
                : 'border-[#272a30] bg-[#121417]/90 text-[#8c8273] hover:border-[#c5a059]/60 hover:text-[#e3ded4]'
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
              onClick={() => {
                ambientSound.playClick();
                onOpenCaseFileSequence();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-[#8c1d1d] bg-[#2a0e10] hover:bg-[#401216] hover:border-[#df878b] text-[#f2a2a6] text-xs font-mono-vintage tracking-wider transition-all duration-200 shadow-[0_2px_10px_rgba(140,29,29,0.3)] group cursor-pointer"
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
            onClick={() => {
              ambientSound.playStamp();
              onOpenClassified();
            }}
            className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 border border-[#591619] bg-[#220a0c] hover:bg-[#380b0e] hover:border-[#991b1b] text-[#e3ded4] text-xs font-mono-vintage tracking-wider transition-all duration-200 shadow-[0_2px_10px_rgba(0,0,0,0.5)] group cursor-pointer"
          >
            <Lock size={13} className="text-[#c5a059] group-hover:rotate-12 transition-transform" />
            <span className="hidden xs:inline">FILE:</span>
            <span className="text-[#e5cb91] font-bold">R4V-001</span>
          </button>

          {/* Prominent JOIN R4V CTA */}
          {onOpenJoinModal && (
            <button
              id="nav-join-r4v-btn"
              onClick={() => {
                ambientSound.playClick();
                onOpenJoinModal();
              }}
              className="flex items-center gap-1.5 px-3.5 sm:px-4 py-1.5 bg-gradient-to-r from-[#8c6d32] via-[#c5a059] to-[#dfc181] hover:brightness-110 text-black font-cinzel font-bold text-xs tracking-widest uppercase transition-all duration-200 shadow-[0_2px_15px_rgba(197,160,89,0.35)] cursor-pointer"
            >
              <UserPlus size={13} className="text-black" />
              <span>JOIN</span>
            </button>
          )}

          {/* Mobile Menu Toggle */}
          <button
            id="nav-mobile-menu-toggle"
            onClick={() => {
              ambientSound.playClick();
              setMobileMenuOpen(!mobileMenuOpen);
            }}
            className="lg:hidden p-2 text-[#e3ded4] hover:text-[#c5a059] border border-[#272a30] bg-[#15181c] cursor-pointer"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div
          id="mobile-navigation-drawer"
          className="lg:hidden bg-[#0e1013] border-b border-[#c5a059]/40 px-5 py-5 space-y-4 shadow-2xl"
        >
          <div className="flex items-center justify-between pb-2.5 border-b border-[#23262d]">
            <div className="flex items-center gap-2">
              <FileText size={15} className="text-[#c5a059]" />
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
                onClick={(e) => {
                  e.preventDefault();
                  handleNavClick(link.href);
                }}
                className="font-cinzel text-xs tracking-widest p-2.5 text-[#cdc5b4] hover:text-[#e5cb91] hover:bg-[#181b20] border border-[#1e2229] flex items-center justify-between cursor-pointer"
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
                  ambientSound.playClick();
                  onOpenJoinModal();
                }}
                className="w-full py-2.5 bg-gradient-to-r from-[#8c6d32] via-[#c5a059] to-[#dfc181] text-black font-cinzel font-bold text-xs tracking-widest uppercase flex items-center justify-center gap-2 shadow-lg cursor-pointer"
              >
                <UserPlus size={14} className="text-black" />
                JOIN TEAM R4V
              </button>
            )}

            {onOpenCaseFileSequence && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  ambientSound.playClick();
                  onOpenCaseFileSequence();
                }}
                className="w-full py-2.5 bg-[#401216] border border-[#8c1d1d] text-[#f2a2a6] text-xs font-mono-vintage tracking-widest flex items-center justify-center gap-2 cursor-pointer"
              >
                <Play size={13} className="text-[#df878b]" />
                CASE FILE #R4V-NEW-001 SEQUENCE
              </button>
            )}

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                ambientSound.playStamp();
                onOpenClassified();
              }}
              className="w-full py-2.5 bg-[#380b0e] border border-[#991b1b] text-[#fff6e5] text-xs font-mono-vintage tracking-widest flex items-center justify-center gap-2 cursor-pointer"
            >
              <Lock size={13} className="text-[#c5a059]" />
              OPEN CLASSIFIED DOSSIER
            </button>

            {onOpenPilotAccess && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  ambientSound.playClick();
                  onOpenPilotAccess();
                }}
                className="w-full py-2 bg-[#090b0e] hover:bg-[#12151c] border border-[#3a3020] hover:border-[#c5a059] text-[#c5a059] text-[11px] font-mono-vintage tracking-widest flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <Key size={12} className="text-[#c5a059]" />
                ACCESS THE PILOT
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
