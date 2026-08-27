import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { formatBRL, formatDateTime, getPaymentMethodLabel } from '../utils/formatters';
import { openWhatsAppOrder } from '../utils/formatters';
import { 
  X, 
  CheckCircle2, 
  Clock, 
  Flame, 
  Bike, 
  Store, 
  MessageSquare, 
  Copy, 
  Check,
  Share2, 
  ArrowLeft,
  AlertCircle,
  Smartphone,
  Cloud
} from 'lucide-react';
import { OrderStatus } from '../types';

export const OrderTrackerModal: React.FC = () => {
  const { 
    activeOrder, 
    isOrderTrackerOpen, 
    setIsOrderTrackerOpen, 
    storeSettings,
    updateOrderStatus 
  } = useCart();
  const { user } = useAuth();
  const [copiedLink, setCopiedLink] = useState(false);

  if (!isOrderTrackerOpen || !activeOrder) return null;

  const steps: { status: OrderStatus; title: string; subtitle: string; icon: any }[] = [
    {
      status: 'received',
      title: 'Pedido Recebido',
      subtitle: 'Seu pedido foi registrado no sistema.',
      icon: Clock,
    },
    {
      status: 'preparing',
      title: 'Na Chapa / Em Preparo',
      subtitle: 'Nossos mestres chapeiros estão preparando seu artesanal.',
      icon: Flame,
    },
    {
      status: activeOrder.orderType === 'delivery' ? 'out_for_delivery' : 'ready',
      title: activeOrder.orderType === 'delivery' ? 'Saiu para Entrega' : 'Pronto para Retirada',
      subtitle: activeOrder.orderType === 'delivery' ? 'O motoboy está a caminho!' : 'Pode retirar no balcão da hamburgueria.',
      icon: activeOrder.orderType === 'delivery' ? Bike : Store,
    },
    {
      status: 'completed',
      title: 'Entregue / Finalizado',
      subtitle: 'Bom apetite! Obrigado pela preferência.',
      icon: CheckCircle2,
    },
  ];

  const getStepIndex = (status: OrderStatus) => {
    switch (status) {
      case 'received': return 0;
      case 'preparing': return 1;
      case 'out_for_delivery':
      case 'ready': return 2;
      case 'completed': return 3;
      case 'cancelled': return -1;
      default: return 0;
    }
  };

  const currentStepIdx = getStepIndex(activeOrder.status);

  const getTrackingUrl = () => {
    if (typeof window === 'undefined') return '';
    const cleanCode = activeOrder.shortCode.replace('#', '');
    return `${window.location.origin}${window.location.pathname}?pedido=${cleanCode}`;
  };

  const handleCopyLink = async () => {
    const url = getTrackingUrl();
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(url);
      } else {
        const input = document.createElement('input');
        input.value = url;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
      }
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch (e) {
      console.warn('Clipboard copy error:', e);
    }
  };

  const handleShare = async () => {
    const url = getTrackingUrl();
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Rastreamento do Pedido ${activeOrder.shortCode} - Pó Pi Di`,
          text: `Acompanhe o status em tempo real do meu pedido na Hamburgueria Pó Pi Di:`,
          url: url,
        });
      } catch (e) {}
    } else {
      handleCopyLink();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div 
        className="relative bg-zinc-950 border border-zinc-800 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col text-left max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-amber-950/60 to-zinc-900 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono bg-zinc-900 text-amber-400 px-2 py-0.5 rounded border border-zinc-800 font-bold">
                  {activeOrder.shortCode}
                </span>
                <span className="text-xs text-zinc-400">
                  {formatDateTime(activeOrder.createdAt)}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <h3 className="text-base font-black text-white">
                  Acompanhamento do Pedido
                </h3>
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950/70 border border-emerald-800/80 text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                  Ao Vivo
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setIsOrderTrackerOpen(false)}
            className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-5">
          
          {/* READY STATUS BANNER */}
          {(activeOrder.status === 'ready' || activeOrder.status === 'out_for_delivery') && (
            <div className="p-4 bg-gradient-to-r from-emerald-950/80 via-emerald-900/60 to-emerald-950/80 border-2 border-emerald-500/70 rounded-2xl flex items-center gap-3.5 shadow-lg shadow-emerald-950/40 animate-pulse">
              <div className="w-12 h-12 rounded-xl bg-emerald-500 text-black flex items-center justify-center font-black shrink-0 shadow-md">
                <CheckCircle2 className="w-7 h-7 stroke-[2.5]" />
              </div>
              <div className="flex-1">
                <h4 className="text-base sm:text-lg font-black text-emerald-300 uppercase tracking-tight">
                  🎉 Seu Pedido está Pronto!
                </h4>
                <p className="text-xs text-emerald-100/90 font-medium mt-0.5">
                  {activeOrder.orderType === 'delivery' 
                    ? 'Seu pedido já saiu quentinho da cozinha e está a caminho com o nosso motoboy!' 
                    : 'Seu lanche já está prontinho e quentinho no balcão da hamburgueria! Pode retirar!'}
                </p>
              </div>
            </div>
          )}

          {/* Estimated Time Card */}
          <div className="p-4 bg-zinc-900/90 rounded-xl border border-zinc-800 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-xs text-zinc-400 uppercase tracking-wider font-bold">
                Previsão de Chegada:
              </span>
              <div className="text-lg sm:text-xl font-black text-amber-400">
                {activeOrder.estimatedDeliveryTime || '35-50 minutos'}
              </div>
            </div>

            <div className="text-right">
              <span className="text-[11px] text-zinc-400 block">Tipo do Pedido:</span>
              <span className="text-xs font-bold text-white uppercase bg-zinc-800 px-2.5 py-1 rounded-md">
                {activeOrder.orderType === 'delivery' ? '🛵 Delivery' : '🛍️ Retirada'}
              </span>
            </div>
          </div>

          {/* Cross-Device Share / Sync Box */}
          <div className="p-3 bg-zinc-900/60 rounded-xl border border-zinc-800/80 flex items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 text-zinc-300">
              <Smartphone className="w-4 h-4 text-amber-400 shrink-0" />
              <div>
                <span className="font-bold text-white block">Acompanhar em outro celular</span>
                <span className="text-[11px] text-zinc-400">Compartilhe ou abra o link deste pedido</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={handleCopyLink}
                className="px-2.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer"
                title="Copiar link do pedido"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink ? 'Copiado!' : 'Copiar Link'}</span>
              </button>

              <button
                onClick={handleShare}
                className="p-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded-lg transition-colors cursor-pointer"
                title="Compartilhar"
              >
                <Share2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Vertical Stepper Timeline */}
          <div className="space-y-4 relative pl-4 sm:pl-6 before:absolute before:left-7 sm:before:left-9 before:top-3 before:bottom-3 before:w-0.5 before:bg-zinc-800">
            {steps.map((st, idx) => {
              const Icon = st.icon;
              const isPast = idx < currentStepIdx;
              const isCurrent = idx === currentStepIdx;
              const isFuture = idx > currentStepIdx;

              return (
                <div key={st.status} className="relative flex items-start gap-4 text-left">
                  {/* Step Icon Badge */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 transition-colors ${
                    isPast
                      ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/20'
                      : isCurrent
                      ? 'bg-amber-500 text-black ring-4 ring-amber-500/20 animate-pulse'
                      : 'bg-zinc-900 border border-zinc-800 text-zinc-600'
                  }`}>
                    {isPast ? <CheckCircle2 className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                  </div>

                  {/* Step Info */}
                  <div className="pt-0.5 flex-1">
                    <h4 className={`text-sm font-extrabold ${
                      isCurrent ? 'text-amber-400' : isPast ? 'text-zinc-200' : 'text-zinc-500'
                    }`}>
                      {st.title}
                    </h4>
                    <p className={`text-xs ${isCurrent ? 'text-zinc-300' : 'text-zinc-500'}`}>
                      {st.subtitle}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Order Items Receipt Box */}
          <div className="p-4 bg-zinc-900/70 rounded-xl border border-zinc-800 space-y-3 text-xs">
            <div className="font-bold text-white border-b border-zinc-800 pb-2 flex items-center justify-between">
              <span>Resumo dos Itens ({(activeOrder.items || []).length})</span>
              <span className="text-amber-400 font-extrabold">{formatBRL(activeOrder.total || 0)}</span>
            </div>

            <div className="space-y-2 max-h-40 overflow-y-auto">
              {(activeOrder.items || []).map((it, i) => (
                <div key={i} className="flex justify-between text-zinc-300">
                  <span>{it?.quantity || 1}x {it?.menuItem?.name || (it as any)?.name || 'Item'}</span>
                  <span className="font-medium">{formatBRL(it?.totalPrice || 0)}</span>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-zinc-800/80 space-y-1 text-zinc-400 text-[11px]">
              <div className="flex justify-between">
                <span>Forma de Pagamento:</span>
                <span className="text-zinc-200">{getPaymentMethodLabel(activeOrder.paymentMethod)}</span>
              </div>
              {activeOrder.deliveryAddress && (
                <div className="flex justify-between">
                  <span>Entrega em:</span>
                  <span className="text-zinc-200 text-right truncate max-w-[200px]">
                    {activeOrder.deliveryAddress.street}, {activeOrder.deliveryAddress.number} - {activeOrder.deliveryAddress.neighborhood}
                  </span>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-zinc-950 border-t border-zinc-800 flex items-center gap-3">
          <button
            onClick={() => openWhatsAppOrder(activeOrder, storeSettings)}
            className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs sm:text-sm py-3 rounded-xl shadow transition-colors cursor-pointer"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Falar no WhatsApp da Hamburgueria</span>
          </button>

          <button
            onClick={() => setIsOrderTrackerOpen(false)}
            className="bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-bold text-xs sm:text-sm px-4 py-3 rounded-xl border border-zinc-800 transition-colors cursor-pointer"
          >
            Fechar
          </button>
        </div>

      </div>
    </div>
  );
};
