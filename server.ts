import http from 'http';
import express, { Request, Response } from 'express';
import { WebSocketServer, WebSocket } from 'ws';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

const server = http.createServer(app);
const wss = new WebSocketServer({ noServer: true });

server.on('upgrade', (request, socket, head) => {
  try {
    const url = new URL(request.url || '', `http://${request.headers.host || 'localhost'}`);
    if (url.pathname === '/ws') {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
      });
    }
  } catch {
    socket.destroy();
  }
});

interface PlayerInfo {
  id: string;
  nickname: string;
  team: 'blue' | 'red' | 'solo';
  role: 'tv' | 'player';
  ws?: WebSocket;
}

// In-memory server-authoritative shared state
let sharedGameState = {
  mode: 'team-battle' as 'solo' | 'team-battle',
  stage: 1 as 1 | 2 | 3 | 4 | 5,
  roundId: 1,
  timer: 30,
  isTimerRunning: false,
  category: 'all',
  activePairs: [
    { id: 'make-decision', verb: 'MAKE', noun: 'a decision', thaiMeaning: 'ตัดสินใจ' },
    { id: 'do-homework', verb: 'DO', noun: 'homework', thaiMeaning: 'ทำการบ้าน' },
    { id: 'take-break', verb: 'TAKE', noun: 'a break', thaiMeaning: 'หยุดพักผ่อนสักครู่' },
    { id: 'have-breakfast', verb: 'HAVE', noun: 'breakfast', thaiMeaning: 'รับประทานอาหารเช้า' },
    { id: 'pay-attention', verb: 'PAY', noun: 'attention', thaiMeaning: 'ตั้งใจฟัง / ใส่ใจ' },
    { id: 'catch-bus', verb: 'CATCH', noun: 'a bus', thaiMeaning: 'ขึ้นรถเมล์ / นั่งรถประจำทาง' },
  ] as Array<{ id: string; verb: string; noun: string; thaiMeaning: string }>,

  // Matches
  soloMatchedIds: [] as string[],
  blueMatchedIds: [] as string[],
  redMatchedIds: [] as string[],
  blueMatchedDetails: [] as Array<{ pairId: string; verb: string; noun: string; thaiMeaning: string; pointsEarned: number; timeRemaining: number }>,
  redMatchedDetails: [] as Array<{ pairId: string; verb: string; noun: string; thaiMeaning: string; pointsEarned: number; timeRemaining: number }>,

  // Team scores
  blueScore: 0,
  redScore: 0,
  blueTime: null as number | null,
  redTime: null as number | null,

  // Cards
  soloCard: null as any,
  blueCard: null as any,
  redCard: null as any,

  // Approvals
  blueApproved: false,
  redApproved: false,
  soloApproved: false,
  approvedSentence: '',

  // Connected players
  players: [] as Array<{ id: string; nickname: string; team: 'blue' | 'red' | 'solo'; role: 'tv' | 'player' }>,

  // Dual Ready states before starting
  blueReady: false,
  redReady: false,
  countdown: null as number | null,
};

let timerInterval: NodeJS.Timeout | null = null;
let countdownTimeout: NodeJS.Timeout | null = null;

function broadcastState() {
  const payload = JSON.stringify({ type: 'STATE_UPDATE', state: sharedGameState });
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  });
}

function stopCountdown() {
  if (countdownTimeout) {
    clearTimeout(countdownTimeout);
    countdownTimeout = null;
  }
  sharedGameState.countdown = null;
}

function startCountdown() {
  stopCountdown();
  sharedGameState.countdown = 3;
  broadcastState();

  countdownTimeout = setTimeout(() => {
    // Ensure both teams are still ready
    if (!sharedGameState.blueReady || !sharedGameState.redReady) {
      stopCountdown();
      broadcastState();
      return;
    }
    sharedGameState.countdown = 2;
    broadcastState();

    countdownTimeout = setTimeout(() => {
      if (!sharedGameState.blueReady || !sharedGameState.redReady) {
        stopCountdown();
        broadcastState();
        return;
      }
      sharedGameState.countdown = 1;
      broadcastState();

      countdownTimeout = setTimeout(() => {
        if (!sharedGameState.blueReady || !sharedGameState.redReady) {
          stopCountdown();
          broadcastState();
          return;
        }
        sharedGameState.countdown = null;
        startTimer();
      }, 1000);
    }, 1000);
  }, 1000);
}

function stopTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
  sharedGameState.isTimerRunning = false;
}

function startTimer() {
  stopCountdown();
  stopTimer();
  sharedGameState.countdown = null;
  sharedGameState.timer = 30; // Reset exactly to 30s
  sharedGameState.isTimerRunning = true;
  // Broadcast immediately so all clients switch from countdown to active game at the exact same instant!
  broadcastState();

  timerInterval = setInterval(() => {
    if (sharedGameState.timer > 0) {
      sharedGameState.timer -= 1;
      broadcastState();
    } else {
      stopTimer();
      broadcastState();
    }
  }, 1000);
}

