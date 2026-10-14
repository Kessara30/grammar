import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Play,
  RotateCcw,
  Check,
  AlertCircle,
  ArrowRight,
  Sparkles,
  Clock,
  CheckCircle2,
  Lock,
  Zap,
  Smartphone,
  Trophy,
  Filter,
  Eye,
  EyeOff,
  Swords,
  Users,
} from 'lucide-react';
import { getRandomMatchingSet, ALL_COLLOCATION_PAIRS } from '../data/collocations.ts';
import { GameMode, CollocationPair, TeamScore, MatchedPairDetail } from '../types.ts';
import { soundManager } from '../utils/sound.ts';

interface MatchingStageProps {
  gameMode: GameMode;
  teamBlue: TeamScore;
  teamRed: TeamScore;
  serverState?: any;
  onUpdateTeamScores: (blueScore: Partial<TeamScore>, redScore: Partial<TeamScore>) => void;
  onCompleteSolo: (timeRemaining: number) => void;
  onCompleteBattle: (blueTime: number, redTime: number) => void;
  sendAction?: (action: string, payload?: any) => void;
}

interface ShuffleItem {
  id: string; // pair id
  text: string;
}

export const MatchingStage: React.FC<MatchingStageProps> = ({
  gameMode,
  teamBlue,
  teamRed,
  serverState,
  onUpdateTeamScores,
  onCompleteSolo,
  onCompleteBattle,
  sendAction,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [currentPairs, setCurrentPairs] = useState<CollocationPair[]>([]);
  const [hasStarted, setHasStarted] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(30);
  const [staffRevealWords, setStaffRevealWords] = useState<boolean>(false);

  // Solo mode state
  const [soloMatchedIds, setSoloMatchedIds] = useState<string[]>([]);
  const [soloSelectedVerbId, setSoloSelectedVerbId] = useState<string | null>(null);
  const [soloSelectedNounId, setSoloSelectedNounId] = useState<string | null>(null);
  const [soloMismatch, setSoloMismatch] = useState<{ verbId: string; nounId: string } | null>(null);
  const [soloVerbs, setSoloVerbs] = useState<ShuffleItem[]>([]);
  const [soloNouns, setSoloNouns] = useState<ShuffleItem[]>([]);

  // Team Battle State (Left: Blue, Right: Red)
  const [blueMatchedDetails, setBlueMatchedDetails] = useState<MatchedPairDetail[]>([]);
  const [redMatchedDetails, setRedMatchedDetails] = useState<MatchedPairDetail[]>([]);

  const [blueFinishedTime, setBlueFinishedTime] = useState<number | null>(null);
  const [redFinishedTime, setRedFinishedTime] = useState<number | null>(null);

  const [statusMessage, setStatusMessage] = useState<string>('Press START CHALLENGE when ready!');
  const timerRef = useRef<number | null>(null);
  const sendActionRef = useRef(sendAction);
  sendActionRef.current = sendAction;

  const isBlueReady = !!serverState?.blueReady;
  const isRedReady = !!serverState?.redReady;
  const countdown = serverState?.countdown;

  const mobilePlayers = (serverState?.players || []).filter((p: any) => p.role === 'player');
  const bluePlayers = mobilePlayers.filter((p: any) => p.team === 'blue');
  const redPlayers = mobilePlayers.filter((p: any) => p.team === 'red');

  // Sync from serverState if available
  useEffect(() => {
    if (serverState) {
      if (serverState.blueMatchedDetails) {
        setBlueMatchedDetails(serverState.blueMatchedDetails);
      }
      if (serverState.redMatchedDetails) {
        setRedMatchedDetails(serverState.redMatchedDetails);
      }
      if (serverState.timer !== undefined) {
        setTimeLeft(serverState.timer);
        if (gameMode === 'team-battle' && serverState.isTimerRunning && serverState.timer <= 5 && serverState.timer > 0) {
          soundManager.playTick();
        } else if (gameMode === 'team-battle' && serverState.timer === 0 && !serverState.isTimerRunning) {
          soundManager.playTimeUp();
        }
      }
      if (serverState.isTimerRunning) {
        setHasStarted(true);
      } else if (serverState.countdown === null && !serverState.isTimerRunning && serverState.stage === 1 && serverState.timer === 30) {
        setHasStarted(false);
      }
    }
  }, [serverState, gameMode]);

  // Audio effect for TV countdown
  useEffect(() => {
    if (countdown !== null && countdown !== undefined && countdown > 0) {
      soundManager.playTick();
    } else if (countdown === null && serverState?.isTimerRunning) {
      soundManager.playCardReveal();
    }
  }, [countdown, serverState?.isTimerRunning]);

  const blueMatchedIds = blueMatchedDetails.map((d) => d.pairId);
  const redMatchedIds = redMatchedDetails.map((d) => d.pairId);

  const isSoloComplete = soloMatchedIds.length === 6;
  const isBattleBothComplete = blueMatchedIds.length === 6 && redMatchedIds.length === 6;
  const isBattleStarted = gameMode === 'team-battle'
    ? (serverState?.isTimerRunning || (serverState?.timer !== undefined && serverState.timer < 30) || blueMatchedIds.length > 0 || redMatchedIds.length > 0 || hasStarted)
    : hasStarted;
  const isTimeUp = isBattleStarted && timeLeft <= 0 && (gameMode === 'solo' ? !isSoloComplete : !isBattleBothComplete);

  // Setup round with fresh diverse vocabulary
  const initRound = useCallback((cat: string, force = false) => {
    const pairs = getRandomMatchingSet(cat);
    setCurrentPairs(pairs);

    const verbs: ShuffleItem[] = pairs.map((p) => ({ id: p.id, text: p.verb }));
    const nouns: ShuffleItem[] = pairs.map((p) => ({ id: p.id, text: p.noun }));

    const shuffleArray = <T,>(arr: T[]): T[] => {
      const copy = [...arr];
      for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
      }
      return copy;
    };

    setSoloVerbs(shuffleArray(verbs));
    setSoloNouns(shuffleArray(nouns));
    setSoloMatchedIds([]);
    setSoloSelectedVerbId(null);
    setSoloSelectedNounId(null);
    setSoloMismatch(null);

    setBlueMatchedDetails([]);
    setRedMatchedDetails([]);
    setBlueFinishedTime(null);
    setRedFinishedTime(null);

    setTimeLeft(30);
    setHasStarted(false);
    setStatusMessage('Press START CHALLENGE when ready!');

    // Dispatch to server if available
    sendActionRef.current?.('INIT_ROUND', {
      force,
      pairs: pairs.map((p) => ({
        id: p.id,
        verb: p.verb,
        noun: p.noun,
        thaiMeaning: p.thaiMeaning,
      })),
      category: cat,
    });
  }, []);

  const hasInitializedRef = useRef(false);

  // Initialize round on mount only if not actively in battle
  useEffect(() => {
    if (!hasInitializedRef.current) {
      hasInitializedRef.current = true;
      if (!serverState?.isTimerRunning && serverState?.countdown === null) {
        initRound(selectedCategory);
      }
    }
  }, [initRound, selectedCategory, gameMode]);

  // Clean timer management (Solo mode only: server authoritative in team-battle)
  useEffect(() => {
    if (gameMode === 'team-battle') {
      // In team-battle mode, server is single source of truth for timer
      return;
    }

    const isFinished = isSoloComplete;

    if (hasStarted && !isFinished && timeLeft > 0) {
      if (timerRef.current !== null) {
        clearInterval(timerRef.current);
      }

      timerRef.current = window.setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            if (timerRef.current !== null) {
              clearInterval(timerRef.current);
              timerRef.current = null;
            }
            soundManager.playTimeUp();
            return 0;
          }
          if (prev <= 6) {
            soundManager.playTick();
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current !== null) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current !== null) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [hasStarted, isSoloComplete, timeLeft, gameMode]);

  // Handle Team Battle completion tracking
  useEffect(() => {
    if (gameMode === 'team-battle' && isBattleStarted) {
      if (blueMatchedIds.length === 6 && blueFinishedTime === null) {
        setBlueFinishedTime(timeLeft);
        soundManager.playMatchSuccess();
      }
      if (redMatchedIds.length === 6 && redFinishedTime === null) {
        setRedFinishedTime(timeLeft);
        soundManager.playMatchSuccess();
      }
    }
  }, [gameMode, isBattleStarted, blueMatchedIds.length, redMatchedIds.length, timeLeft, blueFinishedTime, redFinishedTime]);

  // Laptop staff keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.code === 'Space') {
        if (!hasStarted) {
          e.preventDefault();
          handleStart();
        } else if (gameMode === 'solo' && isSoloComplete) {
          e.preventDefault();
          onCompleteSolo(timeLeft);
        } else if (gameMode === 'team-battle' && (isBattleBothComplete || timeLeft <= 0)) {
          e.preventDefault();
          handleFinishBattle();
        }
      } else if (e.key.toLowerCase() === 'r') {
        e.preventDefault();
        handleRestart();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [hasStarted, isSoloComplete, isBattleBothComplete, timeLeft, gameMode]);

  const handleStart = () => {
    setHasStarted(true);
    setStatusMessage(
      gameMode === 'solo'
        ? 'Select a verb and a noun to match!'
        : '⚡ BATTLE ON! Words are hidden on TV — Play on mobile phones!'
    );
    soundManager.playCardReveal();
    if (sendAction) {
      sendAction('START_TIMER');
    }
  };

  const handleRestart = () => {
    if (timerRef.current !== null) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    initRound(selectedCategory, true);
  };

  // Solo Selection on laptop/TV
  const handleSoloVerb = (id: string) => {
    if (!hasStarted || isSoloComplete || isTimeUp || soloMatchedIds.includes(id)) return;
    if (soloSelectedNounId !== null) {
      checkSoloMatch(id, soloSelectedNounId);
    } else {
      setSoloSelectedVerbId(id);
    }
  };

  const handleSoloNoun = (id: string) => {
    if (!hasStarted || isSoloComplete || isTimeUp || soloMatchedIds.includes(id)) return;
    if (soloSelectedVerbId !== null) {
      checkSoloMatch(soloSelectedVerbId, id);
    } else {
      setSoloSelectedNounId(id);
    }
  };

  const checkSoloMatch = (verbId: string, nounId: string) => {
    if (verbId === nounId) {
      soundManager.playMatchSuccess();
      setSoloMatchedIds((prev) => [...prev, verbId]);
      setSoloSelectedVerbId(null);
      setSoloSelectedNounId(null);
      setSoloMismatch(null);
      const pair = currentPairs.find((p) => p.id === verbId);
      setStatusMessage(`Correct! "${pair?.verb} + ${pair?.noun}" (${pair?.thaiMeaning})`);
    } else {
      soundManager.playMismatchError();
      setSoloMismatch({ verbId, nounId });
      setTimeout(() => {
        setSoloSelectedVerbId(null);
        setSoloSelectedNounId(null);
        setSoloMismatch(null);
      }, 600);
    }
  };

  // Finish battle and record scores
  const handleFinishBattle = () => {
    const blueTime = blueFinishedTime ?? (30 - timeLeft);
    const redTime = redFinishedTime ?? (30 - timeLeft);

    // Sum scores from matched details
    const bluePts = blueMatchedDetails.reduce((sum, d) => sum + d.pointsEarned, 0) + (blueMatchedDetails.length === 6 ? 100 + blueTime * 10 : 0);
    const redPts = redMatchedDetails.reduce((sum, d) => sum + d.pointsEarned, 0) + (redMatchedDetails.length === 6 ? 100 + redTime * 10 : 0);

    onUpdateTeamScores(
      {
        matchedCount: blueMatchedDetails.length,
        timeTaken: 30 - blueTime,
        timeRemaining: blueTime,
        isFinished: blueMatchedDetails.length === 6,
        score: teamBlue.score + bluePts,
        matchedDetails: blueMatchedDetails,
      },
      {
        matchedCount: redMatchedDetails.length,
        timeTaken: 30 - redTime,
        timeRemaining: redTime,
        isFinished: redMatchedDetails.length === 6,
        score: teamRed.score + redPts,
        matchedDetails: redMatchedDetails,
      }
    );

    onCompleteBattle(blueTime, redTime);
  };

  // Current potential points for answering right now!
  const currentSpeedPoints = 50 + timeLeft * 5;

  const timerColor =
    timeLeft <= 5 ? 'text-rose-600' : timeLeft <= 10 ? 'text-amber-500' : 'text-indigo-600';
  const timerBgColor =
    timeLeft <= 5 ? 'bg-rose-50 border-rose-300' : timeLeft <= 10 ? 'bg-amber-50 border-amber-300' : 'bg-indigo-50 border-indigo-200';

  return (
    <div className="flex flex-col justify-between space-y-4">
      {/* Top TV Bar: Instructions + Category + Big Timer + Speed Points */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border-2 border-indigo-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="px-3 py-1 rounded-xl bg-indigo-700 text-white text-xs sm:text-sm font-black uppercase tracking-wider shrink-0">
              {gameMode === 'team-battle' ? 'Secret Phone Battle' : 'Solo Mode'}
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-snug">
              {gameMode === 'team-battle' ? 'Team Blue vs Team Red Race' : 'Match the Collocations'}
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-700 font-semibold mt-1 leading-normal">
            {gameMode === 'team-battle'
              ? 'คำศัพท์แสดงเฉพาะบนมือถือผู้เล่นแต่ละฝ่าย · คำศัพท์จะเปิดเผยบนจอทีวีต่อเมื่อตอบถูกเท่านั้น!'
              : 'Pair each verb with its natural noun partner within 30 seconds!'}
          </p>
        </div>

        {/* Speed Bonus Indicator on the TV */}
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 shrink-0">
          <div className="bg-amber-50 border-2 border-amber-300 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-2xl text-center shadow-xs">
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 flex items-center gap-1 justify-center leading-tight">
              <Zap className="w-3.5 h-3.5 fill-amber-500 text-amber-600 animate-pulse" />
              Speed Bonus Ticker
            </span>
            <span className="text-lg sm:text-xl font-black text-amber-900 tabular-nums leading-snug">
              +{currentSpeedPoints} pts <span className="text-xs text-amber-700 font-bold">/ match</span>
            </span>
          </div>

          {/* Big Countdown Timer */}
          <div
            className={`flex items-center gap-2 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-2xl border-2 ${timerBgColor} transition-all shrink-0 ${
              timeLeft <= 5 && hasStarted ? 'animate-pulse scale-105' : ''
            }`}
          >
            <Clock className={`w-6 h-6 sm:w-7 sm:h-7 ${timerColor}`} />
            <div>
              <span className="block text-[10px] font-black uppercase tracking-widest text-slate-500 leading-tight">
                Clock
              </span>
              <span className={`text-2xl sm:text-3xl font-black tabular-nums leading-snug ${timerColor}`}>
                00:{timeLeft.toString().padStart(2, '0')}
              </span>
            </div>
          </div>

          {!hasStarted ? (
            <button
              onClick={handleStart}
              className="px-5 py-2.5 sm:px-6 sm:py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-black text-sm sm:text-base rounded-2xl shadow-md transition-all active:scale-95 flex items-center gap-2 cursor-pointer shrink-0"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>START [Space]</span>
            </button>
          ) : (
            <button
              onClick={handleRestart}
              className="px-3.5 py-2.5 sm:py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-2xl transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
              title="Restart [R]"
            >
              <RotateCcw className="w-4 h-4 text-slate-500" />
              <span>Restart [R]</span>
            </button>
          )}
        </div>
      </div>

      {/* Ribbon Banner: Speed & Phone Rules */}
      {gameMode === 'team-battle' && (
        <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-rose-950 text-white rounded-2xl px-4 py-2.5 sm:px-5 flex flex-wrap items-center justify-between gap-2.5 text-xs sm:text-sm shadow-xs border border-white/10">
          <div className="flex items-center gap-2.5 min-w-0">
            <Smartphone className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-bold text-white leading-normal">
              ตอบไวขึ้นคะแนนจะมากขึ้น! คำศัพท์แสดงแค่ในมือถือผู้เล่นแต่ละทีม จะปรากฏบนจอทีวีต่อเมื่อตอบถูก
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs shrink-0">
            <button
              onClick={() => setStaffRevealWords(!staffRevealWords)}
              className="text-[11px] text-slate-400 hover:text-white underline flex items-center gap-1 cursor-pointer"
              title="Staff preview mode"
            >
              {staffRevealWords ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              <span>{staffRevealWords ? 'Hide Words (โหมดซ่อนบนทีวี)' : 'Staff Peek (เฉลย)'}</span>
            </button>
          </div>
        </div>
      )}

      {/* MODE 1: SOLO MODE (Laptop / Direct TV Touch) */}
      {gameMode === 'solo' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
          {/* Verbs Column */}
          <div className="bg-white rounded-3xl p-4 sm:p-5 border-2 border-indigo-100 shadow-sm space-y-3">
            <div className="flex items-center justify-between pb-2 border-b-2 border-indigo-100">
              <h3 className="text-sm sm:text-base font-black uppercase tracking-wider text-indigo-950 flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-indigo-600"></span>
                Column 1: Verbs (คำกริยา)
              </h3>
              <span className="text-xs font-bold text-indigo-600">
                {soloMatchedIds.length}/6 Matched
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-1 gap-2.5">
              {soloVerbs.map((item) => {
                const isMatched = soloMatchedIds.includes(item.id);
                const isSelected = soloSelectedVerbId === item.id;
                const isMismatch = soloMismatch?.verbId === item.id;

                return (
                  <button
                    key={`solo-verb-${item.id}`}
                    onClick={() => handleSoloVerb(item.id)}
                    disabled={!hasStarted || isMatched || isSoloComplete || isTimeUp}
                    className={`w-full min-h-[58px] sm:min-h-[64px] px-5 py-3 rounded-2xl font-black text-lg sm:text-xl transition-all flex items-center justify-between text-left select-none ${
                      isMatched
                        ? 'bg-emerald-50 border-3 border-emerald-500 text-emerald-900 shadow-2xs'
                        : isMismatch
                        ? 'bg-rose-50 border-3 border-rose-500 text-rose-900 animate-shake'
                        : isSelected
                        ? 'bg-indigo-600 border-3 border-indigo-800 text-white shadow-lg scale-[1.02] ring-4 ring-indigo-200'
                        : !hasStarted || isTimeUp
                        ? 'bg-white border-2 border-slate-200 text-slate-400 cursor-not-allowed opacity-80'
                        : 'bg-white border-2 border-slate-200 text-slate-900 hover:border-indigo-400 hover:bg-indigo-50/50 cursor-pointer'
                    }`}
                  >
                    <span>{item.text}</span>
                    {isMatched && <Check className="w-5 h-5 text-emerald-600 stroke-[3]" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Nouns Column */}
          <div className="bg-white rounded-3xl p-4 sm:p-5 border-2 border-violet-100 shadow-sm space-y-3">
            <div className="flex items-center justify-between pb-2 border-b-2 border-violet-100">
              <h3 className="text-sm sm:text-base font-black uppercase tracking-wider text-violet-950 flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-violet-600"></span>
                Column 2: Nouns (คำนาม)
              </h3>
              <span className="text-xs font-bold text-violet-600">
                {soloMatchedIds.length}/6 Matched
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-1 gap-2.5">
              {soloNouns.map((item) => {
                const isMatched = soloMatchedIds.includes(item.id);
                const isSelected = soloSelectedNounId === item.id;
                const isMismatch = soloMismatch?.nounId === item.id;

                return (
                  <button
                    key={`solo-noun-${item.id}`}
                    onClick={() => handleSoloNoun(item.id)}
                    disabled={!hasStarted || isMatched || isSoloComplete || isTimeUp}
                    className={`w-full min-h-[58px] sm:min-h-[64px] px-5 py-3 rounded-2xl font-black text-lg sm:text-xl transition-all flex items-center justify-between text-left select-none ${
                      isMatched
                        ? 'bg-emerald-50 border-3 border-emerald-500 text-emerald-900 shadow-2xs'
                        : isMismatch
                        ? 'bg-rose-50 border-3 border-rose-500 text-rose-900 animate-shake'
                        : isSelected
                        ? 'bg-violet-600 border-3 border-violet-800 text-white shadow-lg scale-[1.02] ring-4 ring-violet-200'
                        : !hasStarted || isTimeUp
                        ? 'bg-white border-2 border-slate-200 text-slate-400 cursor-not-allowed opacity-80'
                        : 'bg-white border-2 border-slate-200 text-slate-900 hover:border-violet-400 hover:bg-violet-50/50 cursor-pointer'
                    }`}
                  >
                    <span className="lowercase first-letter:uppercase">{item.text}</span>
                    {isMatched && <Check className="w-5 h-5 text-emerald-600 stroke-[3]" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* MODE 2: 2-TEAM SECRET BATTLE ON TV (Hidden on TV, revealed ONLY when answered correctly!) */}
      {gameMode === 'team-battle' && (
        <div className="space-y-4">
          {/* Active 3-2-1 Countdown Overlay on TV */}
          {countdown !== null && countdown !== undefined && countdown > 0 && (
            <div className="p-8 bg-gradient-to-r from-indigo-950 via-slate-900 to-rose-950 text-white rounded-3xl border-4 border-amber-400 shadow-2xl text-center space-y-4 animate-in zoom-in-95">
              <span className="px-4 py-1.5 rounded-full bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-widest inline-block animate-pulse">
                ⚡ GET READY! เตรียมตัว ⚡
              </span>
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-tr from-amber-400 to-amber-200 text-slate-950 font-black text-6xl sm:text-7xl flex items-center justify-center mx-auto shadow-2xl ring-8 ring-amber-400/40 animate-ping duration-1000">
                {countdown}
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-white">
                Match Starts in {countdown}...
              </h3>
              <p className="text-xs sm:text-sm text-indigo-200">
                คำศัพท์จะเปิดเผยเฉพาะบนจอมือถือของผู้เล่นแต่ละฝ่าย · คำศัพท์บนทีวีจะเปิดเผยต่อเมื่อตอบถูกเท่านั้น!
              </p>
            </div>
          )}

          {/* Pre-Match Dual Ready Check Arena on TV */}
          {!isBattleStarted && (countdown === null || countdown === undefined) && (
            <div className="bg-white rounded-3xl p-5 sm:p-6 border-3 border-indigo-200 shadow-lg space-y-4">
              <div className="text-center space-y-2">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-100 text-amber-900 text-xs sm:text-sm font-black border border-amber-300">
                  <Zap className="w-4 h-4 fill-amber-500 text-amber-600 animate-pulse" />
                  <span>PRE-MATCH DUAL READY SYSTEM (ระบบรอทั้งสองฝ่ายกดพร้อม)</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-snug">
                  รอให้ผู้เล่นทั้งสองฝ่ายกดปุ่ม "READY / พร้อม" บนมือถือ
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-normal">
                  เมื่อทั้งสองทีมกดพร้อมครบทั้งคู่ ระบบจะเริ่มนับถอยหลัง 3.. 2.. 1.. และเปิดคำศัพท์ให้จับคู่ทันที
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                {/* Team Blue Ready Status */}
                <div className={`p-4 rounded-2xl border-3 transition-all ${
                  isBlueReady
                    ? 'bg-emerald-50 border-emerald-500 shadow-md ring-4 ring-emerald-200'
                    : 'bg-indigo-50/70 border-indigo-300'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="w-8 h-8 rounded-xl bg-indigo-600 text-white font-black text-sm flex items-center justify-center">
                      B
                    </span>
                    <span className="text-xs font-black uppercase text-indigo-900">Team Blue</span>
                  </div>
                  <div className="text-center py-2 space-y-1">
                    {isBlueReady ? (
                      <div className="space-y-1 text-emerald-700">
                        <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto stroke-[2.5]" />
                        <h4 className="font-black text-lg text-emerald-900">READY! (พร้อมแล้ว)</h4>
                        <p className="text-[11px] text-emerald-700 font-semibold">ยืนยันความพร้อมแล้ว</p>
                      </div>
                    ) : (
                      <div className="space-y-1 text-indigo-700">
                        <Clock className="w-10 h-10 text-indigo-500 mx-auto animate-pulse" />
                        <h4 className="font-black text-lg text-indigo-950">WAITING... (รอกดพร้อม)</h4>
                        <p className="text-[11px] text-slate-500 font-medium">รอผู้เล่นแตะปุ่ม READY บนมือถือ</p>
                      </div>
                    )}
                  </div>
                  <div className="pt-2 border-t border-indigo-200/60 text-center">
                    <button
                      onClick={() => sendAction?.('SET_READY', { team: 'blue', ready: !isBlueReady })}
                      className="text-[11px] font-bold text-indigo-700 hover:text-indigo-900 underline cursor-pointer"
                    >
                      {isBlueReady ? '[Staff: ยกเลิกพร้อมฝั่งน้ำเงิน]' : '[Staff: กดพร้อมแทนฝั่งน้ำเงิน]'}
                    </button>
                  </div>
                </div>

                {/* Center VS & Emergency / Staff Force Start Button */}
                <div className="text-center space-y-3 py-2">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-amber-400 to-amber-200 text-slate-950 font-black text-xl flex items-center justify-center mx-auto shadow-md border-2 border-white">
                    VS
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs font-black text-slate-500 uppercase tracking-widest block">
                      Match Trigger
                    </span>
                    <p className="text-[11px] text-slate-600 font-medium">
                      {isBlueReady && isRedReady
                        ? '🚀 ทั้งสองทีมพร้อมแล้ว! กำลังเริ่มนับถอยหลัง...'
                        : isBlueReady || isRedReady
                        ? '⏳ รออีก 1 ฝ่ายกดพร้อม...'
                        : 'รอนักศึกษากดปุ่มพร้อมบนมือถือทั้ง 2 ฝ่าย'}
                    </p>
                  </div>
                  <button
                    onClick={handleStart}
                    className="px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 mx-auto cursor-pointer"
                    title="Staff Force Start [Space]"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Staff: Force Start Now [Space]</span>
                  </button>
                </div>

                {/* Team Red Ready Status */}
                <div className={`p-4 rounded-2xl border-3 transition-all ${
                  isRedReady
                    ? 'bg-emerald-50 border-emerald-500 shadow-md ring-4 ring-emerald-200'
                    : 'bg-rose-50/70 border-rose-300'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="w-8 h-8 rounded-xl bg-rose-600 text-white font-black text-sm flex items-center justify-center">
                      R
                    </span>
                    <span className="text-xs font-black uppercase text-rose-900">Team Red</span>
                  </div>
                  <div className="text-center py-2 space-y-1">
                    {isRedReady ? (
                      <div className="space-y-1 text-emerald-700">
                        <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto stroke-[2.5]" />
                        <h4 className="font-black text-lg text-emerald-900">READY! (พร้อมแล้ว)</h4>
                        <p className="text-[11px] text-emerald-700 font-semibold">ยืนยันความพร้อมแล้ว</p>
                      </div>
                    ) : (
                      <div className="space-y-1 text-rose-700">
                        <Clock className="w-10 h-10 text-rose-500 mx-auto animate-pulse" />
                        <h4 className="font-black text-lg text-rose-950">WAITING... (รอกดพร้อม)</h4>
                        <p className="text-[11px] text-slate-500 font-medium">รอผู้เล่นแตะปุ่ม READY บนมือถือ</p>
                      </div>
                    )}
                  </div>
                  <div className="pt-2 border-t border-rose-200/60 text-center">
                    <button
                      onClick={() => sendAction?.('SET_READY', { team: 'red', ready: !isRedReady })}
                      className="text-[11px] font-bold text-rose-700 hover:text-rose-900 underline cursor-pointer"
                    >
                      {isRedReady ? '[Staff: ยกเลิกพร้อมฝั่งแดง]' : '[Staff: กดพร้อมแทนฝั่งแดง]'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 2-Team Mystery Arenas Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 lg:gap-6">
            {/* Team Blue Arena (Left) */}
            <div className="bg-indigo-50/70 rounded-3xl p-5 border-3 border-indigo-300 shadow-md space-y-4">
              <div className="flex items-center justify-between pb-3 border-b-2 border-indigo-200">
                <div className="flex items-center gap-2.5">
                  <span className="w-8 h-8 rounded-xl bg-indigo-600 text-white font-black text-sm flex items-center justify-center">
                    B
                  </span>
                <div>
                  <h3 className="text-lg font-black text-indigo-950 uppercase tracking-tight">
                    Team Blue (ฝั่งน้ำเงิน)
                  </h3>
                  <span className="text-[11px] font-bold text-indigo-700">
                    Matches: {blueMatchedDetails.length} / 6
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] font-black uppercase text-indigo-800 block">Score</span>
                <span className="text-xl sm:text-2xl font-black text-indigo-950 tabular-nums">
                  {teamBlue.score + blueMatchedDetails.reduce((acc, d) => acc + d.pointsEarned, 0)} pts
                </span>
              </div>
            </div>

            {/* 6 Mystery Collocation Slots for Team Blue */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[0, 1, 2, 3, 4, 5].map((slotIdx) => {
                const detail = blueMatchedDetails[slotIdx];
                const isSolved = !!detail;
                const pair = currentPairs[slotIdx];

                return (
                  <div
                    key={`blue-slot-${slotIdx}`}
                    className={`min-h-[72px] sm:min-h-[82px] p-4 rounded-2xl border-2 transition-all duration-300 flex flex-col justify-center ${
                      isSolved
                        ? 'bg-emerald-50 border-emerald-500 shadow-md animate-in fade-in zoom-in-95'
                        : 'bg-white/80 border-dashed border-indigo-200 text-slate-400'
                    }`}
                  >
                    {isSolved ? (
                      /* Revealed upon correct answer! */
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-black text-emerald-800 uppercase tracking-wider flex items-center gap-1">
                            <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
                            Solved!
                          </span>
                          <span className="text-xs font-black text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 flex items-center gap-1">
                            <Zap className="w-3 h-3 fill-amber-500" />
                            +{detail.pointsEarned} pts
                          </span>
                        </div>
                        <h4 className="text-base sm:text-lg font-black text-slate-900 uppercase tracking-tight">
                          {detail.verb} + {detail.noun}
                        </h4>
                        <p className="text-xs font-semibold text-emerald-800">
                          ({detail.thaiMeaning})
                        </p>
                      </div>
                    ) : (
                      /* Secret mystery slot */
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-400 shrink-0">
                          <Lock className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-black text-slate-600 uppercase tracking-wider">
                            Slot {slotIdx + 1}: Hidden Collocation
                          </div>
                          <p className="text-[11px] text-slate-600 mt-0.5">
                            {staffRevealWords && pair
                              ? `${pair.verb} + ${pair.noun} (${pair.thaiMeaning})`
                              : 'Waiting for player to match on phone...'}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Team Red Arena (Right) */}
          <div className="bg-rose-50/70 rounded-3xl p-5 border-3 border-rose-300 shadow-md space-y-4">
            <div className="flex items-center justify-between pb-3 border-b-2 border-rose-200">
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-xl bg-rose-600 text-white font-black text-sm flex items-center justify-center">
                  R
                </span>
                <div>
                  <h3 className="text-lg font-black text-rose-950 uppercase tracking-tight">
                    Team Red (ฝั่งแดง)
                  </h3>
                  <span className="text-[11px] font-bold text-rose-700">
                    Matches: {redMatchedDetails.length} / 6
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] font-black uppercase text-rose-800 block">Score</span>
                <span className="text-xl sm:text-2xl font-black text-rose-950 tabular-nums">
                  {teamRed.score + redMatchedDetails.reduce((acc, d) => acc + d.pointsEarned, 0)} pts
                </span>
              </div>
            </div>

            {/* 6 Mystery Collocation Slots for Team Red */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[0, 1, 2, 3, 4, 5].map((slotIdx) => {
                const detail = redMatchedDetails[slotIdx];
                const isSolved = !!detail;
                const pair = currentPairs[slotIdx];

                return (
                  <div
                    key={`red-slot-${slotIdx}`}
                    className={`min-h-[72px] sm:min-h-[82px] p-4 rounded-2xl border-2 transition-all duration-300 flex flex-col justify-center ${
                      isSolved
                        ? 'bg-emerald-50 border-emerald-500 shadow-md animate-in fade-in zoom-in-95'
                        : 'bg-white/80 border-dashed border-rose-200 text-slate-400'
                    }`}
                  >
                    {isSolved ? (
                      /* Revealed upon correct answer! */
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-black text-emerald-800 uppercase tracking-wider flex items-center gap-1">
                            <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
                            Solved!
                          </span>
                          <span className="text-xs font-black text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 flex items-center gap-1">
                            <Zap className="w-3 h-3 fill-amber-500" />
                            +{detail.pointsEarned} pts
                          </span>
                        </div>
                        <h4 className="text-base sm:text-lg font-black text-slate-900 uppercase tracking-tight">
                          {detail.verb} + {detail.noun}
                        </h4>
                        <p className="text-xs font-semibold text-emerald-800">
                          ({detail.thaiMeaning})
                        </p>
                      </div>
                    ) : (
                      /* Secret mystery slot */
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-rose-100 flex items-center justify-center text-rose-400 shrink-0">
                          <Lock className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-black text-slate-600 uppercase tracking-wider">
                            Slot {slotIdx + 1}: Hidden Collocation
                          </div>
                          <p className="text-[11px] text-slate-600 mt-0.5">
                            {staffRevealWords && pair
                              ? `${pair.verb} + ${pair.noun} (${pair.thaiMeaning})`
                              : 'Waiting for player to match on phone...'}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        </div>
      )}

      {/* Solo Completion Banner */}
      {gameMode === 'solo' && isSoloComplete && (
        <div className="p-6 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-3xl shadow-xl border-4 border-emerald-300 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <CheckCircle2 className="w-12 h-12 stroke-[2.5]" />
            <div>
              <h3 className="text-2xl font-black">MATCHING COMPLETE! (6/6)</h3>
              <p className="text-sm text-emerald-100">
                Completed with {timeLeft} seconds left. Call staff to review and confirm!
              </p>
            </div>
          </div>
          <button
            onClick={() => onCompleteSolo(timeLeft)}
            className="px-8 py-4 bg-white text-emerald-800 font-black text-lg rounded-2xl shadow-lg transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
          >
            <span>Staff Review & Confirm [Space]</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Team Battle Round Finished Banner */}
      {gameMode === 'team-battle' && (isBattleBothComplete || (timeLeft <= 0 && isBattleStarted)) && (
        <div className="p-6 bg-gradient-to-r from-indigo-900 via-purple-900 to-rose-900 text-white rounded-3xl shadow-2xl border-4 border-amber-400 flex flex-col md:flex-row items-center justify-between gap-5 animate-in fade-in zoom-in-95">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-400 text-slate-900 flex items-center justify-center shrink-0 shadow-lg">
              <Trophy className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                BATTLE ROUND FINISHED!
              </h3>
              <p className="text-sm text-amber-200 font-semibold mt-0.5">
                Blue: {blueMatchedDetails.length}/6 solved · Red: {redMatchedDetails.length}/6 solved. Speed bonuses applied!
              </p>
            </div>
          </div>

          <button
            onClick={handleFinishBattle}
            className="px-8 py-4 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-lg rounded-2xl shadow-xl transition-all active:scale-95 flex items-center gap-3 cursor-pointer shrink-0"
          >
            <span>Confirm Battle & Continue [Space]</span>
            <ArrowRight className="w-6 h-6 stroke-[3]" />
          </button>
        </div>
      )}

      {/* Time's Up Banner for Solo Mode */}
      {gameMode === 'solo' && isTimeUp && (
        <div className="p-5 bg-rose-600 text-white rounded-3xl shadow-lg border-2 border-rose-300 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-10 h-10" />
            <div>
              <h3 className="text-xl font-black">TIME'S UP! (หมดเวลา)</h3>
              <p className="text-xs text-rose-100">
                Matched {soloMatchedIds.length}/6 pairs. Press Retry to try again!
              </p>
            </div>
          </div>
          <button
            onClick={handleRestart}
            className="px-6 py-3 bg-white text-rose-700 font-black text-base rounded-2xl shadow-md cursor-pointer"
          >
            Retry Matching [R]
          </button>
        </div>
      )}
    </div>
  );
};
