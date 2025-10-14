import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, UserX, AlertCircle } from 'lucide-react';
import { axiosInstance } from '../../lib/axios';
import { toast } from 'sonner';

export default function CreateSeparationCasePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    employeeId: '',
    type: 'RESIGNATION',
    reasonCode: '',
    reasonDetails: '',
    proposedLeaveDate: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axiosInstance.post('/offboarding/cases', {
        ...formData,
        organizationId: 'ORG001',
        createdBy: 'USER001',
      });

      toast.success('Separation case created successfully!');
      navigate('/offboarding/dashboard');
    } catch (error: any) {
      console.error('Failed to create case:', error);
      toast.error(error.response?.data?.message || 'Failed to create separation case');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/offboarding/dashboard')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Offboarding
          </button>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <UserX className="w-8 h-8 text-red-600" />
            New Separation Case
          </h1>
          <p className="text-gray-600 mt-1">Create an employee exit case</p>
        </div>

        {/* Alert */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-900">Sensitive Process</p>
              <p className="text-sm text-amber-700 mt-1">
                Separation cases are confidential. Ensure you have proper authorization before proceeding.
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-8">
          <div className="space-y-6">
            {/* Employee Information */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Employee Information</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Employee ID *
                </label>
                <input
                  type="text"
                  required
                  value={formData.employeeId}
                  onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="EMP001"
                />
                <p className="text-xs text-gray-500 mt-1">Enter the employee's ID from the system</p>
              </div>
            </div>

            {/* Separation Details */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Separation Details</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Separation Type *
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  >
                    <option value="RESIGNATION">Resignation (Voluntary)</option>
                    <option value="RETIREMENT">Retirement</option>
                    <option value="DISMISSAL_CONDUCT">Dismissal - Conduct</option>
                    <option value="DISMISSAL_PERFORMANCE">Dismissal - Performance</option>
                    <option value="REDUNDANCY_INDIVIDUAL">Redundancy (Individual)</option>
                    <option value="REDUNDANCY_COLLECTIVE">Redundancy (Collective)</option>
                    <option value="MUTUAL_AGREEMENT">Mutual Agreement</option>
                    <option value="END_OF_CONTRACT">End of Contract</option>
                    <option value="PROBATION_FAILURE">Probation Failure</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reason Code
                  </label>
                  <select
                    value={formData.reasonCode}
                    onChange={(e) => setFormData({ ...formData, reasonCode: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  >
                    <option value="">Select a reason...</option>
                    <option value="BETTER_OPPORTUNITY">Better Opportunity</option>
                    <option value="CAREER_CHANGE">Career Change</option>
                    <option value="RELOCATION">Relocation</option>
                    <option value="PERSONAL_REASONS">Personal Reasons</option>
                    <option value="WORK_LIFE_BALANCE">Work-Life Balance</option>
                    <option value="COMPENSATION">Compensation</option>
                    <option value="PERFORMANCE_ISSUES">Performance Issues</option>
                    <option value="MISCONDUCT">Misconduct</option>
                    <option value="BUSINESS_CLOSURE">Business Closure</option>
                    <option value="ROLE_REDUNDANT">Role Redundant</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Details
                  </label>
                  <textarea
                    rows={4}
                    value={formData.reasonDetails}
                    onChange={(e) => setFormData({ ...formData, reasonDetails: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="Provide any additional context or details about the separation..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Proposed Last Working Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.proposedLeaveDate}
                    onChange={(e) => setFormData({ ...formData, proposedLeaveDate: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Note: This may be adjusted based on notice period calculations
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-4 mt-8 pt-6 border-t">
            <button
              type="button"
              onClick={() => navigate('/offboarding/dashboard')}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create Separation Case'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
