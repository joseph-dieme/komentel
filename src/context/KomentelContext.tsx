"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

// Interfaces
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
  // wrestling
  wrestlingStage?: number;
  // basketball
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
  authorBadge: 'Contributeur actif' | 'Journaliste' | null;
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
  winner: string | null; // 'CHALLENGER' | 'DEFENDER' | 'DRAW' | null
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

interface KomentelContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  articles: Article[];
  comments: Comment[];
  duels: Duel[];
  poll: Poll;
  notifications: Notification[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  registeredUsers: RegisteredUser[];
  registerUser: (name: string, email: string, role?: 'USER' | 'JOURNALIST' | 'ADMIN', password?: string) => void;
  loginUser: (email: string, password?: string) => Promise<boolean>;
  logoutUser: () => void;
  completeOnboarding: (details: { interests?: string[]; pressCard?: string; media?: string; bio?: string; photoUrl?: string }) => void;
  accreditJournalist: (email: string) => Promise<void>;
  votedAt: number | null;
  votePoll: (optionIndex: number) => void;
  changeVotePoll: (oldIndex: number, newIndex: number) => void;
  addComment: (articleId: string, content: string, parentId?: string | null, customAuthor?: string) => void;
  reportComment: (commentId: string) => void;
  likeComment: (commentId: string) => void;
  dislikeComment: (commentId: string) => void;
  challengeToDuel: (articleId: string, commentId: string, opponentName: string, promptText?: string) => void;
  acceptDuel: (duelId: string) => void;
  postDuelReply: (duelId: string, text: string) => void;
  voteDuelReply: (duelId: string, roundIndex: number, side: 'challenger' | 'defender', type: 'like' | 'dislike') => void;
  addArticle: (title: string, category: string, summary: string, paragraphs: string[], imageUrl?: string, authorName?: string, additionalImages?: string[], videoUrl?: string, continent?: string) => void;
  updateArticleCorrection: (articleId: string, correctionText: string) => void;
  reactToArticle: (articleId: string, reactionType: keyof ArticleReactions) => void;
  toggleComments: (articleId: string) => void;
  moderateComment: (commentId: string, action: 'delete' | 'keep') => void;
  moderateDuel: (duelId: string, action: 'close' | 'delete') => void;
  dismissNotification: (id: string) => void;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  language: 'FR' | 'EN';
  toggleLanguage: () => void;
  tempUnit: 'C' | 'F';
  toggleTempUnit: () => void;
  layoutMode: 'GRID' | 'LIST';
  toggleLayoutMode: () => void;
  showWeather: boolean;
  setShowWeather: (show: boolean) => void;
  enableNotifications: boolean;
  setEnableNotifications: (enable: boolean) => void;
  immersiveMode: boolean;
  setImmersiveMode: (immersive: boolean) => void;
  hiddenCategories: string[];
  setHiddenCategories: (action: React.SetStateAction<string[]>) => void;
  matches: Match[];
  refreshMatches: () => Promise<void>;
  resetSimulatedMatches: () => void;
  refreshArticles: () => Promise<void>;
}

const KomentelContext = createContext<KomentelContextType | undefined>(undefined);

export const useKomentel = () => {
  const context = useContext(KomentelContext);
  if (!context) throw new Error("useKomentel must be used within a KomentelProvider");
  return context;
};

// Helpers for converting ISO3 or common team abbreviations to flag emojis
const getFlagEmoji = (countryCode: string): string => {
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt(0));
  try {
    return String.fromCodePoint(...codePoints);
  } catch (e) {
    return '⚽';
  }
};

const iso3ToFlag = (iso3: string): string => {
  if (!iso3) return '⚽';
  const mapping: { [key: string]: string } = {
    'AFG': 'AF', 'ALB': 'AL', 'ALG': 'DZ', 'AND': 'AD', 'ANG': 'AO', 'ARG': 'AR', 'ARM': 'AM', 'AUS': 'AU', 'AUT': 'AT', 'AZE': 'AZ',
    'BAH': 'BS', 'BAN': 'BD', 'BAR': 'BB', 'BEL': 'BE', 'BEN': 'BJ', 'BER': 'BM', 'BHU': 'BT', 'BIH': 'BA', 'BLR': 'BY', 'BOL': 'BO',
    'BOT': 'BW', 'BRA': 'BR', 'BRU': 'BN', 'BUL': 'BG', 'BUR': 'BF', 'BDI': 'BI', 'CAM': 'KH', 'CMR': 'CM', 'CAN': 'CA', 'CPV': 'CV',
    'CAF': 'CF', 'CHA': 'TD', 'CHI': 'CL', 'CHN': 'CN', 'COL': 'CO', 'COM': 'KM', 'CGO': 'CG', 'COD': 'CD', 'COK': 'CK', 'CRC': 'CR',
    'CRO': 'HR', 'CUB': 'CU', 'CYP': 'CY', 'CZE': 'CZ', 'DEN': 'DK', 'DJI': 'DJ', 'DMA': 'DM', 'DOM': 'DO', 'ECU': 'EC', 'EGY': 'EG',
    'SLV': 'SV', 'ENG': 'GB-ENG', 'EQG': 'GQ', 'ERI': 'ER', 'EST': 'EE', 'ETH': 'ET', 'FIJ': 'FJ', 'FIN': 'FI', 'FRA': 'FR', 'GAB': 'GA',
    'GAM': 'GM', 'GEO': 'GE', 'GER': 'DE', 'GHA': 'GH', 'GRE': 'GR', 'GRN': 'GD', 'GUA': 'GT', 'GUI': 'GN', 'GBS': 'GW', 'GUY': 'GY',
    'HAI': 'HT', 'HON': 'HN', 'HKG': 'HK', 'HUN': 'HU', 'ISL': 'IS', 'IND': 'IN', 'IDN': 'ID', 'IRN': 'IR', 'IRQ': 'IQ', 'IRL': 'IE',
    'ISR': 'IL', 'ITA': 'IT', 'CIV': 'CI', 'JAM': 'JM', 'JPN': 'JP', 'JOR': 'JO', 'KAZ': 'KZ', 'KEN': 'KE', 'KOR': 'KR', 'KSA': 'SA',
    'KUW': 'KW', 'KGZ': 'KG', 'LAO': 'LA', 'LAT': 'LV', 'LBN': 'LB', 'LES': 'LS', 'LBR': 'LR', 'LBY': 'LY', 'LIE': 'LI', 'LTU': 'LT',
    'LUX': 'LU', 'MKD': 'MK', 'MAD': 'MG', 'MWI': 'MW', 'MAS': 'MY', 'MDV': 'MV', 'MLI': 'ML', 'MLT': 'MT', 'MTN': 'MR', 'MRI': 'MU',
    'MEX': 'MX', 'MDA': 'MD', 'MON': 'MC', 'MNG': 'MN', 'MNE': 'ME', 'MAR': 'MA', 'MOZ': 'MZ', 'MYA': 'MM', 'NAM': 'NA', 'NEP': 'NP',
    'NED': 'NL', 'NZL': 'NZ', 'NCA': 'NI', 'NIG': 'NE', 'NGA': 'NG', 'NIR': 'GB-NIR', 'NOR': 'NO', 'OMA': 'OM', 'PAK': 'PK', 'PLE': 'PS',
    'PAN': 'PA', 'PNG': 'PG', 'PAR': 'PY', 'PER': 'PE', 'PHI': 'PH', 'POL': 'PL', 'POR': 'PT', 'QAT': 'QA', 'ROU': 'RO', 'RUS': 'RU',
    'RWA': 'RW', 'SKN': 'KN', 'LCA': 'LC', 'VIN': 'VC', 'SAM': 'WS', 'SMR': 'SM', 'STP': 'ST', 'SEN': 'SN', 'SRB': 'RS', 'SEY': 'SC',
    'SLE': 'SL', 'SGP': 'SG', 'SVK': 'SK', 'SVN': 'SI', 'SOL': 'SB', 'SOM': 'SO', 'RSA': 'ZA', 'ESP': 'ES', 'SRI': 'LK', 'SUD': 'SD',
    'SUR': 'SR', 'SWZ': 'SZ', 'SWE': 'SE', 'SUI': 'CH', 'SYR': 'SY', 'TPE': 'TW', 'TJK': 'TJ', 'TAN': 'TZ', 'THA': 'TH', 'TOG': 'TG',
    'TON': 'TO', 'TRI': 'TT', 'TUN': 'TN', 'TUR': 'TR', 'TKM': 'TM', 'UGA': 'UG', 'UKR': 'UA', 'UAE': 'AE', 'URU': 'UY', 'USA': 'US',
    'UZB': 'UZ', 'VAN': 'VU', 'VEN': 'VE', 'VIE': 'VN', 'WAL': 'GB-WLS', 'YEM': 'YE', 'ZAM': 'ZM', 'ZIM': 'ZW',
    'SCO': 'GB-SCT', 'HTI': 'HT'
  };

  const code = mapping[iso3.toUpperCase()];
  if (!code) return '⚽';
  
  if (code === 'GB-ENG') return '🏴󠁧󠁢󠁥󠁮󠁧󠁿';
  if (code === 'GB-WLS') return '🏴󠁧󠁢󠁷󠁬󠁳󠁿';
  if (code === 'GB-SCT') return '🏴󠁧󠁢󠁳󠁣󠁴󠁿';
  if (code === 'GB-NIR') return '⚽';

  return getFlagEmoji(code);
};

const translateCategory = (cat: string, targetLang: 'fr' | 'en'): string => {
  const mapping: { [key: string]: { fr: string, en: string } } = {
    "Toutes": { fr: "Toutes", en: "All" },
    "Actualités": { fr: "Actualités", en: "News" },
    "Sport": { fr: "Sport", en: "Sports" },
    "Santé": { fr: "Santé", en: "Health" },
    "Éducation": { fr: "Éducation", en: "Education" },
    "Technologie": { fr: "Technologie", en: "Tech" },
    "Culture": { fr: "Culture", en: "Culture" },
    "International": { fr: "International", en: "International" },
    "Business": { fr: "Business", en: "Business" }
  };
  
  const normCat = cat.trim();
  for (const key in mapping) {
    const item = mapping[key];
    if (item.fr.toLowerCase() === normCat.toLowerCase() || item.en.toLowerCase() === normCat.toLowerCase()) {
      return targetLang === 'fr' ? item.fr : item.en;
    }
  }
  return cat;
};

const detectContinent = (title: string, summary: string): string => {
  const text = `${title} ${summary}`.toLowerCase();
  if (text.includes("sénégal") || text.includes("dakar") || text.includes("aps news") || text.includes("moussa diop")) {
    return "Sénégal";
  }
  if (text.includes("moyen-orient") || text.includes("dubai") || text.includes("éthiopie") || text.includes("arabie") || text.includes("syrie") || text.includes("liban") || text.includes("israël") || text.includes("palestine") || text.includes("qatar") || text.includes("iran") || text.includes("irak")) {
    return "Moyen-Orient";
  }
  if (text.includes("afrique") || text.includes("madagascar") || text.includes("mali") || text.includes("maroc") || text.includes("egypte") || text.includes("tunisie") || text.includes("kenya") || text.includes("nigéria")) {
    return "Afrique";
  }
  if (text.includes("europe") || text.includes("france") || text.includes("paris") || text.includes("genève") || text.includes("suisse") || text.includes("allemagne") || text.includes("londres") || text.includes("royaume-uni") || text.includes("italie") || text.includes("espagne")) {
    return "Europe";
  }
  if (text.includes("états-unis") || text.includes("usa") || text.includes("biden") || text.includes("trump") || text.includes("amérique") || text.includes("canada") || text.includes("brésil") || text.includes("argentine") || text.includes("amériques")) {
    return "Amériques";
  }
  if (text.includes("chine") || text.includes("japon") || text.includes("tokyo") || text.includes("pékin") || text.includes("inde") || text.includes("asie") || text.includes("corée") || text.includes("vietnam") || text.includes("australie") || text.includes("océanie") || text.includes("nouvelle-zélande") || text.includes("pacifique")) {
    return "Asie-Pacifique";
  }
  return "Monde";
};

const sanitizeHTML = (str: string): string => {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
};

const sanitizeUrl = (url?: string): string => {
  if (!url) return "";
  const trimmed = url.trim();
  if (trimmed.toLowerCase().startsWith("javascript:") || trimmed.toLowerCase().startsWith("data:")) {
    return "about:blank";
  }
  return trimmed;
};

