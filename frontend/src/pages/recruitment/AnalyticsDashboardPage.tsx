import React, { useState, useEffect } from 'react';
import { recruitmentService } from '../../services/recruitment.service';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  Users, 
  CheckCircle,
  Target,
  DollarSign,
  Calendar,
  AlertCircle
} from 'lucide-react';
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

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export function AnalyticsDashboardPage() {
  const [dashboard, setDashboard] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<'30d' | '60d' | '90d' | 'all'>('30d');

  useEffect(() => {
    loadDashboard();
  }, [dateRange]);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      
      // Calculate date range
      const params: any = {};
      if (dateRange !== 'all') {
        const days = parseInt(dateRange);
        const fromDate = new Date();
        fromDate.setDate(fromDate.getDate() - days);
        params.fromDate = fromDate.toISOString();
        params.toDate = new Date().toISOString();
      }

      const data = await recruitmentService.getDashboard(params);
      setDashboard(data);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-600">Failed to load dashboard</p>
      </div>
    );
  }

  const { funnel, timeToHire, sourceOfHire, offerAcceptance, interviewToOfferRatio, requisitionAging } = dashboard;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Recruitment Analytics</h1>
          <p className="text-gray-600 mt-1">Track key metrics and performance indicators</p>
        </div>

        {/* Date Range Selector */}
        <div className="flex gap-2">
          {['30d', '60d', '90d', 'all'].map((range) => (
            <button
              key={range}
              onClick={() => setDateRange(range as any)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                dateRange === range
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {range === 'all' ? 'All Time' : `Last ${range}`}
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Time to Hire</p>
                <p className="text-2xl font-bold text-gray-900">{timeToHire.average} days</p>
                <p className="text-xs text-gray-500 mt-1">Median: {timeToHire.median} days</p>
              </div>
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Offer Acceptance</p>
                <p className="text-2xl font-bold text-green-600">{offerAcceptance.acceptanceRate}%</p>
                <p className="text-xs text-gray-500 mt-1">
                  {offerAcceptance.accepted}/{offerAcceptance.total} offers
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Interview to Offer</p>
                <p className="text-2xl font-bold text-purple-600">{interviewToOfferRatio.ratio}:1</p>
                <p className="text-xs text-gray-500 mt-1">
                  {interviewToOfferRatio.totalOffers} offers from {interviewToOfferRatio.totalInterviews} interviews
                </p>
              </div>
              <Target className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Fastest Hire</p>
                <p className="text-2xl font-bold text-orange-600">{timeToHire.fastest} days</p>
                <p className="text-xs text-gray-500 mt-1">Slowest: {timeToHire.slowest} days</p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Funnel Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Recruitment Funnel</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={funnel}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="stage" angle={-45} textAnchor="end" height={100} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#3b82f6" name="Candidates" />
            </BarChart>
          </ResponsiveContainer>
          
          <div className="mt-4 grid grid-cols-3 md:grid-cols-5 gap-4">
            {funnel.slice(0, 5).map((stage: any, idx: number) => (
              <div key={stage.stage} className="text-center">
                <p className="text-xs text-gray-600">{stage.stage}</p>
                <p className="text-lg font-bold">{stage.count}</p>
                <p className="text-xs text-gray-500">{stage.percentage}%</p>
                {idx > 0 && (
                  <Badge variant="secondary" className="mt-1 text-xs">
                    {stage.conversionRate}% conversion
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Source of Hire & Time to Hire */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Source of Hire */}
        <Card>
          <CardHeader>
            <CardTitle>Source of Hire</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={sourceOfHire}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.source}: ${entry.hires}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="hires"
                >
                  {sourceOfHire.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>

            <div className="mt-4 space-y-2">
              {sourceOfHire.map((source: any, idx: number) => (
                <div key={source.source} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                    />
                    <span className="font-medium">{source.source}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-gray-900">{source.hires} hires</span>
                    <span className="text-gray-500 ml-2">({source.conversionRate}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Time to Hire Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Time to Hire Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600">Average</p>
                  <p className="text-2xl font-bold text-blue-600">{timeToHire.average} days</p>
                </div>
                <Clock className="h-8 w-8 text-blue-600" />
              </div>

              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600">Median</p>
                  <p className="text-2xl font-bold text-green-600">{timeToHire.median} days</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>

              <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600">90th Percentile</p>
                  <p className="text-2xl font-bold text-orange-600">{timeToHire.p90} days</p>
                </div>
                <TrendingUp className="h-8 w-8 text-orange-600" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">Fastest</p>
                  <p className="text-xl font-bold text-gray-900">{timeToHire.fastest} days</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">Slowest</p>
                  <p className="text-xl font-bold text-gray-900">{timeToHire.slowest} days</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Offer Acceptance */}
      <Card>
        <CardHeader>
          <CardTitle>Offer Acceptance Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600">Accepted</p>
                  <p className="text-2xl font-bold text-green-600">{offerAcceptance.accepted}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>

              <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600">Declined</p>
                  <p className="text-2xl font-bold text-red-600">{offerAcceptance.declined}</p>
                </div>
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>

              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600">Avg Response Time</p>
                  <p className="text-2xl font-bold text-blue-600">{offerAcceptance.avgTimeToRespond} days</p>
                </div>
                <Clock className="h-8 w-8 text-blue-600" />
              </div>
            </div>

            <div className="md:col-span-2">
              <h4 className="font-semibold text-gray-900 mb-3">Top Decline Reasons</h4>
              <div className="space-y-2">
                {Object.entries(offerAcceptance.declineReasons || {})
                  .sort(([, a]: any, [, b]: any) => b - a)
                  .slice(0, 5)
                  .map(([reason, count]: any) => (
                    <div key={reason} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-700">{reason}</span>
                      <Badge variant="secondary">{count} times</Badge>
                    </div>
                  ))}
                {Object.keys(offerAcceptance.declineReasons || {}).length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">No decline reasons recorded</p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* At-Risk Requisitions */}
      {requisitionAging && requisitionAging.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>At-Risk Requisitions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {requisitionAging.map((req: any) => (
                <div
                  key={req.requisitionId}
                  className={`p-4 rounded-lg border-l-4 ${
                    req.pipelineHealth === 'CRITICAL'
                      ? 'bg-red-50 border-red-500'
                      : req.pipelineHealth === 'WARNING'
                      ? 'bg-yellow-50 border-yellow-500'
                      : 'bg-green-50 border-green-500'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-gray-900">{req.jobTitle}</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        Open for {req.daysOpen} days • {req.applicationsCount} applications • {req.status}
                      </p>
                    </div>
                    <Badge
                      variant={
                        req.pipelineHealth === 'CRITICAL'
                          ? 'red'
                          : req.pipelineHealth === 'WARNING'
                          ? 'yellow'
                          : 'green'
                      }
                    >
                      {req.pipelineHealth}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
