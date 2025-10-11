import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  DollarSign,
  Calendar,
  Activity,
  ArrowRight,
} from 'lucide-react';
import { expenseService } from '../../services/expense.service';

interface BudgetHealth {
  budgetId: string;
  budgetName: string;
  period: string;
  allocated: number;
  spent: number;
  committed: number;
  forecasted: number;
  remaining: number;
  utilizationPercentage: number;
  projectedUtilization: number;
  status: 'healthy' | 'warning' | 'critical' | 'exceeded';
  daysRemaining: number;
  burnRate: number;
  recommendedDailySpend: number;
  alerts: string[];
}

const BudgetHealthPage: React.FC = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['budget-health'],
    queryFn: async () => {
      const response = await fetch('/api/v1/expenses/forecast/budget-health', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      return response.json();
    },
    refetchInterval: 60000, // Refresh every minute
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'critical':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'exceeded':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case 'critical':
        return <AlertTriangle className="w-5 h-5 text-orange-600" />;
      case 'exceeded':
        return <AlertTriangle className="w-5 h-5 text-red-600" />;
      default:
        return null;
    }
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">Failed to load budget health data</p>
      </div>
    );
  }

  const { summary, budgets } = data || { summary: {}, budgets: [] };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Budget Health Monitor</h1>
        <p className="text-gray-600 mt-1">
          Real-time budget tracking and forecasting
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Budgets</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {summary.totalBudgets || 0}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <DollarSign className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Healthy</p>
              <p className="text-2xl font-bold text-green-600 mt-1">
                {summary.healthy || 0}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Warning</p>
              <p className="text-2xl font-bold text-yellow-600 mt-1">
                {summary.warning || 0}
              </p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <AlertTriangle className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Critical/Exceeded</p>
              <p className="text-2xl font-bold text-red-600 mt-1">
                {(summary.critical || 0) + (summary.exceeded || 0)}
              </p>
            </div>
            <div className="p-3 bg-red-100 rounded-full">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Budget Cards */}
      <div className="space-y-4">
        {budgets.map((budget: BudgetHealth) => (
          <div
            key={budget.budgetId}
            className="bg-white rounded-lg shadow overflow-hidden"
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {budget.budgetName}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1 flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    {budget.period}
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(
                      budget.status,
                    )}`}
                  >
                    {budget.status.charAt(0).toUpperCase() + budget.status.slice(1)}
                  </span>
                  {getStatusIcon(budget.status)}
                </div>
              </div>
            </div>

            {/* Budget Details */}
            <div className="p-6">
              {/* Progress Bar */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    Budget Utilization
                  </span>
                  <span className="text-sm font-semibold text-gray-900">
                    {budget.utilizationPercentage.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className={`h-3 rounded-full transition-all ${
                      budget.utilizationPercentage >= 100
                        ? 'bg-red-500'
                        : budget.utilizationPercentage >= 90
                        ? 'bg-orange-500'
                        : budget.utilizationPercentage >= 75
                        ? 'bg-yellow-500'
                        : 'bg-green-500'
                    }`}
                    style={{
                      width: `${Math.min(budget.utilizationPercentage, 100)}%`,
                    }}
                  />
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div>
                  <p className="text-xs text-gray-500 uppercase font-medium">
                    Allocated
                  </p>
                  <p className="text-lg font-semibold text-gray-900 mt-1">
                    {formatCurrency(budget.allocated)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-medium">Spent</p>
                  <p className="text-lg font-semibold text-gray-900 mt-1">
                    {formatCurrency(budget.spent)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-medium">
                    Committed
                  </p>
                  <p className="text-lg font-semibold text-orange-600 mt-1">
                    {formatCurrency(budget.committed)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-medium">
                    Remaining
                  </p>
                  <p className="text-lg font-semibold text-green-600 mt-1">
                    {formatCurrency(budget.remaining)}
                  </p>
                </div>
              </div>

              {/* Forecasting Section */}
              <div className="bg-blue-50 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-semibold text-gray-900 flex items-center">
                    <Activity className="w-4 h-4 mr-2 text-blue-600" />
                    Forecast & Burn Rate
                  </h4>
                  <span className="text-xs text-gray-600">
                    {budget.daysRemaining} days remaining
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-4 mt-3">
                  <div>
                    <p className="text-xs text-gray-600">Daily Burn Rate</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {formatCurrency(budget.burnRate)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Recommended Daily</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {formatCurrency(budget.recommendedDailySpend)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Projected Total</p>
                    <p
                      className={`text-sm font-semibold ${
                        budget.projectedUtilization > 100
                          ? 'text-red-600'
                          : 'text-green-600'
                      }`}
                    >
                      {budget.projectedUtilization.toFixed(1)}%
                    </p>
                  </div>
                </div>
              </div>

              {/* Alerts */}
              {budget.alerts.length > 0 && (
                <div className="space-y-2">
                  {budget.alerts.map((alert, index) => (
                    <div
                      key={index}
                      className="flex items-start p-3 bg-yellow-50 border border-yellow-200 rounded-md"
                    >
                      <AlertTriangle className="w-4 h-4 text-yellow-600 mr-2 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-yellow-800">{alert}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* No Budgets State */}
      {budgets.length === 0 && (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <DollarSign className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No Active Budgets
          </h3>
          <p className="text-gray-600 mb-4">
            There are no active budgets to monitor at this time.
          </p>
        </div>
      )}
    </div>
  );
};

export default BudgetHealthPage;
