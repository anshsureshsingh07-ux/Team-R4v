import React, { useState } from 'react';
import { motion } from 'motion/react';
import { FileSearch, ShieldCheck, Scale, Send, CheckCircle2, ArrowDown, ChevronRight, Check } from 'lucide-react';
import { OPERATIONS_STEPS, SITE_INFO } from '../data/config';

export const OperationsSection: React.FC = () => {
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);

  const icons = [FileSearch, ShieldCheck, Scale, Send, CheckCircle2];

  return (
    <section id="operations" className="relative py-28 bg-[#07080a] border-t border-[#1a1d24] film-grain">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 mb-3">
            <span className="h-[1px] w-8 bg-[#c5a059]" />
            <span className="font-mono-vintage text-xs tracking-[0.3em] text-[#c5a059] uppercase">
              SECTION IV // PROTOCOL & METHODOLOGY
            </span>
            <span className="h-[1px] w-8 bg-[#c5a059]" />
          </div>
          <h2 className="font-cinzel text-3xl sm:text-4xl md:text-5xl font-black text-[#ede8dd] tracking-[0.15em] uppercase">
            OPERATIONS
          </h2>
          <p className="font-editorial italic text-lg sm:text-xl text-[#9f9788] mt-3">
            A manual, multi-stage evidence verification and documentation pipeline.
          </p>
        </div>

        {/* Doctrine Quote Callout */}
        <div className="max-w-4xl mx-auto mb-16 bg-[#111317] border border-[#c5a059]/40 p-6 sm:p-8 text-center shadow-[0_10px_35px_rgba(0,0,0,0.6)] relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-4 py-0.5 bg-[#07080a] border border-[#c5a059] text-[10px] font-mono-vintage tracking-widest text-[#c5a059] uppercase">
            CORE OPERATING DOCTRINE
          </div>
          <blockquote className="font-cinzel text-xl sm:text-2xl md:text-3xl font-extrabold text-[#fff6e5] tracking-wide mt-2">
            “{SITE_INFO.operationalQuote}”
          </blockquote>
          <p className="font-editorial text-sm text-[#8c8273] mt-2">
            We reject automated spamming, mob brigading, and indiscriminate reporting. Quality of proof is absolute.
          </p>
        </div>

        {/* Interactive Pipeline Timeline */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Timeline Navigator (Steps 01 - 05) */}
          <div className="lg:col-span-5 space-y-4">
            {OPERATIONS_STEPS.map((step, idx) => {
              const Icon = icons[idx] || FileSearch;
              const isSelected = activeStepIndex === idx;

              return (
                <div key={step.stepNumber} className="relative">
                  <motion.div
                    whileHover={{ x: 4 }}
                    onClick={() => setActiveStepIndex(idx)}
                    className={`p-4 sm:p-5 border transition-all duration-300 cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'bg-[#181a20] border-[#c5a059] shadow-[0_0_20px_rgba(197,160,89,0.2)]'
                        : 'bg-[#101216] border-[#22252e] hover:border-[#383d4c] hover:bg-[#14161b]'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-10 h-10 border flex items-center justify-center font-mono-vintage text-sm font-bold transition-colors ${
                          isSelected
                            ? 'border-[#c5a059] bg-[#8c6d32]/30 text-[#e5cb91]'
                            : 'border-[#272b34] bg-[#0c0e11] text-[#7a7469]'
                        }`}
                      >
                        {step.stepNumber}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h3
                            className={`font-cinzel text-sm sm:text-base font-bold tracking-wider uppercase transition-colors ${
                              isSelected ? 'text-[#fff6e5]' : 'text-[#aba394]'
                            }`}
                          >
                            {step.title}
                          </h3>
                        </div>
                        <span className="font-mono-vintage text-[11px] text-[#7a7469] block">
                          {step.subtitle}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="font-mono-vintage text-[10px] text-[#8c6d32] hidden sm:inline">
                        STAGE {idx + 1}
                      </span>
                      <ChevronRight
                        size={16}
                        className={`transition-transform duration-300 ${
                          isSelected ? 'text-[#c5a059] translate-x-1' : 'text-[#444a56]'
                        }`}
                      />
                    </div>
                  </motion.div>

                  {/* Connecting Arrow between steps */}
                  {idx < OPERATIONS_STEPS.length - 1 && (
                    <div className="flex justify-center my-1.5 opacity-40">
                      <ArrowDown size={14} className="text-[#c5a059]" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Right Detailed Stage Inspector */}
          <div className="lg:col-span-7 bg-[#121418] border-2 border-[#2d323c] p-6 sm:p-8 shadow-[0_15px_50px_rgba(0,0,0,0.8)] relative sticky top-24">
            {/* Corner Details */}
            <div className="absolute top-0 right-0 p-3">
              <span className="stamp-verified text-xs">
                {OPERATIONS_STEPS[activeStepIndex].seal}
              </span>
            </div>

            <div className="flex items-center gap-2 font-mono-vintage text-xs text-[#8c6d32] mb-3">
              <span>{OPERATIONS_STEPS[activeStepIndex].duration}</span>
            </div>

            <h3 className="font-cinzel text-2xl sm:text-3xl font-extrabold text-[#fff6e5] tracking-wide mb-2">
              STAGE {OPERATIONS_STEPS[activeStepIndex].stepNumber} — {OPERATIONS_STEPS[activeStepIndex].title}
            </h3>

            <h4 className="font-mono-vintage text-sm text-[#c5a059] tracking-wider mb-6">
              {OPERATIONS_STEPS[activeStepIndex].subtitle}
            </h4>

            <div className="space-y-6 font-editorial">
              <div>
                <span className="font-mono-vintage text-xs tracking-widest text-[#7a7469] uppercase block mb-1">
                  PROCEDURAL OVERVIEW
                </span>
                <p className="text-base sm:text-lg text-[#d1cbc0] leading-relaxed bg-[#0b0d10] p-4 border border-[#1e2229]">
                  {OPERATIONS_STEPS[activeStepIndex].description}
                </p>
              </div>

              <div>
                <span className="font-mono-vintage text-xs tracking-widest text-[#7a7469] uppercase block mb-2">
                  MANDATORY VERIFICATION CRITERIA
                </span>
                <div className="space-y-2.5">
                  {OPERATIONS_STEPS[activeStepIndex].criteria.map((crit, cIdx) => (
                    <div
                      key={cIdx}
                      className="p-3 bg-[#0d0f13] border border-[#1f232c] flex items-start gap-3"
                    >
                      <div className="w-5 h-5 rounded-none border border-[#c5a059] bg-[#8c6d32]/20 flex items-center justify-center text-[#e5cb91] shrink-0 mt-0.5">
                        <Check size={12} />
                      </div>
                      <span className="font-mono-vintage text-xs sm:text-sm text-[#cdc5b4]">
                        {crit}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Step Navigation in Inspector */}
            <div className="mt-8 pt-6 border-t border-[#232730] flex items-center justify-between">
              <button
                disabled={activeStepIndex === 0}
                onClick={() => setActiveStepIndex((prev) => Math.max(0, prev - 1))}
                className={`font-cinzel text-xs font-bold tracking-wider uppercase px-4 py-2 border ${
                  activeStepIndex === 0
                    ? 'border-[#1e222a] text-[#484d59] cursor-not-allowed'
                    : 'border-[#2c313c] text-[#cdc5b4] hover:border-[#c5a059] hover:text-[#fff6e5]'
                }`}
              >
                ← PREVIOUS STAGE
              </button>

              <button
                disabled={activeStepIndex === OPERATIONS_STEPS.length - 1}
                onClick={() => setActiveStepIndex((prev) => Math.min(OPERATIONS_STEPS.length - 1, prev + 1))}
                className={`font-cinzel text-xs font-bold tracking-wider uppercase px-4 py-2 border ${
                  activeStepIndex === OPERATIONS_STEPS.length - 1
                    ? 'border-[#1e222a] text-[#484d59] cursor-not-allowed'
                    : 'border-[#c5a059] bg-[#8c6d32]/30 text-[#e5cb91] hover:bg-[#c5a059] hover:text-black'
                }`}
              >
                NEXT STAGE →
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
