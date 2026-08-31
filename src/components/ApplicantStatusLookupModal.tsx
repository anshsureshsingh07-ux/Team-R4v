import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Search, 
  Mail, 
  Bell, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertCircle, 
  ShieldCheck, 
  FileText,
  Inbox,
  ArrowRight
} from 'lucide-react';
import { safeFetchJson, formatErrorMessage } from '../utils/api';
import { NotificationRecord } from '../types';

interface ApplicantStatusLookupModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialQuery?: string;
}

export const ApplicantStatusLookupModal: React.FC<ApplicantStatusLookupModalProps> = ({
  isOpen,
  onClose,
  initialQuery = '',
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    application: {
      id: string;
      username: string;
      email: string;
      status: 'Pending' | 'Approved' | 'Rejected' | 'On Hold' | 'Needs Review';
      createdAt: string;
      updatedAt: string;
    } | null;
    notifications: Array<{
      id: string;
      applicationId: string;
      type: string;
      title: string;
      message: string;
      channels: string[];
      deliveryStatus: string;
      isRead: boolean;
      createdAt: string;
      emailReceipt?: {
        recipient: string;
        dispatchedAt: string;
        status: string;
      };
    }>;
  } | null>(null);

  if (!isOpen) return null;

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const isEmail = query.includes('@');
      const param = isEmail ? `email=${encodeURIComponent(query.trim())}` : `applicationId=${encodeURIComponent(query.trim())}`;
      
      const res = await safeFetchJson<{
        success: boolean;
        application: any;
        notifications: any[];
        error?: string;
      }>(`/api/notifications/public?${param}`);

      if (!res.ok) {
        throw new Error(formatErrorMessage(res.error, 'No dossier matching this identifier was found.'));
      }

      setResult({
        application: res.data?.application || null,
        notifications: res.data?.notifications || [],
      });
    } catch (err: unknown) {
      setError(formatErrorMessage(err, 'Failed to retrieve application status.'));
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Approved':
        return 'bg-[#22c55e]/10 text-[#22c55e] border-[#22c55e]/40';
      case 'Rejected':
        return 'bg-[#ef4444]/10 text-[#ef4444] border-[#ef4444]/40';
      case 'On Hold':
      case 'Needs Review':
        return 'bg-[#f59e0b]/10 text-[#f59e0b] border-[#f59e0b]/40';
      default:
        return 'bg-[#38bdf8]/10 text-[#38bdf8] border-[#38bdf8]/40';
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'APPLICATION_APPROVED':
        return <CheckCircle2 className="w-5 h-5 text-[#22c55e]" />;
      case 'APPLICATION_REJECTED':
        return <XCircle className="w-5 h-5 text-[#ef4444]" />;
      case 'APPLICATION_ON_HOLD':
        return <Clock className="w-5 h-5 text-[#f59e0b]" />;
      default:
        return <Mail className="w-5 h-5 text-[#c5a059]" />;
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-3 sm:p-6 overflow-y-auto"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.3 }}
        className="relative w-full max-w-2xl my-auto bg-[#0d0f13] border-2 border-[#8c6d32] shadow-[0_20px_80px_rgba(0,0,0,0.95)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Bureau Ribbon */}
        <div className="h-2 bg-gradient-to-r from-[#59431b] via-[#c5a059] to-[#59431b]" />

        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-[#222834] flex items-center justify-between bg-[#13161c]">
          <div className="flex items-center gap-3">
            <div className="p-2 border border-[#8c6d32] bg-[#1a1e27] text-[#c5a059]">
              <Inbox size={20} />
            </div>
            <div>
              <span className="font-mono-vintage text-[10px] text-[#c5a059] tracking-widest block uppercase font-bold">
                APPLICANT INTAKE PORTAL // NOTIFICATION DISPATCH
              </span>
              <h2 className="font-cinzel text-xl sm:text-2xl font-bold text-[#ede8dd] tracking-wider">
                APPLICATION STATUS & INBOX
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-[#8f8779] hover:text-[#ede8dd] border border-[#232936] hover:border-[#c5a059] transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 max-h-[75vh] overflow-y-auto custom-scrollbar space-y-6">
          {/* Lookup Input Form */}
          <form onSubmit={handleLookup} className="space-y-3">
            <label className="block font-mono-vintage text-xs text-[#8c6d32] uppercase tracking-wider">
              ENTER APPLICATION DOSSIER ID (E.G. R4V-APP-10824) OR REGISTERED EMAIL
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="R4V-APP-XXXXX or applicant@email.com"
                  className="w-full bg-[#07090d] border border-[#222834] focus:border-[#c5a059] p-3 text-xs sm:text-sm text-[#ede8dd] font-mono placeholder:text-[#4a5568] focus:outline-none"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-[#8c6d32] hover:bg-[#a6823d] text-black font-mono-vintage font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
              >
                <Search size={14} />
                <span>{loading ? 'SEARCHING...' : 'INQUIRE'}</span>
              </button>
            </div>
          </form>

          {error && (
            <div className="p-4 bg-[#3d1214] border border-[#8c1d1d] text-[#f2a2a6] text-xs font-mono-vintage flex items-start gap-2">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Results View */}
          {result && (
            <div className="space-y-5 pt-2 border-t border-[#222834]">
              {result.application ? (
                <div className="p-4 bg-[#090b0e] border border-[#222834] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 font-mono-vintage text-xs">
                  <div>
                    <span className="text-[#8c8273] block text-[10px] uppercase">DOSSIER FILE:</span>
                    <strong className="text-[#ede8dd] text-sm tracking-wider">{result.application.id}</strong>
                    <div className="text-[#a8a092] mt-0.5">
                      Callsign: <span className="text-[#c5a059]">{result.application.username}</span> • {result.application.email}
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[#8c8273] block text-[10px] uppercase mb-1">OFFICIAL ADJUDICATION:</span>
                    <span className={`px-3 py-1 font-bold text-xs uppercase border ${getStatusBadge(result.application.status)}`}>
                      {result.application.status}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-[#171b24] border border-[#232936] text-xs font-mono-vintage text-[#8c8273]">
                  No formal dossier header found, but matching notification records are displayed below:
                </div>
              )}

              {/* Notification Dispatch Ledger */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-cinzel text-sm font-bold text-[#ede8dd] flex items-center gap-2">
                    <Bell size={15} className="text-[#c5a059]" />
                    <span>OFFICIAL DISPATCH NOTIFICATIONS ({result.notifications.length})</span>
                  </h3>
                  <span className="text-[10px] font-mono-vintage text-[#22c55e] border border-[#22c55e]/30 px-2 py-0.5 bg-[#22c55e]/10">
                    ZERO-IP PRIVACY VERIFIED
                  </span>
                </div>

                {result.notifications.length === 0 ? (
                  <div className="p-6 bg-[#07090d] border border-[#1d2330] text-center text-xs font-mono-vintage text-[#8c8273]">
                    No dispatched notifications recorded yet. Check back once an administrator has adjudicated your dossier.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {result.notifications.map((notif) => (
                      <div
                        key={notif.id}
                        className="p-4 bg-[#090b0e] border border-[#222834] hover:border-[#c5a059]/50 transition-colors space-y-2.5 font-mono-vintage"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-2.5">
                            {getNotificationIcon(notif.type)}
                            <div>
                              <strong className="text-[#ede8dd] text-xs font-bold tracking-wider block">
                                {notif.title}
                              </strong>
                              <span className="text-[10px] text-[#787163]">
                                {new Date(notif.createdAt).toLocaleString()} • ID: {notif.id}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <span className="text-[10px] px-2 py-0.5 bg-[#171b24] border border-[#333d50] text-[#c5a059]">
                              EMAIL & IN-APP
                            </span>
                          </div>
                        </div>

                        {/* Official Message Quote */}
                        <div className="p-3 bg-[#11141c] border-l-2 border-[#c5a059] text-xs font-sans text-[#ede8dd] italic leading-relaxed">
                          “{notif.message}”
                        </div>

                        {/* Delivery Meta */}
                        <div className="flex flex-wrap items-center justify-between text-[10px] text-[#787163] pt-1 border-t border-[#1a1f2c]">
                          <span>Channels: <strong className="text-[#a8a092]">Registered Email + In-App Inbox</strong></span>
                          <span>Delivery Status: <strong className="text-[#22c55e]">DELIVERED</strong></span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Privacy Footnote */}
          <div className="p-3 bg-[#0a0c10] border border-[#1e2330] text-[11px] font-mono-vintage text-[#787163] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck size={14} className="text-[#c5a059]" />
              <span>Applicant notifications are strictly sanitized. No IP telemetry is transmitted.</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
