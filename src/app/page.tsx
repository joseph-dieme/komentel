"use client";

import React, { useState, Suspense } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useKomentel, Article, ArticleReactions } from "@/context/KomentelContext";
import { 
  CheckCircle2, 
  Eye, 
  MessageSquare, 
  Clock, 
  ArrowRight, 
  Flame, 
  BarChart2, 
  Sliders, 
  Star, 
  Mic, 
  Globe, 
  Settings, 
  MoreHorizontal, 
  ChevronLeft, 
  ChevronRight, 
  Info, 
  ThumbsUp, 
  ThumbsDown, 
  Trophy,
  Sun,
  Moon,
  CloudSun,
  RefreshCw
} from "lucide-react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";

// Fallback articles to guarantee the portal always has beautiful, full content matching the screenshot
const fallbackArticles: Article[] = [
  {
    id: "fallback-1",
    title: "Ces 5 villages paisibles en bord de lac sont parfaits pour un week-end rafraîchissant en France",
    titleEn: "These 5 peaceful lakeside villages are perfect for a refreshing weekend in France",
    category: "Culture",
    categoryEn: "Culture",
    continent: "Europe",
    sourceName: "EnVols",
    sourceVerified: true,
    publishedAt: "Il y a 2h",
    readTime: "4 min read",
    views: 4500,
    summary: "Découvrez notre sélection des plus beaux villages français situés au bord de l'eau, idéaux pour s'évader le temps d'un week-end.",
    summaryEn: "Discover our selection of the most beautiful French lakeside villages, ideal for a weekend getaway.",
    content: ["Ces villages calmes offrent des séjours relaxants au bord de l'eau..."],
    contentEn: ["These quiet villages offer relaxing stays by the water..."],
    imageUrl: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&q=80&w=800",
    corrections: [],
    commentsCount: 12,
    commentsDisabled: false,
    reactions: { like: 42, love: 10, bravo: 8, surprise: 2, sad: 0, important: 5 },
    userReaction: null
  },
  {
    id: "fallback-2",
    title: "George Clooney révèle celui qui, selon lui, pourrait incarner le prochain James Bond",
    titleEn: "George Clooney reveals who he thinks could play the next James Bond",
    category: "Actualités",
    categoryEn: "News",
    continent: "Monde",
    sourceName: "Zeleb (Français)",
    sourceVerified: true,
    publishedAt: "Il y a 1j",
    readTime: "3 min read",
    views: 8900,
    summary: "L'acteur vedette s'est confié sur l'avenir de la célèbre franchise d'espionnage et a partagé son favori pour succéder à Daniel Craig.",
    summaryEn: "The star actor spoke about the future of the famous spy franchise and shared his favorite to succeed Daniel Craig.",
    content: ["Dans une interview exclusive, l'acteur a salué le talent d'un jeune comédien britannique..."],
    contentEn: ["In an exclusive interview, the actor praised the talent of a young British actor..."],
    imageUrl: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=800",
    corrections: [],
    commentsCount: 15,
    commentsDisabled: false,
    reactions: { like: 15, love: 5, bravo: 2, surprise: 8, sad: 1, important: 4 },
    userReaction: null
  },
  {
    id: "fallback-3",
    title: "Russie-Madagascar : Moscou veut approfondir son partenariat économique",
    titleEn: "Russia-Madagascar: Moscow wants to deepen its economic partnership",
    category: "Business",
    categoryEn: "Business",
    continent: "Afrique",
    sourceName: "Euronews (Français)",
    sourceVerified: true,
    publishedAt: "Il y a 7h",
    readTime: "5 min read",
    views: 3100,
    summary: "Les deux nations étudient de nouveaux accords de coopération dans le secteur de l'énergie et des matières premières.",
    summaryEn: "The two nations are studying new cooperation agreements in the energy and raw materials sectors.",
    content: ["Lors d'une réunion bilatérale, les représentants ont discuté d'investissements stratégiques..."],
    contentEn: ["During a bilateral meeting, the representatives discussed strategic investments..."],
    imageUrl: "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&q=80&w=800",
    corrections: [],
    commentsCount: 4,
    commentsDisabled: false,
    reactions: { like: 24, love: 2, bravo: 1, surprise: 3, sad: 0, important: 8 },
    userReaction: null
  },
  {
    id: "fallback-4",
    title: "À l'approche des élections de mi-mandat, les républicains perdent du terrain",
    titleEn: "With midterm elections approaching, Republicans are losing ground",
    category: "International",
    categoryEn: "International",
    continent: "Amériques",
    sourceName: "The Daily Digest",
    sourceVerified: true,
    publishedAt: "Il y a 16h",
    readTime: "6 min read",
    views: 12500,
    summary: "Les derniers sondages d'opinion indiquent un resserrement de la course électorale dans plusieurs États clés.",
    summaryEn: "The latest opinion polls indicate a tightening of the electoral race in several key states.",
    content: ["Les démocrates regagnent des points auprès de l'électorat indépendant suite aux récents débats législatifs..."],
    contentEn: ["Democrats are gaining points among independent voters following recent legislative debates..."],
    imageUrl: "https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?auto=format&fit=crop&q=80&w=800",
    corrections: [],
    commentsCount: 48,
    commentsDisabled: false,
    reactions: { like: 180, love: 25, bravo: 14, surprise: 32, sad: 5, important: 95 },
    userReaction: null
  }
];

const flagEmojiToCountryCode = (emoji: string): string | null => {
  if (!emoji || emoji.length < 4) return null;
  try {
    const codePoints = Array.from(emoji).map(char => char.codePointAt(0));
    const isRegionalIndicator = codePoints.every(cp => cp && cp >= 127462 && cp <= 127487);
    if (isRegionalIndicator && codePoints.length === 2) {
      const letters = codePoints.map(cp => String.fromCharCode(cp! - 127397));
      return letters.join('').toLowerCase();
    }
  } catch (e) {
    return null;
  }
  return null;
};

const renderClubOrWrestlerEmblem = (name: string, fallbackEmoji: string, textClass: string = "text-sm") => {
  const normName = name.trim().toUpperCase();
  
  if (normName.includes("DUC")) {
    return (
      <div className="w-5.5 h-5.5 rounded-full bg-black border-2 border-yellow-500 flex items-center justify-center shadow-sm shrink-0 font-extrabold text-[9px] text-yellow-500 select-none animate-pulse" title="Dakar University Club">
        D
      </div>
    );
  }
  if (normName.includes("DOUANES")) {
    return (
      <div className="w-5.5 h-5.5 rounded-full bg-emerald-900 border-2 border-emerald-400 flex items-center justify-center shadow-sm shrink-0 font-extrabold text-[9px] text-emerald-300 select-none" title="AS Douanes">
        AD
      </div>
    );
  }
  if (normName.includes("MODOU")) {
    return (
      <div className="w-5.5 h-5.5 rounded-lg bg-gradient-to-br from-yellow-500 to-amber-600 border border-yellow-300 flex items-center justify-center shadow-md shrink-0 text-xs text-white select-none" title="Modou Lô (Roi des Arènes)">
        👑
      </div>
    );
  }
  if (normName.includes("BALLA")) {
    return (
      <div className="w-5.5 h-5.5 rounded-lg bg-gradient-to-br from-orange-500 to-red-650 border border-orange-300 flex items-center justify-center shadow-md shrink-0 text-xs text-white select-none" title="Balla Gaye 2 (Lion de Guédiawaye)">
        🦁
      </div>
    );
  }
  if (normName.includes("REUG")) {
    return (
      <div className="w-5.5 h-5.5 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-700 border border-blue-400 flex items-center justify-center shadow-md shrink-0 text-xs text-white select-none" title="Reug Reug (Génie de Thiaroye)">
        ⚡
      </div>
    );
  }
  if (normName.includes("AMA")) {
    return (
      <div className="w-5.5 h-5.5 rounded-lg bg-gradient-to-br from-red-650 to-orange-600 border border-red-405 flex items-center justify-center shadow-md shrink-0 text-xs text-white select-none" title="Ama Baldé (Pikine)">
        🔥
      </div>
    );
  }
  if (normName.includes("BOY NIANG")) {
    return (
      <div className="w-5.5 h-5.5 rounded-lg bg-gradient-to-br from-slate-200 to-slate-400 border border-white flex items-center justify-center shadow-md shrink-0 text-[10px] text-slate-800 select-none" title="Boy Niang 2">
        🎯
      </div>
    );
  }
  if (normName.includes("LAC DE GUIERS")) {
    return (
      <div className="w-5.5 h-5.5 rounded-lg bg-gradient-to-br from-green-700 to-emerald-800 border border-green-450 flex items-center justify-center shadow-md shrink-0 text-xs text-white select-none" title="Lac de Guiers 2">
        🐊
      </div>
    );
  }

  // Fallback to emoji
  return <span className={`${textClass} filter drop-shadow-sm select-none shrink-0`}>{fallbackEmoji}</span>;
};

const renderTeamFlag = (name: string, flagEmoji: string) => {
  // 1. Try to convert flag emoji (regional indicators) to 2-letter country code
  const countryCode = flagEmojiToCountryCode(flagEmoji);
  if (countryCode) {
    const url = `https://flagcdn.com/w40/${countryCode}.png`;
    return (
      <img 
        src={url} 
        className="w-5.5 h-3.5 object-cover rounded-sm shadow-sm select-none inline-block border border-white/10 shrink-0" 
        alt=""
        onError={(e) => {
          (e.target as HTMLElement).style.display = 'none';
        }}
      />
    );
  }

  // 2. Handle known UK subnational flags
  const upperName = name.toUpperCase();
  if (flagEmoji === '🏴󠁧󠁢󠁳󠁣󠁴󠁿' || flagEmoji === '🏴\u200d󠁢󠁳󠁣󠁴󠁿' || upperName.includes('SCO') || upperName.includes('ÉCOSSE')) {
    return (
      <img 
        src="https://flagcdn.com/w40/gb-sct.png" 
        className="w-5.5 h-3.5 object-cover rounded-sm shadow-sm select-none inline-block border border-white/10 shrink-0" 
        alt="Scotland" 
      />
    );
  }
  if (flagEmoji === '🏴󠁧󠁢󠁥󠁮󠁧󠁿' || flagEmoji === '🏴\u200d󠁢󠁥󠁮󠁧󠁿' || upperName.includes('ENG') || upperName.includes('ANGLETERRE')) {
    return (
      <img 
        src="https://flagcdn.com/w40/gb-eng.png" 
        className="w-5.5 h-3.5 object-cover rounded-sm shadow-sm select-none inline-block border border-white/10 shrink-0" 
        alt="England" 
      />
    );
  }
  if (flagEmoji === '🏴󠁧󠁢󠁷󠁬󠁳󠁿' || flagEmoji === '🏴\u200d󠁢󠁷󠁬󠁳󠁿' || upperName.includes('WAL') || upperName.includes('GALLES')) {
    return (
      <img 
        src="https://flagcdn.com/w40/gb-wls.png" 
        className="w-5.5 h-3.5 object-cover rounded-sm shadow-sm select-none inline-block border border-white/10 shrink-0" 
        alt="Wales" 
      />
    );
  }

  // 3. Fallback to club/wrestler emblem or raw emoji
  return renderClubOrWrestlerEmblem(name, flagEmoji, "text-sm");
};



