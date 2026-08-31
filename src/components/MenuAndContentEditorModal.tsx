import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { MenuItem, CategoryId } from '../types';
import { menuCategories, suggestedMenuPhotos, SuggestedPhoto } from '../data/menuData';
import { formatBRL } from '../utils/formatters';
import {
  X,
  Plus,
  Edit,
  Trash2,
  Image as ImageIcon,
  Upload,
  RefreshCw,
  Check,
  Sparkles,
  Layers,
  Search,
  Sliders,
  Store,
  MapPin,
  Beer,
  Flame,
  ShieldCheck,
  Zap,
  Eye,
  EyeOff,
  ChevronRight,
  DollarSign,
  RotateCcw,
} from 'lucide-react';

interface MenuAndContentEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MenuAndContentEditorModal: React.FC<MenuAndContentEditorModalProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    menuItems,
    saveMenuItem,
    deleteMenuItem,
    resetMenuToDefaults,
    toggleItemAvailability,
    storeSettings,
    updateStoreSettings,
  } = useCart();

  const [activeTab, setActiveTab] = useState<'catalog' | 'form' | 'photos' | 'sections' | 'safety'>('catalog');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('todos');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Form State for Menu Item
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState<CategoryId>('smash');
  const [formPrice, setFormPrice] = useState<string>('24.90');
  const [formPromotionalPrice, setFormPromotionalPrice] = useState<string>('');
  const [formBadge, setFormBadge] = useState<string>('Nenhum');
  const [formPrepTime, setFormPrepTime] = useState<string>('15');
  const [formDescription, setFormDescription] = useState('');
  const [formIngredientsInput, setFormIngredientsInput] = useState('');
  const [formImage, setFormImage] = useState('');
  const [formAvailable, setFormAvailable] = useState(true);

  // Suggested Photos & Custom Gallery State
  const [galleryPhotos, setGalleryPhotos] = useState<SuggestedPhoto[]>(() => {
    const saved = localStorage.getItem('popidi_gallery_photos');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {
        // fallback
      }
    }
    return suggestedMenuPhotos;
  });

  const [photoCategoryFilter, setPhotoCategoryFilter] = useState<string>('Todos');
  const [newPhotoLabel, setNewPhotoLabel] = useState('');
  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const [newPhotoCategory, setNewPhotoCategory] = useState('Burgers & Smash');

  // Store Sections Form State (Local draft)
  const [sectionHeroBadge, setSectionHeroBadge] = useState(storeSettings.heroSpecialBadge || 'O Autêntico Burger Artesanal & Chopp Gelado');
  const [sectionHeroHeadline, setSectionHeroHeadline] = useState(storeSettings.heroHeadline || 'BURGER ARTESANAL NA BRASA & CHOPP TRINCANDO DE GELADO.');
  const [sectionHeroSubheadline, setSectionHeroSubheadline] = useState(storeSettings.heroSubheadline || 'Pães brioche selados na manteiga, carnes nobres moídas diariamente na brasa, smash burgers suculentos e o autêntico X-Tudo Especial.');
  const [sectionBannerText, setSectionBannerText] = useState(storeSettings.activeBannerAnnouncement || '');
  const [sectionOpeningHours, setSectionOpeningHours] = useState(storeSettings.openingHoursText || 'Terça a Domingo: 18:30 às 23:30');
  const [sectionPhone, setSectionPhone] = useState(storeSettings.phoneWhatsApp || '(15) 99845-6677');
  const [sectionAddress, setSectionAddress] = useState(storeSettings.address || 'Rua José Bonifácio, 340');
  const [sectionCityState, setSectionCityState] = useState(storeSettings.cityState || 'Porto Feliz - SP');
  const [sectionCep, setSectionCep] = useState(storeSettings.cep || '18540-003');
  const [sectionMapsUrl, setSectionMapsUrl] = useState(storeSettings.googleMapsUrl || 'https://maps.google.com/?q=Porto+Feliz+SP');
  const [sectionInstagramHandle, setSectionInstagramHandle] = useState(storeSettings.instagramHandle || '@popidihamburgueria');
  const [sectionInstagramUrl, setSectionInstagramUrl] = useState(storeSettings.instagramUrl || 'https://instagram.com/popidihamburgueria');
  const [sectionDeliveryFee, setSectionDeliveryFee] = useState(String(storeSettings.standardDeliveryFee || 6));
  const [sectionFreeDeliveryMin, setSectionFreeDeliveryMin] = useState(String(storeSettings.freeDeliveryThreshold || 80));
  const [sectionMinOrder, setSectionMinOrder] = useState(String(storeSettings.minimumOrderValue || 20));
  const [sectionPixKey, setSectionPixKey] = useState(storeSettings.pixKey || '15998456677');
  const [sectionPixType, setSectionPixType] = useState(storeSettings.pixKeyType || 'Celular (WhatsApp)');
  const [sectionPixReceiver, setSectionPixReceiver] = useState(storeSettings.pixReceiverName || 'PO-PI-DI Hamburgueria');
  const [sectionPrepMin, setSectionPrepMin] = useState(String(storeSettings.estimatedPrepTimeMin || 25));
  const [sectionPrepMax, setSectionPrepMax] = useState(String(storeSettings.estimatedPrepTimeMax || 45));
  const [sectionAboutStory, setSectionAboutStory] = useState(storeSettings.aboutStoryText || 'Na PO-PI-DI, cada lanche e hambúrguer é preparado artesanalmente com ingredientes frescos de altíssima qualidade, blends nobres moídos na hora, queijo derretido e chopp trincando de gelado.');

  // Sync settings when modal opens
  useEffect(() => {
    if (isOpen) {
      setSectionHeroBadge(storeSettings.heroSpecialBadge || 'O Autêntico Burger Artesanal & Chopp Gelado');
      setSectionHeroHeadline(storeSettings.heroHeadline || 'BURGER ARTESANAL NA BRASA & CHOPP TRINCANDO DE GELADO.');
      setSectionHeroSubheadline(storeSettings.heroSubheadline || 'Pães brioche selados na manteiga, carnes nobres moídas diariamente na brasa, smash burgers suculentos e o autêntico X-Tudo Especial.');
      setSectionBannerText(storeSettings.activeBannerAnnouncement || '');
      setSectionOpeningHours(storeSettings.openingHoursText || 'Terça a Domingo: 18:30 às 23:30');
      setSectionPhone(storeSettings.phoneWhatsApp || '(15) 99845-6677');
      setSectionAddress(storeSettings.address || 'Rua José Bonifácio, 340');
      setSectionCityState(storeSettings.cityState || 'Porto Feliz - SP');
      setSectionCep(storeSettings.cep || '18540-003');
      setSectionMapsUrl(storeSettings.googleMapsUrl || 'https://maps.google.com/?q=Porto+Feliz+SP');
      setSectionInstagramHandle(storeSettings.instagramHandle || '@popidihamburgueria');
      setSectionInstagramUrl(storeSettings.instagramUrl || 'https://instagram.com/popidihamburgueria');
      setSectionDeliveryFee(String(storeSettings.standardDeliveryFee || 6));
      setSectionFreeDeliveryMin(String(storeSettings.freeDeliveryThreshold || 80));
      setSectionMinOrder(String(storeSettings.minimumOrderValue || 20));
      setSectionPixKey(storeSettings.pixKey || '15998456677');
      setSectionPixType(storeSettings.pixKeyType || 'Celular (WhatsApp)');
      setSectionPixReceiver(storeSettings.pixReceiverName || 'PO-PI-DI Hamburgueria');
      setSectionPrepMin(String(storeSettings.estimatedPrepTimeMin || 25));
      setSectionPrepMax(String(storeSettings.estimatedPrepTimeMax || 45));
      setSectionAboutStory(storeSettings.aboutStoryText || 'Na PO-PI-DI, cada lanche e hambúrguer é preparado artesanalmente com ingredientes frescos de altíssima qualidade, blends nobres moídos na hora, queijo derretido e chopp trincando de gelado.');
    }
  }, [isOpen, storeSettings]);

  if (!isOpen) return null;

  const showNotification = (msg: string) => {
    setSaveSuccessMsg(msg);
    setTimeout(() => {
      setSaveSuccessMsg(null);
    }, 3500);
  };

  const handleStartCreateNew = () => {
    setEditingId(null);
    setFormName('');
    setFormCategory('smash');
    setFormPrice('24.90');
    setFormPromotionalPrice('');
    setFormBadge('Nenhum');
    setFormPrepTime('15');
    setFormDescription('');
    setFormIngredientsInput('');
    setFormImage('https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80');
    setFormAvailable(true);
    setActiveTab('form');
  };

  const handleStartEditItem = (item: MenuItem) => {
    setEditingId(item.id);
    setFormName(item.name);
    setFormCategory(item.category);
    setFormPrice(item.price.toFixed(2));
    setFormPromotionalPrice(item.promotionalPrice ? item.promotionalPrice.toFixed(2) : '');
    setFormBadge(item.badge || 'Nenhum');
    setFormPrepTime(String(item.prepTimeMinutes || 15));
    setFormDescription(item.description || '');
    setFormIngredientsInput(Array.isArray(item.ingredients) ? item.ingredients.join(', ') : '');
    setFormImage(item.image || '');
    setFormAvailable(item.available !== false);
    setActiveTab('form');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
      alert('A imagem é muito pesada (máx 3MB). Por favor escolha uma imagem menor ou utilize uma URL.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (loadEvt) => {
      const dataUrl = loadEvt.target?.result as string;
      if (dataUrl) {
        setFormImage(dataUrl);
        showNotification('Foto carregada do dispositivo com sucesso!');
      }
    };
    reader.readAsDataURL(file);
  };

  // Gallery Management
  const handleSelectSuggestedPhoto = (photoUrl: string) => {
    setFormImage(photoUrl);
    showNotification('Foto selecionada e aplicada ao formulário!');
    setActiveTab('form');
  };

  const handleDeleteGalleryPhoto = (photoId: string, label: string) => {
    if (window.confirm(`Deseja remover a foto "${label}" da galeria?`)) {
      const updated = galleryPhotos.filter(p => p.id !== photoId);
      setGalleryPhotos(updated);
      localStorage.setItem('popidi_gallery_photos', JSON.stringify(updated));
      showNotification(`Foto "${label}" excluída da galeria.`);
    }
  };

  const handleAddCustomPhotoToGallery = () => {
    if (!newPhotoUrl.trim()) {
      alert('Por favor informe a URL da foto ou faça o upload.');
      return;
    }
    const newPhoto: SuggestedPhoto = {
      id: `photo-custom-${Date.now()}`,
      label: newPhotoLabel.trim() || 'Foto de Lanche',
      url: newPhotoUrl.trim(),
      category: newPhotoCategory,
    };
    const updated = [newPhoto, ...galleryPhotos];
    setGalleryPhotos(updated);
    localStorage.setItem('popidi_gallery_photos', JSON.stringify(updated));
    setNewPhotoUrl('');
    setNewPhotoLabel('');
    showNotification('Nova foto adicionada à galeria com sucesso!');
  };

  const handleCustomPhotoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
      alert('A imagem é muito pesada (máx 3MB).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (loadEvt) => {
      const dataUrl = loadEvt.target?.result as string;
      if (dataUrl) {
        setNewPhotoUrl(dataUrl);
        if (!newPhotoLabel.trim()) {
          setNewPhotoLabel(file.name.replace(/\.[^/.]+$/, ''));
        }
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRestoreGalleryDefaults = () => {
    if (window.confirm('Deseja restaurar todas as fotos oficiais padrão da galeria?')) {
      setGalleryPhotos(suggestedMenuPhotos);
      localStorage.removeItem('popidi_gallery_photos');
      showNotification('Galeria de fotos restaurada para o padrão oficial.');
    }
  };

  const handleSaveFormItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      alert('Por favor informe o nome do lanche ou produto.');
      return;
    }

    const priceNum = parseFloat(formPrice.replace(',', '.'));
    if (isNaN(priceNum) || priceNum <= 0) {
      alert('Por favor informe um preço de venda válido.');
      return;
    }

    const promoNum = formPromotionalPrice.trim() ? parseFloat(formPromotionalPrice.replace(',', '.')) : undefined;
    const prepMinutes = parseInt(formPrepTime, 10) || 15;

    const ingredientsList = formIngredientsInput
      .split(',')
      .map(i => i.trim())
      .filter(i => i.length > 0);

    const itemId = editingId || `lanche-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

    const newItem: MenuItem = {
      id: itemId,
      name: formName.trim(),
      category: formCategory,
      price: priceNum,
      promotionalPrice: promoNum && !isNaN(promoNum) ? promoNum : undefined,
      description: formDescription.trim(),
      image: formImage.trim() || 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80',
      badge: formBadge !== 'Nenhum' ? (formBadge as any) : undefined,
      prepTimeMinutes: prepMinutes,
      ingredients: ingredientsList.length > 0 ? ingredientsList : [formName.trim()],
      available: formAvailable,
      updatedAt: new Date().toISOString(),
    };

    setIsSaving(true);
    try {
      await saveMenuItem(newItem);
      showNotification(`Lanche "${newItem.name}" salvo e sincronizado em tempo real!`);
      setActiveTab('catalog');
    } catch (err) {
      alert('Erro ao salvar lanche no banco de dados.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteItem = async (item: MenuItem) => {
    if (window.confirm(`Tem certeza que deseja excluir o lanche "${item.name}" do cardápio?`)) {
      setIsSaving(true);
      try {
        await deleteMenuItem(item.id);
        showNotification(`Lanche "${item.name}" removido com sucesso.`);
      } catch (e) {
        alert('Erro ao excluir item.');
      } finally {
        setIsSaving(false);
      }
    }
  };

  const handleSaveSections = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const updatedSettings = {
        heroSpecialBadge: sectionHeroBadge.trim(),
        heroHeadline: sectionHeroHeadline.trim(),
        heroSubheadline: sectionHeroSubheadline.trim(),
        activeBannerAnnouncement: sectionBannerText.trim(),
        openingHoursText: sectionOpeningHours.trim(),
        phoneWhatsApp: sectionPhone.trim(),
        address: sectionAddress.trim(),
        cityState: sectionCityState.trim(),
        cep: sectionCep.trim(),
        googleMapsUrl: sectionMapsUrl.trim(),
        instagramHandle: sectionInstagramHandle.trim(),
        instagramUrl: sectionInstagramUrl.trim(),
        standardDeliveryFee: parseFloat(sectionDeliveryFee.replace(',', '.')) || 6,
        freeDeliveryThreshold: parseFloat(sectionFreeDeliveryMin.replace(',', '.')) || 80,
        minimumOrderValue: parseFloat(sectionMinOrder.replace(',', '.')) || 20,
        pixKey: sectionPixKey.trim(),
        pixKeyType: sectionPixType.trim(),
        pixReceiverName: sectionPixReceiver.trim(),
        estimatedPrepTimeMin: parseInt(sectionPrepMin, 10) || 25,
        estimatedPrepTimeMax: parseInt(sectionPrepMax, 10) || 45,
        aboutStoryText: sectionAboutStory.trim(),
      };

      await updateStoreSettings(updatedSettings);
      showNotification('Informações das seções salvas e atualizadas para todos os clientes!');
    } catch (err) {
      alert('Erro ao salvar informações no banco de dados.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRestoreDefaults = async () => {
    const confirmation = window.prompt(
      'Atenção: Isso irá recarregar todos os smash burgers, burgers artesanais, porções, chopps e bebidas padrão do cardápio oficial no banco de dados.\n\nDigite "RESTAURAR" para confirmar:'
    );

    if (confirmation === 'RESTAURAR') {
      setIsSaving(true);
      try {
        await resetMenuToDefaults();
        showNotification('Catálogo oficial de lanches e bebidas restaurado com sucesso!');
        setActiveTab('catalog');
      } catch (err) {
        alert('Erro ao restaurar catálogo padrão.');
      } finally {
        setIsSaving(false);
      }
    }
  };

  // Filtered Menu Items
  const filteredItems = menuItems.filter(item => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCat =
      selectedCategoryFilter === 'todos' || item.category === selectedCategoryFilter;

    return matchesSearch && matchesCat;
  });

  const photoCategories = ['Todos', 'Burgers & Smash', 'Porções & Petiscos', 'Choperia & Chopp', 'Sobremesas', 'Combos'];

  const filteredPhotos = galleryPhotos.filter(photo => {
    if (photoCategoryFilter === 'Todos') return true;
    return photo.category === photoCategoryFilter;
  });

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/90 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      <div 
        className="relative bg-[#0d0f17] border border-amber-500/40 shadow-2xl rounded-3xl w-full max-w-6xl max-h-[94vh] flex flex-col text-left overflow-hidden shadow-[0_0_50px_rgba(234,179,8,0.15)]"
        onClick={e => e.stopPropagation()}
      >
        
        {/* Top Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 border-b border-zinc-800 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-yellow-400 to-amber-600 text-black flex items-center justify-center font-black shadow-lg shadow-yellow-500/20 shrink-0">
              <Sliders className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-black text-white uppercase tracking-tight">
                  Editor do Cardápio & Informações da Loja
                </h2>
                <span className="flex items-center gap-1 text-[10px] font-black uppercase bg-emerald-950 text-emerald-400 border border-emerald-500/40 px-2 py-0.5 rounded-full">
                  <Zap className="w-3 h-3 text-emerald-400" />
                  Sincronização em Tempo Real (Firestore)
                </span>
              </div>
              <p className="text-xs text-zinc-400 hidden sm:block">
                Cadastre novos lanches, altere fotos/preços, edite textos das seções e restaure o cardápio padrão a qualquer momento.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleStartCreateNew}
              className="px-3.5 py-2 bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 text-black font-black text-xs rounded-xl flex items-center gap-1.5 shadow-md shadow-yellow-500/20 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span className="hidden sm:inline">Cadastrar Novo Lanche</span>
              <span className="sm:hidden">Novo</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2.5 text-zinc-400 hover:text-white rounded-xl bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 transition-colors cursor-pointer"
              title="Fechar Editor"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Global Notification Toast */}
        {saveSuccessMsg && (
          <div className="bg-emerald-500 text-black px-4 py-2 text-xs font-black flex items-center justify-center gap-2 shadow-md animate-in slide-in-from-top-2">
            <Check className="w-4 h-4 stroke-[3]" />
            <span>{saveSuccessMsg}</span>
          </div>
        )}

        {/* Tabs Bar */}
        <div className="flex items-center gap-1 overflow-x-auto border-b border-zinc-800 bg-zinc-950/80 px-3 sm:px-5 shrink-0 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('catalog')}
            className={`px-4 py-3 border-b-2 transition-colors flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'catalog'
                ? 'border-yellow-500 text-yellow-400 bg-yellow-500/5 font-black'
                : 'border-transparent text-zinc-400 hover:text-white'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Cardápio de Lanches ({menuItems.length})</span>
          </button>

          <button
            type="button"
            onClick={handleStartCreateNew}
            className={`px-4 py-3 border-b-2 transition-colors flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'form'
                ? 'border-yellow-500 text-yellow-400 bg-yellow-500/5 font-black'
                : 'border-transparent text-zinc-400 hover:text-white'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>{editingId ? 'Editar Lanche' : 'Cadastrar Novo Lanche'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('photos')}
            className={`px-4 py-3 border-b-2 transition-colors flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'photos'
                ? 'border-yellow-500 text-yellow-400 bg-yellow-500/5 font-black'
                : 'border-transparent text-zinc-400 hover:text-white'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>Galeria de Fotos Sugeridas ({galleryPhotos.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('sections')}
            className={`px-4 py-3 border-b-2 transition-colors flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'sections'
                ? 'border-yellow-500 text-yellow-400 bg-yellow-500/5 font-black'
                : 'border-transparent text-zinc-400 hover:text-white'
            }`}
          >
            <Store className="w-4 h-4" />
            <span>Informações das Seções da Página</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('safety')}
            className={`px-4 py-3 border-b-2 transition-colors flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'safety'
                ? 'border-red-500 text-red-400 bg-red-500/5 font-black'
                : 'border-transparent text-zinc-400 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-red-400" />
            <span>Segurança & Restauração</span>
          </button>
        </div>

        {/* Tab Contents */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          
          {/* TAB 1: CARDÁPIO COMPLETO */}
          {activeTab === 'catalog' && (
            <div className="space-y-4">
              {/* Search and Category Filters */}
              <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    placeholder="Buscar por nome do lanche, ingrediente..."
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-yellow-500"
                  />
                </div>

                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  <select
                    value={selectedCategoryFilter}
                    onChange={e => setSelectedCategoryFilter(e.target.value)}
                    className="bg-zinc-900 border border-zinc-800 text-zinc-200 text-xs font-bold rounded-xl px-3 py-2.5 focus:outline-none focus:border-yellow-500"
                  >
                    <option value="todos">Todas as Categorias ({menuItems.length})</option>
                    {menuCategories.filter(c => c.id !== 'todos').map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({menuItems.filter(i => i.category === c.id).length})
                      </option>
                    ))}
                  </select>

                  <button
                    type="button"
                    onClick={handleStartCreateNew}
                    className="px-3 py-2.5 bg-yellow-500/15 border border-yellow-500/40 text-yellow-400 hover:bg-yellow-500/25 rounded-xl text-xs font-black flex items-center gap-1.5 shrink-0 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Cadastrar Lanche</span>
                  </button>
                </div>
              </div>

              {/* Items List / Grid */}
              {filteredItems.length === 0 ? (
                <div className="py-16 text-center text-zinc-500 bg-zinc-950/40 rounded-3xl border border-zinc-900 flex flex-col items-center justify-center">
                  <Layers className="w-12 h-12 mb-3 text-zinc-600" />
                  <p className="text-sm font-bold text-zinc-300">Nenhum lanche encontrado no filtro atual.</p>
                  <button
                    type="button"
                    onClick={() => { setSearchTerm(''); setSelectedCategoryFilter('todos'); }}
                    className="mt-3 text-xs text-yellow-400 underline font-bold"
                  >
                    Limpar filtros
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  {filteredItems.map(item => (
                    <div
                      key={item.id}
                      className={`p-3.5 rounded-2xl border flex flex-col justify-between gap-3 text-left transition-all ${
                        item.available
                          ? 'bg-zinc-950 border-zinc-800/90 shadow-sm hover:border-zinc-700'
                          : 'bg-red-950/15 border-red-900/40 opacity-75'
                      }`}
                    >
                      <div className="flex gap-3">
                        <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-zinc-900 shrink-0 border border-zinc-800">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=400&q=80';
                            }}
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-1">
                            <h4 className="text-xs font-black text-white truncate">{item.name}</h4>
                            <span className={`text-[9px] font-black px-1.5 py-0.5 rounded shrink-0 uppercase ${
                              item.available ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/40' : 'bg-red-950 text-red-400 border border-red-800/40'
                            }`}>
                              {item.available ? 'Ativo' : 'Esgotado'}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <span className="text-xs font-black text-yellow-400">
                              {formatBRL(item.price)}
                            </span>
                            {item.promotionalPrice && (
                              <span className="text-[10px] line-through text-zinc-500">
                                {formatBRL(item.promotionalPrice)}
                              </span>
                            )}
                            {item.badge && (
                              <span className="text-[9px] font-bold bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded">
                                {item.badge}
                              </span>
                            )}
                          </div>

                          {item.description && (
                            <p className="text-[11px] text-zinc-400 line-clamp-2 mt-1 leading-snug">
                              {item.description}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Item Bottom Actions */}
                      <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => toggleItemAvailability(item.id)}
                          className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border transition-colors flex items-center gap-1 ${
                            item.available
                              ? 'text-zinc-400 hover:text-red-400 border-zinc-800 hover:border-red-900/50 hover:bg-red-950/30'
                              : 'text-emerald-400 border-emerald-800/50 bg-emerald-950/40 hover:bg-emerald-950'
                          }`}
                        >
                          {item.available ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          <span>{item.available ? 'Esgotar' : 'Ativar'}</span>
                        </button>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleStartEditItem(item)}
                            className="p-1.5 text-zinc-300 hover:text-white bg-zinc-900 hover:bg-zinc-800 rounded-lg border border-zinc-800 transition-colors flex items-center gap-1 text-[11px] font-bold px-2"
                            title="Editar Preço, Foto e Detalhes"
                          >
                            <Edit className="w-3.5 h-3.5 text-yellow-400" />
                            <span>Editar</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteItem(item)}
                            className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-red-950/30 rounded-lg border border-transparent hover:border-red-900/40 transition-colors"
                            title="Excluir do cardápio"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: CADASTRAR OU EDITAR LANCHE */}
          {activeTab === 'form' && (
            <form onSubmit={handleSaveFormItem} className="max-w-3xl mx-auto space-y-5 text-left">
              <div className="bg-zinc-950 p-4 sm:p-5 rounded-2xl border border-yellow-500/30 space-y-4">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-yellow-400" />
                    <h3 className="text-sm sm:text-base font-black text-white uppercase tracking-wider">
                      {editingId ? `Editando: ${formName || 'Lanche'}` : 'Cadastrar Novo Lanche no Cardápio'}
                    </h3>
                  </div>
                  {editingId && (
                    <button
                      type="button"
                      onClick={handleStartCreateNew}
                      className="text-xs text-yellow-400 hover:underline font-bold cursor-pointer"
                    >
                      + Cadastrar Novo Lanche
                    </button>
                  )}
                </div>

                {/* Form Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  {/* Nome do Item */}
                  <div className="sm:col-span-2">
                    <label className="text-xs font-bold text-zinc-300 block mb-1">
                      Nome do Lanche ou Produto *
                    </label>
                    <input
                      type="text"
                      required
                      value={formName}
                      onChange={e => setFormName(e.target.value)}
                      placeholder="Ex: Duplo Smash Melt Cheddar Artesanal"
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-yellow-500 font-bold"
                    />
                  </div>

                  {/* Categoria */}
                  <div>
                    <label className="text-xs font-bold text-zinc-300 block mb-1">
                      Categoria no Cardápio
                    </label>
                    <select
                      value={formCategory}
                      onChange={e => setFormCategory(e.target.value as CategoryId)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-yellow-500 font-bold"
                    >
                      <option value="smash">Smash Burgers</option>
                      <option value="artesanais">Burgers Artesanais</option>
                      <option value="monster-especiais">Monsters & Especiais</option>
                      <option value="porcoes">Porções & Petiscos</option>
                      <option value="choperia">Choperia & Chopps</option>
                      <option value="combos">Combos Econômicos</option>
                      <option value="bebidas">Refrigerantes & Sucos</option>
                      <option value="sobremesas">Sobremesas & Shakes</option>
                    </select>
                  </div>

                  {/* Tempo de Preparo */}
                  <div>
                    <label className="text-xs font-bold text-zinc-300 block mb-1">
                      Tempo de Preparo Estimado (minutos)
                    </label>
                    <input
                      type="number"
                      value={formPrepTime}
                      onChange={e => setFormPrepTime(e.target.value)}
                      placeholder="15"
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-yellow-500"
                    />
                  </div>

                  {/* Preço Normal */}
                  <div>
                    <label className="text-xs font-bold text-zinc-300 block mb-1">
                      Preço de Venda (R$) *
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-400">R$</span>
                      <input
                        type="text"
                        required
                        value={formPrice}
                        onChange={e => setFormPrice(e.target.value)}
                        placeholder="24.90"
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-3 py-3 text-xs text-yellow-400 font-black focus:outline-none focus:border-yellow-500"
                      />
                    </div>
                  </div>

                  {/* Preço Promocional */}
                  <div>
                    <label className="text-xs font-bold text-zinc-300 block mb-1">
                      Preço Promocional / De: (Opcional)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-400">R$</span>
                      <input
                        type="text"
                        value={formPromotionalPrice}
                        onChange={e => setFormPromotionalPrice(e.target.value)}
                        placeholder="Ex: 29.90 (se estiver com desconto)"
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-3 py-3 text-xs text-zinc-300 focus:outline-none focus:border-yellow-500"
                      />
                    </div>
                  </div>

                  {/* Selo Promocional */}
                  <div className="sm:col-span-2">
                    <label className="text-xs font-bold text-zinc-300 block mb-1">
                      Selo de Destaque / Badge
                    </label>
                    <select
                      value={formBadge}
                      onChange={e => setFormBadge(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-yellow-500 font-bold"
                    >
                      <option value="Nenhum">Nenhum</option>
                      <option value="Mais Vendido">Mais Vendido</option>
                      <option value="Novidade">Novidade</option>
                      <option value="Destaque">Destaque</option>
                      <option value="Chef Especial">Chef Especial</option>
                      <option value="Promoção">Promoção</option>
                      <option value="Smash Especial">Smash Especial</option>
                      <option value="Burger Artesanal">Burger Artesanal</option>
                    </select>
                  </div>

                  {/* Descrição Detalhada */}
                  <div className="sm:col-span-2">
                    <label className="text-xs font-bold text-zinc-300 block mb-1">
                      Descrição do Lanche para os Clientes
                    </label>
                    <textarea
                      rows={2}
                      value={formDescription}
                      onChange={e => setFormDescription(e.target.value)}
                      placeholder="Ex: Pão brioche amanteigado selado na chapa, 2 smash burgers 90g com crostinha na brasa, cheddar melt cremoso, bacon crocante e maionese secreta da casa."
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs text-zinc-200 focus:outline-none focus:border-yellow-500"
                    />
                  </div>

                  {/* Ingredientes / Tags */}
                  <div className="sm:col-span-2">
                    <label className="text-xs font-bold text-zinc-300 block mb-1">
                      Ingredientes / Acompanhamentos (Separados por vírgula)
                    </label>
                    <input
                      type="text"
                      value={formIngredientsInput}
                      onChange={e => setFormIngredientsInput(e.target.value)}
                      placeholder="Ex: Pão Brioche, 2x Smash 90g, American Cheese, Molho Especial, Bacon Crocante"
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs text-zinc-200 focus:outline-none focus:border-yellow-500"
                    />
                  </div>

                  {/* Foto do Produto & Upload */}
                  <div className="sm:col-span-2 space-y-3 pt-2 border-t border-zinc-800">
                    <label className="text-xs font-bold text-zinc-300 block">
                      Foto do Lanche (URL, Upload ou Escolha da Galeria)
                    </label>

                    <div className="flex flex-col sm:flex-row gap-4 items-start">
                      {/* Preview Box */}
                      <div className="w-28 h-28 rounded-2xl bg-zinc-900 border border-zinc-800 overflow-hidden relative shrink-0">
                        {formImage ? (
                          <img
                            src={formImage}
                            alt="Preview"
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=400&q=80';
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-zinc-600">
                            <ImageIcon className="w-8 h-8" />
                          </div>
                        )}
                        <span className="absolute bottom-1 left-1 bg-black/80 text-[9px] font-bold text-white px-1.5 py-0.5 rounded">
                          Preview
                        </span>
                      </div>

                      <div className="flex-1 w-full space-y-2">
                        {/* URL input */}
                        <div>
                          <input
                            type="text"
                            value={formImage}
                            onChange={e => setFormImage(e.target.value)}
                            placeholder="Cole a URL da imagem aqui (https://...)"
                            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs text-zinc-200 focus:outline-none focus:border-yellow-500 font-mono"
                          />
                        </div>

                        {/* Upload Button + Choose from Gallery Button */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <label className="px-3 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors">
                            <Upload className="w-3.5 h-3.5 text-yellow-400" />
                            <span>Carregar do Dispositivo</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={handleFileUpload}
                            />
                          </label>

                          <button
                            type="button"
                            onClick={() => setActiveTab('photos')}
                            className="px-3 py-2 bg-yellow-500/15 hover:bg-yellow-500/25 border border-yellow-500/40 text-yellow-300 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                          >
                            <ImageIcon className="w-3.5 h-3.5" />
                            <span>Escolher da Galeria Sugerida ({galleryPhotos.length} fotos)</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Disponibilidade Switch */}
                  <div className="sm:col-span-2 flex items-center justify-between p-3 bg-zinc-900/60 rounded-xl border border-zinc-800">
                    <div>
                      <span className="text-xs font-bold text-white block">Status de Disponibilidade</span>
                      <span className="text-[11px] text-zinc-400">
                        {formAvailable ? 'O lanche está ativo e pode ser comprado pelos clientes.' : 'O lanche está marcado como esgotado no cardápio.'}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFormAvailable(!formAvailable)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        formAvailable ? 'bg-emerald-500 text-black' : 'bg-red-950 text-red-400 border border-red-800'
                      }`}
                    >
                      {formAvailable ? '✓ Disponível para Venda' : '✕ Esgotado'}
                    </button>
                  </div>

                </div>

                {/* Form Action Buttons */}
                <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setActiveTab('catalog')}
                    className="px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>

                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-6 py-3 bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-500 hover:from-yellow-300 hover:to-amber-400 text-black font-black text-xs sm:text-sm rounded-xl flex items-center gap-2 shadow-lg shadow-yellow-500/20 transition-all cursor-pointer"
                  >
                    {isSaving ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Salvando no Firestore...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4 stroke-[3]" />
                        <span>{editingId ? 'Atualizar Lanche no Cardápio' : 'Salvar Novo Lanche (Tempo Real)'}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* TAB 3: GALERIA DE FOTOS SUGERIDAS & GERENCIADOR */}
          {activeTab === 'photos' && (
            <div className="space-y-5">
              
              {/* Adicionar Nova Foto à Galeria & Controles */}
              <div className="bg-zinc-950 p-4 sm:p-5 rounded-2xl border border-zinc-800 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-3">
                  <div>
                    <h3 className="font-black text-white text-sm flex items-center gap-2">
                      <ImageIcon className="w-4 h-4 text-yellow-400" />
                      Galeria de Fotos em Alta Resolução para Lanches & Bebidas
                    </h3>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      Clique em qualquer foto para aplicá-la ao formulário, adicione novas fotos ou exclua fotos indesejadas.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleRestoreGalleryDefaults}
                      className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                      title="Restaurar Fotos Padrão"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Restaurar Padrão</span>
                    </button>
                  </div>
                </div>

                {/* Form to Add New Photo to Gallery */}
                <div className="p-3.5 bg-zinc-900/60 rounded-xl border border-zinc-800/80 space-y-3">
                  <span className="text-xs font-bold text-white block flex items-center gap-1.5">
                    <Plus className="w-3.5 h-3.5 text-yellow-400" />
                    Adicionar Nova Foto à Galeria:
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-end">
                    <div className="sm:col-span-4">
                      <label className="text-[11px] font-bold text-zinc-400 block mb-1">Título / Nome da Foto</label>
                      <input
                        type="text"
                        value={newPhotoLabel}
                        onChange={e => setNewPhotoLabel(e.target.value)}
                        placeholder="Ex: Smash Bacon Especial"
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-yellow-500"
                      />
                    </div>

                    <div className="sm:col-span-3">
                      <label className="text-[11px] font-bold text-zinc-400 block mb-1">Categoria</label>
                      <select
                        value={newPhotoCategory}
                        onChange={e => setNewPhotoCategory(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-yellow-500 font-bold"
                      >
                        <option value="Burgers & Smash">Burgers & Smash</option>
                        <option value="Porções & Petiscos">Porções & Petiscos</option>
                        <option value="Choperia & Chopp">Choperia & Chopp</option>
                        <option value="Sobremesas">Sobremesas</option>
                        <option value="Combos">Combos</option>
                      </select>
                    </div>

                    <div className="sm:col-span-3">
                      <label className="text-[11px] font-bold text-zinc-400 block mb-1">URL ou Upload</label>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="text"
                          value={newPhotoUrl}
                          onChange={e => setNewPhotoUrl(e.target.value)}
                          placeholder="https://..."
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-yellow-500"
                        />
                        <label className="p-2 bg-zinc-800 hover:bg-zinc-700 text-yellow-400 rounded-xl border border-zinc-700 cursor-pointer shrink-0" title="Carregar do dispositivo">
                          <Upload className="w-3.5 h-3.5" />
                          <input type="file" accept="image/*" className="hidden" onChange={handleCustomPhotoFileUpload} />
                        </label>
                      </div>
                    </div>

                    <div className="sm:col-span-2">
                      <button
                        type="button"
                        onClick={handleAddCustomPhotoToGallery}
                        className="w-full py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-black text-xs rounded-xl flex items-center justify-center gap-1 cursor-pointer transition-all shadow"
                      >
                        <Plus className="w-3.5 h-3.5 stroke-[3]" />
                        <span>Adicionar</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Filter categories */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                  {photoCategories.map(cat => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setPhotoCategoryFilter(cat)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                        photoCategoryFilter === cat
                          ? 'bg-yellow-500 text-black font-black'
                          : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Photos Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5">
                {filteredPhotos.map(photo => (
                  <div
                    key={photo.id}
                    onClick={() => handleSelectSuggestedPhoto(photo.url)}
                    className="group bg-zinc-950 border border-zinc-800 hover:border-yellow-500/80 rounded-2xl overflow-hidden cursor-pointer transition-all hover:scale-[1.02] shadow-sm flex flex-col relative"
                  >
                    <div className="aspect-video w-full overflow-hidden bg-zinc-900 relative">
                      <img
                        src={photo.url}
                        alt={photo.label}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        referrerPolicy="no-referrer"
                      />
                      <span className="absolute top-2 left-2 bg-black/80 text-[10px] font-bold text-yellow-400 px-2 py-0.5 rounded-md">
                        {photo.category}
                      </span>

                      {/* Excluir Foto Button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteGalleryPhoto(photo.id, photo.label);
                        }}
                        className="absolute top-2 right-2 p-1.5 bg-black/85 hover:bg-red-600 text-zinc-300 hover:text-white rounded-lg transition-colors z-10"
                        title="Excluir esta foto da galeria"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="p-2.5 flex-1 flex flex-col justify-between">
                      <p className="text-xs font-black text-zinc-200 group-hover:text-yellow-400 line-clamp-1">
                        {photo.label}
                      </p>
                      <span className="text-[10px] text-yellow-500/80 font-bold mt-1 inline-flex items-center gap-1">
                        Usar no Lanche <ChevronRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: INFORMAÇÕES DAS SEÇÕES DA PÁGINA */}
          {activeTab === 'sections' && (
            <form onSubmit={handleSaveSections} className="max-w-4xl mx-auto space-y-6 text-left">
              
              {/* Seção 1: Apresentação & Banner Principal */}
              <div className="bg-zinc-950 p-5 rounded-2xl border border-zinc-800 space-y-4">
                <div className="flex items-center gap-2 border-b border-zinc-800 pb-2">
                  <Flame className="w-5 h-5 text-yellow-400" />
                  <h3 className="text-sm font-black text-white uppercase tracking-wider">
                    1. Apresentação & Banner Principal (Hero)
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="text-xs font-bold text-zinc-300 block mb-1">
                      Selo do Topo do Banner
                    </label>
                    <input
                      type="text"
                      value={sectionHeroBadge}
                      onChange={e => setSectionHeroBadge(e.target.value)}
                      placeholder="O Autêntico Burger Artesanal & Chopp Gelado"
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs text-zinc-200 focus:outline-none focus:border-yellow-500"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-xs font-bold text-zinc-300 block mb-1">
                      Título Principal da Página
                    </label>
                    <input
                      type="text"
                      value={sectionHeroHeadline}
                      onChange={e => setSectionHeroHeadline(e.target.value)}
                      placeholder="BURGER ARTESANAL NA BRASA & CHOPP TRINCANDO DE GELADO."
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs text-white font-black focus:outline-none focus:border-yellow-500"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-xs font-bold text-zinc-300 block mb-1">
                      Subtítulo / Descrição de Destaque
                    </label>
                    <textarea
                      rows={2}
                      value={sectionHeroSubheadline}
                      onChange={e => setSectionHeroSubheadline(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs text-zinc-200 focus:outline-none focus:border-yellow-500"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-xs font-bold text-zinc-300 block mb-1">
                      Faixa de Aviso / Banner no Topo do Cardápio
                    </label>
                    <input
                      type="text"
                      value={sectionBannerText}
                      onChange={e => setSectionBannerText(e.target.value)}
                      placeholder="Ex: 🍔 Sextou com smash artesanal em dobro e chopp gelado!"
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs text-zinc-200 focus:outline-none focus:border-yellow-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-zinc-300 block mb-1">
                      Tempo Mínimo de Preparo (minutos)
                    </label>
                    <input
                      type="number"
                      value={sectionPrepMin}
                      onChange={e => setSectionPrepMin(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs text-zinc-200"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-zinc-300 block mb-1">
                      Tempo Máximo de Preparo (minutos)
                    </label>
                    <input
                      type="number"
                      value={sectionPrepMax}
                      onChange={e => setSectionPrepMax(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs text-zinc-200"
                    />
                  </div>
                </div>
              </div>

              {/* Seção 2: Contato, Endereço & Horários */}
              <div className="bg-zinc-950 p-5 rounded-2xl border border-zinc-800 space-y-4">
                <div className="flex items-center gap-2 border-b border-zinc-800 pb-2">
                  <MapPin className="w-5 h-5 text-yellow-400" />
                  <h3 className="text-sm font-black text-white uppercase tracking-wider">
                    2. Contato, Endereço & Horários de Funcionamento
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-zinc-300 block mb-1">
                      Horário de Funcionamento
                    </label>
                    <input
                      type="text"
                      value={sectionOpeningHours}
                      onChange={e => setSectionOpeningHours(e.target.value)}
                      placeholder="Terça a Domingo: 18:30 às 23:30"
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs text-zinc-200"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-zinc-300 block mb-1">
                      Telefone / WhatsApp com DDD
                    </label>
                    <input
                      type="text"
                      value={sectionPhone}
                      onChange={e => setSectionPhone(e.target.value)}
                      placeholder="(15) 99845-6677"
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs text-zinc-200"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-zinc-300 block mb-1">
                      Endereço (Rua e Número)
                    </label>
                    <input
                      type="text"
                      value={sectionAddress}
                      onChange={e => setSectionAddress(e.target.value)}
                      placeholder="Rua José Bonifácio, 340"
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs text-zinc-200"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-zinc-300 block mb-1">
                      Cidade - Estado e CEP
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={sectionCityState}
                        onChange={e => setSectionCityState(e.target.value)}
                        placeholder="Porto Feliz - SP"
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs text-zinc-200"
                      />
                      <input
                        type="text"
                        value={sectionCep}
                        onChange={e => setSectionCep(e.target.value)}
                        placeholder="18540-003"
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs text-zinc-200"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-zinc-300 block mb-1">
                      Link do Google Maps
                    </label>
                    <input
                      type="text"
                      value={sectionMapsUrl}
                      onChange={e => setSectionMapsUrl(e.target.value)}
                      placeholder="https://maps.google.com/..."
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs text-zinc-200"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-zinc-300 block mb-1">
                      Instagram Oficial
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={sectionInstagramHandle}
                        onChange={e => setSectionInstagramHandle(e.target.value)}
                        placeholder="@popidihamburgueria"
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs text-zinc-200"
                      />
                      <input
                        type="text"
                        value={sectionInstagramUrl}
                        onChange={e => setSectionInstagramUrl(e.target.value)}
                        placeholder="https://instagram.com/..."
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs text-zinc-200"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Seção 3: Valores de Entrega & Pagamento */}
              <div className="bg-zinc-950 p-5 rounded-2xl border border-zinc-800 space-y-4">
                <div className="flex items-center gap-2 border-b border-zinc-800 pb-2">
                  <DollarSign className="w-5 h-5 text-yellow-400" />
                  <h3 className="text-sm font-black text-white uppercase tracking-wider">
                    3. Valores de Entrega & Dados do PIX
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-bold text-zinc-300 block mb-1">
                      Taxa de Entrega Padrão (R$)
                    </label>
                    <input
                      type="text"
                      value={sectionDeliveryFee}
                      onChange={e => setSectionDeliveryFee(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs text-zinc-200"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-zinc-300 block mb-1">
                      Frete Grátis a Partir de (R$)
                    </label>
                    <input
                      type="text"
                      value={sectionFreeDeliveryMin}
                      onChange={e => setSectionFreeDeliveryMin(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs text-zinc-200"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-zinc-300 block mb-1">
                      Pedido Mínimo (R$)
                    </label>
                    <input
                      type="text"
                      value={sectionMinOrder}
                      onChange={e => setSectionMinOrder(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs text-zinc-200"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-zinc-300 block mb-1">
                      Chave PIX Oficial
                    </label>
                    <input
                      type="text"
                      value={sectionPixKey}
                      onChange={e => setSectionPixKey(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs text-zinc-200 font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-zinc-300 block mb-1">
                      Tipo de Chave PIX
                    </label>
                    <input
                      type="text"
                      value={sectionPixType}
                      onChange={e => setSectionPixType(e.target.value)}
                      placeholder="Telefone / CNPJ / CPF"
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs text-zinc-200"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-zinc-300 block mb-1">
                      Nome do Titular Recebedor
                    </label>
                    <input
                      type="text"
                      value={sectionPixReceiver}
                      onChange={e => setSectionPixReceiver(e.target.value)}
                      placeholder="PO-PI-DI Hamburgueria"
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs text-zinc-200"
                    />
                  </div>
                </div>
              </div>

              {/* Seção 4: Sobre Nós & História */}
              <div className="bg-zinc-950 p-5 rounded-2xl border border-zinc-800 space-y-4">
                <div className="flex items-center gap-2 border-b border-zinc-800 pb-2">
                  <Beer className="w-5 h-5 text-yellow-400" />
                  <h3 className="text-sm font-black text-white uppercase tracking-wider">
                    4. História & Apresentação "Sobre Nós"
                  </h3>
                </div>

                <div>
                  <label className="text-xs font-bold text-zinc-300 block mb-1">
                    Texto de Apresentação da Casa
                  </label>
                  <textarea
                    rows={3}
                    value={sectionAboutStory}
                    onChange={e => setSectionAboutStory(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs text-zinc-200 focus:outline-none focus:border-yellow-500"
                  />
                </div>
              </div>

              {/* Salvar Seções Button */}
              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-8 py-3.5 bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-500 hover:from-yellow-300 hover:to-amber-400 text-black font-black text-xs sm:text-sm rounded-xl flex items-center gap-2 shadow-lg shadow-yellow-500/20 transition-all cursor-pointer"
                >
                  {isSaving ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Salvando Informações...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 stroke-[3]" />
                      <span>Salvar Informações da Página (Tempo Real)</span>
                    </>
                  )}
                </button>
              </div>

            </form>
          )}

          {/* TAB 5: SEGURANÇA & RESTAURAÇÃO */}
          {activeTab === 'safety' && (
            <div className="max-w-2xl mx-auto space-y-5 text-left">
              <div className="bg-red-950/20 border border-red-800/60 p-6 rounded-3xl space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-red-500/20 text-red-400 flex items-center justify-center font-bold">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white uppercase tracking-tight">
                      Botão de Segurança: Recarregar Cardápio de Lanches Padrão Oficial
                    </h3>
                    <p className="text-xs text-zinc-400">
                      Restaura todos os smash burgers, burgers artesanais, porções, chopps e sobremesas oficiais.
                    </p>
                  </div>
                </div>

                <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-900 text-xs text-zinc-300 space-y-2">
                  <p>
                    Use esta ferramenta se você quiser restaurar instantaneamente todo o catálogo original de lanches completo, corrigindo eventuais exclusões acidentais.
                  </p>
                  <p className="text-amber-400 font-bold">
                    ✓ Inclui smash burgers suculentos (Pó Pi Di Smash, Double Bacon, Smash Salad), burgers artesanais de primeira (X-Tudo Campeão, Monster BBQ, Picanha Artesanal), porções de batata rústica, chopps artesanais e bebidas.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleRestoreDefaults}
                  disabled={isSaving}
                  className="w-full py-3.5 bg-red-600 hover:bg-red-500 text-white font-black text-xs sm:text-sm rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-red-950/50 transition-all cursor-pointer"
                >
                  <RefreshCw className={`w-4 h-4 ${isSaving ? 'animate-spin' : ''}`} />
                  <span>Recarregar Todos os Lanches e Itens Padrão Agora</span>
                </button>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
