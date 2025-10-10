import { useState, useEffect } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';
import { performanceService, PerformanceReview } from '../../services/performanceService';
import { employeeService } from '../../services/employeeService';
import { toast } from 'react-hot-toast';
import { Star } from 'lucide-react';

interface PerformanceFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  review?: PerformanceReview | null;
}

export default function PerformanceFormModal({ isOpen, onClose, review }: PerformanceFormModalProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    employeeId: '',
    reviewerId: '',
    reviewPeriodStart: '',
    reviewPeriodEnd: '',
    reviewDate: '',
    technicalSkills: '3',
    communication: '3',
    teamwork: '3',
    leadership: '3',
    problemSolving: '3',
    productivity: '3',
    strengths: '',
    areasForImprovement: '',
    goals: '',
    comments: '',
  });

  // Fetch employees
  const { data: employeesData } = useQuery({
    queryKey: ['employees'],
    queryFn: () => employeeService.getAll({ limit: 100 }),
  });

  useEffect(() => {
    if (review) {
      setFormData({
        employeeId: review.employeeId || '',
        reviewerId: review.reviewerId || '',
        reviewPeriodStart: review.reviewPeriodStart?.split('T')[0] || '',
        reviewPeriodEnd: review.reviewPeriodEnd?.split('T')[0] || '',
        reviewDate: review.reviewDate?.split('T')[0] || '',
        technicalSkills: review.technicalSkills?.toString() || '3',
        communication: review.communication?.toString() || '3',
        teamwork: review.teamwork?.toString() || '3',
        leadership: review.leadership?.toString() || '3',
        problemSolving: review.problemSolving?.toString() || '3',
        productivity: review.productivity?.toString() || '3',
        strengths: review.strengths || '',
        areasForImprovement: review.areasForImprovement || '',
        goals: review.goals || '',
        comments: review.comments || '',
      });
    } else {
      const today = new Date().toISOString().split('T')[0];
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      
      setFormData({
        employeeId: '',
        reviewerId: '',
        reviewPeriodStart: sixMonthsAgo.toISOString().split('T')[0],
        reviewPeriodEnd: today,
        reviewDate: today,
        technicalSkills: '3',
        communication: '3',
        teamwork: '3',
        leadership: '3',
        problemSolving: '3',
        productivity: '3',
        strengths: '',
        areasForImprovement: '',
        goals: '',
        comments: '',
      });
    }
  }, [review, isOpen]);

  const createMutation = useMutation({
    mutationFn: performanceService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['performance'] });
      toast.success('Performance review created successfully!');
      onClose();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create review');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<PerformanceReview> }) =>
      performanceService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['performance'] });
      toast.success('Performance review updated successfully!');
      onClose();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update review');
    },
  });

  const calculateOverallRating = () => {
    const ratings = [
      parseFloat(formData.technicalSkills),
      parseFloat(formData.communication),
      parseFloat(formData.teamwork),
      parseFloat(formData.leadership),
      parseFloat(formData.problemSolving),
      parseFloat(formData.productivity),
    ];
    const sum = ratings.reduce((a, b) => a + b, 0);
    return (sum / ratings.length).toFixed(1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const overallRating = parseFloat(calculateOverallRating());
    
    const submitData = {
      ...formData,
      technicalSkills: parseFloat(formData.technicalSkills),
      communication: parseFloat(formData.communication),
      teamwork: parseFloat(formData.teamwork),
      leadership: parseFloat(formData.leadership),
      problemSolving: parseFloat(formData.problemSolving),
      productivity: parseFloat(formData.productivity),
      overallRating,
      status: 'DRAFT',
    };

    if (review) {
      updateMutation.mutate({ id: review.id, data: submitData });
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

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-5 w-5 ${
              star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const employees = employeesData?.data || [];
  const overallRating = parseFloat(calculateOverallRating());

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={review ? 'Edit Performance Review' : 'New Performance Review'}
      size="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Review Details</h3>
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
              label="Reviewer"
              name="reviewerId"
              value={formData.reviewerId}
              onChange={handleChange}
              required
            >
              <option value="">Select Reviewer</option>
              {employees.map((emp: any) => (
                <option key={emp.id} value={emp.id}>
                  {emp.firstName} {emp.lastName}
                </option>
              ))}
            </Select>
            <Input
              label="Review Period Start"
              name="reviewPeriodStart"
              type="date"
              value={formData.reviewPeriodStart}
              onChange={handleChange}
              required
            />
            <Input
              label="Review Period End"
              name="reviewPeriodEnd"
              type="date"
              value={formData.reviewPeriodEnd}
              onChange={handleChange}
              required
            />
            <Input
              label="Review Date"
              name="reviewDate"
              type="date"
              value={formData.reviewDate}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        {/* Performance Ratings */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Performance Ratings (1-5)</h3>
          <div className="space-y-4">
            {[
              { name: 'technicalSkills', label: 'Technical Skills' },
              { name: 'communication', label: 'Communication' },
              { name: 'teamwork', label: 'Teamwork & Collaboration' },
              { name: 'leadership', label: 'Leadership' },
              { name: 'problemSolving', label: 'Problem Solving' },
              { name: 'productivity', label: 'Productivity' },
            ].map((field) => (
              <div key={field.name} className="grid grid-cols-3 gap-4 items-center">
                <label className="text-sm font-medium text-gray-700">{field.label}</label>
                <input
                  type="range"
                  name={field.name}
                  min="1"
                  max="5"
                  step="0.5"
                  value={formData[field.name as keyof typeof formData]}
                  onChange={handleChange}
                  className="w-full"
                />
                <div className="flex items-center gap-2">
                  {renderStars(parseFloat(formData[field.name as keyof typeof formData] as string))}
                  <span className="text-sm font-semibold text-gray-900">
                    {formData[field.name as keyof typeof formData]}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Overall Rating Display */}
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-blue-900">Overall Rating:</span>
            <div className="flex items-center gap-3">
              {renderStars(Math.round(overallRating))}
              <span className="text-2xl font-bold text-blue-600">{overallRating}/5.0</span>
            </div>
          </div>
        </div>

        {/* Qualitative Feedback */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Feedback</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Strengths
              </label>
              <textarea
                name="strengths"
                value={formData.strengths}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="What does this employee do well?"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Areas for Improvement
              </label>
              <textarea
                name="areasForImprovement"
                value={formData.areasForImprovement}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="What areas need development?"
              />
            </div>
          </div>
        </div>

        {/* Goals */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Goals & Development Plan</h3>
          <textarea
            name="goals"
            value={formData.goals}
            onChange={handleChange}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Set goals for the next review period..."
          />
        </div>

        {/* Additional Comments */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Additional Comments</h3>
          <textarea
            name="comments"
            value={formData.comments}
            onChange={handleChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Any additional notes or observations..."
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
              : review
              ? 'Update Review'
              : 'Create Review'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
