import React, { useState, useEffect, useRef } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { formatBRL, formatDateTime, getPaymentMethodLabel, openWhatsAppReadyMessage } from '../utils/formatters';
import { 
  X, 
  ShieldCheck, 
  Lock,
  KeyRound,
  Clock, 
  Flame, 
  Bike, 
  CheckCircle2, 
  ToggleLeft, 
  ToggleRight, 
  Package, 
  Sliders, 
  MessageSquare,
  AlertCircle,
  LogOut,
  Sparkles,
  Database,
  Search,
  Filter,
  Check,
  Ban,
  PhoneCall,
  Maximize2,
  Minimize2,
  Printer,
  Volume2,
  VolumeX,
  Columns,
  LayoutGrid,
  Store,
  RefreshCw,
  ChefHat,
  BellRing,
  AlertTriangle,
  History,
  Archive
} from 'lucide-react';
import { OrderStatus, Order } from '../types';

function playKitchenChime() {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc.frequency.setValueAtTime(880, ctx.currentTime + 0.12); // A5

    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.45);
  } catch (e) {
    // Audio context may be restricted by browser policy before first user interaction
  }
}

function printKitchenReceipt(order: Order) {
  const printWindow = window.open('', '_blank', 'width=400,height=600');
  if (!printWindow) {
    alert('Por favor, permita popups para imprimir a comanda da cozinha.');
    return;
  }

  const printHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>Comanda Cozinha #${order.shortCode} - PO-PI-DI</title>
        <style>
          @media print {
            @page { margin: 0; size: 80mm auto; }
            body { margin: 10px; }
          }
          body {
            font-family: 'Courier New', Courier, monospace;
            font-size: 13px;
            color: #000;
            line-height: 1.4;
            max-width: 320px;
            margin: 0 auto;
            padding: 12px;
          }
          .text-center { text-align: center; }
          .bold { font-weight: bold; }
          .title { font-size: 16px; margin: 4px 0; }
          .code { font-size: 22px; font-weight: 900; margin: 6px 0; letter-spacing: 2px; }
          .divider { border-top: 1px dashed #000; margin: 8px 0; }
          .item { margin: 8px 0; padding-bottom: 4px; }
          .item-name { font-size: 14px; font-weight: bold; }
          .customization { font-size: 12px; margin-left: 10px; }
          .obs { font-weight: bold; background: #eee; padding: 2px 4px; margin-top: 4px; display: inline-block; }
          .total { font-size: 16px; font-weight: bold; text-align: right; margin-top: 8px; }
        </style>
      </head>
      <body>
        <div class="text-center">
          <div class="title bold">PO-PI-DI HAMBURGUERIA & CHOPERIA</div>
          <div>Porto Feliz - SP</div>
          <div class="divider"></div>
          <div class="code">PEDIDO #${order.shortCode}</div>
          <div class="bold">${order.orderType === 'delivery' ? '🛵 ENTREGA / DELIVERY' : '🛍️ RETIRADA NO BALCÃO'}</div>
          <div>${new Date(order.createdAt).toLocaleString('pt-BR')}</div>
        </div>

        <div class="divider"></div>
        <div><strong>Cliente:</strong> ${order.customer.name}</div>
        <div><strong>Telefone:</strong> ${order.customer.phone}</div>
        ${order.deliveryAddress ? `
          <div><strong>Endereço:</strong> ${order.deliveryAddress.street}, ${order.deliveryAddress.number}</div>
          <div><strong>Bairro:</strong> ${order.deliveryAddress.neighborhood}</div>
          ${order.deliveryAddress.complement ? `<div><strong>Compl:</strong> ${order.deliveryAddress.complement}</div>` : ''}
          ${order.deliveryAddress.reference ? `<div><strong>Ref:</strong> ${order.deliveryAddress.reference}</div>` : ''}
        ` : ''}

        <div class="divider"></div>
        <div class="bold text-center">--- COMANDA DA COZINHA ---</div>
        <div class="divider"></div>

        ${order.items.map(it => `
          <div class="item">
            <div class="item-name">${it.quantity}x ${it.menuItem.name}</div>
            ${it.customizations && it.customizations.length > 0 ? it.customizations.map(c => `
              <div class="customization">• <strong>${c.groupTitle}:</strong> ${c.selectedOptions.map(o => o.name).join(', ')}</div>
            `).join('') : ''}
            ${it.notes ? `<div class="obs">⚠️ OBS: ${it.notes}</div>` : ''}
          </div>
        `).join('')}

        <div class="divider"></div>
        <div><strong>Pagamento:</strong> ${getPaymentMethodLabel(order.paymentMethod)}</div>
        ${order.cashChangeFor ? `<div><strong>Troco para:</strong> R$ ${order.cashChangeFor.toFixed(2)} (Troco: R$ ${(order.cashChangeFor - order.total).toFixed(2)})</div>` : ''}
        <div class="total">TOTAL: R$ ${order.total.toFixed(2)}</div>
        <div class="divider"></div>
        <div class="text-center" style="font-size: 11px;">Impresso via KDS PO-PI-DI</div>
      </body>
    </html>
  `;

  printWindow.document.write(printHtml);
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => {
    printWindow.print();
    printWindow.close();
  }, 350);
}

export const AdminDashboard: React.FC = () => {
  const {
    isAdminOpen,
    setIsAdminOpen,
    orders,
    updateOrderStatus,
    storeSettings,
    updateStoreSettings,
    menuItems,
    toggleItemAvailability,
    setIsMenuEditorOpen,
  } = useCart();

  const { isAdmin, adminLogout, setIsAdminLoginOpen } = useAuth();

  // Maximized by default for high productivity
  const [isMaximized, setIsMaximized] = useState(true);
  const [activeTab, setActiveTab] = useState<'orders' | 'history' | 'menu' | 'settings'>('orders');
  const [viewMode, setViewMode] = useState<'kanban' | 'grid'>('kanban');
  const [orderFilter, setOrderFilter] = useState<'all' | 'received' | 'preparing' | 'out_for_delivery'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'delivery' | 'takeaway'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // History tab states
  const [historySearchQuery, setHistorySearchQuery] = useState('');
  const [historyTypeFilter, setHistoryTypeFilter] = useState<'all' | 'delivery' | 'takeaway'>('all');
  const [historyStatusFilter, setHistoryStatusFilter] = useState<'all' | 'completed' | 'cancelled'>('all');

  const [soundEnabled, setSoundEnabled] = useState(true);
  const [nowTime, setNowTime] = useState(Date.now());
  const [customPinInput, setCustomPinInput] = useState(storeSettings.adminPin || '1234');
  const [customPassInput, setCustomPassInput] = useState(storeSettings.adminPassword || 'popidi@2026');
  const [pinSavedFeedback, setPinSavedFeedback] = useState(false);
  const [newOrderAlert, setNewOrderAlert] = useState<Order | null>(null);

  const previousOrdersCountRef = useRef(orders.length);

  // Live minute ticker for elapsed times
  useEffect(() => {
    const timer = setInterval(() => {
      setNowTime(Date.now());
    }, 15000);
    return () => clearInterval(timer);
  }, []);

  // Sound chime & visual notification banner when new order arrives from cloud
  useEffect(() => {
    if (orders.length > previousOrdersCountRef.current && previousOrdersCountRef.current > 0) {
      const latestOrder = orders[0];
      if (latestOrder && latestOrder.status === 'received') {
        setNewOrderAlert(latestOrder);
        if (soundEnabled) {
          playKitchenChime();
        }
      }
    }
    previousOrdersCountRef.current = orders.length;
  }, [orders, soundEnabled]);

  if (!isAdminOpen) return null;

  // Strict Security Guard: If not logged in as admin, require password
  if (!isAdmin) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
        <div className="max-w-sm w-full p-6 rounded-3xl bg-[#0e0914] border-2 border-yellow-500/50 text-center shadow-[0_0_40px_rgba(234,179,8,0.25)] space-y-4">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-yellow-500/20 border border-yellow-500/40 flex items-center justify-center text-yellow-400 shadow-lg">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-base font-black text-white">Acesso do Administrador</h3>
            <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
              O Painel de Gestão da Cozinha e Choperia Pó Pi Di exige autenticação com a Senha Master ou PIN do Gerente.
            </p>
          </div>
          <div className="space-y-2 pt-2">
            <button
              type="button"
              onClick={() => {
                setIsAdminOpen(false);
                setIsAdminLoginOpen(true);
              }}
              className="w-full py-3.5 bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-black font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-yellow-500/25 transition-all cursor-pointer"
            >
              Digitar Senha do ADM
            </button>
            <button
              type="button"
              onClick={() => setIsAdminOpen(false)}
              className="w-full py-2.5 bg-zinc-900 text-zinc-400 hover:text-white text-xs font-bold rounded-xl border border-zinc-800 transition-colors cursor-pointer"
            >
              Voltar ao Cardápio
            </button>
          </div>
        </div>
      </div>
    );
  }

  const toggleNativeFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const getMinutesAgo = (dateStr: string) => {
    const time = new Date(dateStr).getTime();
    const diffMs = nowTime - time;
    return Math.max(0, Math.floor(diffMs / (1000 * 60)));
  };

  // Active Orders (Not completed and not cancelled)
  const activeOrders = orders.filter(o => o.status !== 'completed' && o.status !== 'cancelled');
  const historyOrders = orders.filter(o => o.status === 'completed' || o.status === 'cancelled');

  const pendingOrders = activeOrders.filter(o => o.status === 'received');
  const preparingOrders = activeOrders.filter(o => o.status === 'preparing');
  const outForDeliveryOrders = activeOrders.filter(o => o.status === 'out_for_delivery' || o.status === 'ready');
  const completedOrders = historyOrders.filter(o => o.status === 'completed');
  const cancelledOrders = historyOrders.filter(o => o.status === 'cancelled');
  const activeOrdersCount = activeOrders.length;

  const filteredActiveOrders = activeOrders.filter(order => {
    const matchesStatus = orderFilter === 'all' || 
      (orderFilter === 'received' && order.status === 'received') ||
      (orderFilter === 'preparing' && order.status === 'preparing') ||
      (orderFilter === 'out_for_delivery' && (order.status === 'out_for_delivery' || order.status === 'ready'));
    const matchesType = typeFilter === 'all' || order.orderType === typeFilter;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q || 
      order.shortCode.toLowerCase().includes(q) ||
      order.customer.name.toLowerCase().includes(q) ||
      order.customer.phone.includes(q) ||
      (order.deliveryAddress && order.deliveryAddress.neighborhood.toLowerCase().includes(q)) ||
      order.items.some(i => i.menuItem.name.toLowerCase().includes(q));
    return matchesStatus && matchesType && matchesSearch;
  });

  const filteredHistoryOrders = historyOrders.filter(order => {
    const matchesStatus = historyStatusFilter === 'all' || order.status === historyStatusFilter;
    const matchesType = historyTypeFilter === 'all' || order.orderType === historyTypeFilter;
    const q = historySearchQuery.toLowerCase().trim();
    const matchesSearch = !q ||
      order.shortCode.toLowerCase().includes(q) ||
      order.customer.name.toLowerCase().includes(q) ||
      order.customer.phone.includes(q) ||
      (order.deliveryAddress && order.deliveryAddress.neighborhood.toLowerCase().includes(q)) ||
      order.items.some(i => i.menuItem.name.toLowerCase().includes(q));
    return matchesStatus && matchesType && matchesSearch;
  });

  const totalRevenueToday = orders
    .filter(o => o.status !== 'cancelled')
    .reduce((sum, o) => sum + o.total, 0);

  const completedRevenue = completedOrders.reduce((sum, o) => sum + o.total, 0);

  const handleAdminSignOut = () => {
    adminLogout();
    setIsAdminOpen(false);
  };

  const handleOpenWhatsAppCustomer = (order: Order, customMessage?: string) => {
    const cleanPhone = order.customer.phone.replace(/\D/g, '');
    const phoneWithDDI = cleanPhone.length <= 11 ? `55${cleanPhone}` : cleanPhone;
    const defaultText = order.status === 'ready' || order.status === 'out_for_delivery'
      ? `Olá ${order.customer.name}! Seu Pedido está Pronto!`
      : `Olá ${order.customer.name}! Aqui é da equipe PO-PI-DI Hamburgueria & Choperia referente ao seu pedido #${order.shortCode}.`;
    const msg = encodeURIComponent(customMessage || defaultText);
    window.open(`https://wa.me/${phoneWithDDI}?text=${msg}`, '_blank');
  };

  const handleMarkAsReady = (order: Order) => {
    const nextStatus = order.orderType === 'delivery' ? 'out_for_delivery' : 'ready';
    updateOrderStatus(order.id, nextStatus);
    // Notify customer via WhatsApp
    openWhatsAppReadyMessage(order);
  };

  // Helper render for an individual Order Card
  const renderOrderCard = (order: Order, isKanbanColumn: boolean = false) => {
    const minutesAgo = getMinutesAgo(order.createdAt);
    const isLate = order.status !== 'completed' && order.status !== 'cancelled' && minutesAgo >= 25;
    const isWarning = order.status !== 'completed' && order.status !== 'cancelled' && minutesAgo >= 15 && minutesAgo < 25;

    return (
      <div
        key={order.id}
        className={`p-4 rounded-2xl border transition-all text-left flex flex-col justify-between shadow-md ${
          order.status === 'received'
            ? 'bg-zinc-950/90 border-yellow-500/70 shadow-yellow-950/20'
            : order.status === 'preparing'
            ? 'bg-zinc-950/90 border-orange-500/70 shadow-orange-950/20'
            : order.status === 'out_for_delivery' || order.status === 'ready'
            ? 'bg-zinc-950/90 border-blue-500/70 shadow-blue-950/20'
            : order.status === 'cancelled'
            ? 'bg-red-950/20 border-red-900/50 opacity-60'
            : 'bg-zinc-950/60 border-zinc-800'
        }`}
      >
        <div className="space-y-3">
          {/* Top Header of Card */}
          <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2.5 gap-2">
            <div className="flex items-center gap-2">
              <span className="font-mono text-base font-black text-yellow-400 bg-zinc-900 px-2.5 py-1 rounded-xl border border-zinc-700 shadow-inner">
                #{order.shortCode}
              </span>
              <span className={`text-[11px] font-black uppercase px-2 py-1 rounded-lg flex items-center gap-1 ${
                order.orderType === 'delivery'
                  ? 'bg-blue-950/80 text-blue-300 border border-blue-800/60'
                  : 'bg-amber-950/80 text-amber-300 border border-amber-800/60'
              }`}>
                {order.orderType === 'delivery' ? <Bike className="w-3.5 h-3.5" /> : <Store className="w-3.5 h-3.5" />}
                <span>{order.orderType === 'delivery' ? 'Delivery' : 'Retirada'}</span>
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Elapsed Time Badge */}
              <span className={`text-xs font-black px-2 py-0.5 rounded-md flex items-center gap-1 ${
                isLate 
                  ? 'bg-red-500/20 text-red-400 border border-red-500 animate-pulse'
                  : isWarning
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/50'
                  : 'bg-zinc-900 text-zinc-400 border border-zinc-800'
              }`}>
                <Clock className="w-3 h-3" />
                <span>{minutesAgo} min</span>
              </span>

              {/* Print Ticket Button */}
              <button
                type="button"
                onClick={() => printKitchenReceipt(order)}
                className="p-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white rounded-lg border border-zinc-700 transition-colors"
                title="Imprimir Comanda da Cozinha"
              >
                <Printer className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Customer and Address Information */}
          <div className="flex items-start justify-between text-xs gap-2 bg-zinc-900/60 p-2.5 rounded-xl border border-zinc-850">
            <div className="min-w-0 flex-1">
              <div className="font-black text-white text-sm truncate flex items-center gap-1.5">
                <span>{order.customer.name}</span>
                {isLate && (
                  <span className="text-[10px] bg-red-600 text-white font-black px-1.5 py-0.5 rounded uppercase">
                    Atrasado
                  </span>
                )}
              </div>
              <div className="text-zinc-400 flex items-center gap-1 mt-0.5 font-mono text-[11px]">
                <PhoneCall className="w-3 h-3 text-emerald-400" />
                <span>{order.customer.phone}</span>
              </div>
              {order.deliveryAddress && (
                <div className="text-zinc-300 mt-1 font-medium text-[11px] leading-tight">
                  📍 {order.deliveryAddress.street}, {order.deliveryAddress.number} - <strong className="text-amber-400">{order.deliveryAddress.neighborhood}</strong>
                  {order.deliveryAddress.complement && ` (${order.deliveryAddress.complement})`}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => handleOpenWhatsAppCustomer(order)}
              className="p-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl transition-colors shrink-0 shadow-sm"
              title="Chamar cliente no WhatsApp"
            >
              <MessageSquare className="w-4 h-4" />
            </button>
          </div>

          {/* Order Items (Kitchen Ticket View) */}
          <div className="p-3 bg-black/60 rounded-xl border border-zinc-850 space-y-2 text-xs">
            {order.items.map((it, idx) => (
              <div key={idx} className="border-b border-zinc-900 last:border-0 pb-2 last:pb-0">
                <div className="flex justify-between items-start font-black text-zinc-100 text-sm">
                  <span className="flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-md bg-yellow-500 text-black flex items-center justify-center font-black text-xs shrink-0">
                      {it.quantity}
                    </span>
                    <span>{it.menuItem.name}</span>
                  </span>
                  <span className="text-yellow-400 font-mono text-xs">{formatBRL(it.totalPrice)}</span>
                </div>

                {it.customizations && it.customizations.length > 0 && (
                  <div className="text-[11px] text-zinc-300 pl-6 mt-1 space-y-0.5">
                    {it.customizations.map(c => (
                      <div key={c.groupId}>
                        • <strong className="text-zinc-400">{c.groupTitle}:</strong>{' '}
                        <span className="text-amber-300 font-semibold">{c.selectedOptions.map(o => o.name).join(', ')}</span>
                      </div>
                    ))}
                  </div>
                )}

                {it.notes && (
                  <div className="text-[11px] text-amber-300 bg-amber-950/40 border border-amber-800/40 rounded-md p-1 pl-2 mt-1.5 font-medium flex items-start gap-1">
                    <span>⚠️ OBS:</span>
                    <span>{it.notes}</span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Payment Method & Total */}
          <div className="flex items-center justify-between text-xs pt-1 px-1">
            <div>
              <span className="text-zinc-400 block text-[10px]">Forma de Pagamento:</span>
              <span className="font-bold text-zinc-200">{getPaymentMethodLabel(order.paymentMethod)}</span>
              {order.cashChangeFor && (
                <span className="text-[11px] text-yellow-400 block font-bold">Troco p/ {formatBRL(order.cashChangeFor)}</span>
              )}
            </div>

            <div className="text-right">
              <span className="text-zinc-400 block text-[10px]">Total:</span>
              <span className="text-base font-black text-yellow-400">{formatBRL(order.total)}</span>
            </div>
          </div>
        </div>

        {/* Status / Action Footer */}
        {order.status === 'completed' ? (
          <div className="pt-3 mt-3 border-t border-zinc-800/90 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-black text-emerald-400 bg-emerald-950/60 border border-emerald-800/50 px-3 py-1.5 rounded-xl">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Pedido Finalizado & Concluído</span>
            </div>
            <span className="text-[10px] text-zinc-500 font-medium italic">
              Apenas Visualização
            </span>
          </div>
        ) : order.status === 'cancelled' ? (
          <div className="pt-3 mt-3 border-t border-zinc-800/90 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-black text-red-400 bg-red-950/60 border border-red-800/50 px-3 py-1.5 rounded-xl">
              <Ban className="w-4 h-4 text-red-400 shrink-0" />
              <span>Pedido Cancelado</span>
            </div>
            <span className="text-[10px] text-zinc-500 font-medium italic">
              Apenas Visualização
            </span>
          </div>
        ) : (
          /* Active Order Action Controls for Kitchen / Operator */
          <div className="pt-3 mt-3 border-t border-zinc-800/90 flex flex-col gap-1.5">
            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => updateOrderStatus(order.id, 'preparing')}
                className={`py-2 px-1 rounded-xl font-black text-[11px] transition-all flex items-center justify-center gap-1 cursor-pointer ${
                  order.status === 'preparing'
                    ? 'bg-orange-500 text-black shadow-md shadow-orange-500/20 scale-[1.02]'
                    : 'bg-zinc-900 text-orange-400 hover:bg-orange-600 hover:text-black border border-zinc-800'
                }`}
              >
                <Flame className="w-3.5 h-3.5" />
                <span>Na Chapa</span>
              </button>

              <button
                type="button"
                onClick={() => handleMarkAsReady(order)}
                className={`py-2 px-1 rounded-xl font-black text-[11px] transition-all flex items-center justify-center gap-1 cursor-pointer ${
                  order.status === 'out_for_delivery' || order.status === 'ready'
                    ? 'bg-blue-500 text-black shadow-md shadow-blue-500/20 scale-[1.02]'
                    : 'bg-zinc-900 text-blue-400 hover:bg-blue-600 hover:text-black border border-zinc-800'
                }`}
                title={order.orderType === 'delivery' ? 'Despachar para entrega e avisar cliente' : 'Marcar como pronto e avisar cliente no WhatsApp'}
              >
                {order.orderType === 'delivery' ? <Bike className="w-3.5 h-3.5" /> : <Store className="w-3.5 h-3.5" />}
                <span>{order.orderType === 'delivery' ? 'Despachar' : 'Pronto'}</span>
              </button>

              <button
                type="button"
                onClick={() => updateOrderStatus(order.id, 'completed')}
                className="py-2 px-1 rounded-xl font-black text-[11px] transition-all flex items-center justify-center gap-1 bg-zinc-900 text-emerald-400 hover:bg-emerald-600 hover:text-black border border-zinc-800 cursor-pointer shadow-sm"
              >
                <Check className="w-3.5 h-3.5 stroke-[3]" />
                <span>Concluir</span>
              </button>
            </div>

            {/* Quick Notify WhatsApp Button: "Seu Pedido está Pronto!" */}
            {(order.status === 'ready' || order.status === 'out_for_delivery' || order.status === 'preparing') && (
              <button
                type="button"
                onClick={() => openWhatsAppReadyMessage(order)}
                className="w-full py-1.5 px-2 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-300 font-black text-[11px] rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                title="Avisar cliente via WhatsApp que o pedido está pronto"
              >
                <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                <span>Avisar WhatsApp: "Seu Pedido está Pronto!"</span>
              </button>
            )}

            <div className="flex justify-end pt-0.5">
              <button
                type="button"
                onClick={() => {
                  if (window.confirm(`Deseja cancelar o pedido #${order.shortCode}?`)) {
                    updateOrderStatus(order.id, 'cancelled');
                  }
                }}
                className="text-[10px] text-zinc-500 hover:text-red-400 flex items-center gap-1 transition-colors py-0.5 px-2 rounded-lg hover:bg-red-950/30 cursor-pointer"
              >
                <Ban className="w-3 h-3" />
                <span>Cancelar Pedido</span>
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`fixed inset-0 z-50 overflow-hidden bg-black/90 backdrop-blur-md flex items-center justify-center animate-in fade-in duration-150 ${
      isMaximized ? 'p-0' : 'p-2 sm:p-4'
    }`}>
      <div 
        className={`relative bg-[#0b0d13] border border-zinc-800 shadow-2xl overflow-hidden flex flex-col text-left transition-all ${
          isMaximized 
            ? 'w-full h-full rounded-none max-w-none max-h-none'
            : 'w-full max-w-6xl rounded-3xl max-h-[92vh]'
        }`}
        onClick={e => e.stopPropagation()}
      >
        
        {/* Top Header */}
        <div className="p-3.5 sm:p-4 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-yellow-500 to-amber-600 text-black flex items-center justify-center font-black shadow-lg shadow-yellow-500/20 shrink-0">
              <ChefHat className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-black text-white uppercase tracking-tight">
                  Painel de Pedidos & Cozinha (KDS Maximizado)
                </h2>
                <span className="flex items-center gap-1 text-[10px] font-black uppercase bg-emerald-950 text-emerald-400 border border-emerald-500/40 px-2 py-0.5 rounded-full shadow-sm">
                  <Database className="w-3 h-3" />
                  Sincronização em Tempo Real (Firestore)
                </span>
              </div>
              <p className="text-xs text-zinc-400 hidden sm:block">
                Monitor de Chapa • Expedição de Delivery • Gestão de Estoque • Impressão de Comandas
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Sound Toggle */}
            <button
              type="button"
              onClick={() => {
                setSoundEnabled(!soundEnabled);
                if (!soundEnabled) playKitchenChime();
              }}
              className={`p-2.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-colors ${
                soundEnabled 
                  ? 'bg-amber-500/15 border-amber-500/40 text-amber-300 hover:bg-amber-500/25'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-zinc-300'
              }`}
              title={soundEnabled ? 'Alerta Sonoro Ativo (Clique para silenciar)' : 'Alerta Sonoro Desativado (Clique para ativar)'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-amber-400" /> : <VolumeX className="w-4 h-4" />}
              <span className="hidden md:inline">{soundEnabled ? 'Som Ativo' : 'Mudo'}</span>
            </button>

            {/* Editar Cardápio e Informações (Requested Button) */}
            <button
              type="button"
              onClick={() => setIsMenuEditorOpen(true)}
              className="p-2.5 rounded-xl border border-yellow-500/60 bg-gradient-to-r from-yellow-500/25 via-amber-500/20 to-yellow-500/25 hover:from-yellow-400 hover:to-amber-400 hover:text-black text-yellow-300 text-xs font-black flex items-center gap-2 transition-all shadow-md shadow-yellow-500/10 cursor-pointer active:scale-95"
              title="Cadastrar Novos Pastéis, Alterar Preços, Fotos e Informações das Seções da Página"
            >
              <Sliders className="w-4 h-4 text-yellow-400 stroke-[2.5]" />
              <span className="inline">Editar Cardápio e Informações</span>
            </button>

            {/* Maximize / Restore Toggle */}
            <button
              type="button"
              onClick={() => setIsMaximized(!isMaximized)}
              className="p-2.5 text-zinc-300 hover:text-white rounded-xl bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 transition-colors flex items-center gap-1.5 text-xs font-bold"
              title={isMaximized ? 'Restaurar Janela' : 'Maximizar Tela'}
            >
              {isMaximized ? (
                <>
                  <Minimize2 className="w-4 h-4 text-amber-400" />
                  <span className="hidden lg:inline">Restaurar</span>
                </>
              ) : (
                <>
                  <Maximize2 className="w-4 h-4 text-amber-400" />
                  <span className="hidden lg:inline">Maximizar</span>
                </>
              )}
            </button>

            {/* Logout Admin */}
            <button
              type="button"
              onClick={handleAdminSignOut}
              className="flex items-center gap-1 text-xs text-zinc-400 hover:text-red-400 px-3 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-red-900/40 transition-colors"
              title="Sair do Modo Admin"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden xl:inline">Desconectar</span>
            </button>

            {/* Close Button */}
            <button
              type="button"
              onClick={() => setIsAdminOpen(false)}
              className="p-2.5 text-zinc-400 hover:text-white rounded-xl bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 transition-colors"
              title="Fechar Painel"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Real-Time New Incoming Order Alert Banner */}
        {newOrderAlert && (
          <div className="bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-black px-4 py-3 border-b-2 border-yellow-300 flex items-center justify-between shadow-xl animate-pulse">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-black text-yellow-400 rounded-xl">
                <BellRing className="w-5 h-5 animate-bounce" />
              </div>
              <div>
                <div className="font-black text-sm uppercase tracking-wide flex items-center gap-2">
                  <span>🔔 NOVO PEDIDO CHEGOU NA COZINHA!</span>
                  <span className="bg-black text-yellow-400 px-2 py-0.5 rounded-lg text-xs font-mono font-black">{newOrderAlert.shortCode}</span>
                </div>
                <div className="text-xs font-bold text-black/85 mt-0.5">
                  Cliente: <strong>{newOrderAlert.customer.name}</strong> ({newOrderAlert.customer.phone}) • Total: <strong>{formatBRL(newOrderAlert.total)}</strong> • {newOrderAlert.orderType === 'delivery' ? '🛵 Entrega' : '🛍️ Retirada'}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  updateOrderStatus(newOrderAlert.id, 'preparing');
                  setNewOrderAlert(null);
                }}
                className="px-3.5 py-2 bg-black hover:bg-zinc-900 text-yellow-400 rounded-xl font-black text-xs uppercase tracking-wider transition-transform active:scale-95 cursor-pointer shadow flex items-center gap-1.5"
              >
                <Flame className="w-3.5 h-3.5" />
                <span>Mandar p/ Chapa</span>
              </button>
              <button
                type="button"
                onClick={() => printKitchenReceipt(newOrderAlert)}
                className="px-3 py-2 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer"
                title="Imprimir comanda"
              >
                <Printer className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Imprimir</span>
              </button>
              <button
                type="button"
                onClick={() => setNewOrderAlert(null)}
                className="p-2 hover:bg-black/15 text-black rounded-lg transition-colors cursor-pointer"
                title="Dispensar aviso"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Top KPI Metrics Bar */}
        <div className="grid grid-cols-2 lg:grid-cols-5 bg-zinc-900/60 border-b border-zinc-800 p-3 sm:p-4 gap-2.5 text-xs shrink-0">
          <div className="p-3 bg-zinc-950 rounded-2xl border border-yellow-500/30 flex items-center justify-between">
            <div>
              <span className="text-zinc-400 block text-[11px] font-bold">1. Novos / A Fazer</span>
              <span className="text-2xl font-black text-yellow-400">{pendingOrders.length}</span>
            </div>
            <div className="w-9 h-9 rounded-xl bg-yellow-500/10 text-yellow-400 flex items-center justify-center font-bold">
              <Clock className="w-5 h-5" />
            </div>
          </div>

          <div className="p-3 bg-zinc-950 rounded-2xl border border-orange-500/30 flex items-center justify-between">
            <div>
              <span className="text-zinc-400 block text-[11px] font-bold">2. Na Chapa / Cozinha</span>
              <span className="text-2xl font-black text-orange-400">{preparingOrders.length}</span>
            </div>
            <div className="w-9 h-9 rounded-xl bg-orange-500/10 text-orange-400 flex items-center justify-center font-bold">
              <Flame className="w-5 h-5" />
            </div>
          </div>

          <div className="p-3 bg-zinc-950 rounded-2xl border border-blue-500/30 flex items-center justify-between">
            <div>
              <span className="text-zinc-400 block text-[11px] font-bold">3. Expedição / Trânsito</span>
              <span className="text-2xl font-black text-blue-400">{outForDeliveryOrders.length}</span>
            </div>
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold">
              <Bike className="w-5 h-5" />
            </div>
          </div>

          <div className="p-3 bg-zinc-950 rounded-2xl border border-emerald-500/30 flex items-center justify-between">
            <div>
              <span className="text-zinc-400 block text-[11px] font-bold">Faturamento Acumulado</span>
              <span className="text-xl font-black text-emerald-400">{formatBRL(totalRevenueToday)}</span>
            </div>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>

          <div className="p-3 bg-zinc-950 rounded-2xl border border-zinc-800 flex items-center justify-between col-span-2 lg:col-span-1">
            <div>
              <span className="text-zinc-400 block text-[11px] font-bold">Status do Estabelecimento</span>
              <span className={`font-black text-sm ${storeSettings.isOpen ? 'text-emerald-400' : 'text-red-400'}`}>
                {storeSettings.isOpen ? '● Aberto para Pedidos' : '● Fechado no Momento'}
              </span>
            </div>
            <button
              type="button"
              onClick={() => updateStoreSettings({ isOpen: !storeSettings.isOpen })}
              className="text-zinc-400 hover:text-white p-1"
              title="Alternar Aberto / Fechado"
            >
              {storeSettings.isOpen ? (
                <ToggleRight className="w-8 h-8 text-emerald-500" />
              ) : (
                <ToggleLeft className="w-8 h-8 text-zinc-600" />
              )}
            </button>
          </div>
        </div>

        {/* Tab Navigation & Toolbar */}
        <div className="flex flex-wrap items-center justify-between border-b border-zinc-800 bg-zinc-950/70 text-xs font-bold px-3 sm:px-5 shrink-0">
          <div className="flex gap-1 overflow-x-auto">
            <button
              type="button"
              onClick={() => setActiveTab('orders')}
              className={`px-4 py-3.5 border-b-2 transition-colors flex items-center gap-2 cursor-pointer ${
                activeTab === 'orders'
                  ? 'border-yellow-500 text-yellow-400 bg-yellow-500/5 font-black'
                  : 'border-transparent text-zinc-400 hover:text-white'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>Comandas Ativas ({activeOrdersCount})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('history')}
              className={`px-4 py-3.5 border-b-2 transition-colors flex items-center gap-2 cursor-pointer ${
                activeTab === 'history'
                  ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5 font-black'
                  : 'border-transparent text-zinc-400 hover:text-white'
              }`}
            >
              <History className="w-4 h-4" />
              <span>Histórico de Concluídos ({historyOrders.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('menu')}
              className={`px-4 py-3.5 border-b-2 transition-colors flex items-center gap-2 cursor-pointer ${
                activeTab === 'menu'
                  ? 'border-yellow-500 text-yellow-400 bg-yellow-500/5 font-black'
                  : 'border-transparent text-zinc-400 hover:text-white'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>Estoque & Cardápio</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('settings')}
              className={`px-4 py-3.5 border-b-2 transition-colors flex items-center gap-2 cursor-pointer ${
                activeTab === 'settings'
                  ? 'border-yellow-500 text-yellow-400 bg-yellow-500/5 font-black'
                  : 'border-transparent text-zinc-400 hover:text-white'
              }`}
            >
              <Sliders className="w-4 h-4" />
              <span>Configurações & Avisos</span>
            </button>
          </div>

          {activeTab === 'orders' && (
            <div className="flex items-center gap-2 py-2">
              <div className="bg-zinc-900 p-1 rounded-xl border border-zinc-800 flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setViewMode('kanban')}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    viewMode === 'kanban' ? 'bg-amber-500 text-black shadow-sm' : 'text-zinc-400 hover:text-white'
                  }`}
                  title="Visão KDS em Colunas (Kanban de Cozinha)"
                >
                  <Columns className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Colunas KDS</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    viewMode === 'grid' ? 'bg-amber-500 text-black shadow-sm' : 'text-zinc-400 hover:text-white'
                  }`}
                  title="Visão em Grade / Lista Completa"
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Grade</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-5 bg-[#090b10]">
          
          {/* TAB 1: ACTIVE ORDERS & KITCHEN DISPLAY */}
          {activeTab === 'orders' && (
            <div className="space-y-4 h-full flex flex-col">
              
              {/* Search & Filter Bar */}
              <div className="flex flex-col lg:flex-row gap-2.5 items-stretch lg:items-center justify-between shrink-0 bg-zinc-950/80 p-3 rounded-2xl border border-zinc-850">
                <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center flex-1">
                  {/* Search box */}
                  <div className="relative flex-1 max-w-md">
                    <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      placeholder="Buscar por comanda (#0123), cliente, telefone ou item..."
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-yellow-500"
                    />
                  </div>

                  {/* Order Type Filter */}
                  <div className="flex items-center gap-1 bg-zinc-900 p-1 rounded-xl border border-zinc-800">
                    <button
                      type="button"
                      onClick={() => setTypeFilter('all')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        typeFilter === 'all' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      Todos
                    </button>
                    <button
                      type="button"
                      onClick={() => setTypeFilter('delivery')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                        typeFilter === 'delivery' ? 'bg-blue-600 text-white' : 'text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      <Bike className="w-3.5 h-3.5" />
                      <span>Delivery</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setTypeFilter('takeaway')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                        typeFilter === 'takeaway' ? 'bg-amber-600 text-white' : 'text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      <Store className="w-3.5 h-3.5" />
                      <span>Retirada</span>
                    </button>
                  </div>
                </div>

                {/* Status Pills (Active Only) */}
                <div className="flex items-center gap-1 overflow-x-auto pb-1 lg:pb-0">
                  <button
                    type="button"
                    onClick={() => setOrderFilter('all')}
                    className={`px-2.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                      orderFilter === 'all' ? 'bg-white text-black' : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
                    }`}
                  >
                    Todos Ativos ({activeOrders.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setOrderFilter('received')}
                    className={`px-2.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                      orderFilter === 'received' ? 'bg-yellow-500 text-black' : 'bg-zinc-900 text-yellow-400 hover:bg-zinc-800 border border-zinc-800'
                    }`}
                  >
                    🟡 Novos ({pendingOrders.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setOrderFilter('preparing')}
                    className={`px-2.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                      orderFilter === 'preparing' ? 'bg-orange-500 text-black' : 'bg-zinc-900 text-orange-400 hover:bg-zinc-800 border border-zinc-800'
                    }`}
                  >
                    🔥 Na Chapa ({preparingOrders.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setOrderFilter('out_for_delivery')}
                    className={`px-2.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                      orderFilter === 'out_for_delivery' ? 'bg-blue-500 text-black' : 'bg-zinc-900 text-blue-400 hover:bg-zinc-800 border border-zinc-800'
                    }`}
                  >
                    🛵 Expedição ({outForDeliveryOrders.length})
                  </button>
                </div>
              </div>

              {filteredActiveOrders.length === 0 ? (
                <div className="py-20 text-center text-zinc-500 bg-zinc-950/40 rounded-3xl border border-zinc-900 flex-1 flex flex-col items-center justify-center">
                  <ChefHat className="w-12 h-12 mb-3 text-yellow-400/50" />
                  <p className="text-base font-bold text-zinc-300">Nenhuma comanda ativa pendente no momento.</p>
                  <p className="text-xs text-zinc-500 mt-1 max-w-md">
                    Todos os pedidos concluídos foram movidos para a aba "Histórico de Concluídos". Novos pedidos no cardápio entrarão aqui instantaneamente.
                  </p>
                </div>
              ) : viewMode === 'kanban' ? (
                /* KANBAN BOARD VIEW (3 ACTIVE COLUMNS) */
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1 items-start">
                  
                  {/* COLUMN 1: PENDING / NEW */}
                  <div className="bg-zinc-950/80 rounded-2xl border border-yellow-500/40 p-3 flex flex-col gap-3 min-h-[400px]">
                    <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-yellow-400 animate-ping" />
                        <h3 className="font-black text-white text-xs uppercase">1. Novos Pedidos</h3>
                      </div>
                      <span className="bg-yellow-500 text-black font-black text-xs px-2 py-0.5 rounded-full">
                        {pendingOrders.length}
                      </span>
                    </div>

                    <div className="space-y-3 overflow-y-auto max-h-[calc(100vh-280px)] pr-1">
                      {filteredActiveOrders
                        .filter(o => o.status === 'received')
                        .map(order => renderOrderCard(order, true))}
                      {filteredActiveOrders.filter(o => o.status === 'received').length === 0 && (
                        <div className="py-12 text-center text-zinc-600 text-xs font-semibold">
                          Nenhum pedido novo aguardando.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* COLUMN 2: IN KITCHEN / ON GRILL */}
                  <div className="bg-zinc-950/80 rounded-2xl border border-orange-500/40 p-3 flex flex-col gap-3 min-h-[400px]">
                    <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                      <div className="flex items-center gap-2">
                        <Flame className="w-4 h-4 text-orange-400" />
                        <h3 className="font-black text-white text-xs uppercase">2. Na Chapa / Cozinha</h3>
                      </div>
                      <span className="bg-orange-500 text-black font-black text-xs px-2 py-0.5 rounded-full">
                        {preparingOrders.length}
                      </span>
                    </div>

                    <div className="space-y-3 overflow-y-auto max-h-[calc(100vh-280px)] pr-1">
                      {filteredActiveOrders
                        .filter(o => o.status === 'preparing')
                        .map(order => renderOrderCard(order, true))}
                      {filteredActiveOrders.filter(o => o.status === 'preparing').length === 0 && (
                        <div className="py-12 text-center text-zinc-600 text-xs font-semibold">
                          Chapa livre no momento.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* COLUMN 3: OUT FOR DELIVERY / READY FOR PICKUP */}
                  <div className="bg-zinc-950/80 rounded-2xl border border-blue-500/40 p-3 flex flex-col gap-3 min-h-[400px]">
                    <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                      <div className="flex items-center gap-2">
                        <Bike className="w-4 h-4 text-blue-400" />
                        <h3 className="font-black text-white text-xs uppercase">3. Expedição & Entrega</h3>
                      </div>
                      <span className="bg-blue-500 text-black font-black text-xs px-2 py-0.5 rounded-full">
                        {outForDeliveryOrders.length}
                      </span>
                    </div>

                    <div className="space-y-3 overflow-y-auto max-h-[calc(100vh-280px)] pr-1">
                      {filteredActiveOrders
                        .filter(o => o.status === 'out_for_delivery' || o.status === 'ready')
                        .map(order => renderOrderCard(order, true))}
                      {filteredActiveOrders.filter(o => o.status === 'out_for_delivery' || o.status === 'ready').length === 0 && (
                        <div className="py-12 text-center text-zinc-600 text-xs font-semibold">
                          Nenhum pedido em rota de entrega.
                        </div>
                      )}
                    </div>
                  </div>

                </div>
              ) : (
                /* GRID VIEW */
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
                  {filteredActiveOrders.map(order => renderOrderCard(order, false))}
                </div>
              )}
            </div>
          )}

          {/* TAB: HISTORY OF COMPLETED & CANCELLED ORDERS */}
          {activeTab === 'history' && (
            <div className="space-y-5 max-w-7xl mx-auto text-left">
              
              {/* Top Summary Cards for History */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="p-4 bg-zinc-950 rounded-2xl border border-emerald-500/30 flex items-center justify-between">
                  <div>
                    <span className="text-zinc-400 block text-[11px] font-bold">Pedidos Concluídos</span>
                    <span className="text-2xl font-black text-emerald-400">{completedOrders.length}</span>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                </div>

                <div className="p-4 bg-zinc-950 rounded-2xl border border-emerald-500/30 flex items-center justify-between">
                  <div>
                    <span className="text-zinc-400 block text-[11px] font-bold">Faturamento Concluído</span>
                    <span className="text-xl font-black text-emerald-400">{formatBRL(completedRevenue)}</span>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
                    <Store className="w-6 h-6" />
                  </div>
                </div>

                <div className="p-4 bg-zinc-950 rounded-2xl border border-blue-500/30 flex items-center justify-between">
                  <div>
                    <span className="text-zinc-400 block text-[11px] font-bold">Ticket Médio Entregue</span>
                    <span className="text-xl font-black text-blue-400">
                      {completedOrders.length > 0 ? formatBRL(completedRevenue / completedOrders.length) : 'R$ 0,00'}
                    </span>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold">
                    <Package className="w-6 h-6" />
                  </div>
                </div>

                <div className="p-4 bg-zinc-950 rounded-2xl border border-red-500/30 flex items-center justify-between">
                  <div>
                    <span className="text-zinc-400 block text-[11px] font-bold">Cancelados</span>
                    <span className="text-2xl font-black text-red-400">{cancelledOrders.length}</span>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-red-500/10 text-red-400 flex items-center justify-center font-bold">
                    <Ban className="w-6 h-6" />
                  </div>
                </div>
              </div>

              {/* History Search & Filters */}
              <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between bg-zinc-950/80 p-3.5 rounded-2xl border border-zinc-850">
                <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center flex-1">
                  <div className="relative flex-1 max-w-md">
                    <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      value={historySearchQuery}
                      onChange={e => setHistorySearchQuery(e.target.value)}
                      placeholder="Buscar no histórico por código, cliente ou item..."
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="flex items-center gap-1 bg-zinc-900 p-1 rounded-xl border border-zinc-800">
                    <button
                      type="button"
                      onClick={() => setHistoryTypeFilter('all')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        historyTypeFilter === 'all' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      Todos
                    </button>
                    <button
                      type="button"
                      onClick={() => setHistoryTypeFilter('delivery')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                        historyTypeFilter === 'delivery' ? 'bg-blue-600 text-white' : 'text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      <Bike className="w-3.5 h-3.5" />
                      <span>Delivery</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setHistoryTypeFilter('takeaway')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                        historyTypeFilter === 'takeaway' ? 'bg-amber-600 text-white' : 'text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      <Store className="w-3.5 h-3.5" />
                      <span>Retirada</span>
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-1 overflow-x-auto pb-1 lg:pb-0">
                  <button
                    type="button"
                    onClick={() => setHistoryStatusFilter('all')}
                    className={`px-2.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                      historyStatusFilter === 'all' ? 'bg-white text-black' : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
                    }`}
                  >
                    Todos ({historyOrders.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setHistoryStatusFilter('completed')}
                    className={`px-2.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                      historyStatusFilter === 'completed' ? 'bg-emerald-500 text-black' : 'bg-zinc-900 text-emerald-400 hover:bg-zinc-800 border border-zinc-800'
                    }`}
                  >
                    ✅ Concluídos ({completedOrders.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setHistoryStatusFilter('cancelled')}
                    className={`px-2.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                      historyStatusFilter === 'cancelled' ? 'bg-red-500 text-white' : 'bg-zinc-900 text-red-400 hover:bg-zinc-800 border border-zinc-800'
                    }`}
                  >
                    🚫 Cancelados ({cancelledOrders.length})
                  </button>
                </div>
              </div>

              {/* History List/Grid */}
              {filteredHistoryOrders.length === 0 ? (
                <div className="py-20 text-center text-zinc-500 bg-zinc-950/40 rounded-3xl border border-zinc-900 flex flex-col items-center justify-center">
                  <History className="w-12 h-12 mb-3 text-zinc-600" />
                  <p className="text-base font-bold text-zinc-300">Nenhum pedido no histórico.</p>
                  <p className="text-xs text-zinc-500 mt-1 max-w-md">
                    Quando uma comanda ativa for marcada como "Concluído" ou "Cancelado", ela será arquivada aqui automaticamente.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {filteredHistoryOrders.map(order => renderOrderCard(order, false))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: MENU AVAILABILITY */}
          {activeTab === 'menu' && (
            <div className="space-y-4 max-w-6xl mx-auto">
              <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-800 flex items-center justify-between">
                <div>
                  <h3 className="font-black text-white text-sm">Controle de Estoque & Itens Esgotados</h3>
                  <p className="text-xs text-zinc-400">
                    Ao esgotar um item aqui, ele fica indisponível imediatamente para todos os clientes no cardápio online.
                  </p>
                </div>
                <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-3 py-1 rounded-xl border border-amber-500/30">
                  {menuItems.filter(i => i.available).length} de {menuItems.length} ativos
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {menuItems.map(item => (
                  <div
                    key={item.id}
                    className={`p-4 rounded-2xl border flex flex-col justify-between gap-3 text-left transition-all ${
                      item.available ? 'bg-zinc-950 border-zinc-800 shadow-sm' : 'bg-red-950/20 border-red-900/50 opacity-70'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-xs font-black text-white">{item.name}</h4>
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-md uppercase ${
                          item.available ? 'bg-emerald-950 text-emerald-400' : 'bg-red-950 text-red-400'
                        }`}>
                          {item.available ? 'Disponível' : 'Esgotado'}
                        </span>
                      </div>
                      <p className="text-xs text-yellow-400 font-black mt-1">{formatBRL(item.price)}</p>
                      {item.description && (
                        <p className="text-[11px] text-zinc-400 line-clamp-2 mt-1">{item.description}</p>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => toggleItemAvailability(item.id)}
                      className={`w-full text-xs font-black py-2 rounded-xl border transition-all ${
                        item.available
                          ? 'bg-zinc-900 text-zinc-300 hover:bg-red-950/60 hover:text-red-300 hover:border-red-800/80 border-zinc-800'
                          : 'bg-emerald-600 text-white border-emerald-500 shadow-lg shadow-emerald-600/20'
                      }`}
                    >
                      {item.available ? 'Marcar como Esgotado' : 'Reativar no Cardápio'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: SETTINGS & ANNOUNCEMENTS */}
          {activeTab === 'settings' && (
            <div className="max-w-2xl mx-auto space-y-4 text-left">
              {/* Store Open/Closed Big Control Box */}
              <div className={`p-5 rounded-2xl border transition-all ${
                storeSettings.isOpen 
                  ? 'bg-emerald-950/20 border-emerald-500/40 shadow-[0_0_20px_rgba(0,255,102,0.1)]' 
                  : 'bg-red-950/30 border-red-500/60 shadow-[0_0_25px_rgba(239,68,68,0.2)]'
              }`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`w-3 h-3 rounded-full ${
                        storeSettings.isOpen ? 'bg-emerald-400 animate-ping' : 'bg-red-500'
                      }`} />
                      <h4 className="text-base font-black text-white">
                        Status da Loja: {storeSettings.isOpen ? 'ABERTO PARA PEDIDOS' : 'FECHADO NO MOMENTO'}
                      </h4>
                    </div>
                    <p className="text-xs text-zinc-300">
                      {storeSettings.isOpen 
                        ? 'Os clientes podem adicionar itens ao carrinho e finalizar pedidos normalmente.'
                        : 'Bloqueia novos pedidos de clientes. Ao clicar nos produtos, o cliente verá o aviso "Estabelecimento Fechado!".'}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => updateStoreSettings({ isOpen: !storeSettings.isOpen })}
                    className={`px-5 py-3 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer ${
                      storeSettings.isOpen
                        ? 'bg-red-600 hover:bg-red-500 text-white shadow-red-950/50'
                        : 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-emerald-950/50'
                    }`}
                  >
                    {storeSettings.isOpen ? (
                      <>
                        <ToggleLeft className="w-5 h-5" />
                        <span>Fechar Loja Agora</span>
                      </>
                    ) : (
                      <>
                        <ToggleRight className="w-5 h-5" />
                        <span>Abrir Loja Agora</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="bg-zinc-950 p-5 rounded-2xl border border-zinc-800 space-y-4">
                <h3 className="text-sm font-black text-white uppercase tracking-wider border-b border-zinc-800 pb-2">
                  Configurações Operacionais
                </h3>

                <div>
                  <label className="text-xs font-bold text-zinc-300 block mb-1.5">
                    Faixa de Aviso / Banner no Topo do Cardápio
                  </label>
                  <input
                    type="text"
                    value={storeSettings.activeBannerAnnouncement || ''}
                    onChange={e => updateStoreSettings({ activeBannerAnnouncement: e.target.value })}
                    placeholder="Ex: 🍔 Sextou com smash artesanal em dobro e chopp gelado!"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs text-zinc-200 focus:outline-none focus:border-yellow-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-zinc-300 block mb-1.5">
                    Chave PIX Oficial da Hamburgueria
                  </label>
                  <input
                    type="text"
                    value={storeSettings.pixKey}
                    onChange={e => updateStoreSettings({ pixKey: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs text-zinc-200 focus:outline-none focus:border-yellow-500 font-mono"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-zinc-300 block mb-1.5">
                      Tempo Mínimo de Preparo (minutos)
                    </label>
                    <input
                      type="number"
                      value={storeSettings.estimatedPrepTimeMin}
                      onChange={e => updateStoreSettings({ estimatedPrepTimeMin: Number(e.target.value) })}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs text-zinc-200"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-zinc-300 block mb-1.5">
                      Tempo Máximo de Preparo (minutos)
                    </label>
                    <input
                      type="number"
                      value={storeSettings.estimatedPrepTimeMax}
                      onChange={e => updateStoreSettings({ estimatedPrepTimeMax: Number(e.target.value) })}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs text-zinc-200"
                    />
                  </div>
                </div>
              </div>

              {/* Card de Senha e Segurança do ADM */}
              <div className="bg-zinc-950 p-5 rounded-2xl border border-yellow-500/40 space-y-4 shadow-[0_0_20px_rgba(234,179,8,0.1)]">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-yellow-400" />
                    <h3 className="text-sm font-black text-white uppercase tracking-wider">
                      Segurança & Senha do Administrador
                    </h3>
                  </div>
                  <span className="text-[11px] font-bold text-yellow-400 bg-yellow-500/10 px-2.5 py-0.5 rounded-full border border-yellow-500/30">
                    Acesso Protegido
                  </span>
                </div>

                <p className="text-xs text-zinc-400">
                  Configure o PIN de 4 dígitos ou senha master utilizada pela gerência e cozinha para desbloquear o painel KDS e gerenciar pedidos.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-zinc-300 block mb-1.5">
                      PIN Rápido da Cozinha (4 a 6 dígitos)
                    </label>
                    <div className="relative">
                      <KeyRound className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
                      <input
                        type="password"
                        value={customPinInput}
                        onChange={e => setCustomPinInput(e.target.value)}
                        placeholder="••••"
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-3 py-2 text-xs text-white font-mono placeholder-zinc-500 focus:outline-none focus:border-yellow-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-zinc-300 block mb-1.5">
                      Senha Master do Gerente
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
                      <input
                        type="password"
                        value={customPassInput}
                        onChange={e => setCustomPassInput(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-3 py-2 text-xs text-white font-mono placeholder-zinc-500 focus:outline-none focus:border-yellow-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  {pinSavedFeedback ? (
                    <span className="text-xs text-emerald-400 font-bold flex items-center gap-1.5 animate-in fade-in">
                      <CheckCircle2 className="w-4 h-4" />
                      Nova senha e PIN salvos com sucesso!
                    </span>
                  ) : <span />}

                  <button
                    type="button"
                    onClick={async () => {
                      await updateStoreSettings({
                        adminPin: customPinInput.trim() || '1234',
                        adminPassword: customPassInput.trim() || 'popidi@2026'
                      });
                      setPinSavedFeedback(true);
                      setTimeout(() => setPinSavedFeedback(false), 3000);
                    }}
                    className="px-4 py-2 bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-black font-black text-xs uppercase rounded-xl transition-all shadow-md shadow-yellow-500/20 cursor-pointer"
                  >
                    Salvar Nova Senha / PIN
                  </button>
                </div>
              </div>

              <div className="p-4 bg-emerald-950/30 rounded-2xl border border-emerald-800/40 text-xs text-zinc-300 space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Sincronização Ativa em Nuvem</span>
                </div>
                <p className="text-[11px] text-zinc-400">
                  Todas as alterações de status de comandas, estoques e horários são sincronizadas em tempo real via Firestore com os celulares de todos os clientes.
                </p>
              </div>
            </div>
          )}

        </div>

        {/* Footer Bar */}
        <div className="p-3 sm:p-4 bg-zinc-950 border-t border-zinc-800 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3 text-[11px] text-zinc-400">
            <span className="font-bold text-white">PO-PI-DI KDS v2.5 Maximizado</span>
            <span className="hidden sm:inline text-zinc-600">•</span>
            <span className="hidden sm:inline">Porto Feliz - SP</span>
            <span className="text-yellow-400 font-bold">({activeOrdersCount} pedidos ativos)</span>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsAdminOpen(false)}
              className="bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-bold text-xs px-5 py-2.5 rounded-xl border border-zinc-800 transition-colors"
            >
              Fechar Painel
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

