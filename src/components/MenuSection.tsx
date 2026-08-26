import React, { useState } from 'react';
import { MenuItem, CategoryId } from '../types';
import { formatBRL } from '../utils/formatters';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { menuCategories } from '../data/menuData';
import defaultFallbackImg from '../assets/images/hero_burger_banner_1787588589656.jpg';
import { 
  Plus, 
  Flame, 
  Sparkles, 
  SlidersHorizontal, 
  Clock, 
  AlertCircle,
  ShoppingBag,
  Beer,
  UtensilsCrossed,
  Crown,
  Layers,
  Package,
  CupSoda,
  IceCream,
  LayoutGrid,
  Grid
} from 'lucide-react';

interface MenuSectionProps {
  items: MenuItem[];
  onOpenProductModal: (item: MenuItem) => void;
  activeCategory: CategoryId;
}

const categoryIcons: Record<string, React.ReactNode> = {
  smash: <Sparkles className="w-4 h-4 text-emerald-400" />,
  artesanais: <UtensilsCrossed className="w-4 h-4 text-yellow-400" />,
  choperia: <Beer className="w-4 h-4 text-amber-400" />,
  porcoes: <Layers className="w-4 h-4 text-fuchsia-400" />,
  'monster-especiais': <Crown className="w-4 h-4 text-yellow-400" />,
  combos: <Package className="w-4 h-4 text-emerald-400" />,
  bebidas: <CupSoda className="w-4 h-4 text-cyan-400" />,
  sobremesas: <IceCream className="w-4 h-4 text-pink-400" />,
};

