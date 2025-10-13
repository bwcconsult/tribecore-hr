import { useState, useEffect } from 'react';
import { Award, Plus, AlertCircle, Calendar, Users } from 'lucide-react';
import * as healthSafetyService from '../../services/healthSafety.service';

export default function TrainingManagementPage() {
  const [training, setTraining] = useState<any[]>([]);
  const [expiring, setExpiring] = useState<any[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    organizationId: 'org-1',
    employeeId: '',
    employeeName: '',
    department: '',
    jobRole: '',
    trainingType: 'FIRE_SAFETY',
    trainingTitle: '',
    provider: 'Internal',
    trainer: '',
    trainingDate: '',
    durationHours: 0,
    validityMonths: 12,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [allTraining, expiringTraining] = await Promise.all([
        healthSafetyService.getAllTraining('org-1'),
        healthSafetyService.getExpiringTraining('org-1', 30),
      ]);
      setTraining(allTraining);
      setExpiring(expiringTraining);
    } catch (error) {
      console.error('Failed to load training data', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await healthSafetyService.createTrainingRecord(formData);
      setShowCreateForm(false);
      loadData();
    } catch (error) {
      console.error('Failed to create training record', error);
    }
  };

  const trainingTypes = [
    'INDUCTION', 'FIRE_SAFETY', 'FIRST_AID', 'MANUAL_HANDLING', 
    'WORKING_AT_HEIGHT', 'COSHH', 'DSE', 'RISK_ASSESSMENT', 'PPE'
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Training Management</h1>
          <p className="text-gray-600 mt-1">Track employee competency & certification</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          Record Training
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Total Training</p>
            <Award className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{training.length}</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Expiring Soon</p>
            <AlertCircle className="w-5 h-5 text-orange-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{expiring.length}</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Completed</p>
            <Calendar className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {training.filter(t => t.status === 'COMPLETED').length}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Compliance Rate</p>
            <Users className="w-5 h-5 text-purple-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {training.length > 0 ? Math.round((training.filter(t => t.status === 'COMPLETED').length / training.length) * 100) : 0}%
          </p>
        </div>
      </div>

      {/* Expiring Training Alert */}
      {expiring.length > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-6 mb-6">
          <h3 className="text-lg font-semibold text-orange-900 mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            Training Expiring in Next 30 Days
          </h3>
          <div className="space-y-3">
            {expiring.map((item) => (
              <div key={item.id} className="bg-white rounded-lg p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">{item.employeeName}</p>
                  <p className="text-sm text-gray-600">{item.trainingTitle}</p>
                  <p className="text-xs text-orange-600 mt-1">
                    Expires: {new Date(item.expiryDate).toLocaleDateString()}
                  </p>
                </div>
                <button className="px-3 py-1 bg-orange-600 text-white rounded text-sm hover:bg-orange-700">
                  Schedule Refresher
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create Form Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <h2 className="text-2xl font-bold mb-4">Record Training</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Training Type</label>
                <select
                  value={formData.trainingType}
                  onChange={(e) => setFormData({ ...formData, trainingType: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  required
                >
                  {trainingTypes.map(type => (
                    <option key={type} value={type}>{type.replace(/_/g, ' ')}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Training Title</label>
                <input
                  type="text"
                  value={formData.trainingTitle}
                  onChange={(e) => setFormData({ ...formData, trainingTitle: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Employee ID</label>
                  <input
                    type="text"
                    value={formData.employeeId}
                    onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Employee Name</label>
                  <input
                    type="text"
                    value={formData.employeeName}
                    onChange={(e) => setFormData({ ...formData, employeeName: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Job Role</label>
                  <input
                    type="text"
                    value={formData.jobRole}
                    onChange={(e) => setFormData({ ...formData, jobRole: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Training Date</label>
                  <input
                    type="date"
                    value={formData.trainingDate}
                    onChange={(e) => setFormData({ ...formData, trainingDate: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Duration (hours)</label>
                  <input
                    type="number"
                    value={formData.durationHours}
                    onChange={(e) => setFormData({ ...formData, durationHours: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Valid for (months)</label>
                  <input
                    type="number"
                    value={formData.validityMonths}
                    onChange={(e) => setFormData({ ...formData, validityMonths: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Provider</label>
                <input
                  type="text"
                  value={formData.provider}
                  onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  required
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Record Training
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Training Records */}
      <div className="bg-white rounded-xl shadow-sm">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold">Training Records</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left p-4 font-medium text-gray-700">Employee</th>
                <th className="text-left p-4 font-medium text-gray-700">Training</th>
                <th className="text-left p-4 font-medium text-gray-700">Date</th>
                <th className="text-left p-4 font-medium text-gray-700">Expiry</th>
                <th className="text-left p-4 font-medium text-gray-700">Status</th>
                <th className="text-left p-4 font-medium text-gray-700">Certificate</th>
              </tr>
            </thead>
            <tbody>
              {training.map((record) => (
                <tr key={record.id} className="border-t hover:bg-gray-50">
                  <td className="p-4">
                    <p className="font-medium text-gray-900">{record.employeeName}</p>
                    <p className="text-sm text-gray-500">{record.department}</p>
                  </td>
                  <td className="p-4">
                    <p className="font-medium text-gray-900">{record.trainingTitle}</p>
                    <p className="text-sm text-gray-500">{record.trainingType?.replace(/_/g, ' ')}</p>
                  </td>
                  <td className="p-4 text-gray-600">{new Date(record.trainingDate).toLocaleDateString()}</td>
                  <td className="p-4 text-gray-600">
                    {record.expiryDate ? new Date(record.expiryDate).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      record.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                      record.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {record.status}
                    </span>
                  </td>
                  <td className="p-4">
                    {record.certificateIssued ? (
                      <span className="text-green-600 text-sm">✓ Issued</span>
                    ) : (
                      <span className="text-gray-400 text-sm">Not issued</span>
                    )}
                  </td>
                </tr>
              ))}
              {training.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500">
                    No training records found
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
