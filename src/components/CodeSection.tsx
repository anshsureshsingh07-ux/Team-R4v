import React from 'react';
import { motion } from 'motion/react';
import { Scroll, Stamp, Feather, ShieldAlert, CheckCircle } from 'lucide-react';
import { CODE_RULES } from '../data/config';

export const CodeSection: React.FC = () => {
  return (
    <section id="code" className="relative py-28 bg-[#090a0d] border-t border-[#1a1d24] film-grain">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 mb-3">
            <span className="h-[1px] w-8 bg-[#c5a059]" />
            <span className="font-mono-vintage text-xs tracking-[0.3em] text-[#c5a059] uppercase">
              SECTION V // ETHICAL CONSTITUTION
            </span>
            <span className="h-[1px] w-8 bg-[#c5a059]" />
          </div>
          <h2 className="font-cinzel text-3xl sm:text-4xl md:text-5xl font-black text-[#ede8dd] tracking-[0.15em] uppercase">
            THE R4V CODE
          </h2>
          <p className="font-editorial italic text-lg sm:text-xl text-[#9f9788] mt-3">
            The unbending five articles of discipline binding every member and auditor.
          </p>
        </div>

        {/* Signed Organizational Charter Board */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9 }}
          className="bg-[#101216] border-2 border-[#8c6d32]/60 p-6 sm:p-10 md:p-14 relative shadow-[0_20px_70px_rgba(0,0,0,0.85)]"
        >
          {/* Top Vintage Charter Header */}
          <div className="text-center pb-8 border-b-2 border-[#232730] mb-10 relative">
            <div className="w-12 h-12 mx-auto border border-[#c5a059] bg-[#16181e] flex items-center justify-center transform rotate-45 mb-4 shadow-md">
              <Scroll size={20} className="text-[#c5a059] transform -rotate-45" />
            </div>

            <span className="font-mono-vintage text-[11px] tracking-[0.3em] text-[#8c6d32] uppercase block mb-1">
              PERMANENT CONSTITUTIONAL ARTICLES
            </span>
            <h3 className="font-cinzel text-2xl sm:text-3xl font-extrabold text-[#fff6e5] tracking-widest uppercase">
              ORGANIZATIONAL SOLEMN COVENANT
            </h3>
            <p className="font-editorial italic text-sm sm:text-base text-[#9c9589] max-w-xl mx-auto mt-2">
              “Power without discipline is destruction. Truth without proof is slander. We hold ourselves to the highest standard of internet integrity.”
            </p>

            {/* Stamp */}
            <div className="absolute top-0 right-0 hidden sm:block">
              <span className="stamp-classified text-[10px]">UNALTERABLE</span>
            </div>
          </div>

          {/* The 5 Code Articles */}
          <div className="space-y-8">
            {CODE_RULES.map((rule, idx) => (
              <motion.div
                key={rule.number}
                initial={{ opacity: 0, x: -15 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.12 }}
                className="p-5 sm:p-6 bg-[#0c0e11] border border-[#1e222a] hover:border-[#c5a059]/60 transition-colors relative group"
              >
                <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-4 mb-2">
                  <span className="font-mono-vintage text-base font-bold text-[#c5a059] tracking-wider">
                    {rule.number} —
                  </span>
                  <h4 className="font-cinzel text-lg sm:text-xl font-bold text-[#ede8dd] tracking-wider uppercase group-hover:text-[#e5cb91] transition-colors">
                    {rule.title}
                  </h4>
                  <span className="font-editorial italic text-sm text-[#8c6d32] sm:ml-auto">
                    {rule.summary}
                  </span>
                </div>

                <p className="font-editorial text-sm sm:text-base text-[#bbb3a4] leading-relaxed pl-0 sm:pl-10 mt-2">
                  {rule.detail}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Signatures & Ratification Section */}
          <div className="mt-14 pt-10 border-t-2 border-[#232730] grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
            {/* Signature 1 */}
            <div className="p-4 bg-[#0a0c0e] border border-[#1a1d24] flex flex-col items-center">
              <span className="font-cinzel-decorative text-xl text-[#dfc181] tracking-widest my-2 block">
                Asura
              </span>
              <div className="w-3/4 h-[1px] bg-[#3a3f4d] mb-2" />
              <span className="font-cinzel text-xs font-bold text-[#e3ded4] tracking-wider">
                ASURA
              </span>
              <span className="font-mono-vintage text-[10px] text-[#7a7469]">
                OWNER & HIGH COMMAND
              </span>
            </div>

            {/* Signature 2 */}
            <div className="p-4 bg-[#0a0c0e] border border-[#1a1d24] flex flex-col items-center">
              <span className="font-cinzel-decorative text-xl text-[#dfc181] tracking-widest my-2 block">
                Blackout
              </span>
              <div className="w-3/4 h-[1px] bg-[#3a3f4d] mb-2" />
              <span className="font-cinzel text-xs font-bold text-[#e3ded4] tracking-wider">
                BLACKOUT
              </span>
              <span className="font-mono-vintage text-[10px] text-[#7a7469]">
                MAIN MANAGER // TACTICAL
              </span>
            </div>

            {/* Signature 3 */}
            <div className="p-4 bg-[#0a0c0e] border border-[#1a1d24] flex flex-col items-center">
              <span className="font-cinzel-decorative text-xl text-[#dfc181] tracking-widest my-2 block">
                Aizen
              </span>
              <div className="w-3/4 h-[1px] bg-[#3a3f4d] mb-2" />
              <span className="font-cinzel text-xs font-bold text-[#e3ded4] tracking-wider">
                AIZEN
              </span>
              <span className="font-mono-vintage text-[10px] text-[#7a7469]">
                MAIN MANAGER // AUDIT
              </span>
            </div>
          </div>

          {/* Charter Footnote */}
          <div className="mt-8 text-center text-xs font-mono-vintage text-[#6b655a] flex items-center justify-center gap-2">
            <Feather size={13} className="text-[#c5a059]" />
            <span>RATIFIED UNDER SOLEMN SEAL // ARCHIVED IN BIRMINGHAM REGISTRY</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
