import React from 'react';
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
  Share2, 
  ArrowLeft,
  AlertCircle
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

  if (!isOrderTrackerOpen || !activeOrder || !user) return null;

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
              <h3 className="text-base font-black text-white">
                Acompanhamento do Pedido
              </h3>
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
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">
          
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

          {/* Quick Simulation tool for demo purposes */}
          <div className="p-3 bg-zinc-900/40 rounded-xl border border-zinc-800/60 text-xs text-zinc-400 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
                Simular Atualização de Status:
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {(['received', 'preparing', 'out_for_delivery', 'completed'] as OrderStatus[]).map(st => (
                <button
                  key={st}
                  onClick={() => updateOrderStatus(activeOrder.id, st)}
                  className={`text-[11px] px-2.5 py-1 rounded font-bold transition-colors ${
                    activeOrder.status === st
                      ? 'bg-amber-500 text-black'
                      : 'bg-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                >
                  {st === 'received' && 'Recebido'}
                  {st === 'preparing' && 'Na Chapa'}
                  {st === 'out_for_delivery' && 'Saiu p/ Entrega'}
                  {st === 'completed' && 'Entregue'}
                </button>
              ))}
            </div>
          </div>

          {/* Order Items Receipt Box */}
          <div className="p-4 bg-zinc-900/70 rounded-xl border border-zinc-800 space-y-3 text-xs">
            <div className="font-bold text-white border-b border-zinc-800 pb-2 flex items-center justify-between">
              <span>Resumo dos Itens ({activeOrder.items.length})</span>
              <span className="text-amber-400 font-extrabold">{formatBRL(activeOrder.total)}</span>
            </div>

            <div className="space-y-2 max-h-40 overflow-y-auto">
              {activeOrder.items.map((it, i) => (
                <div key={i} className="flex justify-between text-zinc-300">
                  <span>{it.quantity}x {it.menuItem.name}</span>
                  <span className="font-medium">{formatBRL(it.totalPrice)}</span>
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
            className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs sm:text-sm py-3 rounded-xl shadow transition-colors"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Falar no WhatsApp da Hamburgueria</span>
          </button>

          <button
            onClick={() => setIsOrderTrackerOpen(false)}
            className="bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-bold text-xs sm:text-sm px-4 py-3 rounded-xl border border-zinc-800 transition-colors"
          >
            Fechar
          </button>
        </div>

      </div>
    </div>
  );
};
