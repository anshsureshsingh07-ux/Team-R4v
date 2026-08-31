import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Briefcase, 
  Plus, 
  Search, 
  Filter, 
  RefreshCw, 
  Shield, 
  Link, 
  MessageSquare, 
  Activity, 
  User, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  FileText,
  ChevronRight,
  Send,
  ExternalLink,
  Lock,
  Tag
} from 'lucide-react';
import { AdminUser, CaseCategory, CaseRecord, CaseStatus } from '../../types';
import { safeFetchJson } from '../../utils/api';

interface CaseManagementProps {
  currentUser: AdminUser;
  token: string;
}

const CASE_STATUSES: CaseStatus[] = [
  'NEW',
  'UNDER REVIEW',
  'EVIDENCE VERIFIED',
  'REPORT DOCUMENTED',
  'PLATFORM REVIEW',
  'RESOLVED',
  'CLOSED',
];

const CATEGORIES: CaseCategory[] = [
  'IMPERSONATION',
  'FRAUD_SYNDICATE',
  'PHISHING_BOTNET',
  'COPYRIGHT_INFRINGEMENT',
  'POLICY_BREACH',
  'OSINT_AUDIT',
  'EXTORTION_PREVENTION',
];

export const CaseManagement: React.FC<CaseManagementProps> = ({
  currentUser,
  token,
}) => {
  const [cases, setCases] = useState<CaseRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCase, setSelectedCase] = useState<CaseRecord | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals & form states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newSubject, setNewSubject] = useState('');
  const [newCategory, setNewCategory] = useState<CaseCategory>('IMPERSONATION');
  const [newPolicy, setNewPolicy] = useState('');
  const [newEvidence, setNewEvidence] = useState('');
  const [newPriority, setNewPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'>('MEDIUM');
  const [newTargetHandle, setNewTargetHandle] = useState('');
  const [newTargetPlatform, setNewTargetPlatform] = useState('');
  const [createLoading, setCreateLoading] = useState(false);

  // Note & Evidence input
  const [noteInput, setNoteInput] = useState('');
  const [evidenceInput, setEvidenceInput] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [statusReason, setStatusReason] = useState('');

  const fetchCases = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (statusFilter !== 'ALL') queryParams.append('status', statusFilter);
      if (categoryFilter !== 'ALL') queryParams.append('category', categoryFilter);
      if (searchQuery.trim()) queryParams.append('search', searchQuery.trim());

      const res = await safeFetchJson<{ cases: CaseRecord[]; totalCount: number }>(
        `/api/admin/cases?${queryParams.toString()}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.ok && res.data?.cases) {
        setCases(res.data.cases);
        if (selectedCase) {
          const updated = res.data.cases.find((c) => c.id === selectedCase.id);
          if (updated) setSelectedCase(updated);
        }
      }
    } catch (err) {
      console.warn('Error fetching cases:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCases();
  }, [token, statusFilter, categoryFilter]);

  const handleCreateCase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubject || !newPolicy) return;

    setCreateLoading(true);
    try {
      const res = await safeFetchJson<{ success: boolean; case: CaseRecord }>(
        '/api/admin/cases',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            subject: newSubject,
            category: newCategory,
            platformPolicy: newPolicy,
            evidence: newEvidence,
            priority: newPriority,
            targetHandle: newTargetHandle,
            targetPlatform: newTargetPlatform,
            assignedReviewer: currentUser.name,
          }),
        }
      );

      if (res.ok && res.data?.case) {
        setShowCreateModal(false);
        // Reset
        setNewSubject('');
        setNewPolicy('');
        setNewEvidence('');
        setNewTargetHandle('');
        setNewTargetPlatform('');
        fetchCases();
        setSelectedCase(res.data.case);
      }
    } catch (err) {
      console.error('Failed to create case:', err);
    } finally {
      setCreateLoading(false);
    }
  };

  const handleUpdateStatus = async (caseId: string, newStatus: CaseStatus) => {
    setActionLoading(true);
    try {
      const res = await safeFetchJson<{ success: boolean; case: CaseRecord }>(
        `/api/admin/cases/${caseId}/status`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status: newStatus,
            details: statusReason.trim() || `Status updated to ${newStatus} by ${currentUser.name}`,
          }),
        }
      );

      if (res.ok && res.data?.case) {
        setSelectedCase(res.data.case);
        setStatusReason('');
        fetchCases();
      }
    } catch (err) {
      console.error('Failed to update case status:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCase || !noteInput.trim()) return;

    setActionLoading(true);
    try {
      const res = await safeFetchJson<{ success: boolean; case: CaseRecord }>(
        `/api/admin/cases/${selectedCase.id}/notes`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ content: noteInput.trim() }),
        }
      );

      if (res.ok && res.data?.case) {
        setSelectedCase(res.data.case);
        setNoteInput('');
        fetchCases();
      }
    } catch (err) {
      console.error('Failed to add case note:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddEvidence = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCase || !evidenceInput.trim()) return;

    setActionLoading(true);
    try {
      const res = await safeFetchJson<{ success: boolean; case: CaseRecord }>(
        `/api/admin/cases/${selectedCase.id}/evidence`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ evidenceItem: evidenceInput.trim() }),
        }
      );

      if (res.ok && res.data?.case) {
        setSelectedCase(res.data.case);
        setEvidenceInput('');
        fetchCases();
      }
    } catch (err) {
      console.error('Failed to add evidence:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusColor = (st: CaseStatus) => {
    switch (st) {
      case 'NEW':
        return 'text-[#38bdf8] border-[#38bdf8]/40 bg-[#38bdf8]/10';
      case 'UNDER REVIEW':
        return 'text-[#f59e0b] border-[#f59e0b]/40 bg-[#f59e0b]/10';
      case 'EVIDENCE VERIFIED':
        return 'text-[#a855f7] border-[#a855f7]/40 bg-[#a855f7]/10';
      case 'REPORT DOCUMENTED':
        return 'text-[#c5a059] border-[#c5a059]/40 bg-[#c5a059]/10';
      case 'PLATFORM REVIEW':
        return 'text-[#ec4899] border-[#ec4899]/40 bg-[#ec4899]/10';
      case 'RESOLVED':
        return 'text-[#22c55e] border-[#22c55e]/40 bg-[#22c55e]/10';
      case 'CLOSED':
        return 'text-[#64748b] border-[#64748b]/40 bg-[#64748b]/10';
      default:
        return 'text-[#8c8273] border-[#8c8273]/40 bg-[#8c8273]/10';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & New Case Button */}
      <div className="bg-[#0b0e14] border border-[#222834] p-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-serif font-bold text-[#ede8dd] tracking-wide flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-[#c5a059]" />
              <span>INVESTIGATIVE CASE MANAGEMENT & DOSSIERS</span>
            </h2>
            <p className="text-xs text-[#8c8273] font-mono mt-0.5">
              Evidence-based enforcement records and platform terms compliance monitoring.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-3.5 py-2 bg-[#c5a059] hover:bg-[#d8b46e] text-[#0b0e14] text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors shadow-[0_0_15px_rgba(197,160,89,0.2)]"
            >
              <Plus className="w-4 h-4" />
              <span>FILE NEW CASE</span>
            </button>

            <button
              onClick={fetchCases}
              className="px-3.5 py-2 bg-[#121620] border border-[#222834] hover:border-[#8c8273] text-xs font-mono text-[#ede8dd] flex items-center gap-1.5 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-[#c5a059] ${loading ? 'animate-spin' : ''}`} />
              <span>REFRESH</span>
            </button>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="mt-4 pt-4 border-t border-[#1a202c] grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchCases()}
              placeholder="Search by case #, subject, policy, target..."
              className="w-full bg-[#07090d] border border-[#222834] focus:border-[#c5a059] px-3.5 py-2 pl-9 text-xs text-[#ede8dd] font-mono placeholder:text-[#4a5568] focus:outline-none"
            />
            <Search className="w-4 h-4 text-[#8c8273] absolute left-3 top-2.5" />
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-[#07090d] border border-[#222834] focus:border-[#c5a059] px-3 py-2 text-xs text-[#ede8dd] font-mono focus:outline-none"
            >
              <option value="ALL">ALL STATUSES</option>
              {CASE_STATUSES.map((st) => (
                <option key={st} value={st}>STATUS: {st}</option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full bg-[#07090d] border border-[#222834] focus:border-[#c5a059] px-3 py-2 text-xs text-[#ede8dd] font-mono focus:outline-none"
            >
              <option value="ALL">ALL CATEGORIES</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>CAT: {cat.replace('_', ' ')}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Cases Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Cases List on Left (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          {loading ? (
            <div className="p-8 text-center bg-[#0b0e14] border border-[#222834] text-xs font-mono text-[#8c8273]">
              INDEXING ACTIVE DOSSIERS...
            </div>
          ) : cases.length === 0 ? (
            <div className="p-8 text-center bg-[#0b0e14] border border-[#222834] text-xs font-mono text-[#8c8273]">
              No case files located in the ledger.
            </div>
          ) : (
            cases.map((c) => {
              const isSelected = selectedCase?.id === c.id;
              return (
                <div
                  key={c.id}
                  onClick={() => setSelectedCase(c)}
                  className={`p-4 border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-[#121620] border-[#c5a059] shadow-[0_0_15px_rgba(197,160,89,0.15)]'
                      : 'bg-[#0b0e14] border-[#222834] hover:border-[#3a4454]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-[#c5a059] font-bold">{c.caseNumber}</span>
                        <span className="text-[9px] font-mono uppercase px-1.5 py-0.2 bg-[#171c26] text-[#8c8273] border border-[#222834]">
                          {c.priority}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-[#ede8dd] font-serif line-clamp-1 mt-0.5">
                        {c.subject}
                      </h4>
                    </div>
                    <span className={`px-2 py-0.5 text-[9px] font-mono uppercase font-bold border shrink-0 ${getStatusColor(c.status)}`}>
                      {c.status}
                    </span>
                  </div>

                  <p className="text-xs text-[#8c8273] font-sans line-clamp-2 mb-2">
                    Policy: {c.platformPolicy}
                  </p>

                  <div className="flex items-center justify-between text-[10px] font-mono text-[#5a6578] pt-2 border-t border-[#171c26]">
                    <span>Reviewer: {c.assignedReviewer}</span>
                    <span>{c.evidence?.length || 0} Evidence Files</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Selected Case Inspector (7 cols) */}
        <div className="lg:col-span-7">
          {selectedCase ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-[#0b0e14] border border-[#222834] p-6 space-y-6"
            >
              {/* Case Header */}
              <div className="flex items-start justify-between pb-4 border-b border-[#222834]">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-[#c5a059] font-bold tracking-widest uppercase">
                      CASE FILE DOSSIER // {selectedCase.caseNumber}
                    </span>
                    <span className="text-[#3a4454]">•</span>
                    <span className="text-[10px] font-mono text-[#8c8273]">{selectedCase.category}</span>
                  </div>
                  <h3 className="text-xl font-serif font-bold text-[#ede8dd] mt-1">
                    {selectedCase.subject}
                  </h3>
                  <div className="text-xs font-mono text-[#8c8273] mt-1 flex items-center gap-2">
                    {selectedCase.targetHandle && (
                      <span className="text-[#38bdf8] font-bold">{selectedCase.targetHandle}</span>
                    )}
                    {selectedCase.targetPlatform && (
                      <span>({selectedCase.targetPlatform})</span>
                    )}
                    <span>• Assigned to: <strong className="text-[#ede8dd]">{selectedCase.assignedReviewer}</strong></span>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1.5">
                  <span className={`px-3 py-1 text-xs font-mono uppercase font-bold border ${getStatusColor(selectedCase.status)}`}>
                    {selectedCase.status}
                  </span>
                  <span className="text-[10px] font-mono text-[#5a6578]">
                    Opened: {new Date(selectedCase.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Status Progression Selector */}
              <div className="p-4 bg-[#0e121a] border border-[#222834] space-y-2">
                <div className="text-[10px] font-mono uppercase tracking-widest text-[#8c8273] font-bold">
                  TRANSITION INVESTIGATIVE STATUS
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {CASE_STATUSES.map((st) => (
                    <button
                      key={st}
                      onClick={() => handleUpdateStatus(selectedCase.id, st)}
                      disabled={actionLoading || selectedCase.status === st}
                      className={`px-2.5 py-1 text-[10px] font-mono uppercase font-bold border transition-all ${
                        selectedCase.status === st
                          ? 'bg-[#c5a059] text-[#0b0e14] border-[#c5a059]'
                          : 'bg-[#121620] border-[#222834] text-[#8c8273] hover:text-[#ede8dd] hover:border-[#8c8273]'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Platform Policy Citation */}
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#8c8273] block mb-1 font-bold">
                  GOVERNING PLATFORM POLICY & VIOLATION CLAUSE
                </span>
                <div className="p-3 bg-[#07090d] border border-[#1d2330] text-xs text-[#ede8dd] font-mono leading-relaxed">
                  {selectedCase.platformPolicy}
                </div>
              </div>

              {/* Evidence Vault */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#8c8273] font-bold flex items-center gap-1.5">
                    <Link className="w-3.5 h-3.5 text-[#c5a059]" />
                    <span>VERIFIED EVIDENCE VAULT ({selectedCase.evidence?.length || 0} ITEMS)</span>
                  </span>
                </div>

                <div className="space-y-1.5">
                  {(!selectedCase.evidence || selectedCase.evidence.length === 0) ? (
                    <div className="p-3 bg-[#07090d] border border-[#1d2330] text-xs font-mono text-[#5a6578]">
                      No evidence records currently attached.
                    </div>
                  ) : (
                    selectedCase.evidence.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 bg-[#07090d] border border-[#1d2330] text-xs font-mono text-[#ede8dd] flex items-center justify-between gap-2"
                      >
                        <span className="truncate">{item}</span>
                        {item.startsWith('http') && (
                          <a
                            href={item}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[#c5a059] hover:underline shrink-0 text-[11px]"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    ))
                  )}
                </div>

                {/* Add Evidence Form */}
                <form onSubmit={handleAddEvidence} className="flex gap-2 pt-1">
                  <input
                    type="text"
                    value={evidenceInput}
                    onChange={(e) => setEvidenceInput(e.target.value)}
                    placeholder="Append archive hash, perma.cc link, or forensic UID trace..."
                    className="flex-1 bg-[#07090d] border border-[#222834] focus:border-[#c5a059] px-3 py-1.5 text-xs text-[#ede8dd] font-mono placeholder:text-[#4a5568] focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={actionLoading || !evidenceInput.trim()}
                    className="px-3 py-1.5 bg-[#171c26] border border-[#c5a059]/40 hover:bg-[#c5a059] hover:text-[#0b0e14] text-[#c5a059] text-xs font-mono font-bold uppercase transition-all disabled:opacity-50"
                  >
                    ATTACH EVIDENCE
                  </button>
                </form>
              </div>

              {/* Case Notes Thread */}
              <div className="space-y-2">
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#8c8273] font-bold flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-[#38bdf8]" />
                  <span>INTERNAL INVESTIGATIVE NOTES</span>
                </span>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {(!selectedCase.notes || selectedCase.notes.length === 0) ? (
                    <div className="p-3 bg-[#07090d] border border-[#1d2330] text-xs font-mono text-[#5a6578]">
                      No notes logged for this case yet.
                    </div>
                  ) : (
                    selectedCase.notes.map((note) => (
                      <div key={note.id} className="p-3 bg-[#0e121a] border border-[#1d2330] text-xs space-y-1">
                        <div className="flex items-center justify-between text-[10px] font-mono">
                          <span className="text-[#c5a059] font-bold">
                            {note.author} ({note.authorRole})
                          </span>
                          <span className="text-[#5a6578]">{new Date(note.createdAt).toLocaleString()}</span>
                        </div>
                        <p className="text-[#ede8dd] font-sans">{note.content}</p>
                      </div>
                    ))
                  )}
                </div>

                {/* Add Note Input */}
                <form onSubmit={handleAddNote} className="space-y-2 pt-1">
                  <textarea
                    rows={2}
                    value={noteInput}
                    onChange={(e) => setNoteInput(e.target.value)}
                    placeholder="Log investigative discovery, reviewer instructions, or policy cross-references..."
                    className="w-full bg-[#07090d] border border-[#222834] focus:border-[#c5a059] p-2.5 text-xs text-[#ede8dd] font-mono placeholder:text-[#4a5568] focus:outline-none"
                  />
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={actionLoading || !noteInput.trim()}
                      className="px-4 py-1.5 bg-[#c5a059] hover:bg-[#d8b46e] text-[#0b0e14] text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all disabled:opacity-50"
                    >
                      <Send className="w-3 h-3" />
                      <span>DISPATCH NOTE</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Activity History Timeline */}
              <div className="pt-3 border-t border-[#222834]">
                <div className="text-[10px] font-mono uppercase tracking-widest text-[#8c8273] font-bold mb-2 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-[#22c55e]" />
                  <span>CASE AUDIT TIMELINE</span>
                </div>
                <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                  {(selectedCase.activityHistory || []).map((act) => (
                    <div key={act.id} className="text-[11px] font-mono text-[#8c8273] flex items-start gap-2">
                      <span className="text-[#5a6578] whitespace-nowrap">
                        {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span className="text-[#ede8dd] font-bold shrink-0">{act.admin}</span>
                      <span className="text-[#a09a8e] truncate">{act.details}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="h-full min-h-[400px] bg-[#0b0e14] border border-[#222834] p-8 flex flex-col items-center justify-center text-center text-[#8c8273]">
              <Briefcase className="w-8 h-8 text-[#3a4454] mb-3" />
              <h4 className="text-sm font-serif font-bold text-[#ede8dd]">NO CASE SELECTED</h4>
              <p className="text-xs font-mono mt-1 max-w-xs">
                Select a case file from the roster to inspect evidence chains, platform policies, and chronological notes.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* File New Case Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-2xl bg-[#0b0e14] border border-[#222834] p-6 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-[#222834] pb-3">
                <div className="flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-[#c5a059]" />
                  <h3 className="text-base font-serif font-bold text-[#ede8dd] uppercase tracking-wider">
                    FILE NEW CASE DOSSIER
                  </h3>
                </div>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-xs font-mono text-[#8c8273] hover:text-[#ede8dd]"
                >
                  ✕ CLOSE
                </button>
              </div>

              <form onSubmit={handleCreateCase} className="space-y-4 text-xs font-mono">
                <div>
                  <label className="block text-[10px] text-[#8c8273] uppercase tracking-widest font-bold mb-1">
                    CASE SUBJECT / TITLE *
                  </label>
                  <input
                    type="text"
                    required
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                    placeholder="e.g. Coordinated Impersonation Syndicate targeting..."
                    className="w-full bg-[#07090d] border border-[#222834] focus:border-[#c5a059] p-2.5 text-[#ede8dd] focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] text-[#8c8273] uppercase tracking-widest font-bold mb-1">
                      VIOLATION CATEGORY *
                    </label>
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value as CaseCategory)}
                      className="w-full bg-[#07090d] border border-[#222834] focus:border-[#c5a059] p-2.5 text-[#ede8dd] focus:outline-none"
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c} value={c}>{c.replace('_', ' ')}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] text-[#8c8273] uppercase tracking-widest font-bold mb-1">
                      PRIORITY LEVEL
                    </label>
                    <select
                      value={newPriority}
                      onChange={(e) => setNewPriority(e.target.value as any)}
                      className="w-full bg-[#07090d] border border-[#222834] focus:border-[#c5a059] p-2.5 text-[#ede8dd] focus:outline-none"
                    >
                      <option value="LOW">LOW</option>
                      <option value="MEDIUM">MEDIUM</option>
                      <option value="HIGH">HIGH</option>
                      <option value="CRITICAL">CRITICAL</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] text-[#8c8273] uppercase tracking-widest font-bold mb-1">
                      TARGET IDENTIFIER / @HANDLE
                    </label>
                    <input
                      type="text"
                      value={newTargetHandle}
                      onChange={(e) => setNewTargetHandle(e.target.value)}
                      placeholder="@target_account"
                      className="w-full bg-[#07090d] border border-[#222834] focus:border-[#c5a059] p-2.5 text-[#ede8dd] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-[#8c8273] uppercase tracking-widest font-bold mb-1">
                      HOST PLATFORM
                    </label>
                    <input
                      type="text"
                      value={newTargetPlatform}
                      onChange={(e) => setNewTargetPlatform(e.target.value)}
                      placeholder="Instagram, Telegram, Discord, Web..."
                      className="w-full bg-[#07090d] border border-[#222834] focus:border-[#c5a059] p-2.5 text-[#ede8dd] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] text-[#8c8273] uppercase tracking-widest font-bold mb-1">
                    RELEVANT PLATFORM TERMS / POLICY CLAUSE *
                  </label>
                  <input
                    type="text"
                    required
                    value={newPolicy}
                    onChange={(e) => setNewPolicy(e.target.value)}
                    placeholder="e.g. Meta Community Standards §3.2 (Impersonation)"
                    className="w-full bg-[#07090d] border border-[#222834] focus:border-[#c5a059] p-2.5 text-[#ede8dd] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-[#8c8273] uppercase tracking-widest font-bold mb-1">
                    INITIAL EVIDENCE ARTIFACTS (ONE PER LINE)
                  </label>
                  <textarea
                    rows={3}
                    value={newEvidence}
                    onChange={(e) => setNewEvidence(e.target.value)}
                    placeholder="https://archive.today/...\nPerma.cc/...\nRaw UID Trace: 9812401"
                    className="w-full bg-[#07090d] border border-[#222834] focus:border-[#c5a059] p-2.5 text-[#ede8dd] focus:outline-none"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-[#222834]">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 border border-[#222834] text-[#8c8273] hover:text-[#ede8dd] uppercase tracking-wider"
                  >
                    CANCEL
                  </button>
                  <button
                    type="submit"
                    disabled={createLoading}
                    className="px-5 py-2 bg-[#c5a059] hover:bg-[#d8b46e] text-[#0b0e14] font-bold uppercase tracking-wider disabled:opacity-50"
                  >
                    {createLoading ? 'CODIFYING...' : 'INITIATE CASE FILE'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
