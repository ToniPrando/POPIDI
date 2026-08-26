import { LoyaltyReward } from '../types';

export const loyaltyRewardsList: LoyaltyReward[] = [
  {
    id: 'reward-chopp-300',
    title: 'Chopp Artesanal 300ml Trincando',
    description: 'Um copo de Chopp Pilsen artesanal super gelado no seu pedido.',
    pointsCost: 50,
    category: 'chopp',
    couponCode: 'CHOPP50PTS',
    minOrderValue: 20,
  },
  {
    id: 'reward-batata-cheddar',
    title: 'Batata Rústica c/ Cheddar & Bacon',
    description: 'Porção crocante de batatas rústicas com creme de cheddar artesanal.',
    pointsCost: 100,
    category: 'porcao',
    couponCode: 'BATATA100PTS',
    minOrderValue: 30,
  },
  {
    id: 'reward-desconto-25',
    title: 'Vale Desconto de R$ 25,00',
    description: 'R$ 25 de desconto imediato em qualquer pedido de burgers ou chopps.',
    pointsCost: 150,
    category: 'desconto',
    couponCode: 'DESC25PTS',
    minOrderValue: 40,
  },
  {
    id: 'reward-xtudo-famoso',
    title: 'O Famoso X-Tudo Especial Grátis',
    description: 'O ícone supremo da casa com 2 hambúrgueres artesanais, queijo prato, bacon e ovo.',
    pointsCost: 250,
    category: 'burger',
    couponCode: 'XTUDO250PTS',
    minOrderValue: 35,
  },
  {
    id: 'reward-combo-vip',
    title: 'Combo VIP: Smash Duplo + Chopp 500ml',
    description: 'Smash Duplo Artesanal com batata frita e caneco de chopp artesanal 500ml.',
    pointsCost: 350,
    category: 'combo',
    couponCode: 'VIPCOMBO350',
    minOrderValue: 40,
  },
];

export function getLoyaltyTier(points: number): {
  tier: 'Bronze' | 'Prata' | 'Ouro' | 'VIP Master';
  badgeColor: string;
  nextTierPoints: number;
  perks: string[];
} {
  if (points >= 500) {
    return {
      tier: 'VIP Master',
      badgeColor: 'from-amber-400 to-yellow-500 text-black',
      nextTierPoints: 1000,
      perks: ['1.5x Pontos por Pedido', 'Prioridade na Chapa & Delivery', 'Chopp Cortesia no Aniversário'],
    };
  }
  if (points >= 250) {
    return {
      tier: 'Ouro',
      badgeColor: 'from-yellow-400 to-amber-500 text-black',
      nextTierPoints: 500,
      perks: ['1.3x Pontos por Pedido', 'Acesso antecipado a Burgers Especiais', 'Descontos Exclusivos'],
    };
  }
  if (points >= 100) {
    return {
      tier: 'Prata',
      badgeColor: 'from-zinc-300 to-zinc-400 text-black',
      nextTierPoints: 250,
      perks: ['1.1x Pontos por Pedido', 'Cupons Especiais no WhatsApp'],
    };
  }
  return {
    tier: 'Bronze',
    badgeColor: 'from-amber-700 to-amber-800 text-white',
    nextTierPoints: 100,
    perks: ['R$ 1 gasto = 1 Ponto de Fidelidade', 'Bônus de Boas-Vindas de 50 Pontos'],
  };
}
