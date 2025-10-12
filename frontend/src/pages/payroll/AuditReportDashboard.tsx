import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  FileText,
  Download,
  Calendar,
  DollarSign,
  Users,
  TrendingUp,
  PieChart,
  CheckCircle,
  Clock,
  AlertCircle,
  Building,
  Globe,
  FileCheck,
} from 'lucide-react';
import {
  PieChart as RePieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import axiosInstance from '../../lib/axios';

interface AuditReport {
  reportId: string;
  generatedAt: Date;
  period: {
    startDate: Date;
    endDate: Date;
  };
  summary: {
    totalEmployees: number;
    totalGrossPay: number;
    totalNetPay: number;
    totalTax: number;
    totalEmployerContributions: number;
    totalDeductions: number;
  };
  breakdown: {
    byDepartment: Array<{
      department: string;
      employeeCount: number;
      totalCost: number;
    }>;
    byCountry: Array<{
      country: string;
      employeeCount: number;
      totalCost: number;
    }>;
    byCurrency: Array<{
      currency: string;
      totalAmount: number;
    }>;
  };
  compliance: {
    taxFiled: boolean;
    statutoryReports: string[];
    filingDeadlines: Array<{
      type: string;
      deadline: Date;
      status: 'PENDING' | 'FILED' | 'OVERDUE';
    }>;
  };
}

const AuditReportDashboard: React.FC = () => {
  const [startDate, setStartDate] = useState<string>('2024-01-01');
  const [endDate, setEndDate] = useState<string>('2024-12-31');
  const [exportFormat, setExportFormat] = useState<'CSV' | 'XML' | 'JSON'>('CSV');

  const { data: auditReport, isLoading, refetch } = useQuery<AuditReport>({
    queryKey: ['audit-report', startDate, endDate],
    queryFn: async () => {
      const response = await axiosInstance.get('/payroll/advanced/audit/report', {
        params: { startDate, endDate },
      });
      return response.data;
    },
    enabled: false,
  });

  const handleGenerateReport = () => {
    refetch();
  };

  const handleExportGL = async () => {
    const response = await axiosInstance.get('/payroll/advanced/audit/general-ledger', {
      params: { startDate, endDate, format: exportFormat },
    });

    const blob = new Blob([response.data.data], {
      type: exportFormat === 'CSV' ? 'text/csv' : 'application/xml',
    });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `general-ledger-${startDate}-to-${endDate}.${exportFormat.toLowerCase()}`;
    a.click();
  };

  const COLORS = ['#8B5CF6', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#EC4899'];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'FILED':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'OVERDUE':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'FILED':
        return <CheckCircle className="w-5 h-5" />;
      case 'PENDING':
        return <Clock className="w-5 h-5" />;
      case 'OVERDUE':
        return <AlertCircle className="w-5 h-5" />;
      default:
        return <Clock className="w-5 h-5" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg">
            <FileText className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Audit Reports & Compliance
            </h1>
            <p className="text-gray-600 mt-1">
              Generate audit-ready reports and general ledger exports
            </p>
          </div>
        </div>
      </div>

      {/* Report Configuration */}
      <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-indigo-100">
        <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <Calendar className="w-6 h-6 text-indigo-600" />
          Report Configuration
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Export Format
            </label>
            <select
              value={exportFormat}
              onChange={(e) => setExportFormat(e.target.value as any)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="CSV">CSV</option>
              <option value="XML">XML</option>
              <option value="JSON">JSON</option>
            </select>
          </div>
        </div>

        <div className="flex gap-4">
          <button
            onClick={handleGenerateReport}
            disabled={isLoading}
            className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-3 rounded-xl font-semibold hover:from-indigo-600 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Generating...
              </>
            ) : (
              <>
                <FileCheck className="w-5 h-5" />
                Generate Audit Report
              </>
            )}
          </button>

          <button
            onClick={handleExportGL}
            disabled={!auditReport}
            className="px-8 bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 flex items-center gap-2"
          >
            <Download className="w-5 h-5" />
            Export GL
          </button>
        </div>
      </div>

      {auditReport && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl shadow-lg p-6 text-white">
              <div className="flex items-center justify-between mb-2">
                <span className="text-blue-100">Total Employees</span>
                <Users className="w-6 h-6" />
              </div>
              <p className="text-3xl font-bold">
                {auditReport.summary.totalEmployees}
              </p>
            </div>

            <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-lg p-6 text-white">
              <div className="flex items-center justify-between mb-2">
                <span className="text-green-100">Total Gross Pay</span>
                <DollarSign className="w-6 h-6" />
              </div>
              <p className="text-3xl font-bold">
                ${auditReport.summary.totalGrossPay.toLocaleString()}
              </p>
            </div>

            <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl shadow-lg p-6 text-white">
              <div className="flex items-center justify-between mb-2">
                <span className="text-purple-100">Total Net Pay</span>
                <DollarSign className="w-6 h-6" />
              </div>
              <p className="text-3xl font-bold">
                ${auditReport.summary.totalNetPay.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Breakdown Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* By Department */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center gap-2 mb-6">
                <Building className="w-6 h-6 text-indigo-600" />
                <h2 className="text-xl font-bold text-gray-800">By Department</h2>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={auditReport.breakdown.byDepartment}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="department" tick={{ fill: '#6B7280' }} />
                  <YAxis tick={{ fill: '#6B7280' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #E5E7EB',
                      borderRadius: '12px',
                    }}
                  />
                  <Bar dataKey="totalCost" fill="#8B5CF6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* By Country */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center gap-2 mb-6">
                <Globe className="w-6 h-6 text-indigo-600" />
                <h2 className="text-xl font-bold text-gray-800">By Country</h2>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <RePieChart>
                  <Pie
                    data={auditReport.breakdown.byCountry}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => entry.country}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="totalCost"
                  >
                    {auditReport.breakdown.byCountry.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RePieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Compliance Status */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-gray-100">
            <div className="flex items-center gap-2 mb-6">
              <FileCheck className="w-6 h-6 text-indigo-600" />
              <h2 className="text-xl font-bold text-gray-800">Compliance Status</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-800 mb-3">
                  Statutory Reports
                </h3>
                <div className="space-y-2">
                  {auditReport.compliance.statutoryReports.map((report, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 bg-gray-50 rounded-lg p-3"
                    >
                      <FileText className="w-5 h-5 text-gray-600" />
                      <span className="text-gray-700">{report}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-800 mb-3">
                  Filing Deadlines
                </h3>
                <div className="space-y-3">
                  {auditReport.compliance.filingDeadlines.map((deadline, index) => (
                    <div
                      key={index}
                      className={`flex items-center justify-between p-4 rounded-lg border ${getStatusColor(
                        deadline.status
                      )}`}
                    >
                      <div className="flex items-center gap-3">
                        {getStatusIcon(deadline.status)}
                        <div>
                          <p className="font-medium">{deadline.type}</p>
                          <p className="text-sm">
                            Due: {new Date(deadline.deadline).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <span className="px-3 py-1 rounded-full text-xs font-semibold">
                        {deadline.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Financial Summary */}
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl shadow-lg p-8 border border-gray-200">
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="w-6 h-6 text-gray-700" />
              <h2 className="text-xl font-bold text-gray-800">Financial Summary</h2>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl p-4 border border-gray-200">
                <p className="text-sm text-gray-600 mb-1">Gross Pay</p>
                <p className="text-2xl font-bold text-gray-800">
                  ${auditReport.summary.totalGrossPay.toLocaleString()}
                </p>
              </div>

              <div className="bg-white rounded-xl p-4 border border-gray-200">
                <p className="text-sm text-gray-600 mb-1">Tax Withheld</p>
                <p className="text-2xl font-bold text-red-600">
                  ${auditReport.summary.totalTax.toLocaleString()}
                </p>
              </div>

              <div className="bg-white rounded-xl p-4 border border-gray-200">
                <p className="text-sm text-gray-600 mb-1">Total Deductions</p>
                <p className="text-2xl font-bold text-orange-600">
                  ${auditReport.summary.totalDeductions.toLocaleString()}
                </p>
              </div>

              <div className="bg-white rounded-xl p-4 border border-gray-200">
                <p className="text-sm text-gray-600 mb-1">Employer Contributions</p>
                <p className="text-2xl font-bold text-blue-600">
                  ${auditReport.summary.totalEmployerContributions.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AuditReportDashboard;
