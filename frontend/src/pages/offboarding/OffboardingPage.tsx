import { useState } from 'react';
import { UserX, CheckCircle, Clock, AlertTriangle, FileText, Calendar } from 'lucide-react';

export default function OffboardingPage() {
  const [selectedTab, setSelectedTab] = useState<'active' | 'completed'>('active');

  const mockProcesses = [
    {
      id: '1',
      employeeName: 'John Smith',
      department: 'Engineering',
      reason: 'RESIGNATION',
      lastWorkingDay: '2025-10-31',
      status: 'IN_PROGRESS',
      completionPercentage: 65,
      tasksCompleted: 13,
      tasksTotal: 20,
    },
    {
      id: '2',
      employeeName: 'Sarah Johnson',
      department: 'Sales',
      reason: 'REDUNDANCY',
      lastWorkingDay: '2025-11-15',
      status: 'PLANNED',
      completionPercentage: 20,
      tasksCompleted: 4,
      tasksTotal: 20,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Offboarding & Redundancy</h1>
        <p className="text-gray-600 mt-1">Manage employee exits and redundancy processes</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Processes</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">8</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-green-600 mt-1">24</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Redundancies</p>
              <p className="text-2xl font-bold text-orange-600 mt-1">3</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Exit Interviews</p>
              <p className="text-2xl font-bold text-purple-600 mt-1">15</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Processes List */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4">Offboarding Processes</h3>
        <div className="space-y-4">
          {mockProcesses.map((process) => (
            <div key={process.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="font-semibold text-gray-900">{process.employeeName}</h4>
                  <p className="text-sm text-gray-600">{process.department}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm ${
                  process.reason === 'REDUNDANCY' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
                }`}>
                  {process.reason}
                </span>
              </div>

              <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Last Day: {new Date(process.lastWorkingDay).toLocaleDateString()}
                </div>
                <div>
                  Tasks: {process.tasksCompleted}/{process.tasksTotal}
                </div>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full" 
                  style={{ width: `${process.completionPercentage}%` }}
                />
              </div>
              <p className="text-sm text-gray-600">{process.completionPercentage}% complete</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
