import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Send, ShieldCheck, CheckCircle2, AlertCircle, FileCheck, Lock, Scroll, UserCheck } from 'lucide-react';
import { ApplicationRecord } from '../types';
import { safeFetchJson } from '../utils/api';

interface JoinModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const JoinModal: React.FC<JoinModalProps> = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    ageConfirmed: false,
    reason: '',
    skills: '',
    experience: '',
    socialHandle: '',
    codeAgreed: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<{
    applicationId: string;
    status: string;
    createdAt: string;
  } | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!formData.ageConfirmed) {
      setErrorMessage('You must confirm that you meet the age requirement for bureau membership.');
      return;
    }

    if (!formData.codeAgreed) {
      setErrorMessage('You must affirm and agree to uphold the R4V Code of Conduct.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await safeFetchJson<{
        success: boolean;
        applicationId: string;
        status: string;
        createdAt: string;
        error?: string;
      }>('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok || !response.data?.applicationId) {
        throw new Error(response.error || 'Failed to submit application dossier.');
      }

      const data = response.data;
      setReceipt({
        applicationId: data.applicationId,
        status: data.status,
        createdAt: data.createdAt,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An error occurred during submission.';
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({
      username: '',
      email: '',
      ageConfirmed: false,
      reason: '',
      skills: '',
      experience: '',
      socialHandle: '',
      codeAgreed: false,
    });
    setReceipt(null);
    setErrorMessage(null);
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-3 sm:p-6 overflow-y-auto"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.4 }}
        className="relative w-full max-w-3xl my-auto bg-[#0d0f13] border-2 border-[#8c6d32] shadow-[0_20px_80px_rgba(0,0,0,0.95)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Manila Ribbon */}
        <div className="h-2 bg-gradient-to-r from-[#59431b] via-[#c5a059] to-[#59431b]" />

        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-[#222834] flex items-center justify-between bg-[#13161c]">
          <div className="flex items-center gap-3">
            <div className="p-2 border border-[#8c6d32] bg-[#1a1e27] text-[#c5a059]">
              <Scroll size={18} />
            </div>
            <div>
              <span className="font-mono-vintage text-[10px] text-[#c5a059] tracking-widest block uppercase font-bold">
                BUREAU ENLISTMENT // PROTOCOL 01
              </span>
              <h2 className="font-cinzel text-xl sm:text-2xl font-bold text-[#ede8dd] tracking-wider">
                JOIN TEAM R4V
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-[#8f8779] hover:text-[#ede8dd] border border-[#232936] hover:border-[#c5a059] transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 max-h-[75vh] overflow-y-auto custom-scrollbar">
          {!receipt ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Directive Notice */}
              <div className="p-4 bg-[#141720] border-l-4 border-[#c5a059] text-xs font-mono-vintage text-[#cbc4b5] leading-relaxed">
                <strong className="text-[#ede8dd] block mb-1">MEMBERSHIP CRITERIA & VETTING NOTICE:</strong>
                All applications are screened manually by bureau officers. Upon approval, <strong className="text-[#c5a059]">you will be added to our groupchat and BDC within 24 hours</strong>. We prioritize rigorous analytical skills, archival discipline, and commitment to legitimate platform policy standards.
              </div>

              {errorMessage && (
                <div className="p-4 bg-[#3d1214] border border-[#8c1d1d] text-[#f2a2a6] text-xs font-mono-vintage flex items-start gap-2">
                  <AlertCircle size={16} className="shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Grid 1: Basic Identifiers */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block font-mono-vintage text-xs text-[#8c6d32] uppercase tracking-wider mb-2">
                    USERNAME / PREFERRED OPERATIVE NAME *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sentinel_Vance or Cipher77"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="w-full bg-[#0a0c0f] border border-[#262c38] focus:border-[#c5a059] px-4 py-2.5 text-xs font-mono-vintage text-[#ede8dd] placeholder-[#554e43] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-mono-vintage text-xs text-[#8c6d32] uppercase tracking-wider mb-2">
                    OFFICIAL CORRESPONDENCE EMAIL *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="operative@domain.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-[#0a0c0f] border border-[#262c38] focus:border-[#c5a059] px-4 py-2.5 text-xs font-mono-vintage text-[#ede8dd] placeholder-[#554e43] focus:outline-none"
                  />
                </div>
              </div>

              {/* Grid 2: Optional Contact & Age */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block font-mono-vintage text-xs text-[#8c6d32] uppercase tracking-wider mb-2">
                    DISCORD / TELEGRAM HANDLE (OPTIONAL)
                  </label>
                  <input
                    type="text"
                    placeholder="@handle (Discord or Telegram)"
                    value={formData.socialHandle}
                    onChange={(e) => setFormData({ ...formData, socialHandle: e.target.value })}
                    className="w-full bg-[#0a0c0f] border border-[#262c38] focus:border-[#c5a059] px-4 py-2.5 text-xs font-mono-vintage text-[#ede8dd] placeholder-[#554e43] focus:outline-none"
                  />
                </div>

                <div className="flex items-center pt-6 sm:pt-7">
                  <label className="relative flex items-center gap-3 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      required
                      checked={formData.ageConfirmed}
                      onChange={(e) => setFormData({ ...formData, ageConfirmed: e.target.checked })}
                      className="w-4 h-4 rounded border-[#262c38] bg-[#0a0c0f] text-[#c5a059] focus:ring-0 accent-[#c5a059]"
                    />
                    <span className="font-mono-vintage text-xs text-[#ede8dd] tracking-wider">
                      I CONFIRM I AM 18+ YEARS OF AGE *
                    </span>
                  </label>
                </div>
              </div>

              {/* Field 3: Why Join */}
              <div>
                <label className="block font-mono-vintage text-xs text-[#8c6d32] uppercase tracking-wider mb-2">
                  WHY DO YOU WISH TO JOIN TEAM R4V? *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Describe your motivations, philosophical alignment with 'Evidence Before Accusation', and what you hope to achieve."
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  className="w-full bg-[#0a0c0f] border border-[#262c38] focus:border-[#c5a059] p-3 text-xs sm:text-sm font-mono-vintage text-[#ede8dd] placeholder-[#554e43] focus:outline-none leading-relaxed"
                />
              </div>

              {/* Field 4: Relevant Skills */}
              <div>
                <label className="block font-mono-vintage text-xs text-[#8c6d32] uppercase tracking-wider mb-2">
                  RELEVANT SKILLS & TECHNICAL COMPETENCIES *
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="e.g. OSINT, Digital Archiving, Wayback verification, Platform Policy Auditing, Forensic Documentation, Analysis."
                  value={formData.skills}
                  onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                  className="w-full bg-[#0a0c0f] border border-[#262c38] focus:border-[#c5a059] p-3 text-xs font-mono-vintage text-[#ede8dd] placeholder-[#554e43] focus:outline-none leading-relaxed"
                />
              </div>

              {/* Field 5: Previous Experience */}
              <div>
                <label className="block font-mono-vintage text-xs text-[#8c6d32] uppercase tracking-wider mb-2">
                  PREVIOUS MODERATION, INVESTIGATION OR ARCHIVAL EXPERIENCE *
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="Briefly state past roles, communities moderated, or incident documentation dossiers you have compiled."
                  value={formData.experience}
                  onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                  className="w-full bg-[#0a0c0f] border border-[#262c38] focus:border-[#c5a059] p-3 text-xs font-mono-vintage text-[#ede8dd] placeholder-[#554e43] focus:outline-none leading-relaxed"
                />
              </div>

              {/* Agreement to Code of Conduct */}
              <div className="p-4 bg-[#0a0c0f] border border-[#222834] space-y-3">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    required
                    checked={formData.codeAgreed}
                    onChange={(e) => setFormData({ ...formData, codeAgreed: e.target.checked })}
                    className="w-4 h-4 mt-0.5 rounded border-[#262c38] bg-[#0a0c0f] text-[#c5a059] focus:ring-0 accent-[#c5a059]"
                  />
                  <div className="text-xs font-mono-vintage text-[#b6ad9f] leading-relaxed">
                    <strong className="text-[#ede8dd] block mb-0.5">
                      AFFIRMATION OF THE R4V CODE OF CONDUCT:
                    </strong>
                    I swear never to manufacture evidence, participate in coordinated harassment campaigns, solicit false platform takedowns, or pursue personal vendettas. I understand that any breach results in immediate and permanent expulsion.
                  </div>
                </label>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isSubmitting}
                id="submit-join-r4v-application-btn"
                className="w-full py-4 bg-gradient-to-r from-[#8c6d32] via-[#c5a059] to-[#dfc181] hover:brightness-110 disabled:opacity-50 text-black font-cinzel font-bold text-xs sm:text-sm tracking-[0.25em] uppercase transition-all duration-300 shadow-[0_4px_25px_rgba(197,160,89,0.3)] flex items-center justify-center gap-2 cursor-pointer"
              >
                <Send size={15} />
                <span>{isSubmitting ? 'TRANSMITTING ENLISTMENT DOSSIER...' : 'SUBMIT APPLICATION'}</span>
              </button>
            </form>
          ) : (
            /* Submission Success Screen */
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-8 text-center space-y-6"
            >
              <div className="w-16 h-16 mx-auto border-2 border-[#c5a059] bg-[#141820] flex items-center justify-center text-[#c5a059] transform rotate-45 mb-4 shadow-[0_0_30px_rgba(197,160,89,0.2)]">
                <CheckCircle2 size={32} className="transform -rotate-45" />
              </div>

              <div className="space-y-2">
                <span className="stamp-verified text-sm">ENLISTMENT DOSSIER LOGGED</span>
                <h3 className="font-cinzel text-3xl font-black text-[#ede8dd] tracking-widest mt-3">
                  APPLICATION RECEIVED
                </h3>
                <p className="font-editorial italic text-lg text-[#c5a059]">
                  “Your application has been submitted for review.”
                </p>
              </div>

              {/* Receipt Box */}
              <div className="p-6 bg-[#0a0c0f] border-2 border-[#2b3342] max-w-md mx-auto space-y-3 font-mono-vintage text-xs text-left">
                <div className="flex items-center justify-between border-b border-[#1c222e] pb-2">
                  <span className="text-[#7c7567] uppercase">APPLICATION ID:</span>
                  <strong className="text-[#ede8dd] text-sm tracking-wider">{receipt.applicationId}</strong>
                </div>

                <div className="flex items-center justify-between border-b border-[#1c222e] pb-2">
                  <span className="text-[#7c7567] uppercase">CURRENT STATUS:</span>
                  <span className="px-2.5 py-0.5 bg-[#403014] border border-[#c5a059] text-[#e5cb91] font-bold tracking-widest uppercase">
                    {receipt.status}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[#7c7567] uppercase">INTAKE TIMESTAMP:</span>
                  <span className="text-[#9e9584]">{new Date(receipt.createdAt).toLocaleString()}</span>
                </div>
              </div>

              <p className="font-editorial text-sm sm:text-base text-[#b6ada0] max-w-lg mx-auto leading-relaxed">
                Your dossier has been registered in the central intake ledger. An administrator will verify your credentials against bureau standards. <span className="text-[#c5a059] font-semibold">You will be added to our groupchat and BDC within 24 hours</span> upon approval.
              </p>

              <div className="pt-4">
                <button
                  onClick={handleReset}
                  className="px-8 py-3 bg-[#181d26] border border-[#374154] hover:border-[#c5a059] text-xs font-mono-vintage text-[#ede8dd] tracking-widest uppercase transition-all"
                >
                  RETURN TO BUREAU
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
