import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  AlertTriangle,
  AlertCircle,
  Info,
  ShieldAlert,
  TrendingUp,
  TrendingDown,
  User,
  DollarSign,
  Search,
  Filter,
} from 'lucide-react';
import axiosInstance from '../../lib/axios';

interface Anomaly {
  employeeId: string;
  employeeName: string;
  type: 'SALARY_SPIKE' | 'MISSING_DEDUCTION' | 'UNUSUAL_HOURS' | 'TAX_ANOMALY';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  description: string;
  currentValue: number;
  expectedValue: number;
  deviation: number;
}

interface AnomalyData {
  anomalies: Anomaly[];
  summary: {
    totalAnomalies: number;
    criticalCount: number;
    highCount: number;
    mediumCount: number;
    lowCount: number;
  };
}

const AnomalyDetectionDashboard: React.FC = () => {
  const [filter, setFilter] = React.useState<string>('ALL');
  const [searchTerm, setSearchTerm] = React.useState('');

  const { data: anomalyData, isLoading } = useQuery<AnomalyData>({
    queryKey: ['anomalies'],
    queryFn: async () => {
      const response = await axiosInstance.get('/payroll/advanced/anomalies');
      return response.data;
    },
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'HIGH':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'LOW':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return <ShieldAlert className="w-5 h-5" />;
      case 'HIGH':
        return <AlertTriangle className="w-5 h-5" />;
      case 'MEDIUM':
        return <AlertCircle className="w-5 h-5" />;
      case 'LOW':
        return <Info className="w-5 h-5" />;
      default:
        return <Info className="w-5 h-5" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'SALARY_SPIKE':
        return 'Salary Spike';
      case 'MISSING_DEDUCTION':
        return 'Missing Deduction';
      case 'UNUSUAL_HOURS':
        return 'Unusual Hours';
      case 'TAX_ANOMALY':
        return 'Tax Anomaly';
      default:
        return type;
    }
  };

  const filteredAnomalies = anomalyData?.anomalies.filter((anomaly) => {
    const matchesFilter = filter === 'ALL' || anomaly.severity === filter;
    const matchesSearch =
      searchTerm === '' ||
      anomaly.employeeName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-3 bg-gradient-to-br from-red-500 to-orange-600 rounded-xl shadow-lg">
            <ShieldAlert className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
              Anomaly Detection
            </h1>
            <p className="text-gray-600 mt-1">
              AI-powered payroll anomaly detection & alerts
            </p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-gray-400">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 font-medium">Total Anomalies</span>
            <AlertCircle className="w-6 h-6 text-gray-400" />
          </div>
          <p className="text-3xl font-bold text-gray-800">
            {anomalyData?.summary.totalAnomalies || 0}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-red-500">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 font-medium">Critical</span>
            <ShieldAlert className="w-6 h-6 text-red-500" />
          </div>
          <p className="text-3xl font-bold text-red-600">
            {anomalyData?.summary.criticalCount || 0}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-orange-500">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 font-medium">High</span>
            <AlertTriangle className="w-6 h-6 text-orange-500" />
          </div>
          <p className="text-3xl font-bold text-orange-600">
            {anomalyData?.summary.highCount || 0}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-yellow-500">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 font-medium">Medium</span>
            <AlertCircle className="w-6 h-6 text-yellow-500" />
          </div>
          <p className="text-3xl font-bold text-yellow-600">
            {anomalyData?.summary.mediumCount || 0}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 font-medium">Low</span>
            <Info className="w-6 h-6 text-blue-500" />
          </div>
          <p className="text-3xl font-bold text-blue-600">
            {anomalyData?.summary.lowCount || 0}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-100">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by employee name..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex gap-2">
            <Filter className="w-5 h-5 text-gray-400 self-center" />
            {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((severity) => (
              <button
                key={severity}
                onClick={() => setFilter(severity)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  filter === severity
                    ? 'bg-red-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {severity}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Anomalies List */}
      <div className="space-y-4">
        {filteredAnomalies && filteredAnomalies.length > 0 ? (
          filteredAnomalies.map((anomaly, index) => (
            <div
              key={index}
              className={`bg-white rounded-xl shadow-lg p-6 border-l-4 ${
                getSeverityColor(anomaly.severity).split(' ')[0]
              } hover:shadow-xl transition-shadow`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <div className={`p-3 rounded-lg border ${getSeverityColor(anomaly.severity)}`}>
                    {getSeverityIcon(anomaly.severity)}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-800">
                        {anomaly.employeeName}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getSeverityColor(anomaly.severity)}`}>
                        {anomaly.severity}
                      </span>
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-300">
                        {getTypeLabel(anomaly.type)}
                      </span>
                    </div>

                    <p className="text-gray-700 mb-4">{anomaly.description}</p>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <DollarSign className="w-4 h-4 text-gray-500" />
                          <span className="text-sm text-gray-600">Current Value</span>
                        </div>
                        <p className="text-lg font-bold text-gray-800">
                          ${anomaly.currentValue.toLocaleString()}
                        </p>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <DollarSign className="w-4 h-4 text-gray-500" />
                          <span className="text-sm text-gray-600">Expected Value</span>
                        </div>
                        <p className="text-lg font-bold text-gray-800">
                          ${anomaly.expectedValue.toLocaleString()}
                        </p>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1">
                          {anomaly.deviation > 0 ? (
                            <TrendingUp className="w-4 h-4 text-red-500" />
                          ) : (
                            <TrendingDown className="w-4 h-4 text-green-500" />
                          )}
                          <span className="text-sm text-gray-600">Deviation</span>
                        </div>
                        <p className={`text-lg font-bold ${anomaly.deviation > 0 ? 'text-red-600' : 'text-green-600'}`}>
                          {(anomaly.deviation * 100).toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    Investigate
                  </button>
                  <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center border border-gray-100">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShieldAlert className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              No Anomalies Detected
            </h3>
            <p className="text-gray-600">
              All payroll data looks normal. Great job!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnomalyDetectionDashboard;
