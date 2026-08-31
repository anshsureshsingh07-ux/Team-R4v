import React, { useState, useEffect, useMemo } from 'react';
import { 
  ShieldCheck, 
  Download, 
  Copy, 
  Check, 
  FileText, 
  Search, 
  ExternalLink, 
  RefreshCw, 
  Flame, 
  Sparkles, 
  Lock, 
  Unlock, 
  Clock, 
  Activity, 
  Layers, 
  CheckCircle2, 
  Printer, 
  Terminal,
  Zap,
  Crown
} from 'lucide-react';
import { OperationalMethod, MethodCategory } from '../types';
import { INITIAL_OPERATIONAL_METHODS, SITE_INFO } from '../data/config';
import { safeFetchJson } from '../utils/api';
import { ambientSound } from '../utils/ambientAudio';

interface MethodsSectionProps {
  onNotify?: (message: string, type?: 'info' | 'success' | 'alert' | 'copy') => void;
}

export const MethodsSection: React.FC<MethodsSectionProps> = ({ onNotify }) => {
  const [methods, setMethods] = useState<OperationalMethod[]>(INITIAL_OPERATIONAL_METHODS);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('ALL');
  const [activeModalMethod, setActiveModalMethod] = useState<OperationalMethod | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  // Fetch live methods from backend with fallback
  const fetchMethods = async () => {
    setLoading(true);
    try {
      const res = await safeFetchJson<{ methods: OperationalMethod[]; totalCount: number }>('/api/methods');
      if (res.ok && res.data && Array.isArray(res.data.methods) && res.data.methods.length > 0) {
        setMethods(res.data.methods);
      } else {
        // Fallback to local storage or config
        const local = localStorage.getItem('r4v_local_methods');
        if (local) {
          try {
            const parsed = JSON.parse(local);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setMethods(parsed);
              return;
            }
          } catch {
            // Ignore
          }
        }
        setMethods(INITIAL_OPERATIONAL_METHODS);
      }
    } catch {
      setMethods(INITIAL_OPERATIONAL_METHODS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMethods();
  }, []);

  // Filter methods
  const filteredMethods = useMemo(() => {
    return methods.filter((m) => {
      // Must be active for public view
      if (m.status === 'ARCHIVED') return false;

      // Category match
      if (selectedCategory !== 'ALL' && m.category !== selectedCategory) {
        return false;
      }

      // Platform match
      if (selectedPlatform !== 'ALL') {
        if (!m.platform || !m.platform.toLowerCase().includes(selectedPlatform.toLowerCase())) {
          return false;
        }
      }

      // Search query match
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesCode = m.code.toLowerCase().includes(q);
        const matchesTitle = m.title.toLowerCase().includes(q);
        const matchesSummary = m.summary.toLowerCase().includes(q);
        const matchesContent = m.content.toLowerCase().includes(q);
        const matchesPlatform = m.platform && m.platform.toLowerCase().includes(q);
        const matchesTags = m.tags && m.tags.some((t) => t.toLowerCase().includes(q));

        return matchesCode || matchesTitle || matchesSummary || matchesContent || matchesPlatform || matchesTags;
      }

      return true;
    });
  }, [methods, selectedCategory, selectedPlatform, searchQuery]);

  // Download single method card
  const handleDownloadCard = async (method: OperationalMethod) => {
    ambientSound.playTypewriterKey();
    setDownloadingId(method.id);

    try {
      // Trigger API download recording if endpoint is reachable
      const res = await safeFetchJson<{ dossierText: string; filename: string; downloadsCount: number }>(
        `/api/methods/${method.id}/download`,
        { method: 'POST' }
      );

      let textContent = '';
      let filename = `R4V-METHOD-${method.code}-DOSSIER.txt`;

      if (res.ok && res.data?.dossierText) {
        textContent = res.data.dossierText;
        if (res.data.filename) filename = res.data.filename;
        // Update local count
        setMethods((prev) =>
          prev.map((m) => (m.id === method.id ? { ...m, downloadsCount: res.data!.downloadsCount } : m))
        );
      } else {
        // Generate formatted text locally
        textContent = `================================================================================
TEAM R4V // OPERATIONAL METHOD CARD & DISPATCH PROTOCOL
KING OF BANNING // THE UNCONTESTED AUTHORITY IN BANNING COM
================================================================================

METHOD IDENTIFIER : [${method.code}] ${method.title}
INTERNAL CODE     : ${method.id}
CATEGORY          : ${method.category}
CLEARANCE LEVEL   : ${method.clearanceLevel}
TARGET PLATFORM   : ${method.platform || 'Cross-Platform Hub'}
EST. SUCCESS RATE : ${method.successRate || '99.2%'}
EXECUTION TIME    : ${method.executionTime || '15-45 Minutes'}
DATE CODIFIED     : ${method.createdAt}
LAST VERIFIED     : ${method.updatedAt}

--------------------------------------------------------------------------------
EXECUTIVE SUMMARY
--------------------------------------------------------------------------------
${method.summary}

--------------------------------------------------------------------------------
STEP-BY-STEP OPERATIONAL PROTOCOL
--------------------------------------------------------------------------------
${method.content}

--------------------------------------------------------------------------------
MANDATORY PREREQUISITES & CHAIN-OF-CUSTODY CRITERIA
--------------------------------------------------------------------------------
${(method.requirements || []).map((r, i) => `${i + 1}. ${r}`).join('\n') || 'None required'}

--------------------------------------------------------------------------------
STANDARDIZED REPORTING PAYLOAD TEMPLATE
--------------------------------------------------------------------------------
${method.payloadTemplate || `[TEAM R4V OFFICIAL DISPATCH]\nTARGET: [ENTER_TARGET]\nVIOLATION: [TERMS_CLAUSE]\nEVIDENCE: [VERIFIED_PERMA_LINK]\nACTION: Escalation for permanent platform remediation.`}

--------------------------------------------------------------------------------
TAGS / CLASSIFICATION
--------------------------------------------------------------------------------
${(method.tags || []).join(' | ')}
AUTHOR: ${method.author}
BUREAU SEAL: [VERIFIED // TEAM R4V EXECUTIVE DESK]
================================================================================`;

        // Update local download count
        setMethods((prev) =>
          prev.map((m) => (m.id === method.id ? { ...m, downloadsCount: (m.downloadsCount || 0) + 1 } : m))
        );
      }

      // Trigger file download in browser
      const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      if (onNotify) {
        onNotify(`Downloaded Method Card: [${method.code}] ${method.title}`, 'success');
      }
    } catch (err) {
      if (onNotify) {
        onNotify('Failed to initiate method card download.', 'alert');
      }
    } finally {
      setTimeout(() => setDownloadingId(null), 600);
    }
  };

  // Download all methods bundle
  const handleDownloadAllBundle = () => {
    ambientSound.playTypewriterKey();
    
    let bundleText = `================================================================================
TEAM R4V // COMPLETE OPERATIONAL METHODS ARCHIVE COMPENDIUM
KING OF BANNING // THE UNCONTESTED AUTHORITY IN BANNING COM
================================================================================
OFFICIAL DIRECTORY: ${methods.length} VERIFIED OPERATIONAL PROTOCOLS
TIMESTAMP: ${new Date().toUTCString()}
ORGANIZATION: TEAM R4V // BIRMINGHAM BUREAU
TAGLINE: "No Noise. No Mercy. Only Results."

${methods.map((method, idx) => `
--------------------------------------------------------------------------------
[#${idx + 1}] METHOD CODE: ${method.code} — ${method.title}
--------------------------------------------------------------------------------
CATEGORY       : ${method.category}
CLEARANCE      : ${method.clearanceLevel}
PLATFORM       : ${method.platform || 'Cross-Platform'}
SUCCESS RATE   : ${method.successRate || '99.0%'}
EXECUTION TIME : ${method.executionTime || 'Standard'}

SUMMARY:
${method.summary}

PROTOCOL STEPS:
${method.content}

REQUIREMENTS:
${(method.requirements || []).map((r) => `  - ${r}`).join('\n') || '  - Standard evidence acquisition'}

DISPATCH TEMPLATE:
${method.payloadTemplate || 'Standard Trust & Safety filing format.'}
`).join('\n\n')}

================================================================================
END OF ARCHIVE COMPENDIUM // TEAM R4V EXECUTIVE SEAL
================================================================================`;

    const blob = new Blob([bundleText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `TEAM-R4V-ALL-METHODS-ARCHIVE-COMPENDIUM.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    if (onNotify) {
      onNotify(`Exported complete ${methods.length}-method operational bundle!`, 'success');
    }
  };

  // Copy payload template to clipboard
  const handleCopyPayload = (method: OperationalMethod) => {
    ambientSound.playClick();
    const textToCopy = method.payloadTemplate || method.content;
    navigator.clipboard.writeText(textToCopy);
    setCopiedId(method.id);
    setTimeout(() => setCopiedId(null), 2500);

    if (onNotify) {
      onNotify(`Copied Dispatch Template for [${method.code}] to clipboard!`, 'copy');
    }
  };

  const categories = [
    { label: 'ALL CATEGORIES', value: 'ALL' },
    { label: 'POLICY ENFORCEMENT', value: 'POLICY_ENFORCEMENT' },
    { label: 'INVESTIGATION', value: 'INVESTIGATION' },
    { label: 'OSINT & NETWORK GRAPH', value: 'OSINT_VERIFICATION' },
    { label: 'EVIDENCE AUDIT', value: 'EVIDENCE_AUDIT' },
    { label: 'CASE MANAGEMENT', value: 'CASE_MANAGEMENT' },
  ];

  const platforms = [
    { label: 'ALL PLATFORMS', value: 'ALL' },
    { label: 'Instagram / Meta', value: 'Instagram' },
    { label: 'Telegram Messenger', value: 'Telegram' },
    { label: 'Cross-Platform', value: 'Cross-Platform' },
    { label: 'DMCA / Copyright', value: 'DMCA' },
  ];

  return (
    <section
      id="methods"
      className="relative py-24 sm:py-32 bg-[#090b0e] border-t border-[#c5a059]/25 overflow-hidden"
    >
      {/* Subtle Background Watermark & Grid */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] flex items-center justify-center select-none overflow-hidden">
        <span className="font-cinzel text-[18vw] font-black tracking-widest text-[#c5a059] uppercase whitespace-nowrap transform -rotate-12">
          KING OF BANNING
        </span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Top Header & Power Banner */}
        <div className="flex flex-col items-center text-center mb-16">
          {/* King of Banning Metallic Crown Badge */}
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-[#1b1710] border border-[#c5a059]/60 shadow-[0_0_25px_rgba(197,160,89,0.25)] mb-4">
            <Crown className="w-4 h-4 text-[#e5cb91] animate-pulse" />
            <span className="font-cinzel text-xs sm:text-sm font-bold tracking-[0.25em] text-[#e5cb91] uppercase">
              KING OF BANNING // MOST POWERFUL IN COM
            </span>
            <Sparkles className="w-3.5 h-3.5 text-[#c5a059]" />
          </div>

          <h2 className="font-cinzel text-3xl sm:text-4xl md:text-5xl font-bold tracking-[0.12em] text-[#f5efe6] uppercase mb-4">
            OPERATIONAL METHODS & DISPATCH PROTOCOLS
          </h2>

          <div className="w-32 h-[2px] bg-gradient-to-r from-transparent via-[#c5a059] to-transparent mb-5" />

          <p className="max-w-3xl text-sm sm:text-base text-[#a9a193] font-editorial italic leading-relaxed">
            The definitive public repository of standardized digital forensic procedures, cross-platform policy citations, 
            and verified incident neutralization workflows. Engineered for uncompromising accuracy and absolute compliance.
          </p>

          {/* Quick Actions & Metrics Bar */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-xs font-mono-vintage">
            <span className="px-3 py-1 bg-[#14171d] border border-[#c5a059]/30 text-[#e5cb91] rounded-xs flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-[#22c55e]" />
              {methods.length} VERIFIED PROTOCOLS ACTIVE
            </span>
            <span className="px-3 py-1 bg-[#14171d] border border-[#c5a059]/30 text-[#e5cb91] rounded-xs flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-[#eab308]" />
              INSTANT DOWNLOAD & SCRIPT EXPORT
            </span>
            <button
              onClick={handleDownloadAllBundle}
              id="btn-download-all-methods"
              className="px-4 py-1.5 bg-[#8b1a1a] hover:bg-[#a62424] text-[#fff5ea] font-cinzel font-bold tracking-wider rounded-xs border border-[#e5cb91]/40 shadow-[0_0_15px_rgba(139,26,26,0.5)] transition-all flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <Download className="w-3.5 h-3.5 text-[#e5cb91]" />
              DOWNLOAD ALL METHODS ARCHIVE
            </button>
          </div>
        </div>

        {/* Search and Filters Bar */}
        <div className="bg-[#11141a]/95 border border-[#c5a059]/30 p-4 sm:p-6 mb-10 shadow-[0_10px_30px_rgba(0,0,0,0.6)]">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            {/* Search Input */}
            <div className="md:col-span-6 relative">
              <Search className="w-4 h-4 text-[#c5a059] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search methods by code (e.g. MTH-01), keyword, tag, or platform..."
                id="input-search-methods"
                className="w-full bg-[#090b0e] border border-[#c5a059]/40 focus:border-[#e5cb91] pl-10 pr-4 py-2.5 text-sm text-[#e3ded4] placeholder-[#736c60] font-mono-vintage focus:outline-none transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#a9a193] hover:text-white"
                >
                  CLEAR
                </button>
              )}
            </div>

            {/* Platform Quick Filter */}
            <div className="md:col-span-3">
              <select
                value={selectedPlatform}
                onChange={(e) => setSelectedPlatform(e.target.value)}
                id="select-platform-filter"
                className="w-full bg-[#090b0e] border border-[#c5a059]/40 focus:border-[#e5cb91] px-3 py-2.5 text-xs text-[#e3ded4] font-mono-vintage focus:outline-none uppercase"
              >
                {platforms.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Refresh / Sync Button */}
            <div className="md:col-span-3 flex justify-end">
              <button
                onClick={fetchMethods}
                disabled={loading}
                id="btn-sync-methods"
                className="w-full sm:w-auto px-4 py-2.5 bg-[#171b22] hover:bg-[#20252e] border border-[#c5a059]/40 text-[#c5a059] hover:text-[#e5cb91] font-mono-vintage text-xs tracking-wider uppercase transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                {loading ? 'SYNCING...' : 'SYNC REPOSITORY'}
              </button>
            </div>
          </div>

          {/* Category Filter Chips */}
          <div className="flex flex-wrap gap-1.5 mt-4 pt-4 border-t border-[#1f242d]">
            {categories.map((cat) => {
              const active = selectedCategory === cat.value;
              return (
                <button
                  key={cat.value}
                  onClick={() => setSelectedCategory(cat.value)}
                  id={`btn-category-${cat.value.toLowerCase()}`}
                  className={`px-3 py-1 text-[11px] font-cinzel tracking-wider uppercase transition-all cursor-pointer ${
                    active
                      ? 'bg-[#c5a059] text-[#090b0e] font-bold shadow-[0_0_10px_rgba(197,160,89,0.4)]'
                      : 'bg-[#14171e] text-[#9c9589] hover:text-[#e3ded4] hover:bg-[#1a1f29] border border-[#262c38]'
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Results Counter */}
        <div className="flex items-center justify-between text-xs font-mono-vintage text-[#8c8273] mb-6 px-1">
          <span>SHOWING {filteredMethods.length} OF {methods.length} VERIFIED PROTOCOLS</span>
          {(searchQuery || selectedCategory !== 'ALL' || selectedPlatform !== 'ALL') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('ALL');
                setSelectedPlatform('ALL');
              }}
              className="text-[#c5a059] hover:underline"
            >
              RESET ALL FILTERS
            </button>
          )}
        </div>

        {/* Methods Grid */}
        {filteredMethods.length === 0 ? (
          <div className="bg-[#12151c] border border-dashed border-[#c5a059]/30 p-12 text-center my-8">
            <FileText className="w-12 h-12 text-[#736c60] mx-auto mb-3 opacity-60" />
            <h4 className="font-cinzel text-lg text-[#e3ded4] uppercase mb-2">No Matching Protocols Found</h4>
            <p className="text-xs text-[#9c9589] max-w-md mx-auto mb-4">
              No operational methods matched your active filter criteria. Try clearing search keywords or selecting all categories.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('ALL');
                setSelectedPlatform('ALL');
              }}
              className="px-4 py-2 bg-[#c5a059] text-[#090b0e] font-cinzel font-bold text-xs tracking-wider uppercase hover:bg-[#e5cb91]"
            >
              SHOW ALL METHODS
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMethods.map((method) => {
              const isDownloading = downloadingId === method.id;
              const isCopied = copiedId === method.id;

              return (
                <div
                  key={method.id}
                  id={`method-card-${method.code.toLowerCase()}`}
                  className="group bg-[#101319] border border-[#c5a059]/30 hover:border-[#c5a059] transition-all duration-300 flex flex-col justify-between relative shadow-[0_8px_25px_rgba(0,0,0,0.5)] hover:shadow-[0_12px_35px_rgba(197,160,89,0.15)] overflow-hidden"
                >
                  {/* Top Red Clearance / King of Banning Ribbon */}
                  <div className="absolute top-0 right-0 px-3 py-1 bg-[#8b1a1a] text-[#fff5ea] font-cinzel text-[10px] font-bold tracking-widest uppercase border-b border-l border-[#c5a059]/40 shadow-xs">
                    {method.clearanceLevel}
                  </div>

                  <div className="p-5 sm:p-6">
                    {/* Header: Code & Platform */}
                    <div className="flex items-center gap-2 mb-3">
                      <span className="px-2.5 py-0.5 bg-[#1a1f29] border border-[#c5a059]/50 text-[#e5cb91] font-mono-vintage text-xs font-bold tracking-wider">
                        {method.code}
                      </span>
                      <span className="text-[11px] font-mono-vintage text-[#9c9589] uppercase tracking-wide truncate max-w-[150px]">
                        {method.platform || 'Cross-Platform'}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="font-cinzel text-base sm:text-lg font-bold text-[#f5efe6] group-hover:text-[#e5cb91] transition-colors leading-snug mb-3">
                      {method.title}
                    </h3>

                    {/* Operational Metrics Pill */}
                    <div className="grid grid-cols-3 gap-1.5 py-2 px-2.5 bg-[#090b0f] border border-[#1e232d] mb-4 text-[10px] font-mono-vintage">
                      <div className="text-center border-r border-[#1e232d] pr-1">
                        <span className="text-[#736c60] block text-[9px]">SUCCESS</span>
                        <span className="text-[#22c55e] font-bold">{method.successRate || '99.2%'}</span>
                      </div>
                      <div className="text-center border-r border-[#1e232d] pr-1">
                        <span className="text-[#736c60] block text-[9px]">TIMEFRAME</span>
                        <span className="text-[#e5cb91] font-bold truncate block">{method.executionTime || '15-45M'}</span>
                      </div>
                      <div className="text-center">
                        <span className="text-[#736c60] block text-[9px]">DOWNLOADS</span>
                        <span className="text-[#93c5fd] font-bold">{(method.downloadsCount || 850).toLocaleString()}</span>
                      </div>
                    </div>

                    {/* Summary */}
                    <p className="text-xs text-[#a9a193] font-editorial line-clamp-3 leading-relaxed mb-4">
                      {method.summary}
                    </p>

                    {/* Requirements Tags */}
                    {method.requirements && method.requirements.length > 0 && (
                      <div className="mb-4">
                        <span className="text-[9px] font-mono-vintage tracking-wider text-[#736c60] uppercase block mb-1.5">
                          KEY PREREQUISITES:
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {method.requirements.slice(0, 2).map((req, idx) => (
                            <span
                              key={idx}
                              className="text-[10px] bg-[#141820] text-[#c2bba8] px-2 py-0.5 border border-[#232a36] truncate max-w-full font-mono-vintage"
                            >
                              • {req}
                            </span>
                          ))}
                          {method.requirements.length > 2 && (
                            <span className="text-[9px] text-[#8c8273] self-center">
                              +{method.requirements.length - 2} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Card Action Buttons */}
                  <div className="p-4 bg-[#0c0e13] border-t border-[#1c212b] flex flex-col gap-2">
                    {/* Primary Button: Download Method Card */}
                    <button
                      onClick={() => handleDownloadCard(method)}
                      disabled={isDownloading}
                      id={`btn-download-${method.code.toLowerCase()}`}
                      className="w-full py-2.5 px-3 bg-[#c5a059] hover:bg-[#e5cb91] text-[#090b0e] font-cinzel font-bold text-xs tracking-wider uppercase transition-all shadow-[0_2px_10px_rgba(197,160,89,0.3)] flex items-center justify-center gap-2 cursor-pointer active:scale-98 disabled:opacity-50"
                    >
                      <Download className={`w-3.5 h-3.5 ${isDownloading ? 'animate-bounce' : ''}`} />
                      {isDownloading ? 'GENERATING DOSSIER...' : 'DOWNLOAD METHOD CARD'}
                    </button>

                    {/* Secondary Actions: View Details & Copy Script */}
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => {
                          ambientSound.playClick();
                          setActiveModalMethod(method);
                        }}
                        id={`btn-view-dossier-${method.code.toLowerCase()}`}
                        className="py-1.5 px-2 bg-[#171b24] hover:bg-[#222834] text-[#e3ded4] border border-[#2a3240] font-cinzel text-[11px] tracking-wide uppercase transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <FileText className="w-3 h-3 text-[#c5a059]" />
                        FULL DOSSIER
                      </button>

                      <button
                        onClick={() => handleCopyPayload(method)}
                        id={`btn-copy-template-${method.code.toLowerCase()}`}
                        className="py-1.5 px-2 bg-[#171b24] hover:bg-[#222834] text-[#e3ded4] border border-[#2a3240] font-cinzel text-[11px] tracking-wide uppercase transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        {isCopied ? (
                          <>
                            <Check className="w-3 h-3 text-[#22c55e]" />
                            <span className="text-[#22c55e]">COPIED</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3 text-[#c5a059]" />
                            COPY SCRIPT
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Full Method Dossier Modal */}
      {activeModalMethod && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto"
          onClick={() => setActiveModalMethod(null)}
        >
          <div
            className="bg-[#0e1117] border-2 border-[#c5a059] max-w-3xl w-full p-6 sm:p-8 relative shadow-[0_20px_60px_rgba(0,0,0,0.9)] max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
            id="modal-method-dossier"
          >
            {/* Bureau Red Stamp Watermark */}
            <div className="absolute top-6 right-8 border-2 border-[#8b1a1a] text-[#8b1a1a] px-3 py-1 font-cinzel text-xs font-bold tracking-widest uppercase transform rotate-6 pointer-events-none opacity-80">
              KING OF BANNING // VERIFIED
            </div>

            {/* Modal Header */}
            <div className="border-b border-[#c5a059]/40 pb-4 mb-6">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2.5 py-0.5 bg-[#c5a059] text-[#090b0e] font-mono-vintage text-xs font-bold">
                  {activeModalMethod.code}
                </span>
                <span className="px-2 py-0.5 bg-[#1f2530] text-[#e5cb91] font-mono-vintage text-xs">
                  {activeModalMethod.category}
                </span>
                <span className="px-2 py-0.5 bg-[#8b1a1a] text-[#fff5ea] font-mono-vintage text-xs font-bold">
                  {activeModalMethod.clearanceLevel}
                </span>
              </div>
              <h2 className="font-cinzel text-xl sm:text-2xl font-bold text-[#f5efe6] uppercase">
                {activeModalMethod.title}
              </h2>
              <p className="text-xs text-[#9c9589] font-mono-vintage mt-1">
                PLATFORM: {activeModalMethod.platform || 'Cross-Platform'} // SUCCESS RATE: {activeModalMethod.successRate || '99.2%'} // AUTHOR: {activeModalMethod.author}
              </p>
            </div>

            {/* Summary */}
            <div className="mb-6 bg-[#131720] border-l-2 border-[#c5a059] p-4">
              <h4 className="font-cinzel text-xs font-bold tracking-wider text-[#c5a059] uppercase mb-1">
                EXECUTIVE SUMMARY
              </h4>
              <p className="text-xs text-[#e3ded4] font-editorial leading-relaxed">
                {activeModalMethod.summary}
              </p>
            </div>

            {/* Step-by-Step Protocol */}
            <div className="mb-6">
              <h4 className="font-cinzel text-xs font-bold tracking-wider text-[#c5a059] uppercase mb-2">
                OPERATIONAL EXECUTION STEPS
              </h4>
              <div className="bg-[#080a0d] border border-[#232936] p-4 text-xs font-mono-vintage text-[#d5cfc4] whitespace-pre-line leading-relaxed">
                {activeModalMethod.content}
              </div>
            </div>

            {/* Prerequisites */}
            {activeModalMethod.requirements && activeModalMethod.requirements.length > 0 && (
              <div className="mb-6">
                <h4 className="font-cinzel text-xs font-bold tracking-wider text-[#c5a059] uppercase mb-2">
                  MANDATORY PREREQUISITES & CHAIN-OF-CUSTODY CRITERIA
                </h4>
                <ul className="space-y-1 text-xs text-[#b8b0a0] font-editorial bg-[#11141b] p-3 border border-[#202633]">
                  {activeModalMethod.requirements.map((req, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#22c55e] shrink-0 mt-0.5" />
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Standard Reporting Payload Template */}
            {activeModalMethod.payloadTemplate && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-cinzel text-xs font-bold tracking-wider text-[#c5a059] uppercase">
                    STANDARDIZED REPORTING PAYLOAD TEMPLATE
                  </h4>
                  <button
                    onClick={() => handleCopyPayload(activeModalMethod)}
                    className="text-xs text-[#e5cb91] hover:underline flex items-center gap-1 font-mono-vintage"
                  >
                    <Copy className="w-3 h-3" />
                    {copiedId === activeModalMethod.id ? 'COPIED TO CLIPBOARD' : 'COPY SCRIPT'}
                  </button>
                </div>
                <div className="bg-[#050608] border border-[#8b1a1a]/50 p-3 text-xs font-mono-vintage text-[#22c55e] whitespace-pre-line overflow-x-auto">
                  {activeModalMethod.payloadTemplate}
                </div>
              </div>
            )}

            {/* Modal Footer Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-[#c5a059]/30">
              <button
                onClick={() => setActiveModalMethod(null)}
                className="px-4 py-2 bg-[#171b22] text-[#a9a193] hover:text-white font-cinzel text-xs tracking-wider uppercase border border-[#262c38]"
              >
                CLOSE DOSSIER
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopyPayload(activeModalMethod)}
                  className="px-4 py-2 bg-[#1c222e] hover:bg-[#283142] text-[#e3ded4] font-cinzel font-bold text-xs tracking-wider uppercase border border-[#c5a059]/40 flex items-center gap-2"
                >
                  <Copy className="w-3.5 h-3.5 text-[#c5a059]" />
                  COPY DISPATCH SCRIPT
                </button>

                <button
                  onClick={() => {
                    handleDownloadCard(activeModalMethod);
                  }}
                  className="px-5 py-2 bg-[#c5a059] hover:bg-[#e5cb91] text-[#090b0e] font-cinzel font-bold text-xs tracking-wider uppercase shadow-[0_0_15px_rgba(197,160,89,0.3)] flex items-center gap-2"
                >
                  <Download className="w-3.5 h-3.5 text-[#090b0e]" />
                  DOWNLOAD CARD FILE
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
