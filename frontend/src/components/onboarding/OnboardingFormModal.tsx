import { useState, useEffect } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';
import { onboardingService, Onboarding } from '../../services/onboardingService';
import { employeeService } from '../../services/employeeService';
import { toast } from 'react-hot-toast';
import { Plus, X, CheckCircle } from 'lucide-react';

interface OnboardingFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onboarding?: Onboarding | null;
}

const DEFAULT_CHECKLIST_ITEMS = [
  'Complete employee information form',
  'Submit required documents (ID, certificates)',
  'Sign employment contract',
  'Complete tax forms',
  'Set up company email account',
  'Complete IT equipment setup',
  'Review company policies and handbook',
  'Complete mandatory training courses',
  'Meet team members and stakeholders',
  'Set up direct deposit/bank information',
  'Complete benefits enrollment',
  'Review job responsibilities and expectations',
];

export default function OnboardingFormModal({ isOpen, onClose, onboarding }: OnboardingFormModalProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    employeeId: '',
    startDate: '',
    endDate: '',
    mentorId: '',
    status: 'NOT_STARTED',
    notes: '',
  });
  const [checklist, setChecklist] = useState<Array<{ task: string; completed: boolean }>>([]);
  const [newTask, setNewTask] = useState('');

  // Fetch employees for dropdown
  const { data: employeesData } = useQuery({
    queryKey: ['employees'],
    queryFn: () => employeeService.getAll({ limit: 100 }),
  });

  useEffect(() => {
    if (onboarding) {
      setFormData({
        employeeId: onboarding.employeeId || '',
        startDate: onboarding.startDate?.split('T')[0] || '',
        endDate: onboarding.endDate?.split('T')[0] || '',
        mentorId: onboarding.mentorId || '',
        status: onboarding.status || 'NOT_STARTED',
        notes: onboarding.notes || '',
      });
      setChecklist(onboarding.checklist || []);
    } else {
      setFormData({
        employeeId: '',
        startDate: '',
        endDate: '',
        mentorId: '',
        status: 'NOT_STARTED',
        notes: '',
      });
      // Set default checklist for new onboarding
      setChecklist(DEFAULT_CHECKLIST_ITEMS.map(task => ({ task, completed: false })));
    }
  }, [onboarding, isOpen]);

  const createMutation = useMutation({
    mutationFn: onboardingService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['onboarding'] });
      toast.success('Onboarding created successfully!');
      onClose();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create onboarding');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Onboarding> }) =>
      onboardingService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['onboarding'] });
      toast.success('Onboarding updated successfully!');
      onClose();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update onboarding');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const submitData = {
      ...formData,
      checklist,
      progress: Math.round((checklist.filter(item => item.completed).length / checklist.length) * 100),
    };

    if (onboarding) {
      updateMutation.mutate({ id: onboarding.id, data: submitData });
    } else {
      createMutation.mutate(submitData);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleAddTask = () => {
    if (newTask.trim()) {
      setChecklist([...checklist, { task: newTask.trim(), completed: false }]);
      setNewTask('');
    }
  };

  const handleRemoveTask = (index: number) => {
    setChecklist(checklist.filter((_, i) => i !== index));
  };

  const handleToggleTask = (index: number) => {
    setChecklist(checklist.map((item, i) => 
      i === index ? { ...item, completed: !item.completed } : item
    ));
  };

  const employees = employeesData?.data || [];
  const completedTasks = checklist.filter(item => item.completed).length;
  const totalTasks = checklist.length;
  const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={onboarding ? 'Edit Onboarding' : 'Start New Onboarding'}
      size="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="New Employee"
              name="employeeId"
              value={formData.employeeId}
              onChange={handleChange}
              required
            >
              <option value="">Select Employee</option>
              {employees.map((emp: any) => (
                <option key={emp.id} value={emp.id}>
                  {emp.firstName} {emp.lastName} - {emp.department}
                </option>
              ))}
            </Select>
            <Input
              label="Start Date"
              name="startDate"
              type="date"
              value={formData.startDate}
              onChange={handleChange}
              required
            />
            <Input
              label="Expected Completion Date"
              name="endDate"
              type="date"
              value={formData.endDate}
              onChange={handleChange}
            />
            <Select
              label="Assigned Mentor/Buddy"
              name="mentorId"
              value={formData.mentorId}
              onChange={handleChange}
            >
              <option value="">Select Mentor (Optional)</option>
              {employees.map((emp: any) => (
                <option key={emp.id} value={emp.id}>
                  {emp.firstName} {emp.lastName}
                </option>
              ))}
            </Select>
            <Select
              label="Status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              required
            >
              <option value="NOT_STARTED">Not Started</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
              <option value="ON_HOLD">On Hold</option>
            </Select>
          </div>
        </div>

        {/* Onboarding Checklist */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Onboarding Checklist</h3>
            <div className="text-sm text-gray-600">
              Progress: <span className="font-semibold text-blue-600">{progress}%</span> ({completedTasks}/{totalTasks} tasks)
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Checklist Items */}
          <div className="space-y-2 max-h-64 overflow-y-auto mb-4 border border-gray-200 rounded-lg p-4">
            {checklist.map((item, index) => (
              <div key={index} className="flex items-center gap-3 group">
                <input
                  type="checkbox"
                  checked={item.completed}
                  onChange={() => handleToggleTask(index)}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span className={`flex-1 text-sm ${item.completed ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                  {item.task}
                </span>
                <button
                  type="button"
                  onClick={() => handleRemoveTask(index)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-red-600 hover:text-red-700"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Add New Task */}
          <div className="flex gap-2">
            <Input
              placeholder="Add new checklist item..."
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddTask();
                }
              }}
            />
            <Button type="button" onClick={handleAddTask} variant="outline">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Notes */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Additional Notes</h3>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Add any additional notes, special requirements, or instructions..."
          />
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
              : onboarding
              ? 'Update Onboarding'
              : 'Start Onboarding'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
