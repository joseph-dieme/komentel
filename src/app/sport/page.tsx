"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useKomentel } from "@/context/KomentelContext";
import { 
  Trophy, 
  RefreshCw, 
  Search, 
  ArrowLeft, 
  Clock, 
  Activity, 
  CheckCircle2, 
  Calendar, 
  MessageSquare,
  Swords
} from "lucide-react";

export interface ExtendedMatch {
  id: string;
  sport: 'FOOTBALL' | 'LUTTE' | 'BASKETBALL';
  homeTeam: { name: string; flag: string };
  awayTeam: { name: string; flag: string };
  score: string;
  status: 'EN DIRECT' | 'Terminé' | 'À venir';
  detail: string;
  // for football
  minute?: number;
  half?: 1 | 2;
  // for wrestling
  wrestlingStage?: number; // 0: Toussa, 1: Face à Face, 2: Combat en cours, 3: Chute
  // for basketball
  homeScore?: number;
  awayScore?: number;
  quarter?: number;
  timeRemaining?: string;
}

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

const renderClubOrWrestlerEmblem = (name: string, fallbackEmoji: string, textClass: string = "text-xl") => {
  const normName = name.trim().toUpperCase();
  
  if (normName.includes("DUC")) {
    return (
      <div className="w-6 h-6 rounded-full bg-black border-2 border-yellow-500 flex items-center justify-center shadow-sm shrink-0 font-extrabold text-[9px] text-yellow-500 select-none animate-pulse" title="Dakar University Club">
        D
      </div>
    );
  }
  if (normName.includes("DOUANES")) {
    return (
      <div className="w-6 h-6 rounded-full bg-emerald-900 border-2 border-emerald-400 flex items-center justify-center shadow-sm shrink-0 font-extrabold text-[9px] text-emerald-300 select-none" title="AS Douanes">
        AD
      </div>
    );
  }
  if (normName.includes("MODOU")) {
    return (
      <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-yellow-500 to-amber-600 border border-yellow-300 flex items-center justify-center shadow-md shrink-0 text-xs text-white select-none" title="Modou Lô (Roi des Arènes)">
        👑
      </div>
    );
  }
  if (normName.includes("BALLA")) {
    return (
      <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-orange-500 to-red-650 border border-orange-300 flex items-center justify-center shadow-md shrink-0 text-xs text-white select-none" title="Balla Gaye 2 (Lion de Guédiawaye)">
        🦁
      </div>
    );
  }
  if (normName.includes("REUG")) {
    return (
      <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-700 border border-blue-400 flex items-center justify-center shadow-md shrink-0 text-xs text-white select-none" title="Reug Reug (Génie de Thiaroye)">
        ⚡
      </div>
    );
  }
  if (normName.includes("AMA")) {
    return (
      <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-red-650 to-orange-600 border border-red-405 flex items-center justify-center shadow-md shrink-0 text-xs text-white select-none" title="Ama Baldé (Pikine)">
        🔥
      </div>
    );
  }
  if (normName.includes("BOY NIANG")) {
    return (
      <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-slate-200 to-slate-400 border border-white flex items-center justify-center shadow-md shrink-0 text-[10px] text-slate-800 select-none" title="Boy Niang 2">
        🎯
      </div>
    );
  }
  if (normName.includes("LAC DE GUIERS")) {
    return (
      <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-green-700 to-emerald-800 border border-green-450 flex items-center justify-center shadow-md shrink-0 text-xs text-white select-none" title="Lac de Guiers 2">
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
        className="w-6 h-4 object-cover rounded-sm shadow-sm select-none inline-block border border-white/10 shrink-0" 
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
        className="w-6 h-4 object-cover rounded-sm shadow-sm select-none inline-block border border-white/10 shrink-0" 
        alt="Scotland" 
      />
    );
  }
  if (flagEmoji === '🏴󠁧󠁢󠁥󠁮󠁧󠁿' || flagEmoji === '🏴\u200d󠁢󠁥󠁮󠁧󠁿' || upperName.includes('ENG') || upperName.includes('ANGLETERRE')) {
    return (
      <img 
        src="https://flagcdn.com/w40/gb-eng.png" 
        className="w-6 h-4 object-cover rounded-sm shadow-sm select-none inline-block border border-white/10 shrink-0" 
        alt="England" 
      />
    );
  }
  if (flagEmoji === '🏴󠁧󠁢gw' || flagEmoji === '🏴\u200d󠁢󠁷󠁬󠁳󠁿' || upperName.includes('WAL') || upperName.includes('GALLES')) {
    return (
      <img 
        src="https://flagcdn.com/w40/gb-wls.png" 
        className="w-6 h-4 object-cover rounded-sm shadow-sm select-none inline-block border border-white/10 shrink-0" 
        alt="Wales" 
      />
    );
  }

  // 3. Fallback to club/wrestler emblem or raw emoji
  return renderClubOrWrestlerEmblem(name, flagEmoji, "text-xl");
};

