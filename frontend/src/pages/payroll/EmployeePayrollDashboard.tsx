import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { FileText, PoundSterling, TrendingDown, Wallet, ExternalLink } from 'lucide-react';
import { payrollService } from '../../services/payrollService';
import { formatCurrency } from '../../constants/currencies';

export const EmployeePayrollDashboard: React.FC = () => {
  const { data: dashboard, isLoading: dashboardLoading } = useQuery({
    queryKey: ['payrollDashboard'],
    queryFn: () => payrollService.getMyDashboard(),
  });

  const { data: details, isLoading: detailsLoading } = useQuery({
    queryKey: ['payrollDetails'],
    queryFn: () => payrollService.getMyPayrollDetails(),
  });

  const isLoading = dashboardLoading || detailsLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'NET PAY',
      value: dashboard?.netPay || 0,
      icon: PoundSterling,
      bgColor: 'bg-green-500',
      textColor: 'text-white',
    },
    {
      title: 'GROSS PAY',
      value: dashboard?.grossPay || 0,
      icon: Wallet,
      bgColor: 'bg-blue-500',
      textColor: 'text-white',
    },
    {
      title: 'DEDUCTIONS',
      value: dashboard?.totalDeductions || 0,
      icon: TrendingDown,
      bgColor: 'bg-red-500',
      textColor: 'text-white',
    },
    {
      title: 'TOTAL PENSION',
      value: dashboard?.pensionContribution || 0,
      icon: FileText,
      bgColor: 'bg-gray-800',
      textColor: 'text-white',
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Employee Dashboard</h1>
        <p className="text-gray-600">Period 6</p>
        <p className="text-gray-600">Pay date: {dashboard?.payDate ? new Date(dashboard.payDate).toLocaleDateString('en-GB') : 'N/A'}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <div
            key={stat.title}
            className={`${stat.bgColor} ${stat.textColor} rounded-lg p-6 shadow-lg`}
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium opacity-90">{stat.title}</span>
              <stat.icon className="w-6 h-6" />
            </div>
            <div className="text-3xl font-bold">
              £{typeof stat.value === 'number' ? stat.value.toFixed(2) : '0.00'}
            </div>
            <div className="mt-2 text-xs opacity-75">View your net Payslip</div>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* My Payroll Details */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-gray-100 p-3 rounded-full">
              <FileText className="w-6 h-6 text-gray-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">MY PAYROLL DETAILS</h2>
              <p className="text-sm text-gray-500">Summary of your employee payroll information</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-600 mb-1">EMPLOYEE ID</p>
                <p className="text-lg font-semibold text-gray-900">{details?.employeeId || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">NI NUMBER</p>
                <p className="text-lg font-semibold text-gray-900">{details?.niNumber || 'Not Set'}</p>
              </div>
            </div>

            <div>
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-600 mb-1">TAX REFERENCE</p>
                <p className="text-lg font-semibold text-gray-900">{details?.taxReference || 'Not Set'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">TAX DISTRICT</p>
                <p className="text-lg font-semibold text-gray-900">{details?.taxDistrict || 'Not Set'}</p>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t">
            <Link
              to="/settings/profile"
              className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
            >
              View My Settings
              <ExternalLink className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Useful Links */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-red-100 p-3 rounded-full">
              <ExternalLink className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">USEFUL LINKS</h2>
              <p className="text-sm text-gray-500">Useful links set up for you by your company</p>
            </div>
          </div>

          <div className="space-y-3">
            <a
              href="https://www.royallondon.com/pensions/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <span className="text-sm font-medium text-gray-700">Royal London Pension</span>
              <span className="text-blue-600 text-sm">Link</span>
            </a>

            <a
              href="https://www.gov.uk/income-tax"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <span className="text-sm font-medium text-gray-700">HMRC - Income Tax and Personal Allowances</span>
              <span className="text-blue-600 text-sm">Link</span>
            </a>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="flex flex-wrap gap-3">
          <Link
            to="/payroll/payslips"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <FileText className="w-4 h-4" />
            View All Payslips
          </Link>
          <Link
            to="/documents"
            className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors flex items-center gap-2"
          >
            <FileText className="w-4 h-4" />
            Tax Documents
          </Link>
        </div>
      </div>
    </div>
  );
};
