import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit3, 
  Trash2, 
  Eye, 
  CheckCircle2, 
  Clock, 
  Archive, 
  ShieldCheck, 
  Tag, 
  Layers, 
  FileText, 
  Copy, 
  Check, 
  XCircle, 
  AlertTriangle,
  RefreshCw,
  BookOpen,
  Scale,
  SlidersHorizontal,
  ChevronRight
} from 'lucide-react';
import { OperationalMethod, MethodCategory, MethodClearance, MethodStatus } from '../types';
import { safeFetchJson, formatErrorMessage } from '../utils/api';

interface AdminMethodsManagerProps {
  token: string;
  onTriggerNotification: (msg: string) => void;
  onRefreshStats?: () => void;
}

const CATEGORIES: { value: MethodCategory; label: string }[] = [
  { value: 'INVESTIGATION', label: 'Investigation' },
  { value: 'EVIDENCE_AUDIT', label: 'Evidence Audit' },
  { value: 'POLICY_ENFORCEMENT', label: 'Policy Enforcement' },
  { value: 'CASE_MANAGEMENT', label: 'Case Management' },
  { value: 'OSINT_VERIFICATION', label: 'OSINT Verification' },
  { value: 'CUSTOM', label: 'Custom Protocol' },
];

const CLEARANCE_LEVELS: MethodClearance[] = [
  'LEVEL 1',
  'LEVEL 2',
  'LEVEL 3',
  'PILOT EXCLUSIVE',
];

const STATUSES: MethodStatus[] = ['ACTIVE', 'DRAFT', 'ARCHIVED'];

