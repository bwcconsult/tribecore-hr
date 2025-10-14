import { useState, useEffect } from 'react';
import {
  UserPlus,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Calendar,
  User,
  Shield,
  Plus,
  Search,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { toast } from 'react-hot-toast';

interface Delegation {
  id: string;
  delegatorName: string;
  delegateName: string;
  roleName: string;
  startDate: string;
  endDate: string;
  status: 'PENDING' | 'ACTIVE' | 'EXPIRED' | 'REVOKED';
  reason: string;
  scopeRestrictions?: string;
}

export default function DelegationManagementPage() {
  const [activeTab, setActiveTab] = useState<'to-me' | 'from-me' | 'pending'>('to-me');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [delegations, setDelegations] = useState<Delegation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDelegations();
  }, [activeTab]);

  const fetchDelegations = async () => {
    setLoading(true);
    // API call would go here
    // const data = await api.get(`/rbac/users/me/delegations`);
    
    // Mock data
    setTimeout(() => {
      setDelegations([
        {
          id: '1',
          delegatorName: 'Sarah Johnson',
          delegateName: 'John Smith',
          roleName: 'Manager',
          startDate: '2025-01-15',
          endDate: '2025-01-22',
          status: 'ACTIVE',
          reason: 'Vacation coverage',
          scopeRestrictions: 'Engineering Department only',
        },
        {
          id: '2',
          delegatorName: 'Michael Brown',
          delegateName: 'Emma Wilson',
          roleName: 'Payroll Approver',
          startDate: '2025-01-20',
          endDate: '2025-01-27',
          status: 'PENDING',
          reason: 'Temporary assignment',
        },
      ]);
      setLoading(false);
    }, 500);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'EXPIRED': return 'bg-gray-100 text-gray-800';
      case 'REVOKED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const approveDelegation = (id: string) => {
    toast.success('Delegation approved');
    fetchDelegations();
  };

  const rejectDelegation = (id: string) => {
    toast.success('Delegation rejected');
    fetchDelegations();
  };

  const revokeDelegation = (id: string) => {
    toast.success('Delegation revoked');
    fetchDelegations();
  };

  const getDaysRemaining = (endDate: string) => {
    const days = Math.ceil((new Date(endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return days;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Delegation Management</h1>
          <p className="text-gray-600 mt-1">Manage temporary role delegations and approvals</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Delegation
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active</p>
                <p className="text-2xl font-bold text-green-600 mt-1">8</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600 mt-1">5</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Expiring Soon</p>
                <p className="text-2xl font-bold text-orange-600 mt-1">3</p>
              </div>
              <AlertCircle className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total (All Time)</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">42</p>
              </div>
              <UserPlus className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex space-x-4 border-b">
              <button
                onClick={() => setActiveTab('to-me')}
                className={`pb-2 px-4 ${
                  activeTab === 'to-me'
                    ? 'border-b-2 border-blue-600 text-blue-600 font-semibold'
                    : 'text-gray-600'
                }`}
              >
                Delegated To Me
              </button>
              <button
                onClick={() => setActiveTab('from-me')}
                className={`pb-2 px-4 ${
                  activeTab === 'from-me'
                    ? 'border-b-2 border-blue-600 text-blue-600 font-semibold'
                    : 'text-gray-600'
                }`}
              >
                Delegated By Me
              </button>
              <button
                onClick={() => setActiveTab('pending')}
                className={`pb-2 px-4 ${
                  activeTab === 'pending'
                    ? 'border-b-2 border-blue-600 text-blue-600 font-semibold'
                    : 'text-gray-600'
                }`}
              >
                Pending Approvals (5)
              </button>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search delegations..."
                className="pl-10 pr-4 py-2 border rounded-lg"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading delegations...</p>
            </div>
          ) : delegations.length === 0 ? (
            <div className="text-center py-12">
              <UserPlus className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No delegations found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {delegations.map((delegation) => (
                <div
                  key={delegation.id}
                  className="border rounded-lg p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <Shield className="h-5 w-5 text-blue-600" />
                        <h3 className="text-lg font-semibold text-gray-900">{delegation.roleName}</h3>
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(delegation.status)}`}>
                          {delegation.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-600">From:</span>
                          <span className="font-medium text-gray-900">{delegation.delegatorName}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-600">To:</span>
                          <span className="font-medium text-gray-900">{delegation.delegateName}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-600">Period:</span>
                          <span className="font-medium text-gray-900">
                            {new Date(delegation.startDate).toLocaleDateString()} - {new Date(delegation.endDate).toLocaleDateString()}
                          </span>
                        </div>
                        {delegation.status === 'ACTIVE' && (
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-gray-400" />
                            <span className="text-gray-600">Expires in:</span>
                            <span className="font-medium text-orange-600">
                              {getDaysRemaining(delegation.endDate)} days
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="mt-3">
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Reason:</span> {delegation.reason}
                        </p>
                        {delegation.scopeRestrictions && (
                          <p className="text-sm text-gray-600 mt-1">
                            <span className="font-medium">Scope:</span> {delegation.scopeRestrictions}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 ml-4">
                      {delegation.status === 'PENDING' && activeTab === 'pending' && (
                        <>
                          <Button size="sm" onClick={() => approveDelegation(delegation.id)}>
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => rejectDelegation(delegation.id)}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                        </>
                      )}
                      {delegation.status === 'ACTIVE' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => revokeDelegation(delegation.id)}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Revoke
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Delegation Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Create New Delegation</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Delegate To (User)
                    </label>
                    <select className="w-full px-3 py-2 border rounded-lg">
                      <option>Select user...</option>
                      <option>John Smith</option>
                      <option>Emma Wilson</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Role to Delegate
                    </label>
                    <select className="w-full px-3 py-2 border rounded-lg">
                      <option>Select role...</option>
                      <option>Manager</option>
                      <option>Payroll Approver</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Date
                    </label>
                    <input type="date" className="w-full px-3 py-2 border rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Date
                    </label>
                    <input type="date" className="w-full px-3 py-2 border rounded-lg" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Reason for Delegation
                  </label>
                  <textarea
                    className="w-full px-3 py-2 border rounded-lg"
                    rows={3}
                    placeholder="Explain why this delegation is needed..."
                  ></textarea>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Scope Restrictions (Optional)
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="e.g., Engineering Department only"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                  <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                    Cancel
                  </Button>
                  <Button onClick={() => {
                    toast.success('Delegation request submitted');
                    setShowCreateModal(false);
                  }}>
                    Create Delegation
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
