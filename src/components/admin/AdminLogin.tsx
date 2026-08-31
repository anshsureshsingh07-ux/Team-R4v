import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Lock, 
  Key, 
  Mail, 
  Shield, 
  Crown, 
  Terminal, 
  AlertTriangle, 
  ArrowRight,
  UserCheck,
  CheckCircle2,
  Eye,
  EyeOff,
  ArrowLeft,
  Sparkles,
  ShieldCheck,
  Fingerprint
} from 'lucide-react';
import { AdminRole, AdminUser } from '../../types';
import { safeFetchJson } from '../../utils/api';

interface AdminLoginProps {
  onLoginSuccess: (token: string, user: AdminUser) => void;
  onExit: () => void;
}

interface PersonaOption {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  roleTitle: string;
  clearanceLevel: string;
  description: string;
  icon: typeof Crown;
  colorClass: {
    border: string;
    bg: string;
    text: string;
    badge: string;
    glow: string;
  };
}

const PERSONA_OPTIONS: PersonaOption[] = [
  {
    id: 'asura',
    name: 'Asura',
    email: 'asura@r4v.com',
    role: 'OWNER',
    roleTitle: 'Owner / Supreme Executive',
    clearanceLevel: 'LEVEL 3 / SUPREME EXECUTIVE',
    description: 'Supreme sovereignty over bureau directives, organization policy, posture defense, and permanent member promotions.',
    icon: Crown,
    colorClass: {
      border: 'border-[#c5a059]',
      bg: 'bg-[#c5a059]/10 hover:bg-[#c5a059]/20',
      text: 'text-[#c5a059]',
      badge: 'bg-[#c5a059]/20 text-[#e5cb91] border-[#c5a059]/40',
      glow: 'shadow-[0_0_20px_rgba(197,160,89,0.25)]',
    },
  },
  {
    id: 'ansh',
    name: 'Ansh',
    email: 'ansh@r4v.com',
    role: 'DEVELOPER',
    roleTitle: 'Developer / CTO / System Architect',
    clearanceLevel: 'LEVEL 3 / CHIEF ARCHITECT',
    description: 'Core infrastructure, API endpoints, published operational methods, database schema migrations, and technical security audits.',
    icon: Terminal,
    colorClass: {
      border: 'border-[#38bdf8]',
      bg: 'bg-[#38bdf8]/10 hover:bg-[#38bdf8]/20',
      text: 'text-[#38bdf8]',
      badge: 'bg-[#38bdf8]/20 text-[#7dd3fc] border-[#38bdf8]/40',
      glow: 'shadow-[0_0_20px_rgba(56,189,248,0.25)]',
    },
  },
  {
    id: 'blackout',
    name: 'Blackout',
    email: 'blackout@r4v.com',
    role: 'MANAGER',
    roleTitle: 'Manager / Case Supervisor',
    clearanceLevel: 'LEVEL 2 / FIELD COMMAND',
    description: 'Operational case investigations, evidence triage, platform abuse takedown filings, and applicant dossier adjudications.',
    icon: Shield,
    colorClass: {
      border: 'border-[#22c55e]',
      bg: 'bg-[#22c55e]/10 hover:bg-[#22c55e]/20',
      text: 'text-[#22c55e]',
      badge: 'bg-[#22c55e]/20 text-[#86efac] border-[#22c55e]/40',
      glow: 'shadow-[0_0_20px_rgba(34,197,94,0.25)]',
    },
  },
];

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLoginSuccess, onExit }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Step state: 'CREDENTIALS' -> 'WHO_ARE_YOU'
  const [step, setStep] = useState<'CREDENTIALS' | 'WHO_ARE_YOU'>('CREDENTIALS');
  const [selectedPersonaId, setSelectedPersonaId] = useState<string | null>(null);

  // Check if current credentials match the master team credentials
  const isMasterCredentials = (
    email.trim().toLowerCase() === 'team@r4v.com' &&
    (password === 'R4VBureau1920!' || password === 'safe instagram password')
  );

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError('Please enter your authorized email identifier and secret password.');
      return;
    }

    const cleanEmail = email.trim().toLowerCase();

    // If master team credentials entered, advance to "WHO ARE YOU?" role selection step
    if (cleanEmail === 'team@r4v.com' && (password === 'R4VBureau1920!' || password === 'safe instagram password')) {
      setError(null);
      setStep('WHO_ARE_YOU');
      return;
    }

    // Otherwise, attempt direct authentication for individual accounts
    setIsLoading(true);
    setError(null);

    try {
      const res = await safeFetchJson<{
        success: boolean;
        token: string;
        admin: AdminUser;
        error?: string;
      }>('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, password }),
      });

      if (!res.ok || !res.data?.success || !res.data?.token) {
        setError(res.data?.error || res.error || 'Authentication denied. Invalid bureau credentials.');
        setIsLoading(false);
        return;
      }

      localStorage.setItem('r4v_admin_token', res.data.token);
      onLoginSuccess(res.data.token, res.data.admin);
    } catch (err: any) {
      setError('Connection to bureau auth gateway failed. Please retry.');
      setIsLoading(false);
    }
  };

  const handleSelectRoleAndLogin = async (persona: PersonaOption) => {
    setSelectedPersonaId(persona.id);
    setIsLoading(true);
    setError(null);

    try {
      const res = await safeFetchJson<{
        success: boolean;
        token: string;
        admin: AdminUser;
        error?: string;
      }>('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: 'team@r4v.com', 
          password,
          role: persona.role,
          persona: persona.name,
          targetEmail: persona.email
        }),
      });

      if (!res.ok || !res.data?.success || !res.data?.token) {
        setError(res.data?.error || res.error || 'Role authorization failed.');
        setIsLoading(false);
        return;
      }

      localStorage.setItem('r4v_admin_token', res.data.token);
      onLoginSuccess(res.data.token, res.data.admin);
    } catch (err: any) {
      setError('Connection to bureau auth gateway failed. Please retry.');
      setIsLoading(false);
    }
  };

  const handleAutofillMaster = () => {
    setEmail('team@r4v.com');
    setPassword('R4VBureau1920!');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#050709] text-[#ede8dd] flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(197,160,89,0.06)_0%,transparent_70%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_0%,rgba(5,7,9,0.85)_100%)] pointer-events-none" />
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#c5a059] to-transparent opacity-40" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-xl bg-[#0b0e14] border border-[#222834] relative shadow-[0_0_60px_rgba(0,0,0,0.8)] z-10"
      >
        {/* Classified Header Banner */}
        <div className="bg-[#0e121a] border-b border-[#222834] px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#171c26] border border-[#c5a059]/40 flex items-center justify-center text-[#c5a059]">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] text-[#c5a059] font-mono tracking-[0.25em] uppercase font-bold flex items-center gap-1.5">
                <span>R4V CLASSIFIED GATEWAY</span>
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#22c55e] animate-pulse" />
              </div>
              <h1 className="text-sm font-serif font-bold text-[#ede8dd] tracking-wider uppercase">
                ADMINISTRATION TERMINAL
              </h1>
            </div>
          </div>
          <button
            onClick={onExit}
            className="text-[11px] font-mono text-[#8c8273] hover:text-[#ede8dd] px-2.5 py-1 border border-[#222834] hover:border-[#8c8273] transition-colors uppercase tracking-wider cursor-pointer"
          >
            ← PUBLIC VIEW
          </button>
        </div>

        {/* Content Container */}
        <div className="p-6 md:p-8 space-y-6">
          <AnimatePresence mode="wait">
            {step === 'CREDENTIALS' ? (
              <motion.div
                key="step-credentials"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.25 }}
                className="space-y-6"
              >
                <div className="border-l-2 border-[#c5a059] pl-3 py-1 bg-[#121620]/40 flex items-start justify-between gap-2">
                  <p className="text-xs text-[#8c8273] leading-relaxed">
                    Enter master team credentials (<span className="text-[#c5a059] font-mono font-bold">team@r4v.com</span> / <span className="text-[#c5a059] font-mono font-bold">R4VBureau1920!</span>) to unlock operative role selection.
                  </p>
                  <button
                    type="button"
                    onClick={handleAutofillMaster}
                    className="shrink-0 text-[10px] font-mono text-[#c5a059] bg-[#c5a059]/10 border border-[#c5a059]/30 hover:bg-[#c5a059]/20 px-2 py-1 transition-all uppercase tracking-wider cursor-pointer flex items-center gap-1"
                    title="Autofill team master credentials"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>AUTOFILL</span>
                  </button>
                </div>

                {/* Login Form */}
                <form onSubmit={handleCredentialsSubmit} className="space-y-4">
                  {error && (
                    <motion.div 
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3 bg-[#7a1c1c]/20 border border-[#7a1c1c] text-[#f87171] text-xs flex items-center gap-2"
                    >
                      <AlertTriangle className="w-4 h-4 shrink-0 text-[#f87171]" />
                      <span>{error}</span>
                    </motion.div>
                  )}

                  {/* Email Identifier Field */}
                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-widest text-[#8c8273] mb-1.5 font-bold">
                      ADMINISTRATOR EMAIL IDENTIFIER
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="team@r4v.com or individual email"
                        required
                        autoComplete="email"
                        className="w-full bg-[#07090d] border border-[#222834] focus:border-[#c5a059] px-3.5 py-2.5 pl-10 text-sm text-[#ede8dd] font-mono placeholder:text-[#4a5568] focus:outline-none transition-colors"
                      />
                      <Mail className="w-4 h-4 text-[#8c8273] absolute left-3.5 top-3 pointer-events-none" />
                    </div>
                  </div>

                  {/* Password Field with Show/Hide Password Feature */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-[10px] font-mono uppercase tracking-widest text-[#8c8273] font-bold">
                        SECRET KEY / PASSWORD
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-[10px] font-mono text-[#c5a059] hover:text-[#e5cb91] flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        {showPassword ? (
                          <>
                            <EyeOff className="w-3 h-3" />
                            <span>HIDE PASSWORD</span>
                          </>
                        ) : (
                          <>
                            <Eye className="w-3 h-3" />
                            <span>SEE PASSWORD</span>
                          </>
                        )}
                      </button>
                    </div>
                    
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter classified access key"
                        required
                        autoComplete="current-password"
                        className="w-full bg-[#07090d] border border-[#222834] focus:border-[#c5a059] px-3.5 py-2.5 pl-10 pr-10 text-sm text-[#ede8dd] font-mono placeholder:text-[#4a5568] focus:outline-none transition-colors"
                      />
                      <Key className="w-4 h-4 text-[#8c8273] absolute left-3.5 top-3 pointer-events-none" />
                      
                      {/* Interactive See Password Toggle inside input */}
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-2.5 p-1 text-[#8c8273] hover:text-[#ede8dd] transition-colors cursor-pointer"
                        title={showPassword ? 'Hide password' : 'Show password'}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4 text-[#c5a059]" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full mt-2 bg-[#c5a059] hover:bg-[#d8b46e] text-[#0b0e14] font-bold text-xs uppercase tracking-[0.2em] py-3.5 px-4 flex items-center justify-center gap-2 transition-all disabled:opacity-50 font-mono shadow-[0_0_20px_rgba(197,160,89,0.2)] cursor-pointer"
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <span className="w-3.5 h-3.5 border-2 border-[#0b0e14] border-t-transparent rounded-full animate-spin" />
                        <span>VALIDATING CLEARANCE HASH...</span>
                      </span>
                    ) : (
                      <>
                        <span>VERIFY & CONTINUE</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              </motion.div>
            ) : (
              /* Step 2: "WHO ARE YOU?" - Role Selection Screen */
              <motion.div
                key="step-who-are-you"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.25 }}
                className="space-y-6"
              >
                {/* Authenticated Master Badge */}
                <div className="bg-[#0e1622] border border-[#38bdf8]/30 p-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded bg-[#38bdf8]/20 border border-[#38bdf8]/40 flex items-center justify-center text-[#38bdf8]">
                      <Fingerprint className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-[10px] font-mono text-[#38bdf8] font-bold tracking-wider uppercase flex items-center gap-1.5">
                        <CheckCircle2 className="w-3 h-3 text-[#22c55e]" />
                        <span>MASTER CREDENTIALS ACCEPTED (team@r4v.com)</span>
                      </div>
                      <div className="text-xs text-[#ede8dd] font-bold">
                        WHO ARE YOU? SELECT YOUR OPERATIVE ROLE
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setStep('CREDENTIALS');
                      setError(null);
                    }}
                    className="text-[10px] font-mono text-[#8c8273] hover:text-[#ede8dd] px-2 py-1 border border-[#222834] hover:border-[#8c8273] transition-colors flex items-center gap-1 cursor-pointer uppercase"
                  >
                    <ArrowLeft className="w-3 h-3" />
                    <span>CHANGE</span>
                  </button>
                </div>

                {error && (
                  <motion.div 
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 bg-[#7a1c1c]/20 border border-[#7a1c1c] text-[#f87171] text-xs flex items-center gap-2"
                  >
                    <AlertTriangle className="w-4 h-4 shrink-0 text-[#f87171]" />
                    <span>{error}</span>
                  </motion.div>
                )}

                {/* Persona Selection Cards */}
                <div className="space-y-3">
                  <div className="text-[10px] font-mono uppercase tracking-widest text-[#8c8273] font-bold flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5 text-[#c5a059]" />
                    <span>SELECT ACTIVE PERSONA TO INITIALIZE TERMINAL</span>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    {PERSONA_OPTIONS.map((persona) => {
                      const IconComponent = persona.icon;
                      const isSelected = selectedPersonaId === persona.id;

                      return (
                        <button
                          key={persona.id}
                          type="button"
                          disabled={isLoading}
                          onClick={() => handleSelectRoleAndLogin(persona)}
                          className={`w-full text-left p-4 border transition-all relative group cursor-pointer ${
                            isSelected
                              ? `${persona.colorClass.border} ${persona.colorClass.bg} ${persona.colorClass.glow}`
                              : `border-[#222834] bg-[#07090d] hover:${persona.colorClass.border} hover:bg-[#0e121a]`
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded border flex items-center justify-center ${persona.colorClass.badge}`}>
                                <IconComponent className="w-4 h-4" />
                              </div>
                              <div>
                                <div className="text-sm font-bold text-[#ede8dd] group-hover:text-white flex items-center gap-2">
                                  <span>{persona.name}</span>
                                  <span className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded border ${persona.colorClass.badge}`}>
                                    {persona.role}
                                  </span>
                                </div>
                                <div className="text-[10px] font-mono text-[#8c8273]">
                                  {persona.email} • {persona.roleTitle}
                                </div>
                              </div>
                            </div>

                            <div className="text-right shrink-0">
                              <span className="text-[9px] font-mono text-[#c5a059] bg-[#121620] px-2 py-0.5 border border-[#222834] block">
                                {persona.clearanceLevel}
                              </span>
                            </div>
                          </div>

                          <p className="text-xs text-[#8c8273] group-hover:text-[#b5af9f] transition-colors leading-relaxed">
                            {persona.description}
                          </p>

                          <div className="mt-3 pt-2.5 border-t border-[#171c26] flex items-center justify-between text-[10px] font-mono">
                            <span className={persona.colorClass.text}>
                              CLEARANCE LEVEL {persona.role === 'MANAGER' ? '2' : '3'}
                            </span>
                            <span className="flex items-center gap-1 text-[#ede8dd] group-hover:translate-x-1 transition-transform">
                              <span>ENTER TERMINAL AS {persona.name.toUpperCase()}</span>
                              <ArrowRight className="w-3 h-3" />
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {isLoading && (
                  <div className="p-3 bg-[#0d121c] border border-[#c5a059]/40 text-[#c5a059] text-xs font-mono flex items-center justify-center gap-2 animate-pulse">
                    <div className="w-3.5 h-3.5 border-2 border-[#c5a059] border-t-transparent rounded-full animate-spin" />
                    <span>INITIALIZING ROLE TERMINAL CLEARANCE...</span>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Security Notice Footer */}
          <div className="pt-4 border-t border-[#171c26] text-[10px] font-mono text-[#5a6578] flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Lock className="w-3 h-3 text-[#c5a059]" />
              <span>TLS 1.3 / BCRYPT ENFORCED</span>
            </span>
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-[#22c55e]" />
              <span>ROLE-BASED CLEARANCE HIERARCHY</span>
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
