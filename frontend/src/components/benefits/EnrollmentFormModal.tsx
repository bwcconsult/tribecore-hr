import { useState, useEffect } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';
import { benefitsService, BenefitEnrollment } from '../../services/benefitsService';
import { employeeService } from '../../services/employeeService';
import { toast } from 'react-hot-toast';

interface EnrollmentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  enrollment?: BenefitEnrollment | null;
}

export default function EnrollmentFormModal({ isOpen, onClose, enrollment }: EnrollmentFormModalProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    employeeId: '',
    benefitPlanId: '',
    enrollmentDate: '',
    effectiveDate: '',
    endDate: '',
    coverage: 'EMPLOYEE_ONLY',
    dependents: '0',
    employeeContribution: '',
    employerContribution: '',
    notes: '',
  });

  // Fetch employees and benefit plans
  const { data: employeesData } = useQuery({
    queryKey: ['employees'],
    queryFn: () => employeeService.getAll({ limit: 100 }),
  });

  const { data: plansData } = useQuery({
    queryKey: ['benefit-plans'],
    queryFn: () => benefitsService.getAllPlans(),
  });

  useEffect(() => {
    if (enrollment) {
      setFormData({
        employeeId: enrollment.employeeId || '',
        benefitPlanId: enrollment.benefitPlanId || '',
        enrollmentDate: enrollment.enrollmentDate?.split('T')[0] || '',
        effectiveDate: enrollment.effectiveDate?.split('T')[0] || '',
        endDate: enrollment.endDate?.split('T')[0] || '',
        coverage: enrollment.coverage || 'EMPLOYEE_ONLY',
        dependents: enrollment.dependents?.toString() || '0',
        employeeContribution: enrollment.employeeContribution?.toString() || '',
        employerContribution: enrollment.employerContribution?.toString() || '',
        notes: enrollment.notes || '',
      });
    } else {
      const today = new Date().toISOString().split('T')[0];
      setFormData({
        employeeId: '',
        benefitPlanId: '',
        enrollmentDate: today,
        effectiveDate: today,
        endDate: '',
        coverage: 'EMPLOYEE_ONLY',
        dependents: '0',
        employeeContribution: '',
        employerContribution: '',
        notes: '',
      });
    }
  }, [enrollment, isOpen]);

  const createMutation = useMutation({
    mutationFn: benefitsService.createEnrollment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['benefit-enrollments'] });
      toast.success('Enrollment created successfully!');
      onClose();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create enrollment');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<BenefitEnrollment> }) =>
      benefitsService.updateEnrollment(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['benefit-enrollments'] });
      toast.success('Enrollment updated successfully!');
      onClose();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update enrollment');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const employeeContribution = parseFloat(formData.employeeContribution) || 0;
    const employerContribution = parseFloat(formData.employerContribution) || 0;
    const totalCost = employeeContribution + employerContribution;
    
    const submitData = {
      ...formData,
      dependents: parseInt(formData.dependents),
      employeeContribution,
      employerContribution,
      totalCost,
      status: 'ACTIVE',
    };

    if (enrollment) {
      updateMutation.mutate({ id: enrollment.id, data: submitData });
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
  const plans = plansData?.data || [];
  const totalCost = (parseFloat(formData.employeeContribution) || 0) + (parseFloat(formData.employerContribution) || 0);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={enrollment ? 'Edit Benefit Enrollment' : 'New Benefit Enrollment'}
      size="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Employee & Plan Selection */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Enrollment Details</h3>
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
              label="Benefit Plan"
              name="benefitPlanId"
              value={formData.benefitPlanId}
              onChange={handleChange}
              required
            >
              <option value="">Select Plan</option>
              {plans.map((plan: any) => (
                <option key={plan.id} value={plan.id}>
                  {plan.name} - {plan.type}
                </option>
              ))}
            </Select>
          </div>
        </div>

        {/* Dates */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Coverage Period</h3>
          <div className="grid grid-cols-3 gap-4">
            <Input
              label="Enrollment Date"
              name="enrollmentDate"
              type="date"
              value={formData.enrollmentDate}
              onChange={handleChange}
              required
            />
            <Input
              label="Effective Date"
              name="effectiveDate"
              type="date"
              value={formData.effectiveDate}
              onChange={handleChange}
              required
            />
            <Input
              label="End Date (Optional)"
              name="endDate"
              type="date"
              value={formData.endDate}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Coverage Details */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Coverage Type</h3>
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Coverage Level"
              name="coverage"
              value={formData.coverage}
              onChange={handleChange}
              required
            >
              <option value="EMPLOYEE_ONLY">Employee Only</option>
              <option value="EMPLOYEE_SPOUSE">Employee + Spouse</option>
              <option value="EMPLOYEE_CHILDREN">Employee + Children</option>
              <option value="FAMILY">Family</option>
            </Select>
            <Input
              label="Number of Dependents"
              name="dependents"
              type="number"
              min="0"
              value={formData.dependents}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Cost Breakdown */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Cost Breakdown</h3>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Employee Contribution"
              name="employeeContribution"
              type="number"
              step="0.01"
              value={formData.employeeContribution}
              onChange={handleChange}
              required
              placeholder="0.00"
            />
            <Input
              label="Employer Contribution"
              name="employerContribution"
              type="number"
              step="0.01"
              value={formData.employerContribution}
              onChange={handleChange}
              required
              placeholder="0.00"
            />
          </div>
          
          {/* Total Cost Display */}
          {totalCost > 0 && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-blue-900">Total Monthly Cost:</span>
                <span className="text-xl font-bold text-blue-600">${totalCost.toFixed(2)}</span>
              </div>
            </div>
          )}
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
            placeholder="Add any special notes or requirements..."
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
              : enrollment
              ? 'Update Enrollment'
              : 'Create Enrollment'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
