import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Shield,
  Search,
  FileCheck,
  AlertTriangle,
  CheckCircle2,
  FileText,
  Upload,
  Sparkles,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  ExternalLink,
  Lock,
  Printer,
  Save,
  UserCheck,
  Plus,
  Trash2,
  X,
  FileUp,
  FileSpreadsheet,
  Film,
  Image,
  Info,
  Check,
  Zap,
  Sliders,
  Eye,
  BookOpen
} from 'lucide-react';
import { CaseAnalysisResult, UploadedEvidenceItem, AdminUser, PolicyCategoryMatch } from '../types';
import { safeFetchJson } from '../utils/api';
import { ambientSound } from '../utils/ambientAudio';
import { PolicyReferenceModal } from './analyzer/PolicyReferenceModal';
import { CaseReportModal } from './analyzer/CaseReportModal';

interface CaseAnalyzerSectionProps {
  currentUser?: AdminUser | null;
  token?: string | null;
  onNotify?: (msg: string, type?: 'info' | 'success' | 'alert' | 'copy') => void;
}

const ANIMATION_STAGES = [
  'INITIALIZING CASE...',
  'VALIDATING EVIDENCE...',
  'IDENTIFYING POTENTIAL POLICY CATEGORIES...',
  'CROSS-CHECKING EVIDENCE...',
  'GENERATING CASE SUMMARY...',
];

const PRESET_SCENARIOS = [
  {
    label: 'Preset 1: Impersonation & Scam Syndicate',
    subject: '@target_impersonator_99',
    description:
      'The subject profile is using the exact same avatar, bio, and photographic archive of @official_creator to solicit cryptocurrency transfers and promote fake giveaway links via DM. Multiple unedited screenshots show fraudulent DMs requesting seed phrases and WhatsApp contact.',
  },
  {
    label: 'Preset 2: Targeted Harassment & Slurs',
    subject: '@abusive_stalker_ops',
    description:
      'Subject has posted 12 consecutive public stories and 4 reel comments containing targeted ethnic slurs, demeaning personal insults, and repeated threats of physical violence against the complainant after being blocked.',
  },
  {
    label: 'Preset 3: Inconsistent / Conflicting Evidence',
    subject: '@disputed_receipts_01',
    description:
      'Complainant claims subject is running a fraud botnet, but submitted screenshots show contradictory timestamps, signs of edited pixel artifacts around text bubbles, and mutually incompatible account handles.',
  },
  {
    label: 'Preset 4: Insufficient Evidence Baseline',
    subject: '@unsubstantiated_case',
    description: 'Someone said bad things online.',
  },
];

