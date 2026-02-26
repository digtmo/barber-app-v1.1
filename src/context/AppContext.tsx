import { createContext, useContext, useState, ReactNode } from 'react';
import { Appointment, BarberConfig, TimeSlot } from '../types';

interface AppContextType {
  appointments: Appointment[];
  barberConfig: BarberConfig;
  isBarberAuthenticated: boolean;
  addAppointment: (appointment: Omit<Appointment, 'id'>) => { success: boolean; message?: string };
  deleteAppointmentsForDate: (date: string) => void;
  deleteAppointmentsOutsideSchedule: () => void;
  updateBarberConfig: (config: Partial<BarberConfig>) => void;
  blockDate: (date: string) => void;
  unblockDate: (date: string) => void;
  authenticateBarber: (password: string) => boolean;
  logoutBarber: () => void;
  getTimeSlotsForDate: (date: string) => TimeSlot[];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const defaultBarberConfig: BarberConfig = {
  startTime: '09:00',
  endTime: '18:00',
  slotDuration: 30,
  workingDays: [1, 2, 3, 4, 5, 6],
  blockedDates: [],
  isConfigured: false,
};

const loadBarberConfigFromStorage = (): BarberConfig => {
  const saved = localStorage.getItem('barberConfig');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      return defaultBarberConfig;
    }
  }
  return defaultBarberConfig;
};

export function AppProvider({ children }: { children: ReactNode }) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [barberConfig, setBarberConfig] = useState<BarberConfig>(loadBarberConfigFromStorage);
  const [isBarberAuthenticated, setIsBarberAuthenticated] = useState(false);

  const generateTimeSlots = (startTime: string, endTime: string, duration: number): string[] => {
    const slots: string[] = [];
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);

    let currentMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;

    while (currentMinutes < endMinutes) {
      const hours = Math.floor(currentMinutes / 60);
      const minutes = currentMinutes % 60;
      slots.push(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`);
      currentMinutes += duration;
    }

    return slots;
  };

  const getTimeSlotsForDate = (date: string): TimeSlot[] => {
    if (!barberConfig.isConfigured) return [];

    const dateObj = new Date(date + 'T00:00:00');
    const dayOfWeek = dateObj.getDay();

    if (!barberConfig.workingDays.includes(dayOfWeek)) {
      return [];
    }

    if (barberConfig.blockedDates.includes(date)) {
      return [];
    }

    const timeSlots = generateTimeSlots(
      barberConfig.startTime,
      barberConfig.endTime,
      barberConfig.slotDuration
    );

    return timeSlots.map(time => {
      const appointment = appointments.find(
        apt => apt.date === date && apt.timeSlot === time
      );

      return {
        time,
        available: !appointment,
        appointment,
      };
    });
  };

  const addAppointment = (appointment: Omit<Appointment, 'id'>): { success: boolean; message?: string } => {
    const existing = appointments.find(
      apt => apt.date === appointment.date && apt.timeSlot === appointment.timeSlot
    );

    if (existing) {
      return { success: false, message: 'Este horario ya fue reservado. Por favor elige otro.' };
    }

    if (barberConfig.blockedDates.includes(appointment.date)) {
      return { success: false, message: 'Este día no está disponible.' };
    }

    const newAppointment: Appointment = {
      ...appointment,
      id: `${Date.now()}-${Math.random()}`,
    };

    setAppointments(prev => [...prev, newAppointment]);
    return { success: true };
  };

  const deleteAppointmentsForDate = (date: string) => {
    setAppointments(prev => prev.filter(apt => apt.date !== date));
  };

  const deleteAppointmentsOutsideSchedule = () => {
    setAppointments(prev => prev.filter(apt => {
      const dateObj = new Date(apt.date + 'T00:00:00');
      const dayOfWeek = dateObj.getDay();

      if (!barberConfig.workingDays.includes(dayOfWeek)) {
        return false;
      }

      const timeSlots = generateTimeSlots(
        barberConfig.startTime,
        barberConfig.endTime,
        barberConfig.slotDuration
      );

      return timeSlots.includes(apt.timeSlot);
    }));
  };

  const updateBarberConfig = (config: Partial<BarberConfig>) => {
    setBarberConfig(prev => {
      const newConfig = { ...prev, ...config, isConfigured: true };
      localStorage.setItem('barberConfig', JSON.stringify(newConfig));
      return newConfig;
    });

    setTimeout(() => {
      deleteAppointmentsOutsideSchedule();
    }, 0);
  };

  const blockDate = (date: string) => {
    setBarberConfig(prev => {
      const newConfig = {
        ...prev,
        blockedDates: [...prev.blockedDates, date],
      };
      localStorage.setItem('barberConfig', JSON.stringify(newConfig));
      return newConfig;
    });
    deleteAppointmentsForDate(date);
  };

  const unblockDate = (date: string) => {
    setBarberConfig(prev => {
      const newConfig = {
        ...prev,
        blockedDates: prev.blockedDates.filter(d => d !== date),
      };
      localStorage.setItem('barberConfig', JSON.stringify(newConfig));
      return newConfig;
    });
  };

  const authenticateBarber = (password: string): boolean => {
    if (password === '1234') {
      setIsBarberAuthenticated(true);
      return true;
    }
    return false;
  };

  const logoutBarber = () => {
    setIsBarberAuthenticated(false);
  };

  return (
    <AppContext.Provider
      value={{
        appointments,
        barberConfig,
        isBarberAuthenticated,
        addAppointment,
        deleteAppointmentsForDate,
        deleteAppointmentsOutsideSchedule,
        updateBarberConfig,
        blockDate,
        unblockDate,
        authenticateBarber,
        logoutBarber,
        getTimeSlotsForDate,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}
