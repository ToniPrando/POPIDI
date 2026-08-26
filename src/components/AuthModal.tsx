import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { getLoyaltyTier } from '../data/loyaltyRewards';
import { 
  X, 
  Mail, 
  Lock, 
  User, 
  Phone, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  ArrowRight,
  ShieldCheck,
  Eye,
  EyeOff,
  Crown,
  Gift,
  Star,
  Award
} from 'lucide-react';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    setIsAuthModalOpen,
    authModalTab,
    setAuthModalTab,
    signInWithGoogle,
    loginWithEmail,
    registerWithEmail,
    resetPassword,
    setIsAdminLoginOpen,
    user,
    profile,
    logout
  } = useAuth();

  const { setIsLoyaltyOpen } = useCart();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isForgotPass, setIsForgotPass] = useState(false);

  if (!isAuthModalOpen) return null;

  const currentLoyaltyPoints = profile?.loyaltyPoints ?? (user ? 50 : 0);
  const tierInfo = getLoyaltyTier(currentLoyaltyPoints);

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setName('');
    setPhone('');
    setErrorMsg('');
    setSuccessMsg('');
    setIsForgotPass(false);
  };

  const handleClose = () => {
    resetForm();
    setIsAuthModalOpen(false);
  };

  const handleGoogleLogin = async () => {
    setErrorMsg('');
    setIsSubmitting(true);
    try {
      await signInWithGoogle();
      handleClose();
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/popup-closed-by-user') {
        setErrorMsg('Login com Google cancelado.');
      } else {
        setErrorMsg('Erro ao conectar com Google. Tente novamente ou use e-mail.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const isValidEmail = (emailStr: string): boolean => {
    return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(emailStr.trim());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!isValidEmail(email)) {
      setErrorMsg('Por favor, informe um e-mail válido com "@", domínio e extensão (ex: usuario@dominio.com).');
      return;
    }

    if (isForgotPass) {
      setIsSubmitting(true);
      try {
        await resetPassword(email.trim());
        setSuccessMsg('Link de redefinição de senha enviado para seu e-mail!');
        setIsSubmitting(false);
      } catch (err: any) {
        setErrorMsg('Não encontramos uma conta com este e-mail.');
        setIsSubmitting(false);
      }
      return;
    }

    if (authModalTab === 'login') {
      if (!password) {
        setErrorMsg('Preencha sua senha.');
        return;
      }
      setIsSubmitting(true);
      try {
        await loginWithEmail(email.trim(), password);
        handleClose();
      } catch (err: any) {
        if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
          setErrorMsg('E-mail ou senha incorretos.');
        } else if (err.code === 'auth/too-many-requests') {
          setErrorMsg('Muitas tentativas. Aguarde alguns instantes.');
        } else {
          setErrorMsg('Erro ao realizar login. Verifique seus dados.');
        }
      } finally {
        setIsSubmitting(false);
      }
    } else {
      // Register
      if (!name.trim()) {
        setErrorMsg('Informe seu nome completo.');
        return;
      }
      if (phone && phone.length < 10) {
        setErrorMsg('O telefone deve conter apenas números com DDD (ex: 15997075641).');
        return;
      }
      if (password.length < 6) {
        setErrorMsg('A senha deve conter no mínimo 6 caracteres.');
        return;
      }
      setIsSubmitting(true);
      try {
        await registerWithEmail(name.trim(), email.trim(), password, phone.trim());
        handleClose();
      } catch (err: any) {
        if (err.code === 'auth/email-already-in-use') {
          setErrorMsg('Este e-mail já está cadastrado. Faça login ou recupere a senha.');
        } else if (err.code === 'auth/weak-password') {
          setErrorMsg('Senha muito fraca. Utilize letras e números.');
        } else {
          setErrorMsg('Erro ao criar conta. Tente novamente.');
        }
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#0d0e14] border border-fuchsia-500/40 rounded-3xl shadow-[0_0_40px_rgba(240,70,245,0.25)] overflow-hidden">
        
        {/* Top Header */}
        <div className="flex items-center justify-between p-5 border-b border-zinc-800/80 bg-zinc-950/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-fuchsia-600 to-emerald-500 flex items-center justify-center text-white font-black shadow-lg">
              P
            </div>
            <div>
              <h3 className="font-black text-white text-base">
                {user ? 'Minha Conta' : isForgotPass ? 'Recuperar Senha' : authModalTab === 'login' ? 'Entrar na PO-PI-DI' : 'Criar Conta de Cliente'}
              </h3>
              <p className="text-[11px] text-zinc-400">
                {user ? 'Seus dados e pedidos salvos' : 'Acesse seu histórico e agilize seus pedidos'}
              </p>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="p-2 text-zinc-400 hover:text-white rounded-xl bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5">
          {/* If already logged in */}
          {user ? (
            <div className="space-y-4 text-center py-1">
              <div className="w-16 h-16 rounded-full bg-zinc-800 border-2 border-emerald-400 mx-auto overflow-hidden flex items-center justify-center shadow-[0_0_15px_rgba(0,255,102,0.3)]">
                {user.photoURL ? (
                  <img src={user.photoURL} alt={user.displayName || 'Avatar'} className="w-full h-full object-cover" />
                ) : (
                  <User className="w-8 h-8 text-emerald-400" />
                )}
              </div>

              <div>
                <h4 className="text-lg font-black text-white">{profile?.name || user.displayName || 'Cliente PO-PI-DI'}</h4>
                <p className="text-xs text-zinc-400">{user.email}</p>
                {profile?.phone && (
                  <p className="text-xs text-zinc-500 mt-0.5">WhatsApp: {profile.phone}</p>
                )}
              </div>

              {/* LOYALTY POINTS CARD IN CUSTOMER ACCOUNT */}
              <div className="p-4 bg-gradient-to-br from-zinc-900 via-zinc-900/90 to-zinc-950 rounded-2xl border border-amber-500/40 text-left space-y-3 shadow-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-amber-400 text-black flex items-center justify-center font-black">
                      <Crown className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-black text-white block leading-none">Clube Fidelidade</span>
                      <span className="text-[10px] text-zinc-400">Pontos da sua conta</span>
                    </div>
                  </div>

                  <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-gradient-to-r ${tierInfo.badgeColor} shadow-sm`}>
                    Nível {tierInfo.tier}
                  </span>
                </div>

                <div className="flex items-center justify-between bg-zinc-950/80 p-3 rounded-xl border border-zinc-800/80">
                  <div>
                    <span className="text-[10px] text-zinc-500 uppercase block font-bold">Saldo Atual</span>
                    <div className="flex items-center gap-1.5 text-xl font-black text-amber-400">
                      <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                      <span>{currentLoyaltyPoints}</span>
                      <span className="text-xs font-bold text-zinc-400">pontos</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      handleClose();
                      setIsLoyaltyOpen(true);
                    }}
                    className="px-3.5 py-2 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-black font-black text-xs rounded-xl shadow-md transition-all hover:scale-102 flex items-center gap-1.5"
                  >
                    <Gift className="w-3.5 h-3.5" />
                    <span>Resgatar</span>
                  </button>
                </div>

                <p className="text-[10px] text-zinc-400 leading-snug">
                  Ganhe <strong>1 ponto para cada R$ 1,00 gasto</strong> em burgers e chopps!
                </p>
              </div>

              <div className="p-3 bg-zinc-900/80 rounded-2xl border border-zinc-800 text-left space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Conta conectada & sincronizada</span>
                </div>
                <p className="text-[11px] text-zinc-400">
                  Seus pedidos e endereços ficam salvos automaticamente.
                </p>
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  onClick={logout}
                  className="flex-1 py-3 bg-zinc-900 hover:bg-zinc-800 text-red-400 hover:text-red-300 font-bold text-xs rounded-xl border border-zinc-800 transition-colors"
                >
                  Sair da Conta
                </button>
                <button
                  onClick={handleClose}
                  className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-green-500 text-black font-black text-xs rounded-xl shadow-lg transition-transform hover:scale-[1.02]"
                >
                  Continuar no Cardápio
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Google Fast Sign-In Button */}
              {!isForgotPass && (
                <div>
                  <button
                    type="button"
                    onClick={handleGoogleLogin}
                    disabled={isSubmitting}
                    className="w-full flex items-center justify-center gap-3 bg-white hover:bg-zinc-100 text-zinc-900 font-bold text-sm py-3.5 px-4 rounded-2xl shadow-lg transition-all hover:scale-[1.01] active:scale-[0.99] border border-zinc-200"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                    <span>Continuar com o Google</span>
                  </button>

                  <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-zinc-800" />
                    </div>
                    <div className="relative flex justify-center text-[11px] uppercase">
                      <span className="bg-[#0d0e14] px-3 text-zinc-500 font-bold">
                        ou com e-mail e senha
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab Selector (Login vs Cadastro) */}
              {!isForgotPass && (
                <div className="flex bg-zinc-950 p-1 rounded-2xl border border-zinc-800">
                  <button
                    type="button"
                    onClick={() => {
                      setAuthModalTab('login');
                      setErrorMsg('');
                    }}
                    className={`flex-1 py-2 text-xs font-black rounded-xl transition-all ${
                      authModalTab === 'login'
                        ? 'bg-zinc-800 text-white shadow'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    Já sou Cliente (Login)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAuthModalTab('register');
                      setErrorMsg('');
                    }}
                    className={`flex-1 py-2 text-xs font-black rounded-xl transition-all ${
                      authModalTab === 'register'
                        ? 'bg-emerald-500 text-black shadow'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    Criar Nova Conta
                  </button>
                </div>
              )}

              {/* Alerts */}
              {errorMsg && (
                <div className="p-3 bg-red-950/50 border border-red-800/60 rounded-xl flex items-center gap-2.5 text-xs text-red-300">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {successMsg && (
                <div className="p-3 bg-emerald-950/50 border border-emerald-800/60 rounded-xl flex items-center gap-2.5 text-xs text-emerald-300">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span>{successMsg}</span>
                </div>
              )}

              {/* Email Form */}
              <form onSubmit={handleSubmit} className="space-y-3.5">
                {authModalTab === 'register' && !isForgotPass && (
                  <>
                    <div>
                      <label className="text-xs font-bold text-zinc-300 block mb-1">Nome Completo *</label>
                      <div className="relative">
                        <User className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3.5" />
                        <input
                          type="text"
                          required
                          value={name}
                          onChange={e => setName(e.target.value)}
                          placeholder="Ex: João da Silva"
                          className="w-full bg-zinc-900/90 border border-zinc-800 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-zinc-300 block mb-1">WhatsApp / Telefone (Apenas Números com DDD) *</label>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3.5" />
                        <input
                          type="tel"
                          inputMode="numeric"
                          value={phone}
                          onChange={e => setPhone(e.target.value.replace(/\D/g, ''))}
                          placeholder="Ex: 15997075641"
                          maxLength={13}
                          className="w-full bg-zinc-900/90 border border-zinc-800 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 font-mono"
                        />
                      </div>
                    </div>
                  </>
                )}

                <div>
                  <label className="text-xs font-bold text-zinc-300 block mb-1">E-mail *</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3.5" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="seuemail@exemplo.com"
                      className="w-full bg-zinc-900/90 border border-zinc-800 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                {!isForgotPass && (
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-bold text-zinc-300">Senha *</label>
                      {authModalTab === 'login' && (
                        <button
                          type="button"
                          onClick={() => {
                            setIsForgotPass(true);
                            setErrorMsg('');
                            setSuccessMsg('');
                          }}
                          className="text-[11px] text-fuchsia-400 hover:underline"
                        >
                          Esqueceu a senha?
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3.5" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="Mínimo 6 dígitos"
                        className="w-full bg-zinc-900/90 border border-zinc-800 rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-3 text-zinc-500 hover:text-zinc-300"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full mt-2 py-3.5 bg-gradient-to-r from-emerald-500 via-emerald-400 to-green-500 hover:from-emerald-400 hover:to-green-400 text-black font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-emerald-500/25 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <span>Processando...</span>
                  ) : isForgotPass ? (
                    <span>Enviar Link de Recuperação</span>
                  ) : authModalTab === 'login' ? (
                    <>
                      <span>Entrar na Minha Conta</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  ) : (
                    <>
                      <span>Finalizar Cadastro</span>
                      <Sparkles className="w-4 h-4" />
                    </>
                  )}
                </button>

                {isForgotPass && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsForgotPass(false);
                      setErrorMsg('');
                    }}
                    className="w-full text-center text-xs text-zinc-400 hover:text-white pt-1 block"
                  >
                    ← Voltar para o Login
                  </button>
                )}
              </form>

              {/* Special Admin Access Shortcut */}
              <div className="pt-3 border-t border-zinc-800/80 text-center">
                <button
                  type="button"
                  onClick={() => {
                    handleClose();
                    setIsAdminLoginOpen(true);
                  }}
                  className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-yellow-400 transition-colors font-semibold"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Acesso Especial do Administrador / Cozinha ↗</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
