import React from 'react';
import { useGame } from '../store/GameContext';
import { PACKS } from '../data/stickers';
import { Coins, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { playSound } from '../utils/audio';

export const ShopScreen: React.FC = () => {
  const { state, buyPack } = useGame();

  return (
    <div className="flex flex-col flex-1 p-4 pb-24 max-w-md mx-auto w-full">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-black text-white italic tracking-tighter uppercase">Loja</h1>
        <div className="flex items-center space-x-2 bg-black/40 px-4 py-2 rounded-full border border-white/5">
          <Coins className="w-5 h-5 text-yellow-400" />
          <span className="font-bold text-yellow-400 text-lg">{state.coins}</span>
        </div>
      </div>

      <div className="space-y-4">
        {PACKS.map((pack) => {
          const canAfford = state.coins >= pack.cost;
          return (
            <div key={pack.id} className="relative glass-panel rounded-2xl overflow-hidden hover:scale-[1.02] transition-transform">
              <div className={`h-28 bg-gradient-to-r ${pack.color} p-4 flex justify-between items-end border-b border-white/10 relative`}>
                <div className="absolute inset-0 bg-black/20 mix-blend-overlay"></div>
                <h3 className="text-white font-black text-2xl w-2/3 leading-tight italic uppercase tracking-tighter relative z-10">{pack.name}</h3>
                <div className="text-white font-bold text-sm bg-black/40 px-3 py-1.5 rounded-lg border border-white/20 relative z-10 backdrop-blur-sm">
                  {pack.stickersCount} un.
                </div>
              </div>
              
              <div className="p-4 flex flex-col justify-between space-y-4">
                <div className="text-xs text-gray-400">
                  <span className="font-bold text-white uppercase tracking-wider text-[10px]">Chances de Drop</span><br/>
                  <span className="mt-1 inline-block">
                    Comum {pack.dropRates.common * 100}% • 
                    Rara {pack.dropRates.rare * 100}% • 
                    Épica {pack.dropRates.epic * 100}% • 
                    <span className="text-yellow-400 font-bold ml-1">Lenda {pack.dropRates.legendary * 100}%</span>
                  </span>
                </div>
                
                <motion.button
                  whileHover={canAfford ? { scale: 1.02 } : {}}
                  whileTap={canAfford ? { scale: 0.98 } : {}}
                  onClick={() => {
                    if (!canAfford) {
                      playSound('click');
                      alert('Moedas insuficientes!');
                      return;
                    }
                    buyPack(pack.id);
                  }}
                  className={`w-full py-4 rounded-xl font-black flex justify-center items-center space-x-2 transition-all uppercase tracking-tighter ${
                    canAfford 
                    ? 'bg-game-green hover:bg-[#00e67a] text-black shadow-[0_0_20px_rgba(0,255,136,0.5)] border border-game-green' 
                    : 'bg-white/5 text-gray-600 cursor-not-allowed border-white/5'
                  }`}
                >
                  <span>{pack.cost}</span>
                  <span>🪙</span>
                </motion.button>
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="mt-8 flex items-start space-x-3 glass-panel p-4 rounded-xl">
        <AlertCircle className="w-6 h-6 flex-shrink-0" />
        <p className="text-xs">Complete missões e resgate prêmios diários na tela inicial para ganhar mais moedas grátis! Não é necessário dinheiro real.</p>
      </div>
    </div>
  );
};
