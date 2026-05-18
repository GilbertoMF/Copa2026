import React from 'react';
import { useGame } from '../store/GameContext';
import { User, LogOut, Trash2, Settings, Mail, Trophy, Award, Coins, Volume2, VolumeX } from 'lucide-react';
import { STICKERS } from '../data/stickers';

export const ProfileScreen: React.FC = () => {
  const { state, resetProgress, sellAllDuplicates, toggleSound } = useGame();
  
  const totalCollected = Object.keys(state.inventory).length;
  const dupesCount = Object.values(state.inventory).reduce((acc: number, count: any) => acc + Math.max(0, (Number(count) || 0) - 1), 0) as number;

  const handleRecycle = () => {
    if (dupesCount === 0) {
      alert('Você não tem figurinhas repetidas para vender.');
      return;
    }
    if (confirm(`Deseja vender suas ${dupesCount} figurinhas repetidas?\nEssa ação não pode ser desfeita.`)) {
      const earned = sellAllDuplicates();
      alert(`Você ganhou ${earned} moedas!`);
    }
  };

  return (
    <div className="flex flex-col flex-1 p-4 pb-24 max-w-md mx-auto w-full">
      <h1 className="text-2xl font-black text-white mb-6 uppercase italic tracking-tighter">Meu Perfil</h1>

      <div className="glass-panel rounded-2xl p-6 flex flex-col items-center mb-6 neon-border relative overflow-hidden">
        <div className="absolute inset-0 bg-game-green/5 blur-xl"></div>
        <div className="w-20 h-20 bg-gradient-to-br from-game-green to-emerald-600 rounded-full flex items-center justify-center mb-4 shadow-lg border-4 border-black relative z-10">
          <User className="w-10 h-10 text-black" />
        </div>
        <h2 className="text-xl font-black text-white relative z-10 italic">COLECIONADOR_99</h2>
        <p className="text-gray-400 text-sm font-bold uppercase tracking-wider relative z-10">Nível {state.level}</p>
        
        <div className="w-full stat-bar mt-4 relative z-10">
          <div className="stat-progress" style={{ width: `${(state.xp % 500) / 5}%` }}></div>
        </div>
        <p className="text-[10px] text-gray-500 mt-2 font-bold uppercase tracking-widest relative z-10">{state.xp % 500}/500 XP PROXIMO</p>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="glass-panel rounded-xl p-4 flex flex-col items-center hover:bg-white/5 transition-all">
          <div className="bg-black/40 border border-white/5 p-3 rounded-full mb-2 shadow-[0_0_15px_rgba(250,204,21,0.2)]">
            <Trophy className="w-6 h-6 text-yellow-400" />
          </div>
          <span className="text-2xl font-black text-white">{totalCollected}</span>
          <span className="text-[10px] text-gray-400 text-center uppercase font-bold tracking-wider">Figurinhas<br/>Únicas</span>
        </div>
        <div className="glass-panel rounded-xl p-4 flex flex-col items-center hover:bg-white/5 transition-all">
          <div className="bg-black/40 border border-white/5 p-3 rounded-full mb-2 shadow-[0_0_15px_rgba(168,85,247,0.2)]">
            <Award className="w-6 h-6 text-purple-400" />
          </div>
          <span className="text-2xl font-black text-white">{dupesCount}</span>
          <span className="text-[10px] text-gray-400 text-center uppercase font-bold tracking-wider">Duplicadas<br/>p/ Troca</span>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-gray-500 font-black text-[10px] uppercase tracking-widest ml-2 mb-2">Ações da Conta</h3>
        
        <button 
          onClick={handleRecycle}
          className="w-full flex items-center justify-between glass-panel p-4 rounded-xl hover:bg-white/5 transition-colors group border-yellow-500/30"
        >
          <div className="flex items-center text-yellow-400 font-bold text-sm">
            <Coins className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" />
            Vender todas repetidas
          </div>
          {dupesCount > 0 && <span className="text-xs bg-yellow-400 text-black px-2 py-1 rounded font-bold">{dupesCount} cartas</span>}
        </button>

        <button 
          onClick={toggleSound}
          className="w-full flex items-center justify-between glass-panel p-4 rounded-xl hover:bg-white/5 transition-colors group"
        >
          <div className="flex items-center text-white font-bold text-sm">
            {state.soundEnabled ? <Volume2 className="w-5 h-5 mr-3 text-gray-400 group-hover:text-white transition-colors" /> : <VolumeX className="w-5 h-5 mr-3 text-red-400" />}
            Sons do Jogo
          </div>
          <div className={`w-10 h-6 rounded-full p-1 transition-colors ${state.soundEnabled ? 'bg-game-green' : 'bg-gray-600'}`}>
             <div className={`bg-white w-4 h-4 rounded-full shadow-sm transition-transform ${state.soundEnabled ? 'translate-x-4' : 'translate-x-0'}`} />
          </div>
        </button>

        <button className="w-full flex items-center justify-between glass-panel p-4 rounded-xl hover:bg-white/5 transition-colors group">
          <div className="flex items-center text-white font-bold text-sm">
            <Mail className="w-5 h-5 mr-3 text-gray-400 group-hover:text-white transition-colors" />
            Vincular Email / Nuvem
          </div>
        </button>

        <button 
          onClick={resetProgress}
          className="w-full flex items-center justify-between bg-red-500/10 p-4 rounded-xl border border-red-500/20 hover:bg-red-500/20 transition-colors text-red-400 group"
        >
          <div className="flex items-center font-bold text-sm">
            <Trash2 className="w-5 h-5 mr-3 group-hover:animate-pulse" />
            Apagar Progresso
          </div>
        </button>
      </div>

      <div className="mt-8 text-center text-[10px] text-gray-600 font-bold uppercase tracking-widest">
        Copa 2026 - Álbum Legends v1.0.0<br/>
        Uma experiência interativa
      </div>
    </div>
  );
};
