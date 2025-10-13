import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import {
  Target,
  Plus,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Edit2,
  Trash2,
  BarChart3,
  ChevronRight,
  Flag,
} from 'lucide-react';
import { performanceEnhancedService, Objective } from '../../services/performanceEnhancedService';
import { useAuthStore } from '../../stores/authStore';
import { toast } from 'react-hot-toast';

export default function ObjectivesPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const { data: objectives, isLoading } = useQuery({
    queryKey: ['objectives', user?.id, statusFilter],
    queryFn: () => {
      const filters: any = { ownerId: user?.id };
      if (statusFilter !== 'all') {
        filters.status = statusFilter;
      }
      return performanceEnhancedService.objectives.getAll(filters);
    },
    enabled: !!user?.id,
  });

  const deleteObjective = useMutation({
    mutationFn: (id: string) => performanceEnhancedService.objectives.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['objectives'] });
      toast.success('Objective deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete objective');
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'ON_TRACK':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'AT_RISK':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'ACTIVE':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'DRAFT':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle2 className="w-4 h-4" />;
      case 'ON_TRACK':
        return <TrendingUp className="w-4 h-4" />;
      case 'AT_RISK':
        return <AlertCircle className="w-4 h-4" />;
      case 'ACTIVE':
        return <Target className="w-4 h-4" />;
      default:
        return <Flag className="w-4 h-4" />;
    }
  };

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case 'HIGH':
        return 'text-green-600';
      case 'MEDIUM':
        return 'text-yellow-600';
      case 'LOW':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const stats = {
    total: objectives?.length || 0,
    active: objectives?.filter((o: Objective) => o.status === 'ACTIVE' || o.status === 'ON_TRACK').length || 0,
    atRisk: objectives?.filter((o: Objective) => o.status === 'AT_RISK').length || 0,
    completed: objectives?.filter((o: Objective) => o.status === 'COMPLETED').length || 0,
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading objectives...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Objectives</h1>
          <p className="text-gray-600 mt-1">Track your goals and key results (OKRs/KRAs)</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => navigate('/performance')}>
            Back to Performance
          </Button>
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            New Objective
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Objectives</p>
                <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="bg-blue-50 p-3 rounded-full">
                <Target className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Active</p>
                <p className="text-3xl font-bold text-gray-900">{stats.active}</p>
              </div>
              <div className="bg-purple-50 p-3 rounded-full">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">At Risk</p>
                <p className="text-3xl font-bold text-gray-900">{stats.atRisk}</p>
              </div>
              <div className="bg-red-50 p-3 rounded-full">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Completed</p>
                <p className="text-3xl font-bold text-gray-900">{stats.completed}</p>
              </div>
              <div className="bg-green-50 p-3 rounded-full">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b">
        {[
          { label: 'All', value: 'all' },
          { label: 'Active', value: 'ACTIVE' },
          { label: 'On Track', value: 'ON_TRACK' },
          { label: 'At Risk', value: 'AT_RISK' },
          { label: 'Completed', value: 'COMPLETED' },
          { label: 'Draft', value: 'DRAFT' },
        ].map((filter) => (
          <button
            key={filter.value}
            onClick={() => setStatusFilter(filter.value)}
            className={`px-4 py-2 font-medium transition-colors ${
              statusFilter === filter.value
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Objectives List */}
      {objectives && objectives.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {objectives.map((objective: Objective) => (
            <Card key={objective.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                          objective.status,
                        )}`}
                      >
                        {getStatusIcon(objective.status)}
                        {objective.status.replace(/_/g, ' ')}
                      </span>
                      <span className="text-sm text-gray-600">
                        Weight: {objective.weight}%
                      </span>
                      <span className={`text-sm font-medium ${getConfidenceColor(objective.confidence)}`}>
                        {objective.confidence} Confidence
                      </span>
                    </div>

                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {objective.title}
                    </h3>
                    <p className="text-gray-600 mb-4">{objective.description}</p>

                    <div className="flex items-center gap-6 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">
                          Due: {new Date(objective.dueDate).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <BarChart3 className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">Progress: {objective.progress}%</span>
                      </div>
                      {objective.lastCheckInAt && (
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600">
                            Last check-in: {new Date(objective.lastCheckInAt).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Overall Progress</span>
                        <span className="text-sm font-bold text-gray-900">{objective.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            objective.progress >= 80
                              ? 'bg-green-500'
                              : objective.progress >= 50
                              ? 'bg-blue-500'
                              : 'bg-yellow-500'
                          }`}
                          style={{ width: `${objective.progress}%` }}
                        ></div>
                      </div>
                    </div>

                    {objective.blockers && (
                      <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-red-900">Blockers</p>
                            <p className="text-sm text-red-700">{objective.blockers}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {objective.tags && objective.tags.length > 0 && (
                      <div className="flex gap-2 mt-4">
                        {objective.tags.map((tag) => (
                          <span
                            key={tag}
                            className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 ml-4">
                    <Button
                      size="sm"
                      onClick={() => navigate(`/performance/objectives/${objective.id}`)}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        // Open check-in modal
                        toast('Check-in modal coming soon');
                      }}
                    >
                      Check In
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        // Open edit modal
                        toast('Edit modal coming soon');
                      }}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        if (window.confirm('Are you sure you want to delete this objective?')) {
                          deleteObjective.mutate(objective.id);
                        }
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No objectives yet</h3>
            <p className="text-gray-600 mb-6">
              Start by creating your first objective to track your goals and key results.
            </p>
            <Button onClick={() => setIsCreateModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Objective
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Create Modal Placeholder */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
            <h2 className="text-2xl font-bold mb-4">Create New Objective</h2>
            <p className="text-gray-600 mb-4">
              Full create/edit modal will be implemented with form fields for:
              <br />- Title, Description, Weight %
              <br />- Due Date, Template Selection
              <br />- Parent Objective Alignment
              <br />- Milestone Creation
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => {
                toast('Create functionality coming soon');
                setIsCreateModalOpen(false);
              }}>
                Create Objective
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
