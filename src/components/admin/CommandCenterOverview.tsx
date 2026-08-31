import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Users, 
  FileText, 
  Briefcase, 
  CheckCircle, 
  Activity, 
  AlertOctagon, 
  Clock, 
  Shield, 
  ArrowUpRight,
  RefreshCw,
  FolderOpen,
  Send,
  Eye,
  FileCheck
} from 'lucide-react';
import { AdminUser, AuditLogRecord } from '../../types';
import { safeFetchJson } from '../../utils/api';

interface CommandCenterOverviewProps {
  currentUser: AdminUser;
  token: string;
  onNavigateTab: (tabId: string) => void;
}

export const CommandCenterOverview: React.FC<CommandCenterOverviewProps> = ({
  currentUser,
  token,
  onNavigateTab,
}) => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = async () => {
    try {
      const res = await safeFetchJson<{
        success: boolean;
        stats: {
          activeMembers: number;
          totalMembers: number;
          pendingApplications: number;
          needsReviewApplications: number;
          openCases: number;
          casesUnderReview: number;
          resolvedCases: number;
          totalCases: number;
          systemStatus: string;
          totalAuditLogs: number;
          recentActivity: AuditLogRecord[];
        };
      }>('/api/admin/command-stats', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok && res.data?.stats) {
        setStats(res.data.stats);
      }
    } catch (err) {
      console.warn('Failed to load command stats:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [token]);

  const handleManualRefresh = () => {
    setRefreshing(true);
    fetchStats();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner with Posture Status & Actions */}
      <div className="bg-[#0b0e14] border border-[#222834] p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-full bg-gradient-to-l from-[#c5a059]/5 to-transparent pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#c5a059] font-bold">
                CENTRAL COMMAND OVERVIEW
              </span>
              <span className="text-[#3a4454]">•</span>
              <span className="text-[10px] font-mono text-[#22c55e] flex items-center gap-1 font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e] animate-pulse" />
                SYSTEM ONLINE
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-serif font-bold text-[#ede8dd] tracking-wide">
              TEAM R4V COMMAND CENTER
            </h2>
            <p className="text-xs text-[#8c8273] font-mono mt-1">
              Authenticated Session: <span className="text-[#ede8dd] font-bold">{currentUser.name}</span> ({currentUser.title})
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleManualRefresh}
              disabled={refreshing}
              className="px-3.5 py-2 bg-[#121620] border border-[#222834] hover:border-[#8c8273] text-xs font-mono text-[#ede8dd] flex items-center gap-2 transition-colors uppercase tracking-wider"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-[#c5a059] ${refreshing ? 'animate-spin' : ''}`} />
              <span>SYNC LEDGER</span>
            </button>

            <div className="px-3.5 py-2 bg-[#171c26] border border-[#c5a059]/40 text-xs font-mono text-[#c5a059] flex items-center gap-2">
              <Shield className="w-3.5 h-3.5" />
              <span>POSTURE: {stats?.systemStatus || 'STANDARD'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Active Members */}
        <motion.div
          whileHover={{ y: -2 }}
          onClick={() => onNavigateTab('members')}
          className="bg-[#0b0e14] border border-[#222834] hover:border-[#c5a059]/50 p-5 cursor-pointer transition-all relative group"
        >
          <div className="flex items-center justify-between text-[#8c8273] mb-3">
            <span className="text-[10px] font-mono uppercase tracking-widest font-bold">OPERATIVE FORCE</span>
            <Users className="w-4 h-4 text-[#c5a059] group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-3xl font-serif font-bold text-[#ede8dd] mb-1">
            {loading ? '—' : stats?.activeMembers ?? 0}
          </div>
          <div className="text-[11px] font-mono text-[#8c8273] flex items-center justify-between">
            <span>Total Enrolled: {stats?.totalMembers ?? 0}</span>
            <span className="text-[#c5a059] flex items-center gap-0.5">Directory <ArrowUpRight className="w-3 h-3" /></span>
          </div>
        </motion.div>

        {/* Pending Applications */}
        <motion.div
          whileHover={{ y: -2 }}
          onClick={() => onNavigateTab('applications')}
          className="bg-[#0b0e14] border border-[#222834] hover:border-[#c5a059]/50 p-5 cursor-pointer transition-all relative group"
        >
          <div className="flex items-center justify-between text-[#8c8273] mb-3">
            <span className="text-[10px] font-mono uppercase tracking-widest font-bold">PENDING INTAKE</span>
            <FileText className="w-4 h-4 text-[#38bdf8] group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-3xl font-serif font-bold text-[#38bdf8] mb-1">
            {loading ? '—' : stats?.pendingApplications ?? 0}
          </div>
          <div className="text-[11px] font-mono text-[#8c8273] flex items-center justify-between">
            <span>Needs Review: {stats?.needsReviewApplications ?? 0}</span>
            <span className="text-[#38bdf8] flex items-center gap-0.5">Review <ArrowUpRight className="w-3 h-3" /></span>
          </div>
        </motion.div>

        {/* Active Open Cases */}
        <motion.div
          whileHover={{ y: -2 }}
          onClick={() => onNavigateTab('cases')}
          className="bg-[#0b0e14] border border-[#222834] hover:border-[#c5a059]/50 p-5 cursor-pointer transition-all relative group"
        >
          <div className="flex items-center justify-between text-[#8c8273] mb-3">
            <span className="text-[10px] font-mono uppercase tracking-widest font-bold">OPEN INVESTIGATIONS</span>
            <Briefcase className="w-4 h-4 text-[#f59e0b] group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-3xl font-serif font-bold text-[#ede8dd] mb-1">
            {loading ? '—' : stats?.openCases ?? 0}
          </div>
          <div className="text-[11px] font-mono text-[#8c8273] flex items-center justify-between">
            <span>Under Review: {stats?.casesUnderReview ?? 0}</span>
            <span className="text-[#f59e0b] flex items-center gap-0.5">Case Files <ArrowUpRight className="w-3 h-3" /></span>
          </div>
        </motion.div>

        {/* Resolved Cases */}
        <motion.div
          whileHover={{ y: -2 }}
          onClick={() => onNavigateTab('cases')}
          className="bg-[#0b0e14] border border-[#222834] hover:border-[#c5a059]/50 p-5 cursor-pointer transition-all relative group"
        >
          <div className="flex items-center justify-between text-[#8c8273] mb-3">
            <span className="text-[10px] font-mono uppercase tracking-widest font-bold">NEUTRALIZED / RESOLVED</span>
            <CheckCircle className="w-4 h-4 text-[#22c55e] group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-3xl font-serif font-bold text-[#22c55e] mb-1">
            {loading ? '—' : stats?.resolvedCases ?? 0}
          </div>
          <div className="text-[11px] font-mono text-[#8c8273] flex items-center justify-between">
            <span>Total Logged: {stats?.totalCases ?? 0}</span>
            <span className="text-[#22c55e] flex items-center gap-0.5">Archives <ArrowUpRight className="w-3 h-3" /></span>
          </div>
        </motion.div>
      </div>

      {/* Operational Quick Actions & Recent Activity Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Recent Bureau Activity Feed */}
        <div className="lg:col-span-2 bg-[#0b0e14] border border-[#222834] p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[#222834] pb-3">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#c5a059]" />
              <h3 className="text-sm font-serif font-bold text-[#ede8dd] uppercase tracking-wider">
                LIVE BUREAU ACTIVITY LOG
              </h3>
            </div>
            <button
              onClick={() => onNavigateTab('audit')}
              className="text-[11px] font-mono text-[#c5a059] hover:underline uppercase tracking-wider"
            >
              VIEW FULL AUDIT STREAM →
            </button>
          </div>

          <div className="space-y-2.5">
            {loading ? (
              <div className="py-8 text-center text-xs font-mono text-[#8c8273]">
                CONNECTING TO AUDIT ENGINE...
              </div>
            ) : !stats?.recentActivity || stats.recentActivity.length === 0 ? (
              <div className="py-8 text-center text-xs font-mono text-[#8c8273]">
                No administrative activity logged yet.
              </div>
            ) : (
              stats.recentActivity.slice(0, 6).map((log: AuditLogRecord) => (
                <div
                  key={log.id}
                  className="p-3 bg-[#0e121a] border border-[#1d2330] hover:border-[#2a3448] transition-colors text-xs flex items-start justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-[#c5a059] text-[11px]">{log.admin}</span>
                      <span className="px-1.5 py-0.2 text-[9px] font-mono uppercase bg-[#171c26] border border-[#2a3448] text-[#8c8273]">
                        {log.adminRole}
                      </span>
                      <span className="text-[#3a4454]">•</span>
                      <span className="font-mono text-[#ede8dd] font-bold">{log.action}</span>
                    </div>
                    <p className="text-[#a09a8e] font-sans text-xs line-clamp-1">{log.details}</p>
                  </div>
                  <span className="text-[10px] font-mono text-[#5a6578] whitespace-nowrap shrink-0">
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Col: Quick Command Short-cuts */}
        <div className="bg-[#0b0e14] border border-[#222834] p-6 space-y-5">
          <div className="border-b border-[#222834] pb-3">
            <h3 className="text-sm font-serif font-bold text-[#ede8dd] uppercase tracking-wider">
              QUICK COMMANDS
            </h3>
            <p className="text-[11px] text-[#8c8273] font-mono mt-0.5">High-frequency bureau operations</p>
          </div>

          <div className="space-y-2.5">
            <button
              onClick={() => onNavigateTab('applications')}
              className="w-full p-3 bg-[#121620] border border-[#222834] hover:border-[#38bdf8] text-left transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-[#38bdf8]/10 text-[#38bdf8] flex items-center justify-center">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#ede8dd]">Triage Intake Dossiers</div>
                  <div className="text-[10px] font-mono text-[#8c8273]">Approve or reject candidates</div>
                </div>
              </div>
              <ArrowUpRight className="w-4 h-4 text-[#8c8273] group-hover:text-[#38bdf8] transition-colors" />
            </button>

            <button
              onClick={() => onNavigateTab('cases')}
              className="w-full p-3 bg-[#121620] border border-[#222834] hover:border-[#f59e0b] text-left transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-[#f59e0b]/10 text-[#f59e0b] flex items-center justify-center">
                  <Briefcase className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#ede8dd]">Investigate Case Files</div>
                  <div className="text-[10px] font-mono text-[#8c8273]">Verify evidence & policy breaches</div>
                </div>
              </div>
              <ArrowUpRight className="w-4 h-4 text-[#8c8273] group-hover:text-[#f59e0b] transition-colors" />
            </button>

            <button
              onClick={() => onNavigateTab('methods')}
              className="w-full p-3 bg-[#121620] border border-[#222834] hover:border-[#c5a059] text-left transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-[#c5a059]/10 text-[#c5a059] flex items-center justify-center">
                  <FileCheck className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#ede8dd]">Operational Methods</div>
                  <div className="text-[10px] font-mono text-[#8c8273]">Codify takedown & audit protocol</div>
                </div>
              </div>
              <ArrowUpRight className="w-4 h-4 text-[#8c8273] group-hover:text-[#c5a059] transition-colors" />
            </button>

            {currentUser.role === 'DEVELOPER' && (
              <button
                onClick={() => onNavigateTab('developer')}
                className="w-full p-3 bg-[#121620] border border-[#222834] hover:border-[#38bdf8] text-left transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-[#38bdf8]/10 text-[#38bdf8] flex items-center justify-center">
                    <Activity className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#ede8dd]">Developer Technical Console</div>
                    <div className="text-[10px] font-mono text-[#8c8273]">System health, logs & backups</div>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-[#8c8273] group-hover:text-[#38bdf8] transition-colors" />
              </button>
            )}

            {currentUser.role === 'OWNER' && (
              <button
                onClick={() => onNavigateTab('owner')}
                className="w-full p-3 bg-[#121620] border border-[#222834] hover:border-[#c5a059] text-left transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-[#c5a059]/10 text-[#c5a059] flex items-center justify-center">
                    <Shield className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#ede8dd]">Owner Supreme Controls</div>
                    <div className="text-[10px] font-mono text-[#8c8273]">Organization & policy configuration</div>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-[#8c8273] group-hover:text-[#c5a059] transition-colors" />
              </button>
            )}
          </div>

          <div className="p-3 bg-[#171c26]/60 border border-[#222834] text-[11px] font-mono text-[#8c8273]">
            <span className="text-[#c5a059] font-bold">BUREAU REMINDER:</span> All enforcement operations strictly require cryptographically timestamped evidence archives.
          </div>
        </div>
      </div>
    </div>
  );
};
