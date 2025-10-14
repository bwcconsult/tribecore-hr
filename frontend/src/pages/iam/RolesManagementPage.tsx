import { useState } from 'react';
import { Shield, Users, ChevronDown, ChevronRight, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';

interface Role {
  id: string;
  name: string;
  displayName: string;
  description: string;
  userCount: number;
  permissions: Permission[];
  color: string;
}

interface Permission {
  feature: string;
  action: string;
  scope: string;
  description: string;
}

export default function RolesManagementPage() {
  const [expandedRole, setExpandedRole] = useState<string | null>('EMPLOYEE');
  const [search, setSearch] = useState('');

  const roles: Role[] = [
    {
      id: 'SUPER_ADMIN',
      name: 'SUPER_ADMIN',
      displayName: 'Super Administrator',
      description: 'Full system access with ability to manage all settings, users, and configurations',
      userCount: 2,
      color: 'red',
      permissions: [
        { feature: 'system', action: 'configure', scope: 'system', description: 'Full system configuration' },
        { feature: 'system', action: 'manage_roles', scope: 'system', description: 'Manage all roles' },
        { feature: 'system', action: 'manage_permissions', scope: 'system', description: 'Manage all permissions' },
        { feature: 'system', action: 'impersonate', scope: 'org', description: 'Impersonate any user' },
        { feature: 'audit', action: 'view', scope: 'system', description: 'View all audit logs' },
      ],
    },
    {
      id: 'ADMIN',
      name: 'ADMIN',
      displayName: 'Administrator',
      description: 'Administrative access to manage users and organization settings',
      userCount: 8,
      color: 'purple',
      permissions: [
        { feature: 'system', action: 'manage_users', scope: 'org', description: 'Manage organization users' },
        { feature: 'employee', action: 'create', scope: 'org', description: 'Create employees' },
        { feature: 'employee', action: 'terminate', scope: 'org', description: 'Terminate employees' },
        { feature: 'absence', action: 'configure', scope: 'org', description: 'Configure absence policies' },
        { feature: 'task', action: 'create_checklist', scope: 'org', description: 'Create checklists' },
      ],
    },
    {
      id: 'HR_MANAGER',
      name: 'HR_MANAGER',
      displayName: 'HR Manager',
      description: 'Strategic HR oversight with access to analytics, reports, and employee management',
      userCount: 12,
      color: 'blue',
      permissions: [
        { feature: 'employee', action: 'view', scope: 'org', description: 'View all employees' },
        { feature: 'employee', action: 'update', scope: 'team', description: 'Edit team profiles' },
        { feature: 'absence', action: 'view', scope: 'org', description: 'View all absences' },
        { feature: 'absence', action: 'approve', scope: 'team', description: 'Approve team absences' },
        { feature: 'report', action: 'view', scope: 'org', description: 'View organization reports' },
        { feature: 'report', action: 'export', scope: 'org', description: 'Export reports' },
      ],
    },
    {
      id: 'MANAGER',
      name: 'MANAGER',
      displayName: 'Manager',
      description: 'Team management with ability to approve requests and view team data',
      userCount: 25,
      color: 'green',
      permissions: [
        { feature: 'employee', action: 'view', scope: 'team', description: 'View team profiles' },
        { feature: 'absence', action: 'view', scope: 'team', description: 'View team absences' },
        { feature: 'absence', action: 'approve', scope: 'team', description: 'Approve team absences' },
        { feature: 'absence', action: 'reject', scope: 'team', description: 'Reject team absences' },
        { feature: 'task', action: 'view', scope: 'team', description: 'View team tasks' },
        { feature: 'task', action: 'assign', scope: 'team', description: 'Assign tasks to team' },
        { feature: 'report', action: 'view', scope: 'team', description: 'View team reports' },
      ],
    },
    {
      id: 'FINANCE_MANAGER',
      name: 'FINANCE_MANAGER',
      displayName: 'Finance Manager',
      description: 'Financial oversight and management of payroll and expenses',
      userCount: 5,
      color: 'yellow',
      permissions: [
        { feature: 'payroll', action: 'process', scope: 'org', description: 'Process payroll' },
        { feature: 'payroll', action: 'approve', scope: 'org', description: 'Approve payroll runs' },
        { feature: 'expense', action: 'approve', scope: 'org', description: 'Approve all expenses' },
        { feature: 'report', action: 'view', scope: 'org', description: 'View financial reports' },
      ],
    },
    {
      id: 'FINANCE',
      name: 'FINANCE',
      displayName: 'Finance',
      description: 'Financial operations and processing',
      userCount: 8,
      color: 'orange',
      permissions: [
        { feature: 'payroll', action: 'view', scope: 'org', description: 'View payroll data' },
        { feature: 'expense', action: 'process', scope: 'org', description: 'Process expenses' },
        { feature: 'invoice', action: 'manage', scope: 'org', description: 'Manage invoices' },
      ],
    },
    {
      id: 'EMPLOYEE',
      name: 'EMPLOYEE',
      displayName: 'Employee',
      description: 'Standard employee access for self-service HR functions',
      userCount: 198,
      color: 'gray',
      permissions: [
        { feature: 'employee', action: 'view', scope: 'self', description: 'View own profile' },
        { feature: 'employee', action: 'update', scope: 'self', description: 'Edit own profile' },
        { feature: 'absence', action: 'view', scope: 'self', description: 'View own absences' },
        { feature: 'absence', action: 'create', scope: 'self', description: 'Request time off' },
        { feature: 'absence', action: 'cancel', scope: 'self', description: 'Cancel own requests' },
        { feature: 'document', action: 'view', scope: 'self', description: 'View own documents' },
        { feature: 'document', action: 'upload', scope: 'self', description: 'Upload documents' },
        { feature: 'task', action: 'view', scope: 'self', description: 'View own tasks' },
        { feature: 'task', action: 'complete', scope: 'self', description: 'Complete tasks' },
      ],
    },
  ];

  const filteredRoles = roles.filter(
    (role) =>
      search === '' ||
      role.displayName.toLowerCase().includes(search.toLowerCase()) ||
      role.description.toLowerCase().includes(search.toLowerCase())
  );

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; text: string; border: string }> = {
      red: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200' },
      purple: { bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-200' },
      blue: { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200' },
      green: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200' },
      yellow: { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-200' },
      orange: { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-200' },
      gray: { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-200' },
    };
    return colors[color] || colors.gray;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Roles Management</h1>
          <p className="text-gray-600 mt-1">View and manage system roles and their permissions</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Roles</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{roles.length}</p>
              </div>
              <Shield className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {roles.reduce((sum, role) => sum + role.userCount, 0)}
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
                <p className="text-sm text-gray-600">Total Permissions</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {roles.reduce((sum, role) => sum + role.permissions.length, 0)}
                </p>
              </div>
              <Shield className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search roles..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg"
            />
          </div>
        </CardContent>
      </Card>

      {/* Roles List */}
      <div className="space-y-4">
        {filteredRoles.map((role) => {
          const isExpanded = expandedRole === role.id;
          const colorClasses = getColorClasses(role.color);

          return (
            <Card key={role.id} className={`border-2 ${colorClasses.border}`}>
              <CardHeader
                className="cursor-pointer hover:bg-gray-50"
                onClick={() => setExpandedRole(isExpanded ? null : role.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className={`p-3 rounded-lg ${colorClasses.bg}`}>
                      <Shield className={`h-6 w-6 ${colorClasses.text}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <CardTitle className="text-xl">{role.displayName}</CardTitle>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${colorClasses.bg} ${colorClasses.text}`}>
                          {role.userCount} users
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{role.description}</p>
                    </div>
                  </div>
                  <button className="p-2 hover:bg-gray-100 rounded">
                    {isExpanded ? (
                      <ChevronDown className="h-5 w-5 text-gray-600" />
                    ) : (
                      <ChevronRight className="h-5 w-5 text-gray-600" />
                    )}
                  </button>
                </div>
              </CardHeader>

              {isExpanded && (
                <CardContent className="border-t">
                  <div className="pt-4">
                    <h3 className="font-semibold text-gray-900 mb-3">
                      Permissions ({role.permissions.length})
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {role.permissions.map((perm, idx) => (
                        <div key={idx} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">
                              {perm.feature}:{perm.action}
                            </p>
                            <p className="text-xs text-gray-600 mt-1">{perm.description}</p>
                            <span className="inline-block mt-2 px-2 py-1 bg-white rounded text-xs font-medium text-gray-700">
                              Scope: {perm.scope}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
