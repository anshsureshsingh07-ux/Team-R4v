import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  ShieldCheck, 
  Lock, 
  EyeOff, 
  Server, 
  AlertTriangle, 
  FileText, 
  CheckCircle2,
  Sparkles,
  Ban,
  Shield,
  HelpCircle,
  Scale
} from 'lucide-react';

interface PrivacyNoticeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenTerms?: () => void;
}

export const PrivacyNoticeModal: React.FC<PrivacyNoticeModalProps> = ({ 
  isOpen, 
  onClose,
  onOpenTerms 
}) => {
  if (!isOpen) return null;

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
        className="relative w-full max-w-3xl my-auto bg-[#0d0f13] border-2 border-[#8c6d32] shadow-[0_20px_80px_rgba(0,0,0,0.95)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Bureau Ribbon */}
        <div className="h-2 bg-gradient-to-r from-[#59431b] via-[#c5a059] to-[#59431b]" />

        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-[#222834] flex items-center justify-between bg-[#13161c]">
          <div className="flex items-center gap-3">
            <div className="p-2 border border-[#8c6d32] bg-[#1a1e27] text-[#c5a059]">
              <ShieldCheck size={22} />
            </div>
            <div>
              <span className="font-mono-vintage text-[10px] text-[#c5a059] tracking-widest block uppercase font-bold flex items-center gap-1.5">
                <span>R4V DATA DIRECTIVE // CONFIDENTIAL VAULT</span>
                <span className="stamp-classified text-[9px] py-0 px-1.5">SECURE</span>
              </span>
              <h2 className="font-cinzel text-xl sm:text-2xl font-bold text-[#ede8dd] tracking-wider flex items-center gap-2">
                <span>🧠 R4V PRIVACY POLICY</span>
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-[#8f8779] hover:text-[#ede8dd] border border-[#232936] hover:border-[#c5a059] transition-colors cursor-pointer"
            title="Close privacy notice"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 max-h-[75vh] overflow-y-auto custom-scrollbar space-y-6 text-[#cbc4b5] font-sans text-xs sm:text-sm leading-relaxed">
          {/* Subtitle / aka */}
          <div className="p-4 bg-[#141720] border-l-4 border-[#c5a059] font-mono-vintage text-xs space-y-1.5">
            <div className="text-[#e5cb91] font-bold text-sm tracking-wide">
              aka: “Bhai hum tumhara data fridge mein nahi rakh rahe.”
            </div>
            <div className="text-[11px] text-[#8c8273] flex items-center gap-2">
              <span><strong>Last updated:</strong> Whenever Asura remembers the password 💀</span>
            </div>
            <p className="text-[#a8a092] pt-1">
              Welcome to <strong className="text-[#ede8dd]">TEAM R4V</strong>, where your data is treated with more seriousness than a CBSE board exam result.
            </p>
          </div>

          {/* WHAT WE COLLECT */}
          <div className="p-5 bg-[#090b0e] border border-[#222834] space-y-3">
            <div className="flex items-center gap-2 text-sm font-bold text-[#ede8dd] font-cinzel">
              <span className="text-[#c5a059] font-mono font-bold">🗿 WHAT WE COLLECT</span>
            </div>
            <p className="text-xs text-[#a8a092]">Depending on what you do, R4V may collect:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono text-[#e5cb91]">
              <span className="p-2 bg-[#121620] border border-[#1f2636] flex items-center gap-2">
                <CheckCircle2 size={13} className="text-[#22c55e]" /> Your R4V username
              </span>
              <span className="p-2 bg-[#121620] border border-[#1f2636] flex items-center gap-2">
                <CheckCircle2 size={13} className="text-[#22c55e]" /> Email
              </span>
              <span className="p-2 bg-[#121620] border border-[#1f2636] flex items-center gap-2">
                <CheckCircle2 size={13} className="text-[#22c55e]" /> Application information
              </span>
              <span className="p-2 bg-[#121620] border border-[#1f2636] flex items-center gap-2">
                <CheckCircle2 size={13} className="text-[#22c55e]" /> Team role
              </span>
              <span className="p-2 bg-[#121620] border border-[#1f2636] flex items-center gap-2">
                <CheckCircle2 size={13} className="text-[#22c55e]" /> Case information you voluntarily submit
              </span>
              <span className="p-2 bg-[#121620] border border-[#1f2636] flex items-center gap-2">
                <CheckCircle2 size={13} className="text-[#22c55e]" /> Evidence uploaded to a case
              </span>
              <span className="p-2 bg-[#121620] border border-[#1f2636] flex items-center gap-2 col-span-1 sm:col-span-2">
                <CheckCircle2 size={13} className="text-[#22c55e]" /> Basic technical/security information
              </span>
            </div>

            <div className="p-3 bg-[#171113] border border-[#591619] text-xs font-mono space-y-1">
              <div className="text-[#f87171] font-bold">We do NOT need your Instagram password.</div>
              <p className="text-[#d8d2c5] italic">
                If someone asks you: “bhai password de na, trust me bro”
              </p>
              <div className="text-[#fca5a5] font-bold">
                DO NOT GIVE IT. That's not R4V. That's some NPC from Ohio. 💀
              </div>
            </div>
          </div>

          {/* INDIAN DATA DEPARTMENT */}
          <div className="p-5 bg-[#090b0e] border border-[#222834] space-y-3">
            <div className="flex items-center gap-2 text-sm font-bold text-[#ede8dd] font-cinzel">
              <span className="text-[#c5a059] font-mono font-bold">🇮🇳 INDIAN DATA DEPARTMENT</span>
            </div>
            <p className="text-xs text-[#a8a092]">Your data will NOT be handed to:</p>
            <ul className="space-y-1.5 text-xs font-mono text-[#d8d2c5] list-disc list-inside bg-[#121620] p-3 border border-[#1f2636]">
              <li>Sharma ji</li>
              <li>Sharma ji's son</li>
              <li>Your tuition teacher</li>
              <li>The random uncle asking <span className="italic text-[#c5a059]">“beta kya kar rahe ho?”</span></li>
              <li>The guy selling samosas outside school</li>
            </ul>
            <p className="text-[11px] font-mono text-[#8c8273]">
              Unless legally required, of course.
            </p>
          </div>

          {/* AMERICAN RUMOUR DEPARTMENT */}
          <div className="p-5 bg-[#090b0e] border border-[#222834] space-y-3">
            <div className="flex items-center gap-2 text-sm font-bold text-[#ede8dd] font-cinzel">
              <span className="text-[#38bdf8] font-mono font-bold">🇺🇸 AMERICAN RUMOUR DEPARTMENT</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-xs">
              <div className="p-3 bg-[#11141c] border border-[#232936] space-y-1">
                <span className="text-[#38bdf8] font-bold text-[10px] block">RUMOUR:</span>
                <p className="italic text-[#9ca3af]">“R4V has your data stored in a NASA supercomputer.”</p>
                <div className="text-[#22c55e] font-bold pt-1">Reality: No. NASA is busy doing NASA things. 🚀</div>
              </div>
              <div className="p-3 bg-[#11141c] border border-[#232936] space-y-1">
                <span className="text-[#38bdf8] font-bold text-[10px] block">ANOTHER RUMOUR:</span>
                <p className="italic text-[#9ca3af]">“The FBI is watching R4V.”</p>
                <div className="text-[#e5cb91] font-bold pt-1">Bro, they have better things to do. 😭</div>
              </div>
            </div>
          </div>

          {/* PASSWORD POLICY */}
          <div className="p-5 bg-[#090b0e] border border-[#222834] space-y-3">
            <div className="flex items-center gap-2 text-sm font-bold text-[#ede8dd] font-cinzel">
              <Lock size={15} className="text-[#c5a059]" />
              <span className="text-[#c5a059] font-mono font-bold">🔐 PASSWORD POLICY</span>
            </div>
            <div className="p-4 bg-[#141720] border border-[#232936] text-xs font-mono space-y-2 text-[#d8d2c5]">
              <div className="font-bold text-[#ede8dd]">Your R4V password belongs to YOU.</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[#9ca3af]">
                <div>• We don't want your Instagram password.</div>
                <div>• We don't want your Gmail password.</div>
                <div>• We don't want your OTP.</div>
                <div>• We don't want your mother's Wi-Fi password.</div>
              </div>
              <div className="pt-2 border-t border-[#232936] text-center">
                <span className="text-xs text-[#8c8273]">We definitely don't want:</span>
                <div className="text-sm font-bold text-[#f87171] mt-0.5 tracking-wider">
                  “MaaKaPakora123” 💀
                </div>
              </div>
            </div>
          </div>

          {/* IP ADDRESS */}
          <div className="p-5 bg-[#090b0e] border border-[#222834] space-y-3">
            <div className="flex items-center gap-2 text-sm font-bold text-[#ede8dd] font-cinzel">
              <Server size={15} className="text-[#c5a059]" />
              <span className="text-[#c5a059] font-mono font-bold">📡 IP ADDRESS & NETWORK TELEMETRY</span>
            </div>
            <p className="text-xs text-[#a8a092]">
              Technical information such as IP addresses may be processed for security and abuse prevention.
            </p>
            <div className="p-3 bg-[#11141c] border border-[#232936] text-xs font-mono text-[#d8d2c5] space-y-1">
              <p>No, we are not sitting in a basement saying:</p>
              <div className="italic text-[#c5a059]">“Bhai iska IP Ahmedabad ka hai.”</div>
              <div className="font-bold text-[#ede8dd] pt-1">Touch grass.</div>
            </div>
          </div>

          {/* EVIDENCE */}
          <div className="p-5 bg-[#090b0e] border border-[#222834] space-y-3">
            <div className="flex items-center gap-2 text-sm font-bold text-[#ede8dd] font-cinzel">
              <FileText size={15} className="text-[#c5a059]" />
              <span className="text-[#c5a059] font-mono font-bold">🧾 EVIDENCE SUBMISSIONS</span>
            </div>
            <p className="text-xs text-[#ede8dd] font-bold">
              Please upload relevant evidence only. Do NOT upload:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono text-[#f87171]">
              <span className="p-2 bg-[#181113] border border-[#401216] flex items-center gap-1.5">
                <Ban size={12} /> Passwords
              </span>
              <span className="p-2 bg-[#181113] border border-[#401216] flex items-center gap-1.5">
                <Ban size={12} /> OTPs
              </span>
              <span className="p-2 bg-[#181113] border border-[#401216] flex items-center gap-1.5">
                <Ban size={12} /> Private keys
              </span>
              <span className="p-2 bg-[#181113] border border-[#401216] flex items-center gap-1.5">
                <Ban size={12} /> Random family photos
              </span>
              <span className="p-2 bg-[#181113] border border-[#401216] flex items-center gap-1.5">
                <Ban size={12} /> Your Aadhaar card because “maybe useful”
              </span>
              <span className="p-2 bg-[#181113] border border-[#401216] flex items-center gap-1.5">
                <Ban size={12} /> Screenshot of your crush's WhatsApp 😭
              </span>
            </div>
          </div>

          {/* FINAL RUMOUR */}
          <div className="p-5 bg-[#090b0e] border border-[#222834] space-y-2">
            <div className="flex items-center gap-2 text-sm font-bold text-[#ede8dd] font-cinzel">
              <span className="text-[#c5a059] font-mono font-bold">🤡 FINAL RUMOUR</span>
            </div>
            <div className="p-3 bg-[#11141c] border border-[#232936] text-xs font-mono space-y-1">
              <div><strong className="text-[#f87171]">RUMOUR:</strong> R4V can control Instagram.</div>
              <div><strong className="text-[#22c55e]">REALITY:</strong> No. Instagram/Meta controls its own enforcement decisions. R4V documents legitimate cases.</div>
            </div>
          </div>

          {/* TL;DR */}
          <div className="p-5 bg-[#0c1018] border-2 border-[#c5a059] space-y-2 text-center">
            <div className="font-cinzel text-sm font-bold text-[#ede8dd] uppercase tracking-wider">
              R4V PRIVACY TL;DR
            </div>
            <div className="space-y-1 text-xs font-mono text-[#e5cb91] font-bold">
              <div>• We collect what the service needs.</div>
              <div>• We don't need your passwords.</div>
              <div>• We don't sell your secrets to Sharma ji.</div>
              <div>• And NASA still doesn't work for us.</div>
            </div>
          </div>

          {/* SERIOUS BIT */}
          <div className="p-5 bg-[#090b0e] border border-[#222834] space-y-2 text-xs font-mono text-[#8c8273]">
            <div className="text-xs font-bold text-[#f87171] flex items-center gap-1.5 uppercase tracking-wider">
              <AlertTriangle size={14} className="text-[#f87171]" />
              <span>⚠️ SERIOUS BIT</span>
            </div>
            <p>
              The jokes above are just presentation. The actual privacy practices, data processing, security measures, and legal rights described on this page remain applicable.
            </p>
            <div className="pt-2 border-t border-[#1a1f2c] text-[#ede8dd]">
              If you have a privacy question: <strong className="text-[#c5a059]">Contact R4V Administration.</strong>
            </div>
          </div>

          {/* Footer Controls */}
          <div className="pt-2 border-t border-[#222834] flex flex-col sm:flex-row items-center justify-between gap-4 font-mono-vintage text-[11px]">
            {onOpenTerms && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenTerms();
                }}
                className="text-[#c5a059] hover:underline cursor-pointer flex items-center gap-1 font-bold"
              >
                <span>READ TERMS & CONDITIONS (aka: Bhai rules padh le...) →</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="w-full sm:w-auto px-8 py-2.5 bg-[#181d26] border border-[#8c6d32] hover:border-[#c5a059] text-xs font-mono-vintage text-[#ede8dd] tracking-widest uppercase transition-all cursor-pointer"
            >
              ACKNOWLEDGE & CLOSE
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
