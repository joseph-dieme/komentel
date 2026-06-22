"use client";

import React, { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useKomentel } from "@/context/KomentelContext";
import { PlusCircle, BarChart2, DollarSign, BookOpen, MessageSquare, Swords, Eye, CheckCircle2, AlertTriangle, ArrowRight, Plus, Trash, Image as ImageIcon } from "lucide-react";

const defaultMediaLibrary = [
  { id: "img-1", url: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&q=80&w=800", title: "Université & Éducation", tag: "Éducation" },
  { id: "img-2", url: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=800", title: "Réseau global & Technologie", tag: "Technologie" },
  { id: "img-3", url: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=800", title: "Conférence de presse & Affaires", tag: "Business" },
  { id: "img-4", url: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=800", title: "Bâtiment moderne", tag: "Business" },
  { id: "img-5", url: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&q=80&w=800", title: "Stade & Match de Football", tag: "Sport" },
  { id: "img-6", url: "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&q=80&w=800", title: "Événement sportif", tag: "Sport" },
  { id: "img-7", url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800", title: "Graphiques & Économie", tag: "Business" },
  { id: "img-8", url: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&q=80&w=800", title: "Conférence & IA", tag: "Technologie" },
  { id: "img-9", url: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&q=80&w=800", title: "Culture & Concert", tag: "Culture" },
  { id: "img-10", url: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=800", title: "Festival & Événement", tag: "Culture" }
];

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
  const [additionalImages, setAdditionalImages] = useState<string[]>([]);
  const [isPublished, setIsPublished] = useState(false);

  // Media Library States
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [mediaModalTarget, setMediaModalTarget] = useState<'COVER' | 'ADDITIONAL'>('COVER');
  const [mediaModalTab, setMediaModalTab] = useState<'GALLERY' | 'UPLOADS'>('GALLERY');
  const [localMedia, setLocalMedia] = useState<string[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("komentel_user_media");
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  const handleUploadFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      const updatedMedia = [base64String, ...localMedia];
      setLocalMedia(updatedMedia);
      if (typeof window !== "undefined") {
        localStorage.setItem("komentel_user_media", JSON.stringify(updatedMedia));
      }
      
      // Select the uploaded image immediately
      if (mediaModalTarget === 'COVER') {
        setImageUrl(base64String);
      } else {
        handleAddAdditionalImage(base64String);
      }
      setIsMediaModalOpen(false);
    };
    reader.readAsDataURL(file);
  };

  const handleUploadFileInline = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      const updatedMedia = [base64String, ...localMedia];
      setLocalMedia(updatedMedia);
      if (typeof window !== "undefined") {
        localStorage.setItem("komentel_user_media", JSON.stringify(updatedMedia));
      }
      
      // Set as Cover Image immediately when uploaded inline
      setImageUrl(base64String);
    };
    reader.readAsDataURL(file);
  };

  const handleDeleteMedia = (e: React.MouseEvent, url: string) => {
    e.preventDefault();
    e.stopPropagation();
    const updated = localMedia.filter(item => item !== url);
    setLocalMedia(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("komentel_user_media", JSON.stringify(updated));
    }
  };

  const handleAddAdditionalImage = (url: string) => {
    if (additionalImages.includes(url)) return;
    setAdditionalImages(prev => [...prev, url]);
  };

  const handleRemoveAdditionalImage = (url: string) => {
    setAdditionalImages(prev => prev.filter(u => u !== url));
  };

  const openMediaModal = (target: 'COVER' | 'ADDITIONAL') => {
    setMediaModalTarget(target);
    setMediaModalTab('GALLERY');
    setIsMediaModalOpen(true);
  };

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
    setAdditionalImages([]);
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
                          <div className="flex gap-2">
                            <input 
                              type="text" 
                              placeholder="Ex: https://images.unsplash.com/photo-..." 
                              value={imageUrl}
                              onChange={e => setImageUrl(e.target.value)}
                              disabled={!user.accredited}
                              className="flex-1 border border-white/10 bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg p-2.5 text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => openMediaModal("COVER")}
                              disabled={!user.accredited}
                              className="bg-primary hover:bg-primary-hover disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed text-white text-xs font-bold px-3.5 rounded-lg flex items-center gap-1 shrink-0 transition-colors cursor-pointer"
                            >
                              📁 Médiathèque
                            </button>
                          </div>

                          {imageUrl && (
                            <div className="relative w-28 h-16 rounded-lg overflow-hidden border border-white/10 mt-2 group animate-in fade-in duration-200">
                              <img src={imageUrl} className="w-full h-full object-cover" alt="Aperçu couverture" />
                              <button
                                type="button"
                                onClick={() => setImageUrl("")}
                                className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-red-400 font-bold text-xs transition-opacity"
                              >
                                Retirer
                              </button>
                            </div>
                          )}
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

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-sans">
                            Photos additionnelles
                          </label>
                          <button
                            type="button"
                            onClick={() => openMediaModal("ADDITIONAL")}
                            disabled={!user.accredited}
                            className="bg-primary/20 hover:bg-primary/30 border border-primary/30 disabled:bg-slate-800 disabled:text-slate-500 disabled:border-white/5 disabled:cursor-not-allowed text-primary text-[10px] font-bold px-3 py-1 rounded-lg flex items-center gap-1 transition-colors cursor-pointer font-sans"
                          >
                            📁 Médiathèque Komentel
                          </button>
                        </div>
                        
                        <div className="relative group border border-dashed border-white/10 hover:border-primary/40 rounded-2xl p-6 bg-white/[0.02] hover:bg-white/[0.04] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex flex-col items-center justify-center gap-2 cursor-pointer">
                          <input 
                            type="file" 
                            multiple 
                            accept="image/*" 
                            disabled={!user.accredited}
                            onChange={(e) => {
                              const files = Array.from(e.target.files || []);
                              files.forEach(file => {
                                const reader = new FileReader();
                                reader.onloadend = () => {
                                  handleAddAdditionalImage(reader.result as string);
                                };
                                reader.readAsDataURL(file);
                              });
                            }}
                            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10 disabled:cursor-not-allowed" 
                          />
                          <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                            <PlusCircle size={20} />
                          </div>
                          <div className="text-center">
                            <p className="text-xs font-bold text-white">Importer des photos</p>
                            <p className="text-[10px] text-slate-500 mt-0.5 font-medium">Glissez-déposez ou cliquez pour parcourir les fichiers</p>
                          </div>
                        </div>

                        {additionalImages.length > 0 && (
                          <div className="flex flex-wrap gap-2.5 mt-2.5 p-2.5 bg-black/20 rounded-xl border border-white/5">
                            {additionalImages.map((url, idx) => (
                              <div key={idx} className="relative w-20 h-14 rounded-lg overflow-hidden border border-white/10 group animate-in fade-in duration-200">
                                <img src={url} className="w-full h-full object-cover" alt={`Aperçu additionnel ${idx}`} />
                                <button
                                  type="button"
                                  onClick={() => handleRemoveAdditionalImage(url)}
                                  className="absolute inset-0 bg-black/75 opacity-0 group-hover:opacity-100 flex items-center justify-center text-red-400 hover:text-red-300 font-bold text-[10px] transition-opacity cursor-pointer"
                                >
                                  Retirer
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Inline Media Gallery */}
                      <div className="border-t border-white/5 pt-4 mt-2 space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-sans">
                            Sélectionner depuis ma Médiathèque
                          </label>
                          <div className="relative">
                            <input
                              type="file"
                              accept="image/*"
                              id="file-upload-inline"
                              onChange={handleUploadFileInline}
                              className="hidden"
                            />
                            <label
                              htmlFor="file-upload-inline"
                              className="bg-primary/20 hover:bg-primary/30 border border-primary/30 text-primary text-[9px] font-extrabold uppercase px-2.5 py-1 rounded-lg cursor-pointer transition-colors inline-flex items-center gap-1 font-sans"
                            >
                              📤 Importer une photo...
                            </label>
                          </div>
                        </div>

                        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
                          {/* Local Uploads */}
                          {localMedia.map((url, idx) => {
                            const isCover = imageUrl === url;
                            const isAdditional = additionalImages.includes(url);
                            return (
                              <div 
                                key={`upload-${idx}`}
                                className={`w-28 h-20 rounded-xl overflow-hidden relative shrink-0 group border transition-all ${
                                  isCover ? "border-primary shadow-[0_0_10px_rgba(99,102,241,0.2)]" : isAdditional ? "border-accent shadow-[0_0_10px_rgba(244,63,94,0.2)]" : "border-white/5"
                                }`}
                              >
                                <img src={url} className="w-full h-full object-cover" alt="Upload" />
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-1 transition-opacity">
                                  <button
                                    type="button"
                                    onClick={() => setImageUrl(url)}
                                    className="bg-primary hover:bg-primary-hover text-white text-[8px] font-bold px-2 py-0.5 rounded shadow w-20 text-center font-sans"
                                  >
                                    Couverture
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleAddAdditionalImage(url)}
                                    className="bg-accent hover:bg-accent-hover text-white text-[8px] font-bold px-2 py-0.5 rounded shadow w-20 text-center font-sans"
                                  >
                                    Additionnelle
                                  </button>
                                  <button
                                    type="button"
                                    onClick={(e) => handleDeleteMedia(e, url)}
                                    className="text-red-400 hover:text-red-300 text-[8px] font-bold mt-0.5 font-sans"
                                  >
                                    Supprimer
                                  </button>
                                </div>
                                {isCover && (
                                  <span className="absolute top-1.5 left-1.5 bg-primary text-white text-[7px] font-black uppercase px-1 rounded shadow font-sans">
                                    Couv.
                                  </span>
                                )}
                                {isAdditional && (
                                  <span className="absolute top-1.5 left-1.5 bg-accent text-white text-[7px] font-black uppercase px-1 rounded shadow font-sans">
                                    Add.
                                  </span>
                                )}
                              </div>
                            );
                          })}

                          {/* Default Gallery */}
                          {defaultMediaLibrary.map((img) => {
                            const isCover = imageUrl === img.url;
                            const isAdditional = additionalImages.includes(img.url);
                            return (
                              <div 
                                key={img.id}
                                className={`w-28 h-20 rounded-xl overflow-hidden relative shrink-0 group border transition-all ${
                                  isCover ? "border-primary shadow-[0_0_10px_rgba(99,102,241,0.2)]" : isAdditional ? "border-accent shadow-[0_0_10px_rgba(244,63,94,0.2)]" : "border-white/5"
                                }`}
                              >
                                <img src={img.url} className="w-full h-full object-cover" alt={img.title} />
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-1 transition-opacity">
                                  <button
                                    type="button"
                                    onClick={() => setImageUrl(img.url)}
                                    className="bg-primary hover:bg-primary-hover text-white text-[8px] font-bold px-2 py-0.5 rounded shadow w-20 text-center font-sans"
                                  >
                                    Couverture
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleAddAdditionalImage(img.url)}
                                    className="bg-accent hover:bg-accent-hover text-white text-[8px] font-bold px-2 py-0.5 rounded shadow w-20 text-center font-sans"
                                  >
                                    Additionnelle
                                  </button>
                                </div>
                                <span className="absolute bottom-1 right-1 bg-black/70 text-[6px] text-slate-400 font-extrabold uppercase px-1 rounded font-sans">
                                  {img.tag}
                                </span>
                                {isCover && (
                                  <span className="absolute top-1.5 left-1.5 bg-primary text-white text-[7px] font-black uppercase px-1 rounded shadow font-sans">
                                    Couv.
                                  </span>
                                )}
                                {isAdditional && (
                                  <span className="absolute top-1.5 left-1.5 bg-accent text-white text-[7px] font-black uppercase px-1 rounded shadow font-sans">
                                    Add.
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>
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

        {/* Media Library Modal */}
        {isMediaModalOpen && (
          <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl relative">
              
              {/* Modal Header */}
              <div className="p-4 border-b border-white/5 flex items-center justify-between animate-in slide-in-from-top-4 duration-300">
                <div>
                  <h3 className="font-serif text-lg font-bold text-white flex items-center gap-1.5">
                    📁 Médiathèque Komentel
                  </h3>
                  <p className="text-[10px] text-slate-400 font-medium">
                    {mediaModalTarget === "COVER" 
                      ? "Sélectionnez l'image de couverture principale pour votre article" 
                      : "Sélectionnez une image additionnelle pour votre article"}
                  </p>
                </div>
                <button
                  onClick={() => setIsMediaModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer text-sm"
                >
                  ✕
                </button>
              </div>

              {/* Modal Tabs & Actions */}
              <div className="px-4 py-3 bg-slate-950/40 border-b border-white/5 flex flex-wrap items-center justify-between gap-3">
                <div className="flex gap-2">
                  <button
                    onClick={() => setMediaModalTab('GALLERY')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      mediaModalTab === 'GALLERY'
                        ? "bg-primary text-white"
                        : "bg-white/5 text-slate-450 hover:text-white"
                    }`}
                  >
                    🖼️ Galerie Générale
                  </button>
                  <button
                    onClick={() => setMediaModalTab('UPLOADS')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      mediaModalTab === 'UPLOADS'
                        ? "bg-primary text-white"
                        : "bg-white/5 text-slate-450 hover:text-white"
                    }`}
                  >
                    📂 Mon Média ({localMedia.length})
                  </button>
                </div>

                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    id="file-upload-input"
                    onChange={handleUploadFile}
                    className="hidden"
                  />
                  <label
                    htmlFor="file-upload-input"
                    className="bg-accent hover:bg-accent-hover text-white text-xs font-bold px-4 py-2 rounded-lg inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    📤 Importer une photo...
                  </label>
                </div>
              </div>

              {/* Modal Grid List */}
              <div className="p-6 overflow-y-auto flex-1 max-h-[55vh]">
                {mediaModalTab === 'GALLERY' ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 animate-in fade-in duration-200">
                    {defaultMediaLibrary.map((img) => (
                      <div
                        key={img.id}
                        onClick={() => {
                          if (mediaModalTarget === 'COVER') {
                            setImageUrl(img.url);
                          } else {
                            handleAddAdditionalImage(img.url);
                          }
                          setIsMediaModalOpen(false);
                        }}
                        className="bg-white/5 border border-white/5 rounded-xl overflow-hidden hover:border-primary/45 transition-all cursor-pointer group hover:scale-[1.01]"
                      >
                        <div className="h-28 overflow-hidden relative">
                          <img src={img.url} className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300" alt={img.title} />
                          <span className="absolute bottom-2 left-2 bg-black/60 text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded text-slate-300 font-sans">
                            {img.tag}
                          </span>
                        </div>
                        <div className="p-2.5">
                          <p className="text-[10px] font-bold text-white truncate leading-snug font-sans">{img.title}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="animate-in fade-in duration-200">
                    {localMedia.length === 0 ? (
                      <div className="text-center py-12 border border-dashed border-white/10 rounded-2xl bg-white/[0.01]">
                        <p className="text-sm text-slate-400 font-medium font-sans">Votre médiathèque personnelle est vide.</p>
                        <p className="text-[11px] text-slate-500 mt-1 font-sans">Cliquez sur "Importer une photo" en haut à droite pour ajouter vos fichiers locaux.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {localMedia.map((base64, index) => (
                          <div
                            key={index}
                            onClick={() => {
                              if (mediaModalTarget === 'COVER') {
                                setImageUrl(base64);
                              } else {
                                handleAddAdditionalImage(base64);
                              }
                              setIsMediaModalOpen(false);
                            }}
                            className="bg-white/5 border border-white/5 rounded-xl overflow-hidden hover:border-primary/45 transition-all cursor-pointer group hover:scale-[1.01] relative"
                          >
                            <div className="h-28 overflow-hidden relative">
                              <img src={base64} className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300" alt={`Upload ${index}`} />
                              <button
                                onClick={(e) => handleDeleteMedia(e, base64)}
                                className="absolute top-2 right-2 w-6 h-6 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center transition-colors shadow"
                                title="Supprimer"
                              >
                                <Trash size={10} />
                              </button>
                            </div>
                            <div className="p-2.5">
                              <p className="text-[10px] font-bold text-white truncate leading-snug font-sans">Mon image #{localMedia.length - index}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-4 bg-slate-950/40 border-t border-white/5 flex items-center justify-end">
                <button
                  onClick={() => setIsMediaModalOpen(false)}
                  className="bg-white/5 hover:bg-white/10 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors cursor-pointer font-sans"
                >
                  Fermer
                </button>
              </div>

            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