export const MenuSection: React.FC<MenuSectionProps> = ({
  items,
  onOpenProductModal,
  activeCategory,
}) => {
  const { addToCart, setIsCartOpen } = useCart();
  const { user, setIsAuthModalOpen, setAuthModalTab } = useAuth();
  const [viewMode, setViewMode] = useState<'compact' | 'standard'>('compact');

  const handleQuickAdd = (e: React.MouseEvent, item: MenuItem) => {
    e.stopPropagation();
    // If item has required customization, open modal instead
    if (item.customizationGroups && item.customizationGroups.some(g => g.required)) {
      onOpenProductModal(item);
      return;
    }
    // Otherwise directly add with defaults
    addToCart(item, 1, [], '');
    setIsCartOpen(true);
  };

  if (items.length === 0) {
    return (
      <div className="py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-zinc-900 border border-fuchsia-900/50 flex items-center justify-center mx-auto text-fuchsia-400">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-black text-white">Nenhum item encontrado</h3>
        <p className="text-sm text-zinc-400 max-w-sm mx-auto">
          Tente buscar por outro termo ou selecione outra categoria no cardápio acima.
        </p>
      </div>
    );
  }

  // Helper component to render a single compact small quadro
  const renderCompactCard = (item: MenuItem) => {
    const hasCustomization = Boolean(item.customizationGroups && item.customizationGroups.length > 0);

    return (
      <div
        key={item.id}
        id={`menu-item-compact-${item.id}`}
        onClick={() => onOpenProductModal(item)}
        className={`group relative bg-[#0d0e16] hover:bg-[#121420] rounded-xl border border-zinc-800/90 hover:border-emerald-500/70 transition-all duration-300 overflow-hidden flex flex-col justify-between shadow-md hover:shadow-xl hover:shadow-emerald-500/10 cursor-pointer p-2.5 sm:p-3 hover:-translate-y-1 ${
          !item.available ? 'opacity-60 grayscale' : ''
        }`}
      >
        {/* Top Image Quadro */}
        <div className="relative aspect-[4/3] w-full rounded-lg overflow-hidden bg-zinc-950 mb-2.5">
          <img
            src={item.image}
            alt={item.name}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
            loading="lazy"
            onError={(e) => {
              (e.target as HTMLImageElement).src = defaultFallbackImg;
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0d0e16]/80 via-transparent to-transparent pointer-events-none" />

          {/* Badge */}
          {item.badge && (
            <div className="absolute top-1.5 left-1.5 bg-gradient-to-r from-fuchsia-600 to-pink-600 text-white font-black text-[9px] sm:text-[10px] uppercase tracking-wider px-2 py-0.5 rounded shadow border border-fuchsia-400/80 shadow-[0_0_8px_rgba(240,70,245,0.4)] flex items-center gap-0.5">
              <Flame className="w-2.5 h-2.5 fill-yellow-300 text-yellow-300" />
              <span>{item.badge}</span>
            </div>
          )}

          {/* Prep Time */}
          {item.prepTimeMinutes && (
            <div className="absolute bottom-1.5 right-1.5 bg-black/80 backdrop-blur-sm text-zinc-300 text-[10px] font-bold px-1.5 py-0.5 rounded border border-white/10 flex items-center gap-1">
              <Clock className="w-2.5 h-2.5 text-yellow-400" />
              <span>{item.prepTimeMinutes}m</span>
            </div>
          )}

          {/* Sold out overlay */}
          {!item.available && (
            <div className="absolute inset-0 bg-black/85 flex items-center justify-center p-1 text-center">
              <span className="bg-red-600 text-white font-black text-[10px] uppercase px-2 py-1 rounded shadow">
                Esgotado
              </span>
            </div>
          )}
        </div>

        {/* Info Content */}
        <div className="flex-1 flex flex-col justify-between space-y-2">
          <div>
            <h3 className="text-xs sm:text-sm font-black text-white group-hover:text-emerald-400 transition-colors leading-snug line-clamp-1">
              {item.name}
            </h3>
            
            <p className="text-[11px] sm:text-xs text-zinc-400 mt-1 line-clamp-2 leading-snug">
              {item.description}
            </p>
          </div>

          {/* Price & Action Button */}
          <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between gap-1.5">
            <div>
              {item.promotionalPrice ? (
                <div className="flex flex-col">
                  <span className="text-[10px] text-zinc-500 line-through leading-none">
                    {formatBRL(item.price)}
                  </span>
                  <span className="text-xs sm:text-sm font-black text-yellow-400 leading-tight">
                    {formatBRL(item.promotionalPrice)}
                  </span>
                </div>
              ) : (
                <span className="text-xs sm:text-sm font-black text-yellow-400">
                  {formatBRL(item.price)}
                </span>
              )}
            </div>

            <button
              id={`btn-compact-add-${item.id}`}
              onClick={(e) => handleQuickAdd(e, item)}
              disabled={!item.available}
              className="flex items-center gap-1 bg-emerald-500 hover:bg-emerald-400 text-black font-black text-[11px] sm:text-xs px-3 py-1.5 rounded-lg border border-emerald-300 shadow-[0_0_10px_rgba(0,255,102,0.3)] hover:scale-105 transition-all duration-200 shrink-0"
              title={hasCustomization ? 'Personalizar e Comprar' : 'Comprar e Adicionar'}
            >
              {hasCustomization ? (
                <>
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span>Montar</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Comprar</span>
                </>
              )}
            </button>
          </div>

        </div>
      </div>
    );
  };

  // Group items by category when on "todos" tab
  const categoryGroups = menuCategories
    .filter(cat => cat.id !== 'todos')
    .map(cat => ({
      category: cat,
      items: items.filter(item => item.category === cat.id),
    }))
    .filter(group => group.items.length > 0);

  return (
    <section id="cardapio-section" className="py-6 sm:py-10">
      <div className="w-full max-w-[1720px] mx-auto px-3 sm:px-6 lg:px-8">
        
        {/* Section Header Title & View Toggle */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-4 border-b border-fuchsia-950/60">
          <div>
            <span className="text-xs font-black uppercase tracking-widest neon-text-pink flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-fuchsia-400 animate-pulse shadow-[0_0_8px_#f046f5]" />
              Cardápio Completo PO-PI-DI
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
              {activeCategory === 'todos' ? 'Todos os Itens do Cardápio' : 'Itens da Categoria'}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-emerald-400 font-black bg-emerald-950/40 px-3 py-1.5 rounded-full border border-emerald-800/60 shadow-[0_0_8px_rgba(0,255,102,0.15)]">
              {items.length} {items.length === 1 ? 'item disponível' : 'itens disponíveis'}
            </span>

            {/* View Mode Toggle (Quadros Pequenos / Compacto) */}
            <div className="hidden sm:flex items-center bg-zinc-900 border border-zinc-800 rounded-xl p-1 gap-1">
              <button
                onClick={() => setViewMode('compact')}
                className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors ${
                  viewMode === 'compact' 
                    ? 'bg-emerald-500 text-black shadow' 
                    : 'text-zinc-400 hover:text-white'
                }`}
                title="Visualização em Pequenos Quadros"
              >
                <Grid className="w-3.5 h-3.5" />
                <span className="text-[11px]">Pequenos Quadros</span>
              </button>
              <button
                onClick={() => setViewMode('standard')}
                className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors ${
                  viewMode === 'standard' 
                    ? 'bg-emerald-500 text-black shadow' 
                    : 'text-zinc-400 hover:text-white'
                }`}
                title="Visualização em Grade Média"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span className="text-[11px]">Grade Padrão</span>
              </button>
            </div>
          </div>
        </div>

        {/* When in "todos" tab: Show all categories in organized sections with small quadros */}
        {activeCategory === 'todos' ? (
          <div className="space-y-10 sm:space-y-12">
            {categoryGroups.map(({ category, items: catItems }) => (
              <div key={category.id} id={`category-section-${category.id}`} className="space-y-4">
                {/* Category Section Header */}
                <div className="flex items-center justify-between pb-2 border-b border-zinc-800/80">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800">
                      {categoryIcons[category.id] || <Sparkles className="w-4 h-4 text-emerald-400" />}
                    </div>
                    <div>
                      <h3 className="text-lg sm:text-xl font-black text-white tracking-tight">
                        {category.name}
                      </h3>
                      <p className="text-xs text-zinc-400">
                        {category.description}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-zinc-400 bg-zinc-900 px-2.5 py-1 rounded-full border border-zinc-800">
                    {catItems.length} {catItems.length === 1 ? 'item' : 'itens'}
                  </span>
                </div>

                {/* Small Quadros Grid for this category */}
                <div className={`grid ${
                  viewMode === 'compact' 
                    ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4' 
                    : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5'
                }`}>
                  {catItems.map(item => renderCompactCard(item))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* When in single specific category: Show items in small quadros */
          <div className={`grid ${
            viewMode === 'compact' 
              ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4' 
              : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5'
          }`}>
            {items.map(item => renderCompactCard(item))}
          </div>
        )}

      </div>
    </section>
  );
};
