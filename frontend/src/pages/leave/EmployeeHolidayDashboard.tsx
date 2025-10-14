import { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  AlertCircle, 
  CheckCircle, 
  Plus,
  TrendingUp,
  Sun,
  AlertTriangle,
  Info,
  X,
  Users
} from 'lucide-react';
import { holidayPlannerService, LeaveBalance, LeaveRequest } from '../../services/holidayPlannerService';

export default function EmployeeHolidayDashboard() {
  const [balances, setBalances] = useState<LeaveBalance[]>([]);
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRequestDrawer, setShowRequestDrawer] = useState(false);
  const [selectedLeaveType, setSelectedLeaveType] = useState<string>('AL');

  // Mock employee ID - in real app, get from auth context
  const employeeId = 'EMP001';

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [balancesData, requestsData] = await Promise.all([
        holidayPlannerService.getBalances(employeeId),
        holidayPlannerService.getRequests({ employeeId }),
      ]);
      setBalances(balancesData);
      setRequests(requestsData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getLeaveTypeColor = (code: string): string => {
    const colors: Record<string, string> = {
      AL: '#4CAF50',
      SICK: '#F44336',
      TOIL: '#9C27B0',
      MAT: '#FF9800',
      PAT: '#2196F3',
      STUDY: '#673AB7',
    };
    return colors[code] || '#757575';
  };

  const upcomingRequests = requests
    .filter(r => new Date(r.startDate) >= new Date() && r.status !== 'REJECTED' && r.status !== 'CANCELLED')
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
    .slice(0, 5);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your holiday dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Holidays</h1>
            <p className="text-gray-600 mt-1">Smart leave planner with real-time balances & coverage insights</p>
          </div>
          <button 
            onClick={() => setShowRequestDrawer(true)}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-md transition-all"
          >
            <Plus className="w-5 h-5" />
            Request Leave
          </button>
        </div>
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {balances.map((balance) => {
          const available = parseFloat(balance.available);
          const entitled = parseFloat(balance.entitled);
          const taken = parseFloat(balance.taken);
          const pending = parseFloat(balance.pending);
          const expiringSoon = parseFloat(balance.expiringSoon);
          const percentUsed = entitled > 0 ? (taken / entitled) * 100 : 0;

          return (
            <div
              key={balance.leaveTypeCode}
              className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer border-l-4"
              style={{ borderColor: balance.color || getLeaveTypeColor(balance.leaveTypeCode) }}
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-gray-600">{balance.leaveTypeName}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">
                    {available}
                    <span className="text-lg text-gray-500 ml-1">h</span>
                  </p>
                </div>
                <div 
                  className="w-12 h-12 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${balance.color || getLeaveTypeColor(balance.leaveTypeCode)}20` }}
                >
                  <Calendar 
                    className="w-6 h-6"
                    style={{ color: balance.color || getLeaveTypeColor(balance.leaveTypeCode) }}
                  />
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-3">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="h-2 rounded-full transition-all"
                    style={{
                      width: `${Math.min(percentUsed, 100)}%`,
                      backgroundColor: balance.color || getLeaveTypeColor(balance.leaveTypeCode),
                    }}
                  />
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  {taken}h taken · {pending}h pending
                </p>
              </div>

              {/* Expiry Warning */}
              {expiringSoon > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-2 mt-2">
                  <p className="text-xs text-amber-800 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    {expiringSoon}h expiring soon
                  </p>
                </div>
              )}

              {/* Breakdown */}
              <div className="mt-3 pt-3 border-t border-gray-100 space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600">Entitled:</span>
                  <span className="font-medium text-gray-900">{entitled}h</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600">Accrued:</span>
                  <span className="font-medium text-gray-900">{balance.accrued}h</span>
                </div>
                {parseFloat(balance.carriedOver) > 0 && (
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600">Carried:</span>
                    <span className="font-medium text-blue-600">{balance.carriedOver}h</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Upcoming Leave & Calendar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Upcoming Leave */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Sun className="w-5 h-5 text-blue-600" />
              Upcoming Leave
            </h3>
            <button className="text-sm text-blue-600 hover:text-blue-700">View all</button>
          </div>

          {upcomingRequests.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No upcoming leave booked</p>
              <button 
                onClick={() => setShowRequestDrawer(true)}
                className="mt-4 text-sm text-blue-600 hover:text-blue-700"
              >
                Book your first holiday
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingRequests.map((request) => {
                const startDate = new Date(request.startDate);
                const endDate = new Date(request.endDate);
                const daysUntil = Math.ceil((startDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

                return (
                  <div
                    key={request.id}
                    className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span
                            className="px-2 py-1 rounded text-xs font-medium text-white"
                            style={{ backgroundColor: getLeaveTypeColor(request.leaveTypeCode) }}
                          >
                            {request.leaveType}
                          </span>
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              request.status === 'APPROVED'
                                ? 'bg-green-100 text-green-700'
                                : request.status === 'PENDING'
                                ? 'bg-yellow-100 text-yellow-700'
                                : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {request.status}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-gray-900 mb-1">
                          {startDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} – {endDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                        <p className="text-xs text-gray-600">
                          {request.durationDays} day{request.durationDays !== 1 ? 's' : ''} ({request.durationHours}h) · {request.reason}
                        </p>
                        {daysUntil <= 7 && daysUntil > 0 && (
                          <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Starts in {daysUntil} day{daysUntil !== 1 ? 's' : ''}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-gray-900">{request.durationDays}</p>
                        <p className="text-xs text-gray-600">days</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div className="space-y-4">
          {/* Total Available */}
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-sm p-6 text-white">
            <p className="text-blue-100 text-sm mb-2">Total Available</p>
            <p className="text-4xl font-bold mb-1">
              {balances.reduce((sum, b) => sum + parseFloat(b.available), 0).toFixed(1)}
              <span className="text-xl ml-1">hours</span>
            </p>
            <p className="text-sm text-blue-100">
              Across {balances.length} leave type{balances.length !== 1 ? 's' : ''}
            </p>
          </div>

          {/* This Year Stats */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h4 className="text-sm font-semibold text-gray-900 mb-4">This Year</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Requests</span>
                <span className="text-sm font-medium text-gray-900">{requests.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Approved</span>
                <span className="text-sm font-medium text-green-600">
                  {requests.filter(r => r.status === 'APPROVED').length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Pending</span>
                <span className="text-sm font-medium text-yellow-600">
                  {requests.filter(r => r.status === 'PENDING').length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Rejected</span>
                <span className="text-sm font-medium text-red-600">
                  {requests.filter(r => r.status === 'REJECTED').length}
                </span>
              </div>
            </div>
          </div>

          {/* Tips */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-amber-600 mt-0.5" />
              <div>
                <p className="text-xs font-medium text-amber-900 mb-1">Smart Tip</p>
                <p className="text-xs text-amber-800">
                  Book leave 7+ days in advance for faster approval
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Requests */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Request History</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left text-xs font-medium text-gray-600 pb-3">Type</th>
                <th className="text-left text-xs font-medium text-gray-600 pb-3">Period</th>
                <th className="text-left text-xs font-medium text-gray-600 pb-3">Duration</th>
                <th className="text-left text-xs font-medium text-gray-600 pb-3">Status</th>
                <th className="text-left text-xs font-medium text-gray-600 pb-3">Reason</th>
                <th className="text-left text-xs font-medium text-gray-600 pb-3">Created</th>
              </tr>
            </thead>
            <tbody>
              {requests.slice(0, 10).map((request) => (
                <tr key={request.id} className="border-b border-gray-100">
                  <td className="py-3">
                    <span
                      className="px-2 py-1 rounded text-xs font-medium text-white"
                      style={{ backgroundColor: getLeaveTypeColor(request.leaveTypeCode) }}
                    >
                      {request.leaveType}
                    </span>
                  </td>
                  <td className="py-3 text-sm text-gray-900">
                    {new Date(request.startDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} – {new Date(request.endDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="py-3 text-sm text-gray-900">
                    {request.durationDays}d ({request.durationHours}h)
                  </td>
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
                  <td className="py-3 text-sm text-gray-600 max-w-xs truncate">
                    {request.reason}
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

      {/* Request Drawer (simplified - full version would be in separate component) */}
      {showRequestDrawer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Request Leave</h2>
              <button
                onClick={() => setShowRequestDrawer(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <p className="text-gray-600">Full request form would go here...</p>
              <p className="text-sm text-gray-500 mt-2">
                This would include: date picker, leave type selector, reason input, coverage check, etc.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
