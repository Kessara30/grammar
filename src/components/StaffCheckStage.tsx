import React, { useEffect } from 'react';
import { ShieldCheck, CheckCircle2, RotateCcw, ArrowRight, Clock, Award, Volume2, Trophy, Swords } from 'lucide-react';
import { MATCHING_PAIRS } from '../data/collocations.ts';
import { GameMode, TeamScore } from '../types.ts';
import { soundManager } from '../utils/sound.ts';

interface StaffCheckStageProps {
  gameMode: GameMode;
  teamBlue: TeamScore;
  teamRed: TeamScore;
  timeRemaining: number;
  onConfirm: () => void;
  onRetry: () => void;
}

export const StaffCheckStage: React.FC<StaffCheckStageProps> = ({
  gameMode,
  teamBlue,
  teamRed,
  timeRemaining,
  onConfirm,
  onRetry,
}) => {
  const timeTaken = 30 - timeRemaining;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.code === 'Space' || e.key === 'Enter') {
        e.preventDefault();
        soundManager.playMatchSuccess();
        onConfirm();
      } else if (e.key.toLowerCase() === 'r') {
        e.preventDefault();
        soundManager.playMismatchError();
        onRetry();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onConfirm, onRetry]);

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Staff Station Header */}
      <div className="bg-slate-900 text-white rounded-3xl p-5 sm:p-6 lg:p-7 shadow-xl border-2 border-slate-800 flex flex-col md:flex-row items-center justify-between gap-5">
        <div className="flex items-center gap-4 text-center md:text-left">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-indigo-600/30 border-2 border-indigo-400/40 flex items-center justify-center text-indigo-300 shrink-0">
            <ShieldCheck className="w-8 h-8 sm:w-9 sm:h-9 text-indigo-400" />
          </div>
          <div>
            <div className="flex items-center gap-2 justify-center md:justify-start">
              <span className="text-xs font-black uppercase tracking-widest text-indigo-400">
                Staff Control Desk · จุดตรวจพี่เจ้าหน้าที่
              </span>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                {gameMode === 'team-battle' ? 'Battle Review' : 'Human Verified'}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white mt-1">
              Step 2: Staff Check & Verification
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              Review collocation accuracy and round performance before releasing card draw.
            </p>
          </div>
        </div>

        {/* High-visibility metrics */}
        {gameMode === 'solo' ? (
          <div className="flex items-center gap-3 shrink-0">
            <div className="bg-slate-800/90 px-5 py-3 rounded-2xl border border-slate-700 text-center">
              <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider block">
                Result
              </span>
              <span className="text-emerald-400 font-black text-lg sm:text-xl flex items-center gap-1.5 justify-center mt-0.5">
                <CheckCircle2 className="w-5 h-5" /> 6 / 6 Pairs
              </span>
            </div>

            <div className="bg-slate-800/90 px-5 py-3 rounded-2xl border border-slate-700 text-center">
              <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider block">
                Time
              </span>
              <span className="text-indigo-300 font-black text-lg sm:text-xl flex items-center gap-1.5 justify-center mt-0.5">
                <Clock className="w-5 h-5" /> {timeTaken}s (Left: {timeRemaining}s)
              </span>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3 shrink-0">
            {/* Team Blue Pill */}
            <div className="bg-indigo-950/80 border-2 border-indigo-500 px-4 py-2.5 rounded-2xl text-center">
              <span className="text-[10px] font-black uppercase text-indigo-300 block">
                Team Blue
              </span>
              <span className="text-lg font-black text-white">
                {teamBlue.matchedCount}/6 · {teamBlue.score} pts
              </span>
            </div>

            <Swords className="w-5 h-5 text-amber-400" />

            {/* Team Red Pill */}
            <div className="bg-rose-950/80 border-2 border-rose-500 px-4 py-2.5 rounded-2xl text-center">
              <span className="text-[10px] font-black uppercase text-rose-300 block">
                Team Red
              </span>
              <span className="text-lg font-black text-white">
                {teamRed.matchedCount}/6 · {teamRed.score} pts
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Summary Grid of Core Collocations */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 lg:p-7 border-2 border-indigo-100 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b-2 border-slate-100">
          <div>
            <h3 className="font-black text-slate-900 text-lg sm:text-xl flex items-center gap-2">
              <Award className="w-6 h-6 text-indigo-600" />
              Summary of Matched Collocations
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 font-medium">
              Verified English pairs used in university booth challenge.
            </p>
          </div>
          <span className="text-xs sm:text-sm font-black text-emerald-800 bg-emerald-50 px-3.5 py-1.5 rounded-full border border-emerald-300">
            Status: Verified
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {MATCHING_PAIRS.map((pair, index) => (
            <div
              key={pair.id}
              className="p-3.5 rounded-2xl bg-slate-50 border-2 border-slate-200/90 hover:border-indigo-300 transition-colors flex items-center justify-between gap-3 shadow-2xs"
            >
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 font-black text-sm flex items-center justify-center shrink-0">
                  {index + 1}
                </span>
                <div>
                  <div className="text-base font-black text-slate-900 tracking-wide flex items-center gap-1.5">
                    <span className="text-indigo-600 uppercase">{pair.verb}</span>
                    <span className="text-slate-400 font-bold">+</span>
                    <span className="text-violet-700 lowercase first-letter:uppercase">{pair.noun}</span>
                  </div>
                  <div className="text-xs text-slate-600 font-medium mt-0.5">
                    {pair.thaiMeaning}
                  </div>
                </div>
              </div>

              <button
                onClick={() => soundManager.speak(`${pair.verb} ${pair.noun}`)}
                className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-white rounded-xl transition-colors cursor-pointer"
                title={`Listen pronunciation of ${pair.verb} ${pair.noun}`}
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Staff Actions Bar */}
      <div className="bg-gradient-to-r from-indigo-50 via-violet-50 to-indigo-50 rounded-3xl p-5 sm:p-6 border-3 border-indigo-200 shadow-md flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="text-center md:text-left">
          <div className="flex items-center gap-2 justify-center md:justify-start">
            <span className="text-xs font-black uppercase tracking-wider text-indigo-900">
              Staff Decision Required
            </span>
            <span className="text-[11px] text-slate-600 font-mono hidden sm:inline">
              [Hotkeys: Space = Confirm, R = Retry]
            </span>
          </div>
          <p className="text-sm sm:text-base text-slate-800 font-bold mt-0.5">
            Press <strong>Confirm & Continue</strong> to proceed to the challenge card drawing.
          </p>
          <p className="text-xs text-indigo-700 font-medium">
            (พี่เจ้าหน้าที่ตรวจสอบผลแล้วกดยืนยันเพื่อไปด่านสุ่มการ์ด)
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto shrink-0">
          <button
            onClick={() => {
              soundManager.playMismatchError();
              onRetry();
            }}
            className="flex-1 md:flex-none px-6 py-4 bg-white hover:bg-slate-100 text-slate-700 border-2 border-slate-300 font-black rounded-2xl transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer text-base sm:text-lg shadow-xs"
          >
            <RotateCcw className="w-5 h-5 text-slate-500" />
            <span>Retry Matching [R]</span>
          </button>

          <button
            onClick={() => {
              soundManager.playMatchSuccess();
              onConfirm();
            }}
            className="flex-1 md:flex-none px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl shadow-xl shadow-indigo-300 transition-all active:scale-95 flex items-center justify-center gap-3 cursor-pointer text-base sm:text-lg"
          >
            <span>Confirm & Continue [Space]</span>
            <ArrowRight className="w-5 h-5 stroke-[3]" />
          </button>
        </div>
      </div>
    </div>
  );
};
