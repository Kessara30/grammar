import React, { useState, useEffect } from 'react';
import {
  Volume2,
  VolumeX,
  GraduationCap,
  Maximize,
  Minimize,
  Tv,
  Keyboard,
  Users,
  User,
  Swords,
  Trophy,
  QrCode,
  Smartphone,
} from 'lucide-react';
import { GameStage, GameMode, TeamScore } from '../types.ts';

interface HeaderProps {
  currentStage: GameStage;
  soundEnabled: boolean;
  gameMode: GameMode;
  teamBlue: TeamScore;
  teamRed: TeamScore;
  onToggleSound: () => void;
  onToggleGameMode: (mode: GameMode) => void;
  onOpenHelp: () => void;
  onOpenShortcuts?: () => void;
  onOpenQRCode?: () => void;
  onOpenBoothGuide?: () => void;
  connectedPlayersCount?: number;
}

const STAGES = [
  { step: 1, label: '1. Match', thai: 'จับคู่ 30 วิ' },
  { step: 2, label: '2. Staff Check', thai: 'พี่บูธตรวจ' },
  { step: 3, label: '3. Pick a Card', thai: 'สุ่มการ์ด' },
  { step: 4, label: '4. Make Sentence', thai: 'แต่งประโยค' },
  { step: 5, label: '5. PASS!', thai: 'ผ่านด่าน!' },
];

