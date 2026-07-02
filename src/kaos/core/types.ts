// Core Domain Model Interfaces for KAOS (Komentel AI Operating System)

export interface ArticleCorrection {
  date: string;
  text: string;
}

export interface ArticleReactions {
  like: number;
  love: number;
  bravo: number;
  surprise: number;
  sad: number;
  important: number;
}

export interface Article {
  id: string;
  title: string;
  titleEn?: string;
  category: string;
  categoryEn?: string;
  sourceName: string;
  sourceVerified: boolean;
  publishedAt: string;
  readTime: string;
  views: number;
  summary: string;
  summaryEn?: string;
  content: string[];
  contentEn?: string[];
  imageUrl: string;
  additionalImages?: string[];
  videoUrl?: string;
  corrections: ArticleCorrection[];
  commentsCount: number;
  commentsDisabled: boolean;
  reactions: ArticleReactions;
  userReaction: keyof ArticleReactions | null;
  continent?: string;
}

export interface MatchTeam {
  name: string;
  flag: string;
}

export interface Match {
  id: string;
  sport: 'FOOTBALL' | 'LUTTE' | 'BASKETBALL';
  homeTeam: MatchTeam;
  awayTeam: MatchTeam;
  score: string;
  status: 'EN DIRECT' | 'Terminé' | 'À venir';
  detail: string;
  minute?: number;
  half?: 1 | 2;
  wrestlingStage?: number;
  homeScore?: number;
  awayScore?: number;
  quarter?: number;
  timeRemaining?: string;
}

export interface Comment {
  id: string;
  articleId: string;
  parentId: string | null;
  author: string;
  authorBadge: 'Contributeur actif' | 'Journaliste' | 'Admin' | null;
  content: string;
  createdAt: string;
  likes: number;
  dislikes: number;
  reported: boolean;
}

export interface DuelRound {
  turn: number;
  challengerReply: string | null;
  defenderReply: string | null;
  challengerLikes: number;
  challengerDislikes: number;
  defenderLikes: number;
  defenderDislikes: number;
}

export interface Duel {
  id: string;
  articleId: string;
  articleTitle: string;
  commentId: string;
  challenger: string;
  challengerStats: { wins: number; losses: number; ratio: number };
  defender: string;
  defenderStats: { wins: number; losses: number; ratio: number };
  status: 'PENDING' | 'ACTIVE' | 'CLOSED';
  roundLimit: number;
  currentRound: number;
  currentTurn: 'CHALLENGER' | 'DEFENDER';
  rounds: DuelRound[];
  closesAt: string;
  winner: string | null;
}

export interface PollOption {
  label: string;
  labelEn?: string;
  votes: number;
  nameFr?: string;
  nameEn?: string;
  flag?: string;
  continentFr?: string;
  continentEn?: string;
  bestResultFr?: string;
  bestResultEn?: string;
}

export interface Poll {
  question: string;
  questionEn?: string;
  options: PollOption[];
  votedOptionIndex: number | null;
}

export interface User {
  name: string;
  email: string;
  role: 'USER' | 'JOURNALIST' | 'ADMIN';
  duelsStats: { wins: number; losses: number; ratio: number };
  activeDuelingEnabled: boolean;
  interests?: string[];
  pressCard?: string;
  media?: string;
  bio?: string;
  photoUrl?: string;
  accredited?: boolean;
}

export interface Notification {
  id: string;
  text: string;
  link: string;
  read: boolean;
  type: 'DUEL_CHALLENGE' | 'DUEL_ACCEPT' | 'REPLY' | 'ALERT';
  category?: string;
  user_email?: string;
}

export interface RegisteredUser {
  name: string;
  email: string;
  role: 'USER' | 'JOURNALIST' | 'ADMIN';
  duelsStats: { wins: number; losses: number; ratio: number };
  interests?: string[];
  pressCard?: string;
  media?: string;
  bio?: string;
  photoUrl?: string;
  accredited?: boolean;
  password?: string;
}
