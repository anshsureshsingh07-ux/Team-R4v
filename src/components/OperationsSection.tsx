import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  ShieldAlert, 
  Search, 
  FileCheck, 
  Scale, 
  Archive, 
  CheckCircle2, 
  ExternalLink, 
  Radio, 
  Play, 
  HelpCircle,
  Clock,
  Sparkles
} from 'lucide-react';
import { OPERATIONS_STEPS } from '../data/config';
import { OperationStep } from '../types';
import { ambientSound } from '../utils/ambientAudio';

export const OperationsSection: React.FC = () => {
  const [activeStepIdx, setActiveStepIdx] = useState<number>(0);
  const [testedChecks, setTestedChecks] = useState<number[]>([0]);

  const handleStepClick = (idx: number) => {
    ambientSound.playClick(800 + idx * 100);
    setActiveStepIdx(idx);
    if (!testedChecks.includes(idx)) {
      setTestedChecks([...testedChecks, idx]);
    }
  };

  const currentStep = OPERATIONS_STEPS[activeStepIdx] || OPERATIONS_STEPS[0];

  return (
    <section id="operations" className="relative py-28 bg-[#07090b] border-t border-[#1a1d24] film-grain">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 mb-3">
            <span className="h-[1px] w-8 bg-[#c5a059]" />
            <span className="font-mono-vintage text-xs tracking-[0.3em] text-[#c5a059] uppercase">
              SECTION IV // STANDARD PROTOCOL
            </span>
            <span className="h-[1px] w-8 bg-[#c5a059]" />
          </div>
          <h2 className="font-cinzel text-3xl sm:text-4xl md:text-5xl font-black text-[#ede8dd] tracking-[0.15em] uppercase">
            OPERATIONS & PIPELINE
          </h2>
          <p className="font-editorial italic text-lg sm:text-xl text-[#9f9788] mt-3">
            The five-stage investigative rigor applied to every logged incident and complaint.
          </p>
        </div>

        {/* Interactive Step Navigator Bar */}
        <div className="bg-[#0f1115] border border-[#222733] p-4 sm:p-6 mb-12 shadow-[0_15px_40px_rgba(0,0,0,0.8)]">
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {OPERATIONS_STEPS.map((step, idx) => {
              const isSelected = activeStepIdx === idx;
              const isPassed = testedChecks.includes(idx);

              return (
                <button
                  key={step.stepNumber}
                  id={`operation-step-tab-${step.stepNumber}`}
                  onClick={() => handleStepClick(idx)}
                  className={`p-3 sm:p-4 text-left border transition-all duration-200 relative group cursor-pointer ${
                    isSelected
                      ? 'bg-[#1a1e27] border-[#c5a059] shadow-lg'
                      : 'bg-[#0a0c0e] border-[#1e222b] hover:border-[#8c6d32] text-[#8c8273]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-mono-vintage text-xs font-bold text-[#c5a059]">
                      PHASE {step.stepNumber}
                    </span>
                    {isPassed && (
                      <CheckCircle2 size={13} className="text-[#4ade80]" />
                    )}
                  </div>
                  <span className="font-cinzel text-xs sm:text-sm font-bold text-[#ede8dd] block uppercase truncate">
                    {step.title}
                  </span>
                  {isSelected && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#c5a059]" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Phase Active Board */}
        <motion.div
          key={activeStepIdx}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-[#121419] border-2 border-[#8c6d32]/60 p-6 sm:p-10 shadow-[0_20px_60px_rgba(0,0,0,0.9)] relative"
        >
          {/* Top Brass Identification */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-[#232732] gap-4 mb-8">
            <div>
              <span className="font-mono-vintage text-xs tracking-widest text-[#c5a059] uppercase block mb-1">
                EXECUTIVE OPERATIONAL ORDER // DIRECTIVE #{currentStep.stepNumber}00
              </span>
              <h3 className="font-cinzel text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#fff6e5] tracking-wider uppercase">
                PHASE {currentStep.stepNumber}: {currentStep.title}
              </h3>
              <span className="font-editorial italic text-sm sm:text-base text-[#9c9589] mt-1 block">
                {currentStep.subtitle}
              </span>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <span className="stamp-classified text-xs">{currentStep.seal || 'MANDATORY PROTOCOL'}</span>
            </div>
          </div>

          {/* Phase Details Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div>
                <h4 className="font-mono-vintage text-xs tracking-widest text-[#8c6d32] uppercase mb-2">
                  OPERATIONAL METHODOLOGY & MANDATE
                </h4>
                <p className="font-editorial text-base sm:text-lg text-[#dcd7cb] leading-relaxed">
                  {currentStep.description}
                </p>
              </div>

              {currentStep.criteria && currentStep.criteria.length > 0 && (
                <div>
                  <h4 className="font-mono-vintage text-xs tracking-widest text-[#c5a059] uppercase mb-2">
                    MANDATORY VERIFICATION CRITERIA
                  </h4>
                  <ul className="space-y-2.5 font-mono-vintage text-xs text-[#cdc5b4] bg-[#0a0c0e] p-4 border border-[#20242e]">
                    {currentStep.criteria.map((crit, idx) => (
                      <li key={idx} className="flex items-start gap-2.5">
                        <span className="text-[#c5a059] font-bold">[{idx + 1}]</span>
                        <span>{crit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Right Side Archival Card */}
            <div className="bg-[#0c0e11] border border-[#232732] p-5 flex flex-col justify-between space-y-6">
              <div className="space-y-3">
                <span className="font-mono-vintage text-[11px] text-[#8c6d32] uppercase tracking-wider block">
                  PHASE BENCHMARKS
                </span>
                <div className="font-mono-vintage text-xs text-[#c5a059] p-3 bg-[#13161c] border border-[#262b36]">
                  {currentStep.duration || 'EXECUTION TIMEFRAME: ACTIVE'}
                </div>
                <ul className="space-y-2 text-xs font-mono-vintage text-[#bbb3a4]">
                  <li className="flex items-center gap-2">
                    <span className="text-[#4ade80]">✓</span> Standardized Archival Hash
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-[#4ade80]">✓</span> Dual-Auditor Cross-Examination
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-[#4ade80]">✓</span> Permanent Ledger Registry
                  </li>
                </ul>
              </div>

              <div className="pt-4 border-t border-[#1f222a] flex items-center justify-between">
                <button
                  onClick={() => {
                    if (activeStepIdx < OPERATIONS_STEPS.length - 1) {
                      handleStepClick(activeStepIdx + 1);
                    } else {
                      handleStepClick(0);
                    }
                  }}
                  className="w-full py-2.5 bg-[#8c6d32] hover:bg-[#c5a059] text-black font-cinzel font-bold text-xs tracking-widest uppercase transition-colors text-center cursor-pointer"
                >
                  {activeStepIdx < OPERATIONS_STEPS.length - 1
                    ? `ADVANCE TO PHASE 0${activeStepIdx + 2} →`
                    : 'RETURN TO PHASE 01 ↺'}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
