import { useState } from 'react';
import { AlertTriangle, Plus, Calendar, MapPin } from 'lucide-react';

export default function IncidentReportingPage() {
  const incidents = [
    {
      id: '1',
      incidentNumber: 'INC-2025001',
      title: 'Slip on wet floor',
      type: 'ACCIDENT',
      severity: 'MINOR',
      date: '2025-10-12',
      location: 'Warehouse',
      status: 'INVESTIGATED',
      reportedBy: 'John Doe',
    },
    {
      id: '2',
      incidentNumber: 'INC-2025002',
      title: 'Near miss - falling object',
      type: 'NEAR_MISS',
      severity: 'MODERATE',
      date: '2025-10-11',
      location: 'Loading Bay',
      status: 'UNDER_INVESTIGATION',
      reportedBy: 'Sarah Smith',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Incident Reporting</h1>
            <p className="text-gray-600 mt-1">Report and investigate workplace incidents and near misses</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
            <Plus className="w-4 h-4" />
            Report Incident
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        {[
          { label: 'Total Incidents', value: '45', color: 'red' },
          { label: 'Near Misses', value: '24', color: 'orange' },
          { label: 'Under Investigation', value: '3', color: 'yellow' },
          { label: 'RIDDOR Reportable', value: '2', color: 'purple' },
        ].map((stat, idx) => (
          <div key={idx} className="bg-white rounded-xl shadow-sm p-6">
            <p className="text-sm text-gray-600">{stat.label}</p>
            <p className={`text-3xl font-bold mt-1 text-${stat.color}-600`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Incidents List */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4">Recent Incidents</h3>
        <div className="space-y-4">
          {incidents.map((incident) => (
            <div key={incident.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-semibold text-gray-900">{incident.title}</h4>
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">{incident.incidentNumber}</span>
                    <span className={`px-2 py-1 rounded text-xs ${
                      incident.type === 'ACCIDENT' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
                    }`}>
                      {incident.type}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(incident.date).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {incident.location}
                    </div>
                    <div>Reported by: {incident.reportedBy}</div>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    incident.severity === 'MINOR' ? 'bg-yellow-100 text-yellow-700' :
                    incident.severity === 'MODERATE' ? 'bg-orange-100 text-orange-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {incident.severity}
                  </span>
                  <p className="text-sm text-gray-600 mt-2">{incident.status}</p>
                </div>
              </div>
              <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">View Details →</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
