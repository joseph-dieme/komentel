"use client";

import React, { useState, Suspense } from "react";
import { useKomentel } from "@/context/KomentelContext";
import { useRouter, useSearchParams } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { UserPlus, LogIn, CheckCircle2, AlertCircle } from "lucide-react";
import Link from "next/link";

function LoginContent() {
  const { registeredUsers, loginUser, registerUser, user, language } = useKomentel();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const t = (frText: string, enText: string) => {
    return language === "FR" ? frText : enText;
  };

  // Tabs: 'LOGIN' or 'REGISTER'
  const [activeTab, setActiveTab] = useState<'LOGIN' | 'REGISTER'>('LOGIN');
  
  // Login Form States
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  // Register Form States
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regRole, setRegRole] = useState<'USER' | 'JOURNALIST'>('USER');
  const [regError, setRegError] = useState("");
  const [regSuccess, setRegSuccess] = useState(false);
  const [regTermsAccepted, setRegTermsAccepted] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  const redirectPath = searchParams.get("redirect") || "/";

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");

    if (!loginEmail.trim() || !loginPassword.trim()) {
      setLoginError("Veuillez entrer votre email et votre mot de passe.");
      return;
    }

    const success = await loginUser(loginEmail.trim(), loginPassword.trim());
    if (success) {
      router.push(redirectPath);
    } else {
      setLoginError("Email ou mot de passe incorrect.");
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError("");
    setRegSuccess(false);

    if (!regName.trim() || !regEmail.trim() || !regPassword.trim()) {
      setRegError(t("Tous les champs sont obligatoires.", "All fields are required."));
      return;
    }

    if (regPassword.trim().length < 6) {
      setRegError(t("Le mot de passe doit faire au moins 6 caractères.", "Password must be at least 6 characters."));
      return;
    }

    // Check if email already registered
    const emailExists = registeredUsers.some(
      u => u.email.toLowerCase() === regEmail.trim().toLowerCase()
    );

    if (emailExists) {
      setRegError(t("Cet email est déjà enregistré. Veuillez utiliser un autre email.", "This email is already registered. Please use another email."));
      return;
    }

    if (!regTermsAccepted) {
      setRegError(t("Vous devez accepter la politique de confidentialité et la charte d'utilisation.", "You must accept the privacy policy and terms of use."));
      return;
    }

    registerUser(regName.trim(), regEmail.trim(), regRole, regPassword.trim());
    setRegSuccess(true);
    
    // Automatically redirect to onboarding after a short delay
    setTimeout(() => {
      router.push(`/onboarding?redirect=${encodeURIComponent(redirectPath)}`);
    }, 1500);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background bg-grid-pattern font-sans text-slate-200">
      <Header />

      <main className="max-w-md mx-auto px-4 py-16 flex-1 w-full flex flex-col items-center justify-center relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[150px] pointer-events-none -z-10"></div>
        
        {/* Auth forms */}
        <div className="w-full bg-[#12131C]/60 backdrop-blur-md border border-white/10 rounded-3xl p-6 sm:p-8 shadow-premium glow-indigo">
          
          {/* Tab switches */}
          <div className="flex border-b border-white/5 mb-6">
            <button
              onClick={() => {
                setActiveTab("LOGIN");
                setLoginError("");
              }}
              className={`flex-1 pb-3 text-xs font-bold uppercase tracking-wider transition-all focus:outline-none flex items-center justify-center gap-1.5 ${
                activeTab === "LOGIN"
                  ? "border-b-2 border-primary text-white font-bold"
                  : "text-slate-500 hover:text-white"
              }`}
            >
              <LogIn size={14} /> Se connecter
            </button>
            <button
              onClick={() => {
                setActiveTab("REGISTER");
                setRegError("");
              }}
              className={`flex-1 pb-3 text-xs font-bold uppercase tracking-wider transition-all focus:outline-none flex items-center justify-center gap-1.5 ${
                activeTab === "REGISTER"
                  ? "border-b-2 border-primary text-white font-bold"
                  : "text-slate-500 hover:text-white"
              }`}
            >
              <UserPlus size={14} /> S'inscrire
            </button>
          </div>

          {activeTab === "LOGIN" ? (
            /* Login Form */
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <h2 className="font-serif text-xl font-bold text-white mb-2">Bon retour parmi nous</h2>
              <p className="text-xs text-slate-400 mb-4">Connectez-vous pour débattre et voter en arène.</p>
              
              {loginError && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-xs text-red-400 flex items-center gap-2">
                  <AlertCircle size={14} className="shrink-0" />
                  <span>{loginError}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-350 uppercase tracking-wider block">
                  Adresse email
                </label>
                <input
                  type="email"
                  placeholder="exemple: moussa.diop@komentel.sn"
                  value={loginEmail}
                  onChange={e => setLoginEmail(e.target.value)}
                  className="w-full border border-white/10 rounded-2xl py-2.5 px-4 text-xs text-white focus:ring-1 focus:ring-primary bg-white/5 focus:bg-white/10 outline-none transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-355 uppercase tracking-wider block">
                  Mot de passe
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={e => setLoginPassword(e.target.value)}
                  className="w-full border border-white/10 rounded-2xl py-2.5 px-4 text-xs text-white focus:ring-1 focus:ring-primary bg-white/5 focus:bg-white/10 outline-none transition-all"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-primary hover:bg-primary-hover hover:scale-105 active:scale-95 !text-white font-bold py-3 rounded-2xl transition-all text-xs uppercase tracking-wider shadow-premium mt-4 focus:outline-none"
              >
                Connexion
              </button>

              {/* Demo Accounts Panel */}
              <div className="mt-6 pt-5 border-t border-white/5 space-y-3 font-sans">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Comptes de Test (Démo)
                  </span>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setLoginEmail("admin.moderator@komentel.sn");
                      setLoginPassword("password123");
                    }}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-primary/10 border border-primary/20 hover:bg-primary/20 transition-all text-[11px] text-left cursor-pointer group"
                  >
                    <div>
                      <p className="font-bold text-slate-200 group-hover:text-white">Admin Modérateur</p>
                      <p className="text-[10px] text-slate-400">admin.moderator@komentel.sn</p>
                    </div>
                    <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded bg-primary/20 text-primary border border-primary/20 font-mono">
                      password123
                    </span>
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => {
                      setLoginEmail("jtech221plus@gmail.com");
                      setLoginPassword("N3pt9%(Tech)");
                    }}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 transition-all text-[11px] text-left cursor-pointer group"
                  >
                    <div>
                      <p className="font-bold text-slate-200 group-hover:text-white">Mon Admin (Joseph)</p>
                      <p className="text-[10px] text-slate-400">jtech221plus@gmail.com</p>
                    </div>
                    <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/20 font-mono">
                      N3pt9%(Tech)
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setLoginEmail("amadou.diallo@komentel.sn");
                      setLoginPassword("password123");
                    }}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all text-[11px] text-left cursor-pointer group"
                  >
                    <div>
                      <p className="font-bold text-slate-200 group-hover:text-white">Journaliste Rédacteur</p>
                      <p className="text-[10px] text-slate-400">amadou.diallo@komentel.sn</p>
                    </div>
                    <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 font-mono">
                      password123
                    </span>
                  </button>
                </div>
              </div>
            </form>
          ) : (
            /* Signup/Register Form */
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <h2 className="font-serif text-xl font-bold text-white mb-2">Créer un compte</h2>
              <p className="text-xs text-slate-400 mb-4">Devenez duelliste et contribuez au débat citoyen.</p>

              {regError && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-xs text-red-400 flex items-center gap-2">
                  <AlertCircle size={14} className="shrink-0" />
                  <span>{regError}</span>
                </div>
              )}

              {regSuccess && (
                <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-3 text-xs text-green-300 flex items-center gap-2">
                  <CheckCircle2 size={14} className="shrink-0" />
                  <span>Compte créé avec succès ! Redirection...</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-350 uppercase tracking-wider block">
                  Nom complet
                </label>
                <input
                  type="text"
                  placeholder="exemple: Kofi Mensah"
                  value={regName}
                  onChange={e => setRegName(e.target.value)}
                  className="w-full border border-white/10 rounded-2xl py-2.5 px-4 text-xs text-white focus:ring-1 focus:ring-primary bg-white/5 focus:bg-white/10 outline-none transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-350 uppercase tracking-wider block">
                  Adresse email
                </label>
                <input
                  type="email"
                  placeholder="exemple: kofi.mensah@komentel.sn"
                  value={regEmail}
                  onChange={e => setRegEmail(e.target.value)}
                  className="w-full border border-white/10 rounded-2xl py-2.5 px-4 text-xs text-white focus:ring-1 focus:ring-primary bg-white/5 focus:bg-white/10 outline-none transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-350 uppercase tracking-wider block">
                  Mot de passe (min 6 car.)
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={regPassword}
                  onChange={e => setRegPassword(e.target.value)}
                  className="w-full border border-white/10 rounded-2xl py-2.5 px-4 text-xs text-white focus:ring-1 focus:ring-primary bg-white/5 focus:bg-white/10 outline-none transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-355 uppercase tracking-wider block">
                  Rôle de compte
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer">
                    <input
                      type="radio"
                      name="regRole"
                      checked={regRole === "USER"}
                      onChange={() => setRegRole("USER")}
                      className="accent-primary"
                    />
                    <span>Utilisateur / Duelliste</span>
                  </label>
                  <label className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer">
                    <input
                      type="radio"
                      name="regRole"
                      checked={regRole === "JOURNALIST"}
                      onChange={() => setRegRole("JOURNALIST")}
                      className="accent-primary"
                    />
                    <span>Journaliste Rédacteur</span>
                  </label>
                </div>
              </div>

              <div className="flex items-start gap-2 pt-2">
                <input
                  type="checkbox"
                  id="regTerms"
                  checked={regTermsAccepted}
                  onChange={e => setRegTermsAccepted(e.target.checked)}
                  className="mt-0.5 rounded border-white/10 text-primary focus:ring-primary h-3.5 w-3.5 cursor-pointer"
                />
                <label htmlFor="regTerms" className="text-[10px] sm:text-xs text-slate-400 leading-normal cursor-pointer select-none">
                  {t(
                    "J'accepte la politique de confidentialité et m'engage à respecter la charte d'utilisation (débats courtois, respectueux et sans haine).",
                    "I accept the privacy policy and agree to respect the terms of use (courteous, respectful debates without hate speech)."
                  )}
                  {" "}
                  <button 
                    type="button"
                    onClick={() => setShowTermsModal(true)}
                    className="text-primary hover:underline font-bold focus:outline-none"
                  >
                    {t("Lire en surimpression", "Quick preview")}
                  </button>
                  {" "}{t("ou", "or")}{" "}
                  <Link 
                    href="/privacy"
                    target="_blank"
                    className="text-primary hover:underline font-bold"
                  >
                    {t("voir la page complète", "view full page")}
                  </Link>
                </label>
              </div>

              <button
                type="submit"
                disabled={regSuccess}
                className="w-full bg-primary hover:bg-primary-hover hover:scale-105 active:scale-95 disabled:bg-slate-800 disabled:text-slate-500 !text-white font-bold py-3 rounded-2xl transition-all text-xs uppercase tracking-wider shadow-premium mt-4 focus:outline-none"
              >
                {t("Créer mon compte", "Create my account")}
              </button>
            </form>
          )}
        </div>
      </main>

      {showTermsModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#12131C]/90 border border-white/10 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-popover relative max-h-[85vh] flex flex-col">
            <div className="flex justify-between items-center border-b border-white/5 pb-3">
              <h3 className="font-serif text-base sm:text-lg font-bold text-white flex items-center gap-1.5 uppercase tracking-wider">
                ⚖️ {t("Politique & Règles d'Utilisation", "Policy & Terms of Use")}
              </h3>
              <button 
                onClick={() => setShowTermsModal(false)}
                className="text-slate-400 hover:text-white text-xl font-bold transition-colors cursor-pointer"
              >
                &times;
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-4 pr-1 text-xs text-slate-300 leading-relaxed font-sans scrollbar-thin text-left">
              <section className="space-y-2">
                <h4 className="font-serif text-sm font-bold text-primary uppercase tracking-wider">
                  🛡️ 1. {t("Politique de Confidentialité", "Privacy Policy")}
                </h4>
                
                <div className="space-y-1.5 pl-1">
                  <p>
                    <strong className="text-white font-semibold block">{t("Collecte de Données Personnelles :", "Personal Data Collection:")}</strong>
                    {t(
                      "Nous recueillons uniquement les informations nécessaires au fonctionnement de votre compte Komentel : votre adresse e-mail, votre mot de passe (chiffré via des algorithmes sécurisés), vos préférences thématiques ainsi que vos contributions actives (commentaires, débats, votes, likes).",
                      "We only collect the minimum information required to operate your Komentel account: your email address, your password (encrypted using secure algorithms), your selected interests, and your active contributions (comments, debates, votes, likes)."
                    )}
                  </p>
                  
                  <p>
                    <strong className="text-white font-semibold block">{t("Usage des informations :", "Information Usage:")}</strong>
                    {t(
                      "Ces données sont destinées exclusivement au bon fonctionnement de l'arène de débats bilingue et à la personnalisation thématique de votre page d'accueil. Vos informations ne seront jamais vendues, louées ou cédées à des fins publicitaires à des entreprises tierces.",
                      "This data is used solely to run the bilingual debate arena and personalize your homepage feed. Your information will never be sold, rented, or shared for advertising purposes with third-party companies."
                    )}
                  </p>
                  
                  <p>
                    <strong className="text-white font-semibold block">{t("Sécurité et Hébergement :", "Security & Hosting:")}</strong>
                    {t(
                      "Toutes vos données sont stockées de façon hautement sécurisée au sein de l'infrastructure Cloud de Supabase, protégée par des protocoles d'accès stricts.",
                      "All your data is stored highly securely within the Supabase Cloud infrastructure, protected by strict access control protocols."
                    )}
                  </p>
                </div>
              </section>
              
              <section className="space-y-2 pt-3 border-t border-white/5">
                <h4 className="font-serif text-sm font-bold text-accent uppercase tracking-wider">
                  🤝 2. {t("Charte d'Utilisation & Déontologie", "Terms of Use & Code of Conduct")}
                </h4>
                
                <div className="space-y-1.5 pl-1">
                  <p>
                    {t(
                      "Komentel est une plateforme de débats citoyens bilingue promouvant la liberté d'expression responsable. Afin d'assurer un dialogue sain et constructif, vous vous engagez à respecter les règles suivantes :",
                      "Komentel is a bilingual citizen debate platform promoting responsible free speech. In order to ensure a healthy and constructive dialogue, you agree to respect the following rules:"
                    )}
                  </p>
                  
                  <ul className="list-disc pl-4 space-y-1 text-slate-350">
                    <li>
                      <strong>{t("Courtoisie Obligatoire :", "Mandatory Courtesy:")}</strong>{" "}
                      {t(
                        "Focalisez vos arguments sur les faits et les idées, jamais sur la personne de vos contradicteurs. Les attaques personnelles sont prohibées.",
                        "Focus your arguments on facts and ideas, never on the persona of your opponents. Personal attacks are prohibited."
                      )}
                    </li>
                    <li>
                      <strong>{t("Zéro Discours de Haine :", "Zero Hate Speech:")}</strong>{" "}
                      {t(
                        "Aucun propos injurieux, diffamatoire, raciste, sexiste, homophobe, haineux ou violent ne sera toléré sur la plateforme.",
                        "No abusive, defamatory, racist, sexist, homophobic, hateful, or violent remarks will be tolerated on the platform."
                      )}
                    </li>
                    <li>
                      <strong>{t("Arbitrage Démocratique :", "Democratic Arbitration:")}</strong>{" "}
                      {t(
                        "Les spectateurs peuvent évaluer la pertinence de vos répliques en votant. Les modérateurs humains et les outils d'IA de Komentel peuvent masquer ou signaler des publications non conformes.",
                        "Spectators can evaluate the relevance of your replies by voting. Human moderators and Komentel's AI tools can hide or report non-compliant posts."
                      )}
                    </li>
                  </ul>
                  
                  <p>
                    <strong className="text-white font-semibold block">{t("Sanctions et Suspension :", "Sanctions & Suspensions:")}</strong>
                    {t(
                      "En cas de manquements graves ou répétés à cette charte, l'administration se réserve le droit de restreindre temporairement ou de suspendre définitivement l'accès à votre compte.",
                      "In case of serious or repeated violations of this code, the administration reserves the right to temporarily restrict or permanently terminate your account access."
                    )}
                  </p>
                </div>
              </section>
            </div>
            
            <div className="border-t border-white/5 pt-3 flex justify-end">
              <button
                onClick={() => {
                  setRegTermsAccepted(true);
                  setShowTermsModal(false);
                }}
                className="bg-primary hover:bg-primary-hover hover:scale-105 active:scale-95 text-white text-xs font-bold px-5 py-2 rounded-xl transition-all cursor-pointer shadow-premium"
              >
                ✔️ {t("J'accepte et je ferme", "I Accept & Close")}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="font-serif text-lg text-slate-400 animate-pulse">Chargement de Komentel...</p>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
