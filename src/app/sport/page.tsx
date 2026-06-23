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
    user
  } = useKomentel();

  const [selectedSport, setSelectedSport] = useState<'ALL' | 'FOOTBALL' | 'BASKETBALL'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'LIVE' | 'FINISHED' | 'UPCOMING'>('ALL');
  const [searchQuery, setSearchQuery] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);

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
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
