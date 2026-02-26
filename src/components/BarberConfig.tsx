import { useState, useEffect } from 'react';
import { Clock, Calendar, Save, AlertCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function BarberConfig() {
  const { barberConfig, updateBarberConfig } = useApp();
  const [config, setConfig] = useState({
    startTime: barberConfig.startTime,
    endTime: barberConfig.endTime,
    slotDuration: barberConfig.slotDuration,
    workingDays: barberConfig.workingDays,
  });
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    setConfig({
      startTime: barberConfig.startTime,
      endTime: barberConfig.endTime,
      slotDuration: barberConfig.slotDuration,
      workingDays: barberConfig.workingDays,
    });
  }, [barberConfig]);

  const daysOfWeek = [
    { value: 0, label: 'Dom' },
    { value: 1, label: 'Lun' },
    { value: 2, label: 'Mar' },
    { value: 3, label: 'Mié' },
    { value: 4, label: 'Jue' },
    { value: 5, label: 'Vie' },
    { value: 6, label: 'Sáb' },
  ];

  const toggleDay = (day: number) => {
    setConfig(prev => ({
      ...prev,
      workingDays: prev.workingDays.includes(day)
        ? prev.workingDays.filter(d => d !== day)
        : [...prev.workingDays, day].sort(),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (config.workingDays.length === 0) {
      setMessage('Debes seleccionar al menos un día de trabajo');
      return;
    }

    const [startHour, startMin] = config.startTime.split(':').map(Number);
    const [endHour, endMin] = config.endTime.split(':').map(Number);
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;

    if (startMinutes >= endMinutes) {
      setMessage('La hora de fin debe ser posterior a la hora de inicio');
      return;
    }

    updateBarberConfig(config);
    setMessage('Configuración guardada exitosamente');
    setTimeout(() => setMessage(null), 3000);
  };

  return (
    <div className="bg-zinc-800 rounded-lg p-6 border border-zinc-700">
      <h2 className="text-2xl font-bold mb-6">Configuración de horario</h2>

      {barberConfig.isConfigured && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 mb-6 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div className="text-amber-400 text-sm">
            <p className="font-semibold mb-1">Atención</p>
            <p>Si cambias tu horario, las reservas que queden fuera del nuevo horario serán eliminadas automáticamente.</p>
          </div>
        </div>
      )}

      {message && (
        <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 mb-6">
          <p className="text-green-400">{message}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="flex items-center gap-2 text-sm text-zinc-400 mb-2">
              <Clock className="w-4 h-4" />
              Hora de inicio
            </label>
            <input
              type="time"
              required
              value={config.startTime}
              onChange={(e) => setConfig({ ...config, startTime: e.target.value })}
              className="w-full px-4 py-3 bg-zinc-900 border border-zinc-700 rounded-lg focus:outline-none focus:border-amber-500 text-white"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm text-zinc-400 mb-2">
              <Clock className="w-4 h-4" />
              Hora de fin
            </label>
            <input
              type="time"
              required
              value={config.endTime}
              onChange={(e) => setConfig({ ...config, endTime: e.target.value })}
              className="w-full px-4 py-3 bg-zinc-900 border border-zinc-700 rounded-lg focus:outline-none focus:border-amber-500 text-white"
            />
          </div>
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm text-zinc-400 mb-2">
            <Clock className="w-4 h-4" />
            Duración de cada turno
          </label>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setConfig({ ...config, slotDuration: 30 })}
              className={`py-3 rounded-lg font-semibold transition-all ${
                config.slotDuration === 30
                  ? 'bg-amber-600 text-white'
                  : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-700'
              }`}
            >
              30 minutos
            </button>
            <button
              type="button"
              onClick={() => setConfig({ ...config, slotDuration: 60 })}
              className={`py-3 rounded-lg font-semibold transition-all ${
                config.slotDuration === 60
                  ? 'bg-amber-600 text-white'
                  : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-700'
              }`}
            >
              60 minutos
            </button>
          </div>
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm text-zinc-400 mb-2">
            <Calendar className="w-4 h-4" />
            Días de trabajo
          </label>
          <div className="grid grid-cols-7 gap-2">
            {daysOfWeek.map((day) => (
              <button
                key={day.value}
                type="button"
                onClick={() => toggleDay(day.value)}
                className={`py-3 rounded-lg font-semibold transition-all ${
                  config.workingDays.includes(day.value)
                    ? 'bg-amber-600 text-white'
                    : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-700'
                }`}
              >
                {day.label}
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-4 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-lg transition-colors shadow-lg shadow-amber-600/20 flex items-center justify-center gap-2"
        >
          <Save className="w-5 h-5" />
          Guardar configuración
        </button>
      </form>
    </div>
  );
}
