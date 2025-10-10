import { useState, useEffect } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';
import { timeTrackingService, TimeEntry } from '../../services/timeTrackingService';
import { employeeService } from '../../services/employeeService';
import { toast } from 'react-hot-toast';

interface TimeEntryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  timeEntry?: TimeEntry | null;
}

export default function TimeEntryFormModal({ isOpen, onClose, timeEntry }: TimeEntryFormModalProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    employeeId: '',
    project: '',
    task: '',
    startTime: '',
    endTime: '',
    billable: true,
    description: '',
  });

  // Fetch employees for dropdown
  const { data: employeesData } = useQuery({
    queryKey: ['employees'],
    queryFn: () => employeeService.getAll({ limit: 100 }),
  });

  useEffect(() => {
    if (timeEntry) {
      const startDateTime = new Date(timeEntry.startTime);
      const endDateTime = timeEntry.endTime ? new Date(timeEntry.endTime) : new Date();
      
      setFormData({
        employeeId: timeEntry.employeeId || '',
        project: timeEntry.project || '',
        task: timeEntry.task || '',
        startTime: startDateTime.toISOString().slice(0, 16),
        endTime: timeEntry.endTime ? endDateTime.toISOString().slice(0, 16) : '',
        billable: timeEntry.billable !== undefined ? timeEntry.billable : true,
        description: timeEntry.description || '',
      });
    } else {
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
      
      setFormData({
        employeeId: '',
        project: '',
        task: '',
        startTime: oneHourAgo.toISOString().slice(0, 16),
        endTime: now.toISOString().slice(0, 16),
        billable: true,
        description: '',
      });
    }
  }, [timeEntry, isOpen]);

  const createMutation = useMutation({
    mutationFn: timeTrackingService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['time-entries'] });
      toast.success('Time entry created successfully!');
      onClose();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create time entry');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<TimeEntry> }) =>
      timeTrackingService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['time-entries'] });
      toast.success('Time entry updated successfully!');
      onClose();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update time entry');
    },
  });

  const calculateDuration = () => {
    if (formData.startTime && formData.endTime) {
      const start = new Date(formData.startTime);
      const end = new Date(formData.endTime);
      const durationMs = end.getTime() - start.getTime();
      return Math.round(durationMs / 60000); // Convert to minutes
    }
    return 0;
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const duration = calculateDuration();
    
    if (duration <= 0) {
      toast.error('End time must be after start time');
      return;
    }

    const submitData = {
      ...formData,
      duration,
      billable: formData.billable,
    };

    if (timeEntry) {
      updateMutation.mutate({ id: timeEntry.id, data: submitData });
    } else {
      createMutation.mutate(submitData);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData({
        ...formData,
        [name]: checked,
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const employees = employeesData?.data || [];
  const duration = calculateDuration();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={timeEntry ? 'Edit Time Entry' : 'Add Manual Time Entry'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Entry Details</h3>
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Employee"
              name="employeeId"
              value={formData.employeeId}
              onChange={handleChange}
              required
            >
              <option value="">Select Employee</option>
              {employees.map((emp: any) => (
                <option key={emp.id} value={emp.id}>
                  {emp.firstName} {emp.lastName}
                </option>
              ))}
            </Select>
            <Input
              label="Project (Optional)"
              name="project"
              value={formData.project}
              onChange={handleChange}
              placeholder="e.g. Client Website"
            />
            <div className="col-span-2">
              <Input
                label="Task Description"
                name="task"
                value={formData.task}
                onChange={handleChange}
                required
                placeholder="What did you work on?"
              />
            </div>
          </div>
        </div>

        {/* Time Information */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Time Period</h3>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Start Time"
              name="startTime"
              type="datetime-local"
              value={formData.startTime}
              onChange={handleChange}
              required
            />
            <Input
              label="End Time"
              name="endTime"
              type="datetime-local"
              value={formData.endTime}
              onChange={handleChange}
              required
            />
          </div>
          
          {/* Duration Display */}
          {duration > 0 && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-blue-900">Total Duration:</span>
                <span className="text-lg font-bold text-blue-600">{formatDuration(duration)}</span>
              </div>
            </div>
          )}
        </div>

        {/* Additional Details */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Additional Information</h3>
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="billable"
                name="billable"
                checked={formData.billable}
                onChange={handleChange}
                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <label htmlFor="billable" className="ml-2 text-sm font-medium text-gray-700">
                Billable Hours
              </label>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Additional Notes
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Add any additional details about this time entry..."
              />
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={createMutation.isPending || updateMutation.isPending}
          >
            {createMutation.isPending || updateMutation.isPending
              ? 'Saving...'
              : timeEntry
              ? 'Update Entry'
              : 'Add Entry'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
