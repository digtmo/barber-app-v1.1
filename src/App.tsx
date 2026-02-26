import { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import ClientView from './components/ClientView';
import BarberView from './components/BarberView';
import BarberLogin from './components/BarberLogin';
import { Scissors } from 'lucide-react';

function AppContent() {
  const { isBarberAuthenticated } = useApp();
  const [showBarberLogin, setShowBarberLogin] = useState(false);

  const handleBackToClient = () => {
    setShowBarberLogin(false);
  };

  if (showBarberLogin) {
    if (isBarberAuthenticated) {
      return <BarberView onBackToClient={handleBackToClient} />;
    }
    return <BarberLogin onBackToClient={handleBackToClient} />;
  }

  return (
    <div className="relative">
      <ClientView />
      <button
        onClick={() => setShowBarberLogin(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-amber-600 hover:bg-amber-500 text-white rounded-full shadow-lg shadow-amber-600/20 flex items-center justify-center transition-all hover:scale-110"
        title="Acceso Barbero"
      >
        <Scissors className="w-6 h-6" />
      </button>
    </div>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
