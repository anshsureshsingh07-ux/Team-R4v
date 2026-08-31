import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  UserPlus, 
  Search, 
  Filter, 
  RefreshCw, 
  Shield, 
  UserX, 
  UserCheck, 
  Award, 
  Mail, 
  Briefcase,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';
import { AdminUser, MemberRecord } from '../../types';
import { safeFetchJson } from '../../utils/api';

interface MemberDirectoryProps {
  currentUser: AdminUser;
  token: string;
}

export const MemberDirectory: React.FC<MemberDirectoryProps> = ({
  currentUser,
  token,
}) => {
  const [members, setMembers] = useState<MemberRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [divisionFilter, setDivisionFilter] = useState('ALL');

  // Enlist Modal
  const [showEnlistModal, setShowEnlistModal] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newDivision, setNewDivision] = useState('GENERAL INVESTIGATIONS');
  const [newRole, setNewRole] = useState<'OPERATIVE' | 'SENIOR_AGENT' | 'SPECIALIST' | 'LEAD_INVESTIGATOR' | 'SECTION_CHIEF'>('OPERATIVE');
  const [newClearance, setNewClearance] = useState('LEVEL 1');
  const [newSocial, setNewSocial] = useState('');
  const [newNotes, setNewNotes] = useState('');
  const [enlistLoading, setEnlistLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (statusFilter !== 'ALL') queryParams.append('status', statusFilter);
      if (divisionFilter !== 'ALL') queryParams.append('division', divisionFilter);
      if (searchQuery.trim()) queryParams.append('search', searchQuery.trim());

      const res = await safeFetchJson<{ members: MemberRecord[]; totalCount: number }>(
        `/api/admin/members?${queryParams.toString()}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.ok && res.data?.members) {
        setMembers(res.data.members);
      }
    } catch (err) {
      console.warn('Error fetching members:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [token, statusFilter, divisionFilter]);

  const handleEnlist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername || !newEmail) return;

    setEnlistLoading(true);
    try {
      const res = await safeFetchJson<{ success: boolean; member: MemberRecord }>(
        '/api/admin/members',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            username: newUsername,
            email: newEmail,
            division: newDivision,
            role: newRole,
            clearanceLevel: newClearance,
            socialHandle: newSocial,
            notes: newNotes,
          }),
        }
      );

      if (res.ok && res.data?.member) {
        setShowEnlistModal(false);
        setNewUsername('');
        setNewEmail('');
        setNewSocial('');
        setNewNotes('');
        setStatusMessage(`Operative [${res.data.member.username}] successfully enrolled.`);
        fetchMembers();
      }
    } catch (err) {
      console.error('Failed to enlist operative:', err);
    } finally {
      setEnlistLoading(false);
      setTimeout(() => setStatusMessage(null), 4000);
    }
  };

  const handleToggleStatus = async (memberId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'SUSPENDED' ? 'ACTIVE' : 'SUSPENDED';
    try {
      const res = await safeFetchJson<{ success: boolean; member: MemberRecord }>(
        `/api/admin/members/${memberId}/suspend`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (res.ok) {
        setStatusMessage(`Operative clearance status updated to [${newStatus}].`);
        fetchMembers();
      }
    } catch (err) {
      console.error('Failed to toggle member status:', err);
    } finally {
      setTimeout(() => setStatusMessage(null), 4000);
    }
  };

  const isSuspensionAllowed = currentUser.role === 'OWNER' || currentUser.role === 'DEVELOPER';

  return (
    <div className="space-y-6">
      {/* Header & Actions */}
      <div className="bg-[#0b0e14] border border-[#222834] p-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-serif font-bold text-[#ede8dd] tracking-wide flex items-center gap-2">
              <Users className="w-5 h-5 text-[#c5a059]" />
              <span>OPERATIVE FORCE & ACTIVE AGENTS DIRECTORY</span>
            </h2>
            <p className="text-xs text-[#8c8273] font-mono mt-0.5">
              Authorized investigators, technical specialists, and field command staff roster.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowEnlistModal(true)}
              className="px-3.5 py-2 bg-[#c5a059] hover:bg-[#d8b46e] text-[#0b0e14] text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors shadow-[0_0_15px_rgba(197,160,89,0.2)]"
            >
              <UserPlus className="w-4 h-4" />
              <span>ENLIST OPERATIVE</span>
            </button>

            <button
              onClick={fetchMembers}
              className="px-3.5 py-2 bg-[#121620] border border-[#222834] hover:border-[#8c8273] text-xs font-mono text-[#ede8dd] flex items-center gap-1.5 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-[#c5a059] ${loading ? 'animate-spin' : ''}`} />
              <span>REFRESH</span>
            </button>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="mt-4 pt-4 border-t border-[#1a202c] flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchMembers()}
              placeholder="Search by callsign, email, division, or role..."
              className="w-full bg-[#07090d] border border-[#222834] focus:border-[#c5a059] px-3.5 py-2 pl-9 text-xs text-[#ede8dd] font-mono placeholder:text-[#4a5568] focus:outline-none"
            />
            <Search className="w-4 h-4 text-[#8c8273] absolute left-3 top-2.5" />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-[#07090d] border border-[#222834] focus:border-[#c5a059] px-3 py-2 text-xs text-[#ede8dd] font-mono focus:outline-none"
            >
              <option value="ALL">ALL STATUSES</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="PROBATION">PROBATION</option>
              <option value="SUSPENDED">SUSPENDED</option>
            </select>
          </div>
        </div>
      </div>

      {statusMessage && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 bg-[#172554] border border-[#3b82f6] text-[#93c5fd] text-xs font-mono flex items-center gap-2"
        >
          <CheckCircle2 className="w-4 h-4 text-[#38bdf8]" />
          <span>{statusMessage}</span>
        </motion.div>
      )}

      {/* Members Table */}
      <div className="bg-[#0b0e14] border border-[#222834] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs font-mono">
            <thead>
              <tr className="bg-[#0e121a] border-b border-[#222834] text-[#8c8273] uppercase tracking-wider text-[10px]">
                <th className="p-3.5 font-bold">OPERATIVE ID & CALLSIGN</th>
                <th className="p-3.5 font-bold">DIVISION & ROLE</th>
                <th className="p-3.5 font-bold">CLEARANCE</th>
                <th className="p-3.5 font-bold">CASES LOGGED</th>
                <th className="p-3.5 font-bold">STATUS</th>
                <th className="p-3.5 font-bold text-right">COMMAND ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#171c26]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-[#8c8273]">
                    INDEXING ROSTER LEDGER...
                  </td>
                </tr>
              ) : members.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-[#8c8273]">
                    No operatives found in the active directory.
                  </td>
                </tr>
              ) : (
                members.map((m) => (
                  <tr key={m.id} className="hover:bg-[#121620]/50 transition-colors">
                    <td className="p-3.5">
                      <div className="text-[10px] text-[#c5a059] font-bold">{m.id}</div>
                      <div className="text-xs font-serif font-bold text-[#ede8dd]">{m.username}</div>
                      <div className="text-[10px] text-[#5a6578] truncate max-w-[180px]">{m.email}</div>
                    </td>

                    <td className="p-3.5">
                      <div className="text-[#ede8dd] font-bold">{m.division}</div>
                      <div className="text-[10px] text-[#8c8273]">{m.role.replace('_', ' ')}</div>
                    </td>

                    <td className="p-3.5">
                      <span className="px-2 py-0.5 bg-[#171c26] border border-[#2a3448] text-[10px] text-[#c5a059] font-bold">
                        {m.clearanceLevel}
                      </span>
                    </td>

                    <td className="p-3.5">
                      <span className="text-[#ede8dd] font-bold">{m.casesAssigned}</span>
                    </td>

                    <td className="p-3.5">
                      <span
                        className={`px-2 py-0.5 text-[9px] font-bold uppercase border ${
                          m.status === 'ACTIVE'
                            ? 'bg-[#22c55e]/10 text-[#22c55e] border-[#22c55e]/40'
                            : m.status === 'PROBATION'
                            ? 'bg-[#f59e0b]/10 text-[#f59e0b] border-[#f59e0b]/40'
                            : 'bg-[#ef4444]/10 text-[#ef4444] border-[#ef4444]/40'
                        }`}
                      >
                        {m.status}
                      </span>
                    </td>

                    <td className="p-3.5 text-right">
                      {isSuspensionAllowed ? (
                        <button
                          onClick={() => handleToggleStatus(m.id, m.status)}
                          className={`px-2.5 py-1 text-[10px] uppercase font-bold border transition-colors ${
                            m.status === 'SUSPENDED'
                              ? 'bg-[#22c55e]/10 border-[#22c55e] text-[#22c55e] hover:bg-[#22c55e]/20'
                              : 'bg-[#ef4444]/10 border-[#ef4444] text-[#ef4444] hover:bg-[#ef4444]/20'
                          }`}
                        >
                          {m.status === 'SUSPENDED' ? 'REINSTATE' : 'SUSPEND'}
                        </button>
                      ) : (
                        <span className="text-[10px] text-[#5a6578]">LOCKED (OWNER ONLY)</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Enlist Operative Modal */}
      <AnimatePresence>
        {showEnlistModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-[#0b0e14] border border-[#222834] p-6 space-y-5 shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-[#222834] pb-3">
                <div className="flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-[#c5a059]" />
                  <h3 className="text-base font-serif font-bold text-[#ede8dd] uppercase tracking-wider">
                    ENLIST NEW OPERATIVE
                  </h3>
                </div>
                <button
                  onClick={() => setShowEnlistModal(false)}
                  className="text-xs font-mono text-[#8c8273] hover:text-[#ede8dd]"
                >
                  ✕ CLOSE
                </button>
              </div>

              <form onSubmit={handleEnlist} className="space-y-4 text-xs font-mono">
                <div>
                  <label className="block text-[10px] text-[#8c8273] uppercase tracking-widest font-bold mb-1">
                    OPERATIVE CALLSIGN / USERNAME *
                  </label>
                  <input
                    type="text"
                    required
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    placeholder="e.g. Thomas_Shelby_Audit"
                    className="w-full bg-[#07090d] border border-[#222834] focus:border-[#c5a059] p-2.5 text-[#ede8dd] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-[#8c8273] uppercase tracking-widest font-bold mb-1">
                    CONTACT EMAIL *
                  </label>
                  <input
                    type="email"
                    required
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="operative@domain.com"
                    className="w-full bg-[#07090d] border border-[#222834] focus:border-[#c5a059] p-2.5 text-[#ede8dd] focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] text-[#8c8273] uppercase tracking-widest font-bold mb-1">
                      ASSIGNED DIVISION
                    </label>
                    <input
                      type="text"
                      value={newDivision}
                      onChange={(e) => setNewDivision(e.target.value)}
                      placeholder="EVIDENCE VERIFICATION"
                      className="w-full bg-[#07090d] border border-[#222834] focus:border-[#c5a059] p-2.5 text-[#ede8dd] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-[#8c8273] uppercase tracking-widest font-bold mb-1">
                      RANK / ROLE
                    </label>
                    <select
                      value={newRole}
                      onChange={(e) => setNewRole(e.target.value as any)}
                      className="w-full bg-[#07090d] border border-[#222834] focus:border-[#c5a059] p-2.5 text-[#ede8dd] focus:outline-none"
                    >
                      <option value="OPERATIVE">OPERATIVE</option>
                      <option value="SENIOR_AGENT">SENIOR AGENT</option>
                      <option value="SPECIALIST">SPECIALIST</option>
                      <option value="LEAD_INVESTIGATOR">LEAD INVESTIGATOR</option>
                      <option value="SECTION_CHIEF">SECTION CHIEF</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] text-[#8c8273] uppercase tracking-widest font-bold mb-1">
                      CLEARANCE LEVEL
                    </label>
                    <select
                      value={newClearance}
                      onChange={(e) => setNewClearance(e.target.value)}
                      className="w-full bg-[#07090d] border border-[#222834] focus:border-[#c5a059] p-2.5 text-[#ede8dd] focus:outline-none"
                    >
                      <option value="LEVEL 1">LEVEL 1</option>
                      <option value="LEVEL 2">LEVEL 2</option>
                      <option value="LEVEL 3">LEVEL 3</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] text-[#8c8273] uppercase tracking-widest font-bold mb-1">
                      DISCORD / TELEGRAM HANDLE
                    </label>
                    <input
                      type="text"
                      value={newSocial}
                      onChange={(e) => setNewSocial(e.target.value)}
                      placeholder="@handle"
                      className="w-full bg-[#07090d] border border-[#222834] focus:border-[#c5a059] p-2.5 text-[#ede8dd] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-[#222834]">
                  <button
                    type="button"
                    onClick={() => setShowEnlistModal(false)}
                    className="px-4 py-2 border border-[#222834] text-[#8c8273] hover:text-[#ede8dd] uppercase tracking-wider"
                  >
                    CANCEL
                  </button>
                  <button
                    type="submit"
                    disabled={enlistLoading}
                    className="px-5 py-2 bg-[#c5a059] hover:bg-[#d8b46e] text-[#0b0e14] font-bold uppercase tracking-wider disabled:opacity-50"
                  >
                    {enlistLoading ? 'COMMITTING...' : 'ENROLL INTO ROSTER'}
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
