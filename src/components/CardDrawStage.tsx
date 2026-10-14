import React, { useState, useEffect } from 'react';
import { Sparkles, Dices, ArrowRight, Volume2, HelpCircle, Swords } from 'lucide-react';
import { CHALLENGE_CARDS_POOL } from '../data/collocations.ts';
import { GameMode, ChallengeCard, TeamScore } from '../types.ts';
import { soundManager } from '../utils/sound.ts';

interface CardDrawStageProps {
  gameMode: GameMode;
  teamBlue: TeamScore;
  teamRed: TeamScore;
  onCardSelectedSolo: (card: ChallengeCard) => void;
  onCardsSelectedBattle: (blueCard: ChallengeCard, redCard: ChallengeCard) => void;
}

export const CardDrawStage: React.FC<CardDrawStageProps> = ({
  gameMode,
  teamBlue,
  teamRed,
  onCardSelectedSolo,
  onCardsSelectedBattle,
}) => {
  // Solo state
  const [soloCard, setSoloCard] = useState<ChallengeCard | null>(null);
  const [isDrawingSolo, setIsDrawingSolo] = useState<boolean>(false);
  const [hasDrawnSolo, setHasDrawnSolo] = useState<boolean>(false);

  // Team Battle state
  const [blueCard, setBlueCard] = useState<ChallengeCard | null>(null);
  const [redCard, setRedCard] = useState<ChallengeCard | null>(null);
  const [isDrawingBattle, setIsDrawingBattle] = useState<boolean>(false);
  const [hasDrawnBattle, setHasDrawnBattle] = useState<boolean>(false);

  const [shufflingIndex, setShufflingIndex] = useState<number>(0);

  // Draw Solo Card
  const handleDrawSolo = () => {
    if (isDrawingSolo || hasDrawnSolo) return;
    setIsDrawingSolo(true);
    soundManager.playCardReveal();

    let counter = 0;
    const interval = window.setInterval(() => {
      setShufflingIndex((prev) => (prev + 1) % CHALLENGE_CARDS_POOL.length);
      counter++;

      if (counter > 15) {
        window.clearInterval(interval);
        const randIdx = Math.floor(Math.random() * CHALLENGE_CARDS_POOL.length);
        const card = CHALLENGE_CARDS_POOL[randIdx];
        setSoloCard(card);
        setIsDrawingSolo(false);
        setHasDrawnSolo(true);
        soundManager.playFanfare();
      }
    }, 75);
  };

  // Draw 2 Cards for Team Battle
  const handleDrawBattle = () => {
    if (isDrawingBattle || hasDrawnBattle) return;
    setIsDrawingBattle(true);
    soundManager.playCardReveal();

    let counter = 0;
    const interval = window.setInterval(() => {
      setShufflingIndex((prev) => (prev + 1) % CHALLENGE_CARDS_POOL.length);
      counter++;

      if (counter > 16) {
        window.clearInterval(interval);
        // Pick 2 distinct cards
        const shuffled = [...CHALLENGE_CARDS_POOL].sort(() => 0.5 - Math.random());
        const card1 = shuffled[0];
        const card2 = shuffled[1];

        setBlueCard(card1);
        setRedCard(card2);
        setIsDrawingBattle(false);
        setHasDrawnBattle(true);
        soundManager.playFanfare();
      }
    }, 75);
  };

  const handleUseSolo = () => {
    if (soloCard) {
      soundManager.playMatchSuccess();
      onCardSelectedSolo(soloCard);
    }
  };

  const handleUseBattle = () => {
    if (blueCard && redCard) {
      soundManager.playMatchSuccess();
      onCardsSelectedBattle(blueCard, redCard);
    }
  };

  // Laptop staff keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.code === 'Space' || e.key === 'Enter') {
        e.preventDefault();
        if (gameMode === 'solo') {
          if (!hasDrawnSolo && !isDrawingSolo) handleDrawSolo();
          else if (hasDrawnSolo && soloCard) handleUseSolo();
        } else {
          if (!hasDrawnBattle && !isDrawingBattle) handleDrawBattle();
          else if (hasDrawnBattle && blueCard && redCard) handleUseBattle();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameMode, hasDrawnSolo, isDrawingSolo, soloCard, hasDrawnBattle, isDrawingBattle, blueCard, redCard]);

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border-2 border-indigo-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="px-3 py-1 rounded-xl bg-violet-700 text-white text-xs sm:text-sm font-black uppercase tracking-wider">
              Step 3
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {gameMode === 'team-battle' ? 'Draw Team Collocation Cards' : 'Randomly Pick a Collocation Card'}
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-700 font-semibold mt-1">
            {gameMode === 'team-battle'
              ? 'Each team draws their own unique collocation challenge card from our diverse 20+ card library!'
              : 'Draw 1 random challenge card from the 20+ card library to build a sentence in Step 4.'}
          </p>
        </div>

        {gameMode === 'solo' && !hasDrawnSolo && (
          <button
            onClick={handleDrawSolo}
            disabled={isDrawingSolo}
            className="w-full md:w-auto px-8 py-4 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-black text-lg rounded-2xl shadow-xl transition-all active:scale-95 flex items-center justify-center gap-3 cursor-pointer shrink-0"
          >
            <Dices className={`w-6 h-6 ${isDrawingSolo ? 'animate-spin' : ''}`} />
            <span>{isDrawingSolo ? 'Shuffling Cards...' : 'DRAW MY CARD [Space]'}</span>
          </button>
        )}

        {gameMode === 'team-battle' && !hasDrawnBattle && (
          <button
            onClick={handleDrawBattle}
            disabled={isDrawingBattle}
            className="w-full md:w-auto px-8 py-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-rose-600 text-white font-black text-lg rounded-2xl shadow-xl transition-all active:scale-95 flex items-center justify-center gap-3 cursor-pointer shrink-0"
          >
            <Dices className={`w-6 h-6 ${isDrawingBattle ? 'animate-spin' : ''}`} />
            <span>{isDrawingBattle ? 'Shuffling 2 Cards...' : 'DRAW TEAM CARDS [Space]'}</span>
          </button>
        )}
      </div>

      {/* SOLO CARD DISPLAY */}
      {gameMode === 'solo' && (
        <div className="min-h-[420px] flex flex-col items-center justify-center py-4">
          {!hasDrawnSolo && !isDrawingSolo ? (
            <div
              onClick={handleDrawSolo}
              role="button"
              tabIndex={0}
              className="w-72 h-96 mx-auto rounded-3xl bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 p-1.5 shadow-2xl hover:scale-105 transition-transform duration-300 cursor-pointer flex flex-col items-center justify-center border-4 border-white animate-glow"
            >
              <div className="w-full h-full rounded-[22px] border-3 border-dashed border-white/40 flex flex-col items-center justify-center p-6 text-white text-center">
                <Sparkles className="w-12 h-12 text-amber-300 mb-4" />
                <h3 className="text-2xl font-black">TAP TO DRAW CARD</h3>
                <p className="text-xs text-indigo-100 mt-2">20+ Diverse English Collocations</p>
                <span className="mt-4 text-xs font-bold bg-white/20 px-3.5 py-1 rounded-full">
                  กดปุ่มหรือ Spacebar
                </span>
              </div>
            </div>
          ) : isDrawingSolo ? (
            <div className="text-center space-y-4">
              <div className="w-72 h-96 mx-auto rounded-3xl bg-gradient-to-br from-violet-600 to-indigo-700 p-6 shadow-2xl flex flex-col items-center justify-center text-white border-4 border-white animate-pulse">
                <Dices className="w-16 h-16 text-amber-300 animate-spin mb-4" />
                <p className="text-xs uppercase font-black tracking-widest text-violet-200">
                  Shuffling Cards...
                </p>
                <p className="text-2xl font-black mt-2 text-white px-2">
                  {CHALLENGE_CARDS_POOL[shufflingIndex].collocation}
                </p>
              </div>
            </div>
          ) : (
            <div className="w-full max-w-xl space-y-6 text-center animate-in fade-in zoom-in-95">
              <div className="rounded-3xl bg-gradient-to-br from-white via-indigo-50/70 to-violet-50/80 p-8 sm:p-10 shadow-2xl border-4 border-indigo-200">
                <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-violet-100 text-violet-900 text-xs font-black uppercase tracking-wider mb-3">
                  <Sparkles className="w-4 h-4 text-violet-600" />
                  Your Collocation Card
                </span>

                <h3 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight uppercase bg-clip-text text-transparent bg-gradient-to-r from-indigo-700 via-violet-700 to-purple-800">
                  {soloCard?.collocation}
                </h3>
                <p className="text-lg sm:text-xl font-black text-indigo-950 mt-2">
                  ({soloCard?.thaiMeaning})
                </p>

                <div className="mt-5 p-4 rounded-2xl bg-white border border-indigo-100 text-left">
                  <div className="text-xs font-black uppercase text-slate-500 flex items-center gap-1">
                    <HelpCircle className="w-4 h-4 text-indigo-600" /> Model Example:
                  </div>
                  <p className="text-base font-bold text-slate-800 italic mt-1">
                    "{soloCard?.exampleSentence}"
                  </p>
                </div>
              </div>

              <button
                onClick={handleUseSolo}
                className="px-10 py-5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-black text-xl rounded-2xl shadow-xl transition-all active:scale-95 flex items-center justify-center gap-3 cursor-pointer mx-auto"
              >
                <span>USE THIS CARD & SPEAK [Space]</span>
                <ArrowRight className="w-6 h-6 stroke-[3]" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* 2-TEAM BATTLE CARDS DISPLAY (Side-by-Side Cards) */}
      {gameMode === 'team-battle' && (
        <div className="min-h-[420px] flex flex-col items-center justify-center py-4">
          {!hasDrawnBattle && !isDrawingBattle ? (
            <div
              onClick={handleDrawBattle}
              role="button"
              tabIndex={0}
              className="w-80 h-96 mx-auto rounded-3xl bg-gradient-to-br from-indigo-700 via-purple-700 to-rose-700 p-1.5 shadow-2xl hover:scale-105 transition-transform duration-300 cursor-pointer flex flex-col items-center justify-center border-4 border-white animate-glow"
            >
              <div className="w-full h-full rounded-[22px] border-3 border-dashed border-white/40 flex flex-col items-center justify-center p-6 text-white text-center">
                <Swords className="w-14 h-14 text-amber-300 mb-4" />
                <h3 className="text-2xl font-black">DRAW 2 TEAM CARDS</h3>
                <p className="text-xs text-indigo-100 mt-2">Team Blue vs Team Red</p>
                <span className="mt-4 text-xs font-bold bg-white/20 px-4 py-1.5 rounded-full">
                  Click or Spacebar
                </span>
              </div>
            </div>
          ) : isDrawingBattle ? (
            <div className="text-center space-y-4">
              <div className="w-80 h-96 mx-auto rounded-3xl bg-gradient-to-br from-indigo-700 via-purple-700 to-rose-700 p-6 shadow-2xl flex flex-col items-center justify-center text-white border-4 border-white animate-pulse">
                <Dices className="w-16 h-16 text-amber-300 animate-spin mb-4" />
                <p className="text-xs uppercase font-black tracking-widest text-indigo-200">
                  Selecting 2 Distinct Cards...
                </p>
                <p className="text-2xl font-black mt-2 text-white px-2">
                  {CHALLENGE_CARDS_POOL[shufflingIndex].collocation}
                </p>
              </div>
            </div>
          ) : (
            <div className="w-full space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* Team Blue Card */}
                <div className="rounded-3xl bg-indigo-50/80 p-6 sm:p-8 border-4 border-indigo-300 shadow-xl text-center space-y-3">
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-indigo-600 text-white text-xs font-black uppercase tracking-wider">
                    Team Blue's Challenge Card
                  </span>

                  <h3 className="text-2xl sm:text-4xl font-black text-indigo-950 uppercase tracking-tight">
                    {blueCard?.collocation}
                  </h3>
                  <p className="text-base font-bold text-indigo-800">
                    ({blueCard?.thaiMeaning})
                  </p>

                  <div className="p-3.5 rounded-xl bg-white border border-indigo-200 text-left text-xs">
                    <span className="font-bold text-slate-500 block">Example Context:</span>
                    <p className="font-semibold text-slate-800 italic mt-0.5">
                      "{blueCard?.exampleSentence}"
                    </p>
                  </div>
                </div>

                {/* Team Red Card */}
                <div className="rounded-3xl bg-rose-50/80 p-6 sm:p-8 border-4 border-rose-300 shadow-xl text-center space-y-3">
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-rose-600 text-white text-xs font-black uppercase tracking-wider">
                    Team Red's Challenge Card
                  </span>

                  <h3 className="text-2xl sm:text-4xl font-black text-rose-950 uppercase tracking-tight">
                    {redCard?.collocation}
                  </h3>
                  <p className="text-base font-bold text-rose-800">
                    ({redCard?.thaiMeaning})
                  </p>

                  <div className="p-3.5 rounded-xl bg-white border border-rose-200 text-left text-xs">
                    <span className="font-bold text-slate-500 block">Example Context:</span>
                    <p className="font-semibold text-slate-800 italic mt-0.5">
                      "{redCard?.exampleSentence}"
                    </p>
                  </div>
                </div>
              </div>

              <div className="text-center">
                <button
                  onClick={handleUseBattle}
                  className="px-10 py-5 bg-gradient-to-r from-indigo-600 to-rose-600 text-white font-black text-xl rounded-2xl shadow-xl transition-all active:scale-95 flex items-center justify-center gap-3 cursor-pointer mx-auto"
                >
                  <span>ADVANCE TO SPEAKING BATTLE [Space]</span>
                  <ArrowRight className="w-6 h-6 stroke-[3]" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
