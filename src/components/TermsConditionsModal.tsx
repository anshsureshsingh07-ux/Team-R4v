import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Scroll, 
  ShieldAlert, 
  AlertTriangle, 
  Lock, 
  CheckCircle2, 
  Crown, 
  Terminal, 
  Shield, 
  Ban, 
  Flame, 
  Search, 
  FileText, 
  Scale
} from 'lucide-react';

interface TermsConditionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenPrivacyPolicy?: () => void;
}

export const TermsConditionsModal: React.FC<TermsConditionsModalProps> = ({ 
  isOpen, 
  onClose,
  onOpenPrivacyPolicy 
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-3 sm:p-6 overflow-y-auto"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.3 }}
        className="relative w-full max-w-3xl my-auto bg-[#0d0f13] border-2 border-[#8c6d32] shadow-[0_20px_80px_rgba(0,0,0,0.95)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Bureau Ribbon */}
        <div className="h-2 bg-gradient-to-r from-[#8b1a1a] via-[#c5a059] to-[#8b1a1a]" />

        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-[#222834] flex items-center justify-between bg-[#13161c]">
          <div className="flex items-center gap-3">
            <div className="p-2 border border-[#8c6d32] bg-[#1a1e27] text-[#c5a059]">
              <Scale size={22} />
            </div>
            <div>
              <span className="font-mono-vintage text-[10px] text-[#c5a059] tracking-widest block uppercase font-bold flex items-center gap-1.5">
                <span>R4V STATUTES // CONSTITUTIONAL BINDING DECREE</span>
                <span className="stamp-classified text-[9px] py-0 px-1.5">MANDATORY</span>
              </span>
              <h2 className="font-cinzel text-xl sm:text-2xl font-bold text-[#ede8dd] tracking-wider flex items-center gap-2">
                <span>💀 R4V TERMS & CONDITIONS</span>
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-[#8f8779] hover:text-[#ede8dd] border border-[#232936] hover:border-[#c5a059] transition-colors cursor-pointer"
            title="Close terms"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 max-h-[75vh] overflow-y-auto custom-scrollbar space-y-6 text-[#cbc4b5] font-sans text-xs sm:text-sm leading-relaxed">
          {/* Subtitle / aka */}
          <div className="p-4 bg-[#141720] border-l-4 border-[#8b1a1a] font-mono-vintage text-xs space-y-1.5">
            <div className="text-[#e5cb91] font-bold text-sm tracking-wide">
              aka: “Bhai rules padh le, phir ‘I didn't know’ mat bolna.”
            </div>
            <p className="text-[#a8a092]">
              Welcome to R4V. By using the service, you agree to follow these rules. Yes, even if you skipped Terms & Conditions everywhere else.
            </p>
          </div>

          {/* RULE 01 */}
          <div className="p-5 bg-[#090b0e] border border-[#222834] space-y-3">
            <div className="flex items-center gap-2 text-sm font-bold text-[#ede8dd] font-cinzel">
              <span className="text-[#c5a059] font-mono font-bold">🗿 RULE 01</span>
              <span>— DON'T BE A MENACE</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono text-[#e5cb91]">
              <span className="p-2 bg-[#121620] border border-[#1f2636] flex items-center gap-1.5">
                <Ban size={12} className="text-[#f87171]" /> No Harassment
              </span>
              <span className="p-2 bg-[#121620] border border-[#1f2636] flex items-center gap-1.5">
                <Ban size={12} className="text-[#f87171]" /> No Threats
              </span>
              <span className="p-2 bg-[#121620] border border-[#1f2636] flex items-center gap-1.5">
                <Ban size={12} className="text-[#f87171]" /> No Doxxing
              </span>
              <span className="p-2 bg-[#121620] border border-[#1f2636] flex items-center gap-1.5">
                <Ban size={12} className="text-[#f87171]" /> No Fraud
              </span>
              <span className="p-2 bg-[#121620] border border-[#1f2636] flex items-center gap-1.5">
                <Ban size={12} className="text-[#f87171]" /> No Credential theft
              </span>
              <span className="p-2 bg-[#121620] border border-[#1f2636] flex items-center gap-1.5">
                <Ban size={12} className="text-[#f87171]" /> No Spam
              </span>
              <span className="p-2 bg-[#121620] border border-[#1f2636] flex items-center gap-1.5">
                <Ban size={12} className="text-[#f87171]" /> No False accusations
              </span>
              <span className="p-2 bg-[#121620] border border-[#1f2636] flex items-center gap-1.5">
                <Ban size={12} className="text-[#f87171]" /> No Platform gaming
              </span>
            </div>
            <div className="p-3 bg-[#171b24] border border-[#2e3748] text-xs font-mono text-[#ede8dd]">
              Basically: <strong className="text-[#c5a059]">Don't become the final boss of LinkedIn comments.</strong>
            </div>
          </div>

          {/* RULE 02 */}
          <div className="p-5 bg-[#090b0e] border border-[#222834] space-y-3">
            <div className="flex items-center gap-2 text-sm font-bold text-[#ede8dd] font-cinzel">
              <span className="text-[#c5a059] font-mono font-bold">🚨 RULE 02</span>
              <span>— NO FAKE REPORTING</span>
            </div>
            <p className="text-xs text-[#a8a092]">
              If something genuinely violates a platform's rules, document it properly. If it doesn't: <strong className="text-[#f87171]">LEAVE. IT. ALONE.</strong>
            </p>
            <div className="p-3 bg-[#171113] border border-[#591619] text-xs font-mono text-[#fca5a5]">
              Don't manufacture allegations because: <em className="text-[#fff]">“bro trust me this method works 💀”</em>
              <div className="mt-1 font-bold text-[#e5cb91]">R4V is not a ban button.</div>
            </div>
          </div>

          {/* RULE 03 */}
          <div className="p-5 bg-[#090b0e] border border-[#222834] space-y-3">
            <div className="flex items-center gap-2 text-sm font-bold text-[#ede8dd] font-cinzel">
              <span className="text-[#c5a059] font-mono font-bold">🧠 RULE 03</span>
              <span>— EVIDENCE &gt; RUMOUR</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-xs">
              <div className="p-3 bg-[#11141c] border border-[#232936] space-y-1.5">
                <span className="text-[#c5a059] font-bold text-[10px] block">🇮🇳 INDIAN RUMOUR:</span>
                <p className="italic text-[#9ca3af]">“Mere dost ke cousin ke neighbour ne bola account 100% ban ho jayega.”</p>
                <div className="text-[#f87171] font-bold">R4V: SOURCE?</div>
              </div>
              <div className="p-3 bg-[#11141c] border border-[#232936] space-y-1.5">
                <span className="text-[#38bdf8] font-bold text-[10px] block">🇺🇸 AMERICAN RUMOUR:</span>
                <p className="italic text-[#9ca3af]">“Trust me bro, my uncle works at Meta.”</p>
                <div className="text-[#f87171] font-bold">R4V: SOURCE?</div>
              </div>
            </div>
            <p className="text-xs text-[#c5a059] font-mono font-bold">No evidence = no magical courtroom.</p>
          </div>

          {/* RULE 04 */}
          <div className="p-5 bg-[#090b0e] border border-[#222834] space-y-3">
            <div className="flex items-center gap-2 text-sm font-bold text-[#ede8dd] font-cinzel">
              <span className="text-[#c5a059] font-mono font-bold">🔐 RULE 04</span>
              <span>— NO PASSWORD COLLECTION</span>
            </div>
            <p className="text-xs text-[#a8a092]">Nobody should request: Instagram password, Gmail password, OTP, Recovery code, or Authentication token.</p>
            <div className="p-3 bg-[#181d26] border border-[#c5a059]/40 text-xs font-mono text-[#e5cb91] font-bold text-center tracking-widest">
              IF SOMEONE DOES: SCREENSHOT → ADMIN → BLOCK NPC
            </div>
          </div>

          {/* RULE 05 */}
          <div className="p-5 bg-[#090b0e] border border-[#222834] space-y-3">
            <div className="flex items-center gap-2 text-sm font-bold text-[#ede8dd] font-cinzel">
              <span className="text-[#c5a059] font-mono font-bold">🕵️ RULE 05</span>
              <span>— NO DOXXING</span>
            </div>
            <p className="text-xs text-[#a8a092]">
              Do not expose: Home addresses, Phone numbers, Private emails, Passwords, IP addresses, Private documents, or Personal information.
            </p>
            <div className="p-3 bg-[#121620] border border-[#1f2636] text-xs font-mono text-[#c5a059]">
              We are a case-management platform, not Google Maps for someone's house.
            </div>
          </div>

          {/* RUMOUR CONTROL */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-[#090b0e] border border-[#222834] space-y-2">
              <div className="text-xs font-bold text-[#ede8dd] font-mono flex items-center gap-1.5">
                <span>🇮🇳 INDIAN RUMOUR CONTROL</span>
              </div>
              <p className="text-xs text-[#a8a092] italic">
                “R4V can ban anyone instantly.”
              </p>
              <p className="text-xs text-[#e5cb91] font-mono">
                <strong>Reality:</strong> Bhai, R4V isn't Thanos. 😭 Third-party platforms make their own enforcement decisions.
              </p>
            </div>

            <div className="p-4 bg-[#090b0e] border border-[#222834] space-y-2">
              <div className="text-xs font-bold text-[#ede8dd] font-mono flex items-center gap-1.5">
                <span>🇺🇸 AMERICAN RUMOUR CONTROL</span>
              </div>
              <p className="text-xs text-[#a8a092] italic">
                “R4V has FBI-level powers.”
              </p>
              <p className="text-xs text-[#e5cb91] font-mono">
                <strong>Reality:</strong> No. Please put the Netflix documentary away.
              </p>
            </div>
          </div>

          {/* ADMIN POWER */}
          <div className="p-5 bg-[#090b0e] border border-[#222834] space-y-3">
            <div className="text-sm font-bold text-[#ede8dd] font-cinzel flex items-center gap-2">
              <Crown size={16} className="text-[#c5a059]" />
              <span>👑 ADMIN POWER & HIERARCHY</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
              <div className="p-3 bg-[#141720] border border-[#c5a059]/30 space-y-1">
                <div className="font-bold text-[#c5a059]">ASURA — OWNER</div>
                <p className="text-[11px] text-[#9ca3af]">The organizational final boss.</p>
              </div>
              <div className="p-3 bg-[#141720] border border-[#38bdf8]/30 space-y-1">
                <div className="font-bold text-[#38bdf8]">ANSH — DEVELOPER / CTO</div>
                <p className="text-[11px] text-[#9ca3af]">Controls the technical kingdom.</p>
              </div>
              <div className="p-3 bg-[#141720] border border-[#22c55e]/30 space-y-1">
                <div className="font-bold text-[#22c55e]">BLACKOUT — MANAGER</div>
                <p className="text-[11px] text-[#9ca3af]">Runs operational matters.</p>
              </div>
            </div>
            <p className="text-xs font-mono text-[#8c8273]">
              But even admins don't magically gain control over third-party platforms.
            </p>
          </div>

          {/* VIOLATIONS PIPELINE */}
          <div className="p-5 bg-[#120f12] border border-[#591619] space-y-3 text-center">
            <div className="text-xs font-mono font-bold text-[#fca5a5] uppercase tracking-widest flex items-center justify-center gap-2">
              <Flame size={15} className="text-[#ef4444]" />
              <span>🧨 VIOLATIONS & DISCIPLINARY STAGES</span>
            </div>
            <div className="flex items-center justify-center gap-2 sm:gap-4 font-mono text-xs font-bold text-[#ede8dd]">
              <span className="px-3 py-1.5 bg-[#251e1e] border border-[#7a2020] text-[#fca5a5]">WARNING</span>
              <span className="text-[#c5a059]">→</span>
              <span className="px-3 py-1.5 bg-[#3a1518] border border-[#991b1b] text-[#f87171]">SUSPENSION</span>
              <span className="text-[#c5a059]">→</span>
              <span className="px-3 py-1.5 bg-[#4c0519] border border-[#e11d48] text-[#ffe4e6]">REMOVAL</span>
            </div>
            <p className="text-[11px] font-mono text-[#9ca3af]">
              Extremely serious violations may skip the tutorial.
            </p>
          </div>

          {/* FINAL R4V LAW */}
          <div className="p-6 bg-[#0b0e14] border-2 border-[#c5a059] text-center space-y-3">
            <h3 className="font-cinzel text-base sm:text-lg font-black text-[#ede8dd] tracking-wider">
              🗿 FINAL R4V LAW
            </h3>
            <div className="space-y-1 text-xs font-mono font-bold text-[#c5a059]">
              <div>Don't lie.</div>
              <div>Don't harass.</div>
              <div>Don't steal credentials.</div>
              <div>Don't fabricate evidence.</div>
              <div>Don't abuse reporting systems.</div>
              <div>Don't be weird.</div>
            </div>
            <div className="pt-2 border-t border-[#222834]">
              <div className="text-xs font-mono font-bold text-[#ede8dd] uppercase tracking-wider">
                And most importantly:
              </div>
              <div className="text-sm sm:text-base font-cinzel font-black text-[#f87171] mt-1 tracking-wider">
                STOP SAYING “BRO 100% BAN METHOD” 😭
              </div>
            </div>
            <div className="text-[11px] font-mono text-[#8c8273]">
              R4V documents evidence. <strong className="text-[#ede8dd]">THE PLATFORM DECIDES THE VERDICT.</strong>
            </div>
          </div>

          {/* LEGAL DISCLAIMER */}
          <div className="p-4 bg-[#090b0e] border border-[#222834] text-[11px] font-mono text-[#787163] space-y-1.5">
            <div className="text-[#c5a059] font-bold uppercase tracking-wider">
              LEGAL DISCLAIMER
            </div>
            <p>
              The humorous language on this page is for presentation and community culture. The underlying obligations, restrictions, privacy practices, and applicable laws remain serious and enforceable.
            </p>
          </div>

          {/* Footer Controls */}
          <div className="pt-2 border-t border-[#222834] flex flex-col sm:flex-row items-center justify-between gap-4 font-mono-vintage text-[11px]">
            {onOpenPrivacyPolicy && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenPrivacyPolicy();
                }}
                className="text-[#c5a059] hover:underline cursor-pointer flex items-center gap-1 font-bold"
              >
                <span>READ PRIVACY POLICY (aka: Bhai fridge...) →</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="w-full sm:w-auto px-8 py-2.5 bg-[#181d26] border border-[#8c6d32] hover:border-[#c5a059] text-xs font-mono-vintage text-[#ede8dd] tracking-widest uppercase transition-all cursor-pointer"
            >
              I AGREE & UNDERSTAND
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
