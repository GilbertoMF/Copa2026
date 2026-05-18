/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState } from 'react';
import { GameProvider } from './store/GameContext';
import { BottomNav, Tab } from './components/BottomNav';
import { HomeScreen } from './screens/HomeScreen';
import { AlbumScreen } from './screens/AlbumScreen';
import { ShopScreen } from './screens/ShopScreen';
import { TradeScreen } from './screens/TradeScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import { MinigameScreen } from './screens/MinigameScreen';

const MainApp: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<Tab>('home');
  const [showProfile, setShowProfile] = useState(false);

  return (
    <div className="bg-game-bg min-h-[100dvh] text-white font-sans selection:bg-game-green/30 overflow-hidden flex flex-col">
      <div className="flex-1 overflow-y-auto no-scrollbar scroll-smooth">
        {showProfile ? (
           <div className="relative">
             <button onClick={() => setShowProfile(false)} className="absolute top-4 left-4 z-50 text-white bg-black/40 p-2 rounded-full border border-white/10 hover:bg-white/10">
               ← Voltar
             </button>
             <ProfileScreen />
           </div>
        ) : (
          <>
            {currentTab === 'home' && <HomeScreen onOpenProfile={() => setShowProfile(true)} />}
            {currentTab === 'album' && <AlbumScreen />}
            {currentTab === 'shop' && <ShopScreen />}
            {currentTab === 'trade' && <TradeScreen />}
            {currentTab === 'games' && <MinigameScreen />}
          </>
        )}
      </div>
      {!showProfile && <BottomNav currentTab={currentTab} onChange={setCurrentTab} />}
    </div>
  );
};

export default function App() {
  return (
    <GameProvider>
      <MainApp />
    </GameProvider>
  );
}
