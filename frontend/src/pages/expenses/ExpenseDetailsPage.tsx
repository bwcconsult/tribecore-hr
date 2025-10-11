import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import expenseService from '../../services/expense.service';
import { 
  ArrowLeft, 
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle,
  User,
  Calendar,
  Receipt,
  AlertCircle,
} from 'lucide-react';

export default function ExpenseDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: claim, isLoading } = useQuery({
    queryKey: ['expense-claim', id],
    queryFn: () => expenseService.getClaim(id!),
    enabled: !!id,
  });

  const { data: approvalHistory } = useQuery({
    queryKey: ['approval-history', id],
    queryFn: () => expenseService.getApprovalHistory(id!),
    enabled: !!id,
  });

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
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'REJECTED':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'PENDING':
      case 'SUBMITTED':
      case 'UNDER_REVIEW':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      default:
        return <FileText className="w-5 h-5 text-gray-500" />;
    }
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

  if (isLoading) {
    return (
      <div className="p-6 max-w-5xl mx-auto">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="text-gray-500 mt-4">Loading expense details...</p>
        </div>
      </div>
    );
  }

  if (!claim) {
    return (
      <div className="p-6 max-w-5xl mx-auto">
        <div className="text-center py-12">
          <AlertCircle className="mx-auto h-12 w-12 text-red-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Expense not found</h3>
          <button
            onClick={() => navigate('/expenses')}
            className="mt-4 inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Back to Expenses
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/expenses')}
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Expenses
        </button>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-gray-900">{claim.title}</h1>
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                  claim.status
                )}`}
              >
                {getStatusIcon(claim.status)}
                <span className="ml-2">{claim.status}</span>
              </span>
            </div>
            <p className="text-gray-600">Claim #{claim.claimNumber}</p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-gray-900">
              {formatCurrency(claim.totalAmount, claim.currency)}
            </p>
            <p className="text-sm text-gray-500 mt-1">{claim.items?.length || 0} items</p>
          </div>
        </div>
      </div>

      {/* Policy Violations Alert */}
      {claim.hasPolicyViolations && claim.policyViolations && claim.policyViolations.length > 0 && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 mr-3" />
            <div className="flex-1">
              <h3 className="text-sm font-medium text-red-900 mb-2">Policy Violations</h3>
              <ul className="space-y-1">
                {claim.policyViolations.map((violation: any, index: number) => (
                  <li key={index} className="text-sm text-red-700">
                    • {violation.message}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Claim Information */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Claim Information</h2>
            {claim.description && (
              <p className="text-gray-700 mb-4">{claim.description}</p>
            )}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Submitted</p>
                <p className="font-medium text-gray-900">
                  {claim.submittedAt ? formatDate(claim.submittedAt) : 'Not submitted'}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Currency</p>
                <p className="font-medium text-gray-900">{claim.currency}</p>
              </div>
            </div>
            {claim.notes && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-500 mb-1">Notes</p>
                <p className="text-sm text-gray-700">{claim.notes}</p>
              </div>
            )}
          </div>

          {/* Expense Items */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Expense Items</h2>
            <div className="space-y-4">
              {claim.items?.map((item: any, index: number) => (
                <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{item.description}</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {item.category?.name || 'Uncategorized'} • {item.vendor || 'No vendor'}
                      </p>
                    </div>
                    <p className="text-lg font-semibold text-gray-900">
                      {formatCurrency(item.amount, item.currency)}
                    </p>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      {formatDate(item.expenseDate)}
                    </span>
                    {item.receiptAttached && (
                      <span className="flex items-center text-green-600">
                        <Receipt className="w-4 h-4 mr-1" />
                        Receipt attached
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Approval History */}
          {approvalHistory && approvalHistory.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Approval History</h2>
              <div className="space-y-4">
                {approvalHistory.map((approval: any) => (
                  <div key={approval.id} className="flex items-start gap-4">
                    <div className="mt-1">
                      {approval.status === 'APPROVED' && (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      )}
                      {approval.status === 'REJECTED' && (
                        <XCircle className="w-5 h-5 text-red-500" />
                      )}
                      {approval.status === 'PENDING' && (
                        <Clock className="w-5 h-5 text-yellow-500" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-medium text-gray-900">
                          {approval.approver?.firstName} {approval.approver?.lastName}
                        </p>
                        <p className="text-sm text-gray-500">
                          {approval.reviewedAt ? formatDate(approval.reviewedAt) : 'Pending'}
                        </p>
                      </div>
                      <p className="text-sm text-gray-600">Level {approval.level} Approval</p>
                      {approval.comments && (
                        <p className="text-sm text-gray-700 mt-2 bg-gray-50 p-2 rounded">
                          {approval.comments}
                        </p>
                      )}
                      {approval.rejectionReason && (
                        <p className="text-sm text-red-700 mt-2 bg-red-50 p-2 rounded">
                          Reason: {approval.rejectionReason}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Employee Info */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Submitted By</h3>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">
                  {claim.employee?.firstName} {claim.employee?.lastName}
                </p>
                <p className="text-sm text-gray-500">{claim.employee?.email}</p>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Timeline</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-gray-400 rounded-full mt-2"></div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Created</p>
                  <p className="text-xs text-gray-500">{formatDate(claim.createdAt)}</p>
                </div>
              </div>
              {claim.submittedAt && (
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Submitted</p>
                    <p className="text-xs text-gray-500">{formatDate(claim.submittedAt)}</p>
                  </div>
                </div>
              )}
              {claim.approvedAt && (
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Approved</p>
                    <p className="text-xs text-gray-500">{formatDate(claim.approvedAt)}</p>
                  </div>
                </div>
              )}
              {claim.paidAt && (
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Reimbursed</p>
                    <p className="text-xs text-gray-500">{formatDate(claim.paidAt)}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          {claim.status === 'DRAFT' && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <button className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 mb-2">
                Submit for Approval
              </button>
              <button className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                Edit Claim
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
