import { useState } from 'react';
import {
  Play,
  CheckCircle,
  XCircle,
  Info,
  Shield,
  User,
  Lock,
  Unlock,
  AlertTriangle,
  Eye,
  EyeOff,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { toast } from 'react-hot-toast';

interface SimulationResult {
  allowed: boolean;
  reason?: string;
  matchedPolicies?: string[];
  deniedBy?: string;
  requiresMFA?: boolean;
  fieldMask?: string[];
  recordFilters?: Record<string, any>;
  riskLevel?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export default function PolicySimulatorPage() {
  const [userId, setUserId] = useState('');
  const [action, setAction] = useState('');
  const [resource, setResource] = useState('');
  const [resourceId, setResourceId] = useState('');
  const [attributes, setAttributes] = useState({
    country: '',
    businessUnit: '',
    department: '',
  });
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [loading, setLoading] = useState(false);

  const runSimulation = async () => {
    if (!userId || !action || !resource) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    // API call: const data = await api.post('/rbac/policy/simulate', { userId, action, resource, resourceId, attributes });
    
    // Mock simulation
    setTimeout(() => {
      const mockResult: SimulationResult = {
        allowed: Math.random() > 0.3, // 70% success rate
        reason: Math.random() > 0.5 ? 'User has Manager role with required permissions' : 'Insufficient permissions - requires Manager role',
        matchedPolicies: ['Manager Policy', 'Department Access Policy'],
        deniedBy: Math.random() > 0.7 ? 'Country restriction: User can only access UK employees' : undefined,
        requiresMFA: Math.random() > 0.7,
        fieldMask: ['bankAccountNumber', 'taxId', 'ssn'],
        recordFilters: { department: attributes.department || 'Engineering', country: attributes.country || 'UK' },
        riskLevel: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'][Math.floor(Math.random() * 4)] as any,
      };
      setResult(mockResult);
      setLoading(false);
    }, 1000);
  };

  const resetSimulation = () => {
    setUserId('');
    setAction('');
    setResource('');
    setResourceId('');
    setAttributes({ country: '', businessUnit: '', department: '' });
    setResult(null);
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'CRITICAL': return 'text-red-700 bg-red-100 border-red-300';
      case 'HIGH': return 'text-orange-700 bg-orange-100 border-orange-300';
      case 'MEDIUM': return 'text-yellow-700 bg-yellow-100 border-yellow-300';
      case 'LOW': return 'text-green-700 bg-green-100 border-green-300';
      default: return 'text-gray-700 bg-gray-100 border-gray-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Policy Simulator</h1>
        <p className="text-gray-600 mt-1">Test permission scenarios before deploying changes</p>
      </div>

      {/* Info Banner */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-blue-900">Policy Testing Environment</p>
              <p className="text-sm text-blue-700 mt-1">
                This simulator allows you to test whether a specific user can perform an action on a resource.
                It evaluates RBAC roles, ABAC attributes, time restrictions, and field-level permissions without
                making actual changes to the system.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Simulation Parameters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); runSimulation(); }}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  User ID <span className="text-red-500">*</span>
                </label>
                <select
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                >
                  <option value="">Select user...</option>
                  <option value="user-1">John Smith (Manager)</option>
                  <option value="user-2">Sarah Johnson (HR Officer)</option>
                  <option value="user-3">Michael Brown (Employee)</option>
                  <option value="user-4">Emma Wilson (Payroll Admin)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Action <span className="text-red-500">*</span>
                </label>
                <select
                  value={action}
                  onChange={(e) => setAction(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                >
                  <option value="">Select action...</option>
                  <option value="view">View</option>
                  <option value="create">Create</option>
                  <option value="update">Update</option>
                  <option value="delete">Delete</option>
                  <option value="approve">Approve</option>
                  <option value="export">Export</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Resource <span className="text-red-500">*</span>
                </label>
                <select
                  value={resource}
                  onChange={(e) => setResource(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                >
                  <option value="">Select resource...</option>
                  <option value="employee">Employee Profile</option>
                  <option value="payroll">Payroll Data</option>
                  <option value="salary">Salary Information</option>
                  <option value="performance">Performance Review</option>
                  <option value="attendance">Attendance Record</option>
                  <option value="leave">Leave Request</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Resource ID (Optional)
                </label>
                <input
                  type="text"
                  value={resourceId}
                  onChange={(e) => setResourceId(e.target.value)}
                  placeholder="e.g., emp-123"
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div className="border-t pt-4">
                <p className="text-sm font-semibold text-gray-700 mb-3">ABAC Attributes (Optional)</p>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                    <input
                      type="text"
                      value={attributes.country}
                      onChange={(e) => setAttributes({ ...attributes, country: e.target.value })}
                      placeholder="e.g., UK, US"
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Business Unit</label>
                    <input
                      type="text"
                      value={attributes.businessUnit}
                      onChange={(e) => setAttributes({ ...attributes, businessUnit: e.target.value })}
                      placeholder="e.g., Engineering, Sales"
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                    <input
                      type="text"
                      value={attributes.department}
                      onChange={(e) => setAttributes({ ...attributes, department: e.target.value })}
                      placeholder="e.g., IT, Finance"
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <Button type="submit" disabled={loading} className="flex-1">
                  <Play className="h-4 w-4 mr-2" />
                  {loading ? 'Simulating...' : 'Run Simulation'}
                </Button>
                <Button type="button" variant="outline" onClick={resetSimulation}>
                  Reset
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Results */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {result?.allowed ? <Unlock className="h-5 w-5 text-green-600" /> : <Lock className="h-5 w-5 text-red-600" />}
              Simulation Result
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!result ? (
              <div className="text-center py-12">
                <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Run a simulation to see results</p>
                <p className="text-sm text-gray-500 mt-2">Fill in the form and click "Run Simulation"</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Decision */}
                <div className={`p-6 rounded-lg border-2 ${result.allowed ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                  <div className="flex items-center gap-3 mb-3">
                    {result.allowed ? (
                      <CheckCircle className="h-8 w-8 text-green-600" />
                    ) : (
                      <XCircle className="h-8 w-8 text-red-600" />
                    )}
                    <div>
                      <p className="text-xl font-bold text-gray-900">
                        {result.allowed ? 'Access Granted' : 'Access Denied'}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">{result.reason}</p>
                    </div>
                  </div>
                </div>

                {/* Risk Level */}
                {result.riskLevel && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Risk Assessment</label>
                    <span className={`inline-block px-4 py-2 text-sm font-bold rounded-lg border ${getRiskColor(result.riskLevel)}`}>
                      {result.riskLevel} RISK
                    </span>
                  </div>
                )}

                {/* Matched Policies */}
                {result.matchedPolicies && result.matchedPolicies.length > 0 && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Matched Policies</label>
                    <div className="space-y-2">
                      {result.matchedPolicies.map((policy, idx) => (
                        <div key={idx} className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <CheckCircle className="h-4 w-4 text-blue-600 flex-shrink-0" />
                          <span className="text-sm text-gray-900">{policy}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Denied By */}
                {result.deniedBy && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Denial Reason</label>
                    <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <AlertTriangle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-900">{result.deniedBy}</span>
                    </div>
                  </div>
                )}

                {/* MFA Requirement */}
                {result.requiresMFA && (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Shield className="h-5 w-5 text-yellow-600" />
                      <p className="text-sm font-semibold text-yellow-900">MFA Required</p>
                    </div>
                    <p className="text-sm text-yellow-700 mt-1">
                      Multi-factor authentication is required for this high-risk action
                    </p>
                  </div>
                )}

                {/* Field Masking */}
                {result.fieldMask && result.fieldMask.length > 0 && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Field-Level Restrictions</label>
                    <div className="p-4 bg-gray-50 border rounded-lg">
                      <p className="text-sm text-gray-600 mb-2">The following fields will be hidden/masked:</p>
                      <div className="flex flex-wrap gap-2">
                        {result.fieldMask.map((field, idx) => (
                          <span key={idx} className="inline-flex items-center gap-1 px-3 py-1 bg-gray-200 text-gray-700 rounded text-xs font-medium">
                            <EyeOff className="h-3 w-3" />
                            {field}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Record Filters */}
                {result.recordFilters && Object.keys(result.recordFilters).length > 0 && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">ABAC Record Filters</label>
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-900 mb-2">The following filters will be applied to query results:</p>
                      <div className="space-y-1">
                        {Object.entries(result.recordFilters).map(([key, value]) => (
                          <div key={key} className="flex items-center gap-2 text-sm">
                            <code className="px-2 py-1 bg-white border rounded font-mono text-xs">{key}</code>
                            <span className="text-gray-600">=</span>
                            <code className="px-2 py-1 bg-white border rounded font-mono text-xs text-blue-600">{value}</code>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Common Test Scenarios */}
      <Card>
        <CardHeader>
          <CardTitle>Common Test Scenarios</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => {
                setUserId('user-1');
                setAction('view');
                setResource('employee');
                setAttributes({ country: 'UK', businessUnit: '', department: 'Engineering' });
              }}
              className="p-4 text-left border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <p className="font-semibold text-gray-900">Manager views team member</p>
              <p className="text-sm text-gray-600 mt-1">Tests department-level access</p>
            </button>

            <button
              onClick={() => {
                setUserId('user-4');
                setAction('view');
                setResource('payroll');
                setAttributes({ country: 'UK', businessUnit: '', department: '' });
              }}
              className="p-4 text-left border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <p className="font-semibold text-gray-900">Payroll accesses salary data</p>
              <p className="text-sm text-gray-600 mt-1">Tests sensitive data access</p>
            </button>

            <button
              onClick={() => {
                setUserId('user-3');
                setAction('delete');
                setResource('employee');
                setAttributes({ country: '', businessUnit: '', department: '' });
              }}
              className="p-4 text-left border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <p className="font-semibold text-gray-900">Employee deletes record</p>
              <p className="text-sm text-gray-600 mt-1">Tests privilege escalation</p>
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
