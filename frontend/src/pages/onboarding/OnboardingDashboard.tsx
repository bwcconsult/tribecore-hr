import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, Calendar, CheckCircle, Clock, AlertTriangle, TrendingUp } from 'lucide-react';
import { axiosInstance } from '../../lib/axios';

export default function OnboardingDashboard() {
  const navigate = useNavigate();
  const [cases, setCases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCases();
  }, []);

  const loadCases = async () => {
    try {
      const response = await axiosInstance.get('/onboarding/cases', {
        params: { organizationId: 'ORG001' }
      });
      setCases(response.data || []);
    } catch (error) {
      console.error('Failed to load cases:', error);
      setCases([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      OFFER_PENDING: 'bg-yellow-100 text-yellow-700',
      OFFER_SIGNED: 'bg-blue-100 text-blue-700',
      PRE_BOARDING: 'bg-purple-100 text-purple-700',
      IN_PROGRESS: 'bg-orange-100 text-orange-700',
      COMPLETED: 'bg-green-100 text-green-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <UserPlus className="w-8 h-8 text-blue-600" />
              Onboarding Pipeline
            </h1>
            <p className="text-gray-600 mt-1">Manage new hire onboarding from offer to day 90</p>
          </div>
          <button
            onClick={() => navigate('/onboarding/create')}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-md"
          >
            <UserPlus className="w-5 h-5" />
            Create Onboarding Case
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Cases</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{cases.length}</p>
            </div>
            <UserPlus className="w-10 h-10 text-blue-600" />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Starting This Week</p>
              <p className="text-3xl font-bold text-orange-600 mt-1">
                {cases.filter(c => {
                  const days = Math.ceil((new Date(c.startDate).getTime() - Date.now()) / (1000*60*60*24));
                  return days >= 0 && days <= 7;
                }).length}
              </p>
            </div>
            <Calendar className="w-10 h-10 text-orange-600" />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Ready for Day 1</p>
              <p className="text-3xl font-bold text-green-600 mt-1">
                {cases.filter(c => c.provisioningComplete && c.rightToWorkVerified).length}
              </p>
            </div>
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Issues</p>
              <p className="text-3xl font-bold text-red-600 mt-1">
                {cases.filter(c => !c.backgroundCheckComplete || !c.rightToWorkVerified).length}
              </p>
            </div>
            <AlertTriangle className="w-10 h-10 text-red-600" />
          </div>
        </div>
      </div>

      {/* Timeline View */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4">Upcoming Starts</h3>
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Loading onboarding cases...</p>
          </div>
        ) : cases.length === 0 ? (
          <div className="text-center py-12">
            <UserPlus className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg font-medium mb-2">No onboarding cases yet</p>
            <p className="text-gray-400 mb-6">Create your first onboarding case to get started</p>
            <button
              onClick={() => navigate('/onboarding/create')}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Create Onboarding Case
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {cases.slice(0, 10).map(caseItem => (
            <div
              key={caseItem.id}
              onClick={() => navigate(`/onboarding/${caseItem.id}`)}
              className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <UserPlus className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{caseItem.jobTitle}</p>
                      <p className="text-sm text-gray-600">{caseItem.department}</p>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {new Date(caseItem.startDate).toLocaleDateString()}
                  </p>
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(caseItem.status)}`}>
                    {caseItem.status.replace('_', ' ')}
                  </span>
                </div>
                <div className="ml-4">
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Readiness</p>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${caseItem.completionPercentage || 0}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">{caseItem.completionPercentage || 0}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
          </div>
        )}
      </div>
    </div>
  );
}
