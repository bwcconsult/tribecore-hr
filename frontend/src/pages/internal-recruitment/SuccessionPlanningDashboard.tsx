import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Target,
  Award,
  Plus,
} from 'lucide-react';
import { axiosInstance } from '../../lib/axios';

export default function SuccessionPlanningDashboard() {
  const navigate = useNavigate();
  const [plans, setPlans] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const orgId = 'org-123';
      
      const [plansRes, statsRes] = await Promise.all([
        axiosInstance.get(`/api/v1/internal-recruitment/succession/organization/${orgId}`),
        axiosInstance.get(`/api/v1/internal-recruitment/succession/organization/${orgId}/stats`),
      ]);

      setPlans(plansRes.data);
      setStats(statsRes.data);
    } catch (error) {
      console.error('Error loading succession data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCriticalityColor = (level: string) => {
    const colors: Record<string, string> = {
      CRITICAL: 'bg-red-100 text-red-700',
      HIGH: 'bg-orange-100 text-orange-700',
      MEDIUM: 'bg-yellow-100 text-yellow-700',
      LOW: 'bg-green-100 text-green-700',
    };
    return colors[level] || 'bg-gray-100 text-gray-700';
  };

  const getReadinessColor = (level: string) => {
    const colors: Record<string, string> = {
      READY_NOW: 'bg-green-600',
      READY_1_YEAR: 'bg-blue-600',
      READY_2_YEARS: 'bg-yellow-600',
      READY_3_PLUS_YEARS: 'bg-orange-600',
      NOT_READY: 'bg-red-600',
    };
    return colors[level] || 'bg-gray-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading succession plans...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Succession Planning</h1>
          <p className="text-gray-600">Build talent pipelines for critical roles</p>
        </div>
        <button
          onClick={() => navigate('/internal-recruitment/succession/new')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          New Plan
        </button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-4">
              <div className="bg-blue-50 p-3 rounded-lg">
                <Target className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Positions</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalPositions}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-4">
              <div className="bg-red-50 p-3 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Critical</p>
                <p className="text-2xl font-bold text-red-600">{stats.critical}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-4">
              <div className="bg-green-50 p-3 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">With Successors</p>
                <p className="text-2xl font-bold text-green-600">{stats.withSuccessors}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-4">
              <div className="bg-purple-50 p-3 rounded-lg">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Ready Now</p>
                <p className="text-2xl font-bold text-purple-600">{stats.readyNow}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-4">
              <div className="bg-yellow-50 p-3 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">At Risk</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.atRisk}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Plans List */}
      <div className="bg-white rounded-xl shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Succession Plans</h2>
        </div>

        <div className="divide-y divide-gray-200">
          {plans.length === 0 ? (
            <div className="p-12 text-center">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">No succession plans created yet</p>
              <button
                onClick={() => navigate('/internal-recruitment/succession/new')}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Create First Plan
              </button>
            </div>
          ) : (
            plans.map((plan) => (
              <div key={plan.id} className="p-6 hover:bg-gray-50 transition">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-gray-900">{plan.positionTitle}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getCriticalityColor(plan.criticalityLevel)}`}>
                        {plan.criticalityLevel}
                      </span>
                    </div>
                    
                    <p className="text-gray-600 mb-1">
                      Department: <span className="font-semibold">{plan.departmentName}</span>
                    </p>
                    
                    {plan.incumbentName && (
                      <p className="text-gray-600 mb-1">
                        Current: <span className="font-semibold">{plan.incumbentName}</span>
                      </p>
                    )}

                    <p className="text-sm text-gray-500">
                      Plan Code: {plan.planCode}
                    </p>
                  </div>

                  <div className="text-right">
                    <div className="flex items-center gap-4 mb-2">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-blue-600">{plan.successorCount}</p>
                        <p className="text-xs text-gray-600">Successors</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-green-600">{plan.readyNowCount}</p>
                        <p className="text-xs text-gray-600">Ready Now</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-purple-600">
                          {plan.benchStrength ? `${plan.benchStrength}%` : 'N/A'}
                        </p>
                        <p className="text-xs text-gray-600">Bench Strength</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Successors */}
                {plan.successors && plan.successors.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-sm font-semibold text-gray-700 mb-3">Successors:</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {plan.successors.map((successor: any, idx: number) => (
                        <div
                          key={idx}
                          className="border border-gray-200 rounded-lg p-3"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <p className="font-semibold text-gray-900">{successor.employeeName}</p>
                              <p className="text-xs text-gray-600">{successor.currentPosition}</p>
                            </div>
                            {successor.isPrimarySuccessor && (
                              <Award className="w-4 h-4 text-yellow-500" />
                            )}
                          </div>
                          
                          <div className="flex items-center gap-2 mt-2">
                            <div className={`w-full h-2 rounded-full ${getReadinessColor(successor.readinessLevel)}`}></div>
                          </div>
                          <p className="text-xs text-gray-600 mt-1">
                            {successor.readinessLevel.replace(/_/g, ' ')}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Fit Score: {successor.overallFitScore}%
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => navigate(`/internal-recruitment/succession/${plan.id}`)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    View Details
                  </button>
                  <button
                    onClick={() => navigate(`/internal-recruitment/succession/${plan.id}/add-successor`)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Add Successor
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
