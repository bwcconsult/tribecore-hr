import { useState, useEffect } from 'react';
import {
  AlertTriangle,
  ShieldAlert,
  XCircle,
  CheckCircle,
  User,
  Shield,
  Search,
  Download,
  RefreshCw,
  Info,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { toast } from 'react-hot-toast';

interface SoDViolation {
  userId: string;
  userName: string;
  email: string;
  conflictingRoles: Array<{
    roleId: string;
    roleName: string;
    conflictsWith: string;
  }>;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  detectedAt: string;
  recommendations: string[];
}

export default function SoDViolationsPage() {
  const [violations, setViolations] = useState<SoDViolation[]>([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [filter, setFilter] = useState<'all' | 'critical' | 'high' | 'medium' | 'low'>('all');
  const [selectedViolation, setSelectedViolation] = useState<SoDViolation | null>(null);

  useEffect(() => {
    fetchViolations();
  }, []);

  const fetchViolations = async () => {
    setLoading(true);
    // API call: const data = await api.get('/rbac/sod/violations');
    
    // Mock data
    setTimeout(() => {
      setViolations([
        {
          userId: '1',
          userName: 'John Smith',
          email: 'john.smith@company.com',
          conflictingRoles: [
            { roleId: '1', roleName: 'Payroll Administrator', conflictsWith: 'PAYROLL_APPROVER' },
            { roleId: '2', roleName: 'Payroll Approver', conflictsWith: 'PAYROLL_ADMIN' },
          ],
          riskLevel: 'CRITICAL',
          detectedAt: '2025-01-14T10:30:00',
          recommendations: [
            'Remove Payroll Approver role immediately',
            'Separate duties: assign approval to different user',
            'Document business justification if override needed',
          ],
        },
        {
          userId: '2',
          userName: 'Sarah Johnson',
          email: 'sarah.johnson@company.com',
          conflictingRoles: [
            { roleId: '3', roleName: 'System Administrator', conflictsWith: 'FINANCE_OFFICER' },
            { roleId: '4', roleName: 'Finance Officer', conflictsWith: 'SYSTEM_ADMIN' },
          ],
          riskLevel: 'HIGH',
          detectedAt: '2025-01-14T11:15:00',
          recommendations: [
            'IT admin should not access financial data',
            'Remove Finance Officer role',
            'Consider creating limited finance view role',
          ],
        },
        {
          userId: '3',
          userName: 'Michael Brown',
          email: 'michael.brown@company.com',
          conflictingRoles: [
            { roleId: '5', roleName: 'Recruiter', conflictsWith: 'BUDGET_APPROVER' },
            { roleId: '6', roleName: 'Budget Approver', conflictsWith: 'RECRUITER' },
          ],
          riskLevel: 'MEDIUM',
          detectedAt: '2025-01-13T14:20:00',
          recommendations: [
            'Recruiter can bypass hiring budget controls',
            'Remove budget approval rights',
            'Require manager approval for offers',
          ],
        },
      ]);
      setLoading(false);
    }, 500);
  };

  const scanAllUsers = async () => {
    setScanning(true);
    toast.loading('Scanning all users for SoD violations...');
    
    // API call: const data = await api.post('/rbac/sod/scan');
    setTimeout(() => {
      setScanning(false);
      toast.dismiss();
      toast.success('Scan complete: 3 violations found');
      fetchViolations();
    }, 2000);
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'CRITICAL': return 'bg-red-100 text-red-800 border-red-300';
      case 'HIGH': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'LOW': return 'bg-green-100 text-green-800 border-green-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getRiskIcon = (level: string) => {
    switch (level) {
      case 'CRITICAL':
      case 'HIGH':
        return <XCircle className="h-5 w-5" />;
      case 'MEDIUM':
        return <AlertTriangle className="h-5 w-5" />;
      default:
        return <Info className="h-5 w-5" />;
    }
  };

  const resolveViolation = (userId: string, roleId: string) => {
    toast.success('Role removed to resolve violation');
    fetchViolations();
  };

  const exportReport = () => {
    toast.success('Exporting SoD violations report...');
  };

  const filteredViolations = violations.filter(v => {
    if (filter === 'all') return true;
    return v.riskLevel.toLowerCase() === filter;
  });

  const criticalCount = violations.filter(v => v.riskLevel === 'CRITICAL').length;
  const highCount = violations.filter(v => v.riskLevel === 'HIGH').length;
  const mediumCount = violations.filter(v => v.riskLevel === 'MEDIUM').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Separation of Duties Violations</h1>
          <p className="text-gray-600 mt-1">Detect and resolve conflicting role assignments</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportReport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button onClick={scanAllUsers} disabled={scanning}>
            <RefreshCw className={`h-4 w-4 mr-2 ${scanning ? 'animate-spin' : ''}`} />
            {scanning ? 'Scanning...' : 'Scan All Users'}
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Violations</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{violations.length}</p>
              </div>
              <ShieldAlert className="h-8 w-8 text-gray-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Critical</p>
                <p className="text-2xl font-bold text-red-600 mt-1">{criticalCount}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">High</p>
                <p className="text-2xl font-bold text-orange-600 mt-1">{highCount}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Medium</p>
                <p className="text-2xl font-bold text-yellow-600 mt-1">{mediumCount}</p>
              </div>
              <Info className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'
                }`}
              >
                All ({violations.length})
              </button>
              <button
                onClick={() => setFilter('critical')}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  filter === 'critical' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-700'
                }`}
              >
                Critical ({criticalCount})
              </button>
              <button
                onClick={() => setFilter('high')}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  filter === 'high' ? 'bg-orange-600 text-white' : 'bg-gray-100 text-gray-700'
                }`}
              >
                High ({highCount})
              </button>
              <button
                onClick={() => setFilter('medium')}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  filter === 'medium' ? 'bg-yellow-600 text-white' : 'bg-gray-100 text-gray-700'
                }`}
              >
                Medium ({mediumCount})
              </button>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search users..."
                className="pl-10 pr-4 py-2 border rounded-lg"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Violations List */}
      <div className="space-y-4">
        {loading ? (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading violations...</p>
            </CardContent>
          </Card>
        ) : filteredViolations.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <p className="text-gray-900 font-semibold text-lg">No violations found!</p>
              <p className="text-gray-600 mt-2">All role assignments comply with SoD policies.</p>
            </CardContent>
          </Card>
        ) : (
          filteredViolations.map((violation) => (
            <Card key={violation.userId} className="border-l-4" style={{ borderLeftColor: violation.riskLevel === 'CRITICAL' ? '#DC2626' : violation.riskLevel === 'HIGH' ? '#EA580C' : '#EAB308' }}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`p-2 rounded-lg border ${getRiskColor(violation.riskLevel)}`}>
                        {getRiskIcon(violation.riskLevel)}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">{violation.userName}</h3>
                        <p className="text-sm text-gray-600">{violation.email}</p>
                      </div>
                      <span className={`px-3 py-1 text-xs font-bold rounded-full border ${getRiskColor(violation.riskLevel)}`}>
                        {violation.riskLevel} RISK
                      </span>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <p className="text-sm font-semibold text-gray-700 mb-2">Conflicting Roles:</p>
                      <div className="space-y-2">
                        {violation.conflictingRoles.map((role, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <Shield className="h-4 w-4 text-red-600" />
                            <span className="font-medium text-gray-900">{role.roleName}</span>
                            <span className="text-gray-500">conflicts with</span>
                            <code className="px-2 py-1 bg-white border rounded text-xs text-red-600">
                              {role.conflictsWith}
                            </code>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-blue-50 rounded-lg p-4">
                      <p className="text-sm font-semibold text-blue-900 mb-2">Recommendations:</p>
                      <ul className="space-y-1">
                        {violation.recommendations.map((rec, idx) => (
                          <li key={idx} className="text-sm text-blue-800 flex items-start gap-2">
                            <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <p className="text-xs text-gray-500 mt-3">
                      Detected: {new Date(violation.detectedAt).toLocaleString()}
                    </p>
                  </div>

                  <div className="flex flex-col gap-2 ml-4">
                    <Button
                      size="sm"
                      onClick={() => setSelectedViolation(violation)}
                    >
                      View Details
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => resolveViolation(violation.userId, violation.conflictingRoles[0].roleId)}
                    >
                      Resolve
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Detail Modal */}
      {selectedViolation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Violation Details</CardTitle>
                <button onClick={() => setSelectedViolation(null)} className="text-gray-400 hover:text-gray-600">
                  <XCircle className="h-6 w-6" />
                </button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">User</label>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <User className="h-5 w-5 text-gray-600" />
                    <div>
                      <p className="font-medium text-gray-900">{selectedViolation.userName}</p>
                      <p className="text-sm text-gray-600">{selectedViolation.email}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Risk Assessment</label>
                  <span className={`inline-block px-4 py-2 text-sm font-bold rounded-lg border ${getRiskColor(selectedViolation.riskLevel)}`}>
                    {selectedViolation.riskLevel} RISK
                  </span>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Conflicting Roles</label>
                  <div className="space-y-2">
                    {selectedViolation.conflictingRoles.map((role, idx) => (
                      <div key={idx} className="p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="font-medium text-gray-900">{role.roleName}</p>
                        <p className="text-sm text-red-600 mt-1">
                          Conflicts with: <code className="px-2 py-1 bg-white rounded">{role.conflictsWith}</code>
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Recommended Actions</label>
                  <div className="space-y-2">
                    {selectedViolation.recommendations.map((rec, idx) => (
                      <div key={idx} className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
                        <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-gray-900">{rec}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                  <Button variant="outline" onClick={() => setSelectedViolation(null)}>
                    Close
                  </Button>
                  <Button onClick={() => {
                    resolveViolation(selectedViolation.userId, selectedViolation.conflictingRoles[0].roleId);
                    setSelectedViolation(null);
                  }}>
                    Resolve Violation
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
