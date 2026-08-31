import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { NeonLogo } from './NeonLogo';
import { getCleanWhatsAppNumber } from '../utils/formatters';
import popidiHeroNeonImg from '../assets/images/popidi_hero_neon_1787589272732.jpg';
import popidiLogoImg from '../assets/images/popidi_official_logo.png';
import { 
  Flame, 
  Sparkles, 
  Instagram, 
  MapPin, 
  Phone, 
  Clock, 
  Award, 
  Check, 
  ExternalLink,
  Heart,
  MessageCircle,
  Beer,
  Navigation,
  Compass,
  Copy,
  CheckCircle2
} from 'lucide-react';

export const AboutSection: React.FC = () => {
  const { storeSettings, setSelectedProductForModal, menuItems, triggerStoreClosedNotice } = useCart();
  const [copiedAddress, setCopiedAddress] = useState(false);

  const handleCopyAddress = () => {
    const fullText = storeSettings.fullAddress || `${storeSettings.address}, ${storeSettings.cityState}, CEP ${storeSettings.cep || '18540-003'}`;
    navigator.clipboard.writeText(fullText);
    setCopiedAddress(true);
    setTimeout(() => setCopiedAddress(false), 2500);
  };

  const handleOpenXtudo = () => {
    if (storeSettings.isOpen === false) {
      triggerStoreClosedNotice();
      return;
    }
    const xtudoItem = menuItems.find(i => i.id === 'xtudo-especial');
    if (xtudoItem) {
      setSelectedProductForModal(xtudoItem);
    }
  };

  const instagramPosts = [
    {
      id: '1',
      image: popidiHeroNeonImg,
      caption: 'Chopp artesanal trincando de gelado com o autêntico Smash da PO-PI-DI! 🍔🍺 #popidihamburgueria #choperia',
      likes: '482',
      comments: '39',
    },
    {
      id: '2',
      image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80',
      caption: 'O famoso e inconfundível X-TUDO ESPECIAL! Quem já provou em Porto Feliz sabe que é patrimônio. 🍔🔥',
      likes: '627',
      comments: '58',
    },
    {
      id: '3',
      image: popidiLogoImg,
      caption: 'Vem pro melhor ponto de encontro de Porto Feliz - SP! Hambúrguer artesanal & Choperia oficial. ✨🍔',
      likes: '390',
      comments: '24',
    },
  ];

  return (
    <section id="sobre" className="py-10 sm:py-16 bg-gradient-to-b from-[#08080c] via-[#0d0a14] to-[#08080c] border-t border-fuchsia-950/40 text-left">
      <div className="w-full max-w-[1720px] mx-auto px-3 sm:px-6 lg:px-8 space-y-12 sm:space-y-16">
        
        {/* BRAND IDENTITY BANNER & CHOPERIA SPOTLIGHT */}
        <div className="relative rounded-3xl bg-gradient-to-r from-fuchsia-950/40 via-zinc-950 to-emerald-950/30 border border-fuchsia-500/30 overflow-hidden shadow-2xl p-6 sm:p-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            <div className="lg:col-span-4 flex flex-col items-center text-center justify-center p-2">
              <NeonLogo size="lg" showSubtitle={false} />
              <p className="text-xs text-zinc-400 mt-2 font-medium">
                A marca registrada do hambúrguer artesanal e do chopp gelado em Porto Feliz.
              </p>
            </div>

            <div className="lg:col-span-8 space-y-4">
              <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-full text-xs font-black text-emerald-400">
                <Beer className="w-3.5 h-3.5" />
                <span>Hamburgueria & Choperia Artesanal</span>
              </div>

              <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                Mais que uma lanchonete: <span className="neon-text-green">Uma Experiência Gastronômica Completa</span>
              </h2>

              <p className="text-sm sm:text-base text-zinc-300 leading-relaxed">
                {storeSettings.aboutStoryText || (
                  <>Na <strong>PO-PI-DI</strong>, cada hambúrguer e pastel é preparado com blend artesanal fresco prensado na chapa com perfeição, queijo derretido, bacon super crocante e pão brioche selado com manteiga pura. E para acompanhar, chopp artesanal tirado com colarinho cremoso e nossas porções lendárias.</>
                )}
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                <div className="bg-zinc-900/80 p-3 rounded-xl border border-zinc-800">
                  <span className="neon-text-pink font-black text-lg sm:text-xl block">100%</span>
                  <span className="text-[11px] text-zinc-400">Carne Nobre Fresca</span>
                </div>
                <div className="bg-zinc-900/80 p-3 rounded-xl border border-zinc-800">
                  <span className="neon-text-green font-black text-lg sm:text-xl block">Chopp</span>
                  <span className="text-[11px] text-zinc-400">Pilsen, IPA & Vinho</span>
                </div>
                <div className="bg-zinc-900/80 p-3 rounded-xl border border-zinc-800 col-span-2 sm:col-span-1">
                  <span className="neon-text-yellow font-black text-lg sm:text-xl block">Exclusivo</span>
                  <span className="text-[11px] text-zinc-400">X-Tudo da Casa</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* SPOTLIGHT: O FAMOSO X-TUDO */}
        <div id="o-famoso-xtudo" className="relative rounded-3xl bg-gradient-to-r from-zinc-900 via-[#110d17] to-zinc-900 border border-fuchsia-500/40 overflow-hidden shadow-2xl p-6 sm:p-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/30 px-3 py-1 rounded-full text-xs font-black text-yellow-400">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Patrimônio Exclusivo do Cardápio</span>
              </div>

              <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                Você já experimentou o lendário <span className="neon-text-yellow">"X-Tudo"</span>?
              </h2>

              <p className="text-sm sm:text-base text-zinc-300 leading-relaxed">
                Nossa receita autoral e exclusiva que conquistou corações de toda Porto Feliz! Pão brioche amanteigado tostado na chapa, blend artesanal suculento 160g, queijo mussarela derretido, presunto, bacon crocante em dobro, ovo na chapa, calabresa chapeada, salada fresca e maionese secreta da casa.
              </p>

              <div className="flex flex-wrap gap-4 pt-2">
                <div className="flex items-center gap-2 text-xs font-bold text-zinc-200">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Blend 160g + Bacon & Calabresa</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-zinc-200">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Ovo Chapeado & Queijo Derretido</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-zinc-200">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Receita Secreta da Casa</span>
                </div>
              </div>

              <div className="pt-3">
                <button
                  id="btn-order-xtudo-spotlight"
                  onClick={handleOpenXtudo}
                  className="bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-400 hover:to-green-400 text-black font-black text-sm px-7 py-3.5 rounded-xl shadow-lg shadow-emerald-500/25 hover:scale-[1.02] transition-all border border-emerald-300/40"
                >
                  Pedir X-Tudo Agora
                </button>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-fuchsia-500/30 aspect-[4/3]">
                <img
                  src="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80"
                  alt="O Famoso X-Tudo"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 right-3 bg-black/80 backdrop-blur-md text-yellow-400 text-xs font-black px-3 py-1 rounded-lg border border-yellow-500/40 shadow-[0_0_8px_rgba(255,234,0,0.3)]">
                  Exclusividade PO-PI-DI
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* INSTAGRAM SHOWCASE */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-fuchsia-400 text-xs font-black uppercase tracking-wider">
                <Instagram className="w-4 h-4" />
                <span>Nosso Instagram Oficial</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
                Siga <span className="neon-text-pink">@po_pi_di_hamburgueria</span>
              </h3>
              <p className="text-xs sm:text-sm text-zinc-400 mt-1">
                Acompanhe os bastidores da chapa, lançamentos de chopp e promoções relâmpago!
              </p>
            </div>

            <a
              id="btn-instagram-follow-cta"
              href={storeSettings.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-fuchsia-600 via-pink-600 to-purple-600 hover:from-fuchsia-500 hover:to-pink-500 text-white font-black text-xs sm:text-sm px-6 py-3 rounded-xl shadow-lg shadow-fuchsia-600/30 transition-all self-start sm:self-auto border border-fuchsia-400/40"
            >
              <Instagram className="w-4 h-4" />
              <span>Seguir no Instagram</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Instagram cards grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {instagramPosts.map(post => (
              <a
                key={post.id}
                href={storeSettings.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative bg-[#0e0f17] rounded-2xl border border-zinc-800 overflow-hidden hover:border-fuchsia-500/60 transition-all block shadow-lg hover:shadow-fuchsia-500/10"
              >
                <div className="aspect-square relative overflow-hidden bg-black">
                  <img
                    src={post.image}
                    alt="Instagram Post PO-PI-DI"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-6 text-white font-black text-sm">
                    <span className="flex items-center gap-1.5 text-fuchsia-300">
                      <Heart className="w-5 h-5 fill-fuchsia-400" />
                      {post.likes}
                    </span>
                    <span className="flex items-center gap-1.5 text-emerald-300">
                      <MessageCircle className="w-5 h-5 fill-emerald-400" />
                      {post.comments}
                    </span>
                  </div>
                </div>

                <div className="p-4 space-y-2">
                  <p className="text-xs text-zinc-300 line-clamp-2">
                    {post.caption}
                  </p>
                  <span className="text-[11px] font-black neon-text-pink block">
                    Ver no Instagram →
                  </span>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* LOCATION & GOOGLE MAPS SECTION */}
        <div id="localizacao" className="rounded-3xl bg-[#0a0b12] border border-fuchsia-950/70 p-6 sm:p-10 shadow-2xl space-y-8">
          
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 border-b border-zinc-800 pb-6">
            <div>
              <div className="flex items-center gap-2 neon-text-pink text-xs font-black uppercase tracking-wider">
                <MapPin className="w-4 h-4" />
                <span>Nossa Localização em Porto Feliz - SP</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
                Venha nos visitar ou <span className="neon-text-green">Peça no Delivery</span>
              </h3>
              <p className="text-xs sm:text-sm text-zinc-400 mt-1">
                Ponto de encontro oficial para saborear hambúrgueres artesanais na chapa e chopp trincando de gelado!
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                id="btn-copy-address"
                onClick={handleCopyAddress}
                className="inline-flex items-center gap-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm"
              >
                {copiedAddress ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-400">Endereço Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-zinc-400" />
                    <span>Copiar Endereço</span>
                  </>
                )}
              </button>

              <a
                id="btn-open-google-maps"
                href={storeSettings.googleMapsUrl || 'https://www.google.com/maps/place/PO-PI-DI/@-23.2065603,-47.5271029,88m/data=!3m1!1e3!4m10!1m2!2m1!1spopidi+hamburgueria!3m6!1s0x94c5ff00188552c3:0x51f12e39398e8c39!8m2!3d-23.2065528!4d-47.5265379'}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-400 hover:to-green-400 text-black font-black text-xs sm:text-sm px-5 py-2.5 rounded-xl shadow-lg shadow-emerald-500/20 transition-all border border-emerald-300/40"
              >
                <Navigation className="w-4 h-4" />
                <span>Abrir no Google Maps</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            
            {/* Info Cards Column */}
            <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
              <div className="space-y-4">
                
                {/* Address Card */}
                <div className="bg-[#10121b] border border-zinc-800/90 rounded-2xl p-5 hover:border-fuchsia-500/40 transition-colors space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-fuchsia-500/10 border border-fuchsia-500/30 flex items-center justify-center text-fuchsia-400 shadow-[0_0_10px_rgba(240,70,245,0.2)] shrink-0">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-white">Endereço & Atendimento</h4>
                      <p className="text-xs text-zinc-300 font-medium">
                        {storeSettings.address}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-zinc-400 pl-13">
                    {storeSettings.cityState} • Disponível para <strong>Delivery em Casa</strong> e <strong>Retirada no Balcão</strong>.
                  </p>
                </div>

                {/* Hours Card */}
                <div className="bg-[#10121b] border border-zinc-800/90 rounded-2xl p-5 hover:border-yellow-500/40 transition-colors space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center text-yellow-400 shadow-[0_0_10px_rgba(255,234,0,0.2)] shrink-0">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-white">Horário de Funcionamento</h4>
                      <p className="text-xs text-zinc-300 font-medium">
                        {storeSettings.openingHoursText}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-zinc-400 pl-13">
                    Chapa quente e chopp gelado a partir das 18:30h!
                  </p>
                </div>

                {/* Contact Card */}
                <div className="bg-[#10121b] border border-zinc-800/90 rounded-2xl p-5 hover:border-emerald-500/40 transition-colors space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-[0_0_10px_rgba(0,255,102,0.2)] shrink-0">
                      <Phone className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-white">WhatsApp & Pedidos</h4>
                      <p className="text-xs text-zinc-300 font-medium">
                        (15) 99707-5641
                      </p>
                    </div>
                  </div>
                  <div className="pl-13 pt-1">
                    <a
                      href={`https://wa.me/${getCleanWhatsAppNumber(storeSettings.phoneWhatsApp)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 font-black"
                    >
                      <span>Conversar no WhatsApp</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>

              </div>
            </div>

            {/* Interactive Map Embed Column */}
            <div className="lg:col-span-7 flex flex-col">
              <div className="relative w-full h-[320px] sm:h-[380px] lg:h-full min-h-[320px] rounded-2xl overflow-hidden border border-zinc-800 shadow-xl bg-zinc-950 group">
                <iframe
                  title="Localização PO-PI-DI Hamburgueria no Google Maps"
                  src="https://maps.google.com/maps?q=R.+Sarquis+Abibe,+103,+Centro,+Porto+Feliz+-+SP,+18540-003&t=m&z=17&ie=UTF8&iwloc=B&output=embed"
                  className="w-full h-full border-0 grayscale-[25%] contrast-110 group-hover:grayscale-0 transition-all duration-300"
                  allowFullScreen={true}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />

                {/* Overlay Badge with direct link */}
                <div className="absolute top-3 left-3 bg-black/85 backdrop-blur-md px-3 py-2 rounded-xl border border-white/10 shadow-lg text-left">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_#00ff66]" />
                    <span className="text-xs font-black text-white">PO-PI-DI Hamburgueria</span>
                  </div>
                  <span className="text-[10px] text-zinc-400 block font-medium">
                    {storeSettings.address}
                  </span>
                </div>

                {/* Floating GPS Button */}
                <div className="absolute bottom-3 right-3">
                  <a
                    href={storeSettings.googleMapsUrl || 'https://www.google.com/maps/search/?api=1&query=R.+Sarquis+Abibe,+103,+Centro,+Porto+Feliz+-+SP,+18540-003'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-black/90 hover:bg-emerald-600 text-white hover:text-black text-xs font-black px-4 py-2 rounded-xl backdrop-blur-md border border-white/10 hover:border-emerald-400 transition-all flex items-center gap-2 shadow-xl"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    <span>Traçar Rota no Maps</span>
                  </a>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
};

