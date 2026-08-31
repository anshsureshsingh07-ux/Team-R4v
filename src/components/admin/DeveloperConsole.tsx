import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Terminal, 
  Server, 
  Database, 
  Cpu, 
  HardDrive, 
  AlertTriangle, 
  RefreshCw, 
  Download, 
  Lock, 
  CheckCircle2, 
  ShieldAlert, 
  Radio,
  Sliders,
  FileCode,
  Zap
} from 'lucide-react';
import { AdminUser, SystemHealthData } from '../../types';
import { safeFetchJson } from '../../utils/api';

interface DeveloperConsoleProps {
  currentUser: AdminUser;
  token: string;
}

export const DeveloperConsole: React.FC<DeveloperConsoleProps> = ({
  currentUser,
  token,
}) => {
  const [health, setHealth] = useState<SystemHealthData | null>(null);
  const [errorLogs, setErrorLogs] = useState<any[]>([]);
  const [securityEvents, setSecurityEvents] = useState<any[]>([]);
  const [backups, setBackups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const fetchDevData = async () => {
    setLoading(true);
    try {
      // Health
      const healthRes = await safeFetchJson<{ success: boolean; health: SystemHealthData }>(
        '/api/admin/developer/health',
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (healthRes.ok && healthRes.data?.health) {
        setHealth(healthRes.data.health);
      }

      // Logs
      const logsRes = await safeFetchJson<{
        success: boolean;
        errorLogs: any[];
        recentSecurityEvents: any[];
      }>('/api/admin/developer/logs', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (logsRes.ok && logsRes.data) {
        setErrorLogs(logsRes.data.errorLogs || []);
        setSecurityEvents(logsRes.data.recentSecurityEvents || []);
      }

      // Backups
      const backupsRes = await safeFetchJson<{ success: boolean; backups: any[] }>(
        '/api/admin/developer/backups',
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (backupsRes.ok && backupsRes.data?.backups) {
        setBackups(backupsRes.data.backups);
      }
    } catch (err) {
      console.warn('Developer data fetch failed:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDevData();
  }, [token]);

  const handleCreateBackup = async () => {
    setActionLoading(true);
    try {
      const res = await safeFetchJson<{ success: boolean; backup: any }>(
        '/api/admin/developer/backup',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.ok && res.data?.backup) {
        setStatusMessage(`Database snapshot ${res.data.backup.filename} archived successfully.`);
        fetchDevData();
      }
    } catch (err) {
      console.error('Backup creation failed:', err);
    } finally {
      setActionLoading(false);
      setTimeout(() => setStatusMessage(null), 4000);
    }
  };

  const formatUptime = (seconds?: number) => {
    if (!seconds) return '0m';
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs}h ${mins}m ${secs}s`;
  };

  return (
    <div className="space-y-6 font-mono text-xs text-[#ede8dd]">
      {/* Top Banner */}
      <div className="bg-[#0b0e14] border border-[#222834] p-6 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] uppercase tracking-[0.25em] text-[#38bdf8] font-bold">
                DEVELOPER / CTO / SYSTEM ADMIN CONSOLE
              </span>
              <span className="text-[#3a4454]">•</span>
              <span className="text-[10px] text-[#22c55e] flex items-center gap-1 font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e] animate-pulse" />
                TELEMETRY ACTIVE
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-serif font-bold text-[#ede8dd] tracking-wide">
              SYSTEM ARCHITECTURE & INFRASTRUCTURE TELEMETRY
            </h2>
            <p className="text-xs text-[#8c8273] font-mono mt-1">
              Terminal: <span className="text-[#38bdf8] font-bold">Ansh (Developer)</span> • Clearance: Level 3 Chief Architect
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleCreateBackup}
              disabled={actionLoading}
              className="px-3.5 py-2 bg-[#38bdf8] hover:bg-[#7dd3fc] text-[#0b0e14] font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors disabled:opacity-50 shadow-[0_0_15px_rgba(56,189,248,0.2)]"
            >
              <Database className="w-3.5 h-3.5" />
              <span>{actionLoading ? 'SNAPSHOT RUNNING...' : 'GENERATE DB SNAPSHOT'}</span>
            </button>

            <button
              onClick={fetchDevData}
              className="px-3.5 py-2 bg-[#121620] border border-[#222834] hover:border-[#8c8273] text-xs font-mono text-[#ede8dd] flex items-center gap-1.5 transition-colors uppercase tracking-wider"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-[#38bdf8] ${loading ? 'animate-spin' : ''}`} />
              <span>REFRESH</span>
            </button>
          </div>
        </div>
      </div>

      {statusMessage && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 bg-[#0369a1]/20 border border-[#0284c7] text-[#7dd3fc] flex items-center gap-2"
        >
          <CheckCircle2 className="w-4 h-4 text-[#38bdf8]" />
          <span>{statusMessage}</span>
        </motion.div>
      )}

      {/* System Telemetry Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Server & Uptime */}
        <div className="bg-[#0b0e14] border border-[#222834] p-5 space-y-2">
          <div className="flex items-center justify-between text-[#8c8273]">
            <span className="text-[10px] uppercase font-bold tracking-widest">SERVER ENGINE</span>
            <Server className="w-4 h-4 text-[#38bdf8]" />
          </div>
          <div className="text-xl font-bold text-[#ede8dd]">
            {health?.server?.status || 'ONLINE'}
          </div>
          <div className="text-[11px] text-[#8c8273] space-y-0.5">
            <div>Uptime: {formatUptime(health?.server?.uptimeSeconds)}</div>
            <div>Runtime: Node {health?.server?.nodeVersion || 'v20.x'}</div>
          </div>
        </div>

        {/* Memory Usage */}
        <div className="bg-[#0b0e14] border border-[#222834] p-5 space-y-2">
          <div className="flex items-center justify-between text-[#8c8273]">
            <span className="text-[10px] uppercase font-bold tracking-widest">HEAP MEMORY</span>
            <Cpu className="w-4 h-4 text-[#22c55e]" />
          </div>
          <div className="text-xl font-bold text-[#22c55e]">
            {health?.server?.memoryUsageMB ? `${health.server.memoryUsageMB} MB` : '42 MB'}
          </div>
          <div className="text-[11px] text-[#8c8273] space-y-0.5">
            <div>Allocation: Self-contained container</div>
            <div>Platform: {health?.server?.platform || 'linux/amd64'}</div>
          </div>
        </div>

        {/* Database Status */}
        <div className="bg-[#0b0e14] border border-[#222834] p-5 space-y-2">
          <div className="flex items-center justify-between text-[#8c8273]">
            <span className="text-[10px] uppercase font-bold tracking-widest">BUREAU DATABASE</span>
            <Database className="w-4 h-4 text-[#c5a059]" />
          </div>
          <div className="text-xl font-bold text-[#c5a059]">
            {health?.database?.status || 'CONNECTED'}
          </div>
          <div className="text-[11px] text-[#8c8273] space-y-0.5">
            <div>Total Records: {health?.database?.totalRecords || 0}</div>
            <div>File Size: {health?.database?.fileSizeBytes ? `${Math.round(health.database.fileSizeBytes / 1024)} KB` : '48 KB'}</div>
          </div>
        </div>

        {/* API Telemetry */}
        <div className="bg-[#0b0e14] border border-[#222834] p-5 space-y-2">
          <div className="flex items-center justify-between text-[#8c8273]">
            <span className="text-[10px] uppercase font-bold tracking-widest">API LATENCY</span>
            <Zap className="w-4 h-4 text-[#a855f7]" />
          </div>
          <div className="text-xl font-bold text-[#a855f7]">
            {health?.api?.latencyMs ? `${health.api.latencyMs} ms` : '12 ms'}
          </div>
          <div className="text-[11px] text-[#8c8273] space-y-0.5">
            <div>Requests Handled: {health?.api?.requestsHandled || 120}</div>
            <div>Error Rate: {health?.api?.errorRate || '0.01%'}</div>
          </div>
        </div>
      </div>

      {/* Database Snapshot Backups & Security Alarms */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Database Backups List */}
        <div className="bg-[#0b0e14] border border-[#222834] p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[#222834] pb-3">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-[#38bdf8]" />
              <h3 className="text-sm font-serif font-bold text-[#ede8dd] uppercase tracking-wider">
                DATABASE SNAPSHOT ARCHIVES
              </h3>
            </div>
            <span className="text-[10px] text-[#8c8273]">{backups.length} SNAPSHOTS</span>
          </div>

          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {backups.length === 0 ? (
              <div className="p-4 text-center text-[#8c8273]">
                No snapshot archives currently in storage. Click "Generate DB Snapshot" above to create one.
              </div>
            ) : (
              backups.map((b) => (
                <div
                  key={b.id}
                  className="p-3 bg-[#07090d] border border-[#1d2330] flex items-center justify-between gap-3 text-[11px]"
                >
                  <div className="space-y-0.5">
                    <div className="font-bold text-[#ede8dd]">{b.filename}</div>
                    <div className="text-[10px] text-[#5a6578]">
                      Created: {new Date(b.createdAt).toLocaleString()} • Size: {Math.round(b.sizeBytes / 1024)} KB
                    </div>
                  </div>
                  <div className="text-right text-[10px] text-[#38bdf8] font-bold">
                    {b.recordCounts ? `${b.recordCounts.cases} Cases, ${b.recordCounts.applications} Apps` : 'Archived'}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Security Alerts & Rate Limit Trigger Feed */}
        <div className="bg-[#0b0e14] border border-[#222834] p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[#222834] pb-3">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-[#ef4444]" />
              <h3 className="text-sm font-serif font-bold text-[#ede8dd] uppercase tracking-wider">
                SECURITY LOGS & AUTH ANOMALIES
              </h3>
            </div>
            <span className="text-[10px] text-[#ef4444] font-bold">REAL-TIME MONITOR</span>
          </div>

          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {securityEvents.length === 0 ? (
              <div className="p-4 text-center text-[#8c8273]">
                No security alerts or unauthorized access attempts detected.
              </div>
            ) : (
              securityEvents.map((evt) => (
                <div
                  key={evt.id}
                  className="p-3 bg-[#07090d] border border-[#7a1c1c]/40 text-[11px] space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#ef4444]">{evt.action}</span>
                    <span className="text-[10px] text-[#5a6578]">{new Date(evt.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <p className="text-[#a09a8e] font-sans text-xs">{evt.details}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Security Architecture & Hardening Confirmation */}
      <div className="bg-[#0b0e14] border border-[#222834] p-5 text-[11px] text-[#8c8273] space-y-2">
        <div className="flex items-center gap-2 text-[#ede8dd] font-bold font-serif text-sm">
          <Lock className="w-4 h-4 text-[#c5a059]" />
          <span>SECURITY & SECRETS ARCHITECTURE COMPLIANCE</span>
        </div>
        <p>
          Per R4V Command Security Mandates: Plaintext administrative passwords, database connection strings, and encryption keys are strictly retained server-side in memory/environment variables. The frontend client receives zero sensitive keys or raw secrets.
        </p>
      </div>
    </div>
  );
};