export const AdminMethodsManager: React.FC<AdminMethodsManagerProps> = ({
  token,
  onTriggerNotification,
  onRefreshStats,
}) => {
  const [methods, setMethods] = useState<OperationalMethod[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  // Modals
  const [isFormModalOpen, setIsFormModalOpen] = useState<boolean>(false);
  const [editingMethod, setEditingMethod] = useState<OperationalMethod | null>(null);
  const [viewingMethod, setViewingMethod] = useState<OperationalMethod | null>(null);
  const [isCopied, setIsCopied] = useState<boolean>(false);

  // Form State
  const [formCode, setFormCode] = useState<string>('');
  const [formTitle, setFormTitle] = useState<string>('');
  const [formCategory, setFormCategory] = useState<MethodCategory>('INVESTIGATION');
  const [formClearance, setFormClearance] = useState<MethodClearance>('LEVEL 1');
  const [formStatus, setFormStatus] = useState<MethodStatus>('ACTIVE');
  const [formPlatform, setFormPlatform] = useState<string>('Instagram / Meta');
  const [formSuccessRate, setFormSuccessRate] = useState<string>('99.2%');
  const [formExecutionTime, setFormExecutionTime] = useState<string>('15-45 Minutes');
  const [formSummary, setFormSummary] = useState<string>('');
  const [formContent, setFormContent] = useState<string>('');
  const [formRequirements, setFormRequirements] = useState<string>('');
  const [formPayloadTemplate, setFormPayloadTemplate] = useState<string>('');
  const [formTags, setFormTags] = useState<string>('');
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Load Methods
  const fetchMethods = async () => {
    setIsLoading(true);
    try {
      const res = await safeFetchJson<{ methods: OperationalMethod[] }>('/api/admin/methods', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok && res.data?.methods) {
        setMethods(res.data.methods);
      }
    } catch (err: unknown) {
      console.error('Error fetching methods:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchMethods();
    }
  }, [token]);

  // Open Create Modal
  const handleOpenCreateModal = () => {
    setEditingMethod(null);
    setFormCode(`MTH-${Math.floor(10 + Math.random() * 90)}`);
    setFormTitle('');
    setFormCategory('INVESTIGATION');
    setFormClearance('LEVEL 1');
    setFormStatus('ACTIVE');
    setFormPlatform('Instagram / Meta');
    setFormSuccessRate('99.2%');
    setFormExecutionTime('15-45 Minutes');
    setFormSummary('');
    setFormContent('');
    setFormRequirements('');
    setFormPayloadTemplate('');
    setFormTags('');
    setFormError(null);
    setIsFormModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (method: OperationalMethod) => {
    setEditingMethod(method);
    setFormCode(method.code);
    setFormTitle(method.title);
    setFormCategory(method.category);
    setFormClearance(method.clearanceLevel);
    setFormStatus(method.status);
    setFormPlatform(method.platform || 'Instagram / Meta');
    setFormSuccessRate(method.successRate || '99.2%');
    setFormExecutionTime(method.executionTime || '15-45 Minutes');
    setFormSummary(method.summary);
    setFormContent(method.content);
    setFormRequirements((method.requirements || []).join('\n'));
    setFormPayloadTemplate(method.payloadTemplate || '');
    setFormTags((method.tags || []).join(', '));
    setFormError(null);
    setIsFormModalOpen(true);
  };

  // Save Method (Create or Update)
  const handleSaveMethod = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formTitle.trim() || !formSummary.trim() || !formContent.trim()) {
      setFormError('Title, summary, and protocol instructions are required.');
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        code: formCode.trim().toUpperCase(),
        title: formTitle.trim(),
        category: formCategory,
        clearanceLevel: formClearance,
        status: formStatus,
        platform: formPlatform.trim(),
        successRate: formSuccessRate.trim(),
        executionTime: formExecutionTime.trim(),
        summary: formSummary.trim(),
        content: formContent.trim(),
        payloadTemplate: formPayloadTemplate.trim(),
        requirements: formRequirements
          .split('\n')
          .map((r) => r.trim())
          .filter(Boolean),
        tags: formTags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
      };

      const url = editingMethod
        ? `/api/admin/methods/${editingMethod.id}`
        : '/api/admin/methods';
      const methodType = editingMethod ? 'PUT' : 'POST';

      const res = await safeFetchJson<{ success: boolean; method: OperationalMethod }>(url, {
        method: methodType,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok || !res.data?.method) {
        throw new Error(formatErrorMessage(res.error, 'Failed to save operational method.'));
      }

      onTriggerNotification(
        editingMethod
          ? `Method [${res.data.method.code}] updated in central repository.`
          : `New Method [${res.data.method.code}] registered for lifetime storage.`
      );

      setIsFormModalOpen(false);
      fetchMethods();
      if (onRefreshStats) onRefreshStats();
    } catch (err: unknown) {
      setFormError(formatErrorMessage(err, 'Failed to persist method to registry.'));
    } finally {
      setIsSaving(false);
    }
  };

  // Delete Method
  const handleDeleteMethod = async (id: string, code: string) => {
    const confirmed = window.confirm(
      `CONFIDENTIAL PURGE WARNING:\nAre you sure you want to permanently delete method [${code}] from the Bureau database? This action cannot be reversed.`
    );
    if (!confirmed) return;

    try {
      const res = await safeFetchJson<{ success: boolean; message?: string }>(
        `/api/admin/methods/${id}`,
        {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) {
        throw new Error(formatErrorMessage(res.error, 'Failed to delete method.'));
      }

      onTriggerNotification(`Method [${code}] purged from database.`);
      setMethods((prev) => prev.filter((m) => m.id !== id));
      if (viewingMethod?.id === id) setViewingMethod(null);
      if (onRefreshStats) onRefreshStats();
    } catch (err: unknown) {
      alert(formatErrorMessage(err, 'Error deleting method.'));
    }
  };

  // Quick Toggle Status (Active / Draft / Archived)
  const handleQuickStatus = async (method: OperationalMethod, newStatus: MethodStatus) => {
    try {
      const res = await safeFetchJson<{ success: boolean; method: OperationalMethod }>(
        `/api/admin/methods/${method.id}`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (!res.ok || !res.data?.method) {
        throw new Error(formatErrorMessage(res.error, 'Failed to update status.'));
      }

      setMethods((prev) =>
        prev.map((m) => (m.id === method.id ? { ...m, status: newStatus } : m))
      );
      onTriggerNotification(`Method [${method.code}] status set to [${newStatus}].`);
      if (onRefreshStats) onRefreshStats();
    } catch (err: unknown) {
      alert(formatErrorMessage(err, 'Error updating status.'));
    }
  };

  // Copy Full Protocol Content to Clipboard
  const handleCopyContent = (method: OperationalMethod) => {
    const text = `TEAM R4V OPERATIONAL PROTOCOL: [${method.code}] ${method.title}\nCATEGORY: ${method.category} | CLEARANCE: ${method.clearanceLevel}\n\nEXECUTIVE SUMMARY:\n${method.summary}\n\nPREREQUISITES / CRITERIA:\n${(method.requirements || []).map((r, i) => `${i + 1}. ${r}`).join('\n')}\n\nOPERATIONAL STEPS:\n${method.content}\n\nAUTHOR: ${method.author} | RECORD TIMESTAMP: ${method.createdAt}`;
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  // Filtered Methods
  const filteredMethods = useMemo(() => {
    return methods.filter((m) => {
      // Category filter
      if (selectedCategory !== 'ALL' && m.category !== selectedCategory) {
        return false;
      }
      // Status filter
      if (selectedStatus !== 'ALL' && m.status !== selectedStatus) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesCode = m.code.toLowerCase().includes(q);
        const matchesTitle = m.title.toLowerCase().includes(q);
        const matchesSummary = m.summary.toLowerCase().includes(q);
        const matchesContent = m.content.toLowerCase().includes(q);
        const matchesTags = m.tags && m.tags.some((t) => t.toLowerCase().includes(q));
        if (!matchesCode && !matchesTitle && !matchesSummary && !matchesContent && !matchesTags) {
          return false;
        }
      }
      return true;
    });
  }, [methods, selectedCategory, selectedStatus, searchQuery]);

  // Status badge styling helper
  const getStatusBadge = (status: MethodStatus) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-[#183822] text-[#86e8a4] border-[#29663d]';
      case 'DRAFT':
        return 'bg-[#3d2714] text-[#f0ba84] border-[#8f5625]';
      case 'ARCHIVED':
        return 'bg-[#1c212c] text-[#8fa0ba] border-[#313c50]';
      default:
        return 'bg-[#161a22] text-[#c5a059] border-[#272d3b]';
    }
  };

  // Clearance badge styling helper
  const getClearanceBadge = (level: MethodClearance) => {
    switch (level) {
      case 'PILOT EXCLUSIVE':
        return 'bg-[#3b1517] text-[#f2a2a6] border-[#8c1d1d]';
      case 'LEVEL 3':
        return 'bg-[#3d2714] text-[#f0ba84] border-[#8f5625]';
      case 'LEVEL 2':
        return 'bg-[#292211] text-[#c5a059] border-[#6b5123]';
      default:
        return 'bg-[#141820] text-[#9f9788] border-[#232936]';
    }
  };

  return (
    <div className="space-y-8 font-mono-vintage">
      {/* Top Banner / Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 bg-[#11141a] border border-[#222834]">
          <span className="text-[10px] text-[#787163] uppercase block tracking-wider">TOTAL METHODS</span>
          <span className="text-2xl font-bold text-[#ede8dd]">{methods.length}</span>
          <span className="text-[10px] text-[#554f44] block mt-1">Stored in Lifetime DB</span>
        </div>
        <div className="p-4 bg-[#11141a] border border-[#235e39]/50">
          <span className="text-[10px] text-[#6bd18d] uppercase block tracking-wider">ACTIVE PROTOCOLS</span>
          <span className="text-2xl font-bold text-[#6bd18d]">
            {methods.filter((m) => m.status === 'ACTIVE').length}
          </span>
          <span className="text-[10px] text-[#554f44] block mt-1">Operational</span>
        </div>
        <div className="p-4 bg-[#11141a] border border-[#b87333]/50">
          <span className="text-[10px] text-[#d48c46] uppercase block tracking-wider">DRAFTS IN REVIEW</span>
          <span className="text-2xl font-bold text-[#d48c46]">
            {methods.filter((m) => m.status === 'DRAFT').length}
          </span>
          <span className="text-[10px] text-[#554f44] block mt-1">Pending Clearance</span>
        </div>
        <div className="p-4 bg-[#11141a] border border-[#303848]">
          <span className="text-[10px] text-[#828da0] uppercase block tracking-wider">ARCHIVED PROTOCOLS</span>
          <span className="text-2xl font-bold text-[#828da0]">
            {methods.filter((m) => m.status === 'ARCHIVED').length}
          </span>
          <span className="text-[10px] text-[#554f44] block mt-1">Legacy Records</span>
        </div>
      </div>

      {/* Control Bar */}
      <div className="bg-[#12151c] border border-[#252b38] p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Left: Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filters */}
          <div className="flex items-center gap-1 bg-[#0a0c0f] p-1 border border-[#222834]">
            {['ALL', 'ACTIVE', 'DRAFT', 'ARCHIVED'].map((st) => (
              <button
                key={st}
                onClick={() => setSelectedStatus(st)}
                className={`px-2.5 py-1 text-[11px] tracking-wider uppercase transition-all ${
                  selectedStatus === st
                    ? 'bg-[#c5a059] text-black font-bold'
                    : 'text-[#857d6f] hover:text-[#ede8dd]'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Category Dropdown */}
          <div className="relative">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-[#0a0c0f] border border-[#222834] focus:border-[#c5a059] px-3 py-1.5 text-xs text-[#ede8dd] focus:outline-none"
            >
              <option value="ALL">ALL CATEGORIES</option>
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label.toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          {/* Refresh */}
          <button
            onClick={fetchMethods}
            title="Reload Methods"
            className="p-2 bg-[#0a0c0f] border border-[#222834] hover:border-[#c5a059] text-[#857d6f] hover:text-[#ede8dd] transition-colors"
          >
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
          </button>
        </div>

        {/* Right: Search & Create Button */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 md:w-64">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#645c50]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search code, title, tag..."
              className="w-full bg-[#0a0c0f] border border-[#222834] focus:border-[#c5a059] pl-9 pr-3 py-1.5 text-xs text-[#ede8dd] focus:outline-none placeholder-[#504a40]"
            />
          </div>

          <button
            onClick={handleOpenCreateModal}
            id="admin-create-method-btn"
            className="px-4 py-2 bg-gradient-to-r from-[#8c6d32] via-[#c5a059] to-[#dfc181] hover:brightness-110 text-black font-cinzel font-bold text-xs tracking-wider uppercase flex items-center gap-2 cursor-pointer shadow-[0_2px_15px_rgba(197,160,89,0.25)] whitespace-nowrap"
          >
            <Plus size={14} />
            <span>RECORD NEW METHOD</span>
          </button>
        </div>
      </div>

      {/* Methods Grid / List */}
      {filteredMethods.length === 0 ? (
        <div className="p-12 text-center bg-[#11141a] border border-[#202735] space-y-3">
          <BookOpen size={32} className="mx-auto text-[#62594a]" />
          <h3 className="font-cinzel text-lg font-bold text-[#cdc4b4]">NO OPERATIONAL METHODS FOUND</h3>
          <p className="text-xs text-[#736a5c] max-w-md mx-auto">
            {searchQuery || selectedCategory !== 'ALL' || selectedStatus !== 'ALL'
              ? 'No method entries match the selected filters or search query.'
              : 'No operational procedures are currently recorded in the lifetime database. Click "RECORD NEW METHOD" to initialize your first playbook.'}
          </p>
          <button
            onClick={handleOpenCreateModal}
            className="mt-2 px-4 py-2 bg-[#1b202a] border border-[#c5a059] text-xs text-[#c5a059] hover:bg-[#c5a059] hover:text-black font-bold uppercase transition-all"
          >
            + CREATE FIRST METHOD
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredMethods.map((method) => (
            <div
              key={method.id}
              className="p-5 bg-[#10131a] border border-[#222834] hover:border-[#8c6d32]/60 transition-all space-y-4 flex flex-col justify-between"
            >
              {/* Header: Badges & Actions */}
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2 py-0.5 bg-[#090b0e] border border-[#c5a059] text-[#c5a059] font-bold text-[11px] tracking-widest">
                      {method.code}
                    </span>
                    <span
                      className={`px-2 py-0.5 border text-[10px] font-bold tracking-wider uppercase ${getStatusBadge(
                        method.status
                      )}`}
                    >
                      {method.status}
                    </span>
                    <span
                      className={`px-2 py-0.5 border text-[10px] font-bold tracking-wider uppercase ${getClearanceBadge(
                        method.clearanceLevel
                      )}`}
                    >
                      {method.clearanceLevel}
                    </span>
                  </div>

                  <span className="text-[10px] text-[#696154]">
                    {new Date(method.updatedAt).toLocaleDateString()}
                  </span>
                </div>

                <h3 className="font-cinzel text-base sm:text-lg font-bold text-[#ede8dd] tracking-wide leading-snug">
                  {method.title}
                </h3>
                <span className="text-[11px] text-[#c5a059] tracking-wider uppercase block mt-0.5">
                  CATEGORY: {method.category.replace('_', ' ')}
                </span>

                <p className="text-xs text-[#9f9788] leading-relaxed mt-2 line-clamp-3">
                  {method.summary}
                </p>

                {/* Criteria / Requirements Pills */}
                {method.requirements && method.requirements.length > 0 && (
                  <div className="mt-3 space-y-1">
                    <span className="text-[10px] text-[#71695c] uppercase font-bold block">
                      CORE PREREQUISITES ({method.requirements.length}):
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {method.requirements.slice(0, 3).map((req, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 bg-[#090b0e] border border-[#1d222b] text-[10px] text-[#b3aa9b] flex items-center gap-1"
                        >
                          <CheckCircle2 size={10} className="text-[#6bd18d]" />
                          <span className="truncate max-w-[200px]">{req}</span>
                        </span>
                      ))}
                      {method.requirements.length > 3 && (
                        <span className="px-2 py-0.5 bg-[#090b0e] text-[10px] text-[#71695c]">
                          +{method.requirements.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Tags */}
                {method.tags && method.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {method.tags.map((tag, tIdx) => (
                      <span
                        key={tIdx}
                        className="px-1.5 py-0.5 bg-[#141820] text-[10px] text-[#787163] border border-[#1e2430]"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Bottom Actions Bar */}
              <div className="pt-3 border-t border-[#1d222d] flex items-center justify-between gap-2">
                <button
                  onClick={() => setViewingMethod(method)}
                  className="px-3 py-1.5 bg-[#141822] hover:bg-[#1a202d] border border-[#2c3547] hover:border-[#c5a059] text-xs text-[#ede8dd] flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Eye size={12} className="text-[#c5a059]" />
                  <span>VIEW PROTOCOL</span>
                </button>

                <div className="flex items-center gap-1.5">
                  {/* Status Dropdown Quick Actions */}
                  {method.status !== 'ACTIVE' && (
                    <button
                      onClick={() => handleQuickStatus(method, 'ACTIVE')}
                      title="Activate Protocol"
                      className="px-2 py-1 bg-[#132819] border border-[#235e39] text-[10px] text-[#86e8a4] hover:brightness-110"
                    >
                      ACTIVATE
                    </button>
                  )}
                  {method.status !== 'DRAFT' && (
                    <button
                      onClick={() => handleQuickStatus(method, 'DRAFT')}
                      title="Mark as Draft"
                      className="px-2 py-1 bg-[#2b1c0e] border border-[#7a481c] text-[10px] text-[#f0ba84] hover:brightness-110"
                    >
                      DRAFT
                    </button>
                  )}
                  {method.status !== 'ARCHIVED' && (
                    <button
                      onClick={() => handleQuickStatus(method, 'ARCHIVED')}
                      title="Archive Protocol"
                      className="px-2 py-1 bg-[#181c24] border border-[#2a3446] text-[10px] text-[#8fa0ba] hover:brightness-110"
                    >
                      ARCHIVE
                    </button>
                  )}

                  {/* Edit */}
                  <button
                    onClick={() => handleOpenEditModal(method)}
                    title="Edit Method Dossier"
                    className="p-1.5 bg-[#141720] border border-[#272d3b] hover:border-[#c5a059] text-[#c5a059] transition-colors"
                  >
                    <Edit3 size={13} />
                  </button>

                  {/* Delete */}
                  <button
                    onClick={() => handleDeleteMethod(method.id, method.code)}
                    title="Purge Method"
                    className="p-1.5 bg-[#2d0e11] border border-[#8c1d1d] hover:bg-[#401216] text-[#f2a2a6] transition-colors"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 1: CREATE / EDIT METHOD DOSSIER                   */}
      {/* ======================================================== */}
      <AnimatePresence>
        {isFormModalOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto"
            onClick={() => setIsFormModalOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-3xl my-auto bg-[#0f1218] border-2 border-[#c5a059] p-6 sm:p-8 shadow-[0_20px_80px_rgba(0,0,0,0.95)] relative space-y-6"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-start justify-between border-b border-[#202735] pb-4">
                <div>
                  <span className="text-[11px] text-[#c5a059] tracking-widest block uppercase font-bold">
                    LIFETIME REPOSITORY PROTOCOL MANAGEMENT
                  </span>
                  <h2 className="font-cinzel text-xl sm:text-2xl font-bold text-[#ede8dd]">
                    {editingMethod ? `EDIT METHOD [${editingMethod.code}]` : 'RECORD NEW OPERATIONAL METHOD'}
                  </h2>
                </div>
                <button
                  onClick={() => setIsFormModalOpen(false)}
                  className="p-1.5 text-[#888072] hover:text-[#ede8dd] border border-[#262e3d] hover:border-[#c5a059]"
                >
                  <XCircle size={18} />
                </button>
              </div>

              {/* Form Error Banner */}
              {formError && (
                <div className="p-3 bg-[#2d0e11] border border-[#8c1d1d] text-xs text-[#f2a2a6] flex items-center gap-2">
                  <AlertTriangle size={14} className="shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Form Fields */}
              <form onSubmit={handleSaveMethod} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Code */}
                  <div>
                    <label className="block text-[10px] text-[#8c8273] uppercase tracking-wider mb-1 font-bold">
                      METHOD CODE / IDENTIFIER *
                    </label>
                    <input
                      type="text"
                      required
                      value={formCode}
                      onChange={(e) => setFormCode(e.target.value)}
                      placeholder="e.g. MTH-04"
                      className="w-full bg-[#090b0e] border border-[#222834] focus:border-[#c5a059] px-3 py-2 text-[#ede8dd] focus:outline-none uppercase"
                    />
                  </div>

                  {/* Clearance Level */}
                  <div>
                    <label className="block text-[10px] text-[#8c8273] uppercase tracking-wider mb-1 font-bold">
                      CLEARANCE LEVEL
                    </label>
                    <select
                      value={formClearance}
                      onChange={(e) => setFormClearance(e.target.value as MethodClearance)}
                      className="w-full bg-[#090b0e] border border-[#222834] focus:border-[#c5a059] px-3 py-2 text-[#ede8dd] focus:outline-none"
                    >
                      {CLEARANCE_LEVELS.map((lvl) => (
                        <option key={lvl} value={lvl}>
                          {lvl}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Status */}
                  <div>
                    <label className="block text-[10px] text-[#8c8273] uppercase tracking-wider mb-1 font-bold">
                      OPERATIONAL STATUS
                    </label>
                    <select
                      value={formStatus}
                      onChange={(e) => setFormStatus(e.target.value as MethodStatus)}
                      className="w-full bg-[#090b0e] border border-[#222834] focus:border-[#c5a059] px-3 py-2 text-[#ede8dd] focus:outline-none"
                    >
                      {STATUSES.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Title */}
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] text-[#8c8273] uppercase tracking-wider mb-1 font-bold">
                      METHOD TITLE *
                    </label>
                    <input
                      type="text"
                      required
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      placeholder="e.g. Verified Phishing Infrastructure Dismantling"
                      className="w-full bg-[#090b0e] border border-[#222834] focus:border-[#c5a059] px-3 py-2 text-[#ede8dd] focus:outline-none"
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-[10px] text-[#8c8273] uppercase tracking-wider mb-1 font-bold">
                      CATEGORY
                    </label>
                    <select
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value as MethodCategory)}
                      className="w-full bg-[#090b0e] border border-[#222834] focus:border-[#c5a059] px-3 py-2 text-[#ede8dd] focus:outline-none"
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat.value} value={cat.value}>
                          {cat.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Executive Summary */}
                <div>
                  <label className="block text-[10px] text-[#8c8273] uppercase tracking-wider mb-1 font-bold">
                    EXECUTIVE SUMMARY * (Short description)
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={formSummary}
                    onChange={(e) => setFormSummary(e.target.value)}
                    placeholder="Brief doctrine summary explaining the core objective and forensic standards of this method..."
                    className="w-full bg-[#090b0e] border border-[#222834] focus:border-[#c5a059] p-3 text-[#ede8dd] focus:outline-none leading-relaxed"
                  />
                </div>

                {/* Requirements (One per line) */}
                <div>
                  <label className="block text-[10px] text-[#8c8273] uppercase tracking-wider mb-1 font-bold">
                    PREREQUISITES & MANDATORY EVIDENCE CRITERIA (One per line)
                  </label>
                  <textarea
                    rows={2}
                    value={formRequirements}
                    onChange={(e) => setFormRequirements(e.target.value)}
                    placeholder="e.g.&#10;Wayback snapshot confirmation&#10;SHA-256 integrity hash&#10;Original account handle verification"
                    className="w-full bg-[#090b0e] border border-[#222834] focus:border-[#c5a059] p-3 text-[#ede8dd] focus:outline-none font-mono leading-relaxed"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Platform */}
                  <div>
                    <label className="block text-[10px] text-[#8c8273] uppercase tracking-wider mb-1 font-bold">
                      TARGET PLATFORM
                    </label>
                    <input
                      type="text"
                      value={formPlatform}
                      onChange={(e) => setFormPlatform(e.target.value)}
                      placeholder="e.g. Instagram / Meta"
                      className="w-full bg-[#090b0e] border border-[#222834] focus:border-[#c5a059] px-3 py-2 text-[#ede8dd] focus:outline-none"
                    />
                  </div>

                  {/* Success Rate */}
                  <div>
                    <label className="block text-[10px] text-[#8c8273] uppercase tracking-wider mb-1 font-bold">
                      SUCCESS RATE
                    </label>
                    <input
                      type="text"
                      value={formSuccessRate}
                      onChange={(e) => setFormSuccessRate(e.target.value)}
                      placeholder="e.g. 99.4%"
                      className="w-full bg-[#090b0e] border border-[#222834] focus:border-[#c5a059] px-3 py-2 text-[#ede8dd] focus:outline-none"
                    />
                  </div>

                  {/* Execution Time */}
                  <div>
                    <label className="block text-[10px] text-[#8c8273] uppercase tracking-wider mb-1 font-bold">
                      EXECUTION TIME
                    </label>
                    <input
                      type="text"
                      value={formExecutionTime}
                      onChange={(e) => setFormExecutionTime(e.target.value)}
                      placeholder="e.g. 15-45 Minutes"
                      className="w-full bg-[#090b0e] border border-[#222834] focus:border-[#c5a059] px-3 py-2 text-[#ede8dd] focus:outline-none"
                    />
                  </div>
                </div>

                {/* Step-by-Step Content / Playbook */}
                <div>
                  <label className="block text-[10px] text-[#c5a059] uppercase tracking-wider mb-1 font-bold">
                    METHODOLOGY & STEP-BY-STEP PROTOCOL INSTRUCTIONS *
                  </label>
                  <textarea
                    rows={6}
                    required
                    value={formContent}
                    onChange={(e) => setFormContent(e.target.value)}
                    placeholder="1. Step one instructions...&#10;2. Step two documentation...&#10;3. Evidence verification and final filing..."
                    className="w-full bg-[#090b0e] border border-[#222834] focus:border-[#c5a059] p-3 text-[#ede8dd] focus:outline-none font-mono leading-relaxed"
                  />
                </div>

                {/* Standardized Reporting Payload Template */}
                <div>
                  <label className="block text-[10px] text-[#c5a059] uppercase tracking-wider mb-1 font-bold">
                    STANDARDIZED REPORTING DISPATCH TEMPLATE (Copyable payload)
                  </label>
                  <textarea
                    rows={3}
                    value={formPayloadTemplate}
                    onChange={(e) => setFormPayloadTemplate(e.target.value)}
                    placeholder="[TEAM R4V OFFICIAL DISPATCH]&#10;TARGET: [ENTER_TARGET]&#10;VIOLATION: [TERMS_CLAUSE]&#10;EVIDENCE: [VERIFIED_LINK]"
                    className="w-full bg-[#090b0e] border border-[#222834] focus:border-[#c5a059] p-3 text-[#22c55e] focus:outline-none font-mono text-xs leading-relaxed"
                  />
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-[10px] text-[#8c8273] uppercase tracking-wider mb-1 font-bold">
                    SEARCH & INDEX TAGS (Comma separated)
                  </label>
                  <input
                    type="text"
                    value={formTags}
                    onChange={(e) => setFormTags(e.target.value)}
                    placeholder="Forensics, Archival, Compliance, Telegram, Phishing"
                    className="w-full bg-[#090b0e] border border-[#222834] focus:border-[#c5a059] px-3 py-2 text-[#ede8dd] focus:outline-none"
                  />
                </div>

                {/* Modal Footer Actions */}
                <div className="pt-4 border-t border-[#202735] flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsFormModalOpen(false)}
                    className="px-4 py-2 bg-[#141720] border border-[#272d3b] hover:border-[#c5a059] text-xs text-[#8c8273] hover:text-[#ede8dd]"
                  >
                    CANCEL
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-6 py-2.5 bg-gradient-to-r from-[#8c6d32] via-[#c5a059] to-[#dfc181] hover:brightness-110 disabled:opacity-50 text-black font-cinzel font-bold text-xs tracking-wider uppercase flex items-center gap-2 cursor-pointer shadow-[0_2px_15px_rgba(197,160,89,0.3)]"
                  >
                    <Check size={14} />
                    <span>{isSaving ? 'PERSISTING TO DB...' : editingMethod ? 'SAVE CHANGES' : 'COMMIT TO DATABASE'}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ======================================================== */}
      {/* MODAL 2: FULL METHOD DOSSIER INSPECTOR                   */}
      {/* ======================================================== */}
      <AnimatePresence>
        {viewingMethod && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto"
            onClick={() => setViewingMethod(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-3xl my-auto bg-[#0f1218] border-2 border-[#c5a059] p-6 sm:p-8 shadow-[0_20px_80px_rgba(0,0,0,0.95)] relative space-y-6"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-start justify-between border-b border-[#202735] pb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 bg-[#090b0e] border border-[#c5a059] text-[#c5a059] font-bold text-xs tracking-widest">
                      {viewingMethod.code}
                    </span>
                    <span
                      className={`px-2 py-0.5 border text-[10px] font-bold uppercase ${getStatusBadge(
                        viewingMethod.status
                      )}`}
                    >
                      {viewingMethod.status}
                    </span>
                    <span
                      className={`px-2 py-0.5 border text-[10px] font-bold uppercase ${getClearanceBadge(
                        viewingMethod.clearanceLevel
                      )}`}
                    >
                      {viewingMethod.clearanceLevel}
                    </span>
                  </div>
                  <h2 className="font-cinzel text-xl sm:text-2xl font-bold text-[#ede8dd]">
                    {viewingMethod.title}
                  </h2>
                </div>
                <button
                  onClick={() => setViewingMethod(null)}
                  className="p-1.5 text-[#888072] hover:text-[#ede8dd] border border-[#262e3d] hover:border-[#c5a059]"
                >
                  <XCircle size={18} />
                </button>
              </div>

              {/* Body */}
              <div className="space-y-5 text-xs max-h-[60vh] overflow-y-auto custom-scrollbar pr-2">
                {/* Meta details */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3 bg-[#090b0e] border border-[#1e2531]">
                  <div>
                    <span className="text-[10px] text-[#71695c] uppercase block">CATEGORY</span>
                    <span className="text-[#ede8dd] font-bold">{viewingMethod.category.replace('_', ' ')}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#71695c] uppercase block">AUTHOR</span>
                    <span className="text-[#ede8dd]">{viewingMethod.author}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#71695c] uppercase block">LAST UPDATED</span>
                    <span className="text-[#ede8dd]">
                      {new Date(viewingMethod.updatedAt).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Summary */}
                <div className="p-4 bg-[#090b0e] border border-[#1e2531] space-y-1">
                  <span className="text-[10px] text-[#c5a059] uppercase font-bold tracking-wider block">
                    DOCTRINE & EXECUTIVE SUMMARY
                  </span>
                  <p className="text-[#cdc4b4] leading-relaxed">{viewingMethod.summary}</p>
                </div>

                {/* Requirements */}
                {viewingMethod.requirements && viewingMethod.requirements.length > 0 && (
                  <div className="p-4 bg-[#090b0e] border border-[#1e2531] space-y-2">
                    <span className="text-[10px] text-[#c5a059] uppercase font-bold tracking-wider block">
                      PREREQUISITES & MANDATORY EVIDENCE CRITERIA
                    </span>
                    <ul className="space-y-1.5">
                      {viewingMethod.requirements.map((req, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-[#cdc4b4]">
                          <CheckCircle2 size={13} className="text-[#6bd18d] mt-0.5 shrink-0" />
                          <span>{req}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Full Steps / Content */}
                <div className="p-4 bg-[#12161f] border border-[#2a3446] space-y-2">
                  <span className="text-[10px] text-[#c5a059] uppercase font-bold tracking-wider block">
                    STEP-BY-STEP OPERATIONAL METHODOLOGY
                  </span>
                  <div className="whitespace-pre-wrap font-mono text-xs text-[#ede8dd] leading-relaxed bg-[#090b0e] p-4 border border-[#1d232f]">
                    {viewingMethod.content}
                  </div>
                </div>

                {/* Tags */}
                {viewingMethod.tags && viewingMethod.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {viewingMethod.tags.map((t, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 bg-[#141820] text-[10px] text-[#9a9182] border border-[#222834]"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Modal Footer Actions */}
              <div className="pt-4 border-t border-[#202735] flex items-center justify-between gap-3">
                <button
                  onClick={() => handleCopyContent(viewingMethod)}
                  className="px-4 py-2 bg-[#141822] hover:bg-[#1a202d] border border-[#2c3547] text-xs text-[#ede8dd] flex items-center gap-1.5 cursor-pointer"
                >
                  {isCopied ? <Check size={13} className="text-[#6bd18d]" /> : <Copy size={13} />}
                  <span>{isCopied ? 'COPIED TO CLIPBOARD' : 'COPY PROTOCOL'}</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const m = viewingMethod;
                      setViewingMethod(null);
                      handleOpenEditModal(m);
                    }}
                    className="px-4 py-2 bg-[#1b202c] border border-[#c5a059] text-xs text-[#c5a059] font-bold uppercase hover:bg-[#c5a059] hover:text-black transition-all"
                  >
                    EDIT METHOD
                  </button>
                  <button
                    onClick={() => setViewingMethod(null)}
                    className="px-4 py-2 bg-[#090b0e] border border-[#202735] text-xs text-[#8c8273] hover:text-[#ede8dd]"
                  >
                    CLOSE
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
