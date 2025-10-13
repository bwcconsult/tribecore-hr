import { useState, useEffect } from 'react';
import { Shield, Plus, Search, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import * as employmentLawService from '../../services/employmentLaw.service';

export default function EqualityCompliancePage() {
  const [equalityCases, setEqualityCases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    organizationId: 'org-1',
    employeeId: '',
    reportedBy: '',
    protectedCharacteristic: 'AGE',
    discriminationType: 'DIRECT',
    incidentDate: '',
    description: '',
    witnessStatements: '',
    witnesses: [] as string[],
    allegedDiscriminator: '',
  });

  useEffect(() => {
    loadEqualityCases();
  }, []);

  const loadEqualityCases = async () => {
    try {
      const data = await employmentLawService.getAllEqualityCases('org-1');
      setEqualityCases(data);
    } catch (error) {
      console.error('Failed to load equality cases', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await employmentLawService.createEqualityCase(formData);
      setShowCreateForm(false);
      loadEqualityCases();
      setFormData({
        organizationId: 'org-1',
        employeeId: '',
        reportedBy: '',
        protectedCharacteristic: 'AGE',
        discriminationType: 'DIRECT',
        incidentDate: '',
        description: '',
        witnessStatements: '',
        witnesses: [],
        allegedDiscriminator: '',
      });
    } catch (error) {
      console.error('Failed to create equality case', error);
    }
  };

  const protectedCharacteristics = [
    'AGE', 'DISABILITY', 'GENDER_REASSIGNMENT', 'MARRIAGE_CIVIL_PARTNERSHIP',
    'PREGNANCY_MATERNITY', 'RACE', 'RELIGION_BELIEF', 'SEX', 'SEXUAL_ORIENTATION'
  ];

  const discriminationTypes = ['DIRECT', 'INDIRECT', 'HARASSMENT', 'VICTIMISATION', 'FAILURE_TO_MAKE_ADJUSTMENTS'];

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      REPORTED: 'bg-blue-100 text-blue-700',
      UNDER_INVESTIGATION: 'bg-yellow-100 text-yellow-700',
      MEDIATION: 'bg-purple-100 text-purple-700',
      RESOLVED: 'bg-green-100 text-green-700',
      ESCALATED_TO_TRIBUNAL: 'bg-red-100 text-red-700',
      CLOSED: 'bg-gray-100 text-gray-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Equality Act 2010 Compliance</h1>
          <p className="text-gray-600 mt-1">Anti-discrimination & protected characteristics</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          Report Case
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Total Cases</p>
            <Shield className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{equalityCases.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Under Investigation</p>
            <Clock className="w-5 h-5 text-yellow-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {equalityCases.filter(c => c.status === 'UNDER_INVESTIGATION').length}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Resolved</p>
            <CheckCircle className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {equalityCases.filter(c => c.status === 'RESOLVED').length}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Tribunal Cases</p>
            <AlertCircle className="w-5 h-5 text-red-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {equalityCases.filter(c => c.escalatedToTribunal).length}
          </p>
        </div>
      </div>

      {/* Create Form Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <h2 className="text-2xl font-bold mb-4">Report Equality Case</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Protected Characteristic</label>
                <select
                  value={formData.protectedCharacteristic}
                  onChange={(e) => setFormData({ ...formData, protectedCharacteristic: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  required
                >
                  {protectedCharacteristics.map(pc => (
                    <option key={pc} value={pc}>{pc.replace(/_/g, ' ')}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Discrimination Type</label>
                <select
                  value={formData.discriminationType}
                  onChange={(e) => setFormData({ ...formData, discriminationType: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  required
                >
                  {discriminationTypes.map(dt => (
                    <option key={dt} value={dt}>{dt.replace(/_/g, ' ')}</option>
                  ))}
                </select>
              </div>

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
                <label className="block text-sm font-medium text-gray-700 mb-1">Reported By</label>
                <input
                  type="text"
                  value={formData.reportedBy}
                  onChange={(e) => setFormData({ ...formData, reportedBy: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Incident Date</label>
                <input
                  type="date"
                  value={formData.incidentDate}
                  onChange={(e) => setFormData({ ...formData, incidentDate: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  rows={4}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Alleged Discriminator</label>
                <input
                  type="text"
                  value={formData.allegedDiscriminator}
                  onChange={(e) => setFormData({ ...formData, allegedDiscriminator: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Submit Case
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

      {/* Cases List */}
      <div className="bg-white rounded-xl shadow-sm">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold">Equality Cases</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left p-4 font-medium text-gray-700">Case Number</th>
                <th className="text-left p-4 font-medium text-gray-700">Characteristic</th>
                <th className="text-left p-4 font-medium text-gray-700">Type</th>
                <th className="text-left p-4 font-medium text-gray-700">Date</th>
                <th className="text-left p-4 font-medium text-gray-700">Status</th>
                <th className="text-left p-4 font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {equalityCases.map((caseItem) => (
                <tr key={caseItem.id} className="border-t hover:bg-gray-50">
                  <td className="p-4 font-medium text-blue-600">{caseItem.caseNumber}</td>
                  <td className="p-4 text-gray-600">{caseItem.protectedCharacteristic?.replace(/_/g, ' ')}</td>
                  <td className="p-4 text-gray-600">{caseItem.discriminationType?.replace(/_/g, ' ')}</td>
                  <td className="p-4 text-gray-600">{new Date(caseItem.incidentDate).toLocaleDateString()}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(caseItem.status)}`}>
                      {caseItem.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="p-4">
                    <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">View Details</button>
                  </td>
                </tr>
              ))}
              {equalityCases.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500">
                    No equality cases reported
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
