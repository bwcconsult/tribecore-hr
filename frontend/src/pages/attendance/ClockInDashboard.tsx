import { useState, useEffect } from 'react';
import { Clock, MapPin, Users, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

export default function ClockInDashboard() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [clockInTime, setClockInTime] = useState<Date | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleClockIn = () => {
    setIsClockedIn(true);
    setClockInTime(new Date());
    toast.success('Clocked in successfully!');
  };

  const handleClockOut = () => {
    setIsClockedIn(false);
    toast.success('Clocked out successfully!');
  };

  const getHoursWorked = () => {
    if (!clockInTime) return '0:00';
    const diff = currentTime.getTime() - clockInTime.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}:${minutes.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Clock In/Out</h1>
        <p className="text-gray-600 mt-1">Track your work hours in real-time</p>
      </div>

      {/* Main Clock Card */}
      <div className="bg-white rounded-2xl shadow-xl p-8 mb-6 text-center">
        <div className="mb-6">
          <div className="text-6xl font-bold text-gray-900 mb-2">
            {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </div>
          <div className="text-xl text-gray-600">
            {currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </div>
        </div>

        {isClockedIn ? (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-700 font-medium">You're clocked in</p>
              <p className="text-2xl font-bold text-green-900 mt-2">Hours Worked: {getHoursWorked()}</p>
            </div>
            <button
              onClick={handleClockOut}
              className="w-full py-4 bg-red-600 text-white rounded-lg hover:bg-red-700 text-lg font-semibold"
            >
              Clock Out
            </button>
          </div>
        ) : (
          <button
            onClick={handleClockIn}
            className="w-full py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-lg font-semibold"
          >
            Clock In
          </button>
        )}

        <div className="mt-4 flex items-center justify-center gap-2 text-gray-600">
          <MapPin className="w-4 h-4" />
          <span className="text-sm">Office Location: Main HQ</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Today</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{isClockedIn ? getHoursWorked() : '0:00'}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">This Week</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">38:45</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">This Month</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">156:30</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4">Recent Clock-ins</h3>
        <div className="space-y-3">
          {[
            { date: '2025-10-12', clockIn: '09:00', clockOut: '17:30', hours: '8:30' },
            { date: '2025-10-11', clockIn: '08:55', clockOut: '17:25', hours: '8:30' },
            { date: '2025-10-10', clockIn: '09:05', clockOut: '17:35', hours: '8:30' },
          ].map((record, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">{new Date(record.date).toLocaleDateString()}</p>
                <p className="text-sm text-gray-600">
                  {record.clockIn} - {record.clockOut}
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-900">{record.hours}</p>
                <p className="text-xs text-gray-600">hours</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
