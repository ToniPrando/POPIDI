import React, { useState, useEffect } from 'react';
import { MenuItem, SelectedCustomization } from '../types';
import { formatBRL } from '../utils/formatters';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { 
  X, 
  Plus, 
  Minus, 
  Check, 
  Flame, 
  Sparkles, 
  ShoppingBag,
  Info,
  Clock
} from 'lucide-react';

interface ProductModalProps {
  item?: MenuItem | null;
  onClose?: () => void;
}

export const ProductModal: React.FC<ProductModalProps> = ({ item: propItem, onClose: propOnClose }) => {
  const { 
    selectedProductForModal, 
    setSelectedProductForModal, 
    addToCart, 
    setIsCartOpen 
  } = useCart();
  const { user, setIsAuthModalOpen, setAuthModalTab } = useAuth();

  const item = propItem !== undefined ? propItem : selectedProductForModal;
  const onClose = propOnClose || (() => setSelectedProductForModal(null));

  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');
  
  // Customization selections state: map groupId -> array of selected option IDs
  const [selections, setSelections] = useState<Record<string, string[]>>({});

  useEffect(() => {
    if (item) {
      setQuantity(1);
      setNotes('');
      
      // Pre-select required single-choice defaults if any
      const initialSelections: Record<string, string[]> = {};
      if (item.customizationGroups) {
        item.customizationGroups.forEach(group => {
          if (group.type === 'single' && group.options.length > 0) {
            initialSelections[group.id] = [group.options[0].id];
          } else {
            initialSelections[group.id] = [];
          }
        });
      }
      setSelections(initialSelections);
    }
  }, [item]);

  if (!item) return null;

  const handleSingleSelect = (groupId: string, optionId: string) => {
    setSelections(prev => ({
      ...prev,
      [groupId]: [optionId],
    }));
  };

  const handleMultiToggle = (groupId: string, optionId: string, max?: number) => {
    setSelections(prev => {
      const current = prev[groupId] || [];
      if (current.includes(optionId)) {
        return {
          ...prev,
          [groupId]: current.filter(id => id !== optionId),
        };
      } else {
        if (max && current.length >= max) {
          return prev; // already reached max
        }
        return {
          ...prev,
          [groupId]: [...current, optionId],
        };
      }
    });
  };

  // Calculate dynamic price
  const basePrice = item.promotionalPrice ?? item.price;
  let extrasTotal = 0;

  const formattedCustomizations: SelectedCustomization[] = [];

  if (item.customizationGroups) {
    item.customizationGroups.forEach(group => {
      const selectedIds = selections[group.id] || [];
      const selectedOpts = group.options
        .filter(opt => selectedIds.includes(opt.id))
        .map(opt => {
          extrasTotal += opt.price;
          return {
            id: opt.id,
            name: opt.name,
            price: opt.price,
          };
        });

      if (selectedOpts.length > 0) {
        formattedCustomizations.push({
          groupId: group.id,
          groupTitle: group.title,
          selectedOptions: selectedOpts,
        });
      }
    });
  }

  const unitPrice = basePrice + extrasTotal;
  const totalPrice = unitPrice * quantity;

  // Validation: are all required groups selected?
  let isMissingRequired = false;
  if (item.customizationGroups) {
    item.customizationGroups.forEach(g => {
      if (g.required && (!selections[g.id] || selections[g.id].length === 0)) {
        isMissingRequired = true;
      }
    });
  }

  const handleAddToCart = (_directToCheckout: boolean = false) => {
    if (isMissingRequired) return;
    addToCart(item, quantity, formattedCustomizations, notes);
    onClose();
    setIsCartOpen(true);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      
      {/* Modal Card */}
      <div 
        className="relative bg-[#0d0e15] border border-fuchsia-900/40 w-full max-w-2xl max-h-[92vh] sm:max-h-[85vh] rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden text-left"
        onClick={e => e.stopPropagation()}
      >
        
        {/* Close Button */}
        <button
          id="btn-close-product-modal"
          onClick={onClose}
          className="absolute top-4 right-4 z-20 bg-black/70 hover:bg-fuchsia-950 text-zinc-300 hover:text-white p-2 rounded-full backdrop-blur-md transition-colors border border-white/10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Scrollable Content */}
        <div className="overflow-y-auto flex-1">
          
          {/* Product Header Image */}
          <div className="relative h-56 sm:h-72 w-full bg-zinc-950 overflow-hidden">
            <img
              src={item.image}
              alt={item.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0d0e15] via-[#0d0e15]/40 to-transparent" />
            
            {/* Badge */}
            {item.badge && (
              <div className="absolute top-4 left-4 bg-gradient-to-r from-fuchsia-600 to-pink-600 text-white font-black text-xs uppercase px-3 py-1.5 rounded-full shadow-lg border border-fuchsia-400 flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 fill-yellow-300 text-yellow-300" />
                {item.badge}
              </div>
            )}

            {/* Time */}
            {item.prepTimeMinutes && (
              <div className="absolute bottom-4 right-4 bg-black/80 backdrop-blur-md text-zinc-200 text-xs font-bold px-3 py-1.5 rounded-lg border border-white/10 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-yellow-400" />
                ~{item.prepTimeMinutes} min
              </div>
            )}
          </div>

          {/* Product Title & Details */}
          <div className="p-5 sm:p-6 space-y-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {item.name}
              </h2>
              <div className="flex items-center gap-2 mt-1">
                {item.promotionalPrice ? (
                  <>
                    <span className="text-zinc-500 line-through text-sm">
                      {formatBRL(item.price)}
                    </span>
                    <span className="text-2xl font-black text-yellow-400">
                      {formatBRL(item.promotionalPrice)}
                    </span>
                    <span className="text-[11px] font-black uppercase bg-red-950 text-red-400 px-2 py-0.5 rounded border border-red-800/40">
                      Oferta
                    </span>
                  </>
                ) : (
                  <span className="text-2xl font-black text-yellow-400">
                    {formatBRL(item.price)}
                  </span>
                )}
              </div>
              <p className="text-sm text-zinc-300 mt-2.5 leading-relaxed">
                {item.description}
              </p>
            </div>

            {/* Ingredients Tags */}
            {item.ingredients && item.ingredients.length > 0 && (
              <div className="pt-2">
                <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
                  Ingredientes & Blend
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {item.ingredients.map((ing, idx) => (
                    <span
                      key={idx}
                      className="text-xs bg-zinc-900 text-zinc-300 px-2.5 py-1 rounded-md border border-zinc-800"
                    >
                      {ing}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Customization Groups */}
            {item.customizationGroups && item.customizationGroups.map(group => {
              const selected = selections[group.id] || [];

              return (
                <div 
                  key={group.id} 
                  className="pt-4 border-t border-zinc-800 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-black text-white flex items-center gap-1.5">
                        <span>{group.title}</span>
                        {group.required && (
                          <span className="text-[10px] uppercase font-black bg-fuchsia-950 text-fuchsia-400 border border-fuchsia-800/60 px-2 py-0.5 rounded">
                            Obrigatório
                          </span>
                        )}
                      </h4>
                      {group.max && (
                        <span className="text-xs text-zinc-400">
                          Escolha até {group.max} {group.max === 1 ? 'opção' : 'opções'}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    {group.options.map(option => {
                      const isSelected = selected.includes(option.id);

                      return (
                        <div
                          key={option.id}
                          onClick={() => {
                            if (group.type === 'single') {
                              handleSingleSelect(group.id, option.id);
                            } else {
                              handleMultiToggle(group.id, option.id, group.max);
                            }
                          }}
                          className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                            isSelected
                              ? 'bg-emerald-950/30 border-emerald-500 text-white shadow-[0_0_8px_rgba(0,255,102,0.15)]'
                              : 'bg-zinc-900/60 hover:bg-zinc-900 border-zinc-800 text-zinc-300'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-5 h-5 rounded-${group.type === 'single' ? 'full' : 'md'} border flex items-center justify-center transition-colors ${
                              isSelected
                                ? 'bg-emerald-500 border-emerald-400 text-black'
                                : 'border-zinc-700 bg-zinc-800'
                            }`}>
                              {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                            </div>
                            <span className="text-sm font-medium">{option.name}</span>
                          </div>

                          {option.price > 0 ? (
                            <span className="text-xs font-black text-yellow-400">
                              +{formatBRL(option.price)}
                            </span>
                          ) : (
                            <span className="text-xs text-zinc-500 font-medium">Incluso</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {/* Special Instructions & Notes */}
            <div className="pt-4 border-t border-zinc-800 space-y-2">
              <label htmlFor="product-notes" className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">
                Alguma Observação Especial?
              </label>
              <textarea
                id="product-notes"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Ex: Ponto da carne mais tostadinho, molho à parte, cortar ao meio..."
                rows={2}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-fuchsia-500 focus:ring-1 focus:ring-fuchsia-500 resize-none"
              />
            </div>

          </div>
        </div>

        {/* Sticky Modal Bottom Action Bar */}
        <div className="p-4 sm:p-5 bg-[#0a0b10] border-t border-zinc-800 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          
          {/* Quantity selector */}
          <div className="flex items-center justify-between sm:justify-start bg-zinc-900 border border-zinc-800 rounded-xl p-1 shrink-0">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              disabled={quantity <= 1}
              className="p-2 text-zinc-400 hover:text-white disabled:opacity-30 transition-colors"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="px-4 font-extrabold text-sm text-white">
              {quantity}
            </span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="p-2 text-zinc-400 hover:text-white transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex-1 flex gap-2">
            <button
              id="btn-confirm-add-to-cart"
              onClick={() => handleAddToCart(false)}
              disabled={isMissingRequired}
              className="flex-1 flex items-center justify-center gap-2 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 text-white font-bold text-xs sm:text-sm py-3.5 px-3 rounded-xl border border-zinc-700 transition-all active:scale-98"
            >
              <ShoppingBag className="w-4 h-4 text-zinc-300" />
              <span>Adicionar</span>
            </button>

            <button
              id="btn-buy-now-direct"
              onClick={() => handleAddToCart(true)}
              disabled={isMissingRequired}
              className="flex-[1.5] flex items-center justify-between bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-400 hover:from-emerald-400 hover:to-green-300 disabled:opacity-50 text-black font-black text-xs sm:text-sm px-4 py-3.5 rounded-xl shadow-lg shadow-emerald-500/25 hover:scale-[1.01] active:scale-98 transition-all border border-emerald-300/50"
            >
              <span>Comprar Agora</span>
              <span className="font-black bg-black/20 px-2 py-0.5 rounded-lg text-black">
                {formatBRL(totalPrice)}
              </span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};