export const CaseAnalyzerSection: React.FC<CaseAnalyzerSectionProps> = ({
  currentUser,
  token,
  onNotify,
}) => {
  // Input fields
  const [subjectUsername, setSubjectUsername] = useState<string>('@rogue_entity_1920');
  const [caseId, setCaseId] = useState<string>(() => `R4V-${Math.floor(1000 + Math.random() * 9000)}`);
  const [caseDescription, setCaseDescription] = useState<string>(
    'Subject account @rogue_entity_1920 is distributing forged identity credentials, publishing targeted disparaging claims with ethnic slurs in direct messages, and issuing explicit physical assault threats against the complainant.'
  );
  const [evidenceFiles, setEvidenceFiles] = useState<UploadedEvidenceItem[]>([
    {
      id: 'EV-01',
      name: 'screenshot_dm_threat_1.png',
      size: 482000,
      type: 'image/png',
      uploadedAt: new Date().toISOString(),
    },
    {
      id: 'EV-02',
      name: 'chat_transcript_slurs_export.txt',
      size: 24000,
      type: 'text/plain',
      uploadedAt: new Date().toISOString(),
    },
  ]);

  // Execution states
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisStageIndex, setAnalysisStageIndex] = useState<number>(0);
  const [analysisResult, setAnalysisResult] = useState<CaseAnalysisResult | null>(null);
  const [expandedWhy, setExpandedWhy] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Modals
  const [showPolicyModal, setShowPolicyModal] = useState<boolean>(false);
  const [showReportModal, setShowReportModal] = useState<boolean>(false);

  // Admin Case Action States
  const [isSavingCase, setIsSavingCase] = useState<boolean>(false);
  const [isCaseSaved, setIsCaseSaved] = useState<boolean>(false);
  const [adminNoteInput, setAdminNoteInput] = useState<string>('');
  const [showAdminActionBox, setShowAdminActionBox] = useState<boolean>(false);
  const [selectedReviewer, setSelectedReviewer] = useState<string>('Asura (Owner)');
  const [caseActionLoading, setCaseActionLoading] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-generate fresh Case ID
  const refreshCaseId = () => {
    ambientSound.playClick(900);
    const newId = `R4V-${Math.floor(1000 + Math.random() * 9000)}`;
    setCaseId(newId);
    if (onNotify) onNotify(`Generated Case Identifier #${newId}`, 'info');
  };

  // Handle file uploads
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newItems: UploadedEvidenceItem[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      newItems.push({
        id: `EV-${Date.now()}-${i}`,
        name: file.name,
        size: file.size,
        type: file.type || 'application/octet-stream',
        uploadedAt: new Date().toISOString(),
      });
    }

    setEvidenceFiles((prev) => [...prev, ...newItems]);
    ambientSound.playStamp();
    if (onNotify) onNotify(`Attached ${newItems.length} evidence file(s) to Case Index.`, 'success');
  };

  const removeEvidenceItem = (id: string) => {
    ambientSound.playClick(600);
    setEvidenceFiles((prev) => prev.filter((item) => item.id !== id));
  };

  // Apply a sample scenario preset
  const applyPreset = (preset: typeof PRESET_SCENARIOS[0]) => {
    ambientSound.playClick(800);
    setSubjectUsername(preset.subject);
    setCaseDescription(preset.description);
    setAnalysisResult(null);
    setErrorMessage(null);
    if (onNotify) onNotify(`Loaded ${preset.label}`, 'info');
  };

  // Execute Analysis with Cinematic Multi-Step Motion Sequence
  const handleAnalyze = async () => {
    if (!subjectUsername.trim()) {
      setErrorMessage('Please enter a valid subject username (@handle).');
      return;
    }

    setErrorMessage(null);
    setIsAnalyzing(true);
    setAnalysisStageIndex(0);
    ambientSound.playStamp();

    // Stage progression timer sequence
    const stageInterval = setInterval(() => {
      setAnalysisStageIndex((prev) => {
        if (prev < ANIMATION_STAGES.length - 1) {
          ambientSound.playClick(700 + prev * 80);
          return prev + 1;
        }
        return prev;
      });
    }, 600);

    try {
      const res = await safeFetchJson<{
        success: boolean;
        analysis?: CaseAnalysisResult;
        error?: string;
      }>('/api/analyzer/evaluate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subjectUsername: subjectUsername.trim(),
          caseId: caseId.trim(),
          caseDescription: caseDescription.trim(),
          evidenceFiles: evidenceFiles.map((f) => ({
            name: f.name,
            size: f.size,
            type: f.type,
          })),
        }),
      });

      // Ensure minimum animation duration of 3 seconds for forensic cinematic feel
      setTimeout(() => {
        clearInterval(stageInterval);
        setIsAnalyzing(false);

        if (res.ok && res.data?.analysis) {
          setAnalysisResult(res.data.analysis);
          setIsCaseSaved(false);
          ambientSound.playStamp();
          if (onNotify) {
            onNotify(
              `Case Analysis Complete: ${res.data.analysis.statusTitle}`,
              res.data.analysis.status === 'ANALYZED' ? 'success' : 'alert'
            );
          }
        } else {
          setErrorMessage(res.data?.error || 'Failed to complete case evaluation. Please retry.');
          if (onNotify) onNotify('Analysis interrupted by safety rule or server error.', 'alert');
        }
      }, 3000);
    } catch (err: unknown) {
      clearInterval(stageInterval);
      setIsAnalyzing(false);
      setErrorMessage('Network connection lost while communicating with forensic evaluation engine.');
    }
  };

  // Save Case to Bureau Database
  const handleSaveCase = async () => {
    if (!analysisResult) return;

    setIsSavingCase(true);
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await safeFetchJson<{
        success: boolean;
        message: string;
        case?: any;
        error?: string;
      }>('/api/analyzer/save-case', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          caseId: analysisResult.caseId,
          subjectUsername: analysisResult.subjectUsername,
          categories: analysisResult.categories,
          rawDescription: analysisResult.rawDescription,
          evidenceSummary: analysisResult.evidenceSummary,
          reviewerNotes: adminNoteInput || undefined,
          targetPlatform: 'Instagram / Multi-Platform',
        }),
      });

      if (res.ok && res.data?.success) {
        setIsCaseSaved(true);
        ambientSound.playStamp();
        if (onNotify) onNotify(`Case ${analysisResult.caseId} securely indexed in Bureau Database.`, 'success');
      } else {
        if (onNotify) onNotify(res.data?.error || 'Failed to save case dossier.', 'alert');
      }
    } catch {
      if (onNotify) onNotify('Server error while persisting case dossier.', 'alert');
    } finally {
      setIsSavingCase(false);
    }
  };

  // Perform Admin Action
  const handleAdminAction = async (actionType: 'ASSIGN_REVIEWER' | 'MARK_VERIFIED' | 'MARK_INSUFFICIENT' | 'CLOSE_CASE') => {
    if (!analysisResult || !token) {
      if (onNotify) onNotify('Administrative clearance required to dispatch action.', 'alert');
      return;
    }

    setCaseActionLoading(true);
    try {
      const res = await safeFetchJson<{
        success: boolean;
        message: string;
        error?: string;
      }>('/api/analyzer/case-action', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          caseId: analysisResult.caseId,
          action: actionType,
          reviewerName: selectedReviewer,
          noteText: adminNoteInput,
        }),
      });

      if (res.ok && res.data?.success) {
        ambientSound.playStamp();
        if (onNotify) onNotify(res.data.message, 'success');
      } else {
        if (onNotify) onNotify(res.data?.error || 'Action dispatch failed.', 'alert');
      }
    } catch {
      if (onNotify) onNotify('Internal server error executing action.', 'alert');
    } finally {
      setCaseActionLoading(false);
    }
  };

  return (
    <section
      id="analyzer"
      className="relative py-16 sm:py-24 bg-[#05070a] text-[#ede8dd] border-t border-[#1b1f2b] selection:bg-[#c5a059] selection:text-black"
    >
      {/* Background Ambience / Subtle Noise Texture */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(64,18,22,0.15),transparent)] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-12">
        {/* Section Header */}
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#151922] border border-[#c5a059]/40 text-[#c5a059] text-[11px] font-mono uppercase tracking-[0.25em] font-bold shadow-[0_0_15px_rgba(197,160,89,0.15)]">
            <Sparkles size={12} className="text-[#c5a059]" />
            <span>R4V INTELLIGENCE ENGINE</span>
          </div>

          <h2 className="font-serif text-2xl sm:text-4xl font-bold tracking-widest text-[#fffdfa] uppercase">
            R4V CASE ANALYZER
          </h2>

          <p className="font-mono text-xs sm:text-sm text-[#a69e90] tracking-wider uppercase">
            AI-ASSISTED POLICY & EVIDENCE ANALYSIS
          </p>

          <div className="h-[1px] w-24 bg-gradient-to-r from-transparent via-[#c5a059] to-transparent mx-auto pt-1" />
        </div>

        {/* Safety & Assistive Covenant Banner */}
        <div className="bg-[#11141c] border border-[#232836] p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs font-mono text-[#8c8273]">
          <div className="flex items-center gap-2.5 text-[#ede8dd]">
            <Shield size={16} className="text-[#c5a059] shrink-0" />
            <span>
              <strong>ASSISTIVE INTELLIGENCE COVENANT:</strong> Evaluates evidence against platform policies. No mass-reporting, no ban methods, no password harvesting.
            </span>
          </div>

          <button
            onClick={() => setShowPolicyModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#1a1f2c] hover:bg-[#252c3d] text-[#c5a059] hover:text-[#e5cb91] border border-[#384156] text-[11px] uppercase tracking-wider transition-colors shrink-0"
          >
            <BookOpen size={12} />
            <span>POLICY DIRECTORY</span>
          </button>
        </div>

        {/* Main Workstation Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Input Control Panel (5 Cols) */}
          <div className="lg:col-span-5 bg-[#0a0c10] border border-[#222836] p-6 sm:p-7 space-y-6 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-[#1c212c] pb-3">
              <div className="flex items-center gap-2">
                <FileText size={15} className="text-[#c5a059]" />
                <span className="font-mono text-xs font-bold uppercase tracking-widest text-[#ede8dd]">
                  CASE INTAKE DOSSIER
                </span>
              </div>
              <span className="text-[10px] font-mono text-[#8c8273] uppercase">INPUT PANEL</span>
            </div>

            {/* Quick Preset Pickers */}
            <div className="space-y-1.5">
              <label className="block text-[10px] font-mono uppercase tracking-wider text-[#8c8273]">
                LOAD FORENSIC TEST CASE PRESET:
              </label>
              <div className="grid grid-cols-2 gap-1.5 text-[10px] font-mono">
                {PRESET_SCENARIOS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => applyPreset(preset)}
                    className="p-1.5 bg-[#12151d] hover:bg-[#1b202c] border border-[#222735] hover:border-[#c5a059]/50 text-left text-[#a69e90] hover:text-[#ede8dd] truncate transition-colors"
                    title={preset.label}
                  >
                    Preset {idx + 1}: {preset.subject}
                  </button>
                ))}
              </div>
            </div>

            {/* Field: Subject Username */}
            <div className="space-y-1.5">
              <label className="block text-xs font-mono uppercase tracking-widest text-[#c5a059] font-bold">
                ENTER SUBJECT USERNAME
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={subjectUsername}
                  onChange={(e) => setSubjectUsername(e.target.value)}
                  placeholder="@username or handle"
                  className="w-full bg-[#12151e] border border-[#262c3b] focus:border-[#c5a059] px-3.5 py-2.5 text-sm font-mono text-[#ede8dd] placeholder-[#555f73] focus:outline-none transition-colors"
                />
              </div>
            </div>

            {/* Field: Case ID */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-mono uppercase tracking-widest text-[#ede8dd] font-bold">
                  CASE ID
                </label>
                <button
                  type="button"
                  onClick={refreshCaseId}
                  className="text-[10px] font-mono text-[#c5a059] hover:text-[#e5cb91] flex items-center gap-1 transition-colors uppercase"
                >
                  <RefreshCw size={10} />
                  <span>GENERATE NEW</span>
                </button>
              </div>
              <input
                type="text"
                value={caseId}
                onChange={(e) => setCaseId(e.target.value)}
                placeholder="R4V-XXXX"
                className="w-full bg-[#12151e] border border-[#262c3b] focus:border-[#c5a059] px-3.5 py-2.5 text-sm font-mono text-[#ede8dd] focus:outline-none transition-colors"
              />
            </div>

            {/* Field: Case Description */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-mono uppercase tracking-widest text-[#ede8dd] font-bold">
                  CASE DESCRIPTION
                </label>
                <span className="text-[10px] font-mono text-[#5b667a]">
                  {caseDescription.length} CHARS
                </span>
              </div>
              <textarea
                rows={4}
                value={caseDescription}
                onChange={(e) => setCaseDescription(e.target.value)}
                placeholder="Describe the alleged policy violations, timelines, and context..."
                className="w-full bg-[#12151e] border border-[#262c3b] focus:border-[#c5a059] p-3 text-xs font-mono text-[#ede8dd] placeholder-[#555f73] focus:outline-none transition-colors leading-relaxed resize-y"
              />
            </div>

            {/* Field: Upload Evidence */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-mono uppercase tracking-widest text-[#ede8dd] font-bold">
                  UPLOAD EVIDENCE ({evidenceFiles.length})
                </label>
                <span className="text-[10px] font-mono text-[#8c8273]">LEGAL & AUTHENTIC ONLY</span>
              </div>

              {/* Upload Dropzone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-[#262c3b] hover:border-[#c5a059]/60 bg-[#0d1017] p-4 text-center cursor-pointer transition-colors space-y-2 group"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                  accept="image/*,video/*,text/plain,application/pdf"
                />
                <div className="w-8 h-8 rounded-full bg-[#161a24] group-hover:bg-[#1f2433] mx-auto flex items-center justify-center text-[#8c8273] group-hover:text-[#c5a059] transition-colors">
                  <Upload size={14} />
                </div>
                <div className="text-xs font-mono text-[#a69e90] group-hover:text-[#ede8dd]">
                  <span>Click or drag unedited screenshots, videos, or logs</span>
                </div>
                <p className="text-[9px] font-mono text-[#5a6578]">
                  SUPPORTS PNG, JPG, MP4, PDF, TXT (METADATA PRESERVED)
                </p>
              </div>

              {/* Uploaded Evidence List */}
              {evidenceFiles.length > 0 && (
                <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                  {evidenceFiles.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center justify-between p-2 bg-[#12151d] border border-[#1e2330] text-xs font-mono text-[#c8c2b5]"
                    >
                      <div className="flex items-center gap-2 truncate">
                        {file.type.includes('image') ? (
                          <Image size={13} className="text-[#c5a059] shrink-0" />
                        ) : file.type.includes('video') ? (
                          <Film size={13} className="text-[#38bdf8] shrink-0" />
                        ) : (
                          <FileText size={13} className="text-[#a69e90] shrink-0" />
                        )}
                        <span className="truncate text-[11px]">{file.name}</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[9px] text-[#5a6578]">
                          {(file.size / 1024).toFixed(0)} KB
                        </span>
                        <button
                          type="button"
                          onClick={() => removeEvidenceItem(file.id)}
                          className="text-[#ef4444] hover:text-[#f87171] p-0.5"
                          title="Remove item"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Error Message readout */}
            {errorMessage && (
              <div className="p-3 bg-[#240a0c] border border-[#8c1d1d] text-xs font-mono text-[#f2a2a6] flex items-start gap-2">
                <AlertTriangle size={14} className="text-[#ef4444] shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Primary Action Button */}
            <button
              id="analyze-case-btn"
              type="button"
              disabled={isAnalyzing}
              onClick={handleAnalyze}
              className={`w-full py-3.5 px-4 font-mono font-bold text-xs uppercase tracking-[0.2em] transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-lg ${
                isAnalyzing
                  ? 'bg-[#222836] text-[#8c8273] cursor-not-allowed border border-[#384156]'
                  : 'bg-gradient-to-r from-[#8c6d32] via-[#c5a059] to-[#dfc181] hover:brightness-110 text-black shadow-[0_0_25px_rgba(197,160,89,0.35)]'
              }`}
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw size={14} className="animate-spin text-[#c5a059]" />
                  <span>ANALYSIS IN PROGRESS...</span>
                </>
              ) : (
                <>
                  <Zap size={14} className="text-black" />
                  <span>ANALYZE CASE</span>
                </>
              )}
            </button>
          </div>

          {/* Right Column: Output Screen / Animated Analysis Engine (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Cinematic Motion Analysis Sequence Screen */}
            {isAnalyzing && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#0b0e14] border border-[#c5a059]/40 p-8 space-y-6 shadow-2xl relative overflow-hidden"
              >
                {/* Forensic Scan Line */}
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#c5a059] to-transparent animate-pulse" />

                <div className="flex items-center justify-between border-b border-[#202634] pb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#c5a059] animate-ping" />
                    <span className="font-mono text-xs font-bold text-[#c5a059] tracking-widest uppercase">
                      FORENSIC NEURAL ENGINE
                    </span>
                  </div>
                  <span className="font-mono text-[10px] text-[#8c8273]">STAGE {analysisStageIndex + 1} OF 5</span>
                </div>

                {/* Main Cinematic Status Message */}
                <div className="text-center py-6 space-y-3">
                  <div className="font-serif text-lg sm:text-xl font-bold tracking-widest text-[#fffdfa] uppercase">
                    {ANIMATION_STAGES[analysisStageIndex]}
                  </div>
                  <p className="font-mono text-xs text-[#8c8273]">
                    Cross-referencing {evidenceFiles.length} file(s) against platform trust & safety taxonomies.
                  </p>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1.5">
                  <div className="w-full bg-[#141822] h-2 overflow-hidden border border-[#252c3d]">
                    <motion.div
                      className="bg-gradient-to-r from-[#8c6d32] to-[#c5a059] h-full"
                      initial={{ width: '0%' }}
                      animate={{ width: `${((analysisStageIndex + 1) / ANIMATION_STAGES.length) * 100}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                  <div className="flex justify-between font-mono text-[9px] text-[#5a6578]">
                    <span>INTAKE SECURED</span>
                    <span>STANDARDS MATCHED</span>
                  </div>
                </div>

                {/* Live Terminal Telemetry */}
                <div className="bg-[#06080b] p-3 border border-[#161a24] font-mono text-[10px] text-[#8c8273] space-y-1">
                  <div>[SYS] TARGET: {subjectUsername}</div>
                  <div>[SYS] DOSSIER: #{caseId} // VALIDATING INTEGRITY COVENANTS</div>
                  <div className="text-[#c5a059]">[AUTH] NO MASS ACTIONS ALLOWED // STRICT ADVISORY MODE</div>
                </div>
              </motion.div>
            )}

            {/* Results Display */}
            {!isAnalyzing && analysisResult && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {/* Compact "Method" Format Result Card */}
                <div className="bg-[#0b0e14] border border-[#c5a059]/40 p-6 sm:p-7 shadow-2xl relative">
                  {/* Card Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#222836] pb-4 gap-2">
                    <div>
                      <div className="font-mono text-[10px] text-[#c5a059] uppercase tracking-[0.25em] font-bold">
                        FORENSIC CLASSIFICATION
                      </div>
                      <h3 className="font-serif text-lg font-bold text-[#ede8dd] tracking-wider uppercase mt-0.5">
                        R4V CASE ANALYSIS
                      </h3>
                    </div>

                    <div className="text-left sm:text-right font-mono text-xs space-y-0.5">
                      <div className="text-[#e5cb91] font-bold">CASE: {analysisResult.caseId}</div>
                      <div className="text-[#a69e90]">SUBJECT: {analysisResult.subjectUsername}</div>
                    </div>
                  </div>

                  {/* Status Banner */}
                  <div className="my-5 p-3.5 bg-[#121622] border border-[#242b3d] flex items-center justify-between font-mono text-xs">
                    <div className="flex items-center gap-2.5">
                      {analysisResult.status === 'ANALYZED' ? (
                        <CheckCircle2 size={16} className="text-[#22c55e]" />
                      ) : (
                        <AlertTriangle size={16} className="text-[#f59e0b]" />
                      )}
                      <div>
                        <span className="font-bold text-[#ede8dd] uppercase block">
                          {analysisResult.statusTitle}
                        </span>
                        <span className="text-[11px] text-[#8c8273]">
                          {analysisResult.statusMessage}
                        </span>
                      </div>
                    </div>

                    <span className="hidden sm:inline px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-[#1b212f] text-[#c5a059] border border-[#c5a059]/30">
                      {analysisResult.status}
                    </span>
                  </div>

                  {/* Policy Categories & Confidence Breakdown */}
                  {analysisResult.categories.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-6">
                      {/* Left: Potential Policy Categories */}
                      <div className="space-y-3">
                        <div className="font-mono text-xs font-bold uppercase tracking-widest text-[#c5a059] border-b border-[#1c2230] pb-1.5">
                          POTENTIAL POLICY CATEGORIES
                        </div>
                        <div className="space-y-2">
                          {analysisResult.categories.map((cat, idx) => (
                            <div
                              key={idx}
                              className="p-2.5 bg-[#121620] border border-[#1f2533] flex items-center justify-between font-mono text-xs"
                            >
                              <span className="font-bold text-[#e5cb91]">
                                {cat.count.toString().padStart(2, '0')} × {cat.name}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Right: Evidence Confidence */}
                      <div className="space-y-3">
                        <div className="font-mono text-xs font-bold uppercase tracking-widest text-[#c5a059] border-b border-[#1c2230] pb-1.5">
                          EVIDENCE CONFIDENCE
                        </div>
                        <div className="space-y-2">
                          {analysisResult.categories.map((cat, idx) => (
                            <div
                              key={idx}
                              className="p-2.5 bg-[#121620] border border-[#1f2533] flex items-center justify-between font-mono text-xs"
                            >
                              <span className="text-[#a69e90] truncate max-w-[150px]">{cat.name}</span>
                              <span
                                className={`font-bold px-2 py-0.5 text-[10px] ${
                                  cat.confidence === 'HIGH'
                                    ? 'bg-[#22c55e]/15 text-[#22c55e] border border-[#22c55e]/40'
                                    : cat.confidence === 'MODERATE'
                                    ? 'bg-[#f59e0b]/15 text-[#f59e0b] border border-[#f59e0b]/40'
                                    : 'bg-[#ef4444]/15 text-[#ef4444] border border-[#ef4444]/40'
                                }`}
                              >
                                {cat.confidence}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : null}

                  {/* Evidence Status Checklist */}
                  <div className="space-y-2.5 my-5 border-t border-[#1c2230] pt-5">
                    <div className="font-mono text-xs font-bold uppercase tracking-widest text-[#c5a059]">
                      EVIDENCE STATUS
                    </div>
                    <div className="space-y-1.5 font-mono text-xs">
                      {analysisResult.evidenceStatusItems.map((item, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-[#c8c2b5]">
                          {item.state === 'checked' ? (
                            <span className="text-[#22c55e] font-bold">✓</span>
                          ) : item.state === 'warning' ? (
                            <span className="text-[#f59e0b] font-bold">⚠</span>
                          ) : (
                            <span className="text-[#8c8273]">•</span>
                          )}
                          <div>
                            <span className="font-bold text-[#ede8dd] mr-2">{item.label}</span>
                            <span className="text-[11px] text-[#8c8273]">({item.detail})</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Category Pieces Explanatory Note */}
                  <div className="p-3 bg-[#0a0d13] border border-[#1b202c] text-[10px] font-mono text-[#8c8273] italic">
                    * Clarification: The numbers indicate distinct pieces of evidence identified by the analyzer, NOT the number of reports to submit.
                  </div>

                  {/* Recommended Next Step & Direct Policy Link */}
                  <div className="mt-6 p-4 bg-[#141924] border border-[#283247] space-y-3 font-mono text-xs">
                    <div className="font-bold uppercase tracking-widest text-[#c5a059] flex items-center gap-1.5">
                      <CheckCircle2 size={14} className="text-[#c5a059]" />
                      <span>RECOMMENDED NEXT STEP</span>
                    </div>

                    <p className="text-[#ede8dd] leading-relaxed">
                      {analysisResult.recommendedNextStep}
                    </p>

                    <div className="pt-2 flex flex-wrap items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setShowPolicyModal(true)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#1b212f] hover:bg-[#273044] border border-[#3b4761] text-xs font-mono text-[#c5a059] hover:text-[#e5cb91] transition-colors"
                      >
                        <BookOpen size={13} />
                        <span>OPEN POLICY REFERENCE</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setShowReportModal(true)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#c5a059] hover:bg-[#dfc181] text-black font-bold text-xs font-mono transition-colors shadow-[0_0_15px_rgba(197,160,89,0.2)]"
                      >
                        <Printer size={13} />
                        <span>GENERATE CASE REPORT (PDF)</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expandable Section: WHY WAS THIS FLAGGED? */}
                {analysisResult.categories.length > 0 && (
                  <div className="bg-[#0b0e14] border border-[#222836] p-5 sm:p-6 space-y-4 shadow-xl">
                    <button
                      type="button"
                      onClick={() => setExpandedWhy(!expandedWhy)}
                      className="w-full flex items-center justify-between text-left group"
                    >
                      <div className="flex items-center gap-2">
                        <Info size={15} className="text-[#c5a059]" />
                        <span className="font-mono text-xs sm:text-sm font-bold uppercase tracking-widest text-[#ede8dd] group-hover:text-[#c5a059] transition-colors">
                          WHY WAS THIS FLAGGED? (EVIDENCE REASONING)
                        </span>
                      </div>
                      {expandedWhy ? <ChevronUp size={16} className="text-[#c5a059]" /> : <ChevronDown size={16} />}
                    </button>

                    <AnimatePresence>
                      {expandedWhy && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="space-y-4 pt-2 border-t border-[#1c2230]"
                        >
                          {analysisResult.categories.map((cat, idx) => (
                            <div
                              key={idx}
                              className="p-4 bg-[#10131b] border border-[#1e2433] space-y-3 font-mono text-xs"
                            >
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#181d28] pb-2 gap-1">
                                <span className="font-bold text-[#e5cb91] text-sm">
                                  {cat.name} ({cat.count} piece{cat.count > 1 ? 's' : ''})
                                </span>
                                <span className="text-[10px] text-[#8c8273]">
                                  HUMAN REVIEW: <strong className="text-[#ede8dd]">{cat.sufficiencyForHumanReview}</strong>
                                </span>
                              </div>

                              <div className="space-y-2 text-[11px] leading-relaxed">
                                <div>
                                  <strong className="text-[#c5a059] block mb-0.5">EVIDENCE IDENTIFIED:</strong>
                                  <p className="text-[#c8c2b5]">{cat.relevantEvidence}</p>
                                </div>
                                <div>
                                  <strong className="text-[#c5a059] block mb-0.5">POLICY MATCH RATIONALE:</strong>
                                  <p className="text-[#c8c2b5]">{cat.analysisRationale}</p>
                                </div>
                                {cat.missingInfo && (
                                  <div>
                                    <strong className="text-[#df878b] block mb-0.5">MISSING INFORMATION / UNCERTAINTIES:</strong>
                                    <p className="text-[#8c8273]">{cat.missingInfo}</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                {/* Administrator Case Actions (Save, Assign, Note, Verify, Close) */}
                <div className="bg-[#0e1118] border border-[#272e3f] p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-[#1c2230] pb-2">
                    <div className="flex items-center gap-2">
                      <Lock size={14} className="text-[#c5a059]" />
                      <span className="font-mono text-xs font-bold uppercase tracking-widest text-[#ede8dd]">
                        ADMINISTRATIVE WORKSPACE INTEGRATION
                      </span>
                    </div>
                    {currentUser && (
                      <span className="px-2 py-0.5 text-[9px] font-mono font-bold bg-[#c5a059]/10 text-[#c5a059] border border-[#c5a059]/30">
                        {currentUser.role}: {currentUser.name}
                      </span>
                    )}
                  </div>

                  <p className="text-xs font-mono text-[#8c8273]">
                    Save this analyzed case directly into the Bureau Database index or dispatch verification actions with recorded audit trails.
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono text-xs">
                    <button
                      type="button"
                      disabled={isSavingCase || isCaseSaved}
                      onClick={handleSaveCase}
                      className={`p-2.5 flex items-center justify-center gap-1.5 border transition-colors ${
                        isCaseSaved
                          ? 'bg-[#152e1d] border-[#22c55e] text-[#22c55e]'
                          : 'bg-[#1a212f] hover:bg-[#252f44] border-[#374461] text-[#ede8dd]'
                      }`}
                    >
                      <Save size={13} />
                      <span>{isCaseSaved ? 'SAVED TO DB' : 'SAVE CASE'}</span>
                    </button>

                    <button
                      type="button"
                      disabled={caseActionLoading}
                      onClick={() => handleAdminAction('MARK_VERIFIED')}
                      className="p-2.5 bg-[#121620] hover:bg-[#1a202c] border border-[#2a3447] text-[#22c55e] flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <UserCheck size={13} />
                      <span>MARK VERIFIED</span>
                    </button>

                    <button
                      type="button"
                      disabled={caseActionLoading}
                      onClick={() => handleAdminAction('MARK_INSUFFICIENT')}
                      className="p-2.5 bg-[#121620] hover:bg-[#1a202c] border border-[#2a3447] text-[#f59e0b] flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <AlertTriangle size={13} />
                      <span>INSUFFICIENT</span>
                    </button>

                    <button
                      type="button"
                      disabled={caseActionLoading}
                      onClick={() => handleAdminAction('CLOSE_CASE')}
                      className="p-2.5 bg-[#121620] hover:bg-[#1a202c] border border-[#2a3447] text-[#ef4444] flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <X size={13} />
                      <span>CLOSE CASE</span>
                    </button>
                  </div>

                  {/* Reviewer Note Input */}
                  <div className="pt-2 flex gap-2">
                    <input
                      type="text"
                      value={adminNoteInput}
                      onChange={(e) => setAdminNoteInput(e.target.value)}
                      placeholder="Add investigator note to case dossier..."
                      className="flex-1 bg-[#12151e] border border-[#262c3b] focus:border-[#c5a059] px-3 py-1.5 text-xs font-mono text-[#ede8dd] focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (adminNoteInput.trim()) {
                          handleAdminAction('ASSIGN_REVIEWER');
                          setAdminNoteInput('');
                        }
                      }}
                      className="px-3 py-1.5 bg-[#1a212f] hover:bg-[#252f44] border border-[#374461] text-xs font-mono text-[#c5a059] uppercase transition-colors"
                    >
                      ADD NOTE
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Standby State when not yet analyzed */}
            {!isAnalyzing && !analysisResult && (
              <div className="bg-[#0b0e14] border border-[#1f2433] p-10 text-center space-y-5 shadow-2xl">
                <div className="w-12 h-12 rounded-full bg-[#121622] border border-[#c5a059]/40 mx-auto flex items-center justify-center text-[#c5a059]">
                  <Search size={22} />
                </div>
                <div className="space-y-1.5">
                  <h4 className="font-serif text-base font-bold text-[#ede8dd] uppercase tracking-wider">
                    ANALYZER STANDBY // AWAITING DOSSIER INGESTION
                  </h4>
                  <p className="font-mono text-xs text-[#8c8273] max-w-md mx-auto leading-relaxed">
                    Provide a subject identifier, incident context, and supporting evidence files on the left to initiate multi-stage forensic policy classification.
                  </p>
                </div>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#06080b] border border-[#1b202c] font-mono text-[10px] text-[#5b667a]">
                  <span>CLEARANCE: LEVEL 2</span>
                  <span>•</span>
                  <span>EST. 1924 BIRMINGHAM BUREAU</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Final Mandatory Disclaimer */}
        <div className="p-5 bg-[#0a0c10] border border-[#1c212c] font-mono text-xs text-[#8c8273] leading-relaxed space-y-2">
          <div className="text-[#c5a059] font-bold uppercase tracking-wider text-[11px]">
            LEGAL DISCLAIMER & COMPLIANCE
          </div>
          <p>
            <strong>R4V CASE ANALYZER IS AN ASSISTIVE TOOL.</strong> AI classifications may be incorrect. Users must review evidence themselves and submit only truthful, supported reports. Third-party platforms make their own moderation and enforcement decisions.
          </p>
        </div>
      </div>

      {/* Policy Reference Modal */}
      <PolicyReferenceModal
        isOpen={showPolicyModal}
        onClose={() => setShowPolicyModal(false)}
      />

      {/* Case Report Modal */}
      {analysisResult && (
        <CaseReportModal
          isOpen={showReportModal}
          onClose={() => setShowReportModal(false)}
          result={analysisResult}
        />
      )}
    </section>
  );
};
