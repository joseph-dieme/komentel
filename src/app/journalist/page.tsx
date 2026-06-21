"use client";

import React, { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useKomentel } from "@/context/KomentelContext";
import { PlusCircle, BarChart2, DollarSign, BookOpen, MessageSquare, Swords, Eye, CheckCircle2, AlertTriangle, ArrowRight, Plus, Trash } from "lucide-react";

export default function JournalistPage() {
  const { user, setUser, articles, comments, duels, addArticle } = useKomentel();

  // Form States
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Actualités");
  const [continent, setContinent] = useState("Monde");
  const [summary, setSummary] = useState("");
  const [paragraphs, setParagraphs] = useState<string[]>([""]);
  const [imageUrl, setImageUrl] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [additionalImagesStr, setAdditionalImagesStr] = useState("");
  const [isPublished, setIsPublished] = useState(false);

  // Dynamic paragraphs handlers
  const handleAddParagraph = () => {
    setParagraphs(prev => [...prev, ""]);
  };

  const handleRemoveParagraph = (index: number) => {
    setParagraphs(prev => prev.filter((_, i) => i !== index));
  };

  const handleParagraphChange = (index: number, val: string) => {
    setParagraphs(prev => prev.map((p, i) => i === index ? val : p));
  };

  // If user is not JOURNALIST, prompt them to switch roles in the header
  const isJournalist = user?.role === "JOURNALIST";

  const handlePublish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.accredited) return;
    if (!title.trim() || paragraphs.every(p => !p.trim())) return;

    // Filter out empty paragraphs
    const filteredParagraphs = paragraphs.map(p => p.trim()).filter(p => p !== "");
    
    // Parse additional images comma-separated string
    const additionalImages = additionalImagesStr
      .split(",")
      .map(url => url.trim())
      .filter(url => url !== "");

    addArticle(
      title,
      category,
      summary,
      filteredParagraphs,
      imageUrl || undefined,
      undefined,
      additionalImages,
      videoUrl.trim() || undefined,
      continent
    );
    
    // Reset Form
    setTitle("");
    setSummary("");
    setParagraphs([""]);
    setImageUrl("");
    setVideoUrl("");
    setAdditionalImagesStr("");
    setContinent("Monde");
    setIsPublished(true);
    setTimeout(() => setIsPublished(false), 5000);
  };

  // Switch role button action
  const forceSwitchToJournalist = () => {
    setUser({
      name: "Amadou Diallo",
      email: "amadou.diallo@komentel.sn",
      role: "JOURNALIST",
      duelsStats: { wins: 4, losses: 1, ratio: 80 },
      activeDuelingEnabled: true
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background bg-grid-pattern font-sans text-slate-200">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full relative">
        {/* Soft glowing ambient backgrounds */}
        <div className="absolute top-10 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px] pointer-events-none -z-10"></div>
        
        {/* Guard warning */}
        {!isJournalist ? (
          <section className="bg-amber-500/10 border-l-4 border-amber-500 rounded-xl p-8 shadow-sm max-w-2xl mx-auto text-center space-y-4">
            <AlertTriangle size={48} className="text-amber-500 mx-auto" />
            <h2 className="text-2xl font-serif font-bold text-white">Accès Restreint — Espace Journaliste</h2>
            <p className="text-sm text-slate-350 leading-relaxed">
              Pour accéder à cet espace d'édition et aux tableaux de bord de monétisation, vous devez être un journaliste accrédité.
            </p>
            <div className="pt-2">
              <button 
                onClick={forceSwitchToJournalist}
                className="bg-primary hover:bg-primary-hover hover:scale-105 active:scale-95 text-white text-xs font-bold uppercase tracking-wider px-6 py-3 rounded-full shadow transition-all inline-flex items-center gap-1.5 focus:outline-none"
              >
                🎭 Simuler le rôle Journaliste (Amadou Diallo) <ArrowRight size={14} />
              </button>
            </div>
            <p className="text-[10px] text-slate-500">
              Ou changez de rôle via le menu Profil en haut à droite.
            </p>
          </section>
        ) : (
          <div className="space-y-8">
            
            {/* Page Header info */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#12131C]/60 backdrop-blur-md border border-white/10 p-6 rounded-2xl shadow-sm">
              <div>
                <h1 className="font-serif text-3xl font-bold text-white flex items-center gap-2">
                  <CheckCircle2 className="text-primary fill-primary/10" size={28} />
                  Rédaction Komentel
                </h1>
                <p className="text-xs text-slate-400 font-semibold mt-1 uppercase tracking-wider">
                  Espace Journaliste {user.accredited ? "Accrédité" : "En cours d'accréditation"} · Journaliste : {user.name}
                </p>
              </div>
              <div className="bg-white/5 p-2.5 rounded-xl border border-white/5 flex items-center gap-4 text-xs">
                <div>
                  <p className="text-slate-500 font-bold text-[9px] uppercase leading-none">Statut de la carte</p>
                  {user.accredited ? (
                    <p className="font-bold text-white mt-1 flex items-center gap-1.5">
                      Accrédité <span className="inline-block w-2 h-2 bg-green-500 rounded-full"></span>
                    </p>
                  ) : (
                    <p className="font-bold text-amber-450 mt-1 flex items-center gap-1.5">
                      En attente <span className="inline-block w-2 h-2 bg-amber-500 rounded-full animate-pulse"></span>
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Accreditation Warning Banner */}
            {!user.accredited && (
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 text-xs text-amber-400 flex items-start gap-3 shadow-premium">
                <AlertTriangle size={18} className="shrink-0 mt-0.5 text-amber-500" />
                <div className="space-y-1">
                  <h4 className="font-bold text-white">Accréditation en attente</h4>
                  <p className="text-slate-400 leading-relaxed text-[11px]">
                    Votre compte de journaliste est en cours d'examen par l'administration de Komentel. Pour pouvoir publier des articles et accéder aux outils de monétisation, un administrateur doit valider votre profil. Vos informations d'inscription (carte de presse, biographie et photo) sont en cours d'évaluation.
                  </p>
                </div>
              </div>
            )}

            {/* Simulated Analytics Metrics Grid */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-[#12131C]/60 backdrop-blur-md rounded-xl border border-white/10 p-6 shadow-sm flex items-center gap-4 hover:border-white/20 transition-all">
                <div className="p-3 bg-primary/20 text-white rounded-lg border border-primary/20">
                  <BookOpen size={24} />
                </div>
                <div>
                  <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">Articles publiés</p>
                  <p className="text-2xl font-serif font-bold text-white">{articles.filter(a => a.sourceName === user.name).length}</p>
                </div>
              </div>

              <div className="bg-[#12131C]/60 backdrop-blur-md rounded-xl border border-white/10 p-6 shadow-sm flex items-center gap-4 hover:border-white/20 transition-all">
                <div className="p-3 bg-accent/20 text-white rounded-lg border border-accent/20">
                  <Eye size={24} />
                </div>
                <div>
                  <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">Lectures totales</p>
                  <p className="text-2xl font-serif font-bold text-white">34.8k</p>
                </div>
              </div>

              <div className="bg-[#12131C]/60 backdrop-blur-md rounded-xl border border-white/10 p-6 shadow-sm flex items-center gap-4 hover:border-white/20 transition-all">
                <div className="p-3 bg-green-500/20 text-green-400 rounded-lg border border-green-500/20">
                  <MessageSquare size={24} />
                </div>
                <div>
                  <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">Commentaires générés</p>
                  <p className="text-2xl font-serif font-bold text-white">892</p>
                </div>
              </div>

              <div className="bg-[#12131C]/60 backdrop-blur-md rounded-xl border border-white/10 p-6 shadow-sm flex items-center gap-4 hover:border-white/20 transition-all">
                <div className="p-3 bg-amber-500/20 text-amber-400 rounded-lg border border-amber-500/20">
                  <Swords size={24} />
                </div>
                <div>
                  <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">Duels suscités</p>
                  <p className="text-2xl font-serif font-bold text-white">12</p>
                </div>
              </div>
            </section>

            {/* Creator form + Guidelines grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Left Column: Create Article (9 columns) */}
              <div className="lg:col-span-9 space-y-6">
                
                {/* Form Header */}
                <div className="bg-[#12131C]/60 backdrop-blur-md rounded-xl border border-white/10 p-6 shadow-sm flex items-center justify-between">
                  <h2 className="font-serif text-xl font-bold text-white flex items-center gap-2">
                    <PlusCircle size={22} className="text-primary" />
                    Rédiger un nouvel Article
                  </h2>
                  <p className="text-xs text-slate-500 font-medium">
                    Suivez les étapes ci-dessous pour composer votre publication.
                  </p>
                </div>

                {isPublished && (
                  <div className="bg-green-500/10 border border-green-500/20 text-green-300 rounded-lg p-4 text-xs font-semibold">
                    🎉 Félicitations ! Votre article a été publié avec succès et est visible dans le fil d'actualité de la page d'accueil.
                  </div>
                )}

                <form onSubmit={handlePublish} className="space-y-6">
                  
                  {/* Card 1: 01. Informations Générales */}
                  <div className="bg-[#12131C]/60 backdrop-blur-md rounded-xl border border-white/10 p-6 shadow-sm space-y-4">
                    <div className="flex items-center gap-2 pb-2.5 border-b border-white/5">
                      <span className="w-5 h-5 rounded-full bg-primary/20 text-primary text-[10px] font-bold flex items-center justify-center font-mono">1</span>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-white font-serif">Informations Générales</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="md:col-span-1 space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Catégorie</label>
                        <select 
                          value={category} 
                          onChange={e => setCategory(e.target.value)}
                          disabled={!user.accredited}
                          className="w-full border border-white/10 bg-slate-900 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg p-2.5 text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none"
                        >
                          <option>Actualités</option>
                          <option>Sport</option>
                          <option>Santé</option>
                          <option>Éducation</option>
                          <option>Technologie</option>
                          <option>Culture</option>
                          <option>International</option>
                          <option>Business</option>
                        </select>
                      </div>
                      <div className="md:col-span-1 space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Continent</label>
                        <select 
                          value={continent} 
                          onChange={e => setContinent(e.target.value)}
                          disabled={!user.accredited}
                          className="w-full border border-white/10 bg-slate-900 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg p-2.5 text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none"
                        >
                          <option>Monde</option>
                          <option>Afrique</option>
                          <option>Europe</option>
                          <option>Amériques</option>
                          <option>Sénégal</option>
                          <option>Moyen-Orient</option>
                          <option>Asie-Pacifique</option>
                        </select>
                      </div>
                      <div className="md:col-span-2 space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Titre de l'article</label>
                        <input 
                          type="text" 
                          placeholder="Ex: Le Sénégal se dote d'un nouveau centre de recherche en IA..." 
                          required
                          value={title}
                          onChange={e => setTitle(e.target.value)}
                          disabled={!user.accredited}
                          className="w-full border border-white/10 bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg p-2.5 text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none font-serif font-semibold"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Card 2: 02. Résumé SEO & Chapô */}
                  <div className="bg-[#12131C]/60 backdrop-blur-md rounded-xl border border-white/10 p-6 shadow-sm space-y-4">
                    <div className="flex items-center gap-2 pb-2.5 border-b border-white/5">
                      <span className="w-5 h-5 rounded-full bg-primary/20 text-primary text-[10px] font-bold flex items-center justify-center font-mono">2</span>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-white font-serif">Chapô & Résumé SEO</h3>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Court résumé d'introduction</label>
                      <input 
                        type="text" 
                        placeholder="Court résumé introductif qui sera affiché sur les cartes de fil..." 
                        value={summary}
                        onChange={e => setSummary(e.target.value)}
                        disabled={!user.accredited}
                        className="w-full border border-white/10 bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg p-2.5 text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none"
                      />
                    </div>
                  </div>

                  {/* Card 3: 03. Ressources & Médias */}
                  <div className="bg-[#12131C]/60 backdrop-blur-md rounded-xl border border-white/10 p-6 shadow-sm space-y-4">
                    <div className="flex items-center gap-2 pb-2.5 border-b border-white/5">
                      <span className="w-5 h-5 rounded-full bg-primary/20 text-primary text-[10px] font-bold flex items-center justify-center font-mono">3</span>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-white font-serif">Ressources & Médias</h3>
                    </div>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Image de couverture principale (URL)</label>
                          <input 
                            type="text" 
                            placeholder="Ex: https://images.unsplash.com/photo-..." 
                            value={imageUrl}
                            onChange={e => setImageUrl(e.target.value)}
                            disabled={!user.accredited}
                            className="w-full border border-white/10 bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg p-2.5 text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Lien Vidéo (YouTube / MP4)</label>
                          <input 
                            type="text" 
                            placeholder="Ex: https://www.youtube.com/watch?v=..." 
                            value={videoUrl}
                            onChange={e => setVideoUrl(e.target.value)}
                            disabled={!user.accredited}
                            className="w-full border border-white/10 bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg p-2.5 text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none"
                          />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Photos additionnelles (URLs séparées par des virgules)</label>
                        <input 
                          type="text" 
                          placeholder="Ex: https://image1.jpg, https://image2.jpg..." 
                          value={additionalImagesStr}
                          onChange={e => setAdditionalImagesStr(e.target.value)}
                          disabled={!user.accredited}
                          className="w-full border border-white/10 bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg p-2.5 text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Card 4: 04. Corps de l'Article (Dynamic Paragraphs) */}
                  <div className="bg-[#12131C]/60 backdrop-blur-md rounded-xl border border-white/10 p-6 shadow-sm space-y-4">
                    <div className="flex items-center gap-2 pb-2.5 border-b border-white/5">
                      <span className="w-5 h-5 rounded-full bg-primary/20 text-primary text-[10px] font-bold flex items-center justify-center font-mono">4</span>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-white font-serif">Corps de l'Article (Rédigez paragraphe par paragraphe)</h3>
                    </div>

                    <div className="space-y-4">
                      {paragraphs.map((p, index) => (
                        <div key={index} className="bg-slate-900/50 border border-white/5 rounded-2xl p-4 space-y-2 relative group focus-within:border-primary/30 transition-all">
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                              Paragraphe {index + 1}
                            </span>
                            {paragraphs.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveParagraph(index)}
                                className="text-[10px] text-red-400 hover:text-red-300 font-bold uppercase transition-colors inline-flex items-center gap-1 cursor-pointer"
                              >
                                <Trash size={12} className="shrink-0" /> Supprimer
                              </button>
                            )}
                          </div>
                          <textarea
                            rows={3}
                            placeholder={`Rédigez le paragraphe ${index + 1}...`}
                            required
                            value={p}
                            onChange={e => handleParagraphChange(index, e.target.value)}
                            disabled={!user.accredited}
                            className="w-full border-0 bg-transparent text-slate-200 text-xs focus:ring-0 outline-none resize-none leading-relaxed font-sans"
                          ></textarea>
                        </div>
                      ))}

                      <button
                        type="button"
                        onClick={handleAddParagraph}
                        disabled={!user.accredited}
                        className="w-full border border-dashed border-white/10 hover:border-primary/30 hover:bg-primary/5 rounded-2xl py-3.5 text-xs text-slate-400 hover:text-primary transition-all flex items-center justify-center gap-1.5 font-bold uppercase tracking-wider cursor-pointer"
                      >
                        <Plus size={14} /> Ajouter un paragraphe
                      </button>
                    </div>
                  </div>

                  {/* Submission Button */}
                  <button
                    type="submit"
                    disabled={!user.accredited}
                    className="w-full bg-accent hover:bg-accent-hover disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed disabled:hover:bg-slate-800 disabled:scale-100 text-white font-bold py-4 rounded-2xl text-xs uppercase tracking-wider shadow-premium transition-colors cursor-pointer"
                  >
                    Publier l'Article
                  </button>

                </form>

                {/* Vos publications */}
                <div className="bg-[#12131C]/60 backdrop-blur-md rounded-xl border border-white/10 p-6 shadow-premium space-y-4 mt-8">
                  <h2 className="font-serif text-lg font-bold text-white pb-2.5 border-b border-white/5 flex items-center gap-2">
                    <BookOpen size={20} className="text-primary" />
                    Vos Articles Publiés ({articles.filter(a => a.sourceName.toLowerCase() === user.name.toLowerCase()).length})
                  </h2>

                  {articles.filter(a => a.sourceName.toLowerCase() === user.name.toLowerCase()).length === 0 ? (
                    <p className="text-xs sm:text-sm text-slate-500 py-6 text-center">
                      Vous n'avez pas encore publié d'articles. Remplissez le formulaire ci-dessus pour faire votre première publication.
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {articles
                        .filter(a => a.sourceName.toLowerCase() === user.name.toLowerCase())
                        .map(art => (
                          <div key={art.id} className="p-4 bg-white/5 border border-white/5 rounded-xl flex flex-col justify-between hover:border-white/15 transition-all">
                            <div>
                              <div className="flex justify-between items-center text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-2">
                                <span>{art.category} • {art.continent || "Monde"}</span>
                                <span>{art.publishedAt}</span>
                              </div>
                              <h3 className="text-xs sm:text-sm font-bold text-white line-clamp-2 leading-snug hover:text-primary transition-colors">
                                <a href={`/article/${art.id}`} target="_blank" rel="noopener noreferrer">
                                  {art.title}
                                </a>
                              </h3>
                              <p className="text-[11px] text-slate-400 line-clamp-2 mt-1.5 leading-relaxed">
                                {art.summary}
                              </p>
                            </div>
                            
                            <div className="flex justify-between items-center mt-4 pt-3 border-t border-white/5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                              <div className="flex items-center gap-3">
                                <span className="flex items-center gap-0.5"><Eye size={10} /> {art.views}</span>
                                <span className="flex items-center gap-0.5"><MessageSquare size={10} /> {art.commentsCount}</span>
                                <span className="flex items-center gap-0.5">👍 {art.reactions.like}</span>
                              </div>
                              <a 
                                href={`/article/${art.id}`} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-primary hover:underline flex items-center gap-1"
                              >
                                Consulter <ArrowRight size={10} />
                              </a>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>

              </div>

              {/* Right Column: Content Guidelines only (3 columns) */}
              <div className="lg:col-span-3 space-y-6">
                
                {/* Content guidelines card */}
                <div className="bg-slate-900 text-slate-350 rounded-xl p-6 shadow-md border border-slate-850">
                  <h3 className="font-serif text-base font-bold text-white mb-3">
                    ✍️ Charte de Publication
                  </h3>
                  <ul className="space-y-2.5 text-xs text-slate-400 leading-relaxed font-sans list-disc list-inside">
                    <li>Vérification systématique des sources avant publication.</li>
                    <li>Sourcing obligatoire pour tout fait rapporté.</li>
                    <li>Signalement transparent en cas de mise à jour (Historique des corrections).</li>
                    <li>Neutralité éditoriale requise sur les sujets politiques locaux.</li>
                  </ul>
                </div>

              </div>

            </div>

          </div>
        )}

      </main>

      <Footer />
    </div>
  );
}
