import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { Play, Pause, Plus, Edit2, Trash2, Clock, DollarSign, Calendar } from 'lucide-react';
import { timeTrackingService, TimeEntry } from '../../services/timeTrackingService';
import TimeEntryFormModal from '../../components/time-tracking/TimeEntryFormModal';
import { toast } from 'react-hot-toast';
import { formatDate } from '../../lib/utils';

export default function TimeTrackingPage() {
  const queryClient = useQueryClient();
  const [isTracking, setIsTracking] = useState(false);
  const [currentTask, setCurrentTask] = useState('');
  const [currentProject, setCurrentProject] = useState('');
  const [elapsedTime, setElapsedTime] = useState(0);
  const [activeTimerId, setActiveTimerId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<TimeEntry | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<Date | null>(null);

  const { data: timeEntries, isLoading } = useQuery({
    queryKey: ['time-entries'],
    queryFn: () => timeTrackingService.getAll(),
  });

  const deleteMutation = useMutation({
    mutationFn: timeTrackingService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['time-entries'] });
      toast.success('Time entry deleted successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete time entry');
    },
  });

  const startTimerMutation = useMutation({
    mutationFn: timeTrackingService.startTimer,
    onSuccess: (data) => {
      setActiveTimerId(data.id);
      setIsTracking(true);
      startTimeRef.current = new Date();
      toast.success('Timer started!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to start timer');
    },
  });

  const stopTimerMutation = useMutation({
    mutationFn: timeTrackingService.stopTimer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['time-entries'] });
      setIsTracking(false);
      setElapsedTime(0);
      setCurrentTask('');
      setCurrentProject('');
      setActiveTimerId(null);
      startTimeRef.current = null;
      toast.success('Timer stopped and entry saved!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to stop timer');
    },
  });

  // Timer logic
  useEffect(() => {
    if (isTracking) {
      timerIntervalRef.current = setInterval(() => {
        if (startTimeRef.current) {
          const now = new Date();
          const diff = Math.floor((now.getTime() - startTimeRef.current.getTime()) / 1000);
          setElapsedTime(diff);
        }
      }, 1000);
    } else {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    }

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [isTracking]);

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const handleStartStop = () => {
    if (!isTracking) {
      if (!currentTask.trim()) {
        toast.error('Please enter a task description');
        return;
      }
      startTimerMutation.mutate({
        task: currentTask,
        project: currentProject || undefined,
        billable: true,
      });
    } else {
      if (activeTimerId) {
        stopTimerMutation.mutate(activeTimerId);
      }
    }
  };

  const handleManualEntry = () => {
    setSelectedEntry(null);
    setIsModalOpen(true);
  };

  const handleEdit = (entry: TimeEntry) => {
    setSelectedEntry(entry);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this time entry?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedEntry(null);
  };

  // Calculate stats
  const calculateStats = () => {
    const entries = timeEntries?.data || [];
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const todayMinutes = entries
      .filter((e: TimeEntry) => new Date(e.startTime) >= today)
      .reduce((sum: number, e: TimeEntry) => sum + (e.duration || 0), 0);

    const weekMinutes = entries
      .filter((e: TimeEntry) => new Date(e.startTime) >= weekStart)
      .reduce((sum: number, e: TimeEntry) => sum + (e.duration || 0), 0);

    const monthMinutes = entries
      .filter((e: TimeEntry) => new Date(e.startTime) >= monthStart)
      .reduce((sum: number, e: TimeEntry) => sum + (e.duration || 0), 0);

    return {
      today: formatDuration(todayMinutes),
      week: formatDuration(weekMinutes),
      month: formatDuration(monthMinutes),
    };
  };

  const stats = calculateStats();

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Time Tracking</h1>
          <p className="text-gray-600 mt-1">Track time spent on projects and tasks</p>
        </div>
        <Button onClick={handleManualEntry}>
          <Plus className="h-4 w-4 mr-2" />
          Manual Entry
        </Button>
      </div>

      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="space-y-4">
            <Input
              placeholder="What are you working on?"
              value={currentTask}
              onChange={(e) => setCurrentTask(e.target.value)}
              disabled={isTracking}
              className="text-lg"
            />
            <div className="flex items-center justify-between">
              <Input
                placeholder="Project (optional)"
                value={currentProject}
                onChange={(e) => setCurrentProject(e.target.value)}
                disabled={isTracking}
                className="max-w-xs"
              />
              <div className="flex items-center gap-4">
                <span className="text-3xl font-mono font-bold text-gray-900">{formatTime(elapsedTime)}</span>
                <Button
                  size="lg"
                  onClick={handleStartStop}
                  className={isTracking ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}
                  disabled={startTimerMutation.isPending || stopTimerMutation.isPending}
                >
                  {isTracking ? (
                    <>
                      <Pause className="h-5 w-5 mr-2" />
                      Stop
                    </>
                  ) : (
                    <>
                      <Play className="h-5 w-5 mr-2" />
                      Start
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {[
          { title: 'Today', hours: stats.today, color: 'text-blue-600', icon: Clock },
          { title: 'This Week', hours: stats.week, color: 'text-green-600', icon: Calendar },
          { title: 'This Month', hours: stats.month, color: 'text-purple-600', icon: Calendar },
        ].map((stat) => (
          <Card key={stat.title}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className={`text-3xl font-bold ${stat.color} mt-2`}>{stat.hours}</p>
                </div>
                <stat.icon className={`h-8 w-8 ${stat.color} opacity-20`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Entries</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-center py-8 text-gray-500">Loading...</p>
          ) : timeEntries?.data?.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No time entries</h3>
              <p className="mt-1 text-sm text-gray-500">Start tracking time or add a manual entry.</p>
              <div className="mt-6 flex gap-3 justify-center">
                <Button onClick={() => setCurrentTask('New task')}>
                  <Play className="h-4 w-4 mr-2" />
                  Start Timer
                </Button>
                <Button variant="outline" onClick={handleManualEntry}>
                  <Plus className="h-4 w-4 mr-2" />
                  Manual Entry
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {timeEntries?.data?.map((entry: TimeEntry) => (
                <div key={entry.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-semibold text-gray-900">{entry.task}</h4>
                        {entry.billable && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                            <DollarSign className="h-3 w-3 mr-1" />
                            Billable
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        {entry.project && (
                          <span className="flex items-center gap-1">
                            📁 {entry.project}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {formatDate(entry.startTime)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {new Date(entry.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          {entry.endTime && ` - ${new Date(entry.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                        </span>
                      </div>
                      {entry.description && (
                        <p className="mt-2 text-sm text-gray-600">{entry.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-3 ml-4">
                      <div className="text-right">
                        <p className="text-lg font-bold text-blue-600">{formatDuration(entry.duration)}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(entry)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(entry.id)}
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <TimeEntryFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        timeEntry={selectedEntry}
      />
    </div>
  );
}
