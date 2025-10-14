import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart3,
  Users,
  ShieldAlert,
  TrendingUp,
  AlertTriangle,
  Clock,
  Download,
  RefreshCw,
  UserX,
  Activity,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { toast } from 'react-hot-toast';

interface DashboardMetrics {
  totalUsers: number;
  activeUsers: number;
  totalRoles: number;
  activeDelegations: number;
  pendingApprovals: number;
  dormantUsers: number;
  sodViolations: number;
  highRiskActions: number;
}

interface RoleDistribution {
  roleId: string;
  roleName: string;
  category: string;
  userCount: number;
  percentage: number;
}

interface DormantUser {
  userId: string;
  userName: string;
  email: string;
  roles: string[];
  daysSinceLogin: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export default function RoleAnalyticsDashboard() {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [roleDistribution, setRoleDistribution] = useState<RoleDistribution[]>([]);
  const [dormantUsers, setDormantUsers] = useState<DormantUser[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // API calls would go here
      // const metrics = await api.get('/rbac/analytics/dashboard');
      // const distribution = await api.get('/rbac/analytics/role-distribution');
      // const dormant = await api.get('/rbac/analytics/dormant-users');

      // Mock data
      setMetrics({
        totalUsers: 1248,
        activeUsers: 1102,
        totalRoles: 24,
        activeDelegations: 18,
        pendingApprovals: 5,
        dormantUsers: 146,
        sodViolations: 3,
        highRiskActions: 127,
      });

      setRoleDistribution([
        { roleId: '1', roleName: 'Manager', category: 'EMPLOYEE_MANAGER', userCount: 245, percentage: 19.6 },
        { roleId: '2', roleName: 'HR Officer', category: 'HR_OPERATIONS', userCount: 89, percentage: 7.1 },
        { roleId: '3', roleName: 'Payroll Admin', category: 'PAYROLL_FINANCE', userCount: 12, percentage: 1.0 },
        { roleId: '4', roleName: 'Employee', category: 'EMPLOYEE_MANAGER', userCount: 1102, percentage: 88.3 },
      ]);

      setDormantUsers([
        {
          userId: '1',
          userName: 'John Smith',
          email: 'john.smith@company.com',
          roles: ['Manager', 'HR Officer'],
          daysSinceLogin: 120,
          riskLevel: 'HIGH',
        },
        {
          userId: '2',
          userName: 'Jane Doe',
          email: 'jane.doe@company.com',
          roles: ['Payroll Admin'],
          daysSinceLogin: 95,
          riskLevel: 'MEDIUM',
        },
      ]);
    } catch (error) {
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
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

  const exportReport = () => {
    toast.success('Exporting analytics report...');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">IAM Analytics Dashboard</h1>
          <p className="text-gray-600 mt-1">Role distribution, usage metrics, and compliance insights</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchDashboardData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={exportReport}>
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{metrics?.totalUsers}</p>
                <p className="text-xs text-green-600 mt-1">
                  {metrics?.activeUsers} active ({Math.round((metrics?.activeUsers! / metrics?.totalUsers!) * 100)}%)
                </p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Roles</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{metrics?.totalRoles}</p>
                <p className="text-xs text-gray-500 mt-1">{metrics?.activeDelegations} delegations</p>
              </div>
              <ShieldAlert className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Dormant Users</p>
                <p className="text-2xl font-bold text-orange-600 mt-1">{metrics?.dormantUsers}</p>
                <p className="text-xs text-gray-500 mt-1">90+ days inactive</p>
              </div>
              <UserX className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">SoD Violations</p>
                <p className="text-2xl font-bold text-red-600 mt-1">{metrics?.sodViolations}</p>
                <p className="text-xs text-gray-500 mt-1">Requires attention</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Role Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Role Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {roleDistribution.map((role) => (
                <div key={role.roleId}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium">{role.roleName}</span>
                    <span className="text-gray-600">
                      {role.userCount} users ({role.percentage.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${role.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Pending Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Pending Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-5 w-5 text-orange-600" />
                  <div>
                    <p className="font-medium text-gray-900">Delegation Approvals</p>
                    <p className="text-sm text-gray-600">{metrics?.pendingApprovals} pending requests</p>
                  </div>
                </div>
                <Link to="/iam/delegations">
                  <Button size="sm">Review</Button>
                </Link>
              </div>

              <div className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <ShieldAlert className="h-5 w-5 text-red-600" />
                  <div>
                    <p className="font-medium text-gray-900">SoD Violations</p>
                    <p className="text-sm text-gray-600">{metrics?.sodViolations} conflicts detected</p>
                  </div>
                </div>
                <Link to="/iam/sod-violations">
                  <Button size="sm" variant="outline">
                    View
                  </Button>
                </Link>
              </div>

              <div className="flex items-center justify-between p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <UserX className="h-5 w-5 text-yellow-600" />
                  <div>
                    <p className="font-medium text-gray-900">Dormant Accounts</p>
                    <p className="text-sm text-gray-600">{metrics?.dormantUsers} users inactive</p>
                  </div>
                </div>
                <Button size="sm" variant="outline">
                  Review
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dormant Users Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserX className="h-5 w-5" />
            Dormant Users (High Risk)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b">
                <tr>
                  <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700">User</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700">Roles</th>
                  <th className="text-center py-3 px-4 font-semibold text-sm text-gray-700">Days Inactive</th>
                  <th className="text-center py-3 px-4 font-semibold text-sm text-gray-700">Risk Level</th>
                  <th className="text-center py-3 px-4 font-semibold text-sm text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {dormantUsers.map((user) => (
                  <tr key={user.userId} className="hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <div>
                        <p className="font-medium text-gray-900">{user.userName}</p>
                        <p className="text-sm text-gray-600">{user.email}</p>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex flex-wrap gap-1">
                        {user.roles.map((role, idx) => (
                          <span
                            key={idx}
                            className="inline-block px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded"
                          >
                            {role}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className="font-medium text-gray-900">{user.daysSinceLogin} days</span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className={`inline-block px-3 py-1 text-xs font-bold rounded-full ${getRiskColor(user.riskLevel)}`}>
                        {user.riskLevel}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Button size="sm" variant="outline">
                          Revoke Access
                        </Button>
                        <Button size="sm" variant="outline">
                          Send Reminder
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link to="/iam/audit-logs">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6">
              <Activity className="h-8 w-8 text-purple-600 mb-3" />
              <h3 className="font-semibold text-gray-900 mb-1">Audit Logs</h3>
              <p className="text-sm text-gray-600">View access history and compliance trails</p>
            </CardContent>
          </Card>
        </Link>

        <Link to="/iam/policy-simulator">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6">
              <TrendingUp className="h-8 w-8 text-green-600 mb-3" />
              <h3 className="font-semibold text-gray-900 mb-1">Policy Simulator</h3>
              <p className="text-sm text-gray-600">Test permission scenarios</p>
            </CardContent>
          </Card>
        </Link>

        <Link to="/iam/delegations">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6">
              <Users className="h-8 w-8 text-blue-600 mb-3" />
              <h3 className="font-semibold text-gray-900 mb-1">Delegations</h3>
              <p className="text-sm text-gray-600">Manage temporary access</p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