const getFallbackTranslation = (text: string, from: 'fr' | 'en', to: 'fr' | 'en'): string => {
  const commonDict: { [key: string]: { fr: string, en: string } } = {
    "Réforme de l'éducation : Quels impacts pour la rentrée ?": {
      fr: "Réforme de l'éducation : Quels impacts pour la rentrée ?",
      en: "Education reform: What impacts for the start of the school year?"
    },
    "Sommet Mondial sur le Climat : Les nouveaux engagements pour 2030": {
      fr: "Sommet Mondial sur le Climat : Les nouveaux engagements pour 2030",
      en: "Global Climate Summit: New commitments for 2030"
    },
    "La Révolution des Batteries Solides : L'Automobile de Demain": {
      fr: "La Révolution des Batteries Solides : L'Automobile de Demain",
      en: "The Solid-State Battery Revolution: Tomorrow's Automobile"
    },
    "Qui remportera la Coupe du Monde de la FIFA cette année ?": {
      fr: "Qui remportera la Coupe du Monde de la FIFA cette année ?",
      en: "Who will win the FIFA World Cup this year?"
    },
    "Sénégal (Lions de la Téranga) 🇸🇳": {
      fr: "Sénégal (Lions de la Téranga) 🇸🇳",
      en: "Senegal (Teranga Lions) 🇸🇳"
    },
    "Argentine (Albiceleste) 🇦🇷": {
      fr: "Argentine (Albiceleste) 🇦🇷",
      en: "Argentina (Albiceleste) 🇦🇷"
    },
    "France (Les Bleus) 🇫🇷": {
      fr: "France (Les Bleus) 🇫🇷",
      en: "France (Les Bleus) 🇫🇷"
    },
    "Brésil (Auriverde) 🇧🇷": {
      fr: "Brésil (Auriverde) 🇧🇷",
      en: "Brazil (Auriverde) 🇧🇷"
    }
  };

  const found = commonDict[text];
  if (found) {
    return to === 'fr' ? found.fr : found.en;
  }
  return text;
};

