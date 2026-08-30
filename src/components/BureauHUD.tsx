import React, { useState, useEffect } from 'react';
import { Radio, ShieldCheck, Activity, Search, Volume2, VolumeX, Terminal, Lock } from 'lucide-react';
import { ambientSound } from '../utils/ambientAudio';

interface BureauHUDProps {
  onTriggerSearch?: () => void;
  onOpenPilotAccess?: () => void;
  onNotify?: (msg: string, type?: 'info' | 'success' | 'alert' | 'copy') => void;
}

export const BureauHUD: React.FC<BureauHUDProps> = ({
  onTriggerSearch,
  onOpenPilotAccess,
  onNotify,
}) => {
  const [timeString, setTimeString] = useState<string>('');
  const [isAudioActive, setIsAudioActive] = useState<boolean>(ambientSound.getStatus());

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const utcHours = String(now.getUTCHours()).padStart(2, '0');
      const utcMinutes = String(now.getUTCMinutes()).padStart(2, '0');
      const utcSeconds = String(now.getUTCSeconds()).padStart(2, '0');
      setTimeString(`${utcHours}:${utcMinutes}:${utcSeconds} UTC`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleToggleSound = () => {
    const playing = ambientSound.toggle();
    setIsAudioActive(playing);
    ambientSound.playClick(playing ? 1100 : 700);
    if (onNotify) {
      onNotify(playing ? '1920s Vinyl & Rain Ambience Engaged.' : 'Ambient Gramophone Muted.', 'info');
    }
  };

  const handleSearchClick = () => {
    ambientSound.playClick();
    if (onTriggerSearch) {
      onTriggerSearch();
    } else {
      const archiveEl = document.getElementById('archive-search-input') || document.getElementById('archive');
      if (archiveEl) {
        archiveEl.scrollIntoView({ behavior: 'smooth' });
        if ('focus' in archiveEl) {
          (archiveEl as HTMLElement).focus();
        }
      }
    }
  };

  return (
    <div className="w-full bg-[#060708] border-b border-[#1f2229] py-1.5 px-3 sm:px-6 text-[10px] sm:text-[11px] font-mono-vintage text-[#8c8273] flex items-center justify-between gap-2 overflow-x-auto select-none z-40 relative">
      {/* Left Telemetry: Time & Ledger Status */}
      <div className="flex items-center gap-3 sm:gap-5 shrink-0">
        <div className="flex items-center gap-1.5 text-[#c5a059]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#c5a059] animate-ping" />
          <span className="font-bold tracking-widest uppercase">BUREAU CLOCK:</span>
          <span className="text-[#ede8dd]">{timeString || 'SYNCHRONIZING...'}</span>
        </div>

        <div className="hidden md:flex items-center gap-1.5 border-l border-[#1c1f26] pl-4">
          <ShieldCheck size={12} className="text-[#4ade80]" />
          <span className="tracking-wider uppercase">LEDGER:</span>
          <span className="text-[#4ade80] font-bold">256-BIT ENCRYPTED</span>
        </div>

        <div className="hidden lg:flex items-center gap-1.5 border-l border-[#1c1f26] pl-4">
          <Activity size={12} className="text-[#c5a059]" />
          <span className="tracking-wider uppercase">STATUS:</span>
          <span className="text-[#e5cb91]">DEFCON II // OBSERVATION</span>
        </div>
      </div>

      {/* Right Controls & Quick Actions */}
      <div className="flex items-center gap-2 sm:gap-4 shrink-0">
        {/* Quick Search trigger */}
        <button
          onClick={handleSearchClick}
          className="flex items-center gap-1 px-2 py-0.5 bg-[#101216] hover:bg-[#181c24] border border-[#232732] hover:border-[#c5a059] text-[#9c9589] hover:text-[#ede8dd] transition-colors cursor-pointer"
          title="Press / or Click to Search Archive"
        >
          <Search size={11} className="text-[#c5a059]" />
          <span className="hidden sm:inline">SEARCH ARCHIVE</span>
          <kbd className="bg-[#1b1e26] text-[#c5a059] px-1 text-[9px] rounded-xs ml-1 border border-[#2d323f]">
            /
          </kbd>
        </button>

        {/* Ambient Sound Button */}
        <button
          onClick={handleToggleSound}
          className={`flex items-center gap-1 px-2 py-0.5 border transition-all cursor-pointer ${
            isAudioActive
              ? 'border-[#c5a059] bg-[#380b0e]/60 text-[#e5cb91]'
              : 'border-[#232732] bg-[#101216] text-[#7a7469] hover:text-[#ede8dd]'
          }`}
          title="Toggle 1920s Rain & Gramophone Ambience (M)"
        >
          {isAudioActive ? <Volume2 size={11} className="text-[#c5a059]" /> : <VolumeX size={11} />}
          <span className="hidden xs:inline">{isAudioActive ? 'AUDIO ON' : 'AUDIO OFF'}</span>
        </button>

        {/* Pilot / Terminal Access */}
        {onOpenPilotAccess && (
          <button
            onClick={onOpenPilotAccess}
            className="flex items-center gap-1 px-2 py-0.5 bg-[#120a0b] hover:bg-[#2a0e10] border border-[#591619] hover:border-[#8c1d1d] text-[#df878b] hover:text-[#fff] transition-colors cursor-pointer"
            title="Owner & High Command Terminal Access"
          >
            <Lock size={10} className="text-[#df878b]" />
            <span className="font-bold tracking-wider">/OWNER</span>
          </button>
        )}
      </div>
    </div>
  );
};
