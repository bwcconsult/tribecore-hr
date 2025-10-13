import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, DollarSign, TrendingUp, Calendar, Plus, Filter, Activity, CheckCircle, ArrowRight, Settings } from 'lucide-react';

export default function OvertimePage() {
  const navigate = useNavigate();
  const mockRequests = [
    {
      id: '1',
      date: '2025-10-15',
      hours: 4,
      type: 'REGULAR',
      status: 'APPROVED',
      calculatedPay: 120,
      reason: 'Project deadline',
    },
    {
      id: '2',
      date: '2025-10-18',
      hours: 6,
      type: 'WEEKEND',
      status: 'PENDING',
      calculatedPay: 240,
      reason: 'Emergency support',
    },
  ];

  const stats = {
    totalHours: 42.5,
    totalEarnings: 1275,
    pendingRequests: 3,
    approvedThisMonth: 8,
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Overtime Tracker</h1>
            <p className="text-gray-600 mt-1">Track and manage overtime hours</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <Plus className="w-4 h-4" />
            Request Overtime
          </button>
        </div>
      </div>

      {/* Quick Access Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div 
          onClick={() => navigate('/overtime/capture')}
          className="bg-white rounded-xl shadow-sm p-6 hover:shadow-lg transition-shadow cursor-pointer border-2 border-transparent hover:border-blue-500"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-lg">Time Clock</h3>
                  <p className="text-sm text-gray-600">Clock in/out & track shifts</p>
                </div>
              </div>
              <div className="mt-3 space-y-1">
                <p className="text-xs text-gray-600">✓ One-click clock in/out</p>
                <p className="text-xs text-gray-600">✓ Real-time fatigue monitoring</p>
                <p className="text-xs text-gray-600">✓ Comp-time balance tracking</p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400" />
          </div>
        </div>

        <div 
          onClick={() => navigate('/overtime/approvals')}
          className="bg-white rounded-xl shadow-sm p-6 hover:shadow-lg transition-shadow cursor-pointer border-2 border-transparent hover:border-green-500"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-lg">Manager Approvals</h3>
                  <p className="text-sm text-gray-600">Review & approve overtime</p>
                </div>
              </div>
              <div className="mt-3 space-y-1">
                <p className="text-xs text-gray-600">✓ Bulk approve operations</p>
                <p className="text-xs text-gray-600">✓ Fatigue & budget indicators</p>
                <p className="text-xs text-gray-600">✓ Detailed calculation breakdown</p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Hours</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalHours}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Earnings</p>
              <p className="text-2xl font-bold text-green-600 mt-1">${stats.totalEarnings}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-orange-600 mt-1">{stats.pendingRequests}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Approved This Month</p>
              <p className="text-2xl font-bold text-purple-600 mt-1">{stats.approvedThisMonth}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Requests Table */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4">Overtime Requests</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="text-left p-3 font-medium text-gray-700">Date</th>
                <th className="text-left p-3 font-medium text-gray-700">Hours</th>
                <th className="text-left p-3 font-medium text-gray-700">Type</th>
                <th className="text-left p-3 font-medium text-gray-700">Reason</th>
                <th className="text-left p-3 font-medium text-gray-700">Pay</th>
                <th className="text-left p-3 font-medium text-gray-700">Status</th>
              </tr>
            </thead>
            <tbody>
              {mockRequests.map((req) => (
                <tr key={req.id} className="border-b hover:bg-gray-50">
                  <td className="p-3">{new Date(req.date).toLocaleDateString()}</td>
                  <td className="p-3 font-medium">{req.hours}h</td>
                  <td className="p-3">
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm">
                      {req.type}
                    </span>
                  </td>
                  <td className="p-3 text-sm text-gray-600">{req.reason}</td>
                  <td className="p-3 font-medium text-green-600">${req.calculatedPay}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded text-sm ${
                      req.status === 'APPROVED' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                    }`}>
                      {req.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
