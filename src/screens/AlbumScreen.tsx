import React, { useState, useMemo } from 'react';
import { useGame } from '../store/GameContext';
import { STICKERS, TEAMS } from '../data/stickers';
import { StickerCard } from '../components/StickerCard';

export const AlbumScreen: React.FC = () => {
  const { state } = useGame();
  const [filter, setFilter] = useState<'all' | 'missing' | 'owned'>('all');
  const [activeTeam, setActiveTeam] = useState<string>(TEAMS[0].id);

  const teamStickers = useMemo(() => {
    return STICKERS.filter((s) => s.team === activeTeam);
  }, [activeTeam]);

  const filteredStickers = useMemo(() => {
    return teamStickers.filter((s) => {
      const owned = (state.inventory[s.id] || 0) > 0;
      if (filter === 'missing') return !owned;
      if (filter === 'owned') return owned;
      return true;
    });
  }, [teamStickers, state.inventory, filter]);

  // Overall progress
  const ownedCount = teamStickers.filter(s => (state.inventory[s.id] || 0) > 0).length;
  const progressPercent = Math.round((ownedCount / teamStickers.length) * 100);

  const getTeamProgress = (teamId: string) => {
    const tStickers = STICKERS.filter(s => s.team === teamId);
    const owned = tStickers.filter(s => (state.inventory[s.id] || 0) > 0).length;
    return Math.round((owned / tStickers.length) * 100);
  };

  return (
    <div className="flex flex-col flex-1 pb-24 max-w-md mx-auto w-full h-[100dvh]">
      {/* Fixed Header */}
      <div className="p-4 glass-panel z-10 sticky top-0 rounded-b-3xl">
        <h1 className="text-2xl font-black text-white mb-4 italic tracking-tighter uppercase">Meu Álbum</h1>
        
        {/* Team Selector List (Horizontal Scroll) */}
        <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4">
          {TEAMS.map((team) => {
            const teamPercent = getTeamProgress(team.id);
            const isComplete = teamPercent === 100;
            return (
              <button
                key={team.id}
                onClick={() => setActiveTeam(team.id)}
                className={`flex-shrink-0 px-4 py-2 rounded-xl font-bold text-sm transition-colors whitespace-nowrap border flex flex-col items-center justify-center relative overflow-hidden ${
                  activeTeam === team.id 
                  ? 'bg-game-green text-black border-game-green shadow-[0_0_15px_rgba(0,255,136,0.3)]' 
                  : isComplete 
                    ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30 shadow-[0_0_10px_rgba(250,204,21,0.1)]'
                    : 'bg-white/5 text-gray-400 border-white/5 hover:bg-white/10'
                }`}
              >
                <span>{team.name} {isComplete && '⭐'}</span>
                <div className={`w-full h-1 mt-1 rounded-full overflow-hidden ${activeTeam === team.id ? 'bg-black/20' : 'bg-black/40'}`}>
                   <div className={`h-full ${activeTeam === team.id ? 'bg-black' : isComplete ? 'bg-yellow-400' : 'bg-game-green'}`} style={{ width: `${teamPercent}%` }} />
                </div>
              </button>
            )
          })}
        </div>

        {/* Filters & Progress */}
        <div className="flex items-center justify-between mt-4">
          <div className="flex bg-black/40 border border-white/5 rounded-lg p-1">
            {(['all', 'missing', 'owned'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors ${
                  filter === f ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-white'
                }`}
              >
                {f === 'all' ? 'Tudo' : f === 'missing' ? 'Faltam' : 'Minhas'}
              </button>
            ))}
          </div>
          <div className="text-right w-24">
            <div className={`text-xs mb-1 text-right font-black ${progressPercent === 100 ? 'text-yellow-400' : 'text-white'}`}>
              {ownedCount}/{teamStickers.length}
            </div>
            <div className="stat-bar">
               <div className={`stat-progress transition-all duration-500 ${progressPercent === 100 ? 'bg-yellow-400 shadow-[0_0_10px_#facc15]' : ''}`} style={{ width: `${progressPercent}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Grid Content */}
      <div className="p-4 flex-1 overflow-y-auto">
        <div className="grid grid-cols-3 gap-3">
          {filteredStickers.map((sticker) => {
            const owned = (state.inventory[sticker.id] || 0) > 0;
            const count = state.inventory[sticker.id] || 0;
            
            return (
              <div key={sticker.id} className="w-full">
                <StickerCard sticker={sticker} isOwned={owned} count={count} />
              </div>
            );
          })}
        </div>
        {filteredStickers.length === 0 && (
          <div className="text-center py-10 text-slate-500">
            Nenhuma figurinha encontrada para este filtro.
          </div>
        )}
      </div>
    </div>
  );
};