// REST fallback endpoints
app.get('/api/game/state', (_req: Request, res: Response) => {
  res.json(sharedGameState);
});

app.post('/api/game/action', (req: Request, res: Response) => {
  handleAction(req.body);
  res.json({ success: true, state: sharedGameState });
});

function handleAction(data: any) {
  if (!data || !data.action) return;
  console.log('[ACTION RECEIVED]', data.action, data);

  switch (data.action) {
    case 'SET_MODE':
      sharedGameState.mode = data.mode;
      broadcastState();
      break;

    case 'INIT_ROUND':
      // Guard against accidental reset if teams are preparing/ready, counting down, or timer is running
      if (!data.force && (sharedGameState.blueReady || sharedGameState.redReady || sharedGameState.isTimerRunning || sharedGameState.countdown !== null)) {
        break;
      }
      stopCountdown();
      stopTimer();
      sharedGameState.stage = 1;
      sharedGameState.roundId += 1;
      sharedGameState.timer = 30;
      sharedGameState.blueReady = false;
      sharedGameState.redReady = false;
      sharedGameState.countdown = null;
      sharedGameState.activePairs = data.pairs || [];
      sharedGameState.category = data.category || 'all';
      sharedGameState.soloMatchedIds = [];
      sharedGameState.blueMatchedIds = [];
      sharedGameState.redMatchedIds = [];
      sharedGameState.blueMatchedDetails = [];
      sharedGameState.redMatchedDetails = [];
      sharedGameState.blueTime = null;
      sharedGameState.redTime = null;
      sharedGameState.soloCard = null;
      sharedGameState.blueCard = null;
      sharedGameState.redCard = null;
      sharedGameState.blueApproved = false;
      sharedGameState.redApproved = false;
      sharedGameState.soloApproved = false;
      sharedGameState.approvedSentence = '';
      broadcastState();
      break;

    case 'SET_READY': {
      // If timer is already running or stage has advanced, don't toggle ready
      if (sharedGameState.isTimerRunning || sharedGameState.stage !== 1) {
        break;
      }

      if (data.forceStart) {
        sharedGameState.blueReady = true;
        sharedGameState.redReady = true;
      } else if (data.team === 'blue') {
        sharedGameState.blueReady = data.ready !== false;
      } else if (data.team === 'red') {
        sharedGameState.redReady = data.ready !== false;
      } else if (data.team === 'solo') {
        sharedGameState.blueReady = true;
        sharedGameState.redReady = true;
      }

      // If either team un-readies during countdown, cancel the countdown!
      if (!sharedGameState.blueReady || !sharedGameState.redReady) {
        if (sharedGameState.countdown !== null) {
          stopCountdown();
        }
        broadcastState();
      } else {
        // Both teams ready
        broadcastState();
        if (!sharedGameState.isTimerRunning && sharedGameState.countdown === null) {
          startCountdown();
        }
      }
      break;
    }

    case 'FORCE_START':
    case 'START_NOW':
      sharedGameState.blueReady = true;
      sharedGameState.redReady = true;
      startCountdown();
      break;

    case 'START_TIMER':
      stopCountdown();
      sharedGameState.blueReady = true;
      sharedGameState.redReady = true;
      startTimer();
      break;

    case 'MATCH_PAIR': {
      // Faster answers yield higher score!
      const timeRemaining = Math.max(sharedGameState.timer, 0);
      const pointsEarned = 50 + (timeRemaining * 5); // 50 base + 5 per second left

      // Find pair details if available
      const pair = sharedGameState.activePairs.find((p) => p.id === data.pairId) || {
        id: data.pairId,
        verb: data.verb || 'VERB',
        noun: data.noun || 'noun',
        thaiMeaning: data.thaiMeaning || '',
      };

      const matchDetail = {
        pairId: data.pairId,
        verb: pair.verb,
        noun: pair.noun,
        thaiMeaning: pair.thaiMeaning,
        pointsEarned,
        timeRemaining,
      };

      if (data.team === 'blue') {
        if (!sharedGameState.blueMatchedIds.includes(data.pairId)) {
          sharedGameState.blueMatchedIds.push(data.pairId);
          sharedGameState.blueMatchedDetails.push(matchDetail);
          sharedGameState.blueScore += pointsEarned;

          if (sharedGameState.blueMatchedIds.length === 6 && sharedGameState.blueTime === null) {
            sharedGameState.blueTime = timeRemaining;
            sharedGameState.blueScore += 100 + (timeRemaining * 10); // Completion speed bonus
          }
        }
      } else if (data.team === 'red') {
        if (!sharedGameState.redMatchedIds.includes(data.pairId)) {
          sharedGameState.redMatchedIds.push(data.pairId);
          sharedGameState.redMatchedDetails.push(matchDetail);
          sharedGameState.redScore += pointsEarned;

          if (sharedGameState.redMatchedIds.length === 6 && sharedGameState.redTime === null) {
            sharedGameState.redTime = timeRemaining;
            sharedGameState.redScore += 100 + (timeRemaining * 10); // Completion speed bonus
          }
        }
      } else {
        if (!sharedGameState.soloMatchedIds.includes(data.pairId)) {
          sharedGameState.soloMatchedIds.push(data.pairId);
        }
      }

      // Determine if match is complete (supports both teams, or solo/single-team active play)
      const bluePlayerCount = sharedGameState.players.filter((p) => p.role === 'player' && p.team === 'blue').length;
      const redPlayerCount = sharedGameState.players.filter((p) => p.role === 'player' && p.team === 'red').length;

      const blueDone = sharedGameState.blueMatchedIds.length === 6;
      const redDone = sharedGameState.redMatchedIds.length === 6;

      if ((blueDone && redDone) ||
          (bluePlayerCount > 0 && redPlayerCount === 0 && blueDone) ||
          (redPlayerCount > 0 && bluePlayerCount === 0 && redDone)) {
        stopTimer();
      }

      broadcastState();
      break;
    }

    case 'SET_STAGE':
      sharedGameState.stage = data.stage;
      if (data.stage !== 1) {
        stopTimer();
      }
      broadcastState();
      break;

    case 'SET_CARDS':
      if (data.soloCard) sharedGameState.soloCard = data.soloCard;
      if (data.blueCard) sharedGameState.blueCard = data.blueCard;
      if (data.redCard) sharedGameState.redCard = data.redCard;
      broadcastState();
      break;

    case 'APPROVE_SENTENCE':
      if (data.team === 'blue') {
        sharedGameState.blueApproved = true;
        sharedGameState.blueScore += 100;
      } else if (data.team === 'red') {
        sharedGameState.redApproved = true;
        sharedGameState.redScore += 100;
      } else {
        sharedGameState.soloApproved = true;
        sharedGameState.approvedSentence = data.sentence || '';
      }
      broadcastState();
      break;

    case 'NEXT_ROUND':
      stopCountdown();
      stopTimer();
      sharedGameState.stage = 1;
      sharedGameState.roundId += 1;
      sharedGameState.timer = 30;
      sharedGameState.blueReady = false;
      sharedGameState.redReady = false;
      sharedGameState.countdown = null;
      sharedGameState.soloMatchedIds = [];
      sharedGameState.blueMatchedIds = [];
      sharedGameState.redMatchedIds = [];
      sharedGameState.blueMatchedDetails = [];
      sharedGameState.redMatchedDetails = [];
      sharedGameState.soloCard = null;
      sharedGameState.blueCard = null;
      sharedGameState.redCard = null;
      sharedGameState.blueApproved = false;
      sharedGameState.redApproved = false;
      sharedGameState.soloApproved = false;
      sharedGameState.approvedSentence = '';
      broadcastState();
      break;

    default:
      break;
  }
}

