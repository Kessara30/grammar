import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Award, CheckCircle2, Volume2, Calendar, Star, Sparkles, UserPlus, Trophy, Swords } from 'lucide-react';
import { ChallengeCard, GameMode, TeamScore } from '../types.ts';
import { soundManager } from '../utils/sound.ts';

interface PassStageProps {
  gameMode: GameMode;
  drawnCard: ChallengeCard | null;
  blueCard?: ChallengeCard | null;
  redCard?: ChallengeCard | null;
  approvedSentence: string;
  timeRemaining: number;
  teamBlue: TeamScore;
  teamRed: TeamScore;
  onNextPlayer: () => void;
}

export const PassStage: React.FC<PassStageProps> = ({
  gameMode,
  drawnCard,
  blueCard,
  redCard,
  approvedSentence,
  timeRemaining,
  teamBlue,
  teamRed,
  onNextPlayer,
}) => {
  useEffect(() => {
    soundManager.playFanfare();

    try {
      confetti({
        particleCount: 110,
        spread: 90,
        origin: { y: 0.5 },
        colors: ['#4f46e5', '#7c3aed', '#10b981', '#f59e0b', '#ec4899', '#ef4444'],
      });

      const t1 = setTimeout(() => {
        confetti({
          particleCount: 80,
          angle: 60,
          spread: 70,
          origin: { x: 0.1, y: 0.6 },
          colors: ['#10b981', '#3b82f6', '#8b5cf6'],
        });
        confetti({
          particleCount: 80,
          angle: 120,
          spread: 70,
          origin: { x: 0.9, y: 0.6 },
          colors: ['#ef4444', '#f59e0b', '#ec4899'],
        });
      }, 350);

      return () => clearTimeout(t1);
    } catch {
      // Fallback
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key.toLowerCase() === 'n' || e.code === 'Space' || e.key === 'Enter') {
        e.preventDefault();
        onNextPlayer();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onNextPlayer]);

  const today = new Date().toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const isBlueWinner = teamBlue.score > teamRed.score;
  const isRedWinner = teamRed.score > teamBlue.score;
  const isTie = teamBlue.score === teamRed.score;

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* SOLO CELEBRATION */}
      {gameMode === 'solo' && (
        <div className="rounded-3xl bg-gradient-to-br from-emerald-600 via-teal-600 to-indigo-700 text-white p-8 sm:p-12 shadow-2xl text-center relative overflow-hidden border-4 border-emerald-300">
          <div className="w-24 h-24 rounded-3xl bg-white text-emerald-600 mx-auto flex items-center justify-center shadow-2xl mb-4">
            <Award className="w-16 h-16 stroke-[2.5]" />
          </div>

          <h2 className="text-6xl sm:text-7xl font-black text-white drop-shadow-md">
            PASS!
          </h2>
          <p className="text-2xl font-extrabold text-emerald-100 mt-1">
            ผ่านด่านแล้ว! ขอแสดงความยินดีด้วยครับ/ค่ะ
          </p>

          <div className="p-4 rounded-2xl bg-white/20 backdrop-blur-md border-2 border-white/40 text-white shadow-xl max-w-lg mx-auto mt-4">
            <div className="flex items-center justify-center gap-2 text-amber-300 font-black text-xl">
              <Star className="w-6 h-6 fill-current" />
              <span>You earned a Stamp / Reward!</span>
              <Star className="w-6 h-6 fill-current" />
            </div>
            <p className="text-xs text-emerald-100 mt-0.5">
              คุณได้รับตราประทับสะสมแต้ม หรือของรางวัลประจำบูธภาษาอังกฤษเรียบร้อยแล้ว
            </p>
          </div>
        </div>
      )}

      {/* 2-TEAM BATTLE PODIUM & VICTORY BANNER */}
      {gameMode === 'team-battle' && (
        <div className="rounded-3xl bg-gradient-to-r from-indigo-900 via-purple-900 to-rose-900 text-white p-8 sm:p-10 shadow-2xl text-center relative overflow-hidden border-4 border-amber-400">
          <div className="w-20 h-20 rounded-3xl bg-amber-400 text-slate-950 mx-auto flex items-center justify-center shadow-2xl mb-3">
            <Trophy className="w-12 h-12" />
          </div>

          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 text-amber-300 text-xs font-black uppercase tracking-widest border border-white/30">
            <Swords className="w-4 h-4" /> 2-Team Battle Results
          </div>

          <h2 className="text-4xl sm:text-6xl font-black text-white mt-2 drop-shadow-md">
            {isTie
              ? 'HONORABLE TIE GAME!'
              : isBlueWinner
              ? 'TEAM BLUE WINS THE BATTLE!'
              : 'TEAM RED WINS THE BATTLE!'}
          </h2>

          <p className="text-lg sm:text-xl font-bold text-amber-200 mt-1">
            {isTie
              ? 'Both teams matched brilliantly! Both earn stamps & rewards.'
              : `${isBlueWinner ? 'Team Blue' : 'Team Red'} claimed the highest score! Both teams earn booth stamps.`}
          </p>

          {/* Scores Comparison Podiums */}
          <div className="grid grid-cols-2 gap-4 max-w-2xl mx-auto mt-6">
            {/* Team Blue */}
            <div className={`p-4 rounded-2xl border-3 ${isBlueWinner ? 'bg-indigo-600/60 border-amber-300 scale-105 shadow-xl' : 'bg-indigo-950/60 border-indigo-400'}`}>
              <span className="text-xs font-black uppercase text-indigo-300 block">Team Blue</span>
              <span className="text-3xl font-black text-white">{teamBlue.score} pts</span>
              <p className="text-xs text-indigo-200 mt-1">
                {teamBlue.matchedCount}/6 Matches {teamBlue.isFinished && '· Fast Finish'}
              </p>
            </div>

            {/* Team Red */}
            <div className={`p-4 rounded-2xl border-3 ${isRedWinner ? 'bg-rose-600/60 border-amber-300 scale-105 shadow-xl' : 'bg-rose-950/60 border-rose-400'}`}>
              <span className="text-xs font-black uppercase text-rose-300 block">Team Red</span>
              <span className="text-3xl font-black text-white">{teamRed.score} pts</span>
              <p className="text-xs text-rose-200 mt-1">
                {teamRed.matchedCount}/6 Matches {teamRed.isFinished && '· Fast Finish'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* University Passport & Stamp Seals */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-indigo-100 shadow-md space-y-5">
        <div className="flex items-center justify-between pb-3 border-b-2 border-slate-100">
          <div>
            <h3 className="font-black text-slate-900 text-xl">
              University Activity Booth Record
            </h3>
            <p className="text-xs text-slate-500">Official Performance Verification ({today})</p>
          </div>
          <span className="text-xs font-black text-emerald-800 bg-emerald-50 px-3.5 py-1.5 rounded-full border border-emerald-300">
            PASSED & VERIFIED
          </span>
        </div>

        {/* Both Teams Stamp Seals */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-indigo-50/70 border-2 border-indigo-200 flex items-center justify-between">
            <div>
              <span className="text-xs font-black uppercase text-indigo-700">Team Blue Passport</span>
              <h4 className="text-lg font-black text-indigo-950 uppercase mt-0.5">
                {blueCard?.collocation || drawnCard?.collocation || 'Grammar Master'}
              </h4>
              <p className="text-xs text-slate-600">Stamp Awarded ✓</p>
            </div>
            <div className="w-20 h-20 rounded-full border-3 border-dashed border-indigo-600 flex flex-col items-center justify-center text-indigo-700 text-center transform -rotate-12">
              <span className="text-[7px] font-black uppercase">Official</span>
              <span className="text-xs font-black">PASSED</span>
              <span className="text-[7px]">STAMP</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-rose-50/70 border-2 border-rose-200 flex items-center justify-between">
            <div>
              <span className="text-xs font-black uppercase text-rose-700">
                {gameMode === 'team-battle' ? 'Team Red Passport' : 'Booth Reward Status'}
              </span>
              <h4 className="text-lg font-black text-rose-950 uppercase mt-0.5">
                {redCard?.collocation || 'Souvenir Claimed'}
              </h4>
              <p className="text-xs text-slate-600">Stamp Awarded ✓</p>
            </div>
            <div className="w-20 h-20 rounded-full border-3 border-dashed border-rose-600 flex flex-col items-center justify-center text-rose-700 text-center transform rotate-6">
              <span className="text-[7px] font-black uppercase">Official</span>
              <span className="text-xs font-black">PASSED</span>
              <span className="text-[7px]">STAMP</span>
            </div>
          </div>
        </div>
      </div>

      {/* Staff Action: Next Player / Next Match */}
      <div className="p-6 bg-slate-900 text-white rounded-3xl border-2 border-slate-800 shadow-xl flex flex-col md:flex-row items-center justify-between gap-5">
        <div>
          <h4 className="font-black text-white text-lg">
            Ready for Next Participants / Match?
          </h4>
          <p className="text-xs text-slate-300 mt-0.5">
            Reset all matches, card draws, and timers for the next round at the booth.
          </p>
        </div>

        <button
          onClick={onNextPlayer}
          className="px-10 py-5 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white font-black rounded-2xl shadow-xl transition-all active:scale-95 flex items-center justify-center gap-3 cursor-pointer text-lg shrink-0"
        >
          <UserPlus className="w-6 h-6" />
          <span>NEXT PLAYER / NEXT MATCH [N]</span>
        </button>
      </div>
    </div>
  );
};
