import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Filter, FileText, CheckCircle2, ShieldAlert, Archive as ArchiveIcon, Clock, X, ChevronRight, Stamp, Play, Film } from 'lucide-react';
import { ARCHIVE_CASES } from '../data/config';
import { ArchiveCase } from '../types';

interface ArchiveSectionProps {
  onOpenCaseFileSequence?: () => void;
}

export const ArchiveSection: React.FC<ArchiveSectionProps> = ({ onOpenCaseFileSequence }) => {
  const [activeFilter, setActiveFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCase, setSelectedCase] = useState<ArchiveCase | null>(null);

  const filters = ['ALL', 'ACTIVE', 'RESOLVED', 'DOCUMENTED', 'ARCHIVED'];

  const filteredCases = useMemo(() => {
    return ARCHIVE_CASES.filter((item) => {
      const matchesFilter = activeFilter === 'ALL' || item.status === activeFilter;
      const matchesSearch =
        item.caseNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [activeFilter, searchQuery]);

  const getStatusColor = (status: ArchiveCase['status']) => {
    switch (status) {
      case 'RESOLVED':
        return 'text-[#4ade80] border-[#166534] bg-[#052e16]/40';
      case 'DOCUMENTED':
        return 'text-[#c5a059] border-[#8c6d32] bg-[#382b14]/40';
      case 'ACTIVE':
        return 'text-[#f87171] border-[#991b1b] bg-[#450a0a]/40';
      case 'ARCHIVED':
        return 'text-[#9ca3af] border-[#374151] bg-[#111827]/40';
      default:
        return 'text-[#e3ded4] border-[#272a30] bg-[#15181c]';
    }
  };

  return (
    <section id="archive" className="relative py-28 bg-[#090b0e] border-t border-[#1a1d24] film-grain">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 mb-3">
            <span className="h-[1px] w-8 bg-[#c5a059]" />
            <span className="font-mono-vintage text-xs tracking-[0.3em] text-[#c5a059] uppercase">
              SECTION III // INCIDENT LOGS
            </span>
            <span className="h-[1px] w-8 bg-[#c5a059]" />
          </div>
          <h2 className="font-cinzel text-3xl sm:text-4xl md:text-5xl font-black text-[#ede8dd] tracking-[0.15em] uppercase">
            R4V ARCHIVE
          </h2>
          <p className="font-editorial italic text-lg sm:text-xl text-[#9f9788] mt-3">
            Classified incident records, verified evidence dossiers, and platform remediation histories.
          </p>
        </div>

        {/* Spotlight Case File Sequence Trigger Banner */}
        {onOpenCaseFileSequence && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12 bg-gradient-to-r from-[#14171e] via-[#1a1215] to-[#14171e] border-2 border-[#5c1c1e] p-6 sm:p-8 relative overflow-hidden shadow-[0_15px_50px_rgba(0,0,0,0.85)]"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#9e2a2b]/10 rounded-full blur-2xl pointer-events-none" />
            
            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-2 max-w-2xl">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="px-2.5 py-0.5 bg-[#9e2a2b]/30 border border-[#9e2a2b] text-[#f2a2a6] font-mono-vintage text-[11px] font-bold tracking-widest uppercase animate-pulse">
                    NEW CASE DETECTED
                  </span>
                  <span className="font-mono-vintage text-xs text-[#c5a059] tracking-wider">
                    CASE ID: R4V-NEW-001
                  </span>
                  <span className="font-mono-vintage text-xs text-[#9a9284]">
                    PRIORITY: 2X
                  </span>
                </div>
                <h3 className="font-cinzel text-xl sm:text-2xl font-bold text-[#ede8dd] tracking-wide">
                  CASE FILE: R4V-NEW-001 // SUBJECT PENDING AUDIT
                </h3>
                <p className="font-editorial text-sm sm:text-base text-[#cdc5b4] leading-relaxed">
                  Experience the full 1920s cinematic motion-graphic sequence: typewriter audio, projector flicker, 5-tier evidence pipeline (<span className="text-[#e5cb91]">SOURCE → CONTENT → CONTEXT → PLATFORM RULE → REVIEW</span>), and tri-state resolution adjudications.
                </p>
              </div>

              <button
                onClick={onOpenCaseFileSequence}
                className="shrink-0 px-6 py-3.5 bg-gradient-to-r from-[#8c1d1d] via-[#a82525] to-[#c53232] hover:brightness-110 text-[#fff6e5] font-cinzel font-bold text-xs sm:text-sm tracking-[0.2em] uppercase transition-all duration-300 shadow-[0_4px_25px_rgba(168,37,37,0.4)] flex items-center gap-2.5 group cursor-pointer"
              >
                <Play size={16} className="text-[#fff6e5] group-hover:scale-110 transition-transform" />
                <span>PLAY CINEMATIC SEQUENCE</span>
              </button>
            </div>
          </motion.div>
        )}

        {/* Search & Filter Toolbar */}
        <div className="bg-[#121418] border border-[#232730] p-4 sm:p-5 mb-10 shadow-lg flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
            <div className="flex items-center gap-1.5 mr-2 text-[#8c6d32] font-mono-vintage text-xs">
              <Filter size={13} />
              <span>CLASSIFICATION:</span>
            </div>
            {filters.map((filter) => (
              <button
                key={filter}
                id={`archive-filter-${filter.toLowerCase()}`}
                onClick={() => setActiveFilter(filter)}
                className={`px-3 py-1.5 text-xs font-mono-vintage tracking-wider transition-all duration-200 uppercase cursor-pointer ${
                  activeFilter === filter
                    ? 'bg-[#c5a059] text-black font-bold shadow-[0_0_10px_rgba(197,160,89,0.3)]'
                    : 'bg-[#181b21] text-[#9c9589] hover:text-[#e3ded4] hover:bg-[#20242b] border border-[#272b34]'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-72">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7a7469]" />
            <input
              type="text"
              id="archive-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="SEARCH BY CASE # OR KEYWORD..."
              className="w-full pl-9 pr-4 py-1.5 bg-[#0b0d10] border border-[#272b34] focus:border-[#c5a059] text-xs font-mono-vintage text-[#ede8dd] placeholder-[#5c564c] focus:outline-none transition-colors"
            />
          </div>
        </div>

        {/* Archive Cases Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCases.map((caseItem, idx) => (
            <motion.div
              key={caseItem.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="bg-[#121418] border border-[#252932] hover:border-[#c5a059]/70 transition-all duration-300 p-6 flex flex-col justify-between shadow-[0_10px_30px_rgba(0,0,0,0.5)] group relative"
            >
              {/* Top Manila Dossier Tab Indicator */}
              <div className="flex items-center justify-between pb-4 border-b border-[#20242c] mb-4">
                <div className="flex items-center gap-2">
                  <FileText size={15} className="text-[#c5a059]" />
                  <span className="font-cinzel text-base font-black tracking-widest text-[#fff6e5]">
                    {caseItem.caseNumber}
                  </span>
                </div>

                {/* Status Badge */}
                <span
                  className={`text-[10px] font-mono-vintage font-bold tracking-widest px-2 py-0.5 border uppercase ${getStatusColor(
                    caseItem.status
                  )}`}
                >
                  {caseItem.status}
                </span>
              </div>

              {/* Case Content */}
              <div className="space-y-3 flex-1">
                <div className="flex items-center justify-between text-xs font-mono-vintage text-[#8c6d32]">
                  <span>DATE: {caseItem.date}</span>
                  <span className="text-[#9c9589]">EVIDENCE: <strong className="text-[#c5a059]">{caseItem.evidence}</strong></span>
                </div>

                <h3 className="font-cinzel text-lg font-bold text-[#ede8dd] group-hover:text-[#c5a059] transition-colors leading-snug">
                  {caseItem.title}
                </h3>

                <span className="inline-block font-mono-vintage text-[11px] text-[#7a7469] bg-[#181b21] px-2 py-0.5 border border-[#20242b]">
                  {caseItem.category}
                </span>

                <p className="font-editorial text-sm text-[#aba394] line-clamp-3 leading-relaxed">
                  {caseItem.description}
                </p>
              </div>

              {/* Card Footer Actions */}
              <div className="mt-6 pt-4 border-t border-[#20242c] flex items-center justify-between">
                <span className="font-mono-vintage text-[10px] text-[#696357]">
                  FILED BY: {caseItem.filedBy.toUpperCase()}
                </span>

                <button
                  id={`view-dossier-btn-${caseItem.id}`}
                  onClick={() => setSelectedCase(caseItem)}
                  className="px-3.5 py-1.5 bg-[#1a1e26] hover:bg-[#c5a059] text-[#e3ded4] hover:text-black font-cinzel text-xs font-bold tracking-wider uppercase border border-[#2d3340] hover:border-[#c5a059] transition-all duration-200 flex items-center gap-1 cursor-pointer"
                >
                  <span>VIEW DOSSIER</span>
                  <ChevronRight size={13} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Empty State */}
        {filteredCases.length === 0 && (
          <div className="text-center py-20 bg-[#121418] border border-[#232730]">
            <FileText size={36} className="text-[#7a7469] mx-auto mb-3 opacity-50" />
            <h4 className="font-cinzel text-lg text-[#ede8dd] tracking-widest">
              NO CLASSIFIED RECORDS MATCH QUERY
            </h4>
            <p className="font-editorial text-sm text-[#8c8375] mt-1">
              Adjust your search keywords or clear classification filters.
            </p>
          </div>
        )}

        {/* Detailed Case Dossier Modal */}
        <AnimatePresence>
          {selectedCase && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md"
              onClick={() => setSelectedCase(null)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ duration: 0.3 }}
                className="bg-[#12151a] border-2 border-[#c5a059] max-w-2xl w-full p-6 sm:p-8 relative shadow-[0_25px_70px_rgba(0,0,0,0.9)] max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Close Button */}
                <button
                  id="close-file-modal-btn"
                  onClick={() => setSelectedCase(null)}
                  className="absolute top-5 right-5 p-1.5 text-[#9c9589] hover:text-[#fff6e5] border border-[#2c313c] hover:border-[#c5a059] transition-colors"
                  title="CLOSE FILE"
                >
                  <X size={18} />
                </button>

                {/* Dossier Header */}
                <div className="pb-5 border-b border-[#252a34] mb-6">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="stamp-classified text-xs">INTERNAL ARCHIVE</span>
                    <span
                      className={`text-xs font-mono-vintage font-bold tracking-widest px-2.5 py-0.5 border ${getStatusColor(
                        selectedCase.status
                      )}`}
                    >
                      {selectedCase.status}
                    </span>
                  </div>

                  <div className="flex items-baseline justify-between mt-3">
                    <h3 className="font-cinzel text-2xl sm:text-3xl font-black text-[#fff6e5] tracking-wide">
                      {selectedCase.caseNumber}: {selectedCase.title}
                    </h3>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs font-mono-vintage text-[#8c6d32] mt-2">
                    <span>DATE INDEXED: {selectedCase.date}</span>
                    <span>PLATFORM: {selectedCase.platform}</span>
                    <span>EVIDENCE STATE: <strong className="text-[#c5a059]">{selectedCase.evidence}</strong></span>
                  </div>
                </div>

                {/* Detailed Sections */}
                <div className="space-y-6 font-editorial text-sm sm:text-base text-[#d1cbc0]">
                  <div>
                    <span className="font-mono-vintage text-xs tracking-widest text-[#8c6d32] uppercase block mb-1">
                      INCIDENT OVERVIEW
                    </span>
                    <p className="leading-relaxed bg-[#0b0d10] p-4 border border-[#1e2229]">
                      {selectedCase.description}
                    </p>
                  </div>

                  <div>
                    <span className="font-mono-vintage text-xs tracking-widest text-[#8c6d32] uppercase block mb-2">
                      CORROBORATED EVIDENCE LEDGER
                    </span>
                    <ul className="space-y-2 bg-[#0b0d10] p-4 border border-[#1e2229]">
                      {selectedCase.evidencePoints.map((pt, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-xs sm:text-sm font-mono-vintage text-[#cdc5b4]">
                          <span className="text-[#c5a059] font-bold">[{i + 1}]</span>
                          <span>{pt}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <span className="font-mono-vintage text-xs tracking-widest text-[#8c6d32] uppercase block mb-1">
                      AUDIT FINDINGS & REMEDIATION
                    </span>
                    <p className="leading-relaxed bg-[#181a20] p-4 border-l-2 border-[#c5a059] text-[#e3ded4] italic">
                      “{selectedCase.findings}”
                    </p>
                  </div>
                </div>

                {/* Dossier Footer Actions */}
                <div className="mt-8 pt-5 border-t border-[#252a34] flex flex-col sm:flex-row items-center justify-between gap-4">
                  <span className="font-mono-vintage text-xs text-[#7a7469]">
                    CERTIFIED BY: {selectedCase.filedBy.toUpperCase()}
                  </span>

                  <button
                    onClick={() => setSelectedCase(null)}
                    className="w-full sm:w-auto px-6 py-2.5 bg-[#8c6d32] hover:bg-[#c5a059] text-black font-cinzel font-bold text-xs tracking-[0.2em] uppercase transition-colors"
                  >
                    CLOSE FILE
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
