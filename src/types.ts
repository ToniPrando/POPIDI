export type CategoryId = 
  | 'todos'
  | 'pasteis-salgados'
  | 'pasteis-doces'
  | 'smash'
  | 'artesanais'
  | 'monster-especiais'
  | 'porcoes'
  | 'choperia'
  | 'combos'
  | 'bebidas'
  | 'sobremesas'
  | (string & {});

export interface ExtraOption {
  id: string;
  name: string;
  price: number;
}

export interface CustomizationOptionGroup {
  id: string;
  title: string;
  type: 'single' | 'multiple';
  required?: boolean;
  max?: number;
  options: {
    id: string;
    name: string;
    price: number;
    description?: string;
  }[];
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  promotionalPrice?: number;
  category: CategoryId;
  image: string;
  badge?: 'Mais Vendido' | 'Novidade' | 'Destaque' | 'Chef Especial' | 'Promoção' | string;
  sizeTag?: string; // ex: '20cm', '30cm', '300ml', '500ml', 'Grande', 'Individual'
  ingredients: string[];
  customizationGroups?: CustomizationOptionGroup[];
  available: boolean;
  prepTimeMinutes?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface SelectedCustomization {
  groupId: string;
  groupTitle: string;
  selectedOptions: {
    id: string;
    name: string;
    price: number;
  }[];
}

export interface CartItem {
  cartItemId: string; // Unique hash including customizations
  menuItem: MenuItem;
  quantity: number;
  customizations: SelectedCustomization[];
  notes?: string;
  unitPrice: number; // base + extras
  totalPrice: number; // unitPrice * quantity
}

export type OrderType = 'delivery' | 'takeaway' | 'dine_in';

export type PaymentMethod = 'pix' | 'credit_card' | 'debit_card' | 'cash' | 'meal_voucher' | 'pickup_store';

export interface DeliveryAddress {
  cep?: string;
  street: string;
  number: string;
  neighborhood: string;
  complement?: string;
  reference?: string;
  city: string;
}

export interface CustomerInfo {
  name: string;
  phone: string;
  email?: string;
  cpf?: string;
}

export type OrderStatus = 
  | 'received'    // Pedido Recebido
  | 'preparing'   // Na Chapa / Em Preparo
  | 'out_for_delivery' // Saiu para Entrega (Delivery)
  | 'ready'       // Pronto para Retirada
  | 'completed'   // Entregue / Finalizado
  | 'cancelled';  // Cancelado

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  phone?: string;
  photoURL?: string;
  role: 'customer' | 'admin';
  loyaltyPoints?: number;
  loyaltyTier?: 'Bronze' | 'Prata' | 'Ouro' | 'VIP Master';
  defaultAddress?: DeliveryAddress;
  createdAt: string;
}

export interface LoyaltyReward {
  id: string;
  title: string;
  description: string;
  pointsCost: number;
  category: 'chopp' | 'porcao' | 'desconto' | 'burger' | 'combo';
  couponCode: string;
  minOrderValue?: number;
}

export interface Order {
  id: string;
  shortCode: string; // ex: #PO-4821
  userId?: string;
  userEmail?: string;
  customerEmail?: string;
  customerPhone?: string;
  createdAt: string; // ISO date
  status: OrderStatus;
  statusHistory: {
    status: OrderStatus;
    timestamp: string;
    note?: string;
  }[];
  orderType: OrderType;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  couponCode?: string;
  total: number;
  customer: CustomerInfo;
  deliveryAddress?: DeliveryAddress;
  tableNumber?: string;
  paymentMethod: PaymentMethod;
  cashChangeFor?: number;
  cardBrand?: string;
  generalNotes?: string;
  estimatedDeliveryTime?: string;
}

export interface NeighborhoodFee {
  neighborhood: string;
  fee: number;
  estimatedMinutes: string;
}

export interface StoreSettings {
  isOpen: boolean;
  forceClosedMessage?: string;
  openingHoursText: string;
  phoneWhatsApp: string;
  address: string;
  cityState: string;
  cep?: string;
  fullAddress?: string;
  instagramHandle: string;
  instagramUrl: string;
  googleMapsUrl?: string;
  pixKey: string;
  pixKeyType: string;
  pixReceiverName: string;
  pixCity: string;
  minimumOrderValue: number;
  freeDeliveryThreshold?: number;
  standardDeliveryFee: number;
  estimatedPrepTimeMin: number;
  estimatedPrepTimeMax: number;
  neighborhoodFees: NeighborhoodFee[];
  activeBannerAnnouncement?: string;
  adminPin?: string;
  adminPassword?: string;
  
  // Section Editable Content
  heroSpecialBadge?: string;
  heroHeadline?: string;
  heroSubheadline?: string;
  heroHighlightText?: string;
  aboutSectionTitle?: string;
  aboutSectionSubtitle?: string;
  aboutStoryText?: string;
  aboutCard1Title?: string;
  aboutCard1Text?: string;
  aboutCard2Title?: string;
  aboutCard2Text?: string;
  aboutCard3Title?: string;
  aboutCard3Text?: string;
  xtudoSpotlightTitle?: string;
  xtudoSpotlightDescription?: string;
}

export interface Coupon {
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderValue?: number;
  description: string;
}
