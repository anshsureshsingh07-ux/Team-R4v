import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Send, Shield, Stamp, FileCheck, CheckCircle2, Lock, Radio, UserPlus } from 'lucide-react';
import { SITE_INFO } from '../data/config';

interface ContactSectionProps {
  onOpenJoinModal?: () => void;
}

export const ContactSection: React.FC<ContactSectionProps> = ({ onOpenJoinModal }) => {
  const [formData, setFormData] = useState({
    codename: '',
    platform: 'Cross-Platform',
    subject: 'EVIDENCE_SUBMISSION',
    message: '',
    evidenceLinks: '',
  });

  const [submitted, setSubmitted] = useState(false);
  const [receiptNumber, setReceiptNumber] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.message.trim()) return;

    const randomId = `R4V-TEL-${Math.floor(100000 + Math.random() * 900000)}`;
    setReceiptNumber(randomId);
    setSubmitted(true);
  };

  return (
    <section id="contact" className="relative py-28 bg-[#090b0e] border-t border-[#1a1d24] film-grain">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 mb-3">
            <span className="h-[1px] w-8 bg-[#c5a059]" />
            <span className="font-mono-vintage text-xs tracking-[0.3em] text-[#c5a059] uppercase">
              SECTION VIII // TRANSMISSION TERMINAL
            </span>
            <span className="h-[1px] w-8 bg-[#c5a059]" />
          </div>
          <h2 className="font-cinzel text-3xl sm:text-4xl md:text-5xl font-black text-[#ede8dd] tracking-[0.15em] uppercase">
            COMMUNICATIONS DESK
          </h2>
          <p className="font-editorial italic text-lg sm:text-xl text-[#9f9788] mt-3">
            Submit verified evidence or dispatch encrypted institutional inquiries.
          </p>
        </div>

        {/* Vintage Telegraph / Terminal Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="bg-[#121418] border-2 border-[#2b303c] p-6 sm:p-10 shadow-[0_20px_60px_rgba(0,0,0,0.85)] relative"
        >
          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-[#232730] gap-3 mb-8">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-[#c5a059] rounded-full animate-ping" />
              <span className="font-mono-vintage text-xs tracking-widest text-[#ede8dd]">
                SECURE TELEGRAPH RELAY // BIRMINGHAM DESK
              </span>
            </div>
            <span className="stamp-sealed text-xs">ENCRYPTED</span>
          </div>

          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block font-mono-vintage text-xs text-[#8c6d32] uppercase tracking-wider mb-2">
                    OPERATIVE IDENTIFIER / CODENAME
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. AUDITOR-77 OR ANONYMOUS"
                    value={formData.codename}
                    onChange={(e) => setFormData({ ...formData, codename: e.target.value })}
                    className="w-full bg-[#0a0c0e] border border-[#272b34] focus:border-[#c5a059] px-4 py-3 text-xs font-mono-vintage text-[#ede8dd] placeholder-[#504a40] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-mono-vintage text-xs text-[#8c6d32] uppercase tracking-wider mb-2">
                    DISPATCH TYPE
                  </label>
                  <select
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full bg-[#0a0c0e] border border-[#272b34] focus:border-[#c5a059] px-4 py-3 text-xs font-mono-vintage text-[#ede8dd] focus:outline-none"
                  >
                    <option value="EVIDENCE_SUBMISSION">VERIFIED EVIDENCE SUBMISSION</option>
                    <option value="PLATFORM_POLICY_QUERY">PLATFORM POLICY QUERY</option>
                    <option value="COMMUNITY_MEMBERSHIP">COMMUNITY ADMISSION INQUIRY</option>
                    <option value="EXECUTIVE_MEMORANDUM">EXECUTIVE CORRESPONDENCE</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-mono-vintage text-xs text-[#8c6d32] uppercase tracking-wider mb-2">
                  EVIDENCE LINKS OR ARCHIVAL HASHES (OPTIONAL)
                </label>
                <input
                  type="text"
                  placeholder="https://perma.cc/... or SHA-256 verification hash"
                  value={formData.evidenceLinks}
                  onChange={(e) => setFormData({ ...formData, evidenceLinks: e.target.value })}
                  className="w-full bg-[#0a0c0e] border border-[#272b34] focus:border-[#c5a059] px-4 py-3 text-xs font-mono-vintage text-[#ede8dd] placeholder-[#504a40] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-mono-vintage text-xs text-[#8c6d32] uppercase tracking-wider mb-2">
                  INCIDENT DETAILS & FACTUAL LOG
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="State timestamps, affected platform clauses, and factual timeline. (No emotional hearsay or harassment claims without proof)."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full bg-[#0a0c0e] border border-[#272b34] focus:border-[#c5a059] p-4 text-xs sm:text-sm font-mono-vintage text-[#ede8dd] placeholder-[#504a40] focus:outline-none leading-relaxed"
                />
              </div>

              <div className="p-4 bg-[#0a0c0e] border border-[#1e2229] flex items-start gap-3 text-xs font-mono-vintage text-[#8c8273]">
                <Lock size={15} className="text-[#c5a059] shrink-0 mt-0.5" />
                <span>
                  SUBMISSIONS ARE SCREENED MANUALLY AGAINST THE R4V CODE. FABRICATED EVIDENCE WILL RESULT IN IMMEDIATE BLACKLISTING.
                </span>
              </div>

              <button
                type="submit"
                id="submit-transmission-btn"
                className="w-full py-4 bg-gradient-to-r from-[#8c6d32] via-[#c5a059] to-[#dfc181] hover:brightness-110 text-black font-cinzel font-bold text-xs sm:text-sm tracking-[0.25em] uppercase transition-all duration-300 shadow-[0_4px_25px_rgba(197,160,89,0.3)] flex items-center justify-center gap-2 cursor-pointer"
              >
                <Send size={15} />
                <span>TRANSMIT DISPATCH TO COMMAND</span>
              </button>
            </form>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-10 text-center space-y-6"
            >
              <div className="w-16 h-16 mx-auto border-2 border-[#c5a059] bg-[#16181e] flex items-center justify-center text-[#c5a059] transform rotate-45 mb-4">
                <CheckCircle2 size={32} className="transform -rotate-45" />
              </div>

              <div className="space-y-2">
                <span className="stamp-verified text-sm">TRANSMISSION CONFIRMED</span>
                <h3 className="font-cinzel text-2xl font-bold text-[#fff6e5] tracking-widest mt-2">
                  DISPATCH LOGGED IN CENTRAL LEDGER
                </h3>
                <p className="font-mono-vintage text-sm text-[#8c6d32]">
                  RECEIPT ID: <strong className="text-[#ede8dd]">{receiptNumber}</strong>
                </p>
              </div>

              <p className="font-editorial text-base text-[#cdc5b4] max-w-md mx-auto leading-relaxed">
                Your dossier submission has entered Stage 01 of the intake protocol. An auditor will cross-reference the digital proof against official platform terms.
              </p>

              <button
                onClick={() => {
                  setSubmitted(false);
                  setFormData({
                    codename: '',
                    platform: 'Cross-Platform',
                    subject: 'EVIDENCE_SUBMISSION',
                    message: '',
                    evidenceLinks: '',
                  });
                }}
                className="px-6 py-2.5 bg-[#181b21] border border-[#2c313d] hover:border-[#c5a059] text-xs font-mono-vintage text-[#e3ded4] tracking-widest uppercase"
              >
                TRANSMIT ANOTHER DISPATCH
              </button>
            </motion.div>
          )}
        </motion.div>

        {/* Enlistment Callout Banner */}
        {onOpenJoinModal && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-10 p-6 bg-[#111419] border-2 border-[#8c6d32] flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl"
          >
            <div className="flex items-center gap-4 text-center sm:text-left">
              <div className="p-3 bg-[#181d26] border border-[#c5a059] text-[#c5a059] hidden sm:block">
                <UserPlus size={24} />
              </div>
              <div>
                <span className="font-mono-vintage text-[10px] text-[#c5a059] tracking-widest uppercase block font-bold">
                  BUREAU EXPANSION // RECRUITMENT DESK
                </span>
                <h3 className="font-cinzel text-lg sm:text-xl font-bold text-[#ede8dd]">
                  WANT TO BECOME AN R4V OPERATIVE?
                </h3>
                <p className="font-editorial italic text-xs sm:text-sm text-[#9f9788] mt-0.5">
                  Submit your vetting dossier to join the corps. You will be added to our groupchat and BDC within 24 hours.
                </p>
              </div>
            </div>

            <button
              onClick={onOpenJoinModal}
              id="contact-join-r4v-btn"
              className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-[#8c6d32] via-[#c5a059] to-[#dfc181] hover:brightness-110 text-black font-cinzel font-bold text-xs tracking-widest uppercase transition-all duration-300 shadow-[0_4px_20px_rgba(197,160,89,0.3)] shrink-0 flex items-center justify-center gap-2 cursor-pointer"
            >
              <UserPlus size={14} className="text-black" />
              <span>APPLY TO JOIN R4V</span>
            </button>
          </motion.div>
        )}
      </div>
    </section>
  );
};
