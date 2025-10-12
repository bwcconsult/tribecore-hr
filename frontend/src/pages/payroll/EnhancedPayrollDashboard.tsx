import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  DollarSign,
  Users,
  TrendingUp,
  AlertCircle,
  Brain,
  ShieldAlert,
  Gift,
  Globe,
  FileText,
  Calendar,
  ArrowRight,
  Sparkles,
  Activity,
  BarChart3,
  Zap,
} from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import axiosInstance from '../../lib/axios';

interface DashboardStats {
  currentMonth: {
    totalGross: number;
    totalNet: number;
    totalTax: number;
    employeeCount: number;
  };
  lastMonth: {
    totalGross: number;
    totalNet: number;
  };
  trends: Array<{
    month: string;
    gross: number;
    net: number;
  }>;
}

const EnhancedPayrollDashboard: React.FC = () => {
  const navigate = useNavigate();

  const { data: stats } = useQuery<DashboardStats>({
    queryKey: ['payroll-dashboard'],
    queryFn: async () => {
      // Mock data - replace with actual API call
      return {
        currentMonth: {
          totalGross: 2450000,
          totalNet: 1840000,
          totalTax: 490000,
          employeeCount: 145,
        },
        lastMonth: {
          totalGross: 2380000,
          totalNet: 1785000,
        },
        trends: [
          { month: 'Jan', gross: 2100000, net: 1575000 },
          { month: 'Feb', gross: 2200000, net: 1650000 },
          { month: 'Mar', gross: 2300000, net: 1725000 },
          { month: 'Apr', gross: 2380000, net: 1785000 },
          { month: 'May', gross: 2450000, net: 1840000 },
        ],
      };
    },
  });

  const calculateGrowth = () => {
    if (!stats) return 0;
    const diff = stats.currentMonth.totalGross - stats.lastMonth.totalGross;
    return ((diff / stats.lastMonth.totalGross) * 100).toFixed(1);
  };

  const quickActions = [
    {
      title: 'AI Forecasting',
      description: 'ML-powered payroll predictions',
      icon: Brain,
      color: 'from-purple-500 to-blue-600',
      path: '/payroll/ai-forecasting',
    },
    {
      title: 'Anomaly Detection',
      description: 'Detect unusual payroll patterns',
      icon: ShieldAlert,
      color: 'from-red-500 to-orange-600',
      path: '/payroll/anomaly-detection',
    },
    {
      title: 'Bonus Manager',
      description: 'Calculate bonuses & commissions',
      icon: Gift,
      color: 'from-amber-500 to-yellow-600',
      path: '/payroll/bonus-commission',
    },
    {
      title: '13th Month Salary',
      description: 'Global statutory bonuses',
      icon: Globe,
      color: 'from-green-500 to-emerald-600',
      path: '/payroll/thirteenth-month',
    },
    {
      title: 'Audit Reports',
      description: 'Compliance & GL exports',
      icon: FileText,
      color: 'from-indigo-500 to-purple-600',
      path: '/payroll/audit-reports',
    },
    {
      title: 'Payroll Run',
      description: 'Process monthly payroll',
      icon: Calendar,
      color: 'from-blue-500 to-cyan-600',
      path: '/payroll/run',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white p-8 mb-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
              <Sparkles className="w-10 h-10" />
            </div>
            <div>
              <h1 className="text-4xl font-bold mb-2">
                World-Class Payroll Platform
              </h1>
              <p className="text-blue-100 text-lg">
                AI-powered global payroll with advanced analytics & compliance
              </p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="flex items-center justify-between mb-2">
                <span className="text-blue-100">Total Gross</span>
                <DollarSign className="w-6 h-6" />
              </div>
              <p className="text-3xl font-bold">
                ${(stats?.currentMonth.totalGross || 0).toLocaleString()}
              </p>
              <div className="flex items-center gap-2 mt-2 text-green-300">
                <TrendingUp className="w-4 h-4" />
                <span className="text-sm">+{calculateGrowth()}% from last month</span>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="flex items-center justify-between mb-2">
                <span className="text-blue-100">Total Net</span>
                <DollarSign className="w-6 h-6" />
              </div>
              <p className="text-3xl font-bold">
                ${(stats?.currentMonth.totalNet || 0).toLocaleString()}
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="flex items-center justify-between mb-2">
                <span className="text-blue-100">Tax Withheld</span>
                <BarChart3 className="w-6 h-6" />
              </div>
              <p className="text-3xl font-bold">
                ${(stats?.currentMonth.totalTax || 0).toLocaleString()}
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="flex items-center justify-between mb-2">
                <span className="text-blue-100">Employees</span>
                <Users className="w-6 h-6" />
              </div>
              <p className="text-3xl font-bold">
                {stats?.currentMonth.employeeCount || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 pb-8">
        {/* Payroll Trends Chart */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Activity className="w-6 h-6 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">
                Payroll Trends (Last 5 Months)
              </h2>
            </div>
            <button
              onClick={() => navigate('/payroll/analytics')}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              View Analytics
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={stats?.trends || []}>
              <defs>
                <linearGradient id="colorGross" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1} />
                </linearGradient>
                <linearGradient id="colorNet" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fill: '#6B7280' }} />
              <YAxis tick={{ fill: '#6B7280' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #E5E7EB',
                  borderRadius: '12px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                }}
                formatter={(value: number) => `$${value.toLocaleString()}`}
              />
              <Area
                type="monotone"
                dataKey="gross"
                stroke="#3B82F6"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorGross)"
                name="Gross Pay"
              />
              <Area
                type="monotone"
                dataKey="net"
                stroke="#10B981"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorNet)"
                name="Net Pay"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Advanced Features */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-6">
            <Zap className="w-8 h-8 text-yellow-500" />
            <h2 className="text-2xl font-bold text-gray-800">
              Advanced Payroll Features
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={() => navigate(action.path)}
                className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-transparent hover:-translate-y-1"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${action.color} opacity-0 group-hover:opacity-10 transition-opacity`}></div>
                
                <div className="relative p-6">
                  <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${action.color} mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                    <action.icon className="w-8 h-8 text-white" />
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600">
                    {action.title}
                  </h3>
                  
                  <p className="text-gray-600 mb-4">
                    {action.description}
                  </p>
                  
                  <div className="flex items-center gap-2 text-blue-600 font-medium">
                    <span>Explore</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl shadow-lg p-6 border border-purple-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-purple-500 rounded-lg">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-800">
                AI-Powered Insights
              </h3>
            </div>
            <p className="text-gray-700">
              Machine learning algorithms predict costs, detect anomalies, and provide intelligent recommendations.
            </p>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl shadow-lg p-6 border border-green-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-green-500 rounded-lg">
                <Globe className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-800">
                Global Compliance
              </h3>
            </div>
            <p className="text-gray-700">
              Automatic compliance with 10+ countries including 13th/14th month salaries and statutory requirements.
            </p>
          </div>

          <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-2xl shadow-lg p-6 border border-amber-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-amber-500 rounded-lg">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-800">
                Audit-Ready Reports
              </h3>
            </div>
            <p className="text-gray-700">
              One-click generation of audit trails, general ledger exports, and compliance checklists.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedPayrollDashboard;
