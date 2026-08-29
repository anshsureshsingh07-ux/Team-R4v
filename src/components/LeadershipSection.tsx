import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Shield, Key, Eye, FileText, Stamp, Award } from 'lucide-react';
import { LEADERSHIP_DATA } from '../data/config';
import { Leader } from '../types';

interface LeadershipSectionProps {
  onOpenPilotAccess?: () => void;
}

export const LeadershipSection: React.FC<LeadershipSectionProps> = ({ onOpenPilotAccess }) => {
  const [selectedLeader, setSelectedLeader] = useState<Leader | null>(null);

  return (
    <section
      id="leadership"
      className="relative py-28 bg-[#07080a] border-t border-[#1a1c22] film-grain"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <div className="inline-flex items-center gap-2 mb-3">
            <span className="h-[1px] w-8 bg-[#c5a059]" />
            <span className="font-mono-vintage text-xs tracking-[0.3em] text-[#c5a059] uppercase">
              SECTION II // EXECUTIVE COUNCIL
            </span>
            <span className="h-[1px] w-8 bg-[#c5a059]" />
          </div>
          <h2 className="font-cinzel text-3xl sm:text-4xl md:text-5xl font-black text-[#ede8dd] tracking-[0.15em] uppercase">
            LEADERSHIP
          </h2>
          <p className="font-editorial italic text-lg sm:text-xl text-[#9f9788] mt-3">
            Directing operations with unflinching discipline and absolute discretion.
          </p>
        </div>

        {/* Leadership Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10">
          {LEADERSHIP_DATA.map((leader, index) => {
            const isOwner = leader.role === 'OWNER';

            return (
              <motion.div
                key={leader.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                onClick={() => setSelectedLeader(leader)}
                className="group cursor-pointer relative bg-[#101215] border border-[#272b34] hover:border-[#c5a059] transition-all duration-500 shadow-[0_15px_40px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col"
              >
                {/* Vintage Dossier Header Bar on Card */}
                <div className="bg-[#15181e] px-4 py-2.5 border-b border-[#232730] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#c5a059] animate-pulse" />
                    <span className="font-mono-vintage text-[11px] tracking-widest text-[#9c9589]">
                      {leader.dossierNumber}
                    </span>
                  </div>

                  {/* Animated Role Badge Label */}
                  <motion.span
                    animate={{ opacity: [0.8, 1, 0.8] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                    className={`font-cinzel text-[10px] tracking-[0.2em] font-black px-2.5 py-0.5 uppercase border ${
                      isOwner
                        ? 'border-[#c5a059] bg-[#8c6d32]/30 text-[#e5cb91]'
                        : 'border-[#591619] bg-[#380b0e]/40 text-[#df878b]'
                    }`}
                  >
                    {leader.label}
                  </motion.span>
                </div>

                {/* Portrait Photo Container with Vintage Chiaroscuro & Hover Reveal */}
                <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#0a0c0e]">
                  <img
                    src={leader.image}
                    alt={`${leader.name} portrait`}
                    className="w-full h-full object-cover object-center filter grayscale contrast-[130%] brightness-[70%] group-hover:brightness-[95%] group-hover:contrast-[115%] group-hover:scale-105 transition-all duration-700 ease-out"
                    referrerPolicy="no-referrer"
                  />

                  {/* Film Grain & Dark Gradient Overlays */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#101215] via-[#101215]/20 to-transparent opacity-90 group-hover:opacity-60 transition-opacity duration-500" />

                  {/* Red Wax / Rubber Stamp on Top Corner */}
                  <div className="absolute top-4 right-4 pointer-events-none transform rotate-12 opacity-80 group-hover:opacity-100 transition-opacity">
                    <span className={isOwner ? "stamp-verified text-[10px]" : "stamp-sealed text-[10px] px-2 py-0.5"}>
                      {isOwner ? "SUPREME DIR" : "VERIFIED OPS"}
                    </span>
                  </div>

                  {/* Hover Dossier Reveal Overlay */}
                  <div className="absolute inset-0 bg-[#090b0d]/92 opacity-0 group-hover:opacity-100 transition-all duration-500 p-6 flex flex-col justify-between border-2 border-[#c5a059]/40 backdrop-blur-xs">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between border-b border-[#c5a059]/30 pb-2">
                        <span className="font-mono-vintage text-[10px] tracking-widest text-[#c5a059]">
                          CLEARANCE DOSSIER
                        </span>
                        <Key size={13} className="text-[#c5a059]" />
                      </div>

                      <div className="space-y-1 text-left">
                        <span className="font-mono-vintage text-[10px] text-[#7a7469] block">
                          SECURITY RATING
                        </span>
                        <span className="font-mono-vintage text-xs text-[#ede8dd] font-bold block">
                          {leader.clearanceLevel}
                        </span>
                      </div>

                      <div className="space-y-1 text-left">
                        <span className="font-mono-vintage text-[10px] text-[#7a7469] block">
                          DIVISION OF OVERSIGHT
                        </span>
                        <span className="font-editorial text-sm text-[#cdc5b4] block">
                          {leader.division}
                        </span>
                      </div>

                      <div className="space-y-1 text-left">
                        <span className="font-mono-vintage text-[10px] text-[#7a7469] block">
                          TENURE / STATUS
                        </span>
                        <span className="font-mono-vintage text-xs text-[#c5a059] block">
                          {leader.appointed} // {leader.status}
                        </span>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-[#232730] flex items-center justify-between">
                      <span className="font-mono-vintage text-[10px] text-[#9c9589] tracking-wider">
                        CLICK FOR FULL DOSSIER
                      </span>
                      <span className="font-cinzel text-xs text-[#e5cb91]">→</span>
                    </div>
                  </div>
                </div>

                {/* Card Bottom Meta */}
                <div className="p-6 bg-[#121418] flex-1 flex flex-col justify-between border-t border-[#1e2229]">
                  <div>
                    <div className="flex items-baseline justify-between mb-1">
                      <h3 className="font-cinzel text-2xl font-black tracking-[0.2em] text-[#fff6e5] group-hover:text-[#c5a059] transition-colors">
                        {leader.name}
                      </h3>
                      <span className="font-mono-vintage text-xs text-[#8c6d32]">
                        {leader.appointed.split(' ')[1]}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mb-3">
                      <span className="font-cinzel text-xs tracking-[0.25em] font-bold text-[#c5a059] uppercase">
                        {leader.role}
                      </span>
                    </div>

                    <p className="font-editorial text-sm text-[#9c9589] line-clamp-2 leading-relaxed">
                      {leader.division}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#1c2026] flex items-center justify-between text-xs font-mono-vintage text-[#6f695e]">
                    <span>STATUS: {leader.status}</span>
                    <span className="text-[#c5a059] group-hover:translate-x-1 transition-transform">
                      VIEW FILE →
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Modal for Leader Details if clicked */}
        {selectedLeader && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-300"
            onClick={() => setSelectedLeader(null)}
          >
            <div
              className="bg-[#121519] border-2 border-[#c5a059] max-w-xl w-full p-6 sm:p-8 relative shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                onClick={() => setSelectedLeader(null)}
                className="absolute top-4 right-4 text-[#9c9589] hover:text-[#e5cb91] font-mono-vintage text-xs p-1 border border-[#272b34] hover:border-[#c5a059]"
              >
                [ESC // CLOSE]
              </button>

              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#232730]">
                <div className="w-12 h-12 border border-[#c5a059] overflow-hidden bg-black">
                  <img
                    src={selectedLeader.image}
                    alt={selectedLeader.name}
                    className="w-full h-full object-cover filter grayscale contrast-125"
                  />
                </div>
                <div>
                  <h4 className="font-cinzel text-2xl font-black text-[#fff6e5] tracking-widest">
                    {selectedLeader.name}
                  </h4>
                  <span className="font-cinzel text-xs text-[#c5a059] tracking-widest font-bold">
                    {selectedLeader.role} // {selectedLeader.dossierNumber}
                  </span>
                </div>
              </div>

              <div className="space-y-4 font-editorial text-sm text-[#cdc5b4]">
                <div className="p-3 bg-[#0d0f12] border border-[#1f2229]">
                  <span className="font-mono-vintage text-[10px] text-[#8c6d32] uppercase block">
                    OPERATIONAL JURISDICTION
                  </span>
                  <p className="text-base text-[#e5cb91] font-cinzel mt-0.5">
                    {selectedLeader.division}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs font-mono-vintage">
                  <div className="p-3 bg-[#0d0f12] border border-[#1f2229]">
                    <span className="text-[#7a7469] block">SECURITY CLEARANCE</span>
                    <span className="text-[#ede8dd] font-bold">{selectedLeader.clearanceLevel}</span>
                  </div>
                  <div className="p-3 bg-[#0d0f12] border border-[#1f2229]">
                    <span className="text-[#7a7469] block">DIRECTIVE STATUS</span>
                    <span className="text-[#c5a059] font-bold">{selectedLeader.status}</span>
                  </div>
                </div>

                <p className="italic text-[#9c9589] pt-2 border-t border-[#1f2229]">
                  “All directives enacted under this office require verified empirical proof and adhere strictly to official platform terms of service.”
                </p>
              </div>

              <div className="mt-6 flex items-center justify-between gap-3 pt-3 border-t border-[#1f2229]">
                {onOpenPilotAccess ? (
                  <button
                    onClick={() => {
                      setSelectedLeader(null);
                      onOpenPilotAccess();
                    }}
                    id="leader-modal-pilot-access-btn"
                    className="flex items-center gap-1.5 text-xs font-mono-vintage text-[#c5a059] hover:text-[#ede8dd] border border-[#30281b] hover:border-[#c5a059] px-3 py-2 bg-[#171410] transition-colors cursor-pointer"
                  >
                    <Key size={13} className="text-[#c5a059]" />
                    <span>ACCESS THE PILOT</span>
                  </button>
                ) : (
                  <div />
                )}

                <button
                  onClick={() => setSelectedLeader(null)}
                  className="px-5 py-2 bg-[#8c6d32] text-black font-cinzel font-bold text-xs tracking-widest uppercase hover:bg-[#c5a059] cursor-pointer"
                >
                  CLOSE DOSSIER
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
