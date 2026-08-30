import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Lock, 
  ShieldCheck, 
  ShieldAlert, 
  LogOut, 
  Search, 
  Filter, 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  Archive, 
  FileText, 
  Clock, 
  User, 
  Mail, 
  Key, 
  AlertTriangle, 
  ArrowLeft, 
  RefreshCw, 
  Send,
  Eye,
  Check,
  ChevronDown,
  Activity,
  Layers,
  FileCheck,
  BookOpen
} from 'lucide-react';
import { ApplicationRecord, AuditLogRecord, ApplicationStatus } from '../types';
import { safeFetchJson, formatErrorMessage } from '../utils/api';
import { AdminMethodsManager } from './AdminMethodsManager';

interface AdminPanelProps {
  onExitAdmin: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ onExitAdmin }) => {
  // Authentication State
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('r4v_admin_token'));
  const [adminEmail, setAdminEmail] = useState<string>('');
  const [loginEmail, setLoginEmail] = useState<string>('');
  const [loginPassword, setLoginPassword] = useState<string>('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);

  // Dashboard Data State
  const [applications, setApplications] = useState<ApplicationRecord[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogRecord[]>([]);
  const [stats, setStats] = useState<{
    totalApplications: number;
    pending: number;
    needsReview: number;
    approved: number;
    rejected: number;
    archived: number;
    totalMethods?: number;
    activeMethods?: number;
    draftMethods?: number;
    archivedMethods?: number;
    totalLogs: number;
  } | null>(null);

  // Active View Tab: 'APPLICATIONS' | 'METHODS' | 'AUDIT_LOGS' | 'DIRECTIVES'
  const [activeTab, setActiveTab] = useState<'APPLICATIONS' | 'METHODS' | 'AUDIT_LOGS' | 'DIRECTIVES'>('APPLICATIONS');


  // Filters & Search
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showArchivedOnly, setShowArchivedOnly] = useState<boolean>(false);
  const [selectedApp, setSelectedApp] = useState<ApplicationRecord | null>(null);
  const [reviewNoteInput, setReviewNoteInput] = useState<string>('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<boolean>(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Verify Token on mount
  useEffect(() => {
    if (!token) return;

    safeFetchJson<{ valid: boolean; email: string }>('/api/auth/verify', {
      headers: { Authorization: `Bearer ${token}` },
    }).then((res) => {
      if (!res.ok || !res.data?.email) {
        localStorage.removeItem('r4v_admin_token');
        setToken(null);
        return;
      }
      setAdminEmail(res.data.email);
      loadDashboardData(token);
    });
  }, [token]);

  // Load Dashboard Data (Applications + Logs + Stats)
  const loadDashboardData = async (authToken: string) => {
    try {
      // 1. Fetch applications
      const appsRes = await safeFetchJson<{ applications: ApplicationRecord[] }>(
        '/api/admin/applications?archived=false',
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      if (appsRes.ok && appsRes.data?.applications) {
        setApplications(appsRes.data.applications);
      }

      // 2. Fetch stats
      const statsRes = await safeFetchJson<{
        stats: {
          totalApplications: number;
          pending: number;
          needsReview: number;
          approved: number;
          rejected: number;
          archived: number;
          totalLogs: number;
        };
      }>('/api/admin/stats', {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (statsRes.ok && statsRes.data?.stats) {
        setStats(statsRes.data.stats);
      }

      // 3. Fetch audit logs
      const logsRes = await safeFetchJson<{ logs: AuditLogRecord[] }>(
        '/api/admin/audit-logs?limit=50',
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      if (logsRes.ok && logsRes.data?.logs) {
        setAuditLogs(logsRes.data.logs);
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    }
  };

  // Login handler
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setIsLoggingIn(true);

    try {
      const response = await safeFetchJson<{
        token: string;
        admin: { email: string; role: string; expiresIn: string };
      }>('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });

      if (!response.ok || !response.data?.token) {
        const errorMsg = formatErrorMessage(
          response.error,
          'Authentication rejected by central terminal.'
        );
        throw new Error(errorMsg);
      }

      const data = response.data;
      localStorage.setItem('r4v_admin_token', data.token);
      setToken(data.token);
      setAdminEmail(data.admin.email);
      setLoginPassword('');
      loadDashboardData(data.token);
    } catch (err: unknown) {
      const msg = formatErrorMessage(
        err,
        'Authentication rejected by central terminal.'
      );
      setLoginError(msg);
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Logout handler
  const handleLogout = async () => {
    if (token) {
      try {
        await safeFetchJson('/api/auth/logout', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch {
        // ignore
      }
    }
    localStorage.removeItem('r4v_admin_token');
    setToken(null);
    setAdminEmail('');
    setSelectedApp(null);
  };

  // Update Status Action (Approve, Reject, Request More Info)
  const handleUpdateStatus = async (appId: string, newStatus: ApplicationStatus) => {
    if (!token) return;
    setIsUpdatingStatus(true);

    try {
      const res = await safeFetchJson<{ application: ApplicationRecord }>(
        `/api/admin/applications/${appId}/status`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status: newStatus,
            reviewNotes: reviewNoteInput,
          }),
        }
      );

      if (!res.ok || !res.data?.application) {
        throw new Error(formatErrorMessage(res.error, 'Failed to update application status.'));
      }

      const updatedApp = res.data.application;
      // Update state locally
      setApplications((prev) =>
        prev.map((app) => (app.id === appId ? updatedApp : app))
      );
      if (selectedApp?.id === appId) {
        setSelectedApp(updatedApp);
      }

      triggerNotification(`Application ${appId} status set to [${newStatus}]`);
      loadDashboardData(token);
    } catch (err: unknown) {
      const msg = formatErrorMessage(err, 'Error updating status.');
      alert(msg);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Save Notes Action
  const handleSaveNotes = async (appId: string) => {
    if (!token) return;

    try {
      const res = await safeFetchJson<{ application: ApplicationRecord }>(
        `/api/admin/applications/${appId}/notes`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ reviewNotes: reviewNoteInput }),
        }
      );

      if (!res.ok || !res.data?.application) {
        throw new Error(formatErrorMessage(res.error, 'Failed to update notes.'));
      }

      const updatedApp = res.data.application;
      setApplications((prev) =>
        prev.map((app) => (app.id === appId ? updatedApp : app))
      );
      if (selectedApp?.id === appId) {
        setSelectedApp(updatedApp);
      }
      triggerNotification(`Review notes saved for ${appId}`);
      loadDashboardData(token);
    } catch (err: unknown) {
      const msg = formatErrorMessage(err, 'Error updating notes.');
      alert(msg);
    }
  };

  // Archive / Unarchive Action
  const handleToggleArchive = async (appId: string, currentArchived: boolean | undefined) => {
    if (!token) return;

    try {
      const res = await safeFetchJson<{ application: ApplicationRecord }>(
        `/api/admin/applications/${appId}/archive`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ archived: !currentArchived }),
        }
      );

      if (!res.ok || !res.data?.application) {
        throw new Error(formatErrorMessage(res.error, 'Failed to archive application.'));
      }

      const updatedApp = res.data.application;
      setApplications((prev) =>
        prev.map((app) => (app.id === appId ? updatedApp : app))
      );
      if (selectedApp?.id === appId) {
        setSelectedApp(updatedApp);
      }
      triggerNotification(`Application ${appId} ${!currentArchived ? 'ARCHIVED' : 'UNARCHIVED'}`);
      loadDashboardData(token);
    } catch (err: unknown) {
      const msg = formatErrorMessage(err, 'Error toggling archive.');
      alert(msg);
    }
  };

  const triggerNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  // Filtered applications
  const filteredApplications = useMemo(() => {
    return applications.filter((app) => {
      // Archive filter
      if (showArchivedOnly && !app.archived) return false;
      if (!showArchivedOnly && app.archived) return false;

      // Status filter
      if (statusFilter !== 'ALL' && app.status !== statusFilter) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchId = app.id.toLowerCase().includes(q);
        const matchName = app.username.toLowerCase().includes(q);
        const matchEmail = app.email.toLowerCase().includes(q);
        const matchSkills = app.skills.toLowerCase().includes(q);
        const matchReason = app.reason.toLowerCase().includes(q);
        const matchHandle = app.socialHandle?.toLowerCase().includes(q);
        if (!matchId && !matchName && !matchEmail && !matchSkills && !matchReason && !matchHandle) {
          return false;
        }
      }

      return true;
    });
  }, [applications, statusFilter, searchQuery, showArchivedOnly]);

  // If not logged in, render 1920s Classified Login Screen
  if (!token) {
    return (
      <div className="min-h-screen bg-[#080a0d] text-[#e3ded4] flex flex-col justify-between film-grain select-none">
        {/* Top Header Bar */}
        <div className="border-b border-[#1f242e] bg-[#0c0e12] px-6 py-4 flex items-center justify-between">
          <button
            onClick={onExitAdmin}
            className="flex items-center gap-2 text-xs font-mono-vintage text-[#c5a059] hover:text-[#fff6e5] transition-colors"
          >
            <ArrowLeft size={14} />
            <span>RETURN TO PUBLIC BUREAU</span>
          </button>
          <span className="font-mono-vintage text-[11px] text-[#6e675b] tracking-widest uppercase">
            SECURE TERMINAL // CLEARANCE REQUIRED
          </span>
        </div>

        {/* Center Login Card */}
        <div className="flex-1 flex items-center justify-center p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="w-full max-w-md bg-[#11141a] border-2 border-[#8c6d32] p-8 shadow-[0_20px_80px_rgba(0,0,0,0.95)] relative overflow-hidden"
          >
            {/* Top Red Security Ribbon */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#8c1d1d]" />

            <div className="text-center space-y-3 mb-8">
              <div className="w-12 h-12 mx-auto border-2 border-[#8c6d32] bg-[#171a22] flex items-center justify-center text-[#c5a059] transform rotate-45 mb-4 shadow-[0_0_20px_rgba(197,160,89,0.2)]">
                <Lock size={20} className="transform -rotate-45" />
              </div>

              <h1 className="font-cinzel text-2xl font-black text-[#ede8dd] tracking-[0.2em] uppercase">
                TEAM R4V — OWNER & PILOT PANEL
              </h1>
              <p className="font-mono-vintage text-xs tracking-[0.25em] text-[#c5a059] uppercase font-bold">
                CLASSIFIED PILOT MANAGEMENT SYSTEM
              </p>
              <div className="pt-2">
                <span className="stamp-sealed text-[10px]">OWNER CLEARANCE REQUIRED</span>
              </div>
            </div>

            {loginError && (
              <div className="mb-6 p-4 bg-[#3d1214] border border-[#8c1d1d] text-[#f2a2a6] text-xs font-mono-vintage flex items-start gap-2">
                <AlertTriangle size={15} className="shrink-0 mt-0.5" />
                <span>{loginError}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block font-mono-vintage text-xs text-[#8c6d32] uppercase tracking-wider mb-2">
                  PILOT IDENTIFIER / AUTHORIZED EMAIL
                </label>
                <div className="relative">
                  <Mail size={14} className="absolute left-3.5 top-3.5 text-[#5e584d]" />
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="Enter authorized bureau email"
                    className="w-full bg-[#0a0c0f] border border-[#272d3a] focus:border-[#c5a059] pl-10 pr-4 py-2.5 text-xs font-mono-vintage text-[#ede8dd] focus:outline-none placeholder-[#504a40]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-mono-vintage text-xs text-[#8c6d32] uppercase tracking-wider mb-2">
                  CLASSIFIED SECRET KEY / PASSWORD
                </label>
                <div className="relative">
                  <Key size={14} className="absolute left-3.5 top-3.5 text-[#5e584d]" />
                  <input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••••••••••"
                    className="w-full bg-[#0a0c0f] border border-[#272d3a] focus:border-[#c5a059] pl-10 pr-4 py-2.5 text-xs font-mono-vintage text-[#ede8dd] focus:outline-none placeholder-[#504a40]"
                  />
                </div>
              </div>

              <div className="p-3 bg-[#0a0c0f] border border-[#1e232d] text-[11px] font-mono-vintage text-[#7c7567] leading-relaxed">
                Security notice: Terminal access is strictly restricted to authorized personnel. Failed attempts are recorded in the central audit ledger.
              </div>

              <button
                type="submit"
                disabled={isLoggingIn}
                id="admin-login-submit-btn"
                className="w-full py-3.5 bg-gradient-to-r from-[#8c6d32] via-[#c5a059] to-[#dfc181] hover:brightness-110 disabled:opacity-50 text-black font-cinzel font-bold text-xs tracking-[0.25em] uppercase transition-all duration-300 shadow-[0_4px_25px_rgba(197,160,89,0.3)] flex items-center justify-center gap-2 cursor-pointer"
              >
                <Lock size={14} />
                <span>{isLoggingIn ? 'AUTHENTICATING PILOT...' : 'ACCESS THE PILOT'}</span>
              </button>
            </form>
          </motion.div>
        </div>

        {/* Footer */}
        <div className="border-t border-[#1a1e27] bg-[#090b0e] py-3 text-center text-[10px] font-mono-vintage text-[#554f44]">
          BIRMINGHAM BUREAU SECURITY CORE // PROTOCOL 4 ENCRYPTION
        </div>
      </div>
    );
  }

  // Logged-in Dashboard Interface
  return (
    <div className="min-h-screen bg-[#090b0f] text-[#e3ded4] flex flex-col film-grain select-none">
      {/* Toast Notification Banner */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            className="fixed top-4 right-4 z-50 bg-[#161a22] border-2 border-[#c5a059] px-5 py-3 shadow-[0_10px_30px_rgba(0,0,0,0.9)] text-xs font-mono-vintage text-[#ede8dd] flex items-center gap-3"
          >
            <CheckCircle2 size={16} className="text-[#c5a059]" />
            <span>{notification}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Classified Header */}
      <header className="border-b-2 border-[#1f242f] bg-[#0e1117] sticky top-0 z-40 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between py-4 gap-4">
            {/* Title */}
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#181d26] border border-[#8c6d32] text-[#c5a059]">
                <ShieldCheck size={22} />
              </div>
              <div>
                <h1 className="font-cinzel text-xl sm:text-2xl font-black text-[#ede8dd] tracking-[0.15em] uppercase">
                  TEAM R4V — OWNER & PILOT PANEL
                </h1>
                <p className="font-mono-vintage text-[11px] tracking-[0.25em] text-[#c5a059] uppercase font-bold">
                  CLASSIFIED PILOT MANAGEMENT SYSTEM // LOGGED AS: {adminEmail}
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => loadDashboardData(token)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#141720] border border-[#272d3b] hover:border-[#c5a059] text-xs font-mono-vintage text-[#9f9788] hover:text-[#ede8dd] transition-colors"
                title="Refresh Ledger"
              >
                <RefreshCw size={13} />
                <span className="hidden xs:inline">SYNC</span>
              </button>

              <button
                onClick={onExitAdmin}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#141720] border border-[#272d3b] hover:border-[#c5a059] text-xs font-mono-vintage text-[#c5a059] transition-colors"
              >
                <ArrowLeft size={13} />
                <span>PUBLIC VIEW</span>
              </button>

              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#2d0e11] border border-[#8c1d1d] hover:bg-[#401216] text-xs font-mono-vintage text-[#f2a2a6] transition-colors"
              >
                <LogOut size={13} />
                <span>LOGOUT</span>
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 border-t border-[#1a1e27] pt-2 pb-1 font-mono-vintage text-xs overflow-x-auto custom-scrollbar">
            <button
              onClick={() => setActiveTab('APPLICATIONS')}
              className={`px-4 py-2 border-b-2 font-bold tracking-wider uppercase transition-all whitespace-nowrap ${
                activeTab === 'APPLICATIONS'
                  ? 'border-[#c5a059] text-[#c5a059] bg-[#141720]'
                  : 'border-transparent text-[#7d7568] hover:text-[#ede8dd]'
              }`}
            >
              APPLICATIONS ({applications.length})
            </button>

            <button
              onClick={() => setActiveTab('METHODS')}
              className={`px-4 py-2 border-b-2 font-bold tracking-wider uppercase transition-all whitespace-nowrap ${
                activeTab === 'METHODS'
                  ? 'border-[#c5a059] text-[#c5a059] bg-[#141720]'
                  : 'border-transparent text-[#7d7568] hover:text-[#ede8dd]'
              }`}
            >
              OPERATIONAL METHODS ({stats?.totalMethods !== undefined ? stats.totalMethods : '...'})
            </button>

            <button
              onClick={() => setActiveTab('AUDIT_LOGS')}
              className={`px-4 py-2 border-b-2 font-bold tracking-wider uppercase transition-all whitespace-nowrap ${
                activeTab === 'AUDIT_LOGS'
                  ? 'border-[#c5a059] text-[#c5a059] bg-[#141720]'
                  : 'border-transparent text-[#7d7568] hover:text-[#ede8dd]'
              }`}
            >
              AUDIT LOGS ({auditLogs.length})
            </button>

            <button
              onClick={() => setActiveTab('DIRECTIVES')}
              className={`px-4 py-2 border-b-2 font-bold tracking-wider uppercase transition-all whitespace-nowrap ${
                activeTab === 'DIRECTIVES'
                  ? 'border-[#c5a059] text-[#c5a059] bg-[#141720]'
                  : 'border-transparent text-[#7d7568] hover:text-[#ede8dd]'
              }`}
            >
              SAFETY DIRECTIVES
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ================= SECTION 1: APPLICATIONS ================= */}
        {activeTab === 'APPLICATIONS' && (
          <div className="space-y-8">
            {/* Quick Metrics Bar */}
            {stats && (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 font-mono-vintage">
                <div className="p-3 bg-[#11141a] border border-[#222834]">
                  <span className="text-[10px] text-[#787163] block uppercase">TOTAL</span>
                  <span className="text-xl font-bold text-[#ede8dd]">{stats.totalApplications}</span>
                </div>
                <div className="p-3 bg-[#11141a] border border-[#8c6d32]/50">
                  <span className="text-[10px] text-[#c5a059] block uppercase">PENDING</span>
                  <span className="text-xl font-bold text-[#c5a059]">{stats.pending}</span>
                </div>
                <div className="p-3 bg-[#11141a] border border-[#b87333]/50">
                  <span className="text-[10px] text-[#d48c46] block uppercase">NEEDS REVIEW</span>
                  <span className="text-xl font-bold text-[#d48c46]">{stats.needsReview}</span>
                </div>
                <div className="p-3 bg-[#11141a] border border-[#235e39]/50">
                  <span className="text-[10px] text-[#6bd18d] block uppercase">APPROVED</span>
                  <span className="text-xl font-bold text-[#6bd18d]">{stats.approved}</span>
                </div>
                <div className="p-3 bg-[#11141a] border border-[#8c1d1d]/50">
                  <span className="text-[10px] text-[#df878b] block uppercase">REJECTED</span>
                  <span className="text-xl font-bold text-[#df878b]">{stats.rejected}</span>
                </div>
                <div className="p-3 bg-[#11141a] border border-[#303848]">
                  <span className="text-[10px] text-[#828da0] block uppercase">ARCHIVED</span>
                  <span className="text-xl font-bold text-[#828da0]">{stats.archived}</span>
                </div>
              </div>
            )}

            {/* Filter Toolbar */}
            <div className="bg-[#12151c] border border-[#252b38] p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
              {/* Status Chips */}
              <div className="flex flex-wrap items-center gap-1.5 font-mono-vintage text-xs">
                {['ALL', 'Pending', 'Needs Review', 'Approved', 'Rejected'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-3 py-1.5 border tracking-wider uppercase transition-all ${
                      statusFilter === st
                        ? 'bg-[#c5a059] text-black border-[#c5a059] font-bold'
                        : 'bg-[#0a0c0f] text-[#857d6f] border-[#222834] hover:text-[#ede8dd]'
                    }`}
                  >
                    {st}
                  </button>
                ))}

                <button
                  onClick={() => setShowArchivedOnly(!showArchivedOnly)}
                  className={`px-3 py-1.5 border tracking-wider uppercase transition-all flex items-center gap-1.5 ${
                    showArchivedOnly
                      ? 'bg-[#3b4455] text-white border-[#6c7b96] font-bold'
                      : 'bg-[#0a0c0f] text-[#6b7382] border-[#222834] hover:text-[#ede8dd]'
                  }`}
                >
                  <Archive size={12} />
                  <span>{showArchivedOnly ? 'SHOWING ARCHIVED' : 'ARCHIVED'}</span>
                </button>
              </div>

              {/* Search Bar */}
              <div className="relative w-full md:w-80">
                <Search size={14} className="absolute left-3 top-3 text-[#61594d]" />
                <input
                  type="text"
                  placeholder="Search by ID, operative, skill, email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#0a0c0f] border border-[#252b38] focus:border-[#c5a059] pl-9 pr-4 py-2 text-xs font-mono-vintage text-[#ede8dd] placeholder-[#504a40] focus:outline-none"
                />
              </div>
            </div>

            {/* Applications List */}
            {filteredApplications.length === 0 ? (
              <div className="bg-[#12151c] border border-[#252b38] p-12 text-center space-y-3 font-mono-vintage">
                <FileText size={36} className="mx-auto text-[#554d41]" />
                <h3 className="text-sm font-bold text-[#ede8dd] tracking-wider uppercase">
                  NO DOSSIERS MATCH CURRENT FILTERS
                </h3>
                <p className="text-xs text-[#787062]">
                  Try clearing the search query or changing the status filter.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {filteredApplications.map((app) => (
                  <motion.div
                    key={app.id}
                    layout
                    className={`bg-[#11141a] border-2 transition-all p-5 sm:p-6 shadow-md relative overflow-hidden ${
                      selectedApp?.id === app.id
                        ? 'border-[#c5a059] bg-[#141720]'
                        : 'border-[#222834] hover:border-[#3d4557]'
                    }`}
                  >
                    {/* Header Row */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#1e2430]">
                      <div className="flex items-center gap-3">
                        <span className="px-2.5 py-1 bg-[#1a1e27] border border-[#303848] text-xs font-mono-vintage text-[#c5a059] font-bold tracking-widest">
                          {app.id}
                        </span>
                        <div>
                          <h3 className="font-cinzel text-base sm:text-lg font-bold text-[#ede8dd]">
                            {app.username}
                          </h3>
                          <span className="text-xs font-mono-vintage text-[#7c7567]">
                            {app.email} {app.socialHandle && `// ${app.socialHandle}`}
                          </span>
                        </div>
                      </div>

                      {/* Status Stamp */}
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-3 py-1 font-mono-vintage text-xs font-bold tracking-widest uppercase border ${
                            app.status === 'Approved'
                              ? 'bg-[#183822] text-[#86e8a4] border-[#29663d]'
                              : app.status === 'Rejected'
                              ? 'bg-[#3b1517] text-[#f2a2a6] border-[#8c1d1d]'
                              : app.status === 'Needs Review'
                              ? 'bg-[#3d2714] text-[#f0ba84] border-[#8f5625]'
                              : 'bg-[#382d16] text-[#e8cc8b] border-[#856526]'
                          }`}
                        >
                          {app.status}
                        </span>
                        {app.archived && (
                          <span className="px-2 py-1 bg-[#252a36] text-[#9ca7ba] text-[10px] font-mono-vintage border border-[#3d4659]">
                            ARCHIVED
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Content Excerpt / Details */}
                    <div className="py-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono-vintage">
                      <div className="p-3 bg-[#0a0c0f] border border-[#1c222c] space-y-1">
                        <span className="text-[10px] text-[#736c5f] uppercase block font-bold">
                          REASON FOR ENLISTMENT
                        </span>
                        <p className="text-[#cdc4b4] leading-relaxed line-clamp-3">
                          {app.reason}
                        </p>
                      </div>

                      <div className="p-3 bg-[#0a0c0f] border border-[#1c222c] space-y-1">
                        <span className="text-[10px] text-[#736c5f] uppercase block font-bold">
                          RELEVANT SKILLS & COMPETENCIES
                        </span>
                        <p className="text-[#cdc4b4] leading-relaxed line-clamp-3">
                          {app.skills}
                        </p>
                      </div>

                      <div className="p-3 bg-[#0a0c0f] border border-[#1c222c] space-y-1">
                        <span className="text-[10px] text-[#736c5f] uppercase block font-bold">
                          PREVIOUS EXPERIENCE
                        </span>
                        <p className="text-[#cdc4b4] leading-relaxed line-clamp-3">
                          {app.experience}
                        </p>
                      </div>
                    </div>

                    {/* Review Notes Excerpt if exists */}
                    {app.reviewNotes && (
                      <div className="mb-4 p-3 bg-[#16141a] border-l-2 border-[#c5a059] text-xs font-mono-vintage text-[#dfd7c8]">
                        <strong className="text-[#c5a059] block mb-0.5">AUDITOR REVIEW NOTES:</strong>
                        {app.reviewNotes}
                      </div>
                    )}

                    {/* Bottom Action Row */}
                    <div className="pt-3 border-t border-[#1e2430] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 font-mono-vintage text-xs">
                      <div className="text-[11px] text-[#6d6659]">
                        INTAKE: {new Date(app.createdAt).toLocaleString()}
                        {app.reviewedBy && ` // REVIEWED BY: ${app.reviewedBy}`}
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        {/* Inspection Trigger */}
                        <button
                          onClick={() => {
                            setSelectedApp(app);
                            setReviewNoteInput(app.reviewNotes || '');
                          }}
                          className="px-3 py-1.5 bg-[#181d26] border border-[#303848] hover:border-[#c5a059] text-[#ede8dd] tracking-wider uppercase transition-colors flex items-center gap-1.5 cursor-pointer"
                        >
                          <Eye size={13} className="text-[#c5a059]" />
                          <span>INSPECT DOSSIER</span>
                        </button>

                        {/* Direct Status Buttons */}
                        <button
                          disabled={isUpdatingStatus}
                          onClick={() => handleUpdateStatus(app.id, 'Approved')}
                          className="px-3 py-1.5 bg-[#183822] hover:bg-[#204a2d] border border-[#29663d] text-[#86e8a4] tracking-wider uppercase font-bold transition-colors cursor-pointer"
                        >
                          APPROVE
                        </button>

                        <button
                          disabled={isUpdatingStatus}
                          onClick={() => handleUpdateStatus(app.id, 'Needs Review')}
                          className="px-3 py-1.5 bg-[#3d2714] hover:bg-[#523318] border border-[#8f5625] text-[#f0ba84] tracking-wider uppercase font-bold transition-colors cursor-pointer"
                        >
                          REQUEST INFO
                        </button>

                        <button
                          disabled={isUpdatingStatus}
                          onClick={() => handleUpdateStatus(app.id, 'Rejected')}
                          className="px-3 py-1.5 bg-[#3b1517] hover:bg-[#4f1a1d] border border-[#8c1d1d] text-[#f2a2a6] tracking-wider uppercase font-bold transition-colors cursor-pointer"
                        >
                          REJECT
                        </button>

                        <button
                          onClick={() => handleToggleArchive(app.id, app.archived)}
                          className="px-2.5 py-1.5 bg-[#12151c] hover:bg-[#1a1f29] border border-[#272f3e] text-[#8e98a8] tracking-wider uppercase transition-colors cursor-pointer"
                          title={app.archived ? 'Restore to Active' : 'Archive Application'}
                        >
                          <Archive size={13} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ================= SECTION 2: OPERATIONAL METHODS ================= */}
        {activeTab === 'METHODS' && token && (
          <AdminMethodsManager
            token={token}
            onTriggerNotification={triggerNotification}
            onRefreshStats={() => loadDashboardData(token)}
          />
        )}

        {/* ================= SECTION 3: AUDIT LOGS ================= */}
        {activeTab === 'AUDIT_LOGS' && (
          <div className="space-y-6">
            <div className="bg-[#12151c] border border-[#252b38] p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-[#202633] pb-4">
                <div>
                  <span className="font-mono-vintage text-[10px] text-[#c5a059] tracking-widest uppercase">
                    SECURITY LEDGER
                  </span>
                  <h2 className="font-cinzel text-xl font-bold text-[#ede8dd]">
                    CENTRAL BUREAU AUDIT TRAIL
                  </h2>
                </div>
                <button
                  onClick={() => loadDashboardData(token)}
                  className="px-3 py-1.5 bg-[#171b24] border border-[#2e3646] hover:border-[#c5a059] text-xs font-mono-vintage text-[#ede8dd] flex items-center gap-1.5"
                >
                  <RefreshCw size={12} />
                  <span>REFRESH AUDIT LOG</span>
                </button>
              </div>

              <div className="space-y-3 font-mono-vintage text-xs">
                {auditLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-3.5 bg-[#0a0c0f] border border-[#1e232c] flex flex-col md:flex-row items-start md:items-center justify-between gap-3 hover:border-[#353e4f] transition-colors"
                  >
                    <div className="flex items-start md:items-center gap-3">
                      <span
                        className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider border shrink-0 ${
                          log.action === 'LOGIN'
                            ? 'bg-[#183822] text-[#86e8a4] border-[#29663d]'
                            : log.action === 'FAILED_LOGIN'
                            ? 'bg-[#3b1517] text-[#f2a2a6] border-[#8c1d1d]'
                            : log.action === 'STATUS_CHANGED'
                            ? 'bg-[#3d2714] text-[#f0ba84] border-[#8f5625]'
                            : log.action === 'APPLICATION_ARCHIVED'
                            ? 'bg-[#202633] text-[#9bb0d1] border-[#384359]'
                            : 'bg-[#181d26] text-[#c5a059] border-[#384359]'
                        }`}
                      >
                        {log.action}
                      </span>
                      <div>
                        <span className="text-[#ede8dd] font-bold">{log.details}</span>
                        <div className="text-[10px] text-[#6d6659] mt-0.5">
                          OPERATOR: {log.adminEmail} {log.targetId && `// TARGET: ${log.targetId}`}
                        </div>
                      </div>
                    </div>

                    <div className="text-[11px] text-[#8c8273] shrink-0">
                      {new Date(log.timestamp).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ================= SECTION 3: DIRECTIVES ================= */}
        {activeTab === 'DIRECTIVES' && (
          <div className="space-y-6">
            <div className="bg-[#12151c] border-2 border-[#8c6d32] p-8 space-y-6">
              <div className="border-b border-[#232a38] pb-4">
                <span className="font-mono-vintage text-xs text-[#c5a059] tracking-widest uppercase">
                  CLASSIFIED CHARTER
                </span>
                <h2 className="font-cinzel text-2xl font-bold text-[#ede8dd] tracking-wider">
                  TEAM R4V GOVERNANCE & RESPONSIBLE REPORTING MANDATE
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-mono-vintage text-xs leading-relaxed">
                <div className="p-5 bg-[#0a0c0f] border border-[#202734] space-y-3">
                  <div className="flex items-center gap-2 text-[#6bd18d] font-bold text-sm">
                    <CheckCircle2 size={16} />
                    <span>PERMITTED ADMINISTRATIVE OPERATIONS</span>
                  </div>
                  <ul className="space-y-2 text-[#cdc4b4] list-disc list-inside">
                    <li>Evaluating applicant credentials and domain competencies.</li>
                    <li>Maintaining verifiable chain-of-custody archive records.</li>
                    <li>Auditing evidence submissions against published platform terms.</li>
                    <li>Submitting documented reports through official platform trust & safety channels.</li>
                  </ul>
                </div>

                <div className="p-5 bg-[#0a0c0f] border border-[#8c1d1d] space-y-3">
                  <div className="flex items-center gap-2 text-[#f2a2a6] font-bold text-sm">
                    <XCircle size={16} />
                    <span>STRICTLY PROHIBITED BEHAVIORS</span>
                  </div>
                  <ul className="space-y-2 text-[#cdc4b4] list-disc list-inside">
                    <li>Automated mass-reporting or bot swarms.</li>
                    <li>Account takedown harassment campaigns.</li>
                    <li>Fabricating or altering archival screenshots/evidence.</li>
                    <li>Targeting accounts for personal grievances or commercial feuds.</li>
                  </ul>
                </div>
              </div>

              <div className="p-4 bg-[#181b22] border-l-4 border-[#c5a059] font-editorial text-sm text-[#cdc4b4] italic">
                “One valid, meticulously documented report supported by platform clauses is stronger than a thousand fraudulent reports. The integrity of the bureau is our only currency.”
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Detailed Dossier Inspection Modal */}
      <AnimatePresence>
        {selectedApp && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto"
            onClick={() => setSelectedApp(null)}
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
                  <span className="font-mono-vintage text-[11px] text-[#c5a059] tracking-widest block uppercase">
                    CONFIDENTIAL APPLICANT DOSSIER
                  </span>
                  <h2 className="font-cinzel text-2xl font-bold text-[#ede8dd]">
                    {selectedApp.username} ({selectedApp.id})
                  </h2>
                </div>
                <button
                  onClick={() => setSelectedApp(null)}
                  className="p-1.5 text-[#888072] hover:text-[#ede8dd] border border-[#262e3d] hover:border-[#c5a059]"
                >
                  <XCircle size={18} />
                </button>
              </div>

              {/* Data Rows */}
              <div className="space-y-4 font-mono-vintage text-xs max-h-[60vh] overflow-y-auto custom-scrollbar pr-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-3 bg-[#090b0e] border border-[#1e2531]">
                    <span className="text-[10px] text-[#71695c] uppercase block">EMAIL</span>
                    <span className="text-[#ede8dd] font-bold">{selectedApp.email}</span>
                  </div>
                  <div className="p-3 bg-[#090b0e] border border-[#1e2531]">
                    <span className="text-[10px] text-[#71695c] uppercase block">SOCIAL IDENTIFIER</span>
                    <span className="text-[#ede8dd]">{selectedApp.socialHandle || 'None provided'}</span>
                  </div>
                </div>

                <div className="p-3 bg-[#090b0e] border border-[#1e2531]">
                  <span className="text-[10px] text-[#71695c] uppercase block font-bold mb-1">
                    WHY JOIN TEAM R4V
                  </span>
                  <p className="text-[#cdc4b4] leading-relaxed">{selectedApp.reason}</p>
                </div>

                <div className="p-3 bg-[#090b0e] border border-[#1e2531]">
                  <span className="text-[10px] text-[#71695c] uppercase block font-bold mb-1">
                    RELEVANT SKILLS
                  </span>
                  <p className="text-[#cdc4b4] leading-relaxed">{selectedApp.skills}</p>
                </div>

                <div className="p-3 bg-[#090b0e] border border-[#1e2531]">
                  <span className="text-[10px] text-[#71695c] uppercase block font-bold mb-1">
                    EXPERIENCE
                  </span>
                  <p className="text-[#cdc4b4] leading-relaxed">{selectedApp.experience}</p>
                </div>

                {/* Review Notes Input */}
                <div className="p-4 bg-[#141822] border border-[#2d3648] space-y-2">
                  <label className="block text-[11px] text-[#c5a059] uppercase tracking-wider font-bold">
                    OFFICER REVIEW NOTES & VETTING MEMORANDUM
                  </label>
                  <textarea
                    rows={3}
                    value={reviewNoteInput}
                    onChange={(e) => setReviewNoteInput(e.target.value)}
                    placeholder="Enter confidential auditor notes, verification cross-checks, or directives..."
                    className="w-full bg-[#090b0e] border border-[#232936] focus:border-[#c5a059] p-3 text-xs font-mono-vintage text-[#ede8dd] focus:outline-none"
                  />
                  <button
                    onClick={() => handleSaveNotes(selectedApp.id)}
                    className="px-4 py-2 bg-[#1b212c] border border-[#353f54] hover:border-[#c5a059] text-xs font-mono-vintage text-[#c5a059] uppercase font-bold tracking-wider cursor-pointer"
                  >
                    SAVE AUDIT NOTES
                  </button>
                </div>
              </div>

              {/* Modal Footer Actions */}
              <div className="pt-4 border-t border-[#202735] flex flex-wrap items-center justify-between gap-3 font-mono-vintage text-xs">
                <span className="text-[#7d7568]">
                  STATUS: <strong className="text-[#ede8dd]">{selectedApp.status}</strong>
                </span>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => handleUpdateStatus(selectedApp.id, 'Approved')}
                    className="px-4 py-2 bg-[#183822] hover:bg-[#204a2d] border border-[#29663d] text-[#86e8a4] font-bold uppercase tracking-wider"
                  >
                    APPROVE APPLICANT
                  </button>

                  <button
                    onClick={() => handleUpdateStatus(selectedApp.id, 'Needs Review')}
                    className="px-4 py-2 bg-[#3d2714] hover:bg-[#523318] border border-[#8f5625] text-[#f0ba84] font-bold uppercase tracking-wider"
                  >
                    REQUEST MORE INFO
                  </button>

                  <button
                    onClick={() => handleUpdateStatus(selectedApp.id, 'Rejected')}
                    className="px-4 py-2 bg-[#3b1517] hover:bg-[#4f1a1d] border border-[#8c1d1d] text-[#f2a2a6] font-bold uppercase tracking-wider"
                  >
                    REJECT APPLICANT
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
