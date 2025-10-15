import { useState, useEffect } from 'react';
import {
  Users,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Key,
  Ban,
  CheckCircle,
  AlertCircle,
  Clock,
  Shield,
  RefreshCw,
  X,
  Eye,
  EyeOff,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { toast } from 'react-hot-toast';

type IamUserType = 'SERVICE_ACCOUNT' | 'EXTERNAL_USER' | 'CONTRACTOR' | 'CONSULTANT' | 'AUDITOR' | 'TEMPORARY';
type IamUserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'EXPIRED';

interface IamUser {
  id: string;
  username: string;
  email?: string;
  fullName?: string;
  type: IamUserType;
  status: IamUserStatus;
  roles: string[];
  isServiceAccount: boolean;
  apiKey?: string;
  apiKeyExpiresAt?: string;
  accessExpiresAt?: string;
  externalCompany?: string;
  purpose?: string;
  lastLoginAt?: string;
  loginCount: number;
  createdAt: string;
}

export default function IamUsersPage() {
  const [users, setUsers] = useState<IamUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<IamUser | null>(null);
  const [showApiKey, setShowApiKey] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    // API call: const data = await api.get('/rbac/iam-users');
    
    // Mock data
    setTimeout(() => {
      setUsers([
        {
          id: '1',
          username: 'api_service_1',
          email: 'api@service.com',
          fullName: 'API Service Account',
          type: 'SERVICE_ACCOUNT',
          status: 'ACTIVE',
          roles: ['ADMIN'],
          isServiceAccount: true,
          apiKey: 'tc_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6',
          apiKeyExpiresAt: '2026-01-15',
          purpose: 'Automated system integration',
          lastLoginAt: '2025-01-14T10:30:00',
          loginCount: 1523,
          createdAt: '2024-06-01',
        },
        {
          id: '2',
          username: 'external_auditor',
          email: 'auditor@external.com',
          fullName: 'John External',
          type: 'AUDITOR',
          status: 'ACTIVE',
          roles: ['AUDITOR'],
          isServiceAccount: false,
          accessExpiresAt: '2025-02-28',
          externalCompany: 'Audit Firm Ltd',
          purpose: 'Annual compliance audit',
          lastLoginAt: '2025-01-13T15:20:00',
          loginCount: 12,
          createdAt: '2025-01-10',
        },
        {
          id: '3',
          username: 'contractor_dev',
          email: 'dev@contractor.com',
          fullName: 'Sarah Developer',
          type: 'CONTRACTOR',
          status: 'ACTIVE',
          roles: ['EMPLOYEE'],
          isServiceAccount: false,
          accessExpiresAt: '2025-03-31',
          externalCompany: 'Tech Contractors Inc',
          purpose: 'Project Phoenix development',
          lastLoginAt: '2025-01-14T09:00:00',
          loginCount: 45,
          createdAt: '2025-01-05',
        },
        {
          id: '4',
          username: 'consultant_hr',
          email: 'consultant@hr.com',
          fullName: 'Mike Consultant',
          type: 'CONSULTANT',
          status: 'SUSPENDED',
          roles: ['HR_MANAGER'],
          isServiceAccount: false,
          accessExpiresAt: '2025-01-31',
          externalCompany: 'HR Consulting Group',
          purpose: 'HR process optimization',
          lastLoginAt: '2025-01-08T11:30:00',
          loginCount: 23,
          createdAt: '2024-12-15',
        },
      ]);
      setLoading(false);
    }, 500);
  };

  const getStatusColor = (status: IamUserStatus) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800';
      case 'INACTIVE': return 'bg-gray-100 text-gray-800';
      case 'SUSPENDED': return 'bg-red-100 text-red-800';
      case 'EXPIRED': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: IamUserType) => {
    switch (type) {
      case 'SERVICE_ACCOUNT': return 'bg-purple-100 text-purple-800';
      case 'EXTERNAL_USER': return 'bg-blue-100 text-blue-800';
      case 'CONTRACTOR': return 'bg-yellow-100 text-yellow-800';
      case 'CONSULTANT': return 'bg-cyan-100 text-cyan-800';
      case 'AUDITOR': return 'bg-indigo-100 text-indigo-800';
      case 'TEMPORARY': return 'bg-pink-100 text-pink-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleDeactivate = (user: IamUser) => {
    if (confirm(`Deactivate ${user.username}?`)) {
      toast.success('User deactivated');
      fetchUsers();
    }
  };

  const handleReactivate = (user: IamUser) => {
    toast.success('User reactivated');
    fetchUsers();
  };

  const handleRegenerateApiKey = (user: IamUser) => {
    if (confirm(`Regenerate API key for ${user.username}?`)) {
      toast.success('API key regenerated');
      fetchUsers();
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'all' || user.type === filterType;
    const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const stats = {
    total: users.length,
    active: users.filter(u => u.status === 'ACTIVE').length,
    serviceAccounts: users.filter(u => u.isServiceAccount).length,
    expiringSoon: users.filter(u => {
      if (!u.accessExpiresAt) return false;
      const expires = new Date(u.accessExpiresAt);
      const soon = new Date();
      soon.setDate(soon.getDate() + 30);
      return expires < soon;
    }).length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">IAM Users</h1>
          <p className="text-gray-600 mt-1">Manage external users and service accounts</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create IAM User
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active</p>
                <p className="text-2xl font-bold text-green-600 mt-1">{stats.active}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Service Accounts</p>
                <p className="text-2xl font-bold text-purple-600 mt-1">{stats.serviceAccounts}</p>
              </div>
              <Key className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Expiring Soon</p>
                <p className="text-2xl font-bold text-orange-600 mt-1">{stats.expiringSoon}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
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
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg"
              />
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 border rounded-lg"
            >
              <option value="all">All Types</option>
              <option value="SERVICE_ACCOUNT">Service Accounts</option>
              <option value="EXTERNAL_USER">External Users</option>
              <option value="CONTRACTOR">Contractors</option>
              <option value="CONSULTANT">Consultants</option>
              <option value="AUDITOR">Auditors</option>
              <option value="TEMPORARY">Temporary</option>
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border rounded-lg"
            >
              <option value="all">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="SUSPENDED">Suspended</option>
              <option value="EXPIRED">Expired</option>
            </select>
            <Button variant="outline" onClick={fetchUsers}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Users List */}
      <div className="space-y-4">
        {loading ? (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading IAM users...</p>
            </CardContent>
          </Card>
        ) : filteredUsers.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No IAM users found</p>
            </CardContent>
          </Card>
        ) : (
          filteredUsers.map((user) => (
            <Card key={user.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-gray-900">{user.username}</h3>
                      <span className={`px-2 py-1 text-xs font-bold rounded ${getStatusColor(user.status)}`}>
                        {user.status}
                      </span>
                      <span className={`px-2 py-1 text-xs font-bold rounded ${getTypeColor(user.type)}`}>
                        {user.type.replace(/_/g, ' ')}
                      </span>
                    </div>

                    {user.fullName && (
                      <p className="text-sm text-gray-700 mb-1">{user.fullName}</p>
                    )}
                    {user.email && (
                      <p className="text-sm text-gray-600 mb-2">{user.email}</p>
                    )}

                    <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-3">
                      {user.externalCompany && (
                        <span>Company: <strong>{user.externalCompany}</strong></span>
                      )}
                      {user.purpose && (
                        <span>Purpose: <strong>{user.purpose}</strong></span>
                      )}
                      {user.accessExpiresAt && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Expires: <strong>{new Date(user.accessExpiresAt).toLocaleDateString()}</strong>
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2 mb-3">
                      {user.roles.map((role) => (
                        <span key={role} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                          <Shield className="h-3 w-3 inline mr-1" />
                          {role}
                        </span>
                      ))}
                    </div>

                    {user.isServiceAccount && user.apiKey && (
                      <div className="bg-gray-50 p-3 rounded border mb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <p className="text-xs font-semibold text-gray-700 mb-1">API Key:</p>
                            <code className="text-xs text-gray-900 font-mono">
                              {showApiKey[user.id] ? user.apiKey : '•'.repeat(user.apiKey.length)}
                            </code>
                          </div>
                          <button
                            onClick={() => setShowApiKey({ ...showApiKey, [user.id]: !showApiKey[user.id] })}
                            className="ml-2 p-1 hover:bg-gray-200 rounded"
                          >
                            {showApiKey[user.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                        {user.apiKeyExpiresAt && (
                          <p className="text-xs text-gray-500 mt-1">
                            Expires: {new Date(user.apiKeyExpiresAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    )}

                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>Created: {new Date(user.createdAt).toLocaleDateString()}</span>
                      {user.lastLoginAt && (
                        <span>Last login: {new Date(user.lastLoginAt).toLocaleDateString()}</span>
                      )}
                      <span>Logins: {user.loginCount}</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 ml-4">
                    <Button size="sm" variant="outline" onClick={() => {
                      setSelectedUser(user);
                      setShowEditModal(true);
                    }}>
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>

                    {user.isServiceAccount && user.status === 'ACTIVE' && (
                      <Button size="sm" variant="outline" onClick={() => handleRegenerateApiKey(user)}>
                        <Key className="h-4 w-4 mr-1" />
                        Regenerate Key
                      </Button>
                    )}

                    {user.status === 'ACTIVE' ? (
                      <Button size="sm" variant="outline" onClick={() => handleDeactivate(user)}>
                        <Ban className="h-4 w-4 mr-1" />
                        Deactivate
                      </Button>
                    ) : (
                      <Button size="sm" variant="outline" onClick={() => handleReactivate(user)}>
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Reactivate
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Create IAM User</CardTitle>
                <button onClick={() => setShowCreateModal(false)}>
                  <X className="h-6 w-6" />
                </button>
              </div>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Username *</label>
                    <input type="text" className="w-full px-3 py-2 border rounded-lg" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Full Name</label>
                    <input type="text" className="w-full px-3 py-2 border rounded-lg" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input type="email" className="w-full px-3 py-2 border rounded-lg" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Type *</label>
                    <select className="w-full px-3 py-2 border rounded-lg">
                      <option value="SERVICE_ACCOUNT">Service Account</option>
                      <option value="EXTERNAL_USER">External User</option>
                      <option value="CONTRACTOR">Contractor</option>
                      <option value="CONSULTANT">Consultant</option>
                      <option value="AUDITOR">Auditor</option>
                      <option value="TEMPORARY">Temporary</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Roles *</label>
                    <select multiple className="w-full px-3 py-2 border rounded-lg">
                      <option value="ADMIN">ADMIN</option>
                      <option value="HR_MANAGER">HR_MANAGER</option>
                      <option value="MANAGER">MANAGER</option>
                      <option value="EMPLOYEE">EMPLOYEE</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">External Company</label>
                  <input type="text" className="w-full px-3 py-2 border rounded-lg" />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Purpose</label>
                  <textarea className="w-full px-3 py-2 border rounded-lg" rows={3}></textarea>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Access Expires At</label>
                  <input type="date" className="w-full px-3 py-2 border rounded-lg" />
                </div>

                <div className="flex items-center gap-2">
                  <input type="checkbox" id="isServiceAccount" className="rounded" />
                  <label htmlFor="isServiceAccount" className="text-sm">This is a service account (generates API key)</label>
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t">
                  <Button variant="outline" onClick={() => setShowCreateModal(false)}>Cancel</Button>
                  <Button onClick={() => {
                    toast.success('IAM user created');
                    setShowCreateModal(false);
                    fetchUsers();
                  }}>Create User</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Edit IAM User: {selectedUser.username}</CardTitle>
                <button onClick={() => setShowEditModal(false)}>
                  <X className="h-6 w-6" />
                </button>
              </div>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Username</label>
                    <input type="text" defaultValue={selectedUser.username} className="w-full px-3 py-2 border rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Full Name</label>
                    <input type="text" defaultValue={selectedUser.fullName} className="w-full px-3 py-2 border rounded-lg" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input type="email" defaultValue={selectedUser.email} className="w-full px-3 py-2 border rounded-lg" />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Status</label>
                  <select defaultValue={selectedUser.status} className="w-full px-3 py-2 border rounded-lg">
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                    <option value="SUSPENDED">Suspended</option>
                  </select>
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t">
                  <Button variant="outline" onClick={() => setShowEditModal(false)}>Cancel</Button>
                  <Button onClick={() => {
                    toast.success('IAM user updated');
                    setShowEditModal(false);
                    fetchUsers();
                  }}>Update User</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
