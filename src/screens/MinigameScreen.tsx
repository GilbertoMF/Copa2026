import React, { useState, useEffect, useCallback } from 'react';
import { useGame } from '../store/GameContext';
import { Trophy, Timer, Coins, Play, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { playSound } from '../utils/audio';

type GameState = 'menu' | 'playing' | 'gameover';

export const MinigameScreen: React.FC = () => {
  const { state, removeCoins, addCoins, addPack } = useGame();
  
  const [gameState, setGameState] = useState<GameState>('menu');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [ballPos, setBallPos] = useState({ x: 50, y: 50 });
  const [rewardText, setRewardText] = useState('');

  const GAME_COST = 50;

  const startGame = () => {
    if (removeCoins(GAME_COST)) {
      setGameState('playing');
      setScore(0);
      setTimeLeft(15);
      moveBall();
      setRewardText('');
    } else {
      alert('Moedas insuficientes!');
    }
  };

  const moveBall = useCallback(() => {
    setBallPos({
      x: 10 + Math.random() * 80,
      y: 20 + Math.random() * 60
    });
  }, []);

  const handleBallClick = () => {
    if (gameState !== 'playing') return;
    setScore(s => s + 1);
    playSound('click');
    moveBall();
  };

  useEffect(() => {
    let timer: number;
    if (gameState === 'playing' && timeLeft > 0) {
      timer = window.setInterval(() => {
        setTimeLeft(t => t - 1);
      }, 1000);
    } else if (gameState === 'playing' && timeLeft === 0) {
      setGameState('gameover');
      calculateRewards();
    }
    return () => clearInterval(timer);
  }, [gameState, timeLeft]);

  const calculateRewards = () => {
    let coinsGained = 0;
    let packGained = '';
    
    if (score >= 30) {
      packGained = 'pack_legendary';
    } else if (score >= 20) {
      packGained = 'pack_premium';
    } else if (score >= 10) {
      coinsGained = 150;
    } else if (score >= 5) {
      coinsGained = 60;
    }

    let text = 'Nenhuma recompensa. Mais sorte na próxima!';
    
    if (packGained === 'pack_legendary') {
      addPack('pack_legendary', 1);
      text = 'Incrível! Você ganhou 1 Pacote Lendas!';
      playSound('legendary');
    } else if (packGained === 'pack_premium') {
      addPack('pack_premium', 1);
      text = 'Muito bem! Você ganhou 1 Pacote Premium!';
      playSound('legendary');
    } else if (coinsGained > 0) {
      addCoins(coinsGained);
      text = `Bom trabalho! Você ganhou ${coinsGained} moedas.`;
    }

    setRewardText(text);
  };

  return (
    <div className="flex flex-col flex-1 p-4 pb-24 max-w-md mx-auto w-full">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-black text-white italic tracking-tighter uppercase">Minigames</h1>
        <div className="flex items-center space-x-2 bg-black/40 px-4 py-2 rounded-full border border-white/5">
          <Coins className="w-5 h-5 text-yellow-400" />
          <span className="font-bold text-yellow-400 text-lg">{state.coins}</span>
        </div>
      </div>

      {gameState === 'menu' && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel rounded-3xl p-6 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-game-green/20 blur-3xl rounded-full"></div>
          <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter mb-2">Chute Rápido</h2>
          <p className="text-gray-400 text-sm mb-6">Teste seus reflexos! Toque na bola o máximo de vezes que puder em 15 segundos.</p>
          
          <div className="bg-black/40 rounded-2xl p-4 mb-6 border border-white/5">
            <h3 className="text-white font-bold text-sm uppercase tracking-wider mb-2">Recompensas</h3>
            <ul className="space-y-2 text-xs text-gray-400">
              <li className="flex justify-between"><span>5+ Acertos</span> <span className="text-yellow-400">60 Moedas</span></li>
              <li className="flex justify-between"><span>10+ Acertos</span> <span className="text-yellow-400">150 Moedas</span></li>
              <li className="flex justify-between"><span>20+ Acertos</span> <span className="text-fuchsia-400">Pacote Premium</span></li>
              <li className="flex justify-between"><span>30+ Acertos</span> <span className="text-[#FFD700]">Pacote Lendas</span></li>
            </ul>
          </div>

          <button 
            onClick={startGame}
            className="w-full py-4 bg-game-green hover:bg-[#00e67a] text-black font-black text-xl uppercase tracking-widest rounded-xl shadow-[0_0_20px_rgba(0,255,136,0.4)] flex justify-center items-center space-x-2"
          >
            <Play className="fill-black" />
            <span>JOGAR ({GAME_COST} 🪙)</span>
          </button>
        </motion.div>
      )}

      {gameState === 'playing' && (
        <div className="flex-1 glass-panel rounded-3xl p-4 relative overflow-hidden flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <div className="bg-black/50 px-4 py-2 rounded-xl flex items-center space-x-2 border border-white/10">
               <Timer className="text-game-green w-5 h-5" />
               <span className="text-white font-bold text-xl">{timeLeft}s</span>
            </div>
            <div className="bg-black/50 px-4 py-2 rounded-xl flex items-center space-x-2 border border-white/10">
               <Star className="text-yellow-400 w-5 h-5" />
               <span className="text-white font-bold text-xl">{score}</span>
            </div>
          </div>
          
          <div className="flex-1 relative bg-black/20 rounded-2xl border border-white/5 overflow-hidden">
            <motion.div
              initial={false}
              animate={{ left: `${ballPos.x}%`, top: `${ballPos.y}%` }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              onClick={handleBallClick}
              className="absolute w-16 h-16 -ml-8 -mt-8 cursor-pointer active:scale-90"
            >
              <div className="w-full h-full bg-white rounded-full shadow-[inset_-4px_-4px_10px_rgba(0,0,0,0.3)] shadow-[0_0_15px_rgba(255,255,255,0.5)] flex items-center justify-center">
                <div className="w-8 h-8 flex flex-wrap">
                   {/* simple soccer ball pattern approximation */}
                   <div className="w-full h-full border-4 border-black rounded-full" />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      )}

      {gameState === 'gameover' && (
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="glass-panel rounded-3xl p-8 text-center relative overflow-hidden"
        >
           <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-4 drop-shadow-[0_0_15px_rgba(250,204,21,0.5)]" />
           <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter mb-2">Fim de Jogo!</h2>
           <p className="text-5xl font-black text-game-green mb-6">{score}</p>
           
           <div className="bg-black/40 rounded-xl p-4 mb-6 border border-white/10">
              <p className="text-sm font-bold text-white">{rewardText}</p>
           </div>

           <button 
            onClick={() => setGameState('menu')}
            className="w-full py-4 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-lg uppercase tracking-widest rounded-xl transition-colors"
          >
            Voltar
          </button>
        </motion.div>
      )}
    </div>
  );
};
