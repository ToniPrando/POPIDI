import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { 
  X, 
  ShieldCheck, 
  Lock, 
  KeyRound, 
  AlertCircle, 
  Eye,
  EyeOff,
  Flame, 
  Beer,
  CheckCircle2
} from 'lucide-react';

export const AdminLoginModal: React.FC = () => {
  const { 
    isAdminLoginOpen, 
    setIsAdminLoginOpen, 
    adminLoginWithCredentials,
    isAdmin 
  } = useAuth();

  const { setIsAdminOpen } = useCart();

  const [pinOrPass, setPinOrPass] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isAdminLoginOpen) return null;

  const handleClose = () => {
    setPinOrPass('');
    setErrorMsg('');
    setIsAdminLoginOpen(false);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!pinOrPass.trim()) {
      setErrorMsg('Digite a senha ou PIN do administrador.');
      return;
    }

    setIsSubmitting(true);
    try {
      const success = await adminLoginWithCredentials(pinOrPass);
      if (success) {
        handleClose();
        setIsAdminOpen(true);
      } else {
        setErrorMsg('Senha ou PIN de Administrador incorreto. Verifique e tente novamente.');
      }
    } catch (err) {
      setErrorMsg('Erro ao autenticar administrador.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm bg-[#0e0914] border-2 border-yellow-500/50 rounded-3xl shadow-[0_0_40px_rgba(234,179,8,0.25)] overflow-hidden text-left">
        
        {/* Top Header */}
        <div className="flex items-center justify-between p-5 border-b border-zinc-800/80 bg-zinc-950/80">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-yellow-500 to-amber-600 flex items-center justify-center text-black font-black shadow-lg">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-white text-base">Acesso do Administrador</h3>
              <p className="text-[11px] text-yellow-400 font-semibold">Painel da Cozinha & Choperia</p>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="p-2 text-zinc-400 hover:text-white rounded-xl bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4">
          <div className="p-3.5 bg-zinc-900/90 rounded-2xl border border-yellow-500/20 text-xs text-zinc-300 space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-yellow-400">
              <KeyRound className="w-4 h-4" />
              <span>Área Protegida com Senha</span>
            </div>
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              O acesso ao KDS, gerenciamento de comandas, estoque e controle da loja é restrito aos gerentes e operadores autorizados da Pó Pi Di.
            </p>
          </div>

          {errorMsg && (
            <div className="p-3 bg-red-950/70 border border-red-800/80 rounded-xl flex items-center gap-2 text-xs text-red-300 animate-in fade-in duration-150">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-zinc-300 block mb-1">
                Senha Master ou PIN de Acesso *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3.5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  autoFocus
                  required
                  value={pinOrPass}
                  onChange={e => setPinOrPass(e.target.value)}
                  placeholder="Digite seu PIN ou Senha de Acesso"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-10 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-yellow-500 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-zinc-500 hover:text-zinc-300 p-0.5"
                  title={showPassword ? "Ocultar senha" : "Ver senha"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-black font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-yellow-500/25 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{isSubmitting ? 'Verificando...' : 'Entrar no Painel de Pedidos'}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
