import React, { useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Printer, Shield, FileText, CheckCircle2, AlertTriangle, Download, Lock, Check } from 'lucide-react';
import { CaseAnalysisResult } from '../../types';

interface CaseReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: CaseAnalysisResult;
}

export const CaseReportModal: React.FC<CaseReportModalProps> = ({ isOpen, onClose, result }) => {
  const reportRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/85 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.97, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.97, y: 15 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-4xl bg-[#0a0c10] border border-[#c5a059]/50 shadow-[0_25px_70px_rgba(0,0,0,0.95)] max-h-[92vh] flex flex-col text-[#ede8dd] font-sans"
        >
          {/* Header Bar */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#222836] bg-[#11141c] no-print">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[#1a1f2c] border border-[#c5a059]/60 flex items-center justify-center text-[#c5a059]">
                <FileText size={16} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-[#c5a059] font-bold">
                    OFFICIAL DOSSIER GENERATOR
                  </span>
                  <span className="text-[#3a4456]">•</span>
                  <span className="font-mono text-[10px] uppercase text-[#8c8273]">CLASSIFIED EXPORT</span>
                </div>
                <h3 className="font-serif text-base font-bold text-[#ede8dd] tracking-wider uppercase">
                  Case Summary Report #{result.caseId}
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePrint}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#c5a059] hover:bg-[#dfc181] text-[#0b0d12] font-mono text-xs font-bold uppercase tracking-wider transition-colors shadow-[0_0_15px_rgba(197,160,89,0.3)]"
              >
                <Printer size={14} />
                <span>PRINT / EXPORT PDF</span>
              </button>

              <button
                onClick={onClose}
                className="p-1.5 text-[#8c8273] hover:text-[#ede8dd] hover:bg-[#1a1f2c] transition-colors border border-transparent hover:border-[#2f374a]"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Printable Report Canvas */}
          <div
            ref={reportRef}
            id="printable-case-report"
            className="p-6 sm:p-8 overflow-y-auto space-y-6 max-h-[calc(92vh-130px)] bg-[#07090d] text-[#e3ded4] printable-dossier"
          >
            {/* Top Dossier Header */}
            <div className="border-b-2 border-[#c5a059]/60 pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-[#c5a059] font-mono text-xs tracking-[0.3em] font-bold mb-1">
                  <span>TEAM R4V INTELLIGENCE BUREAU</span>
                  <span>//</span>
                  <span>EST. 1924</span>
                </div>
                <h1 className="font-serif text-2xl font-bold tracking-widest text-[#fffdfa] uppercase">
                  FORENSIC CASE AUDIT REPORT
                </h1>
                <p className="font-mono text-xs text-[#8c8273] mt-1">
                  POLICY & EVIDENCE CATEGORIZATION SUMMARY
                </p>
              </div>

              <div className="text-right font-mono text-xs space-y-1">
                <div className="text-[#c5a059] font-bold">CASE ID: {result.caseId}</div>
                <div className="text-[#8c8273]">
                  DATE: {new Date(result.analyzedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                </div>
                <div className="text-[10px] text-[#5b667a]">
                  TIMESTAMP: {new Date(result.analyzedAt).toISOString()}
                </div>
              </div>
            </div>

            {/* Subject Overview Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border border-[#222834] bg-[#0e1118] p-4 font-mono text-xs">
              <div>
                <span className="text-[#8c8273] uppercase text-[10px] block mb-1">SUBJECT IDENTIFIER</span>
                <span className="text-[#e5cb91] font-bold text-sm">{result.subjectUsername}</span>
              </div>
              <div>
                <span className="text-[#8c8273] uppercase text-[10px] block mb-1">ANALYSIS CLASSIFICATION</span>
                <span className={`font-bold ${result.status === 'ANALYZED' ? 'text-[#22c55e]' : 'text-[#f59e0b]'}`}>
                  {result.statusTitle}
                </span>
              </div>
              <div>
                <span className="text-[#8c8273] uppercase text-[10px] block mb-1">EVIDENTIARY STATUS</span>
                <span className="text-[#ede8dd]">{result.evidenceReceivedCount} Attachment(s) Cataloged</span>
              </div>
            </div>

            {/* Case Narrative Summary */}
            <div className="space-y-2">
              <h4 className="font-mono text-xs font-bold text-[#c5a059] tracking-widest uppercase flex items-center gap-2">
                <span>[01]</span> CASE NARRATIVE & INCIDENT BRIEFING
              </h4>
              <div className="p-4 bg-[#0e1219] border border-[#1d222e] text-xs text-[#c8c2b5] leading-relaxed font-mono whitespace-pre-wrap">
                {result.rawDescription || 'No detailed incident narrative provided.'}
              </div>
            </div>

            {/* Potential Policy Categories Table */}
            <div className="space-y-2">
              <h4 className="font-mono text-xs font-bold text-[#c5a059] tracking-widest uppercase flex items-center gap-2">
                <span>[02]</span> IDENTIFIED POLICY CATEGORIES & EVIDENCE CONFIDENCE
              </h4>

              {result.categories.length > 0 ? (
                <div className="border border-[#222834] overflow-hidden">
                  <table className="w-full text-left font-mono text-xs">
                    <thead className="bg-[#141822] text-[#8c8273] uppercase text-[10px] border-b border-[#222834]">
                      <tr>
                        <th className="py-2.5 px-4">POLICY CATEGORY</th>
                        <th className="py-2.5 px-4">IDENTIFIED PIECES</th>
                        <th className="py-2.5 px-4">CONFIDENCE</th>
                        <th className="py-2.5 px-4">OFFICIAL CITATION</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1b202c]">
                      {result.categories.map((cat, idx) => (
                        <tr key={idx} className="bg-[#0b0e14]">
                          <td className="py-3 px-4 font-bold text-[#e5cb91]">{cat.name}</td>
                          <td className="py-3 px-4 text-[#ede8dd]">{cat.count.toString().padStart(2, '0')} Pieces</td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-0.5 text-[10px] font-bold ${
                                cat.confidence === 'HIGH'
                                  ? 'bg-[#22c55e]/10 text-[#22c55e] border border-[#22c55e]/30'
                                  : cat.confidence === 'MODERATE'
                                  ? 'bg-[#f59e0b]/10 text-[#f59e0b] border border-[#f59e0b]/30'
                                  : 'bg-[#ef4444]/10 text-[#ef4444] border border-[#ef4444]/30'
                              }`}
                            >
                              {cat.confidence}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-[11px] text-[#8c8273]">{cat.ruleCitation || 'General Terms'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-4 bg-[#0e1219] border border-[#1d222e] text-xs text-[#8c8273] font-mono">
                  No specific platform violations met the threshold for definitive policy matching.
                </div>
              )}
            </div>

            {/* Detailed Forensic Breakdown */}
            {result.categories.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-mono text-xs font-bold text-[#c5a059] tracking-widest uppercase flex items-center gap-2">
                  <span>[03]</span> DETAILED EVIDENCE RATIONALE & MISSING INFORMATION
                </h4>

                <div className="space-y-3">
                  {result.categories.map((cat, idx) => (
                    <div key={idx} className="p-4 bg-[#0e121a] border border-[#1f2533] space-y-2 text-xs font-mono">
                      <div className="flex items-center justify-between border-b border-[#181d28] pb-1.5">
                        <span className="font-bold text-[#ede8dd]">{cat.name}</span>
                        <span className="text-[10px] text-[#8c8273]">{cat.sufficiencyForHumanReview}</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px] pt-1">
                        <div>
                          <strong className="text-[#c5a059] block mb-0.5">RELEVANT EVIDENCE:</strong>
                          <p className="text-[#a69e90]">{cat.relevantEvidence}</p>
                        </div>
                        <div>
                          <strong className="text-[#c5a059] block mb-0.5">ANALYSIS RATIONALE:</strong>
                          <p className="text-[#a69e90]">{cat.analysisRationale}</p>
                        </div>
                      </div>
                      {cat.missingInfo && (
                        <div className="text-[10px] text-[#8c8273] pt-1 border-t border-[#161b24]">
                          <strong className="text-[#df878b]">MISSING / SUPPLEMENTARY REQUIREMENTS:</strong> {cat.missingInfo}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommended Next Step */}
            <div className="space-y-2">
              <h4 className="font-mono text-xs font-bold text-[#c5a059] tracking-widest uppercase flex items-center gap-2">
                <span>[04]</span> RECOMMENDED ACTION & OFFICIAL NEXT STEPS
              </h4>
              <div className="p-4 bg-[#141924] border border-[#2e374d] text-xs text-[#ede8dd] font-mono leading-relaxed space-y-2">
                <div className="flex items-start gap-2">
                  <CheckCircle2 size={16} className="text-[#c5a059] shrink-0 mt-0.5" />
                  <p>{result.recommendedNextStep}</p>
                </div>
                <div className="text-[11px] text-[#8c8273] pl-6">
                  Note: Numbers in this report indicate distinct pieces of corroborating evidence identified by the analyzer, not the quantity of reports to file.
                </div>
              </div>
            </div>

            {/* Official Reviewer Notes & Bureau Signoff */}
            <div className="pt-6 border-t-2 border-[#222834] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 font-mono text-xs">
              <div className="space-y-1">
                <span className="text-[#8c8273] text-[10px] uppercase">REVIEWER ATTESTATION</span>
                <div className="text-[#ede8dd]">TEAM R4V FORENSIC ANALYSIS DIVISION</div>
                <div className="text-[10px] text-[#5b667a]">ASSISTIVE CLASSIFICATION ENGINE // SYSTEM VERIFIED</div>
              </div>

              {/* Bureau Stamp */}
              <div className="p-3 border-2 border-[#8b1a1a] text-[#f2a2a6] uppercase font-bold text-[10px] tracking-widest text-center transform -rotate-1 bg-[#220a0c]">
                R4V FORENSIC DOSSIER
                <div className="text-[8px] tracking-normal text-[#df878b]">CLASSIFIED & DOCUMENTED</div>
              </div>
            </div>

            {/* Legal Disclaimer Box */}
            <div className="p-3 bg-[#0a0c10] border border-[#1b1f2b] text-[10px] font-mono text-[#6e7787] leading-relaxed">
              <strong className="text-[#8c8273]">DISCLAIMER:</strong> R4V CASE ANALYZER IS AN ASSISTIVE TOOL. AI classifications may be incorrect. Users must review evidence themselves and submit only truthful, supported reports. Third-party platforms make their own moderation and enforcement decisions.
            </div>
          </div>

          {/* Footer Bar */}
          <div className="px-6 py-3.5 border-t border-[#222836] bg-[#11141c] flex items-center justify-between text-xs font-mono no-print">
            <div className="flex items-center gap-2 text-[#8c8273]">
              <Lock size={12} className="text-[#c5a059]" />
              <span>CONFIDENTIAL INTELLIGENCE DOCUMENT</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrint}
                className="px-3 py-1 bg-[#1a1f2c] hover:bg-[#252c3d] border border-[#374158] text-[#ede8dd] uppercase tracking-wider text-xs transition-colors"
              >
                PRINT DOSSIER
              </button>
              <button
                onClick={onClose}
                className="px-3 py-1 bg-[#c5a059] hover:bg-[#dfc181] text-black font-bold uppercase tracking-wider text-xs transition-colors"
              >
                DONE
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
