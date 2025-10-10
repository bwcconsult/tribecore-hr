import { useState, useEffect } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';
import { attendanceService, Attendance } from '../../services/attendanceService';
import { employeeService } from '../../services/employeeService';
import { toast } from 'react-hot-toast';

interface AttendanceFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  attendance?: Attendance | null;
}

export default function AttendanceFormModal({ isOpen, onClose, attendance }: AttendanceFormModalProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    employeeId: '',
    date: '',
    clockIn: '',
    clockOut: '',
    status: 'PRESENT',
    notes: '',
  });

  // Fetch employees for dropdown
  const { data: employeesData } = useQuery({
    queryKey: ['employees'],
    queryFn: () => employeeService.getAll({ limit: 100 }),
  });

  useEffect(() => {
    if (attendance) {
      const attendanceDate = new Date(attendance.date);
      const clockInTime = new Date(attendance.clockIn);
      const clockOutTime = attendance.clockOut ? new Date(attendance.clockOut) : null;
      
      setFormData({
        employeeId: attendance.employeeId || '',
        date: attendanceDate.toISOString().split('T')[0],
        clockIn: clockInTime.toTimeString().slice(0, 5),
        clockOut: clockOutTime ? clockOutTime.toTimeString().slice(0, 5) : '',
        status: attendance.status || 'PRESENT',
        notes: attendance.notes || '',
      });
    } else {
      const now = new Date();
      const today = now.toISOString().split('T')[0];
      const currentTime = now.toTimeString().slice(0, 5);
      
      setFormData({
        employeeId: '',
        date: today,
        clockIn: currentTime,
        clockOut: '',
        status: 'PRESENT',
        notes: '',
      });
    }
  }, [attendance, isOpen]);

  const createMutation = useMutation({
    mutationFn: attendanceService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
      toast.success('Attendance record created successfully!');
      onClose();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create attendance record');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Attendance> }) =>
      attendanceService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
      toast.success('Attendance record updated successfully!');
      onClose();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update attendance record');
    },
  });

  const calculateWorkHours = () => {
    if (formData.clockIn && formData.clockOut) {
      const [inHour, inMin] = formData.clockIn.split(':').map(Number);
      const [outHour, outMin] = formData.clockOut.split(':').map(Number);
      
      const inMinutes = inHour * 60 + inMin;
      const outMinutes = outHour * 60 + outMin;
      
      let diff = outMinutes - inMinutes;
      if (diff < 0) diff += 24 * 60; // Handle overnight shifts
      
      return (diff / 60).toFixed(2);
    }
    return '0.00';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.clockOut && formData.clockIn >= formData.clockOut) {
      toast.error('Clock out time must be after clock in time');
      return;
    }

    const workHours = formData.clockOut ? parseFloat(calculateWorkHours()) : undefined;
    
    const submitData = {
      ...formData,
      clockIn: `${formData.date}T${formData.clockIn}:00`,
      clockOut: formData.clockOut ? `${formData.date}T${formData.clockOut}:00` : undefined,
      workHours,
    };

    if (attendance) {
      updateMutation.mutate({ id: attendance.id, data: submitData });
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
  const workHours = calculateWorkHours();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={attendance ? 'Edit Attendance Record' : 'Add Attendance Record'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Employee & Date */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
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
            <Input
              label="Date"
              name="date"
              type="date"
              value={formData.date}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        {/* Clock In/Out Times */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Time Details</h3>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Clock In Time"
              name="clockIn"
              type="time"
              value={formData.clockIn}
              onChange={handleChange}
              required
            />
            <Input
              label="Clock Out Time"
              name="clockOut"
              type="time"
              value={formData.clockOut}
              onChange={handleChange}
            />
          </div>
          
          {/* Work Hours Display */}
          {formData.clockIn && formData.clockOut && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-blue-900">Total Work Hours:</span>
                <span className="text-lg font-bold text-blue-600">{workHours} hours</span>
              </div>
            </div>
          )}
        </div>

        {/* Status */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Status</h3>
          <Select
            label="Attendance Status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            required
          >
            <option value="PRESENT">Present</option>
            <option value="ABSENT">Absent</option>
            <option value="LATE">Late</option>
            <option value="HALF_DAY">Half Day</option>
            <option value="ON_LEAVE">On Leave</option>
            <option value="REMOTE">Remote/WFH</option>
          </Select>
        </div>

        {/* Notes */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Additional Notes</h3>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Add any additional notes (e.g., reason for late arrival, early departure)..."
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
              : attendance
              ? 'Update Record'
              : 'Add Record'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
