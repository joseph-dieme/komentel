"use client";

import React, { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useKomentel, decodeHTML } from "@/context/KomentelContext";
import { 
  Shield, 
  ShieldAlert, 
  Award, 
  AlertOctagon, 
  Trash2, 
  CheckCircle, 
  Clock, 
  Check, 
  Users, 
  RefreshCw,
  Image as ImageIcon,
  ExternalLink,
  PlusCircle,
  FileText,
  AlertTriangle,
  Plus,
  Trash
} from "lucide-react";

interface MediaPartner {
  id: string;
  name: string;
  type: string;
  contact: string;
  status: "PENDING" | "APPROVED";
}

export default function AdminPage() {
  const { 
    user, 
    setUser, 
    comments, 
    duels, 
    moderateComment, 
    moderateDuel,
    registeredUsers,
    accreditJournalist,
    addArticle
  } = useKomentel();

  // Local state for candidate partners
  const [partners, setPartners] = useState<MediaPartner[]>([
    { id: "p-1", name: "SeneNews", type: "Média en ligne", contact: "contact@senenews.com", status: "PENDING" },
    { id: "p-2", name: "Dakaractu", type: "Média indépendant", contact: "redac@dakaractu.com", status: "PENDING" },
    { id: "p-3", name: "Sud Quotidien", type: "Presse Écrite", contact: "sud@sudonline.sn", status: "APPROVED" }
  ]);

  // Form States for publishing as Komentel
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Actualités");
  const [summary, setSummary] = useState("");
  const [paragraphs, setParagraphs] = useState<string[]>([""]);
  const [imageUrl, setImageUrl] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [additionalImages, setAdditionalImages] = useState<string[]>([]);
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

  const isAdmin = user?.role === "ADMIN";

  const handleApprovePartner = (id: string) => {
    setPartners(prev => prev.map(p => p.id === id ? { ...p, status: "APPROVED" } : p));
  };

  const handlePublishAsKomentel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || paragraphs.every(p => !p.trim())) return;

    const filteredParagraphs = paragraphs.map(p => p.trim()).filter(p => p !== "");

    addArticle(
      title, 
      category, 
      summary, 
      filteredParagraphs, 
      imageUrl || undefined, 
      "Komentel", 
      additionalImages, 
      videoUrl.trim() || undefined
    );
    
    // Reset Form
    setTitle("");
    setSummary("");
    setParagraphs([""]);
    setImageUrl("");
    setVideoUrl("");
    setAdditionalImages([]);
    setIsPublished(true);
    setTimeout(() => setIsPublished(false), 5000);
  };

  const forceSwitchToAdmin = () => {
    setUser({
      name: "Admin Komentel",
      email: "admin.moderator@komentel.sn",
      role: "ADMIN",
      duelsStats: { wins: 0, losses: 0, ratio: 0 },
      activeDuelingEnabled: false,
      accredited: true
    });
  };

  // Filter reported comments
  const reportedComments = comments.filter(c => c.reported);
  
  // Filter registered journalists
  const journalists = registeredUsers.filter(u => u.role === "JOURNALIST");

  return (
    <div className="min-h-screen flex flex-col bg-background bg-grid-pattern font-sans text-slate-200">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full relative">
        {/* Soft glowing ambient backgrounds */}
        <div className="absolute top-10 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px] pointer-events-none -z-10"></div>
        
        {/* Guard warning */}
        {!isAdmin ? (
          <section className="bg-red-500/10 border-l-4 border-red-555 rounded-xl p-8 shadow-premium max-w-2xl mx-auto text-center space-y-4">
            <ShieldAlert size={48} className="text-red-500 mx-auto" />
            <h2 className="text-2xl font-serif font-bold text-white">Accès Restreint — Espace Administration</h2>
            <p className="text-sm text-slate-350 leading-relaxed">
              Pour accéder aux fonctionnalités d'arbitrage de duels, de modération de commentaires signalés et d'approbation d'accreditation, vous devez être connecté en tant que membre du Comité Éditorial.
            </p>
            <div className="pt-2">
              <button 
                onClick={forceSwitchToAdmin}
                className="bg-primary hover:bg-primary-hover hover:scale-105 active:scale-95 text-white text-xs font-bold uppercase tracking-wider px-6 py-3 rounded-full shadow transition-all inline-flex items-center gap-1.5 focus:outline-none animate-pulse"
              >
                🛡️ Simuler le rôle Modérateur (Admin)
              </button>
            </div>
            <p className="text-[10px] text-slate-500">
              Ou changez de rôle via le menu Profil en haut à droite.
            </p>
          </section>
        ) : (
          <div className="space-y-8">
            
            {/* Page Header info */}
            <div className="bg-[#12131C]/60 backdrop-blur-md border border-white/10 p-6 rounded-2xl shadow-premium flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="font-serif text-3xl font-bold text-white flex items-center gap-2">
                  <Shield className="text-primary fill-primary/10" size={28} />
                  Panel d'Administration & Gouvernance
                </h1>
                <p className="text-xs text-slate-400 font-semibold mt-1 uppercase tracking-wider">
                  Comité Éditorial Komentel · Modérateur : {user.name}
                </p>
              </div>
            </div>

            {/* Dashboard grid layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Left Column: Editor, Accreditations, Reported Comments & Duels moderation (8 columns) */}
              <div className="lg:col-span-8 space-y-8">
                
                {/* Form Header */}
                <div className="bg-[#12131C]/60 backdrop-blur-md rounded-xl border border-white/10 p-6 shadow-sm flex items-center justify-between">
                  <h2 className="font-serif text-xl font-bold text-white flex items-center gap-2">
                    <PlusCircle size={22} className="text-primary" />
                    Publier au nom de Komentel (Officiel)
                  </h2>
                  <p className="text-xs text-slate-500 font-medium">
                    Section éditoriale réservée au comité de rédaction officiel.
                  </p>
                </div>

                {isPublished && (
                  <div className="bg-green-500/10 border border-green-500/20 text-green-300 rounded-lg p-4 text-xs font-semibold">
                    🎉 Article publié avec succès sous la signature officielle "Komentel" ! Il est maintenant visible sur le fil d'actualité.
                  </div>
                )}

                <form onSubmit={handlePublishAsKomentel} className="space-y-6">
                  
                  {/* Card 1: 01. Informations Générales */}
                  <div className="bg-[#12131C]/60 backdrop-blur-md rounded-xl border border-white/10 p-6 shadow-sm space-y-4">
                    <div className="flex items-center gap-2 pb-2.5 border-b border-white/5">
                      <span className="w-5 h-5 rounded-full bg-primary/20 text-primary text-[10px] font-bold flex items-center justify-center font-mono">1</span>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-white font-serif">Informations Générales</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="md:col-span-1 space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Catégorie</label>
                        <select 
                          value={category} 
                          onChange={e => setCategory(e.target.value)}
                          className="w-full border border-white/10 bg-slate-900 text-white rounded-lg p-2.5 text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none"
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
                      <div className="md:col-span-2 space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Titre de l'article</label>
                        <input 
                          type="text" 
                          placeholder="Entrez le titre de la publication officielle..." 
                          required
                          value={title}
                          onChange={e => setTitle(e.target.value)}
                          className="w-full border border-white/10 bg-white/5 text-white rounded-lg p-2.5 text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none font-serif font-semibold"
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
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Court résumé de l'annonce officielle</label>
                      <input 
                        type="text" 
                        placeholder="Court résumé de l'annonce officielle..." 
                        value={summary}
                        onChange={e => setSummary(e.target.value)}
                        className="w-full border border-white/10 bg-white/5 text-white rounded-lg p-2.5 text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none"
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
                            className="w-full border border-white/10 bg-white/5 text-white rounded-lg p-2.5 text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Lien Vidéo (YouTube / MP4)</label>
                          <input 
                            type="text" 
                            placeholder="Ex: https://www.youtube.com/watch?v=..." 
                            value={videoUrl}
                            onChange={e => setVideoUrl(e.target.value)}
                            className="w-full border border-white/10 bg-white/5 text-white rounded-lg p-2.5 text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-sans">
                          Photos additionnelles
                        </label>
                        
                        <div className="relative group border border-dashed border-white/10 hover:border-primary/40 rounded-2xl p-6 bg-white/[0.02] hover:bg-white/[0.04] transition-all flex flex-col items-center justify-center gap-2 cursor-pointer">
                          <input 
                            type="file" 
                            multiple 
                            accept="image/*" 
                            onChange={(e) => {
                              const files = Array.from(e.target.files || []);
                              files.forEach(file => {
                                const reader = new FileReader();
                                reader.onloadend = () => {
                                  setAdditionalImages(prev => [...prev, reader.result as string]);
                                };
                                reader.readAsDataURL(file);
                              });
                            }}
                            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10" 
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
                                  onClick={() => setAdditionalImages(prev => prev.filter(u => u !== url))}
                                  className="absolute inset-0 bg-black/75 opacity-0 group-hover:opacity-100 flex items-center justify-center text-red-400 hover:text-red-300 font-bold text-[10px] transition-opacity cursor-pointer"
                                >
                                  Retirer
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
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
                            className="w-full border-0 bg-transparent text-slate-200 text-xs focus:ring-0 outline-none resize-none leading-relaxed font-sans"
                          ></textarea>
                        </div>
                      ))}

                      <button
                        type="button"
                        onClick={handleAddParagraph}
                        className="w-full border border-dashed border-white/10 hover:border-primary/30 hover:bg-primary/5 rounded-2xl py-3.5 text-xs text-slate-400 hover:text-primary transition-all flex items-center justify-center gap-1.5 font-bold uppercase tracking-wider cursor-pointer"
                      >
                        <Plus size={14} /> Ajouter un paragraphe
                      </button>
                    </div>
                  </div>

                  {/* Submission Button */}
                  <button
                    type="submit"
                    className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-4 rounded-2xl text-xs uppercase tracking-wider shadow-premium transition-colors cursor-pointer"
                  >
                    Publier au nom de Komentel
                  </button>

                </form>

                {/* Journalist Accreditations panel */}
                <div className="bg-[#12131C]/60 backdrop-blur-md rounded-xl border border-white/10 p-6 shadow-premium space-y-4">
                  <h2 className="font-serif text-lg font-bold text-white pb-2.5 border-b border-white/5 flex items-center gap-2">
                    <Users size={20} className="text-slate-400" />
                    Accréditations des Journalistes ({journalists.length})
                  </h2>

                  {journalists.length === 0 ? (
                    <p className="text-xs sm:text-sm text-slate-500 py-6 text-center">
                      Aucun journaliste n'est inscrit pour le moment.
                    </p>
                  ) : (
                    <div className="divide-y divide-white/5">
                      {journalists.map(jour => (
                        <div key={jour.email} className="py-5 first:pt-0 last:pb-0 flex flex-col md:flex-row gap-5 items-start">
                          {/* Journalist Image column */}
                          <div className="flex flex-col items-center gap-2 shrink-0 w-full md:w-32">
                            {jour.photoUrl ? (
                              <img 
                                src={jour.photoUrl} 
                                alt={`Photo de ${jour.name}`} 
                                className="w-24 h-24 rounded-2xl object-cover border border-white/10 shadow-sm"
                              />
                            ) : (
                              <div className="w-24 h-24 rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center justify-center text-slate-500">
                                <ImageIcon size={28} />
                                <span className="text-[9px] mt-1">Pas de photo</span>
                              </div>
                            )}
                            {jour.photoUrl && (
                              <a 
                                href={jour.photoUrl} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="text-[10px] text-primary hover:underline flex items-center gap-1 mt-1 font-medium max-w-full truncate"
                              >
                                Lien Photo <ExternalLink size={10} />
                              </a>
                            )}
                          </div>

                          {/* Journalist Details column */}
                          <div className="flex-1 space-y-2.5 w-full">
                            <div className="flex flex-wrap justify-between items-start gap-2">
                              <div>
                                <h3 className="font-bold text-sm text-white flex items-center gap-2">
                                  {jour.name}
                                  <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded ${
                                    jour.accredited
                                      ? "bg-green-500/20 text-green-400 border border-green-500/25"
                                      : "bg-amber-500/20 text-amber-400 border border-amber-500/25"
                                  }`}>
                                    {jour.accredited ? "Accrédité" : "En attente"}
                                  </span>
                                </h3>
                                <p className="text-[11px] text-slate-400 mt-0.5">{jour.email}</p>
                              </div>
                              
                              {!jour.accredited && (
                                <button
                                  onClick={() => accreditJournalist(jour.email)}
                                  className="bg-primary hover:bg-primary-hover hover:scale-102 active:scale-98 text-white font-bold py-1.5 px-4 rounded-xl text-xs uppercase tracking-wider transition-all shadow-sm flex items-center gap-1.5 focus:outline-none cursor-pointer"
                                >
                                  <Check size={12} /> Accréditer
                                </button>
                              )}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-white/5 p-3 rounded-xl border border-white/5">
                              <div>
                                <p className="text-slate-550 font-bold text-[9px] uppercase tracking-wider leading-none">Média / Employeur</p>
                                <p className="text-slate-200 mt-1 font-semibold">{jour.media || "Non renseigné"}</p>
                              </div>
                              <div>
                                <p className="text-slate-550 font-bold text-[9px] uppercase tracking-wider leading-none">N° Carte de presse</p>
                                <p className="text-slate-200 mt-1 font-semibold font-mono">{jour.pressCard || "Non renseigné"}</p>
                              </div>
                            </div>

                            {jour.bio && (
                              <div className="space-y-1">
                                <p className="text-slate-550 font-bold text-[9px] uppercase tracking-wider leading-none">Biographie professionnelle</p>
                                <p className="text-xs text-slate-355 bg-white/[0.02] p-2.5 rounded-lg border border-white/5 leading-relaxed">
                                  {jour.bio}
                                </p>
                              </div>
                            )}

                            {jour.photoUrl && (
                              <div className="text-[10px] text-slate-500 break-all bg-black/20 p-2 rounded-lg font-mono">
                                <span className="font-bold text-slate-450">URL :</span> {jour.photoUrl}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 1. Flagged Comments section */}
                <div className="bg-[#12131C]/60 backdrop-blur-md rounded-xl border border-white/10 p-6 shadow-premium space-y-4">
                  <h2 className="font-serif text-lg font-bold text-white pb-2.5 border-b border-white/5 flex items-center gap-2">
                    <AlertOctagon size={20} className="text-red-500 animate-pulse" />
                    Commentaires Signalés ({reportedComments.length})
                  </h2>

                  {reportedComments.length === 0 ? (
                    <p className="text-xs sm:text-sm text-slate-500 py-6 text-center">
                      Aucun signalement de commentaire en attente. La communauté est saine !
                    </p>
                  ) : (
                    <div className="divide-y divide-white/5">
                      {reportedComments.map(c => (
                        <div key={c.id} className="py-4 first:pt-0 last:pb-0 space-y-2">
                          <div className="flex justify-between items-center text-xs font-semibold">
                            <span className="text-slate-300 font-bold">Auteur : {c.author}</span>
                            <span className="text-slate-500">{c.createdAt}</span>
                          </div>
                          <p className="text-xs sm:text-sm text-slate-300 bg-white/5 p-3 rounded-lg border border-white/5 leading-relaxed font-sans">
                            {decodeHTML(c.content)}
                          </p>
                          <div className="flex gap-2 justify-end text-xs">
                            <button
                              onClick={() => moderateComment(c.id, "keep")}
                              className="inline-flex items-center gap-1 border border-white/10 text-slate-400 hover:bg-white/5 font-semibold px-3 py-1.5 rounded-lg text-xs"
                            >
                              <CheckCircle size={14} className="text-green-500" /> Ignorer le signalement
                            </button>
                            <button
                              onClick={() => moderateComment(c.id, "delete")}
                              className="inline-flex items-center gap-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/20 font-semibold px-3 py-1.5 rounded-lg text-xs transition-all duration-150"
                            >
                              <Trash2 size={14} /> Supprimer le commentaire
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 2. Flagged Duels section */}
                <div className="bg-[#12131C]/60 backdrop-blur-md rounded-xl border border-white/10 p-6 shadow-premium space-y-4">
                  <h2 className="font-serif text-lg font-bold text-white pb-2.5 border-b border-white/5 flex items-center gap-2">
                    <Shield size={20} className="text-slate-450" />
                    Arbitrage des Duels ({duels.length})
                  </h2>

                  {duels.length === 0 ? (
                    <p className="text-xs sm:text-sm text-slate-550 py-6 text-center">Aucun duel actif sur la plateforme.</p>
                  ) : (
                    <div className="divide-y divide-white/5">
                      {duels.map(d => (
                        <div key={d.id} className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                          <div>
                            <span className={`inline-block text-[9px] font-bold uppercase px-2 py-0.5 rounded mb-1.5 ${
                              d.status === "ACTIVE" 
                                ? "bg-accent/15 text-accent border border-accent/20" 
                                : d.status === "CLOSED"
                                  ? "bg-slate-800 text-slate-400 border border-white/5"
                                  : "bg-amber-500/15 text-amber-400 border border-amber-500/20"
                            }`}>
                              {d.status}
                            </span>
                            <h4 className="text-sm font-bold text-slate-200 leading-snug">{d.articleTitle}</h4>
                            <p className="text-xs text-slate-500 mt-1">
                              {d.challenger} vs {d.defender} · {d.closesAt}
                            </p>
                          </div>
                          {d.status === "ACTIVE" && (
                            <div className="flex gap-2 text-xs shrink-0 self-end sm:self-auto">
                              <button
                                onClick={() => moderateDuel(d.id, "close")}
                                className="border border-white/10 hover:bg-white/5 text-slate-300 font-semibold px-3 py-1.5 rounded-lg text-xs transition-colors"
                              >
                                Clôturer
                              </button>
                              <button
                                onClick={() => moderateDuel(d.id, "delete")}
                                className="bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/20 font-semibold px-3 py-1.5 rounded-lg text-xs transition-colors"
                              >
                                Supprimer
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>

              {/* Right Column: Candidates & Accreditations (4 columns) */}
              <div className="lg:col-span-4 space-y-6">
                
                {/* Candidates partners accreditation list */}
                <div className="bg-[#12131C]/60 backdrop-blur-md rounded-xl border border-white/10 p-6 shadow-premium space-y-4">
                  <h3 className="font-serif text-base font-bold text-white pb-2.5 border-b border-white/5 flex items-center gap-1.5">
                    <Users size={18} className="text-slate-400" />
                    Médias Partenaires
                  </h3>
                  <div className="space-y-3 font-sans">
                    {partners.map(p => (
                      <div key={p.id} className="p-3 bg-white/5 border border-white/5 rounded-lg space-y-2 text-xs">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-slate-200">{p.name}</span>
                          <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded ${
                            p.status === "APPROVED"
                              ? "bg-green-500/20 text-green-400 border border-green-500/20"
                              : "bg-amber-500/20 text-amber-400 border border-amber-500/20"
                          }`}>
                            {p.status === "APPROVED" ? "Certifié" : "En attente"}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500">{p.type} · {p.contact}</p>
                        
                        {p.status === "PENDING" && (
                          <button
                            onClick={() => handleApprovePartner(p.id)}
                            className="w-full bg-primary hover:bg-primary-hover hover:scale-105 active:scale-95 text-white font-bold py-1.5 rounded text-[10px] uppercase tracking-wider transition-all shadow-sm flex items-center justify-center gap-1 focus:outline-none"
                          >
                            <Check size={11} /> Accréditer
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Audit guidelines */}
                <div className="bg-slate-900/90 text-slate-350 rounded-xl p-6 shadow-md border border-white/10">
                  <h3 className="font-serif text-base font-bold text-white mb-3">
                    🛡️ Guide du Modérateur
                  </h3>
                  <ul className="space-y-2 text-xs text-slate-400 leading-relaxed font-sans list-disc list-inside">
                    <li>Vérifier la véracité des faits rapportés en signalement.</li>
                    <li>Supprimer immédiatement les insultes, diffamations, attaques politiques/ethniques directes.</li>
                    <li>Clôturer les duels en cas de dérapage non constructif persistant.</li>
                    <li>
                      Assurer la conformité CDP (protection des données) lors du traitement.
                    </li>
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
