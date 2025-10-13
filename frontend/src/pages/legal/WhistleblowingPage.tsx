import { useState, useEffect } from 'react';
import { AlertTriangle, Shield, Eye, Lock, Plus } from 'lucide-react';
import * as employmentLawService from '../../services/employmentLaw.service';

export default function WhistleblowingPage() {
  const [cases, setCases] = useState<any[]>([]);
  const [showReportForm, setShowReportForm] = useState(false);
  const [formData, setFormData] = useState({
    organizationId: 'org-1',
    reporterId: '',
    isAnonymous: false,
    category: 'CRIMINAL_OFFENCE',
    incidentDate: '',
    disclosure: '',
    publicInterestRationale: '',
    individualsInvolved: [] as string[],
    departments: [] as string[],
  });

  useEffect(() => {
    loadCases();
  }, []);

  const loadCases = async () => {
    try {
      const data = await employmentLawService.getAllWhistleblowingCases('org-1');
      setCases(data);
    } catch (error) {
      console.error('Failed to load whistleblowing cases', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await employmentLawService.createWhistleblowingCase(formData);
      setShowReportForm(false);
      loadCases();
    } catch (error) {
      console.error('Failed to create whistleblowing case', error);
    }
  };

  const categories = [
    'CRIMINAL_OFFENCE',
    'BREACH_OF_LEGAL_OBLIGATION',
    'MISCARRIAGE_OF_JUSTICE',
    'DANGER_TO_HEALTH_SAFETY',
    'ENVIRONMENTAL_DAMAGE',
    'COVER_UP',
    'FINANCIAL_MISCONDUCT',
    'DISCRIMINATION',
  ];

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      SUBMITTED: 'bg-blue-100 text-blue-700',
      ACKNOWLEDGED: 'bg-purple-100 text-purple-700',
      UNDER_INVESTIGATION: 'bg-yellow-100 text-yellow-700',
      INVESTIGATION_COMPLETE: 'bg-cyan-100 text-cyan-700',
      ACTION_TAKEN: 'bg-green-100 text-green-700',
      NO_ACTION_REQUIRED: 'bg-gray-100 text-gray-700',
      CLOSED: 'bg-gray-100 text-gray-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Whistleblowing & Protected Disclosures</h1>
          <p className="text-gray-600 mt-1">Public Interest Disclosure Act 1998</p>
        </div>
        <button
          onClick={() => setShowReportForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
        >
          <Plus className="w-4 h-4" />
          Report Concern
        </button>
      </div>

      {/* Key Information Banner */}
      <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-8 mb-6 text-white">
        <div className="flex items-start gap-4">
          <Shield className="w-16 h-16 flex-shrink-0" />
          <div>
            <h2 className="text-2xl font-bold mb-2">Protected by Law</h2>
            <p className="text-orange-100 mb-4">
              Workers who make a qualifying disclosure are protected from dismissal and detriment under the Employment Rights Act 1996.
            </p>
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2">
                <Lock className="w-5 h-5" />
                <span>Confidential reporting</span>
              </div>
              <div className="flex items-center gap-2">
                <Eye className="w-5 h-5" />
                <span>Anonymous option</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                <span>Protection from retaliation</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Total Cases</p>
            <AlertTriangle className="w-5 h-5 text-orange-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{cases.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Under Investigation</p>
            <Eye className="w-5 h-5 text-yellow-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {cases.filter(c => c.status === 'UNDER_INVESTIGATION').length}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Anonymous Reports</p>
            <Lock className="w-5 h-5 text-purple-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {cases.filter(c => c.isAnonymous).length}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Action Taken</p>
            <Shield className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {cases.filter(c => c.status === 'ACTION_TAKEN').length}
          </p>
        </div>
      </div>

      {/* Report Form Modal */}
      {showReportForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <h2 className="text-2xl font-bold mb-4">Report a Concern</h2>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-blue-900">
                Your disclosure is protected by law if it's made in the public interest. You can report anonymously if you prefer.
              </p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isAnonymous}
                  onChange={(e) => setFormData({ ...formData, isAnonymous: e.target.checked })}
                  className="w-4 h-4"
                />
                <label className="text-sm font-medium text-gray-700">Report anonymously</label>
              </div>

              {!formData.isAnonymous && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Your ID (optional)</label>
                  <input
                    type="text"
                    value={formData.reporterId}
                    onChange={(e) => setFormData({ ...formData, reporterId: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  required
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat.replace(/_/g, ' ')}</option>
                  ))}
                </select>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Disclosure Details</label>
                <textarea
                  value={formData.disclosure}
                  onChange={(e) => setFormData({ ...formData, disclosure: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  rows={4}
                  required
                  placeholder="Describe what happened, when, where, and who was involved..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Public Interest Rationale</label>
                <textarea
                  value={formData.publicInterestRationale}
                  onChange={(e) => setFormData({ ...formData, publicInterestRationale: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  rows={3}
                  placeholder="Explain why this is in the public interest..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                >
                  Submit Report
                </button>
                <button
                  type="button"
                  onClick={() => setShowReportForm(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Qualifying Disclosures */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4">What is a Qualifying Disclosure?</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { title: 'Criminal Offence', desc: 'A crime has been, is being, or is likely to be committed' },
            { title: 'Legal Obligation', desc: 'Failure to comply with a legal obligation' },
            { title: 'Miscarriage of Justice', desc: 'A miscarriage of justice has occurred or is likely' },
            { title: 'Health & Safety', desc: 'Danger to health and safety of individuals' },
            { title: 'Environmental Damage', desc: 'Damage to the environment has occurred or is likely' },
            { title: 'Cover-Up', desc: 'Information about any of the above is being concealed' },
          ].map((item, idx) => (
            <div key={idx} className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">{item.title}</p>
                <p className="text-sm text-gray-600">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cases List */}
      <div className="bg-white rounded-xl shadow-sm">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold">Whistleblowing Cases</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left p-4 font-medium text-gray-700">Case Number</th>
                <th className="text-left p-4 font-medium text-gray-700">Category</th>
                <th className="text-left p-4 font-medium text-gray-700">Date</th>
                <th className="text-left p-4 font-medium text-gray-700">Type</th>
                <th className="text-left p-4 font-medium text-gray-700">Status</th>
                <th className="text-left p-4 font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {cases.map((caseItem) => (
                <tr key={caseItem.id} className="border-t hover:bg-gray-50">
                  <td className="p-4 font-medium text-blue-600">{caseItem.caseNumber}</td>
                  <td className="p-4 text-gray-600">{caseItem.category?.replace(/_/g, ' ')}</td>
                  <td className="p-4 text-gray-600">{new Date(caseItem.incidentDate).toLocaleDateString()}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs ${
                      caseItem.isAnonymous ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {caseItem.isAnonymous ? 'Anonymous' : 'Named'}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(caseItem.status)}`}>
                      {caseItem.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="p-4">
                    <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">View</button>
                  </td>
                </tr>
              ))}
              {cases.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500">
                    No whistleblowing cases reported
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
