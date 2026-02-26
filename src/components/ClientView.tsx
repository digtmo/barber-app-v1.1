import { useState } from 'react';
import { Calendar, Clock, User, Phone, Mail, Check, AlertCircle, CheckCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getWeekDates, formatDate, formatDisplayDate, isToday, isPast } from '../utils/dateUtils';
import Modal from './Modal';
import Spinner from './Spinner';

export default function ClientView() {
  const { getTimeSlotsForDate, addAppointment, barberConfig } = useApp();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [weekOffset, setWeekOffset] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
  });
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState<{ date: string; time: string } | null>(null);

  if (!barberConfig.isConfigured) {
    return (
      <div className="min-h-screen bg-zinc-900 flex items-center justify-center p-4">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Agenda no disponible</h2>
          <p className="text-zinc-400">El barbero aún no ha configurado su horario de atención.</p>
        </div>
      </div>
    );
  }

  const getWeekForOffset = () => {
    const today = new Date();
    const offsetDate = new Date(today);
    offsetDate.setDate(today.getDate() + (weekOffset * 7));
    return getWeekDates(offsetDate);
  };

  const weekDates = getWeekForOffset();

  const handleDateSelect = (date: Date) => {
    const dateStr = formatDate(date);
    setSelectedDate(dateStr);
    setSelectedTime(null);
    setShowForm(false);
    setMessage(null);
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedDate || !selectedTime) return;

    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 800));

    const result = addAppointment({
      date: selectedDate,
      timeSlot: selectedTime,
      clientName: formData.name,
      clientPhone: formData.phone,
      clientEmail: formData.email,
    });

    setIsLoading(false);

    if (result.success) {
      setConfirmedBooking({ date: selectedDate, time: selectedTime });
      setShowSuccessModal(true);
      setFormData({ name: '', phone: '', email: '' });
      setShowForm(false);
      setSelectedTime(null);
      setSelectedDate(null);
    } else {
      setMessage({ type: 'error', text: result.message || 'Error al hacer la reserva' });
    }
  };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    setConfirmedBooking(null);
  };

  const timeSlots = selectedDate ? getTimeSlotsForDate(selectedDate) : [];
  const hasNoSlots = selectedDate && timeSlots.length === 0;

  return (
    <div className="min-h-screen bg-zinc-900 text-white">
      <header className="bg-zinc-950 border-b border-zinc-800 p-6">
        <h1 className="text-4xl font-bold text-amber-500" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
          BARBER SHOP
        </h1>
        <p className="text-zinc-400 text-sm mt-1">Reserva tu turno</p>
      </header>

      <main className="p-6 max-w-md mx-auto">
        {message && message.type === 'error' && (
          <div className="mb-6 p-4 rounded-lg flex items-start gap-3 bg-red-500/10 border border-red-500/20">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-red-400">{message.text}</p>
          </div>
        )}

        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Calendar className="w-5 h-5 text-amber-500" />
              Selecciona un día
            </h2>
            <div className="flex gap-2">
              <button
                onClick={() => setWeekOffset(Math.max(0, weekOffset - 1))}
                disabled={weekOffset === 0}
                className="px-3 py-1 bg-zinc-800 rounded disabled:opacity-30 disabled:cursor-not-allowed hover:bg-zinc-700 transition-colors"
              >
                ←
              </button>
              <button
                onClick={() => setWeekOffset(weekOffset + 1)}
                className="px-3 py-1 bg-zinc-800 rounded hover:bg-zinc-700 transition-colors"
              >
                →
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2">
            {weekDates.map((date) => {
              const dateStr = formatDate(date);
              const isSelected = selectedDate === dateStr;
              const isPastDate = isPast(date);
              const isTodayDate = isToday(date);

              return (
                <button
                  key={dateStr}
                  onClick={() => !isPastDate && handleDateSelect(date)}
                  disabled={isPastDate}
                  className={`p-2 rounded-lg text-center transition-all ${
                    isPastDate
                      ? 'bg-zinc-800/50 text-zinc-600 cursor-not-allowed'
                      : isSelected
                      ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/20'
                      : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
                  } ${isTodayDate && !isSelected ? 'ring-2 ring-amber-500/50' : ''}`}
                >
                  <div className="text-xs opacity-70 mb-1">
                    {formatDisplayDate(date).split(' ')[0]}
                  </div>
                  <div className="text-lg font-bold">
                    {date.getDate()}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {selectedDate && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-500" />
              Horarios disponibles
            </h2>

            {hasNoSlots ? (
              <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-6 text-center">
                <AlertCircle className="w-12 h-12 text-zinc-500 mx-auto mb-3" />
                <p className="text-zinc-400">No hay horarios disponibles para este día</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {timeSlots.map((slot) => (
                  <button
                    key={slot.time}
                    onClick={() => slot.available && handleTimeSelect(slot.time)}
                    disabled={!slot.available}
                    className={`p-3 rounded-lg font-semibold transition-all ${
                      !slot.available
                        ? 'bg-zinc-800/50 text-zinc-600 cursor-not-allowed line-through'
                        : selectedTime === slot.time
                        ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/20'
                        : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
                    }`}
                  >
                    {slot.time}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <Modal isOpen={showForm && selectedTime !== null} onClose={() => setShowForm(false)} title="Confirma tu reserva">
          {selectedDate && selectedTime && (
            <>
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 mb-6">
                <p className="text-amber-400 text-sm text-center">
                  <strong>{formatDisplayDate(new Date(selectedDate + 'T00:00:00'))}</strong> a las <strong>{selectedTime}</strong>
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="flex items-center gap-2 text-sm text-zinc-400 mb-2">
                    <User className="w-4 h-4" />
                    Nombre completo
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 bg-zinc-900 border border-zinc-700 rounded-lg focus:outline-none focus:border-amber-500 text-white"
                    placeholder="Juan Pérez"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm text-zinc-400 mb-2">
                    <Phone className="w-4 h-4" />
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 bg-zinc-900 border border-zinc-700 rounded-lg focus:outline-none focus:border-amber-500 text-white"
                    placeholder="+34 600 000 000"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm text-zinc-400 mb-2">
                    <Mail className="w-4 h-4" />
                    Correo electrónico
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 bg-zinc-900 border border-zinc-700 rounded-lg focus:outline-none focus:border-amber-500 text-white"
                    placeholder="juan@email.com"
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
                      Confirmando...
                    </>
                  ) : (
                    <>
                      <Check className="w-5 h-5" />
                      Confirmar reserva
                    </>
                  )}
                </button>
              </form>
            </>
          )}
        </Modal>

        <Modal isOpen={showSuccessModal} onClose={handleCloseSuccessModal}>
          <div className="text-center">
            <div className="flex items-center justify-center w-16 h-16 bg-green-500/10 rounded-full mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">
              Reserva confirmada
            </h3>
            <p className="text-zinc-400 mb-4">
              Tu cita ha sido agendada exitosamente
            </p>
            {confirmedBooking && (
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 mb-6">
                <p className="text-amber-400 text-sm">
                  <strong>{formatDisplayDate(new Date(confirmedBooking.date + 'T00:00:00'))}</strong>
                  <br />
                  a las <strong>{confirmedBooking.time}</strong>
                </p>
              </div>
            )}
            <button
              onClick={handleCloseSuccessModal}
              className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-lg transition-colors"
            >
              Entendido
            </button>
          </div>
        </Modal>
      </main>
    </div>
  );
}
