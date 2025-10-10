import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';
import { recruitmentService, Job } from '../../services/recruitmentService';
import { toast } from 'react-hot-toast';

interface JobFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  job?: Job | null;
}

export default function JobFormModal({ isOpen, onClose, job }: JobFormModalProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    title: '',
    department: '',
    description: '',
    requirements: '',
    responsibilities: '',
    employmentType: 'FULL_TIME',
    location: '',
    minSalary: '',
    maxSalary: '',
    currency: 'USD',
    status: 'OPEN',
    closingDate: '',
    openings: '1',
  });

  useEffect(() => {
    if (job) {
      setFormData({
        title: job.title || '',
        department: job.department || '',
        description: job.description || '',
        requirements: job.requirements || '',
        responsibilities: job.responsibilities || '',
        employmentType: job.employmentType || 'FULL_TIME',
        location: job.location || '',
        minSalary: job.minSalary?.toString() || '',
        maxSalary: job.maxSalary?.toString() || '',
        currency: job.currency || 'USD',
        status: job.status || 'OPEN',
        closingDate: job.closingDate?.split('T')[0] || '',
        openings: job.openings?.toString() || '1',
      });
    } else {
      setFormData({
        title: '',
        department: '',
        description: '',
        requirements: '',
        responsibilities: '',
        employmentType: 'FULL_TIME',
        location: '',
        minSalary: '',
        maxSalary: '',
        currency: 'USD',
        status: 'OPEN',
        closingDate: '',
        openings: '1',
      });
    }
  }, [job, isOpen]);

  const createMutation = useMutation({
    mutationFn: recruitmentService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      toast.success('Job posted successfully!');
      onClose();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to post job');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Job> }) =>
      recruitmentService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      toast.success('Job updated successfully!');
      onClose();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update job');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const submitData = {
      ...formData,
      minSalary: parseFloat(formData.minSalary),
      maxSalary: parseFloat(formData.maxSalary),
      openings: parseInt(formData.openings),
    };

    if (job) {
      updateMutation.mutate({ id: job.id, data: submitData });
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

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={job ? 'Edit Job Posting' : 'Post New Job'}
      size="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Job Title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              placeholder="e.g. Senior Software Engineer"
            />
            <Input
              label="Department"
              name="department"
              value={formData.department}
              onChange={handleChange}
              required
              placeholder="e.g. Engineering"
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
              <option value="INTERN">Internship</option>
            </Select>
            <Input
              label="Location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              required
              placeholder="e.g. New York, Remote"
            />
            <Input
              label="Number of Openings"
              name="openings"
              type="number"
              value={formData.openings}
              onChange={handleChange}
              required
              min="1"
            />
            <Select
              label="Status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              required
            >
              <option value="DRAFT">Draft</option>
              <option value="OPEN">Open</option>
              <option value="CLOSED">Closed</option>
              <option value="ON_HOLD">On Hold</option>
            </Select>
          </div>
        </div>

        {/* Job Description */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Job Details</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Describe the role, company culture, and what makes this position exciting..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Requirements *
              </label>
              <textarea
                name="requirements"
                value={formData.requirements}
                onChange={handleChange}
                required
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="List required skills, experience, education, certifications..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Responsibilities
              </label>
              <textarea
                name="responsibilities"
                value={formData.responsibilities}
                onChange={handleChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="What will this person be doing day-to-day?..."
              />
            </div>
          </div>
        </div>

        {/* Compensation */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Compensation</h3>
          <div className="grid grid-cols-3 gap-4">
            <Input
              label="Minimum Salary"
              name="minSalary"
              type="number"
              value={formData.minSalary}
              onChange={handleChange}
              required
              min="0"
            />
            <Input
              label="Maximum Salary"
              name="maxSalary"
              type="number"
              value={formData.maxSalary}
              onChange={handleChange}
              required
              min="0"
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
              <option value="NGN">NGN</option>
              <option value="EUR">EUR</option>
            </Select>
          </div>
        </div>

        {/* Additional Details */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Additional Details</h3>
          <div className="grid grid-cols-1 gap-4">
            <Input
              label="Closing Date"
              name="closingDate"
              type="date"
              value={formData.closingDate}
              onChange={handleChange}
            />
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
              : job
              ? 'Update Job'
              : 'Post Job'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
