import React, { useState, useEffect } from 'react';
import { AdminUser } from '../types';
import { safeFetchJson } from '../utils/api';
import { AdminLogin } from './admin/AdminLogin';
import { AdminDashboard } from './admin/AdminDashboard';

interface AdminPanelProps {
  onExitAdmin: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ onExitAdmin }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('r4v_admin_token'));
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);
  const [isVerifying, setIsVerifying] = useState<boolean>(true);

  // Verify stored token on mount
  useEffect(() => {
    if (!token) {
      setIsVerifying(false);
      return;
    }

    safeFetchJson<{
      valid: boolean;
      user?: AdminUser;
    }>('/api/auth/verify', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (res.ok && res.data?.valid && res.data?.user) {
          setCurrentUser(res.data.user);
        } else {
          localStorage.removeItem('r4v_admin_token');
          setToken(null);
          setCurrentUser(null);
        }
      })
      .catch(() => {
        localStorage.removeItem('r4v_admin_token');
        setToken(null);
        setCurrentUser(null);
      })
      .finally(() => {
        setIsVerifying(false);
      });
  }, [token]);

  const handleLoginSuccess = (newToken: string, user: AdminUser) => {
    localStorage.setItem('r4v_admin_token', newToken);
    setToken(newToken);
    setCurrentUser(user);
  };

  const handleLogout = async () => {
    if (token) {
      try {
        await safeFetchJson('/api/auth/logout', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch {
        // Ignore logout network errors
      }
    }
    localStorage.removeItem('r4v_admin_token');
    setToken(null);
    setCurrentUser(null);
  };

  const handleSwitchUser = (newUser: AdminUser, newToken: string) => {
    localStorage.setItem('r4v_admin_token', newToken);
    setToken(newToken);
    setCurrentUser(newUser);
  };

  if (isVerifying) {
    return (
      <div className="min-h-screen bg-[#050709] flex items-center justify-center text-xs font-mono text-[#c5a059]">
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 border-2 border-[#c5a059] border-t-transparent rounded-full animate-spin" />
          <span>VALIDATING CLASSIFIED CREDENTIALS...</span>
        </div>
      </div>
    );
  }

  if (!token || !currentUser) {
    return <AdminLogin onLoginSuccess={handleLoginSuccess} onExit={onExitAdmin} />;
  }

  return (
    <AdminDashboard
      currentUser={currentUser}
      token={token}
      onLogout={handleLogout}
      onExitToPublic={onExitAdmin}
      onSwitchUser={handleSwitchUser}
    />
  );
};
