import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import {
  CartItem,
  MenuItem,
  Order,
  OrderType,
  PaymentMethod,
  DeliveryAddress,
  CustomerInfo,
  Coupon,
  StoreSettings,
  OrderStatus,
  CategoryId,
} from '../types';
import { useAuth } from './AuthContext';
import { initialMenuItems } from '../data/menuData';
import { initialStoreSettings, availableCoupons } from '../data/restaurantInfo';
import { db, auth } from '../lib/firebase';
import {
  saveOrderToFirestore,
  subscribeToOrders,
  subscribeToOrder,
  updateOrderStatusInFirestore,
  findOrderInFirestore,
  subscribeToStoreSettings,
  saveStoreSettingsToFirestore,
  creditUserLoyaltyPoints,
} from '../services/firebaseService';

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: MenuItem, quantity: number, customizations?: CartItem['customizations'], notes?: string) => void;
  updateQuantity: (cartItemId: string, delta: number) => void;
  removeFromCart: (cartItemId: string) => void;
  clearCart: () => void;
  cartCount: number;
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  
  // Coupon
  appliedCoupon: Coupon | null;
  applyCoupon: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;
  
  // Checkout & Order Form
  orderType: OrderType;
  setOrderType: (type: OrderType) => void;
  customerInfo: CustomerInfo;
  setCustomerInfo: React.Dispatch<React.SetStateAction<CustomerInfo>>;
  deliveryAddress: DeliveryAddress;
  setDeliveryAddress: React.Dispatch<React.SetStateAction<DeliveryAddress>>;
  paymentMethod: PaymentMethod;
  setPaymentMethod: (pm: PaymentMethod) => void;
  cashChangeFor: number | undefined;
  setCashChangeFor: (val: number | undefined) => void;
  generalNotes: string;
  setGeneralNotes: (notes: string) => void;
  
  // Orders & Tracking
  orders: Order[];
  activeOrder: Order | null;
  setActiveOrder: (order: Order | null) => void;
  searchAndTrackOrder: (searchTerm: string) => Promise<{ success: boolean; message: string; order?: Order }>;
  placeOrder: () => Promise<Order>;
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;
  reorder: (order: Order) => void;

  // Store & Menu Management
  storeSettings: StoreSettings;
  updateStoreSettings: (newSettings: Partial<StoreSettings>) => Promise<void>;
  menuItems: MenuItem[];
  toggleItemAvailability: (itemId: string) => void;

  // Category & Navigation
  activeCategory: CategoryId;
  setActiveCategory: (cat: CategoryId) => void;
  navigateToCategory: (cat: CategoryId) => void;

  // UI state
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  isOrderHistoryOpen: boolean;
  setIsOrderHistoryOpen: (open: boolean) => void;
  isOrderTrackerOpen: boolean;
  setIsOrderTrackerOpen: (open: boolean) => void;
  isLoyaltyOpen: boolean;
  setIsLoyaltyOpen: (open: boolean) => void;
  isAdminOpen: boolean;
  setIsAdminOpen: (open: boolean) => void;
  selectedProductForModal: MenuItem | null;
  setSelectedProductForModal: (item: MenuItem | null) => void;
  isStoreClosedModalOpen: boolean;
  setIsStoreClosedModalOpen: (open: boolean) => void;
  triggerStoreClosedNotice: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const LOCAL_STORAGE_CART_KEY = 'popidi_cart_v4';
const LOCAL_STORAGE_ORDERS_KEY = 'popidi_orders_v4';
const LOCAL_STORAGE_ACTIVE_ORDER_ID_KEY = 'popidi_active_order_id_v4';
const LOCAL_STORAGE_CUSTOMER_KEY = 'popidi_customer_v4';
const LOCAL_STORAGE_ADDRESS_KEY = 'popidi_address_v4';
const LOCAL_STORAGE_SETTINGS_KEY = 'popidi_settings_v4';
const LOCAL_STORAGE_MENU_KEY = 'popidi_menu_v4';

