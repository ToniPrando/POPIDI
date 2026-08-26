import React from 'react';
import { useCart } from '../context/CartContext';
import { getCleanWhatsAppNumber } from '../utils/formatters';
import { X, Clock, MessageSquare, MapPin, Store, AlertCircle } from 'lucide-react';

export const StoreClosedModal: React.FC = () => {
  const { storeSettings, isStoreClosedModalOpen, setIsStoreClosedModalOpen } = useCart();

  if (!isStoreClosedModalOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={() => setIsStoreClosedModalOpen(false)}
    >
      <div 
        className="relative bg-zinc-950 border border-red-500/40 w-full max-w-md rounded-2xl sm:rounded-3xl shadow-2xl shadow-red-950/40 overflow-hidden text-left p-6 sm:p-7 space-y-5"
        onClick={e => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={() => setIsStoreClosedModalOpen(false)}
          className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white rounded-full bg-zinc-900/80 hover:bg-zinc-800 transition-colors cursor-pointer border border-zinc-800"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Icon & Title Header */}
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-400 shrink-0 shadow-[0_0_15px_rgba(239,68,68,0.25)]">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <div className="inline-block bg-red-500/20 text-red-300 font-extrabold text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-red-500/30 mb-1">
              Fechado no Momento
            </div>
            <h3 className="text-xl font-black text-white leading-tight">
              Estabelecimento Fechado!
            </h3>
          </div>
        </div>

        {/* Informative Explanation */}
        <p className="text-sm text-zinc-300 leading-relaxed">
          No momento a <strong>Pó Pi Di Hamburgueria & Choperia</strong> não está aceitando novos pedidos pelo sistema. Você pode continuar navegando e conhecendo nosso cardápio.
        </p>

        {/* Details Card */}
        <div className="p-3.5 bg-zinc-900/80 rounded-xl border border-zinc-800/80 space-y-2 text-xs text-zinc-300">
          <div className="flex items-center gap-2.5">
            <Clock className="w-4 h-4 text-amber-400 shrink-0" />
            <span><strong>Horário:</strong> {storeSettings.openingHoursText || 'Terça a Domingo das 18h00 às 23h30'}</span>
          </div>
          <div className="flex items-center gap-2.5">
            <MapPin className="w-4 h-4 text-fuchsia-400 shrink-0" />
            <span className="truncate"><strong>Endereço:</strong> {storeSettings.address}, {storeSettings.cityState}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-2 pt-1">
          <a
            href={`https://wa.me/${getCleanWhatsAppNumber(storeSettings.phoneWhatsApp)}?text=${encodeURIComponent('Olá! Gostaria de saber mais informações sobre os pedidos da PO-PI-DI Hamburgueria.')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs sm:text-sm py-3 rounded-xl shadow-lg shadow-emerald-950/40 transition-all cursor-pointer"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Falar no WhatsApp</span>
          </a>

          <button
            onClick={() => setIsStoreClosedModalOpen(false)}
            className="w-full bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-bold text-xs sm:text-sm py-3 rounded-xl border border-zinc-800 transition-colors cursor-pointer"
          >
            Entendido, apenas ver cardápio
          </button>
        </div>

      </div>
    </div>
  );
};
