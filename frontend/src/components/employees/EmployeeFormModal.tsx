import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';
import { employeeService, Employee } from '../../services/employeeService';
import { toast } from 'react-hot-toast';

interface EmployeeFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee?: Employee | null;
}

export default function EmployeeFormModal({ isOpen, onClose, employee }: EmployeeFormModalProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    employeeId: '',
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    department: '',
    jobTitle: '',
    hireDate: '',
    employmentType: 'FULL_TIME',
    status: 'ACTIVE',
    workLocation: 'USA',
    baseSalary: '',
    salaryCurrency: 'USD',
  });

  useEffect(() => {
    if (employee) {
      setFormData({
        employeeId: employee.employeeId || '',
        firstName: employee.firstName || '',
        lastName: employee.lastName || '',
        email: employee.email || '',
        phoneNumber: (employee as any).phoneNumber || '',
        department: employee.department || '',
        jobTitle: employee.jobTitle || '',
        hireDate: employee.hireDate?.split('T')[0] || '',
        employmentType: (employee as any).employmentType || 'FULL_TIME',
        status: employee.status || 'ACTIVE',
        workLocation: employee.workLocation || 'USA',
        baseSalary: employee.baseSalary?.toString() || '',
        salaryCurrency: (employee as any).salaryCurrency || 'USD',
      });
    }
  }, [employee, isOpen]);

  const createMutation = useMutation({
    mutationFn: employeeService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      toast.success('Employee created successfully!');
      onClose();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create employee');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Employee> }) =>
      employeeService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      toast.success('Employee updated successfully!');
      onClose();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update employee');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const submitData = {
      ...formData,
      baseSalary: parseFloat(formData.baseSalary),
      userId: employee?.id || 'temp-user-id',
    };

    if (employee) {
      updateMutation.mutate({ id: employee.id, data: submitData });
    } else {
      createMutation.mutate(submitData);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={employee ? 'Edit Employee' : 'Add New Employee'}
      size="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Employee ID"
              name="employeeId"
              value={formData.employeeId}
              onChange={handleChange}
              required
              placeholder="EMP-001"
            />
            <Input
              label="First Name"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              required
            />
            <Input
              label="Last Name"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              required
            />
            <Input
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
            <Input
              label="Phone Number"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
            />
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4">Employment Details</h3>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Department"
              name="department"
              value={formData.department}
              onChange={handleChange}
              required
            />
            <Input
              label="Job Title"
              name="jobTitle"
              value={formData.jobTitle}
              onChange={handleChange}
              required
            />
            <Input
              label="Hire Date"
              name="hireDate"
              type="date"
              value={formData.hireDate}
              onChange={handleChange}
              required
            />
            <Select
              label="Employment Type"
              name="employmentType"
              value={formData.employmentType}
              onChange={handleChange}
              required
            >
              <option value="FULL_TIME">Full Time</option>
              <option value="PART_TIME">Part Time</option>
              <option value="CONTRACT">Contract</option>
              <option value="INTERN">Intern</option>
            </Select>
            <Select
              label="Status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              required
            >
              <option value="ACTIVE">Active</option>
              <option value="ON_LEAVE">On Leave</option>
              <option value="TERMINATED">Terminated</option>
            </Select>
            <Select
              label="Work Location"
              name="workLocation"
              value={formData.workLocation}
              onChange={handleChange}
              required
            >
              <option value="USA">USA</option>
              <option value="UK">UK</option>
              <option value="NIGERIA">Nigeria</option>
            </Select>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4">Compensation</h3>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Base Salary"
              name="baseSalary"
              type="number"
              value={formData.baseSalary}
              onChange={handleChange}
              required
            />
            <Select
              label="Currency"
              name="salaryCurrency"
              value={formData.salaryCurrency}
              onChange={handleChange}
              required
            >
              <option value="USD">USD</option>
              <option value="GBP">GBP</option>
              <option value="NGN">NGN</option>
            </Select>
          </div>
        </div>

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
              : employee
              ? 'Update Employee'
              : 'Add Employee'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
