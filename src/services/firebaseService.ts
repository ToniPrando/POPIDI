import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs,
  updateDoc, 
  onSnapshot, 
  query, 
  where, 
  limit, 
  serverTimestamp,
  Unsubscribe
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Order, OrderStatus, StoreSettings } from '../types';

/**
 * Sanitizes an object by recursively removing all `undefined` fields.
 * Firestore throws a runtime exception if any field is `undefined`.
 */
export function sanitizeForFirestore<T>(obj: T): T {
  if (obj === null || obj === undefined) {
    return null as any;
  }
  if (Array.isArray(obj)) {
    return obj.map(sanitizeForFirestore) as any;
  }
  if (typeof obj === 'object') {
    const cleaned: any = {};
    for (const [key, value] of Object.entries(obj as any)) {
      if (value !== undefined) {
        cleaned[key] = sanitizeForFirestore(value);
      }
    }
    return cleaned;
  }
  return obj;
}

/**
 * Saves a new or existing order to Firestore in real-time.
 * Propagates immediately to all connected devices (Client & Kitchen/Admin).
 */
export async function saveOrderToFirestore(order: Order): Promise<void> {
  const sanitized = sanitizeForFirestore({
    ...order,
    updatedAt: new Date().toISOString(),
    serverTimestamp: serverTimestamp(),
  });

  const orderRef = doc(db, 'orders', order.id);
  await setDoc(orderRef, sanitized, { merge: true });

  // If order belongs to an authenticated user, also mirror under their user history
  const userId = order.userId || (order as any).userUid;
  if (userId) {
    try {
      const userOrderRef = doc(db, 'users', userId, 'orders', order.id);
      await setDoc(userOrderRef, sanitized, { merge: true });
    } catch (e) {
      console.warn('Could not mirror order in user subcollection:', e);
    }
  }
}

/**
 * Real-time listener for all orders in the restaurant.
 * Kitchen/Admin uses this to receive incoming orders instantly.
 */
export function subscribeToOrders(onUpdate: (orders: Order[]) => void, onError?: (err: Error) => void): Unsubscribe {
  const ordersCol = collection(db, 'orders');

  return onSnapshot(
    ordersCol,
    (snapshot) => {
      const list: Order[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as Order;
        list.push({
          ...data,
          id: docSnap.id,
        });
      });

      // Sort by creation date descending (newest first)
      list.sort((a, b) => {
        const tA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const tB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return tB - tA;
      });

      onUpdate(list);
    },
    (error) => {
      console.error('Firestore subscribeToOrders error:', error);
      if (onError) onError(error);
    }
  );
}

/**
 * Real-time listener for a single order (used by client tracking screen).
 */
export function subscribeToOrder(
  orderId: string, 
  onUpdate: (order: Order | null) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const orderRef = doc(db, 'orders', orderId);

  return onSnapshot(
    orderRef,
    (docSnap) => {
      if (docSnap.exists()) {
        onUpdate({
          ...(docSnap.data() as Order),
          id: docSnap.id,
        });
      } else {
        onUpdate(null);
      }
    },
    (error) => {
      console.error(`Firestore subscribeToOrder (${orderId}) error:`, error);
      if (onError) onError(error);
    }
  );
}

/**
 * Updates order status in Firestore and appends status history.
 * Both Admin and Client will reflect the update instantly.
 */
export async function updateOrderStatusInFirestore(
  orderId: string, 
  newStatus: OrderStatus, 
  note?: string
): Promise<void> {
  const orderRef = doc(db, 'orders', orderId);
  const snap = await getDoc(orderRef);

  const timestamp = new Date().toISOString();
  const defaultNote = note || (
    newStatus === 'received' ? 'Pedido recebido pelo sistema.' :
    newStatus === 'preparing' ? 'Pedido em preparação na chapa da cozinha.' :
    newStatus === 'out_for_delivery' ? 'Pedido saiu para entrega com o motoboy.' :
    newStatus === 'completed' ? 'Pedido finalizado e entregue com sucesso!' :
    'Pedido cancelado.'
  );

  let newHistory: any[] = [];

  if (snap.exists()) {
    const currentData = snap.data() as Order;
    newHistory = Array.isArray(currentData.statusHistory) ? [...currentData.statusHistory] : [];
  }

  newHistory.push({
    status: newStatus,
    timestamp,
    note: defaultNote,
  });

  const payload = sanitizeForFirestore({
    status: newStatus,
    statusHistory: newHistory,
    updatedAt: timestamp,
    serverUpdatedAt: serverTimestamp(),
  });

  await updateDoc(orderRef, payload);
}

