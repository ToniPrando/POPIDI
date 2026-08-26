import React, { useState, useEffect, useRef } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { formatBRL, formatPhoneNumber, formatCEP, fetchAddressByCep } from '../utils/formatters';
import { openWhatsAppOrder } from '../utils/formatters';
import confetti from 'canvas-confetti';
import { 
  X, 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingBag, 
  Bike, 
  Store, 
  CreditCard, 
  QrCode, 
  Banknote, 
  Tag, 
  Send, 
  ArrowRight, 
  CheckCircle2, 
  AlertTriangle,
  Copy,
  Check,
  ChevronRight,
  Info,
  MapPin,
  Search,
  Loader2,
  Building2
} from 'lucide-react';
import { PaymentMethod, OrderType } from '../types';

export const CartDrawer: React.FC = () => {
  const { profile, user, setIsAuthModalOpen, setAuthModalTab } = useAuth();
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeFromCart,
    clearCart,
    subtotal,
    deliveryFee,
    discount,
    total,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    orderType,
    setOrderType,
    customerInfo,
    setCustomerInfo,
    deliveryAddress,
    setDeliveryAddress,
    paymentMethod,
    setPaymentMethod,
    cashChangeFor,
    setCashChangeFor,
    generalNotes,
    setGeneralNotes,
    placeOrder,
    setIsOrderTrackerOpen,
    storeSettings,
  } = useCart();

  const [checkoutStep, setCheckoutStep] = useState<'cart' | 'details' | 'payment'>('cart');
  const [couponInput, setCouponInput] = useState('');
  const [couponFeedback, setCouponFeedback] = useState<{ success: boolean; message: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pixCopied, setPixCopied] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [orderError, setOrderError] = useState<string | null>(null);

  // CEP Search State
  const [cepInput, setCepInput] = useState(deliveryAddress.cep || '');
  const [isSearchingCep, setIsSearchingCep] = useState(false);
  const [cepFeedback, setCepFeedback] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    if (deliveryAddress.cep && !cepInput) {
      setCepInput(deliveryAddress.cep);
    }
  }, [deliveryAddress.cep]);

  useEffect(() => {
    if (profile || user) {
      setCustomerInfo(prev => ({
        name: prev.name || profile?.name || user?.displayName || '',
        phone: prev.phone || profile?.phone || '',
      }));
      if (profile?.defaultAddress && (!deliveryAddress.street || !deliveryAddress.number)) {
        if (profile.defaultAddress.cep) {
          setCepInput(profile.defaultAddress.cep);
        }
        setDeliveryAddress(prev => ({
          ...prev,
          cep: prev.cep || profile.defaultAddress?.cep || '',
          street: prev.street || profile.defaultAddress?.street || '',
          number: prev.number || profile.defaultAddress?.number || '',
          neighborhood: prev.neighborhood || profile.defaultAddress?.neighborhood || (storeSettings.neighborhoodFees && storeSettings.neighborhoodFees[0]?.neighborhood) || 'Centro',
          complement: prev.complement || profile.defaultAddress?.complement || '',
          reference: prev.reference || profile.defaultAddress?.reference || '',
        }));
      }
    }
  }, [profile, user]);

  const handleSearchCep = async (cepToSearch?: string) => {
    const raw = (cepToSearch !== undefined ? cepToSearch : cepInput).replace(/\D/g, '');
    if (raw.length !== 8) {
      setCepFeedback({ success: false, message: 'Digite um CEP completo com 8 dígitos.' });
      return;
    }

    setIsSearchingCep(true);
    setCepFeedback(null);

    try {
      const result = await fetchAddressByCep(raw);
      if (!result) {
        setCepFeedback({ 
          success: false, 
          message: 'CEP não encontrado. Por favor, preencha o logradouro e bairro manualmente.' 
        });
        return;
      }

      // Try to match neighborhood in preset storeSettings
      let matchedNeighborhood = deliveryAddress.neighborhood;
      const foundPreset = storeSettings.neighborhoodFees.find(
        n => n.neighborhood.toLowerCase().trim() === (result.bairro || '').toLowerCase().trim()
      );

      if (foundPreset) {
        matchedNeighborhood = foundPreset.neighborhood;
      } else if (result.bairro) {
        matchedNeighborhood = result.bairro;
      }

      setDeliveryAddress(prev => ({
        ...prev,
        cep: result.cep || formatCEP(raw),
        street: result.logradouro || prev.street,
        neighborhood: matchedNeighborhood,
        city: `${result.localidade} - ${result.uf}`,
        complement: prev.complement || result.complemento || '',
      }));

      // Clear error flags for street and neighborhood
      setFormErrors(prev => {
        const next = { ...prev };
        delete next.street;
        delete next.neighborhood;
        return next;
      });

      setCepFeedback({
        success: true,
        message: `${result.logradouro ? result.logradouro + ' - ' : ''}${result.bairro || ''} (${result.localidade}/${result.uf})`,
      });
    } catch (err) {
      setCepFeedback({
        success: false,
        message: 'Erro na consulta do CEP. Preencha os campos abaixo.',
      });
    } finally {
      setIsSearchingCep(false);
    }
  };

  const handleCepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCEP(e.target.value);
    setCepInput(formatted);
    setDeliveryAddress(prev => ({ ...prev, cep: formatted }));

    const raw = formatted.replace(/\D/g, '');
    if (raw.length === 8) {
      handleSearchCep(formatted);
    } else if (cepFeedback) {
      setCepFeedback(null);
    }
  };

  if (!isCartOpen) return null;

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    const res = applyCoupon(couponInput);
    setCouponFeedback(res);
    if (res.success) {
      setCouponInput('');
    }
  };

  const copyPixKey = () => {
    navigator.clipboard.writeText(storeSettings.pixKey);
    setPixCopied(true);
    setTimeout(() => setPixCopied(false), 2500);
  };

  const validateDetailsStep = () => {
    const errors: Record<string, string> = {};
    if (!customerInfo.name.trim()) {
      errors.name = 'Por favor, informe seu nome completo.';
    }
    if (!customerInfo.phone.trim() || customerInfo.phone.replace(/\D/g, '').length < 10) {
      errors.phone = 'Informe um número de WhatsApp válido com DDD.';
    }

    if (orderType === 'delivery') {
      if (!deliveryAddress.street.trim()) {
        errors.street = 'Informe a rua / avenida.';
      }
      if (!deliveryAddress.number.trim()) {
        errors.number = 'Informe o número da casa/apto.';
      }
      if (!deliveryAddress.neighborhood.trim()) {
        errors.neighborhood = 'Selecione ou informe o bairro.';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNextStep = () => {
    setOrderError(null);
    if (checkoutStep === 'cart') {
      setCheckoutStep('details');
    } else if (checkoutStep === 'details') {
      if (validateDetailsStep()) {
        setCheckoutStep('payment');
      }
    }
  };

  const handleCompleteOrder = async () => {
    setOrderError(null);
    if (!validateDetailsStep()) {
      setCheckoutStep('details');
      setOrderError('Por favor, preencha os dados de contato e endereço antes de finalizar.');
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Create order in persistent state (Firestore & Local)
      const createdOrder = await placeOrder();

      // 2. Trigger celebration confetti
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#f59e0b', '#d97706', '#ea580c', '#ffffff'],
      });

      // 3. Open WhatsApp with pre-filled message
      try {
        openWhatsAppOrder(createdOrder, storeSettings);
      } catch (waErr) {
        console.warn('Could not launch WhatsApp:', waErr);
      }

      // 4. Close cart and open tracker
      setIsCartOpen(false);
      setIsOrderTrackerOpen(true);
      setCheckoutStep('cart');
    } catch (err: any) {
      console.error('Error placing order:', err);
      setOrderError(err?.message || 'Erro ao registrar o pedido. Verifique seus dados e tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Free delivery threshold progress calculation
  const freeThreshold = storeSettings.freeDeliveryThreshold || 85;
  const remainingForFreeDelivery = Math.max(0, freeThreshold - subtotal);
  const freeDeliveryPercent = Math.min(100, (subtotal / freeThreshold) * 100);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="absolute inset-y-0 right-0 max-w-full flex pl-10"
        onClick={e => e.stopPropagation()}
      >
        <div className="w-screen max-w-md sm:max-w-lg bg-[#101117] border-l border-zinc-800 text-zinc-100 flex flex-col shadow-2xl">
          
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/80">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-black text-white uppercase tracking-tight">
                  {checkoutStep === 'cart' && 'Seu Carrinho'}
                  {checkoutStep === 'details' && 'Dados de Entrega'}
                  {checkoutStep === 'payment' && 'Pagamento & Envio'}
                </h2>
                <p className="text-xs text-zinc-400">
                  {checkoutStep === 'cart' && `${cart.length} itens adicionados`}
                  {checkoutStep === 'details' && 'Passo 2 de 3: Identificação'}
                  {checkoutStep === 'payment' && 'Passo 3 de 3: Finalização'}
                </p>
              </div>
            </div>

            <button
              id="btn-close-cart-drawer"
              onClick={() => setIsCartOpen(false)}
              className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Stepper Progress Bar */}
          <div className="grid grid-cols-3 bg-zinc-900/60 border-b border-zinc-800 text-[11px] font-bold text-center">
            <button
              onClick={() => setCheckoutStep('cart')}
              className={`py-2.5 border-b-2 transition-all flex items-center justify-center gap-1.5 ${
                checkoutStep === 'cart'
                  ? 'border-amber-500 text-amber-400 bg-amber-500/10 font-black'
                  : 'border-transparent text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>1. Itens</span>
            </button>
            <button
              onClick={() => cart.length > 0 && setCheckoutStep('details')}
              disabled={cart.length === 0}
              className={`py-2.5 border-b-2 transition-all flex items-center justify-center gap-1.5 ${
                checkoutStep === 'details'
                  ? 'border-amber-500 text-amber-400 bg-amber-500/10 font-black'
                  : 'border-transparent text-zinc-400 hover:text-zinc-200 disabled:opacity-30'
              }`}
            >
              <Bike className="w-3.5 h-3.5" />
              <span>2. Entrega/Retirada</span>
            </button>
            <button
              onClick={() => cart.length > 0 && setCheckoutStep('payment')}
              disabled={cart.length === 0}
              className={`py-2.5 border-b-2 transition-all flex items-center justify-center gap-1.5 ${
                checkoutStep === 'payment'
                  ? 'border-amber-500 text-amber-400 bg-amber-500/10 font-black'
                  : 'border-transparent text-zinc-400 hover:text-zinc-200 disabled:opacity-30'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>3. Pagamento</span>
            </button>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
            
            {/* EMPTY CART STATE */}
            {cart.length === 0 ? (
              <div className="py-16 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto text-zinc-600">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-white">Seu carrinho está vazio</h3>
                <p className="text-xs text-zinc-400 max-w-xs mx-auto">
                  Adicione nossos deliciosos smash burgers artesanais ou o famoso X-Tudo para continuar!
                </p>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs px-5 py-2.5 rounded-xl shadow transition-colors"
                >
                  Ver Cardápio
                </button>
              </div>
            ) : (
              <>
                {/* STEP 1: CART ITEMS */}
                {checkoutStep === 'cart' && (
                  <div className="space-y-4">
                    
                    {/* Fast Delivery Mode Selector */}
                    <div className="bg-zinc-900/90 p-1.5 rounded-2xl border border-zinc-800 grid grid-cols-2 gap-1.5 shadow-inner">
                      <button
                        type="button"
                        id="btn-select-delivery-step1"
                        onClick={() => setOrderType('delivery')}
                        className={`py-2.5 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all ${
                          orderType === 'delivery'
                            ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20 scale-[1.02]'
                            : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
                        }`}
                      >
                        <Bike className="w-4 h-4" />
                        <span>Entrega (Delivery)</span>
                      </button>
                      <button
                        type="button"
                        id="btn-select-takeaway-step1"
                        onClick={() => setOrderType('takeaway')}
                        className={`py-2.5 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all ${
                          orderType === 'takeaway'
                            ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20 scale-[1.02]'
                            : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
                        }`}
                      >
                        <Store className="w-4 h-4" />
                        <span>Retirar no Balcão</span>
                      </button>
                    </div>

                    {/* Free Delivery Bar (shown if delivery) */}
                    {orderType === 'delivery' && (
                      <div className="p-3 bg-zinc-900/80 rounded-xl border border-zinc-800 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-zinc-300 font-medium">
                            {remainingForFreeDelivery === 0 ? (
                              <strong className="text-emerald-400 flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Parabéns! Você ganhou Frete Grátis!
                              </strong>
                            ) : (
                              <>
                                Adicione mais <strong className="text-amber-400">{formatBRL(remainingForFreeDelivery)}</strong> para Frete Grátis!
                              </>
                            )}
                          </span>
                          <span className="font-bold text-zinc-400 text-[11px]">
                            {Math.round(freeDeliveryPercent)}%
                          </span>
                        </div>
                        <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                          <div 
                            className="bg-gradient-to-r from-amber-500 to-emerald-500 h-full rounded-full transition-all duration-300"
                            style={{ width: `${freeDeliveryPercent}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Items List */}
                    <div className="space-y-3">
                      {cart.map(item => (
                        <div
                          key={item.cartItemId}
                          className="p-3.5 bg-zinc-900/60 rounded-xl border border-zinc-800 flex gap-3 text-left"
                        >
                          <img
                            src={item.menuItem.image}
                            alt={item.menuItem.name}
                            referrerPolicy="no-referrer"
                            className="w-16 h-16 rounded-lg object-cover bg-zinc-800 shrink-0"
                          />

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-1">
                              <h4 className="text-sm font-bold text-white truncate">
                                {item.menuItem.name}
                              </h4>
                              <button
                                onClick={() => removeFromCart(item.cartItemId)}
                                className="text-zinc-500 hover:text-red-400 p-1"
                                title="Remover item"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>

                            {/* Customizations summary */}
                            {item.customizations && item.customizations.length > 0 && (
                              <div className="text-[11px] text-zinc-400 space-y-0.5 mt-1">
                                {item.customizations.map(c => (
                                  <div key={c.groupId} className="truncate">
                                    <span className="text-zinc-500">{c.groupTitle}: </span>
                                    <span>{c.selectedOptions.map(o => o.name).join(', ')}</span>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Note */}
                            {item.notes && (
                              <p className="text-[11px] text-amber-400/80 italic mt-1 truncate">
                                Obs: {item.notes}
                              </p>
                            )}

                            {/* Price & Quantity Controls */}
                            <div className="flex items-center justify-between mt-3 pt-2 border-t border-zinc-800/80">
                              <span className="text-xs font-black text-amber-400">
                                {formatBRL(item.totalPrice)}
                              </span>

                              <div className="flex items-center bg-zinc-950 border border-zinc-800 rounded-lg p-0.5">
                                <button
                                  onClick={() => updateQuantity(item.cartItemId, -1)}
                                  className="p-1 text-zinc-400 hover:text-white"
                                >
                                  <Minus className="w-3.5 h-3.5" />
                                </button>
                                <span className="px-2 text-xs font-bold text-white">
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() => updateQuantity(item.cartItemId, 1)}
                                  className="p-1 text-zinc-400 hover:text-white"
                                >
                                  <Plus className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Clear Cart Button */}
                    <div className="flex justify-end pt-1">
                      <button
                        onClick={clearCart}
                        className="text-[11px] text-zinc-500 hover:text-red-400 flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Limpar carrinho
                      </button>
                    </div>

                    {/* Coupon Input */}
                    <div className="pt-3 border-t border-zinc-800">
                      <form onSubmit={handleApplyCoupon} className="space-y-2">
                        <label className="text-xs font-bold text-zinc-400 flex items-center gap-1.5">
                          <Tag className="w-3.5 h-3.5 text-amber-500" />
                          <span>Possui um cupom de desconto?</span>
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={couponInput}
                            onChange={e => setCouponInput(e.target.value.toUpperCase())}
                            placeholder="Ex: POPIDI10 ou XTUDOLOVERS"
                            className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 placeholder-zinc-500 uppercase focus:outline-none focus:border-amber-500"
                          />
                          <button
                            type="submit"
                            className="bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-xs px-4 py-2 rounded-xl transition-colors"
                          >
                            Aplicar
                          </button>
                        </div>
                      </form>

                      {appliedCoupon && (
                        <div className="mt-2 p-2 bg-emerald-950/40 border border-emerald-800/50 rounded-lg flex items-center justify-between text-xs text-emerald-400">
                          <span>Cupom <strong>{appliedCoupon.code}</strong> ativado! ({appliedCoupon.description})</span>
                          <button onClick={removeCoupon} className="text-zinc-400 hover:text-red-400 ml-2">
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}

                      {couponFeedback && !appliedCoupon && (
                        <p className={`text-xs mt-1.5 ${couponFeedback.success ? 'text-emerald-400' : 'text-red-400'}`}>
                          {couponFeedback.message}
                        </p>
                      )}
                    </div>

                  </div>
                )}

                {/* STEP 2: DETAILS & DELIVERY FORM */}
                {checkoutStep === 'details' && (
                  <div className="space-y-5 text-left">
                    
                    {/* User Profile Connected Badge or Login Suggestion */}
                    {(profile || user) ? (
                      <div className="p-3 bg-emerald-950/40 border border-emerald-800/40 rounded-xl flex items-center justify-between text-xs text-emerald-300">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span className="truncate">Conectado como <strong>{profile?.name || user?.displayName || 'Cliente'}</strong></span>
                        </div>
                        <span className="font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30 shrink-0 ml-2">
                          ⭐ {profile?.loyaltyPoints ?? 50} pts
                        </span>
                      </div>
                    ) : (
                      <div className="p-3 bg-zinc-900/90 border border-zinc-800 rounded-xl flex items-center justify-between text-xs text-zinc-300">
                        <span>Quer acumular pontos de fidelidade?</span>
                        <button
                          type="button"
                          onClick={() => {
                            setAuthModalTab('login');
                            setIsAuthModalOpen(true);
                          }}
                          className="text-amber-400 hover:text-amber-300 font-bold underline shrink-0 ml-2 cursor-pointer"
                        >
                          Entrar / Cadastrar
                        </button>
                      </div>
                    )}

                    {/* Order Type Toggle */}
                    <div>
                      <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block mb-2">
                        Como você prefere receber?
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setOrderType('delivery')}
                          className={`p-3.5 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                            orderType === 'delivery'
                              ? 'bg-amber-500/10 border-amber-500 text-white shadow-sm'
                              : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:bg-zinc-900'
                          }`}
                        >
                          <Bike className={`w-5 h-5 ${orderType === 'delivery' ? 'text-amber-400' : 'text-zinc-400'}`} />
                          <span className="text-xs font-black">Entrega (Delivery)</span>
                          <span className="text-[10px] text-zinc-500">Porto Feliz e Região</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setOrderType('takeaway')}
                          className={`p-3.5 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                            orderType === 'takeaway'
                              ? 'bg-amber-500/10 border-amber-500 text-white shadow-sm'
                              : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:bg-zinc-900'
                          }`}
                        >
                          <Store className={`w-5 h-5 ${orderType === 'takeaway' ? 'text-amber-400' : 'text-zinc-400'}`} />
                          <span className="text-xs font-black">Retirar no Balcão</span>
                          <span className="text-[10px] text-zinc-500">{storeSettings.address}</span>
                        </button>
                      </div>
                    </div>

                    {/* Customer Info */}
                    <div className="space-y-3 pt-2">
                      <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                        Seus Dados para Contato
                      </div>

                      <div>
                        <label className="text-xs text-zinc-300 block mb-1">Seu Nome Completo *</label>
                        <input
                          type="text"
                          value={customerInfo.name}
                          onChange={e => setCustomerInfo(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="Ex: João da Silva"
                          className={`w-full bg-zinc-900 border rounded-xl p-3 text-xs sm:text-sm text-zinc-200 focus:outline-none focus:border-amber-500 ${
                            formErrors.name ? 'border-red-500' : 'border-zinc-800'
                          }`}
                        />
                        {formErrors.name && <p className="text-[11px] text-red-400 mt-1">{formErrors.name}</p>}
                      </div>

                      <div>
                        <label className="text-xs text-zinc-300 block mb-1">WhatsApp com DDD (para envio do status) *</label>
                        <input
                          type="tel"
                          value={customerInfo.phone}
                          onChange={e => setCustomerInfo(prev => ({ ...prev, phone: formatPhoneNumber(e.target.value) }))}
                          placeholder="(35) 99999-9999"
                          maxLength={15}
                          className={`w-full bg-zinc-900 border rounded-xl p-3 text-xs sm:text-sm text-zinc-200 focus:outline-none focus:border-amber-500 ${
                            formErrors.phone ? 'border-red-500' : 'border-zinc-800'
                          }`}
                        />
                        {formErrors.phone && <p className="text-[11px] text-red-400 mt-1">{formErrors.phone}</p>}
                      </div>
                    </div>

                    {/* Delivery Address (only if orderType === 'delivery') */}
                    {orderType === 'delivery' && (
                      <div className="space-y-3 pt-3 border-t border-zinc-800">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                            Endereço de Entrega
                          </span>
                          <span className="text-[11px] text-amber-400 font-semibold flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            <span>Porto Feliz e Região</span>
                          </span>
                        </div>

                        {/* CEP Search Card */}
                        <div className="bg-zinc-950/70 p-3.5 rounded-2xl border border-zinc-800/90 space-y-2.5 shadow-sm">
                          <div className="flex items-center justify-between">
                            <label htmlFor="input-delivery-cep" className="text-xs font-bold text-zinc-200 flex items-center gap-1.5">
                              <Search className="w-3.5 h-3.5 text-amber-400" />
                              <span>Buscar pelo CEP</span>
                            </label>
                            <span className="text-[10px] text-zinc-400">Preenchimento rápido</span>
                          </div>

                          <div className="flex gap-2">
                            <div className="relative flex-1">
                              <input
                                id="input-delivery-cep"
                                type="text"
                                value={cepInput}
                                onChange={handleCepChange}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    handleSearchCep();
                                  }
                                }}
                                placeholder="18540-000"
                                maxLength={9}
                                className="w-full bg-zinc-900 border border-zinc-700/80 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-400 font-mono tracking-wider"
                              />
                              {isSearchingCep && (
                                <Loader2 className="w-4 h-4 text-amber-400 animate-spin absolute right-3 top-3" />
                              )}
                            </div>

                            <button
                              id="btn-search-cep"
                              type="button"
                              onClick={() => handleSearchCep()}
                              disabled={isSearchingCep || cepInput.replace(/\D/g, '').length < 8}
                              className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:opacity-40 text-black font-black text-xs rounded-xl transition-all flex items-center gap-1.5 shadow-md shadow-amber-500/20 active:scale-95 shrink-0"
                            >
                              {isSearchingCep ? (
                                <>
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                  <span>Buscando...</span>
                                </>
                              ) : (
                                <>
                                  <Search className="w-3.5 h-3.5 stroke-[2.5]" />
                                  <span>Buscar CEP</span>
                                </>
                              )}
                            </button>
                          </div>

                          {/* CEP Feedback Message */}
                          {cepFeedback && (
                            <div
                              className={`p-2.5 rounded-xl text-xs flex items-start gap-2 border transition-all ${
                                cepFeedback.success
                                  ? 'bg-emerald-950/50 border-emerald-700/60 text-emerald-300'
                                  : 'bg-amber-950/40 border-amber-800/60 text-amber-300'
                              }`}
                            >
                              {cepFeedback.success ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                              ) : (
                                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                              )}
                              <div className="text-[11px] leading-tight font-medium">
                                <p className="font-bold">{cepFeedback.success ? 'Endereço localizado com sucesso!' : 'Atenção:'}</p>
                                <p className="mt-0.5 opacity-90">{cepFeedback.message}</p>
                              </div>
                            </div>
                          )}

                          <div className="flex items-center justify-between text-[10px] text-zinc-500 pt-0.5">
                            <span>💡 Preenche automaticamente rua, bairro e cidade.</span>
                            {deliveryAddress.city && (
                              <span className="text-zinc-400 font-semibold">{deliveryAddress.city}</span>
                            )}
                          </div>
                        </div>

                        {/* Neighborhood Selector with automatic delivery fee */}
                        <div>
                          <label className="text-xs text-zinc-300 block mb-1 font-medium">Bairro de Entrega *</label>
                          <select
                            value={deliveryAddress.neighborhood}
                            onChange={e => setDeliveryAddress(prev => ({ ...prev, neighborhood: e.target.value }))}
                            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs sm:text-sm text-zinc-200 focus:outline-none focus:border-amber-500"
                          >
                            {/* If current neighborhood from CEP is not in preset list, add it dynamically */}
                            {deliveryAddress.neighborhood && !storeSettings.neighborhoodFees.some(n => n.neighborhood.toLowerCase() === deliveryAddress.neighborhood.toLowerCase()) && (
                              <option value={deliveryAddress.neighborhood}>
                                {deliveryAddress.neighborhood} — Taxa Padrão ({formatBRL(storeSettings.standardDeliveryFee)})
                              </option>
                            )}
                            {storeSettings.neighborhoodFees.map(n => (
                              <option key={n.neighborhood} value={n.neighborhood}>
                                {n.neighborhood} — Taxa: {formatBRL(n.fee)} ({n.estimatedMinutes})
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                          <div className="col-span-2">
                            <label className="text-xs text-zinc-300 block mb-1 font-medium">Rua / Logradouro *</label>
                            <input
                              type="text"
                              value={deliveryAddress.street}
                              onChange={e => setDeliveryAddress(prev => ({ ...prev, street: e.target.value }))}
                              placeholder="Ex: Rua Barão do Rio Branco"
                              className={`w-full bg-zinc-900 border rounded-xl p-3 text-xs sm:text-sm text-zinc-200 focus:outline-none focus:border-amber-500 ${
                                formErrors.street ? 'border-red-500' : 'border-zinc-800'
                              }`}
                            />
                            {formErrors.street && <p className="text-[11px] text-red-400 mt-1">{formErrors.street}</p>}
                          </div>

                          <div>
                            <label className="text-xs text-zinc-300 block mb-1 font-medium">Número *</label>
                            <input
                              type="text"
                              value={deliveryAddress.number}
                              onChange={e => setDeliveryAddress(prev => ({ ...prev, number: e.target.value }))}
                              placeholder="123"
                              className={`w-full bg-zinc-900 border rounded-xl p-3 text-xs sm:text-sm text-zinc-200 focus:outline-none focus:border-amber-500 ${
                                formErrors.number ? 'border-red-500' : 'border-zinc-800'
                              }`}
                            />
                            {formErrors.number && <p className="text-[11px] text-red-400 mt-1">{formErrors.number}</p>}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-xs text-zinc-300 block mb-1 font-medium">Complemento</label>
                            <input
                              type="text"
                              value={deliveryAddress.complement}
                              onChange={e => setDeliveryAddress(prev => ({ ...prev, complement: e.target.value }))}
                              placeholder="Apto 102 / Bloco B"
                              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs sm:text-sm text-zinc-200 focus:outline-none focus:border-amber-500"
                            />
                          </div>

                          <div>
                            <label className="text-xs text-zinc-300 block mb-1 font-medium">Ponto de Referência</label>
                            <input
                              type="text"
                              value={deliveryAddress.reference}
                              onChange={e => setDeliveryAddress(prev => ({ ...prev, reference: e.target.value }))}
                              placeholder="Próximo à pracinha"
                              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs sm:text-sm text-zinc-200 focus:outline-none focus:border-amber-500"
                            />
                          </div>
                        </div>

                      </div>
                    )}

                    {orderType === 'takeaway' && (
                      <div className="p-3.5 bg-amber-950/30 border border-amber-500/30 rounded-xl text-xs text-amber-300 space-y-1">
                        <div className="font-bold flex items-center gap-1.5">
                          <Store className="w-4 h-4 text-amber-400" />
                          Endereço para Retirada:
                        </div>
                        <p className="text-zinc-300">
                          {storeSettings.address} - {storeSettings.cityState}
                        </p>
                        <p className="text-[11px] text-zinc-400">
                          Tempo estimado para retirada: 20-30 min após confirmação.
                        </p>
                      </div>
                    )}

                  </div>
                )}

                {/* STEP 3: PAYMENT & FINAL CONFIRMATION */}
                {checkoutStep === 'payment' && (
                  <div className="space-y-5 text-left">
                    
                    <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                      Escolha a Forma de Pagamento
                    </div>

                    <div className="space-y-2.5">
                      {/* PIX */}
                      <div
                        onClick={() => setPaymentMethod('pix')}
                        className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                          paymentMethod === 'pix'
                            ? 'bg-amber-500/10 border-amber-500 text-white'
                            : 'bg-zinc-900/60 border-zinc-800 text-zinc-300 hover:bg-zinc-900'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 font-black">
                              <QrCode className="w-5 h-5" />
                            </div>
                            <div>
                              <div className="text-xs sm:text-sm font-black">PIX (Chave & QR Code)</div>
                              <div className="text-[11px] text-zinc-400">Confirmação rápida e sem taxa</div>
                            </div>
                          </div>
                          <span className="text-[11px] font-black text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                            Recomendado
                          </span>
                        </div>

                        {/* PIX details display */}
                        {paymentMethod === 'pix' && (
                          <div className="mt-3 pt-3 border-t border-zinc-800/80 space-y-2">
                            <div className="p-2.5 bg-zinc-950 rounded-lg border border-zinc-800 flex items-center justify-between text-xs">
                              <div>
                                <span className="text-zinc-500 block text-[10px]">Chave PIX (Telefone):</span>
                                <span className="font-mono font-bold text-amber-400">{storeSettings.pixKey}</span>
                              </div>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  copyPixKey();
                                }}
                                className="flex items-center gap-1 bg-amber-500 hover:bg-amber-400 text-black px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors"
                              >
                                {pixCopied ? (
                                  <>
                                    <Check className="w-3.5 h-3.5" />
                                    <span>Copiado!</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3.5 h-3.5" />
                                    <span>Copiar Chave</span>
                                  </>
                                )}
                              </button>
                            </div>
                            <p className="text-[11px] text-zinc-400">
                              Nome: <strong>{storeSettings.pixReceiverName}</strong> • Envie o comprovante pelo WhatsApp após finalizar.
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Cartão de Crédito na Entrega */}
                      <div
                        onClick={() => setPaymentMethod('credit_card')}
                        className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                          paymentMethod === 'credit_card'
                            ? 'bg-amber-500/10 border-amber-500 text-white'
                            : 'bg-zinc-900/60 border-zinc-800 text-zinc-300 hover:bg-zinc-900'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                            <CreditCard className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="text-xs sm:text-sm font-black">Cartão de Crédito</div>
                            <div className="text-[11px] text-zinc-400">Levamos a maquininha até você</div>
                          </div>
                        </div>
                      </div>

                      {/* Cartão de Débito */}
                      <div
                        onClick={() => setPaymentMethod('debit_card')}
                        className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                          paymentMethod === 'debit_card'
                            ? 'bg-amber-500/10 border-amber-500 text-white'
                            : 'bg-zinc-900/60 border-zinc-800 text-zinc-300 hover:bg-zinc-900'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                            <CreditCard className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="text-xs sm:text-sm font-black">Cartão de Débito</div>
                            <div className="text-[11px] text-zinc-400">Maquininha na entrega / balcão</div>
                          </div>
                        </div>
                      </div>

                      {/* Dinheiro */}
                      <div
                        onClick={() => setPaymentMethod('cash')}
                        className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                          paymentMethod === 'cash'
                            ? 'bg-amber-500/10 border-amber-500 text-white'
                            : 'bg-zinc-900/60 border-zinc-800 text-zinc-300 hover:bg-zinc-900'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                            <Banknote className="w-5 h-5" />
                          </div>
                          <div className="flex-1">
                            <div className="text-xs sm:text-sm font-black">Dinheiro</div>
                            <div className="text-[11px] text-zinc-400">Pagamento no ato da entrega</div>
                          </div>
                        </div>

                        {paymentMethod === 'cash' && (
                          <div className="mt-3 pt-3 border-t border-zinc-800 space-y-2.5" onClick={e => e.stopPropagation()}>
                            <label className="text-xs text-zinc-300 block font-medium">Precisa de troco para quanto?</label>
                            
                            {/* Quick Troco Preset Buttons */}
                            <div className="flex flex-wrap gap-1.5">
                              <button
                                type="button"
                                onClick={() => setCashChangeFor(undefined)}
                                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all ${
                                  !cashChangeFor
                                    ? 'bg-amber-500 text-black border-amber-400 shadow-sm'
                                    : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-white'
                                }`}
                              >
                                Não preciso de troco (Valor Exato)
                              </button>
                              {[50, 100, 150, 200].map(amt => (
                                <button
                                  key={amt}
                                  type="button"
                                  onClick={() => setCashChangeFor(amt)}
                                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all ${
                                    cashChangeFor === amt
                                      ? 'bg-amber-500 text-black border-amber-400 shadow-sm'
                                      : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-white'
                                  }`}
                                >
                                  R$ {amt}
                                </button>
                              ))}
                            </div>

                            <div className="flex items-center gap-2">
                              <span className="text-xs text-zinc-400">Ou outro valor:</span>
                              <input
                                type="number"
                                value={cashChangeFor || ''}
                                onChange={e => setCashChangeFor(e.target.value ? Number(e.target.value) : undefined)}
                                placeholder="Ex: 80"
                                className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-xs text-zinc-200 focus:outline-none focus:border-amber-500"
                              />
                            </div>

                            {cashChangeFor && cashChangeFor > total && (
                              <div className="p-2 bg-emerald-950/40 border border-emerald-800/40 rounded-lg text-[11px] text-emerald-400 font-bold flex items-center gap-1.5">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Troco a ser levado pelo entregador: {formatBRL(cashChangeFor - total)}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* General Order Notes */}
                    <div className="pt-3 border-t border-zinc-800 space-y-1.5">
                      <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">
                        Instruções Gerais para Entrega / Cozinha
                      </label>
                      <textarea
                        value={generalNotes}
                        onChange={e => setGeneralNotes(e.target.value)}
                        placeholder="Ex: Tocar o interfone 202, deixar na portaria, caprichar no guardanapo..."
                        rows={2}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-amber-500 resize-none"
                      />
                    </div>

                  </div>
                )}
              </>
            )}

          </div>

          {/* Footer Totals & Step Control Buttons */}
          {cart.length > 0 && (
            <div className="p-4 sm:p-5 bg-zinc-950 border-t border-zinc-800/90 space-y-3">
              
              {/* Financial summary breakdown */}
              <div className="space-y-1 text-xs">
                <div className="flex justify-between text-zinc-400">
                  <span>Subtotal ({cart.length} itens):</span>
                  <span className="font-semibold text-zinc-200">{formatBRL(subtotal)}</span>
                </div>

                {orderType === 'delivery' && (
                  <div className="flex justify-between text-zinc-400">
                    <span>Taxa de Entrega:</span>
                    <span className="font-semibold text-zinc-200">
                      {deliveryFee === 0 ? (
                        <span className="text-emerald-400 font-bold">GRÁTIS</span>
                      ) : (
                        formatBRL(deliveryFee)
                      )}
                    </span>
                  </div>
                )}

                {discount > 0 && (
                  <div className="flex justify-between text-emerald-400">
                    <span>Desconto ({appliedCoupon?.code}):</span>
                    <span className="font-bold">-{formatBRL(discount)}</span>
                  </div>
                )}

                <div className="flex justify-between text-sm sm:text-base font-black text-white pt-2 border-t border-zinc-800">
                  <span>Total a Pagar:</span>
                  <span className="text-amber-400 text-lg font-black">{formatBRL(total)}</span>
                </div>
              </div>

              {orderError && (
                <div className="p-3 bg-red-950/60 border border-red-800/80 rounded-xl text-xs text-red-300 flex items-start gap-2 animate-in fade-in">
                  <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">Atenção ao finalizar pedido:</p>
                    <p className="mt-0.5">{orderError}</p>
                  </div>
                </div>
              )}

              {/* Navigation Action Buttons */}
              <div className="flex items-center gap-2 pt-1">
                {checkoutStep !== 'cart' && (
                  <button
                    onClick={() => {
                      if (checkoutStep === 'payment') setCheckoutStep('details');
                      else if (checkoutStep === 'details') setCheckoutStep('cart');
                    }}
                    className="bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-bold text-xs px-3.5 py-3.5 rounded-xl border border-zinc-800 transition-colors"
                  >
                    Voltar
                  </button>
                )}

                {checkoutStep !== 'payment' ? (
                  <button
                    id="btn-cart-continue-step"
                    onClick={handleNextStep}
                    className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-black text-sm py-3.5 rounded-xl shadow-lg shadow-amber-600/20 hover:scale-[1.01] active:scale-98 transition-all cursor-pointer"
                  >
                    <span>
                      {checkoutStep === 'cart' ? 'Avançar para Entrega/Retirada' : 'Ir para Opções de Pagamento'}
                    </span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    id="btn-cart-complete-order"
                    onClick={handleCompleteOrder}
                    disabled={isSubmitting}
                    className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-black font-black text-sm py-3.5 rounded-xl shadow-lg shadow-emerald-600/20 hover:scale-[1.01] active:scale-98 transition-all disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                    <span>{isSubmitting ? 'Gerando Pedido...' : 'Finalizar Pedido via WhatsApp'}</span>
                  </button>
                )}
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
};
