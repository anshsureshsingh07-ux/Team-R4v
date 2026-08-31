import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ExternalLink, ShieldAlert, BookOpen, CheckCircle, AlertTriangle, Lock } from 'lucide-react';

interface PolicyReferenceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface PlatformGuide {
  platform: string;
  badge: string;
  url: string;
  summary: string;
  keyPolicies: {
    rule: string;
    description: string;
    reportingTips: string;
  }[];
}

const PLATFORM_GUIDES: PlatformGuide[] = [
  {
    platform: 'Instagram / Meta Community Standards',
    badge: 'META INTEGRITY',
    url: 'https://transparency.fb.com/policies/community-standards/',
    summary: 'Official moderation guidelines governing Instagram and Facebook accounts regarding harassment, impersonation, hate speech, and scams.',
    keyPolicies: [
      {
        rule: 'Harassment & Bullying (§4.2)',
        description: 'Prohibits severe or repeated unwanted contact, sexualized comments, derogatory attacks, and unauthorized sharing of personal phone numbers or addresses.',
        reportingTips: 'Submit direct screenshots of DM threads showing timestamps and profile handles. Do not edit or crop profile headers.',
      },
      {
        rule: 'Inauthentic Behavior & Impersonation (§7.3)',
        description: 'Accounts pretending to be a real individual or brand without clear parody disclosure in both name and bio.',
        reportingTips: 'Use the official Impersonation report form. Provide government ID or authentic profile link if reporting on behalf of yourself or client.',
      },
      {
        rule: 'Hate Speech & Slurs (§5.1)',
        description: 'Direct attacks on protected characteristics (race, ethnicity, national origin, disability, religious affiliation, sexual orientation, caste, sex, gender identity).',
        reportingTips: 'Flag the specific comment or post directly. Quote exact timestamped text without alteration.',
      },
    ],
  },
  {
    platform: 'Discord Community Guidelines',
    badge: 'DISCORD TRUST & SAFETY',
    url: 'https://discord.com/guidelines',
    summary: 'Rules prohibiting doxxing, server raids, non-consensual imagery, and violent extremist coordination.',
    keyPolicies: [
      {
        rule: 'Harassment & Doxxing Protections',
        description: 'Posting another user\'s private personal identity details, home addresses, phone numbers, or real-life location to incite intimidation.',
        reportingTips: 'Copy Message IDs and User IDs directly via Discord Developer Mode. Submit directly to discord.com/report.',
      },
      {
        rule: 'Raids & Coordinated Harassment',
        description: 'Organizing group spam, automated mass-messaging, or joining servers en masse to disrupt operations.',
        reportingTips: 'Include server invite link, raid coordinator IDs, and export chat timestamps.',
      },
    ],
  },
  {
    platform: 'X (formerly Twitter) Rules',
    badge: 'X SAFETY POLICIES',
    url: 'https://help.twitter.com/en/rules-and-policies/x-rules',
    summary: 'Enforcement frameworks against violent threats, synthetic media fraud, non-consensual media, and identity deception.',
    keyPolicies: [
      {
        rule: 'Violent Speech & Severe Threats',
        description: 'Clear statements expressing intent to kill, inflict serious physical harm, or destroy property.',
        reportingTips: 'Report the specific Tweet or Direct Message. If imminent danger exists, report to local authorities.',
      },
      {
        rule: 'Deceptive & Synthetic Identities',
        description: 'Misrepresenting identity to mislead or defraud users, including crypto scam clones and unauthorized deepfakes.',
        reportingTips: 'Select "They are pretending to be me or someone else" in report dropdown.',
      },
    ],
  },
  {
    platform: 'YouTube Community Guidelines',
    badge: 'GOOGLE TRUST & SAFETY',
    url: 'https://www.youtube.com/howyoutubeworks/policies/community-guidelines/',
    summary: 'Guidelines prohibiting cyberbullying, hate speech, malicious commentary brigading, and scam links.',
    keyPolicies: [
      {
        rule: 'Cyberbullying & Targeted Attacks',
        description: 'Videos, community posts, or live chat messages created specifically to humiliate, threaten, or reveal private data of individuals.',
        reportingTips: 'Use the timestamp marker tool when submitting report to point moderators directly to the violation moment.',
      },
    ],
  },
];

