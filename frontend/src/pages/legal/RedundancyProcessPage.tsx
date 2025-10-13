import { useState, useEffect } from 'react';
import { Users, FileText, Plus, ChevronRight } from 'lucide-react';
import * as employmentLawService from '../../services/employmentLaw.service';

export default function RedundancyProcessPage() {
  const [processes, setProcesses] = useState<any[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedProcess, setSelectedProcess] = useState<any>(null);
  const [formData, setFormData] = useState({
    organizationId: 'org-1',
    reason: 'RESTRUCTURING',
    businessJustification: '',
    proposedRedundancies: 0,
    proposedStartDate: '',
    consultationType: 'INDIVIDUAL',
    consultationDays: 0,
    leadHRContact: '',
  });

  useEffect(() => {
    loadProcesses();
  }, []);

  const loadProcesses = async () => {
    try {
      const data = await employmentLawService.getAllRedundancyProcesses('org-1');
      setProcesses(data);
    } catch (error) {
      console.error('Failed to load redundancy processes', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await employmentLawService.createRedundancyProcess(formData);
      setShowCreateForm(false);
      loadProcesses();
    } catch (error) {
      console.error('Failed to create redundancy process', error);
    }
  };

  const redundancyReasons = [
    'BUSINESS_CLOSURE', 'WORKPLACE_CLOSURE', 'REDUCED_WORKFORCE',
    'ROLE_NO_LONGER_REQUIRED', 'RESTRUCTURING', 'BUSINESS_SALE'
  ];

  const getStageColor = (stage: string) => {
    const colors: Record<string, string> = {
      PLANNING: 'bg-blue-100 text-blue-700',
      SELECTION_POOL_DEFINED: 'bg-purple-100 text-purple-700',
      CRITERIA_SET: 'bg-indigo-100 text-indigo-700',
      CONSULTATION_STARTED: 'bg-yellow-100 text-yellow-700',
      INDIVIDUAL_CONSULTATION: 'bg-orange-100 text-orange-700',
      ALTERNATIVE_EMPLOYMENT_OFFERED: 'bg-cyan-100 text-cyan-700',
      NOTICE_ISSUED: 'bg-red-100 text-red-700',
      COMPLETED: 'bg-green-100 text-green-700',
    };
    return colors[stage] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Redundancy Process Management</h1>
          <p className="text-gray-600 mt-1">Fair and compliant redundancy procedures</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          New Process
        </button>
      </div>

      {/* Process Steps Guide */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4">7-Step Fair Redundancy Process</h3>
        <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
          {[
            { step: '1', title: 'Plan & Confirm', desc: 'Business need' },
            { step: '2', title: 'Selection Pool', desc: 'Define at-risk roles' },
            { step: '3', title: 'Criteria', desc: 'Fair & objective' },
            { step: '4', title: 'Consultation', desc: 'Meaningful dialogue' },
            { step: '5', title: 'Alt. Roles', desc: 'Suitable employment' },
            { step: '6', title: 'Notice', desc: 'Formal notification' },
            { step: '7', title: 'Payment', desc: 'Calculate & pay' },
          ].map((item, idx) => (
            <div key={idx} className="text-center">
              <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center mx-auto mb-2 font-bold">
                {item.step}
              </div>
              <p className="font-medium text-sm text-gray-900">{item.title}</p>
              <p className="text-xs text-gray-600">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Active Processes</p>
            <Users className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {processes.filter(p => p.status !== 'COMPLETED').length}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Total Proposed</p>
            <Users className="w-5 h-5 text-orange-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {processes.reduce((sum, p) => sum + p.proposedRedundancies, 0)}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">In Consultation</p>
            <FileText className="w-5 h-5 text-yellow-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {processes.filter(p => p.status.includes('CONSULTATION')).length}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Completed</p>
            <Users className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {processes.filter(p => p.status === 'COMPLETED').length}
          </p>
        </div>
      </div>

      {/* Create Form Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <h2 className="text-2xl font-bold mb-4">Start Redundancy Process</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Redundancy Reason</label>
                <select
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  required
                >
                  {redundancyReasons.map(r => (
                    <option key={r} value={r}>{r.replace(/_/g, ' ')}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Business Justification</label>
                <textarea
                  value={formData.businessJustification}
                  onChange={(e) => setFormData({ ...formData, businessJustification: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  rows={3}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Proposed Redundancies</label>
                <input
                  type="number"
                  value={formData.proposedRedundancies}
                  onChange={(e) => setFormData({ ...formData, proposedRedundancies: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Proposed Start Date</label>
                <input
                  type="date"
                  value={formData.proposedStartDate}
                  onChange={(e) => setFormData({ ...formData, proposedStartDate: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Consultation Type</label>
                <select
                  value={formData.consultationType}
                  onChange={(e) => setFormData({ ...formData, consultationType: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  required
                >
                  <option value="INDIVIDUAL">Individual (fewer than 20)</option>
                  <option value="COLLECTIVE">Collective (20+)</option>
                </select>
              </div>

              {formData.consultationType === 'COLLECTIVE' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Consultation Days</label>
                  <select
                    value={formData.consultationDays}
                    onChange={(e) => setFormData({ ...formData, consultationDays: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    required
                  >
                    <option value="30">30 days (20-99 redundancies)</option>
                    <option value="45">45 days (100+ redundancies)</option>
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Lead HR Contact</label>
                <input
                  type="text"
                  value={formData.leadHRContact}
                  onChange={(e) => setFormData({ ...formData, leadHRContact: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  required
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Start Process
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

      {/* Processes List */}
      <div className="bg-white rounded-xl shadow-sm">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold">Redundancy Processes</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left p-4 font-medium text-gray-700">Process #</th>
                <th className="text-left p-4 font-medium text-gray-700">Reason</th>
                <th className="text-left p-4 font-medium text-gray-700">Proposed</th>
                <th className="text-left p-4 font-medium text-gray-700">Type</th>
                <th className="text-left p-4 font-medium text-gray-700">Stage</th>
                <th className="text-left p-4 font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {processes.map((process) => (
                <tr key={process.id} className="border-t hover:bg-gray-50">
                  <td className="p-4 font-medium text-blue-600">{process.processNumber}</td>
                  <td className="p-4 text-gray-600">{process.reason?.replace(/_/g, ' ')}</td>
                  <td className="p-4 text-gray-600">{process.proposedRedundancies}</td>
                  <td className="p-4 text-gray-600">{process.consultationType}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-sm ${getStageColor(process.status)}`}>
                      {process.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="p-4">
                    <button className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1">
                      Manage <ChevronRight className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {processes.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500">
                    No redundancy processes initiated
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
