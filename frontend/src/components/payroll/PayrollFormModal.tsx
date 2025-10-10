import { useState, useEffect } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';
import { payrollService, Payroll } from '../../services/payrollService';
import { employeeService } from '../../services/employeeService';
import { toast } from 'react-hot-toast';

interface PayrollFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  payroll?: Payroll | null;
}

export default function PayrollFormModal({ isOpen, onClose, payroll }: PayrollFormModalProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    employeeId: '',
    payPeriodStart: '',
    payPeriodEnd: '',
    baseSalary: '',
    bonuses: '0',
    overtime: '0',
    taxDeduction: '0',
    insuranceDeduction: '0',
    otherDeductions: '0',
    currency: 'USD',
    payDate: '',
    paymentMethod: 'BANK_TRANSFER',
    notes: '',
  });

  // Fetch employees
  const { data: employeesData } = useQuery({
    queryKey: ['employees'],
    queryFn: () => employeeService.getAll({ limit: 100 }),
  });

  useEffect(() => {
    if (payroll) {
      setFormData({
        employeeId: payroll.employeeId || '',
        payPeriodStart: payroll.payPeriodStart?.split('T')[0] || '',
        payPeriodEnd: payroll.payPeriodEnd?.split('T')[0] || '',
        baseSalary: payroll.baseSalary?.toString() || '',
        bonuses: payroll.bonuses?.toString() || '0',
        overtime: payroll.overtime?.toString() || '0',
        taxDeduction: payroll.taxDeduction?.toString() || '0',
        insuranceDeduction: payroll.insuranceDeduction?.toString() || '0',
        otherDeductions: payroll.otherDeductions?.toString() || '0',
        currency: payroll.currency || 'USD',
        payDate: payroll.payDate?.split('T')[0] || '',
        paymentMethod: payroll.paymentMethod || 'BANK_TRANSFER',
        notes: payroll.notes || '',
      });
    } else {
      const today = new Date().toISOString().split('T')[0];
      setFormData({
        employeeId: '',
        payPeriodStart: today,
        payPeriodEnd: today,
        baseSalary: '',
        bonuses: '0',
        overtime: '0',
        taxDeduction: '0',
        insuranceDeduction: '0',
        otherDeductions: '0',
        currency: 'USD',
        payDate: today,
        paymentMethod: 'BANK_TRANSFER',
        notes: '',
      });
    }
  }, [payroll, isOpen]);

  const createMutation = useMutation({
    mutationFn: payrollService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payroll'] });
      toast.success('Payroll record created successfully!');
      onClose();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create payroll record');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Payroll> }) =>
      payrollService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payroll'] });
      toast.success('Payroll record updated successfully!');
      onClose();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update payroll record');
    },
  });

  const calculateAmounts = () => {
    const base = parseFloat(formData.baseSalary) || 0;
    const bonus = parseFloat(formData.bonuses) || 0;
    const ot = parseFloat(formData.overtime) || 0;
    const tax = parseFloat(formData.taxDeduction) || 0;
    const insurance = parseFloat(formData.insuranceDeduction) || 0;
    const other = parseFloat(formData.otherDeductions) || 0;

    const grossPay = base + bonus + ot;
    const totalDeductions = tax + insurance + other;
    const netPay = grossPay - totalDeductions;

    return { grossPay, totalDeductions, netPay };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const { grossPay, totalDeductions, netPay } = calculateAmounts();
    
    const submitData = {
      ...formData,
      baseSalary: parseFloat(formData.baseSalary),
      bonuses: parseFloat(formData.bonuses),
      overtime: parseFloat(formData.overtime),
      taxDeduction: parseFloat(formData.taxDeduction),
      insuranceDeduction: parseFloat(formData.insuranceDeduction),
      otherDeductions: parseFloat(formData.otherDeductions),
      grossPay,
      totalDeductions,
      netPay,
      status: 'DRAFT',
    };

    if (payroll) {
      updateMutation.mutate({ id: payroll.id, data: submitData });
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
  const { grossPay, totalDeductions, netPay } = calculateAmounts();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={payroll ? 'Edit Payroll Record' : 'Create Payroll Record'}
      size="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Employee & Period */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Employee & Pay Period</h3>
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
              label="Currency"
              name="currency"
              value={formData.currency}
              onChange={handleChange}
              required
            />
            <Input
              label="Pay Period Start"
              name="payPeriodStart"
              type="date"
              value={formData.payPeriodStart}
              onChange={handleChange}
              required
            />
            <Input
              label="Pay Period End"
              name="payPeriodEnd"
              type="date"
              value={formData.payPeriodEnd}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        {/* Earnings */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Earnings</h3>
          <div className="grid grid-cols-3 gap-4">
            <Input
              label="Base Salary"
              name="baseSalary"
              type="number"
              step="0.01"
              value={formData.baseSalary}
              onChange={handleChange}
              required
            />
            <Input
              label="Bonuses"
              name="bonuses"
              type="number"
              step="0.01"
              value={formData.bonuses}
              onChange={handleChange}
            />
            <Input
              label="Overtime Pay"
              name="overtime"
              type="number"
              step="0.01"
              value={formData.overtime}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Deductions */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Deductions</h3>
          <div className="grid grid-cols-3 gap-4">
            <Input
              label="Tax Deduction"
              name="taxDeduction"
              type="number"
              step="0.01"
              value={formData.taxDeduction}
              onChange={handleChange}
            />
            <Input
              label="Insurance"
              name="insuranceDeduction"
              type="number"
              step="0.01"
              value={formData.insuranceDeduction}
              onChange={handleChange}
            />
            <Input
              label="Other Deductions"
              name="otherDeductions"
              type="number"
              step="0.01"
              value={formData.otherDeductions}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Summary */}
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <h3 className="text-lg font-semibold mb-3 text-blue-900">Payment Summary</h3>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-blue-700">Gross Pay</p>
              <p className="text-xl font-bold text-blue-900">{formData.currency} {grossPay.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm text-blue-700">Total Deductions</p>
              <p className="text-xl font-bold text-red-600">-{formData.currency} {totalDeductions.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm text-blue-700">Net Pay</p>
              <p className="text-2xl font-bold text-green-600">{formData.currency} {netPay.toFixed(2)}</p>
            </div>
          </div>
        </div>

        {/* Payment Details */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Payment Details</h3>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Payment Date"
              name="payDate"
              type="date"
              value={formData.payDate}
              onChange={handleChange}
              required
            />
            <Select
              label="Payment Method"
              name="paymentMethod"
              value={formData.paymentMethod}
              onChange={handleChange}
              required
            >
              <option value="BANK_TRANSFER">Bank Transfer</option>
              <option value="CHECK">Check</option>
              <option value="CASH">Cash</option>
              <option value="DIRECT_DEPOSIT">Direct Deposit</option>
            </Select>
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notes
          </label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Add any additional notes..."
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
              : payroll
              ? 'Update Payroll'
              : 'Create Payroll'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
