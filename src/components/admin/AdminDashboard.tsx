import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Shield, 
  Crown, 
  Terminal, 
  FileText, 
  Briefcase, 
  Users, 
  Activity, 
  FileCheck, 
  LogOut, 
  ArrowLeft, 
  Sliders, 
  Lock,
  Layers,
  Sparkles,
  UserCheck
} from 'lucide-react';
import { AdminRole, AdminUser } from '../../types';
import { CommandCenterOverview } from './CommandCenterOverview';
import { ApplicationManagement } from './ApplicationManagement';
import { NotificationLedger } from './NotificationLedger';
import { CaseManagement } from './CaseManagement';
import { MemberDirectory } from './MemberDirectory';
import { AuditLogViewer } from './AuditLogViewer';
import { DeveloperConsole } from './DeveloperConsole';
import { OwnerControl } from './OwnerControl';
import { CaseAnalyzerSection } from '../CaseAnalyzerSection';
import { safeFetchJson } from '../../utils/api';
import { Bell } from 'lucide-react';

interface AdminDashboardProps {
  currentUser: AdminUser;
  token: string;
  onLogout: () => void;
  onExitToPublic: () => void;
  onSwitchUser?: (newUser: AdminUser, newToken: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  currentUser,
  token,
  onLogout,
  onExitToPublic,
  onSwitchUser,
}) => {
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [isSwitching, setIsSwitching] = useState(false);

  // Fast demo role switcher (authenticates against real backend)
  const handleQuickSwitchRole = async (targetEmail: string) => {
    setIsSwitching(true);
    try {
      const res = await safeFetchJson<{
        success: boolean;
        token: string;
        admin: AdminUser;
      }>('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: targetEmail,
          password: 'R4VBureau1920!',
        }),
      });

      if (res.ok && res.data?.token && res.data?.admin) {
        localStorage.setItem('r4v_admin_token', res.data.token);
        if (onSwitchUser) {
          onSwitchUser(res.data.admin, res.data.token);
        }
      }
    } catch (err) {
      console.warn('Quick role switch failed:', err);
    } finally {
      setIsSwitching(false);
    }
  };

  const getRoleIcon = (role: AdminRole) => {
    switch (role) {
      case 'OWNER':
        return <Crown className="w-4 h-4 text-[#c5a059]" />;
      case 'DEVELOPER':
        return <Terminal className="w-4 h-4 text-[#38bdf8]" />;
      case 'MANAGER':
        return <Shield className="w-4 h-4 text-[#22c55e]" />;
    }
  };

  const getRoleBadgeStyle = (role: AdminRole) => {
    switch (role) {
      case 'OWNER':
        return 'bg-[#c5a059]/10 text-[#c5a059] border-[#c5a059]/40';
      case 'DEVELOPER':
        return 'bg-[#38bdf8]/10 text-[#38bdf8] border-[#38bdf8]/40';
      case 'MANAGER':
        return 'bg-[#22c55e]/10 text-[#22c55e] border-[#22c55e]/40';
    }
  };

  return (
    <div className="min-h-screen bg-[#050709] text-[#ede8dd] font-sans selection:bg-[#c5a059] selection:text-[#0b0e14]">
      {/* Top Classified Header */}
      <header className="bg-[#0b0e14] border-b border-[#222834] sticky top-0 z-40 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo & Bureau Title */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-[#121620] border border-[#c5a059]/40 flex items-center justify-center text-[#c5a059] shadow-[0_0_10px_rgba(197,160,89,0.15)]">
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-[#c5a059] uppercase tracking-[0.25em] font-bold">
                    TEAM R4V COMMAND
                  </span>
                  <span className="text-[#3a4454]">•</span>
                  <span className="text-[10px] font-mono text-[#8c8273]">CLASSIFIED SYSTEM</span>
                </div>
                <div className="text-sm font-serif font-bold text-[#ede8dd] tracking-wider uppercase">
                  PRIVATE ADMINISTRATION CONSOLE
                </div>
              </div>
            </div>

            {/* User Profile Pill & Actions */}
            <div className="flex items-center gap-3">
              {/* Authenticated Identity Pill */}
              <div className="hidden sm:flex items-center gap-2.5 px-3 py-1.5 bg-[#121620] border border-[#222834]">
                <div className="w-6 h-6 rounded-full bg-[#171c26] flex items-center justify-center">
                  {getRoleIcon(currentUser.role)}
                </div>
                <div className="text-left">
                  <div className="text-xs font-bold text-[#ede8dd] font-serif leading-none">
                    {currentUser.name}
                  </div>
                  <div className="text-[9px] font-mono text-[#8c8273] uppercase mt-0.5">
                    {currentUser.title}
                  </div>
                </div>
                <span className={`px-1.5 py-0.2 text-[9px] font-mono font-bold uppercase border ml-1 ${getRoleBadgeStyle(currentUser.role)}`}>
                  {currentUser.role}
                </span>
              </div>

              {/* Quick Clearance Role Switcher for instant testing */}
              <div className="hidden md:flex items-center gap-1 text-[10px] font-mono bg-[#07090d] border border-[#222834] p-1">
                <span className="text-[#5a6578] px-1 font-bold">ROLE:</span>
                <button
                  type="button"
                  disabled={isSwitching || currentUser.email === 'asura@r4v.com'}
                  onClick={() => handleQuickSwitchRole('asura@r4v.com')}
                  className={`px-1.5 py-0.5 transition-colors ${
                    currentUser.email === 'asura@r4v.com'
                      ? 'bg-[#c5a059] text-[#0b0e14] font-bold'
                      : 'text-[#8c8273] hover:text-[#ede8dd]'
                  }`}
                  title="Switch to Asura (Owner)"
                >
                  ASURA
                </button>
                <button
                  type="button"
                  disabled={isSwitching || currentUser.email === 'ansh@r4v.com'}
                  onClick={() => handleQuickSwitchRole('ansh@r4v.com')}
                  className={`px-1.5 py-0.5 transition-colors ${
                    currentUser.email === 'ansh@r4v.com'
                      ? 'bg-[#38bdf8] text-[#0b0e14] font-bold'
                      : 'text-[#8c8273] hover:text-[#ede8dd]'
                  }`}
                  title="Switch to Ansh (Developer)"
                >
                  ANSH
                </button>
                <button
                  type="button"
                  disabled={isSwitching || currentUser.email === 'blackout@r4v.com'}
                  onClick={() => handleQuickSwitchRole('blackout@r4v.com')}
                  className={`px-1.5 py-0.5 transition-colors ${
                    currentUser.email === 'blackout@r4v.com'
                      ? 'bg-[#22c55e] text-[#0b0e14] font-bold'
                      : 'text-[#8c8273] hover:text-[#ede8dd]'
                  }`}
                  title="Switch to Blackout (Manager)"
                >
                  BLACKOUT
                </button>
              </div>

              {/* Exit to Public */}
              <button
                onClick={onExitToPublic}
                className="px-3 py-1.5 bg-[#121620] border border-[#222834] hover:border-[#8c8273] text-xs font-mono text-[#8c8273] hover:text-[#ede8dd] flex items-center gap-1.5 transition-colors uppercase tracking-wider"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">PUBLIC PORTAL</span>
              </button>

              {/* Logout */}
              <button
                onClick={onLogout}
                className="px-3 py-1.5 bg-[#7a1c1c]/20 border border-[#7a1c1c]/40 hover:border-[#ef4444] text-xs font-mono text-[#ef4444] flex items-center gap-1.5 transition-colors uppercase tracking-wider"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">SEAL TERMINAL</span>
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="bg-[#07090d] border-t border-[#171c26]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex items-center space-x-1 overflow-x-auto scrollbar-none py-1">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-3 py-2 text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
                  activeTab === 'overview'
                    ? 'border-[#c5a059] text-[#c5a059] bg-[#121620]'
                    : 'border-transparent text-[#8c8273] hover:text-[#ede8dd] hover:bg-[#0e121a]'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>COMMAND OVERVIEW</span>
              </button>

              <button
                onClick={() => setActiveTab('applications')}
                className={`px-3 py-2 text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
                  activeTab === 'applications'
                    ? 'border-[#38bdf8] text-[#38bdf8] bg-[#121620]'
                    : 'border-transparent text-[#8c8273] hover:text-[#ede8dd] hover:bg-[#0e121a]'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>APPLICATIONS INTAKE</span>
              </button>

              <button
                onClick={() => setActiveTab('notifications')}
                className={`px-3 py-2 text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
                  activeTab === 'notifications'
                    ? 'border-[#c5a059] text-[#c5a059] bg-[#121620]'
                    : 'border-transparent text-[#8c8273] hover:text-[#ede8dd] hover:bg-[#0e121a]'
                }`}
              >
                <Bell className="w-3.5 h-3.5" />
                <span>NOTIFICATION ENGINE</span>
              </button>

              <button
                onClick={() => setActiveTab('cases')}
                className={`px-3 py-2 text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
                  activeTab === 'cases'
                    ? 'border-[#f59e0b] text-[#f59e0b] bg-[#121620]'
                    : 'border-transparent text-[#8c8273] hover:text-[#ede8dd] hover:bg-[#0e121a]'
                }`}
              >
                <Briefcase className="w-3.5 h-3.5" />
                <span>CASE MANAGEMENT</span>
              </button>

              <button
                onClick={() => setActiveTab('analyzer')}
                className={`px-3 py-2 text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
                  activeTab === 'analyzer'
                    ? 'border-[#c5a059] text-[#c5a059] bg-[#121620]'
                    : 'border-transparent text-[#8c8273] hover:text-[#ede8dd] hover:bg-[#0e121a]'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-[#c5a059]" />
                <span>AI CASE ANALYZER</span>
              </button>

              <button
                onClick={() => setActiveTab('members')}
                className={`px-3 py-2 text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
                  activeTab === 'members'
                    ? 'border-[#c5a059] text-[#c5a059] bg-[#121620]'
                    : 'border-transparent text-[#8c8273] hover:text-[#ede8dd] hover:bg-[#0e121a]'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>OPERATIVES DIRECTORY</span>
              </button>

              <button
                onClick={() => setActiveTab('audit')}
                className={`px-3 py-2 text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
                  activeTab === 'audit'
                    ? 'border-[#c5a059] text-[#c5a059] bg-[#121620]'
                    : 'border-transparent text-[#8c8273] hover:text-[#ede8dd] hover:bg-[#0e121a]'
                }`}
              >
                <Activity className="w-3.5 h-3.5" />
                <span>AUDIT LOG STREAM</span>
              </button>

              {/* Developer Console Tab (Exclusive to DEVELOPER role) */}
              {currentUser.role === 'DEVELOPER' && (
                <button
                  onClick={() => setActiveTab('developer')}
                  className={`px-3 py-2 text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
                    activeTab === 'developer'
                      ? 'border-[#38bdf8] text-[#38bdf8] bg-[#38bdf8]/10'
                      : 'border-transparent text-[#38bdf8]/70 hover:text-[#38bdf8] hover:bg-[#0e121a]'
                  }`}
                >
                  <Terminal className="w-3.5 h-3.5 text-[#38bdf8]" />
                  <span>DEVELOPER CONSOLE</span>
                </button>
              )}

              {/* Owner Controls Tab (Exclusive to OWNER role) */}
              {currentUser.role === 'OWNER' && (
                <button
                  onClick={() => setActiveTab('owner')}
                  className={`px-3 py-2 text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
                    activeTab === 'owner'
                      ? 'border-[#c5a059] text-[#c5a059] bg-[#c5a059]/10'
                      : 'border-transparent text-[#c5a059]/70 hover:text-[#c5a059] hover:bg-[#0e121a]'
                  }`}
                >
                  <Crown className="w-3.5 h-3.5 text-[#c5a059]" />
                  <span>OWNER CONTROL</span>
                </button>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content Body */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <CommandCenterOverview
                currentUser={currentUser}
                token={token}
                onNavigateTab={(tab) => setActiveTab(tab)}
              />
            </motion.div>
          )}

          {activeTab === 'applications' && (
            <motion.div
              key="applications"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <ApplicationManagement
                currentUser={currentUser}
                token={token}
              />
            </motion.div>
          )}

          {activeTab === 'notifications' && (
            <motion.div
              key="notifications"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <NotificationLedger
                currentUser={currentUser}
                token={token}
              />
            </motion.div>
          )}

          {activeTab === 'cases' && (
            <motion.div
              key="cases"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <CaseManagement
                currentUser={currentUser}
                token={token}
              />
            </motion.div>
          )}

          {activeTab === 'analyzer' && (
            <motion.div
              key="analyzer"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <CaseAnalyzerSection
                currentUser={currentUser}
                token={token}
              />
            </motion.div>
          )}

          {activeTab === 'members' && (
            <motion.div
              key="members"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <MemberDirectory
                currentUser={currentUser}
                token={token}
              />
            </motion.div>
          )}

          {activeTab === 'audit' && (
            <motion.div
              key="audit"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <AuditLogViewer
                currentUser={currentUser}
                token={token}
              />
            </motion.div>
          )}

          {activeTab === 'developer' && currentUser.role === 'DEVELOPER' && (
            <motion.div
              key="developer"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <DeveloperConsole
                currentUser={currentUser}
                token={token}
              />
            </motion.div>
          )}

          {activeTab === 'owner' && currentUser.role === 'OWNER' && (
            <motion.div
              key="owner"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <OwnerControl
                currentUser={currentUser}
                token={token}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};
