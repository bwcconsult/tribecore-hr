import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import Button from '../ui/Button';
import { X, Save } from 'lucide-react';
import payslipService, { EarningCode } from '../../services/payslipService';
import { toast } from 'react-hot-toast';

interface EarningCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  code?: EarningCode;
  mode: 'create' | 'edit';
}

export default function EarningCodeModal({ isOpen, onClose, code, mode }: EarningCodeModalProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    code: '',
    label: '',
    description: '',
    countries: [] as string[],
    taxable: true,
    niable: false,
    pensionable: true,
    isBonusType: false,
    isOvertimeType: false,
    defaultUnits: 'period',
    isActive: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (code && mode === 'edit') {
      setFormData({
        code: code.code,
        label: code.label,
        description: code.description || '',
        countries: code.countries || [],
        taxable: code.taxable,
        niable: code.niable,
        pensionable: code.pensionable,
        isBonusType: code.isBonusType,
        isOvertimeType: code.isOvertimeType,
        defaultUnits: code.defaultUnits || 'period',
        isActive: code.isActive,
      });
    } else {
      resetForm();
    }
  }, [code, mode]);

  const resetForm = () => {
    setFormData({
      code: '',
      label: '',
      description: '',
      countries: [],
      taxable: true,
      niable: false,
      pensionable: true,
      isBonusType: false,
      isOvertimeType: false,
      defaultUnits: 'period',
      isActive: true,
    });
    setErrors({});
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.code.trim()) {
      newErrors.code = 'Code is required';
    } else if (!/^[A-Z0-9_]+$/.test(formData.code)) {
      newErrors.code = 'Code must be uppercase letters, numbers, and underscores only';
    }

    if (!formData.label.trim()) {
      newErrors.label = 'Label is required';
    }

    if (formData.countries.length === 0) {
      newErrors.countries = 'At least one country must be selected';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const createMutation = useMutation({
    mutationFn: (data: Partial<EarningCode>) => payslipService.createEarningCode(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['earning-codes'] });
      toast.success('Earning code created successfully!');
      onClose();
      resetForm();
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create earning code');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      toast.error('Please fix the errors before submitting');
      return;
    }

    createMutation.mutate(formData);
  };

  const handleCountryToggle = (country: string) => {
    setFormData(prev => ({
      ...prev,
      countries: prev.countries.includes(country)
        ? prev.countries.filter(c => c !== country)
        : [...prev.countries, country],
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            {mode === 'create' ? 'Add Earning Code' : 'Edit Earning Code'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            {/* Code */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                placeholder="e.g., BASE, OT1, BONUS"
                disabled={mode === 'edit'}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 font-mono ${
                  errors.code ? 'border-red-500' : 'border-gray-300'
                } ${mode === 'edit' ? 'bg-gray-100' : ''}`}
              />
              {errors.code && <p className="mt-1 text-sm text-red-500">{errors.code}</p>}
            </div>

            {/* Label */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Label <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.label}
                onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                placeholder="e.g., Base Salary, Overtime 1.5x"
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                  errors.label ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.label && <p className="mt-1 text-sm text-red-500">{errors.label}</p>}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Optional description"
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            {/* Countries */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Countries <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                {['UK', 'US', 'NG', 'ZA'].map((country) => (
                  <label key={country} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.countries.includes(country)}
                      onChange={() => handleCountryToggle(country)}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-700">
                      {country === 'UK' && 'United Kingdom'}
                      {country === 'US' && 'United States'}
                      {country === 'NG' && 'Nigeria'}
                      {country === 'ZA' && 'South Africa'}
                    </span>
                  </label>
                ))}
              </div>
              {errors.countries && <p className="mt-1 text-sm text-red-500">{errors.countries}</p>}
            </div>

            {/* Default Units */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Default Units
              </label>
              <select
                value={formData.defaultUnits}
                onChange={(e) => setFormData({ ...formData, defaultUnits: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="period">Period</option>
                <option value="hour">Hour</option>
                <option value="day">Day</option>
                <option value="piece">Piece</option>
              </select>
            </div>

            {/* Flags */}
            <div className="space-y-3">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.taxable}
                  onChange={(e) => setFormData({ ...formData, taxable: e.target.checked })}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <div>
                  <span className="text-sm font-medium text-gray-700">Taxable</span>
                  <p className="text-xs text-gray-500">Subject to income tax</p>
                </div>
              </label>

              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.niable}
                  onChange={(e) => setFormData({ ...formData, niable: e.target.checked })}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <div>
                  <span className="text-sm font-medium text-gray-700">NIable/FICA</span>
                  <p className="text-xs text-gray-500">Subject to National Insurance or FICA</p>
                </div>
              </label>

              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.pensionable}
                  onChange={(e) => setFormData({ ...formData, pensionable: e.target.checked })}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <div>
                  <span className="text-sm font-medium text-gray-700">Pensionable</span>
                  <p className="text-xs text-gray-500">Included in pension calculations</p>
                </div>
              </label>

              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isBonusType}
                  onChange={(e) => setFormData({ ...formData, isBonusType: e.target.checked })}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <div>
                  <span className="text-sm font-medium text-gray-700">Bonus Type</span>
                  <p className="text-xs text-gray-500">Treated as supplemental wages</p>
                </div>
              </label>

              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isOvertimeType}
                  onChange={(e) => setFormData({ ...formData, isOvertimeType: e.target.checked })}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <div>
                  <span className="text-sm font-medium text-gray-700">Overtime Type</span>
                  <p className="text-xs text-gray-500">Calculated with overtime multiplier</p>
                </div>
              </label>

              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <div>
                  <span className="text-sm font-medium text-gray-700">Active</span>
                  <p className="text-xs text-gray-500">Available for use in payslips</p>
                </div>
              </label>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 mt-8 pt-6 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={createMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {mode === 'create' ? 'Create Code' : 'Save Changes'}
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
