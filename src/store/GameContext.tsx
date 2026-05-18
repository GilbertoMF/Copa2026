import React, { createContext, useContext, useEffect, useState } from 'react';
import { TradeOffer, UserState } from '../types';
import { PACKS, STICKERS } from '../data/stickers';
import { playSound } from '../utils/audio';

import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, User } from 'firebase/auth';
import { doc, setDoc, onSnapshot, updateDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { Trophy } from 'lucide-react';

interface GameContextType {
  state: UserState;
  addCoins: (amount: number) => void;
  removeCoins: (amount: number) => boolean;
  buyPack: (packId: string) => boolean;
  addPack: (packId: string, count: number) => void;
  openPack: (packId: string) => string[];
  claimDailyReward: () => void;
  resetProgress: () => void;
  createTrade: (offeringId: string, requestingId: string) => void;
  cancelTrade: (tradeId: string) => void;
  acceptTrade: (trade: TradeOffer) => boolean;
  sellAllDuplicates: () => number;
  toggleSound: () => void;
  user: User | null;
  signOut: () => void;
}

const DEFAULT_STATE: UserState = {
  coins: 500,
  level: 1,
  xp: 0,
  inventory: {},
  packs: { pack_basic: 2 },
  openedPacks: 0,
  myTrades: [],
  soundEnabled: true,
};

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [state, setState] = useState<UserState | null>(null);

  // Auth Effect
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      setLoadingAuth(false);
      if (!u) setState(null);
    });
    return unsub;
  }, []);

  // Sync state to/from Firestore
  useEffect(() => {
    if (!user) return;
    const userRef = doc(db, 'users', user.uid);
    
    // Check if exists, if not, create
    getDoc(userRef).then(async (snap) => {
      if (!snap.exists()) {
        // Try to load from localStorage first for migration
        let startState = DEFAULT_STATE;
        try {
          const ls = localStorage.getItem('world_cup_state_v2');
          if (ls) startState = JSON.parse(ls);
        } catch {}
        
        await setDoc(userRef, {
           userId: user.uid,
           level: startState.level,
           xp: startState.xp,
           coins: startState.coins,
           inventory: startState.inventory,
           packs: startState.packs,
           openedPacks: startState.openedPacks,
           lastDailyReward: startState.lastDailyReward || 0,
           name: user.displayName || 'Jogador',
           myTrades: startState.myTrades
        });
      }
    });

    const unsub = onSnapshot(userRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setState(prev => {
           // We merge with local soundEnabled preference which is device specific
           const savedSound = localStorage.getItem('world_cup_sound');
           const isSoundEnabled = savedSound ? savedSound === 'true' : true;
           
           return {
             coins: data.coins,
             level: data.level,
             xp: data.xp,
             inventory: data.inventory || {},
             packs: data.packs || {},
             openedPacks: data.openedPacks || 0,
             lastDailyReward: data.lastDailyReward,
             myTrades: data.myTrades || [],
             soundEnabled: prev?.soundEnabled !== undefined ? prev.soundEnabled : isSoundEnabled
           };
        });
      }
    }, (error) => {
       console.error("Firestore Error:", error);
    });

    return unsub;
  }, [user]);

  // Helper to safely update Firestore state
  const updateFirebaseState = async (updates: Partial<UserState>) => {
    if (!user) return;
    try {
      await updateDoc(doc(db, 'users', user.uid), updates);
    } catch (e) {
      console.error("Error updating state", e);
    }
  };

  const addCoins = (amount: number) => {
    if (!state) return;
    updateFirebaseState({ coins: state.coins + amount });
    playSound('coins');
  };

  const removeCoins = (amount: number) => {
    if (!state) return false;
    if (state.coins < amount) return false;
    updateFirebaseState({ coins: state.coins - amount });
    return true;
  };

  const addPack = (packId: string, count: number) => {
    if (!state) return;
    updateFirebaseState({ 
      packs: { ...state.packs, [packId]: (state.packs[packId] || 0) + count }
    });
  };

  const buyPack = (packId: string): boolean => {
    if (!state) return false;
    const pack = PACKS.find((p) => p.id === packId);
    if (!pack || state.coins < pack.cost) return false;

    updateFirebaseState({
      coins: state.coins - pack.cost,
      packs: { ...state.packs, [packId]: (state.packs[packId] || 0) + 1 },
    });
    playSound('click');
    return true;
  };

  const openPack = (packId: string): string[] => {
    if (!state || (state.packs[packId] || 0) <= 0) return [];

    const packConfig = PACKS.find((p) => p.id === packId);
    if (!packConfig) return [];

    const newStickers: string[] = [];
    
    for (let i = 0; i < packConfig.stickersCount; i++) {
      const rand = Math.random();
      let rarityRng = 'common';
      const rates = packConfig.dropRates;
      if (rand < rates.common) rarityRng = 'common';
      else if (rand < rates.common + rates.rare) rarityRng = 'rare';
      else if (rand < rates.common + rates.rare + rates.epic) rarityRng = 'epic';
      else rarityRng = 'legendary';

      let pool = STICKERS.filter((s) => s.rarity === rarityRng);
      if (pool.length === 0) pool = STICKERS;

      let selected = pool[Math.floor(Math.random() * pool.length)].id;
      
      if (state.inventory[selected] && Math.random() < 0.25) {
         selected = pool[Math.floor(Math.random() * pool.length)].id;
      }
      
      newStickers.push(selected);
    }

    const newInventory = { ...state.inventory };
    let newXp = state.xp;
    
    newStickers.forEach((id) => {
      if (!newInventory[id]) newXp += 50;
      else newXp += 10;
      newInventory[id] = (newInventory[id] || 0) + 1;
    });

    updateFirebaseState({
      packs: { ...state.packs, [packId]: state.packs[packId] - 1 },
      inventory: newInventory,
      xp: newXp,
      openedPacks: state.openedPacks + 1,
      level: Math.floor(newXp / 500) + 1
    });

    return newStickers;
  };

  const claimDailyReward = () => {
    if (!state) return;
    const now = Date.now();
    const msInDay = 1000 * 60 * 60 * 24;
    if (!state.lastDailyReward || now - state.lastDailyReward > msInDay) {
      updateFirebaseState({
        coins: state.coins + 200,
        lastDailyReward: now,
      });
      playSound('coins');
    }
  };

  const resetProgress = async () => {
    if (!state || !user) return;
    if (confirm('Tem certeza? Isso apagará todo o seu progresso.')) {
      await updateFirebaseState(DEFAULT_STATE);
    }
  };

  const createTrade = (offeringId: string, requestingId: string) => {
    if (!state || (state.inventory[offeringId] || 0) < 2) return;
    
    const newTrade: TradeOffer = {
      id: `trade_${Date.now()}_${Math.random()}`,
      senderName: user?.displayName || 'Você',
      offering: offeringId,
      requesting: requestingId,
      isNpc: false,
      timestamp: Date.now(),
    };

    updateFirebaseState({
      inventory: { ...state.inventory, [offeringId]: state.inventory[offeringId] - 1 },
      myTrades: [...(state.myTrades || []), newTrade]
    });
    
    // Also push to public trades collection
    if (user) {
      setDoc(doc(db, 'trades', newTrade.id), {
        ...newTrade,
        senderId: user.uid,
        status: 'active'
      });
    }

    playSound('click');
  };

  const cancelTrade = async (tradeId: string) => {
    if (!state || !user) return;
    const trade = state.myTrades.find(t => t.id === tradeId);
    if (!trade) return;

    updateFirebaseState({
      inventory: { ...state.inventory, [trade.offering]: (state.inventory[trade.offering] || 0) + 1 },
      myTrades: state.myTrades.filter(t => t.id !== tradeId)
    });
    
    await updateDoc(doc(db, 'trades', tradeId), { status: 'cancelled' }).catch(() => {});
    
    playSound('click');
  };

  const acceptTrade = (trade: TradeOffer): boolean => {
    // This now logic needs to be aware if it's a global trade or an NPC mock trade.
    // We will handle NPC trades locally, global trades we have to update in DB
    if (!state || !user || (state.inventory[trade.requesting] || 0) < 1) return false;
    
    updateFirebaseState({
      inventory: {
        ...state.inventory,
        [trade.requesting]: state.inventory[trade.requesting] - 1,
        [trade.offering]: (state.inventory[trade.offering] || 0) + 1
      }
    });

    if (!trade.isNpc) {
      // Mark as completed in global
      updateDoc(doc(db, 'trades', trade.id), { status: 'completed' }).catch(() => {});
    }
    
    playSound('legendary');
    return true;
  };

  const sellAllDuplicates = (): number => {
    if (!state) return 0;
    let coinsEarned = 0;
    
    const newInventory = { ...state.inventory };
    
    Object.entries(newInventory).forEach(([id, count]) => {
      if ((count as number) > 1) {
        const sticker = STICKERS.find(s => s.id === id);
        if (sticker) {
          const extra = (count as number) - 1;
          let value = 10;
          if (sticker.rarity === 'rare') value = 30;
          else if (sticker.rarity === 'epic') value = 100;
          else if (sticker.rarity === 'legendary') value = 300;
          
          coinsEarned += (value * extra);
          newInventory[id] = 1;
        }
      }
    });
    
    if (coinsEarned > 0) {
      updateFirebaseState({
        inventory: newInventory,
        coins: state.coins + coinsEarned
      });
      playSound('coins');
    }
    return coinsEarned;
  };

  const toggleSound = () => {
    if (!state) return;
    const newVal = !state.soundEnabled;
    localStorage.setItem('world_cup_sound', String(newVal));
    setState(prev => prev ? ({ ...prev, soundEnabled: newVal }) : null);
    playSound('click');
  };

  const handleLogin = () => {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider).catch(console.error);
  };

  const handleSignOut = () => {
    auth.signOut();
  };

  if (loadingAuth) {
    return (
      <div className="flex h-[100dvh] items-center justify-center bg-black">
        <div className="w-8 h-8 border-4 border-game-green border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user || !state) {
    return (
      <div className="flex flex-col h-[100dvh] items-center justify-center bg-[#0a0a0a] p-6 text-center">
         <Trophy className="w-24 h-24 text-yellow-500 mb-6" />
         <h1 className="text-3xl font-black italic uppercase text-white mb-2">Mercado Global</h1>
         <p className="text-gray-400 text-sm mb-8">Faça login para salvar suas figurinhas e negociar globalmente com outros jogadores.</p>
         
         <button 
           onClick={handleLogin}
           className="bg-white text-black font-bold uppercase tracking-widest text-sm px-8 py-4 rounded-xl flex items-center shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:scale-105 transition-transform"
         >
           <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5 mr-3" alt="Google" />
           Entrar com Google
         </button>
      </div>
    );
  }

  return (
    <GameContext.Provider value={{ state, addCoins, removeCoins, buyPack, addPack, openPack, claimDailyReward, resetProgress, createTrade, cancelTrade, acceptTrade, sellAllDuplicates, toggleSound, user, signOut: handleSignOut }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};

