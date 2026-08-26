import React from 'react';
import { CategoryId } from '../types';
import { menuCategories } from '../data/menuData';
import { 
  Flame, 
  Sparkles, 
  UtensilsCrossed, 
  Crown, 
  Layers, 
  Package, 
  Beer, 
  CupSoda,
  IceCream, 
  Search, 
  X,
  SlidersHorizontal
} from 'lucide-react';

interface CategoryNavProps {
  activeCategory: CategoryId;
  onSelectCategory: (cat: CategoryId) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedTag: string | null;
  onSelectTag: (tag: string | null) => void;
}

const iconMap: Record<string, React.ReactNode> = {
  Flame: <Flame className="w-4 h-4" />,
  Sparkles: <Sparkles className="w-4 h-4" />,
  UtensilsCrossed: <UtensilsCrossed className="w-4 h-4" />,
  Crown: <Crown className="w-4 h-4" />,
  Layers: <Layers className="w-4 h-4" />,
  Package: <Package className="w-4 h-4" />,
  Beer: <Beer className="w-4 h-4" />,
  CupSoda: <CupSoda className="w-4 h-4" />,
  IceCream: <IceCream className="w-4 h-4" />,
};

export const CategoryNav: React.FC<CategoryNavProps> = ({
  activeCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  selectedTag,
  onSelectTag,
}) => {
  const quickTags = [
    { label: '🔥 Mais Vendidos', tag: 'Mais Vendido' },
    { label: '🍺 Choperia Gelada', category: 'choperia' as CategoryId },
    { label: '🍔 X-Tudo Especial', category: 'artesanais' as CategoryId },
    { label: '👑 Monsters & Especiais', category: 'monster-especiais' as CategoryId },
    { label: '🏷️ Promoções', tag: 'Promoção' },
  ];

  return (
    <div id="category-navigation-bar" className="sticky top-20 sm:top-22 z-30 bg-[#08080c]/95 backdrop-blur-md border-b border-fuchsia-950/40 py-3 shadow-xl">
      <div className="w-full max-w-[1720px] mx-auto px-3 sm:px-6 lg:px-8 space-y-3">
        
        {/* Search Bar & Quick Tags */}
        <div className="flex flex-col md:flex-row items-center gap-3 justify-between">
          
          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-fuchsia-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="menu-search-input"
              type="text"
              value={searchQuery}
              onChange={e => onSearchChange(e.target.value)}
              placeholder="Buscar smash, chopp, burger, porção..."
              className="w-full bg-zinc-900/90 border border-fuchsia-950/80 rounded-xl pl-10 pr-9 py-2 text-xs sm:text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Quick Action Badges */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar w-full md:w-auto pb-1 md:pb-0">
            {quickTags.map((qt, idx) => (
              <button
                key={idx}
                onClick={() => {
                  if (qt.category) {
                    onSelectCategory(qt.category);
                    onSelectTag(null);
                  } else if (qt.tag) {
                    onSelectTag(selectedTag === qt.tag ? null : qt.tag);
                  }
                }}
                className={`text-xs font-black px-3 py-1.5 rounded-lg border whitespace-nowrap transition-all ${
                  (qt.tag && selectedTag === qt.tag) || (qt.category && activeCategory === qt.category)
                    ? 'bg-fuchsia-600 text-white border-fuchsia-400 shadow-[0_0_10px_rgba(240,70,245,0.4)]'
                    : 'bg-zinc-900/80 text-zinc-300 border-zinc-800 hover:border-fuchsia-900 hover:text-white'
                }`}
              >
                {qt.label}
              </button>
            ))}
          </div>

        </div>

        {/* Horizontal Scrollable Categories */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 pt-1">
          {menuCategories.map(cat => {
            const isActive = activeCategory === cat.id && !selectedTag;
            return (
              <button
                key={cat.id}
                id={`cat-btn-${cat.id}`}
                onClick={() => {
                  onSelectCategory(cat.id as CategoryId);
                  onSelectTag(null);
                }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black whitespace-nowrap transition-all shrink-0 ${
                  isActive
                    ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-black shadow-lg shadow-emerald-500/25 scale-105 border border-emerald-300'
                    : 'bg-zinc-900/80 hover:bg-zinc-800/90 text-zinc-300 hover:text-white border border-zinc-800 hover:border-fuchsia-950'
                }`}
              >
                <span className={isActive ? 'text-black' : 'text-emerald-400'}>
                  {iconMap[cat.icon] || <Flame className="w-4 h-4" />}
                </span>
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>

      </div>
    </div>
  );
};

