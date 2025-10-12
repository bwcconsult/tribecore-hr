import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  AlertCircle,
  Brain,
  Activity,
  BarChart3,
  Target,
  Calendar,
  Sparkles,
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';
import axiosInstance from '../../lib/axios';

interface ForecastData {
  nextMonthPrediction: {
    grossPay: number;
    netPay: number;
    totalTax: number;
    totalDeductions: number;
    employerContributions: number;
    confidence: number;
  };
  quarterlyForecast: Array<{
    month: string;
    predictedCost: number;
    taxLiability: number;
    cashflowImpact: number;
  }>;
  trends: {
    growthRate: number;
    avgMonthlyIncrease: number;
    volatility: number;
  };
  recommendations: string[];
}

const AIForecastingDashboard: React.FC = () => {
  const { data: forecast, isLoading } = useQuery<ForecastData>({
    queryKey: ['payroll-forecast'],
    queryFn: async () => {
      const response = await axiosInstance.get('/payroll/advanced/forecast');
      return response.data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const confidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-600';
    if (confidence >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-3 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl shadow-lg">
            <Brain className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              AI-Powered Payroll Forecasting
            </h1>
            <p className="text-gray-600 mt-1">
              Machine learning predictions & intelligent insights
            </p>
          </div>
        </div>
      </div>

      {/* Next Month Prediction - Hero Card */}
      <div className="bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl shadow-2xl p-8 mb-8 text-white">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Sparkles className="w-8 h-8" />
            <h2 className="text-2xl font-bold">Next Month Prediction</h2>
          </div>
          <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
            <Activity className="w-5 h-5" />
            <span className="font-semibold">
              {forecast?.nextMonthPrediction.confidence}% Confidence
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-purple-200">Gross Pay</span>
              <DollarSign className="w-5 h-5" />
            </div>
            <p className="text-3xl font-bold">
              {formatCurrency(forecast?.nextMonthPrediction.grossPay || 0)}
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-purple-200">Net Pay</span>
              <DollarSign className="w-5 h-5" />
            </div>
            <p className="text-3xl font-bold">
              {formatCurrency(forecast?.nextMonthPrediction.netPay || 0)}
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-purple-200">Total Tax</span>
              <DollarSign className="w-5 h-5" />
            </div>
            <p className="text-3xl font-bold">
              {formatCurrency(forecast?.nextMonthPrediction.totalTax || 0)}
            </p>
          </div>
        </div>
      </div>

      {/* Trends & Quarterly Forecast */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Growth Metrics */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800">Growth Rate</h3>
          </div>
          <p className="text-4xl font-bold text-green-600 mb-2">
            {forecast?.trends.growthRate.toFixed(1)}%
          </p>
          <p className="text-sm text-gray-600">Year-over-year payroll growth</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BarChart3 className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800">
              Monthly Increase
            </h3>
          </div>
          <p className="text-4xl font-bold text-blue-600 mb-2">
            {formatCurrency(forecast?.trends.avgMonthlyIncrease || 0)}
          </p>
          <p className="text-sm text-gray-600">Average month-on-month</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Activity className="w-6 h-6 text-orange-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800">Volatility</h3>
          </div>
          <p className="text-4xl font-bold text-orange-600 mb-2">
            {forecast?.trends.volatility.toFixed(1)}%
          </p>
          <p className="text-sm text-gray-600">Cost fluctuation index</p>
        </div>
      </div>

      {/* Quarterly Forecast Chart */}
      <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-gray-100">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Calendar className="w-6 h-6 text-purple-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-800">
            Quarterly Forecast (Next 3 Months)
          </h2>
        </div>

        <ResponsiveContainer width="100%" height={350}>
          <AreaChart data={forecast?.quarterlyForecast || []}>
            <defs>
              <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="colorTax" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="colorCashflow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#10B981" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="month"
              tick={{ fill: '#6B7280' }}
              tickLine={{ stroke: '#E5E7EB' }}
            />
            <YAxis
              tick={{ fill: '#6B7280' }}
              tickLine={{ stroke: '#E5E7EB' }}
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #E5E7EB',
                borderRadius: '12px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              }}
              formatter={(value: number) => formatCurrency(value)}
            />
            <Legend
              wrapperStyle={{ paddingTop: '20px' }}
              iconType="circle"
            />
            <Area
              type="monotone"
              dataKey="predictedCost"
              stroke="#8B5CF6"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorCost)"
              name="Predicted Cost"
            />
            <Area
              type="monotone"
              dataKey="taxLiability"
              stroke="#3B82F6"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorTax)"
              name="Tax Liability"
            />
            <Area
              type="monotone"
              dataKey="cashflowImpact"
              stroke="#10B981"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorCashflow)"
              name="Cashflow Impact"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* AI Recommendations */}
      <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl shadow-lg p-8 border border-amber-200">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-amber-500 rounded-lg">
            <Target className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-xl font-bold text-gray-800">
            AI-Generated Recommendations
          </h2>
        </div>

        <div className="space-y-4">
          {forecast?.recommendations.map((rec, index) => (
            <div
              key={index}
              className="flex items-start gap-4 bg-white rounded-xl p-4 border border-amber-200"
            >
              <div className="p-2 bg-amber-100 rounded-lg mt-1">
                <AlertCircle className="w-5 h-5 text-amber-600" />
              </div>
              <p className="text-gray-700 flex-1">{rec}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AIForecastingDashboard;
