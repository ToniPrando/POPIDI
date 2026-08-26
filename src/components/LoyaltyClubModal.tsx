import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { loyaltyRewardsList, getLoyaltyTier } from '../data/loyaltyRewards';
import { LoyaltyReward } from '../types';
import confetti from 'canvas-confetti';
import { 
  X, 
  Award, 
  Crown, 
  Sparkles, 
  Beer, 
  Flame, 
  Check, 
  ArrowRight, 
  Gift, 
  Star, 
  ShieldCheck, 
  Copy,
  ChevronRight,
  UserCheck,
  LogIn
} from 'lucide-react';

interface LoyaltyClubModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoyaltyClubModal: React.FC<LoyaltyClubModalProps> = ({ isOpen, onClose }) => {
  const { user, profile, setIsAuthModalOpen, setAuthModalTab, redeemRewardPoints } = useAuth();
  const { applyCoupon, setIsCartOpen } = useCart();

  const [redeemedRewardId, setRedeemedRewardId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentPoints = profile?.loyaltyPoints ?? (user ? 50 : 0);
  const tierInfo = getLoyaltyTier(currentPoints);

  const handleClaimReward = async (reward: LoyaltyReward) => {
    setSuccessMessage(null);
    setErrorMessage(null);

    if (!user) {
      setAuthModalTab('register');
      setIsAuthModalOpen(true);
      return;
    }

    if (currentPoints < reward.pointsCost) {
      setErrorMessage(`Você precisa de ${reward.pointsCost} pontos para resgatar este item. Você tem ${currentPoints} pts.`);
      return;
    }

    const success = await redeemRewardPoints(reward.pointsCost);
    if (success) {
      setRedeemedRewardId(reward.id);
      applyCoupon(reward.couponCode);
      setSuccessMessage(`Parabéns! Você resgatou "${reward.title}". O cupom ${reward.couponCode} foi aplicado ao seu carrinho!`);

      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.5 },
        colors: ['#00ff66', '#f046f5', '#eab308', '#ffffff'],
      });
    } else {
      setErrorMessage('Não foi possível resgatar o prêmio. Verifique seu saldo de pontos.');
    }
  };

  const handleOpenLogin = () => {
    onClose();
    setAuthModalTab('login');
    setIsAuthModalOpen(true);
  };

  const handleOpenRegister = () => {
    onClose();
    setAuthModalTab('register');
    setIsAuthModalOpen(true);
  };

  // Progress to next tier
  const progressPercent = Math.min(100, Math.round((currentPoints / tierInfo.nextTierPoints) * 100));

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div 
        className="relative bg-[#0d0e17] border border-amber-500/40 w-full max-w-2xl rounded-3xl shadow-[0_0_50px_rgba(234,179,8,0.2)] overflow-hidden flex flex-col max-h-[90vh] text-left"
        onClick={e => e.stopPropagation()}
      >
        
        {/* Modal Top Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-[#181124] via-[#10101a] to-[#0d161d] border-b border-zinc-800/90 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 p-0.5 shadow-[0_0_20px_rgba(234,179,8,0.4)]">
              <div className="w-full h-full bg-[#0d0e17] rounded-[14px] flex items-center justify-center text-amber-400">
                <Crown className="w-6 h-6 stroke-[2.5]" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-black text-white uppercase tracking-tight">
                  Clube de Fidelidade PO-PI-DI
                </h3>
                <span className="text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/40 px-2 py-0.5 rounded-full">
                  VIP Club
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Peça seus burgers e chopps favoritos e troque pontos por prêmios reais!
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white rounded-xl bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-6">
          
          {/* USER POINTS & STATUS CARD */}
          {user ? (
            <div className="relative overflow-hidden p-5 bg-gradient-to-br from-zinc-900 via-zinc-900/90 to-zinc-950 rounded-2xl border border-amber-500/40 shadow-lg">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-zinc-400">Olá,</span>
                    <span className="text-sm font-black text-white">{profile?.name || user.displayName || 'Cliente Fiel'}</span>
                    <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-gradient-to-r ${tierInfo.badgeColor} shadow-sm`}>
                      Nível {tierInfo.tier}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400">
                    Você ganha <strong>1 Ponto</strong> a cada R$ 1,00 gasto no cardápio!
                  </p>
                </div>

                {/* Big Points Display */}
                <div className="bg-zinc-950/80 border border-amber-500/30 rounded-2xl px-5 py-3 text-center shrink-0 shadow-inner">
                  <span className="text-[10px] text-zinc-400 uppercase tracking-wider block font-bold">Saldo de Pontos</span>
                  <div className="flex items-center justify-center gap-1.5 text-2xl sm:text-3xl font-black text-amber-400">
                    <Star className="w-6 h-6 fill-amber-400 text-amber-400" />
                    <span>{currentPoints}</span>
                    <span className="text-xs font-bold text-zinc-400">pts</span>
                  </div>
                </div>
              </div>

              {/* Progress to Next Tier */}
              <div className="mt-4 pt-3 border-t border-zinc-800/80 space-y-1.5">
                <div className="flex justify-between text-xs text-zinc-400">
                  <span>Próximo nível: <strong className="text-amber-400">{tierInfo.nextTierPoints} pts</strong></span>
                  <span className="font-bold text-zinc-300">{progressPercent}%</span>
                </div>
                <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-amber-500 via-yellow-400 to-emerald-400 h-full rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(234,179,8,0.5)]"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Tier Perks */}
              <div className="mt-3 flex flex-wrap gap-1.5">
                {tierInfo.perks.map((perk, i) => (
                  <span key={i} className="text-[11px] bg-zinc-950/60 border border-zinc-800 text-zinc-300 px-2.5 py-0.5 rounded-md flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    {perk}
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-5 bg-gradient-to-r from-fuchsia-950/40 via-zinc-900 to-emerald-950/40 rounded-2xl border border-fuchsia-500/30 text-center space-y-3">
              <div className="inline-flex items-center gap-1.5 bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/40 text-xs font-black px-3 py-1 rounded-full uppercase tracking-wide">
                <Gift className="w-4 h-4 text-fuchsia-400" />
                Bônus de Boas-Vindas: 50 Pontos Grátis!
              </div>
              <h4 className="text-base font-black text-white">
                Cadastre-se agora e já comece com pontos para trocar por Chopp ou Descontos!
              </h4>
              <p className="text-xs text-zinc-400 max-w-md mx-auto">
                Crie sua conta em 1 clique com Google ou E-mail. Todos os seus pedidos acumulam pontos automaticamente.
              </p>
              <div className="flex justify-center gap-3 pt-1">
                <button
                  onClick={handleOpenLogin}
                  className="px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 font-bold text-xs rounded-xl border border-zinc-800 transition-colors"
                >
                  Já tenho conta
                </button>
                <button
                  onClick={handleOpenRegister}
                  className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-black font-black text-xs rounded-xl shadow-lg transition-transform hover:scale-105"
                >
                  Criar Conta & Ganhar 50 Pts
                </button>
              </div>
            </div>
          )}

          {/* Feedback messages */}
          {successMessage && (
            <div className="p-3.5 bg-emerald-950/60 border border-emerald-500/60 rounded-xl text-xs text-emerald-300 flex items-center justify-between animate-in fade-in">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{successMessage}</span>
              </div>
              <button
                onClick={() => {
                  onClose();
                  setIsCartOpen(true);
                }}
                className="bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs px-3 py-1.5 rounded-lg transition-colors ml-2 shrink-0"
              >
                Ir ao Carrinho
              </button>
            </div>
          )}

          {errorMessage && (
            <div className="p-3 bg-red-950/60 border border-red-800/60 rounded-xl text-xs text-red-300">
              {errorMessage}
            </div>
          )}

          {/* REWARDS CATALOG */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-amber-400" />
                Recompensas Disponíveis para Resgate
              </h4>
              <span className="text-[11px] text-zinc-500">
                Seus pontos não expiram
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {loyaltyRewardsList.map((reward) => {
                const canAfford = currentPoints >= reward.pointsCost;
                const isRedeemed = redeemedRewardId === reward.id;

                return (
                  <div
                    key={reward.id}
                    className={`p-4 rounded-2xl border transition-all flex flex-col justify-between space-y-3 ${
                      canAfford
                        ? 'bg-zinc-900/80 hover:bg-zinc-900 border-amber-500/40 shadow-sm'
                        : 'bg-zinc-950/60 border-zinc-800/80 opacity-75'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <div className="flex items-center gap-2">
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black ${
                            reward.category === 'chopp' 
                              ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/40'
                              : reward.category === 'burger'
                              ? 'bg-fuchsia-500/20 text-fuchsia-400 border border-fuchsia-500/40'
                              : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                          }`}>
                            {reward.category === 'chopp' && <Beer className="w-4 h-4" />}
                            {reward.category === 'burger' && <Flame className="w-4 h-4" />}
                            {reward.category === 'desconto' && <Gift className="w-4 h-4" />}
                            {reward.category === 'porcao' && <Sparkles className="w-4 h-4" />}
                            {reward.category === 'combo' && <Crown className="w-4 h-4" />}
                          </div>
                          <span className="text-xs font-black text-white">{reward.title}</span>
                        </div>

                        <span className="text-xs font-black text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-lg shrink-0">
                          {reward.pointsCost} pts
                        </span>
                      </div>

                      <p className="text-[11px] text-zinc-400 leading-snug">
                        {reward.description}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between">
                      <span className="text-[10px] text-zinc-500 font-mono">
                        Cupom: {reward.couponCode}
                      </span>

                      <button
                        onClick={() => handleClaimReward(reward)}
                        className={`text-xs font-black px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                          isRedeemed
                            ? 'bg-emerald-500 text-black shadow'
                            : canAfford
                            ? 'bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-black shadow-md hover:scale-102'
                            : 'bg-zinc-800 text-zinc-500 hover:text-zinc-300'
                        }`}
                      >
                        {isRedeemed ? (
                          <>
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                            <span>Aplicado!</span>
                          </>
                        ) : canAfford ? (
                          <>
                            <Gift className="w-3.5 h-3.5" />
                            <span>Resgatar</span>
                          </>
                        ) : (
                          <span>Faltam {reward.pointsCost - currentPoints} pts</span>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* HOW IT WORKS MINI RULES */}
          <div className="p-4 bg-zinc-950 rounded-2xl border border-zinc-800 space-y-2 text-xs text-zinc-400">
            <h5 className="font-black text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Regras Simples do Clube PO-PI-DI
            </h5>
            <ul className="space-y-1 text-[11px] list-disc list-inside">
              <li>Cada <strong>R$ 1,00</strong> pago em qualquer pedido equivale a <strong>1 ponto</strong> creditado.</li>
              <li>Novos clientes cadastrados recebem <strong>50 pontos de boas-vindas</strong> automaticamente.</li>
              <li>Os cupons de resgate podem ser utilizados no carrinho tanto para Delivery quanto Retirada.</li>
            </ul>
          </div>

        </div>

        {/* Modal Bottom Footer */}
        <div className="p-4 bg-[#0a0a0f] border-t border-zinc-800 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-bold text-xs rounded-xl border border-zinc-800 transition-colors"
          >
            Fechar
          </button>

          <button
            onClick={() => {
              onClose();
              const el = document.getElementById('cardapio');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-400 hover:to-green-400 text-black font-black text-xs rounded-xl shadow-lg transition-transform hover:scale-102 flex items-center gap-1.5"
          >
            <span>Fazer Pedido & Acumular Pontos</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
