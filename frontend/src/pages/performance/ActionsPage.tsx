import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import {
  CheckCircle2,
  Circle,
  Clock,
  AlertCircle,
  Plus,
  Trash2,
  Calendar,
  User,
  Tag,
  ListChecks,
} from 'lucide-react';
import { performanceEnhancedService, Action } from '../../services/performanceEnhancedService';
import { useAuthStore } from '../../stores/authStore';
import { toast } from 'react-hot-toast';

export default function ActionsPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedActions, setSelectedActions] = useState<string[]>([]);

  const { data: actions, isLoading } = useQuery({
    queryKey: ['actions', user?.id, statusFilter],
    queryFn: () => {
      const filters: any = { ownerId: user?.id };
      if (statusFilter !== 'all') {
        filters.status = statusFilter;
      }
      return performanceEnhancedService.actions.getAll(filters);
    },
    enabled: !!user?.id,
  });

  const updateAction = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      performanceEnhancedService.actions.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['actions'] });
      toast.success('Action updated successfully');
    },
    onError: () => {
      toast.error('Failed to update action');
    },
  });

  const bulkComplete = useMutation({
    mutationFn: (actionIds: string[]) =>
      performanceEnhancedService.actions.bulkComplete(actionIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['actions'] });
      setSelectedActions([]);
      toast.success('Actions completed successfully!');
    },
    onError: () => {
      toast.error('Failed to complete actions');
    },
  });

  const toggleSelect = (id: string) => {
    setSelectedActions((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id],
    );
  };

  const toggleSelectAll = () => {
    if (selectedActions.length === actions?.length) {
      setSelectedActions([]);
    } else {
      setSelectedActions(actions?.map((a: Action) => a.id) || []);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'OPEN':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'CANCELED':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle2 className="w-4 h-4" />;
      case 'IN_PROGRESS':
        return <Clock className="w-4 h-4" />;
      case 'OPEN':
        return <Circle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getSourceColor = (sourceType: string) => {
    switch (sourceType) {
      case 'ONE_ON_ONE':
        return 'bg-purple-100 text-purple-700';
      case 'OBJECTIVE':
        return 'bg-blue-100 text-blue-700';
      case 'REVIEW':
        return 'bg-green-100 text-green-700';
      case 'FEEDBACK':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getPriorityColor = (priority: number) => {
    if (priority >= 4) return 'text-red-600 font-bold';
    if (priority >= 3) return 'text-orange-600 font-semibold';
    return 'text-gray-600';
  };

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date();
  };

  const stats = {
    total: actions?.length || 0,
    open: actions?.filter((a: Action) => a.status === 'OPEN').length || 0,
    inProgress: actions?.filter((a: Action) => a.status === 'IN_PROGRESS').length || 0,
    completed: actions?.filter((a: Action) => a.status === 'COMPLETED').length || 0,
    overdue: actions?.filter((a: Action) => a.status !== 'COMPLETED' && isOverdue(a.dueDate)).length || 0,
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading actions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Actions & Tasks</h1>
          <p className="text-gray-600 mt-1">Manage commitments from 1:1s, objectives, and reviews</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => navigate('/performance')}>
            Back to Performance
          </Button>
          {selectedActions.length > 0 && (
            <Button
              onClick={() => bulkComplete.mutate(selectedActions)}
              disabled={bulkComplete.isPending}
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Complete Selected ({selectedActions.length})
            </Button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total</p>
                <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-full">
                <ListChecks className="w-6 h-6 text-gray-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Open</p>
                <p className="text-3xl font-bold text-gray-900">{stats.open}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-full">
                <Circle className="w-6 h-6 text-gray-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">In Progress</p>
                <p className="text-3xl font-bold text-gray-900">{stats.inProgress}</p>
              </div>
              <div className="bg-blue-50 p-3 rounded-full">
                <Clock className="w-6 h-6 text-blue-600" />
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

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Overdue</p>
                <p className="text-3xl font-bold text-red-600">{stats.overdue}</p>
              </div>
              <div className="bg-red-50 p-3 rounded-full">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between border-b">
        <div className="flex gap-2">
          {[
            { label: 'All', value: 'all' },
            { label: 'Open', value: 'OPEN' },
            { label: 'In Progress', value: 'IN_PROGRESS' },
            { label: 'Completed', value: 'COMPLETED' },
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
        {actions && actions.length > 0 && (
          <Button variant="outline" size="sm" onClick={toggleSelectAll}>
            {selectedActions.length === actions.length ? 'Deselect All' : 'Select All'}
          </Button>
        )}
      </div>

      {/* Actions List */}
      {actions && actions.length > 0 ? (
        <div className="space-y-3">
          {actions.map((action: Action) => (
            <Card
              key={action.id}
              className={`hover:shadow-lg transition-shadow ${
                isOverdue(action.dueDate) && action.status !== 'COMPLETED'
                  ? 'border-l-4 border-l-red-500'
                  : ''
              }`}
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <input
                    type="checkbox"
                    checked={selectedActions.includes(action.id)}
                    onChange={() => toggleSelect(action.id)}
                    className="mt-1 w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />

                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                          action.status,
                        )}`}
                      >
                        {getStatusIcon(action.status)}
                        {action.status.replace(/_/g, ' ')}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded font-medium ${getSourceColor(action.sourceType)}`}>
                        {action.sourceType.replace(/_/g, ' ')}
                      </span>
                      <span className={`text-sm ${getPriorityColor(action.priority)}`}>
                        Priority {action.priority}
                      </span>
                      {isOverdue(action.dueDate) && action.status !== 'COMPLETED' && (
                        <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full font-medium flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          Overdue
                        </span>
                      )}
                    </div>

                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{action.title}</h3>
                    {action.description && (
                      <p className="text-gray-600 mb-3">{action.description}</p>
                    )}

                    <div className="flex items-center gap-6 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className={`${isOverdue(action.dueDate) && action.status !== 'COMPLETED' ? 'text-red-600 font-medium' : 'text-gray-600'}`}>
                          Due: {new Date(action.dueDate).toLocaleDateString()}
                        </span>
                      </div>
                      {action.assignedBy && (
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600">
                            Assigned by ID: {action.assignedBy}
                          </span>
                        </div>
                      )}
                    </div>

                    {action.tags && action.tags.length > 0 && (
                      <div className="flex items-center gap-2 flex-wrap mt-3">
                        <Tag className="w-4 h-4 text-gray-400" />
                        {action.tags.map((tag) => (
                          <span
                            key={tag}
                            className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {action.notes && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-700">{action.notes}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2">
                    {action.status !== 'COMPLETED' && (
                      <>
                        <Button
                          size="sm"
                          onClick={() =>
                            updateAction.mutate({
                              id: action.id,
                              data: { status: 'IN_PROGRESS' },
                            })
                          }
                          disabled={action.status === 'IN_PROGRESS'}
                        >
                          <Clock className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          onClick={() =>
                            updateAction.mutate({
                              id: action.id,
                              data: { status: 'COMPLETED' },
                            })
                          }
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <ListChecks className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No actions yet</h3>
            <p className="text-gray-600 mb-6">
              Actions will be created automatically from your 1:1s, objectives, and reviews.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
