import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Lock, FileText, Stamp, ShieldCheck, Eye, Key } from 'lucide-react';
import { SITE_INFO } from '../data/config';

interface ClassifiedDossierModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenPilotAccess?: () => void;
}

export const ClassifiedDossierModal: React.FC<ClassifiedDossierModalProps> = ({ 
  isOpen, 
  onClose,
  onOpenPilotAccess 
}) => {
  const [typedText, setTypedText] = useState<string>('');
  const fullQuote = SITE_INFO.classifiedQuote; // "The archive records what the internet forgets."

  useEffect(() => {
    if (!isOpen) {
      setTypedText('');
      return;
    }

    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex <= fullQuote.length) {
        setTypedText(fullQuote.slice(0, currentIndex));
        currentIndex++;
      } else {
        clearInterval(interval);
      }
    }, 45);

    return () => clearInterval(interval);
  }, [isOpen, fullQuote]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/90 backdrop-blur-md">
        {/* Dossier Container */}
        <motion.div
          initial={{ scale: 0.85, opacity: 0, rotateX: 10 }}
          animate={{ scale: 1, opacity: 1, rotateX: 0 }}
          exit={{ scale: 0.85, opacity: 0, rotateX: 10 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="bg-[#14161b] border-2 border-[#c5a059] max-w-2xl w-full p-6 sm:p-10 relative shadow-[0_30px_90px_rgba(0,0,0,0.95)] max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Manila / Leather File Header Stripe */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#591619] via-[#8c6d32] to-[#c5a059]" />

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-1 text-[#8c8273] hover:text-[#e5cb91] border border-[#272b34] hover:border-[#c5a059] transition-colors"
            title="CLOSE CLASSIFIED FILE"
          >
            <X size={18} />
          </button>

          {/* Classification Header Stamp */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-6 border-b-2 border-[#262b35] mb-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Lock size={15} className="text-[#c5a059]" />
                <span className="font-cinzel text-lg font-black text-[#ede8dd] tracking-widest">
                  TEAM R4V
                </span>
              </div>
              <div className="font-mono-vintage text-xs tracking-widest text-[#8c6d32]">
                FILE: <span className="text-[#e5cb91] font-bold">R4V-001</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="stamp-classified text-xs">INTERNAL ONLY</span>
              <span className="stamp-sealed text-[10px] px-2 py-0.5">EYES ONLY</span>
            </div>
          </div>

          {/* Dossier Body Content */}
          <div className="space-y-6">
            {/* Classification Banner */}
            <div className="p-4 bg-[#0d0f12] border border-[#232731] flex items-center justify-between">
              <span className="font-mono-vintage text-xs text-[#7a7469] tracking-wider uppercase">
                SECURITY CLASSIFICATION:
              </span>
              <span className="font-mono-vintage text-xs text-[#df878b] font-bold tracking-widest">
                RESTRICTED // EXECUTIVE CLEARANCE
              </span>
            </div>

            {/* Typewriter Reveal Section */}
            <div className="p-6 bg-[#08090a] border-l-4 border-[#c5a059] my-6">
              <span className="font-mono-vintage text-[10px] text-[#8c6d32] uppercase tracking-[0.25em] block mb-2">
                DECRYPTED ARCHIVAL MAXIM
              </span>
              <p className="font-typewriter text-lg sm:text-2xl text-[#fff6e5] min-h-[3rem] leading-snug">
                “{typedText}”
                <span className="inline-block w-2.5 h-5 bg-[#c5a059] ml-1 animate-pulse" />
              </p>
            </div>

            {/* Tactical Directives Memo */}
            <div className="space-y-3 font-editorial text-sm sm:text-base text-[#cfc8bc]">
              <h4 className="font-cinzel text-sm font-bold text-[#e5cb91] tracking-wider uppercase">
                EXECUTIVE SUMMARY & OPERATIONAL MANDATE
              </h4>
              <p className="leading-relaxed bg-[#101216] p-4 border border-[#1e2229]">
                This dossier confirms that Team R4V operates as a sovereign intelligence and documentation community. All evidentiary records compiled within this archive are maintained with strict non-repudiation protocols.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono-vintage pt-2">
                <div className="p-3 bg-[#0d0f12] border border-[#1e2229]">
                  <span className="text-[#7a7469] block">BUREAU LOCATION</span>
                  <span className="text-[#ede8dd] font-bold">Birmingham Command Center</span>
                </div>
                <div className="p-3 bg-[#0d0f12] border border-[#1e2229]">
                  <span className="text-[#7a7469] block">INDEX REGISTRY</span>
                  <span className="text-[#c5a059] font-bold">2026-BUREAU-ARCHIVE-V4</span>
                </div>
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="mt-8 pt-6 border-t border-[#232730] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="font-mono-vintage text-[11px] text-[#7a7469]">
                AUTONOMOUS DISPATCH // EYES ONLY
              </span>
              {onOpenPilotAccess && (
                <button
                  onClick={() => {
                    onClose();
                    onOpenPilotAccess();
                  }}
                  id="dossier-pilot-access-btn"
                  className="flex items-center gap-1 text-[11px] font-mono-vintage text-[#c5a059] hover:text-[#fff6e5] underline underline-offset-4 cursor-pointer"
                >
                  <Key size={12} />
                  <span>ACCESS THE PILOT</span>
                </button>
              )}
            </div>
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-[#8c6d32] to-[#c5a059] text-black font-cinzel font-bold text-xs tracking-widest uppercase hover:brightness-110 transition-all cursor-pointer"
            >
              ACKNOWLEDGE & CLOSE
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
