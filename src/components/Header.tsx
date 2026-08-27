import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { formatBRL } from '../utils/formatters';
import officialLogoImg from '../assets/images/popidi_official_logo.png';
import { 
  ShoppingBag, 
  Clock, 
  MapPin, 
  Instagram, 
  History, 
  Menu as MenuIcon, 
  X,
  Bike,
  Beer,
  UtensilsCrossed,
  Sparkles,
  User,
  LogIn,
  LogOut,
  ChevronDown,
  Crown,
  Gift,
  Star,
  Award,
  ShieldCheck
} from 'lucide-react';

export const Header: React.FC = () => {
  const { 
    cartCount, 
    total, 
    setIsCartOpen, 
    setIsOrderHistoryOpen, 
    setIsLoyaltyOpen,
    activeOrder,
    setIsOrderTrackerOpen,
    storeSettings,
    setIsAdminOpen,
    navigateToCategory
  } = useCart();

  const {
    user,
    profile,
    isAdmin,
    setIsAuthModalOpen,
    setAuthModalTab,
    logout
  } = useAuth();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const currentLoyaltyPoints = profile?.loyaltyPoints ?? (user ? 50 : 0);

  const handleOpenLogin = () => {
    setAuthModalTab('login');
    setIsAuthModalOpen(true);
    setMobileMenuOpen(false);
  };

  const handleOpenRegister = () => {
    setAuthModalTab('register');
    setIsAuthModalOpen(true);
    setMobileMenuOpen(false);
  };

  const handleOpenLoyalty = () => {
    setIsLoyaltyOpen(true);
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
  };

  return (
    <header id="main-header" className="sticky top-0 z-40 bg-[#08080c]/95 backdrop-blur-md border-b border-fuchsia-950/60 shadow-2xl">
      {/* Top Notification Announcement Bar */}
      {storeSettings.activeBannerAnnouncement && (
        <div className="bg-gradient-to-r from-fuchsia-950 via-zinc-950 to-emerald-950 border-b border-fuchsia-900/40 text-zinc-100 py-1.5 px-4 text-xs font-bold tracking-wide flex items-center justify-center gap-2 overflow-hidden shadow-inner">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#00ff66]" />
          <span className="truncate text-fuchsia-300 font-extrabold uppercase">{storeSettings.activeBannerAnnouncement}</span>
          <span className="hidden md:inline text-zinc-500">•</span>
          <span className="hidden md:inline text-emerald-400 font-bold">Entrega rápida em {storeSettings.cityState}!</span>
        </div>
      )}

      {/* Main Navigation Bar */}
      <div className="w-full max-w-[1720px] mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-3">
          
          {/* Left Navigation Menus & Brand Logo */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Brand Logo in Header */}
            <a 
              href="#" 
              className="flex items-center gap-2 group py-1 shrink-0"
              title="PO-PI-DI Hamburgueria & Choperia"
            >
              <div className="w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center shrink-0">
                <img 
                  src={officialLogoImg || "/popidi_official_logo.png"} 
                  alt="PO-PI-DI" 
                  className="w-full h-full object-contain group-hover:scale-105 transition-transform" 
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/popidi_official_logo.png';
                  }}
                />
              </div>
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-sm font-black neon-text-green tracking-wider leading-none">PO-PI-DI</span>
                <span className="text-[10px] font-serif italic text-fuchsia-400 font-bold leading-tight">Hamburgueria & Choperia</span>
              </div>
            </a>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-1.5 bg-zinc-950/80 p-1.5 rounded-2xl border border-zinc-800/80 shadow-inner">
              <a 
                href="#" 
                className="px-4 py-2 text-xs font-bold text-zinc-300 hover:text-emerald-400 hover:bg-zinc-900 rounded-xl transition-colors"
              >
                Início
              </a>
              <a 
                href="#cardapio" 
                className="px-4 py-2 text-xs font-bold text-zinc-300 hover:text-emerald-400 hover:bg-zinc-900 rounded-xl transition-colors flex items-center gap-1.5"
              >
                <UtensilsCrossed className="w-3.5 h-3.5 text-emerald-400" />
                <span>Cardápio</span>
              </a>
              <button
                type="button"
                onClick={() => navigateToCategory('choperia')}
                className="px-4 py-2 text-xs font-bold text-zinc-300 hover:text-yellow-400 hover:bg-zinc-900 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Beer className="w-3.5 h-3.5 text-yellow-400" />
                <span>Choperia</span>
              </button>
              <a 
                href="#o-famoso-xtudo" 
                className="px-4 py-2 text-xs font-bold text-fuchsia-300 hover:text-fuchsia-200 hover:bg-fuchsia-950/40 rounded-xl transition-colors flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                <span>X-Tudo</span>
              </a>
              <a 
                href="#localizacao" 
                className="px-4 py-2 text-xs font-bold text-zinc-300 hover:text-fuchsia-300 hover:bg-zinc-900 rounded-xl transition-colors flex items-center gap-1.5"
              >
                <MapPin className="w-3.5 h-3.5 text-fuchsia-400" />
                <span>Localização</span>
              </a>
            </nav>
          </div>

          {/* Center: Clube de Fidelidade VIP */}
          <div className="flex items-center justify-center">
            <button
              id="btn-open-loyalty-header"
              onClick={handleOpenLoyalty}
              className="group relative flex items-center gap-2 bg-gradient-to-r from-amber-500/15 via-yellow-500/20 to-amber-500/15 hover:from-amber-500/25 hover:to-yellow-500/30 text-amber-300 border border-amber-500/40 hover:border-amber-400/80 px-3.5 sm:px-4 py-2 rounded-2xl text-xs font-black transition-all shadow-[0_0_15px_rgba(234,179,8,0.15)] hover:shadow-[0_0_20px_rgba(234,179,8,0.3)] hover:scale-102 cursor-pointer"
              title="Acessar Clube de Fidelidade e Resgatar Prêmios"
            >
              <div className="w-6 h-6 rounded-lg bg-amber-400 text-black flex items-center justify-center shadow-md group-hover:rotate-12 transition-transform">
                <Crown className="w-3.5 h-3.5 stroke-[2.5]" />
              </div>
              
              <div className="flex flex-col text-left">
                <div className="flex items-center gap-1.5 leading-none">
                  <span className="tracking-wider uppercase font-black text-white text-[11px] sm:text-xs">Clube Fidelidade</span>
                  <span className="hidden sm:inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                </div>
                <span className="text-[10px] text-amber-400/90 font-bold leading-tight text-center">
                  {user ? `${currentLoyaltyPoints} pts disponíveis` : 'Ganhe 50 Pts Grátis'}
                </span>
              </div>
            </button>
          </div>

          {/* Right Action Controls: Customer Login & Cart */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            
            {/* Active Order Tracker Pill - Only shown when user is connected */}
            {(user || profile) && activeOrder && activeOrder.status !== 'completed' && activeOrder.status !== 'cancelled' && (
              <button
                id="btn-active-order-tracker"
                onClick={() => setIsOrderTrackerOpen(true)}
                className="flex items-center gap-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-3 py-2 rounded-xl text-xs font-bold transition-all shadow-[0_0_12px_rgba(0,255,102,0.2)] animate-pulse cursor-pointer"
                title="Acompanhar pedido em tempo real"
              >
                <Bike className="w-4 h-4" />
                <span className="hidden sm:inline">Acompanhar</span>
                <span>{activeOrder.shortCode}</span>
              </button>
            )}

            {/* Customer Login / Account Menu */}
            {(user || profile) ? (
              <div className="relative">
                <button
                  id="btn-user-account-menu"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-2 text-xs font-bold text-zinc-200 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-xl transition-colors"
                >
                  {user?.photoURL ? (
                    <img src={user.photoURL} alt="Avatar" className="w-6 h-6 rounded-full object-cover border border-emerald-400" />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-400 flex items-center justify-center text-emerald-400 font-black text-xs">
                      {(profile?.name || user?.displayName || 'C').charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="hidden sm:inline max-w-[90px] truncate">{profile?.name?.split(' ')[0] || user?.displayName?.split(' ')[0] || 'Minha Conta'}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-zinc-500" />
                </button>

                {/* Dropdown for logged customer */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-60 bg-[#0e0914] border border-zinc-800 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                    <div className="px-3 py-2 border-b border-zinc-800/80 mb-1">
                      <p className="text-xs font-black text-white truncate">{profile?.name || user?.displayName || 'Cliente'}</p>
                      <p className="text-[11px] text-zinc-400 truncate">{profile?.email || user?.email || profile?.phone || ''}</p>
                      
                      {/* Loyalty Badge in dropdown */}
                      <div className="mt-1.5 flex items-center justify-between bg-amber-500/10 border border-amber-500/30 px-2.5 py-1 rounded-lg">
                        <span className="text-[10px] font-bold text-amber-300 flex items-center gap-1">
                          <Crown className="w-3 h-3 text-amber-400" />
                          Clube VIP
                        </span>
                        <span className="text-[11px] font-black text-amber-400">
                          {currentLoyaltyPoints} pts
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={handleOpenLoyalty}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-amber-300 hover:text-amber-200 hover:bg-amber-500/10 rounded-xl transition-colors text-left font-bold"
                    >
                      <Gift className="w-4 h-4 text-amber-400" />
                      <span>Resgatar Prêmios ({currentLoyaltyPoints} pts)</span>
                    </button>

                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        setIsOrderHistoryOpen(true);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-zinc-300 hover:text-white hover:bg-zinc-800/80 rounded-xl transition-colors text-left"
                    >
                      <History className="w-4 h-4 text-emerald-400" />
                      <span>Meus Pedidos</span>
                    </button>

                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        setIsAuthModalOpen(true);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-zinc-300 hover:text-white hover:bg-zinc-800/80 rounded-xl transition-colors text-left"
                    >
                      <User className="w-4 h-4 text-fuchsia-400" />
                      <span>Dados da Conta & Fidelidade</span>
                    </button>

                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-red-400 hover:text-red-300 hover:bg-red-950/40 rounded-xl transition-colors text-left mt-1 border-t border-zinc-800/80 pt-2"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sair da Conta</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                id="btn-open-customer-login"
                onClick={handleOpenLogin}
                className="flex items-center gap-2 bg-zinc-900/90 hover:bg-zinc-800 text-zinc-200 hover:text-white px-3 sm:px-3.5 py-2.5 rounded-xl border border-zinc-800 hover:border-zinc-700 text-xs font-bold transition-all shadow-sm"
                title="Entrar com Google ou E-mail"
              >
                <LogIn className="w-4 h-4 text-emerald-400" />
                <span className="hidden sm:inline">Entrar / Cadastrar</span>
                <span className="sm:hidden">Entrar</span>
              </button>
            )}

            {/* Cart Button with Neon Green accent - Only visible after login */}
            {user && (
              <button
                id="btn-open-cart-header"
                onClick={() => setIsCartOpen(true)}
                className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 via-emerald-400 to-green-500 hover:from-emerald-400 hover:to-green-400 text-black font-black px-3 sm:px-4 py-2.5 rounded-xl shadow-lg shadow-emerald-500/25 hover:scale-[1.02] active:scale-95 transition-all border border-emerald-300/40 cursor-pointer"
              >
                <div className="relative">
                  <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
                  {cartCount > 0 && (
                    <span className="absolute -top-2.5 -right-2.5 bg-fuchsia-600 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-lg border border-fuchsia-400 animate-bounce">
                      {cartCount}
                    </span>
                  )}
                </div>
                <span className="text-xs sm:text-sm font-black">
                  {cartCount > 0 ? formatBRL(total) : 'Carrinho'}
                </span>
              </button>
            )}

            {/* Mobile menu toggle */}
            <button
              id="btn-mobile-menu-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="xl:hidden p-2.5 text-zinc-400 hover:text-white bg-zinc-900 rounded-xl border border-zinc-800"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <MenuIcon className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="xl:hidden bg-[#0a0a0f] border-b border-fuchsia-950/70 px-4 py-4 space-y-3 animate-in slide-in-from-top-2 duration-200">
          
          {/* Navigation Links */}
          <div className="grid grid-cols-2 gap-2 py-2 border-b border-zinc-800/80">
            <a 
              href="#" 
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 bg-zinc-900 text-zinc-200 rounded-xl text-xs font-bold text-center"
            >
              🍔 Início
            </a>
            <a 
              href="#cardapio" 
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 bg-zinc-900 text-emerald-400 rounded-xl text-xs font-bold text-center"
            >
              📋 Cardápio
            </a>
            <button 
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                navigateToCategory('choperia');
              }}
              className="px-3 py-2 bg-zinc-900 text-yellow-400 rounded-xl text-xs font-bold text-center flex items-center justify-center gap-1"
            >
              🍺 Choperia
            </button>
            <a 
              href="#o-famoso-xtudo" 
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 bg-fuchsia-950/60 text-fuchsia-300 border border-fuchsia-800/40 rounded-xl text-xs font-bold text-center"
            >
              ✨ X-Tudo
            </a>
            <a 
              href="#localizacao" 
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 bg-zinc-900 text-zinc-300 rounded-xl text-xs font-bold text-center col-span-2"
            >
              📍 Localização & Mapa
            </a>
          </div>

          {/* Customer Auth Actions in Mobile */}
          <div className="p-3 bg-zinc-900/60 rounded-2xl border border-zinc-800 space-y-2">
            {(user || profile) ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-white">{profile?.name || user?.displayName || user?.email || profile?.phone}</span>
                  <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950/60 px-2 py-0.5 rounded-full">Conectado</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setIsOrderHistoryOpen(true);
                    }}
                    className="py-2 px-3 bg-zinc-800 text-xs font-bold text-white rounded-xl"
                  >
                    Meus Pedidos
                  </button>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      logout();
                    }}
                    className="py-2 px-3 bg-red-950/40 text-xs font-bold text-red-400 rounded-xl border border-red-900/40"
                  >
                    Sair
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-xs text-zinc-400">Entre com Google para sincronizar seus pedidos:</p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={handleOpenLogin}
                    className="py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs rounded-xl text-center cursor-pointer"
                  >
                    Entrar / Login
                  </button>
                  <button
                    onClick={handleOpenRegister}
                    className="py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs rounded-xl text-center cursor-pointer"
                  >
                    Criar Conta
                  </button>
                </div>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setIsOrderHistoryOpen(true);
                  }}
                  className="w-full py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 text-xs font-bold rounded-xl text-center flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <History className="w-3.5 h-3.5 text-amber-400" />
                  <span>Rastrear Pedido por Código ou Telefone</span>
                </button>
              </div>
            )}
          </div>

          {/* Clube de Fidelidade in Mobile */}
          <button
            onClick={handleOpenLoyalty}
            className="w-full flex items-center justify-between p-3 bg-gradient-to-r from-amber-500/20 via-yellow-500/25 to-amber-500/20 text-amber-300 border border-amber-500/50 rounded-2xl text-xs font-black shadow-md"
          >
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-400 text-black flex items-center justify-center font-black">
                <Crown className="w-4 h-4" />
              </div>
              <div className="text-left">
                <div className="text-white font-black text-xs uppercase tracking-wide">Clube Fidelidade PO-PI-DI</div>
                <div className="text-[10px] text-amber-300 font-bold">
                  {user ? `${currentLoyaltyPoints} pontos acumulados` : 'Ganhe 50 Pontos no cadastro'}
                </div>
              </div>
            </div>
            <span className="text-[10px] font-black bg-amber-400 text-black px-2.5 py-1 rounded-lg">
              Ver Prêmios
            </span>
          </button>
        </div>
      )}
    </header>
  );
};
