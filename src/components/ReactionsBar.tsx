"use client";

import React, { useState, useRef, useEffect } from "react";
import { useKomentel, ArticleReactions } from "@/context/KomentelContext";
import { ThumbsUp } from "lucide-react";

interface ReactionsBarProps {
  articleId: string;
}

const emojis: { type: keyof ArticleReactions; char: string; label: string; color: string }[] = [
  { type: "like", char: "👍", label: "J'aime", color: "text-blue-600" },
  { type: "love", char: "❤️", label: "J'adore", color: "text-red-500" },
  { type: "bravo", char: "👏", label: "Bravo", color: "text-yellow-500" },
  { type: "surprise", char: "😮", label: "Surprenant", color: "text-purple-500" },
  { type: "sad", char: "😢", label: "Triste", color: "text-indigo-500" },
  { type: "important", char: "🔥", label: "Important", color: "text-orange-500" }
];

export const ReactionsBar: React.FC<ReactionsBarProps> = ({ articleId }) => {
  const { articles, reactToArticle } = useKomentel();
  const [showPopup, setShowPopup] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const article = articles.find(a => a.id === articleId);

  if (!article) return null;

  const currentReactions = article.reactions;
  const userReaction = article.userReaction;

  // Calculate total reactions
  const totalReactionsCount = Object.values(currentReactions).reduce((a, b) => a + b, 0);

  // Get active emojis (those with count > 0) sorted by count descending
  const activeEmojis = emojis
    .filter(e => currentReactions[e.type] > 0)
    .sort((a, b) => currentReactions[b.type] - currentReactions[a.type])
    .slice(0, 3);

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setShowPopup(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setShowPopup(false);
    }, 400); // Small delay to prevent accidental closing
  };

  const handleReactionClick = (type: keyof ArticleReactions) => {
    reactToArticle(articleId, type);
    setShowPopup(false);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const activeUserReaction = emojis.find(e => e.type === userReaction);

  return (
    <div 
      className="relative flex items-center justify-between py-2 border-t border-white/5 mt-3"
      onMouseLeave={handleMouseLeave}
    >
      {/* Left: Current Reactions Summary */}
      <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold h-8">
        {totalReactionsCount > 0 ? (
          <>
            <div className="flex -space-x-1.5 items-center">
              {activeEmojis.map(e => (
                <span 
                  key={e.type} 
                  className="w-5 h-5 rounded-full bg-slate-900 border border-white/10 flex items-center justify-center text-xs shadow-sm"
                  title={`${e.label}: ${currentReactions[e.type]}`}
                >
                  {e.char}
                </span>
              ))}
            </div>
            <span className="text-[11px] text-slate-400 ml-1 font-sans">
              {totalReactionsCount} {totalReactionsCount > 1 ? "réactions" : "réaction"}
            </span>
          </>
        ) : (
          <span className="text-[11px] text-slate-500 font-normal">Soyez le premier à réagir</span>
        )}
      </div>

      {/* Right: Interactive Reaction Trigger Button */}
      <div className="relative">
        
        {/* Hover/Click Glassmorphic Reaction Popup */}
        {showPopup && (
          <div 
            className="absolute bottom-full mb-2 right-0 md:right-auto md:left-1/2 md:-translate-x-1/2 bg-slate-900/90 backdrop-blur-xl border border-white/10 shadow-popover rounded-full py-2 px-3.5 flex gap-3 z-30 animate-in fade-in slide-in-from-bottom-2 duration-200"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            {emojis.map(emoji => (
              <button
                key={emoji.type}
                onClick={() => handleReactionClick(emoji.type)}
                className="hover:scale-130 active:scale-95 transition-transform duration-150 cursor-pointer text-xl relative group/emoji flex items-center justify-center focus:outline-none"
              >
                <span>{emoji.char}</span>
                {/* Tooltip */}
                <span className="absolute -top-8 bg-slate-950 border border-white/5 text-white text-[9px] font-bold py-0.5 px-1.5 rounded opacity-0 group-hover/emoji:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-md">
                  {emoji.label}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Reaction Action Trigger Button */}
        <button
          onMouseEnter={handleMouseEnter}
          onClick={() => handleReactionClick(userReaction || "like")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
            userReaction 
              ? `${activeUserReaction?.color} bg-white/5 border border-white/5` 
              : "text-slate-400 hover:text-white hover:bg-white/5 border border-transparent"
          }`}
        >
          {userReaction ? (
            <>
              <span className="text-sm">{activeUserReaction?.char}</span>
              <span>{activeUserReaction?.label}</span>
            </>
          ) : (
            <>
              <ThumbsUp size={14} className="text-slate-400" />
              <span>J'aime</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