/**
 * Searches for an order across Firestore by shortCode (#PO-XXXX), phone, email, or order ID.
 */
export async function findOrderInFirestore(term: string): Promise<Order | null> {
  const raw = term.trim();
  if (!raw) return null;

  const cleanCode = raw.toUpperCase();
  const cleanNumbers = raw.replace(/\D/g, '');

  // 1. Direct ID match
  try {
    const directSnap = await getDoc(doc(db, 'orders', raw));
    if (directSnap.exists()) {
      return { ...(directSnap.data() as Order), id: directSnap.id };
    }
  } catch (e) {}

  // 2. Query by shortCode (#PO-XXXX or PO-XXXX)
  try {
    const formatted = cleanCode.startsWith('#') ? cleanCode : `#${cleanCode}`;
    const codeQuery = query(collection(db, 'orders'), where('shortCode', '==', formatted), limit(1));
    const codeSnap = await getDocs(codeQuery);
    if (!codeSnap.empty) {
      const docSnap = codeSnap.docs[0];
      return { ...(docSnap.data() as Order), id: docSnap.id };
    }
  } catch (e) {}

  // 3. Query by customer phone
  if (cleanNumbers.length >= 8) {
    try {
      const phoneQuery = query(collection(db, 'orders'), where('customerPhone', '==', cleanNumbers), limit(1));
      const phoneSnap = await getDocs(phoneQuery);
      if (!phoneSnap.empty) {
        const docSnap = phoneSnap.docs[0];
        return { ...(docSnap.data() as Order), id: docSnap.id };
      }
    } catch (e) {}
  }

  // 4. Scan recent 50 orders
  try {
    const recentQuery = query(collection(db, 'orders'), limit(50));
    const recentSnap = await getDocs(recentQuery);
    for (const d of recentSnap.docs) {
      const ord = { ...(d.data() as Order), id: d.id };
      if (
        ord.shortCode?.toUpperCase().includes(cleanCode.replace('#', '')) ||
        (cleanNumbers.length >= 8 && ord.customerPhone?.replace(/\D/g, '').includes(cleanNumbers)) ||
        (cleanNumbers.length >= 8 && ord.customer?.phone?.replace(/\D/g, '').includes(cleanNumbers))
      ) {
        return ord;
      }
    }
  } catch (e) {}

  return null;
}

/**
 * Subscribes to store settings (Opening hours, prep time, delivery fee, admin PIN).
 */
export function subscribeToStoreSettings(onUpdate: (settings: StoreSettings) => void): Unsubscribe {
  const docRef = doc(db, 'store_settings', 'main_config');
  return onSnapshot(docRef, (docSnap) => {
    if (docSnap.exists()) {
      onUpdate(docSnap.data() as StoreSettings);
    }
  });
}

/**
 * Adds loyalty points to a user's account in Firestore.
 */
export async function creditUserLoyaltyPoints(userId: string, points: number): Promise<void> {
  try {
    const userDocRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userDocRef);
    if (userSnap.exists()) {
      const currentPts = userSnap.data().loyaltyPoints || 50;
      await updateDoc(userDocRef, {
        loyaltyPoints: currentPts + points,
        updatedAt: serverTimestamp(),
      });
    }
  } catch (e) {
    console.warn('Error updating loyalty points in Firestore:', e);
  }
}

/**
 * Saves updated store settings to Firestore.
 */
export async function saveStoreSettingsToFirestore(settings: Partial<StoreSettings>): Promise<void> {
  const docRef = doc(db, 'store_settings', 'main_config');
  const payload = sanitizeForFirestore({
    ...settings,
    updatedAt: new Date().toISOString(),
  });
  await setDoc(docRef, payload, { merge: true });
}

