import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Play, 
  Pause, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  ShieldAlert, 
  CheckCircle2, 
  Archive, 
  AlertTriangle,
  ArrowRight,
  Stamp as StampIcon,
  Search,
  Eye
} from 'lucide-react';

interface CaseFileSequenceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CaseFileSequenceModal: React.FC<CaseFileSequenceModalProps> = ({ isOpen, onClose }) => {
  // Stage management: 0 = Opening Black / Detect, 1 = Dossier & Stamp, 2 = Evidence Board, 3 = Resolution Outcomes, 4 = Final Maxim
  const [currentStage, setCurrentStage] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [verificationStatus, setVerificationStatus] = useState<'UNVERIFIED' | 'UNDER REVIEW'>('UNVERIFIED');
  const [typewriterText, setTypewriterText] = useState<string>('');

  const audioCtxRef = useRef<AudioContext | null>(null);

  // Initialize Web Audio synthesizer for vintage sounds
  const playSound = (type: 'typewriter' | 'stamp' | 'transition' | 'click') => {
    if (!soundEnabled) return;
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      if (type === 'typewriter') {
        // High frequency typewriter click
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();

        osc.type = 'square';
        osc.frequency.setValueAtTime(800 + Math.random() * 400, ctx.currentTime);
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(1200, ctx.currentTime);

        gain.gain.setValueAtTime(0.04, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        osc.stop(ctx.currentTime + 0.05);
      } else if (type === 'stamp') {
        // Heavy stamp impact thud
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(140, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(30, ctx.currentTime + 0.25);

        gain.gain.setValueAtTime(0.35, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.28);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      } else if (type === 'transition') {
        // Atmospheric brass hum
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(220, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(330, ctx.currentTime + 0.4);

        gain.gain.setValueAtTime(0.05, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        osc.stop(ctx.currentTime + 0.6);
      }
    } catch {
      // Audio not supported or blocked
    }
  };

  // Reset when modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentStage(0);
      setIsPlaying(true);
      setVerificationStatus('UNVERIFIED');
      setTypewriterText('');
    }
  }, [isOpen]);

  // Stage 0 Typewriter effect
  useEffect(() => {
    if (!isOpen || currentStage !== 0) return;

    const fullStr = 'TEAM R4V // NEW CASE DETECTED...';
    let idx = 0;
    setTypewriterText('');

    const interval = setInterval(() => {
      if (idx <= fullStr.length) {
        setTypewriterText(fullStr.slice(0, idx));
        playSound('typewriter');
        idx++;
      } else {
        clearInterval(interval);
      }
    }, 60);

    return () => clearInterval(interval);
  }, [isOpen, currentStage]);

  // Status transition during Stage 2 (Evidence Review)
  useEffect(() => {
    if (currentStage === 2) {
      setVerificationStatus('UNVERIFIED');
      const timer = setTimeout(() => {
        setVerificationStatus('UNDER REVIEW');
        playSound('transition');
      }, 1600);
      return () => clearTimeout(timer);
    }
  }, [currentStage]);

