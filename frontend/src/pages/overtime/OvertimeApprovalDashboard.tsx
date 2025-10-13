import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import {
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  TrendingUp,
  Users,
  DollarSign,
  Calendar,
  Filter,
  Check,
  Activity,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Info,
} from 'lucide-react';
import overtimeService from '../../services/overtimeService';
import { toast } from 'react-hot-toast';

interface PendingApproval {
  id: string;
  shiftId: string;
  employeeId: string;
  employeeName: string;
  currentLevel: string;
  status: string;
  hoursRequested: number;
  amountEstimated: number;
  dueAt?: Date;
  isOverdue: boolean;
  fatigueScore?: number;
  fatigueLevel?: string;
  budgetStatus?: string;
}

export default function OvertimeApprovalDashboard() {
  const queryClient = useQueryClient();
  const [selectedApprovals, setSelectedApprovals] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [expandedApproval, setExpandedApproval] = useState<string | null>(null);

  // Fetch pending approvals
  const { data: approvalsData, isLoading } = useQuery({
    queryKey: ['pending-approvals', 'current-manager'],
    queryFn: () => overtimeService.getPendingApprovals('current-manager'),
  });

  // Fetch budgets needing attention
  const { data: budgetsData } = useQuery({
    queryKey: ['budgets-attention'],
    queryFn: () => overtimeService.getBudgetsNeedingAttention(),
  });

  // Approve mutation
  const approveMutation = useMutation({
    mutationFn: (approvalId: string) =>
      overtimeService.approveOvertime(approvalId, {
        approvedBy: 'current-manager',
        comments: 'Approved via dashboard',
      }),
    onSuccess: () => {
      toast.success('Overtime approved successfully!');
      queryClient.invalidateQueries({ queryKey: ['pending-approvals'] });
      setSelectedApprovals([]);
    },
    onError: () => {
      toast.error('Failed to approve overtime');
    },
  });

  // Reject mutation
  const rejectMutation = useMutation({
    mutationFn: (data: { approvalId: string; reason: string }) =>
      overtimeService.rejectOvertime(data.approvalId, {
        rejectedBy: 'current-manager',
        reason: data.reason,
      }),
    onSuccess: () => {
      toast.success('Overtime rejected');
      queryClient.invalidateQueries({ queryKey: ['pending-approvals'] });
      setSelectedApprovals([]);
    },
  });

  // Bulk approve mutation
  const bulkApproveMutation = useMutation({
    mutationFn: () =>
      overtimeService.bulkApprove({
        shiftIds: selectedApprovals,
        approvedBy: 'current-manager',
      }),
    onSuccess: (data) => {
      toast.success(`Approved ${data.approved} overtime requests`);
      queryClient.invalidateQueries({ queryKey: ['pending-approvals'] });
      setSelectedApprovals([]);
    },
  });

  // Mock data for demonstration
  const mockApprovals: PendingApproval[] = [
    {
      id: '1',
      shiftId: 'shift-1',
      employeeId: 'emp-1',
      employeeName: 'John Smith',
      currentLevel: 'L1_MANAGER',
      status: 'PENDING',
      hoursRequested: 2.5,
      amountEstimated: 62.50,
      dueAt: new Date(Date.now() + 2 * 60 * 60 * 1000),
      isOverdue: false,
      fatigueScore: 45,
      fatigueLevel: 'MODERATE',
      budgetStatus: 'OK',
    },
    {
      id: '2',
      shiftId: 'shift-2',
      employeeId: 'emp-2',
      employeeName: 'Sarah Johnson',
      currentLevel: 'L1_MANAGER',
      status: 'PENDING',
      hoursRequested: 4.0,
      amountEstimated: 120.00,
      dueAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
      isOverdue: true,
      fatigueScore: 72,
      fatigueLevel: 'HIGH',
      budgetStatus: 'WARNING',
    },
    {
      id: '3',
      shiftId: 'shift-3',
      employeeId: 'emp-3',
      employeeName: 'Mike Davis',
      currentLevel: 'L1_MANAGER',
      status: 'PENDING',
      hoursRequested: 1.5,
      amountEstimated: 37.50,
      isOverdue: false,
      fatigueScore: 28,
      fatigueLevel: 'LOW',
      budgetStatus: 'OK',
    },
  ];

  const approvals = mockApprovals;
  const pendingCount = approvals.length;
  const totalHours = approvals.reduce((sum, a) => sum + a.hoursRequested, 0);
  const totalAmount = approvals.reduce((sum, a) => sum + a.amountEstimated, 0);
  const overdueCount = approvals.filter(a => a.isOverdue).length;

  const toggleSelection = (id: string) => {
    setSelectedApprovals(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    if (selectedApprovals.length === approvals.length) {
      setSelectedApprovals([]);
    } else {
      setSelectedApprovals(approvals.map(a => a.id));
    }
  };

  const getFatigueBadge = (level?: string) => {
    switch (level) {
      case 'LOW':
        return <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">Low</span>;
      case 'MODERATE':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-semibold rounded-full">Moderate</span>;
      case 'HIGH':
        return <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs font-semibold rounded-full">High</span>;
      case 'CRITICAL':
        return <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full">Critical</span>;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Overtime Approvals</h1>
          <p className="text-gray-600 mt-1">Review and approve overtime requests</p>
        </div>
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter className="w-4 h-4 mr-2" />
          Filters
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-3xl font-bold text-gray-900">{pendingCount}</p>
                {overdueCount > 0 && (
                  <p className="text-xs text-red-600 mt-1">{overdueCount} overdue</p>
                )}
              </div>
              <div className="p-3 bg-yellow-50 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Hours</p>
                <p className="text-3xl font-bold text-gray-900">{totalHours.toFixed(1)}h</p>
                <p className="text-xs text-gray-500 mt-1">This period</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Cost</p>
                <p className="text-3xl font-bold text-gray-900">${totalAmount.toFixed(2)}</p>
                <p className="text-xs text-gray-500 mt-1">Estimated</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Budgets Alert</p>
                <p className="text-3xl font-bold text-gray-900">{budgetsData?.count || 0}</p>
                <p className="text-xs text-orange-600 mt-1">Need attention</p>
              </div>
              <div className="p-3 bg-orange-50 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bulk Actions */}
      {selectedApprovals.length > 0 && (
        <Card className="mb-6 border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <p className="text-sm font-medium text-blue-900">
                  {selectedApprovals.length} selected
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedApprovals([])}
                >
                  Clear
                </Button>
                <Button
                  size="sm"
                  onClick={() => bulkApproveMutation.mutate()}
                  disabled={bulkApproveMutation.isPending}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Check className="w-4 h-4 mr-2" />
                  Approve All ({selectedApprovals.length})
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Approvals List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Pending Approvals</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={selectAll}
            >
              {selectedApprovals.length === approvals.length ? 'Deselect All' : 'Select All'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
              <p className="text-gray-600 mt-4">Loading approvals...</p>
            </div>
          ) : approvals.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No pending approvals</p>
              <p className="text-sm text-gray-500 mt-1">All caught up!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {approvals.map((approval) => (
                <div
                  key={approval.id}
                  className={`border rounded-lg p-4 transition-all ${
                    selectedApprovals.includes(approval.id)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  } ${approval.isOverdue ? 'border-red-300 bg-red-50' : ''}`}
                >
                  <div className="flex items-start gap-4">
                    {/* Checkbox */}
                    <input
                      type="checkbox"
                      checked={selectedApprovals.includes(approval.id)}
                      onChange={() => toggleSelection(approval.id)}
                      className="mt-1 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />

                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-gray-900 text-lg">
                            {approval.employeeName}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {approval.hoursRequested.toFixed(1)} hours • ${approval.amountEstimated.toFixed(2)}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          {approval.isOverdue && (
                            <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" />
                              Overdue
                            </span>
                          )}
                          {getFatigueBadge(approval.fatigueLevel)}
                        </div>
                      </div>

                      {/* Metrics */}
                      <div className="grid grid-cols-3 gap-4 mb-3">
                        <div className="flex items-center gap-2">
                          <Activity className="w-4 h-4 text-gray-400" />
                          <div>
                            <p className="text-xs text-gray-600">Fatigue</p>
                            <p className="text-sm font-medium text-gray-900">{approval.fatigueScore}/100</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-gray-400" />
                          <div>
                            <p className="text-xs text-gray-600">Budget</p>
                            <p className="text-sm font-medium text-gray-900">{approval.budgetStatus}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <div>
                            <p className="text-xs text-gray-600">Due</p>
                            <p className="text-sm font-medium text-gray-900">
                              {approval.dueAt ? new Date(approval.dueAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          onClick={() => approveMutation.mutate(approval.id)}
                          disabled={approveMutation.isPending}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Check className="w-4 h-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            const reason = prompt('Rejection reason:');
                            if (reason) {
                              rejectMutation.mutate({ approvalId: approval.id, reason });
                            }
                          }}
                          className="border-red-300 text-red-600 hover:bg-red-50"
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Reject
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setExpandedApproval(expandedApproval === approval.id ? null : approval.id)}
                        >
                          <Info className="w-4 h-4 mr-1" />
                          Details
                          {expandedApproval === approval.id ? (
                            <ChevronUp className="w-4 h-4 ml-1" />
                          ) : (
                            <ChevronDown className="w-4 h-4 ml-1" />
                          )}
                        </Button>
                      </div>

                      {/* Expanded Details */}
                      {expandedApproval === approval.id && (
                        <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200">
                          <h4 className="font-semibold text-gray-900 mb-3">Shift Details</h4>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-gray-600">Shift Type</p>
                              <p className="font-medium text-gray-900">Day Shift</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Cost Center</p>
                              <p className="font-medium text-gray-900">Engineering</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Start Time</p>
                              <p className="font-medium text-gray-900">8:00 AM</p>
                            </div>
                            <div>
                              <p className="text-gray-600">End Time</p>
                              <p className="font-medium text-gray-900">6:30 PM</p>
                            </div>
                          </div>
                          <div className="mt-3 p-3 bg-blue-50 rounded border border-blue-200">
                            <p className="text-xs font-semibold text-blue-700 mb-1">Calculation Breakdown:</p>
                            <p className="text-xs text-blue-600">• Regular hours: 8.0h @ $25/h = $200.00</p>
                            <p className="text-xs text-blue-600">• Daily OT (&gt;8h): 2.5h @ 1.5× = $93.75</p>
                            <p className="text-xs text-blue-600">• Total: $293.75</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
