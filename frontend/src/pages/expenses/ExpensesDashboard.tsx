import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import expenseService from '../../services/expense.service';
import { 
  Plus, 
  DollarSign, 
  Clock, 
  CheckCircle, 
  Receipt,
  FileText,
  TrendingUp,
  AlertCircle,
  BarChart3,
  Activity,
  Settings,
  CheckSquare,
} from 'lucide-react';

export default function ExpensesDashboard() {
  const navigate = useNavigate();
  const [filterStatus, setFilterStatus] = useState<string>('');

  // Fetch expense statistics
  const { data: stats } = useQuery({
    queryKey: ['expense-stats'],
    queryFn: () => expenseService.getClaimStatistics(),
  });

  // Fetch my expenses
  const { data: expensesData, isLoading } = useQuery({
    queryKey: ['my-expenses', filterStatus],
    queryFn: () => expenseService.getMyClaims({ 
      status: filterStatus || undefined,
      limit: 20,
      sortBy: 'createdAt',
      sortOrder: 'DESC',
    }),
  });

  const expenses = expensesData?.data || [];

  const formatCurrency = (amount: number, currency: string = 'GBP') => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DRAFT':
        return 'bg-gray-100 text-gray-700';
      case 'SUBMITTED':
      case 'UNDER_REVIEW':
        return 'bg-yellow-100 text-yellow-700';
      case 'APPROVED':
        return 'bg-green-100 text-green-700';
      case 'REJECTED':
        return 'bg-red-100 text-red-700';
      case 'PAID':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Expenses</h1>
          <p className="text-gray-600 mt-1">Manage your expense claims and reimbursements</p>
        </div>
        <button
          onClick={() => navigate('/expenses/submit')}
          className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          New Expense
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-600">Total Claims</p>
            <FileText className="w-5 h-5 text-gray-400" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats?.totalClaims || 0}</p>
          <p className="text-sm text-gray-500 mt-1">All time</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-600">Pending</p>
            <Clock className="w-5 h-5 text-yellow-500" />
          </div>
          <p className="text-2xl font-bold text-yellow-600">{stats?.byStatus?.submitted || 0}</p>
          <p className="text-sm text-gray-500 mt-1">Awaiting approval</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-600">Approved</p>
            <CheckCircle className="w-5 h-5 text-green-500" />
          </div>
          <p className="text-2xl font-bold text-green-600">{stats?.byStatus?.approved || 0}</p>
          <p className="text-sm text-gray-500 mt-1">
            {formatCurrency(stats?.amounts?.approved || 0)}
          </p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-600">Paid</p>
            <DollarSign className="w-5 h-5 text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-blue-600">{stats?.byStatus?.paid || 0}</p>
          <p className="text-sm text-gray-500 mt-1">Reimbursed</p>
        </div>
      </div>

      {/* Quick Access */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Access</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <button
            onClick={() => navigate('/expenses/analytics')}
            className="bg-white border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-md transition-all text-left"
          >
            <BarChart3 className="w-8 h-8 text-blue-600 mb-2" />
            <h3 className="font-semibold text-gray-900">Analytics</h3>
            <p className="text-sm text-gray-600 mt-1">View spending trends and insights</p>
          </button>

          <button
            onClick={() => navigate('/expenses/budget-health')}
            className="bg-white border border-gray-200 rounded-lg p-4 hover:border-green-300 hover:shadow-md transition-all text-left"
          >
            <Activity className="w-8 h-8 text-green-600 mb-2" />
            <h3 className="font-semibold text-gray-900">Budget Health</h3>
            <p className="text-sm text-gray-600 mt-1">Monitor budget utilization</p>
          </button>

          <button
            onClick={() => navigate('/expenses/workflows')}
            className="bg-white border border-gray-200 rounded-lg p-4 hover:border-purple-300 hover:shadow-md transition-all text-left"
          >
            <Settings className="w-8 h-8 text-purple-600 mb-2" />
            <h3 className="font-semibold text-gray-900">Workflows</h3>
            <p className="text-sm text-gray-600 mt-1">Manage approval rules</p>
          </button>

          <button
            onClick={() => navigate('/expenses/approvals')}
            className="bg-white border border-gray-200 rounded-lg p-4 hover:border-yellow-300 hover:shadow-md transition-all text-left"
          >
            <CheckSquare className="w-8 h-8 text-yellow-600 mb-2" />
            <h3 className="font-semibold text-gray-900">Approvals</h3>
            <p className="text-sm text-gray-600 mt-1">Review pending expenses</p>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-lg border border-gray-200 mb-6">
        <div className="border-b border-gray-200 px-6">
          <nav className="flex space-x-8">
            {[
              { label: 'All', value: '' },
              { label: 'Draft', value: 'DRAFT' },
              { label: 'Submitted', value: 'SUBMITTED' },
              { label: 'Approved', value: 'APPROVED' },
              { label: 'Rejected', value: 'REJECTED' },
              { label: 'Paid', value: 'PAID' },
            ].map((filter) => (
              <button
                key={filter.value}
                onClick={() => setFilterStatus(filter.value)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  filterStatus === filter.value
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Expenses List */}
        <div className="p-6">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
              <p className="text-gray-500 mt-4">Loading expenses...</p>
            </div>
          ) : expenses.length === 0 ? (
            <div className="text-center py-12">
              <Receipt className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No expenses found</h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by submitting your first expense claim.
              </p>
              <div className="mt-6">
                <button
                  onClick={() => navigate('/expenses/submit')}
                  className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  New Expense
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {expenses.map((claim: any) => (
                <div
                  key={claim.id}
                  onClick={() => navigate(`/expenses/${claim.id}`)}
                  className="border border-gray-200 rounded-lg p-4 hover:border-indigo-300 hover:shadow-sm transition-all cursor-pointer"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-gray-900">{claim.title}</h3>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                            claim.status
                          )}`}
                        >
                          {claim.status}
                        </span>
                        {claim.hasPolicyViolations && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                            <AlertCircle className="w-3 h-3 mr-1" />
                            Policy Issue
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{claim.description || 'No description'}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>Claim #{claim.claimNumber}</span>
                        <span>•</span>
                        <span>{claim.items?.length || 0} items</span>
                        <span>•</span>
                        <span>{formatDate(claim.createdAt)}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-900">
                        {formatCurrency(claim.totalAmount, claim.currency)}
                      </p>
                      {claim.submittedAt && (
                        <p className="text-xs text-gray-500 mt-1">
                          Submitted {formatDate(claim.submittedAt)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