  // Autoplay progression through 5 stages
  useEffect(() => {
    if (!isOpen || !isPlaying) return;

    // Timing per stage
    const durations = [
      3200, // Stage 0: Opening Detect
      4200, // Stage 1: Case File & Stamp
      5000, // Stage 2: Evidence Review
      5200, // Stage 3: Resolution Tri-State
      4800  // Stage 4: Final Maxim
    ];

    const timer = setTimeout(() => {
      if (currentStage < 4) {
        const nextStage = currentStage + 1;
        setCurrentStage(nextStage);
        if (nextStage === 1) playSound('stamp');
        else playSound('transition');
      } else {
        // Stop playing at the end
        setIsPlaying(false);
      }
    }, durations[currentStage]);

    return () => clearTimeout(timer);
  }, [isOpen, isPlaying, currentStage]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-xl p-3 sm:p-6 select-none overflow-hidden"
        onClick={onClose}
      >
        {/* Projector Grain, Vignette & Camera Shake Box */}
        <div 
          className="relative w-full max-w-5xl h-[85vh] max-h-[720px] bg-[#090b0e] border-2 border-[#333a48] shadow-[0_0_100px_rgba(0,0,0,0.95)] overflow-hidden flex flex-col justify-between"
          onClick={(e) => e.stopPropagation()}
        >
          {/* 1920s Projector Scanlines & Flicker Overlay */}
          <div className="absolute inset-0 pointer-events-none z-30 opacity-25 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px] animate-pulse" />
          <div className="absolute inset-0 pointer-events-none z-30 bg-gradient-to-b from-black/50 via-transparent to-black/70" />
          <div className="absolute inset-0 pointer-events-none z-30 shadow-[inset_0_0_120px_rgba(0,0,0,0.9)]" />

          {/* Top Control Bar */}
          <div className="relative z-40 flex items-center justify-between px-6 py-4 border-b border-[#1f242e] bg-[#0c0e12]/80 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-[#8c1d1d] animate-ping" />
              <span className="font-mono-vintage text-xs tracking-[0.25em] text-[#c5a059] uppercase font-bold">
                CINEMATIC CASE FILE // SEQUENCE PLAYER
              </span>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2 sm:gap-4">
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="p-1.5 text-[#9a9284] hover:text-[#ede8dd] border border-[#262b35] hover:border-[#c5a059] transition-colors"
                title={soundEnabled ? 'Mute Audio' : 'Unmute Audio'}
              >
                {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
              </button>

              <button
                onClick={() => {
                  setCurrentStage(0);
                  setIsPlaying(true);
                  playSound('transition');
                }}
                className="p-1.5 text-[#9a9284] hover:text-[#ede8dd] border border-[#262b35] hover:border-[#c5a059] transition-colors"
                title="Restart Sequence"
              >
                <RotateCcw size={16} />
              </button>

              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="flex items-center gap-1.5 px-3 py-1 text-xs font-mono-vintage text-[#ede8dd] bg-[#161a22] border border-[#2d3442] hover:border-[#c5a059] transition-colors"
              >
                {isPlaying ? <Pause size={13} /> : <Play size={13} />}
                <span>{isPlaying ? 'PAUSE' : 'PLAY'}</span>
              </button>

              <button
                onClick={onClose}
                className="p-1.5 text-[#9a9284] hover:text-[#e5cb91] border border-[#262b35] hover:border-[#c5a059] transition-colors ml-2"
                title="Close Sequence"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Main Visual Stage Display */}
          <div className="relative flex-1 flex items-center justify-center p-6 sm:p-12 overflow-hidden z-20">
            <AnimatePresence mode="wait">
              {/* ================= STAGE 0: OPENING / CASE DETECTED ================= */}
              {currentStage === 0 && (
                <motion.div
                  key="stage-0"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, filter: 'blur(8px)', scale: 1.05 }}
                  transition={{ duration: 0.7 }}
                  className="text-center space-y-6 max-w-xl"
                >
                  <div className="inline-flex items-center justify-center p-4 bg-[#111419] border border-[#2c3340] rounded-full text-[#c5a059] mb-2 shadow-[0_0_40px_rgba(197,160,89,0.15)]">
                    <ShieldAlert size={36} className="animate-pulse" />
                  </div>

                  <h1 className="font-cinzel text-3xl sm:text-5xl font-black text-[#ede8dd] tracking-[0.25em] uppercase">
                    TEAM R4V
                  </h1>

                  <div className="p-4 bg-[#0a0c0f] border-y border-[#292f3b]">
                    <span className="font-typewriter text-lg sm:text-xl text-[#c5a059] tracking-wider">
                      {typewriterText}
                      <span className="inline-block w-2 h-4 bg-[#c5a059] ml-1 animate-pulse" />
                    </span>
                  </div>

                  <p className="font-editorial italic text-[#8a8172] text-sm sm:text-base">
                    Initializing secure archival dossier protocol...
                  </p>
                </motion.div>
              )}

              {/* ================= STAGE 1: CASE FILE & RED STAMP ================= */}
              {currentStage === 1 && (
                <motion.div
                  key="stage-1"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.6 }}
                  className="w-full max-w-2xl bg-[#12151b] border-2 border-[#c5a059]/60 p-6 sm:p-10 shadow-[0_20px_80px_rgba(0,0,0,0.9)] relative"
                >
                  {/* Top Manila Ribbon */}
                  <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#8c6d32]" />

                  {/* Red Case Stamp Animation */}
                  <motion.div
                    initial={{ scale: 2.2, opacity: 0, rotate: -15 }}
                    animate={{ scale: 1, opacity: 1, rotate: -6 }}
                    transition={{ delay: 0.35, duration: 0.25, type: 'spring', stiffness: 300, damping: 15 }}
                    className="absolute top-4 sm:top-6 right-4 sm:right-6 border-4 border-[#9e2a2b] px-4 py-1.5 text-[#df878b] font-cinzel font-black text-xs sm:text-base tracking-[0.2em] uppercase bg-[#9e2a2b]/15 transform -rotate-6 shadow-[0_0_20px_rgba(158,42,43,0.4)]"
                  >
                    CASE #R4V-NEW-001
                  </motion.div>

                  {/* Header Title */}
                  <div className="pb-4 border-b border-[#232833] mb-6">
                    <span className="font-mono-vintage text-[11px] text-[#c5a059] tracking-widest block uppercase">
                      BUREAU INTAKE DOSSIER
                    </span>
                    <h2 className="font-cinzel text-2xl sm:text-3xl font-bold text-[#ede8dd] tracking-wider">
                      CASE FILE: R4V-NEW-001
                    </h2>
                  </div>

                  {/* Case Metadata Grid */}
                  <div className="space-y-4 font-mono-vintage text-xs sm:text-sm">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="p-3 bg-[#0a0c0f] border border-[#1f242e]">
                        <span className="text-[#726a5d] text-[10px] block uppercase">CASE ID</span>
                        <span className="text-[#ede8dd] font-bold tracking-wider">R4V-NEW-001</span>
                      </div>

                      <div className="p-3 bg-[#0a0c0f] border border-[#1f242e]">
                        <span className="text-[#726a5d] text-[10px] block uppercase">SUBJECT IDENTIFIER</span>
                        <span className="text-[#e5cb91] font-bold tracking-wider">
                          [REDACTED] // @35647_ROHITA
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="p-3 bg-[#0a0c0f] border border-[#1f242e] flex items-center justify-between">
                        <div>
                          <span className="text-[#726a5d] text-[10px] block uppercase">STATUS</span>
                          <span className="text-[#df878b] font-bold tracking-wider">UNDER REVIEW</span>
                        </div>
                        <span className="w-2 h-2 rounded-full bg-[#9e2a2b] animate-ping" />
                      </div>

                      <div className="p-3 bg-[#0a0c0f] border border-[#1f242e]">
                        <span className="text-[#726a5d] text-[10px] block uppercase">PRIORITY LEVEL</span>
                        <span className="text-[#ede8dd] font-bold tracking-wider">2X PRIORITY</span>
                      </div>
                    </div>

                    <div className="p-3.5 bg-[#0a0c0f] border border-[#1f242e]">
                      <span className="text-[#726a5d] text-[10px] block uppercase">CATEGORY</span>
                      <span className="text-[#c5a059] font-bold tracking-wide block mt-0.5">
                        PLATFORM VIOLATION — PENDING VERIFICATION
                      </span>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ================= STAGE 2: EVIDENCE REVIEW BOARD ================= */}
              {currentStage === 2 && (
                <motion.div
                  key="stage-2"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.04 }}
                  transition={{ duration: 0.6 }}
                  className="w-full max-w-3xl bg-[#101318] border border-[#2b3240] p-6 sm:p-8 space-y-6"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#202530]">
                    <div>
                      <div className="font-mono-vintage text-[10px] text-[#c5a059] tracking-widest uppercase">
                        PHASE II // FORENSIC SCRUTINY
                      </div>
                      <h3 className="font-cinzel text-xl sm:text-2xl font-bold text-[#ede8dd] tracking-wider">
                        EVIDENCE REQUIRED BOARD
                      </h3>
                    </div>

                    {/* Verification Status Indicator */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono-vintage text-[#7c7567] uppercase">STATUS:</span>
                      <span
                        className={`font-mono-vintage text-xs font-bold px-3 py-1 border tracking-widest transition-all duration-700 ${
                          verificationStatus === 'UNVERIFIED'
                            ? 'bg-[#403014]/40 border-[#c5a059] text-[#e5cb91]'
                            : 'bg-[#5c1c1e]/40 border-[#9e2a2b] text-[#f2a2a6] shadow-[0_0_20px_rgba(158,42,43,0.5)]'
                        }`}
                      >
                        {verificationStatus}
                      </span>
                    </div>
                  </div>

                  {/* 5-Step Pipeline Breadcrumb */}
                  <div className="p-4 bg-[#090b0e] border border-[#1e232c]">
                    <div className="text-[10px] font-mono-vintage text-[#8c6d32] uppercase tracking-widest mb-3 text-center sm:text-left">
                      MANDATORY 5-TIER VERIFICATION PIPELINE
                    </div>
                    <div className="flex flex-wrap items-center justify-center sm:justify-between gap-2 text-xs font-mono-vintage">
                      {['SOURCE', 'CONTENT', 'CONTEXT', 'PLATFORM RULE', 'REVIEW'].map((step, i, arr) => (
                        <React.Fragment key={step}>
                          <div className="px-3 py-1.5 bg-[#141820] border border-[#272f3e] text-[#ede8dd] font-bold tracking-wider">
                            {step}
                          </div>
                          {i < arr.length - 1 && (
                            <ArrowRight size={13} className="text-[#c5a059] hidden sm:block" />
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>

                  {/* Strict Operational Doctrine */}
                  <div className="p-4 bg-[#14161b] border-l-4 border-[#8c6d32] text-xs sm:text-sm font-editorial text-[#cbc3b2] space-y-1">
                    <p className="font-bold text-[#ede8dd]">
                      STRICT ADHERENCE TO THE R4V INTEGRITY DIRECTIVE:
                    </p>
                    <p className="italic text-[#9e9584]">
                      “Do not invent evidence or accusations. Every claim must anchor directly to verified platform terms and unedited archival logs.”
                    </p>
                  </div>
                </motion.div>
              )}

              {/* ================= STAGE 3: RESOLUTION OUTCOMES (3 BRANCHES) ================= */}
              {currentStage === 3 && (
                <motion.div
                  key="stage-3"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.6 }}
                  className="w-full max-w-4xl space-y-6"
                >
                  <div className="text-center space-y-2">
                    <span className="font-mono-vintage text-xs tracking-[0.25em] text-[#c5a059] uppercase">
                      PHASE III // ADJUDICATION PROTOCOL
                    </span>
                    <h3 className="font-cinzel text-2xl sm:text-3xl font-bold text-[#ede8dd] tracking-wider uppercase">
                      THREE POSSIBLE RESOLUTION OUTCOMES
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 pt-2">
                    {/* Outcome 1: Violation Confirmed */}
                    <div className="bg-[#12151b] border-2 border-[#9e2a2b]/70 p-5 space-y-3 relative hover:border-[#df878b] transition-all">
                      <div className="flex items-center gap-2 text-[#df878b]">
                        <AlertTriangle size={18} />
                        <span className="font-cinzel font-bold text-sm tracking-wider uppercase">
                          VIOLATION CONFIRMED
                        </span>
                      </div>
                      <p className="font-editorial text-xs sm:text-sm text-[#cdc4b4] leading-relaxed">
                        Submit a legitimate platform report strictly based on the verified violation clause. No exaggeration.
                      </p>
                      <div className="pt-2 border-t border-[#251a1a] text-[11px] font-mono-vintage text-[#df878b]">
                        ACTION: OFFICIAL REPORT FILED
                      </div>
                    </div>

                    {/* Outcome 2: Insufficient Evidence */}
                    <div className="bg-[#12151b] border-2 border-[#8c6d32]/70 p-5 space-y-3 relative hover:border-[#c5a059] transition-all">
                      <div className="flex items-center gap-2 text-[#c5a059]">
                        <Archive size={18} />
                        <span className="font-cinzel font-bold text-sm tracking-wider uppercase">
                          INSUFFICIENT EVIDENCE
                        </span>
                      </div>
                      <p className="font-editorial text-xs sm:text-sm text-[#cdc4b4] leading-relaxed">
                        If logs lack corroborating evidence, place the record on hold. Archive the case without false claims.
                      </p>
                      <div className="pt-2 border-t border-[#2a2418] text-[11px] font-mono-vintage text-[#c5a059]">
                        ACTION: ARCHIVE CASE
                      </div>
                    </div>

                    {/* Outcome 3: No Violation */}
                    <div className="bg-[#12151b] border-2 border-[#3b4353] p-5 space-y-3 relative hover:border-[#8391a8] transition-all">
                      <div className="flex items-center gap-2 text-[#9bb0d1]">
                        <CheckCircle2 size={18} />
                        <span className="font-cinzel font-bold text-sm tracking-wider uppercase">
                          NO VIOLATION
                        </span>
                      </div>
                      <p className="font-editorial text-xs sm:text-sm text-[#cdc4b4] leading-relaxed">
                        If activity conforms to platform rules, immediately dismiss suspicions and permanently close the file.
                      </p>
                      <div className="pt-2 border-t border-[#1c222b] text-[11px] font-mono-vintage text-[#9bb0d1]">
                        ACTION: CLOSE CASE
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ================= STAGE 4: FINAL SCREEN / MAXIM ================= */}
              {currentStage === 4 && (
                <motion.div
                  key="stage-4"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, filter: 'brightness(0)' }}
                  transition={{ duration: 1 }}
                  className="text-center space-y-6 max-w-xl"
                >
                  <div className="w-14 h-14 mx-auto border-2 border-[#c5a059] bg-[#12151b] flex items-center justify-center text-[#c5a059] transform rotate-45 mb-4">
                    <StampIcon size={24} className="transform -rotate-45" />
                  </div>

                  <h2 className="font-cinzel text-3xl sm:text-5xl font-black text-[#ede8dd] tracking-[0.25em] uppercase">
                    TEAM R4V
                  </h2>

                  <div className="py-4 border-y-2 border-[#c5a059]/40">
                    <p className="font-cinzel text-xl sm:text-2xl font-black text-[#c5a059] tracking-[0.15em] uppercase">
                      EVIDENCE BEFORE ACCUSATION.
                    </p>
                  </div>

                  <div className="inline-block bg-[#161a22] border border-[#2b3342] px-6 py-2">
                    <span className="font-mono-vintage text-xs sm:text-sm text-[#df878b] tracking-widest uppercase font-bold">
                      CASE FILE — UNDER REVIEW
                    </span>
                  </div>

                  <div className="pt-4 flex items-center justify-center gap-4">
                    <button
                      onClick={() => {
                        setCurrentStage(0);
                        setIsPlaying(true);
                      }}
                      className="px-6 py-2.5 bg-[#181d26] border border-[#353d4e] hover:border-[#c5a059] text-xs font-mono-vintage text-[#ede8dd] tracking-widest uppercase transition-all"
                    >
                      REPLAY SEQUENCE
                    </button>
                    <button
                      onClick={onClose}
                      className="px-6 py-2.5 bg-gradient-to-r from-[#8c6d32] to-[#c5a059] text-black font-cinzel font-bold text-xs tracking-widest uppercase hover:brightness-110 transition-all"
                    >
                      RETURN TO BUREAU
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Bottom Interactive Step Progress Bar */}
          <div className="relative z-40 px-6 py-4 bg-[#0a0c0f] border-t border-[#1a1e27] flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 w-full sm:w-auto justify-center">
              {[
                '01. DETECT',
                '02. CASE FILE',
                '03. EVIDENCE',
                '04. RESOLUTION',
                '05. MAXIM'
              ].map((name, idx) => (
                <button
                  key={name}
                  onClick={() => {
                    setCurrentStage(idx);
                    setIsPlaying(false);
                    if (idx === 1) playSound('stamp');
                    else playSound('transition');
                  }}
                  className={`px-2.5 py-1 text-[10px] font-mono-vintage tracking-wider transition-all ${
                    currentStage === idx
                      ? 'bg-[#c5a059] text-black font-bold border border-[#c5a059]'
                      : 'bg-[#12151c] text-[#7d7568] border border-[#212733] hover:text-[#ede8dd]'
                  }`}
                >
                  {name}
                </button>
              ))}
            </div>

            <span className="text-[11px] font-mono-vintage text-[#635c50] tracking-widest">
              BIRMINGHAM BUREAU // SEQUENCE STAGE {currentStage + 1} OF 5
            </span>
          </div>
        </div>
      </div>
    </AnimatePresence>
  );
};
