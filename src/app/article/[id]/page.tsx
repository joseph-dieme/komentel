"use client";

import React, { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useKomentel } from "@/context/KomentelContext";
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
    duels, 
    user, 
    registeredUsers,
    addComment, 
    reportComment, 
    challengeToDuel,
    likeComment,
    dislikeComment,
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
  const [isSubscribed, setIsSubscribed] = useState(false);
  
  // Duel Challenge Modal State
  const [showDuelModal, setShowDuelModal] = useState(false);
  const [duelTargetCommentId, setDuelTargetCommentId] = useState<string | null>(null);
  const [duelOpponentName, setDuelOpponentName] = useState("");
  const [duelOpeningText, setDuelOpeningText] = useState("");

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

  // Filter duels related to this article
  const articleDuels = duels.filter(d => d.articleId === id);

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

  const handleOpenDuelModal = (commentId: string, authorName: string) => {
    if (!user) {
      router.push(`/login?redirect=/article/${id}`);
      return;
    }
    if (user.name === authorName) {
      alert("Vous ne pouvez pas vous défier vous-même !");
      return;
    }
    setDuelTargetCommentId(commentId);
    setDuelOpponentName(authorName);
    setDuelOpeningText(`Je conteste votre affirmation selon laquelle "${comments.find(c => c.id === commentId)?.content.slice(0, 50)}...". Voici mon argument : `);
    setShowDuelModal(true);
  };

  const handleLaunchDuel = () => {
    if (!duelTargetCommentId || !duelOpeningText.trim()) return;
    challengeToDuel(id, duelTargetCommentId, duelOpponentName, duelOpeningText);
    setShowDuelModal(false);
    setDuelTargetCommentId(null);
    setDuelOpeningText("");
    alert(`Défi envoyé avec succès à ${duelOpponentName} ! Consultez vos notifications pour entrer dans l'arène.`);
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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Left Column: Article content & Comments (8 columns) */}
          <div className="lg:col-span-8 space-y-8">
            
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
                      {topComment.content}
                    </p>
                  </div>
                </div>
                <div className="flex gap-4 mt-4 text-[10px] font-bold uppercase tracking-wider text-slate-500 border-t border-white/5 pt-3">
                  <button 
                    onClick={() => likeComment(topComment.id)}
                    className="flex items-center gap-1 hover:text-slate-300 transition-colors text-slate-400"
                  >
                    <ThumbsUp size={12} /> {topComment.likes}
                  </button>
                  <button 
                    onClick={() => handleOpenDuelModal(topComment.id, topComment.author)}
                    className="flex items-center gap-1.5 text-accent hover:underline ml-auto font-bold uppercase tracking-wider text-[10px]"
                  >
                    <Swords size={12} /> {t("Défier en duel", "Challenge to duel")}
                  </button>
                </div>
              </div>
            )}

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
                                <p className="text-xs sm:text-sm text-slate-300 font-sans leading-relaxed">{c.content}</p>
                                
                                {/* Action Bar */}
                                <div className="flex items-center gap-4 pt-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                                  <button 
                                    onClick={() => likeComment(c.id)}
                                    className="flex items-center gap-1 hover:text-slate-300 transition-colors"
                                  >
                                    <ThumbsUp size={11} /> {c.likes}
                                  </button>
                                  <button 
                                    onClick={() => dislikeComment(c.id)}
                                    className="flex items-center gap-1 hover:text-slate-300 transition-colors"
                                  >
                                    <ThumbsDown size={11} /> {c.dislikes}
                                  </button>
                                  <button onClick={() => setReplyTargetId(c.id)} className="hover:text-white transition-colors">{t("Répondre", "Reply")}</button>
                                  <button onClick={() => reportComment(c.id)} className="hover:text-red-400 font-medium transition-colors">{t("Signaler", "Report")}</button>
                                  {user && user.name !== c.author && (
                                    <button 
                                      onClick={() => handleOpenDuelModal(c.id, c.author)}
                                      className="flex items-center gap-1 text-accent hover:underline font-bold transition-colors"
                                    >
                                      <Swords size={11} /> {t("Défier en duel", "Challenge to duel")}
                                    </button>
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

                            {/* Nested Replies */}
                            {childComments.length > 0 && (
                              <div className="pl-10 space-y-4 border-l border-white/10 ml-4 pt-2">
                                {childComments.map(child => (
                                  <div key={child.id} className="flex gap-3">
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
                                      <p className="text-xs sm:text-sm text-slate-300 font-sans leading-relaxed">{child.content}</p>
                                      <div className="flex items-center gap-4 pt-1.5 text-[9px] font-bold uppercase tracking-wider text-slate-500">
                                        <button 
                                          onClick={() => likeComment(child.id)}
                                          className="flex items-center gap-1 hover:text-slate-300 transition-colors"
                                        >
                                          <ThumbsUp size={10} /> {child.likes}
                                        </button>
                                        <button onClick={() => reportComment(child.id)} className="hover:text-red-400 font-medium transition-colors">{t("Signaler", "Report")}</button>
                                        {user && user.name !== child.author && (
                                          <button 
                                            onClick={() => handleOpenDuelModal(child.id, child.author)}
                                            className="flex items-center gap-1 text-accent hover:underline font-bold transition-colors"
                                          >
                                            <Swords size={10} /> {t("Défier en duel", "Challenge to duel")}
                                          </button>
                                        )}
                                      </div>
                                    </div>
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
                      <p className="font-semibold text-slate-300">{t("Vous devez être connecté pour participer au débat, voter ou lancer des duels.", "You must be logged in to participate in the debate, vote, or start duels.")}</p>
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

          {/* Right Column: Sidebar (4 columns) */}
          <aside className="lg:col-span-4 space-y-6">
            
            {/* Duels Actifs Module */}
            <div className="bg-[#12131C]/60 backdrop-blur-md rounded-2xl border border-white/10 p-6 shadow-premium">
              <h3 className="font-serif text-xs font-bold text-white pb-3 border-b border-white/5 mb-5 flex items-center gap-2 uppercase tracking-wider">
                <Swords size={14} className="text-accent" />
                {t("Duels sur cet article", "Duels on this article")}
              </h3>
              
              {articleDuels.length === 0 ? (
                <p className="text-slate-500 text-xs leading-relaxed font-medium">{t("Aucun duel actif pour le moment. Défiez un utilisateur dans les commentaires pour démarrer le premier débat 1 contre 1.", "No active duels at the moment. Challenge a user in the comments to start the first 1v1 debate.")}</p>
              ) : (
                <div className="space-y-4">
                  {articleDuels.map(d => (
                    <div key={d.id} className="p-4 bg-white/5 border border-white/5 rounded-xl space-y-3">
                      <div className="flex items-center justify-between">
                        <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded ${
                          d.status === "ACTIVE" 
                            ? "bg-accent/15 text-accent border border-accent/20" 
                            : "bg-white/10 text-slate-400 border border-white/5"
                        }`}>
                          {d.status === "ACTIVE" ? t("Duel en cours", "Duel in progress") : t("Défi envoyé", "Challenge sent")}
                        </span>
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{d.closesAt.replace("Dans", t("Dans", "In")).replace("heures", t("heures", "hours")).replace("heure", t("heure", "hour"))}</span>
                      </div>
                      
                      <div className="flex justify-between items-center text-xs font-bold text-slate-200">
                        <span>{d.challenger}</span>
                        <span className="text-accent font-extrabold">VS</span>
                        <span>{d.defender}</span>
                      </div>

                      <Link
                        href={`/duel/${d.id}`}
                        className="block text-center w-full bg-primary hover:bg-primary-hover text-white text-[10px] font-bold py-2.5 rounded-lg transition-colors shadow-premium uppercase tracking-wider"
                      >
                        {d.status === "ACTIVE" ? t("Voir le Duel", "View Duel") : t("Consulter le Défi", "View Challenge")}
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Duel Rules Info Box */}
            <div className="bg-gradient-to-br from-primary to-[#4F46E5] text-slate-100 rounded-2xl p-6 shadow-premium relative overflow-hidden border border-white/10 glow-indigo">
              <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: "radial-gradient(white 1px, transparent 1px)", backgroundSize: "16px 16px" }}></div>
              <h3 className="font-serif text-sm font-bold text-white mb-4 flex items-center gap-1.5 uppercase tracking-wider">
                {t("📜 Règles d'un Duel Komentel", "📜 Komentel Duel Rules")}
              </h3>
              <ul className="space-y-3.5 text-xs text-white/70 leading-relaxed font-sans">
                <li className="flex gap-2">
                  <span className="text-accent">⚔️</span>
                  <span><strong className="text-white font-semibold">{t("1 contre 1 uniquement", "1-on-1 only")}</strong>{t(" : un espace fermé où seuls les deux participants échangent.", " : a private space where only the two participants exchange.")}</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-accent">✔️</span>
                  <span><strong className="text-white font-semibold">{t("Acceptation obligatoire", "Mandatory acceptance")}</strong>{t(" : le duel ne commence que si l'adversaire accepte explicitement.", " : the duel only starts if the opponent explicitly accepts.")}</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-accent">💬</span>
                  <span><strong className="text-white font-semibold">{t("Format structuré", "Structured format")}</strong>{t(" : échanges alternés par tours avec limite stricte de caractères par réplique.", " : alternating turns with a strict character limit per reply.")}</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-accent">🔥</span>
                  <span><strong className="text-white font-semibold">{t("Arbitrage du public", "Public voting")}</strong>{t(" : les spectateurs votent par 👍 / 👎 sur les répliques. Le score net désigne le gagnant.", " : spectators vote 👍 / 👎 on replies. The net score determines the winner.")}</span>
                </li>
              </ul>
            </div>

          </aside>

        </div>

      </main>

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
                className="text-slate-400 hover:text-white text-lg font-bold"
              >
                ×
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="text-xs text-slate-350 leading-relaxed font-semibold bg-white/5 p-4 rounded-xl border border-white/5">
                {t("Vous défiez ", "You challenge ")}<span className="text-white font-bold">{duelOpponentName}</span>{t(" en débat 1v1 sur cet article. Il/Elle devra accepter pour démarrer. Les défis non traités expirent après 48h.", " to a 1v1 debate on this article. They must accept to start. Unanswered challenges expire after 48h.")}
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
                className="border border-white/10 text-slate-400 hover:bg-white/5 font-bold px-6 py-2.5 rounded-full text-[10px] uppercase tracking-wider transition-colors"
              >
                {t("Annuler", "Cancel")}
              </button>
              <button
                disabled={!duelOpeningText.trim()}
                onClick={handleLaunchDuel}
                className="bg-accent hover:bg-accent-hover disabled:bg-slate-800 disabled:text-slate-500 text-white font-bold px-6 py-2.5 rounded-full text-[10px] uppercase tracking-wider shadow-premium flex items-center gap-1.5 transition-colors"
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
