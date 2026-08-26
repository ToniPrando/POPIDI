import React from 'react';
import { RefreshCw, AlertTriangle } from 'lucide-react';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  override state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public override componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Uncaught error in UI:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleReset = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch {
      // ignore
    }
    window.location.reload();
  };

  public override render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#07070b] text-white flex flex-col items-center justify-center p-4 text-center">
          <div className="max-w-md w-full p-8 rounded-3xl bg-zinc-950 border border-fuchsia-900/40 shadow-[0_0_50px_rgba(240,70,245,0.2)]">
            <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-fuchsia-950/80 border border-fuchsia-600/50 flex items-center justify-center text-fuchsia-400 shadow-[0_0_20px_rgba(240,70,245,0.3)]">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <h1 className="text-2xl font-black font-serif tracking-tight text-white mb-2">
              PO-PI-DI <span className="text-yellow-400">BURGER</span>
            </h1>
            
            <p className="text-zinc-400 text-sm mb-6 leading-relaxed">
              Ocorreu um problema ao carregar a página. Clique abaixo para recarregar o cardápio e continuar seu pedido.
            </p>

            <div className="flex flex-col gap-3">
              <button
                onClick={this.handleReload}
                className="w-full py-3.5 px-6 rounded-xl font-bold text-black bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_0_20px_rgba(250,204,21,0.4)] flex items-center justify-center gap-2 cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                Recarregar Cardápio
              </button>

              <button
                onClick={this.handleReset}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900 transition-colors cursor-pointer"
              >
                Limpar cache e restaurar
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
