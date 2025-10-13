import { useState, useEffect } from 'react';
import { Monitor, Plus, CheckCircle, AlertTriangle } from 'lucide-react';
import * as healthSafetyService from '../../services/healthSafety.service';

export default function DSEAssessmentPage() {
  const [assessments, setAssessments] = useState<any[]>([]);
  const [overdue, setOverdue] = useState<any[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [all, overdueList] = await Promise.all([
        healthSafetyService.getAllDSEAssessments('org-1'),
        healthSafetyService.getDSEAssessmentsDueReview('org-1'),
      ]);
      setAssessments(all);
      setOverdue(overdueList);
    } catch (error) {
      console.error('Failed to load DSE assessments', error);
    }
  };

  const getRiskColor = (risk: string) => {
    const colors: Record<string, string> = {
      LOW: 'bg-green-100 text-green-700',
      MEDIUM: 'bg-yellow-100 text-yellow-700',
      HIGH: 'bg-red-100 text-red-700',
    };
    return colors[risk] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">DSE Assessments</h1>
          <p className="text-gray-600 mt-1">Display Screen Equipment Regulations 1992</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          New Assessment
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Total Assessments</p>
            <Monitor className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{assessments.length}</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Overdue Reviews</p>
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{overdue.length}</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Completed</p>
            <CheckCircle className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {assessments.filter(a => a.status === 'COMPLETED').length}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">High Risk</p>
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {assessments.filter(a => a.overallRisk === 'HIGH').length}
          </p>
        </div>
      </div>

      {/* Key Requirements */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4">DSE Regulations Requirements</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
            <div>
              <p className="font-medium text-gray-900">Habitual DSE Users</p>
              <p className="text-sm text-gray-600">Anyone using DSE for 1+ hour continuously or as significant part of work</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
            <div>
              <p className="font-medium text-gray-900">Workstation Assessment</p>
              <p className="text-sm text-gray-600">Assess display, keyboard, desk, chair, environment, and software</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
            <div>
              <p className="font-medium text-gray-900">Eye Tests</p>
              <p className="text-sm text-gray-600">Provide eye tests on request for DSE users</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
            <div>
              <p className="font-medium text-gray-900">Training</p>
              <p className="text-sm text-gray-600">Provide DSE training and information on safe use</p>
            </div>
          </div>
        </div>
      </div>

      {/* Overdue Reviews Alert */}
      {overdue.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-6">
          <h3 className="text-lg font-semibold text-red-900 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Assessments Due for Review
          </h3>
          <div className="space-y-3">
            {overdue.map((item) => (
              <div key={item.id} className="bg-white rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{item.employeeName}</p>
                    <p className="text-sm text-gray-600">Workstation: {item.workstation}</p>
                    <p className="text-xs text-red-600 mt-1">
                      Due: {new Date(item.nextReviewDate).toLocaleDateString()}
                    </p>
                  </div>
                  <button className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700">
                    Schedule Review
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Assessments Table */}
      <div className="bg-white rounded-xl shadow-sm">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold">DSE Assessments</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left p-4 font-medium text-gray-700">Assessment #</th>
                <th className="text-left p-4 font-medium text-gray-700">Employee</th>
                <th className="text-left p-4 font-medium text-gray-700">Workstation</th>
                <th className="text-left p-4 font-medium text-gray-700">Assessment Date</th>
                <th className="text-left p-4 font-medium text-gray-700">Overall Risk</th>
                <th className="text-left p-4 font-medium text-gray-700">Status</th>
                <th className="text-left p-4 font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {assessments.map((assessment) => (
                <tr key={assessment.id} className="border-t hover:bg-gray-50">
                  <td className="p-4 font-medium text-blue-600">{assessment.assessmentNumber}</td>
                  <td className="p-4">
                    <p className="font-medium text-gray-900">{assessment.employeeName}</p>
                    <p className="text-sm text-gray-500">{assessment.department}</p>
                  </td>
                  <td className="p-4 text-gray-600">{assessment.workstation}</td>
                  <td className="p-4 text-gray-600">{new Date(assessment.assessmentDate).toLocaleDateString()}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-sm ${getRiskColor(assessment.overallRisk)}`}>
                      {assessment.overallRisk}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      assessment.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                      assessment.status === 'REQUIRES_ACTION' ? 'bg-orange-100 text-orange-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {assessment.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">View Details</button>
                  </td>
                </tr>
              ))}
              {assessments.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-500">
                    No DSE assessments found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
