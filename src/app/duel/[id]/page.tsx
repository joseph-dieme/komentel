"use client";

import React, { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useKomentel, decodeHTML } from "@/context/KomentelContext";
import { useParams } from "next/navigation";
import { ChevronRight, Swords, ThumbsUp, ThumbsDown, Award, Clock, ArrowLeft, Send, AlertCircle, HelpCircle } from "lucide-react";
import Link from "next/link";

export default function DuelPage() {
  const { id } = useParams() as { id: string };
  const { 
    duels, 
    user, 
    setUser,
    acceptDuel, 
    postDuelReply, 
    voteDuelReply,
    followDuel,
    unfollowDuel,
    isFollowingDuel,
    articles,
    language
  } = useKomentel();

  const t = (frText: string, enText: string) => {
    return language === 'FR' ? frText : enText;
  };

  const [replyText, setReplyText] = useState("");
  
  // Tracks spectator votes locally: { "roundIndex-side": "like" | "dislike" }
  const [votedReplies, setVotedReplies] = useState<Record<string, 'like' | 'dislike'>>({});

  const duel = duels.find(d => d.id === id);

  if (!duel) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
        <Header />
        <main className="max-w-3xl mx-auto px-4 py-20 text-center flex-1">
          <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-serif font-bold text-primary mb-2">Duel non trouvé</h2>
          <p className="text-slate-500 mb-6">Le duel d'opinions que vous recherchez n'existe pas ou a expiré.</p>
          <Link href="/" className="bg-primary text-white font-semibold px-6 py-2.5 rounded-full text-xs uppercase tracking-wider shadow">
            Retourner à l'accueil
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  // Calculate scores
  const getNetScore = (likes: number, dislikes: number) => likes - dislikes;
  
  let challengerTotalScore = 0;
  let defenderTotalScore = 0;

  duel.rounds.forEach(r => {
    if (r.challengerReply) challengerTotalScore += getNetScore(r.challengerLikes, r.challengerDislikes);
    if (r.defenderReply) defenderTotalScore += getNetScore(r.defenderLikes, r.defenderDislikes);
  });

  const scoreDiff = Math.abs(challengerTotalScore - defenderTotalScore);
  const leader = challengerTotalScore > defenderTotalScore 
    ? duel.challenger 
    : (defenderTotalScore > challengerTotalScore ? duel.defender : null);

  // Determine user permissions based on actual connected profile
  const isChallenger = user !== null && user.name === duel.challenger;
  const isDefender = user !== null && user.name === duel.defender;
  const isParticipant = isChallenger || isDefender;
  const isSpectator = !isParticipant;

  const isMyTurnToWrite = 
    duel.status === "ACTIVE" && 
    ((duel.currentTurn === "CHALLENGER" && isChallenger) ||
     (duel.currentTurn === "DEFENDER" && isDefender));

  // Local voting helpers
  const hasVoted = (roundIdx: number, side: 'challenger' | 'defender') => {
    return votedReplies[`${roundIdx}-${side}`] !== undefined;
  };

  const getVoteType = (roundIdx: number, side: 'challenger' | 'defender') => {
    return votedReplies[`${roundIdx}-${side}`];
  };

  const handleVoteClick = (roundIdx: number, side: 'challenger' | 'defender', type: 'like' | 'dislike') => {
    if (!user) {
      alert("Veuillez vous connecter pour voter.");
      return;
    }
    const key = `${roundIdx}-${side}`;
    if (votedReplies[key]) return; // Already voted on this reply

    // Trigger context update
    voteDuelReply(duel.id, roundIdx, side, type);

    // Save locally
    setVotedReplies(prev => ({
      ...prev,
      [key]: type
    }));
  };

  const handlePostReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    postDuelReply(duel.id, replyText);
    setReplyText("");
  };

  return (
    <div className="min-h-screen flex flex-col bg-background bg-grid-pattern font-sans text-slate-200">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full relative">
        {/* Soft glowing ambient backgrounds */}
        <div className="absolute top-10 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px] pointer-events-none -z-10"></div>
        <div className="absolute top-40 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-[150px] pointer-events-none -z-10"></div>
        
        {/* Breadcrumbs */}
        <div className="flex items-center justify-between mb-4">
          <nav className="flex items-center gap-1 text-xs text-slate-500 font-semibold uppercase tracking-wider">
            <Link href="/" className="hover:text-white transition-colors">Accueil</Link>
            <ChevronRight size={12} />
            <Link href="/" className="hover:text-white transition-colors">Duels</Link>
            <ChevronRight size={12} />
            <span className="text-slate-400">Arène 1v1</span>
          </nav>
          <div className="flex items-center gap-4">
            {user && (
              <button
                onClick={() => isFollowingDuel(duel.id) ? unfollowDuel(duel.id) : followDuel(duel.id)}
                className={`text-[10px] font-bold py-1.5 px-3.5 rounded-full border transition-all cursor-pointer flex items-center gap-1.5 uppercase tracking-wider ${
                  isFollowingDuel(duel.id)
                    ? "bg-green-600/20 text-green-400 border-green-500/30 shadow-[0_0_10px_rgba(34,197,94,0.15)]"
                    : "bg-white/5 border border-white/10 text-slate-450 hover:text-white hover:bg-white/10"
                }`}
              >
                <span>🔔</span>
                <span>{isFollowingDuel(duel.id) ? t("Discussion Suivie", "Discussion Followed") : t("Suivre le débat", "Follow Debate")}</span>
              </button>
            )}

            {!articles.some(a => a.id === duel.articleId) ? (
              <Link href="/sport" className="text-xs text-primary hover:underline font-bold flex items-center gap-1.5 uppercase tracking-wider">
                <ArrowLeft size={14} /> {t("Retour aux matchs", "Back to Match Center")}
              </Link>
            ) : (
              <Link href={`/article/${duel.articleId}`} className="text-xs text-primary hover:underline font-bold flex items-center gap-1.5 uppercase tracking-wider">
                <ArrowLeft size={14} /> {t("Retour à l'article", "Back to Article")}
              </Link>
            )}
          </div>
        </div>

        {/* Duel Header */}
        <section className="bg-[#12131C]/60 backdrop-blur-md rounded-3xl border border-white/10 p-6 sm:p-8 mb-8 shadow-premium">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <span className={`inline-block text-[10px] font-extrabold uppercase px-3 py-1 rounded-full ${
              duel.status === "ACTIVE" 
                ? "bg-accent/15 text-accent border border-accent/20 animate-pulse" 
                : duel.status === "CLOSED" 
                  ? "bg-slate-800 text-slate-400 border border-white/5"
                  : "bg-amber-500/15 text-amber-400 border border-amber-500/20"
            }`}>
              ⚔️ {duel.status === "ACTIVE" ? "Duel en cours" : duel.status === "CLOSED" ? "Duel clos" : "Défi en attente"}
            </span>
            <div className="flex items-center gap-1 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
              <Clock size={12} />
              <span>{duel.status === "CLOSED" ? "Clôturé" : duel.closesAt}</span>
            </div>
          </div>

          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white mb-3">
            Sujet : {decodeHTML(duel.articleTitle)}
          </h1>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
            Arène Fermée 1v1 · Arbitrage par Réactions du Public
          </p>

          {/* SIMULATOR ASSISTANT (Prototype testing Helper) */}
          <div className="bg-white/5 border border-white/5 rounded-2xl p-5 mt-6 shadow-sm">
            <h4 className="text-xs font-bold text-slate-350 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              💡 Panel de Test des Rôles (Simulateur)
            </h4>
            <p className="text-[11px] text-slate-400 leading-normal mb-4">
              Pour tester les accès et droits distincts des participants et des votants, cliquez sur ces boutons pour vous connecter instantanément sous un profil différent :
            </p>
            <div className="flex flex-wrap gap-3">
              {duel.status === "PENDING" && (
                <button
                  onClick={() => acceptDuel(duel.id)}
                  className="bg-amber-500 hover:bg-amber-600 text-white font-bold text-[10px] px-5 py-2.5 rounded-full uppercase tracking-wider shadow-premium focus:outline-none"
                >
                  ✔️ Simuler l'acceptation du défi par {duel.defender}
                </button>
              )}
              
              <button
                onClick={() => setUser({
                  name: duel.challenger,
                  email: "moussa.diop@komentel.sn",
                  role: "USER",
                  duelsStats: { wins: 12, losses: 4, ratio: 75 },
                  activeDuelingEnabled: true
                })}
                className={`font-bold text-[10px] px-5 py-2.5 rounded-full uppercase tracking-wider transition-all focus:outline-none ${
                  isChallenger
                    ? "bg-primary text-white shadow-premium"
                    : "bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10"
                }`}
              >
                🎭 Se connecter comme Challenger ({duel.challenger})
              </button>
              
              <button
                onClick={() => setUser({
                  name: duel.defender,
                  email: "fatou.sow@komentel.sn",
                  role: "USER",
                  duelsStats: { wins: 8, losses: 3, ratio: 72 },
                  activeDuelingEnabled: true
                })}
                className={`font-bold text-[10px] px-5 py-2.5 rounded-full uppercase tracking-wider transition-all focus:outline-none ${
                  isDefender
                    ? "bg-accent text-white shadow-premium"
                    : "bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10"
                }`}
              >
                🎭 Se connecter comme Défenseur ({duel.defender})
              </button>

              <button
                onClick={() => setUser({
                  name: "Amadou Diallo",
                  email: "amadou.diallo@komentel.sn",
                  role: "JOURNALIST",
                  duelsStats: { wins: 4, losses: 1, ratio: 80 },
                  activeDuelingEnabled: true
                })}
                className={`font-bold text-[10px] px-5 py-2.5 rounded-full uppercase tracking-wider transition-all focus:outline-none ${
                  user !== null && isSpectator
                    ? "bg-green-600 text-white shadow-premium"
                    : "bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10"
                }`}
              >
                🎭 Se connecter comme Spectateur (Amadou)
              </button>

              <button
                onClick={() => setUser(null)}
                className={`font-bold text-[10px] px-5 py-2.5 rounded-full uppercase tracking-wider transition-all focus:outline-none ${
                  user === null
                    ? "bg-slate-600 text-white shadow-premium"
                    : "bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10"
                }`}
              >
                🚫 Déconnexion (Visiteur)
              </button>
            </div>
            
            {/* Show Current Active Role Banner */}
            <div className="mt-4 pt-3 border-t border-white/5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Rôle Actif :{" "}
              {isChallenger && <span className="text-primary font-black">Challenger (Écriture permise à son tour)</span>}
              {isDefender && <span className="text-accent font-black">Défenseur (Écriture permise à son tour)</span>}
              {isSpectator && (
                <span className="text-green-400 font-black">
                  Spectateur / Votant {user ? `(${user.name})` : "(Visiteur anonyme)"} - Arbitrage autorisé
                </span>
              )}
            </div>
          </div>
        </section>

        {/* Real-Time Score Dashboard & Arena Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Debaters stats & Chat Arena (8 columns) */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* The Chat Arena */}
            <div className="bg-[#12131C]/60 backdrop-blur-md rounded-3xl border border-white/10 p-6 shadow-premium space-y-8">
              
              {/* Rounds Listing */}
              {duel.rounds.map((round, idx) => {
                const hasChallenger = round.challengerReply !== null;
                const hasDefender = round.defenderReply !== null;

                if (!hasChallenger && !hasDefender) return null;

                return (
                  <div key={idx} className="space-y-8">
                    <div className="text-center">
                      <span className="inline-block bg-white/5 border border-white/5 text-slate-400 text-[9px] font-bold px-3.5 py-1 rounded-full uppercase tracking-widest">
                        Tour {round.turn} / {duel.roundLimit}
                      </span>
                    </div>

                    {/* Challenger Post (Left Side style or distinct color) */}
                    {hasChallenger && (
                      <div className="flex items-start gap-3 max-w-[85%]">
                        <div className="w-8 h-8 rounded-full bg-primary/20 text-white flex items-center justify-center font-bold text-xs uppercase shrink-0 border border-primary/30 shadow-sm">
                          {duel.challenger.slice(0, 2)}
                        </div>
                        <div className="space-y-2">
                          <div className="bg-primary/5 border border-primary/10 rounded-3xl rounded-tl-none p-5 shadow-sm text-slate-200 text-sm font-sans leading-relaxed">
                            <p className="font-bold text-[10px] text-primary uppercase tracking-wider mb-2">{duel.challenger}</p>
                            {round.challengerReply ? decodeHTML(round.challengerReply) : null}
                          </div>
                          
                          {/* Voting block for spectators */}
                          <div className="flex items-center gap-3 text-[10px] font-bold text-slate-500 pl-2 uppercase tracking-wider w-full">
                            <span>Arbitrage :</span>
                            {isSpectator ? (
                              <>
                                <button 
                                  disabled={hasVoted(idx, 'challenger')}
                                  onClick={() => handleVoteClick(idx, 'challenger', 'like')}
                                  className={`flex items-center gap-1 transition-colors rounded-full px-2.5 py-1 ${
                                    getVoteType(idx, 'challenger') === 'like'
                                      ? "bg-blue-600 text-white border border-blue-500"
                                      : "text-slate-400 hover:text-white bg-white/5 border border-white/5 disabled:opacity-50"
                                  }`}
                                >
                                  <ThumbsUp size={11} /> {round.challengerLikes}
                                </button>
                                <button 
                                  disabled={hasVoted(idx, 'challenger')}
                                  onClick={() => handleVoteClick(idx, 'challenger', 'dislike')}
                                  className={`flex items-center gap-1 transition-colors rounded-full px-2.5 py-1 ${
                                    getVoteType(idx, 'challenger') === 'dislike'
                                      ? "bg-red-600 text-white border border-red-500"
                                      : "text-slate-400 hover:text-red-400 bg-white/5 border border-white/5 disabled:opacity-50"
                                  }`}
                                >
                                  <ThumbsDown size={11} /> {round.challengerDislikes}
                                </button>
                              </>
                            ) : (
                              <div className="flex items-center gap-2.5 text-[10px] text-slate-400 bg-white/5 rounded-full px-3 py-1 border border-white/5">
                                <span className="flex items-center gap-1" title="Votes favorables"><ThumbsUp size={10} /> {round.challengerLikes}</span>
                                <span className="flex items-center gap-1" title="Votes défavorables"><ThumbsDown size={10} /> {round.challengerDislikes}</span>
                              </div>
                            )}
                            <span className="ml-auto text-[9px] text-slate-500 font-bold uppercase">
                              Score Net : {getNetScore(round.challengerLikes, round.challengerDislikes)}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Defender Post (Right Side style or distinct color) */}
                    {hasDefender && (
                      <div className="flex items-start gap-3 max-w-[85%] ml-auto justify-end">
                        <div className="space-y-2 text-right order-1">
                          <div className="bg-accent/5 border border-accent/10 rounded-3xl rounded-tr-none p-5 shadow-sm text-slate-200 text-sm font-sans leading-relaxed text-left">
                            <p className="font-bold text-[10px] text-accent uppercase tracking-wider mb-2 text-right">{duel.defender}</p>
                            {round.defenderReply ? decodeHTML(round.defenderReply) : null}
                          </div>
                          
                          {/* Voting block for spectators */}
                          <div className="flex items-center justify-end gap-3 text-[10px] font-bold text-slate-500 pr-2 uppercase tracking-wider w-full">
                            <span>Arbitrage :</span>
                            {isSpectator ? (
                              <>
                                <button 
                                  disabled={hasVoted(idx, 'defender')}
                                  onClick={() => handleVoteClick(idx, 'defender', 'like')}
                                  className={`flex items-center gap-1 transition-colors rounded-full px-2.5 py-1 ${
                                    getVoteType(idx, 'defender') === 'like'
                                      ? "bg-blue-600 text-white border border-blue-500"
                                      : "text-slate-400 hover:text-white bg-white/5 border border-white/5 disabled:opacity-50"
                                  }`}
                                >
                                  <ThumbsUp size={11} /> {round.defenderLikes}
                                </button>
                                <button 
                                  disabled={hasVoted(idx, 'defender')}
                                  onClick={() => handleVoteClick(idx, 'defender', 'dislike')}
                                  className={`flex items-center gap-1 transition-colors rounded-full px-2.5 py-1 ${
                                    getVoteType(idx, 'defender') === 'dislike'
                                      ? "bg-red-600 text-white border border-red-500"
                                      : "text-slate-400 hover:text-red-400 bg-white/5 border border-white/5 disabled:opacity-50"
                                  }`}
                                >
                                  <ThumbsDown size={11} /> {round.defenderDislikes}
                                </button>
                              </>
                            ) : (
                              <div className="flex items-center gap-2.5 text-[10px] text-slate-400 bg-white/5 rounded-full px-3 py-1 border border-white/5">
                                <span className="flex items-center gap-1" title="Votes favorables"><ThumbsUp size={10} /> {round.defenderLikes}</span>
                                <span className="flex items-center gap-1" title="Votes défavorables"><ThumbsDown size={10} /> {round.defenderDislikes}</span>
                              </div>
                            )}
                            <span className="ml-3 text-[9px] text-slate-500 font-bold uppercase">
                              Score Net : {getNetScore(round.defenderLikes, round.defenderDislikes)}
                            </span>
                          </div>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-accent/20 text-white flex items-center justify-center font-bold text-xs uppercase shrink-0 order-2 border border-accent/30 shadow-sm">
                          {duel.defender.slice(0, 2)}
                        </div>
                      </div>
                    )}

                  </div>
                );
              })}

              {/* Inactive PENDING notice */}
              {duel.status === "PENDING" && (
                <div className="text-center py-12 bg-white/5 border border-dashed border-white/10 rounded-3xl space-y-4">
                  <Swords size={28} className="text-amber-500 mx-auto animate-pulse" />
                  <h4 className="font-serif font-bold text-white">Défi de duel envoyé</h4>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                    Ce duel commencera dès que <span className="font-bold text-slate-300">{duel.defender}</span> aura accepté le défi.
                  </p>
                  {isDefender && (
                    <div className="pt-2">
                      <button
                        onClick={() => acceptDuel(duel.id)}
                        className="bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 px-6 rounded-full text-xs uppercase tracking-wider shadow-premium transition-all cursor-pointer"
                      >
                        ⚔️ Accepter le défi
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Active Writer Form or Spectator Alert Banner */}
              {duel.status === "ACTIVE" && (
                <div className="border-t border-white/5 pt-6">
                  {isParticipant ? (
                    isMyTurnToWrite ? (
                      <form onSubmit={handlePostReply} className="space-y-3">
                        <div className="flex justify-between items-center text-[10px] font-bold text-slate-350 uppercase tracking-wider">
                          <span>Écrire votre réplique ({user.name})</span>
                          <span className="text-slate-500 font-normal">Tour {duel.currentRound}/{duel.roundLimit}</span>
                        </div>
                        <div className="flex gap-2">
                          <textarea
                            rows={3}
                            maxLength={500}
                            placeholder={`Tapez votre réplique ici. Limité à 500 caractères...`}
                            value={replyText}
                            onChange={e => setReplyText(e.target.value)}
                            className="flex-1 border border-white/10 bg-white/5 focus:bg-white/10 text-white rounded-2xl p-4 text-xs sm:text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none resize-none font-sans transition-all"
                          ></textarea>
                          <button
                            type="submit"
                            disabled={!replyText.trim()}
                            className="bg-accent hover:bg-accent-hover disabled:bg-slate-800 disabled:text-slate-500 text-white font-bold px-5 rounded-2xl flex items-center justify-center shadow-premium self-end h-12 transition-all focus:outline-none"
                          >
                            <Send size={15} />
                          </button>
                        </div>
                        <div className="flex justify-between text-[10px] text-slate-500 font-bold uppercase tracking-wider pl-1">
                          <span>Restez poli et respectez la charte déontologique.</span>
                          <span>{replyText.length}/500 caractères</span>
                        </div>
                      </form>
                    ) : (
                      <div className="bg-white/5 border border-white/5 rounded-xl p-4 text-center text-xs font-semibold text-slate-400">
                        📣 C'est au tour de <span className="text-slate-205 font-bold">{duel.currentTurn === "CHALLENGER" ? duel.challenger : duel.defender}</span> de répondre.
                        <p className="text-[10px] text-slate-505 font-normal mt-1">
                          Votre tour de parole s'activera automatiquement après sa réponse.
                        </p>
                      </div>
                    )
                  ) : (
                    <div className="bg-primary/5 border border-primary/20 rounded-2xl p-5 text-center text-xs text-slate-400 space-y-1">
                      <p className="font-bold text-slate-300">📢 Arène de Débat Citoyen (Accès Réservé)</p>
                      <p className="text-[11px] text-slate-450 leading-relaxed font-normal">
                        Seuls les deux duellistes engagés (<span className="text-slate-300 font-semibold">{duel.challenger}</span> et <span className="text-slate-300 font-semibold">{duel.defender}</span>) peuvent s'exprimer dans cet espace.
                      </p>
                      <p className="text-[11px] text-slate-455 font-normal">
                        En tant que spectateur, vous pouvez arbitrer ce débat en votant ci-dessous sur les arguments présentés !
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* CLOSED Victory Banner */}
              {duel.status === "CLOSED" && (
                <div className="brand-gradient-card bg-gradient-to-br from-primary to-[#4F46E5] text-white rounded-3xl p-6 text-center shadow-premium border border-white/10 glow-indigo relative overflow-hidden">
                  <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: "radial-gradient(white 1px, transparent 1px)", backgroundSize: "16px 16px" }}></div>
                  <Award size={32} className="text-amber-400 mx-auto mb-3 animate-bounce" />
                  <h3 className="font-serif text-lg font-bold mb-2">Duel Clos - Verdict du Public</h3>
                  
                  {duel.winner === "CHALLENGER" && (
                    <p className="text-sm text-white/80">
                      🏆 Félicitations à <span className="text-white font-bold">{duel.challenger}</span> qui remporte le duel avec un score net de <span className="text-accent font-bold">+{challengerTotalScore}</span> contre +{defenderTotalScore} !
                    </p>
                  )}
                  {duel.winner === "DEFENDER" && (
                    <p className="text-sm text-white/80">
                      🏆 Félicitations à <span className="text-white font-bold">{duel.defender}</span> qui remporte le duel avec un score net de <span className="text-accent font-bold">+{defenderTotalScore}</span> contre +{challengerTotalScore} !
                    </p>
                  )}
                  {duel.winner === "DRAW" && (
                    <p className="text-sm text-white/80">
                      🤝 Match nul ! Score net identique de <span className="text-white font-bold">+{challengerTotalScore}</span> pour les deux participants.
                    </p>
                  )}
                </div>
              )}

            </div>

          </div>

          {/* Right Column: Scoreboard & Profile stats (4 columns) */}
          <aside className="lg:col-span-4 space-y-6">
            
            {/* Real-time score Dashboard */}
            <div className="bg-[#12131C]/60 backdrop-blur-md rounded-2xl border border-white/10 p-6 shadow-premium">
              <h3 className="font-serif text-xs font-bold text-white pb-2.5 border-b border-white/5 mb-4 uppercase tracking-wider">
                📊 Score du Duel (Direct)
              </h3>
              <div className="space-y-4 font-sans">
                
                {/* Challenger Score */}
                <div className="flex justify-between items-center text-xs">
                  <div>
                    <p className="font-bold text-slate-200">{duel.challenger}</p>
                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Challenger</p>
                  </div>
                  <div className="text-right">
                    <p className="text-base font-bold text-primary">
                      {challengerTotalScore > 0 ? `+${challengerTotalScore}` : challengerTotalScore}
                    </p>
                    <p className="text-[9px] text-slate-550 uppercase tracking-wider font-bold">score net</p>
                  </div>
                </div>

                {/* Defender Score */}
                <div className="flex justify-between items-center text-xs">
                  <div>
                    <p className="font-bold text-slate-200">{duel.defender}</p>
                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Défendeur</p>
                  </div>
                  <div className="text-right">
                    <p className="text-base font-bold text-primary">
                      {defenderTotalScore > 0 ? `+${defenderTotalScore}` : defenderTotalScore}
                    </p>
                    <p className="text-[9px] text-slate-550 uppercase tracking-wider font-bold">score net</p>
                  </div>
                </div>

                {/* Leader indicator */}
                {duel.status === "ACTIVE" && (
                  <div className="bg-white/5 rounded-xl p-3 text-center border border-white/5">
                    {leader ? (
                      <p className="text-[11px] font-semibold text-slate-350">
                        ⭐ <span className="text-slate-100 font-bold">{leader}</span> est en tête avec <span className="text-accent font-bold">+{scoreDiff}</span> d'écart.
                      </p>
                    ) : (
                      <p className="text-[11px] font-semibold text-slate-400">
                        ⭐ Égalité parfaite de score net !
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Debaters Profiles statistics */}
            <div className="bg-[#12131C]/60 backdrop-blur-md rounded-2xl border border-white/10 p-6 shadow-premium space-y-4">
              <h3 className="font-serif text-xs font-bold text-white pb-2 border-b border-white/5 uppercase tracking-wider">
                👤 Statistiques Duellistes
              </h3>
              
              {/* Challenger Stats */}
              <div className="space-y-1.5 font-sans">
                <p className="text-xs font-bold text-slate-300">{duel.challenger}</p>
                <div className="grid grid-cols-3 gap-2 text-center bg-white/5 p-2.5 rounded-xl border border-white/5 text-xs">
                  <div>
                    <p className="text-slate-500 text-[9px] font-bold uppercase tracking-wider">Victoires</p>
                    <p className="font-bold text-primary">{duel.challengerStats.wins}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-[9px] font-bold uppercase tracking-wider">Défaites</p>
                    <p className="font-bold text-slate-400">{duel.challengerStats.losses}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-[9px] font-bold uppercase tracking-wider">Ratio</p>
                    <p className="font-bold text-accent">{duel.challengerStats.ratio}%</p>
                  </div>
                </div>
              </div>

              {/* Defender Stats */}
              <div className="space-y-1.5 font-sans pt-2">
                <p className="text-xs font-bold text-slate-300">{duel.defender}</p>
                <div className="grid grid-cols-3 gap-2 text-center bg-white/5 p-2.5 rounded-xl border border-white/5 text-xs">
                  <div>
                    <p className="text-slate-500 text-[9px] font-bold uppercase tracking-wider">Victoires</p>
                    <p className="font-bold text-primary">{duel.defenderStats.wins}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-[9px] font-bold uppercase tracking-wider">Défaites</p>
                    <p className="font-bold text-slate-400">{duel.defenderStats.losses}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-[9px] font-bold uppercase tracking-wider">Ratio</p>
                    <p className="font-bold text-accent">{duel.defenderStats.ratio}%</p>
                  </div>
                </div>
              </div>
            </div>

          </aside>

        </div>

      </main>

      <Footer />
    </div>
  );
}
