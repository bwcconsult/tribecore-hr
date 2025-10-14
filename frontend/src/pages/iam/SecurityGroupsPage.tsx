import { useState } from 'react';
import { Building2, Users, Plus, X, Search, Edit, Trash2, UserPlus, Link as LinkIcon, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { toast } from 'react-hot-toast';

interface SecurityGroup {
  id: string;
  name: string;
  type: 'DEPARTMENT' | 'TEAM' | 'PROJECT' | 'LOCATION' | 'CUSTOM';
  description: string;
  manager?: string;
  memberCount: number;
  parentGroup?: string;
  usedInDelegations?: number;
}

interface DelegationScope {
  id: string;
  delegator: string;
  delegate: string;
  role: string;
  startDate: string;
  endDate: string;
  status: 'ACTIVE' | 'PENDING' | 'EXPIRED';
}

export default function SecurityGroupsPage() {
  const [search, setSearch] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filterType, setFilterType] = useState('all');
  const [showDelegationModal, setShowDelegationModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<SecurityGroup | null>(null);

  const [groups, setGroups] = useState<SecurityGroup[]>([
    {
      id: '1',
      name: 'Engineering',
      type: 'DEPARTMENT',
      description: 'Engineering department - all technical teams',
      manager: 'John Smith',
      memberCount: 45,
      usedInDelegations: 5,
    },
    {
      id: '2',
      name: 'Backend Team',
      type: 'TEAM',
      description: 'Backend development team',
      manager: 'Sarah Johnson',
      memberCount: 12,
      parentGroup: 'Engineering',
    },
    {
      id: '3',
      name: 'Frontend Team',
      type: 'TEAM',
      description: 'Frontend development team',
      manager: 'Mike Brown',
      memberCount: 10,
      parentGroup: 'Engineering',
    },
    {
      id: '4',
      name: 'Human Resources',
      type: 'DEPARTMENT',
      description: 'HR department',
      manager: 'Emily Davis',
      memberCount: 8,
      usedInDelegations: 3,
    },
    {
      id: '5',
      name: 'Finance',
      type: 'DEPARTMENT',
      description: 'Finance department',
      manager: 'David Wilson',
      memberCount: 6,
      usedInDelegations: 2,
    },
    {
      id: '6',
      name: 'Project Phoenix',
      type: 'PROJECT',
      description: 'Cross-functional project team',
      manager: 'John Smith',
      memberCount: 15,
    },
    {
      id: '7',
      name: 'London Office',
      type: 'LOCATION',
      description: 'London headquarters',
      manager: 'Sarah Johnson',
      memberCount: 120,
    },
    {
      id: '8',
      name: 'Remote Workers',
      type: 'LOCATION',
      description: 'Remote employees worldwide',
      memberCount: 80,
    },
  ]);

  const filteredGroups = groups.filter(
    (group) =>
      (filterType === 'all' || group.type === filterType) &&
      (search === '' ||
        group.name.toLowerCase().includes(search.toLowerCase()) ||
        group.description.toLowerCase().includes(search.toLowerCase()))
  );

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      DEPARTMENT: 'bg-blue-100 text-blue-800',
      TEAM: 'bg-green-100 text-green-800',
      PROJECT: 'bg-purple-100 text-purple-800',
      LOCATION: 'bg-orange-100 text-orange-800',
      CUSTOM: 'bg-gray-100 text-gray-800',
    };
    return colors[type] || colors.CUSTOM;
  };

  const handleDeleteGroup = (id: string) => {
    if (confirm('Are you sure you want to delete this security group?')) {
      setGroups(groups.filter((g) => g.id !== id));
      toast.success('Security group deleted');
    }
  };

  const stats = {
    totalGroups: groups.length,
    departments: groups.filter((g) => g.type === 'DEPARTMENT').length,
    teams: groups.filter((g) => g.type === 'TEAM').length,
    totalMembers: groups.reduce((sum, g) => sum + g.memberCount, 0),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Security Groups</h1>
          <p className="text-gray-600 mt-1">Manage organizational hierarchies and access groups</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Group
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Groups</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalGroups}</p>
              </div>
              <Building2 className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Departments</p>
                <p className="text-2xl font-bold text-blue-600 mt-1">{stats.departments}</p>
              </div>
              <Building2 className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Teams</p>
                <p className="text-2xl font-bold text-green-600 mt-1">{stats.teams}</p>
              </div>
              <Users className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Members</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalMembers}</p>
              </div>
              <Users className="h-8 w-8 text-purple-600" />
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
                placeholder="Search groups..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg"
              />
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 border rounded-lg"
            >
              <option value="all">All Types</option>
              <option value="DEPARTMENT">Departments</option>
              <option value="TEAM">Teams</option>
              <option value="PROJECT">Projects</option>
              <option value="LOCATION">Locations</option>
              <option value="CUSTOM">Custom</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Groups Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredGroups.map((group) => (
          <Card key={group.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <Building2 className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{group.name}</CardTitle>
                    {group.parentGroup && (
                      <p className="text-xs text-gray-500 mt-1">
                        Parent: {group.parentGroup}
                      </p>
                    )}
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(group.type)}`}>
                  {group.type}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">{group.description}</p>

              {group.manager && (
                <div className="flex items-center gap-2 text-sm text-gray-700 mb-3">
                  <Users className="h-4 w-4" />
                  <span>Manager: {group.manager}</span>
                </div>
              )}

              <div className="flex items-center gap-2 text-sm text-gray-700 mb-2">
                <UserPlus className="h-4 w-4" />
                <span>{group.memberCount} members</span>
              </div>

              {group.usedInDelegations && group.usedInDelegations > 0 && (
                <div 
                  onClick={() => {
                    setSelectedGroup(group);
                    setShowDelegationModal(true);
                  }}
                  className="flex items-center gap-2 text-sm text-blue-700 mb-4 bg-blue-50 px-2 py-1 rounded cursor-pointer hover:bg-blue-100 transition-colors"
                >
                  <LinkIcon className="h-4 w-4" />
                  <span>Used in {group.usedInDelegations} delegation(s)</span>
                  <ExternalLink className="h-3 w-3" />
                </div>
              )}
              {(!group.usedInDelegations || group.usedInDelegations === 0) && (
                <div className="h-4 mb-4"></div>
              )}

              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  <Users className="h-4 w-4 mr-2" />
                  Members
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDeleteGroup(group.id)}
                >
                  <Trash2 className="h-4 w-4 text-red-600" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredGroups.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center text-gray-500">
            <Building2 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium">No security groups found</p>
            <p className="text-sm mt-1">Try adjusting your filters or create a new group</p>
          </CardContent>
        </Card>
      )}

      {/* Create Group Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Create Security Group</h2>
              <button onClick={() => setShowCreateModal(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Group Name</label>
                <input
                  type="text"
                  className="w-full border rounded px-3 py-2"
                  placeholder="e.g., DevOps Team"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Type</label>
                <select className="w-full border rounded px-3 py-2">
                  <option value="DEPARTMENT">Department</option>
                  <option value="TEAM">Team</option>
                  <option value="PROJECT">Project</option>
                  <option value="LOCATION">Location</option>
                  <option value="CUSTOM">Custom</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  className="w-full border rounded px-3 py-2"
                  rows={3}
                  placeholder="Brief description of the group..."
                ></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Parent Group (Optional)</label>
                <select className="w-full border rounded px-3 py-2">
                  <option value="">None</option>
                  {groups
                    .filter((g) => g.type === 'DEPARTMENT')
                    .map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.name}
                      </option>
                    ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Manager (Optional)</label>
                <input
                  type="text"
                  className="w-full border rounded px-3 py-2"
                  placeholder="Search for user..."
                />
              </div>
              <div className="flex gap-2 pt-2">
                <Button variant="outline" onClick={() => setShowCreateModal(false)} className="flex-1">
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    toast.success('Security group created!');
                    setShowCreateModal(false);
                  }}
                  className="flex-1"
                >
                  Create Group
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delegation Scope Details Modal */}
      {showDelegationModal && selectedGroup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-xl font-bold">Delegation Scope: {selectedGroup.name}</h2>
                <p className="text-sm text-gray-600 mt-1">Active delegations restricted to this security group</p>
              </div>
              <button onClick={() => setShowDelegationModal(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded">
              <p className="text-sm text-blue-900">
                <strong>Scope Restriction:</strong> These delegations are limited to users within the <strong>{selectedGroup.name}</strong> security group.
                Delegates can only act on behalf of delegators for resources within this scope.
              </p>
            </div>

            <div className="space-y-3">
              {/* Mock delegation data */}
              {[
                {
                  id: 'del-1',
                  delegator: 'Sarah Johnson (HR Manager)',
                  delegate: 'John Smith',
                  role: 'HR_MANAGER',
                  startDate: '2025-01-10',
                  endDate: '2025-01-20',
                  status: 'ACTIVE' as const,
                },
                {
                  id: 'del-2',
                  delegator: 'Mike Brown',
                  delegate: 'Emily Davis',
                  role: 'MANAGER',
                  startDate: '2025-01-12',
                  endDate: '2025-01-22',
                  status: 'ACTIVE' as const,
                },
                {
                  id: 'del-3',
                  delegator: 'David Wilson',
                  delegate: 'John Smith',
                  role: 'ADMIN',
                  startDate: '2025-01-05',
                  endDate: '2025-01-15',
                  status: 'ACTIVE' as const,
                },
              ].slice(0, selectedGroup.usedInDelegations || 0).map((delegation) => (
                <div key={delegation.id} className="border rounded-lg p-4 bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Users className="h-4 w-4 text-blue-600" />
                        <span className="font-semibold text-gray-900">{delegation.delegator}</span>
                        <span className="text-gray-500">→</span>
                        <span className="font-semibold text-gray-900">{delegation.delegate}</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Building2 className="h-3 w-3" />
                          <span>Role: <strong>{delegation.role}</strong></span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span>Scope: <strong>{selectedGroup.name}</strong></span>
                        </div>
                      </div>
                      <div className="mt-2 text-xs text-gray-500">
                        {new Date(delegation.startDate).toLocaleDateString()} - {new Date(delegation.endDate).toLocaleDateString()}
                      </div>
                    </div>
                    <span className="px-3 py-1 text-xs font-bold rounded bg-green-100 text-green-800">
                      {delegation.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded">
              <p className="text-sm text-yellow-900">
                <strong>Note:</strong> When a delegation is scoped to a security group, the delegate inherits permissions
                only for resources that belong to members of this group.
              </p>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={() => setShowDelegationModal(false)}>Close</Button>
              <Button onClick={() => {
                window.location.href = '/iam/delegations';
              }}>
                <LinkIcon className="h-4 w-4 mr-2" />
                Manage Delegations
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
