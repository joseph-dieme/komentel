"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useKomentel } from "@/context/KomentelContext";
import { useRouter, useSearchParams } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { UserCheck, Award, FileText, CheckCircle2, ChevronRight, AlertCircle, BookOpen } from "lucide-react";

const CATEGORIES_WITH_EMOJIS = [
  { name: "Actualités", emoji: "📰" },
  { name: "Sport", emoji: "⚽" },
  { name: "Santé", emoji: "🩺" },
  { name: "Éducation", emoji: "🎓" },
  { name: "Technologie", emoji: "💻" },
  { name: "Culture", emoji: "🎨" },
  { name: "International", emoji: "🌍" },
  { name: "Business", emoji: "📈" }
];

function OnboardingContent() {
  const { user, completeOnboarding } = useKomentel();
  const router = useRouter();
  const searchParams = useSearchParams();

  const redirectPath = searchParams.get("redirect") || "/";

  // Form States
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [bio, setBio] = useState("");
  const [pressCard, setPressCard] = useState("");
  const [media, setMedia] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Populate form states from existing user details
  useEffect(() => {
    if (user) {
      if (user.interests && selectedInterests.length === 0) setSelectedInterests(user.interests);
      if (user.bio && !bio) setBio(user.bio);
      if (user.pressCard && !pressCard) setPressCard(user.pressCard);
      if (user.media && !media) setMedia(user.media);
      if (user.photoUrl && !photoUrl) setPhotoUrl(user.photoUrl);
    }
  }, [user]);

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      router.push(`/login?redirect=${encodeURIComponent("/onboarding")}`);
    }
  }, [user, router]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="font-serif text-lg text-slate-400 animate-pulse">Chargement de Komentel...</p>
      </div>
    );
  }

  const toggleInterest = (categoryName: string) => {
    setSelectedInterests(prev =>
      prev.includes(categoryName)
        ? prev.filter(c => c !== categoryName)
        : [...prev, categoryName]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Journalist validations
    if (user.role === "JOURNALIST") {
      if (!pressCard.trim()) {
        setError("Le numéro de carte de presse est obligatoire.");
        return;
      }
      if (!media.trim()) {
        setError("L'organe de presse ou employeur est obligatoire.");
        return;
      }
      if (!bio.trim()) {
        setError("Une brève biographie professionnelle est requise.");
        return;
      }
    }

    setIsSubmitting(true);

    // Simulate database write delay
    setTimeout(() => {
      completeOnboarding({
        interests: selectedInterests,
        bio: bio.trim(),
        pressCard: user.role === "JOURNALIST" ? pressCard.trim() : undefined,
        media: user.role === "JOURNALIST" ? media.trim() : undefined,
        photoUrl: photoUrl.trim() ? photoUrl.trim() : undefined
      });
      
      setIsSubmitting(false);
      setIsSuccess(true);

      // Redirect to target path
      setTimeout(() => {
        if (user.role === "JOURNALIST") {
          router.push("/journalist");
        } else {
          router.push(redirectPath);
        }
      }, 1500);
    }, 1200);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background bg-grid-pattern font-sans text-slate-200">
      <Header />

      <main className="max-w-4xl mx-auto px-4 py-16 flex-1 w-full flex flex-col items-center justify-center relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[150px] pointer-events-none -z-10"></div>

        {isSuccess ? (
          /* Success Screen */
          <div className="w-full max-w-md bg-[#12131C]/60 backdrop-blur-md border border-white/10 rounded-3xl p-8 text-center shadow-premium glow-indigo flex flex-col items-center justify-center space-y-4">
            <CheckCircle2 size={48} className="text-[#10B981] animate-bounce" />
            <h2 className="font-serif text-2xl font-bold text-white">Profil enregistré !</h2>
            <p className="text-xs text-slate-400">
              {user.role === "JOURNALIST"
                ? "Votre espace de rédaction est maintenant prêt. Redirection..."
                : "Bienvenue sur Komentel ! Préparation de votre flux personnalisé..."}
            </p>
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mt-2"></div>
          </div>
        ) : (
          /* Form Screen */
          <div className="w-full max-w-lg bg-[#12131C]/60 backdrop-blur-md border border-white/10 rounded-3xl p-6 sm:p-8 shadow-premium glow-indigo">
            
            {/* Header info */}
            <div className="text-center mb-6">
              <span className="inline-flex items-center gap-1 bg-primary/10 border border-primary/20 text-primary text-[9px] font-extrabold uppercase px-3 py-1 rounded-full tracking-wider mb-2">
                Étape 2 : Configuration du Profil
              </span>
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-white leading-tight">
                Finalisons votre inscription
              </h2>
              <p className="text-xs text-slate-400 mt-1.5">
                Bonjour <span className="text-slate-200 font-bold">{user.name}</span>. 
                {user.role === "JOURNALIST" 
                  ? " Renseignez vos informations de presse pour commencer à rédiger."
                  : " Personnalisez vos centres d'intérêt pour filtrer vos lectures."}
              </p>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-xs text-red-400 flex items-center gap-2 mb-4">
                <AlertCircle size={14} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* CATEGORY INTERESTS FOR BOTH (Different description for journalist) */}
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-slate-355 uppercase tracking-wider block">
                  {user.role === "JOURNALIST" 
                    ? "Rubriques de Spécialisation / Écritures"
                    : "Centres d'intérêt (Choisissez une ou plusieurs rubriques)"}
                </label>
                <div className="flex flex-wrap gap-2.5">
                  {CATEGORIES_WITH_EMOJIS.map(cat => {
                    const isSelected = selectedInterests.includes(cat.name);
                    return (
                      <button
                        type="button"
                        key={cat.name}
                        onClick={() => toggleInterest(cat.name)}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-semibold border transition-all cursor-pointer select-none ${
                          isSelected
                            ? "bg-primary text-white border-primary shadow-sm"
                            : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10"
                        }`}
                      >
                        <span>{cat.emoji}</span>
                        <span>{cat.name}</span>
                        {isSelected && <span>✓</span>}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* ROLE SPECIFIC FIELDS */}
              {user.role === "JOURNALIST" ? (
                /* Journalist Professional Credentials */
                <div className="space-y-4 pt-2 border-t border-white/5">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-355 uppercase tracking-wider block">
                      Numéro de carte de presse <span className="text-accent">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="ex: CARD-SN-2026-987"
                      value={pressCard}
                      onChange={e => setPressCard(e.target.value)}
                      className="w-full border border-white/10 rounded-2xl py-2.5 px-4 text-xs text-white focus:ring-1 focus:ring-primary bg-white/5 focus:bg-white/10 outline-none transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-355 uppercase tracking-wider block">
                      Organe de presse / Employeur actuel <span className="text-accent">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="ex: Le Soleil, Agence de Presse Sénégalaise, Indépendant..."
                      value={media}
                      onChange={e => setMedia(e.target.value)}
                      className="w-full border border-white/10 rounded-2xl py-2.5 px-4 text-xs text-white focus:ring-1 focus:ring-primary bg-white/5 focus:bg-white/10 outline-none transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-355 uppercase tracking-wider block">
                      Lien de votre photo d'information / profil
                    </label>
                    <input
                      type="text"
                      placeholder="ex: https://images.unsplash.com/photo-..."
                      value={photoUrl}
                      onChange={e => setPhotoUrl(e.target.value)}
                      className="w-full border border-white/10 rounded-2xl py-2.5 px-4 text-xs text-white focus:ring-1 focus:ring-primary bg-white/5 focus:bg-white/10 outline-none transition-all"
                    />
                    <p className="text-[9px] text-slate-500">
                      Optionnel. Entrez un lien URL d'image valide pour que votre photo soit visible par l'administration.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-355 uppercase tracking-wider block">
                      Biographie professionnelle (Rubrique Auteur) <span className="text-accent">*</span>
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Décrivez brièvement votre parcours journalistique, vos thèmes de prédilection ou vos publications antérieures..."
                      value={bio}
                      onChange={e => setBio(e.target.value)}
                      className="w-full border border-white/10 rounded-2xl py-2.5 px-4 text-xs text-white focus:ring-1 focus:ring-primary bg-white/5 focus:bg-white/10 outline-none transition-all resize-none"
                    ></textarea>
                  </div>
                </div>
              ) : (
                /* Simple User Bio & Photo */
                <div className="space-y-4 pt-2 border-t border-white/5">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-350 uppercase tracking-wider block">
                      Lien de votre photo de profil
                    </label>
                    <input
                      type="text"
                      placeholder="ex: https://images.unsplash.com/photo-..."
                      value={photoUrl}
                      onChange={e => setPhotoUrl(e.target.value)}
                      className="w-full border border-white/10 rounded-2xl py-2.5 px-4 text-xs text-white focus:ring-1 focus:ring-primary bg-white/5 focus:bg-white/10 outline-none transition-all"
                    />
                    <p className="text-[9px] text-slate-500">
                      Optionnel. Entrez un lien URL d'image valide pour personnaliser votre avatar.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-350 uppercase tracking-wider block">
                      Votre biographie (Optionnel)
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Écrivez quelques mots sur vous pour votre profil de duelliste et de débatteur citoyen..."
                      value={bio}
                      onChange={e => setBio(e.target.value)}
                      className="w-full border border-white/10 rounded-2xl py-2.5 px-4 text-xs text-white focus:ring-1 focus:ring-primary bg-white/5 focus:bg-white/10 outline-none transition-all resize-none"
                    ></textarea>
                  </div>
                </div>
              )}

              {/* Submission Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-primary hover:bg-primary-hover hover:scale-102 active:scale-98 disabled:bg-slate-800 disabled:text-slate-500 text-white font-bold py-3.5 rounded-2xl transition-all text-xs uppercase tracking-wider shadow-premium flex items-center justify-center gap-2 focus:outline-none cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Enregistrement...</span>
                  </>
                ) : (
                  <>
                    <span>Terminer mon inscription</span>
                    <ChevronRight size={14} />
                  </>
                )}
              </button>

            </form>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="font-serif text-lg text-slate-400 animate-pulse">Chargement de Komentel...</p>
      </div>
    }>
      <OnboardingContent />
    </Suspense>
  );
}
