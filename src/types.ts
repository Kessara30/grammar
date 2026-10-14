export type GameStage = 1 | 2 | 3 | 4 | 5;
export type GameMode = 'solo' | 'team-battle';
export type TeamId = 'blue' | 'red';

export interface CollocationPair {
  id: string;
  verb: string;
  noun: string;
  thaiMeaning: string;
  exampleSentence: string;
  category?: 'campus' | 'daily' | 'action';
}

export interface ChallengeCard {
  id: string;
  collocation: string;
  verb: string;
  nounPhrase: string;
  thaiMeaning: string;
  exampleSentence: string;
  verbForms: string[];
  category?: 'campus' | 'daily' | 'action';
}

export interface MatchedPairDetail {
  pairId: string;
  verb: string;
  noun: string;
  thaiMeaning: string;
  pointsEarned: number;
  timeRemaining: number;
}

export interface TeamScore {
  name: string;
  color: 'indigo' | 'rose';
  matchedCount: number;
  timeTaken: number;
  timeRemaining: number;
  isFinished: boolean;
  score: number;
  drawnCard: ChallengeCard | null;
  sentence: string;
  isSentenceApproved: boolean;
  matchedDetails?: MatchedPairDetail[];
}

export interface GameState {
  mode: GameMode;
  stage: GameStage;
  // Step 1: Matching
  timer: number;
  isTimerRunning: boolean;
  isMatchingComplete: boolean;
  isTimeUp: boolean;
  matchedPairs: string[]; // ids of matched pairs
  timeSpentSeconds: number;

  // Step 2: Staff Check
  staffCheckConfirmed: boolean;

  // Step 3: Pick a Card
  drawnCard: ChallengeCard | null;
  isCardRevealed: boolean;

  // Step 4: Make a Sentence
  sentenceText: string;
  isReadyForStaffReview: boolean;
  staffSentenceApproved: boolean;
  sentenceAttempts: number;

  // Sound & Preferences
  soundEnabled: boolean;

  // Team Battle State
  teamBlue: TeamScore;
  teamRed: TeamScore;
}