// Helper to play subtle kitchen bell sound on new orders
const playKitchenChime = () => {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc.frequency.setValueAtTime(880.00, ctx.currentTime + 0.15); // A5
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.6);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.6);
  } catch (e) {
    // Audio context may be restricted by browser policy before interaction
  }
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, profile, addLoyaltyPoints, setIsAuthModalOpen, setAuthModalTab } = useAuth();
  const initialMountRef = useRef(true);

  // Active menu category state and smooth navigation helper
  const [activeCategory, setActiveCategory] = useState<CategoryId>('todos');

  const navigateToCategory = (cat: CategoryId) => {
    setActiveCategory(cat);
    setTimeout(() => {
      const el = document.getElementById('cardapio') || document.getElementById('cardapio-section');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }, 60);
  };

  // Menu items state (allows in-memory / persisted toggle by admin)
  const [menuItems, setMenuItems] = useState<MenuItem[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_MENU_KEY);
      return saved ? JSON.parse(saved) : initialMenuItems;
    } catch {
      return initialMenuItems;
    }
  });

  // Store settings
  const [storeSettings, setStoreSettings] = useState<StoreSettings>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_SETTINGS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.phoneWhatsApp && (parsed.phoneWhatsApp.includes('3591022') || parsed.phoneWhatsApp.includes('35910222034'))) {
          parsed.phoneWhatsApp = initialStoreSettings.phoneWhatsApp;
          parsed.pixKey = initialStoreSettings.pixKey;
        }
        return { ...initialStoreSettings, ...parsed };
      }
      return initialStoreSettings;
    } catch {
      return initialStoreSettings;
    }
  });

  // Cart items
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_CART_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Orders list
  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_ORDERS_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Active tracked order
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);

  // Customer Info
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_CUSTOMER_KEY);
      return saved ? JSON.parse(saved) : { name: '', phone: '', cpf: '' };
    } catch {
      return { name: '', phone: '', cpf: '' };
    }
  });

  // Delivery Address
  const [deliveryAddress, setDeliveryAddress] = useState<DeliveryAddress>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_ADDRESS_KEY);
      return saved ? JSON.parse(saved) : {
        street: '',
        number: '',
        neighborhood: 'Centro',
        complement: '',
        reference: '',
        city: 'Porto Feliz - SP',
      };
    } catch {
      return {
        street: '',
        number: '',
        neighborhood: 'Centro',
        complement: '',
        reference: '',
        city: 'Porto Feliz - SP',
      };
    }
  });

  const [orderType, setOrderType] = useState<OrderType>('delivery');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pix');
  const [cashChangeFor, setCashChangeFor] = useState<number | undefined>(undefined);
  const [generalNotes, setGeneralNotes] = useState<string>('');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);

  // Modals UI
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isOrderHistoryOpen, setIsOrderHistoryOpen] = useState(false);
  const [isOrderTrackerOpen, setIsOrderTrackerOpen] = useState(false);
  const [isLoyaltyOpen, setIsLoyaltyOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [selectedProductForModal, setSelectedProductForModal] = useState<MenuItem | null>(null);
  const [isStoreClosedModalOpen, setIsStoreClosedModalOpen] = useState(false);

  const triggerStoreClosedNotice = () => {
    setIsStoreClosedModalOpen(true);
  };

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_CART_KEY, JSON.stringify(cart));
    } catch (e) {
      console.error(e);
    }
  }, [cart]);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_ORDERS_KEY, JSON.stringify(orders));
    } catch (e) {
      console.error(e);
    }
  }, [orders]);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_CUSTOMER_KEY, JSON.stringify(customerInfo));
    } catch (e) {
      console.error(e);
    }
  }, [customerInfo]);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_ADDRESS_KEY, JSON.stringify(deliveryAddress));
    } catch (e) {
      console.error(e);
    }
  }, [deliveryAddress]);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_SETTINGS_KEY, JSON.stringify(storeSettings));
    } catch (e) {
      console.error(e);
    }
  }, [storeSettings]);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_MENU_KEY, JSON.stringify(menuItems));
    } catch (e) {
      console.error(e);
    }
  }, [menuItems]);

  // Firestore Real-Time Listener for Orders across all devices
  useEffect(() => {
    const unsubscribe = subscribeToOrders((firestoreOrders) => {
      // Check if a new order arrived while app is open to trigger kitchen chime
      if (!initialMountRef.current && firestoreOrders.length > 0) {
        const latest = firestoreOrders[0];
        const isRecent = (Date.now() - new Date(latest.createdAt).getTime()) < 30000;
        if (latest.status === 'received' && isRecent) {
          playKitchenChime();
        }
      }
      initialMountRef.current = false;

      setOrders(firestoreOrders);

      // Update active order if it is in the list
      if (activeOrder) {
        const updatedActive = firestoreOrders.find(o => o.id === activeOrder.id);
        if (updatedActive) {
          setActiveOrder(updatedActive);
        }
      }
    });

    return () => unsubscribe();
  }, [activeOrder?.id]);

  // Dedicated real-time listener for the active tracked order (ensures instant status updates across any device)
  useEffect(() => {
    if (!activeOrder?.id) return;
    const unsub = subscribeToOrder(activeOrder.id, (remoteOrder) => {
      if (remoteOrder) {
        setActiveOrder(remoteOrder);
      }
    });

    return () => unsub();
  }, [activeOrder?.id]);

  // Check URL parameters for direct cross-device order tracking (?pedido=... or ?rastrear=...)
  useEffect(() => {
    const handleUrlTracking = async () => {
      try {
        if (typeof window === 'undefined') return;
        const params = new URLSearchParams(window.location.search);
        const codeParam = params.get('pedido') || params.get('rastrear') || params.get('order') || params.get('orderId');
        if (codeParam) {
          await searchAndTrackOrder(codeParam);
        } else {
          // Check saved active order from local storage
          const savedActiveId = localStorage.getItem(LOCAL_STORAGE_ACTIVE_ORDER_ID_KEY);
          if (savedActiveId && !activeOrder) {
            const foundLocally = orders.find(o => o.id === savedActiveId || o.shortCode === savedActiveId);
            if (foundLocally) {
              setActiveOrder(foundLocally);
            } else {
              const remote = await findOrderInFirestore(savedActiveId);
              if (remote) {
                setActiveOrder(remote);
              }
            }
          }
        }
      } catch (err) {
        console.warn('Error reading tracking URL:', err);
      }
    };

    handleUrlTracking();
  }, []);

  // Firestore Real-time listener for store settings
  useEffect(() => {
    const unsub = subscribeToStoreSettings((remoteSettings) => {
      if (remoteSettings) {
        setStoreSettings(prev => ({ ...prev, ...remoteSettings }));
      }
    });

    return () => unsub();
  }, []);

  // When authenticated user changes or orders update, auto-select ongoing order if not already tracking
  useEffect(() => {
    if ((user || profile) && !activeOrder && orders.length > 0) {
      const userOrders = orders.filter(o => {
        const email = o.userEmail || o.customerEmail || o.customer?.email;
        const targetEmail = user?.email || profile?.email;
        const matchesEmail = Boolean(targetEmail && email && email.toLowerCase() === targetEmail.toLowerCase());
        const targetUid = user?.uid || profile?.uid;
        const matchesUid = Boolean(targetUid && o.userId && o.userId === targetUid);
        const targetPhone = profile?.phone ? profile.phone.replace(/\D/g, '') : '';
        const orderPhone = (o.customerPhone || o.customer?.phone || '').replace(/\D/g, '');
        const matchesPhone = Boolean(targetPhone && orderPhone && orderPhone === targetPhone);
        return matchesEmail || matchesUid || matchesPhone;
      });
      const ongoing = userOrders.find(o => o.status !== 'completed' && o.status !== 'cancelled');
      if (ongoing) {
        setActiveOrder(ongoing);
      }
    }
  }, [orders, activeOrder, user, profile]);

  // Method to search and track an order across devices by short code, ID, phone, or email
  const searchAndTrackOrder = async (searchTerm: string): Promise<{ success: boolean; message: string; order?: Order }> => {
    const raw = searchTerm.trim();
    if (!raw) {
      return { success: false, message: 'Digite um código de pedido ou número de telefone.' };
    }

    const cleanCode = raw.toUpperCase();
    const cleanNumbers = raw.replace(/\D/g, '');

    // 1. Search in local in-memory orders list first
    const foundInMemory = orders.find(o => {
      const matchesId = o.id.toLowerCase() === raw.toLowerCase();
      const matchesShort = o.shortCode.toUpperCase() === cleanCode || 
                           o.shortCode.replace('#', '').toUpperCase() === cleanCode.replace('#', '');
      const matchesPhone = cleanNumbers.length >= 8 && Boolean(
        (o.customerPhone && o.customerPhone.replace(/\D/g, '').includes(cleanNumbers)) ||
        (o.customer?.phone && o.customer.phone.replace(/\D/g, '').includes(cleanNumbers))
      );
      const matchesEmail = raw.includes('@') && Boolean(
        (o.userEmail && o.userEmail.toLowerCase() === raw.toLowerCase()) ||
        (o.customerEmail && o.customerEmail.toLowerCase() === raw.toLowerCase())
      );
      return matchesId || matchesShort || matchesPhone || matchesEmail;
    });

    if (foundInMemory) {
      setActiveOrder(foundInMemory);
      setIsOrderTrackerOpen(true);
      try {
        localStorage.setItem(LOCAL_STORAGE_ACTIVE_ORDER_ID_KEY, foundInMemory.id);
      } catch (e) {}
      return { success: true, message: `Pedido ${foundInMemory.shortCode} localizado!`, order: foundInMemory };
    }

    // 2. Query Firestore directly
    try {
      const remote = await findOrderInFirestore(raw);
      if (remote) {
        setActiveOrder(remote);
        setOrders(prev => [remote, ...prev.filter(o => o.id !== remote.id)]);
        setIsOrderTrackerOpen(true);
        try { localStorage.setItem(LOCAL_STORAGE_ACTIVE_ORDER_ID_KEY, remote.id); } catch (e) {}
        return { success: true, message: `Pedido ${remote.shortCode} localizado!`, order: remote };
      }

      return { success: false, message: `Nenhum pedido encontrado para "${raw}". Verifique o código e tente novamente.` };
    } catch (err: any) {
      console.error('Error querying Firestore for order:', err);
      return { success: false, message: 'Erro ao buscar pedido nos servidores. Tente novamente.' };
    }
  };

  const addToCart = (
    item: MenuItem,
    quantity: number,
    customizations: CartItem['customizations'] = [],
    notes: string = ''
  ) => {
    // If establishment is closed, prevent adding to cart and show closed notice
    if (storeSettings.isOpen === false) {
      setIsStoreClosedModalOpen(true);
      return;
    }

    const basePrice = item.promotionalPrice ?? item.price;
    const extrasTotal = customizations.reduce((sum, group) => {
      return sum + group.selectedOptions.reduce((gSum, opt) => gSum + opt.price, 0);
    }, 0);

    const unitPrice = basePrice + extrasTotal;
    const customKey = customizations
      .flatMap(g => g.selectedOptions.map(o => o.id))
      .sort()
      .join('-');
    const cartItemId = `${item.id}-${customKey}-${notes.trim()}`;

    setCart(prev => {
      const existingIdx = prev.findIndex(ci => ci.cartItemId === cartItemId);
      if (existingIdx >= 0) {
        const updated = [...prev];
        const newQty = updated[existingIdx].quantity + quantity;
        updated[existingIdx] = {
          ...updated[existingIdx],
          quantity: newQty,
          totalPrice: newQty * updated[existingIdx].unitPrice,
        };
        return updated;
      } else {
        return [
          ...prev,
          {
            cartItemId,
            menuItem: item,
            quantity,
            customizations,
            notes,
            unitPrice,
            totalPrice: unitPrice * quantity,
          },
        ];
      }
    });
  };

  const updateQuantity = (cartItemId: string, delta: number) => {
    setCart(prev => {
      return prev
        .map(item => {
          if (item.cartItemId === cartItemId) {
            const newQty = item.quantity + delta;
            if (newQty <= 0) return null;
            return {
              ...item,
              quantity: newQty,
              totalPrice: newQty * item.unitPrice,
            };
          }
          return item;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  const removeFromCart = (cartItemId: string) => {
    setCart(prev => prev.filter(item => item.cartItemId !== cartItemId));
  };

  const clearCart = () => {
    setCart([]);
    setAppliedCoupon(null);
  };

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  const subtotal = cart.reduce((total, item) => total + item.totalPrice, 0);

  // Delivery fee calculation
  let deliveryFee = 0;
  if (orderType === 'delivery') {
    if (storeSettings.freeDeliveryThreshold && subtotal >= storeSettings.freeDeliveryThreshold) {
      deliveryFee = 0;
    } else {
      const matched = storeSettings.neighborhoodFees.find(
        n => n.neighborhood.toLowerCase() === (deliveryAddress.neighborhood || '').toLowerCase()
      );
      deliveryFee = matched ? matched.fee : storeSettings.standardDeliveryFee;
    }
  }

  // Discount calculation
  let discount = 0;
  if (appliedCoupon) {
    if (!appliedCoupon.minOrderValue || subtotal >= appliedCoupon.minOrderValue) {
      if (appliedCoupon.discountType === 'percentage') {
        discount = (subtotal * appliedCoupon.discountValue) / 100;
      } else {
        discount = appliedCoupon.discountValue;
      }
    }
  }
  discount = Math.min(discount, subtotal);

  const total = Math.max(0, subtotal + deliveryFee - discount);

  const applyCoupon = (code: string): { success: boolean; message: string } => {
    const cleaned = code.trim().toUpperCase();
    const found = availableCoupons.find(c => c.code.toUpperCase() === cleaned);
    if (!found) {
      return { success: false, message: 'Cupom inválido ou expirado.' };
    }
    if (found.minOrderValue && subtotal < found.minOrderValue) {
      return {
        success: false,
        message: `Este cupom requer pedido mínimo de R$ ${found.minOrderValue.toFixed(2).replace('.', ',')}.`,
      };
    }
    setAppliedCoupon(found);
    return { success: true, message: `Cupom ${found.code} aplicado com sucesso!` };
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  const placeOrder = async (): Promise<Order> => {
    if (storeSettings.isOpen === false) {
      setIsStoreClosedModalOpen(true);
      throw new Error('Estabelecimento Fechado! Não estamos aceitando pedidos no momento.');
    }

    const shortCode = `#PO-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date().toISOString();
    
    // Resolve user ID from profile, auth, or phone
    const resolvedUid = profile?.uid || user?.uid || (customerInfo.phone ? `cust_${customerInfo.phone.replace(/\D/g, '')}` : undefined);
    const resolvedEmail = user?.email || profile?.email || customerInfo.email || undefined;
    const resolvedPhone = customerInfo.phone || profile?.phone || undefined;
    const resolvedName = customerInfo.name.trim() || profile?.name || user?.displayName || 'Cliente Pó Pi Di';

    const neighborhoodObj = storeSettings.neighborhoodFees.find(
      n => n.neighborhood.toLowerCase() === (deliveryAddress.neighborhood || '').toLowerCase()
    );
    const estimatedDeliveryTime = orderType === 'delivery' 
      ? (neighborhoodObj?.estimatedMinutes || `${storeSettings.estimatedPrepTimeMin}-${storeSettings.estimatedPrepTimeMax} min`)
      : '20-30 min para retirada';

    const orderId = `ord_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    const newOrder: Order = {
      id: orderId,
      shortCode,
      userId: resolvedUid,
      userEmail: resolvedEmail,
      customerEmail: resolvedEmail,
      customerPhone: resolvedPhone,
      createdAt: now,
      status: 'received',
      statusHistory: [
        {
          status: 'received',
          timestamp: now,
          note: 'Pedido recebido pelo sistema da Pó Pi Di Hamburgueria.',
        },
      ],
      orderType,
      items: [...cart],
      subtotal,
      deliveryFee,
      discount,
      couponCode: appliedCoupon?.code,
      total,
      customer: {
        name: resolvedName,
        phone: resolvedPhone || '',
        email: resolvedEmail || '',
      },
      deliveryAddress: orderType === 'delivery' ? { ...deliveryAddress } : undefined,
      paymentMethod,
      cashChangeFor: paymentMethod === 'cash' ? cashChangeFor : undefined,
      generalNotes,
      estimatedDeliveryTime,
    };

    // Save to Firestore Database in real-time across all devices
    try {
      await saveOrderToFirestore(newOrder);

      // If user profile is logged in, credit points in Firestore and local state
      const pointsEarned = Math.floor(newOrder.total);
      if (resolvedUid) {
        await creditUserLoyaltyPoints(resolvedUid, pointsEarned).catch(() => {});
      }
      if (profile?.uid) {
        addLoyaltyPoints(pointsEarned).catch(() => {});
      }
    } catch (err) {
      console.warn('Could not save order directly to Firestore, saving locally:', err);
    }

    setOrders(prev => [newOrder, ...prev.filter(o => o.id !== newOrder.id)]);
    setActiveOrder(newOrder);
    try {
      localStorage.setItem(LOCAL_STORAGE_ACTIVE_ORDER_ID_KEY, newOrder.id);
      const existingIds = JSON.parse(localStorage.getItem('popidi_placed_order_ids') || '[]');
      if (!existingIds.includes(newOrder.id)) {
        localStorage.setItem('popidi_placed_order_ids', JSON.stringify([newOrder.id, ...existingIds]));
      }
    } catch (e) {}
    clearCart();

    return newOrder;
  };

  const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    const timestamp = new Date().toISOString();
    const note = getStatusDescription(status);

    // Update locally first for instant snappy response
    setOrders(prev =>
      prev.map(ord => {
        if (ord.id === orderId) {
          const updatedHistory = [
            ...ord.statusHistory,
            {
              status,
              timestamp,
              note,
            },
          ];
          const updated = {
            ...ord,
            status,
            statusHistory: updatedHistory,
          };
          if (activeOrder?.id === orderId) {
            setActiveOrder(updated);
          }
          return updated;
        }
        return ord;
      })
    );

    // Sync status change to Firestore
    try {
      await updateOrderStatusInFirestore(orderId, status, note);
    } catch (e) {
      console.warn('Error syncing order status update to Firestore:', e);
    }
  };

  const reorder = (order: Order) => {
    if (!order || !Array.isArray(order.items)) return;
    order.items.forEach(it => {
      if (!it) return;
      if (it.menuItem) {
        addToCart(
          it.menuItem,
          Number(it.quantity) || 1,
          Array.isArray(it.customizations) ? it.customizations : [],
          typeof it.notes === 'string' ? it.notes : ''
        );
      } else {
        const found = menuItems.find(m => m.id === (it as any).id || m.id === (it as any).menuItemId || m.name === (it as any).name);
        if (found) {
          addToCart(
            found,
            Number(it.quantity) || 1,
            Array.isArray(it.customizations) ? it.customizations : [],
            typeof it.notes === 'string' ? it.notes : ''
          );
        }
      }
    });
    setIsOrderHistoryOpen(false);
    setIsCartOpen(true);
  };

  const updateStoreSettings = async (newSettings: Partial<StoreSettings>) => {
    setStoreSettings(prev => ({ ...prev, ...newSettings }));
    try {
      await saveStoreSettingsToFirestore(newSettings);
    } catch (err) {
      console.warn('Error saving store settings to Firestore:', err);
    }
  };

  const toggleItemAvailability = (itemId: string) => {
    setMenuItems(prev =>
      prev.map(item => (item.id === itemId ? { ...item, available: !item.available } : item))
    );
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        cartCount,
        subtotal,
        deliveryFee,
        discount,
        total,
        appliedCoupon,
        applyCoupon,
        removeCoupon,
        orderType,
        setOrderType,
        customerInfo,
        setCustomerInfo,
        deliveryAddress,
        setDeliveryAddress,
        paymentMethod,
        setPaymentMethod,
        cashChangeFor,
        setCashChangeFor,
        generalNotes,
        setGeneralNotes,
        orders,
        activeOrder,
        setActiveOrder,
        searchAndTrackOrder,
        placeOrder,
        updateOrderStatus,
        reorder,
        storeSettings,
        updateStoreSettings,
        menuItems,
        toggleItemAvailability,
        activeCategory,
        setActiveCategory,
        navigateToCategory,
        isCartOpen,
        setIsCartOpen,
        isOrderHistoryOpen,
        setIsOrderHistoryOpen,
        isOrderTrackerOpen,
        setIsOrderTrackerOpen,
        isLoyaltyOpen,
        setIsLoyaltyOpen,
        isAdminOpen,
        setIsAdminOpen,
        selectedProductForModal,
        setSelectedProductForModal,
        isStoreClosedModalOpen,
        setIsStoreClosedModalOpen,
        triggerStoreClosedNotice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

function getStatusDescription(status: OrderStatus): string {
  switch (status) {
    case 'received':
      return 'Pedido recebido e confirmado na cozinha.';
    case 'preparing':
      return 'Seu burger artesanal está na chapa sendo preparado com capricho!';
    case 'out_for_delivery':
      return 'Pedido embalado com cuidado e saiu para entrega com o motoboy!';
    case 'ready':
      return 'Pedido pronto e quentinho aguardando retirada no balcão.';
    case 'completed':
      return 'Pedido entregue com sucesso. Bom apetite!';
    case 'cancelled':
      return 'Pedido cancelado.';
    default:
      return '';
  }
}
