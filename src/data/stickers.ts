import { Pack, Rarity, Sticker } from '../types';

export const TEAMS = [
  { id: 'bra', name: 'Brasil', color: 'bg-green-500' },
  { id: 'arg', name: 'Argentina', color: 'bg-blue-400' },
  { id: 'fra', name: 'França', color: 'bg-blue-700' },
  { id: 'ger', name: 'Alemanha', color: 'bg-gray-800' },
  { id: 'usa', name: 'Estados Unidos', color: 'bg-blue-900' },
  { id: 'esp', name: 'Espanha', color: 'bg-red-600' },
  { id: 'eng', name: 'Inglaterra', color: 'bg-white' },
];

const POSITIONS = ['GOL', 'DEF', 'MEI', 'ATA'];

const mockPlayers: Record<string, string[]> = {
  bra: ['Alisson', 'Marquinhos', 'Militão', 'Casemiro', 'Paquetá', 'Vini Jr', 'Rodrygo', 'Endrick', 'Martinelli', 'Bruno G.', 'Ederson'],
  arg: ['E. Martínez', 'Otamendi', 'Romero', 'De Paul', 'Mac Allister', 'Enzo', 'Messi', 'Álvarez', 'Di María', 'Garnacho', 'Lautaro'],
  fra: ['Maignan', 'Upamecano', 'Saliba', 'Tchouaméni', 'Camavinga', 'Griezmann', 'Mbappé', 'Dembélé', 'Coman', 'Kolo Muani', 'Theo'],
  ger: ['Neuer', 'Rüdiger', 'Tah', 'Kimmich', 'Goretzka', 'Gündoğan', 'Musiala', 'Wirtz', 'Sané', 'Havertz', 'Füllkrug'],
  usa: ['Turner', 'Dest', 'Richards', 'McKennie', 'Musah', 'Adams', 'Pulisic', 'Weah', 'Balogun', 'Reyna', 'Pepi'],
  esp: ['Simón', 'Laporte', 'Le Normand', 'Rodri', 'Pedri', 'Gavi', 'Olmo', 'Williams', 'Yamal', 'Morata', 'Merino'],
  eng: ['Pickford', 'Stones', 'Walker', 'Rice', 'Bellingham', 'Foden', 'Saka', 'Rashford', 'Kane', 'Palmer', 'Grealish']
};

export const STICKERS: Sticker[] = [];

let idCounter = 1;

TEAMS.forEach((team) => {
  const players = mockPlayers[team.id];
  players.forEach((player, index) => {
    // Generate rarities somewhat deterministically for the mock
    let rarity: Rarity = 'common';
    if (['Messi', 'Mbappé', 'Vini Jr', 'Bellingham'].includes(player)) {
      rarity = 'legendary';
    } else if (['Musiala', 'Yamal', 'Saka', 'Endrick', 'Griezmann'].includes(player)) {
      rarity = 'epic';
    } else if (index % 3 === 0) {
      rarity = 'rare';
    }

    STICKERS.push({
      id: `stk_${idCounter}`,
      name: player,
      team: team.id,
      position: POSITIONS[index % 4],
      number: idCounter,
      rarity,
    });
    idCounter++;
  });
});

export const PACKS: Pack[] = [
  {
    id: 'pack_basic',
    name: 'Pacote Básico',
    cost: 100,
    stickersCount: 3,
    color: 'from-gray-700 to-gray-900 border border-gray-600',
    image: 'Basic',
    dropRates: { common: 0.7, rare: 0.25, epic: 0.04, legendary: 0.01 }
  },
  {
    id: 'pack_premium',
    name: 'Pacote Premium',
    cost: 500,
    stickersCount: 5,
    color: 'from-fuchsia-600 to-purple-800',
    image: 'Premium',
    dropRates: { common: 0.4, rare: 0.4, epic: 0.15, legendary: 0.05 }
  },
  {
    id: 'pack_legendary',
    name: 'Pacote Lendas',
    cost: 1500,
    stickersCount: 5,
    color: 'from-[#FFD700] to-[#FFA500] text-black shadow-[0_0_15px_rgba(255,215,0,0.3)]',
    image: 'Legends',
    dropRates: { common: 0, rare: 0.2, epic: 0.6, legendary: 0.2 }
  },
  {
    id: 'pack_event_final',
    name: 'Evento Final 26',
    cost: 800,
    stickersCount: 4,
    color: 'from-green-600 to-emerald-800 border-green-500 shadow-[0_0_20px_rgba(34,197,94,0.5)]',
    image: 'Event',
    dropRates: { common: 0.3, rare: 0.4, epic: 0.2, legendary: 0.1 },
    isEvent: true
  }
];
