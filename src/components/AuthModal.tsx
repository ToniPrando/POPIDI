import React, { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { getLoyaltyTier } from '../data/loyaltyRewards';
import confetti from 'canvas-confetti';
import { 
  X, 
  Mail, 
  Lock, 
  User, 
  Phone, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  ArrowRight,
  Eye,
  EyeOff,
  Crown,
  Gift,
  Star,
  Zap,
  Smartphone,
  History,
  ShoppingBag
} from 'lucide-react';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    setIsAuthModalOpen,
    authModalTab,
    setAuthModalTab,
    authNoticeMessage,
    setAuthNoticeMessage,
    signInWithGoogle,
    loginWithEmail,
    registerWithEmail,
    resetPassword,
    user,
    profile,
    logout
  } = useAuth();

  const { setIsLoyaltyOpen, setIsOrderHistoryOpen, orders, customerInfo } = useCart();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isForgotPass, setIsForgotPass] = useState(false);

  // Compute number of orders for the customer
  const userOrdersCount = useMemo(() => {
    try {
      if (!user && !profile) return 0;
      const targetEmail = String(user?.email || profile?.email || customerInfo?.email || '').toLowerCase().trim();
      const targetUid = String(user?.uid || profile?.uid || '').trim();
      const targetPhone = String(profile?.phone || customerInfo?.phone || '').replace(/\D/g, '');

      let localPlacedIds: string[] = [];
      try {
        const stored = localStorage.getItem('popidi_placed_order_ids');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            localPlacedIds = parsed.map(id => String(id || '').trim()).filter(Boolean);
          } else if (typeof parsed === 'string' && parsed.trim()) {
            localPlacedIds = [parsed.trim()];
          }
        }
      } catch {
        localPlacedIds = [];
      }

      const allOrders = Array.isArray(orders) ? orders.filter(Boolean) : [];
      return allOrders.filter(order => {
        if (!order || typeof order !== 'object') return false;
        const orderId = String(order.id || '').trim();
        if (orderId && Array.isArray(localPlacedIds) && localPlacedIds.includes(orderId)) return true;
        if (targetUid && order.userId && String(order.userId).trim() === targetUid) return true;
        const rawEmail = order.userEmail || order.customerEmail || (typeof order.customer === 'object' && order.customer ? order.customer.email : '') || '';
        const email = String(rawEmail).toLowerCase().trim();
        if (targetEmail && email && email === targetEmail) return true;
        const rawPhone = order.customerPhone || (typeof order.customer === 'object' && order.customer ? order.customer.phone : '') || '';
        const phone = String(rawPhone).replace(/\D/g, '');
        if (targetPhone && phone && (phone === targetPhone || phone.endsWith(targetPhone) || targetPhone.endsWith(phone))) return true;
        return false;
      }).length;
    } catch (e) {
      console.error('Error calculating user orders count:', e);
      return 0;
    }
  }, [orders, user, profile, customerInfo]);

  if (!isAuthModalOpen) return null;

  const currentLoyaltyPoints = profile?.loyaltyPoints ?? (user ? 50 : 0);
  const tierInfo = getLoyaltyTier(currentLoyaltyPoints);

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setName('');
    setPhone('');
    setErrorMsg('');
    setSuccessMsg('');
    setIsForgotPass(false);
    if (setAuthNoticeMessage) setAuthNoticeMessage(null);
  };

  const handleClose = () => {
    resetForm();
    setIsAuthModalOpen(false);
  };

  const handleOpenMyOrders = () => {
    handleClose();
    setIsOrderHistoryOpen(true);
  };

  // Format Brazilian phone mask on typing: (XX)XXXXX-XXXX
  const formatPhoneMask = (raw: string): string => {
    const digits = raw.replace(/\D/g, '').slice(0, 11);
    if (!digits) return '';
    if (digits.length <= 2) return `(${digits}`;
    if (digits.length <= 7) return `(${digits.slice(0, 2)})${digits.slice(2)}`;
    return `(${digits.slice(0, 2)})${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneMask(e.target.value);
    setPhone(formatted);
  };

  const handleGoogleLogin = async () => {
    setErrorMsg('');
    setSuccessMsg('');
    setIsSubmitting(true);
    try {
      await signInWithGoogle();
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#f59e0b', '#10b981', '#ffffff'],
      });
      handleClose();
    } catch (err: any) {
      console.error('Google Auth Failed:', err);
      const code = err?.code || '';
      const currentHost = typeof window !== 'undefined' ? window.location.hostname : '';

      if (code === 'auth/popup-closed-by-user') {
        setErrorMsg('A janela do Google foi fechada antes de concluir. Tente novamente ou use o Cadastro com WhatsApp abaixo.');
      } else if (code === 'auth/popup-blocked') {
        setErrorMsg('Pop-up bloqueado pelo navegador. Você pode se cadastrar rapidamente pelo WhatsApp abaixo sem precisar de pop-up.');
      } else if (code === 'auth/unauthorized-domain') {
        setErrorMsg(`Domínio (${currentHost}) não cadastrado no Firebase. Cadastre-se pelo WhatsApp ou E-mail abaixo.`);
      } else if (code === 'auth/network-request-failed') {
        setErrorMsg('Erro de conexão. Verifique sua internet.');
      } else {
        setErrorMsg('Não foi possível conectar com o Google no momento. Cadastre-se em segundos com seu WhatsApp abaixo!');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const isValidEmail = (emailStr: string): boolean => {
    return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(emailStr.trim());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    // 1. Password Reset Flow
    if (isForgotPass) {
      if (!isValidEmail(email)) {
        setErrorMsg('Informe um e-mail válido para redefinição.');
        return;
      }
      setIsSubmitting(true);
      try {
        await resetPassword(email.trim());
        setSuccessMsg('Link de redefinição de senha enviado para seu e-mail!');
        setIsSubmitting(false);
      } catch (err: any) {
        setErrorMsg('Não encontramos uma conta vinculada a este e-mail.');
        setIsSubmitting(false);
      }
      return;
    }

    // 2. Login Flow
    if (authModalTab === 'login') {
      const loginIdentifier = email.trim();
      if (!loginIdentifier) {
        setErrorMsg('Informe seu e-mail ou WhatsApp cadastrado.');
        return;
      }
      
      setIsSubmitting(true);
      try {
        await loginWithEmail(loginIdentifier, password);
        confetti({
          particleCount: 40,
          spread: 50,
          origin: { y: 0.6 },
          colors: ['#10b981', '#3b82f6', '#f59e0b'],
        });
        handleClose();
      } catch (err: any) {
        if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
          setErrorMsg('E-mail, telefone ou senha não conferem. Caso ainda não tenha cadastro, clique na aba "Criar Nova Conta".');
        } else if (err.code === 'auth/too-many-requests') {
          setErrorMsg('Muitas tentativas consecutivas. Aguarde alguns instantes.');
        } else {
          setErrorMsg(err.message || 'Erro ao realizar login. Verifique seus dados.');
        }
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    // 3. Register Flow
    if (authModalTab === 'register') {
      if (!name.trim()) {
        setErrorMsg('Por favor, informe seu nome completo.');
        return;
      }

      const cleanDigits = phone.replace(/\D/g, '');
      if (cleanDigits.length < 10) {
        setErrorMsg('Informe seu WhatsApp com DDD no formato (XX)XXXXX-XXXX.');
        return;
      }

      if (!isValidEmail(email)) {
        setErrorMsg('Informe um endereço de e-mail válido (ex: seuemail@exemplo.com).');
        return;
      }

      if (password.length < 6) {
        setErrorMsg('A senha deve conter no mínimo 6 caracteres.');
        return;
      }

      setIsSubmitting(true);
      try {
        await registerWithEmail(name.trim(), email.trim(), password, cleanDigits);
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#00ff66', '#f59e0b', '#ffffff'],
        });
        handleClose();
      } catch (err: any) {
        if (err.code === 'auth/email-already-in-use') {
          setErrorMsg('Este e-mail já está cadastrado. Clique na aba "Já sou Cliente (Login)" ou recupere sua senha.');
        } else if (err.code === 'auth/weak-password') {
          setErrorMsg('A senha escolhida é fraca. Utilize ao menos 6 dígitos.');
        } else if (err.code === 'auth/invalid-email') {
          setErrorMsg('Formato de e-mail inválido.');
        } else {
          setErrorMsg(err.message || 'Erro ao criar conta. Tente novamente.');
        }
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#0d0e14] border border-fuchsia-500/40 rounded-3xl shadow-[0_0_40px_rgba(240,70,245,0.25)] overflow-hidden max-h-[92vh] flex flex-col">
        
        {/* Top Header */}
        <div className="flex items-center justify-between p-5 border-b border-zinc-800/80 bg-zinc-950/80 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-fuchsia-600 to-emerald-500 flex items-center justify-center text-white font-black shadow-lg">
              P
            </div>
            <div>
              <h3 className="font-black text-white text-base">
                {user || profile ? 'Minha Conta de Cliente' : isForgotPass ? 'Recuperar Senha' : authModalTab === 'login' ? 'Entrar na PO-PI-DI' : 'Criar Cadastro de Cliente'}
              </h3>
              <p className="text-[11px] text-zinc-400">
                {user || profile ? 'Seus dados, pontos e pedidos salvos' : 'Ganhe 50 pontos de boas-vindas no Clube Fidelidade!'}
              </p>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="p-2 text-zinc-400 hover:text-white rounded-xl bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-5 sm:p-6 space-y-4 overflow-y-auto">
          {/* If already logged in */}
          {user || profile ? (
            <div className="space-y-4 text-center py-1">
              <div className="w-16 h-16 rounded-full bg-zinc-800 border-2 border-emerald-400 mx-auto overflow-hidden flex items-center justify-center shadow-[0_0_15px_rgba(0,255,102,0.3)]">
                {user?.photoURL || profile?.photoURL ? (
                  <img src={user?.photoURL || profile?.photoURL} alt={profile?.name || user?.displayName || 'Avatar'} className="w-full h-full object-cover" />
                ) : (
                  <User className="w-8 h-8 text-emerald-400" />
                )}
              </div>

              <div>
                <h4 className="text-lg font-black text-white">{profile?.name || user?.displayName || 'Cliente PO-PI-DI'}</h4>
                <p className="text-xs text-zinc-400">{profile?.email || user?.email || 'Cadastro via WhatsApp'}</p>
                {profile?.phone && (
                  <p className="text-xs text-emerald-400 font-bold mt-0.5">📱 WhatsApp: {formatPhoneMask(profile.phone)}</p>
                )}
              </div>

              {/* MEUS PEDIDOS CARD */}
              <div className="p-4 bg-gradient-to-br from-zinc-900 via-zinc-900/90 to-zinc-950 rounded-2xl border border-emerald-500/40 text-left space-y-3 shadow-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-emerald-500 text-black flex items-center justify-center font-black">
                      <History className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-black text-white block leading-none">Meus Pedidos</span>
                      <span className="text-[10px] text-zinc-400">Histórico de compras</span>
                    </div>
                  </div>

                  <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-emerald-950 border border-emerald-800/60 text-emerald-400">
                    {userOrdersCount} {userOrdersCount === 1 ? 'pedido' : 'pedidos'}
                  </span>
                </div>

                <div className="flex items-center justify-between bg-zinc-950/80 p-3 rounded-xl border border-zinc-800/80">
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-zinc-500 uppercase block font-bold">Total de Pedidos</span>
                    <div className="flex items-center gap-1.5 text-base font-black text-white">
                      <ShoppingBag className="w-4 h-4 text-emerald-400" />
                      <span>{userOrdersCount > 0 ? `${userOrdersCount} no histórico` : 'Sem pedidos ainda'}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    id="btn-customer-area-my-orders"
                    onClick={handleOpenMyOrders}
                    className="px-3.5 py-2 bg-gradient-to-r from-emerald-500 to-green-400 hover:from-emerald-400 hover:to-green-300 text-black font-black text-xs rounded-xl shadow-md transition-all hover:scale-102 flex items-center gap-1.5 cursor-pointer"
                  >
                    <History className="w-3.5 h-3.5" />
                    <span>Ver Pedidos</span>
                  </button>
                </div>

                <p className="text-[10px] text-zinc-400 leading-snug">
                  Acompanhe o status do preparo, veja recibos e repita pedidos favoritos.
                </p>
              </div>

              {/* LOYALTY POINTS CARD IN CUSTOMER ACCOUNT */}
              <div className="p-4 bg-gradient-to-br from-zinc-900 via-zinc-900/90 to-zinc-950 rounded-2xl border border-amber-500/40 text-left space-y-3 shadow-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-amber-400 text-black flex items-center justify-center font-black">
                      <Crown className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-black text-white block leading-none">Clube Fidelidade PO-PI-DI</span>
                      <span className="text-[10px] text-zinc-400">Saldo da sua conta</span>
                    </div>
                  </div>

                  <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-gradient-to-r ${tierInfo.badgeColor} shadow-sm`}>
                    Nível {tierInfo.tier}
                  </span>
                </div>

                <div className="flex items-center justify-between bg-zinc-950/80 p-3 rounded-xl border border-zinc-800/80">
                  <div>
                    <span className="text-[10px] text-zinc-500 uppercase block font-bold">Saldo Atual</span>
                    <div className="flex items-center gap-1.5 text-xl font-black text-amber-400">
                      <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                      <span>{currentLoyaltyPoints}</span>
                      <span className="text-xs font-bold text-zinc-400">pontos</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      handleClose();
                      setIsLoyaltyOpen(true);
                    }}
                    className="px-3.5 py-2 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-black font-black text-xs rounded-xl shadow-md transition-all hover:scale-102 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Gift className="w-3.5 h-3.5" />
                    <span>Resgatar</span>
                  </button>
                </div>

                <p className="text-[10px] text-zinc-400 leading-snug">
                  Ganhe <strong>1 ponto para cada R$ 1,00 gasto</strong> em burgers e chopps!
                </p>
              </div>

              <div className="p-3 bg-zinc-900/80 rounded-2xl border border-zinc-800 text-left space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Conta sincronizada em tempo real</span>
                </div>
                <p className="text-[11px] text-zinc-400">
                  Seus pedidos e endereços ficam salvos automaticamente na nuvem.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 pt-1">
                <button
                  type="button"
                  id="btn-footer-customer-my-orders"
                  onClick={handleOpenMyOrders}
                  className="flex-1 py-3 bg-zinc-900 hover:bg-zinc-800 text-emerald-400 hover:text-emerald-300 font-black text-xs rounded-xl border border-zinc-800 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <History className="w-4 h-4" />
                  <span>Meus Pedidos</span>
                </button>
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-400 hover:to-green-400 text-black font-black text-xs rounded-xl shadow-lg transition-transform hover:scale-[1.02] cursor-pointer"
                >
                  Fazer Pedido
                </button>
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    setAuthModalTab('login');
                  }}
                  className="py-3 px-3.5 bg-zinc-900 hover:bg-amber-950/40 text-zinc-300 hover:text-amber-300 font-bold text-xs rounded-xl border border-zinc-800 transition-colors cursor-pointer"
                  title="Trocar de Conta"
                >
                  Trocar Conta
                </button>
                <button
                  type="button"
                  onClick={logout}
                  className="py-3 px-3.5 bg-zinc-900 hover:bg-red-950/40 text-zinc-400 hover:text-red-400 font-bold text-xs rounded-xl border border-zinc-800 transition-colors cursor-pointer"
                  title="Sair da Conta"
                >
                  Sair
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Notice Banner (e.g. "Você precisa estar logado para pedir!") */}
              {authNoticeMessage && (
                <div className="p-3 bg-amber-500/15 border border-amber-500/50 rounded-2xl flex items-center gap-2.5 text-xs text-amber-300 font-bold animate-in fade-in">
                  <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
                  <span>{authNoticeMessage}</span>
                </div>
              )}

              {/* Tab Selector (Login vs Cadastro) */}
              {!isForgotPass && (
                <div className="flex bg-zinc-950 p-1 rounded-2xl border border-zinc-800">
                  <button
                    type="button"
                    onClick={() => {
                      setAuthModalTab('login');
                      setErrorMsg('');
                    }}
                    className={`flex-1 py-2 text-xs font-black rounded-xl transition-all cursor-pointer ${
                      authModalTab === 'login'
                        ? 'bg-zinc-800 text-white shadow'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    Já sou Cliente (Login)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAuthModalTab('register');
                      setErrorMsg('');
                    }}
                    className={`flex-1 py-2 text-xs font-black rounded-xl transition-all cursor-pointer ${
                      authModalTab === 'register'
                        ? 'bg-emerald-500 text-black shadow'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    Criar Nova Conta ✨
                  </button>
                </div>
              )}

              {/* Google Fast Sign-In Button */}
              {!isForgotPass && (
                <div>
                  <button
                    type="button"
                    onClick={handleGoogleLogin}
                    disabled={isSubmitting}
                    className="w-full flex items-center justify-center gap-3 bg-white hover:bg-zinc-100 disabled:bg-zinc-200 text-zinc-900 font-bold text-xs py-3 px-4 rounded-2xl shadow-lg transition-all hover:scale-[1.01] active:scale-[0.99] border border-zinc-200 cursor-pointer disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <div className="w-4 h-4 border-2 border-zinc-800 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <svg className="w-4 h-4" viewBox="0 0 24 24">
                        <path
                          fill="#4285F4"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                        />
                      </svg>
                    )}
                    <span>{isSubmitting ? 'Conectando ao Google...' : 'Continuar com o Google'}</span>
                  </button>

                  <div className="relative my-3">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-zinc-800" />
                    </div>
                    <div className="relative flex justify-center text-[10px] uppercase">
                      <span className="bg-[#0d0e14] px-3 text-zinc-500 font-bold">
                        ou preencha seus dados
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Alerts */}
              {errorMsg && (
                <div className="p-3 bg-red-950/60 border border-red-800/80 rounded-xl flex items-start gap-2.5 text-xs text-red-300 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
                  <span className="leading-tight">{errorMsg}</span>
                </div>
              )}

              {successMsg && (
                <div className="p-3 bg-emerald-950/60 border border-emerald-800/80 rounded-xl flex items-start gap-2.5 text-xs text-emerald-300 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
                  <span className="leading-tight">{successMsg}</span>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-3">
                {/* 1. If Register Tab */}
                {authModalTab === 'register' && !isForgotPass && (
                  <>
                    <div>
                      <label className="text-xs font-bold text-zinc-300 block mb-1">Nome Completo *</label>
                      <div className="relative">
                        <User className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3.5" />
                        <input
                          type="text"
                          required
                          value={name}
                          onChange={e => setName(e.target.value)}
                          placeholder="Ex: Carlos Eduardo"
                          className="w-full bg-zinc-900/90 border border-zinc-800 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-zinc-300 block mb-1">
                        WhatsApp / Celular com DDD *
                      </label>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-emerald-400 absolute left-3.5 top-3.5" />
                        <input
                          type="tel"
                          required
                          value={phone}
                          onChange={handlePhoneChange}
                          placeholder="(XX)XXXXX-XXXX"
                          className="w-full bg-zinc-900/90 border border-zinc-800 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 font-mono font-bold"
                        />
                      </div>
                      <p className="text-[10px] text-zinc-500 mt-1">Exemplo: (XX)XXXXX-XXXX</p>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-zinc-300 block mb-1">E-mail *</label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3.5" />
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={e => setEmail(e.target.value)}
                          placeholder="seuemail@exemplo.com"
                          className="w-full bg-zinc-900/90 border border-zinc-800 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-zinc-300 block mb-1">Crie uma Senha (mín. 6 dígitos) *</label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3.5" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={password}
                          onChange={e => setPassword(e.target.value)}
                          placeholder="Crie sua senha de acesso"
                          className="w-full bg-zinc-900/90 border border-zinc-800 rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3.5 top-3 text-zinc-500 hover:text-zinc-300 cursor-pointer"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </>
                )}

                {/* 2. If Login Tab */}
                {authModalTab === 'login' && !isForgotPass && (
                  <>
                    <div>
                      <label className="text-xs font-bold text-zinc-300 block mb-1">E-mail ou WhatsApp *</label>
                      <div className="relative">
                        <User className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3.5" />
                        <input
                          type="text"
                          required
                          value={email}
                          onChange={e => setEmail(e.target.value)}
                          placeholder="seuemail@exemplo.com ou (XX)XXXXX-XXXX"
                          className="w-full bg-zinc-900/90 border border-zinc-800 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-bold text-zinc-300">Senha</label>
                        <button
                          type="button"
                          onClick={() => {
                            setIsForgotPass(true);
                            setErrorMsg('');
                            setSuccessMsg('');
                          }}
                          className="text-[11px] text-fuchsia-400 hover:underline cursor-pointer"
                        >
                          Esqueceu a senha?
                        </button>
                      </div>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3.5" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={e => setPassword(e.target.value)}
                          placeholder="Sua senha de acesso"
                          className="w-full bg-zinc-900/90 border border-zinc-800 rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3.5 top-3 text-zinc-500 hover:text-zinc-300 cursor-pointer"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </>
                )}

                {/* 3. If Forgot Password Tab */}
                {isForgotPass && (
                  <div>
                    <label className="text-xs font-bold text-zinc-300 block mb-1">E-mail Cadastrado *</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3.5" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="seuemail@exemplo.com"
                        className="w-full bg-zinc-900/90 border border-zinc-800 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>
                )}

                {/* Submit Action Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full mt-2 py-3.5 bg-gradient-to-r from-emerald-500 via-emerald-400 to-green-500 hover:from-emerald-400 hover:to-green-400 text-black font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-emerald-500/25 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                      <span>Processando...</span>
                    </div>
                  ) : isForgotPass ? (
                    <span>Enviar Link de Recuperação</span>
                  ) : authModalTab === 'login' ? (
                    <>
                      <span>Entrar na Minha Conta</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  ) : (
                    <>
                      <span>Criar Minha Conta (Ganhe 50 Pts)</span>
                      <Sparkles className="w-4 h-4" />
                    </>
                  )}
                </button>

                {isForgotPass && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsForgotPass(false);
                      setErrorMsg('');
                    }}
                    className="w-full text-center text-xs text-zinc-400 hover:text-white pt-1 block cursor-pointer"
                  >
                    ← Voltar para o Login
                  </button>
                )}
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