export const Header: React.FC<HeaderProps> = ({
  currentStage,
  soundEnabled,
  gameMode,
  teamBlue,
  teamRed,
  onToggleSound,
  onToggleGameMode,
  onOpenHelp,
  onOpenShortcuts,
  onOpenQRCode,
  onOpenBoothGuide,
  connectedPlayersCount = 0,
}) => {
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    }
  };

  return (
    <header className="w-full bg-white/95 backdrop-blur-md border-b-2 border-indigo-100 shadow-xs z-30 transition-all shrink-0">
      <div className="max-w-[1600px] w-full mx-auto px-4 py-2.5 sm:px-6 lg:px-8 space-y-2.5">
        {/* Tier 1: Brand & Subtitle + Mode Switcher + Action Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Brand & Subtitle */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 sm:w-11 sm:h-11 lg:w-12 lg:h-12 rounded-2xl bg-gradient-to-tr from-indigo-700 via-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-300 shrink-0">
              <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl lg:text-2xl font-black tracking-tight text-slate-900 leading-snug">
                  Grammar Collocation Match
                </h1>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-800 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200 shrink-0">
                  <Tv className="w-3.5 h-3.5 text-indigo-600" />
                  TV Booth
                </span>
              </div>
              <p className="text-xs sm:text-sm font-semibold text-indigo-700 leading-normal flex items-center gap-2">
                <span>Match it. Pick it. Say it. Pass!</span>
                <span className="hidden sm:inline text-slate-300">|</span>
                <span className="hidden sm:inline text-slate-600 font-medium">
                  University English Activity Booth · กิจกรรมบูธภาษาอังกฤษ
                </span>
              </p>
            </div>
          </div>

          {/* Mode Switcher: Solo vs 2-Team Battle */}
          <div className="flex items-center justify-center gap-1 p-1 bg-slate-100 rounded-2xl border border-slate-200 shrink-0">
            <button
              onClick={() => onToggleGameMode('solo')}
              className={`px-3 py-1.5 rounded-xl font-black text-xs sm:text-sm transition-all flex items-center gap-1.5 cursor-pointer ${
                gameMode === 'solo'
                  ? 'bg-white text-indigo-700 shadow-sm border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <User className="w-4 h-4" />
              <span>Solo Mode (เดี่ยว)</span>
            </button>

            <button
              onClick={() => onToggleGameMode('team-battle')}
              className={`px-3 py-1.5 rounded-xl font-black text-xs sm:text-sm transition-all flex items-center gap-1.5 cursor-pointer ${
                gameMode === 'team-battle'
                  ? 'bg-gradient-to-r from-indigo-600 to-rose-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Swords className="w-4 h-4 text-amber-300" />
              <span>2-Team Battle (แข่ง 2 ทีม)</span>
            </button>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {onOpenQRCode && (
              <button
                onClick={onOpenQRCode}
                className="px-3 py-1.5 text-xs font-black text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
                title="Scan QR Code to Join / สแกน QR เข้าเล่น"
              >
                <QrCode className="w-4 h-4 text-white" />
                <span className="hidden sm:inline">Scan QR (สแกนเล่น)</span>
                {connectedPlayersCount > 0 && (
                  <span className="px-1.5 py-0.2 bg-white text-emerald-800 rounded-full font-bold text-[10px]">
                    {connectedPlayersCount}
                  </span>
                )}
              </button>
            )}

            {onOpenBoothGuide && (
              <button
                onClick={onOpenBoothGuide}
                className="px-3 py-1.5 text-xs font-black text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-xl border border-indigo-200 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs shrink-0"
                title="วิธีนำไปเปิดใช้งานที่บูธ (Booth Setup Guide)"
              >
                <Tv className="w-3.5 h-3.5 text-indigo-600" />
                <span>วิธีใช้งานที่บูธ</span>
              </button>
            )}

            {onOpenShortcuts && (
              <button
                onClick={onOpenShortcuts}
                className="px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-xl border border-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
                title="Laptop Staff Shortcuts"
              >
                <Keyboard className="w-4 h-4 text-slate-500" />
                <span className="hidden md:inline">Hotkeys</span>
              </button>
            )}

            <button
              onClick={onOpenHelp}
              className="p-2 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl border border-slate-200 hover:border-indigo-100 transition-colors cursor-pointer shrink-0"
              title="Activity Rules"
            >
              <Users className="w-4 h-4" />
            </button>

            <button
              onClick={onToggleSound}
              className={`p-2 rounded-xl transition-colors cursor-pointer border shrink-0 ${
                soundEnabled
                  ? 'text-indigo-700 bg-indigo-50 border-indigo-200 hover:bg-indigo-100'
                  : 'text-slate-400 bg-slate-100 border-slate-200 hover:bg-slate-200'
              }`}
              title={soundEnabled ? 'Mute sound (M)' : 'Unmute sound (M)'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            <button
              onClick={toggleFullscreen}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs shrink-0 ${
                isFullscreen
                  ? 'bg-indigo-700 text-white hover:bg-indigo-800'
                  : 'bg-white border-2 border-indigo-300 text-indigo-700 hover:bg-indigo-50'
              }`}
              title="Toggle Fullscreen 16:9 TV (F)"
            >
              {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
              <span>{isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}</span>
            </button>
          </div>
        </div>

        {/* Tier 2: Dedicated Stepper Progress Bar (Clean horizontal distribution without cramming) */}
        <div className="pt-2 border-t border-slate-200/80">
          <nav aria-label="Game Progress" className="w-full">
            <ol className="grid grid-cols-5 gap-2 sm:gap-4">
              {STAGES.map((s) => {
                const isCurrent = currentStage === s.step;
                const isPast = currentStage > s.step;

                return (
                  <li key={s.step} className="flex flex-col items-center text-center">
                    <div
                      className={`w-full h-1.5 sm:h-2 rounded-full transition-all duration-300 mb-1.5 ${
                        isPast
                          ? 'bg-emerald-500 shadow-xs'
                          : isCurrent
                          ? 'bg-indigo-600 ring-2 ring-indigo-300 animate-pulse'
                          : 'bg-slate-200'
                      }`}
                    />
                    <div className="flex flex-col items-center justify-center">
                      <span
                        className={`text-xs sm:text-sm font-black tracking-tight leading-snug transition-colors whitespace-nowrap ${
                          isCurrent
                            ? 'text-indigo-700 underline decoration-indigo-500 decoration-2 underline-offset-2'
                            : isPast
                            ? 'text-emerald-700'
                            : 'text-slate-400'
                        }`}
                      >
                        {s.label}
                      </span>
                      <span className="text-[10px] sm:text-[11px] text-slate-500 font-semibold leading-normal mt-0.5 whitespace-nowrap">
                        {s.thai}
                      </span>
                    </div>
                  </li>
                );
              })}
            </ol>
          </nav>
        </div>

        {/* 2-Team Versus Scoreboard Bar (Visible when in Team Battle Mode) */}
        {gameMode === 'team-battle' && (
          <div className="pt-2 border-t border-slate-200 grid grid-cols-2 gap-3 items-center">
            {/* Team Blue */}
            <div className="p-2 sm:p-2.5 rounded-2xl bg-indigo-50 border-2 border-indigo-300 flex items-center justify-between shadow-2xs">
              <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-xs sm:text-sm shadow-xs shrink-0">
                  B
                </div>
                <div className="min-w-0">
                  <h4 className="font-black text-indigo-900 text-xs sm:text-sm tracking-tight leading-snug">
                    {teamBlue.name}
                  </h4>
                  <span className="text-[11px] font-bold text-indigo-700 leading-normal block">
                    Matches: {teamBlue.matchedCount}/6 {teamBlue.isFinished && '· Finished!'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <div className="text-right">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block leading-tight">
                    Score
                  </span>
                  <span className="text-base sm:text-lg font-black text-indigo-900 leading-snug">
                    {teamBlue.score} pts
                  </span>
                </div>
              </div>
            </div>

            {/* Team Red */}
            <div className="p-2 sm:p-2.5 rounded-2xl bg-rose-50 border-2 border-rose-300 flex items-center justify-between shadow-2xs">
              <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                <div className="w-8 h-8 rounded-xl bg-rose-600 text-white flex items-center justify-center font-black text-xs sm:text-sm shadow-xs shrink-0">
                  R
                </div>
                <div className="min-w-0">
                  <h4 className="font-black text-rose-900 text-xs sm:text-sm tracking-tight leading-snug">
                    {teamRed.name}
                  </h4>
                  <span className="text-[11px] font-bold text-rose-700 leading-normal block">
                    Matches: {teamRed.matchedCount}/6 {teamRed.isFinished && '· Finished!'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <div className="text-right">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block leading-tight">
                    Score
                  </span>
                  <span className="text-base sm:text-lg font-black text-rose-900 leading-snug">
                    {teamRed.score} pts
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
