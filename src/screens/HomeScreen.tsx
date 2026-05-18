import React, { useState, useEffect } from 'react';
import { useGame } from '../store/GameContext';
import { STICKERS, PACKS } from '../data/stickers';
import { PackOpeningScreen } from './PackOpeningScreen';
import { Coins, PackageOpen, Award, CheckCircle2, Zap } from 'lucide-react';
import { motion } from 'motion/react';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

interface HomeScreenProps {
  onOpenProfile: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ onOpenProfile }) => {
  const { state, claimDailyReward, buyPack, user } = useGame();
  const [openingPack, setOpeningPack] = useState<string | null>(null);
  const [topUsers, setTopUsers] = useState<any[]>([]);

  useEffect(() => {
    const fetchTop = async () => {
      try {
        const q = query(collection(db, 'users'), orderBy('xp', 'desc'), limit(3));
        const res = await getDocs(q);
        const users: any[] = [];
        res.forEach(d => users.push({ id: d.id, ...d.data() }));
        setTopUsers(users);
      } catch (err) {
        console.error("Failed to fetch top users", err);
      }
    };
    fetchTop();
  }, []);

  const totalCollected = Object.keys(state.inventory).length;
  const completionPercentage = Math.round((totalCollected / STICKERS.length) * 100);

  const msInDay = 1000 * 60 * 60 * 24;
  const canClaim = !state.lastDailyReward || Date.now() - state.lastDailyReward > msInDay;

  const getCompletionOfUser = (inv: any = {}) => {
    return Math.round((Object.keys(inv).length / STICKERS.length) * 100);
  };

  if (openingPack) {
    return <PackOpeningScreen packId={openingPack} onClose={() => setOpeningPack(null)} />;
  }

  return (
    <div className="flex flex-col flex-1 p-4 space-y-6 pb-24 max-w-md mx-auto w-full">
      {/* Header Profile */}
      <div className="flex items-center justify-between glass-panel rounded-2xl px-4 py-4 cursor-pointer hover:bg-white/5 transition-colors" onClick={onOpenProfile}>
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-full border-2 border-game-green p-0.5 pointer-events-none">
            <div className="w-full h-full bg-slate-800 rounded-full flex items-center justify-center font-bold text-lg text-white shadow-inner">
              {state.level}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Nível {state.level}</div>
            <div className="text-lg font-extrabold text-white">{user?.displayName || 'COLECIONADOR'}</div>
            <div className="text-[10px] text-gray-500">{state.xp} XP</div>
          </div>
        </div>
        <div className="flex flex-col items-end">
          <div className="text-xs text-gray-400 uppercase mb-1">Moedas</div>
          <div className="flex items-center text-yellow-400 font-bold text-lg">
            <span className="mr-1">🪙</span> {state.coins}
          </div>
        </div>
      </div>

      {/* Live Event Banner */}
      <motion.div 
        whileHover={{ scale: 1.02 }}
        className="relative overflow-hidden rounded-2xl border-2 border-blue-500/50 shadow-[0_0_20px_rgba(59,130,246,0.2)] bg-gradient-to-br from-blue-900 to-indigo-900"
      >
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
        <div className="p-5 relative z-10">
          <div className="flex items-center justify-between mb-3">
             <div className="flex items-center space-x-2">
               <Zap className="w-5 h-5 text-blue-400 animate-pulse" />
               <span className="text-xs font-bold text-blue-300 uppercase tracking-widest">Evento Especial</span>
             </div>
             <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded animate-pulse">AO VIVO</span>
          </div>
          <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter mb-2">Aquecimento: Final 2026</h2>
          <p className="text-blue-200 text-sm mb-4">Adquira o pacote exclusivo do evento contendo estrelas que já brilharam em finais.</p>
          
          <button 
             onClick={() => {
               const eventPack = PACKS.find(p => p.id === 'pack_event_final');
               if (state.coins >= (eventPack?.cost || 800)) {
                 buyPack('pack_event_final');
                 setOpeningPack('pack_event_final');
               } else {
                 alert('Moedas insuficientes!');
               }
             }}
             className="w-full py-3 bg-blue-500 hover:bg-blue-400 text-white font-black text-sm uppercase tracking-wider rounded-xl shadow-lg transition-colors flex items-center justify-center space-x-2"
          >
             <span>Comprar Pacote do Evento (800 🪙)</span>
          </button>
        </div>
      </motion.div>

      {/* Progress Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="glass-panel rounded-2xl p-4 text-center neon-border hover:bg-white/5 transition-all">
          <Award className="w-8 h-8 text-game-green mx-auto mb-2 drop-shadow-[0_0_10px_rgba(0,255,136,0.5)]" />
          <div className="text-2xl font-black text-white">{completionPercentage}%</div>
          <div className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold mt-1">Status do Álbum</div>
        </div>
        <div className="glass-panel rounded-2xl p-4 text-center hover:bg-white/5 transition-all">
          <CheckCircle2 className="w-8 h-8 text-cyan-400 mx-auto mb-2 drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]" />
          <div className="text-2xl font-black text-white">{totalCollected} <span className="text-xs font-normal text-gray-500">/ {STICKERS.length}</span></div>
          <div className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold mt-1">Figurinhas</div>
        </div>
      </div>

      {/* Daily Reward */}
      {canClaim && (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={claimDailyReward}
          className="bg-gradient-to-r from-yellow-500 to-amber-600 rounded-2xl p-4 flex items-center justify-between text-black shadow-[0_0_20px_rgba(250,204,21,0.3)] neon-border"
        >
          <div className="text-left">
            <h3 className="font-bold text-lg uppercase tracking-tighter">Recompensa Diária!</h3>
            <p className="text-yellow-900 font-medium text-sm">Resgate 200 moedas grátis</p>
          </div>
          <span className="text-3xl animate-bounce">🎁</span>
        </motion.button>
      )}

      {/* Quick Actions (Inventory Packs) */}
      <div>
        <h3 className="text-gray-400 font-bold text-xs uppercase tracking-tighter mb-4 flex items-center">
          <PackageOpen className="w-4 h-4 mr-2 text-game-green" /> Meus Pacotes
        </h3>
        
        {Object.entries(state.packs).filter(([_, count]) => (count as number) > 0).length === 0 ? (
          <div className="glass-panel rounded-xl p-6 text-center border-dashed border-white/20">
            <p className="text-gray-400 text-sm">Você não tem pacotes no momento.</p>
            <p className="text-gray-500 text-xs mt-1">Vá até a loja para adquirir mais!</p>
          </div>
        ) : (
          <div className="flex flex-col space-y-3">
            {Object.entries(state.packs).map(([packId, count]) => {
              if ((count as number) <= 0) return null;
              
              const bg = packId === 'pack_legendary' ? 'from-[#FFD700] to-[#FFA500] text-black shadow-[0_0_15px_rgba(255,215,0,0.3)]' :
                         packId === 'pack_premium' ? 'from-fuchsia-600 to-purple-800 text-white shadow-[0_0_15px_rgba(168,85,247,0.3)]' :
                         packId === 'pack_event_final' ? 'from-green-600 to-emerald-800 text-white shadow-[0_0_15px_rgba(34,197,94,0.4)] border border-green-500' :
                         'from-gray-700 to-gray-900 text-white border border-gray-600 shadow-lg';

              return (
                <motion.button
                  key={packId}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setOpeningPack(packId)}
                  className={`bg-gradient-to-r ${bg} p-4 rounded-xl flex items-center justify-between transition-all`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-black/20 rounded-lg flex items-center justify-center font-bold">
                      x{count}
                    </div>
                    <span className="font-extrabold text-lg uppercase tracking-tighter italic">
                      {packId === 'pack_legendary' ? 'Lendas' : 
                       packId === 'pack_premium' ? 'Premium' : 
                       packId === 'pack_event_final' ? 'Evento Final' : 'Básico'}
                    </span>
                  </div>
                  <span className="bg-black/40 px-4 py-2 rounded-lg text-sm font-bold backdrop-blur-sm uppercase tracking-widest border border-white/10">ABRIR</span>
                </motion.button>
              );
            })}
          </div>
        )}
      </div>
      {/* Ranking / Global Panel */}
      <div className="glass-panel p-5 rounded-2xl">
         <div className="flex items-center justify-between mb-4">
           <h3 className="text-white font-black italic uppercase tracking-tighter text-lg">Top Colecionadores</h3>
           <span className="text-xs font-bold text-gray-400 uppercase">Global</span>
         </div>
         <div className="space-y-3">
           {topUsers.length === 0 ? (
              <div className="text-center py-4 text-gray-500 text-xs uppercase font-bold">Carregando rank...</div>
           ) : topUsers.map((u, i) => {
             const border = i === 0 ? 'border-yellow-500/50 shadow-[0_0_15px_rgba(250,204,21,0.2)]' : i === 1 ? 'border-gray-400/50' : 'border-amber-700/50';
             const badge = i === 0 ? 'bg-yellow-500 text-black shadow-[0_0_10px_rgba(250,204,21,0.5)]' : i === 1 ? 'bg-gray-400 text-black' : 'bg-amber-700 text-white';
             return (
               <div key={u.id} className={`flex items-center justify-between bg-black/40 p-3 rounded-xl border ${border} transition-all`}>
                  <div className="flex items-center space-x-3">
                     <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${badge}`}>{i + 1}</div>
                     <div className="font-bold text-white text-sm">{u.name || 'Jogador'}</div>
                  </div>
                  <div className="text-game-green font-bold text-xs">{getCompletionOfUser(u.inventory)}%</div>
               </div>
             )
           })}

           {/* Current user */}
           <div className="flex items-center justify-between bg-game-green/10 p-3 rounded-xl border border-game-green/30 mt-4">
              <div className="flex items-center space-x-3">
                 <div className="w-8 h-8 rounded-full bg-slate-800 text-gray-400 flex items-center justify-center font-bold text-sm border border-gray-600">--</div>
                 <div className="font-bold text-white text-sm">Você</div>
              </div>
              <div className="text-game-green font-bold text-xs">{completionPercentage}%</div>
           </div>
         </div>
      </div>

    </div>
  );
};

