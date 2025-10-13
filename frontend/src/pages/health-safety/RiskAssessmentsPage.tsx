import { useState } from 'react';
import { Shield, Plus, Search, Filter, Download } from 'lucide-react';

export default function RiskAssessmentsPage() {
  const [selectedFilter, setSelectedFilter] = useState('all');

  const assessments = [
    {
      id: '1',
      refNumber: 'RA-2025001',
      title: 'Office workstation assessment',
      location: 'Main Office',
      status: 'APPROVED',
      riskLevel: 'LOW',
      lastReview: '2025-09-15',
      nextReview: '2026-09-15',
      assessedBy: 'John Doe',
    },
    {
      id: '2',
      refNumber: 'RA-2025002',
      title: 'Warehouse operations',
      location: 'Warehouse A',
      status: 'REQUIRES_ACTION',
      riskLevel: 'HIGH',
      lastReview: '2025-08-20',
      nextReview: '2025-11-20',
      assessedBy: 'Sarah Smith',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Risk Assessments</h1>
            <p className="text-gray-600 mt-1">Manage and track all workplace risk assessments</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <Plus className="w-4 h-4" />
            New Assessment
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search assessments..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <Filter className="w-4 h-4" />
            Filters
          </button>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Assessments List */}
      <div className="bg-white rounded-xl shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="text-left p-4 font-medium text-gray-700">Ref Number</th>
                <th className="text-left p-4 font-medium text-gray-700">Title</th>
                <th className="text-left p-4 font-medium text-gray-700">Location</th>
                <th className="text-left p-4 font-medium text-gray-700">Risk Level</th>
                <th className="text-left p-4 font-medium text-gray-700">Status</th>
                <th className="text-left p-4 font-medium text-gray-700">Next Review</th>
                <th className="text-left p-4 font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {assessments.map((assessment) => (
                <tr key={assessment.id} className="border-b hover:bg-gray-50">
                  <td className="p-4 font-medium text-blue-600">{assessment.refNumber}</td>
                  <td className="p-4">{assessment.title}</td>
                  <td className="p-4 text-gray-600">{assessment.location}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      assessment.riskLevel === 'LOW' ? 'bg-green-100 text-green-700' :
                      assessment.riskLevel === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {assessment.riskLevel}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs ${
                      assessment.status === 'APPROVED' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                    }`}>
                      {assessment.status}
                    </span>
                  </td>
                  <td className="p-4 text-gray-600">{new Date(assessment.nextReview).toLocaleDateString()}</td>
                  <td className="p-4">
                    <button className="text-blue-600 hover:text-blue-800 text-sm">View</button>
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
