import { useState } from 'react';
import { Lock, Search, Check, X, Filter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';

interface Permission {
  feature: string;
  action: string;
  scope: string;
  description: string;
  roles: string[];
}

export default function PermissionsMatrixPage() {
  const [search, setSearch] = useState('');
  const [filterFeature, setFilterFeature] = useState('all');
  const [filterScope, setFilterScope] = useState('all');

  const roles = ['SUPER_ADMIN', 'ADMIN', 'HR_MANAGER', 'MANAGER', 'FINANCE_MANAGER', 'FINANCE', 'EMPLOYEE'];

  const permissions: Permission[] = [
    // Absence Permissions
    { feature: 'absence', action: 'view', scope: 'self', description: 'View own absences', roles: ['EMPLOYEE', 'MANAGER', 'HR_MANAGER', 'ADMIN', 'SUPER_ADMIN'] },
    { feature: 'absence', action: 'create', scope: 'self', description: 'Request absence', roles: ['EMPLOYEE', 'MANAGER', 'HR_MANAGER', 'ADMIN', 'SUPER_ADMIN'] },
    { feature: 'absence', action: 'cancel', scope: 'self', description: 'Cancel own absence', roles: ['EMPLOYEE', 'MANAGER', 'HR_MANAGER', 'ADMIN', 'SUPER_ADMIN'] },
    { feature: 'absence', action: 'view', scope: 'team', description: 'View team absences', roles: ['MANAGER', 'HR_MANAGER', 'ADMIN', 'SUPER_ADMIN'] },
    { feature: 'absence', action: 'approve', scope: 'team', description: 'Approve team absences', roles: ['MANAGER', 'HR_MANAGER', 'ADMIN', 'SUPER_ADMIN'] },
    { feature: 'absence', action: 'reject', scope: 'team', description: 'Reject team absences', roles: ['MANAGER', 'HR_MANAGER', 'ADMIN', 'SUPER_ADMIN'] },
    { feature: 'absence', action: 'view', scope: 'org', description: 'View all absences', roles: ['HR_MANAGER', 'ADMIN', 'SUPER_ADMIN'] },
    { feature: 'absence', action: 'configure', scope: 'org', description: 'Configure absence plans', roles: ['ADMIN', 'SUPER_ADMIN'] },
    
    // Employee Permissions
    { feature: 'employee', action: 'view', scope: 'self', description: 'View own profile', roles: ['EMPLOYEE', 'MANAGER', 'HR_MANAGER', 'ADMIN', 'SUPER_ADMIN'] },
    { feature: 'employee', action: 'update', scope: 'self', description: 'Edit own profile', roles: ['EMPLOYEE', 'MANAGER', 'HR_MANAGER', 'ADMIN', 'SUPER_ADMIN'] },
    { feature: 'employee', action: 'view', scope: 'team', description: 'View team profiles', roles: ['MANAGER', 'HR_MANAGER', 'ADMIN', 'SUPER_ADMIN'] },
    { feature: 'employee', action: 'update', scope: 'team', description: 'Edit team profiles', roles: ['HR_MANAGER', 'ADMIN', 'SUPER_ADMIN'] },
    { feature: 'employee', action: 'view', scope: 'org', description: 'View all employees', roles: ['HR_MANAGER', 'ADMIN', 'SUPER_ADMIN'] },
    { feature: 'employee', action: 'create', scope: 'org', description: 'Create employee', roles: ['HR_MANAGER', 'ADMIN', 'SUPER_ADMIN'] },
    { feature: 'employee', action: 'terminate', scope: 'org', description: 'Terminate employee', roles: ['HR_MANAGER', 'ADMIN', 'SUPER_ADMIN'] },
    
    // Task Permissions
    { feature: 'task', action: 'view', scope: 'self', description: 'View own tasks', roles: ['EMPLOYEE', 'MANAGER', 'HR_MANAGER', 'ADMIN', 'SUPER_ADMIN'] },
    { feature: 'task', action: 'complete', scope: 'self', description: 'Complete own tasks', roles: ['EMPLOYEE', 'MANAGER', 'HR_MANAGER', 'ADMIN', 'SUPER_ADMIN'] },
    { feature: 'task', action: 'view', scope: 'team', description: 'View team tasks', roles: ['MANAGER', 'HR_MANAGER', 'ADMIN', 'SUPER_ADMIN'] },
    { feature: 'task', action: 'assign', scope: 'team', description: 'Assign team tasks', roles: ['MANAGER', 'HR_MANAGER', 'ADMIN', 'SUPER_ADMIN'] },
    { feature: 'task', action: 'create_checklist', scope: 'org', description: 'Create checklists', roles: ['HR_MANAGER', 'ADMIN', 'SUPER_ADMIN'] },
    
    // Document Permissions
    { feature: 'document', action: 'view', scope: 'self', description: 'View own documents', roles: ['EMPLOYEE', 'MANAGER', 'HR_MANAGER', 'ADMIN', 'SUPER_ADMIN'] },
    { feature: 'document', action: 'upload', scope: 'self', description: 'Upload own documents', roles: ['EMPLOYEE', 'MANAGER', 'HR_MANAGER', 'ADMIN', 'SUPER_ADMIN'] },
    { feature: 'document', action: 'view', scope: 'team', description: 'View team documents', roles: ['MANAGER', 'HR_MANAGER', 'ADMIN', 'SUPER_ADMIN'] },
    { feature: 'document', action: 'manage', scope: 'org', description: 'Manage all documents', roles: ['HR_MANAGER', 'ADMIN', 'SUPER_ADMIN'] },
    
    // Report Permissions
    { feature: 'report', action: 'view', scope: 'self', description: 'View standard reports', roles: ['EMPLOYEE', 'MANAGER', 'HR_MANAGER', 'ADMIN', 'SUPER_ADMIN'] },
    { feature: 'report', action: 'view', scope: 'team', description: 'View team reports', roles: ['MANAGER', 'HR_MANAGER', 'ADMIN', 'SUPER_ADMIN'] },
    { feature: 'report', action: 'view', scope: 'org', description: 'View organization reports', roles: ['HR_MANAGER', 'ADMIN', 'SUPER_ADMIN'] },
    { feature: 'report', action: 'export', scope: 'org', description: 'Export reports', roles: ['HR_MANAGER', 'ADMIN', 'SUPER_ADMIN'] },
    
    // Payroll Permissions
    { feature: 'payroll', action: 'view', scope: 'org', description: 'View payroll data', roles: ['FINANCE', 'FINANCE_MANAGER', 'ADMIN', 'SUPER_ADMIN'] },
    { feature: 'payroll', action: 'process', scope: 'org', description: 'Process payroll', roles: ['FINANCE_MANAGER', 'ADMIN', 'SUPER_ADMIN'] },
    { feature: 'payroll', action: 'approve', scope: 'org', description: 'Approve payroll runs', roles: ['FINANCE_MANAGER', 'ADMIN', 'SUPER_ADMIN'] },
    
    // Expense Permissions
    { feature: 'expense', action: 'process', scope: 'org', description: 'Process expenses', roles: ['FINANCE', 'FINANCE_MANAGER', 'ADMIN', 'SUPER_ADMIN'] },
    { feature: 'expense', action: 'approve', scope: 'org', description: 'Approve all expenses', roles: ['FINANCE_MANAGER', 'ADMIN', 'SUPER_ADMIN'] },
    
    // System Permissions
    { feature: 'system', action: 'manage_users', scope: 'org', description: 'Manage users', roles: ['ADMIN', 'SUPER_ADMIN'] },
    { feature: 'system', action: 'manage_roles', scope: 'system', description: 'Manage roles', roles: ['SUPER_ADMIN'] },
    { feature: 'system', action: 'manage_permissions', scope: 'system', description: 'Manage permissions', roles: ['SUPER_ADMIN'] },
    { feature: 'system', action: 'configure', scope: 'system', description: 'System configuration', roles: ['SUPER_ADMIN'] },
    { feature: 'system', action: 'impersonate', scope: 'org', description: 'Impersonate users', roles: ['SUPER_ADMIN'] },
    
    // Audit Permissions
    { feature: 'audit', action: 'view', scope: 'self', description: 'View own audit log', roles: ['EMPLOYEE', 'MANAGER', 'HR_MANAGER', 'ADMIN', 'SUPER_ADMIN'] },
    { feature: 'audit', action: 'view', scope: 'team', description: 'View team audit log', roles: ['MANAGER', 'HR_MANAGER', 'ADMIN', 'SUPER_ADMIN'] },
    { feature: 'audit', action: 'view', scope: 'system', description: 'View system audit log', roles: ['ADMIN', 'SUPER_ADMIN'] },
  ];

  const features = Array.from(new Set(permissions.map(p => p.feature)));
  const scopes = ['self', 'team', 'org', 'system'];

  const filteredPermissions = permissions.filter(
    (perm) =>
      (filterFeature === 'all' || perm.feature === filterFeature) &&
      (filterScope === 'all' || perm.scope === filterScope) &&
      (search === '' ||
        perm.description.toLowerCase().includes(search.toLowerCase()) ||
        perm.feature.toLowerCase().includes(search.toLowerCase()) ||
        perm.action.toLowerCase().includes(search.toLowerCase()))
  );

  const getScopeColor = (scope: string) => {
    const colors: Record<string, string> = {
      self: 'bg-green-100 text-green-800',
      team: 'bg-blue-100 text-blue-800',
      org: 'bg-purple-100 text-purple-800',
      system: 'bg-red-100 text-red-800',
    };
    return colors[scope] || 'bg-gray-100 text-gray-800';
  };

  const getRoleAbbreviation = (role: string) => {
    const abbr: Record<string, string> = {
      SUPER_ADMIN: 'SA',
      ADMIN: 'AD',
      HR_MANAGER: 'HM',
      MANAGER: 'MG',
      FINANCE_MANAGER: 'FM',
      FINANCE: 'FN',
      EMPLOYEE: 'EE',
    };
    return abbr[role] || role.substring(0, 2);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Permissions Matrix</h1>
        <p className="text-gray-600 mt-1">Visual overview of role-permission assignments</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Permissions</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{permissions.length}</p>
              </div>
              <Lock className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Features</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{features.length}</p>
              </div>
              <Filter className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Roles</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{roles.length}</p>
              </div>
              <Lock className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-[200px] relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search permissions..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg"
              />
            </div>
            <select
              value={filterFeature}
              onChange={(e) => setFilterFeature(e.target.value)}
              className="px-4 py-2 border rounded-lg"
            >
              <option value="all">All Features</option>
              {features.map((feature) => (
                <option key={feature} value={feature}>
                  {feature}
                </option>
              ))}
            </select>
            <select
              value={filterScope}
              onChange={(e) => setFilterScope(e.target.value)}
              className="px-4 py-2 border rounded-lg"
            >
              <option value="all">All Scopes</option>
              {scopes.map((scope) => (
                <option key={scope} value={scope}>
                  {scope}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Role Legend */}
      <Card>
        <CardHeader>
          <CardTitle>Role Legend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {roles.map((role) => (
              <div key={role} className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 bg-blue-600 text-white rounded flex items-center justify-center text-xs font-bold">
                  {getRoleAbbreviation(role)}
                </div>
                <span className="text-sm font-medium text-gray-900">{role}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Permissions Matrix */}
      <Card>
        <CardHeader>
          <CardTitle>Permissions ({filteredPermissions.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b-2">
                  <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700 min-w-[300px]">
                    Permission
                  </th>
                  <th className="text-center py-3 px-2 font-semibold text-sm text-gray-700 w-16">Scope</th>
                  {roles.map((role) => (
                    <th key={role} className="text-center py-3 px-2 font-semibold text-xs text-gray-700 w-12">
                      {getRoleAbbreviation(role)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredPermissions.map((perm, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{perm.description}</p>
                        <p className="text-xs text-gray-600 mt-1">
                          {perm.feature}:{perm.action}
                        </p>
                      </div>
                    </td>
                    <td className="py-3 px-2 text-center">
                      <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${getScopeColor(perm.scope)}`}>
                        {perm.scope}
                      </span>
                    </td>
                    {roles.map((role) => (
                      <td key={role} className="py-3 px-2 text-center">
                        {perm.roles.includes(role) ? (
                          <Check className="h-5 w-5 text-green-600 mx-auto" />
                        ) : (
                          <X className="h-5 w-5 text-gray-300 mx-auto" />
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
