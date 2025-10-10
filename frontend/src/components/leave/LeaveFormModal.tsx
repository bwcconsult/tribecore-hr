import { useState, useEffect } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';
import { leaveService, Leave } from '../../services/leaveService';
import { employeeService } from '../../services/employeeService';
import { toast } from 'react-hot-toast';

interface LeaveFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  leave?: Leave | null;
}

export default function LeaveFormModal({ isOpen, onClose, leave }: LeaveFormModalProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    employeeId: '',
    leaveType: 'VACATION',
    startDate: '',
    endDate: '',
    reason: '',
  });

  // Fetch employees for dropdown
  const { data: employeesData } = useQuery({
    queryKey: ['employees'],
    queryFn: () => employeeService.getAll({ limit: 100 }),
  });

  useEffect(() => {
    if (leave) {
      setFormData({
        employeeId: leave.employeeId || '',
        leaveType: leave.leaveType || 'VACATION',
        startDate: leave.startDate?.split('T')[0] || '',
        endDate: leave.endDate?.split('T')[0] || '',
        reason: leave.reason || '',
      });
    } else {
      const today = new Date().toISOString().split('T')[0];
      setFormData({
        employeeId: '',
        leaveType: 'VACATION',
        startDate: today,
        endDate: today,
        reason: '',
      });
    }
  }, [leave, isOpen]);

  const createMutation = useMutation({
    mutationFn: leaveService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leave'] });
      toast.success('Leave request created successfully!');
      onClose();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create leave request');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Leave> }) =>
      leaveService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leave'] });
      toast.success('Leave request updated successfully!');
      onClose();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update leave request');
    },
  });

  const calculateDays = () => {
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      const diffTime = end.getTime() - start.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      return diffDays > 0 ? diffDays : 0;
    }
    return 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (new Date(formData.endDate) < new Date(formData.startDate)) {
      toast.error('End date must be after start date');
      return;
    }

    const numberOfDays = calculateDays();
    
    const submitData = {
      ...formData,
      numberOfDays,
      status: 'PENDING',
    };

    if (leave) {
      updateMutation.mutate({ id: leave.id, data: submitData });
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

  const employees = employeesData?.data || [];
  const numberOfDays = calculateDays();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={leave ? 'Edit Leave Request' : 'Request Leave'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Leave Details</h3>
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
                  {emp.firstName} {emp.lastName} - {emp.department}
                </option>
              ))}
            </Select>
            <Select
              label="Leave Type"
              name="leaveType"
              value={formData.leaveType}
              onChange={handleChange}
              required
            >
              <option value="VACATION">Vacation</option>
              <option value="SICK">Sick Leave</option>
              <option value="PERSONAL">Personal Leave</option>
              <option value="MATERNITY">Maternity Leave</option>
              <option value="PATERNITY">Paternity Leave</option>
              <option value="UNPAID">Unpaid Leave</option>
              <option value="BEREAVEMENT">Bereavement</option>
              <option value="STUDY">Study Leave</option>
            </Select>
          </div>
        </div>

        {/* Date Range */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Duration</h3>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Start Date"
              name="startDate"
              type="date"
              value={formData.startDate}
              onChange={handleChange}
              required
            />
            <Input
              label="End Date"
              name="endDate"
              type="date"
              value={formData.endDate}
              onChange={handleChange}
              required
            />
          </div>
          
          {/* Number of Days Display */}
          {numberOfDays > 0 && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-blue-900">Total Leave Days:</span>
                <span className="text-lg font-bold text-blue-600">
                  {numberOfDays} {numberOfDays === 1 ? 'day' : 'days'}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Reason */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Reason</h3>
          <textarea
            name="reason"
            value={formData.reason}
            onChange={handleChange}
            required
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Please provide a reason for your leave request..."
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
              ? 'Submitting...'
              : leave
              ? 'Update Request'
              : 'Submit Request'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
