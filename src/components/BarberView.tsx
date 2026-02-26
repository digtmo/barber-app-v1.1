import { useState } from 'react';
import { LogOut, Settings, Calendar as CalendarIcon, Users } from 'lucide-react';
import { useApp } from '../context/AppContext';
import BarberConfig from './BarberConfig';
import BarberAgenda from './BarberAgenda';

export default function BarberView({ onBackToClient }: { onBackToClient?: () => void }) {
  const { barberConfig, logoutBarber } = useApp();
  const [activeTab, setActiveTab] = useState<'agenda' | 'config'>(
    barberConfig.isConfigured ? 'agenda' : 'config'
  );
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleTabChange = (tab: 'agenda' | 'config') => {
    setIsTransitioning(true);
    setTimeout(() => {
      setActiveTab(tab);
      setIsTransitioning(false);
    }, 150);
  };

  const handleLogout = () => {
    logoutBarber();
    onBackToClient?.();
  };

  return (
    <div className="min-h-screen bg-zinc-900 text-white">
      <header className="bg-zinc-950 border-b border-zinc-800 p-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-amber-500" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
              PANEL BARBERO
            </h1>
            <p className="text-zinc-400 text-sm mt-1">Gestiona tu agenda</p>
          </div>
          <div className="flex items-center gap-3">
            {onBackToClient && (
              <button
                onClick={onBackToClient}
                className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-500 rounded-lg transition-colors font-semibold text-white"
              >
                <Users className="w-4 h-4" />
                Ir a Cliente
              </button>
            )}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Salir
            </button>
          </div>
        </div>
      </header>

      {!barberConfig.isConfigured ? (
        <div className="max-w-2xl mx-auto p-6">
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-amber-500 mb-2">Configuración requerida</h2>
            <p className="text-zinc-300">Debes configurar tu horario de atención antes de comenzar a recibir reservas.</p>
          </div>
          <BarberConfig onSwitchToAgenda={() => setActiveTab('agenda')} />
        </div>
      ) : (
        <>
          <div className="border-b border-zinc-800">
            <div className="max-w-6xl mx-auto px-6">
              <div className="flex gap-4">
                <button
                  onClick={() => handleTabChange('agenda')}
                  className={`flex items-center gap-2 px-6 py-4 font-semibold transition-colors relative ${
                    activeTab === 'agenda'
                      ? 'text-amber-500'
                      : 'text-zinc-400 hover:text-zinc-300'
                  }`}
                >
                  <CalendarIcon className="w-5 h-5" />
                  Agenda
                  {activeTab === 'agenda' && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-500" />
                  )}
                </button>
                <button
                  onClick={() => handleTabChange('config')}
                  className={`flex items-center gap-2 px-6 py-4 font-semibold transition-colors relative ${
                    activeTab === 'config'
                      ? 'text-amber-500'
                      : 'text-zinc-400 hover:text-zinc-300'
                  }`}
                >
                  <Settings className="w-5 h-5" />
                  Configuración
                  {activeTab === 'config' && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-500" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <main className="max-w-6xl mx-auto p-6">
            <div className={isTransitioning ? 'slide-out-right' : 'slide-in-left'}>
              {activeTab === 'agenda' ? <BarberAgenda /> : <BarberConfig onSwitchToAgenda={() => handleTabChange('agenda')} />}
            </div>
          </main>
        </>
      )}
    </div>
  );
}
