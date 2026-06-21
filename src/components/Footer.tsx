"use client";

import React from "react";
import Link from "next/link";
import { useKomentel } from "@/context/KomentelContext";

export const Footer: React.FC = () => {
  const { language } = useKomentel();

  const t = (frText: string, enText: string) => {
    return language === "FR" ? frText : enText;
  };

  return (
    <footer className="bg-slate-950 text-slate-400 w-full py-12 border-t border-white/5 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="font-serif text-2xl font-bold tracking-tight text-white">
          KOMENTEL
        </div>
        <div className="text-xs text-slate-500 font-sans">
          © {new Date().getFullYear()} Komentel. {t("\"L'information vérifiée. Le débat est à vous.\"", "\"Verified news. The debate is yours.\"")}
        </div>
        <nav className="flex flex-wrap gap-6 justify-center">
          <Link href="/" className="text-xs text-slate-400 hover:text-white transition-colors">
            {t("À propos", "About")}
          </Link>
          <Link href="/" className="text-xs text-slate-400 hover:text-white transition-colors">
            {t("Charte déontologique", "Ethics Charter")}
          </Link>
          <Link href="/" className="text-xs text-slate-400 hover:text-white transition-colors">
            {t("Données personnelles (CDP)", "Privacy Policy (CDP)")}
          </Link>
          <Link href="/" className="text-xs text-slate-400 hover:text-white transition-colors">
            {t("Mentions légales", "Legal Notice")}
          </Link>
          <Link href="/" className="text-xs text-slate-400 hover:text-white transition-colors">
            {t("Contact", "Contact")}
          </Link>
        </nav>
      </div>
    </footer>
  );
};
