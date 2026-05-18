import React from 'react';
import { Home, BookOpen, ShoppingCart, RefreshCw, Gamepad2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { playSound } from '../utils/audio';

export type Tab = 'home' | 'album' | 'shop' | 'trade' | 'games';

interface BottomNavProps {
  currentTab: Tab;
  onChange: (tab: Tab) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentTab, onChange }) => {
  const tabs = [
    { id: 'home', icon: Home, label: 'Início' },
    { id: 'album', icon: BookOpen, label: 'Álbum' },
    { id: 'shop', icon: ShoppingCart, label: 'Loja' },
    { id: 'trade', icon: RefreshCw, label: 'Trocas' },
    { id: 'games', icon: Gamepad2, label: 'Jogos' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 glass-panel pb-safe z-50">
      <div className="flex justify-around items-center h-16 max-w-md mx-auto px-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                if (!isActive) playSound('click');
                onChange(tab.id as Tab);
              }}
              className={cn(
                "flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors duration-200",
                isActive ? "text-game-green" : "text-gray-500 hover:text-white"
              )}
            >
              <Icon className={cn("w-6 h-6 transition-transform duration-200", isActive && "scale-110")} />
              <span className="text-[10px] font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