// WebSocket connection handling
wss.on('connection', (ws: WebSocket) => {
  let registeredPlayerId: string | null = null;

  // Send initial state immediately
  ws.send(JSON.stringify({ type: 'STATE_UPDATE', state: sharedGameState }));

  ws.on('message', (message: string) => {
    try {
      const data = JSON.parse(message.toString());

      if (data.type === 'REGISTER_PLAYER') {
        const playerId: string = data.id || `p_${Date.now()}`;
        registeredPlayerId = playerId;
        const newPlayer = {
          id: playerId,
          nickname: String(data.nickname || 'Student'),
          team: (data.team === 'red' ? 'red' : data.team === 'solo' ? 'solo' : 'blue') as 'blue' | 'red' | 'solo',
          role: (data.role === 'tv' ? 'tv' : 'player') as 'tv' | 'player',
        };

        // Remove old if exists
        sharedGameState.players = sharedGameState.players.filter((p) => p.id !== registeredPlayerId);
        sharedGameState.players.push(newPlayer);
        broadcastState();
      } else if (data.type === 'ACTION') {
        handleAction(data.payload);
      }
    } catch {
      // Handle parsing gracefully
    }
  });

  ws.on('close', () => {
    if (registeredPlayerId) {
      sharedGameState.players = sharedGameState.players.filter((p) => p.id !== registeredPlayerId);
      broadcastState();
    }
  });
});

async function start() {
  const PORT = parseInt(process.env.PORT || '3000', 10);

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR === 'true' ? false : { server },
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

start();
