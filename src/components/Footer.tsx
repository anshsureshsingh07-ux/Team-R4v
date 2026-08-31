import React from 'react';
import { Shield, ArrowUp, Key, ShieldCheck, Inbox, Scale } from 'lucide-react';
import { SITE_INFO } from '../data/config';

interface FooterProps {
  onOpenPilotAccess?: () => void;
  onOpenPrivacyNotice?: () => void;
  onOpenTerms?: () => void;
  onOpenApplicantStatus?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ 
  onOpenPilotAccess,
  onOpenPrivacyNotice,
  onOpenTerms,
  onOpenApplicantStatus,
}) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="relative bg-[#050608] border-t-2 border-[#1e222a] pt-20 pb-12 film-grain">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Main Footer Row */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between pb-12 border-b border-[#1c2027] gap-8">
          {/* Brand & Tagline */}
          <div className="space-y-3 max-w-lg">
            <h2 className="font-cinzel text-3xl sm:text-4xl font-black text-[#fff6e5] tracking-[0.2em] uppercase">
              {SITE_INFO.name}
            </h2>
            <p className="font-editorial italic text-base sm:text-lg text-[#c5a059]">
              “{SITE_INFO.footerTagline}”
            </p>
            <p className="font-editorial text-xs sm:text-sm text-[#7a7469] leading-relaxed">
              Operating strictly as an evidence gathering, audit, and platform compliance documentation community. Zero tolerance for harassment, doxxing, or malicious falsehoods.
            </p>
          </div>

          {/* Navigation Directory */}
          <div className="flex flex-wrap gap-x-8 gap-y-3 font-cinzel text-xs tracking-[0.2em] text-[#9c9589] uppercase">
            <a href="#about" className="hover:text-[#e5cb91] transition-colors">
              ABOUT
            </a>
            <a href="#leadership" className="hover:text-[#e5cb91] transition-colors">
              LEADERSHIP
            </a>
            <a href="#archive" className="hover:text-[#e5cb91] transition-colors">
              ARCHIVE
            </a>
            <a href="#operations" className="hover:text-[#e5cb91] transition-colors">
              OPERATIONS
            </a>
            <a href="#code" className="hover:text-[#e5cb91] transition-colors">
              CODE
            </a>
            <a href="#bulletin" className="hover:text-[#e5cb91] transition-colors">
              BULLETIN
            </a>
            <a href="#contact" className="hover:text-[#e5cb91] transition-colors">
              CONTACT
            </a>
          </div>
        </div>

        {/* Bottom Legal, Pilot Access & Return to Top */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs font-mono-vintage text-[#635d52] gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <span>© {SITE_INFO.year} {SITE_INFO.name} — ALL RIGHTS RESERVED.</span>
            
            {onOpenTerms && (
              <button
                onClick={onOpenTerms}
                className="text-[#8c6d32] hover:text-[#e5cb91] underline flex items-center gap-1 cursor-pointer"
              >
                <Scale size={12} />
                <span>TERMS & CONDITIONS</span>
              </button>
            )}

            {onOpenPrivacyNotice && (
              <button
                onClick={onOpenPrivacyNotice}
                className="text-[#8c6d32] hover:text-[#e5cb91] underline flex items-center gap-1 cursor-pointer"
              >
                <ShieldCheck size={12} />
                <span>PRIVACY POLICY</span>
              </button>
            )}

            {onOpenApplicantStatus && (
              <button
                onClick={onOpenApplicantStatus}
                className="text-[#8c6d32] hover:text-[#e5cb91] underline flex items-center gap-1 cursor-pointer"
              >
                <Inbox size={12} />
                <span>APPLICANT STATUS INQUIRY</span>
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-4 sm:gap-6">
            {/* Classified "ACCESS THE PILOT" discrete trigger in footer */}
            <button
              onClick={() => {
                if (onOpenPilotAccess) {
                  onOpenPilotAccess();
                } else {
                  window.history.pushState({}, '', '/owner');
                  window.dispatchEvent(new PopStateEvent('popstate'));
                }
              }}
              id="footer-pilot-access-trigger"
              title="Access the Pilot / Owner Classified Panel"
              className="flex items-center gap-1.5 text-[11px] text-[#8c6d32] hover:text-[#e5cb91] transition-colors group cursor-pointer border border-[#222731] hover:border-[#8c6d32] px-2.5 py-1 bg-[#090b0e]"
            >
              <Key size={12} className="text-[#8c6d32] group-hover:text-[#e5cb91] transition-transform group-hover:rotate-45" />
              <span className="tracking-widest uppercase font-bold">ACCESS THE PILOT</span>
            </button>

            <span className="tracking-widest uppercase hidden md:inline">
              BIRMINGHAM BUREAU // PROTOCOL 4
            </span>
            <button
              onClick={scrollToTop}
              className="flex items-center gap-1 text-[#c5a059] hover:text-[#fff6e5] transition-colors cursor-pointer"
            >
              <span>TOP</span>
              <ArrowUp size={13} />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
