import React from 'react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { Rarity, Sticker } from '../types';
import { playSound } from '../utils/audio';
import { TEAMS } from '../data/stickers';
import { Trophy, Star, Shield } from 'lucide-react';
import { usePlayerImage } from '../hooks/usePlayerImage';

interface StickerCardProps {
  sticker: Sticker;
  isOwned?: boolean;
  count?: number;
  isNew?: boolean;
  className?: string;
  onClick?: () => void;
  hidden?: boolean;
}

const RARITY_COLORS: Record<Rarity, string> = {
  common: 'from-gray-700 to-gray-800 border-gray-600 shadow-gray-500/20 text-white',
  rare: 'from-blue-600 to-blue-800 border-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.5)] text-white',
  epic: 'from-fuchsia-700 to-purple-900 border-fuchsia-400 shadow-[0_0_25px_rgba(168,85,247,0.6)] text-white',
  legendary: 'bg-gradient-to-br from-[#FFD700] to-[#FFA500] border-yellow-200 shadow-[0_0_25px_rgba(255,215,0,0.4)] text-black',
};

const GLOW_EFFECTS: Record<Rarity, string> = {
  common: '',
  rare: 'neon-border',
  epic: 'animate-pulse',
  legendary: '',
};

export const StickerCard: React.FC<StickerCardProps> = ({
  sticker,
  isOwned = true,
  count = 1,
  isNew = false,
  className,
  onClick,
  hidden = false,
}) => {
  const teamInfo = TEAMS.find(t => t.id === sticker.team);
  const realImage = usePlayerImage(sticker.name);
  const avatarUrl = realImage || `https://api.dicebear.com/7.x/micah/svg?seed=${sticker.name}&backgroundColor=transparent`;

  if (hidden) {
    return (
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={cn(
          "relative w-full aspect-[2/3] rounded-xl flex flex-col items-center justify-center p-1",
          "bg-gradient-to-br from-slate-900 to-slate-800 border-2 border-slate-700 cursor-pointer shadow-lg",
          className
        )}
        onClick={onClick}
      >
        <div className="absolute inset-2 border border-slate-700/50 rounded-lg flex items-center justify-center bg-slate-800/80 backdrop-blur-sm">
          <Trophy className="w-12 h-12 text-slate-600 mb-4 opacity-50" />
          <span className="text-slate-500 font-bold tracking-widest absolute bottom-4">COPA 26</span>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      whileHover={{ y: -5, scale: 1.02, rotateY: 5 }}
      whileTap={{ scale: 0.98 }}
      onHoverStart={() => playSound('hover')}
      onClick={() => {
        if (onClick) onClick();
      }}
      initial={isNew ? { scale: 0, rotateY: 180 } : undefined}
      animate={isNew ? { scale: 1, rotateY: 0 } : undefined}
      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
      className={cn(
        "relative w-full aspect-[2/3] rounded-xl flex flex-col justify-between p-2 overflow-hidden",
        "bg-gradient-to-br border-[1px] select-none cursor-pointer transform-gpu preserve-3d transition-all duration-300",
        isOwned ? RARITY_COLORS[sticker.rarity] : 'from-slate-800 to-slate-900 border-slate-700 text-slate-500 grayscale opacity-70',
        isOwned && GLOW_EFFECTS[sticker.rarity],
        isOwned && sticker.rarity === 'legendary' && 'card-shine',
        className
      )}
    >
      {/* Background Pattern for High Rarities */}
      {(sticker.rarity === 'epic' || sticker.rarity === 'legendary') && isOwned && (
        <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] mix-blend-overlay"></div>
      )}
      
      {/* Glossy reflection overlay */}
      {isOwned && (
         <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none transform -translate-x-full hover:translate-x-full transition-transform duration-1000"></div>
      )}

      {/* Top Header */}
      <div className="flex justify-between items-start z-10">
        <div className={cn("px-2 py-0.5 rounded text-xs font-bold shadow-sm", teamInfo?.color || 'bg-slate-500', isOwned ? 'text-white' : 'text-slate-400')}>
          {teamInfo?.name.substring(0, 3).toUpperCase()}
        </div>
        <div className="w-6 h-6 rounded-full bg-black/20 flex items-center justify-center font-bold text-xs backdrop-blur-sm">
          {sticker.number}
        </div>
      </div>

      {/* Center Image Placeholder / Art */}
      <div className="flex-1 flex flex-col items-center justify-center z-10 pt-2 pb-4 relative">
        <div className="w-16 h-16 rounded-full border-2 border-white/20 overflow-hidden bg-white/5 relative z-10 shadow-lg">
          <img 
            src={avatarUrl} 
            alt={sticker.name}
            className="w-full h-full object-cover"
            crossOrigin={realImage ? "anonymous" : undefined}
            onError={(e) => {
              if (realImage) {
                // fallback if wikipedia image fails to load (e.g. 404 or cors)
                (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/micah/svg?seed=${sticker.name}&backgroundColor=transparent`;
              }
            }}
            referrerPolicy="no-referrer"
          />
        </div>
        {/* Rarity decorators */}
        {sticker.rarity === 'legendary' && (
          <Star className="w-6 h-6 absolute -bottom-1 text-[#FFD700] drop-shadow-md z-20" fill="currentColor" />
        )}
        {sticker.rarity === 'epic' && (
           <Shield className="w-6 h-6 absolute -bottom-1 text-fuchsia-400 drop-shadow-md z-20" fill="currentColor" />
        )}
      </div>

      {/* Bottom Name Plate */}
      <div className="z-10 bg-black/30 backdrop-blur-md rounded-lg p-2 text-center border border-white/10">
        <h3 className="font-bold text-sm tracking-wide leading-tight truncate">{sticker.name}</h3>
        <p className="text-[10px] font-medium opacity-80 mt-0.5">{sticker.position}</p>
      </div>

      {/* Badges */}
      {isOwned && count > 1 && (
        <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg border-2 border-white z-20">
          x{count}
        </div>
      )}
      {isNew && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-green-500/90 text-white font-black px-4 py-1 rounded shadow-xl rotate-12 z-20 animate-pulse">
          NOVO!
        </div>
      )}
    </motion.div>
  );
};
