export type Rarity = 'common' | 'rare' | 'epic' | 'legendary';

export interface Sticker {
  id: string;
  name: string;
  team: string;
  position: string;
  number: number;
  rarity: Rarity;
  imageUrl?: string;
}

export interface Pack {
  id: string;
  name: string;
  cost: number;
  stickersCount: number;
  image: string;
  color: string;
  dropRates: {
    common: number;
    rare: number;
    epic: number;
    legendary: number;
  };
  isEvent?: boolean;
}

export interface TradeOffer {
  id: string;
  senderName: string;
  offering: string; // Sticker ID
  requesting: string; // Sticker ID
  isNpc: boolean;
  timestamp: number;
}

export interface UserState {
  coins: number;
  level: number;
  xp: number;
  inventory: Record<string, number>; // stickerId -> count
  packs: Record<string, number>; // packId -> count
  openedPacks: number;
  lastDailyReward?: number;
  myTrades: TradeOffer[];
  soundEnabled: boolean;
}
