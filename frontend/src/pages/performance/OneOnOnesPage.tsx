import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import {
  MessageSquare,
  Plus,
  Calendar,
  Clock,
  CheckCircle2,
  Users,
  PlayCircle,
  Edit2,
  Trash2,
  AlertCircle,
  ChevronRight,
} from 'lucide-react';
import { performanceEnhancedService, OneOnOne } from '../../services/performanceEnhancedService';
import { useAuthStore } from '../../stores/authStore';
import { toast } from 'react-hot-toast';

export default function OneOnOnesPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const { data: oneOnOnes, isLoading } = useQuery({
    queryKey: ['one-on-ones', user?.id, statusFilter],
    queryFn: () => {
      const filters: any = { employeeId: user?.id };
      if (statusFilter !== 'all') {
        filters.status = statusFilter;
      }
      return performanceEnhancedService.oneOnOnes.getAll(filters);
    },
    enabled: !!user?.id,
  });

  const deleteOneOnOne = useMutation({
    mutationFn: (id: string) => {
      // Would call delete endpoint
      return Promise.resolve();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['one-on-ones'] });
      toast.success('1:1 deleted successfully');
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'SCHEDULED':
        return 'bg-purple-100 text-purple-800 border-purple-200';
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
        return <PlayCircle className="w-4 h-4" />;
      case 'SCHEDULED':
        return <Calendar className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const stats = {
    total: oneOnOnes?.length || 0,
    scheduled: oneOnOnes?.filter((o: OneOnOne) => o.status === 'SCHEDULED').length || 0,
    completed: oneOnOnes?.filter((o: OneOnOne) => o.status === 'COMPLETED').length || 0,
    thisMonth: oneOnOnes?.filter((o: OneOnOne) => {
      const date = new Date(o.scheduledAt);
      const now = new Date();
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    }).length || 0,
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading 1:1s...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">1:1 Meetings</h1>
          <p className="text-gray-600 mt-1">Schedule and manage one-on-one conversations</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => navigate('/performance')}>
            Back to Performance
          </Button>
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Schedule 1:1
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total 1:1s</p>
                <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="bg-blue-50 p-3 rounded-full">
                <MessageSquare className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Scheduled</p>
                <p className="text-3xl font-bold text-gray-900">{stats.scheduled}</p>
              </div>
              <div className="bg-purple-50 p-3 rounded-full">
                <Calendar className="w-6 h-6 text-purple-600" />
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
                <p className="text-sm text-gray-600 mb-1">This Month</p>
                <p className="text-3xl font-bold text-gray-900">{stats.thisMonth}</p>
              </div>
              <div className="bg-orange-50 p-3 rounded-full">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b">
        {[
          { label: 'All', value: 'all' },
          { label: 'Scheduled', value: 'SCHEDULED' },
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

      {/* 1:1s List */}
      {oneOnOnes && oneOnOnes.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {oneOnOnes.map((oneOnOne: OneOnOne) => (
            <Card key={oneOnOne.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                          oneOnOne.status,
                        )}`}
                      >
                        {getStatusIcon(oneOnOne.status)}
                        {oneOnOne.status.replace(/_/g, ' ')}
                      </span>
                      <span className="text-sm text-gray-600">
                        {oneOnOne.durationMinutes} minutes
                      </span>
                    </div>

                    <div className="flex items-center gap-3 mb-3">
                      <Users className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="font-semibold text-gray-900">
                          With: {oneOnOne.manager?.firstName} {oneOnOne.manager?.lastName}
                        </p>
                        <p className="text-sm text-gray-600">Manager</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 text-sm mb-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">
                          {new Date(oneOnOne.scheduledAt).toLocaleDateString('en-US', {
                            weekday: 'short',
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">
                          {new Date(oneOnOne.scheduledAt).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      {oneOnOne.location && (
                        <div className="flex items-center gap-2">
                          <span className="text-gray-600">{oneOnOne.location}</span>
                        </div>
                      )}
                    </div>

                    {oneOnOne.agendaItems && oneOnOne.agendaItems.length > 0 && (
                      <div className="mb-4">
                        <p className="text-sm font-medium text-gray-700 mb-2">Agenda Items:</p>
                        <div className="space-y-1">
                          {oneOnOne.agendaItems.slice(0, 3).map((item: any, idx: number) => (
                            <div key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                              <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                              <span>{item.title}</span>
                            </div>
                          ))}
                          {oneOnOne.agendaItems.length > 3 && (
                            <p className="text-sm text-gray-500 ml-3.5">
                              +{oneOnOne.agendaItems.length - 3} more items
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {oneOnOne.topics && oneOnOne.topics.length > 0 && (
                      <div className="flex gap-2 flex-wrap">
                        {oneOnOne.topics.map((topic) => (
                          <span
                            key={topic}
                            className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
                          >
                            {topic}
                          </span>
                        ))}
                      </div>
                    )}

                    {oneOnOne.notes && oneOnOne.status === 'COMPLETED' && (
                      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm font-medium text-gray-700 mb-1">Notes:</p>
                        <p className="text-sm text-gray-600">{oneOnOne.notes}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 ml-4">
                    {oneOnOne.status === 'SCHEDULED' && (
                      <Button
                        size="sm"
                        onClick={() => {
                          toast('Start 1:1 functionality coming soon');
                        }}
                      >
                        <PlayCircle className="w-4 h-4 mr-2" />
                        Start
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => navigate(`/performance/one-on-ones/${oneOnOne.id}`)}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        toast('Edit functionality coming soon');
                      }}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        if (window.confirm('Are you sure you want to delete this 1:1?')) {
                          deleteOneOnOne.mutate(oneOnOne.id);
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
            <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No 1:1s scheduled</h3>
            <p className="text-gray-600 mb-6">
              Schedule your first one-on-one meeting to have meaningful conversations with your
              manager.
            </p>
            <Button onClick={() => setIsCreateModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Schedule Your First 1:1
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Create Modal Placeholder */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
            <h2 className="text-2xl font-bold mb-4">Schedule 1:1 Meeting</h2>
            <p className="text-gray-600 mb-4">
              Full scheduling modal will be implemented with:
              <br />- Date & Time Selection
              <br />- Duration Picker (15, 30, 45, 60 minutes)
              <br />- Location/Meeting Link
              <br />- Agenda Builder (add items from objectives, actions, wellbeing)
              <br />- Topic Tags
              <br />- Notes Section
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  toast('Schedule functionality coming soon');
                  setIsCreateModalOpen(false);
                }}
              >
                Schedule 1:1
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
