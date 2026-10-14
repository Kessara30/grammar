/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { GameStage, GameMode, ChallengeCard, TeamScore } from './types.ts';
import { Header } from './components/Header.tsx';
import { MatchingStage } from './components/MatchingStage.tsx';
import { StaffCheckStage } from './components/StaffCheckStage.tsx';
import { CardDrawStage } from './components/CardDrawStage.tsx';
import { SentenceStage } from './components/SentenceStage.tsx';
import { PassStage } from './components/PassStage.tsx';
import { HowToPlayModal } from './components/HowToPlayModal.tsx';
import { StaffShortcutsModal } from './components/StaffShortcutsModal.tsx';
import { QRCodeModal } from './components/QRCodeModal.tsx';
import { BoothGuideModal } from './components/BoothGuideModal.tsx';
import { MobilePlayerView } from './components/MobilePlayerView.tsx';
import { soundManager } from './utils/sound.ts';
import { Shield, Keyboard, QrCode, Smartphone, Tv } from 'lucide-react';

const INITIAL_TEAM_BLUE: TeamScore = {
  name: 'Team Blue (ฝั่งน้ำเงิน)',
  color: 'indigo',
  matchedCount: 0,
  timeTaken: 0,
  timeRemaining: 30,
  isFinished: false,
  score: 0,
  drawnCard: null,
  sentence: '',
  isSentenceApproved: false,
};

const INITIAL_TEAM_RED: TeamScore = {
  name: 'Team Red (ฝั่งแดง)',
  color: 'rose',
  matchedCount: 0,
  timeTaken: 0,
  timeRemaining: 30,
  isFinished: false,
  score: 0,
  drawnCard: null,
  sentence: '',
  isSentenceApproved: false,
};

