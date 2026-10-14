import React, { useState, useEffect } from 'react';
import {
  Volume2,
  CheckCircle2,
  RotateCcw,
  ShieldCheck,
  MessageSquare,
  HelpCircle,
  Swords,
  Trophy,
} from 'lucide-react';
import { ChallengeCard, GameMode, TeamScore } from '../types.ts';
import { soundManager } from '../utils/sound.ts';

interface SentenceStageProps {
  gameMode: GameMode;
  drawnCard: ChallengeCard | null;
  blueCard?: ChallengeCard | null;
  redCard?: ChallengeCard | null;
  teamBlue: TeamScore;
  teamRed: TeamScore;
  onUpdateTeamScores: (blueScore: Partial<TeamScore>, redScore: Partial<TeamScore>) => void;
  onStaffApproveSolo: (approvedSentence: string) => void;
  onStaffApproveBattle: () => void;
}

export const SentenceStage: React.FC<SentenceStageProps> = ({
  gameMode,
  drawnCard,
  blueCard,
  redCard,
  teamBlue,
  teamRed,
  onUpdateTeamScores,
  onStaffApproveSolo,
  onStaffApproveBattle,
}) => {
  const [blueApproved, setBlueApproved] = useState<boolean>(false);
  const [redApproved, setRedApproved] = useState<boolean>(false);
  const [notice, setNotice] = useState<string | null>(null);

  // Solo approve
  const handleApproveSolo = () => {
    soundManager.playFanfare();
    const sentenceSummary = `Spoken sentence approved by staff (${drawnCard?.collocation})`;
    onStaffApproveSolo(sentenceSummary);
  };

  // Team Battle approvals
  const handleApproveBlue = () => {
    soundManager.playMatchSuccess();
    setBlueApproved(true);
    onUpdateTeamScores(
      { isSentenceApproved: true, score: teamBlue.score + 100 },
      {}
    );
  };

  const handleApproveRed = () => {
    soundManager.playMatchSuccess();
    setRedApproved(true);
    onUpdateTeamScores(
      {},
      { isSentenceApproved: true, score: teamRed.score + 100 }
    );
  };

  const handleTryAgain = () => {
    soundManager.playMismatchError();
    setNotice('Staff requested another sentence. Please rephrase or say a new sentence with the same card!');
  };

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (gameMode === 'solo') {
        if (e.key.toLowerCase() === 'p' || e.code === 'Space' || e.key === 'Enter') {
          e.preventDefault();
          handleApproveSolo();
        } else if (e.key.toLowerCase() === 'r') {
          e.preventDefault();
          handleTryAgain();
        }
      } else {
        if (e.key === '1') {
          e.preventDefault();
          handleApproveBlue();
        } else if (e.key === '2') {
          e.preventDefault();
          handleApproveRed();
        } else if ((blueApproved && redApproved) && (e.code === 'Space' || e.key === 'Enter' || e.key.toLowerCase() === 'p')) {
          e.preventDefault();
          soundManager.playFanfare();
          onStaffApproveBattle();
        } else if (e.key.toLowerCase() === 'r') {
          e.preventDefault();
          handleTryAgain();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameMode, blueApproved, redApproved, drawnCard]);

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border-2 border-indigo-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="px-3 py-1 rounded-xl bg-amber-500 text-white text-xs sm:text-sm font-black uppercase tracking-wider">
              Step 4
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {gameMode === 'team-battle' ? 'Team Speaking Duel' : 'Speaking Challenge'}
            </h2>
          </div>
          <p className="text-base text-slate-800 font-extrabold mt-1">
            “Make a complete sentence using this collocation.”
          </p>
          <p className="text-xs sm:text-sm text-indigo-700 font-medium">
            (พูดประโยคกับพี่ประจำบูธโดยใช้คำที่ได้ สามารถใช้ Tense ใดก็ได้ที่ถูกต้อง)
          </p>
        </div>
      </div>

      {/* SOLO MODE DISPLAY */}
      {gameMode === 'solo' && drawnCard && (
        <div className="space-y-5">
          <div className="rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-violet-900 text-white p-7 sm:p-10 shadow-xl border-4 border-indigo-400/40 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
            <div className="space-y-2 flex-1">
              <span className="text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full bg-indigo-500/30 text-indigo-200 border border-indigo-400/40">
                Target Collocation
              </span>
              <h3 className="text-3xl sm:text-5xl font-black tracking-tight text-white uppercase">
                {drawnCard.collocation}
              </h3>
              <p className="text-lg font-bold text-indigo-200">
                Meaning: <span className="text-white font-extrabold">{drawnCard.thaiMeaning}</span>
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border-2 border-white/20 max-w-md text-left shrink-0">
              <div className="text-xs font-black uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-amber-300" />
                Model Example
              </div>
              <p className="text-base font-bold text-white italic mt-1 leading-snug">
                "{drawnCard.exampleSentence}"
              </p>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-indigo-100 shadow-sm text-center space-y-3">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-violet-600 to-indigo-600 text-white mx-auto flex items-center justify-center shadow-lg animate-pulse">
              <MessageSquare className="w-8 h-8" />
            </div>
            <h4 className="text-2xl font-black text-slate-900">Say Your Sentence Aloud to Booth Staff!</h4>
            <p className="text-sm text-slate-600 font-semibold max-w-xl mx-auto">
              Any appropriate tense is accepted (Past, Present, Continuous, Future)!
            </p>
          </div>

          {/* Staff Review Bar */}
          <div className="bg-slate-900 text-white rounded-3xl p-5 sm:p-6 border-2 border-slate-800 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <span className="text-xs font-black uppercase text-emerald-400">Staff Review Console</span>
              <h4 className="text-lg font-bold text-white">Listen to participant's sentence</h4>
            </div>
            <div className="flex items-center gap-3 w-full md:w-auto">
              <button
                onClick={handleTryAgain}
                className="px-6 py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-2xl cursor-pointer"
              >
                Try Again [R]
              </button>
              <button
                onClick={handleApproveSolo}
                className="px-8 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-2xl shadow-lg cursor-pointer"
              >
                APPROVE SENTENCE — PASS [P]
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2-TEAM BATTLE SPEAKING DUEL */}
      {gameMode === 'team-battle' && blueCard && redCard && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Team Blue Speaking Card */}
            <div className="rounded-3xl bg-indigo-50/90 p-6 sm:p-7 border-4 border-indigo-300 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <span className="px-3.5 py-1 rounded-full bg-indigo-600 text-white text-xs font-black uppercase tracking-wider">
                  Team Blue's Collocation
                </span>
                {blueApproved && (
                  <span className="text-xs font-black text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full flex items-center gap-1 border border-emerald-300">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Approved (+100 pts)
                  </span>
                )}
              </div>

              <div>
                <h3 className="text-2xl sm:text-3xl font-black text-indigo-950 uppercase">
                  {blueCard.collocation}
                </h3>
                <p className="text-sm font-bold text-indigo-800 mt-1">
                  ({blueCard.thaiMeaning})
                </p>
              </div>

              <div className="p-3 rounded-xl bg-white border border-indigo-200 text-xs">
                <span className="font-bold text-slate-500 block">Example Context:</span>
                <p className="italic text-slate-800 font-semibold mt-0.5">"{blueCard.exampleSentence}"</p>
              </div>

              <div className="pt-2">
                <button
                  onClick={handleApproveBlue}
                  disabled={blueApproved}
                  className={`w-full py-3.5 rounded-2xl font-black text-sm flex items-center justify-center gap-2 cursor-pointer transition-all ${
                    blueApproved
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md'
                  }`}
                >
                  <CheckCircle2 className="w-5 h-5" />
                  <span>{blueApproved ? 'Blue Approved!' : 'Approve Team Blue [1] (+100 pts)'}</span>
                </button>
              </div>
            </div>

            {/* Team Red Speaking Card */}
            <div className="rounded-3xl bg-rose-50/90 p-6 sm:p-7 border-4 border-rose-300 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <span className="px-3.5 py-1 rounded-full bg-rose-600 text-white text-xs font-black uppercase tracking-wider">
                  Team Red's Collocation
                </span>
                {redApproved && (
                  <span className="text-xs font-black text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full flex items-center gap-1 border border-emerald-300">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Approved (+100 pts)
                  </span>
                )}
              </div>

              <div>
                <h3 className="text-2xl sm:text-3xl font-black text-rose-950 uppercase">
                  {redCard.collocation}
                </h3>
                <p className="text-sm font-bold text-rose-800 mt-1">
                  ({redCard.thaiMeaning})
                </p>
              </div>

              <div className="p-3 rounded-xl bg-white border border-rose-200 text-xs">
                <span className="font-bold text-slate-500 block">Example Context:</span>
                <p className="italic text-slate-800 font-semibold mt-0.5">"{redCard.exampleSentence}"</p>
              </div>

              <div className="pt-2">
                <button
                  onClick={handleApproveRed}
                  disabled={redApproved}
                  className={`w-full py-3.5 rounded-2xl font-black text-sm flex items-center justify-center gap-2 cursor-pointer transition-all ${
                    redApproved
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-rose-600 hover:bg-rose-700 text-white shadow-md'
                  }`}
                >
                  <CheckCircle2 className="w-5 h-5" />
                  <span>{redApproved ? 'Red Approved!' : 'Approve Team Red [2] (+100 pts)'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Advance Battle button when both or either approved */}
          <div className="p-5 bg-slate-900 rounded-3xl text-white flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-center sm:text-left">
              <span className="text-xs font-black text-amber-300 uppercase tracking-widest">
                Battle Progress
              </span>
              <p className="text-sm text-slate-300 font-bold mt-0.5">
                Blue: {blueApproved ? 'Approved ✓' : 'Speaking...'} · Red: {redApproved ? 'Approved ✓' : 'Speaking...'}
              </p>
            </div>

            <button
              onClick={() => {
                soundManager.playFanfare();
                onStaffApproveBattle();
              }}
              disabled={!blueApproved && !redApproved}
              className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 disabled:opacity-40 text-white font-black text-lg rounded-2xl shadow-xl transition-all cursor-pointer"
            >
              COMPLETE BATTLE & VIEW RESULTS [Space]
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
