import { useState } from 'react';
import { Users, Calendar, CheckCircle, AlertCircle } from 'lucide-react';

export default function ResponsibilitiesPage() {
  const responsibilities = [
    {
      id: '1',
      title: 'Fire Safety Inspection',
      category: 'Fire Safety',
      assignedTo: 'John Doe',
      dueDate: '2025-10-20',
      status: 'IN_PROGRESS',
      completionPercentage: 60,
    },
    {
      id: '2',
      title: 'First Aid Kit Check',
      category: 'First Aid',
      assignedTo: 'Sarah Smith',
      dueDate: '2025-10-15',
      status: 'OVERDUE',
      completionPercentage: 0,
    },
    {
      id: '3',
      title: 'PPE Stock Review',
      category: 'PPE',
      assignedTo: 'Mike Johnson',
      dueDate: '2025-10-25',
      status: 'ASSIGNED',
      completionPercentage: 0,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">H&S Responsibilities Navigator</h1>
        <p className="text-gray-600 mt-1">Distribute and track health & safety tasks</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <p className="text-sm text-gray-600">Total Tasks</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">28</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <p className="text-sm text-gray-600">Completed</p>
          <p className="text-3xl font-bold text-green-600 mt-1">18</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <p className="text-sm text-gray-600">In Progress</p>
          <p className="text-3xl font-bold text-blue-600 mt-1">7</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <p className="text-sm text-gray-600">Overdue</p>
          <p className="text-3xl font-bold text-red-600 mt-1">3</p>
        </div>
      </div>

      {/* Responsibilities List */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4">Active Responsibilities</h3>
        <div className="space-y-4">
          {responsibilities.map((resp) => (
            <div key={resp.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 mb-2">{resp.title}</h4>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {resp.assignedTo}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      Due: {new Date(resp.dueDate).toLocaleDateString()}
                    </div>
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">{resp.category}</span>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 ${
                  resp.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                  resp.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700' :
                  resp.status === 'OVERDUE' ? 'bg-red-100 text-red-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {resp.status === 'COMPLETED' && <CheckCircle className="w-4 h-4" />}
                  {resp.status === 'OVERDUE' && <AlertCircle className="w-4 h-4" />}
                  {resp.status}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${
                    resp.status === 'OVERDUE' ? 'bg-red-500' : 'bg-blue-500'
                  }`}
                  style={{ width: `${resp.completionPercentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
