import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { useGame } from '../store/GameContext';
import { STICKERS } from '../data/stickers';
import { StickerCard } from '../components/StickerCard';
import { playSound } from '../utils/audio';
import { cn } from '../lib/utils';

interface PackOpeningProps {
  packId: string;
  onClose: () => void;
}

export const PackOpeningScreen: React.FC<PackOpeningProps> = ({ packId, onClose }) => {
  const { openPack } = useGame();
  const [phase, setPhase] = useState<'intro' | 'opening' | 'revealing' | 'done'>('intro');
  const [cards, setCards] = useState<string[]>([]);
  const [revealedIndex, setRevealedIndex] = useState(-1);

  const startOpening = () => {
    playSound('rip');
    setPhase('opening');
    
    // Simulate API / Pack Generation delay
    setTimeout(() => {
      const generated = openPack(packId);
      setCards(generated);
      setPhase('revealing');
    }, 1200);
  };

  const revealNext = () => {
    if (revealedIndex < cards.length - 1) {
      const nextIdx = revealedIndex + 1;
      setRevealedIndex(nextIdx);
      
      const sticker = STICKERS.find(s => s.id === cards[nextIdx]);
      if (sticker) {
        if (sticker.rarity === 'legendary' || sticker.rarity === 'epic') {
          playSound('legendary');
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            colors: sticker.rarity === 'legendary' ? ['#FDE047', '#EAB308', '#FFFFFF'] : ['#D946EF', '#9333EA', '#FFFFFF']
          });
        } else {
          playSound('pop');
        }
      }
    } else {
      setPhase('done');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950/95 flex flex-col items-center justify-center p-4">
      <AnimatePresence mode="wait">
        {phase === 'intro' && (
          <motion.div
            key="pack"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.2, opacity: 0, y: -50 }}
            className="flex flex-col items-center cursor-pointer group"
            onClick={startOpening}
          >
            <div className="w-48 aspect-[2/3] bg-gradient-to-br from-gray-800 to-black rounded-3xl shadow-2xl shadow-game-green/20 border-4 border-white/10 flex items-center justify-center transition-transform group-hover:scale-105 relative overflow-hidden">
               <div className="absolute -inset-4 bg-game-green/20 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
               <div className="w-16 h-16 mb-6 bg-gradient-to-t from-game-green to-emerald-300 rounded-full flex items-center justify-center shadow-lg shadow-game-green/30 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-[80%]">
                 <span className="text-3xl text-black">📦</span>
               </div>
              <h2 className="text-white font-black text-2xl rotate-[-10deg] italic uppercase relative z-10 top-10">RASGUE!</h2>
               <div className="h-1.5 w-full bg-gradient-to-r from-game-green via-white to-game-green absolute bottom-6"></div>
            </div>
            <p className="text-game-green/70 font-bold uppercase tracking-widest text-xs mt-6 animate-pulse">Toque no pacote para abrir</p>
          </motion.div>
        )}

        {phase === 'opening' && (
          <motion.div
            key="opening"
            animate={{
              rotate: [0, -5, 5, -5, 5, 0],
              y: [0, -20, 0, -20, 0],
              scale: [1, 1.1, 1, 1.1, 1]
            }}
            transition={{ duration: 1 }}
            className="w-48 aspect-[2/3] bg-gradient-to-br from-gray-800 to-black rounded-3xl shadow-2xl border-4 border-white/10 flex items-center justify-center neon-border relative overflow-hidden"
          >
            <div className="w-full h-2 bg-white/20 absolute top-10 transform -rotate-12" />
          </motion.div>
        )}

        {phase === 'revealing' && (
          <motion.div
            key="revealing"
            className="flex flex-col items-center w-full max-w-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <p className="text-white mb-8 font-medium">Toque para revelar</p>
            
            <div className="relative w-64 aspect-[2/3]">
              {cards.map((cardId, index) => {
                const sticker = STICKERS.find((s) => s.id === cardId)!;
                const isRevealed = index <= revealedIndex;
                const isCurrent = index === revealedIndex + 1;

                if (index > revealedIndex + 1) return null; // Hide future cards

                return (
                  <div
                    key={`${cardId}-${index}`}
                    className={cn(
                      "absolute inset-0 transition-transform duration-500",
                      isRevealed ? "pointer-events-none opacity-0 scale-90 translate-y-8" : "z-10"
                    )}
                    onClick={isCurrent ? revealNext : undefined}
                  >
                    {!isRevealed ? (
                      <StickerCard sticker={sticker} hidden={true} />
                    ) : (
                      <StickerCard sticker={sticker} isNew={true} />
                    )}
                  </div>
                );
              })}
              
              {/* Show the most recently revealed card clearly */}
              {revealedIndex >= 0 && (
                <div className="absolute inset-0 z-0">
                  <StickerCard sticker={STICKERS.find(s => s.id === cards[revealedIndex])!} isNew={true} count={1} />
                </div>
              )}
            </div>
            
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: revealedIndex >= 0 ? 1 : 0 }}
              className="mt-12 px-8 py-3 bg-white text-black rounded-full font-bold shadow-lg uppercase tracking-widest text-sm hover:scale-105 transition-transform"
              onClick={revealNext}
            >
              {revealedIndex === cards.length - 1 ? 'Concluir' : 'Próxima'}
            </motion.button>
          </motion.div>
        )}

        {phase === 'done' && (
          <motion.div
            key="done"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center w-full max-w-md glass-panel p-6 rounded-2xl neon-border"
          >
            <h2 className="text-2xl font-black text-white mb-6 uppercase italic tracking-tighter">Resumo do Pacote</h2>
            <div className="flex flex-wrap justify-center gap-3 mb-8">
              {cards.map((id, i) => (
                <div key={i} className="w-20">
                  <StickerCard sticker={STICKERS.find(s => s.id === id)!} />
                </div>
              ))}
            </div>
            <button
              onClick={onClose}
              className="w-full py-4 bg-game-green hover:bg-[#00e67a] text-black rounded-xl font-black text-lg transition-colors uppercase tracking-tighter shadow-[0_0_20px_rgba(0,255,136,0.5)] border border-game-green"
            >
              Voltar ao Início
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
