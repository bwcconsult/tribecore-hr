import { useState } from 'react';
import { Calendar, Sun, Plane, Users, TrendingUp, Plus } from 'lucide-react';

export default function HolidayPlannerPage() {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());

  const stats = {
    totalEntitlement: 25,
    taken: 12,
    scheduled: 5,
    remaining: 8,
  };

  const upcomingHolidays = [
    { id: '1', name: 'John Doe', startDate: '2025-10-20', endDate: '2025-10-24', days: 5 },
    { id: '2', name: 'Sarah Smith', startDate: '2025-10-27', endDate: '2025-10-29', days: 3 },
    { id: '3', name: 'Mike Johnson', startDate: '2025-11-03', endDate: '2025-11-10', days: 6 },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Holiday Planner</h1>
            <p className="text-gray-600 mt-1">Plan and manage annual leave requests</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <Plus className="w-4 h-4" />
            Request Holiday
          </button>
        </div>
      </div>

      {/* Leave Balance */}
      <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg p-6 mb-6 text-white">
        <h3 className="text-lg font-semibold mb-4">Your Leave Balance</h3>
        <div className="grid grid-cols-4 gap-4">
          <div>
            <p className="text-blue-100 text-sm">Total Entitlement</p>
            <p className="text-3xl font-bold mt-1">{stats.totalEntitlement}</p>
            <p className="text-blue-100 text-xs">days</p>
          </div>
          <div>
            <p className="text-blue-100 text-sm">Taken</p>
            <p className="text-3xl font-bold mt-1">{stats.taken}</p>
            <p className="text-blue-100 text-xs">days</p>
          </div>
          <div>
            <p className="text-blue-100 text-sm">Scheduled</p>
            <p className="text-3xl font-bold mt-1">{stats.scheduled}</p>
            <p className="text-blue-100 text-xs">days</p>
          </div>
          <div>
            <p className="text-blue-100 text-sm">Remaining</p>
            <p className="text-3xl font-bold mt-1">{stats.remaining}</p>
            <p className="text-blue-100 text-xs">days</p>
          </div>
        </div>

        <div className="mt-4">
          <div className="w-full bg-white/20 rounded-full h-3">
            <div
              className="bg-white h-3 rounded-full"
              style={{ width: `${(stats.taken / stats.totalEntitlement) * 100}%` }}
            />
          </div>
          <p className="text-sm text-blue-100 mt-2">{((stats.taken / stats.totalEntitlement) * 100).toFixed(1)}% used</p>
        </div>
      </div>

      {/* Upcoming Team Holidays */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            Team Holidays
          </h3>
          <div className="space-y-3">
            {upcomingHolidays.map((holiday) => (
              <div key={holiday.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{holiday.name}</p>
                    <p className="text-sm text-gray-600">
                      {new Date(holiday.startDate).toLocaleDateString()} - {new Date(holiday.endDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-blue-600">{holiday.days}</p>
                    <p className="text-xs text-gray-600">days</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4">Calendar View</h3>
          <div className="text-center">
            <p className="text-gray-500 py-8">Calendar widget coming soon...</p>
          </div>
        </div>
      </div>

      {/* Conflict Checker */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4">Avoid Clashes</h3>
        <p className="text-gray-600 mb-4">Check team availability before booking holidays</p>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800 text-sm">⚠️ 3 team members are on holiday during this week</p>
        </div>
      </div>
    </div>
  );
}
