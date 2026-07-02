"use client";

import React from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useKomentel } from "@/context/KomentelContext";
import { Shield, BookOpen, UserCheck, Scale, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function PrivacyPage() {
  const { language } = useKomentel();

  const t = (frText: string, enText: string) => {
    return language === "FR" ? frText : enText;
  };

  return (
    <div className="min-h-screen flex flex-col bg-background bg-grid-pattern font-sans text-slate-200">
      <Header />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1 w-full relative">
        {/* Soft glowing ambient backgrounds */}
        <div className="absolute top-10 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px] pointer-events-none -z-10"></div>
        <div className="absolute top-40 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-[150px] pointer-events-none -z-10"></div>

        {/* Back Link */}
        <div className="mb-6">
          <Link
            href="/login"
            className="text-xs text-primary hover:underline font-bold flex items-center gap-1.5 uppercase tracking-wider"
          >
            <ArrowLeft size={14} /> {t("Retour à la connexion", "Back to Login")}
          </Link>
        </div>

        {/* Header Section */}
        <div className="text-center space-y-4 mb-12">
          <div className="inline-flex p-3.5 bg-primary/10 border border-primary/20 rounded-2xl text-primary animate-pulse">
            <Scale size={32} />
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-white">
            {t("Politique de Confidentialité & Charte d'Utilisation", "Privacy Policy & Code of Conduct")}
          </h1>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider max-w-xl mx-auto">
            {t(
              "Dernière mise à jour : 2 juillet 2026 · Assurer un espace de dialogue citoyen sécurisé, transparent et constructif.",
              "Last updated: July 2, 2026 · Ensuring a secure, transparent, and constructive space for citizen dialogue."
            )}
          </p>
        </div>

        {/* Content Block */}
        <div className="bg-[#12131C]/60 backdrop-blur-md rounded-3xl border border-white/10 p-6 sm:p-10 shadow-premium space-y-10">
          
          {/* Section 1: Privacy Policy */}
          <section className="space-y-4">
            <div className="flex items-center gap-2.5 pb-2 border-b border-white/5">
              <Shield className="text-primary shrink-0" size={22} />
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-white">
                {t("1. Politique de Confidentialité", "1. Privacy Policy")}
              </h2>
            </div>

            <div className="space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed">
              <div className="space-y-1">
                <h3 className="font-bold text-white">{t("🛡️ Données collectées :", "🛡️ Collected Data:")}</h3>
                <p>
                  {t(
                    "Nous recueillons uniquement les informations indispensables à votre inscription et à l'interaction sur Komentel. Cela comprend : votre adresse e-mail, votre mot de passe (chiffré de manière sécurisée), vos centres d'intérêt choisis pour personnaliser votre flux d'actualités, ainsi que l'ensemble de vos contributions (débats initiés, répliques rédigées, votes de soutien et appréciations).",
                    "We collect only the essential information needed to operate your Komentel account. This includes: your email address, your password (securely encrypted), your selected interests to personalize your news feed, and all your contributions (started debates, written replies, supportive votes, and likes)."
                  )}
                </p>
              </div>

              <div className="space-y-1">
                <h3 className="font-bold text-white">{t("🤝 Utilisation des informations :", "🤝 Usage of Information:")}</h3>
                <p>
                  {t(
                    "Ces données servent uniquement au bon fonctionnement de l'arène de débats bilingue (1v1) et à l'adaptation de votre fil d'actualités en fonction de vos catégories préférées. Komentel ne revend, ne loue, ni ne partage jamais vos données personnelles à des tiers à des fins publicitaires ou commerciales.",
                    "This data is used solely for the proper operation of the bilingual debate arena (1v1) and the personalization of your news feed based on your preferred categories. Komentel never sells, rents, or shares your personal data with third parties for advertising or commercial purposes."
                  )}
                </p>
              </div>

              <div className="space-y-1">
                <h3 className="font-bold text-white">{t("🔐 Sécurité & Hébergement :", "🔐 Security & Hosting:")}</h3>
                <p>
                  {t(
                    "Toutes vos données sont stockées de façon sécurisée au sein de l'infrastructure Cloud de Supabase, protégée par des protocoles d'accès stricts. Nous appliquons les meilleures pratiques de sécurité pour prévenir tout accès non autorisé, divulgation ou altération de vos données.",
                    "All your data is stored securely within the Supabase Cloud infrastructure, protected by strict access control protocols. We implement industry-standard security practices to prevent unauthorized access, disclosure, or alteration of your data."
                  )}
                </p>
              </div>

              <div className="space-y-1">
                <h3 className="font-bold text-white">{t("⚖️ Vos droits (RGPD) :", "⚖️ Your Rights (GDPR):")}</h3>
                <p>
                  {t(
                    "Conformément à la réglementation européenne, vous disposez d'un droit d'accès, de rectification et de suppression de l'ensemble de vos données. Pour exercer ce droit ou supprimer définitivement votre compte, vous pouvez contacter l'administration à tout moment.",
                    "In compliance with European regulations, you have the right to access, rectify, and delete all your data. To exercise this right or permanently delete your account, you can contact the administration at any time."
                  )}
                </p>
              </div>
            </div>
          </section>

          {/* Section 2: Code of Conduct */}
          <section className="space-y-4">
            <div className="flex items-center gap-2.5 pb-2 border-b border-white/5">
              <BookOpen className="text-accent shrink-0" size={22} />
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-white">
                {t("2. Charte d'Utilisation & Déontologie", "2. Terms of Use & Code of Conduct")}
              </h2>
            </div>

            <div className="space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed">
              <p>
                {t(
                  "Komentel est un espace public sénégalais et panafricain de débats citoyens. Afin d'assurer un dialogue constructif et d'éviter que le débat ne devienne un affrontement hostile, vous vous engagez à respecter les règles fondamentales suivantes :",
                  "Komentel is a Senegalese and Pan-African public space for citizen debates. In order to ensure a constructive dialogue and prevent the debate from becoming a hostile confrontation, you agree to respect the following fundamental rules:"
                )}
              </p>

              <div className="space-y-3 pl-2">
                <div className="flex gap-2">
                  <span className="text-primary font-bold">✔️</span>
                  <div>
                    <strong className="text-white block">{t("Respect & Courtoisie :", "Respect & Courtesy:")}</strong>
                    {t(
                      "Les débats doivent être axés sur les faits, les arguments et les idées. Les attaques ad hominem (attaquer la personne plutôt que l'argument) et le mépris sont interdits.",
                      "Debates must focus on facts, arguments, and ideas. Ad hominem attacks (attacking the person rather than the argument) and contempt are prohibited."
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  <span className="text-primary font-bold">✔️</span>
                  <div>
                    <strong className="text-white block">{t("Interdiction absolue de la haine :", "Absolute Ban on Hate Speech:")}</strong>
                    {t(
                      "Aucun propos violent, diffamatoire, raciste, homophobe, sexiste, haineux ou incitant à la discorde ethnique ne sera toléré.",
                      "No violent, defamatory, racist, homophobic, sexist, hateful, or ethnically divisive remarks will be tolerated."
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  <span className="text-primary font-bold">✔️</span>
                  <div>
                    <strong className="text-white block">{t("Arbitrage transparent :", "Transparent Arbitration:")}</strong>
                    {t(
                      "Les votes du public récompensent la clarté et l'intelligence de vos répliques. Les publications signalées par les utilisateurs font l'objet d'une modération automatique par IA ou humaine.",
                      "Public votes reward the clarity and intelligence of your replies. User-flagged contributions are subject to automatic AI or human moderation."
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-1 pt-2">
                <h3 className="font-bold text-white">{t("🚫 Modération & Sanctions :", "🚫 Moderation & Sanctions:")}</h3>
                <p>
                  {t(
                    "Tout message ne respectant pas cette charte sera modéré et masqué automatiquement. En cas de récidive ou de comportement gravement préjudiciable, l'administration se réserve le droit de restreindre temporairement votre accès ou de bannir définitivement votre compte de la plateforme.",
                    "Any message violating this charter will be moderated and hidden automatically. In case of repeated offences or highly detrimental behavior, the administration reserves the right to temporarily restrict your access or permanently ban your account from the platform."
                  )}
                </p>
              </div>
            </div>
          </section>

          {/* Section 3: Engagement */}
          <section className="bg-primary/10 border border-primary/20 rounded-2xl p-6 text-center space-y-3">
            <UserCheck className="text-primary mx-auto" size={28} />
            <h3 className="font-serif text-base font-bold text-white">
              {t("Votre engagement citoyen", "Your Citizen Engagement")}
            </h3>
            <p className="text-xs text-slate-300 max-w-lg mx-auto">
              {t(
                "En créant un compte sur Komentel, vous devenez membre d'une communauté engagée pour l'information, le pluralisme et le débat d'idées de qualité. Merci de participer activement et respectueusement.",
                "By creating an account on Komentel, you join a community dedicated to information, pluralism, and high-quality debate. Thank you for participating actively and respectfully."
              )}
            </p>
          </section>

        </div>
      </main>

      <Footer />
    </div>
  );
}