function HomeContent() {
  const { 
    articles, 
    duels, 
    poll, 
    votePoll, 
    searchQuery, 
    setSearchQuery, 
    reactToArticle,
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
    refreshArticles,
    user,
    registeredUsers,
    votedAt,
    changeVotePoll,
    updateInterests
  } = useKomentel();
  
  const searchParams = useSearchParams();
  const router = useRouter();

  const [feedFilter, setFeedFilter] = useState<'ALL' | 'MY_POSTS' | 'JOURNALISTS'>('ALL');
  const [showSubjectsDropdown, setShowSubjectsDropdown] = useState(false);
  
  const selectedCategory = searchParams.get("category") || "Toutes";
  const selectedContinent = searchParams.get("continent") || "Monde";

  const updateFilters = (cat: string, continent: string) => {
    const params = new URLSearchParams();
    if (cat !== "Toutes") {
      params.set("category", cat);
    }
    if (continent !== "Monde") {
      params.set("continent", continent);
    }
    const query = params.toString();
    router.push(query ? `/?${query}` : "/");
  };

  const setSelectedCategory = (cat: string) => {
    updateFilters(cat, selectedContinent);
  };

  const setSelectedContinent = (continent: string) => {
    updateFilters(selectedCategory, continent);
  };

  const [activePollVote, setActivePollVote] = useState<number | null>(null);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [showAllMatches, setShowAllMatches] = useState(false);
  const [showSettingsDropdown, setShowSettingsDropdown] = useState(false);
  const [showAppLauncher, setShowAppLauncher] = useState(false);
  const [showPersonalizeModal, setShowPersonalizeModal] = useState(false);

  // Simulate pull-to-refresh spinner loading state
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showMatchesMenu1, setShowMatchesMenu1] = useState(false);
  const [showMatchesMenu2, setShowMatchesMenu2] = useState(false);
  const [showTrendingMenu, setShowTrendingMenu] = useState(false);
  const [isRefreshingArticles, setIsRefreshingArticles] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [activeOpinionTab, setActiveOpinionTab] = useState<'POLL' | 'SEARCH'>('POLL');
  const [searchCountryQuery, setSearchCountryQuery] = useState("");
  const [isChangingVote, setIsChangingVote] = useState(false);


  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(prev => prev === message ? null : prev);
    }, 3000);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshMatches();
    showToast(language === "FR" ? "Mise à jour des scores terminée !" : "Score update completed!");
    setIsRefreshing(false);
  };

  // Simple translator helper
  const t = (frText: string, enText: string) => {
    return language === 'FR' ? frText : enText;
  };

  const translateCategoryLocal = (c: string) => {
    const map: { [key: string]: string } = {
      "Toutes": language === 'FR' ? "Toutes" : "All",
      "Actualités": language === 'FR' ? "Actualités" : "News",
      "Sport": language === 'FR' ? "Sport" : "Sports",
      "Santé": language === 'FR' ? "Santé" : "Health",
      "Éducation": language === 'FR' ? "Éducation" : "Education",
      "Technologie": language === 'FR' ? "Technologie" : "Tech",
      "Culture": language === 'FR' ? "Culture" : "Culture",
      "International": language === 'FR' ? "International" : "International",
      "Business": language === 'FR' ? "Business" : "Business"
    };
    return map[c] || c;
  };

  const translateMatchStatus = (status: string) => {
    if (language === 'FR') return status;
    if (status === 'EN DIRECT') return 'LIVE';
    if (status === 'Terminé') return 'FT';
    if (status === 'À venir') return 'Upcoming';
    return status;
  };

  const translateMatchDetail = (detail: string) => {
    if (language === 'FR') return detail;
    return detail
      .replace("Mi-temps", "Halftime")
      .replace("Terminé", "Final")
      .replace("Juin", "June")
      .replace("Juillet", "July")
      .replace("Août", "August");
  };

  const renderDuelBadge = (articleId: string) => {
    const artDuel = duels.find(d => d.articleId === articleId);
    if (!artDuel) return null;
    if (artDuel.status === "ACTIVE") {
      return (
        <div className="absolute top-3 right-3 bg-accent text-white text-[8px] font-extrabold uppercase px-2 py-0.5 rounded shadow animate-pulse flex items-center gap-1 border border-accent/20">
          ⚔️ {t("Débat actif", "Active debate")}
        </div>
      );
    }
    if (artDuel.status === "PENDING") {
      return (
        <div className="absolute top-3 right-3 bg-amber-500 text-white text-[8px] font-extrabold uppercase px-2 py-0.5 rounded shadow flex items-center gap-1 border border-amber-500/20">
          ⚔️ {t("Défi lancé", "Challenge pending")}
        </div>
      );
    }
    return null;
  };

  const allCategories = [
    "Actualités",
    "Sport",
    "Santé",
    "Éducation",
    "Technologie",
    "Culture",
    "International",
    "Business"
  ];

  const categories = user && user.interests && user.interests.length > 0
    ? ["Toutes", ...user.interests]
    : ["Toutes", ...allCategories];

  const continents = [
    "Monde",
    "Afrique",
    "Europe",
    "Amériques",
    "Sénégal",
    "Moyen-Orient",
    "Asie-Pacifique"
  ];

  const translateContinentLocal = (cont: string) => {
    if (language === "FR") {
      if (cont === "Monde") return "Tout le monde";
      return cont;
    } else {
      if (cont === "Monde") return "All Continents";
      if (cont === "Afrique") return "Africa";
      if (cont === "Europe") return "Europe";
      if (cont === "Amériques") return "Americas";
      if (cont === "Sénégal") return "Senegal";
      if (cont === "Moyen-Orient") return "Middle East";
      if (cont === "Asie-Pacifique") return "Asia-Pacific";
      return cont;
    }
  };

  // Filter articles based on category selection AND continent selection AND search query AND feed filter (mine or journalist)
  const filteredArticles = articles.filter(art => {
    const matchesCategory = selectedCategory === "Toutes" || 
      art.category.toLowerCase() === selectedCategory.toLowerCase();
    
    const matchesContinent = selectedContinent === "Monde" || 
      (art.continent && art.continent.toLowerCase() === selectedContinent.toLowerCase());
    
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch = !query || 
      art.title.toLowerCase().includes(query) || 
      art.summary.toLowerCase().includes(query) ||
      art.content.some(paragraph => paragraph.toLowerCase().includes(query));
      
    let matchesAuthor = true;
    if (feedFilter === 'MY_POSTS') {
      matchesAuthor = user ? art.sourceName.toLowerCase() === user.name.toLowerCase() : false;
    } else if (feedFilter === 'JOURNALISTS') {
      const author = registeredUsers.find(u => u.name.toLowerCase() === art.sourceName.toLowerCase());
      matchesAuthor = author ? author.role === 'JOURNALIST' : false;
    }
      
    return matchesCategory && matchesContinent && matchesSearch && matchesAuthor;
  });

  // Filter out customized hidden categories
  const visibleArticles = filteredArticles.filter(art => !hiddenCategories.includes(art.category));

  // Combine actual database articles with fallback articles so the portal is always populated beautifully
  const displayedArticles = [...visibleArticles];
  fallbackArticles.forEach(fallback => {
    if (!displayedArticles.some(a => a.id === fallback.id || a.title === fallback.title)) {
      const matchesCategory = selectedCategory === "Toutes" || 
        fallback.category.toLowerCase() === selectedCategory.toLowerCase();
      
      const matchesContinent = selectedContinent === "Monde" || 
        (fallback.continent && fallback.continent.toLowerCase() === selectedContinent.toLowerCase());
        
      const isHidden = hiddenCategories.includes(fallback.category);
      if (matchesCategory && matchesContinent && !isHidden) {
        let matchesAuthor = true;
        if (feedFilter === 'MY_POSTS') {
          matchesAuthor = user ? fallback.sourceName.toLowerCase() === user.name.toLowerCase() : false;
        } else if (feedFilter === 'JOURNALISTS') {
          const author = registeredUsers.find(u => u.name.toLowerCase() === fallback.sourceName.toLowerCase());
          matchesAuthor = author ? author.role === 'JOURNALIST' : false;
        }
        if (matchesAuthor) {
          displayedArticles.push(fallback as Article);
        }
      }
    }
  });

  // Calculate poll percentages
  const totalPollVotes = poll.options.reduce((sum, opt) => sum + opt.votes, 0);

  const handleVote = () => {
    if (activePollVote !== null) {
      votePoll(activePollVote);
    }
  };

  const activeDuels = duels.filter(d => {
    if (d.status !== "ACTIVE") return false;
    if (user && user.interests && user.interests.length > 0) {
      const art = articles.find(a => a.id === d.articleId);
      if (art) {
        return user.interests.includes(art.category);
      }
      const match = matches.find(m => m.id === d.articleId);
      if (match) {
        return user.interests.includes("Sport");
      }
      return false;
    }
    return true;
  });
  const carouselArticles = displayedArticles.slice(0, 5);

  const handlePrevSlide = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentSlideIndex(prev => (prev === 0 ? carouselArticles.length - 1 : prev - 1));
  };

  const handleNextSlide = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentSlideIndex(prev => (prev === carouselArticles.length - 1 ? 0 : prev + 1));
  };

  const handleLikeCard = (e: React.MouseEvent, articleId: string) => {
    e.preventDefault();
    e.stopPropagation();
    reactToArticle(articleId, "like");
  };

  const handleDislikeCard = (e: React.MouseEvent, articleId: string) => {
    e.preventDefault();
    e.stopPropagation();
    reactToArticle(articleId, "sad");
  };

  const handleCardClick = (e: React.MouseEvent, articleId: string) => {
    const target = e.target as HTMLElement;
    if (
      target.closest("button") ||
      target.closest("a") ||
      target.closest("input") ||
      target.closest("svg") ||
      target.closest(".prevent-card-click")
    ) {
      return;
    }
    router.push(`/article/${articleId}`);
  };

  // Slice matches dynamically from the global context
  const initialMatches = matches.slice(0, 3);
  const extendedMatches = matches;

  const currentMatches = showAllMatches ? extendedMatches : initialMatches;

  // Get trending articles globally (unaffected by category/search, but respecting hidden categories)
  const globalVisibleArticles = [...articles, ...fallbackArticles]
    .filter(art => !hiddenCategories.includes(art.category))
    .filter((art, idx, self) => self.findIndex(a => a.id === art.id) === idx)
    .sort((a, b) => b.views - a.views);

  const renderPollCard = (isSidebar: boolean = false) => {
    const canChangeVote = poll.votedOptionIndex !== null && votedAt !== null && (Date.now() - votedAt < 24 * 60 * 60 * 1000);

    const getRemainingTimeText = () => {
      if (votedAt === null) return "";
      const diff = Date.now() - votedAt;
      const total24h = 24 * 60 * 60 * 1000;
      const remaining = total24h - diff;
      if (remaining <= 0) return "";
      
      const hours = Math.floor(remaining / (1000 * 60 * 60));
      const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
      if (hours > 0) {
        return language === 'FR' ? `${hours}h rest.` : `${hours}h left`;
      } else {
        return language === 'FR' ? `${minutes}m rest.` : `${minutes}m left`;
      }
    };

    const topPollOptions = [...poll.options]
      .map((opt, idx) => ({ ...opt, originalIndex: idx }))
      .sort((a, b) => b.votes - a.votes)
      .slice(0, 4);

    const optionsWithIndices = poll.options.map((opt, idx) => ({
      ...opt,
      originalIndex: idx
    }));

    const filteredCountries = optionsWithIndices.filter(c => {
      const q = searchCountryQuery.toLowerCase().trim();
      const nameFr = c.nameFr || c.label || "";
      const nameEn = c.nameEn || c.labelEn || "";
      return nameFr.toLowerCase().includes(q) || nameEn.toLowerCase().includes(q);
    });

    return (
      <div className={`portal-card p-5 shadow-premium relative overflow-hidden border border-white/10 glow-indigo flex flex-col justify-between h-[350px] ${isSidebar ? "w-full" : "w-full"}`}>
        <div className="absolute -top-10 -right-10 w-24 h-24 bg-primary/10 rounded-full blur-xl pointer-events-none"></div>
        <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-accent/10 rounded-full blur-xl pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col justify-between h-full w-full">
          <div>
            {/* Header Tabs */}
            <div className="flex justify-between items-center mb-3 pb-1.5 border-b border-white/5">
              <div className="flex gap-1.5">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setActiveOpinionTab('POLL');
                  }}
                  className={`text-[9px] font-extrabold uppercase px-2 py-1 rounded transition-all cursor-pointer border ${
                    activeOpinionTab === 'POLL'
                      ? "bg-accent/15 border-accent/30 text-accent shadow-[0_0_8px_rgba(244,63,94,0.15)]"
                      : "bg-white/5 border-transparent text-slate-400 hover:text-white"
                  }`}
                >
                  {t("Sondage", "Poll")}
                </button>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setActiveOpinionTab('SEARCH');
                  }}
                  className={`text-[9px] font-extrabold uppercase px-2 py-1 rounded transition-all cursor-pointer border ${
                    activeOpinionTab === 'SEARCH'
                      ? "bg-accent/15 border-accent/30 text-accent shadow-[0_0_8px_rgba(244,63,94,0.15)]"
                      : "bg-white/5 border-transparent text-slate-400 hover:text-white"
                  }`}
                >
                  {t("Équipes 2026", "2026 Teams")}
                </button>
              </div>
              <span className="text-[8px] text-slate-500 font-bold uppercase tracking-wider">
                FIFA WORLD CUP
              </span>
            </div>
            
            {activeOpinionTab === 'POLL' ? (
              <div className="animate-in fade-in duration-200">
                <h3 className="font-serif text-xs sm:text-sm font-bold leading-snug mb-3 text-white">
                  {language === 'FR' ? poll.question : (poll.questionEn || poll.question)}
                </h3>
                
                {poll.votedOptionIndex === null || isChangingVote ? (
                  <div className="space-y-1.5 mb-2">
                    {topPollOptions.map((opt) => (
                      <button
                        key={opt.originalIndex}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setActivePollVote(opt.originalIndex);
                        }}
                        className={`w-full text-left py-2 px-3 rounded-lg text-xs font-bold border transition-all duration-200 cursor-pointer ${
                          activePollVote === opt.originalIndex
                            ? "bg-white text-slate-900 border-white shadow-md scale-[1.01]"
                            : "bg-white/[0.03] hover:bg-white/[0.08] border-white/10 hover:border-primary/30 text-slate-205 hover:scale-[1.01]"
                        }`}
                      >
                        {language === 'FR' ? opt.label : (opt.labelEn || opt.label)}
                      </button>
                    ))}
                    {isChangingVote ? (
                      <div className="flex gap-2 mt-2">
                        <button
                          disabled={activePollVote === null || activePollVote === poll.votedOptionIndex}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            if (activePollVote !== null && poll.votedOptionIndex !== null) {
                              changeVotePoll(poll.votedOptionIndex, activePollVote);
                              setIsChangingVote(false);
                              showToast(language === 'FR' ? "Vote modifié avec succès !" : "Vote changed successfully!");
                            }
                          }}
                          className="flex-1 font-bold text-[10px] py-2 rounded-lg shadow transition-all hover:scale-[1.01] uppercase tracking-wider cursor-pointer disabled:cursor-not-allowed border bg-gradient-to-r from-green-500 to-emerald-600 text-white border-transparent disabled:opacity-40 disabled:bg-none disabled:border-white/5 disabled:text-slate-500"
                        >
                          {t("Confirmer", "Confirm")}
                        </button>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setIsChangingVote(false);
                            setActivePollVote(null);
                          }}
                          className="flex-1 font-bold text-[10px] py-2 rounded-lg shadow transition-all hover:scale-[1.01] uppercase tracking-wider cursor-pointer border bg-white/5 border-white/10 text-slate-350 hover:bg-white/10 hover:text-white"
                        >
                          {t("Annuler", "Cancel")}
                        </button>
                      </div>
                    ) : (
                      <button
                        disabled={activePollVote === null}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleVote();
                        }}
                        className="w-full font-bold text-xs py-2 rounded-lg mt-2 shadow transition-all hover:scale-[1.01] uppercase tracking-wider cursor-pointer disabled:cursor-not-allowed border bg-gradient-to-r from-primary to-accent hover:from-primary-hover hover:to-accent-hover text-white border-transparent disabled:opacity-40 disabled:bg-none disabled:border-white/5 disabled:text-slate-500"
                      >
                        {t("Valider mon vote", "Submit Vote")}
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2.5 mb-2">
                    {topPollOptions.map((opt) => {
                      const pct = totalPollVotes > 0 ? Math.round((opt.votes / totalPollVotes) * 100) : 0;
                      const isVoted = poll.votedOptionIndex === opt.originalIndex;
                      return (
                        <div key={opt.originalIndex} className="space-y-1">
                          <div className="flex justify-between text-xs font-bold">
                            <span className={isVoted ? "text-accent font-extrabold" : "text-slate-200"}>
                              {language === 'FR' ? opt.label : (opt.labelEn || opt.label)} {isVoted && "✔️"}
                            </span>
                            <span className={isVoted ? "text-accent font-extrabold" : "text-slate-350"}>{pct}%</span>
                          </div>
                          <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden border border-white/5">
                            <div 
                              className={`h-full rounded-full transition-all duration-1000 ${
                                isVoted 
                                  ? "bg-gradient-to-r from-primary to-accent glow-accent" 
                                  : "bg-slate-400/50"
                              }`}
                              style={{ width: `${pct}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                    <div className="flex items-center justify-between mt-2.5">
                      <p className="text-[8px] text-white/45 font-bold uppercase">
                        Total: {totalPollVotes.toLocaleString()} {t("votes", "votes")}
                      </p>
                      {canChangeVote ? (
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setIsChangingVote(true);
                            setActivePollVote(poll.votedOptionIndex);
                          }}
                          className="text-[9px] font-bold text-accent hover:text-accent-hover uppercase tracking-wider flex items-center gap-1 cursor-pointer border border-accent/20 hover:border-accent/40 bg-accent/5 px-2 py-0.5 rounded transition-all"
                        >
                          ✏️ {t("Changer vote", "Change vote")} ({getRemainingTimeText()})
                        </button>
                      ) : (
                        <span className="text-[8px] font-bold text-slate-500 uppercase tracking-wider">
                          🔒 {t("Vote finalisé", "Vote locked")}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="animate-in fade-in duration-200">
                <div className="relative mb-2.5">
                  <input 
                    type="text" 
                    placeholder={t("Rechercher un pays...", "Search a country...")}
                    value={searchCountryQuery}
                    onChange={(e) => setSearchCountryQuery(e.target.value)}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    className="w-full bg-white/5 border border-white/10 rounded-lg py-1.5 px-3 pl-8 text-xs text-white placeholder-slate-400 focus:bg-white/10 focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all"
                  />
                  <div className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  {searchCountryQuery && (
                    <button 
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setSearchCountryQuery("");
                      }}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-[10px] font-bold"
                    >
                      ✕
                    </button>
                  )}
                </div>

                <div className="space-y-1.5 overflow-y-auto pr-1 h-[200px] scrollbar-thin">
                  {filteredCountries.length === 0 ? (
                    <div className="text-center text-xs text-slate-500 py-6">
                      {t("Aucun pays trouvé.", "No countries found.")}
                    </div>
                  ) : (
                    filteredCountries.map(c => {
                      const votesCount = c.votes || 0;
                      const hasVotedAny = poll.votedOptionIndex !== null;
                      const userVotedForThis = poll.votedOptionIndex === c.originalIndex;
                      const isButtonDisabled = userVotedForThis || (hasVotedAny && !canChangeVote);

                      const name = language === 'FR' ? c.nameFr : c.nameEn;
                      const continent = language === 'FR' ? c.continentFr : c.continentEn;
                      const bestResult = language === 'FR' ? c.bestResultFr : c.bestResultEn;

                      return (
                        <div key={c.nameFr} className="bg-white/[0.02] border border-white/5 rounded-lg p-2 flex items-center justify-between transition-colors hover:bg-white/[0.04]">
                          <div className="flex items-center gap-2 min-w-0">
                            {renderTeamFlag(name || "", c.flag || "")}
                            <div className="min-w-0">
                              <div className="flex items-center gap-1">
                                <span className="text-[11px] font-bold text-white truncate">{name}</span>
                                <span className="text-[8px] bg-green-500/15 border border-green-500/30 text-green-400 px-1.5 py-0.2 rounded font-extrabold uppercase shrink-0">
                                  {continent}
                                </span>
                              </div>
                              <p className="text-[8px] text-slate-450 truncate">
                                {t("Meilleur : ", "Best: ")}{bestResult}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <div className="text-right">
                              <span className="text-[10px] font-extrabold text-accent">{votesCount.toLocaleString()}</span>
                              <span className="text-[7px] block text-slate-500 uppercase tracking-wider">{t("Soutiens", "Supports")}</span>
                            </div>
                            <button
                              disabled={isButtonDisabled}
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                if (hasVotedAny) {
                                  if (canChangeVote && poll.votedOptionIndex !== null) {
                                    const confirmMsg = language === "FR" 
                                      ? `Voulez-vous changer votre vote pour soutenir ${name} ?` 
                                      : `Do you want to change your vote to support ${name}?`;
                                    if (window.confirm(confirmMsg)) {
                                      changeVotePoll(poll.votedOptionIndex, c.originalIndex);
                                      showToast(language === "FR" ? `Vote changé pour ${name} !` : `Vote changed to ${name}!`);
                                    }
                                  }
                                } else {
                                  votePoll(c.originalIndex);
                                  showToast(language === "FR" ? `Opinion enregistrée pour ${name} !` : `Opinion registered for ${name}!`);
                                }
                              }}
                              className={`w-6 h-6 rounded border flex items-center justify-center transition-all ${
                                userVotedForThis
                                  ? "bg-accent border-accent text-white opacity-90 shadow-[0_0_8px_rgba(244,63,94,0.3)]"
                                  : isButtonDisabled
                                  ? "bg-white/[0.02] border-white/5 text-slate-600 cursor-not-allowed opacity-50"
                                  : "bg-white/5 border-white/10 text-slate-350 hover:bg-accent/20 hover:border-accent/40 hover:text-white cursor-pointer"
                              }`}
                              title={userVotedForThis ? t("Vous soutenez ce pays", "You support this country") : t("Soutenir ce pays", "Support this country")}
                            >
                              {userVotedForThis ? (
                                <CheckCircle2 size={10} className="text-white" />
                              ) : (
                                <ThumbsUp size={9} />
                              )}
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const trendingArticles = globalVisibleArticles.slice(0, 3);

  return (
    <div className={`min-h-screen flex flex-col bg-background font-sans text-slate-200 ${immersiveMode ? "" : "bg-grid-pattern"}`}>
      <Header />
      
      <div className="bg-[#12131C]/35 border-b border-white/5 py-4 px-4 sm:px-6 lg:px-8 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          
          <div className="flex items-center gap-3 relative">
            <div 
              onClick={() => {
                setShowAppLauncher(!showAppLauncher);
                setShowSettingsDropdown(false);
              }}
              className="grid grid-cols-3 gap-1 w-5 h-5 cursor-pointer opacity-70 hover:opacity-100 transition-opacity"
              title="Menu des applications"
            >
              {[...Array(9)].map((_, i) => (
                <div key={i} className="w-1.5 h-1.5 bg-slate-400 rounded-sm"></div>
              ))}
            </div>

            {showAppLauncher && (
              <div className="absolute left-0 top-full mt-3 w-56 bg-slate-900 border border-white/10 rounded-2xl shadow-popover z-50 p-4 space-y-3">
                <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  {t("Navigation Rapide", "Quick Navigation")}
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  <Link href="/" className="flex flex-col items-center gap-1.5 p-2.5 hover:bg-white/5 rounded-xl text-center text-[10px] font-semibold text-slate-200">
                    <span className="text-base">🏠</span> {t("Accueil", "Home")}
                  </Link>
                  <Link href="/journalist" className="flex flex-col items-center gap-1.5 p-2.5 hover:bg-white/5 rounded-xl text-center text-[10px] font-semibold text-slate-200">
                    <span className="text-base">✍️</span> {t("Rédaction", "Editor")}
                  </Link>
                  <Link href="/admin" className="flex flex-col items-center gap-1.5 p-2.5 hover:bg-white/5 rounded-xl text-center text-[10px] font-semibold text-slate-200">
                    <span className="text-base">🛡️</span> {t("Modération", "Admin")}
                  </Link>
                  <Link href="/onboarding" className="flex flex-col items-center gap-1.5 p-2.5 hover:bg-white/5 rounded-xl text-center text-[10px] font-semibold text-slate-200">
                    <span className="text-base">👤</span> {t("Profil", "Profile")}
                  </Link>
                </div>
              </div>
            )}
          </div>

          <div className="w-full max-w-xl relative flex items-center">
            <input 
              type="text" 
              placeholder={t("Rechercher sur le Web ou sur Komentel...", "Search the web or Komentel...")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-full py-2.5 pl-11 pr-20 text-xs text-white placeholder-slate-400 focus:bg-white/10 focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all shadow-inner"
            />
            <div className="absolute left-4 text-slate-455">
              <Mic size={14} className="cursor-pointer hover:text-white" />
            </div>
            
            <div className="absolute right-4 flex items-center gap-2">
              <svg className="w-5 h-5 cursor-pointer" viewBox="0 0 24 24" fill="none">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" fill="#4F46E5" />
                <path d="M12 2C8 6 4 10 12 22c8-12 4-16 0-20z" fill="#F43F5E" className="opacity-70" />
              </svg>
            </div>
          </div>

          <div className="flex items-center gap-5 text-xs text-slate-400">
            {showWeather && (
              <>
                <div 
                  onClick={toggleTempUnit}
                  className="flex items-center gap-1.5 cursor-pointer hover:text-white transition-colors bg-white/5 px-2.5 py-1 rounded-md"
                  title={t("Changer d'unité de température", "Change temperature unit")}
                >
                  <CloudSun size={16} className="text-yellow-500" />
                  <span className="font-semibold">Dakar, {tempUnit === 'C' ? '24°C' : '75°F'}</span>
                </div>
                <span className="text-white/10">|</span>
              </>
            )}
            
            <div 
              onClick={toggleLanguage}
              className="flex items-center gap-1 cursor-pointer hover:text-white transition-colors bg-white/5 px-2.5 py-1 rounded-md"
              title={t("Changer la langue", "Change language")}
            >
              <Globe size={14} />
              <span className="uppercase font-bold">{language}</span>
            </div>
            <span className="text-white/10">|</span>
            
            <div className="relative">
              <Settings 
                size={14} 
                onClick={() => {
                  setShowSettingsDropdown(!showSettingsDropdown);
                  setShowAppLauncher(false);
                }}
                className="cursor-pointer hover:text-white transition-colors" 
              />
              {showSettingsDropdown && (
                <div className="absolute right-0 top-full mt-3 w-64 bg-slate-900 border border-white/10 rounded-2xl shadow-popover z-50 p-4 space-y-3">
                  <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    {t("Réglages du Portail", "Portal Settings")}
                  </h4>
                  <div className="space-y-3">
                    <label className="flex items-center justify-between text-xs text-slate-350 cursor-pointer">
                      <span>{t("Afficher la météo", "Show Weather")}</span>
                      <input type="checkbox" checked={showWeather} onChange={(e) => setShowWeather(e.target.checked)} className="rounded border-white/10 text-primary focus:ring-primary" />
                    </label>
                    <label className="flex items-center justify-between text-xs text-slate-350 cursor-pointer">
                      <span>{t("Activer le mode immersif", "Enable Immersive Mode")}</span>
                      <input type="checkbox" checked={immersiveMode} onChange={(e) => setImmersiveMode(e.target.checked)} className="rounded border-white/10 text-primary focus:ring-primary" />
                    </label>
                    <label className="flex items-center justify-between text-xs text-slate-350 cursor-pointer">
                      <span>{t("Activer les notifications", "Enable Notifications")}</span>
                      <input type="checkbox" checked={enableNotifications} onChange={(e) => setEnableNotifications(e.target.checked)} className="rounded border-white/10 text-primary focus:ring-primary" />
                    </label>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-[#12131C]/65 backdrop-blur-md border-b border-white/5 sticky top-20 z-40 shadow-premium py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-2">
          
          {/* Row 1: Logo, Continents (Main Nav) and right actions */}
          <div className="flex items-center justify-between gap-4 h-11">
            <div className="flex items-center gap-3 flex-shrink-0 select-none">
              <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="komentel-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#6366F1" />
                    <stop offset="100%" stopColor="#F43F5E" />
                  </linearGradient>
                </defs>
                <rect x="3" y="3" width="18" height="18" rx="5" fill="url(#komentel-grad)" className="opacity-20" />
                <path d="M16 8H8a2 2 0 00-2 2v8l3-3h7a2 2 0 002-2v-3a2 2 0 00-2-2zm-6-2h8a2 2 0 012 2v3a2 2 0 01-2 2h-1l-3 3" stroke="url(#komentel-grad)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <div className="flex items-center font-sans tracking-tight">
                <span className="font-serif text-base font-bold tracking-tight text-white hover:text-primary transition-colors uppercase">
                  Komentel
                </span>
              </div>
            </div>

            <div className="flex-1 overflow-x-auto flex items-center gap-4 scrollbar-none px-4">
              {continents.map(cont => {
                const isActive = selectedContinent === cont;
                const displayLabel = cont === "Monde" ? t("Découvrir", "Discover") : translateContinentLocal(cont);
                const emoji = cont === "Monde" ? "🌐" : cont === "Afrique" ? "🌍" : cont === "Europe" ? "🇪🇺" : cont === "Amériques" ? "🌎" : cont === "Sénégal" ? "🇸🇳" : cont === "Moyen-Orient" ? "🧭" : cont === "Asie-Pacifique" ? "🌏" : "";
                return (
                  <button
                    key={cont}
                    onClick={() => setSelectedContinent(cont)}
                    className={`pb-1 pt-1 text-[11px] font-bold transition-all focus:outline-none whitespace-nowrap flex-shrink-0 cursor-pointer flex items-center gap-1 ${
                      isActive
                        ? "text-primary border-b-2 border-primary"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <span>{emoji}</span>
                    <span>{displayLabel.toUpperCase()}</span>
                  </button>
                );
              })}
            </div>

            <div className="hidden lg:flex items-center gap-2 flex-shrink-0">
              <button 
                onClick={toggleLayoutMode}
                className={`flex items-center gap-1.5 bg-white/5 hover:bg-white/10 text-[9px] font-bold text-slate-350 px-3 py-1.5 rounded-full border transition-all cursor-pointer ${
                  layoutMode === 'LIST' ? 'border-primary text-primary' : 'border-white/5'
                }`}
              >
                <Sliders size={11} />
                {t("Flux : ", "Feed: ") + (layoutMode === 'GRID' ? t("Grille", "Grid") : t("Liste", "List"))}
              </button>
              <button 
                onClick={() => setShowPersonalizeModal(true)}
                className="flex items-center gap-1.5 bg-white/5 hover:bg-white/10 text-[9px] font-bold text-slate-350 px-3 py-1.5 rounded-full border border-white/5 transition-all cursor-pointer"
              >
                <Star size={11} className="text-yellow-500 fill-yellow-500" />
                {t("Personnaliser", "Customize")}
              </button>
            </div>
          </div>

          {/* Row 2: Centres d'intérêt sub-filter pills */}
          <div className="flex items-center border-t border-white/5 pt-2 h-9 relative">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider select-none w-28 shrink-0 border-r border-white/5 pr-2 mr-2">
              📝 {t("Sujets :", "Topics:")}
            </span>
            <div className="flex-1 overflow-x-auto flex items-center gap-3 scrollbar-none pr-2">
              {categories.map(cat => {
                const isActive = selectedCategory === cat;
                const displayLabel = cat === "Toutes" ? t("Tous les sujets", "All Topics") : translateCategoryLocal(cat);
                const emoji = cat === "Toutes" ? "🌎" : cat === "Actualités" ? "📰" : cat === "Sport" ? "⚽" : cat === "Santé" ? "🩺" : cat === "Éducation" ? "🎓" : cat === "Technologie" ? "💻" : cat === "Culture" ? "🎨" : cat === "International" ? "🌍" : cat === "Business" ? "📈" : "";
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`text-[10px] font-bold py-1 px-3.5 rounded-full border transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                      isActive
                        ? "bg-primary text-white border-primary shadow-[0_0_10px_rgba(99,102,241,0.25)]"
                        : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10"
                    }`}
                  >
                    <span>{emoji}</span>
                    <span>{displayLabel}</span>
                  </button>
                );
              })}
            </div>

            {user && (
              <div className="relative shrink-0 ml-2">
                <button
                  onClick={() => setShowSubjectsDropdown(!showSubjectsDropdown)}
                  className="text-[9px] font-extrabold py-1 px-3 rounded-full border bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10 cursor-pointer flex items-center gap-1 uppercase tracking-wider transition-all"
                >
                  <span>⚙️</span>
                  <span>{t("Personnaliser", "Customize")}</span>
                </button>
                
                {showSubjectsDropdown && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-popover z-50 p-3 space-y-2 text-left">
                    <h4 className="text-[9px] font-bold text-slate-500 uppercase tracking-wider border-b border-white/5 pb-1 mb-2">
                      {t("Mes Sujets", "My Topics")}
                    </h4>
                    <div className="space-y-1 max-h-48 overflow-y-auto scrollbar-thin">
                      {allCategories.map(cat => {
                        const isSelected = user.interests ? user.interests.includes(cat) : false;
                        return (
                          <label
                            key={cat}
                            className="flex items-center justify-between text-xs text-slate-300 hover:text-white cursor-pointer py-1 px-1.5 rounded hover:bg-white/5"
                          >
                            <span>{cat}</span>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => {
                                const currentInterests = user.interests || [];
                                const updated = isSelected
                                  ? currentInterests.filter(i => i !== cat)
                                  : [...currentInterests, cat];
                                updateInterests(updated);
                              }}
                              className="rounded border-white/10 text-primary focus:ring-primary h-3.5 w-3.5 cursor-pointer"
                            />
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full relative animate-in fade-in duration-300">
        <div className="absolute top-10 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[120px] pointer-events-none -z-10"></div>
        


        {searchQuery.trim().length > 0 ? (
          <div>
            <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-6">
              <h2 className="font-serif text-2xl font-bold text-white">
                {t("Résultats pour : ", "Results for: ")} "{searchQuery}"
              </h2>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                {filteredArticles.length} {t("article", "article")}{filteredArticles.length > 1 ? "s" : ""} {t("trouvé", "found")}{filteredArticles.length > 1 ? "s" : ""}
              </span>
            </div>

            {filteredArticles.length === 0 ? (
              <div className="portal-card p-12 text-center text-slate-400 text-sm shadow-premium">
                {t("Aucun article ne correspond à votre recherche.", "No articles match your search query.")}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredArticles.map(art => (
                  <article 
                    key={art.id} 
                    className="portal-card overflow-hidden group flex flex-col shadow-premium cursor-pointer"
                    onClick={(e) => handleCardClick(e, art.id)}
                  >
                    <div className="relative h-48 overflow-hidden">
                      <img 
                        src={art.imageUrl} 
                        alt={language === 'FR' ? art.title : (art.titleEn || art.title)} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                      />
                      <div className="absolute top-3 left-3 bg-primary/95 text-white text-[9px] font-extrabold uppercase px-2 py-0.5 rounded shadow">
                        {language === 'FR' ? art.category : (art.categoryEn || art.category)}
                      </div>
                      {renderDuelBadge(art.id)}
                    </div>
                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="text-[9px] text-slate-455 uppercase font-bold tracking-wider mb-2">
                          {art.sourceName} • {art.publishedAt}
                        </div>
                        <h3 className="font-serif text-base font-bold text-white mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                          <Link href={`/article/${art.id}`}>
                            {language === 'FR' ? art.title : (art.titleEn || art.title)}
                          </Link>
                        </h3>
                        <p className="text-xs text-slate-455 line-clamp-3 mb-4 leading-relaxed">
                          {language === 'FR' ? art.summary : (art.summaryEn || art.summary)}
                        </p>
                      </div>
                      <div className="flex items-center justify-between pt-3 border-t border-white/5">
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] text-slate-500 font-bold uppercase">{art.readTime}</span>
                          <span className="text-white/10">•</span>
                          <Link 
                            href={`/article/${art.id}#comments`}
                            className="flex items-center gap-1 text-[10px] text-primary hover:text-primary-hover font-bold transition-colors"
                          >
                            <MessageSquare size={10} className="text-primary" />
                            <span>{art.commentsCount}</span>
                          </Link>
                        </div>
                        <Link 
                          href={`/article/${art.id}`}
                          className="text-[10px] text-primary hover:text-primary-hover font-extrabold flex items-center gap-1 uppercase tracking-wider transition-colors"
                        >
                          {t("Lire l'article", "Read Article")} <ArrowRight size={10} />
                        </Link>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-10">
            
            <div className="pb-8 border-b border-white/5 space-y-6">
              <div className="flex items-center gap-2 border-l-4 border-primary pl-3">
                <h2 className="font-serif text-xl sm:text-2xl font-bold text-white leading-none">
                  {t("Débats & Opinions", "Debates & Opinions")}
                </h2>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {renderPollCard(false)}

                <div className="portal-card p-5 shadow-premium flex flex-col justify-between h-[350px]">
                  <div className="flex flex-col h-full justify-between">
                    <div>
                      <h3 className="font-serif text-xs font-bold text-white pb-2 border-b border-white/5 mb-3 flex items-center justify-between uppercase tracking-wider">
                        <span className="flex items-center gap-1.5">
                          <Flame size={13} className="text-accent animate-pulse" />
                          {t("Duels en cours", "Active Duels")}
                        </span>
                        <span className="text-[8px] bg-primary/20 text-primary border border-primary/20 rounded px-1 py-0.5">
                          Live
                        </span>
                      </h3>
                      
                      {activeDuels.length > 0 ? (
                        <div className="space-y-2.5 max-h-[265px] overflow-y-auto pr-1 scrollbar-thin">
                          {activeDuels.map(d => (
                            <div key={d.id} className="portal-item p-3 space-y-2 transition-colors">
                              <div className="text-[9px] font-bold text-slate-400 uppercase leading-none truncate">
                                {d.articleTitle}
                              </div>
                              <div className="flex justify-between items-center text-xs font-extrabold text-slate-205">
                                <span className="text-white truncate max-w-[100px]">{d.challenger}</span>
                                <span className="text-accent font-black tracking-widest text-[9px] shrink-0">VS</span>
                                <span className="text-white truncate max-w-[100px]">{d.defender}</span>
                              </div>
                              
                              <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden flex">
                                <div className="h-full bg-primary glow-indigo" style={{ width: "47%" }}></div>
                                <div className="h-full bg-accent glow-accent" style={{ width: "53%" }}></div>
                              </div>
                              
                              <Link 
                                href={`/duel/${d.id}`}
                                className="block text-center w-full border border-white/10 bg-white/5 hover:bg-primary hover:text-white hover:border-primary text-[9px] font-bold py-1.5 rounded-lg transition-all shadow uppercase tracking-wider"
                              >
                                {t("Rejoindre le débat", "Join Debate")}
                              </Link>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-6 text-center text-xs text-slate-500 bg-white/5 rounded-lg border border-white/5">
                          {t("Aucun duel actif pour le moment.", "No active duels at this time.")}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {layoutMode === 'LIST' ? (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                <div className="lg:col-span-8 space-y-6">
                  {displayedArticles.length === 0 ? (
                    <div className="portal-card p-12 text-center text-slate-400 text-sm shadow-premium animate-pulse">
                      {t("Aucun article disponible.", "No articles available.")}
                    </div>
                  ) : (
                    displayedArticles.map(art => (
                      <article 
                        key={art.id} 
                        className="portal-card flex flex-col md:flex-row gap-6 p-5 overflow-hidden shadow-premium group cursor-pointer"
                        onClick={(e) => handleCardClick(e, art.id)}
                      >
                        <div className="md:w-1/3 relative h-48 md:h-auto min-h-[160px] rounded-xl overflow-hidden shadow-md">
                          <img 
                            src={art.imageUrl} 
                            alt={language === 'FR' ? art.title : (art.titleEn || art.title)} 
                            className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500" 
                          />
                          <div className="absolute top-3 left-3 bg-primary text-white text-[9px] font-bold px-2.5 py-0.5 rounded shadow">
                            {language === 'FR' ? art.category : (art.categoryEn || art.category)}
                          </div>
                          {renderDuelBadge(art.id)}
                        </div>
                        <div className="md:w-2/3 flex flex-col justify-between">
                          <div>
                            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-2">
                              {art.sourceName} • {art.publishedAt}
                            </div>
                            <h3 className="font-serif text-lg font-bold text-white group-hover:text-primary transition-colors leading-snug mb-3">
                              <Link href={`/article/${art.id}`}>
                                {language === 'FR' ? art.title : (art.titleEn || art.title)}
                              </Link>
                            </h3>
                            <p className="text-xs text-slate-455 line-clamp-3 mb-4 leading-relaxed">
                              {language === 'FR' ? art.summary : (art.summaryEn || art.summary)}
                            </p>
                          </div>
                          
                          <div className="flex items-center justify-between pt-3.5 border-t border-white/5">
                            <span className="text-[10px] text-slate-500 font-bold uppercase">{art.readTime}</span>
                            <div className="flex items-center gap-4">
                              <Link 
                                href={`/article/${art.id}#comments`}
                                className="flex items-center gap-1.5 text-[10px] text-primary hover:text-primary-hover font-bold transition-colors"
                              >
                                <MessageSquare size={10} className="text-primary" />
                                <span>{art.commentsCount} {t("Commentaires", "Comments")}</span>
                              </Link>
                              <Link 
                                href={`/article/${art.id}`}
                                className="text-[10px] text-primary hover:text-primary-hover font-extrabold flex items-center gap-1 uppercase tracking-wider transition-colors"
                              >
                                {t("Lire l'article", "Read Article")} <ArrowRight size={10} />
                              </Link>
                            </div>
                          </div>
                        </div>
                      </article>
                    ))
                  )}
                </div>

                <div className="lg:col-span-4 space-y-8">
                  <div className="portal-card self-start p-4.5 shadow-premium flex flex-col justify-between min-h-[420px] h-auto w-full">
                    <div>
                      <div className="flex items-center justify-between pb-3 border-b border-white/5 mb-3">
                        <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5 border-l-2 border-primary pl-2">
                          <Trophy size={13} className="text-yellow-500" />
                          {t("Matchs en direct", "Live Matches")}
                        </h3>
                        <div className="flex gap-2 items-center relative">
                          <span title={t("Rafraîchir les scores", "Refresh scores")} className="flex items-center"><RefreshCw 
                            size={12} 
                            onClick={handleRefresh}
                            className={`text-slate-500 cursor-pointer hover:text-white transition-all ${isRefreshing ? "animate-spin text-primary" : ""}`}
                          /></span>
                          <span title="Coupe du Monde de la FIFA 2026">
                            <Info size={12} className="text-slate-500 cursor-pointer hover:text-white" />
                          </span>
                          <div className="relative flex items-center">
                            <MoreHorizontal 
                              size={12} 
                              onClick={() => {
                                setShowMatchesMenu1(!showMatchesMenu1);
                                setShowMatchesMenu2(false);
                                setShowTrendingMenu(false);
                              }}
                              className="text-slate-500 cursor-pointer hover:text-white" 
                            />
                            {showMatchesMenu1 && (
                              <div className="absolute right-0 top-full mt-2 w-48 bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-popover z-50 py-1.5 text-left">
                                <button
                                  onClick={() => {
                                    resetSimulatedMatches();
                                    showToast(language === "FR" ? "Simulation réinitialisée !" : "Simulation reset!");
                                    setShowMatchesMenu1(false);
                                  }}
                                  className="w-full text-left px-3 py-1.5 text-[11px] text-slate-300 hover:text-white hover:bg-white/5 transition-colors font-sans cursor-pointer"
                                >
                                  🔄 {t("Réinitialiser simulation", "Reset simulation")}
                                </button>
                                <button
                                  onClick={() => {
                                    setShowAllMatches(!showAllMatches);
                                    setShowMatchesMenu1(false);
                                  }}
                                  className="w-full text-left px-3 py-1.5 text-[11px] text-slate-300 hover:text-white hover:bg-white/5 transition-colors font-sans cursor-pointer"
                                >
                                  📊 {showAllMatches ? t("Afficher moins (3)", "Show less (3)") : t("Afficher tout", "Show all")}
                                </button>
                                <Link
                                  href="/sport"
                                  onClick={() => setShowMatchesMenu1(false)}
                                  className="block text-left px-3 py-1.5 text-[11px] text-slate-300 hover:text-white hover:bg-white/5 transition-colors font-sans"
                                >
                                  ⚽ {t("Accéder à l'espace Sports", "Go to Sports Space")}
                                </Link>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3.5 mt-2">
                        {currentMatches.map((m, idx) => {
                          const isLive = m.status === "EN DIRECT";
                          return (
                            <div key={idx} className="portal-item p-3 flex items-center justify-between text-xs font-semibold">
                              <div className="flex flex-col gap-1.5 w-1/2">
                                <div className="flex items-center gap-2">
                                  {renderTeamFlag(m.homeTeam.name, m.homeTeam.flag)}
                                  <span className="text-[11px] font-bold text-slate-200">{m.homeTeam.name}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  {renderTeamFlag(m.awayTeam.name, m.awayTeam.flag)}
                                  <span className="text-[11px] font-bold text-slate-200">{m.awayTeam.name}</span>
                                </div>
                              </div>
                              <div className="flex flex-col items-end justify-center w-1/2 text-right">
                                <span className="font-extrabold text-[13px] text-white tracking-wide">{m.score}</span>
                                <div className="flex items-center gap-1 mt-1 text-[9px] uppercase tracking-wider font-bold">
                                  {isLive ? (
                                    <>
                                      <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-ping"></span>
                                      <span className="text-accent">{translateMatchStatus(m.status)}</span>
                                    </>
                                  ) : (
                                    <span className="text-slate-500">{translateMatchStatus(m.status)}</span>
                                  )}
                                  <span className="text-slate-400">• {translateMatchDetail(m.detail)}</span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-white/5">
                      <div className="flex items-center gap-1">
                        {[...Array(4)].map((_, i) => (
                          <span key={i} className={`w-1.5 h-1.5 rounded-full ${i === 0 ? "bg-white" : "bg-white/20"}`}></span>
                        ))}
                      </div>
                      <Link 
                        href="/sport"
                        className="text-[10px] font-bold text-primary hover:text-white uppercase tracking-wider transition-colors cursor-pointer"
                      >
                        {t("Afficher plus", "Show more")}
                      </Link>
                    </div>
                  </div>

                  {renderPollCard(true)}
                </div>

              </div>
            ) : (
              <div className="space-y-10">
                
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  
                  <div 
                    className="portal-card image-overlay-card lg:col-span-6 relative overflow-hidden h-[420px] shadow-premium group cursor-pointer"
                    onClick={(e) => handleCardClick(e, carouselArticles[currentSlideIndex].id)}
                  >
                    {carouselArticles.length > 0 && (
                      <>
                        <img 
                          src={carouselArticles[currentSlideIndex].imageUrl} 
                          alt={carouselArticles[currentSlideIndex].title} 
                          className="absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-in-out scale-100 group-hover:scale-103"
                        />
                        
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/75 to-transparent z-10"></div>
                        
                        <button 
                          onClick={handlePrevSlide}
                          className="absolute left-4 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/60 border border-white/10 text-white rounded-full flex items-center justify-center hover:bg-primary hover:scale-105 active:scale-95 transition-all z-20 opacity-0 group-hover:opacity-100 cursor-pointer"
                        >
                          <ChevronLeft size={16} />
                        </button>
                        <button 
                          onClick={handleNextSlide}
                          className="absolute right-4 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/60 border border-white/10 text-white rounded-full flex items-center justify-center hover:bg-primary hover:scale-105 active:scale-95 transition-all z-20 opacity-0 group-hover:opacity-100 cursor-pointer"
                        >
                          <ChevronRight size={16} />
                        </button>
                        {renderDuelBadge(carouselArticles[currentSlideIndex].id)}

                        <div className="absolute bottom-6 left-6 right-6 z-20 flex flex-col justify-end">
                          <span className="inline-block bg-accent text-white text-[9px] font-extrabold uppercase px-2.5 py-0.5 rounded tracking-wider mb-2.5 w-max">
                            {language === 'FR' ? carouselArticles[currentSlideIndex].category : (carouselArticles[currentSlideIndex].categoryEn || carouselArticles[currentSlideIndex].category)}
                          </span>
                          <h2 className="font-serif text-xl sm:text-2xl font-bold text-white hover:text-primary transition-colors leading-snug tracking-tight mb-4 drop-shadow-md">
                            <Link href={`/article/${carouselArticles[currentSlideIndex].id}`}>
                              {language === 'FR' ? carouselArticles[currentSlideIndex].title : (carouselArticles[currentSlideIndex].titleEn || carouselArticles[currentSlideIndex].title)}
                            </Link>
                          </h2>

                          <div className="flex items-center justify-between border-t border-white/15 pt-4 mt-2">
                            <div className="flex items-center gap-3">
                              <button 
                                onClick={(e) => handleLikeCard(e, carouselArticles[currentSlideIndex].id)}
                                className={`flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full transition-colors cursor-pointer border ${carouselArticles[currentSlideIndex].userReaction === "like" ? "bg-blue-600/35 border-blue-500 text-blue-300" : "bg-white/15 border-white/10 text-white hover:bg-primary"}`}
                              >
                                <ThumbsUp size={10} />
                                <span>{carouselArticles[currentSlideIndex].reactions.like}</span>
                              </button>
                              <button 
                                onClick={(e) => handleDislikeCard(e, carouselArticles[currentSlideIndex].id)}
                                className={`flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full transition-colors cursor-pointer border ${carouselArticles[currentSlideIndex].userReaction === "sad" ? "bg-red-600/35 border-red-500 text-red-300" : "bg-white/15 border-white/10 text-white hover:bg-accent"}`}
                              >
                                <ThumbsDown size={10} />
                                <span>{carouselArticles[currentSlideIndex].reactions.sad}</span>
                              </button>
                            </div>

                            <div className="flex items-center gap-1.5">
                              {carouselArticles.map((_, i) => (
                                <button
                                  key={i}
                                  onClick={(e) => {
                                    e.preventDefault();
                                    setCurrentSlideIndex(i);
                                  }}
                                  className={`w-2 h-2 rounded-full transition-all cursor-pointer ${
                                    i === currentSlideIndex 
                                      ? "bg-white scale-125" 
                                      : "bg-white/40 hover:bg-white/70"
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="lg:col-span-3 md:col-span-6 col-span-12">
                    {displayedArticles[1] && (
                      <article 
                        className="portal-card flex flex-col h-[420px] overflow-hidden shadow-premium group justify-between cursor-pointer"
                        onClick={(e) => handleCardClick(e, displayedArticles[1].id)}
                      >
                        <div className="relative h-[180px] overflow-hidden">
                          <img 
                            src={displayedArticles[1].imageUrl} 
                            alt={language === 'FR' ? displayedArticles[1].title : (displayedArticles[1].titleEn || displayedArticles[1].title)} 
                            className="w-full h-full object-cover group-hover:scale-104 transition-transform duration-500"
                          />
                          <div className="absolute top-3 left-3 bg-primary text-white text-[9px] font-bold px-2 py-0.5 rounded tracking-wide">
                            {language === 'FR' ? displayedArticles[1].category : (displayedArticles[1].categoryEn || displayedArticles[1].category)}
                          </div>
                          {renderDuelBadge(displayedArticles[1].id)}
                        </div>

                        <div className="p-4 flex-1 flex flex-col justify-between">
                          <div>
                            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-2">
                              {displayedArticles[1].sourceName} • {displayedArticles[1].publishedAt}
                            </div>
                            <h3 className="font-sans text-xs sm:text-sm font-bold text-white group-hover:text-primary transition-colors leading-snug line-clamp-4">
                              <Link href={`/article/${displayedArticles[1].id}`}>
                                {language === 'FR' ? displayedArticles[1].title : (displayedArticles[1].titleEn || displayedArticles[1].title)}
                              </Link>
                            </h3>
                          </div>

                          <div className="flex items-center justify-between pt-3 border-t border-white/5">
                            <div className="flex items-center gap-2">
                              <button 
                                onClick={(e) => handleLikeCard(e, displayedArticles[1].id)}
                                className={`flex items-center gap-1 text-[10px] transition-colors ${displayedArticles[1].userReaction === "like" ? "text-blue-500 font-bold" : "text-slate-400 hover:text-white"}`}
                              >
                                <ThumbsUp size={11} /> {displayedArticles[1].reactions.like}
                              </button>
                              <button 
                                onClick={(e) => handleDislikeCard(e, displayedArticles[1].id)}
                                className={`flex items-center gap-1 text-[10px] transition-colors ${displayedArticles[1].userReaction === "sad" ? "text-red-500 font-bold" : "text-slate-400 hover:text-white"}`}
                              >
                                <ThumbsDown size={11} /> {displayedArticles[1].reactions.sad}
                              </button>
                            </div>
                            
                            <Link 
                              href={`/article/${displayedArticles[1].id}#comments`}
                              className="flex items-center gap-1 text-[10px] text-primary hover:text-primary-hover font-bold transition-colors"
                            >
                              <MessageSquare size={10} className="text-primary" />
                              <span>{displayedArticles[1].commentsCount}</span>
                            </Link>
                          </div>
                        </div>
                      </article>
                    )}
                  </div>

                  <div className="portal-card lg:col-span-3 md:col-span-6 col-span-12 self-start p-4.5 shadow-premium flex flex-col justify-between min-h-[420px] h-auto">
                    <div>
                      <div className="flex items-center justify-between pb-3 border-b border-white/5 mb-3">
                        <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5 border-l-2 border-primary pl-2">
                          <Trophy size={13} className="text-yellow-500" />
                          {t("Matchs en direct", "Live Matches")}
                        </h3>
                        <div className="flex gap-2 items-center relative">
                          <span title={t("Rafraîchir les scores", "Refresh scores")} className="flex items-center"><RefreshCw 
                            size={12} 
                            onClick={handleRefresh}
                            className={`text-slate-500 cursor-pointer hover:text-white transition-all ${isRefreshing ? "animate-spin text-primary" : ""}`}
                          /></span>
                          <span title="Coupe du Monde de la FIFA 2026">
                            <Info size={12} className="text-slate-500 cursor-pointer hover:text-white" />
                          </span>
                          <div className="relative flex items-center">
                            <MoreHorizontal 
                              size={12} 
                              onClick={() => {
                                setShowMatchesMenu2(!showMatchesMenu2);
                                setShowMatchesMenu1(false);
                                setShowTrendingMenu(false);
                              }}
                              className="text-slate-500 cursor-pointer hover:text-white" 
                            />
                            {showMatchesMenu2 && (
                              <div className="absolute right-0 top-full mt-2 w-48 bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-popover z-50 py-1.5 text-left">
                                <button
                                  onClick={() => {
                                    resetSimulatedMatches();
                                    showToast(language === "FR" ? "Simulation réinitialisée !" : "Simulation reset!");
                                    setShowMatchesMenu2(false);
                                  }}
                                  className="w-full text-left px-3 py-1.5 text-[11px] text-slate-300 hover:text-white hover:bg-white/5 transition-colors font-sans cursor-pointer"
                                >
                                  🔄 {t("Réinitialiser simulation", "Reset simulation")}
                                </button>
                                <button
                                  onClick={() => {
                                    setShowAllMatches(!showAllMatches);
                                    setShowMatchesMenu2(false);
                                  }}
                                  className="w-full text-left px-3 py-1.5 text-[11px] text-slate-300 hover:text-white hover:bg-white/5 transition-colors font-sans cursor-pointer"
                                >
                                  📊 {showAllMatches ? t("Afficher moins (3)", "Show less (3)") : t("Afficher tout", "Show all")}
                                </button>
                                <Link
                                  href="/sport"
                                  onClick={() => setShowMatchesMenu2(false)}
                                  className="block text-left px-3 py-1.5 text-[11px] text-slate-300 hover:text-white hover:bg-white/5 transition-colors font-sans"
                                >
                                  ⚽ {t("Accéder à l'espace Sports", "Go to Sports Space")}
                                </Link>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3.5 mt-2">
                        {currentMatches.map((m, idx) => {
                          const isLive = m.status === "EN DIRECT";
                          return (
                            <div key={idx} className="portal-item p-3 flex items-center justify-between text-xs font-semibold">
                              <div className="flex flex-col gap-1.5 w-1/2">
                                <div className="flex items-center gap-2">
                                  {renderTeamFlag(m.homeTeam.name, m.homeTeam.flag)}
                                  <span className="text-[11px] font-bold text-slate-200">{m.homeTeam.name}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  {renderTeamFlag(m.awayTeam.name, m.awayTeam.flag)}
                                  <span className="text-[11px] font-bold text-slate-200">{m.awayTeam.name}</span>
                                </div>
                              </div>

                              <div className="flex flex-col items-end justify-center w-1/2 text-right">
                                <span className="font-extrabold text-[13px] text-white tracking-wide">{m.score}</span>
                                <div className="flex items-center gap-1 mt-1 text-[9px] uppercase tracking-wider font-bold">
                                  {isLive ? (
                                    <>
                                      <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-ping"></span>
                                      <span className="text-accent">{translateMatchStatus(m.status)}</span>
                                    </>
                                  ) : (
                                    <span className="text-slate-500">{translateMatchStatus(m.status)}</span>
                                  )}
                                  <span className="text-slate-400">• {translateMatchDetail(m.detail)}</span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3.5 border-t border-white/5 mt-4">
                      <div className="flex items-center gap-1">
                        {[...Array(4)].map((_, i) => (
                          <span key={i} className={`w-1.5 h-1.5 rounded-full ${i === 0 ? "bg-white" : "bg-white/20"}`}></span>
                        ))}
                      </div>
                      <Link 
                        href="/sport"
                        className="text-[10px] font-bold text-primary hover:text-white uppercase tracking-wider transition-colors cursor-pointer"
                      >
                        {t("Afficher plus", "Show more")}
                      </Link>
                    </div>
                  </div>

                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  
                  <div className="portal-card lg:col-span-3 md:col-span-6 col-span-12 p-5 shadow-premium flex flex-col justify-between h-[390px]">
                    <div>
                      <div className="flex items-center justify-between pb-3 border-b border-white/5 mb-4">
                        <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5 border-l-2 border-accent pl-2">
                          <Flame size={13} className="text-accent animate-pulse" />
                          {t("À la une", "Trending News")}
                        </h3>
                        <div className="relative flex items-center">
                          <MoreHorizontal 
                            size={12} 
                            onClick={() => {
                              setShowTrendingMenu(!showTrendingMenu);
                              setShowMatchesMenu1(false);
                              setShowMatchesMenu2(false);
                            }}
                            className="text-slate-500 cursor-pointer hover:text-white" 
                          />
                          {showTrendingMenu && (
                            <div className="absolute right-0 top-full mt-2 w-48 bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-popover z-50 py-1.5 text-left">
                              <button
                                onClick={async () => {
                                  setShowTrendingMenu(false);
                                  setIsRefreshingArticles(true);
                                  try {
                                    await refreshArticles();
                                    showToast(language === "FR" ? "Actualités rafraîchies !" : "News refreshed!");
                                  } catch (e) {
                                    showToast(language === "FR" ? "Erreur de rafraîchissement" : "Error refreshing news");
                                  } finally {
                                    setIsRefreshingArticles(false);
                                  }
                                }}
                                className="w-full text-left px-3 py-1.5 text-[11px] text-slate-300 hover:text-white hover:bg-white/5 transition-colors font-sans flex items-center gap-1.5 cursor-pointer"
                              >
                                {isRefreshingArticles ? (
                                  <span className="w-3.5 h-3.5 border border-slate-300 border-t-transparent rounded-full animate-spin"></span>
                                ) : (
                                  <span>📰</span>
                                )}
                                <span>{t("Rafraîchir les actus", "Refresh trending news")}</span>
                              </button>
                              <button
                                onClick={() => {
                                  setShowPersonalizeModal(true);
                                  setShowTrendingMenu(false);
                                }}
                                className="w-full text-left px-3 py-1.5 text-[11px] text-slate-300 hover:text-white hover:bg-white/5 transition-colors font-sans cursor-pointer"
                              >
                                🎨 {t("Personnaliser flux", "Customize feed")}
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedCategory("Actualités");
                                  setShowTrendingMenu(false);
                                }}
                                className="w-full text-left px-3 py-1.5 text-[11px] text-slate-300 hover:text-white hover:bg-white/5 transition-colors font-sans cursor-pointer"
                              >
                                🎯 {t("Filtrer par actualités", "Filter by news")}
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      <ul className="space-y-4">
                        {trendingArticles.map((art, idx) => {
                          const initials = art.sourceName.slice(0, 1).toUpperCase();
                          const dotColors = ["bg-emerald-500/20 text-emerald-400 border-emerald-500/30", "bg-sky-500/20 text-sky-400 border-sky-500/30", "bg-purple-500/20 text-purple-400 border-purple-500/30"];
                          const currentBgColor = dotColors[idx % dotColors.length];
                          return (
                            <li key={art.id} className="group border-b border-white/5 pb-3 last:border-0 last:pb-0">
                              <Link href={`/article/${art.id}`} className="flex flex-col gap-1.5 cursor-pointer">
                                <div className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider text-slate-500">
                                  <span className={`w-4 h-4 rounded-full border flex items-center justify-center font-extrabold ${currentBgColor}`}>
                                    {initials}
                                  </span>
                                  <span>{art.sourceName}</span>
                                  <span>•</span>
                                  <span>{art.publishedAt}</span>
                                </div>
                                <h4 className="text-xs font-bold text-slate-205 group-hover:text-primary transition-colors leading-snug line-clamp-2">
                                  {language === 'FR' ? art.title : (art.titleEn || art.title)}
                                </h4>
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                    
                    <Link 
                      href="/?category=Actualités"
                      className="text-[10px] text-center font-bold text-primary hover:text-white uppercase tracking-wider transition-colors pt-3 border-t border-white/5 block"
                    >
                      {t("Toutes les actualités", "All News")}
                    </Link>
                  </div>

                  <div className="lg:col-span-4 md:col-span-6 col-span-12">
                    {displayedArticles[2] && (
                      <article 
                        className="portal-card flex flex-col h-[390px] overflow-hidden shadow-premium group justify-between cursor-pointer"
                        onClick={(e) => handleCardClick(e, displayedArticles[2].id)}
                      >
                        <div className="relative h-[170px] overflow-hidden">
                          <img 
                            src={displayedArticles[2].imageUrl} 
                            alt={language === 'FR' ? displayedArticles[2].title : (displayedArticles[2].titleEn || displayedArticles[2].title)} 
                            className="w-full h-full object-cover group-hover:scale-104 transition-transform duration-500"
                          />
                          <div className="absolute top-3 left-3 bg-primary text-white text-[9px] font-bold px-2 py-0.5 rounded tracking-wide">
                            {language === 'FR' ? displayedArticles[2].category : (displayedArticles[2].categoryEn || displayedArticles[2].category)}
                          </div>
                          {renderDuelBadge(displayedArticles[2].id)}
                        </div>

                        <div className="p-4 flex-1 flex flex-col justify-between">
                          <div>
                            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-2">
                              {displayedArticles[2].sourceName} • {displayedArticles[2].publishedAt}
                            </div>
                            <h3 className="font-sans text-xs sm:text-sm font-bold text-white group-hover:text-primary transition-colors leading-snug line-clamp-4">
                              <Link href={`/article/${displayedArticles[2].id}`}>
                                {language === 'FR' ? displayedArticles[2].title : (displayedArticles[2].titleEn || displayedArticles[2].title)}
                              </Link>
                            </h3>
                          </div>

                          <div className="flex items-center justify-between pt-3 border-t border-white/5">
                            <div className="flex items-center gap-2">
                              <button 
                                onClick={(e) => handleLikeCard(e, displayedArticles[2].id)}
                                className={`flex items-center gap-1 text-[10px] transition-colors ${displayedArticles[2].userReaction === "like" ? "text-blue-500 font-bold" : "text-slate-400 hover:text-white"}`}
                              >
                                <ThumbsUp size={11} /> {displayedArticles[2].reactions.like}
                              </button>
                              <button 
                                onClick={(e) => handleDislikeCard(e, displayedArticles[2].id)}
                                className={`flex items-center gap-1 text-[10px] transition-colors ${displayedArticles[2].userReaction === "sad" ? "text-red-500 font-bold" : "text-slate-400 hover:text-white"}`}
                              >
                                <ThumbsDown size={11} /> {displayedArticles[2].reactions.sad}
                              </button>
                            </div>
                            
                            <Link 
                              href={`/article/${displayedArticles[2].id}#comments`}
                              className="flex items-center gap-1 text-[10px] text-primary hover:text-primary-hover font-bold transition-colors"
                            >
                              <MessageSquare size={10} className="text-primary" />
                              <span>{displayedArticles[2].commentsCount}</span>
                            </Link>
                          </div>
                        </div>
                      </article>
                    )}
                  </div>

                  <div className="lg:col-span-5 md:col-span-12 col-span-12">
                    {displayedArticles[3] && (
                      <article 
                        className="portal-card image-overlay-card relative overflow-hidden h-[390px] shadow-premium group flex flex-col justify-between p-6 cursor-pointer"
                        onClick={(e) => handleCardClick(e, displayedArticles[3].id)}
                      >
                        <img 
                          src={displayedArticles[3].imageUrl} 
                          alt={language === 'FR' ? displayedArticles[3].title : (displayedArticles[3].titleEn || displayedArticles[3].title)} 
                          className="absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-in-out scale-100 group-hover:scale-103"
                        />
                        
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/75 to-transparent z-10"></div>
                        
                        <div className="relative z-20">
                          <span className="inline-block bg-primary/95 text-white text-[9px] font-bold px-2 py-0.5 rounded tracking-wide mb-2">
                            {language === 'FR' ? displayedArticles[3].category : (displayedArticles[3].categoryEn || displayedArticles[3].category)}
                          </span>
                        </div>
                        {renderDuelBadge(displayedArticles[3].id)}

                        <div className="relative z-20 mt-auto">
                          <div className="text-[10px] text-slate-300 font-bold uppercase tracking-wider mb-2">
                            {displayedArticles[3].sourceName} • {displayedArticles[3].publishedAt}
                          </div>
                          <h3 className="font-serif text-base sm:text-lg font-bold text-white hover:text-primary transition-colors leading-snug line-clamp-3 mb-4 drop-shadow">
                            <Link href={`/article/${displayedArticles[3].id}`}>
                              {language === 'FR' ? displayedArticles[3].title : (displayedArticles[3].titleEn || displayedArticles[3].title)}
                            </Link>
                          </h3>

                          <div className="flex items-center justify-between border-t border-white/15 pt-3.5">
                            <div className="flex items-center gap-3">
                              <button 
                                onClick={(e) => handleLikeCard(e, displayedArticles[3].id)}
                                className={`flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full transition-colors cursor-pointer border ${displayedArticles[3].userReaction === "like" ? "bg-blue-600/35 border-blue-500 text-blue-300" : "bg-white/10 border border-transparent hover:bg-primary text-white"}`}
                              >
                                <ThumbsUp size={10} />
                                <span>{displayedArticles[3].reactions.like}</span>
                              </button>
                              <button 
                                onClick={(e) => handleDislikeCard(e, displayedArticles[3].id)}
                                className={`flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full transition-colors cursor-pointer border ${displayedArticles[3].userReaction === "sad" ? "bg-red-600/35 border-red-500 text-red-300" : "bg-white/10 border border-transparent hover:bg-accent text-white"}`}
                              >
                                <ThumbsDown size={10} />
                                <span>{displayedArticles[3].reactions.sad}</span>
                              </button>
                            </div>

                            <span className="text-[10px] text-slate-300 font-bold uppercase">{displayedArticles[3].readTime}</span>
                          </div>
                        </div>
                      </article>
                    )}
                  </div>

                </div>

              </div>
            )}

          </div>
        )}

      </main>

      {showPersonalizeModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/10 rounded-3xl max-w-md w-full p-6 space-y-6 shadow-popover">
            <div className="flex justify-between items-center">
              <h3 className="font-serif text-lg font-bold text-white">
                {t("Personnaliser votre flux", "Customize Your Feed")}
              </h3>
              <button 
                onClick={() => setShowPersonalizeModal(false)} 
                className="text-slate-400 hover:text-white text-xl font-bold transition-colors cursor-pointer"
              >
                &times;
              </button>
            </div>
            
            <div className="space-y-4">
              <p className="text-xs text-slate-400 leading-relaxed">
                {t("Sélectionnez les catégories d'actualités que vous souhaitez masquer de votre flux principal :", 
                   "Select the news categories you want to hide from your main feed:")}
              </p>
              <div className="flex flex-wrap gap-2">
                {allCategories.map(cat => {
                  const isHidden = hiddenCategories.includes(cat);
                  return (
                    <button
                      key={cat}
                      onClick={() => {
                        setHiddenCategories(prev => 
                          isHidden ? prev.filter(c => c !== cat) : [...prev, cat]
                        );
                      }}
                      className={`text-xs px-3.5 py-2 rounded-full border transition-all cursor-pointer font-bold ${
                        isHidden 
                          ? "bg-red-500/20 border-red-500/35 text-red-400"
                          : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10"
                      }`}
                    >
                      {t(cat, cat)} {isHidden ? "❌" : "✓"}
                    </button>
                  );
                })}
              </div>
            </div>
            
            <div className="flex justify-end gap-3 border-t border-white/5 pt-4">
              <button 
                onClick={() => {
                  setHiddenCategories([]);
                  setShowPersonalizeModal(false);
                }}
                className="text-xs text-slate-450 hover:text-white cursor-pointer px-4 py-2 font-bold"
              >
                {t("Réinitialiser", "Reset")}
              </button>
              <button 
                onClick={() => setShowPersonalizeModal(false)}
                className="bg-primary hover:bg-primary-hover text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-all cursor-pointer shadow-md"
              >
                {t("Enregistrer", "Save Settings")}
              </button>
            </div>
          </div>
        </div>
      )}

      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-[100] bg-slate-900/90 backdrop-blur-xl border border-primary/30 text-white font-sans text-xs font-semibold py-3 px-5 rounded-2xl shadow-[0_10px_30px_rgba(99,102,241,0.2)] flex items-center gap-2 animate-in slide-in-from-bottom-5 fade-in duration-300">
          <span className="w-2 h-2 bg-primary rounded-full animate-ping"></span>
          {toastMessage}
        </div>
      )}

      <Footer />
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="font-serif text-lg text-slate-400 animate-pulse">Chargement du portail Komentel...</p>
      </div>
    }>
      <HomeContent />
    </Suspense>
  );
}
