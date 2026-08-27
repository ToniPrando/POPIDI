import { Order, StoreSettings } from '../types';

export function formatBRL(value: number | string | undefined | null): string {
  const num = typeof value === 'number' && !isNaN(value) ? value : Number(value) || 0;
  try {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(num);
  } catch {
    return `R$ ${num.toFixed(2).replace('.', ',')}`;
  }
}

export function formatDateTime(isoString: any): string {
  if (!isoString) return '--/--/---- --:--';
  try {
    let date: Date;
    if (typeof isoString === 'object' && isoString !== null) {
      if (typeof isoString.toDate === 'function') {
        date = isoString.toDate();
      } else if ('seconds' in isoString) {
        date = new Date(Number(isoString.seconds) * 1000);
      } else {
        date = new Date(String(isoString));
      }
    } else if (typeof isoString === 'number') {
      date = new Date(isoString);
    } else {
      date = new Date(String(isoString));
    }

    if (isNaN(date.getTime())) {
      return typeof isoString === 'string' ? isoString : '--/--/---- --:--';
    }

    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch {
    return typeof isoString === 'string' ? isoString : '--/--/---- --:--';
  }
}

export function formatPhoneNumber(val: string): string {
  const digits = val.replace(/\D/g, '');
  if (digits.length <= 10) {
    return digits.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3').trim();
  }
  return digits.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3').trim();
}

export function formatCEP(val: string): string {
  const digits = val.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
}

export interface ViaCepResult {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  erro?: boolean;
}

export async function fetchAddressByCep(cep: string): Promise<ViaCepResult | null> {
  const cleanCep = cep.replace(/\D/g, '');
  if (cleanCep.length !== 8) return null;
  
  try {
    const res = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
    if (!res.ok) return null;
    const data = await res.json();
    if (data.erro) return null;
    return data;
  } catch (error) {
    console.error('Erro ao buscar CEP:', error);
    return null;
  }
}

export function getPaymentMethodLabel(method: string): string {
  switch (method) {
    case 'pix':
      return '💠 PIX (Chave / QR Code)';
    case 'credit_card':
      return '💳 Cartão de Crédito (Maquininha na entrega)';
    case 'debit_card':
      return '💳 Cartão de Débito (Maquininha na entrega)';
    case 'cash':
      return '💵 Dinheiro';
    case 'pickup_store':
      return '🛍️ Retirar na Loja (Pagar no Balcão)';
    case 'meal_voucher':
      return '🛍️ Retirar na Loja';
    default:
      return method;
  }
}

export function buildWhatsAppOrderMessage(order: Order, settings: StoreSettings): string {
  let msg = `🍔 *NOVO PEDIDO - PÓ PI DI HAMBURGUERIA* 🍔\n`;
  msg += `*Código do Pedido:* ${order.shortCode}\n`;
  msg += `*Data/Hora:* ${formatDateTime(order.createdAt)}\n`;
  msg += `----------------------------------------\n`;
  msg += `👤 *DADOS DO CLIENTE*\n`;
  msg += `• Nome: ${order.customer.name}\n`;
  msg += `• WhatsApp: ${order.customer.phone}\n`;

  if (order.orderType === 'delivery') {
    msg += `\n🛵 *TIPO: ENTREGA (DELIVERY)*\n`;
    if (order.deliveryAddress) {
      if (order.deliveryAddress.cep) {
        msg += `• CEP: ${order.deliveryAddress.cep}\n`;
      }
      msg += `• Endereço: ${order.deliveryAddress.street}, Nº ${order.deliveryAddress.number}\n`;
      msg += `• Bairro: ${order.deliveryAddress.neighborhood}\n`;
      if (order.deliveryAddress.complement) {
        msg += `• Complemento: ${order.deliveryAddress.complement}\n`;
      }
      if (order.deliveryAddress.reference) {
        msg += `• Ref.: ${order.deliveryAddress.reference}\n`;
      }
      msg += `• Cidade: ${order.deliveryAddress.city}\n`;
    }
  } else if (order.orderType === 'takeaway') {
    msg += `\n🛍️ *TIPO: RETIRADA NO BALCÃO*\n`;
    msg += `• Local: ${settings.address} - ${settings.cityState}\n`;
  } else {
    msg += `\n🍽️ *TIPO: CONSUMO NO LOCAL*\n`;
    if (order.tableNumber) {
      msg += `• Mesa: ${order.tableNumber}\n`;
    }
  }

  msg += `----------------------------------------\n`;
  msg += `📋 *ITENS DO PEDIDO*\n\n`;

  order.items.forEach((item, index) => {
    msg += `*${item.quantity}x ${item.menuItem.name}* - ${formatBRL(item.totalPrice)}\n`;

    if (item.customizations && item.customizations.length > 0) {
      item.customizations.forEach(cGroup => {
        cGroup.selectedOptions.forEach(opt => {
          const optPriceText = opt.price > 0 ? ` (+${formatBRL(opt.price)})` : '';
          msg += `   └ ${cGroup.groupTitle}: ${opt.name}${optPriceText}\n`;
        });
      });
    }

    if (item.notes && item.notes.trim()) {
      msg += `   └ 📝 Obs: ${item.notes.trim()}\n`;
    }
    msg += `\n`;
  });

  msg += `----------------------------------------\n`;
  msg += `💰 *RESUMO DE VALORES*\n`;
  msg += `• Subtotal: ${formatBRL(order.subtotal)}\n`;
  if (order.orderType === 'delivery') {
    msg += `• Taxa de Entrega: ${order.deliveryFee > 0 ? formatBRL(order.deliveryFee) : 'GRÁTIS'}\n`;
  }
  if (order.discount > 0) {
    msg += `• Desconto (${order.couponCode || 'Cupom'}): -${formatBRL(order.discount)}\n`;
  }
  msg += `*TOTAL A PAGAR: ${formatBRL(order.total)}*\n`;

  msg += `----------------------------------------\n`;
  msg += `💳 *PAGAMENTO*\n`;
  msg += `• Forma: ${getPaymentMethodLabel(order.paymentMethod)}\n`;
  if (order.paymentMethod === 'cash') {
    if (order.cashChangeFor && order.cashChangeFor > order.total) {
      msg += `• Troco para: ${formatBRL(order.cashChangeFor)} (Troco: ${formatBRL(order.cashChangeFor - order.total)})\n`;
    } else {
      msg += `• Troco: Não precisa de troco (valor exato)\n`;
    }
  }

  if (order.generalNotes && order.generalNotes.trim()) {
    msg += `\n📝 *Observações Gerais:* ${order.generalNotes}\n`;
  }

  msg += `\n⏰ *Previsão Estimada:* ${order.estimatedDeliveryTime || '35-50 min'}\n`;
  msg += `Aguardando confirmação da hamburgueria! Obrigado! 🍔✨`;

  return msg;
}

export function getCleanWhatsAppNumber(phone?: string): string {
  if (!phone) return '5515997075641';
  let clean = phone.replace(/\D/g, '');
  if (clean.includes('3591022') || clean.includes('35910222034') || !clean) {
    return '5515997075641';
  }
  if (clean.length === 10 || clean.length === 11) {
    clean = `55${clean}`;
  }
  return clean;
}

export function openWhatsAppOrder(order: Order, settings: StoreSettings) {
  const message = buildWhatsAppOrderMessage(order, settings);
  const encoded = encodeURIComponent(message);
  const cleanPhone = getCleanWhatsAppNumber(settings.phoneWhatsApp);
  const url = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encoded}`;
  window.open(url, '_blank');
}

export function openWhatsAppReadyMessage(order: Order) {
  const cleanPhone = (order.customerPhone || order.customer?.phone || '').replace(/\D/g, '');
  if (!cleanPhone) return;
  const phoneWithDDI = cleanPhone.length <= 11 ? `55${cleanPhone}` : cleanPhone;
  const customerName = order.customer?.name || 'Cliente';
  const message = `Olá ${customerName}! Seu Pedido está Pronto! 🍔🍟✨ (Pedido #${order.shortCode})`;
  const encoded = encodeURIComponent(message);
  const url = `https://api.whatsapp.com/send?phone=${phoneWithDDI}&text=${encoded}`;
  window.open(url, '_blank');
}
