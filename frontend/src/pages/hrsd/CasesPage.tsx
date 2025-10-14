import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import {
  Headphones,
  Plus,
  Search,
  Filter,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
} from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

interface HRCase {
  id: string;
  caseNumber: string;
  title: string;
  caseType: string;
  priority: string;
  status: string;
  createdTimestamp: string;
  assignedTo?: string;
  slaBreached: boolean;
}

export default function CasesPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const { data: casesData, isLoading } = useQuery({
    queryKey: ['hr-cases', search, statusFilter],
    queryFn: async () => {
      const response = await axios.get('/api/hrsd/cases', {
        params: { search, status: statusFilter !== 'all' ? statusFilter : undefined },
      });
      return response.data;
    },
  });

  const cases = casesData?.data || [];

  const stats = {
    total: cases.length,
    open: cases.filter((c: HRCase) => c.status !== 'CLOSED' && c.status !== 'RESOLVED').length,
    slaBreached: cases.filter((c: HRCase) => c.slaBreached).length,
    avgResolution: '2.3 days',
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT': return 'text-red-600 bg-red-50';
      case 'HIGH': return 'text-orange-600 bg-orange-50';
      case 'MEDIUM': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'RESOLVED': return 'text-green-600 bg-green-50';
      case 'IN_PROGRESS': return 'text-blue-600 bg-blue-50';
      case 'NEW': return 'text-purple-600 bg-purple-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Headphones className="h-8 w-8 text-blue-600" />
            HR Service Desk
          </h1>
          <p className="text-gray-600 mt-1">Manage employee cases and requests</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Case
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Cases</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Headphones className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Open Cases</p>
                <p className="text-2xl font-bold">{stats.open}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">SLA Breached</p>
                <p className="text-2xl font-bold text-red-600">{stats.slaBreached}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Resolution</p>
                <p className="text-2xl font-bold">{stats.avgResolution}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search cases..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg"
                />
              </div>
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border rounded-lg"
            >
              <option value="all">All Status</option>
              <option value="NEW">New</option>
              <option value="ASSIGNED">Assigned</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
              <option value="CLOSED">Closed</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Cases Table */}
      <Card>
        <CardHeader>
          <CardTitle>Cases</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading...</div>
          ) : cases.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No cases found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 font-semibold">Case #</th>
                    <th className="text-left p-3 font-semibold">Title</th>
                    <th className="text-left p-3 font-semibold">Type</th>
                    <th className="text-left p-3 font-semibold">Priority</th>
                    <th className="text-left p-3 font-semibold">Status</th>
                    <th className="text-left p-3 font-semibold">Created</th>
                    <th className="text-left p-3 font-semibold">Assigned To</th>
                  </tr>
                </thead>
                <tbody>
                  {cases.map((hrCase: HRCase) => (
                    <tr key={hrCase.id} className="border-b hover:bg-gray-50 cursor-pointer">
                      <td className="p-3 font-mono text-sm">{hrCase.caseNumber}</td>
                      <td className="p-3">
                        <div className="font-medium">{hrCase.title}</div>
                        {hrCase.slaBreached && (
                          <span className="text-xs text-red-600 flex items-center gap-1 mt-1">
                            <AlertCircle className="h-3 w-3" />
                            SLA Breached
                          </span>
                        )}
                      </td>
                      <td className="p-3">
                        <span className="text-sm text-gray-600">{hrCase.caseType}</span>
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getPriorityColor(hrCase.priority)}`}>
                          {hrCase.priority}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(hrCase.status)}`}>
                          {hrCase.status}
                        </span>
                      </td>
                      <td className="p-3 text-sm text-gray-600">
                        {new Date(hrCase.createdTimestamp).toLocaleDateString()}
                      </td>
                      <td className="p-3 text-sm text-gray-600">
                        {hrCase.assignedTo || 'Unassigned'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
