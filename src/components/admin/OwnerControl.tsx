import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Crown, 
  Shield, 
  Sliders, 
  Radio, 
  CheckCircle2, 
  AlertTriangle, 
  Lock, 
  RefreshCw, 
  Users, 
  Send,
  Building,
  Key
} from 'lucide-react';
import { AdminUser, OrganizationSettings } from '../../types';
import { safeFetchJson } from '../../utils/api';

interface OwnerControlProps {
  currentUser: AdminUser;
  token: string;
}

export const OwnerControl: React.FC<OwnerControlProps> = ({
  currentUser,
  token,
}) => {
  const [settings, setSettings] = useState<OrganizationSettings | null>(null);
  const [adminUsers, setAdminUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Form states
  const [bureauName, setBureauName] = useState('');
  const [commandSubtitle, setCommandSubtitle] = useState('');
  const [postureLevel, setPostureLevel] = useState<'DEFCON 1' | 'DEFCON 2' | 'DEFCON 3' | 'STANDARD'>('STANDARD');
  const [intakeStatus, setIntakeStatus] = useState<'OPEN' | 'LIMITED' | 'INVITATION_ONLY' | 'LOCKED'>('OPEN');
  const [broadcastText, setBroadcastText] = useState('');
  const [managerEvidenceAllowed, setManagerEvidenceAllowed] = useState(true);
  const [dualApprovalRequired, setDualApprovalRequired] = useState(true);

  // Ownership transfer safety modal
  const [showTransferModal, setShowTransferModal] = useState(false);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await safeFetchJson<{
        success: boolean;
        settings: OrganizationSettings;
        adminUsers: any[];
      }>('/api/admin/owner/settings', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok && res.data?.settings) {
        setSettings(res.data.settings);
        setBureauName(res.data.settings.bureauName);
        setCommandSubtitle(res.data.settings.commandSubtitle);
        setPostureLevel(res.data.settings.postureLevel);
        setIntakeStatus(res.data.settings.intakeStatus);
        setBroadcastText(res.data.settings.publicBroadcast);
        setManagerEvidenceAllowed(res.data.settings.managerEvidenceEditAllowed);
        setDualApprovalRequired(res.data.settings.requireDualApprovalForDestructive);
        setAdminUsers(res.data.adminUsers || []);
      }
    } catch (err) {
      console.warn('Owner settings fetch failed:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, [token]);

  const handleSaveOrganization = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res = await safeFetchJson<{ success: boolean; settings: OrganizationSettings }>(
        '/api/admin/owner/settings',
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            bureauName,
            commandSubtitle,
            postureLevel,
            intakeStatus,
            publicBroadcast: broadcastText,
            managerEvidenceEditAllowed: managerEvidenceAllowed,
            requireDualApprovalForDestructive: dualApprovalRequired,
          }),
        }
      );

      if (res.ok && res.data?.settings) {
        setSettings(res.data.settings);
        setStatusMessage('Executive bureau policies updated and propagated across network.');
      }
    } catch (err) {
      console.error('Failed to save settings:', err);
    } finally {
      setActionLoading(false);
      setTimeout(() => setStatusMessage(null), 4000);
    }
  };

  const handleDispatchBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastText.trim()) return;

    setActionLoading(true);
    try {
      const res = await safeFetchJson<{ success: boolean; broadcast: string }>(
        '/api/admin/owner/announcement',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ announcement: broadcastText.trim() }),
        }
      );

      if (res.ok) {
        setStatusMessage('Official Bureau Broadcast dispatched to all public terminals.');
      }
    } catch (err) {
      console.error('Broadcast failed:', err);
    } finally {
      setActionLoading(false);
      setTimeout(() => setStatusMessage(null), 4000);
    }
  };

  return (
    <div className="space-y-6 font-mono text-xs text-[#ede8dd]">
      {/* Top Banner */}
      <div className="bg-[#0b0e14] border border-[#222834] p-6 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] uppercase tracking-[0.25em] text-[#c5a059] font-bold">
                OWNER / SUPER ADMIN SUPREME COMMAND CONSOLE
              </span>
              <span className="text-[#3a4454]">•</span>
              <span className="text-[10px] text-[#c5a059] flex items-center gap-1 font-bold">
                <Crown className="w-3.5 h-3.5 text-[#c5a059]" />
                EXECUTIVE CLEARANCE LEVEL 3
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-serif font-bold text-[#ede8dd] tracking-wide">
              ORGANIZATIONAL GOVERNANCE & PRIVILEGE DISPATCH
            </h2>
            <p className="text-xs text-[#8c8273] font-mono mt-1">
              Terminal: <span className="text-[#c5a059] font-bold">Asura (Owner)</span> • Highest Organizational Authority
            </p>
          </div>

          <button
            onClick={fetchSettings}
            className="px-3.5 py-2 bg-[#121620] border border-[#222834] hover:border-[#8c8273] text-xs font-mono text-[#ede8dd] flex items-center gap-1.5 transition-colors uppercase tracking-wider"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#c5a059] ${loading ? 'animate-spin' : ''}`} />
            <span>REFRESH</span>
          </button>
        </div>
      </div>

      {statusMessage && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 bg-[#713f12]/20 border border-[#ca8a04] text-[#fef08a] flex items-center gap-2"
        >
          <CheckCircle2 className="w-4 h-4 text-[#facc15]" />
          <span>{statusMessage}</span>
        </motion.div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Organization Config Form (7 cols) */}
        <div className="lg:col-span-7 bg-[#0b0e14] border border-[#222834] p-6 space-y-5">
          <div className="border-b border-[#222834] pb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building className="w-4 h-4 text-[#c5a059]" />
              <h3 className="text-sm font-serif font-bold text-[#ede8dd] uppercase tracking-wider">
                BUREAU CONFIGURATION & DEFENSE POSTURE
              </h3>
            </div>
            <span className="text-[10px] text-[#8c8273]">EXECUTIVE CONTROL</span>
          </div>

          <form onSubmit={handleSaveOrganization} className="space-y-4">
            <div>
              <label className="block text-[10px] text-[#8c8273] uppercase tracking-widest font-bold mb-1">
                ORGANIZATIONAL IDENTITY NAME
              </label>
              <input
                type="text"
                value={bureauName}
                onChange={(e) => setBureauName(e.target.value)}
                className="w-full bg-[#07090d] border border-[#222834] focus:border-[#c5a059] p-2.5 text-[#ede8dd] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] text-[#8c8273] uppercase tracking-widest font-bold mb-1">
                COMMAND SUBTITLE
              </label>
              <input
                type="text"
                value={commandSubtitle}
                onChange={(e) => setCommandSubtitle(e.target.value)}
                className="w-full bg-[#07090d] border border-[#222834] focus:border-[#c5a059] p-2.5 text-[#ede8dd] focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] text-[#8c8273] uppercase tracking-widest font-bold mb-1">
                  BUREAU POSTURE LEVEL
                </label>
                <select
                  value={postureLevel}
                  onChange={(e) => setPostureLevel(e.target.value as any)}
                  className="w-full bg-[#07090d] border border-[#222834] focus:border-[#c5a059] p-2.5 text-[#ede8dd] focus:outline-none"
                >
                  <option value="STANDARD">STANDARD</option>
                  <option value="DEFCON 3">DEFCON 3 (ELEVATED GUARD)</option>
                  <option value="DEFCON 2">DEFCON 2 (HIGH ALERT)</option>
                  <option value="DEFCON 1">DEFCON 1 (MAXIMUM ENFORCEMENT)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] text-[#8c8273] uppercase tracking-widest font-bold mb-1">
                  MEMBERSHIP INTAKE PROTOCOL
                </label>
                <select
                  value={intakeStatus}
                  onChange={(e) => setIntakeStatus(e.target.value as any)}
                  className="w-full bg-[#07090d] border border-[#222834] focus:border-[#c5a059] p-2.5 text-[#ede8dd] focus:outline-none"
                >
                  <option value="OPEN">OPEN (PUBLIC DOSSIER SUBMISSION)</option>
                  <option value="LIMITED">LIMITED (RESTRICTED QUOTA)</option>
                  <option value="INVITATION_ONLY">INVITATION ONLY</option>
                  <option value="LOCKED">LOCKED (SEALED INTAKE)</option>
                </select>
              </div>
            </div>

            {/* Manager Permissions Matrix Toggles */}
            <div className="p-4 bg-[#0e121a] border border-[#222834] space-y-3">
              <div className="text-[10px] uppercase font-bold text-[#c5a059] tracking-widest flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5" />
                <span>MANAGER AUTHORITY DELEGATION MATRIX</span>
              </div>

              <div className="flex items-center justify-between py-1">
                <div>
                  <div className="text-[#ede8dd] font-bold">Allow Manager Evidence Mutation</div>
                  <div className="text-[10px] text-[#8c8273]">Permits Manager role to append evidence to case dossiers</div>
                </div>
                <input
                  type="checkbox"
                  checked={managerEvidenceAllowed}
                  onChange={(e) => setManagerEvidenceAllowed(e.target.checked)}
                  className="w-4 h-4 accent-[#c5a059]"
                />
              </div>

              <div className="flex items-center justify-between py-1 border-t border-[#1a202c]">
                <div>
                  <div className="text-[#ede8dd] font-bold">Dual-Approval for Destructive Purges</div>
                  <div className="text-[10px] text-[#8c8273]">Requires executive sign-off before unrecoverable case closure</div>
                </div>
                <input
                  type="checkbox"
                  checked={dualApprovalRequired}
                  onChange={(e) => setDualApprovalRequired(e.target.checked)}
                  className="w-4 h-4 accent-[#c5a059]"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={actionLoading}
                className="px-6 py-2.5 bg-[#c5a059] hover:bg-[#d8b46e] text-[#0b0e14] font-bold uppercase tracking-widest transition-all disabled:opacity-50 shadow-[0_0_15px_rgba(197,160,89,0.2)]"
              >
                {actionLoading ? 'SAVING POLICIES...' : 'COMMIT ORGANIZATIONAL POLICIES'}
              </button>
            </div>
          </form>
        </div>

        {/* Executive Broadcast Dispatch & Privileged Directory (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Dispatch Announcement */}
          <div className="bg-[#0b0e14] border border-[#222834] p-6 space-y-4">
            <div className="border-b border-[#222834] pb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-[#c5a059]" />
                <h3 className="text-sm font-serif font-bold text-[#ede8dd] uppercase tracking-wider">
                  BUREAU BROADCAST DISPATCH
                </h3>
              </div>
            </div>

            <p className="text-[11px] text-[#8c8273]">
              Broadcast notices appear instantly on the public portal bulletin and internal command headers.
            </p>

            <form onSubmit={handleDispatchBroadcast} className="space-y-3">
              <textarea
                rows={3}
                value={broadcastText}
                onChange={(e) => setBroadcastText(e.target.value)}
                placeholder="Enter executive bureau broadcast bulletin..."
                className="w-full bg-[#07090d] border border-[#222834] focus:border-[#c5a059] p-3 text-xs text-[#ede8dd] focus:outline-none"
              />
              <button
                type="submit"
                disabled={actionLoading || !broadcastText.trim()}
                className="w-full py-2.5 bg-[#171c26] border border-[#c5a059]/40 hover:bg-[#c5a059] hover:text-[#0b0e14] text-[#c5a059] font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>DISPATCH EXECUTIVE BULLETIN</span>
              </button>
            </form>
          </div>

          {/* Privileged Administration Staff Directory */}
          <div className="bg-[#0b0e14] border border-[#222834] p-6 space-y-3">
            <div className="border-b border-[#222834] pb-2 flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-[#8c8273] tracking-widest">
                PRIVILEGED ACCOUNTS LEDGER
              </span>
              <span className="text-[10px] text-[#c5a059] font-bold">3 ACCOUNTS</span>
            </div>

            <div className="space-y-2">
              {adminUsers.map((u) => (
                <div
                  key={u.id}
                  className="p-3 bg-[#07090d] border border-[#1d2330] flex items-center justify-between text-[11px]"
                >
                  <div>
                    <div className="font-bold text-[#ede8dd] flex items-center gap-1.5">
                      <span>{u.name}</span>
                      <span className={`px-1.5 py-0.2 text-[9px] uppercase font-bold border ${
                        u.role === 'OWNER' ? 'text-[#c5a059] border-[#c5a059]/40 bg-[#c5a059]/10' :
                        u.role === 'DEVELOPER' ? 'text-[#38bdf8] border-[#38bdf8]/40 bg-[#38bdf8]/10' :
                        'text-[#22c55e] border-[#22c55e]/40 bg-[#22c55e]/10'
                      }`}>
                        {u.role}
                      </span>
                    </div>
                    <div className="text-[10px] text-[#5a6578]">{u.email}</div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-[#22c55e] font-bold">{u.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