export default function SportPage() {
  const { 
    matches, 
    refreshMatches, 
    resetSimulatedMatches,
    language,
    comments,
    addComment,
    likeComment,
    dislikeComment,
    reportComment,
    user,
    challengeToDuel
  } = useKomentel();

  const [selectedSport, setSelectedSport] = useState<'ALL' | 'FOOTBALL' | 'BASKETBALL'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'LIVE' | 'FINISHED' | 'UPCOMING'>('ALL');
  const [searchQuery, setSearchQuery] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeDebateMatch, setActiveDebateMatch] = useState<any | null>(null);
  const [newCommentText, setNewCommentText] = useState("");
  const [customAuthorName, setCustomAuthorName] = useState("");

  // Duel Challenge Modal State
  const [showDuelModal, setShowDuelModal] = useState(false);
  const [duelTargetCommentId, setDuelTargetCommentId] = useState<string | null>(null);
  const [duelOpponentName, setDuelOpponentName] = useState("");
  const [duelOpeningText, setDuelOpeningText] = useState("");

  const handleOpenDuelModal = (commentId: string, authorName: string) => {
    if (!user) {
      window.location.href = `/login?redirect=/sport`;
      return;
    }
    if (user.name === authorName) {
      alert("Vous ne pouvez pas vous défier vous-même !");
      return;
    }
    setDuelTargetCommentId(commentId);
    setDuelOpponentName(authorName);
    setDuelOpeningText(`Je conteste votre affirmation sur ce match. Voici mon argument : `);
    setShowDuelModal(true);
  };

  const handleLaunchDuel = () => {
    if (!duelTargetCommentId || !duelOpeningText.trim() || !activeDebateMatch) return;
    challengeToDuel(activeDebateMatch.id, duelTargetCommentId, duelOpponentName, duelOpeningText);
    setShowDuelModal(false);
    setDuelTargetCommentId(null);
    setDuelOpeningText("");
    alert(`Défi envoyé avec succès à ${duelOpponentName} ! Consultez vos notifications pour entrer dans l'arène.`);
  };

  // Localization helper
  const t = (frText: string, enText: string) => {
    return language === 'FR' ? frText : enText;
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshMatches();
    resetSimulatedMatches();
    setIsRefreshing(false);
  };

  // Helper to normalize status for filtering
  const getNormalizedStatus = (status: string): 'LIVE' | 'FINISHED' | 'UPCOMING' => {
    const s = status.toUpperCase();
    if (s.includes("DIRECT") || s.includes("LIVE")) return 'LIVE';
    if (s.includes("TERMIN") || s.includes("FINAL") || s.includes("FT") || s.includes("VICTOIRE") || s.includes("CHUTE")) return 'FINISHED';
    return 'UPCOMING';
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
      .replace("Face à face", "Face-off")
      .replace("Combat au corps à corps", "Wrestling combat")
      .replace("Victoire", "Victory");
  };

  // Consolidated matches list (excluding Lutte)
  const combinedMatches = matches.filter(m => m.sport !== 'LUTTE');

  // Filtering Logic
  const filteredMatches = combinedMatches.filter(m => {
    // 1. Sport Filter
    if (selectedSport !== 'ALL' && m.sport !== selectedSport) return false;

    // 2. Status Filter
    const normStatus = getNormalizedStatus(m.status);
    if (statusFilter === 'LIVE' && normStatus !== 'LIVE') return false;
    if (statusFilter === 'FINISHED' && normStatus !== 'FINISHED') return false;
    if (statusFilter === 'UPCOMING' && normStatus !== 'UPCOMING') return false;

    // 3. Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const home = m.homeTeam.name.toLowerCase();
      const away = m.awayTeam.name.toLowerCase();
      return home.includes(q) || away.includes(q);
    }

    return true;
  });

  // Calculate stats based on current sport selection
  const currentSportMatches = combinedMatches.filter(m => selectedSport === 'ALL' || m.sport === selectedSport);
  const totalCount = currentSportMatches.length;
  const liveCount = currentSportMatches.filter(m => getNormalizedStatus(m.status) === 'LIVE').length;
  const finishedCount = currentSportMatches.filter(m => getNormalizedStatus(m.status) === 'FINISHED').length;
  const upcomingCount = currentSportMatches.filter(m => getNormalizedStatus(m.status) === 'UPCOMING').length;

  const getSportIcon = (sport: 'FOOTBALL' | 'LUTTE' | 'BASKETBALL') => {
    switch (sport) {
      case 'FOOTBALL': return "⚽";
      case 'LUTTE': return "🤼";
      case 'BASKETBALL': return "🏀";
    }
  };

  const getSportName = (sport: 'FOOTBALL' | 'LUTTE' | 'BASKETBALL') => {
    switch (sport) {
      case 'FOOTBALL': return t("Football", "Football");
      case 'LUTTE': return t("Lutte Sénégalaise", "Senegalese Wrestling");
      case 'BASKETBALL': return t("Basketball", "Basketball");
    }
  };

  const sportsList = [
    { id: 'ALL', label: t("Tous les sports", "All Sports"), icon: "🏆" },
    { id: 'FOOTBALL', label: t("Football", "Football"), icon: "⚽" },
    { id: 'BASKETBALL', label: t("Basketball", "Basketball"), icon: "🏀" }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background bg-grid-pattern font-sans text-slate-200">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full relative animate-in fade-in duration-300">
        {/* Soft glowing ambient backgrounds */}
        <div className="absolute top-10 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[120px] pointer-events-none -z-10"></div>
        <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-[120px] pointer-events-none -z-10"></div>

        {/* Back Link */}
        <div className="mb-6">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-colors uppercase tracking-wider bg-white/5 hover:bg-white/10 px-4 py-2 rounded-full border border-white/5"
          >
            <ArrowLeft size={12} /> {t("Retour à l'accueil", "Back to Home")}
          </Link>
        </div>

        {/* Page Header info */}
        <div className="bg-[#12131C]/60 backdrop-blur-md border border-white/10 p-6 sm:p-8 rounded-2xl shadow-premium flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-white flex items-center gap-3">
              <Trophy className="text-yellow-500 animate-pulse" size={32} />
              {t("Komentel Arena - Centre de Matchs", "Komentel Arena - Match Center")}
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 font-semibold mt-1.5 uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
              {t("Scores en direct de la Coupe du Monde de la FIFA", "Live Scores for FIFA World Cup")}
            </p>
          </div>

          <button 
            onClick={handleRefresh}
            className="self-start md:self-auto bg-primary hover:bg-primary-hover hover:scale-105 active:scale-95 text-white text-xs font-bold uppercase tracking-wider px-5 py-3 rounded-xl shadow-premium transition-all flex items-center gap-2 focus:outline-none"
          >
            <RefreshCw size={14} className={isRefreshing ? "animate-spin" : ""} />
            {t("Rafraîchir les scores", "Refresh scores")}
          </button>
        </div>

        {/* Sports Navigation Bar */}
        <div className="flex items-center gap-3 overflow-x-auto pb-4.5 scrollbar-none mb-6 border-b border-white/5">
          {sportsList.map(sport => {
            const isActive = selectedSport === sport.id;
            return (
              <button
                key={sport.id}
                onClick={() => {
                  setSelectedSport(sport.id as any);
                  setStatusFilter('ALL');
                }}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer border ${
                  isActive
                    ? "bg-gradient-to-r from-primary to-accent border-transparent text-white shadow-premium scale-102 font-extrabold"
                    : "bg-white/5 border-white/5 text-slate-400 hover:text-white hover:bg-white/10"
                }`}
              >
                <span className="text-sm leading-none">{sport.icon}</span>
                <span>{sport.label}</span>
              </button>
            );
          })}
        </div>

        {/* Quick Statistics Banner */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="portal-card p-5 border border-white/10 rounded-2xl flex items-center gap-4 bg-[#12131C]/40 backdrop-blur-sm">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <Activity size={22} />
            </div>
            <div>
              <p className="text-[10px] text-slate-450 font-bold uppercase tracking-wider leading-none">{t("Total Matchs", "Total Matches")}</p>
              <p className="text-2xl font-bold text-white mt-1.5">{totalCount}</p>
            </div>
          </div>

          <div className="portal-card p-5 border border-white/10 rounded-2xl flex items-center gap-4 bg-[#12131C]/40 backdrop-blur-sm">
            <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center text-red-555">
              <div className="relative flex items-center justify-center">
                <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-ping absolute"></span>
                <span className="w-2.5 h-2.5 bg-red-500 rounded-full"></span>
              </div>
            </div>
            <div>
              <p className="text-[10px] text-slate-455 font-bold uppercase tracking-wider leading-none">{t("En Direct", "Live Matches")}</p>
              <p className="text-2xl font-bold text-white mt-1.5">{liveCount}</p>
            </div>
          </div>

          <div className="portal-card p-5 border border-white/10 rounded-2xl flex items-center gap-4 bg-[#12131C]/40 backdrop-blur-sm">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-450">
              <CheckCircle2 size={22} />
            </div>
            <div>
              <p className="text-[10px] text-slate-455 font-bold uppercase tracking-wider leading-none">{t("Terminés", "Finished")}</p>
              <p className="text-2xl font-bold text-white mt-1.5">{finishedCount}</p>
            </div>
          </div>

          <div className="portal-card p-5 border border-white/10 rounded-2xl flex items-center gap-4 bg-[#12131C]/40 backdrop-blur-sm">
            <div className="w-12 h-12 rounded-xl bg-yellow-500/10 flex items-center justify-center text-yellow-500">
              <Calendar size={22} />
            </div>
            <div>
              <p className="text-[10px] text-slate-455 font-bold uppercase tracking-wider leading-none">{t("À Venir", "Upcoming")}</p>
              <p className="text-2xl font-bold text-white mt-1.5">{upcomingCount}</p>
            </div>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 bg-white/[0.03] border border-white/15 p-1 rounded-xl w-fit">
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`px-4 py-2 rounded-lg text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                statusFilter === 'ALL'
                  ? "bg-primary text-white shadow"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {t("Tous", "All")}
            </button>
            <button
              onClick={() => setStatusFilter('LIVE')}
              className={`px-4 py-2 rounded-lg text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
                statusFilter === 'LIVE'
                  ? "bg-red-600 text-white shadow"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${statusFilter === 'LIVE' ? "bg-white animate-pulse" : "bg-red-500"}`}></span>
              {t("En direct", "Live")}
            </button>
            <button
              onClick={() => setStatusFilter('FINISHED')}
              className={`px-4 py-2 rounded-lg text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                statusFilter === 'FINISHED'
                  ? "bg-primary text-white shadow"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {t("Terminés", "Finished")}
            </button>
            <button
              onClick={() => setStatusFilter('UPCOMING')}
              className={`px-4 py-2 rounded-lg text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                statusFilter === 'UPCOMING'
                  ? "bg-primary text-white shadow"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {t("À venir", "Upcoming")}
            </button>
          </div>

          {/* Search bar */}
          <div className="relative w-full md:w-80">
            <input 
              type="text" 
              placeholder={t("Rechercher une équipe...", "Search team...")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-xs text-white placeholder-slate-500 focus:bg-white/10 focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all"
            />
            <Search size={14} className="absolute left-3.5 top-3.5 text-slate-500" />
          </div>
        </div>

        {/* Matches table container */}
        <div className="portal-card overflow-hidden shadow-premium border border-white/10 rounded-2xl bg-[#12131C]/60 backdrop-blur-md">
          {filteredMatches.length === 0 ? (
            <div className="p-16 text-center text-slate-400 text-sm">
              <Trophy size={48} className="mx-auto text-slate-655 mb-4 opacity-40" />
              {t("Aucun match disponible ou ne correspond à vos filtres.", "No matches available or matching your filters.")}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 bg-white/[0.02]">
                    <th className="p-4 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">{t("Sport / Statut", "Sport / Status")}</th>
                    <th className="p-4 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 text-right w-1/3">
                      {t("Équipe Domicile", "Home Team")}
                    </th>
                    <th className="p-4 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 text-center w-36">{t("Score", "Score")}</th>
                    <th className="p-4 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 w-1/3">
                      {t("Équipe Extérieur", "Away Team")}
                    </th>
                    <th className="p-4 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 text-center">{t("Détail", "Detail")}</th>
                    <th className="p-4 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 text-center">{t("Débat", "Debate")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-semibold text-sm">
                  {filteredMatches.map((m) => {
                    const normStatus = getNormalizedStatus(m.status);
                    const isLive = normStatus === 'LIVE';
                    const isFinished = normStatus === 'FINISHED';
                    
                    return (
                      <tr key={m.id} className="hover:bg-white/[0.02] transition-colors">
                        {/* Sport & Status badge */}
                        <td className="p-4 whitespace-nowrap">
                          <div className="flex items-center gap-2.5">
                            <span 
                              className="text-base cursor-default select-none" 
                              title={getSportName(m.sport)}
                            >
                              {getSportIcon(m.sport)}
                            </span>
                            {isLive ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-red-500/10 text-red-400 border border-red-500/25">
                                <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></span>
                                {translateMatchStatus(m.status)}
                              </span>
                            ) : isFinished ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-slate-500/10 text-slate-400 border border-white/5">
                                {translateMatchStatus(m.status)}
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
                                {translateMatchStatus(m.status)}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Home Wrestler / Team */}
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-3">
                            <span className="text-slate-200 font-extrabold text-sm sm:text-base">{m.homeTeam.name}</span>
                            {renderTeamFlag(m.homeTeam.name, m.homeTeam.flag)}
                          </div>
                        </td>

                        {/* Score Box */}
                        <td className="p-4">
                          <div className="flex justify-center">
                            <span className={`px-4 py-1.5 rounded-lg text-sm font-extrabold font-mono tracking-wider shadow-inner ${
                              isLive 
                                ? "bg-red-500/10 text-red-400 border border-red-500/20 glow-red"
                                : isFinished
                                  ? "bg-white/5 text-slate-300 border border-white/5"
                                  : "bg-white/[0.02] text-slate-500 border border-white/5"
                            }`}>
                              {m.score}
                            </span>
                          </div>
                        </td>

                        {/* Away Team */}
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            {renderTeamFlag(m.awayTeam.name, m.awayTeam.flag)}
                            <span className="text-slate-200 font-extrabold text-sm sm:text-base">{m.awayTeam.name}</span>
                          </div>
                        </td>

                        {/* Detail / Minute */}
                        <td className="p-4 text-center whitespace-nowrap text-xs text-slate-400 font-medium">
                          {isLive ? (
                            <span className="text-red-400 font-bold flex items-center justify-center gap-1 animate-pulse">
                              <Clock size={12} />
                              {translateMatchDetail(m.detail)}
                            </span>
                          ) : (
                            <span>{translateMatchDetail(m.detail)}</span>
                          )}
                        </td>

                        {/* Debate Action Button */}
                        <td className="p-4 text-center">
                          <button 
                            onClick={() => {
                              setActiveDebateMatch(m);
                              setNewCommentText("");
                              setCustomAuthorName("");
                            }}
                            className="inline-flex items-center justify-center gap-1.5 bg-white/5 hover:bg-primary border border-white/10 hover:border-primary px-3.5 py-1.5 rounded-lg text-xs text-slate-200 hover:text-white font-bold transition-all cursor-pointer"
                            title={t("Rejoindre le débat en direct", "Join the live debate")}
                          >
                            <MessageSquare size={12} />
                            <span className="hidden sm:inline">{t("Débattre", "Debate")}</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Debate Community Promo Section */}
        <section className="mt-12 bg-gradient-to-r from-primary/10 to-accent/10 border border-white/10 p-6 sm:p-8 rounded-2xl shadow-premium relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl pointer-events-none"></div>
          <div className="relative z-10 max-w-3xl">
            <span className="inline-block bg-accent/20 border border-accent/30 text-accent text-[9px] font-extrabold uppercase px-2.5 py-1 rounded-md tracking-wider mb-3">
              {t("VOTRE AVIS COMPTE", "YOUR OPINION MATTERS")}
            </span>
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-white mb-2 leading-tight">
              {t("Qui va l'emporter ? Lancez un duel d'opinions !", "Who will win? Start an opinion duel!")}
            </h3>
            <p className="text-xs sm:text-sm text-slate-350 leading-relaxed mb-5">
              {t("Komentel est un espace de débat démocratique et modéré. Partagez vos analyses de matchs, défiez un autre membre de la communauté en duel d'opinions ou publiez vos chroniques sportives de manière accréditée.", "Komentel is a democratic and moderated debate space. Share your match reviews, challenge other members to an opinion duel, or publish accredited sports chronicles.")}
            </p>
            <div className="flex flex-wrap gap-3">
              <Link 
                href="/?category=Sport"
                className="bg-primary hover:bg-primary-hover text-white text-xs font-bold uppercase tracking-wider px-5 py-3 rounded-xl transition-all shadow-md"
              >
                {t("Voir les duels actifs", "View active duels")}
              </Link>
              <Link 
                href="/journalist"
                className="bg-white/5 hover:bg-white/10 text-white text-xs font-bold uppercase tracking-wider px-5 py-3 rounded-xl border border-white/5 transition-all"
              >
                {t("Écrire une chronique", "Write a chronicle")}
              </Link>
            </div>
          </div>
        </section>

      </main>

      {/* Drawer / Debate Panel */}
      {activeDebateMatch && (
        <>
          {/* Backdrop Overlay */}
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity"
            onClick={() => {
              setActiveDebateMatch(null);
              setNewCommentText("");
            }}
          />

          {/* Drawer Panel */}
          <div className="fixed inset-y-0 right-0 w-full sm:w-[420px] bg-slate-900/95 backdrop-blur-xl border-l border-white/10 z-50 p-6 shadow-premium flex flex-col justify-between animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div className="flex items-center gap-2.5">
                  <span className="text-xl leading-none">{getSportIcon(activeDebateMatch.sport)}</span>
                  <div>
                    <h3 className="font-serif text-base font-bold text-white leading-tight">
                      {activeDebateMatch.homeTeam.name} vs {activeDebateMatch.awayTeam.name}
                    </h3>
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mt-0.5">
                      {getSportName(activeDebateMatch.sport)} · {translateMatchStatus(activeDebateMatch.status)}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    setActiveDebateMatch(null);
                    setNewCommentText("");
                  }}
                  className="text-slate-400 hover:text-white text-xl p-1.5 transition-colors focus:outline-none cursor-pointer"
                >
                  ×
                </button>
              </div>

              {/* Score banner inside drawer */}
              <div className="bg-white/5 border border-white/10 rounded-xl p-4 my-4 flex items-center justify-between text-center">
                <div className="w-1/3 flex flex-col items-center">
                  <div className="mb-1 h-8 flex items-center justify-center">
                    {renderTeamFlag(activeDebateMatch.homeTeam.name, activeDebateMatch.homeTeam.flag)}
                  </div>
                  <span className="text-xs font-bold text-slate-200 block truncate w-full">{activeDebateMatch.homeTeam.name}</span>
                </div>
                <div className="w-1/3">
                  <span className="text-xl font-extrabold font-mono text-white block">{activeDebateMatch.score}</span>
                  <span className="text-[9px] font-bold text-primary uppercase tracking-wider block mt-1">{translateMatchDetail(activeDebateMatch.detail)}</span>
                </div>
                <div className="w-1/3 flex flex-col items-center">
                  <div className="mb-1 h-8 flex items-center justify-center">
                    {renderTeamFlag(activeDebateMatch.awayTeam.name, activeDebateMatch.awayTeam.flag)}
                  </div>
                  <span className="text-xs font-bold text-slate-200 block truncate w-full">{activeDebateMatch.awayTeam.name}</span>
                </div>
              </div>

              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">
                {t("Débats de la communauté", "Community Debates")}
              </h4>
            </div>

            {/* Comment List Area */}
            <div className="flex-1 overflow-y-auto pr-1 space-y-4 mb-4 scrollbar-none">
              {comments.filter(c => c.articleId === activeDebateMatch.id).length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 p-6">
                  <MessageSquare size={36} className="text-slate-600 mb-2 opacity-50" />
                  <p className="text-xs font-semibold">{t("Aucun débat pour le moment.", "No debates yet.")}</p>
                  <p className="text-[10px] text-slate-500 mt-1">
                    {t("Soyez le premier à partager votre avis sur ce match !", "Be the first to share your opinion on this match!")}
                  </p>
                </div>
              ) : (
                comments
                  .filter(c => c.articleId === activeDebateMatch.id)
                  .map(c => (
                    <div key={c.id} className="portal-item p-3.5 space-y-2 text-xs relative group border border-white/5 rounded-xl bg-white/[0.02]">
                      <div className="flex justify-between items-center text-[10px] font-bold">
                        <span className="text-slate-200 font-extrabold flex items-center gap-1.5">
                          {c.author}
                          {c.authorBadge && (
                            <span className="bg-primary/20 text-primary border border-primary/20 text-[8px] font-extrabold px-1 rounded uppercase">
                              {c.authorBadge}
                            </span>
                          )}
                        </span>
                        <span className="text-slate-500">{c.createdAt}</span>
                      </div>
                      <p className="text-slate-300 leading-relaxed font-sans">{c.content}</p>
                      
                      {/* Comment actions (likes/report) */}
                      <div className="flex items-center justify-between pt-2.5 border-t border-white/5 text-[10px] font-bold text-slate-450">
                        <div className="flex items-center gap-3">
                          <button 
                            onClick={() => likeComment(c.id)}
                            className="hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
                          >
                            <span>👍</span> {c.likes}
                          </button>
                          <button 
                            onClick={() => dislikeComment(c.id)}
                            className="hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
                          >
                            <span>👎</span> {c.dislikes}
                          </button>
                          {user && user.name !== c.author && (
                            <button 
                              onClick={() => handleOpenDuelModal(c.id, c.author)}
                              className="flex items-center gap-1.5 text-accent hover:underline font-bold transition-colors cursor-pointer"
                            >
                              <Swords size={11} /> {t("Défier en duel", "Challenge to duel")}
                            </button>
                          )}
                        </div>

                        {!c.reported ? (
                          <button 
                            onClick={() => reportComment(c.id)}
                            className="hover:text-red-400 text-slate-500 transition-colors cursor-pointer"
                          >
                            {t("Signaler", "Report")}
                          </button>
                        ) : (
                          <span className="text-red-400 italic font-semibold">{t("Signalé", "Reported")}</span>
                        )}
                      </div>
                    </div>
                  ))
              )}
            </div>

            {/* Input Form */}
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                if (!newCommentText.trim()) return;
                addComment(activeDebateMatch.id, newCommentText.trim(), null, customAuthorName.trim() || undefined);
                setNewCommentText("");
              }}
              className="space-y-3 pt-4 border-t border-white/10"
            >
              {/* Nickname input if visitor */}
              {!user && (
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">
                    {t("Votre Pseudo (Optionnel)", "Your Nickname (Optional)")}
                  </label>
                  <input 
                    type="text" 
                    placeholder={t("Ex: Saliou, Abdou...", "Ex: Saliou, Abdou...")}
                    value={customAuthorName}
                    onChange={(e) => setCustomAuthorName(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-xs text-white placeholder-slate-500 focus:bg-white/10 focus:ring-1 focus:ring-primary focus:border-primary outline-none"
                  />
                </div>
              )}
              
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">
                  {t("Votre Opinion", "Your Opinion")}
                </label>
                <div className="flex flex-col gap-2">
                  <textarea 
                    required
                    rows={3}
                    placeholder={t("Partagez votre avis sans limite...", "Share your opinion without limit...")}
                    value={newCommentText}
                    onChange={(e) => setNewCommentText(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:bg-white/10 focus:ring-1 focus:ring-primary focus:border-primary outline-none resize-none"
                  ></textarea>
                  <button 
                    type="submit"
                    className="w-full bg-primary hover:bg-primary-hover text-white text-xs font-bold uppercase py-2.5 rounded-xl transition-all cursor-pointer shadow-premium"
                  >
                    {t("Envoyer l'avis", "Post opinion")}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </>
      )}

      {/* Duel Challenge Modal */}
      {showDuelModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#12131C] border border-white/10 rounded-3xl w-full max-w-lg overflow-hidden shadow-popover animate-in fade-in zoom-in-95 duration-200 text-slate-200">
            <div className="bg-slate-950 border-b border-white/10 p-5 flex items-center justify-between">
              <h3 className="font-serif text-sm font-bold uppercase tracking-wider flex items-center gap-2 text-white">
                <Swords size={18} className="text-accent animate-pulse" />
                {t("Lancer un Défi de Duel", "Send Duel Challenge")}
              </h3>
              <button 
                onClick={() => setShowDuelModal(false)}
                className="text-slate-400 hover:text-white text-lg font-bold cursor-pointer"
              >
                ×
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="text-xs text-slate-350 leading-relaxed font-semibold bg-white/5 p-4 rounded-xl border border-white/5">
                {t("Vous défiez ", "You challenge ")}<span className="text-white font-bold">{duelOpponentName}</span>{t(" en débat 1v1 sur ce match. Il/Elle devra accepter pour démarrer. Les défis non traités expirent après 48h.", " to a 1v1 debate on this match. They must accept to start. Unanswered challenges expire after 48h.")}
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  {t("Votre argument d'ouverture (Tour 1)", "Your opening argument (Round 1)")}
                </label>
                <textarea
                  rows={4}
                  maxLength={500}
                  placeholder={t("Écrivez votre réplique pour démarrer le duel. Limité à 500 caractères.", "Write your reply to start the duel. Limited to 500 characters.")}
                  value={duelOpeningText}
                  onChange={e => setDuelOpeningText(e.target.value)}
                  className="w-full border border-white/10 rounded-2xl p-4 text-xs sm:text-sm text-white focus:ring-1 focus:ring-primary bg-white/5 focus:bg-white/10 outline-none resize-none font-sans transition-all"
                ></textarea>
                <div className="flex justify-between text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                  <span>{t("Conseil : Soyez clair et percutant.", "Tip: Be clear and punchy.")}</span>
                  <span>{duelOpeningText.length}/{500} {t("caractères", "characters")}</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-950 px-6 py-4 flex justify-end gap-3 border-t border-white/10">
              <button
                onClick={() => setShowDuelModal(false)}
                className="border border-white/10 text-slate-400 hover:bg-white/5 font-bold px-6 py-2.5 rounded-full text-[10px] uppercase tracking-wider transition-colors cursor-pointer"
              >
                {t("Annuler", "Cancel")}
              </button>
              <button
                disabled={!duelOpeningText.trim()}
                onClick={handleLaunchDuel}
                className="bg-accent hover:bg-accent-hover disabled:bg-slate-800 disabled:text-slate-500 text-white font-bold px-6 py-2.5 rounded-full text-[10px] uppercase tracking-wider shadow-premium flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                ⚔️ {t("Envoyer le Défi", "Send Challenge")}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
