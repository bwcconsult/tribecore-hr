import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ClipboardList,
  Plus,
  Search,
  BarChart3,
  Users,
  CheckCircle,
  Clock,
  X,
  Send,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { toast } from 'react-hot-toast';

interface Survey {
  id: string;
  title: string;
  description?: string;
  type: string;
  status: string;
  isAnonymous: boolean;
  startDate?: string;
  endDate?: string;
  responseCount: number;
  targetCount: number;
  createdAt: string;
}

export default function SurveysPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Mock data
  const surveys: Survey[] = [
    {
      id: '1',
      title: 'Employee Engagement Survey Q4 2024',
      description: 'Quarterly pulse check on employee satisfaction and engagement',
      type: 'ENGAGEMENT',
      status: 'ACTIVE',
      isAnonymous: true,
      startDate: '2024-10-01',
      endDate: '2024-10-31',
      responseCount: 127,
      targetCount: 250,
      createdAt: '2024-09-25',
    },
    {
      id: '2',
      title: 'Onboarding Experience Feedback',
      description: 'Help us improve the onboarding process for new joiners',
      type: 'ONBOARDING',
      status: 'ACTIVE',
      isAnonymous: false,
      startDate: '2024-01-01',
      responseCount: 45,
      targetCount: 60,
      createdAt: '2024-01-01',
    },
    {
      id: '3',
      title: 'Annual Performance Review Survey',
      description: 'Feedback on the performance review process',
      type: 'PERFORMANCE',
      status: 'CLOSED',
      isAnonymous: true,
      startDate: '2024-03-01',
      endDate: '2024-03-31',
      responseCount: 203,
      targetCount: 250,
      createdAt: '2024-02-15',
    },
  ];

  const stats = {
    total: surveys.length,
    active: surveys.filter(s => s.status === 'ACTIVE').length,
    totalResponses: surveys.reduce((sum, s) => sum + s.responseCount, 0),
    avgResponseRate: Math.round(
      surveys.reduce((sum, s) => sum + (s.responseCount / s.targetCount) * 100, 0) / surveys.length
    ),
  };

  const filteredSurveys = surveys.filter(survey => {
    const matchesSearch =
      search === '' ||
      survey.title.toLowerCase().includes(search.toLowerCase()) ||
      survey.description?.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'all' || survey.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleCreateSurvey = () => {
    toast.success('Survey created successfully!');
    setShowCreateModal(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800';
      case 'DRAFT':
        return 'bg-gray-100 text-gray-800';
      case 'CLOSED':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      ENGAGEMENT: 'bg-purple-100 text-purple-800',
      PULSE: 'bg-blue-100 text-blue-800',
      EXIT: 'bg-red-100 text-red-800',
      ONBOARDING: 'bg-green-100 text-green-800',
      PERFORMANCE: 'bg-orange-100 text-orange-800',
      CUSTOM: 'bg-gray-100 text-gray-800',
    };
    return colors[type] || colors.CUSTOM;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Surveys</h1>
          <p className="text-gray-600 mt-1">Create and manage employee surveys</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Survey
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Surveys</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
              </div>
              <ClipboardList className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Surveys</p>
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
                <p className="text-sm text-gray-600">Total Responses</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalResponses}</p>
              </div>
              <Users className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Response Rate</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.avgResponseRate}%</p>
              </div>
              <BarChart3 className="h-8 w-8 text-orange-600" />
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
                placeholder="Search surveys..."
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
              <option value="DRAFT">Draft</option>
              <option value="CLOSED">Closed</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Surveys List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSurveys.map((survey) => (
          <Card key={survey.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between mb-2">
                <ClipboardList className="h-6 w-6 text-blue-600" />
                <div className="flex gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(survey.status)}`}>
                    {survey.status}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(survey.type)}`}>
                    {survey.type}
                  </span>
                </div>
              </div>
              <CardTitle className="text-lg">{survey.title}</CardTitle>
              {survey.description && (
                <p className="text-sm text-gray-600 mt-1">{survey.description}</p>
              )}
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {/* Progress Bar */}
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Response Rate</span>
                    <span className="font-medium">
                      {survey.responseCount} / {survey.targetCount}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${(survey.responseCount / survey.targetCount) * 100}%` }}
                    ></div>
                  </div>
                </div>

                {/* Survey Info */}
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="h-4 w-4" />
                  {survey.endDate ? (
                    <span>Ends {new Date(survey.endDate).toLocaleDateString()}</span>
                  ) : (
                    <span>No end date</span>
                  )}
                </div>

                {survey.isAnonymous && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Users className="h-4 w-4" />
                    <span>Anonymous responses</span>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Link to={`/surveys/${survey.id}/results`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Results
                    </Button>
                  </Link>
                  {survey.status === 'ACTIVE' && (
                    <Button
                      size="sm"
                      onClick={() => toast.success('Survey link copied!')}
                      className="flex-1"
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Share
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create Survey Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Create New Survey</h2>
              <button onClick={() => setShowCreateModal(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Survey Title</label>
                <input
                  type="text"
                  className="w-full border rounded px-3 py-2"
                  placeholder="e.g., Employee Engagement Survey Q4 2024"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description (Optional)</label>
                <textarea
                  className="w-full border rounded px-3 py-2"
                  rows={3}
                  placeholder="Brief description of the survey purpose..."
                ></textarea>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Survey Type</label>
                  <select className="w-full border rounded px-3 py-2">
                    <option>ENGAGEMENT</option>
                    <option>PULSE</option>
                    <option>EXIT</option>
                    <option>ONBOARDING</option>
                    <option>PERFORMANCE</option>
                    <option>CUSTOM</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Target Responses</label>
                  <input
                    type="number"
                    className="w-full border rounded px-3 py-2"
                    placeholder="250"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Start Date</label>
                  <input type="date" className="w-full border rounded px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">End Date (Optional)</label>
                  <input type="date" className="w-full border rounded px-3 py-2" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="anonymous" className="rounded" />
                <label htmlFor="anonymous" className="text-sm font-medium">
                  Make responses anonymous
                </label>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </Button>
                <Link to="/surveys/builder/new" className="flex-1">
                  <Button onClick={handleCreateSurvey} className="w-full">
                    Continue to Builder
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
