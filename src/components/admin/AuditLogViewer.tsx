import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Activity, 
  Search, 
  Filter, 
  RefreshCw, 
  Shield, 
  AlertTriangle, 
  Clock, 
  User, 
  Terminal,
  Lock,
  Download
} from 'lucide-react';
import { AdminUser, AuditLogRecord } from '../../types';
import { safeFetchJson } from '../../utils/api';

interface AuditLogViewerProps {
  currentUser: AdminUser;
  token: string;
}

export const AuditLogViewer: React.FC<AuditLogViewerProps> = ({
  currentUser,
  token,
}) => {
  const [logs, setLogs] = useState<AuditLogRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');
  const [severityFilter, setSeverityFilter] = useState('ALL');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (actionFilter !== 'ALL') queryParams.append('action', actionFilter);
      if (severityFilter !== 'ALL') queryParams.append('severity', severityFilter);
      if (searchQuery.trim()) queryParams.append('search', searchQuery.trim());
      queryParams.append('limit', '150');

      const res = await safeFetchJson<{ logs: AuditLogRecord[]; totalCount: number }>(
        `/api/admin/audit-logs?${queryParams.toString()}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.ok && res.data?.logs) {
        setLogs(res.data.logs);
      }
    } catch (err) {
      console.warn('Error fetching audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [token, actionFilter, severityFilter]);

  const exportAuditLogJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(logs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `r4v_audit_stream_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const getSeverityBadge = (severity?: string) => {
    switch (severity) {
      case 'SECURITY':
      case 'CRITICAL':
        return 'bg-[#ef4444]/10 text-[#ef4444] border-[#ef4444]/40';
      case 'WARNING':
        return 'bg-[#f59e0b]/10 text-[#f59e0b] border-[#f59e0b]/40';
      default:
        return 'bg-[#38bdf8]/10 text-[#38bdf8] border-[#38bdf8]/40';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#0b0e14] border border-[#222834] p-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-serif font-bold text-[#ede8dd] tracking-wide flex items-center gap-2">
              <Activity className="w-5 h-5 text-[#c5a059]" />
              <span>CLASSIFIED AUDIT STREAM & FORENSIC EVENT TRAIL</span>
            </h2>
            <p className="text-xs text-[#8c8273] font-mono mt-0.5">
              Immutable chronological record of administrative adjudications, authentication events, and policy mutations.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={exportAuditLogJson}
              className="px-3.5 py-2 bg-[#121620] border border-[#222834] hover:border-[#c5a059] text-xs font-mono text-[#ede8dd] flex items-center gap-1.5 transition-colors uppercase tracking-wider"
            >
              <Download className="w-3.5 h-3.5 text-[#c5a059]" />
              <span>EXPORT JSON</span>
            </button>

            <button
              onClick={fetchLogs}
              className="px-3.5 py-2 bg-[#121620] border border-[#222834] hover:border-[#8c8273] text-xs font-mono text-[#ede8dd] flex items-center gap-1.5 transition-colors uppercase tracking-wider"
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
              onKeyDown={(e) => e.key === 'Enter' && fetchLogs()}
              placeholder="Search by admin name, action, target, or details..."
              className="w-full bg-[#07090d] border border-[#222834] focus:border-[#c5a059] px-3.5 py-2 pl-9 text-xs text-[#ede8dd] font-mono placeholder:text-[#4a5568] focus:outline-none"
            />
            <Search className="w-4 h-4 text-[#8c8273] absolute left-3 top-2.5" />
          </div>

          <div>
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="w-full bg-[#07090d] border border-[#222834] focus:border-[#c5a059] px-3 py-2 text-xs text-[#ede8dd] font-mono focus:outline-none"
            >
              <option value="ALL">ALL ACTION TYPES</option>
              <option value="LOGIN">LOGIN</option>
              <option value="LOGOUT">LOGOUT</option>
              <option value="FAILED_LOGIN">FAILED_LOGIN</option>
              <option value="APPLICATION_APPROVED">APPLICATION_APPROVED</option>
              <option value="APPLICATION_REJECTED">APPLICATION_REJECTED</option>
              <option value="CASE_CREATED">CASE_CREATED</option>
              <option value="CASE_UPDATED">CASE_UPDATED</option>
              <option value="SECURITY_EVENT">SECURITY_EVENT</option>
              <option value="ORGANIZATION_UPDATED">ORGANIZATION_UPDATED</option>
            </select>
          </div>

          <div>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="w-full bg-[#07090d] border border-[#222834] focus:border-[#c5a059] px-3 py-2 text-xs text-[#ede8dd] font-mono focus:outline-none"
            >
              <option value="ALL">ALL SEVERITIES</option>
              <option value="INFO">INFO</option>
              <option value="WARNING">WARNING</option>
              <option value="SECURITY">SECURITY / CRITICAL</option>
            </select>
          </div>
        </div>
      </div>

      {/* Logs Stream */}
      <div className="bg-[#0b0e14] border border-[#222834] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs font-mono">
            <thead>
              <tr className="bg-[#0e121a] border-b border-[#222834] text-[#8c8273] uppercase tracking-wider text-[10px]">
                <th className="p-3.5 font-bold">TIMESTAMP (UTC)</th>
                <th className="p-3.5 font-bold">ADMIN & ROLE</th>
                <th className="p-3.5 font-bold">ACTION</th>
                <th className="p-3.5 font-bold">TARGET</th>
                <th className="p-3.5 font-bold">SEVERITY</th>
                <th className="p-3.5 font-bold">OPERATIONAL DETAILS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#171c26]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-[#8c8273]">
                    SYNCHRONIZING AUDIT STREAM...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-[#8c8273]">
                    No audit records match the selected parameters.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#121620]/50 transition-colors">
                    <td className="p-3.5 text-[#5a6578] whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString([], {
                        month: 'short',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })}
                    </td>

                    <td className="p-3.5">
                      <div className="font-bold text-[#ede8dd]">{log.admin}</div>
                      <div className="text-[10px] text-[#c5a059]">{log.adminRole}</div>
                    </td>

                    <td className="p-3.5">
                      <span className="font-bold text-[#38bdf8]">{log.action}</span>
                    </td>

                    <td className="p-3.5 text-[#a09a8e]">
                      {log.target || 'N/A'}
                    </td>

                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 text-[9px] font-bold uppercase border ${getSeverityBadge(log.severity)}`}>
                        {log.severity || 'INFO'}
                      </span>
                    </td>

                    <td className="p-3.5 text-[#ede8dd] max-w-md font-sans text-xs">
                      {log.details}
                      {log.ip && <span className="block text-[10px] font-mono text-[#5a6578] mt-0.5">IP: {log.ip}</span>}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
