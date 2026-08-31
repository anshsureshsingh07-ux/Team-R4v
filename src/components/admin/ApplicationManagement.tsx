import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileText, 
  Check, 
  X, 
  HelpCircle, 
  Archive, 
  Search, 
  Filter, 
  RefreshCw, 
  UserCheck, 
  MessageSquare, 
  ExternalLink,
  Shield,
  Eye,
  Clock,
  ArrowRight,
  AlertCircle
} from 'lucide-react';
import { AdminUser, ApplicationRecord } from '../../types';
import { safeFetchJson } from '../../utils/api';

interface ApplicationManagementProps {
  currentUser: AdminUser;
  token: string;
}

export const ApplicationManagement: React.FC<ApplicationManagementProps> = ({
  currentUser,
  token,
}) => {
  const [applications, setApplications] = useState<ApplicationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<ApplicationRecord | null>(null);
  const [appNotifications, setAppNotifications] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [showArchived, setShowArchived] = useState(false);
  const [reviewNoteInput, setReviewNoteInput] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [lastDispatchedNotification, setLastDispatchedNotification] = useState<any | null>(null);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (statusFilter !== 'ALL') queryParams.append('status', statusFilter);
      if (searchQuery.trim()) queryParams.append('search', searchQuery.trim());
      queryParams.append('archived', String(showArchived));

      const res = await safeFetchJson<{
        applications: ApplicationRecord[];
        totalCount: number;
      }>(`/api/admin/applications?${queryParams.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok && res.data?.applications) {
        setApplications(res.data.applications);
        if (selectedApp) {
          const updated = res.data.applications.find((a) => a.id === selectedApp.id);
          if (updated) {
            setSelectedApp(updated);
            fetchAppNotifications(updated.id);
          }
        }
      }
    } catch (err) {
      console.warn('Error fetching applications:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAppNotifications = async (appId: string) => {
    try {
      const res = await safeFetchJson<{
        notifications: any[];
      }>(`/api/admin/notifications?applicationId=${encodeURIComponent(appId)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok && res.data?.notifications) {
        setAppNotifications(res.data.notifications);
      }
    } catch (err) {
      console.warn('Failed to load application notifications:', err);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [token, statusFilter, showArchived]);

  useEffect(() => {
    if (selectedApp) {
      fetchAppNotifications(selectedApp.id);
    } else {
      setAppNotifications([]);
    }
  }, [selectedApp?.id]);

  const handleStatusChange = async (appId: string, newStatus: 'Approved' | 'Rejected' | 'On Hold' | 'Needs Review' | 'Pending') => {
    setActionLoading(true);
    try {
      const res = await safeFetchJson<{ success: boolean; application: ApplicationRecord; notification?: any }>(
        `/api/admin/applications/${appId}/status`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status: newStatus,
            reviewNotes: reviewNoteInput.trim() || undefined,
          }),
        }
      );

      if (res.ok && res.data?.success) {
        setStatusMessage(`Dossier ${appId} adjudicated as [${newStatus}]. Automated decision notice dispatched.`);
        if (res.data.notification) {
          setLastDispatchedNotification(res.data.notification);
        }
        setReviewNoteInput('');
        fetchApplications();
        fetchAppNotifications(appId);
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    } finally {
      setActionLoading(false);
      setTimeout(() => setStatusMessage(null), 5000);
    }
  };

  const handleResendNotification = async (appId: string) => {
    setActionLoading(true);
    try {
      const res = await safeFetchJson<{ success: boolean; message: string; notification: any }>(
        '/api/admin/notifications/resend',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ applicationId: appId }),
        }
      );
      if (res.ok && res.data?.success) {
        setStatusMessage(`Decision notice re-dispatched to ${selectedApp?.email}.`);
        fetchAppNotifications(appId);
      }
    } catch (err) {
      console.error('Failed to resend notice:', err);
    } finally {
      setActionLoading(false);
      setTimeout(() => setStatusMessage(null), 4000);
    }
  };

  const handleArchiveToggle = async (appId: string, currentArchived: boolean) => {
    setActionLoading(true);
    try {
      const res = await safeFetchJson<{ success: boolean }>(
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

      if (res.ok) {
        fetchApplications();
        if (selectedApp?.id === appId) {
          setSelectedApp(null);
        }
      }
    } catch (err) {
      console.error('Failed to toggle archive:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Approved':
        return 'bg-[#22c55e]/10 text-[#22c55e] border-[#22c55e]/40';
      case 'Rejected':
        return 'bg-[#ef4444]/10 text-[#ef4444] border-[#ef4444]/40';
      case 'Needs Review':
        return 'bg-[#f59e0b]/10 text-[#f59e0b] border-[#f59e0b]/40';
      default:
        return 'bg-[#38bdf8]/10 text-[#38bdf8] border-[#38bdf8]/40';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Filter & Action Bar */}
      <div className="bg-[#0b0e14] border border-[#222834] p-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-serif font-bold text-[#ede8dd] tracking-wide flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#c5a059]" />
              <span>MEMBERSHIP INTAKE & APPLICATION DOSSIERS</span>
            </h2>
            <p className="text-xs text-[#8c8273] font-mono mt-0.5">
              Review, scrutinize, and approve prospective operatives into the central roster.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setShowArchived(!showArchived)}
              className={`px-3 py-1.5 text-xs font-mono border transition-colors flex items-center gap-1.5 ${
                showArchived
                  ? 'bg-[#c5a059]/20 border-[#c5a059] text-[#ede8dd]'
                  : 'bg-[#121620] border-[#222834] text-[#8c8273] hover:text-[#ede8dd]'
              }`}
            >
              <Archive className="w-3.5 h-3.5" />
              <span>{showArchived ? 'VIEWING ARCHIVED' : 'SHOW ARCHIVED'}</span>
            </button>

            <button
              onClick={fetchApplications}
              className="px-3 py-1.5 bg-[#121620] border border-[#222834] hover:border-[#8c8273] text-xs font-mono text-[#ede8dd] flex items-center gap-1.5 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-[#c5a059] ${loading ? 'animate-spin' : ''}`} />
              <span>REFRESH</span>
            </button>
          </div>
        </div>

        {/* Search & Filter Sub-Bar */}
        <div className="mt-4 pt-4 border-t border-[#1a202c] flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchApplications()}
              placeholder="Search by callsign, email, skills, or reason..."
              className="w-full bg-[#07090d] border border-[#222834] focus:border-[#c5a059] px-3.5 py-2 pl-9 text-xs text-[#ede8dd] font-mono placeholder:text-[#4a5568] focus:outline-none"
            />
            <Search className="w-4 h-4 text-[#8c8273] absolute left-3 top-2.5" />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-[#8c8273] uppercase">Filter:</span>
            {['ALL', 'Pending', 'Needs Review', 'Approved', 'Rejected'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1.5 text-[11px] font-mono border transition-all ${
                  statusFilter === st
                    ? 'bg-[#c5a059] text-[#0b0e14] border-[#c5a059] font-bold'
                    : 'bg-[#0e121a] border-[#222834] text-[#8c8273] hover:text-[#ede8dd]'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {statusMessage && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 bg-[#172554] border border-[#3b82f6] text-[#93c5fd] text-xs font-mono flex items-center gap-2"
        >
          <Check className="w-4 h-4 text-[#38bdf8]" />
          <span>{statusMessage}</span>
        </motion.div>
      )}

      {/* Main Grid: Application List on Left, Detailed View on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Application List (5 cols on lg) */}
        <div className="lg:col-span-5 space-y-3">
          {loading ? (
            <div className="p-8 text-center bg-[#0b0e14] border border-[#222834] text-xs font-mono text-[#8c8273]">
              LOADING INTAKE RECORDS...
            </div>
          ) : applications.length === 0 ? (
            <div className="p-8 text-center bg-[#0b0e14] border border-[#222834] text-xs font-mono text-[#8c8273]">
              No application dossiers found matching query.
            </div>
          ) : (
            applications.map((app) => {
              const isSelected = selectedApp?.id === app.id;
              return (
                <div
                  key={app.id}
                  onClick={() => {
                    setSelectedApp(app);
                    setReviewNoteInput(app.reviewNotes || '');
                  }}
                  className={`p-4 border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-[#121620] border-[#c5a059] shadow-[0_0_15px_rgba(197,160,89,0.15)]'
                      : 'bg-[#0b0e14] border-[#222834] hover:border-[#3a4454]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <div className="text-[10px] font-mono text-[#c5a059] font-bold">{app.id}</div>
                      <div className="text-sm font-bold text-[#ede8dd] font-serif">{app.username}</div>
                    </div>
                    <span className={`px-2 py-0.5 text-[10px] font-mono uppercase font-bold border ${getStatusBadge(app.status)}`}>
                      {app.status}
                    </span>
                  </div>

                  <p className="text-xs text-[#8c8273] font-sans line-clamp-2 mb-2">
                    {app.reason}
                  </p>

                  <div className="flex items-center justify-between text-[10px] font-mono text-[#5a6578] pt-2 border-t border-[#171c26]">
                    <span>{app.email}</span>
                    <span>{new Date(app.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Dossier Detail View (7 cols on lg) */}
        <div className="lg:col-span-7">
          {selectedApp ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-[#0b0e14] border border-[#222834] p-6 space-y-6 sticky top-6"
            >
              {/* Dossier Header */}
              <div className="flex items-start justify-between pb-4 border-b border-[#222834]">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#c5a059] font-bold">
                      INTAKE DOSSIER FILE
                    </span>
                    <span className="text-[#3a4454]">•</span>
                    <span className="text-[10px] font-mono text-[#8c8273]">{selectedApp.id}</span>
                  </div>
                  <h3 className="text-xl font-serif font-bold text-[#ede8dd] mt-1">
                    {selectedApp.username}
                  </h3>
                  <div className="text-xs font-mono text-[#8c8273] mt-0.5">
                    {selectedApp.email} {selectedApp.socialHandle && `• ${selectedApp.socialHandle}`}
                  </div>
                </div>

                <span className={`px-2.5 py-1 text-xs font-mono uppercase font-bold border ${getStatusBadge(selectedApp.status)}`}>
                  {selectedApp.status}
                </span>
              </div>

              {/* Dossier Details */}
              <div className="space-y-4 text-xs font-sans">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#8c8273] block mb-1 font-bold">
                    PRIMARY REASON FOR JOINING
                  </span>
                  <div className="p-3 bg-[#07090d] border border-[#1d2330] text-[#ede8dd] leading-relaxed">
                    {selectedApp.reason}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-[#8c8273] block mb-1 font-bold">
                      REPRESENTED SKILLS
                    </span>
                    <div className="p-3 bg-[#07090d] border border-[#1d2330] text-[#ede8dd] min-h-[70px]">
                      {selectedApp.skills}
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-[#8c8273] block mb-1 font-bold">
                      PRIOR RELEVANT EXPERIENCE
                    </span>
                    <div className="p-3 bg-[#07090d] border border-[#1d2330] text-[#ede8dd] min-h-[70px]">
                      {selectedApp.experience}
                    </div>
                  </div>
                </div>

                {/* Audit and Reviewer Metadata */}
                <div className="p-3 bg-[#121620] border border-[#222834] text-[11px] font-mono space-y-1 text-[#8c8273]">
                  <div className="flex justify-between">
                    <span>Submitted: {new Date(selectedApp.createdAt).toLocaleString()}</span>
                    <span>Last Updated: {new Date(selectedApp.updatedAt).toLocaleString()}</span>
                  </div>
                  {selectedApp.reviewedBy && (
                    <div className="text-[#c5a059]">
                      Reviewed by: <span className="font-bold">{selectedApp.reviewedBy}</span>
                    </div>
                  )}
                </div>

                {/* Dispatched Notification History for this Application */}
                <div className="p-3.5 bg-[#090c12] border border-[#222834] space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-[#c5a059] font-bold flex items-center gap-1.5">
                      <Clock size={13} />
                      <span>DISPATCHED DECISION NOTICES ({appNotifications.length})</span>
                    </span>

                    <button
                      onClick={() => handleResendNotification(selectedApp.id)}
                      disabled={actionLoading}
                      className="text-[10px] font-mono text-[#c5a059] hover:text-[#ede8dd] underline flex items-center gap-1 cursor-pointer disabled:opacity-50"
                    >
                      <RefreshCw size={10} className={actionLoading ? 'animate-spin' : ''} />
                      <span>RESEND NOTICE</span>
                    </button>
                  </div>

                  {appNotifications.length === 0 ? (
                    <div className="text-[11px] font-mono text-[#787163] italic">
                      No decision notices dispatched yet. Adjudicating below will immediately trigger Email & In-App delivery.
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-[160px] overflow-y-auto custom-scrollbar">
                      {appNotifications.map((notif: any) => (
                        <div key={notif.id} className="p-2.5 bg-[#07090d] border border-[#1d2330] text-[11px] font-mono space-y-1">
                          <div className="flex items-center justify-between text-[#ede8dd]">
                            <strong className="text-[#c5a059]">{notif.title}</strong>
                            <span className="text-[10px] text-[#787163]">{new Date(notif.createdAt).toLocaleDateString()}</span>
                          </div>
                          <p className="text-[#a8a092] italic">“{notif.message}”</p>
                          <div className="text-[10px] text-[#787163] flex justify-between pt-1 border-t border-[#151922]">
                            <span>Delivery: <strong className="text-[#22c55e]">Email + In-App</strong></span>
                            <span>Recipient: <strong className="text-[#ede8dd]">{notif.applicantEmail}</strong></span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Privacy Zero-IP Guarantee */}
                  <div className="text-[10px] font-mono text-[#8c8273] flex items-center gap-1.5 pt-1 border-t border-[#1a1f2c]">
                    <Shield size={12} className="text-[#22c55e] shrink-0" />
                    <span>Zero-IP Privacy Active: IP metadata strictly quarantined from applicant notices.</span>
                  </div>
                </div>

                {/* Review Notes Input */}
                <div>
                  <label className="text-[10px] font-mono uppercase tracking-widest text-[#8c8273] block mb-1.5 font-bold">
                    INVESTIGATIVE REVIEW NOTES (INTERNAL AUDIT TRAIL)
                  </label>
                  <textarea
                    rows={2}
                    value={reviewNoteInput}
                    onChange={(e) => setReviewNoteInput(e.target.value)}
                    placeholder="Enter review justifications, policy checks, or reasoning before deciding..."
                    className="w-full bg-[#07090d] border border-[#222834] focus:border-[#c5a059] p-3 text-xs text-[#ede8dd] font-mono placeholder:text-[#4a5568] focus:outline-none"
                  />
                </div>
              </div>

              {/* Action Buttons: APPROVED, ON HOLD, REJECTED */}
              <div className="pt-4 border-t border-[#222834] space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    onClick={() => handleStatusChange(selectedApp.id, 'Approved')}
                    disabled={actionLoading}
                    className="p-3 bg-[#22c55e]/10 border border-[#22c55e] hover:bg-[#22c55e]/20 text-[#22c55e] text-xs font-mono font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all disabled:opacity-50 cursor-pointer shadow-[0_0_15px_rgba(34,197,94,0.1)]"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>APPROVE</span>
                  </button>

                  <button
                    onClick={() => handleStatusChange(selectedApp.id, 'On Hold')}
                    disabled={actionLoading}
                    className="p-3 bg-[#f59e0b]/10 border border-[#f59e0b] hover:bg-[#f59e0b]/20 text-[#f59e0b] text-xs font-mono font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all disabled:opacity-50 cursor-pointer shadow-[0_0_15px_rgba(245,158,11,0.1)]"
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>PLACE ON HOLD</span>
                  </button>

                  <button
                    onClick={() => handleStatusChange(selectedApp.id, 'Rejected')}
                    disabled={actionLoading}
                    className="p-3 bg-[#ef4444]/10 border border-[#ef4444] hover:bg-[#ef4444]/20 text-[#ef4444] text-xs font-mono font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all disabled:opacity-50 cursor-pointer shadow-[0_0_15px_rgba(239,68,68,0.1)]"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>REJECT</span>
                  </button>
                </div>

                <div className="flex items-center justify-between text-[11px] font-mono text-[#8c8273]">
                  <button
                    onClick={() => handleStatusChange(selectedApp.id, 'Pending')}
                    disabled={actionLoading}
                    className="hover:text-[#ede8dd] underline cursor-pointer"
                  >
                    Reset Status to Pending
                  </button>

                  <button
                    onClick={() => handleArchiveToggle(selectedApp.id, !!selectedApp.archived)}
                    disabled={actionLoading}
                    className="hover:text-[#ede8dd] flex items-center gap-1 uppercase tracking-wider cursor-pointer"
                  >
                    <Archive className="w-3.5 h-3.5" />
                    <span>{selectedApp.archived ? 'UNARCHIVE DOSSIER' : 'ARCHIVE DOSSIER'}</span>
                  </button>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="h-full min-h-[350px] bg-[#0b0e14] border border-[#222834] p-8 flex flex-col items-center justify-center text-center text-[#8c8273]">
              <Eye className="w-8 h-8 text-[#3a4454] mb-3" />
              <h4 className="text-sm font-serif font-bold text-[#ede8dd]">NO DOSSIER SELECTED</h4>
              <p className="text-xs font-mono mt-1 max-w-xs">
                Select an applicant file from the left column to inspect background qualifications and execute adjudication.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
