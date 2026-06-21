"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useKomentel } from "@/context/KomentelContext";
import { Bell, Search, ShieldAlert, Award, FileText, Check, Sun, Moon } from "lucide-react";

export const Header: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { 
    user, 
    setUser, 
    notifications, 
    dismissNotification, 
    searchQuery, 
    setSearchQuery,
    logoutUser,
    theme,
    toggleTheme,
    registeredUsers,
    language,
    enableNotifications
  } = useKomentel();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const unreadNotificationsCount = notifications.filter(n => !n.read).length;

  const t = (frText: string, enText: string) => {
    return language === "FR" ? frText : enText;
  };



  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    if (pathname !== "/") {
      router.push("/");
    }
  };

  return (
    <header className="bg-slate-950/60 backdrop-blur-md sticky top-0 z-50 border-b border-white/10 shadow-premium">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Left: Brand Logo & Main Nav */}
        <div className="flex items-center gap-8">
          <Link 
            href="/" 
            className={`font-serif text-2xl font-bold tracking-tight transition-colors ${
              theme === "light" 
                ? "text-blue-600 hover:text-blue-600" 
                : "text-white hover:opacity-80 hover:text-white"
            }`}
          >
            KOMENTEL
          </Link>
          <nav className="hidden xl:flex gap-6 items-center">
            <Link 
              href="/?category=Toutes" 
              className={`font-sans text-[11px] font-bold tracking-wider uppercase transition-colors py-1 ${
                pathname === "/" 
                  ? "text-primary" 
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {t("Accueil", "Home")}
            </Link>
            <Link 
              href="/?category=Actualités" 
              className="font-sans text-[11px] font-bold tracking-wider uppercase text-slate-400 hover:text-white transition-colors py-1"
            >
              {t("Actualités", "News")}
            </Link>
            <Link 
              href="/?category=Sport" 
              className="font-sans text-[11px] font-bold tracking-wider uppercase text-slate-400 hover:text-white transition-colors py-1"
            >
              {t("Sport", "Sports")}
            </Link>
            <Link 
              href="/?category=Santé" 
              className="font-sans text-[11px] font-bold tracking-wider uppercase text-slate-400 hover:text-white transition-colors py-1"
            >
              {t("Santé", "Health")}
            </Link>
            <Link 
              href="/?category=Éducation" 
              className="font-sans text-[11px] font-bold tracking-wider uppercase text-slate-400 hover:text-white transition-colors py-1"
            >
              {t("Éducation", "Education")}
            </Link>
            <Link 
              href="/?category=Technologie" 
              className="font-sans text-[11px] font-bold tracking-wider uppercase text-slate-400 hover:text-white transition-colors py-1"
            >
              {t("Tech", "Tech")}
            </Link>
            <Link 
              href="/?category=Culture" 
              className="font-sans text-[11px] font-bold tracking-wider uppercase text-slate-400 hover:text-white transition-colors py-1"
            >
              {t("Culture", "Culture")}
            </Link>
            {user?.role === "JOURNALIST" && (
              <Link 
                href="/journalist" 
                className={`font-sans text-[11px] font-bold tracking-wider uppercase transition-colors flex items-center gap-1.5 py-1 ${
                  pathname.startsWith("/journalist") 
                    ? "text-primary border-b border-primary" 
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <FileText size={13} className="text-slate-400" /> {t("Rédaction", "Editor")}
              </Link>
            )}
            {user?.role === "ADMIN" && (
              <Link 
                href="/admin" 
                className={`font-sans text-[11px] font-bold tracking-wider uppercase transition-colors flex items-center gap-1.5 py-1 ${
                  pathname.startsWith("/admin") 
                    ? "text-primary border-b border-primary" 
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <ShieldAlert size={13} className="text-slate-400" /> {t("Modération", "Admin")}
              </Link>
            )}
          </nav>
        </div>

        {/* Center/Right: Search, Notifications, User Menu */}
        <div className="flex items-center gap-4">
          
          {/* Search bar connected to Context state */}
          <div className="relative hidden sm:block">
            <input 
              type="text" 
              placeholder={t("Rechercher actualités, sujets...", "Search news, topics...")}
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-56 lg:w-60 bg-white/5 border border-white/10 rounded-full py-1.5 pl-9 pr-4 text-xs text-white placeholder-slate-500 focus:bg-white/10 focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all"
            />
            <Search size={14} className="absolute left-3 top-2.5 text-slate-500" />
          </div>
          {/* Theme Toggle Trigger */}
          <button 
            onClick={toggleTheme}
            className="p-1.5 rounded-full hover:bg-white/5 text-slate-400 hover:text-white transition-colors focus:outline-none"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* Notifications Trigger */}
          <div className="relative">
            <button 
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowProfileMenu(false);
              }}
              className="p-1.5 rounded-full hover:bg-white/5 text-slate-400 hover:text-white transition-colors relative focus:outline-none"
            >
              <Bell size={18} />
              {enableNotifications && unreadNotificationsCount > 0 && (
                <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-accent text-[9px] font-bold text-white rounded-full flex items-center justify-center">
                  {unreadNotificationsCount}
                </span>
              )}
            </button>

            {/* Notifications Menu */}
            {showNotifications && (
              <div className="absolute right-0 mt-3 w-80 bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-popover z-50 py-2">
                {!user ? (
                  <div className="px-4 py-6 text-center text-xs text-slate-400">
                    <p className="mb-3">{t("Connectez-vous pour voir vos notifications.", "Please sign in to view your notifications.")}</p>
                    <Link 
                      href="/login"
                      onClick={() => setShowNotifications(false)}
                      className="inline-block bg-primary hover:bg-primary-hover text-white text-[10px] font-bold tracking-wider uppercase px-4 py-2 rounded-full transition-colors"
                    >
                      {t("Se connecter", "Sign in")}
                    </Link>
                  </div>
                ) : !enableNotifications ? (
                  <div className="px-4 py-6 text-center text-xs text-slate-500">
                    {t("Notifications désactivées dans les réglages du portail", "Notifications disabled in portal settings")}
                  </div>
                ) : (
                  <>
                    <div className="px-4 py-2 border-b border-white/5 flex justify-between items-center">
                      <h3 className="font-sans font-semibold text-xs text-slate-200">{t("Notifications", "Notifications")}</h3>
                      <span className="text-[10px] text-accent font-bold">{unreadNotificationsCount} {t("nouvelles", "new")}</span>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="px-4 py-6 text-center text-xs text-slate-500">
                          {t("Aucune notification", "No notifications")}
                        </div>
                      ) : (
                        notifications.map(notif => (
                          <div key={notif.id} className="px-4 py-3 hover:bg-white/5 border-b border-white/5 last:border-0 flex flex-col gap-1 relative">
                            <Link 
                              href={notif.link}
                              onClick={() => {
                                dismissNotification(notif.id);
                                setShowNotifications(false);
                              }}
                              className="text-[11px] text-slate-300 hover:text-primary leading-snug pr-4"
                            >
                              {notif.type === "DUEL_CHALLENGE" && "⚔️ "}
                              {notif.type === "DUEL_ACCEPT" && "🔥 "}
                              {notif.text}
                            </Link>
                            <button 
                              onClick={() => dismissNotification(notif.id)}
                              className="absolute top-2 right-2 text-slate-500 hover:text-slate-350 text-sm"
                            >
                              ×
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* User Profile and Role Switcher Dropdown */}
          <div className="relative">
            {user ? (
              <>
                <button 
                  onClick={() => {
                    setShowProfileMenu(!showProfileMenu);
                    setShowNotifications(false);
                  }}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-full hover:bg-white/5 border border-white/10 transition-colors text-slate-300"
                >
                  <div className="w-7 h-7 rounded-full bg-primary/20 text-white flex items-center justify-center font-bold text-[10px] uppercase border border-primary/30">
                    {user.name.slice(0, 2)}
                  </div>
                  <div className="text-left hidden lg:block pr-1">
                    <p className="text-[11px] font-bold leading-none text-slate-200">{user.name}</p>
                    <p className="text-[9px] text-slate-400 capitalize leading-none mt-0.5">
                      {user.role.toLowerCase()}
                    </p>
                  </div>
                </button>

                {/* Profile Dropdown Menu */}
                {showProfileMenu && (
                  <div className="absolute right-0 mt-3 w-72 bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-popover z-50 py-2">
                    
                    {/* User details */}
                    <div className="px-4 py-3 border-b border-white/5">
                      <p className="font-sans font-semibold text-xs text-slate-250">{user.name}</p>
                      <p className="text-[10px] text-slate-405">{user.email}</p>
                      {user.role !== "ADMIN" && (
                        <div className="mt-2 py-1 px-2 bg-white/5 rounded-lg flex items-center justify-between text-[11px] text-slate-400 border border-white/5">
                          <span className="flex items-center gap-1 text-[10px]"><Award size={12} className="text-accent" /> {t("Duelliste", "Duelist")}</span>
                          <span className="font-bold text-slate-200">
                            {user.duelsStats.wins}V - {user.duelsStats.losses}D ({user.duelsStats.ratio}%)
                          </span>
                        </div>
                      )}
                    </div>



                    {/* Footer action */}
                    <div className="px-4 pt-2 pb-1">
                      <button 
                        onClick={() => {
                          logoutUser();
                          setShowProfileMenu(false);
                        }}
                        className="w-full text-center text-xs text-slate-400 hover:text-accent font-medium py-1"
                      >
                        {t("Se déconnecter", "Sign out")}
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <Link 
                href="/login"
                className="font-sans text-[11px] font-bold tracking-wider uppercase bg-primary hover:bg-primary-hover !text-white px-4 py-2 rounded-full transition-colors shadow-premium inline-block"
              >
                {t("Se connecter", "Sign in")}
              </Link>
            )}
          </div>

        </div>

      </div>
    </header>
  );
};