const translateText = async (text: string, from: 'fr' | 'en', to: 'fr' | 'en'): Promise<string> => {
  if (!text || !text.trim()) return "";
  try {
    const res = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text.trim())}&langpair=${from}|${to}`);
    if (!res.ok) {
      console.warn("Translation API rate limit or error status: " + res.status);
      return getFallbackTranslation(text, from, to);
    }
    const json = await res.json();
    if (json?.responseData?.translatedText) {
      return json.responseData.translatedText;
    }
  } catch (error) {
    console.warn("Translation API failed:", error);
  }
  return getFallbackTranslation(text, from, to);
};

const mapStoryToArticle = (story: any): Article => {
  const issueName = story.issue?.name || "";
  let category = "Actualités";
  let imageUrl = "https://images.unsplash.com/photo-1495020689067-958852a6565d?auto=format&fit=crop&q=80&w=800"; // default news

  if (issueName.includes("Health") || issueName.includes("Human")) {
    category = "Santé";
    imageUrl = "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=800";
  } else if (issueName.includes("Science") || issueName.includes("Tech")) {
    category = "Technologie";
    imageUrl = "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=800";
  } else if (issueName.includes("Environment") || issueName.includes("Planet") || issueName.includes("Climate")) {
    category = "International";
    imageUrl = "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=800";
  } else if (issueName.includes("Business") || issueName.includes("Economy")) {
    category = "Business";
    imageUrl = "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&q=80&w=800";
  }

  const contentParagraphs = [
    story.summary || "Pas de résumé disponible.",
  ];
  if (story.quote) {
    contentParagraphs.push(`« ${story.quote} » — ${story.quoteAttribution || 'Source'}`);
  }
  if (story.relevanceSummary) {
    contentParagraphs.push(story.relevanceSummary);
  }

  const wordCount = contentParagraphs.join(" ").split(" ").length;
  const readTimeMin = Math.max(1, Math.round(wordCount / 200));

  let publishedAt = "Récemment";
  if (story.datePublished) {
    const pubDate = new Date(story.datePublished);
    const now = new Date();
    const diffMs = now.getTime() - pubDate.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours < 1) {
      publishedAt = "Il y a moins d'une heure";
    } else if (diffHours < 24) {
      publishedAt = `Il y a ${diffHours}h`;
    } else {
      const diffDays = Math.floor(diffHours / 24);
      publishedAt = `Il y a ${diffDays}j`;
    }
  }

  return {
    id: `live-${story.id}`,
    title: story.title || "Titre d'actualité",
    titleEn: story.title || "",
    category,
    categoryEn: translateCategory(category, 'en'),
    continent: detectContinent(story.title || "", story.summary || ""),
    sourceName: story.feed?.displayTitle || story.sourceTitle || "Presse",
    sourceVerified: true,
    publishedAt,
    readTime: `${readTimeMin} min read`,
    views: (story.relevance || 5) * 1500 + Math.floor(Math.random() * 500),
    summary: story.summary || "",
    summaryEn: story.summary || "",
    content: contentParagraphs,
    contentEn: contentParagraphs,
    imageUrl,
    corrections: [],
    commentsCount: Math.floor(Math.random() * 5),
    commentsDisabled: false,
    reactions: {
      like: Math.floor(Math.random() * 80) + 10,
      love: Math.floor(Math.random() * 40),
      bravo: Math.floor(Math.random() * 30),
      surprise: Math.floor(Math.random() * 15),
      sad: Math.floor(Math.random() * 5),
      important: Math.floor(Math.random() * 30)
    },
    userReaction: null
  };
};

export const KomentelProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. Initial Mock User
  const [user, setUser] = useState<User | null>(null);

  // Poll Voted At Timestamp
  const [votedAt, setVotedAt] = useState<number | null>(null);

  // Registered users list simulating local DB
  const [registeredUsers, setRegisteredUsers] = useState<RegisteredUser[]>([]);

  const registerUser = async (name: string, email: string, role: 'USER' | 'JOURNALIST' | 'ADMIN' = 'USER', password?: string) => {
    const cleanName = sanitizeHTML(name);
    const cleanEmail = sanitizeHTML(email);
    const cleanPassword = password ? sanitizeHTML(password) : "password123";
    const newUser: RegisteredUser = {
      name: cleanName,
      email: cleanEmail,
      role,
      password: cleanPassword,
      duelsStats: { wins: 0, losses: 0, ratio: 0 },
      accredited: role === "JOURNALIST" ? false : true
    };
    setRegisteredUsers(prev => {
      if (prev.some(u => u.email.toLowerCase() === cleanEmail.toLowerCase())) return prev;
      return [...prev, newUser];
    });
    setUser({
      name: cleanName,
      email: cleanEmail,
      role,
      duelsStats: { wins: 0, losses: 0, ratio: 0 },
      activeDuelingEnabled: true,
      accredited: role === "JOURNALIST" ? false : true
    });

    if (typeof window !== "undefined") {
      localStorage.setItem("komentel_user_session", JSON.stringify({ email: cleanEmail }));
    }

    try {
      await supabase.from("registered_users").insert({
        email: cleanEmail,
        name: cleanName,
        role,
        password: cleanPassword,
        duels_wins: 0,
        duels_losses: 0,
        duels_ratio: 0,
        accredited: role === "JOURNALIST" ? false : true,
        interests: JSON.stringify([])
      });
    } catch (e) {
      console.error(e);
    }
  };

  const loginUser = async (email: string, password?: string): Promise<boolean> => {
    let found = registeredUsers.find(
      u => u.email.toLowerCase() === email.toLowerCase() && 
      (u.password === password || (!u.password && password === "password123"))
    );

    if (!found) {
      try {
        const { data, error } = await supabase
          .from("registered_users")
          .select("*")
          .eq("email", email.toLowerCase())
          .single();

        if (!error && data) {
          const u = data;
          const formattedUser = {
            name: u.name,
            email: u.email,
            role: u.role,
            interests: typeof u.interests === "string" ? JSON.parse(u.interests) : u.interests,
            pressCard: u.press_card,
            media: u.media,
            bio: u.bio,
            photoUrl: u.photo_url,
            accredited: u.accredited,
            password: u.password,
            duelsStats: { wins: u.duels_wins, losses: u.duels_losses, ratio: u.duels_ratio }
          };
          
          setRegisteredUsers(prev => {
            if (prev.some(x => x.email.toLowerCase() === u.email.toLowerCase())) return prev;
            return [...prev, formattedUser];
          });

          if (u.password === password || (!u.password && password === "password123")) {
            found = formattedUser;
          }
        }
      } catch (err) {
        console.error("Direct login fetch failed:", err);
      }
    }

    if (found) {
      setUser({
        name: found.name,
        email: found.email,
        role: found.role,
        duelsStats: found.duelsStats,
        activeDuelingEnabled: true,
        interests: found.interests,
        pressCard: found.pressCard,
        media: found.media,
        bio: found.bio,
        photoUrl: found.photoUrl,
        accredited: found.accredited === undefined ? (found.role === "JOURNALIST" ? false : true) : found.accredited
      });

      if (typeof window !== "undefined") {
        localStorage.setItem("komentel_user_session", JSON.stringify({ email: found.email }));
      }
      return true;
    }
    return false;
  };

  const logoutUser = () => {
    setUser(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem("komentel_user_session");
    }
  };

  const completeOnboarding = async (details: { interests?: string[]; pressCard?: string; media?: string; bio?: string; photoUrl?: string }) => {
    if (!user) return;
    const userEmail = user.email.toLowerCase();
    
    const cleanDetails = {
      ...details,
      pressCard: details.pressCard ? sanitizeHTML(details.pressCard) : undefined,
      media: details.media ? sanitizeHTML(details.media) : undefined,
      bio: details.bio ? sanitizeHTML(details.bio) : undefined,
      photoUrl: details.photoUrl ? sanitizeUrl(details.photoUrl) : undefined,
    };

    setUser(prev => {
      if (!prev) return null;
      return { ...prev, ...cleanDetails };
    });
    
    setRegisteredUsers(prev => prev.map(u => {
      if (u.email.toLowerCase() === userEmail) {
        return { ...u, ...cleanDetails };
      }
      return u;
    }));

    try {
      await supabase
        .from("registered_users")
        .update({
          press_card: cleanDetails.pressCard,
          media: cleanDetails.media,
          bio: cleanDetails.bio,
          photo_url: cleanDetails.photoUrl,
          interests: cleanDetails.interests ? JSON.stringify(cleanDetails.interests) : undefined
        })
        .eq("email", userEmail);
    } catch (e) {
      console.error(e);
    }
  };

  const accreditJournalist = async (email: string) => {
    const targetEmail = email.toLowerCase();
    setRegisteredUsers(prev => prev.map(u => {
      if (u.email.toLowerCase() === targetEmail) {
        return { ...u, accredited: true };
      }
      return u;
    }));
    setUser(prev => {
      if (prev && prev.email.toLowerCase() === targetEmail) {
        return { ...prev, accredited: true };
      }
      return prev;
    });

    try {
      await supabase
        .from("registered_users")
        .update({ accredited: true })
        .eq("email", targetEmail);
    } catch (e) {
      console.error(e);
    }
  };

  // Search filter query state
  const [searchQuery, setSearchQuery] = useState("");

  // 2. Initial Articles
  const [articles, setArticles] = useState<Article[]>([
    {
      id: "reforme-education",
      title: "Réforme de l'éducation : Quels impacts pour la rentrée ?",
      titleEn: "Education reform: What impacts for the start of the school year?",
      category: "Éducation",
      continent: "Afrique",
      categoryEn: "Education",
      sourceName: "Amadou Diallo",
      sourceVerified: true,
      publishedAt: "19 Juin 2026",
      readTime: "5 min read",
      views: 12400,
      summary: "Le ministère de l'Éducation a dévoilé le calendrier de la réforme des programmes, suscitant des réactions passionnées parmi les syndicats d'enseignants et les parents d'élèves.",
      summaryEn: "The Ministry of Education has unveiled the schedule for the curriculum reform, sparking passionate reactions among teacher unions and parents.",
      content: [
        "La rentrée scolaire 2026 s'annonce sous le signe du changement. Le Ministère de l'Éducation nationale a annoncé une refonte substantielle des programmes scolaires, mettant l'accent sur les compétences numériques, l'enseignement renforcé des sciences, et l'introduction de modules de citoyenneté locale dès l'école primaire.",
        "Si l'administration défend une 'modernisation devenue indispensable pour aligner le système sénégalais sur les standards globaux', les syndicats d'enseignants expriment de vives inquiétudes quant à la préparation logistique et la formation des maîtres sur ces nouveaux supports.",
        "Les parents d'élèves, de leur côté, sont partagés entre l'approbation d'un enseignement plus connecté et la crainte de coûts supplémentaires liés aux nouveaux manuels requis.",
        "Le calendrier des réformes prévoit un déploiement progressif, débutant par le cycle fondamental à la rentrée d'octobre."
      ],
      contentEn: [
        "The 2026 school year starts under the sign of change. The Ministry of National Education has announced a substantial overhaul of school curricula, focusing on digital skills, reinforced science education, and the introduction of local citizenship modules starting in primary school.",
        "While the administration defends a 'modernization that has become essential to align the Senegalese system with global standards', teacher unions express deep concerns regarding logistics preparation and teacher training on these new materials.",
        "Parents, for their part, are divided between approving a more connected education and fearing additional costs related to the new required textbooks.",
        "The reform schedule plans a gradual deployment, starting with the primary cycle in the October school start."
      ],
      imageUrl: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&q=80&w=800",
      corrections: [
        {
          date: "19 Juin 2026 à 10:30",
          text: "Ajout des précisions du Ministère de l'Éducation nationale sur le calendrier des examens et le coût des manuels scolaires subventionnés."
        }
      ],
      commentsCount: 3,
      commentsDisabled: false,
      reactions: { like: 245, love: 112, bravo: 68, surprise: 14, sad: 2, important: 189 },
      userReaction: null
    },
    {
      id: "sommet-climat",
      title: "Sommet Mondial sur le Climat : Les nouveaux engagements pour 2030",
      titleEn: "Global Climate Summit: New commitments for 2030",
      category: "International",
      continent: "Europe",
      categoryEn: "International",
      sourceName: "Agence France-Presse",
      sourceVerified: true,
      publishedAt: "19 Juin 2026",
      readTime: "4 min read",
      views: 8500,
      summary: "Les dirigeants mondiaux ont conclu un accord visant à accélérer les réductions d'émissions de carbone d'ici la fin de la décennie.",
      summaryEn: "World leaders concluded an agreement aimed at accelerating carbon emission reductions by the end of the decade.",
      content: [
        "Réunis à Genève, les délégués de plus de 190 pays ont entériné une déclaration finale commune renforçant les objectifs de neutralité carbone.",
        "Le pacte prévoit des mécanismes de financement accrus pour les pays en développement, notamment en Afrique de l'Ouest, pour soutenir l'adaptation et les énergies renouvelables."
      ],
      contentEn: [
        "Meeting in Geneva, delegates from more than 190 countries endorsed a joint final declaration strengthening carbon neutrality targets.",
        "The pact provides increased funding mechanisms for developing countries, particularly in West Africa, to support adaptation and renewable energies."
      ],
      imageUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=800",
      corrections: [],
      commentsCount: 1,
      commentsDisabled: false,
      reactions: { like: 92, love: 48, bravo: 12, surprise: 3, sad: 1, important: 40 },
      userReaction: null
    },
    {
      id: "batteries-solides",
      title: "La Révolution des Batteries Solides : L'Automobile de Demain",
      titleEn: "The Solid-State Battery Revolution: Tomorrow's Automobile",
      category: "Technologie",
      continent: "Monde",
      categoryEn: "Tech",
      sourceName: "Tech Review",
      sourceVerified: true,
      publishedAt: "18 Juin 2026",
      readTime: "6 min read",
      views: 9200,
      summary: "Une percée technologique promet de doubler l'autonomie des véhicules électriques tout en réduisant le temps de charge.",
      summaryEn: "A technological breakthrough promises to double the range of electric vehicles while reducing charging times.",
      content: [
        "Plusieurs laboratoires ont annoncé la validation de prototypes de batteries à électrolyte solide stables, résolvant les problèmes de dégradation précoce.",
        "Cette technologie pourrait débarquer sur les modèles commerciaux d'ici 2028, modifiant en profondeur le marché de la mobilité électrique."
      ],
      contentEn: [
        "Several laboratories have announced the validation of stable solid-electrolyte battery prototypes, solving early degradation issues.",
        "This technology could hit commercial models by 2028, deeply changing the electric mobility market."
      ],
      imageUrl: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&q=80&w=800",
      corrections: [],
      commentsCount: 1,
      commentsDisabled: false,
      reactions: { like: 115, love: 22, bravo: 34, surprise: 28, sad: 0, important: 56 },
      userReaction: null
    }
  ]);

  // 3. Initial Comments
  const [comments, setComments] = useState<Comment[]>([
    {
      id: "comment-1",
      articleId: "reforme-education",
      parentId: null,
      author: "Fatou Sow",
      authorBadge: "Contributeur actif",
      content: "Je comprends l'intention de moderniser, mais la réalité du terrain au Sénégal montre que beaucoup d'écoles dans les régions manquent encore de tableaux, d'électricité et de manuels scolaires de base. Mettre le numérique au premier plan sans régler ces besoins primaires est illusoire.",
      createdAt: "Il y a 3h",
      likes: 42,
      dislikes: 5,
      reported: false
    },
    {
      id: "comment-2",
      articleId: "reforme-education",
      parentId: "comment-1",
      author: "Babacar Diagne",
      authorBadge: null,
      content: "Tout à fait d'accord. Commençons d'abord par les infrastructures de base avant de parler de tablettes ou de codage informatique à l'école primaire.",
      createdAt: "Il y a 2h",
      likes: 15,
      dislikes: 2,
      reported: false
    },
    {
      id: "comment-3",
      articleId: "reforme-education",
      parentId: null,
      author: "Modou Ndiaye",
      authorBadge: null,
      content: "Il faut bien commencer quelque part. Le monde avance et nos enfants ne peuvent pas attendre que tout soit parfait pour apprendre le numérique. Cette réforme est une opportunité.",
      createdAt: "Il y a 1h",
      likes: 28,
      dislikes: 12,
      reported: false
    },
    {
      id: "comment-wrestling-1",
      articleId: "l-1",
      parentId: null,
      author: "Lamine",
      authorBadge: "Contributeur actif",
      content: "Modou Lô est très serein pour ce combat. Sa préparation physique aux USA va faire la différence !",
      createdAt: "Il y a 10 min",
      likes: 8,
      dislikes: 1,
      reported: false
    },
    {
      id: "comment-wrestling-2",
      articleId: "l-1",
      parentId: null,
      author: "Gorgui",
      authorBadge: null,
      content: "Balla Gaye 2 a le Lion en lui, il a déjà terrassé Modou Lô par le passé. Ne l'enterrez pas trop vite !",
      createdAt: "Il y a 5 min",
      likes: 12,
      dislikes: 3,
      reported: false
    },
    {
      id: "comment-basketball-1",
      articleId: "b-1",
      parentId: null,
      author: "Malick",
      authorBadge: null,
      content: "DUC est très fort à 3 points aujourd'hui, mais la défense de l'AS Douanes va se réveiller au dernier quart-temps.",
      createdAt: "Il y a 15 min",
      likes: 5,
      dislikes: 2,
      reported: false
    }
  ]);

  // 4. Initial Duels
  const [duels, setDuels] = useState<Duel[]>([
    {
      id: "duel-1",
      articleId: "reforme-education",
      articleTitle: "Réforme de l'éducation : Quels impacts pour la rentrée ?",
      commentId: "comment-1",
      challenger: "Moussa Diop",
      challengerStats: { wins: 12, losses: 4, ratio: 75 },
      defender: "Fatou Sow",
      defenderStats: { wins: 8, losses: 3, ratio: 72 },
      status: "ACTIVE",
      roundLimit: 4,
      currentRound: 2,
      currentTurn: "CHALLENGER",
      rounds: [
        {
          turn: 1,
          challengerReply: "Le numérique n'est pas incompatible avec les infrastructures physiques. Nous pouvons former les élèves aux compétences de demain tout en construisant des salles. La réforme prévoit des budgets d'accompagnement spécifiques pour les écoles défavorisées.",
          defenderReply: "C'est une vision théorique. Les budgets alloués à l'éducation sont souvent mal répartis. Introduire des manuels numériques quand on n'a pas de toiture étanche est un non-sens budgétaire. Commençons par le toit, le numérique suivra.",
          challengerLikes: 140,
          challengerDislikes: 45,
          defenderLikes: 195,
          defenderDislikes: 25
        },
        {
          turn: 2,
          challengerReply: null,
          defenderReply: null,
          challengerLikes: 0,
          challengerDislikes: 0,
          defenderLikes: 0,
          defenderDislikes: 0
        }
      ],
      closesAt: "Dans 14 heures",
      winner: null
    }
  ]);

  // 5. Initial Poll
  const [poll, setPoll] = useState<Poll>({
    question: "Soutenez votre pays pour la Coupe du Monde 2026 !",
    questionEn: "Support your country for the 2026 World Cup!",
    options: [
      { nameFr: "Canada", nameEn: "Canada", flag: "🇨🇦", continentFr: "Amériques", continentEn: "Americas", bestResultFr: "Phase de groupes (1986, 2022)", bestResultEn: "Group stage (1986, 2022)", votes: 0, label: "Canada 🇨🇦", labelEn: "Canada 🇨🇦" },
      { nameFr: "Mexique", nameEn: "Mexico", flag: "🇲🇽", continentFr: "Amériques", continentEn: "Americas", bestResultFr: "Quart de finale (1970, 1986)", bestResultEn: "Quarter-finals (1970, 1986)", votes: 0, label: "Mexique 🇲🇽", labelEn: "Mexico 🇲🇽" },
      { nameFr: "États-Unis", nameEn: "United States", flag: "🇺🇸", continentFr: "Amériques", continentEn: "Americas", bestResultFr: "Demi-finale (1930)", bestResultEn: "Semi-finals (1930)", votes: 0, label: "États-Unis 🇺🇸", labelEn: "United States 🇺🇸" },
      { nameFr: "Australie", nameEn: "Australia", flag: "🇦🇺", continentFr: "Asie-Pacifique", continentEn: "Asia-Pacific", bestResultFr: "Huitième de finale (2006, 2022)", bestResultEn: "Round of 16 (2006, 2022)", votes: 0, label: "Australie 🇦🇺", labelEn: "Australia 🇦🇺" },
      { nameFr: "Irak", nameEn: "Iraq", flag: "🇮🇶", continentFr: "Moyen-Orient", continentEn: "Middle East", bestResultFr: "Phase de groupes (1986)", bestResultEn: "Group stage (1986)", votes: 0, label: "Irak 🇮🇶", labelEn: "Iraq 🇮🇶" },
      { nameFr: "Iran", nameEn: "IR Iran", flag: "🇮🇷", continentFr: "Moyen-Orient", continentEn: "Middle East", bestResultFr: "Phase de groupes (6 fois)", bestResultEn: "Group stage (6 times)", votes: 0, label: "Iran 🇮🇷", labelEn: "IR Iran 🇮🇷" },
      { nameFr: "Japon", nameEn: "Japan", flag: "🇯🇵", continentFr: "Asie-Pacifique", continentEn: "Asia-Pacific", bestResultFr: "Huitième de finale (4 fois)", bestResultEn: "Round of 16 (4 times)", votes: 0, label: "Japon 🇯🇵", labelEn: "Japan 🇯🇵" },
      { nameFr: "Jordanie", nameEn: "Jordan", flag: "🇯🇴", continentFr: "Moyen-Orient", continentEn: "Middle East", bestResultFr: "Première participation", bestResultEn: "First appearance", votes: 0, label: "Jordanie 🇯🇴", labelEn: "Jordan 🇯🇴" },
      { nameFr: "Corée du Sud", nameEn: "Korea Republic", flag: "🇰🇷", continentFr: "Asie-Pacifique", continentEn: "Asia-Pacific", bestResultFr: "Quatrième (2002)", bestResultEn: "Fourth place (2002)", votes: 0, label: "Corée du Sud 🇰🇷", labelEn: "Korea Republic 🇰🇷" },
      { nameFr: "Qatar", nameEn: "Qatar", flag: "🇶🇦", continentFr: "Moyen-Orient", continentEn: "Middle East", bestResultFr: "Phase de groupes (2022)", bestResultEn: "Group stage (2022)", votes: 0, label: "Qatar 🇶🇦", labelEn: "Qatar 🇶🇦" },
      { nameFr: "Arabie saoudite", nameEn: "Saudi Arabia", flag: "🇸🇦", continentFr: "Moyen-Orient", continentEn: "Middle East", bestResultFr: "Huitième de finale (1994)", bestResultEn: "Round of 16 (1994)", votes: 0, label: "Arabie saoudite 🇸🇦", labelEn: "Saudi Arabia 🇸🇦" },
      { nameFr: "Ouzbékistan", nameEn: "Uzbekistan", flag: "🇺🇿", continentFr: "Asie-Pacifique", continentEn: "Asia-Pacific", bestResultFr: "Première participation", bestResultEn: "First appearance", votes: 0, label: "Ouzbékistan 🇺🇿", labelEn: "Uzbekistan 🇺🇿" },
      { nameFr: "Algérie", nameEn: "Algeria", flag: "🇩🇿", continentFr: "Afrique", continentEn: "Africa", bestResultFr: "Huitième de finale (2014)", bestResultEn: "Round of 16 (2014)", votes: 0, label: "Algérie 🇩🇿", labelEn: "Algeria 🇩🇿" },
      { nameFr: "Cap-Vert", nameEn: "Cabo Verde", flag: "🇨🇻", continentFr: "Afrique", continentEn: "Africa", bestResultFr: "Première participation", bestResultEn: "First appearance", votes: 0, label: "Cap-Vert 🇨🇻", labelEn: "Cabo Verde 🇨🇻" },
      { nameFr: "RD Congo", nameEn: "DR Congo", flag: "🇨🇩", continentFr: "Afrique", continentEn: "Africa", bestResultFr: "Phase de groupes (1974)", bestResultEn: "Group stage (1974)", votes: 0, label: "RD Congo 🇨🇩", labelEn: "DR Congo 🇨🇩" },
      { nameFr: "Côte d'Ivoire", nameEn: "Ivory Coast", flag: "🇨🇮", continentFr: "Afrique", continentEn: "Africa", bestResultFr: "Phase de groupes (3 fois)", bestResultEn: "Group stage (3 times)", votes: 0, label: "Côte d'Ivoire 🇨🇮", labelEn: "Ivory Coast 🇨🇮" },
      { nameFr: "Égypte", nameEn: "Egypt", flag: "🇪🇬", continentFr: "Afrique", continentEn: "Africa", bestResultFr: "Phase de groupes (3 fois)", bestResultEn: "Group stage (3 times)", votes: 0, label: "Égypte 🇪🇬", labelEn: "Egypt 🇪🇬" },
      { nameFr: "Ghana", nameEn: "Ghana", flag: "🇬🇭", continentFr: "Afrique", continentEn: "Africa", bestResultFr: "Quart de finale (2010)", bestResultEn: "Quarter-finals (2010)", votes: 0, label: "Ghana 🇬🇭", labelEn: "Ghana 🇬🇭" },
      { nameFr: "Maroc", nameEn: "Morocco", flag: "🇲🇦", continentFr: "Afrique", continentEn: "Africa", bestResultFr: "Demi-finale (2022)", bestResultEn: "Semi-finals (2022)", votes: 0, label: "Maroc 🇲🇦", labelEn: "Morocco 🇲🇦" },
      { nameFr: "Sénégal", nameEn: "Senegal", flag: "🇸🇳", continentFr: "Afrique", continentEn: "Africa", bestResultFr: "Quart de finale (2002)", bestResultEn: "Quarter-finals (2002)", votes: 0, label: "Sénégal (Lions de la Téranga) 🇸🇳", labelEn: "Senegal (Teranga Lions) 🇸🇳" },
      { nameFr: "Afrique du Sud", nameEn: "South Africa", flag: "🇿🇦", continentFr: "Afrique", continentEn: "Africa", bestResultFr: "Phase de groupes (3 fois)", bestResultEn: "Group stage (3 times)", votes: 0, label: "Afrique du Sud 🇿🇦", labelEn: "South Africa 🇿🇦" },
      { nameFr: "Tunisie", nameEn: "Tunisia", flag: "🇹🇳", continentFr: "Afrique", continentEn: "Africa", bestResultFr: "Phase de groupes (6 fois)", bestResultEn: "Group stage (6 times)", votes: 0, label: "Tunisie 🇹🇳", labelEn: "Tunisia 🇹🇳" },
      { nameFr: "Curaçao", nameEn: "Curaçao", flag: "🇨🇼", continentFr: "Amériques", continentEn: "Americas", bestResultFr: "Première participation", bestResultEn: "First appearance", votes: 0, label: "Curaçao 🇨🇼", labelEn: "Curaçao 🇨🇼" },
      { nameFr: "Haïti", nameEn: "Haiti", flag: "🇭🇹", continentFr: "Amériques", continentEn: "Americas", bestResultFr: "Phase de groupes (1974)", bestResultEn: "Group stage (1974)", votes: 0, label: "Haïti 🇭🇹", labelEn: "Haiti 🇭🇹" },
      { nameFr: "Panama", nameEn: "Panama", flag: "🇵🇦", continentFr: "Amériques", continentEn: "Americas", bestResultFr: "Phase de groupes (2018)", bestResultEn: "Group stage (2018)", votes: 0, label: "Panama 🇵🇦", labelEn: "Panama 🇵🇦" },
      { nameFr: "Argentine", nameEn: "Argentina", flag: "🇦🇷", continentFr: "Amériques", continentEn: "Americas", bestResultFr: "Vainqueur (1978, 1986, 2022)", bestResultEn: "Winner (1978, 1986, 2022)", votes: 0, label: "Argentine (Albiceleste) 🇦🇷", labelEn: "Argentina (Albiceleste) 🇦🇷" },
      { nameFr: "Brésil", nameEn: "Brazil", flag: "🇧🇷", continentFr: "Amériques", continentEn: "Americas", bestResultFr: "Vainqueur (5 fois)", bestResultEn: "Winner (5 times)", votes: 0, label: "Brésil (Auriverde) 🇧🇷", labelEn: "Brazil (Auriverde) 🇧🇷" },
      { nameFr: "Colombie", nameEn: "Colombia", flag: "🇨🇴", continentFr: "Amériques", continentEn: "Americas", bestResultFr: "Quart de finale (2014)", bestResultEn: "Quarter-finals (2014)", votes: 0, label: "Colombie 🇨🇴", labelEn: "Colombia 🇨🇴" },
      { nameFr: "Équateur", nameEn: "Ecuador", flag: "🇪🇨", continentFr: "Amériques", continentEn: "Americas", bestResultFr: "Huitième de finale (2006)", bestResultEn: "Round of 16 (2006)", votes: 0, label: "Équateur 🇪🇨", labelEn: "Ecuador 🇪🇨" },
      { nameFr: "Paraguay", nameEn: "Paraguay", flag: "🇵🇾", continentFr: "Amériques", continentEn: "Americas", bestResultFr: "Quart de finale (2010)", bestResultEn: "Quarter-finals (2010)", votes: 0, label: "Paraguay 🇵🇾", labelEn: "Paraguay 🇵🇾" },
      { nameFr: "Uruguay", nameEn: "Uruguay", flag: "🇺🇾", continentFr: "Amériques", continentEn: "Americas", bestResultFr: "Vainqueur (1930, 1950)", bestResultEn: "Winner (1930, 1950)", votes: 0, label: "Uruguay 🇺🇾", labelEn: "Uruguay 🇺🇾" },
      { nameFr: "Nouvelle-Zélande", nameEn: "New Zealand", flag: "🇳🇿", continentFr: "Asie-Pacifique", continentEn: "Asia-Pacific", bestResultFr: "Phase de groupes (1982, 2010)", bestResultEn: "Group stage (1982, 2010)", votes: 0, label: "Nouvelle-Zélande 🇳🇿", labelEn: "New Zealand 🇳🇿" },
      { nameFr: "Autriche", nameEn: "Austria", flag: "🇦🇹", continentFr: "Europe", continentEn: "Europe", bestResultFr: "Troisième (1954)", bestResultEn: "Third place (1954)", votes: 0, label: "Autriche 🇦🇹", labelEn: "Austria 🇦🇹" },
      { nameFr: "Belgique", nameEn: "Belgium", flag: "🇧🇪", continentFr: "Europe", continentEn: "Europe", bestResultFr: "Troisième (2018)", bestResultEn: "Third place (2018)", votes: 0, label: "Belgique 🇧🇪", labelEn: "Belgium 🇧🇪" },
      { nameFr: "Bosnie-Herzégovine", nameEn: "Bosnia and Herzegovina", flag: "🇧🇦", continentFr: "Europe", continentEn: "Europe", bestResultFr: "Phase de groupes (2014)", bestResultEn: "Group stage (2014)", votes: 0, label: "Bosnie-Herzégovine 🇧🇦", labelEn: "Bosnia and Herzegovina 🇧🇦" },
      { nameFr: "Croatie", nameEn: "Croatia", flag: "🇭🇷", continentFr: "Europe", continentEn: "Europe", bestResultFr: "Finaliste (2018)", bestResultEn: "Runner-up (2018)", votes: 0, label: "Croatie 🇭🇷", labelEn: "Croatia 🇭🇷" },
      { nameFr: "Tchéquie", nameEn: "Czechia", flag: "🇨🇿", continentFr: "Europe", continentEn: "Europe", bestResultFr: "Finaliste (1934, 1962 - Tchécoslovaquie)", bestResultEn: "Runner-up (1934, 1962 - Czechoslovakia)", votes: 0, label: "Tchéquie 🇨🇿", labelEn: "Czechia 🇨🇿" },
      { nameFr: "Angleterre", nameEn: "England", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", continentFr: "Europe", continentEn: "Europe", bestResultFr: "Vainqueur (1966)", bestResultEn: "Winner (1966)", votes: 0, label: "Angleterre 🏴󠁧󠁢󠁥󠁮󠁧󠁿", labelEn: "England 🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
      { nameFr: "France", nameEn: "France", flag: "🇫🇷", continentFr: "Europe", continentEn: "Europe", bestResultFr: "Vainqueur (1998, 2018)", bestResultEn: "Winner (1998, 2018)", votes: 0, label: "France (Les Bleus) 🇫🇷", labelEn: "France (Les Bleus) 🇫🇷" },
      { nameFr: "Allemagne", nameEn: "Germany", flag: "🇩🇪", continentFr: "Europe", continentEn: "Europe", bestResultFr: "Vainqueur (4 fois)", bestResultEn: "Winner (4 times)", votes: 0, label: "Allemagne 🇩🇪", labelEn: "Germany 🇩🇪" },
      { nameFr: "Pays-Bas", nameEn: "Netherlands", flag: "🇳🇱", continentFr: "Europe", continentEn: "Europe", bestResultFr: "Finaliste (3 fois)", bestResultEn: "Runner-up (3 times)", votes: 0, label: "Pays-Bas 🇳🇱", labelEn: "Netherlands 🇳🇱" },
      { nameFr: "Norvège", nameEn: "Norway", flag: "🇳🇴", continentFr: "Europe", continentEn: "Europe", bestResultFr: "Huitième de finale (1998)", bestResultEn: "Round of 16 (1998)", votes: 0, label: "Norvège 🇳🇴", labelEn: "Norway 🇳🇴" },
      { nameFr: "Portugal", nameEn: "Portugal", flag: "🇵🇹", continentFr: "Europe", continentEn: "Europe", bestResultFr: "Troisième (1966)", bestResultEn: "Third place (1966)", votes: 0, label: "Portugal 🇵🇹", labelEn: "Portugal 🇵🇹" },
      { nameFr: "Écosse", nameEn: "Scotland", flag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿", continentFr: "Europe", continentEn: "Europe", bestResultFr: "Phase de groupes (8 fois)", bestResultEn: "Group stage (8 times)", votes: 0, label: "Écosse 🏴󠁧󠁢󠁳󠁣󠁴󠁿", labelEn: "Scotland 🏴󠁧󠁢󠁳󠁣󠁴󠁿" },
      { nameFr: "Espagne", nameEn: "Spain", flag: "🇪🇸", continentFr: "Europe", continentEn: "Europe", bestResultFr: "Vainqueur (2010)", bestResultEn: "Winner (2010)", votes: 0, label: "Espagne 🇪🇸", labelEn: "Spain 🇪🇸" },
      { nameFr: "Suède", nameEn: "Sweden", flag: "🇸🇪", continentFr: "Europe", continentEn: "Europe", bestResultFr: "Finaliste (1958)", bestResultEn: "Runner-up (1958)", votes: 0, label: "Suède 🇸🇪", labelEn: "Sweden 🇸🇪" },
      { nameFr: "Suisse", nameEn: "Switzerland", flag: "🇨🇭", continentFr: "Europe", continentEn: "Europe", bestResultFr: "Quart de finale (3 fois)", bestResultEn: "Quarter-finals (3 times)", votes: 0, label: "Suisse 🇨🇭", labelEn: "Switzerland 🇨🇭" },
      { nameFr: "Turquie", nameEn: "Türkiye", flag: "🇹🇷", continentFr: "Europe", continentEn: "Europe", bestResultFr: "Troisième (2002)", bestResultEn: "Third place (2002)", votes: 0, label: "Turquie 🇹🇷", labelEn: "Türkiye 🇹🇷" }
    ],
    votedOptionIndex: null
  });

  // 6. Initial Notifications
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const loadFullstackData = async () => {
      try {
        // Fetch article corrections
        const { data: correctionsData, error: correctionsErr } = await supabase
          .from("article_corrections")
          .select("*");
        
        // Fetch articles
        const { data: articlesData, error: articlesErr } = await supabase
          .from("articles")
          .select("*")
          .order("published_at", { ascending: false });
        
        if (!articlesErr && articlesData) {
          const formatted = articlesData.map((art: any) => {
            const artCorrections = (correctionsData || [])
              .filter((c: any) => c.article_id === art.id)
              .map((c: any) => ({ date: c.date, text: c.text }));
            return {
              id: art.id,
              title: art.title,
              titleEn: art.title_en,
              category: art.category,
              categoryEn: art.category_en,
              sourceName: art.source_name,
              sourceVerified: art.source_verified,
              publishedAt: art.published_at,
              readTime: art.read_time,
              views: art.views,
              summary: art.summary,
              summaryEn: art.summary_en,
              content: typeof art.content === "string" ? JSON.parse(art.content) : art.content,
              contentEn: typeof art.content_en === "string" ? JSON.parse(art.content_en) : art.content_en,
              imageUrl: art.image_url,
              additionalImages: typeof art.additional_images === "string" ? JSON.parse(art.additional_images) : art.additional_images,
              videoUrl: art.video_url,
              commentsCount: art.comments_count,
              commentsDisabled: art.comments_disabled,
              reactions: typeof art.reactions === "string" ? JSON.parse(art.reactions) : art.reactions,
              userReaction: art.user_reaction,
              continent: art.continent,
              corrections: artCorrections
            };
          });
          setArticles(formatted);
        }

        // Fetch registered users
        const { data: usersData, error: usersErr } = await supabase
          .from("registered_users")
          .select("*");
        if (!usersErr && usersData) {
          const formattedUsers = usersData.map((u: any) => ({
            name: u.name,
            email: u.email,
            role: u.role,
            interests: typeof u.interests === "string" ? JSON.parse(u.interests) : u.interests,
            pressCard: u.press_card,
            media: u.media,
            bio: u.bio,
            photoUrl: u.photo_url,
            accredited: u.accredited,
            password: u.password,
            duelsStats: { wins: u.duels_wins, losses: u.duels_losses, ratio: u.duels_ratio }
          }));
          setRegisteredUsers(formattedUsers);

          // Restore user session
          if (typeof window !== "undefined") {
            const savedSession = localStorage.getItem("komentel_user_session");
            let found = null;
            if (savedSession) {
              try {
                const parsed = JSON.parse(savedSession);
                found = formattedUsers.find((u: any) => u.email.toLowerCase() === parsed.email.toLowerCase());
              } catch (e) {
                console.error(e);
              }
            }
            
            // If no session exists, default to our admin user session
            if (!found) {
              found = formattedUsers.find((u: any) => u.email.toLowerCase() === "jtech221plus@gmail.com");
              if (found) {
                localStorage.setItem("komentel_user_session", JSON.stringify({ email: "jtech221plus@gmail.com" }));
              }
            }
            
            if (found) {
              setUser({
                name: found.name,
                email: found.email,
                role: found.role,
                duelsStats: found.duelsStats,
                activeDuelingEnabled: true,
                interests: found.interests,
                pressCard: found.pressCard,
                media: found.media,
                bio: found.bio,
                photoUrl: found.photoUrl,
                accredited: found.accredited
              });
            }
          }
        }

        // Fetch comments
        const { data: commentsData, error: commentsErr } = await supabase
          .from("comments")
          .select("*");
        if (!commentsErr && commentsData) {
          const formattedComments = commentsData.map((c: any) => ({
            id: c.id,
            articleId: c.article_id,
            parentId: c.parent_id,
            author: c.author,
            authorBadge: c.author_badge,
            content: c.content,
            createdAt: c.created_at,
            likes: c.likes,
            dislikes: c.dislikes,
            reported: c.reported
          }));
          setComments(formattedComments);
        }

        // Fetch duels
        const { data: duelsData, error: duelsErr } = await supabase
          .from("duels")
          .select("*");
        if (!duelsErr && duelsData) {
          const formattedDuels = duelsData.map((d: any) => ({
            id: d.id,
            articleId: d.article_id,
            articleTitle: d.article_title,
            commentId: d.comment_id,
            challenger: d.challenger,
            challengerStats: typeof d.challenger_stats === "string" ? JSON.parse(d.challenger_stats) : d.challenger_stats,
            defender: d.defender,
            defenderStats: typeof d.defender_stats === "string" ? JSON.parse(d.defender_stats) : d.defender_stats,
            status: d.status,
            roundLimit: d.round_limit,
            currentRound: d.current_round,
            currentTurn: d.current_turn,
            rounds: typeof d.rounds === "string" ? JSON.parse(d.rounds) : d.rounds,
            closesAt: d.closes_at,
            winner: d.winner
          }));
          setDuels(formattedDuels);
        }

        // Fetch notifications
        const { data: notificationsData, error: notificationsErr } = await supabase
          .from("notifications")
          .select("*")
          .order("id", { ascending: false });
        if (!notificationsErr && notificationsData) {
          const formattedNotifs = notificationsData.map((n: any) => ({
            id: n.id,
            text: n.text,
            link: n.link,
            read: n.read,
            type: n.type,
            category: n.category
          }));
          setNotifications(formattedNotifs);
        }

        // Fetch poll
        const { data: pollData, error: pollErr } = await supabase
          .from("polls")
          .select("*")
          .eq("id", "world-cup-poll")
          .single();
        if (!pollErr && pollData) {
          const parsedOptions = typeof pollData.options === "string" ? JSON.parse(pollData.options) : pollData.options;
          setPoll(prev => {
            let savedVote: number | null = null;
            if (typeof window !== "undefined") {
              const savedVal = localStorage.getItem("votedOptionIndex");
              if (savedVal !== null) {
                savedVote = parseInt(savedVal);
              }
              const savedTime = localStorage.getItem("votedAt");
              if (savedTime !== null) {
                setVotedAt(parseInt(savedTime));
              }
            }
            return {
              question: pollData.question,
              questionEn: pollData.question_en,
              options: parsedOptions,
              votedOptionIndex: savedVote
            };
          });
        }
      } catch (err) {
        console.error("Failed to load fullstack data from Supabase:", err);
      }
    };

    loadFullstackData();
  }, []);

  // Actions
  const votePoll = async (optionIndex: number) => {
    let updatedOptions: PollOption[] | undefined;
    const now = Date.now();

    setPoll(prev => {
      if (prev.votedOptionIndex !== null) return prev; // Cannot vote twice
      const updated = [...prev.options];
      updated[optionIndex] = {
        ...updated[optionIndex],
        votes: (updated[optionIndex].votes || 0) + 1
      };
      
      if (typeof window !== "undefined") {
        localStorage.setItem("votedOptionIndex", String(optionIndex));
        localStorage.setItem("votedAt", String(now));
      }
      setVotedAt(now);

      updatedOptions = updated;
      return {
        ...prev,
        options: updated,
        votedOptionIndex: optionIndex
      };
    });

    if (updatedOptions) {
      try {
        await supabase
          .from("polls")
          .update({ options: JSON.stringify(updatedOptions) })
          .eq("id", "world-cup-poll");
      } catch (e) {
        console.error(e);
      }
    }
  };

  const changeVotePoll = async (oldIndex: number, newIndex: number) => {
    let updatedOptions: PollOption[] | undefined;
    const now = Date.now();

    setPoll(prev => {
      if (votedAt !== null && now - votedAt > 24 * 60 * 60 * 1000) {
        return prev; // Change window expired
      }

      const updated = [...prev.options];
      
      // Decrement old
      if (oldIndex >= 0 && oldIndex < updated.length) {
        updated[oldIndex] = {
          ...updated[oldIndex],
          votes: Math.max(0, (updated[oldIndex].votes || 0) - 1)
        };
      }

      // Increment new
      if (newIndex >= 0 && newIndex < updated.length) {
        updated[newIndex] = {
          ...updated[newIndex],
          votes: (updated[newIndex].votes || 0) + 1
        };
      }

      if (typeof window !== "undefined") {
        localStorage.setItem("votedOptionIndex", String(newIndex));
        localStorage.setItem("votedAt", String(now));
      }
      setVotedAt(now);

      updatedOptions = updated;
      return {
        ...prev,
        options: updated,
        votedOptionIndex: newIndex
      };
    });

    if (updatedOptions) {
      try {
        await supabase
          .from("polls")
          .update({ options: JSON.stringify(updatedOptions) })
          .eq("id", "world-cup-poll");
      } catch (e) {
        console.error(e);
      }
    }
  };

  const addComment = async (articleId: string, content: string, parentId: string | null = null, customAuthor?: string) => {
    const cleanContent = sanitizeHTML(content);
    const cleanAuthor = sanitizeHTML(user ? user.name : (customAuthor || "Visiteur"));
    const commentId = `comment-${Date.now()}`;
    const newComment: Comment = {
      id: commentId,
      articleId,
      parentId,
      author: cleanAuthor,
      authorBadge: user && user.role === "JOURNALIST" ? "Journaliste" : null,
      content: cleanContent,
      createdAt: "À l'instant",
      likes: 0,
      dislikes: 0,
      reported: false
    };

    setComments(prev => [...prev, newComment]);
    setArticles(prev => prev.map(art => art.id === articleId ? { ...art, commentsCount: art.commentsCount + 1 } : art));

    try {
      await supabase.from("comments").insert({
        id: commentId,
        article_id: articleId,
        parent_id: parentId,
        author: cleanAuthor,
        author_badge: user && user.role === "JOURNALIST" ? "Journaliste" : null,
        content: cleanContent,
        created_at: "À l'instant",
        likes: 0,
        dislikes: 0,
        reported: false
      });

      const foundArticle = articles.find(art => art.id === articleId);
      if (foundArticle) {
        await supabase
          .from("articles")
          .update({ comments_count: foundArticle.commentsCount + 1 })
          .eq("id", articleId);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const reportComment = async (commentId: string) => {
    setComments(prev => prev.map(c => c.id === commentId ? { ...c, reported: true } : c));
    try {
      await supabase.from("comments").update({ reported: true }).eq("id", commentId);
    } catch (e) {
      console.error(e);
    }
  };

  const likeComment = async (commentId: string) => {
    setComments(prev => prev.map(c => c.id === commentId ? { ...c, likes: c.likes + 1 } : c));
    try {
      const foundComment = comments.find(c => c.id === commentId);
      if (foundComment) {
        await supabase.from("comments").update({ likes: foundComment.likes + 1 }).eq("id", commentId);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const dislikeComment = async (commentId: string) => {
    setComments(prev => prev.map(c => c.id === commentId ? { ...c, dislikes: c.dislikes + 1 } : c));
    try {
      const foundComment = comments.find(c => c.id === commentId);
      if (foundComment) {
        await supabase.from("comments").update({ dislikes: foundComment.dislikes + 1 }).eq("id", commentId);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const challengeToDuel = async (articleId: string, commentId: string, opponentName: string, promptText?: string) => {
    if (!user) return;
    
    const cleanOpponent = sanitizeHTML(opponentName);
    const cleanPrompt = promptText ? sanitizeHTML(promptText) : undefined;

    let duelTitle = "Publication";
    let duelCategory: string | undefined = undefined;
    const foundArticle = articles.find(a => a.id === articleId);
    if (foundArticle) {
      duelTitle = foundArticle.title;
      duelCategory = foundArticle.category;
    } else {
      const foundMatch = matches.find(m => m.id === articleId);
      if (foundMatch) {
        duelTitle = `${foundMatch.homeTeam.name} vs ${foundMatch.awayTeam.name} (${foundMatch.sport === 'LUTTE' ? 'Lutte Sénégalaise' : foundMatch.sport === 'BASKETBALL' ? 'Basketball' : 'Football'})`;
        duelCategory = "Sport";
      }
    }

    const duelId = `duel-${Date.now()}`;
    const newDuel: Duel = {
      id: duelId,
      articleId,
      articleTitle: duelTitle,
      commentId,
      challenger: user.name,
      challengerStats: { ...user.duelsStats },
      defender: cleanOpponent,
      defenderStats: { wins: 5, losses: 2, ratio: 71 }, // Mock defender stats
      status: "PENDING",
      roundLimit: 4,
      currentRound: 1,
      currentTurn: "CHALLENGER",
      rounds: [
        {
          turn: 1,
          challengerReply: cleanPrompt || "Je conteste votre argument. Nous devons avancer avec notre époque...",
          defenderReply: null,
          challengerLikes: 0,
          challengerDislikes: 0,
          defenderLikes: 0,
          defenderDislikes: 0
        }
      ],
      closesAt: "Dans 48 heures",
      winner: null
    };

    setDuels(prev => [...prev, newDuel]);

    const notifId = `notif-${Date.now()}`;
    const newNotif = {
      id: notifId,
      text: `Votre défi de duel contre ${cleanOpponent} a été envoyé. En attente d'acceptation.`,
      link: `/duel/${newDuel.id}`,
      read: false,
      type: "DUEL_CHALLENGE" as const,
      category: duelCategory
    };

    setNotifications(prev => [newNotif, ...prev]);

    try {
      await supabase.from("duels").insert({
        id: duelId,
        article_id: articleId,
        article_title: duelTitle,
        comment_id: commentId,
        challenger: user.name,
        challenger_stats: JSON.stringify(user.duelsStats),
        defender: cleanOpponent,
        defender_stats: JSON.stringify({ wins: 5, losses: 2, ratio: 71 }),
        status: "PENDING",
        round_limit: 4,
        current_round: 1,
        current_turn: "CHALLENGER",
        rounds: JSON.stringify(newDuel.rounds),
        closes_at: "Dans 48 heures",
        winner: null
      });

      await supabase.from("notifications").insert({
        id: newNotif.id,
        text: newNotif.text,
        link: newNotif.link,
        read: newNotif.read,
        type: newNotif.type,
        category: newNotif.category,
        user_email: user.email
      });
    } catch (e) {
      console.error(e);
    }
  };

  const acceptDuel = async (duelId: string) => {
    setDuels(prev => prev.map(d => d.id === duelId ? { ...d, status: "ACTIVE" } : d));

    const foundDuel = duels.find(d => d.id === duelId);
    let duelCategory: string | undefined = undefined;
    if (foundDuel) {
      const foundArticle = articles.find(a => a.id === foundDuel.articleId);
      if (foundArticle) {
        duelCategory = foundArticle.category;
      } else {
        const foundMatch = matches.find(m => m.id === foundDuel.articleId);
        if (foundMatch) {
          duelCategory = "Sport";
        }
      }
    }

    const notifId = `notif-${Date.now()}`;
    const newNotif = {
      id: notifId,
      text: "Le duel est maintenant actif ! Vous pouvez répliquer.",
      link: `/duel/${duelId}`,
      read: false,
      type: "DUEL_ACCEPT" as const,
      category: duelCategory
    };

    setNotifications(prev => [newNotif, ...prev]);

    try {
      await supabase
        .from("duels")
        .update({ status: "ACTIVE" })
        .eq("id", duelId);

      await supabase.from("notifications").insert({
        id: newNotif.id,
        text: newNotif.text,
        link: newNotif.link,
        read: newNotif.read,
        type: newNotif.type,
        category: newNotif.category,
        user_email: user?.email
      });
    } catch (e) {
      console.error(e);
    }
  };

  const postDuelReply = async (duelId: string, text: string) => {
    const cleanText = sanitizeHTML(text);
    let updatedDuel: Duel | undefined;

    setDuels(prev => prev.map(d => {
      if (d.id !== duelId) return d;
      
      const updatedRounds = [...d.rounds];
      const roundIdx = d.currentRound - 1;
      const currentRound = updatedRounds[roundIdx];

      let nextTurn = d.currentTurn;
      let nextRound = d.currentRound;
      let nextStatus = d.status;
      let nextWinner = d.winner;

      if (d.currentTurn === "CHALLENGER") {
        currentRound.challengerReply = cleanText;
        nextTurn = "DEFENDER";
      } else {
        currentRound.defenderReply = cleanText;
        const isLastRound = d.currentRound === d.roundLimit;
        
        if (isLastRound) {
          const challengerNetScore = updatedRounds.reduce((acc, r) => acc + (r.challengerLikes - r.challengerDislikes), 0);
          const defenderNetScore = updatedRounds.reduce((acc, r) => acc + (r.defenderLikes - r.defenderDislikes), 0);
          nextWinner = challengerNetScore > defenderNetScore ? "CHALLENGER" : (defenderNetScore > challengerNetScore ? "DEFENDER" : "DRAW");
          nextStatus = "CLOSED";
        } else {
          updatedRounds.push({
            turn: d.currentRound + 1,
            challengerReply: null,
            defenderReply: null,
            challengerLikes: 0,
            challengerDislikes: 0,
            defenderLikes: 0,
            defenderDislikes: 0
          });
          nextRound = d.currentRound + 1;
          nextTurn = "CHALLENGER";
        }
      }

      updatedDuel = {
        ...d,
        currentTurn: nextTurn,
        currentRound: nextRound,
        status: nextStatus,
        rounds: updatedRounds,
        winner: nextWinner
      };

      return updatedDuel;
    }));

    if (updatedDuel) {
      try {
        await supabase
          .from("duels")
          .update({
            current_turn: updatedDuel.currentTurn,
            current_round: updatedDuel.currentRound,
            status: updatedDuel.status,
            rounds: JSON.stringify(updatedDuel.rounds),
            winner: updatedDuel.winner
          })
          .eq("id", duelId);
      } catch (e) {
        console.error(e);
      }
    }
  };

  const voteDuelReply = async (duelId: string, roundIndex: number, side: 'challenger' | 'defender', type: 'like' | 'dislike') => {
    let updatedRounds: DuelRound[] | undefined;
    setDuels(prev => prev.map(d => {
      if (d.id !== duelId) return d;
      const updatedRoundsArr = [...d.rounds];
      const r = updatedRoundsArr[roundIndex];
      
      if (side === 'challenger') {
        if (type === 'like') r.challengerLikes += 1;
        else r.challengerDislikes += 1;
      } else {
        if (type === 'like') r.defenderLikes += 1;
        else r.defenderDislikes += 1;
      }

      updatedRounds = updatedRoundsArr;
      return {
        ...d,
        rounds: updatedRoundsArr
      };
    }));

    if (updatedRounds) {
      try {
        await supabase
          .from("duels")
          .update({ rounds: JSON.stringify(updatedRounds) })
          .eq("id", duelId);
      } catch (e) {
        console.error(e);
      }
    }
  };

  const translateArticleAsync = async (articleId: string, from: 'fr' | 'en', to: 'fr' | 'en') => {
    try {
      let artToTranslate: Article | undefined;
      setArticles(prev => {
        artToTranslate = prev.find(a => a.id === articleId);
        return prev;
      });

      if (!artToTranslate) return;

      const titleVal = from === 'fr' ? artToTranslate.title : artToTranslate.titleEn || artToTranslate.title;
      const summaryVal = from === 'fr' ? artToTranslate.summary : artToTranslate.summaryEn || artToTranslate.summary;
      const paragraphsVal = from === 'fr' ? artToTranslate.content : artToTranslate.contentEn || artToTranslate.content;

      // Sequential translation with small delay (200ms) to respect free API rate limits (avoid HTTP 429)
      const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

      const translatedTitle = await translateText(titleVal, from, to);
      await delay(200);
      const translatedSummary = await translateText(summaryVal, from, to);

      const translatedParagraphs: string[] = [];
      for (const p of paragraphsVal) {
        await delay(200);
        const tp = await translateText(p, from, to);
        translatedParagraphs.push(tp);
      }

      setArticles(prev => prev.map(a => {
        if (a.id !== articleId) return a;
        if (to === 'en') {
          return {
            ...a,
            titleEn: translatedTitle,
            summaryEn: translatedSummary,
            contentEn: translatedParagraphs,
            categoryEn: translateCategory(a.category, 'en')
          };
        } else {
          return {
            ...a,
            title: translatedTitle,
            summary: translatedSummary,
            content: translatedParagraphs,
            category: translateCategory(a.categoryEn || a.category, 'fr')
          };
        }
      }));

      // Persist to Supabase
      if (to === 'en') {
        await supabase
          .from("articles")
          .update({
            title_en: translatedTitle,
            summary_en: translatedSummary,
            content_en: JSON.stringify(translatedParagraphs),
            category_en: translateCategory(artToTranslate.category, 'en')
          })
          .eq("id", articleId);
      } else {
        await supabase
          .from("articles")
          .update({
            title: translatedTitle,
            summary: translatedSummary,
            content: JSON.stringify(translatedParagraphs),
            category: translateCategory(artToTranslate.categoryEn || artToTranslate.category, 'fr')
          })
          .eq("id", articleId);
      }
    } catch (error) {
      console.warn(`Async translation failed for ${articleId}:`, error);
    }
  };

  const addArticle = async (title: string, category: string, summary: string, paragraphs: string[], imageUrl?: string, authorName?: string, additionalImages?: string[], videoUrl?: string, continent?: string) => {
    const isWrittenInFr = language === 'FR';
    
    const cleanTitle = sanitizeHTML(title);
    const cleanSummary = sanitizeHTML(summary);
    const cleanParagraphs = paragraphs.map(p => sanitizeHTML(p));
    const cleanImageUrl = sanitizeUrl(imageUrl || "https://images.unsplash.com/photo-1495020689067-958852a6565d?auto=format&fit=crop&q=80&w=800");
    const cleanAuthor = sanitizeHTML(authorName || (user ? (user.role === "ADMIN" ? "Komentel" : user.name) : "Journaliste Anonyme"));
    const cleanAdditionalImages = (additionalImages || []).map(img => sanitizeUrl(img));
    const cleanVideoUrl = sanitizeUrl(videoUrl || "");

    const newArticle: Article = {
      id: `article-${Date.now()}`,
      title: cleanTitle,
      titleEn: cleanTitle,
      category: isWrittenInFr ? category : translateCategory(category, 'fr'),
      categoryEn: isWrittenInFr ? translateCategory(category, 'en') : category,
      sourceName: cleanAuthor,
      sourceVerified: true,
      publishedAt: language === 'FR' ? "Aujourd'hui" : "Today",
      readTime: `${Math.max(1, Math.round(cleanParagraphs.join(" ").split(" ").length / 200))} min read`,
      views: 0,
      summary: cleanSummary,
      summaryEn: cleanSummary,
      content: cleanParagraphs,
      contentEn: cleanParagraphs,
      imageUrl: cleanImageUrl,
      continent: continent || detectContinent(cleanTitle, cleanSummary),
      additionalImages: cleanAdditionalImages,
      videoUrl: cleanVideoUrl,
      corrections: [],
      commentsCount: 0,
      commentsDisabled: false,
      reactions: { like: 0, love: 0, bravo: 0, surprise: 0, sad: 0, important: 0 },
      userReaction: null
    };

    setArticles(prev => [newArticle, ...prev]);

    try {
      await supabase.from("articles").insert({
        id: newArticle.id,
        title: newArticle.title,
        title_en: newArticle.titleEn,
        category: newArticle.category,
        category_en: newArticle.categoryEn,
        source_name: newArticle.sourceName,
        source_verified: newArticle.sourceVerified,
        published_at: newArticle.publishedAt,
        read_time: newArticle.readTime,
        views: newArticle.views,
        summary: newArticle.summary,
        summary_en: newArticle.summaryEn,
        content: JSON.stringify(newArticle.content),
        content_en: JSON.stringify(newArticle.contentEn),
        image_url: newArticle.imageUrl,
        additional_images: JSON.stringify(newArticle.additionalImages || []),
        video_url: newArticle.videoUrl,
        comments_count: newArticle.commentsCount,
        comments_disabled: newArticle.commentsDisabled,
        reactions: JSON.stringify(newArticle.reactions),
        user_reaction: newArticle.userReaction,
        continent: newArticle.continent
      });
    } catch (e) {
      console.error(e);
    }

    const fromLang = isWrittenInFr ? 'fr' : 'en';
    const toLang = isWrittenInFr ? 'en' : 'fr';
    setTimeout(() => {
      translateArticleAsync(newArticle.id, fromLang, toLang);
    }, 100);
  };

  const updateArticleCorrection = async (articleId: string, correctionText: string) => {
    const cleanCorrection = sanitizeHTML(correctionText);
    const newCorrection = {
      date: "Mis à jour à l'instant",
      text: cleanCorrection
    };
    setArticles(prev => prev.map(art => {
      if (art.id !== articleId) return art;
      return {
        ...art,
        corrections: [newCorrection, ...art.corrections]
      };
    }));

    try {
      await supabase.from("article_corrections").insert({
        article_id: articleId,
        date: newCorrection.date,
        text: newCorrection.text
      });
    } catch (e) {
      console.error(e);
    }
  };

  const reactToArticle = async (articleId: string, reactionType: keyof ArticleReactions) => {
    let updatedReactions: ArticleReactions | undefined;
    let newUserReaction: keyof ArticleReactions | null = reactionType;

    setArticles(prev => prev.map(art => {
      if (art.id !== articleId) return art;
      
      const reactionsCopy = { ...art.reactions };

      // If user clicks the SAME reaction, remove it
      if (art.userReaction === reactionType) {
        reactionsCopy[reactionType] = Math.max(0, reactionsCopy[reactionType] - 1);
        newUserReaction = null;
      } else {
        // If user changes reaction, decrement the old one
        if (art.userReaction !== null) {
          reactionsCopy[art.userReaction] = Math.max(0, reactionsCopy[art.userReaction] - 1);
        }
        // Increment the new one
        reactionsCopy[reactionType] = reactionsCopy[reactionType] + 1;
      }

      updatedReactions = reactionsCopy;
      return {
        ...art,
        reactions: reactionsCopy,
        userReaction: newUserReaction
      };
    }));

    if (updatedReactions) {
      try {
        await supabase
          .from("articles")
          .update({
            reactions: JSON.stringify(updatedReactions),
            user_reaction: newUserReaction
          })
          .eq("id", articleId);
      } catch (e) {
        console.error(e);
      }
    }
  };

  const toggleComments = async (articleId: string) => {
    let nextStatus = false;
    setArticles(prev => prev.map(art => {
      if (art.id === articleId) {
        nextStatus = !art.commentsDisabled;
        return { ...art, commentsDisabled: nextStatus };
      }
      return art;
    }));

    try {
      await supabase
        .from("articles")
        .update({ comments_disabled: nextStatus })
        .eq("id", articleId);
    } catch (e) {
      console.error(e);
    }
  };

  const moderateComment = async (commentId: string, action: 'delete' | 'keep') => {
    if (action === 'delete') {
      setComments(prev => prev.filter(c => c.id !== commentId));
      try {
        await supabase.from("comments").delete().eq("id", commentId);
      } catch (e) {
        console.error(e);
      }
    } else {
      setComments(prev => prev.map(c => c.id === commentId ? { ...c, reported: false } : c));
      try {
        await supabase.from("comments").update({ reported: false }).eq("id", commentId);
      } catch (e) {
        console.error(e);
      }
    }
  };

  const moderateDuel = async (duelId: string, action: 'close' | 'delete') => {
    if (action === 'delete') {
      setDuels(prev => prev.filter(d => d.id !== duelId));
      try {
        await supabase.from("duels").delete().eq("id", duelId);
      } catch (e) {
        console.error(e);
      }
    } else {
      setDuels(prev => prev.map(d => d.id === duelId ? { ...d, status: "CLOSED" } : d));
      try {
        await supabase.from("duels").update({ status: "CLOSED" }).eq("id", duelId);
      } catch (e) {
        console.error(e);
      }
    }
  };

  const dismissNotification = async (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    try {
      await supabase.from("notifications").delete().eq("id", id);
    } catch (e) {
      console.error(e);
    }
  };

  // Theme Management
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [language, setLanguage] = useState<'FR' | 'EN'>('FR');
  const [tempUnit, setTempUnit] = useState<'C' | 'F'>('C');
  const [layoutMode, setLayoutMode] = useState<'GRID' | 'LIST'>('GRID');
  const [showWeather, setShowWeatherState] = useState<boolean>(true);
  const [enableNotifications, setEnableNotificationsState] = useState<boolean>(true);
  const [immersiveMode, setImmersiveModeState] = useState<boolean>(false);
  const [hiddenCategories, setHiddenCategoriesState] = useState<string[]>([]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      // Theme
      const savedTheme = localStorage.getItem("theme");
      if (savedTheme === "light" || savedTheme === "dark") {
        setTheme(savedTheme);
        if (savedTheme === "light") {
          document.documentElement.classList.add("light");
        } else {
          document.documentElement.classList.remove("light");
        }
      } else {
        document.documentElement.classList.remove("light");
      }

      // Language
      const savedLanguage = localStorage.getItem("language");
      if (savedLanguage === "FR" || savedLanguage === "EN") {
        setLanguage(savedLanguage);
      }

      // Temp Unit
      const savedTempUnit = localStorage.getItem("tempUnit");
      if (savedTempUnit === "C" || savedTempUnit === "F") {
        setTempUnit(savedTempUnit);
      }

      // Layout Mode
      const savedLayoutMode = localStorage.getItem("layoutMode");
      if (savedLayoutMode === "GRID" || savedLayoutMode === "LIST") {
        setLayoutMode(savedLayoutMode);
      }

      // Show Weather
      const savedShowWeather = localStorage.getItem("showWeather");
      if (savedShowWeather !== null) {
        setShowWeatherState(savedShowWeather === "true");
      }

      // Enable Notifications
      const savedEnableNotifications = localStorage.getItem("enableNotifications");
      if (savedEnableNotifications !== null) {
        setEnableNotificationsState(savedEnableNotifications === "true");
      }

      // Immersive Mode
      const savedImmersiveMode = localStorage.getItem("immersiveMode");
      if (savedImmersiveMode !== null) {
        setImmersiveModeState(savedImmersiveMode === "true");
      }

      // Hidden Categories
      const savedHiddenCategories = localStorage.getItem("hiddenCategories");
      if (savedHiddenCategories) {
        try {
          setHiddenCategoriesState(JSON.parse(savedHiddenCategories));
        } catch (e) {
          console.error(e);
        }
      }

      // Poll Vote
      const savedPollQuestion = localStorage.getItem("pollQuestion");
      const currentQuestion = "Soutenez votre pays pour la Coupe du Monde 2026 !";
      if (savedPollQuestion !== currentQuestion) {
        localStorage.removeItem("votedOptionIndex");
        localStorage.removeItem("votedAt");
        localStorage.removeItem("pollOptionsVotes");
        localStorage.setItem("pollQuestion", currentQuestion);
      }

      const savedPollVote = localStorage.getItem("votedOptionIndex");
      if (savedPollVote !== null) {
        setPoll(prev => ({
          ...prev,
          votedOptionIndex: parseInt(savedPollVote)
        }));
      }

      const savedVotedAt = localStorage.getItem("votedAt");
      if (savedVotedAt) {
        setVotedAt(parseInt(savedVotedAt));
      }
    }
  }, []);

  const toggleTheme = () => {
    setTheme(prev => {
      const next = prev === "dark" ? "light" : "dark";
      if (typeof window !== "undefined") {
        localStorage.setItem("theme", next);
        if (next === "light") {
          document.documentElement.classList.add("light");
        } else {
          document.documentElement.classList.remove("light");
        }
      }
      return next;
    });
  };

  const toggleLanguage = () => {
    setLanguage(prev => {
      const next = prev === "FR" ? "EN" : "FR";
      if (typeof window !== "undefined") {
        localStorage.setItem("language", next);
      }
      return next;
    });
  };

  const toggleTempUnit = () => {
    setTempUnit(prev => {
      const next = prev === "C" ? "F" : "C";
      if (typeof window !== "undefined") {
        localStorage.setItem("tempUnit", next);
      }
      return next;
    });
  };

  const toggleLayoutMode = () => {
    setLayoutMode(prev => {
      const next = prev === "GRID" ? "LIST" : "GRID";
      if (typeof window !== "undefined") {
        localStorage.setItem("layoutMode", next);
      }
      return next;
    });
  };

  const setShowWeather = (show: boolean) => {
    setShowWeatherState(show);
    if (typeof window !== "undefined") {
      localStorage.setItem("showWeather", String(show));
    }
  };

  const setEnableNotifications = (enable: boolean) => {
    setEnableNotificationsState(enable);
    if (typeof window !== "undefined") {
      localStorage.setItem("enableNotifications", String(enable));
    }
  };

  const setImmersiveMode = (immersive: boolean) => {
    setImmersiveModeState(immersive);
    if (typeof window !== "undefined") {
      localStorage.setItem("immersiveMode", String(immersive));
    }
  };

  const setHiddenCategories = (action: React.SetStateAction<string[]>) => {
    setHiddenCategoriesState(prev => {
      const next = typeof action === "function" ? action(prev) : action;
      if (typeof window !== "undefined") {
        localStorage.setItem("hiddenCategories", JSON.stringify(next));
      }
      return next;
    });
  };

  const [isRealData, setIsRealData] = useState(false);
  const [matches, setMatches] = useState<Match[]>([
    { id: "m-1", sport: 'FOOTBALL', homeTeam: { name: "TUR", flag: "🇹🇷" }, awayTeam: { name: "PAR", flag: "🇵🇾" }, score: "1 - 1", status: "EN DIRECT", detail: "H1 17'", minute: 17, half: 1 },
    { id: "m-2", sport: 'FOOTBALL', homeTeam: { name: "BRA", flag: "🇧🇷" }, awayTeam: { name: "HTI", flag: "🇭🇹" }, score: "3 - 0", status: "Terminé", detail: "20 Juin" },
    { id: "m-3", sport: 'FOOTBALL', homeTeam: { name: "SCO", flag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿" }, awayTeam: { name: "MAR", flag: "🇲🇦" }, score: "0 - 1", status: "Terminé", detail: "19 Juin" },
    { id: "m-4", sport: 'FOOTBALL', homeTeam: { name: "SEN", flag: "🇸🇳" }, awayTeam: { name: "EGY", flag: "🇪🇬" }, score: "1 - 0", status: "EN DIRECT", detail: "H2 82'", minute: 82, half: 2 },
    { id: "m-5", sport: 'FOOTBALL', homeTeam: { name: "FRA", flag: "🇫🇷" }, awayTeam: { name: "ARG", flag: "🇦🇷" }, score: "2 - 2", status: "Terminé", detail: "18 Juin" },
    // Lutte Sénégalaise (Senegalese Wrestling)
    { 
      id: "l-1", 
      sport: 'LUTTE', 
      homeTeam: { name: "Modou Lô", flag: "👑" }, 
      awayTeam: { name: "Balla Gaye 2", flag: "🦁" }, 
      score: "Préparation", 
      status: "EN DIRECT", 
      detail: "Toussa en cours",
      wrestlingStage: 0 
    },
    { 
      id: "l-2", 
      sport: 'LUTTE', 
      homeTeam: { name: "Reug Reug", flag: "⚡" }, 
      awayTeam: { name: "Ama Baldé", flag: "🔥" }, 
      score: "Chute", 
      status: "Terminé", 
      detail: "Victoire Reug Reug" 
    },
    { 
      id: "l-3", 
      sport: 'LUTTE', 
      homeTeam: { name: "Boy Niang 2", flag: "🎯" }, 
      awayTeam: { name: "Lac de Guiers 2", flag: "🐊" }, 
      score: "À venir", 
      status: "À venir", 
      detail: "21 Juin, 17:00" 
    },
    // Basketball
    { 
      id: "b-1", 
      sport: 'BASKETBALL', 
      homeTeam: { name: "DUC", flag: "🎓" }, 
      awayTeam: { name: "AS Douanes", flag: "👮" }, 
      score: "78 - 76", 
      status: "EN DIRECT", 
      detail: "Q4 8'32\"",
      homeScore: 78,
      awayScore: 76,
      quarter: 4,
      timeRemaining: "8'32\""
    },
    { 
      id: "b-2", 
      sport: 'BASKETBALL', 
      homeTeam: { name: "USA", flag: "🇺🇸" }, 
      awayTeam: { name: "FRA", flag: "🇫🇷" }, 
      score: "98 - 87", 
      status: "Terminé", 
      detail: "Final" 
    }
  ]);

  // Keep a ref of matches to avoid stale closures in fetching calls
  const matchesRef = React.useRef(matches);
  useEffect(() => {
    matchesRef.current = matches;
  }, [matches]);

  // 1. Fallback Local Soccer Simulation Loop (Disabled to run in real-time)
  useEffect(() => {
    // Soccer simulation is disabled to ensure the site operates in real-time
  }, [isRealData]);

  // 1b. Simulation Loop for Basketball and Lutte Sénégalaise (Disabled to run in real-time)
  useEffect(() => {
    // Basketball and wrestling simulation is disabled to ensure the site operates in real-time
  }, []);

  const resetSimulatedMatches = () => {
    setMatches(prev => {
      const nonSimulated = prev.filter(m => m.sport === 'FOOTBALL');
      const resetSims: Match[] = [
        { 
          id: "l-1", 
          sport: 'LUTTE', 
          homeTeam: { name: "Modou Lô", flag: "👑" }, 
          awayTeam: { name: "Balla Gaye 2", flag: "🦁" }, 
          score: "Préparation", 
          status: "EN DIRECT", 
          detail: "Toussa en cours",
          wrestlingStage: 0 
        },
        { 
          id: "l-2", 
          sport: 'LUTTE', 
          homeTeam: { name: "Reug Reug", flag: "⚡" }, 
          awayTeam: { name: "Ama Baldé", flag: "🔥" }, 
          score: "Chute", 
          status: "Terminé", 
          detail: "Victoire Reug Reug" 
        },
        { 
          id: "l-3", 
          sport: 'LUTTE', 
          homeTeam: { name: "Boy Niang 2", flag: "🎯" }, 
          awayTeam: { name: "Lac de Guiers 2", flag: "🐊" }, 
          score: "À venir", 
          status: "À venir", 
          detail: "21 Juin, 17:00" 
        },
        { 
          id: "b-1", 
          sport: 'BASKETBALL', 
          homeTeam: { name: "DUC", flag: "🎓" }, 
          awayTeam: { name: "AS Douanes", flag: "👮" }, 
          score: "78 - 76", 
          status: "EN DIRECT", 
          detail: "Q4 8'32\"",
          homeScore: 78,
          awayScore: 76,
          quarter: 4,
          timeRemaining: "8'32\""
        },
        { 
          id: "b-2", 
          sport: 'BASKETBALL', 
          homeTeam: { name: "USA", flag: "🇺🇸" }, 
          awayTeam: { name: "FRA", flag: "🇫🇷" }, 
          score: "98 - 87", 
          status: "Terminé", 
          detail: "Final" 
        }
      ];
      return [...nonSimulated, ...resetSims].sort((a, b) => {
        const statusOrder = { "EN DIRECT": 0, "Terminé": 1, "À venir": 2 };
        return statusOrder[a.status] - statusOrder[b.status];
      });
    });
  };

  // LocalStorage Persistence State
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setHasLoaded(true);
    }
  }, []);

  // 2. Real API score updates interval
  useEffect(() => {
    // Initial fetch on mount
    refreshMatches();

    const interval = setInterval(() => {
      refreshMatches();
    }, 10000); // Poll every 10 seconds (optimized for fast real-time updates)

    return () => clearInterval(interval);
  }, []);

  const refreshMatches = async () => {
    try {
      const res = await fetch("https://site.api.espn.com/apis/site/v2/sports/soccer/all/scoreboard");
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const json = await res.json();

      if (json.events && json.events.length > 0) {
        setIsRealData(true);
        const prevMatches = matchesRef.current;
        const mappedMatches: Match[] = [];
        const newNotifs: Notification[] = [];

        json.events.forEach((event: any) => {
          const comp = event.competitions?.[0];
          if (!comp) return;

          const homeCompetitor = comp.competitors?.find((c: any) => c.homeAway === "home");
          const awayCompetitor = comp.competitors?.find((c: any) => c.homeAway === "away");
          if (!homeCompetitor || !awayCompetitor) return;

          const homeTeam = {
            name: homeCompetitor.team?.abbreviation || homeCompetitor.team?.shortDisplayName || "HOME",
            flag: iso3ToFlag(homeCompetitor.team?.abbreviation || "")
          };
          const awayTeam = {
            name: awayCompetitor.team?.abbreviation || awayCompetitor.team?.shortDisplayName || "AWAY",
            flag: iso3ToFlag(awayCompetitor.team?.abbreviation || "")
          };

          const statusType = event.status?.type?.name || "";
          const statusTypeUpper = statusType.toUpperCase();
          let status: "EN DIRECT" | "Terminé" | "À venir" = "À venir";
          if (statusTypeUpper.includes("FINAL") || statusTypeUpper === "STATUS_FULL_TIME" || statusTypeUpper === "STATUS_FINAL_PENALTIES") {
            status = "Terminé";
          } else if (
            statusTypeUpper.includes("IN_PROGRESS") || 
            statusTypeUpper.includes("PROGRESS") || 
            statusTypeUpper.includes("HALF") || 
            statusTypeUpper.includes("PERIOD") || 
            statusTypeUpper.includes("SHOOTOUT") || 
            statusTypeUpper.includes("LIVE") ||
            (event.status?.period > 0 && statusTypeUpper !== "STATUS_SCHEDULED")
          ) {
            status = "EN DIRECT";
          } else {
            status = "À venir";
          }

          let detail = "";
          if (status === "EN DIRECT") {
            const period = event.status?.period || 1;
            const clockStr = event.status?.displayClock || `${Math.floor(event.status?.clock || 0)}'`;
            if (statusType === "STATUS_HALFTIME") {
              detail = "Mi-temps";
            } else {
              detail = `H${period} ${clockStr}`;
            }
          } else if (status === "Terminé") {
            detail = "Terminé";
          } else {
            detail = event.status?.type?.detail || "À venir";
            // Simple French translation for common details
            detail = detail
              .replace("Sat", "Sam")
              .replace("Sun", "Dim")
              .replace("Mon", "Lun")
              .replace("Tue", "Mar")
              .replace("Wed", "Mer")
              .replace("Thu", "Jeu")
              .replace("Fri", "Ven")
              .replace("June", "Juin")
              .replace("July", "Juillet")
              .replace("at", "à");
          }

          const homeScore = homeCompetitor.score || "0";
          const awayScore = awayCompetitor.score || "0";
          const score = `${homeScore} - ${awayScore}`;

          const minute = event.status?.period ? (event.status?.clock || 0) : undefined;
          const half = event.status?.period === 1 ? 1 : (event.status?.period === 2 ? 2 : undefined);
          const matchId = String(event.id);

          // Goal detection
          const prevMatch = prevMatches.find(pm => pm.id === matchId);
          if (prevMatch && prevMatch.status === "EN DIRECT" && status === "EN DIRECT") {
            const prevScoreParts = prevMatch.score.split(" - ");
            const newScoreParts = score.split(" - ");
            const prevHome = parseInt(prevScoreParts[0]) || 0;
            const prevAway = parseInt(prevScoreParts[1]) || 0;
            const newHome = parseInt(newScoreParts[0]) || 0;
            const newAway = parseInt(newScoreParts[1]) || 0;

            if (newHome > prevHome) {
              const goalText = `⚽ BUT ! ${homeTeam.flag} ${homeTeam.name} marque ! Nouveau score : ${homeTeam.name} ${score} ${awayTeam.name} (${detail})`;
              newNotifs.push({
                id: `goal-${Date.now()}-${event.id}-h`,
                text: goalText,
                link: "/sport",
                read: false,
                type: "ALERT",
                category: "Sport"
              });
            } else if (newAway > prevAway) {
              const goalText = `⚽ BUT ! ${awayTeam.flag} ${awayTeam.name} marque ! Nouveau score : ${homeTeam.name} ${score} ${awayTeam.name} (${detail})`;
              newNotifs.push({
                id: `goal-${Date.now()}-${event.id}-a`,
                text: goalText,
                link: "/sport",
                read: false,
                type: "ALERT",
                category: "Sport"
              });
            }
          }

          mappedMatches.push({
            id: matchId,
            sport: 'FOOTBALL',
            homeTeam,
            awayTeam,
            score,
            status,
            detail,
            minute,
            half
          });
        });

        const nonFootballMatches = prevMatches.filter(m => m.sport !== 'FOOTBALL');
        const combined = [...mappedMatches, ...nonFootballMatches];

        // Sort: EN DIRECT first, then Terminé, then À venir
        const sortedMatches = combined.sort((a, b) => {
          const statusOrder = { "EN DIRECT": 0, "Terminé": 1, "À venir": 2 };
          return statusOrder[a.status] - statusOrder[b.status];
        });

        setMatches(sortedMatches);

        if (newNotifs.length > 0) {
          setNotifications(prev => [...newNotifs, ...prev]);
        }
      }
    } catch (e) {
      console.error("Failed to fetch real live scores, using existing matches/simulation.", e);
    }
  };

  const fetchLiveArticles = async () => {
    try {
      const res = await fetch("https://actually-relevant-api.onrender.com/api/stories");
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const json = await res.json();
      if (json.data && json.data.length > 0) {
        setArticles(prevArticles => {
          const newArticles: Article[] = [];
          
          json.data.forEach((story: any) => {
            const mapped = mapStoryToArticle(story);
            // Deduplicate: check if this article id already exists
            if (!prevArticles.some(a => a.id === mapped.id || a.title === mapped.title)) {
              newArticles.push(mapped);
              
              // Only push notification for articles added in background (after initial load)
              const isInitialLoad = prevArticles.length <= 3;
              if (!isInitialLoad) {
                setNotifications(prevNotifs => [
                  {
                    id: `new-art-${Date.now()}-${story.id}`,
                    text: `📰 ACTU : "${mapped.title}" a été publié (${mapped.category}).`,
                    link: `/article/${mapped.id}`,
                    read: false,
                    type: "ALERT",
                    category: mapped.category
                  },
                  ...prevNotifs
                ]);
              }
            }
          });

          if (newArticles.length > 0) {
            // Trigger translation in background for new articles
            newArticles.forEach(art => {
              setTimeout(() => {
                translateArticleAsync(art.id, 'en', 'fr');
              }, 100);
            });
            return [...newArticles, ...prevArticles];
          }
          return prevArticles;
        });
      }
    } catch (e) {
      console.error("Failed to fetch live articles:", e);
    }
  };

  // Real-time news updates interval (poll every 2 minutes)
  useEffect(() => {
    fetchLiveArticles();

    const interval = setInterval(() => {
      fetchLiveArticles();
    }, 120000);

    return () => clearInterval(interval);
  }, []);

  // Real-time database updates for polls, duels, and comments
  useEffect(() => {
    // 1. Subscribe to polls table updates
    const pollsChannel = supabase
      .channel("public:polls")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "polls", filter: "id=eq.world-cup-poll" },
        (payload) => {
          const pollData = payload.new as any;
          if (pollData) {
            const parsedOptions = typeof pollData.options === "string" ? JSON.parse(pollData.options) : pollData.options;
            setPoll(prev => ({
              ...prev,
              question: pollData.question,
              questionEn: pollData.question_en,
              options: parsedOptions
            }));
          }
        }
      )
      .subscribe();

    // 2. Subscribe to duels table updates
    const duelsChannel = supabase
      .channel("public:duels")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "duels" },
        (payload) => {
          if (payload.eventType === "INSERT") {
            const d = payload.new as any;
            const newDuel = {
              id: d.id,
              articleId: d.article_id,
              articleTitle: d.article_title,
              commentId: d.comment_id,
              challenger: d.challenger,
              challengerStats: typeof d.challenger_stats === "string" ? JSON.parse(d.challenger_stats) : d.challenger_stats,
              defender: d.defender,
              defenderStats: typeof d.defender_stats === "string" ? JSON.parse(d.defender_stats) : d.defender_stats,
              status: d.status,
              roundLimit: d.round_limit,
              currentRound: d.current_round,
              currentTurn: d.current_turn,
              rounds: typeof d.rounds === "string" ? JSON.parse(d.rounds) : d.rounds,
              closesAt: d.closes_at,
              winner: d.winner
            };
            setDuels(prev => {
              if (prev.some(x => x.id === newDuel.id)) return prev;
              return [...prev, newDuel];
            });
          } else if (payload.eventType === "UPDATE") {
            const d = payload.new as any;
            const updatedDuel = {
              id: d.id,
              articleId: d.article_id,
              articleTitle: d.article_title,
              commentId: d.comment_id,
              challenger: d.challenger,
              challengerStats: typeof d.challenger_stats === "string" ? JSON.parse(d.challenger_stats) : d.challenger_stats,
              defender: d.defender,
              defenderStats: typeof d.defender_stats === "string" ? JSON.parse(d.defender_stats) : d.defender_stats,
              status: d.status,
              roundLimit: d.round_limit,
              currentRound: d.current_round,
              currentTurn: d.current_turn,
              rounds: typeof d.rounds === "string" ? JSON.parse(d.rounds) : d.rounds,
              closesAt: d.closes_at,
              winner: d.winner
            };
            setDuels(prev => prev.map(x => x.id === updatedDuel.id ? updatedDuel : x));
          } else if (payload.eventType === "DELETE") {
            const d = payload.old as any;
            setDuels(prev => prev.filter(x => x.id !== d.id));
          }
        }
      )
      .subscribe();

    // 3. Subscribe to comments table updates
    const commentsChannel = supabase
      .channel("public:comments")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "comments" },
        (payload) => {
          if (payload.eventType === "INSERT") {
            const c = payload.new as any;
            const newComment = {
              id: c.id,
              articleId: c.article_id,
              parentId: c.parent_id,
              author: c.author,
              authorBadge: c.author_badge,
              content: c.content,
              createdAt: c.created_at,
              likes: c.likes,
              dislikes: c.dislikes,
              reported: c.reported
            };
            setComments(prev => {
              if (prev.some(x => x.id === newComment.id)) return prev;
              return [...prev, newComment];
            });
            setArticles(prev => prev.map(art => art.id === newComment.articleId ? { ...art, commentsCount: art.commentsCount + 1 } : art));
          } else if (payload.eventType === "UPDATE") {
            const c = payload.new as any;
            const updatedComment = {
              id: c.id,
              articleId: c.article_id,
              parentId: c.parent_id,
              author: c.author,
              authorBadge: c.author_badge,
              content: c.content,
              createdAt: c.created_at,
              likes: c.likes,
              dislikes: c.dislikes,
              reported: c.reported
            };
            setComments(prev => prev.map(x => x.id === updatedComment.id ? updatedComment : x));
          } else if (payload.eventType === "DELETE") {
            const c = payload.old as any;
            setComments(prev => {
              const found = prev.find(x => x.id === c.id);
              if (found) {
                setArticles(artPrev => artPrev.map(art => art.id === found.articleId ? { ...art, commentsCount: Math.max(0, art.commentsCount - 1) } : art));
              }
              return prev.filter(x => x.id !== c.id);
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(pollsChannel);
      supabase.removeChannel(duelsChannel);
      supabase.removeChannel(commentsChannel);
    };
  }, []);

  // Filter notifications based on login status and centers of interest
  const filteredNotifications = React.useMemo(() => {
    if (!user) return [];
    const userInterests = user.interests || [];
    return notifications.filter(notif => {
      if (!notif.category) return true; // Show direct personal/transactional notifications by default
      return userInterests.includes(notif.category);
    });
  }, [user, notifications]);

  return (
    <KomentelContext.Provider value={{
      user,
      setUser,
      articles,
      comments,
      duels,
      poll,
      notifications: filteredNotifications,
      searchQuery,
      setSearchQuery,
      registeredUsers,
      registerUser,
      loginUser,
      logoutUser,
      completeOnboarding,
      accreditJournalist,
      votePoll,
      changeVotePoll,
      votedAt,
      addComment,
      reportComment,
      likeComment,
      dislikeComment,
      challengeToDuel,
      acceptDuel,
      postDuelReply,
      voteDuelReply,
      addArticle,
      updateArticleCorrection,
      reactToArticle,
      toggleComments,
      moderateComment,
      moderateDuel,
      dismissNotification,
      theme,
      toggleTheme,
      language,
      toggleLanguage,
      tempUnit,
      toggleTempUnit,
      layoutMode,
      toggleLayoutMode,
      showWeather,
      setShowWeather,
      enableNotifications,
      setEnableNotifications,
      immersiveMode,
      setImmersiveMode,
      hiddenCategories,
      setHiddenCategories,
      matches,
      refreshMatches,
      resetSimulatedMatches,
      refreshArticles: fetchLiveArticles
    }}>
      {children}
    </KomentelContext.Provider>
  );
};
