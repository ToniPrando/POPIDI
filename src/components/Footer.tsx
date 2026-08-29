import React from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { NeonLogo } from './NeonLogo';
import { getCleanWhatsAppNumber } from '../utils/formatters';
import { 
  Flame, 
  Instagram, 
  Phone, 
  MapPin, 
  Clock, 
  ShieldCheck, 
  Lock,
  Heart,
  QrCode,
  CreditCard,
  Banknote,
  Beer,
  ExternalLink,
  Navigation
} from 'lucide-react';

export const Footer: React.FC = () => {
  const { storeSettings, setIsAdminOpen, navigateToCategory } = useCart();
  const { isAdmin, setIsAdminLoginOpen } = useAuth();

  const handleOpenAdminAccess = () => {
    if (isAdmin) {
      setIsAdminOpen(true);
    } else {
      setIsAdminLoginOpen(true);
    }
  };

  return (
    <footer id="main-footer" className="bg-[#050508] border-t border-fuchsia-950/40 text-zinc-400 text-xs text-left">
      <div className="w-full max-w-[1720px] mx-auto px-3 sm:px-6 lg:px-8 py-10 sm:py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          
          {/* Brand Info & Official Logo */}
          <div className="space-y-4 md:pr-4">
            <div className="flex items-center gap-3.5">
              <div className="relative group p-1 bg-zinc-900/90 rounded-2xl border border-fuchsia-900/30 shadow-[0_0_20px_rgba(240,70,245,0.15)] flex items-center justify-center shrink-0">
                <NeonLogo size="sm" showSubtitle={false} className="hover:scale-105 transition-transform duration-300" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-2xl font-black neon-text-green uppercase tracking-tight block">
                    PO-PI-DI
                  </span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#00ff66]" />
                </div>
                <span className="text-xs neon-text-pink font-semibold italic -mt-0.5 block font-serif">
                  Hamburgueria & Choperia
                </span>
                <span className="inline-block mt-1 text-[10px] uppercase font-bold tracking-widest text-amber-400 bg-amber-950/40 border border-amber-800/40 px-2 py-0.5 rounded-full">
                  🔥 Na Brasa & Chopp Trincando
                </span>
              </div>
            </div>

            <p className="text-zinc-400 text-xs leading-relaxed">
              O verdadeiro hambúrguer artesanal e chopp gelado de Porto Feliz - SP. Pães selados na manteiga, blends nobres moídos diariamente e o autêntico X-Tudo.
            </p>

            <div className="flex items-center gap-3 pt-1">
              <a
                href={storeSettings.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl bg-zinc-900 hover:bg-fuchsia-950/80 border border-zinc-800 hover:border-fuchsia-600 flex items-center justify-center text-fuchsia-400 transition-all hover:scale-105 shadow-[0_0_10px_rgba(240,70,245,0.15)]"
                title="Instagram @po_pi_di_hamburgueria"
              >
                <Instagram className="w-4 h-4" />
              </a>

              <a
                href={`https://wa.me/${getCleanWhatsAppNumber(storeSettings.phoneWhatsApp)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl bg-zinc-900 hover:bg-emerald-950/80 border border-zinc-800 hover:border-emerald-600 flex items-center justify-center text-emerald-400 transition-all hover:scale-105 shadow-[0_0_10px_rgba(0,255,102,0.15)]"
                title="WhatsApp Oficial"
              >
                <Phone className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-black text-white uppercase tracking-wider">
              Navegação Rápida
            </h4>
            <ul className="space-y-2">
              <li>
                <a href="#cardapio-section" className="hover:text-emerald-400 transition-colors">
                  • Cardápio Completo & Smash
                </a>
              </li>
              <li>
                <button 
                  type="button"
                  onClick={() => navigateToCategory('choperia')} 
                  className="hover:text-yellow-400 transition-colors text-left cursor-pointer"
                >
                  • Choperia & Chopps Artesanais
                </button>
              </li>
              <li>
                <a href="#o-famoso-xtudo" className="hover:text-fuchsia-400 transition-colors">
                  • O Famoso X-Tudo
                </a>
              </li>
              <li>
                <a href="#sobre" className="hover:text-fuchsia-400 transition-colors">
                  • Nossa História & Instagram
                </a>
              </li>
              <li>
                <a href="#localizacao" className="hover:text-emerald-400 transition-colors">
                  • Endereço & Horários
                </a>
              </li>
            </ul>
          </div>

          {/* Opening Hours & Contact */}
          <div className="space-y-3">
            <h4 className="text-xs font-black text-white uppercase tracking-wider">
              Atendimento
            </h4>
            <div className="space-y-2 text-zinc-400">
              <a
                href={storeSettings.googleMapsUrl || 'https://www.google.com/maps/search/?api=1&query=R.+Sarquis+Abibe,+103,+Centro,+Porto+Feliz+-+SP,+18540-003'}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-2 group hover:text-fuchsia-300 transition-colors"
              >
                <MapPin className="w-4 h-4 text-fuchsia-400 shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                <span>
                  {storeSettings.address}<br />
                  <span className="text-zinc-500 group-hover:text-fuchsia-400 flex items-center gap-1 text-[11px]">
                    {storeSettings.cityState} • Ver no Google Maps ↗
                  </span>
                </span>
              </a>
              <p className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />
                <span>{storeSettings.openingHoursText}</span>
              </p>
              <p className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>(15) 99707-5641</span>
              </p>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="space-y-3">
            <h4 className="text-xs font-black text-white uppercase tracking-wider">
              Formas de Pagamento
            </h4>
            <p className="text-[11px] text-zinc-400">
              Aceitamos pagamentos rápidos no delivery e balcão:
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              <span className="bg-zinc-900 border border-emerald-900/40 px-2.5 py-1 rounded-lg text-[11px] text-emerald-400 font-bold flex items-center gap-1 shadow-sm">
                <QrCode className="w-3 h-3 text-emerald-400" />
                PIX Instantâneo
              </span>
              <span className="bg-zinc-900 border border-zinc-800 px-2.5 py-1 rounded-lg text-[11px] text-zinc-300 flex items-center gap-1">
                <CreditCard className="w-3 h-3 text-fuchsia-400" />
                Cartão Débito / Crédito
              </span>
              <span className="bg-zinc-900 border border-zinc-800 px-2.5 py-1 rounded-lg text-[11px] text-zinc-300 flex items-center gap-1">
                <Banknote className="w-3 h-3 text-yellow-400" />
                Dinheiro
              </span>
            </div>

            <div className="pt-2">
              <button
                id="btn-footer-admin-login"
                type="button"
                onClick={handleOpenAdminAccess}
                className={`text-[11px] flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border transition-all cursor-pointer ${
                  isAdmin 
                    ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20 font-bold shadow-[0_0_10px_rgba(234,179,8,0.1)]' 
                    : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                }`}
                title={isAdmin ? "Painel do Gerente (Conectado)" : "Acesso Protegido por Senha"}
              >
                {isAdmin ? (
                  <>
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                    <span>Painel Gerente / KDS (Autenticado)</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5 text-yellow-500" />
                    <span>Acesso ADM / Gerente (Requer Senha)</span>
                  </>
                )}
              </button>
            </div>
          </div>

        </div>

        {/* Creator Brand Section - Centered */}
        <div className="mt-12 pt-8 pb-4 border-t border-zinc-900/80 flex flex-col items-center justify-center text-center">
          <span className="text-[11px] font-extrabold uppercase tracking-[0.25em] text-cyan-400/90 mb-3 block drop-shadow-[0_0_8px_rgba(34,211,238,0.4)]">
            CRIADO POR
          </span>
          <a
            href="https://toniaepprojetos.com/"
            target="_blank"
            rel="noopener noreferrer"
            title="Conheça a TonIAep Projetos - Criando Inovação"
            className="relative group p-1.5 rounded-2xl bg-zinc-950/80 border border-cyan-950/60 shadow-[0_0_25px_rgba(34,211,238,0.15)] hover:shadow-[0_0_35px_rgba(34,211,238,0.35)] hover:border-cyan-800/80 transition-all duration-300 inline-block cursor-pointer"
          >
            <img 
              src="https://lh3.googleusercontent.com/d/1tT4xtnXqbMU8tLElUPSLoSBv9V934TwO" 
              alt="TonIAep - Criando Inovação" 
              className="h-16 sm:h-20 md:h-24 w-auto object-contain rounded-xl transition-transform duration-300 group-hover:scale-105"
              referrerPolicy="no-referrer"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                if (!target.dataset.triedBackup) {
                  target.dataset.triedBackup = 'true';
                  target.src = 'https://drive.google.com/uc?export=view&id=1tT4xtnXqbMU8tLElUPSLoSBv9V934TwO';
                }
              }}
            />
          </a>
        </div>

        {/* Bottom copyright line */}
        <div className="pt-6 border-t border-zinc-900/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-zinc-500">
          <p>© {new Date().getFullYear()} PO-PI-DI Hamburgueria & Choperia. Todos os direitos reservados.</p>
          <p className="flex items-center gap-1">
            Feito com <span className="text-red-500">❤️</span> e chopp trincando de gelado para Porto Feliz - SP.
          </p>
        </div>
      </div>
    </footer>
  );
};