export default function App() {
  // Check URL role (default: TV host; if ?role=player: mobile controller)
  const [userRole, setUserRole] = useState<'tv' | 'player'>('tv');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('role') === 'player') {
        setUserRole('player');
      }
    }
  }, []);

  const [gameMode, setGameMode] = useState<GameMode>('team-battle');
  const [currentStage, setCurrentStage] = useState<GameStage>(1);
  const [roundKey, setRoundKey] = useState<number>(1);
  const [timeRemaining, setTimeRemaining] = useState<number>(30);
  const [, setStaffConfirmedStep2] = useState<boolean>(false);

  // Solo State
  const [drawnCard, setDrawnCard] = useState<ChallengeCard | null>(null);
  const [approvedSentence, setApprovedSentence] = useState<string>('');

  // 2-Team Battle State
  const [teamBlue, setTeamBlue] = useState<TeamScore>(INITIAL_TEAM_BLUE);
  const [teamRed, setTeamRed] = useState<TeamScore>(INITIAL_TEAM_RED);
  const [blueCard, setBlueCard] = useState<ChallengeCard | null>(null);
  const [redCard, setRedCard] = useState<ChallengeCard | null>(null);

  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [isHelpOpen, setIsHelpOpen] = useState<boolean>(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState<boolean>(false);
  const [isQROpen, setIsQROpen] = useState<boolean>(false);
  const [isBoothGuideOpen, setIsBoothGuideOpen] = useState<boolean>(false);

  // Real-time synchronization
  const [connectedPlayersCount, setConnectedPlayersCount] = useState<number>(0);
  const [serverState, setServerState] = useState<any>(null);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    let isMounted = true;
    let socket: WebSocket | null = null;
    let reconnectTimer: NodeJS.Timeout | null = null;

    function connectWs() {
      try {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${window.location.host}/ws`;
        socket = new WebSocket(wsUrl);
        wsRef.current = socket;

        socket.onopen = () => {
          if (socket?.readyState === WebSocket.OPEN) {
            socket.send(
              JSON.stringify({
                type: 'REGISTER_PLAYER',
                id: userRole === 'tv' ? 'tv_host' : `player_${Date.now()}`,
                role: userRole,
                nickname: userRole === 'tv' ? 'TV Screen Host' : 'Mobile Participant',
                team: 'blue',
              })
            );
          }
        };

        socket.onmessage = (event) => {
          if (!isMounted) return;
          try {
            const data = JSON.parse(event.data);
            if (data.type === 'STATE_UPDATE' && data.state) {
              setServerState(data.state);
              if (data.state.players) {
                const mobilePlayers = data.state.players.filter((p: any) => p.role === 'player');
                setConnectedPlayersCount(mobilePlayers.length);
              }
            }
          } catch {
            // Graceful parse
          }
        };

        socket.onclose = () => {
          if (isMounted) {
            reconnectTimer = setTimeout(connectWs, 2500);
          }
        };

        socket.onerror = () => {
          // Gracefully handled; socket.onclose will schedule reconnect if needed
        };
      } catch {
        // Fallback
      }
    }

    connectWs();

    return () => {
      isMounted = false;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      if (socket) socket.close();
    };
  }, [userRole]);

  // Dispatch action to server (stable callback across re-renders)
  const sendServerAction = useCallback((action: string, payload: any = {}) => {
    const message = { action, ...payload };
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'ACTION', payload: message }));
    } else {
      // Fallback via HTTP REST endpoint
      fetch('/api/game/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(message),
      }).catch(() => {});
    }
  }, []);

  // Toggle sound effects
  const handleToggleSound = () => {
    const nextState = !soundEnabled;
    soundManager.enabled = nextState;
    setSoundEnabled(nextState);
  };

  // Toggle Game Mode (Solo vs 2-Team Battle)
  const handleToggleGameMode = (mode: GameMode) => {
    setGameMode(mode);
    setCurrentStage(1);
    setRoundKey((prev) => prev + 1);
    sendServerAction('SET_MODE', { mode });
  };

  // Update Team Scores
  const handleUpdateTeamScores = (blueUpdate: Partial<TeamScore>, redUpdate: Partial<TeamScore>) => {
    setTeamBlue((prev) => ({ ...prev, ...blueUpdate }));
    setTeamRed((prev) => ({ ...prev, ...redUpdate }));
  };

  // Step 1: Matching complete (Solo)
  const handleMatchingCompleteSolo = (timeLeft: number) => {
    setTimeRemaining(timeLeft);
    setCurrentStage(2);
    sendServerAction('SET_STAGE', { stage: 2 });
  };

  // Step 1: Matching complete (2-Team Battle)
  const handleMatchingCompleteBattle = (blueTime: number, redTime: number) => {
    setTimeRemaining(Math.max(blueTime, redTime));
    setCurrentStage(2);
    sendServerAction('SET_STAGE', { stage: 2 });
  };

  // Step 2: Staff confirms pairs
  const handleStaffConfirmStep2 = () => {
    setStaffConfirmedStep2(true);
    setCurrentStage(3);
    sendServerAction('SET_STAGE', { stage: 3 });
  };

  // Step 2: Staff requests retry
  const handleStaffRetryStep2 = () => {
    setStaffConfirmedStep2(false);
    setTimeRemaining(30);
    setRoundKey((prev) => prev + 1);
    setCurrentStage(1);
    sendServerAction('SET_STAGE', { stage: 1 });
  };

  // Step 3: Card drawn (Solo)
  const handleCardSelectedSolo = (card: ChallengeCard) => {
    setDrawnCard(card);
    setCurrentStage(4);
    sendServerAction('SET_CARDS', { soloCard: card });
    sendServerAction('SET_STAGE', { stage: 4 });
  };

  // Step 3: Cards drawn (2-Team Battle)
  const handleCardsSelectedBattle = (bCard: ChallengeCard, rCard: ChallengeCard) => {
    setBlueCard(bCard);
    setRedCard(rCard);
    setTeamBlue((prev) => ({ ...prev, drawnCard: bCard }));
    setTeamRed((prev) => ({ ...prev, drawnCard: rCard }));
    setCurrentStage(4);
    sendServerAction('SET_CARDS', { blueCard: bCard, redCard: rCard });
    sendServerAction('SET_STAGE', { stage: 4 });
  };

  // Step 4: Staff approves sentence (Solo)
  const handleStaffApproveSentenceSolo = (sentence: string) => {
    setApprovedSentence(sentence);
    setCurrentStage(5);
    sendServerAction('APPROVE_SENTENCE', { sentence });
    sendServerAction('SET_STAGE', { stage: 5 });
  };

  // Step 4: Staff approves sentence (2-Team Battle)
  const handleStaffApproveSentenceBattle = () => {
    setCurrentStage(5);
    sendServerAction('SET_STAGE', { stage: 5 });
  };

  // Step 5: Next player reset
  const handleNextPlayer = () => {
    setCurrentStage(1);
    setRoundKey((prev) => prev + 1);
    setTimeRemaining(30);
    setStaffConfirmedStep2(false);
    setDrawnCard(null);
    setBlueCard(null);
    setRedCard(null);
    setApprovedSentence('');
    setTeamBlue((prev) => ({
      ...INITIAL_TEAM_BLUE,
      score: prev.score,
    }));
    setTeamRed((prev) => ({
      ...INITIAL_TEAM_RED,
      score: prev.score,
    }));
    sendServerAction('NEXT_ROUND');
  };

  // Global hotkeys for TV & laptop staff
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key.toLowerCase() === 'f') {
        e.preventDefault();
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen().catch(() => {});
        } else {
          if (document.exitFullscreen) {
            document.exitFullscreen().catch(() => {});
          }
        }
      } else if (e.key.toLowerCase() === 'm') {
        e.preventDefault();
        handleToggleSound();
      } else if (e.key.toLowerCase() === 'q') {
        e.preventDefault();
        setIsQROpen((prev) => !prev);
      } else if (e.key.toLowerCase() === 'b') {
        e.preventDefault();
        setIsBoothGuideOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [soundEnabled]);

  // If user opened with ?role=player or switched to mobile view
  if (userRole === 'player') {
    return (
      <MobilePlayerView
        socket={wsRef.current}
        serverState={serverState}
        sendAction={sendServerAction}
        onSwitchToTV={() => {
          setUserRole('tv');
          const url = new URL(window.location.href);
          url.searchParams.delete('role');
          window.history.pushState({}, '', url.toString());
        }}
      />
    );
  }

  // TV Host View (Default Display for the 16:9 Screen)
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-indigo-50/25 to-violet-50/35 text-slate-900 flex flex-col justify-between font-sans selection:bg-indigo-500 selection:text-white">
      {/* TV Booth Header with Stepper & Team Scoreboard */}
      <Header
        currentStage={currentStage}
        soundEnabled={soundEnabled}
        gameMode={gameMode}
        teamBlue={teamBlue}
        teamRed={teamRed}
        onToggleSound={handleToggleSound}
        onToggleGameMode={handleToggleGameMode}
        onOpenHelp={() => setIsHelpOpen(true)}
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
        onOpenQRCode={() => setIsQROpen(true)}
        onOpenBoothGuide={() => setIsBoothGuideOpen(true)}
        connectedPlayersCount={connectedPlayersCount}
      />

      {/* Main 16:9 Presentation Stage Container */}
      <main className="flex-1 max-w-[1600px] w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col justify-center">
        {currentStage === 1 && (
          <MatchingStage
            key={`matching-${roundKey}-${gameMode}`}
            gameMode={gameMode}
            teamBlue={teamBlue}
            teamRed={teamRed}
            serverState={serverState}
            sendAction={sendServerAction}
            onUpdateTeamScores={handleUpdateTeamScores}
            onCompleteSolo={handleMatchingCompleteSolo}
            onCompleteBattle={handleMatchingCompleteBattle}
          />
        )}

        {currentStage === 2 && (
          <StaffCheckStage
            gameMode={gameMode}
            teamBlue={teamBlue}
            teamRed={teamRed}
            timeRemaining={timeRemaining}
            onConfirm={handleStaffConfirmStep2}
            onRetry={handleStaffRetryStep2}
          />
        )}

        {currentStage === 3 && (
          <CardDrawStage
            key={`draw-${roundKey}-${gameMode}`}
            gameMode={gameMode}
            teamBlue={teamBlue}
            teamRed={teamRed}
            onCardSelectedSolo={handleCardSelectedSolo}
            onCardsSelectedBattle={handleCardsSelectedBattle}
          />
        )}

        {currentStage === 4 && (
          <SentenceStage
            gameMode={gameMode}
            drawnCard={drawnCard}
            blueCard={blueCard}
            redCard={redCard}
            teamBlue={teamBlue}
            teamRed={teamRed}
            onUpdateTeamScores={handleUpdateTeamScores}
            onStaffApproveSolo={handleStaffApproveSentenceSolo}
            onStaffApproveBattle={handleStaffApproveSentenceBattle}
          />
        )}

        {currentStage === 5 && (
          <PassStage
            gameMode={gameMode}
            drawnCard={drawnCard}
            blueCard={blueCard}
            redCard={redCard}
            approvedSentence={approvedSentence}
            timeRemaining={timeRemaining}
            teamBlue={teamBlue}
            teamRed={teamRed}
            onNextPlayer={handleNextPlayer}
          />
        )}
      </main>

      {/* TV Booth Footer with QR and Staff Dock */}
      <footer className="w-full bg-white/85 backdrop-blur-xs border-t border-slate-200/90 py-3 text-xs text-slate-500 shrink-0">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-black text-slate-800">Grammar Collocation Match</span>
            <span>·</span>
            <span className="text-slate-600 font-semibold">University English Activity Booth</span>
            <button
              onClick={() => setIsQROpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-50 text-emerald-800 font-black border border-emerald-300 hover:bg-emerald-100 transition-colors cursor-pointer"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>QR Code to Join ({connectedPlayersCount} connected)</span>
            </button>
          </div>

          <div className="flex items-center gap-3 text-xs">
            {/* Quick Demo Switch to Mobile View */}
            <button
              onClick={() => {
                setUserRole('player');
                const url = new URL(window.location.href);
                url.searchParams.set('role', 'player');
                window.history.pushState({}, '', url.toString());
              }}
              className="inline-flex items-center gap-1 text-indigo-700 hover:underline font-bold cursor-pointer"
              title="Test Mobile View"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Preview Mobile Controller</span>
            </button>
            <span>·</span>
            <button
              onClick={() => setIsShortcutsOpen(true)}
              className="inline-flex items-center gap-1.5 text-slate-600 hover:text-indigo-700 font-bold transition-colors cursor-pointer"
            >
              <Keyboard className="w-3.5 h-3.5 text-indigo-600" />
              <span>Laptop Hotkeys (Q: QR Code)</span>
            </button>
            <span>·</span>
            <span className="inline-flex items-center gap-1 text-slate-600 font-medium">
              <Shield className="w-3.5 h-3.5 text-emerald-600" />
              Staff Supervised
            </span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <HowToPlayModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
      <StaffShortcutsModal isOpen={isShortcutsOpen} onClose={() => setIsShortcutsOpen(false)} />
      <QRCodeModal
        isOpen={isQROpen}
        onClose={() => setIsQROpen(false)}
        connectedPlayersCount={connectedPlayersCount}
      />
      <BoothGuideModal
        isOpen={isBoothGuideOpen}
        onClose={() => setIsBoothGuideOpen(false)}
        onOpenQR={() => setIsQROpen(true)}
      />
    </div>
  );
}
