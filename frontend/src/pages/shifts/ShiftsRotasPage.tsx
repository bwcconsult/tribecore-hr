import { useState } from 'react';
import { Calendar, Clock, Users, Plus, Filter, Download, Upload, Settings } from 'lucide-react';
import { toast } from 'sonner';

interface Shift {
  id: string;
  employeeId: string;
  employeeName: string;
  startTime: string;
  endTime: string;
  shiftType: 'REGULAR' | 'OVERTIME' | 'NIGHT_SHIFT' | 'WEEKEND';
  location: string;
  department: string;
  status: 'DRAFT' | 'PUBLISHED' | 'IN_PROGRESS' | 'COMPLETED';
  isOpenShift: boolean;
  totalHours: number;
}

export default function ShiftsRotasPage() {
  const [selectedView, setSelectedView] = useState<'calendar' | 'list'>('calendar');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const mockShifts: Shift[] = [
    {
      id: '1',
      employeeId: 'emp1',
      employeeName: 'John Doe',
      startTime: '2025-10-13T09:00:00',
      endTime: '2025-10-13T17:00:00',
      shiftType: 'REGULAR',
      location: 'Office A',
      department: 'Sales',
      status: 'PUBLISHED',
      isOpenShift: false,
      totalHours: 8,
    },
    {
      id: '2',
      employeeId: '',
      employeeName: '',
      startTime: '2025-10-14T09:00:00',
      endTime: '2025-10-14T17:00:00',
      shiftType: 'REGULAR',
      location: 'Office B',
      department: 'Support',
      status: 'DRAFT',
      isOpenShift: true,
      totalHours: 8,
    },
  ];

  const stats = {
    totalShifts: 156,
    openShifts: 12,
    coverageRate: 92.3,
    totalHours: 1248,
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Shifts & Rotas</h1>
            <p className="text-gray-600 mt-1">Manage team schedules and shift assignments</p>
          </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <Download className="w-4 h-4" />
              Export
            </button>
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <Upload className="w-4 h-4" />
              Import
            </button>
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <Settings className="w-4 h-4" />
              Templates
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
              Create Rota
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Shifts</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalShifts}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Open Shifts</p>
              <p className="text-2xl font-bold text-orange-600 mt-1">{stats.openShifts}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Coverage Rate</p>
              <p className="text-2xl font-bold text-green-600 mt-1">{stats.coverageRate}%</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Hours</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalHours}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters and View Toggle */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <Filter className="w-4 h-4" />
              Filters
            </button>
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="all">All Departments</option>
              <option value="sales">Sales</option>
              <option value="support">Support</option>
              <option value="engineering">Engineering</option>
            </select>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setSelectedView('calendar')}
              className={`px-4 py-2 rounded-lg ${
                selectedView === 'calendar'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Calendar View
            </button>
            <button
              onClick={() => setSelectedView('list')}
              className={`px-4 py-2 rounded-lg ${
                selectedView === 'list'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              List View
            </button>
          </div>
        </div>
      </div>

      {/* Calendar/List View */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        {selectedView === 'calendar' ? (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-4">Week View</h3>
            <div className="grid grid-cols-7 gap-2">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                <div key={day} className="text-center font-medium text-gray-700 p-2 bg-gray-50 rounded">
                  {day}
                </div>
              ))}
              {Array.from({ length: 7 }).map((_, i) => (
                <div key={i} className="border border-gray-200 rounded-lg p-3 min-h-[200px]">
                  <div className="text-sm text-gray-600 mb-2">{13 + i}</div>
                  {mockShifts
                    .filter((shift) => new Date(shift.startTime).getDate() === 13 + i)
                    .map((shift) => (
                      <div
                        key={shift.id}
                        className={`p-2 rounded mb-2 text-xs ${
                          shift.isOpenShift
                            ? 'bg-orange-100 border border-orange-300'
                            : 'bg-blue-100 border border-blue-300'
                        }`}
                      >
                        <div className="font-medium">
                          {shift.isOpenShift ? 'OPEN SHIFT' : shift.employeeName}
                        </div>
                        <div className="text-gray-600">
                          {new Date(shift.startTime).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}{' '}
                          -{' '}
                          {new Date(shift.endTime).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                        <div className="text-gray-500">{shift.location}</div>
                      </div>
                    ))}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div>
            <h3 className="text-lg font-semibold mb-4">Shift List</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    <th className="text-left p-3 font-medium text-gray-700">Employee</th>
                    <th className="text-left p-3 font-medium text-gray-700">Date & Time</th>
                    <th className="text-left p-3 font-medium text-gray-700">Location</th>
                    <th className="text-left p-3 font-medium text-gray-700">Department</th>
                    <th className="text-left p-3 font-medium text-gray-700">Hours</th>
                    <th className="text-left p-3 font-medium text-gray-700">Status</th>
                    <th className="text-left p-3 font-medium text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {mockShifts.map((shift) => (
                    <tr key={shift.id} className="border-b hover:bg-gray-50">
                      <td className="p-3">
                        {shift.isOpenShift ? (
                          <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded text-sm">
                            Open Shift
                          </span>
                        ) : (
                          shift.employeeName
                        )}
                      </td>
                      <td className="p-3 text-sm text-gray-600">
                        {new Date(shift.startTime).toLocaleDateString()} <br />
                        {new Date(shift.startTime).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}{' '}
                        -{' '}
                        {new Date(shift.endTime).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="p-3 text-sm">{shift.location}</td>
                      <td className="p-3 text-sm">{shift.department}</td>
                      <td className="p-3 text-sm font-medium">{shift.totalHours}h</td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            shift.status === 'PUBLISHED'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {shift.status}
                        </span>
                      </td>
                      <td className="p-3">
                        <button className="text-blue-600 hover:text-blue-800 text-sm">Edit</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
