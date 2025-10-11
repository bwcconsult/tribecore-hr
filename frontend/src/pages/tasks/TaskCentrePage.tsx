import { useState, useEffect } from 'react';
import { CheckSquare, Clock, AlertCircle, CheckCircle, ChevronRight, Filter } from 'lucide-react';
import { tasksService, Task } from '../../services/tasks.service';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';

type TabType = 'all' | 'process' | 'checklist';
type FilterType = 'all' | 'incomplete' | 'completed';

export default function TaskCentrePage() {
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [filter, setFilter] = useState<FilterType>('incomplete');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTasks();
  }, [activeTab, filter]);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const params: any = { scope: 'self' };
      
      if (activeTab === 'process') {
        params.type = 'ABSENCE_APPROVAL';
      } else if (activeTab === 'checklist') {
        params.type = 'CHECKLIST';
      }

      if (filter === 'completed') {
        params.status = 'COMPLETED';
      } else if (filter === 'incomplete') {
        params.status = 'PENDING,IN_PROGRESS';
      }

      const data = await tasksService.getTasks(params);
      setTasks(data);
    } catch (error) {
      console.error('Error loading tasks:', error);
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteTask = async (taskId: string) => {
    try {
      await tasksService.completeTask(taskId);
      toast.success('Task completed successfully!');
      loadTasks();
    } catch (error) {
      toast.error('Failed to complete task');
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      IN_PROGRESS: 'bg-blue-100 text-blue-800',
      COMPLETED: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-gray-100 text-gray-800',
      OVERDUE: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityIcon = (priority: string) => {
    if (priority === 'URGENT' || priority === 'HIGH') {
      return <AlertCircle className="w-4 h-4 text-red-500" />;
    }
    return <Clock className="w-4 h-4 text-gray-400" />;
  };

  const getTaskCategoryLabel = (type: string) => {
    const labels: Record<string, string> = {
      ABSENCE_APPROVAL: 'Configurable Absence Request',
      SICKNESS_RTW: 'Return to Work Interview',
      DOCUMENT_REVIEW: 'Document Review',
      ONBOARDING: 'Onboarding Task',
      PERFORMANCE_REVIEW: 'Performance Review',
    };
    return labels[type] || type;
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
          <CheckSquare className="w-6 h-6" />
          Tasks Centre
        </h1>
        <p className="text-gray-600">Manage your tasks and approvals</p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'all'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              All Tasks
            </button>
            <button
              onClick={() => setActiveTab('process')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'process'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Process Tasks
            </button>
            <button
              onClick={() => setActiveTab('checklist')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'checklist'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Checklist Tasks
            </button>
          </nav>
        </div>

        {/* Filters */}
        <div className="p-4 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center gap-4">
            <Filter className="w-4 h-4 text-gray-400" />
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1 text-sm rounded-full ${
                  filter === 'all'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('incomplete')}
                className={`px-3 py-1 text-sm rounded-full ${
                  filter === 'incomplete'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300'
                }`}
              >
                Incomplete
              </button>
              <button
                onClick={() => setFilter('completed')}
                className={`px-3 py-1 text-sm rounded-full ${
                  filter === 'completed'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300'
                }`}
              >
                Completed
              </button>
            </div>
          </div>
        </div>

        {/* Tasks List */}
        <div className="divide-y divide-gray-200">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading tasks...</div>
          ) : tasks.length === 0 ? (
            <div className="p-8 text-center">
              <CheckSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks found</h3>
              <p className="text-gray-600">You don't have any tasks at the moment</p>
            </div>
          ) : (
            tasks.map((task) => (
              <div
                key={task.id}
                className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => {
                  if (task.status !== 'COMPLETED') {
                    handleCompleteTask(task.id);
                  }
                }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {getPriorityIcon(task.priority)}
                      <h3 className="font-medium text-gray-900">{task.title}</h3>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                          task.status
                        )}`}
                      >
                        {task.status}
                      </span>
                    </div>
                    {task.description && (
                      <p className="text-sm text-gray-600 mb-2">{task.description}</p>
                    )}
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      {task.requester && (
                        <span>
                          From: {task.requester.firstName} {task.requester.lastName}
                        </span>
                      )}
                      <span className="text-indigo-600">{getTaskCategoryLabel(task.type)}</span>
                      <span>{format(new Date(task.createdAt), 'MMM d, yyyy')}</span>
                      {task.dueDate && (
                        <span className="text-red-600">
                          Due: {format(new Date(task.dueDate), 'MMM d')}
                        </span>
                      )}
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
