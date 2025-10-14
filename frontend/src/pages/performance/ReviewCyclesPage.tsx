import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Plus,
  Search,
  Users,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  BarChart3,
  Play,
  Pause,
  Eye,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { toast } from 'react-hot-toast';

interface ReviewCycle {
  id: string;
  name: string;
  type: 'QUARTERLY' | 'MID_YEAR' | 'ANNUAL' | 'PROBATION' | 'CUSTOM';
  status: 'DRAFT' | 'ACTIVE' | 'SELF_REVIEW_OPEN' | 'MANAGER_REVIEW_OPEN' | 'PEER_REVIEW_OPEN' | 'CALIBRATION' | 'PUBLISHED' | 'CLOSED';
  periodStart: string;
  periodEnd: string;
  participantCount: number;
  completionRate: number;
  selfReviewStartDate: string;
  selfReviewEndDate: string;
  managerReviewStartDate: string;
  managerReviewEndDate: string;
}

export default function ReviewCyclesPage() {
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Mock data
  const cycles: ReviewCycle[] = [
    {
      id: '1',
      name: 'Q4 2024 Performance Review',
      type: 'QUARTERLY',
      status: 'ACTIVE',
      periodStart: '2024-10-01',
      periodEnd: '2024-12-31',
      participantCount: 250,
      completionRate: 65,
      selfReviewStartDate: '2025-01-01',
      selfReviewEndDate: '2025-01-10',
      managerReviewStartDate: '2025-01-11',
      managerReviewEndDate: '2025-01-20',
    },
    {
      id: '2',
      name: 'Annual Review 2024',
      type: 'ANNUAL',
      status: 'CALIBRATION',
      periodStart: '2024-01-01',
      periodEnd: '2024-12-31',
      participantCount: 250,
      completionRate: 92,
      selfReviewStartDate: '2024-12-01',
      selfReviewEndDate: '2024-12-15',
      managerReviewStartDate: '2024-12-16',
      managerReviewEndDate: '2024-12-31',
    },
    {
      id: '3',
      name: 'Q3 2024 Performance Review',
      type: 'QUARTERLY',
      status: 'PUBLISHED',
      periodStart: '2024-07-01',
      periodEnd: '2024-09-30',
      participantCount: 245,
      completionRate: 100,
      selfReviewStartDate: '2024-10-01',
      selfReviewEndDate: '2024-10-10',
      managerReviewStartDate: '2024-10-11',
      managerReviewEndDate: '2024-10-20',
    },
    {
      id: '4',
      name: 'New Hire Reviews - January',
      type: 'PROBATION',
      status: 'MANAGER_REVIEW_OPEN',
      periodStart: '2024-10-01',
      periodEnd: '2024-12-31',
      participantCount: 12,
      completionRate: 45,
      selfReviewStartDate: '2025-01-02',
      selfReviewEndDate: '2025-01-05',
      managerReviewStartDate: '2025-01-06',
      managerReviewEndDate: '2025-01-15',
    },
  ];

  const filteredCycles = cycles.filter(
    (cycle) =>
      (filterType === 'all' || cycle.type === filterType) &&
      (filterStatus === 'all' || cycle.status === filterStatus) &&
      (search === '' ||
        cycle.name.toLowerCase().includes(search.toLowerCase()) ||
        cycle.type.toLowerCase().includes(search.toLowerCase()))
  );

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      DRAFT: 'bg-gray-100 text-gray-800',
      ACTIVE: 'bg-blue-100 text-blue-800',
      SELF_REVIEW_OPEN: 'bg-purple-100 text-purple-800',
      MANAGER_REVIEW_OPEN: 'bg-orange-100 text-orange-800',
      PEER_REVIEW_OPEN: 'bg-yellow-100 text-yellow-800',
      CALIBRATION: 'bg-indigo-100 text-indigo-800',
      PUBLISHED: 'bg-green-100 text-green-800',
      CLOSED: 'bg-gray-100 text-gray-600',
    };
    return colors[status] || colors.DRAFT;
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      QUARTERLY: 'bg-blue-100 text-blue-800',
      MID_YEAR: 'bg-purple-100 text-purple-800',
      ANNUAL: 'bg-green-100 text-green-800',
      PROBATION: 'bg-orange-100 text-orange-800',
      CUSTOM: 'bg-gray-100 text-gray-800',
    };
    return colors[type] || colors.CUSTOM;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <Play className="h-4 w-4" />;
      case 'PUBLISHED':
        return <CheckCircle className="h-4 w-4" />;
      case 'CALIBRATION':
        return <BarChart3 className="h-4 w-4" />;
      case 'CLOSED':
        return <Pause className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const stats = {
    total: cycles.length,
    active: cycles.filter((c) => c.status === 'ACTIVE' || c.status.includes('REVIEW_OPEN')).length,
    avgCompletion: Math.round(
      cycles.reduce((sum, c) => sum + c.completionRate, 0) / cycles.length
    ),
    totalParticipants: cycles.reduce((sum, c) => sum + c.participantCount, 0),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Performance Review Cycles</h1>
          <p className="text-gray-600 mt-1">Create and manage review cycles across the organization</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Review Cycle
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Cycles</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Cycles</p>
                <p className="text-2xl font-bold text-green-600 mt-1">{stats.active}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Completion</p>
                <p className="text-2xl font-bold text-purple-600 mt-1">{stats.avgCompletion}%</p>
              </div>
              <BarChart3 className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Participants</p>
                <p className="text-2xl font-bold text-orange-600 mt-1">{stats.totalParticipants}</p>
              </div>
              <Users className="h-8 w-8 text-orange-600" />
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
                placeholder="Search review cycles..."
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
              <option value="QUARTERLY">Quarterly</option>
              <option value="MID_YEAR">Mid-Year</option>
              <option value="ANNUAL">Annual</option>
              <option value="PROBATION">Probation</option>
              <option value="CUSTOM">Custom</option>
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border rounded-lg"
            >
              <option value="all">All Statuses</option>
              <option value="DRAFT">Draft</option>
              <option value="ACTIVE">Active</option>
              <option value="SELF_REVIEW_OPEN">Self Review Open</option>
              <option value="MANAGER_REVIEW_OPEN">Manager Review Open</option>
              <option value="CALIBRATION">Calibration</option>
              <option value="PUBLISHED">Published</option>
              <option value="CLOSED">Closed</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Review Cycles Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredCycles.map((cycle) => (
          <Card key={cycle.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg mb-2">{cycle.name}</CardTitle>
                  <div className="flex gap-2 mb-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(cycle.type)}`}>
                      {cycle.type}
                    </span>
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(cycle.status)}`}>
                      {getStatusIcon(cycle.status)}
                      {cycle.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Review Period</span>
                  <span className="font-medium">
                    {new Date(cycle.periodStart).toLocaleDateString()} - {new Date(cycle.periodEnd).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Participants</span>
                  <span className="font-medium">{cycle.participantCount} employees</span>
                </div>
                <div>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-600">Completion Rate</span>
                    <span className="font-medium">{cycle.completionRate}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{ width: `${cycle.completionRate}%` }}
                    ></div>
                  </div>
                </div>
                <div className="pt-3 flex gap-2">
                  <Link to={`/performance/reviews/${cycle.id}`} className="flex-1">
                    <Button variant="outline" className="w-full">
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                  </Link>
                  {cycle.status === 'ACTIVE' && (
                    <Link to={`/performance/reviews/${cycle.id}/calibration`} className="flex-1">
                      <Button className="w-full">
                        <BarChart3 className="h-4 w-4 mr-2" />
                        Calibrate
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Create Review Cycle</h2>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-500 hover:text-gray-700">
                ×
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Cycle Name</label>
                <input
                  type="text"
                  className="w-full border rounded px-3 py-2"
                  placeholder="e.g., Q1 2025 Performance Review"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Type</label>
                  <select className="w-full border rounded px-3 py-2">
                    <option value="QUARTERLY">Quarterly</option>
                    <option value="MID_YEAR">Mid-Year</option>
                    <option value="ANNUAL">Annual</option>
                    <option value="PROBATION">Probation</option>
                    <option value="CUSTOM">Custom</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Rating Scale</label>
                  <select className="w-full border rounded px-3 py-2">
                    <option value="FIVE_POINT">5-Point Scale</option>
                    <option value="FOUR_POINT">4-Point Scale</option>
                    <option value="PERCENTAGE">Percentage (0-100)</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Period Start</label>
                  <input type="date" className="w-full border rounded px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Period End</label>
                  <input type="date" className="w-full border rounded px-3 py-2" />
                </div>
              </div>
              <div className="border-t pt-4">
                <h3 className="font-semibold mb-3">Self Review Phase</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Start Date</label>
                    <input type="date" className="w-full border rounded px-3 py-2" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">End Date</label>
                    <input type="date" className="w-full border rounded px-3 py-2" />
                  </div>
                </div>
              </div>
              <div className="border-t pt-4">
                <h3 className="font-semibold mb-3">Manager Review Phase</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Start Date</label>
                    <input type="date" className="w-full border rounded px-3 py-2" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">End Date</label>
                    <input type="date" className="w-full border rounded px-3 py-2" />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="rounded" />
                  <span className="text-sm">Enable Peer Reviews</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="rounded" />
                  <span className="text-sm">Enable Upward Reviews</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="rounded" defaultChecked />
                  <span className="text-sm">Require Calibration</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="rounded" />
                  <span className="text-sm">Link to Compensation</span>
                </label>
              </div>
              <div className="flex gap-2 pt-4">
                <Button variant="outline" onClick={() => setShowCreateModal(false)} className="flex-1">
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    toast.success('Review cycle created!');
                    setShowCreateModal(false);
                  }}
                  className="flex-1"
                >
                  Create Cycle
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
