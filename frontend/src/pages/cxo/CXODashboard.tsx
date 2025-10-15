import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { cxoService, ClientOnboardingCase } from '../../services/cxo.service';
import { RiskBadge } from '../../components/onboarding/RiskBadge';
import { Building, TrendingUp, AlertTriangle, Calendar, Plus } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function CXODashboard() {
  const navigate = useNavigate();
  const [cases, setCases] = useState<ClientOnboardingCase[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: '', tier: '', region: '' });

  useEffect(() => {
    loadData();
  }, [filters]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [casesData, statsData] = await Promise.all([
        cxoService.getCases({ organizationId: 'ORG001', ...filters }),
        cxoService.getDashboardStats('ORG001'),
      ]);
      setCases(casesData.data || []);
      setStats(statsData);
    } catch (error) {
      console.error('Failed to load CXO data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      INTAKE: 'bg-gray-100 text-gray-700',
      KICKOFF: 'bg-blue-100 text-blue-700',
      DUE_DILIGENCE: 'bg-purple-100 text-purple-700',
      SOLUTION_CONFIG: 'bg-yellow-100 text-yellow-700',
      CONTRACT_LIVE: 'bg-orange-100 text-orange-700',
      ENABLEMENT: 'bg-green-100 text-green-700',
      HYPERCARE: 'bg-teal-100 text-teal-700',
      STEADY_STATE: 'bg-emerald-100 text-emerald-700',
      ON_HOLD: 'bg-red-100 text-red-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Building className="w-8 h-8 text-blue-600" />
            Customer Onboarding Portfolio
          </h1>
          <p className="text-gray-600 mt-1">Manage client onboarding from sale to go-live</p>
        </div>
        <button
          onClick={() => navigate('/cxo/cases/create')}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-5 h-5" />
          New Client Case
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Cases</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats?.active || 0}</p>
            </div>
            <Building className="w-10 h-10 text-blue-600" />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">At Risk</p>
              <p className="text-3xl font-bold text-red-600 mt-1">{stats?.atRisk || 0}</p>
            </div>
            <AlertTriangle className="w-10 h-10 text-red-600" />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Go-Live This Month</p>
              <p className="text-3xl font-bold text-green-600 mt-1">{stats?.goLiveThisMonth || 0}</p>
            </div>
            <Calendar className="w-10 h-10 text-green-600" />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg. Time-to-Live</p>
              <p className="text-3xl font-bold text-purple-600 mt-1">{stats?.avgTimeToLive || 0}d</p>
            </div>
            <TrendingUp className="w-10 h-10 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="Search cases..."
            className="border rounded-lg px-3 py-2"
          />
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="border rounded-lg px-3 py-2"
          >
            <option value="">All Statuses</option>
            <option value="INTAKE">Intake</option>
            <option value="KICKOFF">Kickoff</option>
            <option value="DUE_DILIGENCE">Due Diligence</option>
            <option value="SOLUTION_CONFIG">Solution Config</option>
            <option value="ENABLEMENT">Enablement</option>
          </select>
          <select
            value={filters.tier}
            onChange={(e) => setFilters({ ...filters, tier: e.target.value })}
            className="border rounded-lg px-3 py-2"
          >
            <option value="">All Tiers</option>
            <option value="Standard">Standard</option>
            <option value="Professional">Professional</option>
            <option value="Enterprise">Enterprise</option>
          </select>
          <select
            value={filters.region}
            onChange={(e) => setFilters({ ...filters, region: e.target.value })}
            className="border rounded-lg px-3 py-2"
          >
            <option value="">All Regions</option>
            <option value="US">US</option>
            <option value="EU">EU</option>
            <option value="UK">UK</option>
            <option value="APAC">APAC</option>
          </select>
        </div>
      </div>

      {/* Cases Table */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Active Cases</h3>
          {loading ? (
            <div className="text-center py-12 text-gray-500">Loading cases...</div>
          ) : cases.length === 0 ? (
            <div className="text-center py-12 text-gray-500">No cases found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Account</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tier</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Region</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Risk</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Go-Live</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Progress</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {cases.map((caseItem) => (
                    <tr
                      key={caseItem.id}
                      onClick={() => navigate(`/cxo/cases/${caseItem.id}`)}
                      className="hover:bg-gray-50 cursor-pointer"
                    >
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900">{caseItem.account?.name || 'Unknown'}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          caseItem.tier === 'Enterprise' ? 'bg-purple-100 text-purple-700' :
                          caseItem.tier === 'Professional' ? 'bg-blue-100 text-blue-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {caseItem.tier}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{caseItem.region}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(caseItem.status)}`}>
                          {caseItem.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <RiskBadge level={caseItem.risk} />
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {formatDistanceToNow(new Date(caseItem.goLiveTarget), { addSuffix: true })}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${caseItem.completionPercentage}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium">{caseItem.completionPercentage}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
