import { useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Download, Filter, Users } from 'lucide-react';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, subMonths, isToday, isSameMonth, parseISO } from 'date-fns';

type CalendarView = 'day' | 'week' | 'month' | 'timeline' | 'annual';
type CalendarScope = 'self' | 'team' | 'directReports' | 'organization';

interface CalendarEvent {
  id: string;
  type: 'HOLIDAY' | 'BIRTHDAY' | 'LEVEL_UP_DAY' | 'SICKNESS' | 'OTHER_ABSENCE' | 'BANK_HOLIDAY';
  title: string;
  startDate: string;
  endDate: string;
  color: string;
  user?: {
    firstName: string;
    lastName: string;
  };
  metadata?: {
    approvedBy?: string;
    status?: string;
  };
}

const EVENT_COLORS = {
  HOLIDAY: 'bg-green-500',
  BIRTHDAY: 'bg-red-500',
  LEVEL_UP_DAY: 'bg-teal-500',
  SICKNESS: 'bg-red-600',
  OTHER_ABSENCE: 'bg-blue-500',
  BANK_HOLIDAY: 'border-2 border-gray-400 bg-gray-100',
};

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<CalendarView>('month');
  const [scope, setScope] = useState<CalendarScope>('self');
  const [selectedTypes, setSelectedTypes] = useState<string[]>([
    'HOLIDAY',
    'BIRTHDAY',
    'LEVEL_UP_DAY',
    'SICKNESS',
    'OTHER_ABSENCE',
    'BANK_HOLIDAY',
  ]);

  // Mock events - replace with API call
  const events: CalendarEvent[] = [];

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const daysInView = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const handlePrevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const handleToday = () => setCurrentDate(new Date());

  const getEventsForDay = (day: Date) => {
    return events.filter((event) => {
      const eventStart = parseISO(event.startDate);
      const eventEnd = parseISO(event.endDate);
      return day >= eventStart && day <= eventEnd;
    });
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
          <Calendar className="w-6 h-6" />
          Calendar
        </h1>
        <p className="text-gray-600">
          View team absences, holidays, and important dates
        </p>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Navigation */}
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevMonth}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleToday}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Today
            </button>
            <button
              onClick={handleNextMonth}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-semibold text-gray-900 ml-4">
              {format(currentDate, 'MMMM yyyy')}
            </h2>
          </div>

          {/* View Selector */}
          <div className="flex items-center gap-2">
            <select
              value={view}
              onChange={(e) => setView(e.target.value as CalendarView)}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="day">Day</option>
              <option value="week">Week</option>
              <option value="month">Month</option>
              <option value="timeline">Timeline</option>
              <option value="annual">Annual</option>
            </select>

            <select
              value={scope}
              onChange={(e) => setScope(e.target.value as CalendarScope)}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="self">Myself</option>
              <option value="directReports">My Direct Reports</option>
              <option value="team">My Team</option>
              <option value="organization">Organization</option>
            </select>

            <button className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Filter
            </button>

            <button className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2">
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex items-center gap-6 flex-wrap">
          <span className="text-sm font-medium text-gray-700">Legend:</span>
          <div className="flex items-center gap-2">
            <div className={`w-4 h-4 rounded ${EVENT_COLORS.HOLIDAY}`} />
            <span className="text-sm text-gray-600">Holiday</span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-4 h-4 rounded ${EVENT_COLORS.BIRTHDAY}`} />
            <span className="text-sm text-gray-600">Birthday</span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-4 h-4 rounded ${EVENT_COLORS.LEVEL_UP_DAY}`} />
            <span className="text-sm text-gray-600">Level Up Days</span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-4 h-4 rounded ${EVENT_COLORS.SICKNESS}`} />
            <span className="text-sm text-gray-600">Sickness</span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-4 h-4 rounded ${EVENT_COLORS.OTHER_ABSENCE}`} />
            <span className="text-sm text-gray-600">Other Absence</span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-4 h-4 ${EVENT_COLORS.BANK_HOLIDAY}`} />
            <span className="text-sm text-gray-600">Bank Holiday</span>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {/* Weekday Headers */}
        <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
            <div
              key={day}
              className="p-3 text-center text-sm font-medium text-gray-700"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7">
          {daysInView.map((day, dayIdx) => {
            const dayEvents = getEventsForDay(day);
            const isCurrentMonth = isSameMonth(day, currentDate);
            const isCurrentDay = isToday(day);

            return (
              <div
                key={day.toString()}
                className={`min-h-[120px] border-b border-r border-gray-200 p-2 ${
                  !isCurrentMonth ? 'bg-gray-50' : 'bg-white'
                } ${isCurrentDay ? 'bg-blue-50' : ''} hover:bg-gray-50 transition-colors`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`text-sm font-medium ${
                      !isCurrentMonth
                        ? 'text-gray-400'
                        : isCurrentDay
                        ? 'text-indigo-600 font-bold'
                        : 'text-gray-900'
                    }`}
                  >
                    {format(day, 'd')}
                  </span>
                </div>

                {/* Events */}
                <div className="space-y-1">
                  {dayEvents.slice(0, 3).map((event) => (
                    <div
                      key={event.id}
                      className={`text-xs p-1 rounded text-white truncate cursor-pointer hover:opacity-80 transition-opacity ${
                        EVENT_COLORS[event.type]
                      }`}
                      title={`${event.user?.firstName || ''} - ${event.title}`}
                    >
                      {event.user?.firstName || event.title}
                    </div>
                  ))}
                  {dayEvents.length > 3 && (
                    <div className="text-xs text-gray-500 text-center">
                      +{dayEvents.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Empty State */}
      {events.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center mt-6">
          <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No events to display
          </h3>
          <p className="text-gray-600">
            There are no events scheduled for the selected period and filters.
          </p>
        </div>
      )}
    </div>
  );
}
