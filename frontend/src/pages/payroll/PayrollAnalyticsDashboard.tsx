import React, { useState } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, Users, DollarSign, Globe, FileText } from 'lucide-react';

export const PayrollAnalyticsDashboard: React.FC = () => {
  const [period, setPeriod] = useState('12months');

  const monthlyData = [
    { month: 'Jan', gross: 1200000, net: 850000, tax: 350000 },
    { month: 'Feb', gross: 1250000, net: 880000, tax: 370000 },
    { month: 'Mar', gross: 1180000, net: 835000, tax: 345000 },
    { month: 'Apr', gross: 1300000, net: 920000, tax: 380000 },
    { month: 'May', gross: 1350000, net: 950000, tax: 400000 },
    { month: 'Jun', gross: 1280000, net: 900000, tax: 380000 },
    { month: 'Jul', gross: 1320000, net: 930000, tax: 390000 },
    { month: 'Aug', gross: 1290000, net: 910000, tax: 380000 },
    { month: 'Sep', gross: 1310000, net: 925000, tax: 385000 },
    { month: 'Oct', gross: 1340000, net: 945000, tax: 395000 },
    { month: 'Nov', gross: 1360000, net: 960000, tax: 400000 },
    { month: 'Dec', gross: 1450000, net: 1020000, tax: 430000 },
  ];

  const countryData = [
    { name: 'UK', value: 45, amount: 4500000 },
    { name: 'USA', value: 30, amount: 3800000 },
    { name: 'Nigeria', value: 15, amount: 850000 },
    { name: 'South Africa', value: 10, amount: 650000 },
  ];

  const departmentData = [
    { department: 'Engineering', employees: 85, cost: 5200000 },
    { department: 'Sales', employees: 42, cost: 2800000 },
    { department: 'Marketing', employees: 28, cost: 1600000 },
    { department: 'Finance', employees: 18, cost: 1200000 },
    { department: 'HR', employees: 15, cost: 900000 },
    { department: 'Operations', employees: 32, cost: 1500000 },
  ];

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

  const stats = [
    {
      label: 'Total Monthly Cost',
      value: '£1,450,000',
      change: '+8.2%',
      trend: 'up',
      icon: DollarSign,
      color: 'blue',
    },
    {
      label: 'Total Employees',
      value: '220',
      change: '+5',
      trend: 'up',
      icon: Users,
      color: 'green',
    },
    {
      label: 'Avg. Cost per Employee',
      value: '£6,591',
      change: '+2.1%',
      trend: 'up',
      icon: TrendingUp,
      color: 'purple',
    },
    {
      label: 'Countries',
      value: '4',
      change: '+1',
      trend: 'up',
      icon: Globe,
      color: 'orange',
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payroll Analytics</h1>
          <p className="text-gray-600">Global payroll insights and forecasting</p>
        </div>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="3months">Last 3 Months</option>
          <option value="6months">Last 6 Months</option>
          <option value="12months">Last 12 Months</option>
          <option value="ytd">Year to Date</option>
        </select>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 bg-${stat.color}-100 rounded-lg`}>
                <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
              </div>
              <span
                className={`text-sm font-medium ${
                  stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                } flex items-center gap-1`}
              >
                {stat.trend === 'up' ? (
                  <TrendingUp className="w-4 h-4" />
                ) : (
                  <TrendingDown className="w-4 h-4" />
                )}
                {stat.change}
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-2 gap-6">
        {/* Monthly Trend */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Payroll Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => `£${Number(value).toLocaleString()}`} />
              <Legend />
              <Line type="monotone" dataKey="gross" stroke="#3B82F6" name="Gross Pay" strokeWidth={2} />
              <Line type="monotone" dataKey="net" stroke="#10B981" name="Net Pay" strokeWidth={2} />
              <Line type="monotone" dataKey="tax" stroke="#EF4444" name="Tax" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Country Distribution */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribution by Country</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={countryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {countryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `${value}%`} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-2 gap-6">
        {/* Department Costs */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Cost by Department</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={departmentData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="department" />
              <YAxis />
              <Tooltip formatter={(value) => `£${Number(value).toLocaleString()}`} />
              <Bar dataKey="cost" fill="#3B82F6" name="Total Cost" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Summary Table */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Department Breakdown</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left border-b">
                <tr>
                  <th className="pb-2 font-medium text-gray-600">Department</th>
                  <th className="pb-2 font-medium text-gray-600 text-right">Employees</th>
                  <th className="pb-2 font-medium text-gray-600 text-right">Avg. Cost</th>
                  <th className="pb-2 font-medium text-gray-600 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {departmentData.map((dept) => (
                  <tr key={dept.department}>
                    <td className="py-2 font-medium text-gray-900">{dept.department}</td>
                    <td className="py-2 text-right text-gray-600">{dept.employees}</td>
                    <td className="py-2 text-right text-gray-600">
                      £{Math.round(dept.cost / dept.employees).toLocaleString()}
                    </td>
                    <td className="py-2 text-right font-semibold text-gray-900">
                      £{dept.cost.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Key Insights */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Key Insights & Forecasts
        </h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">Projected Next Month</p>
            <p className="text-xl font-bold text-gray-900">£1,485,000</p>
            <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
              <TrendingUp className="w-3 h-3" />
              +2.4% increase expected
            </p>
          </div>
          <div className="bg-white rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">Annual Run Rate</p>
            <p className="text-xl font-bold text-gray-900">£17.4M</p>
            <p className="text-xs text-blue-600 mt-1">Based on current trend</p>
          </div>
          <div className="bg-white rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">Cost Efficiency</p>
            <p className="text-xl font-bold text-gray-900">92%</p>
            <p className="text-xs text-green-600 mt-1">Above industry average</p>
          </div>
        </div>
      </div>
    </div>
  );
};
