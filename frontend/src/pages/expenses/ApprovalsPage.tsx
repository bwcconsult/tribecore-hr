import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import expenseService from '../../services/expense.service';
import { CheckCircle, XCircle, Clock, User, Calendar, DollarSign, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function ApprovalsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedApproval, setSelectedApproval] = useState<any>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  // Fetch pending approvals
  const { data: approvals, isLoading } = useQuery({
    queryKey: ['pending-approvals'],
    queryFn: () => expenseService.getPendingApprovals(),
  });

  // Fetch statistics
  const { data: stats } = useQuery({
    queryKey: ['approval-stats'],
    queryFn: () => expenseService.getApprovalStatistics(),
  });

  const approveMutation = useMutation({
    mutationFn: ({ approvalId, data }: { approvalId: string; data: any }) =>
      expenseService.approveExpense(approvalId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-approvals'] });
      queryClient.invalidateQueries({ queryKey: ['approval-stats'] });
      toast.success('Expense approved successfully!');
      setSelectedApproval(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to approve expense');
    },
  });

  const handleApprove = async (approval: any) => {
    if (window.confirm(`Approve expense claim "${approval.claim.title}"?`)) {
      approveMutation.mutate({
        approvalId: approval.id,
        data: {
          status: 'APPROVED',
          comments: 'Approved',
        },
      });
    }
  };

  const handleReject = (approval: any) => {
    setSelectedApproval(approval);
    setShowRejectModal(true);
  };

  const confirmReject = () => {
    if (!rejectionReason.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }

    approveMutation.mutate({
      approvalId: selectedApproval.id,
      data: {
        status: 'REJECTED',
        rejectionReason: rejectionReason,
        comments: rejectionReason,
      },
    });

    setShowRejectModal(false);
    setRejectionReason('');
    setSelectedApproval(null);
  };

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

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Expense Approvals</h1>
        <p className="text-gray-600 mt-1">Review and approve expense claims from your team</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-600">Pending</p>
            <Clock className="w-5 h-5 text-yellow-500" />
          </div>
          <p className="text-2xl font-bold text-yellow-600">{stats?.pending || 0}</p>
          <p className="text-sm text-gray-500 mt-1">Awaiting your review</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-600">Approved</p>
            <CheckCircle className="w-5 h-5 text-green-500" />
          </div>
          <p className="text-2xl font-bold text-green-600">{stats?.approved || 0}</p>
          <p className="text-sm text-gray-500 mt-1">Total approved</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-600">Rejected</p>
            <XCircle className="w-5 h-5 text-red-500" />
          </div>
          <p className="text-2xl font-bold text-red-600">{stats?.rejected || 0}</p>
          <p className="text-sm text-gray-500 mt-1">Total rejected</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-600">Total</p>
            <DollarSign className="w-5 h-5 text-gray-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats?.total || 0}</p>
          <p className="text-sm text-gray-500 mt-1">All time</p>
        </div>
      </div>

      {/* Pending Approvals */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Pending Approvals</h2>
        </div>

        <div className="p-6">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
              <p className="text-gray-500 mt-4">Loading approvals...</p>
            </div>
          ) : !approvals || approvals.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">All caught up!</h3>
              <p className="mt-1 text-sm text-gray-500">
                There are no pending approvals at this time.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {approvals.map((approval: any) => (
                <div
                  key={approval.id}
                  className="border border-gray-200 rounded-lg p-6 hover:border-indigo-300 hover:shadow-sm transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {approval.claim.title}
                        </h3>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
                          Level {approval.level}
                        </span>
                        {approval.claim.hasPolicyViolations && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                            <AlertCircle className="w-3 h-3 mr-1" />
                            Policy Issue
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-3">
                        {approval.claim.description || 'No description'}
                      </p>

                      {/* Employee Info */}
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center">
                          <User className="w-4 h-4 mr-1" />
                          {approval.claim.employee?.firstName} {approval.claim.employee?.lastName}
                        </span>
                        <span>•</span>
                        <span className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {formatDate(approval.claim.createdAt)}
                        </span>
                        <span>•</span>
                        <span>{approval.claim.items?.length || 0} items</span>
                      </div>

                      {/* Policy Violations */}
                      {approval.claim.policyViolations && approval.claim.policyViolations.length > 0 && (
                        <div className="mt-3 bg-red-50 border border-red-200 rounded p-3">
                          <p className="text-xs font-medium text-red-900 mb-1">
                            Policy Violations:
                          </p>
                          <ul className="space-y-1">
                            {approval.claim.policyViolations.map((violation: any, idx: number) => (
                              <li key={idx} className="text-xs text-red-700">
                                • {violation.message}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    <div className="text-right ml-4">
                      <p className="text-2xl font-bold text-gray-900">
                        {formatCurrency(approval.claim.totalAmount, approval.claim.currency)}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">Claim #{approval.claim.claimNumber}</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => navigate(`/expenses/${approval.claim.id}`)}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                    >
                      View Details
                    </button>
                    <button
                      onClick={() => handleApprove(approval)}
                      disabled={approveMutation.isPending}
                      className="flex-1 inline-flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(approval)}
                      disabled={approveMutation.isPending}
                      className="flex-1 inline-flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-gray-900/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Reject Expense Claim
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Please provide a reason for rejecting this expense claim. This will be shared with
              the employee.
            </p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Enter rejection reason..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={confirmReject}
                disabled={approveMutation.isPending}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                Confirm Rejection
              </button>
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectionReason('');
                  setSelectedApproval(null);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
