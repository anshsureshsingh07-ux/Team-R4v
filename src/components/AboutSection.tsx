import React from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, Scale, FileCheck2, AlertOctagon, Stamp, Award } from 'lucide-react';
import { SITE_INFO } from '../data/config';

export const AboutSection: React.FC = () => {
  return (
    <section id="about" className="relative py-28 bg-[#090b0e] border-t border-[#1e222a] overflow-hidden film-grain">
      {/* Background Decorative Archival Watermark */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-[0.03] select-none">
        <span className="font-cinzel text-[22vw] font-black text-[#ffffff] tracking-widest">
          R4V
        </span>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 mb-3">
            <span className="h-[1px] w-8 bg-[#c5a059]" />
            <span className="font-mono-vintage text-xs tracking-[0.3em] text-[#c5a059] uppercase">
              SECTION I // DOSSIER OVERVIEW
            </span>
            <span className="h-[1px] w-8 bg-[#c5a059]" />
          </div>
          <h2 className="font-cinzel text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#ede8dd] tracking-[0.15em] uppercase">
            THE ORGANIZATION
          </h2>
          <p className="font-editorial italic text-lg sm:text-xl text-[#9f9788] mt-3">
            Operating from the quiet shadows with methodical precision.
          </p>
        </div>

        {/* Central Archival Document Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.9 }}
          className="bg-[#121418] border border-[#2d323b] shadow-[0_20px_60px_rgba(0,0,0,0.8)] relative p-6 sm:p-10 md:p-14"
        >
          {/* Decorative Corner Accents */}
          <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-[#c5a059]" />
          <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-[#c5a059]" />
          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-[#c5a059]" />
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-[#c5a059]" />

          {/* Document Header Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-[#232730] gap-4 mb-8">
            <div className="space-y-1">
              <span className="font-mono-vintage text-xs tracking-widest text-[#8c6d32]">
                ORIGIN: BIRMINGHAM PROTOCOL
              </span>
              <h3 className="font-cinzel text-xl sm:text-2xl font-bold text-[#e5cb91]">
                FOUNDATIONAL CHARTER // TEAM R4V
              </h3>
            </div>
            <div className="flex items-center gap-3">
              <span className="stamp-verified text-xs">OFFICIALLY INDEXED</span>
              <span className="stamp-classified text-xs">CONFIDENTIAL</span>
            </div>
          </div>

          {/* Primary Text Content */}
          <div className="space-y-6 font-editorial text-base sm:text-lg md:text-xl text-[#d1cbc0] leading-relaxed">
            <p>
              <strong className="font-cinzel text-[#e5cb91] font-bold tracking-wider">TEAM R4V</strong> is a structured online organization and collective dedicated to identifying, documenting, and officially reporting accounts and bad actors that systematically violate platform community standards and internet safety rules.
            </p>

            <p>
              In an era overwhelmed by digital noise, deceptive scams, predatory impersonators, and malicious syndicates, R4V acts as a steadfast observation bureau. We do not participate in public drama, nor do we shout into the void. We construct methodical, airtight evidentiary records that allow platform moderation teams to enforce their own rules with absolute clarity.
            </p>

            {/* Core Principle Callout */}
            <div className="my-10 p-6 sm:p-8 bg-[#181a20] border-l-4 border-[#c5a059] relative">
              <span className="font-mono-vintage text-[11px] tracking-[0.25em] text-[#8c6d32] block mb-2 uppercase">
                THE R4V IRREVOCABLE MANDATE
              </span>
              <blockquote className="font-cinzel text-xl sm:text-2xl md:text-3xl font-bold text-[#fff6e5] tracking-wide leading-tight">
                “{SITE_INFO.motto}”
              </blockquote>
            </div>

            {/* Safety & Anti-Harassment Affirmation */}
            <div className="pt-6 border-t border-[#232730] grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-5 bg-[#0f1114] border border-[#20242c] space-y-2">
                <div className="flex items-center gap-2 text-[#c5a059]">
                  <ShieldCheck size={18} />
                  <span className="font-cinzel text-sm font-bold tracking-wider">
                    STRICT INTEGRITY OBLIGATION
                  </span>
                </div>
                <p className="font-editorial text-sm text-[#9f9788] leading-normal">
                  R4V does <strong className="text-[#ede8dd]">not</strong> encourage, tolerate, or facilitate harassment, false reporting, threats, doxxing, or coordinated brigading. Every action is audited against established terms of service.
                </p>
              </div>

              <div className="p-5 bg-[#0f1114] border border-[#20242c] space-y-2">
                <div className="flex items-center gap-2 text-[#e5cb91]">
                  <Scale size={18} />
                  <span className="font-cinzel text-sm font-bold tracking-wider">
                    OBJECTIVE VERIFICATION
                  </span>
                </div>
                <p className="font-editorial text-sm text-[#9f9788] leading-normal">
                  Reports are never submitted on hearsay or personal malice. We insist on raw, unedited, timestamped digital proof before any incident is acknowledged in our archive.
                </p>
              </div>
            </div>
          </div>

          {/* Archival Signature Footer */}
          <div className="mt-10 pt-6 border-t border-[#232730] flex flex-col sm:flex-row items-center justify-between text-xs font-mono-vintage text-[#7c7568] gap-4">
            <div className="flex items-center gap-2">
              <Stamp size={14} className="text-[#c5a059]" />
              <span>RATIFIED BY EXECUTIVE COMMAND</span>
            </div>
            <div className="tracking-widest uppercase">
              DOCUMENT ID: <span className="text-[#c5a059]">R4V-BUREAU-001-ALPHA</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