export const PolicyReferenceModal: React.FC<PolicyReferenceModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 15 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-4xl bg-[#0d0f14] border border-[#c5a059]/40 shadow-[0_20px_60px_rgba(0,0,0,0.9)] max-h-[90vh] flex flex-col text-[#ede8dd] font-sans"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#232733] bg-[#12151c]">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[#1e2330] border border-[#c5a059]/50 flex items-center justify-center text-[#c5a059]">
                <BookOpen size={16} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-[#c5a059] font-bold">
                    OFFICIAL POLICY REPOSITORY
                  </span>
                  <span className="text-[#3f475a]">•</span>
                  <span className="font-mono text-[10px] uppercase text-[#8c8273]">STANDARDS COMPLIANCE</span>
                </div>
                <h3 className="font-serif text-base font-bold text-[#ede8dd] tracking-wide uppercase">
                  Platform Community Standards Reference
                </h3>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-[#8c8273] hover:text-[#ede8dd] hover:bg-[#1f2430] transition-colors border border-transparent hover:border-[#383f50]"
            >
              <X size={18} />
            </button>
          </div>

          {/* Important Notice */}
          <div className="px-6 py-3 bg-[#1e1516] border-b border-[#401216] flex items-center gap-3 text-xs text-[#f2a2a6]">
            <ShieldAlert size={16} className="text-[#df878b] shrink-0" />
            <span>
              <strong>Rule of Law Notice:</strong> Team R4V operates strictly as an assistive intelligence and policy categorization advisory. All reporting must be executed through official, legitimate platform mechanisms.
            </span>
          </div>

          {/* Content Body */}
          <div className="p-6 overflow-y-auto space-y-6 max-h-[calc(90vh-140px)]">
            <p className="text-xs text-[#a69e90] leading-relaxed">
              When submitting reports for human moderation review, referencing specific written policy sections and providing unmanipulated timestamped evidence dramatically increases accuracy.
            </p>

            <div className="space-y-5">
              {PLATFORM_GUIDES.map((guide) => (
                <div
                  key={guide.platform}
                  className="bg-[#12151d] border border-[#222735] p-5 space-y-4 hover:border-[#c5a059]/40 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#1d222e]">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 bg-[#1b212c] text-[#c5a059] border border-[#c5a059]/30">
                          {guide.badge}
                        </span>
                      </div>
                      <h4 className="font-serif text-sm font-bold text-[#ede8dd] uppercase tracking-wide">
                        {guide.platform}
                      </h4>
                    </div>

                    <a
                      href={guide.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#171c26] hover:bg-[#202736] border border-[#2d3445] text-xs font-mono text-[#c5a059] hover:text-[#e5cb91] transition-colors self-start sm:self-auto"
                    >
                      <span>OFFICIAL GUIDELINE</span>
                      <ExternalLink size={12} />
                    </a>
                  </div>

                  <p className="text-xs text-[#8c8273]">{guide.summary}</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                    {guide.keyPolicies.map((pol, idx) => (
                      <div key={idx} className="bg-[#0b0d12] border border-[#1b1f2b] p-3 space-y-2 text-xs">
                        <div className="flex items-center gap-2 font-mono font-bold text-[#e5cb91] text-[11px]">
                          <CheckCircle size={13} className="text-[#c5a059]" />
                          <span>{pol.rule}</span>
                        </div>
                        <p className="text-[#a69e90] text-[11px] leading-relaxed">{pol.description}</p>
                        <div className="pt-1.5 border-t border-[#161a24] text-[10px] font-mono text-[#8c8273]">
                          <strong className="text-[#c5a059]">REPORTING TIP:</strong> {pol.reportingTips}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-3.5 border-t border-[#232733] bg-[#12151c] flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-2 text-[#8c8273]">
              <Lock size={12} className="text-[#c5a059]" />
              <span>TEAM R4V INTELLIGENCE REPOSITORY</span>
            </div>
            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-[#1a1f2c] hover:bg-[#262c3d] border border-[#363f54] text-[#ede8dd] uppercase tracking-wider text-xs font-mono transition-colors"
            >
              CLOSE REFERENCE
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
