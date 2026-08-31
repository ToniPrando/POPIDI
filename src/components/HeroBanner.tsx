import React from 'react';
import { useCart } from '../context/CartContext';
import { NeonLogo } from './NeonLogo';
import { 
  Flame, 
  Sparkles, 
  Bike, 
  ChevronRight, 
  Star,
  ShieldCheck, 
  ShoppingBag, 
  Beer,
  Clock,
  MapPin
} from 'lucide-react';

export const HeroBanner: React.FC = () => {
  const { storeSettings, setIsCartOpen } = useCart();

  const scrollToMenu = () => {
    const el = document.getElementById('cardapio-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="hero-banner-section" className="relative overflow-hidden bg-gradient-to-b from-[#0e0914] via-[#090a10] to-[#08080c] border-b border-fuchsia-950/40">
      {/* Background ambient neon lighting effects */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[350px] bg-gradient-to-b from-fuchsia-600/20 via-emerald-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/4 right-10 w-96 h-96 bg-fuchsia-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-yellow-400/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-1 sm:pt-2 pb-8 sm:pb-12 relative z-10">
        
        {/* 2-Column Hero Grid: Big Logo on the Left, Text on the Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* Left Column: Big Official Logo Showcase */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center lg:justify-start relative order-1 lg:order-1 -mt-2 sm:-mt-4 lg:-mt-6">
            <div className="relative group p-0 sm:p-1 flex items-center justify-center">
              <NeonLogo 
                size="hero" 
                showSubtitle={false} 
                pulse={true}
                className="hover:scale-105 transition-transform duration-300"
              />
            </div>
          </div>

          {/* Right Column: Headline, Description, CTAs, Trust Badges */}
          <div className="lg:col-span-7 text-center lg:text-left space-y-6 order-2 lg:order-2">
            
            {/* Top Specialty Badge */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2">
              <div className="inline-flex items-center gap-2 bg-fuchsia-950/60 border border-fuchsia-500/50 px-4 py-1.5 rounded-full text-xs font-black text-fuchsia-300 shadow-[0_0_15px_rgba(240,70,245,0.25)] backdrop-blur-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping shadow-[0_0_8px_#00ff66]" />
                <span className="uppercase tracking-wider">
                  {storeSettings.heroSpecialBadge || 'O Autêntico Burger Artesanal & Chopp Gelado'}
                </span>
              </div>

              <div className="inline-flex items-center gap-1.5 bg-zinc-900/80 border border-zinc-800 px-3.5 py-1.5 rounded-full text-xs font-bold text-zinc-300">
                <Clock className="w-3.5 h-3.5 text-yellow-400" />
                <span>Preparo rápido: {storeSettings.estimatedPrepTimeMin || 25}-{storeSettings.estimatedPrepTimeMax || 45} min</span>
              </div>
            </div>

            {/* Announcement Banner if Active */}
            {storeSettings.activeBannerAnnouncement && (
              <div className="inline-block bg-amber-500/20 border border-amber-500/50 text-amber-300 text-xs font-black px-4 py-2 rounded-2xl shadow-sm text-left">
                {storeSettings.activeBannerAnnouncement}
              </div>
            )}

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-5xl xl:text-6xl font-black text-white tracking-tight leading-[1.12] text-center lg:text-left">
              {storeSettings.heroHeadline || (
                <>BURGER ARTESANAL NA BRASA & <span className="neon-text-pink font-serif italic">CHOPP TRINCANDO</span> DE GELADO.</>
              )}
            </h1>

            {/* Description */}
            <p className="text-base sm:text-lg text-zinc-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              {storeSettings.heroSubheadline || 'Pães brioche selados na manteiga, carnes nobres selecionadas moídas diariamente na brasa, smash burgers crocantes, chopp artesanal tirado no ponto certo e o autêntico X-Tudo Especial com sabor inconfundível.'}
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
              <button
                id="hero-btn-order-now"
                onClick={scrollToMenu}
                className="w-full sm:w-auto flex items-center justify-center gap-2.5 bg-gradient-to-r from-emerald-500 via-emerald-400 to-green-500 hover:from-emerald-400 hover:to-green-400 text-black font-black text-base px-8 py-4 rounded-xl shadow-xl shadow-emerald-500/25 hover:scale-[1.02] active:scale-98 transition-all group border border-emerald-300/40 cursor-pointer"
              >
                <ShoppingBag className="w-5 h-5" />
                <span>FAZER MEU PEDIDO</span>
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>

              <a
                id="hero-btn-explore-choperia"
                href="#o-famoso-xtudo"
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-zinc-900/90 hover:bg-zinc-800 text-fuchsia-300 border border-fuchsia-800/60 font-black text-base px-6 py-4 rounded-xl transition-all shadow-[0_0_12px_rgba(240,70,245,0.15)] hover:border-fuchsia-500"
              >
                <Sparkles className="w-4 h-4 text-yellow-400" />
                <span>O Famoso X-Tudo</span>
              </a>
            </div>

            {/* Trust Badges & Highlights */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-4 border-t border-zinc-800/80 text-left">
              <div className="flex items-center gap-2 p-2 rounded-xl bg-zinc-900/60 border border-zinc-800/80">
                <Bike className="w-4 h-4 text-emerald-400 shrink-0" />
                <div>
                  <div className="text-xs font-bold text-white leading-tight">Delivery Rápido</div>
                  <div className="text-[10px] text-zinc-400">Direto na sua casa</div>
                </div>
              </div>

              <div className="flex items-center gap-2 p-2 rounded-xl bg-zinc-900/60 border border-zinc-800/80">
                <Beer className="w-4 h-4 text-yellow-400 shrink-0" />
                <div>
                  <div className="text-xs font-bold text-white leading-tight">Chopps Nobres</div>
                  <div className="text-[10px] text-zinc-400">Pilsen, IPA & Vinho</div>
                </div>
              </div>

              <div className="flex items-center gap-2 p-2 rounded-xl bg-zinc-900/60 border border-zinc-800/80">
                <MapPin className="w-4 h-4 text-fuchsia-400 shrink-0" />
                <div>
                  <div className="text-xs font-bold text-white leading-tight">Retirada Balcão</div>
                  <div className="text-[10px] text-zinc-400">Pronto em minutos</div>
                </div>
              </div>

              <div className="flex items-center gap-2 p-2 rounded-xl bg-zinc-900/60 border border-zinc-800/80">
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400 shrink-0" />
                <div>
                  <div className="text-xs font-bold text-white leading-tight">5.0 Estrelas</div>
                  <div className="text-[10px] text-zinc-400">Hamburgueria Oficial</div>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};

