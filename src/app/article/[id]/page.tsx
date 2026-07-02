"use client";

import React, { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useKomentel, decodeHTML } from "@/context/KomentelContext";
import { useParams, useRouter } from "next/navigation";
import { CheckCircle2, ChevronRight, MessageSquare, Clock, Eye, AlertTriangle, Send, Swords, ThumbsUp, ThumbsDown, AlertCircle } from "lucide-react";
import Link from "next/link";
import { ReactionsBar } from "@/components/ReactionsBar";

export default function ArticlePage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const { 
    articles, 
    comments, 
    user, 
    registeredUsers,
    addComment, 
    reportComment, 
    likeComment,
    dislikeComment,
    challengeToDuel,
    challengeArticleToDuel,
    acceptDuel,
    postDuelReply,
    voteDuelReply,
    followDuel,
    unfollowDuel,
    isFollowingDuel,
    duels,
    commentReactions,
    language
  } = useKomentel();

  const t = (frText: string, enText: string) => {
    return language === "FR" ? frText : enText;
  };

  const translateTimeAgo = (time: string) => {
    if (language === 'FR') return time;
    return time
      .replace("Il y a moins d'une heure", "Less than an hour ago")
      .replace("Il y a ", "")
      .replace("h", "h ago")
      .replace("j", "d ago")
      .replace("Aujourd'hui", "Today")
      .replace("Récemment", "Recently")
      .replace("Juin", "June")
      .replace("Juillet", "July")
      .replace("Août", "August");
  };

  const [newCommentText, setNewCommentText] = useState("");
  const [replyTargetId, setReplyTargetId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [debateTargetId, setDebateTargetId] = useState<string | null>(null);
  const [debateText, setDebateText] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);
  
  // States for article-level debates
  const [openingArgumentText, setOpeningArgumentText] = useState("");
  const [showStartDebateForm, setShowStartDebateForm] = useState(false);
  const [duelReplyText, setDuelReplyText] = useState("");
  const [votedReplies, setVotedReplies] = useState<Record<string, 'like' | 'dislike'>>({});
  


  const article = articles.find(a => a.id === id);

  const authorInfo = article 
    ? registeredUsers.find(u => u.name.toLowerCase() === article.sourceName.toLowerCase())
    : null;

  const getYoutubeEmbedUrl = (url?: string) => {
    if (!url) return null;
    
    // Check for YouTube Shorts
    if (url.includes("youtube.com/shorts/")) {
      const parts = url.split("youtube.com/shorts/");
      if (parts[1]) {
        const id = parts[1].split(/[?#&]/)[0];
        return `https://www.youtube.com/embed/${id}`;
      }
    }
    
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    if (match && match[2].length === 11) {
      return `https://www.youtube.com/embed/${match[2]}`;
    }
    return null;
  };

  if (!article) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
        <Header />
        <main className="max-w-3xl mx-auto px-4 py-20 text-center flex-1">
          <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-serif font-bold text-primary mb-2">{t("Article non trouvé", "Article not found")}</h2>
          <p className="text-slate-500 mb-6">{t("L'article que vous recherchez n'existe pas ou a été déplacé.", "The article you are looking for does not exist or has been moved.")}</p>
          <Link href="/" className="bg-primary text-white font-semibold px-6 py-2.5 rounded-full text-xs uppercase tracking-wider shadow">
            {t("Retourner à l'accueil", "Return to home page")}
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  // Filter comments for this article
  const articleComments = comments.filter(c => c.articleId === id && !c.reported);
  const rootComments = articleComments.filter(c => c.parentId === null);

  // Find the top liked comment (simulating "Meilleur commentaire")
  const topComment = articleComments.length > 0 
    ? [...articleComments].sort((a, b) => b.likes - a.likes)[0] 
    : null;



  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;
    addComment(id, newCommentText, null);
    setNewCommentText("");
  };

  const handleAddReply = (parentId: string) => {
    if (!replyText.trim()) return;
    addComment(id, replyText, parentId);
    setReplyText("");
    setReplyTargetId(null);
  };

  const handleCreateDebate = async (commentId: string, authorName: string) => {
    if (!user) {
      alert(t("Vous devez être connecté pour lancer un débat.", "You must be logged in to start a debate."));
      router.push(`/login?redirect=/article/${id}`);
      return;
    }
    if (!debateText.trim()) return;
    const duelId = await challengeToDuel(id, commentId, authorName, debateText);
    setDebateText("");
    setDebateTargetId(null);
    if (duelId) {
      router.push(`/duel/${duelId}`);
    }
  };

  const handleStartArticleDebate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert(t("Vous devez être connecté pour lancer un débat.", "You must be logged in to start a debate."));
      router.push(`/login?redirect=/article/${id}`);
      return;
    }
    if (!openingArgumentText.trim()) return;
    await challengeArticleToDuel(id, openingArgumentText);
    setOpeningArgumentText("");
    setShowStartDebateForm(false);
  };

  const handleVoteReplyClick = (duelId: string, roundIdx: number, side: 'challenger' | 'defender', type: 'like' | 'dislike') => {
    if (!user) {
      alert(t("Veuillez vous connecter pour voter.", "Please log in to vote."));
      return;
    }
    const key = `${duelId}-${roundIdx}-${side}`;
    if (votedReplies[key]) return;

    voteDuelReply(duelId, roundIdx, side, type);

    setVotedReplies(prev => ({
      ...prev,
      [key]: type
    }));
  };



  return (
    <div className="min-h-screen flex flex-col bg-background bg-grid-pattern font-sans text-slate-200">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full relative">
        {/* Ambient glow backgrounds */}
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px] pointer-events-none -z-10"></div>
        
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-1 text-xs text-slate-500 font-semibold mb-4 uppercase tracking-wider">
          <Link href="/" className="hover:text-white transition-colors">{t("Accueil", "Home")}</Link>
          <ChevronRight size={12} />
          <span className="hover:text-white transition-colors cursor-pointer">{language === 'FR' ? article.category : (article.categoryEn || article.category)}</span>
        </nav>
        <div className="max-w-4xl mx-auto space-y-8">
            
            {/* Article Headings */}
            <div className="bg-transparent border-0 p-0 shadow-none">
              <span className="inline-block bg-accent/15 text-accent text-[9px] font-extrabold uppercase px-2.5 py-1 rounded-full tracking-wider mb-3 border border-accent/20">
                {language === 'FR' ? article.category : (article.categoryEn || article.category)}
              </span>
              <h1 className="font-serif text-4xl sm:text-5xl font-extrabold text-white leading-[1.12] mb-6">
                {language === 'FR' ? article.title : (article.titleEn || article.title)}
              </h1>

              {/* Author / Date / View counts */}
              <div className="flex flex-wrap items-center gap-4 text-[10px] font-bold text-slate-500 border-b border-white/5 pb-5 mb-8 uppercase tracking-wider">
                <span className="flex items-center gap-1 text-slate-300 font-bold uppercase tracking-wider">
                  {t("Par ", "By ") + article.sourceName}
                  {article.sourceVerified && (
                    <CheckCircle2 size={12} className="text-primary fill-primary/10" />
                  )}
                </span>
                <span>•</span>
                <span>{translateTimeAgo(article.publishedAt)}</span>
                <span>•</span>
                <span className="flex items-center gap-1"><Clock size={12} /> {article.readTime}</span>
                <span>•</span>
                <span className="flex items-center gap-1"><Eye size={12} /> {article.views.toLocaleString()} {t("vues", "views")}</span>
              </div>

              {/* Corrections Banner - Editorial Transparency */}
              {article.corrections.length > 0 && (
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-5 mb-8 flex gap-3 text-xs text-amber-200 shadow-sm">
                  <AlertTriangle size={16} className="text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold mb-1 uppercase tracking-wider text-[10px] text-amber-400">{t("Historique des Corrections (Transparence Éditoriale)", "Correction History (Editorial Transparency)")}</p>
                    <ul className="space-y-1.5">
                      {article.corrections.map((corr, idx) => (
                        <li key={idx} className="leading-relaxed">
                          <span className="font-bold text-amber-300">{translateTimeAgo(corr.date)}</span> : {corr.text}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Cover Image */}
              <div className="rounded-2xl overflow-hidden shadow-premium border border-white/10 mb-4">
                <img src={article.imageUrl} alt={language === 'FR' ? article.title : (article.titleEn || article.title)} className="w-full h-[400px] object-cover" />
              </div>

              {/* Interactive reactions */}
              <div className="mb-8">
                <ReactionsBar articleId={article.id} />
              </div>

              {/* Article Paragraphs */}
              <div className="font-serif text-slate-350 text-[17px] sm:text-[18px] leading-[1.75] space-y-6">
                {(language === 'FR' ? article.content : (article.contentEn || article.content)).map((p, idx) => (
                  <p key={idx}>{p}</p>
                ))}
              </div>

              {/* Author Profile Block */}
              <div className="mt-12 bg-white/[0.03] backdrop-blur-md rounded-2xl border border-white/10 p-6 flex flex-col sm:flex-row gap-5 items-start sm:items-center shadow-premium relative overflow-hidden">
                <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-grid-pattern"></div>
                {authorInfo ? (
                  <>
                    {/* Avatar */}
                    {authorInfo.photoUrl ? (
                      <img 
                        src={authorInfo.photoUrl} 
                        alt={authorInfo.name} 
                        className="w-16 h-16 rounded-full object-cover border-2 border-primary shadow shrink-0" 
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-primary/20 text-white flex items-center justify-center font-bold text-lg uppercase border border-primary/30 shrink-0">
                        {authorInfo.name.slice(0, 2)}
                      </div>
                    )}
                    
                    {/* Author Details */}
                    <div className="flex-1 space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="font-serif text-lg font-bold text-white leading-tight">
                          {authorInfo.name}
                        </h4>
                        
                        {/* Role Badges */}
                        {authorInfo.role === "JOURNALIST" && (
                          <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[9px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                            {t("Journaliste Accrédité", "Accredited Journalist")}
                          </span>
                        )}
                        {authorInfo.role === "ADMIN" && (
                          <span className="bg-purple-500/20 text-purple-400 border border-purple-500/30 text-[9px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                            {t("Administrateur", "Administrator")}
                          </span>
                        )}
                        {authorInfo.role === "USER" && (
                          <span className="bg-sky-500/20 text-sky-400 border border-sky-500/30 text-[9px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                            {t("Contributeur", "Contributor")}
                          </span>
                        )}
                      </div>
                      
                      {/* Bio */}
                      <p className="text-xs text-slate-400 leading-relaxed font-sans max-w-xl">
                        {authorInfo.bio || t("Membre de la communauté Komentel qui participe activement à la rédaction d'actualités et à l'arbitrage des débats.", "Komentel community member who actively participates in news writing and debate moderation.")}
                      </p>
                      
                      {/* Meta information */}
                      <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                        {authorInfo.media && (
                          <span>{t("Organe de presse : ", "Press Agency: ")}<span className="text-slate-350">{authorInfo.media}</span></span>
                        )}
                        {authorInfo.pressCard && (
                          <span>{t("Carte Presse : ", "Press Card: ")}<span className="text-slate-350">{authorInfo.pressCard}</span></span>
                        )}
                        <span>{t("Duels : ", "Duels: ")}<span className="text-primary">{authorInfo.duelsStats.wins}{t("V", "W")} - {authorInfo.duelsStats.losses}{t("D", "L")} ({authorInfo.duelsStats.ratio}%)</span></span>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    {/* External source fallback (e.g. AFP, Euronews) */}
                    <div className="w-16 h-16 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center font-bold text-lg uppercase border border-white/5 shrink-0">
                      {article.sourceName.slice(0, 2)}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-serif text-base font-bold text-white leading-tight">
                          {article.sourceName}
                        </h4>
                        <span className="bg-slate-500/20 text-slate-400 border border-slate-500/30 text-[9px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                          {t("Agence Presse Externe", "External Press Agency")}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed font-sans">
                        {t("Information rapportée par notre flux de presse partenaire officiel. Cet article a fait l'objet d'une validation factuelle stricte avant sa mise en ligne.", "Information reported by our official partner news feed. This article has undergone strict factual validation before going online.")}
                      </p>
                    </div>
                  </>
                )}
              </div>

              {/* Video Media Embed */}
              {article.videoUrl && (
                <div className="mt-8 space-y-3">
                  <h3 className="font-serif text-sm font-bold text-white uppercase tracking-wider block">
                    {t("🎥 Vidéo associée", "🎥 Associated Video")}
                  </h3>
                  <div className="rounded-2xl overflow-hidden border border-white/10 shadow-premium bg-black/40">
                    {getYoutubeEmbedUrl(article.videoUrl) ? (
                      <iframe
                        src={getYoutubeEmbedUrl(article.videoUrl)!}
                        title={`Vidéo pour ${language === 'FR' ? article.title : (article.titleEn || article.title)}`}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="w-full aspect-video"
                      ></iframe>
                    ) : (
                      <video 
                        src={article.videoUrl} 
                        controls 
                        className="w-full aspect-video object-contain"
                      />
                    )}
                  </div>
                </div>
              )}

              {/* Additional Photos Gallery */}
              {article.additionalImages && article.additionalImages.length > 0 && (
                <div className="mt-8 space-y-4">
                  <h3 className="font-serif text-sm font-bold text-white uppercase tracking-wider block">
                    {t("🖼️ Galerie d'images", "🖼️ Image Gallery")}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {article.additionalImages.map((imgUrl, index) => (
                      <a 
                        key={index} 
                        href={imgUrl} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="rounded-2xl overflow-hidden border border-white/10 hover:border-white/20 transition-all block group relative bg-black/20"
                      >
                        <img 
                          src={imgUrl} 
                          alt={`Média additionnel ${index + 1}`} 
                          className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs text-white font-bold uppercase tracking-wider">
                          {t("Agrandir l'image", "Enlarge Image")}
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Pinned Top Comment (Meilleur Commentaire) */}
            {topComment && (
              <div className="bg-primary/5 rounded-2xl border border-primary/20 p-6 shadow-premium glow-indigo">
                <span className="inline-block bg-primary text-white text-[8px] font-extrabold uppercase px-2 py-0.5 rounded tracking-widest mb-3 border border-primary/30">
                  {t("🔥 Meilleur Commentaire", "🔥 Top Comment")}
                </span>
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-bold text-slate-200">{topComment.author}</span>
                      {topComment.authorBadge && (
                        <span className="bg-accent/20 border border-accent/20 text-accent text-[9px] font-bold px-2 py-0.5 rounded uppercase">
                          {topComment.authorBadge}
                        </span>
                      )}
                      <span className="text-[10px] text-slate-500">{topComment.createdAt}</span>
                    </div>
                    <p className="text-sm text-slate-300 leading-relaxed font-sans">
                      {decodeHTML(topComment.content)}
                    </p>
                  </div>
                </div>
                <div className="flex gap-4 mt-4 text-[10px] font-bold uppercase tracking-wider text-slate-500 border-t border-white/5 pt-3">
                  <button 
                    onClick={() => likeComment(topComment.id)}
                    className={`flex items-center gap-1 transition-colors ${commentReactions[topComment.id] === 'like' ? "text-blue-500 font-bold" : "text-slate-400 hover:text-slate-350"}`}
                  >
                    <ThumbsUp size={12} /> {topComment.likes}
                  </button>
                </div>
              </div>
            )}


            {/* Débat Citoyen Section */}
            {(() => {
              const articleDuel = duels.find(d => d.articleId === id);
              if (!articleDuel) {
                return (
                  <div className="bg-[#12131C]/60 backdrop-blur-md rounded-2xl border border-white/10 p-6 sm:p-8 shadow-premium space-y-4">
                    <div className="flex items-center gap-2 border-l-4 border-amber-500 pl-3">
                      <h3 className="font-serif text-sm font-bold text-white flex items-center gap-1.5 uppercase tracking-wider">
                        <Swords size={16} className="text-amber-500" />
                        {t("Débats & Opinions", "Debates & Opinions")}
                      </h3>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-400">
                      {t("Aucun débat en cours sur cet article. Lancez le premier défi d'opinion !", "No debates active on this article. Launch the first opinion challenge!")}
                    </p>
                    {user ? (
                      <div>
                        {!showStartDebateForm ? (
                          <button
                            onClick={() => setShowStartDebateForm(true)}
                            className="bg-amber-500 hover:bg-amber-600 text-white font-bold py-2 px-5 rounded-xl text-xs uppercase tracking-wider shadow transition-all cursor-pointer"
                          >
                            ⚔️ {t("Lancer un débat", "Start a Debate")}
                          </button>
                        ) : (
                          <form onSubmit={handleStartArticleDebate} className="mt-4 space-y-3 border-t border-white/5 pt-4">
                            <label className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
                              {t("Votre argument d'ouverture :", "Your opening argument:")}
                            </label>
                            <textarea
                              rows={3}
                              maxLength={500}
                              placeholder={t("Présentez votre thèse ou contestation de manière constructive... (max 500 caract.)", "Present your thesis or contestation constructively... (max 500 char.)")}
                              value={openingArgumentText}
                              onChange={e => setOpeningArgumentText(e.target.value)}
                              className="w-full border border-amber-500/20 rounded-xl p-3 text-xs sm:text-sm text-white focus:ring-1 focus:ring-amber-500 bg-white/5 focus:bg-white/10 outline-none resize-none transition-all font-sans"
                            />
                            <div className="flex gap-2 justify-end">
                              <button
                                type="submit"
                                className="bg-amber-500 hover:bg-amber-600 text-white px-5 py-2 rounded-xl text-xs font-bold shadow cursor-pointer"
                              >
                                {t("Lancer", "Start")}
                              </button>
                              <button
                                type="button"
                                onClick={() => { setShowStartDebateForm(false); setOpeningArgumentText(""); }}
                                className="border border-white/10 text-slate-400 px-5 py-2 rounded-xl text-xs hover:bg-white/5 cursor-pointer"
                              >
                                {t("Annuler", "Cancel")}
                              </button>
                            </div>
                          </form>
                        )}
                      </div>
                    ) : (
                      <div className="pt-2">
                        <Link
                          href={`/login?redirect=/article/${id}`}
                          className="bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 text-amber-400 font-bold py-2 px-5 rounded-xl text-xs uppercase tracking-wider transition-all inline-block"
                        >
                          🔑 {t("Se connecter pour débattre", "Log in to Debate")}
                        </Link>
                      </div>
                    )}
                  </div>
                );
              }

              // A duel exists!
              let chScore = 0;
              let defScore = 0;
              articleDuel.rounds.forEach(r => {
                if (r.challengerReply) chScore += (r.challengerLikes - r.challengerDislikes);
                if (r.defenderReply) defScore += (r.defenderLikes - r.defenderDislikes);
              });

              const isCh = user !== null && user.name === articleDuel.challenger;
              const isDef = user !== null && user.name === articleDuel.defender;
              const isPart = isCh || isDef;
              const isSpec = !isPart;

              const isTurn = 
                articleDuel.status === "ACTIVE" && 
                ((articleDuel.currentTurn === "CHALLENGER" && isCh) ||
                 (articleDuel.currentTurn === "DEFENDER" && isDef));

              const hVoted = (roundIdx: number, side: 'challenger' | 'defender') => {
                return votedReplies[`${articleDuel.id}-${roundIdx}-${side}`] !== undefined;
              };

              const getVType = (roundIdx: number, side: 'challenger' | 'defender') => {
                return votedReplies[`${articleDuel.id}-${roundIdx}-${side}`];
              };

              return (
                <div className="bg-[#12131C]/60 backdrop-blur-md rounded-2xl border border-white/10 p-6 sm:p-8 shadow-premium space-y-6">
                  <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/5 pb-4">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${
                        articleDuel.status === "ACTIVE" 
                          ? "bg-accent/15 text-accent border border-accent/20 animate-pulse" 
                          : articleDuel.status === "CLOSED" 
                            ? "bg-slate-800 text-slate-400 border border-white/5"
                            : "bg-amber-500/15 text-amber-400 border border-amber-500/20"
                      }`}>
                        ⚔️ {articleDuel.status === "ACTIVE" ? t("Débat en cours", "Active Debate") : articleDuel.status === "CLOSED" ? t("Débat clos", "Closed Debate") : t("Défi lancé", "Challenge Pending")}
                      </span>
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                        {articleDuel.status === "CLOSED" ? t("Verdict final", "Final verdict") : articleDuel.closesAt}
                      </span>
                      {user && (
                        <button
                          onClick={() => isFollowingDuel(articleDuel.id) ? unfollowDuel(articleDuel.id) : followDuel(articleDuel.id)}
                          className={`text-[9px] font-extrabold py-0.5 px-2.5 rounded-full border transition-all cursor-pointer flex items-center gap-1 uppercase tracking-wider ml-2 ${
                            isFollowingDuel(articleDuel.id)
                              ? "bg-green-600/20 text-green-400 border-green-500/30 shadow-[0_0_8px_rgba(34,197,94,0.1)]"
                              : "bg-white/5 border border-white/10 text-slate-450 hover:text-white hover:bg-white/10"
                          }`}
                        >
                          <span>🔔</span>
                          <span>{isFollowingDuel(articleDuel.id) ? t("Suivi", "Followed") : t("Suivre le débat", "Follow")}</span>
                        </button>
                      )}
                    </div>
                    
                    {/* Scoreboard */}
                    <div className="flex items-center gap-4 text-xs font-bold">
                      <span className="text-primary">{articleDuel.challenger} ({chScore > 0 ? `+${chScore}` : chScore})</span>
                      <span className="text-slate-500">VS</span>
                      <span className="text-accent">{articleDuel.defender} ({defScore > 0 ? `+${defScore}` : defScore})</span>
                    </div>
                  </div>

                  {/* Rounds list */}
                  <div className="space-y-6">
                    {articleDuel.rounds.map((round, idx) => {
                      const hasCh = round.challengerReply !== null;
                      const hasDef = round.defenderReply !== null;

                      if (!hasCh && !hasDef) return null;

                      return (
                        <div key={idx} className="space-y-4">
                          <div className="text-center">
                            <span className="inline-block bg-white/5 border border-white/5 text-slate-500 text-[8px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest">
                              {t("Tour", "Round")} {round.turn} / {articleDuel.roundLimit}
                            </span>
                          </div>

                          {/* Challenger argument */}
                          {hasCh && (
                            <div className="flex gap-2 max-w-[85%]">
                              <div className="w-6 h-6 rounded-full bg-primary/20 text-white flex items-center justify-center font-bold text-[10px] uppercase shrink-0 border border-primary/30">
                                {articleDuel.challenger.slice(0, 2)}
                              </div>
                              <div className="space-y-1 flex-1">
                                <div className="bg-primary/5 border border-primary/10 rounded-2xl rounded-tl-none p-4 shadow-sm text-slate-200 text-xs sm:text-sm font-sans leading-relaxed">
                                  <p className="font-bold text-[9px] text-primary uppercase tracking-wider mb-1">{articleDuel.challenger}</p>
                                  {decodeHTML(round.challengerReply || "")}
                                </div>
                                
                                {/* Spec Voting */}
                                <div className="flex items-center gap-2.5 text-[9px] font-bold uppercase tracking-wider text-slate-500 pl-1">
                                  {isSpec ? (
                                    <>
                                      <button 
                                        disabled={hVoted(idx, 'challenger')}
                                        onClick={() => handleVoteReplyClick(articleDuel.id, idx, 'challenger', 'like')}
                                        className={`flex items-center gap-1 transition-colors rounded-full px-2 py-0.5 cursor-pointer ${
                                          getVType(idx, 'challenger') === 'like'
                                            ? "bg-blue-600 text-white border border-blue-500"
                                            : "text-slate-400 hover:text-white bg-white/5 border border-white/5"
                                        }`}
                                      >
                                        <ThumbsUp size={10} /> {round.challengerLikes}
                                      </button>
                                      <button 
                                        disabled={hVoted(idx, 'challenger')}
                                        onClick={() => handleVoteReplyClick(articleDuel.id, idx, 'challenger', 'dislike')}
                                        className={`flex items-center gap-1 transition-colors rounded-full px-2 py-0.5 cursor-pointer ${
                                          getVType(idx, 'challenger') === 'dislike'
                                            ? "bg-red-600 text-white border border-red-500"
                                            : "text-slate-400 hover:text-red-400 bg-white/5 border border-white/5"
                                        }`}
                                      >
                                        <ThumbsDown size={10} /> {round.challengerDislikes}
                                      </button>
                                    </>
                                  ) : (
                                    <div className="flex items-center gap-2 text-slate-400 bg-white/5 rounded-full px-2 py-0.5">
                                      <span className="flex items-center gap-0.5"><ThumbsUp size={9} /> {round.challengerLikes}</span>
                                      <span className="flex items-center gap-0.5"><ThumbsDown size={9} /> {round.challengerDislikes}</span>
                                    </div>
                                  )}
                                  <span className="ml-auto text-[8px] text-slate-550">
                                    Score Net: {round.challengerLikes - round.challengerDislikes}
                                  </span>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Defender argument */}
                          {hasDef && (
                            <div className="flex gap-2 max-w-[85%] ml-auto justify-end">
                              <div className="space-y-1 text-right order-1 flex-1">
                                <div className="bg-accent/5 border border-accent/10 rounded-2xl rounded-tr-none p-4 shadow-sm text-slate-200 text-xs sm:text-sm font-sans leading-relaxed text-left">
                                  <p className="font-bold text-[9px] text-accent uppercase tracking-wider mb-1 text-right">{articleDuel.defender}</p>
                                  {decodeHTML(round.defenderReply || "")}
                                </div>
                                
                                {/* Spec Voting */}
                                <div className="flex items-center justify-end gap-2.5 text-[9px] font-bold uppercase tracking-wider text-slate-500 pr-1">
                                  {isSpec ? (
                                    <>
                                      <button 
                                        disabled={hVoted(idx, 'defender')}
                                        onClick={() => handleVoteReplyClick(articleDuel.id, idx, 'defender', 'like')}
                                        className={`flex items-center gap-1 transition-colors rounded-full px-2 py-0.5 cursor-pointer ${
                                          getVType(idx, 'defender') === 'like'
                                            ? "bg-blue-600 text-white border border-blue-500"
                                            : "text-slate-400 hover:text-white bg-white/5 border border-white/5"
                                        }`}
                                      >
                                        <ThumbsUp size={10} /> {round.defenderLikes}
                                      </button>
                                      <button 
                                        disabled={hVoted(idx, 'defender')}
                                        onClick={() => handleVoteReplyClick(articleDuel.id, idx, 'defender', 'dislike')}
                                        className={`flex items-center gap-1 transition-colors rounded-full px-2 py-0.5 cursor-pointer ${
                                          getVType(idx, 'defender') === 'dislike'
                                            ? "bg-red-600 text-white border border-red-500"
                                            : "text-slate-400 hover:text-red-400 bg-white/5 border border-white/5"
                                        }`}
                                      >
                                        <ThumbsDown size={10} /> {round.defenderDislikes}
                                      </button>
                                    </>
                                  ) : (
                                    <div className="flex items-center gap-2 text-slate-400 bg-white/5 rounded-full px-2 py-0.5">
                                      <span className="flex items-center gap-0.5"><ThumbsUp size={9} /> {round.defenderLikes}</span>
                                      <span className="flex items-center gap-0.5"><ThumbsDown size={9} /> {round.defenderDislikes}</span>
                                    </div>
                                  )}
                                  <span className="ml-3 text-[8px] text-slate-550">
                                    Score Net: {round.defenderLikes - round.defenderDislikes}
                                  </span>
                                </div>
                              </div>
                              <div className="w-6 h-6 rounded-full bg-accent/20 text-white flex items-center justify-center font-bold text-[10px] uppercase shrink-0 order-2 border border-accent/30">
                                {articleDuel.defender.slice(0, 2)}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Actions for players */}
                  {articleDuel.status === "PENDING" && (
                    <div className="bg-white/5 border border-white/5 rounded-xl p-4 text-center">
                      <p className="text-xs text-slate-400">
                        {articleDuel.defender === "En attente" 
                          ? t("Ce débat attend un contradicteur pour démarrer.", "This debate is waiting for a contradicter to start.")
                          : t("En attente d'acceptation du défi...", "Waiting for challenge acceptance...")}
                      </p>
                      {articleDuel.defender === "En attente" && !isCh && (
                        user ? (
                          <button
                            onClick={() => acceptDuel(articleDuel.id)}
                            className="bg-amber-500 hover:bg-amber-600 text-white font-bold py-2 px-6 rounded-full text-[10px] uppercase tracking-wider mt-3 shadow cursor-pointer"
                          >
                            🤝 {t("Rejoindre le débat", "Join the Debate")}
                          </button>
                        ) : (
                          <Link
                            href={`/login?redirect=/article/${id}`}
                            className="bg-amber-500 hover:bg-amber-600 text-white font-bold py-2 px-6 rounded-full text-[10px] uppercase tracking-wider mt-3 shadow inline-block"
                          >
                            🔑 {t("Se connecter pour rejoindre", "Log in to Join")}
                          </Link>
                        )
                      )}
                    </div>
                  )}

                  {articleDuel.status === "ACTIVE" && (
                    <div className="border-t border-white/5 pt-4">
                      {isPart ? (
                        isTurn ? (
                          <form 
                            onSubmit={(e) => {
                              e.preventDefault();
                              if (!duelReplyText.trim()) return;
                              postDuelReply(articleDuel.id, duelReplyText);
                              setDuelReplyText("");
                            }}
                            className="space-y-2"
                          >
                            <label className="text-[10px] text-amber-400 font-bold uppercase tracking-wider block">
                              {t("Écrire votre réplique :", "Write your reply:")}
                            </label>
                            <div className="flex gap-2">
                              <textarea
                                rows={2}
                                maxLength={500}
                                placeholder={t("Saisissez votre argument contradictoire...", "Enter your contradictory argument...")}
                                value={duelReplyText}
                                onChange={e => setDuelReplyText(e.target.value)}
                                className="flex-1 border border-white/10 bg-white/5 focus:bg-white/10 text-white rounded-xl p-3 text-xs focus:ring-1 focus:ring-primary outline-none resize-none transition-all font-sans"
                              />
                              <button
                                type="submit"
                                disabled={!duelReplyText.trim()}
                                className="bg-amber-500 hover:bg-amber-600 disabled:bg-slate-800 disabled:text-slate-500 text-white px-4 rounded-xl flex items-center justify-center shadow h-10 transition-colors self-end cursor-pointer"
                              >
                                <Send size={14} />
                              </button>
                            </div>
                          </form>
                        ) : (
                          <div className="bg-white/5 border border-white/5 rounded-xl p-3 text-center text-xs font-semibold text-slate-400">
                            📢 {t("C'est au tour de", "It is the turn of")}{" "}
                            <span className="text-white font-bold">{articleDuel.currentTurn === "CHALLENGER" ? articleDuel.challenger : articleDuel.defender}</span>{" "}
                            {t("de répliquer.", "to reply.")}
                          </div>
                        )
                      ) : (
                        <div className="bg-primary/5 border border-primary/10 rounded-xl p-4 text-center text-xs text-slate-400">
                          📣 {t("Vous observez ce débat en tant que spectateur. Votez sur les arguments ci-dessus pour exprimer votre opinion !", "You are observing this debate as a spectator. Vote on the arguments above to express your opinion!")}
                        </div>
                      )}
                    </div>
                  )}

                  {articleDuel.status === "CLOSED" && (
                    <div className="bg-gradient-to-r from-primary/10 to-accent/10 border border-white/10 rounded-xl p-5 text-center shadow">
                      <span className="text-xl">🏆</span>
                      <h4 className="font-serif font-bold text-white text-sm mt-1">{t("Débat Terminé", "Debate Completed")}</h4>
                      <p className="text-xs text-slate-300 mt-2">
                        {chScore > defScore ? (
                          <>
                            {t("Le public a désigné", "The public designated")}{" "}
                            <span className="font-extrabold text-primary">{articleDuel.challenger}</span>{" "}
                            {t("comme vainqueur de cette confrontation d'idées !", "as the winner of this confrontation of ideas!")}
                          </>
                        ) : defScore > chScore ? (
                          <>
                            {t("Le public a désigné", "The public designated")}{" "}
                            <span className="font-extrabold text-accent">{articleDuel.defender}</span>{" "}
                            {t("comme vainqueur de cette confrontation d'idées !", "as the winner of this confrontation of ideas!")}
                          </>
                        ) : (
                          t("Ce débat s'est terminé par un match nul !", "This debate ended in a draw!")
                        )}
                      </p>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Structured Comments Section */}
            <section id="comments" className="bg-[#12131C]/60 backdrop-blur-md rounded-2xl border border-white/10 p-6 sm:p-8 shadow-premium space-y-6">
              <div className="flex justify-between items-center border-b border-white/5 pb-4">
                <h3 className="font-serif text-sm font-bold text-white flex items-center gap-2 uppercase tracking-wider">
                  <MessageSquare size={16} className="text-slate-400" />
                  {t("Commentaires", "Comments")} ({articleComments.length})
                </h3>
                <button 
                  onClick={() => setIsSubscribed(!isSubscribed)}
                  className={`text-[10px] font-extrabold transition-all uppercase tracking-wider ${
                    isSubscribed 
                      ? "text-green-400 hover:text-green-500 flex items-center gap-1" 
                      : "text-accent hover:underline"
                  }`}
                >
                  {isSubscribed ? t("🔔 Discussion Suivie", "🔔 Discussion Followed") : t("Suivre la discussion", "Follow discussion")}
                </button>
              </div>

              {article.commentsDisabled ? (
                <div className="text-center py-6 text-slate-500 text-xs sm:text-sm">
                  {t("La rédaction a désactivé les commentaires sur ce sujet sensible.", "The editorial team has disabled comments on this sensitive topic.")}
                </div>
              ) : (
                <>
                  {/* Comments Feed */}
                  <div className="space-y-6">
                    {rootComments.length === 0 ? (
                      <p className="text-slate-500 text-xs sm:text-sm text-center py-6">
                        {t("Aucun commentaire sur cet article. Donnez votre avis ci-dessous !", "No comments on this article. Share your thoughts below!")}
                      </p>
                    ) : (
                      rootComments.map(c => {
                        const childComments = articleComments.filter(child => child.parentId === c.id);
                        const hasDebate = duels.some(d => d.commentId === c.id);
                        return (
                          <div key={c.id} className="space-y-4 border-b border-white/5 pb-4 last:border-0 last:pb-0">
                            {/* Root Comment Row */}
                            <div className="flex gap-3">
                              <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center font-bold text-xs uppercase text-slate-300 border border-white/10 shadow-sm shrink-0">
                                {c.author.slice(0, 2)}
                              </div>
                              <div className="flex-1 space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-bold text-slate-200">{c.author}</span>
                                  {c.authorBadge && (
                                    <span className="bg-accent/20 border border-accent/20 text-accent text-[9px] font-bold px-1.5 py-0.5 rounded uppercase">
                                      {c.authorBadge}
                                    </span>
                                  )}
                                  <span className="text-[10px] text-slate-500">{c.createdAt}</span>
                                </div>
                                <p className="text-xs sm:text-sm text-slate-300 font-sans leading-relaxed">{decodeHTML(c.content)}</p>
                                
                                {/* Action Bar */}
                                <div className="flex items-center gap-4 pt-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                                  <button 
                                    onClick={() => likeComment(c.id)}
                                    className={`flex items-center gap-1 transition-colors ${commentReactions[c.id] === 'like' ? "text-blue-500 font-bold" : "hover:text-slate-300"}`}
                                  >
                                    <ThumbsUp size={11} /> {c.likes}
                                  </button>
                                  <button 
                                    onClick={() => dislikeComment(c.id)}
                                    className={`flex items-center gap-1 transition-colors ${commentReactions[c.id] === 'dislike' ? "text-red-500 font-bold" : "hover:text-slate-300"}`}
                                  >
                                    <ThumbsDown size={11} /> {c.dislikes}
                                  </button>
                                  <button onClick={() => { setReplyTargetId(c.id); setDebateTargetId(null); }} className="hover:text-white transition-colors">{t("Répondre", "Reply")}</button>
                                  <button onClick={() => reportComment(c.id)} className="hover:text-red-400 font-medium transition-colors">{t("Signaler", "Report")}</button>
                                  {(!user || user.name !== c.author) && (
                                    hasDebate ? (
                                      <button 
                                        disabled
                                        className="opacity-30 cursor-not-allowed flex items-center gap-1 text-amber-500/50 font-medium transition-colors select-none"
                                        title={t("Un débat est déjà en cours pour ce commentaire.", "A debate is already in progress for this comment.")}
                                      >
                                        <Swords size={11} className="opacity-50" /> {t("Débat en cours", "Debating")}
                                      </button>
                                    ) : (
                                      <button 
                                        onClick={() => {
                                          if (!user) {
                                            alert(t("Vous devez être connecté pour lancer un débat.", "You must be logged in to start a debate."));
                                            router.push(`/login?redirect=/article/${id}`);
                                            return;
                                          }
                                          setDebateTargetId(c.id);
                                          setReplyTargetId(null);
                                        }} 
                                        className="hover:text-amber-400 font-medium transition-colors flex items-center gap-1"
                                      >
                                        <Swords size={11} /> {t("Débat", "Debate")}
                                      </button>
                                    )
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Reply Input Box */}
                            {replyTargetId === c.id && (
                              <div className="pl-11 flex gap-2">
                                <input
                                  type="text"
                                  placeholder={t(`Répondre à ${c.author}...`, `Reply to ${c.author}...`)}
                                  value={replyText}
                                  onChange={e => setReplyText(e.target.value)}
                                  className="flex-1 border border-white/10 rounded-xl p-2 text-xs text-white focus:ring-1 focus:ring-primary bg-white/5 focus:bg-white/10 outline-none transition-all"
                                />
                                <button
                                  onClick={() => handleAddReply(c.id)}
                                  className="bg-primary text-white px-4 py-1.5 rounded-xl text-xs font-bold hover:bg-primary-hover shadow-sm"
                                >
                                  {t("Répondre", "Reply")}
                                </button>
                                <button
                                  onClick={() => setReplyTargetId(null)}
                                  className="border border-white/10 text-slate-400 px-4 py-1.5 rounded-xl text-xs hover:bg-white/5"
                                >
                                  {t("Annuler", "Cancel")}
                                </button>
                              </div>
                            )}

                              {/* Debate Input Box */}
                              {debateTargetId === c.id && (
                                <div className="pl-11 flex flex-col gap-2 mt-2 animate-in slide-in-from-top-2 duration-200">
                                  <div className="text-[10px] text-amber-400 font-bold uppercase tracking-wider flex items-center gap-1">
                                    <Swords size={12} />
                                    {t(`Lancer un débat avec ${c.author}...`, `Launch a debate with ${c.author}...`)}
                                  </div>
                                  <div className="flex gap-2">
                                    <input
                                      type="text"
                                      placeholder={t("Entrez votre argument d'ouverture...", "Enter your opening argument...")}
                                      value={debateText}
                                      onChange={e => setDebateText(e.target.value)}
                                      className="flex-1 border border-amber-500/20 rounded-xl p-2 text-xs text-white focus:ring-1 focus:ring-amber-500 bg-white/5 focus:bg-white/10 outline-none transition-all"
                                    />
                                    <button
                                      onClick={() => handleCreateDebate(c.id, c.author)}
                                      className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-1.5 rounded-xl text-xs font-bold shadow-sm"
                                    >
                                      {t("Lancer", "Start")}
                                    </button>
                                    <button
                                      onClick={() => { setDebateTargetId(null); setDebateText(""); }}
                                      className="border border-white/10 text-slate-400 px-4 py-1.5 rounded-xl text-xs hover:bg-white/5"
                                    >
                                      {t("Annuler", "Cancel")}
                                    </button>
                                  </div>
                                </div>
                              )}

                            {/* Nested Replies */}
                            {childComments.length > 0 && (
                              <div className="pl-10 space-y-4 border-l border-white/10 ml-4 pt-2">
                                {childComments.map(child => (
                                  <div key={child.id} className="space-y-2">
                                    <div className="flex gap-3">
                                      <div className="w-6 h-6 rounded-full bg-slate-900 flex items-center justify-center font-bold text-[9px] uppercase text-slate-400 border border-white/10 shadow-sm shrink-0">
                                        {child.author.slice(0, 2)}
                                      </div>
                                      <div className="flex-1 space-y-1">
                                        <div className="flex items-center gap-2">
                                          <span className="text-xs font-bold text-slate-200">{child.author}</span>
                                          {child.authorBadge && (
                                            <span className="bg-accent/20 border border-accent/20 text-accent text-[9px] font-bold px-1.5 py-0.5 rounded uppercase">
                                              {child.authorBadge}
                                            </span>
                                          )}
                                          <span className="text-[10px] text-slate-500">{child.createdAt}</span>
                                        </div>
                                        <p className="text-xs sm:text-sm text-slate-300 font-sans leading-relaxed">{decodeHTML(child.content)}</p>
                                        <div className="flex items-center gap-4 pt-1.5 text-[9px] font-bold uppercase tracking-wider text-slate-500">
                                          <button 
                                            onClick={() => likeComment(child.id)}
                                            className={`flex items-center gap-1 transition-colors ${commentReactions[child.id] === 'like' ? "text-blue-500 font-bold" : "hover:text-slate-300"}`}
                                          >
                                            <ThumbsUp size={10} /> {child.likes}
                                          </button>
                                          <button onClick={() => reportComment(child.id)} className="hover:text-red-400 font-medium transition-colors">{t("Signaler", "Report")}</button>
                                          {(!user || user.name !== child.author) && (
                                            duels.some(d => d.commentId === child.id) ? (
                                              <button 
                                                disabled
                                                className="opacity-30 cursor-not-allowed flex items-center gap-1 text-amber-500/50 font-medium transition-colors select-none"
                                                title={t("Un débat est déjà en cours pour ce commentaire.", "A debate is already in progress for this comment.")}
                                              >
                                                <Swords size={10} className="opacity-50" /> {t("Débat en cours", "Debating")}
                                              </button>
                                            ) : (
                                              <button 
                                                onClick={() => {
                                                  if (!user) {
                                                    alert(t("Vous devez être connecté pour lancer un débat.", "You must be logged in to start a debate."));
                                                    router.push(`/login?redirect=/article/${id}`);
                                                    return;
                                                  }
                                                  setDebateTargetId(child.id);
                                                  setReplyTargetId(null);
                                                }} 
                                                className="hover:text-amber-400 font-medium transition-colors flex items-center gap-1"
                                              >
                                                <Swords size={10} /> {t("Débat", "Debate")}
                                              </button>
                                            )
                                          )}
                                        </div>
                                      </div>
                                    </div>

                                    {/* Child Debate Input Box */}
                                    {debateTargetId === child.id && (
                                      <div className="pl-9 flex flex-col gap-2 mt-1 animate-in slide-in-from-top-1 duration-200">
                                        <div className="text-[9px] text-amber-400 font-bold uppercase tracking-wider flex items-center gap-1">
                                          <Swords size={10} />
                                          {t(`Lancer un débat avec ${child.author}...`, `Launch a debate with ${child.author}...`)}
                                        </div>
                                        <div className="flex gap-2">
                                          <input
                                            type="text"
                                            placeholder={t("Entrez votre argument d'ouverture...", "Enter your opening argument...")}
                                            value={debateText}
                                            onChange={e => setDebateText(e.target.value)}
                                            className="flex-1 border border-amber-500/20 rounded-xl p-1.5 text-xs text-white focus:ring-1 focus:ring-amber-500 bg-white/5 focus:bg-white/10 outline-none transition-all"
                                          />
                                          <button
                                            onClick={() => handleCreateDebate(child.id, child.author)}
                                            className="bg-amber-500 hover:bg-amber-600 text-white px-3 py-1 rounded-xl text-[10px] font-bold shadow-sm"
                                          >
                                            {t("Lancer", "Start")}
                                          </button>
                                          <button
                                            onClick={() => { setDebateTargetId(null); setDebateText(""); }}
                                            className="border border-white/10 text-slate-400 px-3 py-1 rounded-xl text-[10px] hover:bg-white/5"
                                          >
                                            {t("Annuler", "Cancel")}
                                          </button>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Main Comment Input Form */}
                  {user ? (
                    <form onSubmit={handleAddComment} className="flex gap-4 pt-6 border-t border-white/5">
                      <div className="w-8 h-8 rounded-full bg-primary/20 text-white flex items-center justify-center font-bold text-xs uppercase shrink-0 shadow-sm border border-primary/30">
                        {user.name.slice(0, 2)}
                      </div>
                      <div className="flex-1 flex gap-2">
                        <textarea
                          rows={2}
                          placeholder={t("Donnez votre avis constructif aux côtés de la communauté...", "Share your constructive feedback alongside the community...")}
                          value={newCommentText}
                          onChange={e => setNewCommentText(e.target.value)}
                          className="flex-1 border border-white/10 rounded-2xl p-3 text-xs sm:text-sm text-white focus:ring-1 focus:ring-primary bg-white/5 focus:bg-white/10 outline-none resize-none transition-all"
                        ></textarea>
                        <button
                          type="submit"
                          className="bg-primary hover:bg-primary-hover text-white px-5 rounded-2xl flex items-center justify-center shadow-premium self-end h-11 transition-all duration-200"
                        >
                          <Send size={15} />
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="text-center bg-white/5 border border-white/5 rounded-2xl p-6 text-xs text-slate-400 shadow-sm flex flex-col items-center gap-3">
                      <p className="font-semibold text-slate-300">{t("Vous devez être connecté pour participer à la discussion ou voter.", "You must be logged in to participate in the discussion or vote.")}</p>
                      <Link
                        href={`/login?redirect=/article/${id}`}
                        className="bg-primary hover:bg-primary-hover text-white font-bold py-2.5 px-6 rounded-full transition-all text-[10px] uppercase tracking-wider shadow-premium"
                      >
                        {t("Se connecter ou s'inscrire", "Log in or register")}
                      </Link>
                    </div>
                  )}
                </>
              )}
            </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
