import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { ChevronLeft, ChevronRight, Plus, Edit } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import CalendarEventModal from '../components/CalendarEventModal';

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  isWeekend: boolean;
}

interface CalendarEvent {
  evento_id: string;
  titulo: string;
  descricao: string;
  tipo: string;
  categoria: string;
  subcategoria: string;
  valor: number;
  dia: number;
  created_at: string;
}

export default function Calendar() {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState<number | undefined>(undefined);
  
  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  
  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  useEffect(() => {
    if (user) {
      fetchEvents();
    }
  }, [user, currentDate]);

  const fetchEvents = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('calendarios')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getDaysInMonth = (date: Date): CalendarDay[] => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayIndex = firstDay.getDay();
    
    const days: CalendarDay[] = [];
    
    // Add days from previous month
    const prevMonth = new Date(year, month - 1);
    const daysInPrevMonth = new Date(year, month, 0).getDate();
    for (let i = startingDayIndex - 1; i >= 0; i--) {
      const date = new Date(year, month - 1, daysInPrevMonth - i);
      days.push({
        date,
        isCurrentMonth: false,
        isToday: false,
        isWeekend: date.getDay() === 0 || date.getDay() === 6
      });
    }
    
    // Add days from current month
    const today = new Date();
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      days.push({
        date,
        isCurrentMonth: true,
        isToday: date.toDateString() === today.toDateString(),
        isWeekend: date.getDay() === 0 || date.getDay() === 6
      });
    }
    
    // Add days from next month
    const remainingDays = 42 - days.length; // Always show 6 weeks
    for (let day = 1; day <= remainingDays; day++) {
      const date = new Date(year, month + 1, day);
      days.push({
        date,
        isCurrentMonth: false,
        isToday: false,
        isWeekend: date.getDay() === 0 || date.getDay() === 6
      });
    }
    
    return days;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  const getEventsForDay = (day: number, isCurrentMonth: boolean): CalendarEvent[] => {
    if (!isCurrentMonth) return [];

    return events.filter(event => {
      const eventDate = new Date(event.created_at);
      const currentMonthYear = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const eventMonthYear = new Date(eventDate.getFullYear(), eventDate.getMonth(), 1);

      // Only show events from their creation month onwards
      return event.dia === day && eventMonthYear <= currentMonthYear;
    });
  };

  // Format currency values
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const handleNewEvent = (day: number) => {
    setSelectedEventId(null);
    setSelectedDay(day);
    setIsModalOpen(true);
  };

  const handleEditEvent = (eventId: string) => {
    setSelectedEventId(eventId);
    setSelectedDay(undefined);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedEventId(null);
    setSelectedDay(undefined);
  };

  const handleEventSaved = () => {
    fetchEvents();
  };

  const calendarDays = getDaysInMonth(currentDate);

  return (
    <Layout title="Calendário">
      <div className="bg-white rounded-lg shadow">
        {/* Calendar header */}
        <div className="px-4 sm:px-6 py-2 sm:py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900">
              {months[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            <div className="flex space-x-1 sm:space-x-2">
              <button
                onClick={() => navigateMonth('prev')}
                className="p-1 sm:p-2 hover:bg-gray-100 rounded-full transition-colors"
                title="Mês anterior"
              >
                <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
              </button>
              <button
                onClick={() => navigateMonth('next')}
                className="p-1 sm:p-2 hover:bg-gray-100 rounded-full transition-colors"
                title="Próximo mês"
              >
                <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
        
        {/* Calendar grid */}
        <div className="p-2 sm:p-4">
          {/* Week days header */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {weekDays.map((day, index) => (
              <div
                key={day}
                className={`text-center text-xs sm:text-sm font-medium py-1 sm:py-2 ${
                  index === 0 || index === 6 ? 'text-gray-300' : 'text-gray-500'
                }`}
              >
                {day}
              </div>
            ))}
          </div>
          
          {/* Calendar days */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, index) => {
              const dayEvents = getEventsForDay(day.date.getDate(), day.isCurrentMonth);
              
              return (
                <div
                  key={index}
                  className={`
                    min-h-[80px] sm:min-h-[120px] p-1 sm:p-2 relative group
                    ${day.isCurrentMonth ? 'bg-white' : 'bg-gray-50'}
                    ${day.isWeekend && day.isCurrentMonth ? 'bg-red-50' : ''}
                    ${day.isToday ? 'bg-[#e6f7f1] ring-2 ring-[#11ab77]' : ''}
                    hover:bg-gray-100 transition-colors
                    border border-gray-200 rounded-lg
                    overflow-hidden
                  `}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`
                        text-xs sm:text-sm
                        ${day.isCurrentMonth ? 'text-gray-600' : 'text-gray-300'}
                        ${day.isWeekend && day.isCurrentMonth ? 'text-[#11ab77]' : ''}
                        ${day.isToday ? 'text-[#11ab77] font-bold' : ''}
                      `}
                    >
                      {day.date.getDate()}
                    </span>
                    {day.isCurrentMonth && (
                      <button
                        onClick={() => handleNewEvent(day.date.getDate())}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-200 rounded-full"
                        title="Adicionar evento"
                      >
                        <Plus size={12} className="text-gray-600" />
                      </button>
                    )}
                  </div>
                  
                  {/* Events for this day */}
                  <div className="space-y-0.5 overflow-y-auto max-h-[52px] sm:max-h-[80px] scrollbar-none">
                    {dayEvents.map((event) => (
                      <div
                        key={event.evento_id}
                        className="p-0.5 sm:p-1 rounded text-xs bg-[#e6f7f1] border border-[#11ab77] cursor-pointer hover:bg-[#d1f2e6] group/event relative"
                        title={`${event.descricao}\nTipo: ${event.tipo}\nCategoria: ${event.categoria}${event.subcategoria ? `\nSubcategoria: ${event.subcategoria}` : ''}\nValor: ${formatCurrency(event.valor)}`}
                        onClick={() => handleEditEvent(event.evento_id)}
                      >
                        <div className="font-medium truncate text-[9px] sm:text-xs leading-tight">{event.titulo}</div>
                        <div className="text-[#11ab77] truncate text-[9px] sm:text-xs leading-tight">{formatCurrency(event.valor)}</div>
                        <button
                          className="absolute right-0.5 top-0.5 opacity-0 group-hover/event:opacity-100 transition-opacity p-0.5 hover:bg-[#11ab77] hover:text-white rounded-full"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditEvent(event.evento_id);
                          }}
                          title="Editar evento"
                        >
                          <Edit size={8} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Event Modal */}
      <CalendarEventModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        eventId={selectedEventId}
        selectedDay={selectedDay}
        onSave={handleEventSaved}
      />
    </Layout>
  );
}