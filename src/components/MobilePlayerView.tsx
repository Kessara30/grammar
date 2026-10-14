import React, { useState, useEffect, useRef } from 'react';
import {
  Smartphone,
  Check,
  Sparkles,
  Award,
  Clock,
  Volume2,
  Users,
  Dices,
  MessageSquare,
  HelpCircle,
  Tv,
  Zap,
  CheckCircle2,
  Swords,
  Play,
} from 'lucide-react';
import { ChallengeCard, CollocationPair } from '../types.ts';
import { DEFAULT_MATCHING_PAIRS } from '../data/collocations.ts';
import { soundManager } from '../utils/sound.ts';

interface MobilePlayerViewProps {
  socket: WebSocket | null;
  serverState: any;
  sendAction: (action: string, payload?: any) => void;
  onSwitchToTV: () => void;
}

export const MobilePlayerView: React.FC<MobilePlayerViewProps> = ({
  socket,
  serverState,
  sendAction,
  onSwitchToTV,
}) => {
  const [nickname, setNickname] = useState<string>('');
  const [team, setTeam] = useState<'blue' | 'red'>('blue');
  const [isRegistered, setIsRegistered] = useState<boolean>(false);

  // Local selection state for matching
  const [selectedVerbId, setSelectedVerbId] = useState<string | null>(null);
  const [selectedNounId, setSelectedNounId] = useState<string | null>(null);
  const [mismatchPair, setMismatchPair] = useState<{ verbId: string; nounId: string } | null>(null);

  // Local shuffled state from active pairs
  const [shuffledVerbs, setShuffledVerbs] = useState<Array<{ id: string; text: string }>>([]);
  const [shuffledNouns, setShuffledNouns] = useState<Array<{ id: string; text: string }>>([]);

  const activePairs =
    serverState?.activePairs && serverState.activePairs.length >= 6
      ? serverState.activePairs
      : DEFAULT_MATCHING_PAIRS;

  const matchedIds =
    team === 'blue'
      ? serverState?.blueMatchedIds || []
      : serverState?.redMatchedIds || [];

  const stage = serverState?.stage || 1;
  const timer = serverState?.timer ?? 30;
  const isTimerRunning = serverState?.isTimerRunning || false;

  const isBlueReady = !!serverState?.blueReady;
  const isRedReady = !!serverState?.redReady;
  const isMyTeamReady = team === 'blue' ? isBlueReady : isRedReady;
  const isOpponentReady = team === 'blue' ? isRedReady : isBlueReady;
  const countdown = serverState?.countdown;

  useEffect(() => {
    if (countdown !== null && countdown !== undefined && countdown > 0) {
      soundManager.playTick();
    }
  }, [countdown]);

  const playerCard = team === 'blue' ? serverState?.blueCard : serverState?.redCard;
  const isApproved = team === 'blue' ? serverState?.blueApproved : serverState?.redApproved;

  const roundId = serverState?.roundId || 1;
  const lastRoundIdRef = useRef<number | null>(null);

  // Shuffle only when a new round starts (keyed by roundId)
  useEffect(() => {
    if (lastRoundIdRef.current === roundId && shuffledVerbs.length > 0) {
      return;
    }
    lastRoundIdRef.current = roundId;

    const v = activePairs.map((p: any) => ({ id: p.id, text: p.verb }));
    const n = activePairs.map((p: any) => ({ id: p.id, text: p.noun }));

    const shuffle = <T,>(arr: T[]): T[] => {
      const copy = [...arr];
      for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
      }
      return copy;
    };

    setShuffledVerbs(shuffle(v));
    setShuffledNouns(shuffle(n));
    setSelectedVerbId(null);
    setSelectedNounId(null);
    setMismatchPair(null);
  }, [roundId, activePairs.length, shuffledVerbs.length]);

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nickname.trim()) return;

    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(
        JSON.stringify({
          type: 'REGISTER_PLAYER',
          id: `player_${Date.now()}`,
          nickname: nickname.trim(),
          team,
          role: 'player',
        })
      );
    }
    setIsRegistered(true);
    soundManager.playMatchSuccess();
  };

  const handleSelectVerb = (pairId: string) => {
    if (!isTimerRunning || matchedIds.includes(pairId)) return;

    if (selectedNounId !== null) {
      checkMatch(pairId, selectedNounId);
    } else {
      setSelectedVerbId(pairId);
    }
  };

  const handleSelectNoun = (pairId: string) => {
    if (!isTimerRunning || matchedIds.includes(pairId)) return;

    if (selectedVerbId !== null) {
      checkMatch(selectedVerbId, pairId);
    } else {
      setSelectedNounId(pairId);
    }
  };

  const checkMatch = (verbId: string, nounId: string) => {
    if (verbId === nounId) {
      soundManager.playMatchSuccess();
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(50);
      }
      const pair = activePairs.find((p: any) => p.id === verbId);
      sendAction('MATCH_PAIR', {
        team,
        pairId: verbId,
        verb: pair?.verb,
        noun: pair?.noun,
        thaiMeaning: pair?.thaiMeaning,
      });
      setSelectedVerbId(null);
      setSelectedNounId(null);
      setMismatchPair(null);
    } else {
      // Mismatch
      soundManager.playMismatchError();
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([60, 40, 60]);
      }
      setMismatchPair({ verbId, nounId });
      setTimeout(() => {
        setSelectedVerbId(null);
        setSelectedNounId(null);
        setMismatchPair(null);
      }, 550);
    }
  };

  // If not yet registered, show Mobile Join Screen
  if (!isRegistered) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-900 via-slate-900 to-violet-950 text-white flex flex-col justify-center p-4 sm:p-6 font-sans">
        <div className="max-w-md w-full mx-auto bg-white/10 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-white/20 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-2xl bg-indigo-500/30 border border-indigo-400/40 flex items-center justify-center mx-auto text-indigo-300">
              <Smartphone className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white">
              English Booth Player
            </h1>
            <p className="text-xs text-indigo-200">
              เข้าเล่นแข่งขันกิจกรรมจับคู่คำ Collocation บนจอทีวี
            </p>
          </div>

          <form onSubmit={handleJoin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-indigo-200 mb-1.5">
                Your Nickname (ชื่อเล่นของคุณ):
              </label>
              <input
                type="text"
                required
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="e.g. Somchai / Jane"
                className="w-full px-4 py-3 rounded-xl bg-white/10 border-2 border-white/20 text-white placeholder:text-white/40 focus:outline-hidden focus:border-indigo-400 font-bold text-base"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-indigo-200 mb-2">
                Choose Your Team (เลือกทีมของคุณ):
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setTeam('blue')}
                  className={`p-4 rounded-2xl font-black text-sm flex flex-col items-center gap-1.5 border-3 transition-all cursor-pointer ${
                    team === 'blue'
                      ? 'bg-indigo-600 border-white text-white shadow-lg scale-102 ring-4 ring-indigo-400/50'
                      : 'bg-white/5 border-white/20 text-white/70 hover:bg-white/10'
                  }`}
                >
                  <span className="w-5 h-5 rounded-full bg-blue-400"></span>
                  <span>Team Blue</span>
                  <span className="text-[11px] font-medium text-indigo-200">ฝั่งน้ำเงิน</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTeam('red')}
                  className={`p-4 rounded-2xl font-black text-sm flex flex-col items-center gap-1.5 border-3 transition-all cursor-pointer ${
                    team === 'red'
                      ? 'bg-rose-600 border-white text-white shadow-lg scale-102 ring-4 ring-rose-400/50'
                      : 'bg-white/5 border-white/20 text-white/70 hover:bg-white/10'
                  }`}
                >
                  <span className="w-5 h-5 rounded-full bg-rose-400"></span>
                  <span>Team Red</span>
                  <span className="text-[11px] font-medium text-rose-200">ฝั่งแดง</span>
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-black text-lg rounded-2xl shadow-xl transition-all active:scale-95 cursor-pointer mt-2"
            >
              JOIN THE GAME! (เข้าเล่น)
            </button>
          </form>

          <div className="pt-2 text-center">
            <button
              onClick={onSwitchToTV}
              className="text-xs text-indigo-300 hover:text-white underline inline-flex items-center gap-1 cursor-pointer"
            >
              <Tv className="w-3.5 h-3.5" />
              <span>Switch to TV Host View (กลับไปหน้าจอทีวี)</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // REGISTERED: Mobile Controller Interface
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between font-sans selection:bg-indigo-500 selection:text-white">
      {/* Mobile Sticky Header */}
      <header
        className={`px-4 py-3 text-white flex items-center justify-between shadow-md shrink-0 ${
          team === 'blue' ? 'bg-indigo-700' : 'bg-rose-700'
        }`}
      >
        <div className="flex items-center gap-2.5">
          <span className="w-8 h-8 rounded-xl bg-white/20 font-black text-sm flex items-center justify-center">
            {team === 'blue' ? 'B' : 'R'}
          </span>
          <div>
            <h2 className="font-black text-sm leading-none">{nickname}</h2>
            <span className="text-[10px] font-bold text-white/80">
              {team === 'blue' ? 'Team Blue' : 'Team Red'} · Connected to TV
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {stage === 1 && (
            <div className="px-3 py-1 bg-white/20 rounded-xl font-black text-sm flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{timer}s</span>
            </div>
          )}
          <button
            onClick={onSwitchToTV}
            className="p-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-white text-xs font-semibold"
            title="TV View"
          >
            <Tv className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Mobile Stage Controller */}
      <main className="flex-1 p-3.5 sm:p-4 max-w-lg w-full mx-auto flex flex-col justify-center">
        {/* STAGE 1: MATCHING ON PHONE */}
        {stage === 1 && (
          <div className="space-y-3.5">
            {/* Case 1: Active 3-2-1 Countdown */}
            {countdown !== null && countdown !== undefined && countdown > 0 ? (
              <div className="py-12 px-6 bg-gradient-to-br from-indigo-950 via-slate-900 to-violet-950 text-white rounded-3xl text-center space-y-4 border-4 border-amber-400 shadow-2xl animate-in zoom-in-95">
                <span className="px-4 py-1.5 rounded-full bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-widest inline-block animate-pulse">
                  Get Ready! เตรียมตัว
                </span>
                <div className="w-28 h-28 rounded-full bg-gradient-to-tr from-amber-400 to-amber-200 text-slate-950 font-black text-7xl flex items-center justify-center mx-auto shadow-2xl ring-8 ring-amber-400/30 animate-ping duration-1000">
                  {countdown}
                </div>
                <h3 className="text-2xl font-black text-white">
                  Match Starts in {countdown}...
                </h3>
                <p className="text-xs text-indigo-200">
                  เตรียมตาดูคำศัพท์กริยาและคำนามบนจอมือถือของคุณ!
                </p>
              </div>
            ) : !isTimerRunning ? (
              /* Case 2: Pre-Match Dual Ready Phase */
              <div className="bg-white rounded-3xl p-5 border-2 border-slate-200 shadow-lg space-y-4 text-center">
                <div className="flex items-center justify-center gap-2">
                  <span className={`w-3.5 h-3.5 rounded-full ${team === 'blue' ? 'bg-indigo-600' : 'bg-rose-600'}`} />
                  <h3 className="text-lg font-black text-slate-900 uppercase">
                    Pre-Match Ready Check
                  </h3>
                </div>

                <p className="text-xs text-slate-600 font-medium">
                  กติกา: ทั้งสองฝ่ายต้องกดปุ่ม <strong>"พร้อม"</strong> ครบทั้งคู่ ระบบถึงจะเริ่มเกมและนับเวลา 30 วิ
                </p>

                {/* Big Interactive Ready Button for this Player */}
                <button
                  onClick={() => {
                    soundManager.playClick();
                    if (typeof navigator !== 'undefined' && navigator.vibrate) {
                      navigator.vibrate(40);
                    }
                    sendAction('SET_READY', { team, ready: !isMyTeamReady });
                  }}
                  className={`w-full py-5 px-6 rounded-2xl font-black text-xl transition-all shadow-xl active:scale-95 cursor-pointer flex flex-col items-center justify-center gap-1.5 border-3 ${
                    isMyTeamReady
                      ? 'bg-emerald-600 hover:bg-emerald-700 border-emerald-300 text-white ring-4 ring-emerald-300/50'
                      : team === 'blue'
                      ? 'bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 border-white text-white shadow-indigo-300 animate-pulse'
                      : 'bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 border-white text-white shadow-rose-300 animate-pulse'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {isMyTeamReady ? (
                      <CheckCircle2 className="w-6 h-6 stroke-[3]" />
                    ) : (
                      <Zap className="w-6 h-6 fill-amber-300 text-amber-300" />
                    )}
                    <span>
                      {isMyTeamReady
                        ? 'YOU ARE READY! (พร้อมแล้ว)'
                        : `I'M READY! (กดเพื่อพร้อมแข่ง)`}
                    </span>
                  </div>
                  <span className="text-[11px] font-medium opacity-90">
                    {isMyTeamReady
                      ? 'แตะอีกครั้งหากต้องการยกเลิกพร้อม · รอด้านตรงข้าม'
                      : `แตะปุ่มนี้เพื่อส่งสัญญาณพร้อมไปยังจอทีวี`}
                  </span>
                </button>

                {/* Dual Team Ready Status Comparison Card */}
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 grid grid-cols-2 gap-2 text-left">
                  {/* Team Blue Status */}
                  <div className={`p-2.5 rounded-xl border-2 transition-colors ${
                    isBlueReady
                      ? 'bg-emerald-50 border-emerald-400 text-emerald-950'
                      : 'bg-white border-slate-200 text-slate-700'
                  }`}>
                    <div className="flex items-center gap-1.5 font-black text-xs">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                      <span>Team Blue</span>
                    </div>
                    <span className="text-xs font-bold mt-1 block">
                      {isBlueReady ? '✅ พร้อมแล้ว!' : '⏳ รอกดพร้อม...'}
                    </span>
                  </div>

                  {/* Team Red Status */}
                  <div className={`p-2.5 rounded-xl border-2 transition-colors ${
                    isRedReady
                      ? 'bg-emerald-50 border-emerald-400 text-emerald-950'
                      : 'bg-white border-slate-200 text-slate-700'
                  }`}>
                    <div className="flex items-center gap-1.5 font-black text-xs">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                      <span>Team Red</span>
                    </div>
                    <span className="text-xs font-bold mt-1 block">
                      {isRedReady ? '✅ พร้อมแล้ว!' : '⏳ รอกดพร้อม...'}
                    </span>
                  </div>
                </div>

                <div className="text-[11px] text-slate-500 font-medium">
                  {isMyTeamReady && !isOpponentReady
                    ? '👉 คุณพร้อมแล้ว! กำลังรอให้ทีมตรงข้ามกดปุ่มพร้อม...'
                    : !isMyTeamReady && isOpponentReady
                    ? '⚡ ทีมตรงข้ามพร้อมแล้ว! กดปุ่มพร้อมเพื่อเริ่มนับถอยหลัง'
                    : isMyTeamReady && isOpponentReady
                    ? '🚀 ทั้งคู่พร้อมแล้ว! กำลังเริ่มนับถอยหลัง...'
                    : '💡 ให้ผู้เล่นทั้ง 2 ฝ่ายกดปุ่มพร้อมเพื่อเริ่มเกม'}
                </div>
              </div>
            ) : (
              /* Case 3: Timer is Running - Active Matching Gameplay */
              <>
                {/* Live Speed Bonus Banner on Phone */}
                <div className="p-3 bg-amber-50 border-2 border-amber-300 rounded-2xl flex items-center justify-between text-xs shadow-2xs">
                  <div className="flex items-center gap-1.5 font-black text-amber-950">
                    <Zap className="w-4 h-4 fill-amber-500 text-amber-600 animate-pulse" />
                    <span>Speed Bonus Active:</span>
                  </div>
                  <span className="font-black text-amber-900 text-sm">
                    +{50 + timer * 5} pts <span className="text-[10px] font-semibold text-amber-700">(ยิ่งตอบไวคะแนนยิ่งเยอะ)</span>
                  </span>
                </div>

                <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-2xs text-center flex items-center justify-between">
                  <span className="text-xs font-black uppercase text-slate-500">
                    Matches: {matchedIds.length} / 6
                  </span>
                  <span className="text-xs font-bold text-indigo-700">
                    {matchedIds.length === 6 ? '🎉 Completed! Look at the TV!' : 'Tap 1 Verb + 1 Noun to match!'}
                  </span>
                </div>

                {/* Verbs and Nouns columns on Mobile */}
                <div className="grid grid-cols-2 gap-2.5">
                  {/* Verbs */}
                  <div className="space-y-2">
                    <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 block text-center">
                      Verbs (กริยา)
                    </span>
                    {shuffledVerbs.map((item) => {
                      const isMatched = matchedIds.includes(item.id);
                      const isSelected = selectedVerbId === item.id;
                      const isMismatch = mismatchPair?.verbId === item.id;

                      return (
                        <button
                          key={`m-verb-${item.id}`}
                          onClick={() => handleSelectVerb(item.id)}
                          disabled={!isTimerRunning || isMatched}
                          className={`w-full min-h-[50px] px-3 py-2 rounded-xl font-black text-base transition-all flex items-center justify-between cursor-pointer ${
                            isMatched
                              ? 'bg-emerald-100 border-2 border-emerald-500 text-emerald-950'
                              : isMismatch
                              ? 'bg-rose-100 border-2 border-rose-500 text-rose-950 animate-shake'
                              : isSelected
                              ? 'bg-indigo-600 text-white shadow-md'
                              : 'bg-white border-2 border-slate-200 text-slate-800'
                          }`}
                        >
                          <span className="truncate">{item.text}</span>
                          {isMatched && <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />}
                        </button>
                      );
                    })}
                  </div>

                  {/* Nouns */}
                  <div className="space-y-2">
                    <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 block text-center">
                      Nouns (คำนาม)
                    </span>
                    {shuffledNouns.map((item) => {
                      const isMatched = matchedIds.includes(item.id);
                      const isSelected = selectedNounId === item.id;
                      const isMismatch = mismatchPair?.nounId === item.id;

                      return (
                        <button
                          key={`m-noun-${item.id}`}
                          onClick={() => handleSelectNoun(item.id)}
                          disabled={!isTimerRunning || isMatched}
                          className={`w-full min-h-[50px] px-3 py-2 rounded-xl font-black text-base transition-all flex items-center justify-between cursor-pointer ${
                            isMatched
                              ? 'bg-emerald-100 border-2 border-emerald-500 text-emerald-950'
                              : isMismatch
                              ? 'bg-rose-100 border-2 border-rose-500 text-rose-950 animate-shake'
                              : isSelected
                              ? 'bg-violet-600 text-white shadow-md'
                              : 'bg-white border-2 border-slate-200 text-slate-800'
                          }`}
                        >
                          <span className="truncate lowercase first-letter:uppercase">{item.text}</span>
                          {isMatched && <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* STAGE 2: STAFF REVIEW */}
        {stage === 2 && (
          <div className="bg-white rounded-3xl p-6 text-center space-y-4 border border-slate-200 shadow-md">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center mx-auto text-indigo-600">
              <Users className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-black text-slate-900">
              Staff Review in Progress
            </h3>
            <p className="text-xs text-slate-600">
              Booth staff is verifying the matched pairs on the big TV screen. Please look at the TV!
            </p>
            <p className="text-[11px] text-indigo-700 font-semibold">
              (พี่เจ้าหน้าที่กำลังตรวจสอบผลคะแนนบนจอทีวี)
            </p>
          </div>
        )}

        {/* STAGE 3: CARD DRAW */}
        {stage === 3 && (
          <div className="bg-white rounded-3xl p-6 text-center space-y-4 border border-slate-200 shadow-md">
            {playerCard ? (
              <div className="space-y-3">
                <span className="px-3 py-1 rounded-full bg-violet-100 text-violet-800 text-xs font-black uppercase">
                  Your Drawn Card
                </span>
                <h3 className="text-3xl font-black text-indigo-950 uppercase">
                  {playerCard.collocation}
                </h3>
                <p className="text-sm font-bold text-indigo-700">
                  ({playerCard.thaiMeaning})
                </p>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-left text-xs">
                  <span className="font-bold text-slate-500 block">Example Context:</span>
                  <p className="italic text-slate-800 font-semibold mt-0.5">
                    "{playerCard.exampleSentence}"
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <Dices className="w-12 h-12 text-indigo-600 mx-auto animate-bounce" />
                <h3 className="text-xl font-black text-slate-900">
                  Look at the TV Screen!
                </h3>
                <p className="text-xs text-slate-600">
                  Challenge cards are being drawn on the big TV screen.
                </p>
              </div>
            )}
          </div>
        )}

        {/* STAGE 4: SPEAKING CHALLENGE */}
        {stage === 4 && (
          <div className="bg-white rounded-3xl p-6 text-center space-y-4 border border-slate-200 shadow-md">
            <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white mx-auto flex items-center justify-center shadow-md">
              <MessageSquare className="w-6 h-6" />
            </div>

            <div>
              <span className="text-xs font-black text-amber-700 uppercase block">
                Speaking Challenge
              </span>
              <h3 className="text-2xl font-black text-slate-900 mt-1">
                Say It Aloud to Booth Staff!
              </h3>
            </div>

            {playerCard && (
              <div className="p-4 bg-indigo-50/80 rounded-2xl border border-indigo-200 text-center">
                <span className="text-[10px] font-black uppercase text-indigo-600">
                  Your Collocation
                </span>
                <h4 className="text-2xl font-black text-indigo-950 uppercase mt-0.5">
                  {playerCard.collocation}
                </h4>
                <p className="text-xs font-bold text-indigo-800">
                  ({playerCard.thaiMeaning})
                </p>
                <p className="text-xs text-slate-600 italic mt-2">
                  Model: "{playerCard.exampleSentence}"
                </p>
              </div>
            )}

            <p className="text-xs text-slate-600 font-medium">
              Look at booth staff and say your complete sentence! Any tense is allowed.
            </p>
            {isApproved && (
              <div className="p-2.5 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-800 font-black text-xs flex items-center justify-center gap-1">
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Your Sentence is Approved! (+100 pts)</span>
              </div>
            )}
          </div>
        )}

        {/* STAGE 5: CELEBRATION & PASSPORT STAMP */}
        {stage === 5 && (
          <div className="bg-gradient-to-br from-emerald-600 to-indigo-700 text-white rounded-3xl p-6 text-center space-y-4 shadow-xl">
            <div className="w-16 h-16 rounded-2xl bg-white text-emerald-600 flex items-center justify-center mx-auto shadow-lg">
              <Award className="w-10 h-10" />
            </div>

            <h3 className="text-3xl font-black text-white">
              CHALLENGE PASSED!
            </h3>
            <p className="text-xs text-emerald-100">
              Congratulations {nickname}! You earned a stamp and booth souvenir.
            </p>

            {/* Passport Stamp Seal on phone */}
            <div className="p-4 bg-white/20 backdrop-blur-md rounded-2xl border border-white/30 text-center">
              <div className="w-24 h-24 rounded-full border-3 border-dashed border-white mx-auto flex flex-col items-center justify-center transform -rotate-6">
                <span className="text-[8px] font-black uppercase">Official</span>
                <span className="text-sm font-black">PASSED</span>
                <span className="text-[8px] font-semibold">STAMP</span>
              </div>
              <p className="text-[11px] font-bold text-white mt-2">
                Show this screen to booth staff to claim your reward!
              </p>
            </div>
          </div>
        )}
      </main>

      {/* Mobile Footer */}
      <footer className="p-3 bg-white border-t border-slate-200 text-center text-[10px] text-slate-500 shrink-0">
        University English Activity Booth · Connected to Big TV
      </footer>
    </div>
  );
};
