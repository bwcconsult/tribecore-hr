import { useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, eachMonthOfInterval, startOfYear, endOfYear, eachDayOfInterval, startOfMonth, endOfMonth, isWeekend, parseISO, isWithinInterval } from 'date-fns';

interface CalendarEvent {
  id: string;
  type: 'HOLIDAY' | 'BIRTHDAY' | 'LEVEL_UP_DAY' | 'SICKNESS' | 'OTHER_ABSENCE' | 'BANK_HOLIDAY';
  title: string;
  startDate: string;
  endDate: string;
  color: string;
}

const EVENT_COLORS = {
  HOLIDAY: 'bg-green-500',
  BIRTHDAY: 'bg-red-500',
  LEVEL_UP_DAY: 'bg-teal-500',
  SICKNESS: 'bg-red-600',
  OTHER_ABSENCE: 'bg-blue-500',
  BANK_HOLIDAY: 'bg-gray-300',
};

export default function AnnualOverviewPage() {
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  // Mock events - replace with API call
  const events: CalendarEvent[] = [];

  const yearStart = startOfYear(new Date(currentYear, 0, 1));
  const yearEnd = endOfYear(new Date(currentYear, 0, 1));
  const months = eachMonthOfInterval({ start: yearStart, end: yearEnd });

  const handlePrevYear = () => setCurrentYear(currentYear - 1);
  const handleNextYear = () => setCurrentYear(currentYear + 1);
  const handleCurrentYear = () => setCurrentYear(new Date().getFullYear());

  const getEventsForDay = (day: Date) => {
    return events.filter((event) => {
      const eventStart = parseISO(event.startDate);
      const eventEnd = parseISO(event.endDate);
      return isWithinInterval(day, { start: eventStart, end: eventEnd });
    });
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
          <Calendar className="w-6 h-6" />
          Annual Overview
        </h1>
        <p className="text-gray-600">
          Year-at-a-glance view of all absences and holidays
        </p>
      </div>

      {/* Year Navigation */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevYear}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleCurrentYear}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Current Year
            </button>
            <button
              onClick={handleNextYear}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-semibold text-gray-900 ml-4">
              {currentYear}
            </h2>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1">
              <div className={`w-3 h-3 rounded ${EVENT_COLORS.HOLIDAY}`} />
              <span>Holiday</span>
            </div>
            <div className="flex items-center gap-1">
              <div className={`w-3 h-3 rounded ${EVENT_COLORS.BIRTHDAY}`} />
              <span>Birthday</span>
            </div>
            <div className="flex items-center gap-1">
              <div className={`w-3 h-3 rounded ${EVENT_COLORS.LEVEL_UP_DAY}`} />
              <span>Level Up</span>
            </div>
            <div className="flex items-center gap-1">
              <div className={`w-3 h-3 rounded ${EVENT_COLORS.SICKNESS}`} />
              <span>Sickness</span>
            </div>
            <div className="flex items-center gap-1">
              <div className={`w-3 h-3 rounded ${EVENT_COLORS.OTHER_ABSENCE}`} />
              <span>Other</span>
            </div>
            <div className="flex items-center gap-1">
              <div className={`w-3 h-3 rounded ${EVENT_COLORS.BANK_HOLIDAY}`} />
              <span>Bank Holiday</span>
            </div>
          </div>
        </div>
      </div>

      {/* Month Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {months.map((month) => {
          const monthStart = startOfMonth(month);
          const monthEnd = endOfMonth(month);
          const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

          // Pad to start from Monday
          const firstDayOfWeek = monthStart.getDay() || 7; // Convert Sunday (0) to 7
          const paddingDays = firstDayOfWeek - 1;

          return (
            <div
              key={month.toString()}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-4"
            >
              <h3 className="text-sm font-semibold text-gray-900 mb-3">
                {format(month, 'MMMM')}
              </h3>

              {/* Weekday Headers */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, idx) => (
                  <div
                    key={idx}
                    className="text-xs text-center text-gray-500 font-medium"
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Days Grid */}
              <div className="grid grid-cols-7 gap-1">
                {/* Padding for first week */}
                {Array.from({ length: paddingDays }).map((_, idx) => (
                  <div key={`padding-${idx}`} className="aspect-square" />
                ))}

                {/* Actual days */}
                {days.map((day) => {
                  const dayEvents = getEventsForDay(day);
                  const isWeekendDay = isWeekend(day);

                  return (
                    <div
                      key={day.toString()}
                      className={`aspect-square relative flex items-center justify-center text-xs rounded cursor-pointer transition-all hover:ring-2 hover:ring-indigo-200 ${
                        isWeekendDay ? 'bg-gray-50' : 'bg-white'
                      } border border-gray-200`}
                      title={dayEvents.map((e) => e.title).join(', ')}
                    >
                      <span className="text-gray-700 z-10">
                        {format(day, 'd')}
                      </span>

                      {/* Event indicators */}
                      {dayEvents.length > 0 && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div
                            className={`w-full h-full rounded ${
                              EVENT_COLORS[dayEvents[0].type]
                            } opacity-30`}
                          />
                        </div>
                      )}

                      {dayEvents.length > 1 && (
                        <div className="absolute bottom-0 right-0 w-2 h-2 bg-gray-900 rounded-full text-[8px] text-white flex items-center justify-center">
                          {dayEvents.length}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {events.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center mt-6">
          <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No events for {currentYear}
          </h3>
          <p className="text-gray-600">
            There are no absences or holidays recorded for this year.
          </p>
        </div>
      )}
    </div>
  );
}
