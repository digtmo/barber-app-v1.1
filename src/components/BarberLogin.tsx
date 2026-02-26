import { useState } from 'react';
import { Lock, AlertCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import Spinner from './Spinner';

export default function BarberLogin({ onBackToClient }: { onBackToClient?: () => void }) {
  const { authenticateBarber } = useApp();
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 800));

    const success = authenticateBarber(password);

    setIsLoading(false);
    if (!success) {
      setError(true);
      setPassword('');
      setTimeout(() => setError(false), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-amber-500 mb-2" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
            BARBER SHOP
          </h1>
          <p className="text-zinc-400">Panel de administración</p>
        </div>

        <div className="bg-zinc-800 rounded-lg p-8 border border-zinc-700">
          <div className="flex items-center justify-center w-16 h-16 bg-amber-500/10 rounded-full mx-auto mb-6">
            <Lock className="w-8 h-8 text-amber-500" />
          </div>

          <h2 className="text-2xl font-bold text-center mb-6">Acceso Barbero</h2>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <p className="text-red-400 text-sm">Contraseña incorrecta</p>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label className="text-sm text-zinc-400 mb-2 block">
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-zinc-900 border border-zinc-700 rounded-lg focus:outline-none focus:border-amber-500 text-white"
                placeholder="Ingresa tu contraseña"
                autoFocus
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-amber-600 hover:bg-amber-500 disabled:bg-amber-600/50 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-colors shadow-lg shadow-amber-600/20 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Spinner size="sm" />
                  Verificando...
                </>
              ) : (
                'Ingresar'
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-zinc-500 text-sm mt-6">
          ¿Eres cliente? <button onClick={onBackToClient} className="text-amber-500 hover:text-amber-400">Haz tu reserva aquí</button>
        </p>
      </div>
    </div>
  );
}
