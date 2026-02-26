import { useState } from 'react';
import { Calendar, Clock, User, Phone, Lock, Unlock, AlertCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getWeekDates, formatDate, formatDisplayDate, isToday } from '../utils/dateUtils';

export default function BarberAgenda() {
  const { getTimeSlotsForDate, barberConfig, blockDate, unblockDate, appointments } = useApp();
  const [selectedDate, setSelectedDate] = useState<string>(formatDate(new Date()));
  const [weekOffset, setWeekOffset] = useState(0);

  const getWeekForOffset = () => {
    const today = new Date();
    const offsetDate = new Date(today);
    offsetDate.setDate(today.getDate() + (weekOffset * 7));
    return getWeekDates(offsetDate);
  };

  const weekDates = getWeekForOffset();
  const timeSlots = getTimeSlotsForDate(selectedDate);
  const isBlocked = barberConfig.blockedDates.includes(selectedDate);

  const handleToggleBlock = () => {
    if (isBlocked) {
      unblockDate(selectedDate);
    } else {
      const appointmentsForDate = appointments.filter(apt => apt.date === selectedDate);
      if (appointmentsForDate.length > 0) {
        if (confirm(`Hay ${appointmentsForDate.length} reserva(s) para este día. ¿Estás seguro de que quieres bloquearlo? Las reservas serán eliminadas.`)) {
          blockDate(selectedDate);
        }
      } else {
        blockDate(selectedDate);
      }
    }
  };

  const occupiedCount = timeSlots.filter(slot => !slot.available).length;
  const totalSlots = timeSlots.length;

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Tu agenda</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setWeekOffset(weekOffset - 1)}
              className="px-3 py-1 bg-zinc-800 rounded hover:bg-zinc-700 transition-colors"
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
            const isTodayDate = isToday(date);
            const dateSlots = getTimeSlotsForDate(dateStr);
            const hasAppointments = dateSlots.some(slot => !slot.available);
            const isDateBlocked = barberConfig.blockedDates.includes(dateStr);

            return (
              <button
                key={dateStr}
                onClick={() => setSelectedDate(dateStr)}
                className={`p-3 rounded-lg text-center transition-all relative ${
                  isSelected
                    ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/20'
                    : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
                } ${isTodayDate && !isSelected ? 'ring-2 ring-amber-500/50' : ''}`}
              >
                <div className="text-xs opacity-70 mb-1">
                  {formatDisplayDate(date).split(' ')[0]}
                </div>
                <div className="text-lg font-bold mb-1">
                  {date.getDate()}
                </div>
                {isDateBlocked && (
                  <Lock className="w-3 h-3 absolute top-1 right-1 text-red-400" />
                )}
                {hasAppointments && !isDateBlocked && (
                  <div className="h-1 w-1 rounded-full bg-green-400 mx-auto" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="bg-zinc-800 rounded-lg p-6 border border-zinc-700">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold mb-1">
              {formatDisplayDate(new Date(selectedDate + 'T00:00:00'))}
            </h3>
            {!isBlocked && totalSlots > 0 && (
              <p className="text-sm text-zinc-400">
                {occupiedCount} de {totalSlots} turnos ocupados
              </p>
            )}
          </div>
          <button
            onClick={handleToggleBlock}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-colors ${
              isBlocked
                ? 'bg-green-600 hover:bg-green-500 text-white'
                : 'bg-red-600 hover:bg-red-500 text-white'
            }`}
          >
            {isBlocked ? (
              <>
                <Unlock className="w-4 h-4" />
                Desbloquear día
              </>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                Bloquear día
              </>
            )}
          </button>
        </div>

        {isBlocked ? (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6 text-center">
            <Lock className="w-12 h-12 text-red-500 mx-auto mb-3" />
            <p className="text-red-400 font-semibold">Este día está bloqueado</p>
            <p className="text-zinc-400 text-sm mt-2">Los clientes no pueden hacer reservas</p>
          </div>
        ) : timeSlots.length === 0 ? (
          <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-6 text-center">
            <AlertCircle className="w-12 h-12 text-zinc-500 mx-auto mb-3" />
            <p className="text-zinc-400">No trabajas este día</p>
          </div>
        ) : (
          <div className="space-y-3">
            {timeSlots.map((slot) => (
              <div
                key={slot.time}
                className={`p-4 rounded-lg border transition-all ${
                  slot.available
                    ? 'bg-zinc-900 border-zinc-700'
                    : 'bg-green-500/10 border-green-500/20'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`flex items-center gap-2 font-bold ${
                      slot.available ? 'text-zinc-400' : 'text-green-400'
                    }`}>
                      <Clock className="w-4 h-4" />
                      {slot.time}
                    </div>
                    {slot.available ? (
                      <span className="text-sm text-zinc-500">Disponible</span>
                    ) : slot.appointment && (
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-2 text-zinc-300">
                          <User className="w-4 h-4" />
                          {slot.appointment.clientName}
                        </div>
                        <div className="flex items-center gap-2 text-zinc-400">
                          <Phone className="w-4 h-4" />
                          {slot.appointment.clientPhone}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
