import { Link } from 'react-router-dom';
import {
  Shield,
  Users,
  Lock,
  UserCog,
  Building2,
  AlertCircle,
  TrendingUp,
  CheckCircle,
  BarChart3,
  UserPlus,
  ShieldAlert,
  Activity,
  Play,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';

export default function IAMOverviewPage() {
  const stats = {
    totalUsers: 250,
    activeRoles: 7,
    permissions: 68,
    securityGroups: 12,
    recentRoleChanges: 5,
    usersWithMultipleRoles: 23,
  };

  const recentActivity = [
    { user: 'John Smith', action: 'Role Added', role: 'HR_MANAGER', timestamp: '2 hours ago' },
    { user: 'Sarah Jones', action: 'Role Removed', role: 'MANAGER', timestamp: '5 hours ago' },
    { user: 'Mike Brown', action: 'Added to Group', role: 'Engineering Team', timestamp: '1 day ago' },
  ];

  const roleDistribution = [
    { role: 'EMPLOYEE', count: 198, percentage: 79 },
    { role: 'MANAGER', count: 25, percentage: 10 },
    { role: 'HR_MANAGER', count: 12, percentage: 5 },
    { role: 'ADMIN', count: 8, percentage: 3 },
    { role: 'FINANCE_MANAGER', count: 5, percentage: 2 },
    { role: 'FINANCE', count: 2, percentage: 1 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Identity & Access Management</h1>
        <p className="text-gray-600 mt-1">Manage users, roles, permissions, and security groups</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalUsers}</p>
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
                <p className="text-2xl font-bold text-purple-600 mt-1">{stats.activeRoles}</p>
              </div>
              <Shield className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Permissions</p>
                <p className="text-2xl font-bold text-green-600 mt-1">{stats.permissions}</p>
              </div>
              <Lock className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Security Groups</p>
                <p className="text-2xl font-bold text-orange-600 mt-1">{stats.securityGroups}</p>
              </div>
              <Building2 className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link to="/iam/roles" className="block">
              <Button variant="outline" className="w-full justify-start">
                <Shield className="h-4 w-4 mr-2" />
                Manage Roles
              </Button>
            </Link>
            <Link to="/iam/user-roles" className="block">
              <Button variant="outline" className="w-full justify-start">
                <UserCog className="h-4 w-4 mr-2" />
                Assign User Roles
              </Button>
            </Link>
            <Link to="/iam/permissions" className="block">
              <Button variant="outline" className="w-full justify-start">
                <Lock className="h-4 w-4 mr-2" />
                View Permissions
              </Button>
            </Link>
            <Link to="/iam/security-groups" className="block">
              <Button variant="outline" className="w-full justify-start">
                <Building2 className="h-4 w-4 mr-2" />
                Security Groups
              </Button>
            </Link>
            <Link to="/iam/analytics" className="block">
              <Button variant="outline" className="w-full justify-start">
                <BarChart3 className="h-4 w-4 mr-2" />
                Analytics Dashboard
              </Button>
            </Link>
            <Link to="/iam/delegations" className="block">
              <Button variant="outline" className="w-full justify-start">
                <UserPlus className="h-4 w-4 mr-2" />
                Delegations
              </Button>
            </Link>
            <Link to="/iam/sod-violations" className="block">
              <Button variant="outline" className="w-full justify-start">
                <ShieldAlert className="h-4 w-4 mr-2" />
                SoD Violations
              </Button>
            </Link>
            <Link to="/iam/audit-logs" className="block">
              <Button variant="outline" className="w-full justify-start">
                <Activity className="h-4 w-4 mr-2" />
                Audit Logs
              </Button>
            </Link>
            <Link to="/iam/policy-simulator" className="block">
              <Button variant="outline" className="w-full justify-start">
                <Play className="h-4 w-4 mr-2" />
                Policy Simulator
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Role Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Role Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {roleDistribution.map((item) => (
                <div key={item.role}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-gray-900">{item.role}</span>
                    <span className="text-gray-600">
                      {item.count} users ({item.percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${item.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivity.map((activity, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="p-2 bg-white rounded-lg">
                    {activity.action === 'Role Added' && (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    )}
                    {activity.action === 'Role Removed' && (
                      <AlertCircle className="h-4 w-4 text-red-600" />
                    )}
                    {activity.action === 'Added to Group' && (
                      <Building2 className="h-4 w-4 text-blue-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{activity.user}</p>
                    <p className="text-xs text-gray-600">
                      {activity.action}: <span className="font-medium">{activity.role}</span>
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{activity.timestamp}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      <Card className="border-orange-200 bg-orange-50">
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-orange-900">Security Recommendations</h3>
              <ul className="mt-2 space-y-1 text-sm text-orange-800">
                <li>• {stats.usersWithMultipleRoles} users have multiple roles - review for security</li>
                <li>• Consider adding RECRUITER role for talent acquisition team</li>
                <li>• Review admin access quarterly for compliance</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
