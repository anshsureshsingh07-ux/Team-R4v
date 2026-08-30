import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  Filter, 
  ExternalLink, 
  ShieldCheck, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  FileText, 
  FileCheck, 
  ChevronRight, 
  X, 
  Copy, 
  Layers,
  Archive,
  Scale
} from 'lucide-react';
import { ARCHIVE_CASES } from '../data/config';
import { ArchiveCase } from '../types';
import { ambientSound } from '../utils/ambientAudio';

interface ArchiveSectionProps {
  onOpenCaseFileSequence?: () => void;
  onNotify?: (msg: string, type?: 'info' | 'success' | 'alert' | 'copy') => void;
}

export const ArchiveSection: React.FC<ArchiveSectionProps> = ({ onOpenCaseFileSequence, onNotify }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedCase, setSelectedCase] = useState<ArchiveCase | null>(null);

  // Compute category counts
  const counts = useMemo(() => {
    return {
      ALL: ARCHIVE_CASES.length,
      ACTIVE: ARCHIVE_CASES.filter(c => c.status === 'ACTIVE').length,
      RESOLVED: ARCHIVE_CASES.filter(c => c.status === 'RESOLVED').length,
      DOCUMENTED: ARCHIVE_CASES.filter(c => c.status === 'DOCUMENTED').length,
      ARCHIVED: ARCHIVE_CASES.filter(c => c.status === 'ARCHIVED').length,
    };
  }, []);

  // Filtered cases
  const filteredCases = useMemo(() => {
    return ARCHIVE_CASES.filter((c) => {
      const matchesSearch =
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.caseNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.platform && c.platform.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesStatus =
        statusFilter === 'ALL' || c.status.toUpperCase() === statusFilter.toUpperCase();

      return matchesSearch && matchesStatus;
    });
  }, [searchQuery, statusFilter]);

  const handleCopyCaseNumber = (caseNum: string, e: React.MouseEvent) => {
    e.stopPropagation();
    ambientSound.playTelegraph();
    navigator.clipboard.writeText(caseNum);
    if (onNotify) {
      onNotify(`CASE #${caseNum} COPIED TO SECURE CLIPBOARD.`, 'copy');
    }
  };

  const handleOpenCase = (c: ArchiveCase) => {
    ambientSound.playStamp();
    setSelectedCase(c);
  };

  return (
    <section id="archive" className="relative py-28 bg-[#090b0e] border-t border-[#1a1d24] film-grain">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 mb-3">
            <span className="h-[1px] w-8 bg-[#c5a059]" />
            <span className="font-mono-vintage text-xs tracking-[0.3em] text-[#c5a059] uppercase">
              SECTION III // RECORD REPOSITORY
            </span>
            <span className="h-[1px] w-8 bg-[#c5a059]" />
          </div>
          <h2 className="font-cinzel text-3xl sm:text-4xl md:text-5xl font-black text-[#ede8dd] tracking-[0.15em] uppercase">
            CASE ARCHIVE
          </h2>
          <p className="font-editorial italic text-lg sm:text-xl text-[#9f9788] mt-3">
            Systematic evidence logs, verified resolutions, and documented platform policy offenses.
          </p>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-[#121419] border border-[#232732] p-4 sm:p-5 mb-10 shadow-[0_10px_30px_rgba(0,0,0,0.7)]">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-[#8c6d32]"
              />
              <input
                id="archive-search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search case #, keyword, target platform, or offense category..."
                className="w-full bg-[#0a0c0e] border border-[#272b35] focus:border-[#c5a059] pl-10 pr-4 py-2.5 text-xs sm:text-sm font-mono-vintage text-[#ede8dd] placeholder-[#5a5448] focus:outline-none transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#7a7469] hover:text-[#ede8dd]"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Status Filter Buttons */}
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <span className="font-mono-vintage text-xs text-[#7a7469] mr-1 hidden sm:inline">
                FILTER:
              </span>
              {(['ALL', 'ACTIVE', 'RESOLVED', 'DOCUMENTED', 'ARCHIVED'] as const).map((st) => (
                <button
                  key={st}
                  id={`filter-btn-${st.toLowerCase()}`}
                  onClick={() => {
                    ambientSound.playClick(1000);
                    setStatusFilter(st);
                  }}
                  className={`px-3 py-1.5 text-xs font-mono-vintage tracking-wider border transition-all duration-200 cursor-pointer ${
                    statusFilter === st
                      ? 'bg-[#c5a059] border-[#c5a059] text-black font-bold shadow-md'
                      : 'bg-[#0a0c0e] border-[#222630] text-[#9c9589] hover:border-[#8c6d32] hover:text-[#ede8dd]'
                  }`}
                >
                  {st} ({counts[st] || 0})
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results Counter & Fast Cinematic Modal Launcher */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6 px-1 font-mono-vintage text-xs text-[#8c8273]">
          <div>
            SHOWING <span className="text-[#c5a059] font-bold">{filteredCases.length}</span> OF{' '}
            <span className="text-[#ede8dd]">{ARCHIVE_CASES.length}</span> CATALOGUED MATTERS
          </div>
          {onOpenCaseFileSequence && (
            <button
              onClick={() => {
                ambientSound.playClick();
                onOpenCaseFileSequence();
              }}
              className="text-[#f2a2a6] hover:text-[#fff] flex items-center gap-1 bg-[#2b0d10] px-3 py-1 border border-[#8c1d1d] hover:border-[#df878b] transition-all cursor-pointer"
            >
              <span>WATCH CASE #R4V-NEW-001 AUDIT SEQUENCE</span>
              <ChevronRight size={13} />
            </button>
          )}
        </div>

        {/* Case Dossiers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCases.map((c, idx) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: Math.min(idx * 0.06, 0.3) }}
              onClick={() => handleOpenCase(c)}
              className="bg-[#121418] border border-[#232732] hover:border-[#c5a059] transition-all duration-300 p-6 flex flex-col justify-between shadow-[0_10px_30px_rgba(0,0,0,0.6)] group relative cursor-pointer"
            >
              {/* Manila Tab Header */}
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-[#1f232c] mb-4">
                  <div className="flex items-center gap-2">
                    <span className="font-mono-vintage text-xs font-bold text-[#c5a059] tracking-wider">
                      {c.caseNumber}
                    </span>
                    <button
                      onClick={(e) => handleCopyCaseNumber(c.caseNumber, e)}
                      title="Copy Case Number"
                      className="text-[#6d665a] hover:text-[#c5a059] p-0.5 transition-colors cursor-pointer"
                    >
                      <Copy size={12} />
                    </button>
                  </div>

                  <span
                    className={`font-mono-vintage text-[10px] tracking-widest px-2.5 py-0.5 border ${
                      c.status === 'RESOLVED'
                        ? 'border-[#2e7d32]/70 bg-[#0f2412] text-[#81c784]'
                        : c.status === 'ACTIVE'
                        ? 'border-[#c62828]/70 bg-[#2d0e11] text-[#f87171] animate-pulse'
                        : c.status === 'DOCUMENTED'
                        ? 'border-[#c5a059]/70 bg-[#241a0b] text-[#e5cb91]'
                        : 'border-[#555] bg-[#1a1a1a] text-[#aaa]'
                    }`}
                  >
                    {c.status}
                  </span>
                </div>

                <h3 className="font-cinzel text-lg sm:text-xl font-bold text-[#ede8dd] group-hover:text-[#e5cb91] transition-colors leading-snug mb-2">
                  {c.title}
                </h3>

                <p className="font-editorial text-sm text-[#aba394] leading-relaxed line-clamp-3 mb-4">
                  {c.description}
                </p>
              </div>

              {/* Footer Meta & Inspect Link */}
              <div className="pt-4 border-t border-[#1f232c] space-y-3">
                <div className="flex items-center justify-between text-xs font-mono-vintage text-[#7a7469]">
                  <span>DATE: {c.date}</span>
                  <span className="text-[#8c6d32]">{c.platform || 'Cross-Platform'}</span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono-vintage text-[10px] text-[#605a4e] uppercase">
                    SEAL: 256-BIT VERIFIED
                  </span>
                  <span className="font-cinzel text-xs font-bold text-[#c5a059] group-hover:translate-x-1 transition-transform flex items-center gap-1 uppercase">
                    <span>INSPECT DOSSIER</span>
                    <ChevronRight size={13} />
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Empty State */}
        {filteredCases.length === 0 && (
          <div className="text-center py-16 bg-[#111317] border border-[#222630] p-8">
            <FileText size={40} className="mx-auto text-[#605a4e] mb-3" />
            <h4 className="font-cinzel text-lg font-bold text-[#ede8dd] uppercase tracking-wider mb-1">
              NO CLASSIFIED RECORDS FOUND
            </h4>
            <p className="font-editorial text-sm text-[#8c8273] max-w-md mx-auto mb-4">
              No matching bureau cases found for query “{searchQuery}” with status “{statusFilter}”.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('ALL');
              }}
              className="px-4 py-2 bg-[#8c6d32] text-black font-cinzel text-xs font-bold uppercase tracking-wider hover:bg-[#c5a059]"
            >
              RESET ARCHIVE FILTERS
            </button>
          </div>
        )}

        {/* Case Details Modal */}
        <AnimatePresence>
          {selectedCase && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md"
              onClick={() => setSelectedCase(null)}
            >
              <motion.div
                initial={{ scale: 0.92, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.92, opacity: 0 }}
                className="bg-[#111317] border-2 border-[#c5a059] max-w-2xl w-full p-6 sm:p-8 relative shadow-[0_25px_70px_rgba(0,0,0,0.95)] max-h-[85vh] overflow-y-auto custom-scrollbar"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Close Button */}
                <button
                  onClick={() => setSelectedCase(null)}
                  className="absolute top-4 right-4 p-1 text-[#8f8779] hover:text-[#ede8dd] border border-[#262a34] hover:border-[#c5a059] cursor-pointer"
                >
                  <X size={18} />
                </button>

                {/* Modal Top Header */}
                <div className="flex items-center gap-2 mb-4">
                  <span className="stamp-sealed text-xs">RECORD SEALED</span>
                  <span className="font-mono-vintage text-xs text-[#8c6d32]">
                    BIRMINGHAM BUREAU // {selectedCase.caseNumber}
                  </span>
                </div>

                <h3 className="font-cinzel text-2xl sm:text-3xl font-black text-[#fff6e5] mb-2 leading-tight">
                  {selectedCase.title}
                </h3>

                <div className="flex flex-wrap items-center gap-4 text-xs font-mono-vintage text-[#9c9589] pb-4 border-b border-[#232732] mb-6">
                  <span>LOGGED: {selectedCase.date}</span>
                  <span>•</span>
                  <span>FILED BY: {selectedCase.filedBy}</span>
                  <span>•</span>
                  <span className="text-[#c5a059]">CATEGORY: {selectedCase.category}</span>
                </div>

                {/* Body Content */}
                <div className="space-y-6">
                  <div>
                    <h4 className="font-mono-vintage text-xs tracking-widest text-[#c5a059] uppercase mb-1">
                      OFFICIAL BUREAU SYNOPSIS
                    </h4>
                    <p className="font-editorial text-base text-[#d5cfc4] leading-relaxed">
                      {selectedCase.description}
                    </p>
                  </div>

                  {selectedCase.evidencePoints && selectedCase.evidencePoints.length > 0 && (
                    <div>
                      <h4 className="font-mono-vintage text-xs tracking-widest text-[#c5a059] uppercase mb-2">
                        DOCUMENTED FORENSIC FINDINGS
                      </h4>
                      <ul className="space-y-2 font-mono-vintage text-xs text-[#cdc5b4] bg-[#0c0e11] p-4 border border-[#222630]">
                        {selectedCase.evidencePoints.map((pt, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-[#4ade80] font-bold">✓</span>
                            <span>{pt}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {selectedCase.findings && (
                    <div>
                      <h4 className="font-mono-vintage text-xs tracking-widest text-[#c5a059] uppercase mb-1">
                        INVESTIGATIVE RESOLUTION & OUTCOME
                      </h4>
                      <div className="p-4 bg-[#0a0c0e] border border-[#222630] font-editorial text-sm sm:text-base text-[#bbb3a4] leading-relaxed">
                        {selectedCase.findings}
                      </div>
                    </div>
                  )}

                  {/* Cryptographic Verification Seal */}
                  <div className="p-4 bg-[#07090b] border border-[#1b1e26] flex items-center justify-between text-xs font-mono-vintage text-[#7a7469]">
                    <div className="space-y-1">
                      <div className="text-[#ede8dd] font-bold">CRYPTOGRAPHIC PROOF HASH</div>
                      <div className="text-[10px] text-[#8c6d32] break-all">
                        SHA256: 7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069
                      </div>
                    </div>
                    <button
                      onClick={(e) => handleCopyCaseNumber(selectedCase.caseNumber, e)}
                      className="px-3 py-1.5 border border-[#8c6d32] text-[#c5a059] hover:bg-[#c5a059] hover:text-black font-bold uppercase tracking-wider transition-colors cursor-pointer shrink-0 ml-3"
                    >
                      COPY REF
                    </button>
                  </div>
                </div>

                {/* Footer Modal CTA */}
                <div className="mt-8 pt-4 border-t border-[#232732] flex items-center justify-end">
                  <button
                    onClick={() => setSelectedCase(null)}
                    className="px-6 py-2.5 bg-[#8c6d32] text-black font-cinzel font-bold text-xs tracking-wider uppercase hover:bg-[#c5a059] cursor-pointer"
                  >
                    CLOSE RECORD
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};
