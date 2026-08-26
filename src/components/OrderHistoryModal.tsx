import React, { useMemo } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { formatBRL, formatDateTime, getPaymentMethodLabel } from '../utils/formatters';
import { 
  X, 
  History, 
  RotateCcw, 
  ShoppingBag, 
  ChevronRight, 
  Eye, 
  CheckCircle2, 
  Clock, 
  Flame,
  Crown,
  Star,
  Gift,
  Lock,
  LogIn
} from 'lucide-react';
import { Order } from '../types';

export const OrderHistoryModal: React.FC = () => {
  const { 
    orders, 
    isOrderHistoryOpen, 
    setIsOrderHistoryOpen, 
    reorder, 
    setActiveOrder, 
    setIsOrderTrackerOpen,
    setIsLoyaltyOpen
  } = useCart();

  const { user, profile, setIsAuthModalOpen, setAuthModalTab } = useAuth();

  if (!isOrderHistoryOpen) return null;

  const currentLoyaltyPoints = profile?.loyaltyPoints ?? (user ? 50 : 0);

  // Filter orders strictly for the logged-in user
  const userOrders = useMemo(() => {
    if (!user) return [];
    return orders.filter(order => {
      const email = order.userEmail || order.customerEmail || order.customer?.email;
      const matchesEmail = Boolean(user.email && email && email.toLowerCase() === user.email.toLowerCase());
      const matchesUid = Boolean(user.uid && order.userId && order.userId === user.uid);
      const phone = order.customerPhone || order.customer?.phone;
      const matchesPhone = Boolean(profile?.phone && phone && phone.replace(/\D/g, '') === profile.phone.replace(/\D/g, ''));
      return matchesEmail || matchesUid || matchesPhone;
    });
  }, [orders, user, profile]);

  const handleTrackOrder = (order: Order) => {
    setActiveOrder(order);
    setIsOrderHistoryOpen(false);
    setIsOrderTrackerOpen(true);
  };

  const handleOpenLoyalty = () => {
    setIsOrderHistoryOpen(false);
    setIsLoyaltyOpen(true);
  };

  const handleOpenLogin = () => {
    setIsOrderHistoryOpen(false);
    setAuthModalTab('login');
    setIsAuthModalOpen(true);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div 
        className="relative bg-zinc-950 border border-zinc-800 w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden flex flex-col text-left max-h-[85vh]"
        onClick={e => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="p-4 sm:p-5 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-white">
                Meus Pedidos Anteriores
              </h3>
              <p className="text-xs text-zinc-400">
                Histórico de pedidos salvos neste dispositivo
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsOrderHistoryOpen(false)}
            className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Orders list */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
          
          {/* Loyalty Club Balance Quick Bar */}
          <div className="p-3.5 bg-gradient-to-r from-amber-500/15 via-yellow-500/20 to-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-400 text-black flex items-center justify-center font-black">
                <Crown className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-black text-white block">Clube Fidelidade PO-PI-DI</span>
                <span className="text-[11px] text-amber-300 font-bold">
                  {user ? `Seu saldo: ${currentLoyaltyPoints} pontos` : 'Faça login para resgatar prêmios'}
                </span>
              </div>
            </div>

            <button
              onClick={handleOpenLoyalty}
              className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-black font-black text-xs rounded-xl shadow transition-all flex items-center gap-1"
            >
              <Gift className="w-3.5 h-3.5" />
              <span>Ver Prêmios</span>
            </button>
          </div>

          {!user ? (
            <div className="py-12 text-center space-y-4 px-4 bg-zinc-900/40 rounded-2xl border border-zinc-800/80">
              <div className="w-14 h-14 rounded-2xl bg-fuchsia-950/50 border border-fuchsia-800/40 flex items-center justify-center mx-auto text-fuchsia-400 shadow-[0_0_15px_rgba(240,70,245,0.2)]">
                <Lock className="w-7 h-7" />
              </div>
              <div className="space-y-1.5 max-w-sm mx-auto">
                <h4 className="text-sm font-black text-white">Identifique-se para ver seus pedidos</h4>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Para sua privacidade e segurança, o histórico de pedidos e o rastreamento em tempo real ficam disponíveis apenas quando você estiver conectado.
                </p>
              </div>
              <button
                type="button"
                onClick={handleOpenLogin}
                className="px-5 py-2.5 bg-gradient-to-r from-emerald-400 to-emerald-500 hover:from-emerald-300 hover:to-emerald-400 text-black font-black text-xs rounded-xl shadow-lg shadow-emerald-950/40 transition-all flex items-center gap-2 mx-auto cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                <span>Entrar com Google / Criar Conta</span>
              </button>
            </div>
          ) : userOrders.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <div className="w-14 h-14 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto text-zinc-600">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-white">Nenhum pedido realizado ainda</h4>
              <p className="text-xs text-zinc-400 max-w-xs mx-auto">
                Assim que você finalizar seu primeiro burger artesanal, ele aparecerá aqui com rastreamento completo!
              </p>
            </div>
          ) : (
            userOrders.map(order => (
              <div
                key={order.id}
                className="p-4 bg-zinc-900/70 hover:bg-zinc-900 rounded-xl border border-zinc-800 space-y-3 transition-colors text-left"
              >
                <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2.5">
                  <div>
                    <span className="font-mono text-xs font-black text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30 mr-2">
                      {order.shortCode}
                    </span>
                    <span className="text-xs text-zinc-400">
                      {formatDateTime(order.createdAt)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Star className="w-3 h-3 fill-amber-400" />
                      +{Math.floor(order.total)} pts
                    </span>

                    <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                      order.status === 'completed'
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        : order.status === 'preparing'
                        ? 'bg-amber-950 text-amber-400 border border-amber-800'
                        : 'bg-blue-950 text-blue-400 border border-blue-800'
                    }`}>
                      {order.status === 'received' && 'Recebido'}
                      {order.status === 'preparing' && 'Na Chapa'}
                      {order.status === 'out_for_delivery' && 'Em Entrega'}
                      {order.status === 'ready' && 'Pronto'}
                      {order.status === 'completed' && 'Entregue'}
                    </span>
                  </div>
                </div>

                {/* Items summary */}
                <div className="text-xs text-zinc-300 space-y-1">
                  {order.items.map((it, idx) => (
                    <div key={idx} className="flex justify-between">
                      <span className="text-zinc-200">
                        {it.quantity}x {it.menuItem.name}
                      </span>
                      <span className="text-zinc-400 font-medium">
                        {formatBRL(it.totalPrice)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Total & Action buttons */}
                <div className="flex items-center justify-between pt-2.5 border-t border-zinc-800/80">
                  <div>
                    <span className="text-[11px] text-zinc-400 block">Total do Pedido:</span>
                    <span className="text-sm font-black text-amber-400">{formatBRL(order.total)}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleTrackOrder(order)}
                      className="flex items-center gap-1 text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-200 px-3 py-1.5 rounded-lg border border-zinc-700 font-medium transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Rastrear</span>
                    </button>

                    <button
                      onClick={() => reorder(order)}
                      className="flex items-center gap-1 text-xs bg-amber-500 hover:bg-amber-400 text-black px-3 py-1.5 rounded-lg font-black transition-colors"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Pedir Novamente</span>
                    </button>
                  </div>
                </div>

              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-zinc-950 border-t border-zinc-800 flex justify-end">
          <button
            onClick={() => setIsOrderHistoryOpen(false)}
            className="bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-bold text-xs px-4 py-2.5 rounded-xl border border-zinc-800 transition-colors"
          >
            Fechar
          </button>
        </div>

      </div>
    </div>
  );
};
