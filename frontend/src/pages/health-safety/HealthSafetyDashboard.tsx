import { useState } from 'react';
import { Shield, AlertTriangle, CheckCircle, FileText, Users, TrendingUp, Plus, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import ReportIncidentModal from '../../components/health-safety/ReportIncidentModal';
import CreateRiskAssessmentModal from '../../components/health-safety/CreateRiskAssessmentModal';

export default function HealthSafetyDashboard() {
  const [showIncidentModal, setShowIncidentModal] = useState(false);
  const [showRiskModal, setShowRiskModal] = useState(false);
  const stats = {
    riskAssessments: 156,
    incidents: 8,
    nearMisses: 24,
    complianceRate: 95,
    overdueActions: 5,
    trainingCompleted: 142,
  };

  const recentIncidents = [
    { id: '1', title: 'Slip on wet floor', date: '2025-10-12', severity: 'MINOR', status: 'INVESTIGATED' },
    { id: '2', title: 'Near miss - falling object', date: '2025-10-11', severity: 'MODERATE', status: 'UNDER_INVESTIGATION' },
  ];

  const overdueRisks = [
    { id: '1', title: 'Loading bay risk assessment', dueDate: '2025-10-01', owner: 'John Doe' },
    { id: '2', title: 'Office fire safety review', dueDate: '2025-10-05', owner: 'Sarah Smith' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Health & Safety</h1>
            <p className="text-gray-600 mt-1">Protect your business and employees from risks</p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => setShowIncidentModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
              Report Incident
            </button>
            <button 
              onClick={() => setShowRiskModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <Shield className="w-4 h-4" />
              New Risk Assessment
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Risk Assessments</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.riskAssessments}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Shield className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Incidents</p>
              <p className="text-2xl font-bold text-red-600 mt-1">{stats.incidents}</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Near Misses</p>
              <p className="text-2xl font-bold text-orange-600 mt-1">{stats.nearMisses}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Compliance Rate</p>
              <p className="text-2xl font-bold text-green-600 mt-1">{stats.complianceRate}%</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Overdue Actions</p>
              <p className="text-2xl font-bold text-yellow-600 mt-1">{stats.overdueActions}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Training Complete</p>
              <p className="text-2xl font-bold text-purple-600 mt-1">{stats.trainingCompleted}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <button className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow text-left">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
            <Shield className="w-6 h-6 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Risk Management</h3>
          <p className="text-gray-600 text-sm">Create and manage risk assessments with 600+ templates</p>
        </button>

        <button className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow text-left">
          <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Incident Reporting</h3>
          <p className="text-gray-600 text-sm">Report and investigate accidents in real-time</p>
        </button>

        <button className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow text-left">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
            <FileText className="w-6 h-6 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Method Statements</h3>
          <p className="text-gray-600 text-sm">Create HSE compliant method statements</p>
        </button>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Incidents</h3>
          <div className="space-y-3">
            {recentIncidents.map((incident) => (
              <div key={incident.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">{incident.title}</h4>
                  <span className={`px-2 py-1 rounded text-xs ${
                    incident.severity === 'MINOR' ? 'bg-yellow-100 text-yellow-700' : 'bg-orange-100 text-orange-700'
                  }`}>
                    {incident.severity}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>{new Date(incident.date).toLocaleDateString()}</span>
                  <span className="text-blue-600">{incident.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4">Overdue Risk Assessments</h3>
          <div className="space-y-3">
            {overdueRisks.map((risk) => (
              <div key={risk.id} className="border border-red-200 bg-red-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">{risk.title}</h4>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Owner: {risk.owner}</span>
                  <span className="text-red-600 font-medium">Due: {new Date(risk.dueDate).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modals */}
      <ReportIncidentModal
        isOpen={showIncidentModal}
        onClose={() => setShowIncidentModal(false)}
        onSubmit={async (data) => {
          const response = await fetch('/api/health-safety/incidents', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
          });
          if (!response.ok) throw new Error('Failed to create incident');
          return response.json();
        }}
      />
      
      <CreateRiskAssessmentModal
        isOpen={showRiskModal}
        onClose={() => setShowRiskModal(false)}
        onSubmit={async (data) => {
          const response = await fetch('/api/health-safety/risk-assessments', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
          });
          if (!response.ok) throw new Error('Failed to create assessment');
          return response.json();
        }}
      />
    </div>
  );
}
