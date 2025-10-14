import { useState } from 'react';
import { Lock, Search, Check, X, Filter, EyeOff, Globe, Settings } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { toast } from 'react-hot-toast';

interface Permission {
  feature: string;
  action: string;
  scope: string;
  description: string;
  roles: string[];
  abacScopes?: AbacScope[];
  fieldMasks?: string[];
}

interface AbacScope {
  attribute: string;
  condition: string;
  value: string;
}

interface FieldMaskConfig {
  permission: string;
  fields: string[];
  roles: string[];
}

export default function PermissionsMatrixPage() {
  const [search, setSearch] = useState('');
  const [filterFeature, setFilterFeature] = useState('all');
  const [filterScope, setFilterScope] = useState('all');
  const [showAbacConfig, setShowAbacConfig] = useState(false);
  const [showFieldMaskConfig, setShowFieldMaskConfig] = useState(false);
  const [selectedPermission, setSelectedPermission] = useState<Permission | null>(null);

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
    { 
      feature: 'payroll', 
      action: 'view', 
      scope: 'org', 
      description: 'View payroll data', 
      roles: ['FINANCE', 'FINANCE_MANAGER', 'ADMIN', 'SUPER_ADMIN'],
      abacScopes: [
        { attribute: 'country', condition: 'equals', value: 'user.country' },
        { attribute: 'businessUnit', condition: 'equals', value: 'user.businessUnit' }
      ],
      fieldMasks: ['bankAccountNumber', 'taxId', 'ssn']
    },
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Permissions Matrix</h1>
          <p className="text-gray-600 mt-1">Visual overview of role-permission assignments</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowAbacConfig(true)}>
            <Globe className="h-4 w-4 mr-2" />
            ABAC Scopes
          </Button>
          <Button variant="outline" onClick={() => setShowFieldMaskConfig(true)}>
            <EyeOff className="h-4 w-4 mr-2" />
            Field Masking
          </Button>
        </div>
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
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-gray-900 text-sm">{perm.description}</p>
                          {perm.abacScopes && perm.abacScopes.length > 0 && (
                            <Globe className="h-3 w-3 text-blue-600" title="Has ABAC rules" />
                          )}
                          {perm.fieldMasks && perm.fieldMasks.length > 0 && (
                            <EyeOff className="h-3 w-3 text-purple-600" title="Has field masking" />
                          )}
                        </div>
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

      {/* ABAC Scope Configuration Modal */}
      {showAbacConfig && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="w-full max-w-5xl max-h-[90vh] overflow-hidden">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  ABAC Scope Filters
                </CardTitle>
                <button onClick={() => setShowAbacConfig(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="h-6 w-6" />
                </button>
              </div>
            </CardHeader>
            <CardContent className="overflow-y-auto max-h-[70vh]">
              <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded">
                <p className="text-sm text-blue-900">
                  <strong>ABAC (Attribute-Based Access Control):</strong> Filter records based on user attributes like country, department, or business unit.
                </p>
              </div>

              <div className="space-y-4">
                {/* Payroll View Example */}
                <div className="border rounded-lg p-4 bg-gray-50">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-bold text-gray-900">payroll:view</h3>
                      <p className="text-sm text-gray-600">View payroll data</p>
                    </div>
                    <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded text-xs font-bold">org</span>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-gray-700">ABAC Rules:</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <div className="p-3 bg-white border rounded">
                        <div className="flex items-center gap-2 mb-1">
                          <Globe className="h-4 w-4 text-blue-600" />
                          <span className="text-xs font-bold text-gray-700">Country Filter</span>
                        </div>
                        <code className="text-xs text-gray-900">country == user.country</code>
                        <p className="text-xs text-gray-600 mt-1">Users only see payroll for their country</p>
                      </div>
                      <div className="p-3 bg-white border rounded">
                        <div className="flex items-center gap-2 mb-1">
                          <Globe className="h-4 w-4 text-blue-600" />
                          <span className="text-xs font-bold text-gray-700">Business Unit Filter</span>
                        </div>
                        <code className="text-xs text-gray-900">businessUnit == user.businessUnit</code>
                        <p className="text-xs text-gray-600 mt-1">Users only see their BU's payroll</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Employee View Example */}
                <div className="border rounded-lg p-4 bg-gray-50">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-bold text-gray-900">employee:view</h3>
                      <p className="text-sm text-gray-600">View employee profiles</p>
                    </div>
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded text-xs font-bold">team</span>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-gray-700">ABAC Rules:</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <div className="p-3 bg-white border rounded">
                        <div className="flex items-center gap-2 mb-1">
                          <Globe className="h-4 w-4 text-blue-600" />
                          <span className="text-xs font-bold text-gray-700">Department Filter</span>
                        </div>
                        <code className="text-xs text-gray-900">department == user.department</code>
                        <p className="text-xs text-gray-600 mt-1">Managers see only their department</p>
                      </div>
                      <div className="p-3 bg-white border rounded">
                        <div className="flex items-center gap-2 mb-1">
                          <Globe className="h-4 w-4 text-blue-600" />
                          <span className="text-xs font-bold text-gray-700">Manager Filter</span>
                        </div>
                        <code className="text-xs text-gray-900">managerId == user.id</code>
                        <p className="text-xs text-gray-600 mt-1">Managers see their direct reports</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Report View Example */}
                <div className="border rounded-lg p-4 bg-gray-50">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-bold text-gray-900">report:view</h3>
                      <p className="text-sm text-gray-600">View organization reports</p>
                    </div>
                    <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded text-xs font-bold">org</span>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-gray-700">ABAC Rules:</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <div className="p-3 bg-white border rounded">
                        <div className="flex items-center gap-2 mb-1">
                          <Globe className="h-4 w-4 text-blue-600" />
                          <span className="text-xs font-bold text-gray-700">Location Filter</span>
                        </div>
                        <code className="text-xs text-gray-900">location IN user.allowedLocations</code>
                        <p className="text-xs text-gray-600 mt-1">Users see reports for allowed locations</p>
                      </div>
                      <div className="p-3 bg-white border rounded">
                        <div className="flex items-center gap-2 mb-1">
                          <Globe className="h-4 w-4 text-blue-600" />
                          <span className="text-xs font-bold text-gray-700">Cost Center Filter</span>
                        </div>
                        <code className="text-xs text-gray-900">costCenter == user.costCenter</code>
                        <p className="text-xs text-gray-600 mt-1">Filter by user's cost center</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <Button variant="outline" onClick={() => setShowAbacConfig(false)}>Close</Button>
                <Button onClick={() => {
                  toast.success('ABAC scopes saved');
                  setShowAbacConfig(false);
                }}>Save Configuration</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Field Masking Configuration Modal */}
      {showFieldMaskConfig && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="w-full max-w-5xl max-h-[90vh] overflow-hidden">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <EyeOff className="h-5 w-5" />
                  Field-Level Masking Configuration
                </CardTitle>
                <button onClick={() => setShowFieldMaskConfig(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="h-6 w-6" />
                </button>
              </div>
            </CardHeader>
            <CardContent className="overflow-y-auto max-h-[70vh]">
              <div className="mb-4 p-4 bg-purple-50 border border-purple-200 rounded">
                <p className="text-sm text-purple-900">
                  <strong>Field Masking:</strong> Hide or mask sensitive fields based on user roles. Prevents unauthorized access to PII and financial data.
                </p>
              </div>

              <div className="space-y-4">
                {/* Employee Profile Masking */}
                <div className="border rounded-lg p-4 bg-gray-50">
                  <div className="mb-3">
                    <h3 className="font-bold text-gray-900">Employee Profile (employee:view)</h3>
                    <p className="text-sm text-gray-600">Sensitive fields masked for non-HR users</p>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="border-b">
                        <tr>
                          <th className="text-left py-2 px-3 font-semibold">Field</th>
                          <th className="text-center py-2 px-3 font-semibold">EMPLOYEE</th>
                          <th className="text-center py-2 px-3 font-semibold">MANAGER</th>
                          <th className="text-center py-2 px-3 font-semibold">HR_MANAGER</th>
                          <th className="text-center py-2 px-3 font-semibold">ADMIN</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        <tr>
                          <td className="py-2 px-3"><code className="text-xs bg-white px-2 py-1 rounded">salary</code></td>
                          <td className="text-center"><EyeOff className="h-4 w-4 text-red-600 mx-auto" /></td>
                          <td className="text-center"><EyeOff className="h-4 w-4 text-red-600 mx-auto" /></td>
                          <td className="text-center"><Check className="h-4 w-4 text-green-600 mx-auto" /></td>
                          <td className="text-center"><Check className="h-4 w-4 text-green-600 mx-auto" /></td>
                        </tr>
                        <tr>
                          <td className="py-2 px-3"><code className="text-xs bg-white px-2 py-1 rounded">ssn</code></td>
                          <td className="text-center"><EyeOff className="h-4 w-4 text-red-600 mx-auto" /></td>
                          <td className="text-center"><EyeOff className="h-4 w-4 text-red-600 mx-auto" /></td>
                          <td className="text-center"><Check className="h-4 w-4 text-green-600 mx-auto" /></td>
                          <td className="text-center"><Check className="h-4 w-4 text-green-600 mx-auto" /></td>
                        </tr>
                        <tr>
                          <td className="py-2 px-3"><code className="text-xs bg-white px-2 py-1 rounded">taxId</code></td>
                          <td className="text-center"><EyeOff className="h-4 w-4 text-red-600 mx-auto" /></td>
                          <td className="text-center"><EyeOff className="h-4 w-4 text-red-600 mx-auto" /></td>
                          <td className="text-center"><EyeOff className="h-4 w-4 text-red-600 mx-auto" /></td>
                          <td className="text-center"><Check className="h-4 w-4 text-green-600 mx-auto" /></td>
                        </tr>
                        <tr>
                          <td className="py-2 px-3"><code className="text-xs bg-white px-2 py-1 rounded">bankAccount</code></td>
                          <td className="text-center"><EyeOff className="h-4 w-4 text-red-600 mx-auto" /></td>
                          <td className="text-center"><EyeOff className="h-4 w-4 text-red-600 mx-auto" /></td>
                          <td className="text-center"><EyeOff className="h-4 w-4 text-red-600 mx-auto" /></td>
                          <td className="text-center"><Check className="h-4 w-4 text-green-600 mx-auto" /></td>
                        </tr>
                        <tr>
                          <td className="py-2 px-3"><code className="text-xs bg-white px-2 py-1 rounded">email</code></td>
                          <td className="text-center"><Check className="h-4 w-4 text-green-600 mx-auto" /></td>
                          <td className="text-center"><Check className="h-4 w-4 text-green-600 mx-auto" /></td>
                          <td className="text-center"><Check className="h-4 w-4 text-green-600 mx-auto" /></td>
                          <td className="text-center"><Check className="h-4 w-4 text-green-600 mx-auto" /></td>
                        </tr>
                        <tr>
                          <td className="py-2 px-3"><code className="text-xs bg-white px-2 py-1 rounded">phoneNumber</code></td>
                          <td className="text-center"><Check className="h-4 w-4 text-green-600 mx-auto" /></td>
                          <td className="text-center"><Check className="h-4 w-4 text-green-600 mx-auto" /></td>
                          <td className="text-center"><Check className="h-4 w-4 text-green-600 mx-auto" /></td>
                          <td className="text-center"><Check className="h-4 w-4 text-green-600 mx-auto" /></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Payroll Data Masking */}
                <div className="border rounded-lg p-4 bg-gray-50">
                  <div className="mb-3">
                    <h3 className="font-bold text-gray-900">Payroll Data (payroll:view)</h3>
                    <p className="text-sm text-gray-600">Financial fields masked for non-finance users</p>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="border-b">
                        <tr>
                          <th className="text-left py-2 px-3 font-semibold">Field</th>
                          <th className="text-center py-2 px-3 font-semibold">MANAGER</th>
                          <th className="text-center py-2 px-3 font-semibold">FINANCE</th>
                          <th className="text-center py-2 px-3 font-semibold">FINANCE_MANAGER</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        <tr>
                          <td className="py-2 px-3"><code className="text-xs bg-white px-2 py-1 rounded">grossPay</code></td>
                          <td className="text-center"><EyeOff className="h-4 w-4 text-red-600 mx-auto" /></td>
                          <td className="text-center"><Check className="h-4 w-4 text-green-600 mx-auto" /></td>
                          <td className="text-center"><Check className="h-4 w-4 text-green-600 mx-auto" /></td>
                        </tr>
                        <tr>
                          <td className="py-2 px-3"><code className="text-xs bg-white px-2 py-1 rounded">netPay</code></td>
                          <td className="text-center"><EyeOff className="h-4 w-4 text-red-600 mx-auto" /></td>
                          <td className="text-center"><Check className="h-4 w-4 text-green-600 mx-auto" /></td>
                          <td className="text-center"><Check className="h-4 w-4 text-green-600 mx-auto" /></td>
                        </tr>
                        <tr>
                          <td className="py-2 px-3"><code className="text-xs bg-white px-2 py-1 rounded">deductions</code></td>
                          <td className="text-center"><EyeOff className="h-4 w-4 text-red-600 mx-auto" /></td>
                          <td className="text-center"><Check className="h-4 w-4 text-green-600 mx-auto" /></td>
                          <td className="text-center"><Check className="h-4 w-4 text-green-600 mx-auto" /></td>
                        </tr>
                        <tr>
                          <td className="py-2 px-3"><code className="text-xs bg-white px-2 py-1 rounded">bankAccountNumber</code></td>
                          <td className="text-center"><EyeOff className="h-4 w-4 text-red-600 mx-auto" /></td>
                          <td className="text-center"><EyeOff className="h-4 w-4 text-red-600 mx-auto" /></td>
                          <td className="text-center"><Check className="h-4 w-4 text-green-600 mx-auto" /></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">
                  <p className="text-sm text-yellow-900">
                    <strong>Note:</strong> Masked fields are completely hidden from API responses. Frontend never receives the data.
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <Button variant="outline" onClick={() => setShowFieldMaskConfig(false)}>Close</Button>
                <Button onClick={() => {
                  toast.success('Field masking saved');
                  setShowFieldMaskConfig(false);
                }}>Save Configuration</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
