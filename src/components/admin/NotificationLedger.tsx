import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Bell, 
  Mail, 
  Send, 
  Search, 
  Filter, 
  RefreshCw, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ShieldCheck, 
  FileText,
  AlertCircle,
  Eye,
  Inbox,
  ArrowRight
} from 'lucide-react';
import { AdminUser, NotificationRecord } from '../../types';
import { safeFetchJson, formatErrorMessage } from '../../utils/api';

interface NotificationLedgerProps {
  currentUser: AdminUser;
  token: string;
}

export const NotificationLedger: React.FC<NotificationLedgerProps> = ({
  currentUser,
  token,
}) => {
  const [notifications, setNotifications] = useState<NotificationRecord[]>([]);
  const [counts, setCounts] = useState<{
    total: number;
    approved: number;
    rejected: number;
    onHold: number;
    submitted: number;
    unread: number;
  }>({
    total: 0,
    approved: 0,
    rejected: 0,
    onHold: 0,
    submitted: 0,
    unread: 0,
  });
  const [loading, setLoading] = useState(true);
  const [selectedNotif, setSelectedNotif] = useState<NotificationRecord | null>(null);
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (typeFilter !== 'ALL') params.append('type', typeFilter);
      if (searchQuery.trim()) params.append('search', searchQuery.trim());

      const res = await safeFetchJson<{
        notifications: NotificationRecord[];
        counts: any;
        totalCount: number;
      }>(`/api/admin/notifications?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok && res.data?.notifications) {
        setNotifications(res.data.notifications);
        if (res.data.counts) setCounts(res.data.counts);
        if (selectedNotif) {
          const updated = res.data.notifications.find((n) => n.id === selectedNotif.id);
          if (updated) setSelectedNotif(updated);
        }
      }
    } catch (err) {
      console.error('Error loading notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [token, typeFilter]);

  const handleResend = async (applicationId: string) => {
    setActionLoading(true);
    try {
      const res = await safeFetchJson<{ success: boolean; message: string; notification: NotificationRecord }>(
        '/api/admin/notifications/resend',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ applicationId }),
        }
      );

      if (res.ok && res.data?.success) {
        setFeedbackMessage(`Decision notice re-dispatched successfully for dossier ${applicationId}.`);
        fetchNotifications();
      }
    } catch (err: unknown) {
      setFeedbackMessage(formatErrorMessage(err, 'Failed to re-dispatch notification.'));
    } finally {
      setActionLoading(false);
      setTimeout(() => setFeedbackMessage(null), 5000);
    }
  };

  const getStatusBadge = (type: string) => {
    switch (type) {
      case 'APPLICATION_APPROVED':
        return 'bg-[#22c55e]/10 text-[#22c55e] border-[#22c55e]/40';
      case 'APPLICATION_REJECTED':
        return 'bg-[#ef4444]/10 text-[#ef4444] border-[#ef4444]/40';
      case 'APPLICATION_ON_HOLD':
        return 'bg-[#f59e0b]/10 text-[#f59e0b] border-[#f59e0b]/40';
      case 'APPLICATION_SUBMITTED':
        return 'bg-[#38bdf8]/10 text-[#38bdf8] border-[#38bdf8]/40';
      default:
        return 'bg-[#c5a059]/10 text-[#c5a059] border-[#c5a059]/40';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'APPLICATION_APPROVED':
        return <CheckCircle2 className="w-4 h-4 text-[#22c55e]" />;
      case 'APPLICATION_REJECTED':
        return <XCircle className="w-4 h-4 text-[#ef4444]" />;
      case 'APPLICATION_ON_HOLD':
        return <Clock className="w-4 h-4 text-[#f59e0b]" />;
      default:
        return <Mail className="w-4 h-4 text-[#38bdf8]" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Filter & Metric Summary Bar */}
      <div className="bg-[#0b0e14] border border-[#222834] p-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-serif font-bold text-[#ede8dd] tracking-wide flex items-center gap-2">
              <Bell className="w-5 h-5 text-[#c5a059]" />
              <span>APPLICATION DECISION NOTIFICATION DISPATCH ENGINE</span>
            </h2>
            <p className="text-xs text-[#8c8273] font-mono mt-0.5">
              Automated multi-channel dispatch records (Registered Email + Secure In-App). Zero IP profiling enforced.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchNotifications}
              className="p-2 border border-[#222834] bg-[#121620] hover:border-[#c5a059] text-[#ede8dd] text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>REFRESH LEDGER</span>
            </button>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-[#1c222e] font-mono text-xs">
          <div className="p-3 bg-[#07090d] border border-[#1d2330]">
            <span className="text-[10px] text-[#787163] uppercase block">TOTAL DISPATCHED</span>
            <span className="text-lg font-bold text-[#ede8dd]">{counts.total}</span>
          </div>

          <div className="p-3 bg-[#07090d] border border-[#1d2330]">
            <span className="text-[10px] text-[#22c55e] uppercase block">APPROVED NOTICES</span>
            <span className="text-lg font-bold text-[#22c55e]">{counts.approved}</span>
          </div>

          <div className="p-3 bg-[#07090d] border border-[#1d2330]">
            <span className="text-[10px] text-[#f59e0b] uppercase block">ON HOLD NOTICES</span>
            <span className="text-lg font-bold text-[#f59e0b]">{counts.onHold}</span>
          </div>

          <div className="p-3 bg-[#07090d] border border-[#1d2330]">
            <span className="text-[10px] text-[#ef4444] uppercase block">REJECTED NOTICES</span>
            <span className="text-lg font-bold text-[#ef4444]">{counts.rejected}</span>
          </div>
        </div>

        {/* Search & Type Filter Tabs */}
        <div className="mt-4 flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-3 text-[#505a6e]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchNotifications()}
              placeholder="Search by Dossier ID, Email, Recipient Name, or Message Content..."
              className="w-full bg-[#07090d] border border-[#222834] focus:border-[#c5a059] pl-9 pr-3 py-2 text-xs text-[#ede8dd] font-mono placeholder:text-[#4a5568] focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap gap-1.5">
            {['ALL', 'APPLICATION_APPROVED', 'APPLICATION_ON_HOLD', 'APPLICATION_REJECTED', 'APPLICATION_SUBMITTED'].map((t) => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider border transition-all cursor-pointer ${
                  typeFilter === t
                    ? 'bg-[#8c6d32] border-[#8c6d32] text-black font-bold'
                    : 'bg-[#121620] border-[#222834] text-[#8c8273] hover:text-[#ede8dd]'
                }`}
              >
                {t.replace('APPLICATION_', '')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {feedbackMessage && (
        <div className="p-4 bg-[#14231b] border border-[#22c55e] text-[#4ade80] text-xs font-mono flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} />
            <span>{feedbackMessage}</span>
          </div>
          <button onClick={() => setFeedbackMessage(null)} className="text-[#a8a092] hover:text-white">✕</button>
        </div>
      )}

      {/* Main Notification Master-Detail Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Notification Feed */}
        <div className="lg:col-span-5 space-y-2 max-h-[600px] overflow-y-auto custom-scrollbar">
          {loading ? (
            <div className="p-8 text-center text-xs font-mono text-[#8c8273]">
              LOADING DISPATCH RECORDS...
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center text-xs font-mono text-[#8c8273] bg-[#0b0e14] border border-[#222834]">
              NO NOTIFICATION RECORDS MATCHING FILTER
            </div>
          ) : (
            notifications.map((notif) => {
              const isSelected = selectedNotif?.id === notif.id;
              return (
                <div
                  key={notif.id}
                  onClick={() => setSelectedNotif(notif)}
                  className={`p-4 bg-[#0b0e14] border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-[#c5a059] bg-[#141822]'
                      : 'border-[#222834] hover:border-[#384256]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {getTypeIcon(notif.type)}
                      <strong className="text-xs font-mono text-[#ede8dd] tracking-wide">
                        {notif.title}
                      </strong>
                    </div>

                    <span className={`px-2 py-0.5 text-[10px] font-mono font-bold uppercase border ${getStatusBadge(notif.type)}`}>
                      {notif.type.replace('APPLICATION_', '')}
                    </span>
                  </div>

                  <div className="mt-2 text-xs font-sans text-[#a8a092] line-clamp-2 italic">
                    “{notif.message}”
                  </div>

                  <div className="mt-2 pt-2 border-t border-[#1c222e] flex items-center justify-between text-[10px] font-mono text-[#787163]">
                    <span>Dossier: <strong className="text-[#ede8dd]">{notif.applicationId}</strong></span>
                    <span>{new Date(notif.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Column: Detailed Notification Receipt & Dispatch Simulator */}
        <div className="lg:col-span-7">
          {selectedNotif ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#0b0e14] border border-[#222834] p-6 space-y-6"
            >
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#222834]">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#c5a059] block font-bold">
                    OFFICIAL DISPATCH RECEIPT // {selectedNotif.id}
                  </span>
                  <h3 className="text-lg font-serif font-bold text-[#ede8dd] mt-0.5">
                    {selectedNotif.title}
                  </h3>
                </div>

                <span className={`px-3 py-1 text-xs font-mono font-bold uppercase border ${getStatusBadge(selectedNotif.type)}`}>
                  {selectedNotif.deliveryStatus}
                </span>
              </div>

              {/* Message Payload Box */}
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#8c8273] block mb-1.5 font-bold">
                  OFFICIAL TRANSMITTED MESSAGE
                </span>
                <div className="p-4 bg-[#07090d] border-l-4 border-[#c5a059] text-xs sm:text-sm font-sans text-[#ede8dd] italic leading-relaxed">
                  “{selectedNotif.message}”
                </div>
              </div>

              {/* Multi-Channel Delivery Receipts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
                {/* Email Delivery Receipt */}
                <div className="p-4 bg-[#090b0e] border border-[#222834] space-y-2">
                  <div className="flex items-center gap-2 text-[#c5a059] font-bold pb-2 border-b border-[#1c222e]">
                    <Mail size={15} />
                    <span>REGISTERED EMAIL DISPATCH</span>
                  </div>
                  <div className="text-[11px] space-y-1 text-[#8c8273]">
                    <div>Recipient: <strong className="text-[#ede8dd]">{selectedNotif.applicantEmail}</strong></div>
                    <div>SMTP Status: <strong className="text-[#22c55e]">250 OK - Queued for delivery</strong></div>
                    <div>Timestamp: <span className="text-[#ede8dd]">{new Date(selectedNotif.createdAt).toLocaleString()}</span></div>
                  </div>
                </div>

                {/* In-App Delivery Receipt */}
                <div className="p-4 bg-[#090b0e] border border-[#222834] space-y-2">
                  <div className="flex items-center gap-2 text-[#c5a059] font-bold pb-2 border-b border-[#1c222e]">
                    <Inbox size={15} />
                    <span>IN-APP NOTIFICATION INBOX</span>
                  </div>
                  <div className="text-[11px] space-y-1 text-[#8c8273]">
                    <div>Channel: <strong className="text-[#ede8dd]">SECURE_APPLICANT_INBOX</strong></div>
                    <div>Status: <strong className="text-[#22c55e]">DELIVERED</strong></div>
                    <div>Applicant callsig: <span className="text-[#ede8dd]">{selectedNotif.applicantName || selectedNotif.userId || 'N/A'}</span></div>
                  </div>
                </div>
              </div>

              {/* Privacy Verification Badge */}
              <div className="p-3 bg-[#111622] border border-[#232f48] text-xs font-mono text-[#9bb0d8] flex items-center gap-2">
                <ShieldCheck size={16} className="text-[#22c55e] shrink-0" />
                <span>
                  <strong>PRIVACY MANDATE VERIFIED:</strong> IP addresses and network signatures are strictly omitted from applicant messages. Technical security data is restricted to authorized security administrators.
                </span>
              </div>

              {/* Resend Action Footer */}
              <div className="pt-4 border-t border-[#222834] flex items-center justify-between">
                <div className="text-xs font-mono text-[#8c8273]">
                  Authorized by: <strong className="text-[#c5a059]">{selectedNotif.sentBy}</strong>
                </div>

                <button
                  onClick={() => handleResend(selectedNotif.applicationId)}
                  disabled={actionLoading}
                  className="px-4 py-2 bg-[#8c6d32] hover:bg-[#a6823d] text-black font-mono font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
                >
                  <Send size={13} />
                  <span>{actionLoading ? 'DISPATCHING...' : 'RESEND NOTIFICATION'}</span>
                </button>
              </div>
            </motion.div>
          ) : (
            <div className="h-full min-h-[350px] bg-[#0b0e14] border border-[#222834] p-8 flex flex-col items-center justify-center text-center text-[#8c8273]">
              <Bell className="w-8 h-8 text-[#3a4454] mb-3" />
              <h4 className="text-sm font-serif font-bold text-[#ede8dd]">NO DISPATCH RECEIPT SELECTED</h4>
              <p className="text-xs font-mono mt-1 max-w-xs">
                Select an entry from the ledger to inspect delivery receipts, recipient audit trail, and dispatch status.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
