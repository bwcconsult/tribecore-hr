import { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  FileText,
  AlertTriangle,
  Users,
  BarChart3,
  PieChart,
  Activity,
  Download,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';

interface AnalyticsData {
  overview: {
    totalContracts: number;
    totalValue: number;
    avgContractValue: number;
    activeContracts: number;
    monthlyGrowth: number;
    quarterlyGrowth: number;
  };
  byType: { type: string; count: number; value: number }[];
  byStatus: { status: string; count: number; percentage: number }[];
  byDepartment: { department: string; count: number; value: number }[];
  riskDistribution: { risk: string; count: number; percentage: number }[];
  timelineData: { month: string; created: number; executed: number; value: number }[];
  expiringContracts: { period: string; count: number }[];
  topCounterparties: { name: string; contracts: number; totalValue: number }[];
  complianceMetrics: {
    dpiaCoverage: number;
    sccCompliance: number;
    averageRiskScore: number;
    overdueObligations: number;
  };
  renewalPipeline: { quarter: string; contracts: number; value: number }[];
}

export default function AnalyticsDashboard() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('12M');

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
    // Mock data - replace with actual API call
    setTimeout(() => {
      setAnalytics({
        overview: {
          totalContracts: 547,
          totalValue: 34500000,
          avgContractValue: 63088,
          activeContracts: 412,
          monthlyGrowth: 12.5,
          quarterlyGrowth: 34.2,
        },
        byType: [
          { type: 'EMPLOYMENT', count: 234, value: 19890000 },
          { type: 'VENDOR', count: 156, value: 8750000 },
          { type: 'CUSTOMER', count: 89, value: 4200000 },
          { type: 'NDA', count: 45, value: 0 },
          { type: 'LEASE', count: 23, value: 1660000 },
        ],
        byStatus: [
          { status: 'ACTIVE', count: 412, percentage: 75.3 },
          { status: 'DRAFT', count: 45, percentage: 8.2 },
          { status: 'INTERNAL_REVIEW', count: 34, percentage: 6.2 },
          { status: 'E_SIGNATURE', count: 23, percentage: 4.2 },
          { status: 'TERMINATED', count: 33, percentage: 6.0 },
        ],
        byDepartment: [
          { department: 'HR', count: 234, value: 19890000 },
          { department: 'IT', count: 89, value: 6400000 },
          { department: 'Finance', count: 67, value: 3200000 },
          { department: 'Sales', count: 89, value: 4200000 },
          { department: 'Operations', count: 68, value: 810000 },
        ],
        riskDistribution: [
          { risk: 'LOW (0-3)', count: 289, percentage: 52.8 },
          { risk: 'MEDIUM (4-6)', count: 187, percentage: 34.2 },
          { risk: 'HIGH (7-10)', count: 71, percentage: 13.0 },
        ],
        timelineData: [
          { month: 'Jan', created: 34, executed: 28, value: 2100000 },
          { month: 'Feb', created: 41, executed: 35, value: 2500000 },
          { month: 'Mar', created: 38, executed: 32, value: 2300000 },
          { month: 'Apr', created: 45, executed: 39, value: 2800000 },
          { month: 'May', created: 52, executed: 44, value: 3200000 },
          { month: 'Jun', created: 48, executed: 41, value: 2900000 },
          { month: 'Jul', created: 56, executed: 48, value: 3400000 },
          { month: 'Aug', created: 51, executed: 45, value: 3100000 },
          { month: 'Sep', created: 59, executed: 52, value: 3600000 },
          { month: 'Oct', created: 62, executed: 54, value: 3800000 },
          { month: 'Nov', created: 68, executed: 59, value: 4100000 },
          { month: 'Dec', created: 73, executed: 63, value: 4500000 },
        ],
        expiringContracts: [
          { period: '0-30 days', count: 18 },
          { period: '31-60 days', count: 24 },
          { period: '61-90 days', count: 32 },
          { period: '91-180 days', count: 67 },
        ],
        topCounterparties: [
          { name: 'AWS Corporation', contracts: 12, totalValue: 3200000 },
          { name: 'Microsoft Ltd', contracts: 8, totalValue: 2400000 },
          { name: 'Google Cloud', contracts: 6, totalValue: 1800000 },
          { name: 'Salesforce Inc', contracts: 5, totalValue: 1200000 },
          { name: 'Oracle Systems', contracts: 4, totalValue: 950000 },
        ],
        complianceMetrics: {
          dpiaCoverage: 94.5,
          sccCompliance: 87.2,
          averageRiskScore: 3.8,
          overdueObligations: 7,
        },
        renewalPipeline: [
          { quarter: 'Q1 2025', contracts: 45, value: 5200000 },
          { quarter: 'Q2 2025', contracts: 38, value: 4800000 },
          { quarter: 'Q3 2025', contracts: 52, value: 6100000 },
          { quarter: 'Q4 2025', contracts: 41, value: 5400000 },
        ],
      });
      setLoading(false);
    }, 800);
  };

  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `£${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `£${(value / 1000).toFixed(0)}K`;
    return `£${value.toLocaleString()}`;
  };

  const exportReport = () => {
    // Export analytics as PDF/Excel
    alert('Export functionality - would generate PDF/Excel report');
  };

  if (loading || !analytics) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Contract Analytics</h1>
          <p className="text-gray-600 mt-1">Comprehensive insights and trends</p>
        </div>
        <div className="flex gap-2">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 border rounded-lg"
          >
            <option value="1M">Last Month</option>
            <option value="3M">Last 3 Months</option>
            <option value="6M">Last 6 Months</option>
            <option value="12M">Last 12 Months</option>
            <option value="ALL">All Time</option>
          </select>
          <Button onClick={exportReport}>
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-gray-600">Total Contracts</p>
              <FileText className="h-5 w-5 text-blue-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{analytics.overview.totalContracts}</p>
            <div className="flex items-center gap-1 mt-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span className="text-sm text-green-600 font-semibold">
                +{analytics.overview.monthlyGrowth}%
              </span>
              <span className="text-sm text-gray-500">vs last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-gray-600">Total Value</p>
              <DollarSign className="h-5 w-5 text-green-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {formatCurrency(analytics.overview.totalValue)}
            </p>
            <div className="flex items-center gap-1 mt-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span className="text-sm text-green-600 font-semibold">
                +{analytics.overview.quarterlyGrowth}%
              </span>
              <span className="text-sm text-gray-500">vs last quarter</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-gray-600">Avg Contract Value</p>
              <BarChart3 className="h-5 w-5 text-purple-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {formatCurrency(analytics.overview.avgContractValue)}
            </p>
            <p className="text-sm text-gray-500 mt-2">Per contract</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-gray-600">Active Contracts</p>
              <Activity className="h-5 w-5 text-blue-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{analytics.overview.activeContracts}</p>
            <p className="text-sm text-gray-500 mt-2">
              {((analytics.overview.activeContracts / analytics.overview.totalContracts) * 100).toFixed(1)}% of total
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Timeline Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Contract Activity Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {analytics.timelineData.slice(-6).map((data, index) => (
                <div key={index} className="flex items-center gap-4">
                  <span className="text-sm font-medium text-gray-600 w-12">{data.month}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="flex-1 bg-gray-200 rounded-full h-6">
                        <div
                          className="bg-blue-600 h-6 rounded-full flex items-center justify-end px-2"
                          style={{ width: `${(data.created / 80) * 100}%` }}
                        >
                          <span className="text-xs text-white font-medium">{data.created}</span>
                        </div>
                      </div>
                      <span className="text-xs text-gray-600 w-16">Created</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-6">
                        <div
                          className="bg-green-600 h-6 rounded-full flex items-center justify-end px-2"
                          style={{ width: `${(data.executed / 80) * 100}%` }}
                        >
                          <span className="text-xs text-white font-medium">{data.executed}</span>
                        </div>
                      </div>
                      <span className="text-xs text-gray-600 w-16">Executed</span>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-gray-900 w-20 text-right">
                    {formatCurrency(data.value)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Contract Types Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Contracts by Type</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.byType.map((type, index) => {
                const colors = ['bg-blue-600', 'bg-green-600', 'bg-purple-600', 'bg-yellow-600', 'bg-red-600'];
                const percentage = (type.count / analytics.overview.totalContracts) * 100;
                return (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">{type.type}</span>
                        <span className="text-sm text-gray-600">({type.count})</span>
                      </div>
                      <span className="text-sm font-semibold text-gray-900">
                        {formatCurrency(type.value)}
                      </span>
                    </div>
                    <div className="bg-gray-200 rounded-full h-3">
                      <div
                        className={`${colors[index % colors.length]} h-3 rounded-full transition-all`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Risk Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Risk Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.riskDistribution.map((risk, index) => {
                const colors = ['text-green-600 bg-green-100', 'text-yellow-600 bg-yellow-100', 'text-red-600 bg-red-100'];
                return (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-16 h-16 rounded-full ${colors[index].split(' ')[1]} flex items-center justify-center`}>
                        <span className={`text-xl font-bold ${colors[index].split(' ')[0]}`}>
                          {risk.percentage.toFixed(0)}%
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{risk.risk}</p>
                        <p className="text-sm text-gray-600">{risk.count} contracts</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Expiring Contracts */}
        <Card>
          <CardHeader>
            <CardTitle>Expiring Soon</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.expiringContracts.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-orange-600" />
                    <span className="font-medium text-gray-900">{item.period}</span>
                  </div>
                  <span className="text-lg font-bold text-gray-900">{item.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Compliance Metrics */}
        <Card>
          <CardHeader>
            <CardTitle>Compliance Health</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">DPIA Coverage</span>
                  <span className="text-sm font-bold text-green-600">{analytics.complianceMetrics.dpiaCoverage}%</span>
                </div>
                <div className="bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full"
                    style={{ width: `${analytics.complianceMetrics.dpiaCoverage}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">SCC Compliance</span>
                  <span className="text-sm font-bold text-green-600">{analytics.complianceMetrics.sccCompliance}%</span>
                </div>
                <div className="bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full"
                    style={{ width: `${analytics.complianceMetrics.sccCompliance}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Avg Risk Score</span>
                  <span className="text-sm font-bold text-yellow-600">{analytics.complianceMetrics.averageRiskScore}/10</span>
                </div>
                <div className="bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-yellow-600 h-2 rounded-full"
                    style={{ width: `${(analytics.complianceMetrics.averageRiskScore / 10) * 100}%` }}
                  ></div>
                </div>
              </div>

              <div className="pt-3 border-t">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Overdue Obligations</span>
                  <span className="text-lg font-bold text-red-600">{analytics.complianceMetrics.overdueObligations}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Counterparties */}
      <Card>
        <CardHeader>
          <CardTitle>Top Counterparties by Value</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {analytics.topCounterparties.map((party, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="font-bold text-blue-600">#{index + 1}</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{party.name}</p>
                    <p className="text-sm text-gray-600">{party.contracts} contracts</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900">{formatCurrency(party.totalValue)}</p>
                  <p className="text-sm text-gray-600">Total Value</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Renewal Pipeline */}
      <Card>
        <CardHeader>
          <CardTitle>Renewal Pipeline (2025)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            {analytics.renewalPipeline.map((quarter, index) => (
              <div key={index} className="text-center p-6 border-2 border-dashed rounded-lg hover:border-blue-600 transition-colors">
                <p className="text-sm text-gray-600 mb-2">{quarter.quarter}</p>
                <p className="text-3xl font-bold text-gray-900 mb-1">{quarter.contracts}</p>
                <p className="text-xs text-gray-500 mb-3">contracts</p>
                <p className="text-lg font-semibold text-blue-600">{formatCurrency(quarter.value)}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
