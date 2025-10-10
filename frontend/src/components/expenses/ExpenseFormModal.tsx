import { useState, useEffect, useRef } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';
import { expensesService, Expense } from '../../services/expensesService';
import { employeeService } from '../../services/employeeService';
import { toast } from 'react-hot-toast';
import { Upload, File, X } from 'lucide-react';

interface ExpenseFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  expense?: Expense | null;
}

export default function ExpenseFormModal({ isOpen, onClose, expense }: ExpenseFormModalProps) {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    employeeId: '',
    category: 'TRAVEL',
    amount: '',
    currency: 'USD',
    date: '',
    merchant: '',
    description: '',
    paymentMethod: 'PERSONAL_CARD',
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Fetch employees
  const { data: employeesData } = useQuery({
    queryKey: ['employees'],
    queryFn: () => employeeService.getAll({ limit: 100 }),
  });

  useEffect(() => {
    if (expense) {
      setFormData({
        employeeId: expense.employeeId || '',
        category: expense.category || 'TRAVEL',
        amount: expense.amount?.toString() || '',
        currency: expense.currency || 'USD',
        date: expense.date?.split('T')[0] || '',
        merchant: expense.merchant || '',
        description: expense.description || '',
        paymentMethod: expense.paymentMethod || 'PERSONAL_CARD',
      });
    } else {
      const today = new Date().toISOString().split('T')[0];
      setFormData({
        employeeId: '',
        category: 'TRAVEL',
        amount: '',
        currency: 'USD',
        date: today,
        merchant: '',
        description: '',
        paymentMethod: 'PERSONAL_CARD',
      });
    }
    setSelectedFile(null);
  }, [expense, isOpen]);

  const createMutation = useMutation({
    mutationFn: expensesService.create,
    onSuccess: async (data) => {
      // Upload receipt if selected
      if (selectedFile) {
        try {
          await expensesService.uploadReceipt(data.id, selectedFile);
        } catch (error) {
          console.error('Failed to upload receipt:', error);
        }
      }
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      toast.success('Expense created successfully!');
      onClose();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create expense');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Expense> }) =>
      expensesService.update(id, data),
    onSuccess: async (data) => {
      // Upload receipt if selected
      if (selectedFile) {
        try {
          await expensesService.uploadReceipt(data.id, selectedFile);
        } catch (error) {
          console.error('Failed to upload receipt:', error);
        }
      }
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      toast.success('Expense updated successfully!');
      onClose();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update expense');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const submitData = {
      ...formData,
      amount: parseFloat(formData.amount),
      status: 'PENDING',
    };

    if (expense) {
      updateMutation.mutate({ id: expense.id, data: submitData });
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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const employees = employeesData?.data || [];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={expense ? 'Edit Expense' : 'Submit New Expense'}
      size="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Expense Details</h3>
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
            <Select
              label="Category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
            >
              <option value="TRAVEL">Travel</option>
              <option value="MEALS">Meals & Entertainment</option>
              <option value="ACCOMMODATION">Accommodation</option>
              <option value="TRANSPORTATION">Transportation</option>
              <option value="OFFICE_SUPPLIES">Office Supplies</option>
              <option value="EQUIPMENT">Equipment</option>
              <option value="SOFTWARE">Software & Subscriptions</option>
              <option value="TRAINING">Training & Education</option>
              <option value="MARKETING">Marketing</option>
              <option value="CLIENT_EXPENSES">Client Expenses</option>
              <option value="OTHER">Other</option>
            </Select>
            <Input
              label="Date"
              name="date"
              type="date"
              value={formData.date}
              onChange={handleChange}
              required
            />
            <Input
              label="Merchant/Vendor"
              name="merchant"
              value={formData.merchant}
              onChange={handleChange}
              placeholder="e.g. Uber, Amazon, Hotel Name"
            />
          </div>
        </div>

        {/* Amount */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Amount</h3>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Amount"
              name="amount"
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={handleChange}
              required
              placeholder="0.00"
            />
            <Select
              label="Currency"
              name="currency"
              value={formData.currency}
              onChange={handleChange}
              required
            >
              <option value="USD">USD</option>
              <option value="GBP">GBP</option>
              <option value="EUR">EUR</option>
              <option value="NGN">NGN</option>
            </Select>
          </div>
        </div>

        {/* Description */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Description</h3>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Provide details about this expense (purpose, attendees, etc.)..."
          />
        </div>

        {/* Receipt Upload */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Receipt</h3>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
            {!selectedFile && !expense?.receiptUrl ? (
              <div className="text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="mt-4">
                  <label htmlFor="receipt-upload" className="cursor-pointer">
                    <span className="mt-2 block text-sm font-medium text-gray-900">
                      Upload Receipt
                    </span>
                    <span className="mt-1 block text-xs text-gray-500">
                      PNG, JPG, PDF up to 5MB
                    </span>
                  </label>
                  <input
                    ref={fileInputRef}
                    id="receipt-upload"
                    type="file"
                    className="hidden"
                    accept="image/*,.pdf"
                    onChange={handleFileSelect}
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  className="mt-4"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Choose File
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <File className="h-8 w-8 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {selectedFile?.name || 'Receipt uploaded'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {selectedFile ? `${(selectedFile.size / 1024).toFixed(2)} KB` : 'View receipt'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveFile}
                  className="text-red-600 hover:text-red-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Payment Method */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Payment Method</h3>
          <Select
            label="Paid With"
            name="paymentMethod"
            value={formData.paymentMethod}
            onChange={handleChange}
            required
          >
            <option value="PERSONAL_CARD">Personal Credit Card</option>
            <option value="COMPANY_CARD">Company Credit Card</option>
            <option value="CASH">Cash</option>
            <option value="BANK_TRANSFER">Bank Transfer</option>
          </Select>
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
              : expense
              ? 'Update Expense'
              : 'Submit Expense'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
