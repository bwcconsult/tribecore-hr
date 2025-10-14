import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Plus,
  Search,
  Filter,
  DollarSign,
  FileText,
  CheckCircle,
  AlertCircle,
  Calendar,
  Briefcase,
  X,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { toast } from 'react-hot-toast';

interface Contractor {
  id: string;
  contractorId: string;
  firstName: string;
  lastName: string;
  email: string;
  company?: string;
  status: string;
  rate: number;
  currency: string;
  paymentFrequency: string;
  contractStartDate: string;
  contractEndDate?: string;
  totalPaid: number;
  invoiceCount: number;
  ir35Status: string;
}

export default function ContractorsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Mock data
  const contractors: Contractor[] = [
    {
      id: '1',
      contractorId: 'CTR-001',
      firstName: 'John',
      lastName: 'Smith',
      email: 'john.smith@example.com',
      company: 'Smith Consulting Ltd',
      status: 'ACTIVE',
      rate: 500,
      currency: 'GBP',
      paymentFrequency: 'DAILY',
      contractStartDate: '2024-01-15',
      contractEndDate: '2025-01-14',
      totalPaid: 45000,
      invoiceCount: 9,
      ir35Status: 'OUTSIDE',
    },
    {
      id: '2',
      contractorId: 'CTR-002',
      firstName: 'Sarah',
      lastName: 'Johnson',
      email: 'sarah.j@techcorp.com',
      company: 'TechCorp Solutions',
      status: 'ACTIVE',
      rate: 600,
      currency: 'GBP',
      paymentFrequency: 'DAILY',
      contractStartDate: '2024-03-01',
      totalPaid: 36000,
      invoiceCount: 6,
      ir35Status: 'OUTSIDE',
    },
    {
      id: '3',
      contractorId: 'CTR-003',
      firstName: 'Michael',
      lastName: 'Brown',
      email: 'mbrown@freelance.com',
      status: 'INACTIVE',
      rate: 450,
      currency: 'GBP',
      paymentFrequency: 'HOURLY',
      contractStartDate: '2023-06-01',
      contractEndDate: '2024-06-01',
      totalPaid: 67500,
      invoiceCount: 15,
      ir35Status: 'INSIDE',
    },
  ];

  const stats = {
    total: contractors.length,
    active: contractors.filter(c => c.status === 'ACTIVE').length,
    totalPaid: contractors.reduce((sum, c) => sum + c.totalPaid, 0),
    pendingInvoices: 3,
  };

  const filteredContractors = contractors.filter(contractor => {
    const matchesSearch =
      search === '' ||
      contractor.firstName.toLowerCase().includes(search.toLowerCase()) ||
      contractor.lastName.toLowerCase().includes(search.toLowerCase()) ||
      contractor.email.toLowerCase().includes(search.toLowerCase()) ||
      contractor.contractorId.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'all' || contractor.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleCreateContractor = () => {
    toast.success('Contractor created successfully!');
    setShowCreateModal(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800';
      case 'INACTIVE':
        return 'bg-gray-100 text-gray-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'TERMINATED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getIR35Color = (status: string) => {
    switch (status) {
      case 'OUTSIDE':
        return 'bg-green-100 text-green-800';
      case 'INSIDE':
        return 'bg-red-100 text-red-800';
      case 'UNDETERMINED':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Contractors</h1>
          <p className="text-gray-600 mt-1">Manage contractors and their contracts</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Contractor
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Contractors</p>
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
                <p className="text-sm text-gray-600">Total Paid (YTD)</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  £{(stats.totalPaid / 1000).toFixed(0)}K
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Invoices</p>
                <p className="text-2xl font-bold text-orange-600 mt-1">{stats.pendingInvoices}</p>
              </div>
              <FileText className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search contractors..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border rounded-lg"
            >
              <option value="all">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="PENDING">Pending</option>
              <option value="TERMINATED">Terminated</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Contractors List */}
      <Card>
        <CardHeader>
          <CardTitle>All Contractors</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b">
                <tr className="text-left text-sm text-gray-500">
                  <th className="pb-3 font-medium">Contractor</th>
                  <th className="pb-3 font-medium">Company</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Rate</th>
                  <th className="pb-3 font-medium">Contract Period</th>
                  <th className="pb-3 font-medium">Total Paid</th>
                  <th className="pb-3 font-medium">IR35</th>
                  <th className="pb-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredContractors.map((contractor) => (
                  <tr key={contractor.id} className="text-sm">
                    <td className="py-3">
                      <div>
                        <p className="font-medium text-gray-900">
                          {contractor.firstName} {contractor.lastName}
                        </p>
                        <p className="text-gray-500 text-xs">{contractor.email}</p>
                        <p className="text-gray-400 text-xs">{contractor.contractorId}</p>
                      </div>
                    </td>
                    <td className="py-3 text-gray-600">{contractor.company || '-'}</td>
                    <td className="py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(contractor.status)}`}>
                        {contractor.status}
                      </span>
                    </td>
                    <td className="py-3 text-gray-900">
                      {contractor.currency}{contractor.rate}
                      <span className="text-xs text-gray-500 ml-1">/{contractor.paymentFrequency.toLowerCase()}</span>
                    </td>
                    <td className="py-3 text-gray-600">
                      <div className="text-xs">
                        <p>{new Date(contractor.contractStartDate).toLocaleDateString()}</p>
                        {contractor.contractEndDate && (
                          <p className="text-gray-500">to {new Date(contractor.contractEndDate).toLocaleDateString()}</p>
                        )}
                      </div>
                    </td>
                    <td className="py-3 text-gray-900 font-medium">
                      £{(contractor.totalPaid / 1000).toFixed(1)}K
                      <p className="text-xs text-gray-500">{contractor.invoiceCount} invoices</p>
                    </td>
                    <td className="py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getIR35Color(contractor.ir35Status)}`}>
                        {contractor.ir35Status}
                      </span>
                    </td>
                    <td className="py-3">
                      <Link to={`/contractors/${contractor.id}`}>
                        <Button variant="outline" size="sm">
                          View
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Create Contractor Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Add New Contractor</h2>
              <button onClick={() => setShowCreateModal(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">First Name</label>
                  <input type="text" className="w-full border rounded px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Last Name</label>
                  <input type="text" className="w-full border rounded px-3 py-2" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input type="email" className="w-full border rounded px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Company (Optional)</label>
                <input type="text" className="w-full border rounded px-3 py-2" />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Rate</label>
                  <input type="number" className="w-full border rounded px-3 py-2" placeholder="500" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Currency</label>
                  <select className="w-full border rounded px-3 py-2">
                    <option>GBP</option>
                    <option>USD</option>
                    <option>EUR</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Frequency</label>
                  <select className="w-full border rounded px-3 py-2">
                    <option>HOURLY</option>
                    <option>DAILY</option>
                    <option>WEEKLY</option>
                    <option>MONTHLY</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Contract Start Date</label>
                  <input type="date" className="w-full border rounded px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Contract End Date (Optional)</label>
                  <input type="date" className="w-full border rounded px-3 py-2" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Scope of Work</label>
                <textarea className="w-full border rounded px-3 py-2" rows={3}></textarea>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateContractor}>Create Contractor</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
