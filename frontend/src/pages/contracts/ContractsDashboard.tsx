import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Plus,
  Search,
  Filter,
  Clock,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  DollarSign,
  Calendar,
  Users,
  RefreshCw,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { toast } from 'react-hot-toast';

type ContractStatus =
  | 'DRAFT'
  | 'INTERNAL_REVIEW'
  | 'COUNTERPARTY_REVIEW'
  | 'AGREED'
  | 'E_SIGNATURE'
  | 'EXECUTED'
  | 'ACTIVE'
  | 'TERMINATED';

interface Contract {
  id: string;
  contractNumber: string;
  title: string;
  type: string;
  status: ContractStatus;
  counterpartyName: string;
  value: number;
  currency: string;
  startDate?: string;
  endDate?: string;
  owner: { name: string };
  createdAt: string;
}

interface Stats {
  total: number;
  byStatus: {
    draft: number;
    inReview: number;
    awaitingSignature: number;
    active: number;
    expired: number;
  };
  totalValue: number;
  expiringSoon: number;
}

export default function ContractsDashboard() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');

  useEffect(() => {
    fetchContracts();
    fetchStats();
  }, []);

  const fetchContracts = async () => {
    setLoading(true);
    // Mock data - replace with actual API call
    setTimeout(() => {
      setContracts([
        {
          id: '1',
          contractNumber: 'CON-2025-00001',
          title: 'Senior Software Engineer Employment Contract',
          type: 'EMPLOYMENT',
          status: 'ACTIVE',
          counterpartyName: 'John Smith',
          value: 85000,
          currency: 'GBP',
          startDate: '2025-01-01',
          endDate: '2026-01-01',
          owner: { name: 'HR Team' },
          createdAt: '2024-12-15',
        },
        {
          id: '2',
          contractNumber: 'CON-2025-00002',
          title: 'Cloud Infrastructure Services Agreement',
          type: 'VENDOR',
          status: 'E_SIGNATURE',
          counterpartyName: 'AWS Corporation',
          value: 250000,
          currency: 'GBP',
          startDate: '2025-02-01',
          endDate: '2026-02-01',
          owner: { name: 'IT Director' },
          createdAt: '2025-01-10',
        },
        {
          id: '3',
          contractNumber: 'CON-2025-00003',
          title: 'Software Licensing Agreement',
          type: 'CUSTOMER',
          status: 'INTERNAL_REVIEW',
          counterpartyName: 'TechCorp Ltd',
          value: 150000,
          currency: 'GBP',
          startDate: '2025-03-01',
          endDate: '2028-03-01',
          owner: { name: 'Sales Manager' },
          createdAt: '2025-01-12',
        },
        {
          id: '4',
          contractNumber: 'CON-2025-00004',
          title: 'Mutual Non-Disclosure Agreement',
          type: 'NDA',
          status: 'EXECUTED',
          counterpartyName: 'Partner Solutions Inc',
          value: 0,
          currency: 'GBP',
          owner: { name: 'Legal Team' },
          createdAt: '2025-01-08',
        },
        {
          id: '5',
          contractNumber: 'CON-2025-00005',
          title: 'Office Lease Agreement',
          type: 'LEASE',
          status: 'ACTIVE',
          counterpartyName: 'Property Management Co',
          value: 480000,
          currency: 'GBP',
          startDate: '2024-01-01',
          endDate: '2025-12-31',
          owner: { name: 'CFO' },
          createdAt: '2023-11-20',
        },
      ]);
      setLoading(false);
    }, 500);
  };

  const fetchStats = async () => {
    // Mock stats - replace with actual API call
    setTimeout(() => {
      setStats({
        total: 156,
        byStatus: {
          draft: 12,
          inReview: 8,
          awaitingSignature: 5,
          active: 115,
          expired: 16,
        },
        totalValue: 12500000,
        expiringSoon: 18,
      });
    }, 500);
  };

  const getStatusColor = (status: ContractStatus) => {
    const colors = {
      DRAFT: 'bg-gray-100 text-gray-800',
      INTERNAL_REVIEW: 'bg-blue-100 text-blue-800',
      COUNTERPARTY_REVIEW: 'bg-purple-100 text-purple-800',
      AGREED: 'bg-cyan-100 text-cyan-800',
      E_SIGNATURE: 'bg-yellow-100 text-yellow-800',
      EXECUTED: 'bg-green-100 text-green-800',
      ACTIVE: 'bg-green-100 text-green-800',
      TERMINATED: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status: ContractStatus) => {
    if (status === 'ACTIVE' || status === 'EXECUTED') return <CheckCircle className="h-4 w-4" />;
    if (status.includes('REVIEW') || status === 'E_SIGNATURE')
      return <Clock className="h-4 w-4" />;
    return <FileText className="h-4 w-4" />;
  };

  const filteredContracts = contracts.filter((contract) => {
    const matchesSearch =
      contract.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contract.contractNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contract.counterpartyName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || contract.status === filterStatus;
    const matchesType = filterType === 'all' || contract.type === filterType;
    return matchesSearch && matchesStatus && matchesType;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Contract Management</h1>
          <p className="text-gray-600 mt-1">
            Centralized hub for all contracts across the organization
          </p>
        </div>
        <Link to="/contracts/create">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Contract
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Contracts</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats?.total || 0}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active</p>
                <p className="text-2xl font-bold text-green-600 mt-1">
                  {stats?.byStatus.active || 0}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Value</p>
                <p className="text-2xl font-bold text-blue-600 mt-1">
                  £{((stats?.totalValue || 0) / 1000000).toFixed(1)}M
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Expiring Soon</p>
                <p className="text-2xl font-bold text-orange-600 mt-1">
                  {stats?.expiringSoon || 0}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-600" />
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link to="/contracts/renewals" className="block">
              <Button variant="outline" className="w-full justify-start">
                <Calendar className="h-4 w-4 mr-2" />
                Renewal Radar
              </Button>
            </Link>
            <Link to="/contracts/obligations" className="block">
              <Button variant="outline" className="w-full justify-start">
                <Clock className="h-4 w-4 mr-2" />
                Obligations
              </Button>
            </Link>
            <Link to="/contracts/approvals" className="block">
              <Button variant="outline" className="w-full justify-start">
                <Users className="h-4 w-4 mr-2" />
                Pending Approvals
              </Button>
            </Link>
            <Link to="/contracts/analytics" className="block">
              <Button variant="outline" className="w-full justify-start">
                <TrendingUp className="h-4 w-4 mr-2" />
                Analytics
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-[200px] relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search contracts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border rounded-lg"
            >
              <option value="all">All Status</option>
              <option value="DRAFT">Draft</option>
              <option value="INTERNAL_REVIEW">Internal Review</option>
              <option value="E_SIGNATURE">Awaiting Signature</option>
              <option value="ACTIVE">Active</option>
              <option value="TERMINATED">Terminated</option>
            </select>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 border rounded-lg"
            >
              <option value="all">All Types</option>
              <option value="EMPLOYMENT">Employment</option>
              <option value="VENDOR">Vendor</option>
              <option value="CUSTOMER">Customer</option>
              <option value="NDA">NDA</option>
              <option value="LEASE">Lease</option>
            </select>
            <Button variant="outline" onClick={fetchContracts}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Contracts List */}
      <Card>
        <CardHeader>
          <CardTitle>Contracts ({filteredContracts.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading contracts...</p>
            </div>
          ) : filteredContracts.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No contracts found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredContracts.map((contract) => (
                <Link
                  key={contract.id}
                  to={`/contracts/${contract.id}`}
                  className="block border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-mono text-sm text-gray-600">
                          {contract.contractNumber}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-bold rounded ${getStatusColor(contract.status)}`}
                        >
                          {getStatusIcon(contract.status)}
                          {contract.status.replace(/_/g, ' ')}
                        </span>
                        <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                          {contract.type}
                        </span>
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-1">{contract.title}</h3>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>Counterparty: <strong>{contract.counterpartyName}</strong></span>
                        {contract.value > 0 && (
                          <span>
                            Value: <strong>£{contract.value.toLocaleString()}</strong>
                          </span>
                        )}
                        <span>Owner: <strong>{contract.owner.name}</strong></span>
                      </div>
                      {contract.endDate && (
                        <div className="mt-2 text-xs text-gray-500">
                          Expires: {new Date(contract.endDate).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
