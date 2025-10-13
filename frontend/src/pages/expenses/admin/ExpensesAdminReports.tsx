import React, { useEffect, useState } from 'react';
import { FileText, Search, MoreHorizontal } from 'lucide-react';
import axios from 'axios';

interface ExpenseReport {
  id: string;
  reportNumber: string;
  employee: {
    name: string;
  };
  submittedAt: string;
  totalAmount: number;
  status: string;
  approver?: {
    name: string;
  };
}

export default function ExpensesAdminReports() {
  const [reports, setReports] = useState<ExpenseReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'awaiting-approval' | 'awaiting-reimbursement' | 'reimbursed'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchReports();
  }, [activeTab]);

  const fetchReports = async () => {
    try {
      const params: any = {};
      if (activeTab === 'awaiting-approval') {
        params.status = 'pending_approval';
      } else if (activeTab === 'awaiting-reimbursement') {
        params.status = 'approved';
      } else if (activeTab === 'reimbursed') {
        params.status = 'reimbursed';
      }

      const response = await axios.get('/api/expenses/claims', { params });
      setReports(response.data);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      draft: 'bg-gray-100 text-gray-800',
      pending_approval: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      reimbursed: 'bg-blue-100 text-blue-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const formatStatus = (status: string) => {
    return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const filteredReports = reports.filter(report =>
    report.reportNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    report.employee.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <FileText className="w-8 h-8 text-blue-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Streamline expense reporting</h1>
          <p className="text-sm text-gray-600 mt-1">
            View and update expense reports submitted by all users, reimburse payment reports, and handle pre-invoice advances provided.
          </p>
        </div>
      </div>

      {/* Configuration Links */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="text-sm font-medium text-gray-900 mb-3">Configure and customise reports</div>
        <div className="space-y-2">
          <button className="flex items-center gap-2 text-sm text-blue-600 hover:underline">
            <span className="w-1 h-1 bg-blue-600 rounded-full"></span>
            Generate Expense Reporting
          </button>
          <button className="flex items-center gap-2 text-sm text-blue-600 hover:underline">
            <span className="w-1 h-1 bg-blue-600 rounded-full"></span>
            Choose Preferences
          </button>
          <button className="flex items-center gap-2 text-sm text-blue-600 hover:underline">
            <span className="w-1 h-1 bg-blue-600 rounded-full"></span>
            Set up Approvals
          </button>
        </div>
      </div>

      {/* View Archived Link */}
      <div>
        <button className="text-sm text-blue-600 hover:underline flex items-center gap-1">
          <span>⌃</span> View Archived Reports ›
        </button>
      </div>

      {/* Main Content */}
      <div className="bg-white border border-gray-200 rounded-lg">
        {/* Tabs */}
        <div className="border-b border-gray-200">
          <div className="flex gap-6 px-6">
            <button
              onClick={() => setActiveTab('all')}
              className={`py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'all'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setActiveTab('awaiting-approval')}
              className={`py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'awaiting-approval'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Awaiting Approval
            </button>
            <button
              onClick={() => setActiveTab('awaiting-reimbursement')}
              className={`py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'awaiting-reimbursement'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Awaiting Reimbursement
            </button>
            <button
              onClick={() => setActiveTab('reimbursed')}
              className={`py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'reimbursed'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Reimbursed
            </button>
            <button className="py-3 text-sm font-medium text-gray-400">
              <MoreHorizontal className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="p-6 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search reports..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Reports Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="text-center py-12 text-gray-500">Loading reports...</div>
          ) : filteredReports.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No reports found</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input type="checkbox" className="rounded border-gray-300" />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Employee
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Report Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Submitted Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Approver
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredReports.map((report) => (
                  <tr key={report.id} className="hover:bg-gray-50 cursor-pointer">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input type="checkbox" className="rounded border-gray-300" />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-teal-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                          {report.employee.name.charAt(0)}
                        </div>
                        <span className="text-sm text-gray-900">{report.employee.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">{report.reportNumber || 'N/A'}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-600">
                        {report.submittedAt
                          ? new Date(report.submittedAt).toLocaleDateString('en-GB', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })
                          : '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">{formatCurrency(report.totalAmount)}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                        {formatStatus(report.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-600">{report.approver?.name || '-'}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {filteredReports.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing {filteredReports.length} of {reports.length} reports
            </div>
            <div className="flex items-center gap-2">
              <button className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50">
                Previous
              </button>
              <span className="text-sm text-gray-600">1 of 2</span>
              <button className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50">
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* How It Works Section */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">How It Works</h3>
        
        <div className="relative">
          {/* Workflow Steps */}
          <div className="flex items-center justify-between">
            {/* Step 1 */}
            <div className="flex flex-col items-center text-center flex-1">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-2">
                <span className="text-blue-600 font-semibold">1</span>
              </div>
              <p className="text-xs text-gray-600 max-w-[120px]">
                Employee creates expense report
              </p>
            </div>

            {/* Arrow */}
            <div className="flex-shrink-0 px-2">→</div>

            {/* Step 2 */}
            <div className="flex flex-col items-center text-center flex-1">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-2">
                <span className="text-blue-600 font-semibold">2</span>
              </div>
              <p className="text-xs text-gray-600 max-w-[120px]">
                Submits for approval, sets rules activate
              </p>
            </div>

            {/* Arrow */}
            <div className="flex-shrink-0 px-2">→</div>

            {/* Step 3 */}
            <div className="flex flex-col items-center text-center flex-1">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-2">
                <span className="text-green-600 font-semibold">3</span>
              </div>
              <p className="text-xs text-gray-600 max-w-[120px]">
                Report approved or rejects
              </p>
            </div>

            {/* Arrow */}
            <div className="flex-shrink-0 px-2">→</div>

            {/* Step 4 */}
            <div className="flex flex-col items-center text-center flex-1">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mb-2">
                <span className="text-yellow-600 font-semibold">4</span>
              </div>
              <p className="text-xs text-gray-600 max-w-[120px]">
                Admin closes approved report offline
              </p>
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-6 mt-8">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
              <span className="text-xs text-gray-600">SUBMITTER</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded-full"></div>
              <span className="text-xs text-gray-600">APPROVER</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
              <span className="text-xs text-gray-600">ADMIN</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
