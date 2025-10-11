import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
} from 'lucide-react';
import expenseService from '../../services/expense.service';

const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'];

export default function ExpenseAnalyticsPage() {
  const [dateRange, setDateRange] = useState('30'); // days
  const [selectedDepartment, setSelectedDepartment] = useState<string>('');

  // Calculate date range
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - parseInt(dateRange));

  // Fetch analytics data
  const { data: overview, isLoading: loadingOverview } = useQuery({
    queryKey: ['expense-analytics-overview', startDate, endDate, selectedDepartment],
    queryFn: () =>
      expenseService.getAnalyticsOverview(
        startDate.toISOString(),
        endDate.toISOString(),
        selectedDepartment || undefined,
      ),
  });

  const { data: trends, isLoading: loadingTrends } = useQuery({
    queryKey: ['expense-trends', selectedDepartment],
    queryFn: () => expenseService.getExpenseTrends(12, selectedDepartment || undefined),
  });

  const { data: categoryBreakdown, isLoading: loadingCategories } = useQuery({
    queryKey: ['expense-categories-breakdown', startDate, endDate, selectedDepartment],
    queryFn: () =>
      expenseService.getCategoryBreakdown(
        startDate.toISOString(),
        endDate.toISOString(),
        selectedDepartment || undefined,
      ),
  });

  const { data: topSpenders, isLoading: loadingSpenders } = useQuery({
    queryKey: ['expense-top-spenders', startDate, endDate, selectedDepartment],
    queryFn: () =>
      expenseService.getTopSpenders(
        10,
        startDate.toISOString(),
        endDate.toISOString(),
        selectedDepartment || undefined,
      ),
  });

  const { data: approvalMetrics, isLoading: loadingApprovals } = useQuery({
    queryKey: ['expense-approval-metrics', startDate, endDate],
    queryFn: () =>
      expenseService.getApprovalMetrics(startDate.toISOString(), endDate.toISOString()),
  });

  const isLoading =
    loadingOverview || loadingTrends || loadingCategories || loadingSpenders || loadingApprovals;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Expense Analytics</h1>
          <p className="text-gray-600">Comprehensive insights into expense spending</p>
        </div>

        <div className="flex gap-4">
          <select
            value={dateRange}
            onChange={e => setDateRange(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="180">Last 6 months</option>
            <option value="365">Last year</option>
          </select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Spend"
          value={`£${overview?.totalSpend?.toLocaleString() || '0'}`}
          icon={DollarSign}
          color="indigo"
          trend={overview?.percentageChange}
        />
        <MetricCard
          title="Total Claims"
          value={overview?.claimCount?.toString() || '0'}
          icon={FileText}
          color="green"
        />
        <MetricCard
          title="Avg Claim Amount"
          value={`£${overview?.averageClaimAmount?.toFixed(2) || '0'}`}
          icon={TrendingUp}
          color="purple"
        />
        <MetricCard
          title="Pending Amount"
          value={`£${overview?.pendingAmount?.toLocaleString() || '0'}`}
          icon={Clock}
          color="amber"
        />
      </div>

      {/* Status Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatusCard
          label="Approved"
          amount={overview?.approvedAmount || 0}
          icon={CheckCircle}
          color="green"
        />
        <StatusCard
          label="Pending"
          amount={overview?.pendingAmount || 0}
          icon={Clock}
          color="yellow"
        />
        <StatusCard
          label="Paid"
          amount={overview?.paidAmount || 0}
          icon={DollarSign}
          color="blue"
        />
        <StatusCard
          label="Rejected"
          amount={overview?.rejectedAmount || 0}
          icon={XCircle}
          color="red"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Spending Trend */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Spending Trend (12 Months)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trends || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value: number) => `£${value.toLocaleString()}`} />
              <Legend />
              <Line
                type="monotone"
                dataKey="totalAmount"
                stroke="#4F46E5"
                strokeWidth={2}
                name="Total Spend"
              />
              <Line
                type="monotone"
                dataKey="averageAmount"
                stroke="#10B981"
                strokeWidth={2}
                name="Avg Claim"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Category Breakdown */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Spending by Category</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryBreakdown || []}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={entry => `${entry.categoryName}: ${entry.percentage.toFixed(1)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="totalAmount"
              >
                {(categoryBreakdown || []).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => `£${value.toLocaleString()}`} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Top Spenders */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Top 10 Spenders</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topSpenders || []} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="employeeName" type="category" width={120} />
              <Tooltip formatter={(value: number) => `£${value.toLocaleString()}`} />
              <Bar dataKey="totalSpend" fill="#4F46E5" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Approval Metrics */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Approval Metrics</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Approvals</span>
              <span className="text-2xl font-bold text-gray-900">
                {approvalMetrics?.totalApprovals || 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Pending</span>
              <span className="text-2xl font-bold text-amber-600">
                {approvalMetrics?.pendingApprovals || 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Approval Rate</span>
              <span className="text-2xl font-bold text-green-600">
                {approvalMetrics?.approvalRate?.toFixed(1) || 0}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Avg Approval Time</span>
              <span className="text-2xl font-bold text-indigo-600">
                {approvalMetrics?.averageApprovalTime?.toFixed(1) || 0}h
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Rejection Rate</span>
              <span className="text-2xl font-bold text-red-600">
                {approvalMetrics?.rejectionRate?.toFixed(1) || 0}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Category Details Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Category Details</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Total Spend
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Claims
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Percentage
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Avg per Claim
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {(categoryBreakdown || []).map((category, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div
                        className="w-3 h-3 rounded-full mr-3"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span className="text-sm font-medium text-gray-900">
                        {category.categoryName}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    £{category.totalAmount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {category.claimCount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {category.percentage.toFixed(1)}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    £{(category.totalAmount / category.claimCount).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Metric Card Component
function MetricCard({
  title,
  value,
  icon: Icon,
  color,
  trend,
}: {
  title: string;
  value: string;
  icon: any;
  color: string;
  trend?: number;
}) {
  const colorClasses = {
    indigo: 'bg-indigo-100 text-indigo-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    amber: 'bg-amber-100 text-amber-600',
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {trend !== undefined && (
            <div className="flex items-center mt-2">
              {trend >= 0 ? (
                <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-600 mr-1" />
              )}
              <span
                className={`text-sm font-medium ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}
              >
                {Math.abs(trend).toFixed(1)}%
              </span>
              <span className="text-sm text-gray-500 ml-1">vs last month</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-full ${colorClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}

// Status Card Component
function StatusCard({
  label,
  amount,
  icon: Icon,
  color,
}: {
  label: string;
  amount: number;
  icon: any;
  color: string;
}) {
  const colorClasses = {
    green: 'bg-green-50 text-green-700 border-green-200',
    yellow: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    red: 'bg-red-50 text-red-700 border-red-200',
  };

  return (
    <div className={`border rounded-lg p-4 ${colorClasses[color]}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium">{label}</span>
        <Icon className="w-5 h-5" />
      </div>
      <p className="text-2xl font-bold">£{amount.toLocaleString()}</p>
    </div>
  );
}
