import React, { useState, useMemo } from 'react';
import { CartProvider, useCart } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { Header } from './components/Header';
import { HeroBanner } from './components/HeroBanner';
import { CategoryNav } from './components/CategoryNav';
import { MenuSection } from './components/MenuSection';
import { AboutSection } from './components/AboutSection';
import { CartDrawer } from './components/CartDrawer';
import { OrderHistoryModal } from './components/OrderHistoryModal';
import { OrderTrackerModal } from './components/OrderTrackerModal';
import { AdminDashboard } from './components/AdminDashboard';
import { ProductModal } from './components/ProductModal';
import { AuthModal } from './components/AuthModal';
import { LoyaltyClubModal } from './components/LoyaltyClubModal';
import { AdminLoginModal } from './components/AdminLoginModal';
import { Footer } from './components/Footer';
import { CategoryId, MenuItem } from './types';

const MainAppContent: React.FC = () => {
  const { 
    menuItems, 
    setSelectedProductForModal, 
    isLoyaltyOpen, 
    setIsLoyaltyOpen,
    activeCategory,
    setActiveCategory
  } = useCart();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Filter items based on category, search and tags
  const filteredItems = useMemo(() => {
    return menuItems.filter(item => {
      // 1. Search Query Filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = item.name.toLowerCase().includes(q);
        const matchesDesc = item.description.toLowerCase().includes(q);
        const matchesCategory = item.category.toLowerCase().includes(q);
        const matchesIngredients = item.ingredients && item.ingredients.some(t => t.toLowerCase().includes(q));
        if (!matchesName && !matchesDesc && !matchesCategory && !matchesIngredients) {
          return false;
        }
      }

      // 2. Tag Filter
      if (selectedTag) {
        const matchesBadge = item.badge === selectedTag;
        const matchesPromo = selectedTag === 'Promoção' && Boolean(item.promotionalPrice);
        const matchesBestSeller = selectedTag === 'Mais Vendido' && (item.badge === 'Mais Vendido' || item.badge === 'Destaque');
        if (!matchesBadge && !matchesPromo && !matchesBestSeller) {
          return false;
        }
      }

      // 3. Category Filter (if no active search)
      if (!searchQuery.trim() && !selectedTag) {
        if (activeCategory === 'todos') {
          return true; // Show all available items
        }
        return item.category === activeCategory;
      }

      return true;
    });
  }, [menuItems, activeCategory, searchQuery, selectedTag]);

  return (
    <div className="min-h-screen bg-[#07070b] text-zinc-100 flex flex-col font-sans selection:bg-fuchsia-500 selection:text-black">
      {/* Top Header with Navigation, Customer Login & Admin Button */}
      <Header />

      {/* Main Content */}
      <main className="flex-grow">
        {/* Central Neon Logo and Main Brand Presentation */}
        <HeroBanner />

        {/* Category Navigation with Search and Filters */}
        <div id="cardapio">
          <CategoryNav
            activeCategory={activeCategory}
            onSelectCategory={(cat) => {
              setActiveCategory(cat);
              setSelectedTag(null);
            }}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedTag={selectedTag}
            onSelectTag={setSelectedTag}
          />
        </div>

        {/* Menu Items Grid */}
        <MenuSection
          items={filteredItems}
          onOpenProductModal={(item: MenuItem) => setSelectedProductForModal(item)}
          activeCategory={activeCategory}
        />

        {/* About, Famoso X-Tudo, Choperia & Location */}
        <AboutSection />
      </main>

      {/* Footer */}
      <Footer />

      {/* Interactive Modals and Drawers */}
      <CartDrawer />
      <ProductModal />
      <OrderTrackerModal />
      <OrderHistoryModal />
      <LoyaltyClubModal isOpen={isLoyaltyOpen} onClose={() => setIsLoyaltyOpen(false)} />
      <AuthModal />
      <AdminLoginModal />
      <AdminDashboard />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <CartProvider>
        <MainAppContent />
      </CartProvider>
    </AuthProvider>
  );
};

export default App;
