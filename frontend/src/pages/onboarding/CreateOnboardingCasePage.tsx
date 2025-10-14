import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, UserPlus, Calendar, Users } from 'lucide-react';
import { axiosInstance } from '../../lib/axios';
import { toast } from 'sonner';

export default function CreateOnboardingCasePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    candidateId: '',
    country: 'GB',
    site: '',
    department: '',
    jobTitle: '',
    hiringManagerId: '',
    buddyId: '',
    startDate: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axiosInstance.post('/onboarding/cases/from-offer', {
        ...formData,
        organizationId: 'ORG001',
      });

      toast.success('Onboarding case created successfully!');
      navigate('/onboarding/dashboard');
    } catch (error: any) {
      console.error('Failed to create case:', error);
      toast.error(error.response?.data?.message || 'Failed to create onboarding case');
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
            onClick={() => navigate('/onboarding/dashboard')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Onboarding
          </button>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <UserPlus className="w-8 h-8 text-blue-600" />
            Create Onboarding Case
          </h1>
          <p className="text-gray-600 mt-1">Set up a new hire onboarding journey</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-8">
          <div className="space-y-6">
            {/* New Hire Information */}
            <div>
              <h3 className="text-lg font-semibold mb-4">New Hire Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Candidate ID
                  </label>
                  <input
                    type="text"
                    value={formData.candidateId}
                    onChange={(e) => setFormData({ ...formData, candidateId: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="CAND001 (optional)"
                  />
                  <p className="text-xs text-gray-500 mt-1">Leave empty if creating from scratch</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Position Details */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Position Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Job Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.jobTitle}
                    onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g. Senior Developer"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Department *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g. Engineering"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Site/Location
                  </label>
                  <input
                    type="text"
                    value={formData.site}
                    onChange={(e) => setFormData({ ...formData, site: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g. London HQ"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Country *
                  </label>
                  <select
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="GB">United Kingdom</option>
                    <option value="US">United States</option>
                    <option value="ZA">South Africa</option>
                    <option value="NG">Nigeria</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Team Assignment */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Team Assignment</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hiring Manager ID *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.hiringManagerId}
                    onChange={(e) => setFormData({ ...formData, hiringManagerId: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="MGR001"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Buddy/Mentor ID
                  </label>
                  <input
                    type="text"
                    value={formData.buddyId}
                    onChange={(e) => setFormData({ ...formData, buddyId: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="EMP001 (optional)"
                  />
                  <p className="text-xs text-gray-500 mt-1">Assign a buddy to help with onboarding</p>
                </div>
              </div>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex gap-3">
                <Calendar className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-900">Automated Onboarding</p>
                  <p className="text-sm text-blue-700 mt-1">
                    Upon creation, the system will automatically:
                  </p>
                  <ul className="text-sm text-blue-700 mt-2 space-y-1 list-disc list-inside">
                    <li>Generate 4 category checklists (HR, IT, Manager, Employee)</li>
                    <li>Create equipment & access provision requests</li>
                    <li>Calculate probation end date (90 days)</li>
                    <li>Set up timeline milestones</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-4 mt-8 pt-6 border-t">
            <button
              type="button"
              onClick={() => navigate('/onboarding/dashboard')}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create Onboarding Case'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
