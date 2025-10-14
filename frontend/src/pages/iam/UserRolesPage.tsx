import { useState } from 'react';
import { UserCog, Search, Shield, X, Plus, Check, AlertTriangle, UserPlus, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { toast } from 'react-hot-toast';

interface User {
  id: string;
  name: string;
  email: string;
  department: string;
  roles: string[];
  activeDelegations?: Delegation[];
}

interface Delegation {
  id: string;
  delegatedRole: string;
  delegator: string;
  startDate: string;
  endDate: string;
  status: 'ACTIVE' | 'PENDING' | 'EXPIRED';
}

export default function UserRolesPage() {
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showRoleModal, setShowRoleModal] = useState(false);

  // Mock data
  const [users, setUsers] = useState<User[]>([
    {
      id: '1',
      name: 'John Smith',
      email: 'john.smith@company.com',
      department: 'Engineering',
      roles: ['EMPLOYEE', 'MANAGER'],
      activeDelegations: [
        {
          id: 'del-1',
          delegatedRole: 'HR_MANAGER',
          delegator: 'Sarah Johnson',
          startDate: '2025-01-10',
          endDate: '2025-01-20',
          status: 'ACTIVE',
        },
      ],
    },
    {
      id: '2',
      name: 'Sarah Johnson',
      email: 'sarah.johnson@company.com',
      department: 'Human Resources',
      roles: ['EMPLOYEE', 'HR_MANAGER'],
      activeDelegations: [],
    },
    {
      id: '3',
      name: 'Mike Brown',
      email: 'mike.brown@company.com',
      department: 'Finance',
      roles: ['EMPLOYEE', 'FINANCE_MANAGER'],
      activeDelegations: [],
    },
    {
      id: '4',
      name: 'Emily Davis',
      email: 'emily.davis@company.com',
      department: 'Marketing',
      roles: ['EMPLOYEE'],
      activeDelegations: [
        {
          id: 'del-2',
          delegatedRole: 'MANAGER',
          delegator: 'John Smith',
          startDate: '2025-01-12',
          endDate: '2025-01-22',
          status: 'ACTIVE',
        },
      ],
    },
    {
      id: '5',
      name: 'David Wilson',
      email: 'david.wilson@company.com',
      department: 'IT',
      roles: ['EMPLOYEE', 'ADMIN'],
      activeDelegations: [],
    },
  ]);

  const availableRoles = [
    { name: 'SUPER_ADMIN', displayName: 'Super Administrator', color: 'red' },
    { name: 'ADMIN', displayName: 'Administrator', color: 'purple' },
    { name: 'HR_MANAGER', displayName: 'HR Manager', color: 'blue' },
    { name: 'MANAGER', displayName: 'Manager', color: 'green' },
    { name: 'FINANCE_MANAGER', displayName: 'Finance Manager', color: 'yellow' },
    { name: 'FINANCE', displayName: 'Finance', color: 'orange' },
    { name: 'EMPLOYEE', displayName: 'Employee', color: 'gray' },
  ];

  const filteredUsers = users.filter(
    (user) =>
      search === '' ||
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase()) ||
      user.department.toLowerCase().includes(search.toLowerCase())
  );

  const getRoleColor = (roleName: string) => {
    const role = availableRoles.find((r) => r.name === roleName);
    const colors: Record<string, string> = {
      red: 'bg-red-100 text-red-800',
      purple: 'bg-purple-100 text-purple-800',
      blue: 'bg-blue-100 text-blue-800',
      green: 'bg-green-100 text-green-800',
      yellow: 'bg-yellow-100 text-yellow-800',
      orange: 'bg-orange-100 text-orange-800',
      gray: 'bg-gray-100 text-gray-800',
    };
    return colors[role?.color || 'gray'];
  };

  const checkSoDConflict = (existingRoles: string[], newRole: string): string | null => {
    const conflicts: Record<string, string[]> = {
      'ADMIN': ['FINANCE_MANAGER'],
      'FINANCE_MANAGER': ['ADMIN', 'FINANCE'],
      'FINANCE': ['FINANCE_MANAGER'],
      'HR_MANAGER': ['FINANCE_MANAGER'],
    };
    
    for (const existingRole of existingRoles) {
      if (conflicts[newRole]?.includes(existingRole)) {
        return `SoD Violation: ${newRole} conflicts with ${existingRole}`;
      }
      if (conflicts[existingRole]?.includes(newRole)) {
        return `SoD Violation: ${newRole} conflicts with ${existingRole}`;
      }
    }
    return null;
  };

  const handleAddRole = (userId: string, roleName: string) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;

    // Check for SoD conflicts
    const conflict = checkSoDConflict(user.roles, roleName);
    if (conflict) {
      toast.error(conflict);
      return;
    }

    setUsers(
      users.map((u) =>
        u.id === userId
          ? { ...u, roles: [...u.roles, roleName] }
          : u
      )
    );
    toast.success(`Role ${roleName} added to ${selectedUser?.name}`);
  };

  const handleRemoveRole = (userId: string, roleName: string) => {
    if (roleName === 'EMPLOYEE') {
      toast.error('Cannot remove EMPLOYEE role - all users must have this base role');
      return;
    }
    setUsers(
      users.map((user) =>
        user.id === userId
          ? { ...user, roles: user.roles.filter((r) => r !== roleName) }
          : user
      )
    );
    toast.success(`Role ${roleName} removed from user`);
  };

  const openRoleModal = (user: User) => {
    setSelectedUser(user);
    setShowRoleModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">User Role Assignment</h1>
        <p className="text-gray-600 mt-1">Assign and manage user roles across the organization</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{users.length}</p>
              </div>
              <UserCog className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Delegations</p>
                <p className="text-2xl font-bold text-blue-600 mt-1">
                  {users.reduce((sum, u) => sum + (u.activeDelegations?.length || 0), 0)}
                </p>
              </div>
              <UserPlus className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Admin Users</p>
                <p className="text-2xl font-bold text-purple-600 mt-1">
                  {users.filter((u) => u.roles.includes('ADMIN') || u.roles.includes('SUPER_ADMIN')).length}
                </p>
              </div>
              <Shield className="h-8 w-8 text-purple-600" />
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
              placeholder="Search users by name, email, or department..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg"
            />
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Users ({filteredUsers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b">
                <tr>
                  <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700">User</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700">Department</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700">Roles</th>
                  <th className="text-right py-3 px-4 font-semibold text-sm text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <div>
                        <p className="font-medium text-gray-900">{user.name}</p>
                        <p className="text-sm text-gray-600">{user.email}</p>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-sm text-gray-900">{user.department}</span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="space-y-2">
                        <div className="flex flex-wrap gap-2">
                          {user.roles.map((role) => (
                            <span
                              key={role}
                              className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(role)}`}
                            >
                              {role}
                              {role !== 'EMPLOYEE' && (
                                <button
                                  onClick={() => handleRemoveRole(user.id, role)}
                                  className="hover:bg-black/10 rounded-full p-0.5"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              )}
                            </span>
                          ))}
                        </div>
                        {user.activeDelegations && user.activeDelegations.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {user.activeDelegations.map((del) => (
                              <div key={del.id} className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                                <UserPlus className="h-3 w-3" />
                                {del.delegatedRole}
                                <span className="text-xs text-blue-600">(delegated)</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <Button variant="outline" size="sm" onClick={() => openRoleModal(user)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Role
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Add Role Modal */}
      {showRoleModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Add Role to {selectedUser.name}</h2>
              <button onClick={() => setShowRoleModal(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-2">
              {availableRoles.map((role) => {
                const hasRole = selectedUser.roles.includes(role.name);
                const sodConflict = checkSoDConflict(selectedUser.roles, role.name);
                return (
                  <button
                    key={role.name}
                    onClick={() => {
                      if (!hasRole && !sodConflict) {
                        handleAddRole(selectedUser.id, role.name);
                        setShowRoleModal(false);
                      }
                    }}
                    disabled={hasRole || !!sodConflict}
                    className={`w-full flex items-center justify-between p-3 rounded-lg border-2 transition-colors ${
                      hasRole
                        ? 'bg-gray-50 border-gray-200 cursor-not-allowed opacity-50'
                        : sodConflict
                        ? 'bg-red-50 border-red-300 cursor-not-allowed'
                        : 'hover:border-blue-500 border-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <Shield className={`h-5 w-5 text-${role.color}-600`} />
                      <div className="text-left flex-1">
                        <p className="font-medium text-gray-900">{role.displayName}</p>
                        <p className="text-xs text-gray-600">{role.name}</p>
                        {sodConflict && (
                          <div className="flex items-center gap-1 mt-1 text-xs text-red-700">
                            <AlertTriangle className="h-3 w-3" />
                            <span>SoD Conflict</span>
                          </div>
                        )}
                      </div>
                    </div>
                    {hasRole && <Check className="h-5 w-5 text-green-600" />}
                    {sodConflict && <AlertTriangle className="h-5 w-5 text-red-600" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
