import { useState, useEffect } from 'react';
import {
  Users,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  Filter,
  TrendingUp,
  AlertCircle,
  Shield,
  X,
  Check,
  MessageSquare,
} from 'lucide-react';
import { holidayPlannerService, LeaveRequest, CoverageBreach } from '../../services/holidayPlannerService';

export default function ManagerCapacityView() {
  const [pendingApprovals, setPendingApprovals] = useState<LeaveRequest[]>([]);
  const [teamRequests, setTeamRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('pending');

  // Mock manager ID - in real app, get from auth context
  const managerId = 'MGR001';

  useEffect(() => {
    loadData();
  }, [filter]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load pending approvals
      const pending = await holidayPlannerService.getRequests({
        approverId: managerId,
        status: 'PENDING',
      });
      setPendingApprovals(pending);

      // Load all team requests based on filter
      const filterStatus = filter === 'all' ? undefined : filter.toUpperCase();
      const team = await holidayPlannerService.getRequests({
        status: filterStatus,
      });
      setTeamRequests(team);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId: string, comment?: string) => {
    try {
      await holidayPlannerService.approveRequest(requestId, {
        comment,
      });
      await loadData();
      setShowApprovalModal(false);
      setSelectedRequest(null);
    } catch (error) {
      console.error('Failed to approve:', error);
    }
  };

  const handleReject = async (requestId: string, reason: string) => {
    try {
      await holidayPlannerService.rejectRequest(requestId, {
        reason,
      });
      await loadData();
      setShowApprovalModal(false);
      setSelectedRequest(null);
    } catch (error) {
      console.error('Failed to reject:', error);
    }
  };

  // Calculate capacity heatmap (mock data for demonstration)
  const generateHeatmap = () => {
    const weeks = 4;
    const daysPerWeek = 5;
    const data: Array<{ date: Date; offCount: number; capacity: number }> = [];

    for (let week = 0; week < weeks; week++) {
      for (let day = 0; day < daysPerWeek; day++) {
        const date = new Date();
        date.setDate(date.getDate() + week * 7 + day);
        const offCount = Math.floor(Math.random() * 5); // Mock
        const capacity = Math.max(0, 100 - offCount * 10);
        data.push({ date, offCount, capacity });
      }
    }

    return data;
  };

  const heatmapData = generateHeatmap();

  const getCapacityColor = (capacity: number): string => {
    if (capacity >= 80) return 'bg-green-500';
    if (capacity >= 60) return 'bg-yellow-500';
    if (capacity >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const stats = {
    pendingApprovals: pendingApprovals.length,
    teamOff: teamRequests.filter(r => {
      const start = new Date(r.startDate);
      const end = new Date(r.endDate);
      const now = new Date();
      return r.status === 'APPROVED' && start <= now && end >= now;
    }).length,
    upcomingLeave: teamRequests.filter(r => {
      const start = new Date(r.startDate);
      return r.status === 'APPROVED' && start > new Date();
    }).length,
    coverageIssues: pendingApprovals.filter(r => r.coverageBreaches && r.coverageBreaches.length > 0).length,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading team capacity...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Team Capacity Dashboard</h1>
        <p className="text-gray-600 mt-1">Monitor team availability & approve leave requests</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending Approvals</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats.pendingApprovals}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Team Off Today</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats.teamOff}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Upcoming Leave</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats.upcomingLeave}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Coverage Issues</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats.coverageIssues}</p>
            </div>
            <div className={`w-12 h-12 ${stats.coverageIssues > 0 ? 'bg-red-100' : 'bg-gray-100'} rounded-lg flex items-center justify-center`}>
              <AlertTriangle className={`w-6 h-6 ${stats.coverageIssues > 0 ? 'text-red-600' : 'text-gray-400'}`} />
            </div>
          </div>
        </div>
      </div>

      {/* Capacity Heatmap */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-600" />
          Team Capacity Heatmap
        </h3>
        <p className="text-sm text-gray-600 mb-4">Next 4 weeks - darker = lower capacity</p>

        <div className="grid grid-cols-5 gap-2">
          {heatmapData.map((day, index) => (
            <div
              key={index}
              className="relative group"
            >
              <div
                className={`h-16 rounded-lg ${getCapacityColor(day.capacity)} transition-all cursor-pointer hover:opacity-80`}
                title={`${day.date.toLocaleDateString()}: ${day.capacity}% capacity`}
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-medium text-white">
                    {day.capacity}%
                  </span>
                </div>
              </div>
              <p className="text-xs text-gray-600 text-center mt-1">
                {day.date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-4 flex items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span className="text-gray-600">80-100% capacity</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-500 rounded"></div>
            <span className="text-gray-600">60-79% capacity</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-orange-500 rounded"></div>
            <span className="text-gray-600">40-59% capacity</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded"></div>
            <span className="text-gray-600">&lt;40% capacity</span>
          </div>
        </div>
      </div>

      {/* Pending Approvals */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Clock className="w-5 h-5 text-yellow-600" />
            Pending Approvals ({pendingApprovals.length})
          </h3>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
              <Filter className="w-4 h-4" />
              Filter
            </button>
          </div>
        </div>

        {pendingApprovals.length === 0 ? (
          <div className="text-center py-12">
            <CheckCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">All caught up! No pending approvals</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pendingApprovals.map((request) => {
              const hasBreaches = request.coverageBreaches && request.coverageBreaches.length > 0;
              const criticalBreaches = request.coverageBreaches?.filter(b => b.status === 'CRITICAL' || b.status === 'BREACH') || [];

              return (
                <div
                  key={request.id}
                  className={`border-2 rounded-lg p-4 ${
                    hasBreaches ? 'border-red-200 bg-red-50' : 'border-gray-200 hover:border-blue-300'
                  } transition-colors`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <p className="font-medium text-gray-900">
                          Employee {request.employeeId}
                        </p>
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                          {request.leaveType}
                        </span>
                        {hasBreaches && (
                          <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-medium flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            Coverage Issue
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-700 mb-1">
                        {new Date(request.startDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} – {new Date(request.endDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                      <p className="text-xs text-gray-600">
                        {request.durationDays} days ({request.durationHours}h) · {request.reason}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-900">{request.durationDays}</p>
                      <p className="text-xs text-gray-600">days</p>
                    </div>
                  </div>

                  {/* Coverage Warnings */}
                  {hasBreaches && (
                    <div className="mb-3 p-3 bg-white border border-red-200 rounded-lg">
                      <p className="text-xs font-semibold text-red-900 mb-2 flex items-center gap-1">
                        <Shield className="w-3 h-3" />
                        Coverage Breaches Detected:
                      </p>
                      {criticalBreaches.slice(0, 2).map((breach, idx) => (
                        <div key={idx} className="text-xs text-red-800 mb-1">
                          • {breach.date}: {breach.scope} - {breach.remaining}/{breach.minRequired} staff ({breach.coveragePercent.toFixed(0)}%)
                        </div>
                      ))}
                      {criticalBreaches.length > 2 && (
                        <p className="text-xs text-red-600 mt-1">
                          +{criticalBreaches.length - 2} more breach{criticalBreaches.length - 2 !== 1 ? 'es' : ''}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Suggested Alternatives */}
                  {request.suggestedAlternatives && request.suggestedAlternatives.length > 0 && (
                    <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-xs font-semibold text-blue-900 mb-2">
                        Suggested Alternative Dates:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {request.suggestedAlternatives.slice(0, 3).map((alt, idx) => (
                          <span key={idx} className="px-2 py-1 bg-white text-blue-700 rounded text-xs">
                            {new Date(alt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-3 border-t border-gray-200">
                    <button
                      onClick={() => {
                        setSelectedRequest(request);
                        setShowApprovalModal(true);
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
                    >
                      <Check className="w-4 h-4" />
                      Approve
                    </button>
                    <button
                      onClick={() => {
                        setSelectedRequest(request);
                        setShowApprovalModal(true);
                      }}
                      className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium"
                    >
                      <X className="w-4 h-4" />
                      Reject
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium">
                      <MessageSquare className="w-4 h-4" />
                      Request Changes
                    </button>
                    {hasBreaches && (
                      <button className="ml-auto px-3 py-2 border border-orange-300 text-orange-700 bg-orange-50 rounded-lg hover:bg-orange-100 text-xs font-medium">
                        Override Coverage
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Team Requests Overview */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Team Requests</h3>
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('pending')}
              className={`px-3 py-1 rounded text-sm ${
                filter === 'pending' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => setFilter('approved')}
              className={`px-3 py-1 rounded text-sm ${
                filter === 'approved' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'
              }`}
            >
              Approved
            </button>
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded text-sm ${
                filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'
              }`}
            >
              All
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left text-xs font-medium text-gray-600 pb-3">Employee</th>
                <th className="text-left text-xs font-medium text-gray-600 pb-3">Type</th>
                <th className="text-left text-xs font-medium text-gray-600 pb-3">Period</th>
                <th className="text-left text-xs font-medium text-gray-600 pb-3">Duration</th>
                <th className="text-left text-xs font-medium text-gray-600 pb-3">Status</th>
                <th className="text-left text-xs font-medium text-gray-600 pb-3">Created</th>
              </tr>
            </thead>
            <tbody>
              {teamRequests.slice(0, 10).map((request) => (
                <tr key={request.id} className="border-b border-gray-100">
                  <td className="py-3 text-sm text-gray-900">{request.employeeId}</td>
                  <td className="py-3">
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                      {request.leaveType}
                    </span>
                  </td>
                  <td className="py-3 text-sm text-gray-900">
                    {new Date(request.startDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} – {new Date(request.endDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                  </td>
                  <td className="py-3 text-sm text-gray-900">{request.durationDays}d</td>
                  <td className="py-3">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        request.status === 'APPROVED'
                          ? 'bg-green-100 text-green-700'
                          : request.status === 'PENDING'
                          ? 'bg-yellow-100 text-yellow-700'
                          : request.status === 'REJECTED'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {request.status}
                    </span>
                  </td>
                  <td className="py-3 text-xs text-gray-500">
                    {new Date(request.createdAt).toLocaleDateString('en-GB')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Approval Modal (simplified) */}
      {showApprovalModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full">
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Approve/Reject Request
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Request from {selectedRequest.employeeId} for {selectedRequest.durationDays} days
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => handleApprove(selectedRequest.id)}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleReject(selectedRequest.id, 'Denied by manager')}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Reject
                </button>
                <button
                  onClick={() => {
                    setShowApprovalModal(false);
                    setSelectedRequest(null);
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
