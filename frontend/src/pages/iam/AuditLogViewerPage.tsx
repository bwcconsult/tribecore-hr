import { useState, useEffect } from 'react';
import {
  Activity,
  Search,
  Filter,
  Download,
  Calendar,
  User,
  Shield,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  Eye,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { toast } from 'react-hot-toast';

interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  description: string;
  entityType?: string;
  entityId?: string;
  timestamp: string;
  success: boolean;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  ipAddress: string;
  userAgent?: string;
}

export default function AuditLogViewerPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [filters, setFilters] = useState({
    search: '',
    action: 'all',
    riskLevel: 'all',
    success: 'all',
    startDate: '',
    endDate: '',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(10);

  useEffect(() => {
    fetchLogs();
  }, [currentPage, filters]);

  const fetchLogs = async () => {
    setLoading(true);
    // API call: const data = await api.get('/rbac/audit-logs', { params: filters });
    
    // Mock data
    setTimeout(() => {
      setLogs([
        {
          id: '1',
          userId: '1',
          userName: 'John Smith',
          action: 'ROLE_ASSIGNED',
          description: 'Assigned Manager role to Emma Wilson',
          entityType: 'Role',
          entityId: 'role-123',
          timestamp: '2025-01-14T10:30:25',
          success: true,
          riskLevel: 'MEDIUM',
          ipAddress: '192.168.1.100',
          userAgent: 'Mozilla/5.0...',
        },
        {
          id: '2',
          userId: '2',
          userName: 'Sarah Johnson',
          action: 'VIEW_PAYROLL_DATA',
          description: 'Accessed payroll data for December 2024',
          entityType: 'PayrollRun',
          entityId: 'payroll-456',
          timestamp: '2025-01-14T09:15:42',
          success: true,
          riskLevel: 'HIGH',
          ipAddress: '192.168.1.105',
        },
        {
          id: '3',
          userId: '3',
          userName: 'Michael Brown',
          action: 'ACCESS_DENIED',
          description: 'Attempted to access employee salary data without permission',
          entityType: 'Employee',
          entityId: 'emp-789',
          timestamp: '2025-01-14T08:45:12',
          success: false,
          riskLevel: 'CRITICAL',
          ipAddress: '192.168.1.110',
        },
        {
          id: '4',
          userId: '1',
          userName: 'John Smith',
          action: 'DELEGATION_CREATED',
          description: 'Created delegation for Manager role to Emma Wilson',
          entityType: 'Delegation',
          entityId: 'del-321',
          timestamp: '2025-01-14T07:20:33',
          success: true,
          riskLevel: 'MEDIUM',
          ipAddress: '192.168.1.100',
        },
      ]);
      setLoading(false);
    }, 500);
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'CRITICAL': return 'text-red-700 bg-red-100';
      case 'HIGH': return 'text-orange-700 bg-orange-100';
      case 'MEDIUM': return 'text-yellow-700 bg-yellow-100';
      case 'LOW': return 'text-green-700 bg-green-100';
      default: return 'text-gray-700 bg-gray-100';
    }
  };

  const getActionIcon = (action: string) => {
    if (action.includes('DENIED') || action.includes('FAILED')) {
      return <XCircle className="h-5 w-5 text-red-600" />;
    }
    if (action.includes('APPROVED') || action.includes('CREATED')) {
      return <CheckCircle className="h-5 w-5 text-green-600" />;
    }
    return <Activity className="h-5 w-5 text-blue-600" />;
  };

  const exportLogs = () => {
    toast.success('Exporting audit logs to CSV...');
  };

  const resetFilters = () => {
    setFilters({
      search: '',
      action: 'all',
      riskLevel: 'all',
      success: 'all',
      startDate: '',
      endDate: '',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Audit Log Viewer</h1>
          <p className="text-gray-600 mt-1">Complete access history and compliance trails</p>
        </div>
        <Button onClick={exportLogs}>
          <Download className="h-4 w-4 mr-2" />
          Export Logs
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters
            </CardTitle>
            <Button variant="outline" size="sm" onClick={resetFilters}>
              Reset
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search users, actions..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Action Type</label>
              <select
                value={filters.action}
                onChange={(e) => setFilters({ ...filters, action: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="all">All Actions</option>
                <option value="ROLE_ASSIGNED">Role Assigned</option>
                <option value="ROLE_REVOKED">Role Revoked</option>
                <option value="ACCESS_DENIED">Access Denied</option>
                <option value="VIEW_PAYROLL_DATA">View Payroll</option>
                <option value="DELEGATION_CREATED">Delegation Created</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Risk Level</label>
              <select
                value={filters.riskLevel}
                onChange={(e) => setFilters({ ...filters, riskLevel: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="all">All Levels</option>
                <option value="CRITICAL">Critical</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={filters.success}
                onChange={(e) => setFilters({ ...filters, success: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="all">All</option>
                <option value="true">Success</option>
                <option value="false">Failed</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Logs List */}
      <Card>
        <CardHeader>
          <CardTitle>Activity Log ({logs.length} entries)</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading audit logs...</p>
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-12">
              <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No audit logs found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => setSelectedLog(log)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="mt-1">{getActionIcon(log.action)}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-gray-900">{log.userName}</span>
                          <span className="text-gray-400">•</span>
                          <span className="text-sm font-medium text-gray-700">{log.action.replace(/_/g, ' ')}</span>
                          <span className={`px-2 py-0.5 text-xs font-bold rounded ${getRiskColor(log.riskLevel)}`}>
                            {log.riskLevel}
                          </span>
                          {!log.success && (
                            <span className="px-2 py-0.5 text-xs font-bold rounded bg-red-100 text-red-800">
                              FAILED
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{log.description}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {new Date(log.timestamp).toLocaleString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {log.ipAddress}
                          </span>
                          {log.entityType && (
                            <span className="flex items-center gap-1">
                              <Shield className="h-3 w-3" />
                              {log.entityType}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <Button size="sm" variant="outline">
                      <Eye className="h-4 w-4 mr-1" />
                      Details
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {!loading && logs.length > 0 && (
            <div className="flex items-center justify-between mt-6 pt-6 border-t">
              <p className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail Modal */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Audit Log Details</CardTitle>
                <button onClick={() => setSelectedLog(null)} className="text-gray-400 hover:text-gray-600">
                  <XCircle className="h-6 w-6" />
                </button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">User</label>
                    <p className="text-gray-900">{selectedLog.userName}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Action</label>
                    <p className="text-gray-900">{selectedLog.action.replace(/_/g, ' ')}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
                  <p className="text-gray-900">{selectedLog.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Timestamp</label>
                    <p className="text-gray-900">{new Date(selectedLog.timestamp).toLocaleString()}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Risk Level</label>
                    <span className={`inline-block px-3 py-1 text-xs font-bold rounded ${getRiskColor(selectedLog.riskLevel)}`}>
                      {selectedLog.riskLevel}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">IP Address</label>
                    <p className="text-gray-900 font-mono text-sm">{selectedLog.ipAddress}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Status</label>
                    <span className={`inline-block px-3 py-1 text-xs font-bold rounded ${
                      selectedLog.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {selectedLog.success ? 'SUCCESS' : 'FAILED'}
                    </span>
                  </div>
                </div>

                {selectedLog.entityType && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Entity Type</label>
                      <p className="text-gray-900">{selectedLog.entityType}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Entity ID</label>
                      <p className="text-gray-900 font-mono text-sm">{selectedLog.entityId}</p>
                    </div>
                  </div>
                )}

                {selectedLog.userAgent && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">User Agent</label>
                    <p className="text-gray-900 text-sm break-all">{selectedLog.userAgent}</p>
                  </div>
                )}

                <div className="flex justify-end pt-4 border-t">
                  <Button onClick={() => setSelectedLog(null)}>Close</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
