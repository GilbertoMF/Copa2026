import React, { useState, useEffect } from 'react';
import { useGame } from '../store/GameContext';
import { STICKERS } from '../data/stickers';
import { RefreshCw, Users, Plus, ArrowRight, X, Globe } from 'lucide-react';
import { TradeOffer } from '../types';
import { collection, query, where, onSnapshot, limit, orderBy } from 'firebase/firestore';
import { db } from '../firebase';

export const TradeScreen: React.FC = () => {
  const { state, createTrade, cancelTrade, acceptTrade, user } = useGame();
  const [activeTab, setActiveTab] = useState<'market' | 'create' | 'my'>('market');
  
  // Create Trade Form States
  const [giveId, setGiveId] = useState<string>('');
  const [wantId, setWantId] = useState<string>('');

  const [globalTrades, setGlobalTrades] = useState<TradeOffer[]>([]);

  useEffect(() => {
    // 50 latest active trades
    const q = query(
      collection(db, 'trades'), 
      where('status', '==', 'active'),
      limit(50)
    );
    
    // We cannot easily do orderBy timestamp if status is in where without a composite index.
    // Let's just limit 50, and sort client-side. Or if we just rely on default order.

    const unsub = onSnapshot(q, (snapshot) => {
      const trades: TradeOffer[] = [];
      snapshot.forEach(doc => {
        const data = doc.data() as TradeOffer;
        // Don't show our own trades in market if we want, or do show them but disable accept
        trades.push(data);
      });
      // Sort newest first
      trades.sort((a, b) => b.timestamp - a.timestamp);
      setGlobalTrades(trades);
    }, (error) => {
       console.error("Trades Error:", error);
    });

    return unsub;
  }, []);

  const handleCreate = () => {
    if (!giveId || !wantId) return;
    createTrade(giveId, wantId);
    setGiveId('');
    setWantId('');
    setActiveTab('my');
  };

  const myDupes = STICKERS.filter(s => (state.inventory[s.id] || 0) > 1);

  return (
    <div className="flex flex-col flex-1 p-4 pb-24 max-w-md mx-auto w-full h-[100dvh]">
      <h1 className="text-2xl font-black text-white mb-4 uppercase italic tracking-tighter flex items-center">
        <Globe className="w-6 h-6 mr-2 text-blue-500" /> Mercado Global
      </h1>

      <div className="flex space-x-2 mb-6">
        <button onClick={() => setActiveTab('market')} className={`flex-1 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-colors ${activeTab === 'market' ? 'bg-game-green text-black' : 'glass-panel text-gray-400'}`}>Mercado</button>
        <button onClick={() => setActiveTab('create')} className={`flex-1 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-colors ${activeTab === 'create' ? 'bg-game-green text-black' : 'glass-panel text-gray-400'}`}>Nova Oferta</button>
        <button onClick={() => setActiveTab('my')} className={`flex-1 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-colors ${activeTab === 'my' ? 'bg-game-green text-black' : 'glass-panel text-gray-400'}`}>Minhas</button>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar pb-6 space-y-4">
        {activeTab === 'market' && (
          <div className="space-y-4">
            {globalTrades.length === 0 ? (
               <div className="text-center p-8 bg-black/20 rounded-2xl border border-dashed border-white/10">
                  <p className="text-gray-400 text-sm">Nenhuma oferta ativa no mercado.</p>
                  <button onClick={() => setActiveTab('create')} className="mt-4 px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg text-xs font-bold uppercase transition-colors hover:bg-blue-500/40">Seja o primeiro a ofertar!</button>
               </div>
            ) : globalTrades.map(trade => {
              const offerSticker = STICKERS.find(s => s.id === trade.offering);
              const wantSticker = STICKERS.find(s => s.id === trade.requesting);
              if (!offerSticker || !wantSticker) return null;
              
              const isMine = trade.senderId === user?.uid;
              const canAccept = !isMine && (state.inventory[trade.requesting] || 0) >= 1;

              return (
                <div key={trade.id} className="glass-panel rounded-2xl p-4 relative overflow-hidden">
                   <div className="flex justify-between items-center mb-3">
                     <span className="text-white font-bold text-sm flex items-center">
                       <Users className="w-4 h-4 mr-1 text-game-green"/> 
                       {isMine ? 'Você' : trade.senderName}
                     </span>
                     <span className="text-gray-500 text-[10px] uppercase">{new Date(trade.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                   </div>
                   <div className="flex bg-black/40 rounded-xl p-2 items-center justify-between mb-4 border border-white/5">
                      <div className="flex-1 text-center">
                        <div className="text-[10px] text-gray-400 uppercase font-bold mb-1">Oferece</div>
                        <div className="text-white font-bold text-xs">{offerSticker.name}</div>
                      </div>
                      <ArrowRight className="text-game-green w-5 h-5 mx-2" />
                      <div className="flex-1 text-center">
                        <div className="text-[10px] text-gray-400 uppercase font-bold mb-1">Pede</div>
                        <div className="text-white font-bold text-xs">{wantSticker.name}</div>
                      </div>
                   </div>
                   {isMine ? (
                     <button 
                       onClick={() => cancelTrade(trade.id)}
                       className="w-full py-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/30 rounded-xl font-bold text-xs uppercase tracking-wider transition-colors flex justify-center items-center"
                     >
                       <X className="w-4 h-4 mr-1" /> Editar / Cancelar
                     </button>
                   ) : (
                     <button 
                       onClick={() => acceptTrade(trade)}
                       disabled={!canAccept}
                       className={`w-full py-3 rounded-xl font-bold text-sm uppercase tracking-wider transition-colors ${canAccept ? 'bg-game-green hover:bg-[#00e67a] text-black shadow-[0_0_15px_rgba(0,255,136,0.3)]' : 'bg-white/5 text-gray-500 cursor-not-allowed'}`}
                     >
                       {canAccept ? 'Aceitar Troca' : 'Você não tem a carta pedida'}
                     </button>
                   )}
                </div>
              );
            })}
          </div>
        )}

        {activeTab === 'create' && (
          <div className="glass-panel p-5 rounded-3xl">
             <h3 className="text-white font-black italic uppercase mb-4">Nova Oferta</h3>
             <div className="space-y-4 mb-6">
                <div>
                   <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Carta que você vai enviar</label>
                   <select 
                     className="w-full bg-black/40 text-white rounded-xl p-4 border border-white/10 outline-none appearance-none"
                     value={giveId}
                     onChange={(e) => setGiveId(e.target.value)}
                     disabled={myDupes.length === 0}
                   >
                     {myDupes.length === 0 ? (
                       <option value="">-- Você não tem cartas repetidas --</option>
                     ) : (
                       <>
                         <option value="">-- Selecione uma carta repetida --</option>
                         {myDupes.map(s => (
                           <option key={s.id} value={s.id}>{s.name} (Você tem {state.inventory[s.id]})</option>
                         ))}
                       </>
                     )}
                   </select>
                </div>
                <div>
                   <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Carta que você quer</label>
                   <select 
                     className="w-full bg-black/40 text-white rounded-xl p-4 border border-white/10 outline-none appearance-none"
                     value={wantId}
                     onChange={(e) => setWantId(e.target.value)}
                   >
                     <option value="">-- Selecione a carta desejada --</option>
                     {STICKERS.map(s => (
                       <option key={s.id} value={s.id}>{s.name} ({s.rarity})</option>
                     ))}
                   </select>
                </div>
             </div>
             <button 
               onClick={handleCreate}
               disabled={!giveId || !wantId}
               className={`w-full py-4 rounded-xl font-black text-sm uppercase tracking-widest transition-colors flex justify-center items-center ${giveId && wantId ? 'bg-blue-500 hover:bg-blue-400 text-white shadow-[0_0_20px_rgba(59,130,246,0.4)]' : 'bg-white/5 text-gray-600 cursor-not-allowed'}`}
             >
                <Plus className="w-5 h-5 mr-2" /> Publicar Oferta
             </button>
          </div>
        )}

        {activeTab === 'my' && (
          <div className="space-y-4">
             {state.myTrades.length === 0 ? (
               <div className="text-center p-8 bg-black/20 rounded-2xl border border-dashed border-white/10">
                  <p className="text-gray-400 text-sm">Você não tem ofertas ativas.</p>
               </div>
             ) : (
               state.myTrades.map(trade => {
                 const offerSticker = STICKERS.find(s => s.id === trade.offering);
                 const wantSticker = STICKERS.find(s => s.id === trade.requesting);
                 if (!offerSticker || !wantSticker) return null;

                 return (
                    <div key={trade.id} className="glass-panel rounded-2xl p-4 relative overflow-hidden border-blue-500/30">
                       <div className="flex bg-black/40 rounded-xl p-2 items-center justify-between mb-4 border border-white/5">
                          <div className="flex-1 text-center">
                            <div className="text-[10px] text-gray-400 uppercase font-bold mb-1">Dando</div>
                            <div className="text-blue-400 font-bold text-xs">{offerSticker.name}</div>
                          </div>
                          <ArrowRight className="text-blue-500 w-5 h-5 mx-2" />
                          <div className="flex-1 text-center">
                            <div className="text-[10px] text-gray-400 uppercase font-bold mb-1">Pedindo</div>
                            <div className="text-white font-bold text-xs">{wantSticker.name}</div>
                          </div>
                       </div>
                       <button 
                         onClick={() => cancelTrade(trade.id)}
                         className="w-full py-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/30 rounded-xl font-bold text-xs uppercase tracking-wider transition-colors flex justify-center items-center"
                       >
                         <X className="w-4 h-4 mr-1" /> Editar / Cancelar
                       </button>
                    </div>
                 )
               })
             )}
          </div>
        )}
      </div>
    </div>
  );
};
