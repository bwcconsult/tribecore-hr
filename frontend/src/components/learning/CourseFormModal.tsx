import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';
import { learningService, Course } from '../../services/learningService';
import { toast } from 'react-hot-toast';

interface CourseFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  course?: Course | null;
}

export default function CourseFormModal({ isOpen, onClose, course }: CourseFormModalProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'TECHNICAL',
    instructor: '',
    duration: '',
    level: 'BEGINNER',
    format: 'ONLINE',
    maxEnrollments: '',
    startDate: '',
    endDate: '',
    price: '',
    currency: 'USD',
    certificateOffered: true,
  });

  useEffect(() => {
    if (course) {
      setFormData({
        title: course.title || '',
        description: course.description || '',
        category: course.category || 'TECHNICAL',
        instructor: course.instructor || '',
        duration: course.duration?.toString() || '',
        level: course.level || 'BEGINNER',
        format: course.format || 'ONLINE',
        maxEnrollments: course.maxEnrollments?.toString() || '',
        startDate: course.startDate?.split('T')[0] || '',
        endDate: course.endDate?.split('T')[0] || '',
        price: course.price?.toString() || '',
        currency: course.currency || 'USD',
        certificateOffered: course.certificateOffered ?? true,
      });
    } else {
      const today = new Date().toISOString().split('T')[0];
      setFormData({
        title: '',
        description: '',
        category: 'TECHNICAL',
        instructor: '',
        duration: '',
        level: 'BEGINNER',
        format: 'ONLINE',
        maxEnrollments: '',
        startDate: today,
        endDate: '',
        price: '',
        currency: 'USD',
        certificateOffered: true,
      });
    }
  }, [course, isOpen]);

  const createMutation = useMutation({
    mutationFn: learningService.createCourse,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      toast.success('Course created successfully!');
      onClose();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create course');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Course> }) =>
      learningService.updateCourse(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      toast.success('Course updated successfully!');
      onClose();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update course');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const submitData = {
      ...formData,
      duration: parseFloat(formData.duration),
      maxEnrollments: formData.maxEnrollments ? parseInt(formData.maxEnrollments) : undefined,
      price: formData.price ? parseFloat(formData.price) : undefined,
      status: 'ACTIVE',
      currentEnrollments: 0,
    };

    if (course) {
      updateMutation.mutate({ id: course.id, data: submitData });
    } else {
      createMutation.mutate(submitData);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData({
        ...formData,
        [name]: checked,
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={course ? 'Edit Course' : 'Create New Course'}
      size="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Course Details</h3>
          <div className="space-y-4">
            <Input
              label="Course Title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              placeholder="e.g. Advanced JavaScript Development"
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Describe what students will learn in this course..."
              />
            </div>
          </div>
        </div>

        {/* Course Settings */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Course Settings</h3>
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
            >
              <option value="TECHNICAL">Technical Skills</option>
              <option value="LEADERSHIP">Leadership & Management</option>
              <option value="COMMUNICATION">Communication</option>
              <option value="COMPLIANCE">Compliance & Safety</option>
              <option value="PROFESSIONAL">Professional Development</option>
              <option value="SOFTWARE">Software & Tools</option>
              <option value="SALES">Sales & Marketing</option>
              <option value="OTHER">Other</option>
            </Select>
            <Select
              label="Level"
              name="level"
              value={formData.level}
              onChange={handleChange}
              required
            >
              <option value="BEGINNER">Beginner</option>
              <option value="INTERMEDIATE">Intermediate</option>
              <option value="ADVANCED">Advanced</option>
              <option value="EXPERT">Expert</option>
            </Select>
            <Select
              label="Format"
              name="format"
              value={formData.format}
              onChange={handleChange}
              required
            >
              <option value="ONLINE">Online</option>
              <option value="IN_PERSON">In-Person</option>
              <option value="HYBRID">Hybrid</option>
              <option value="SELF_PACED">Self-Paced</option>
            </Select>
            <Input
              label="Duration (hours)"
              name="duration"
              type="number"
              step="0.5"
              value={formData.duration}
              onChange={handleChange}
              required
              placeholder="e.g. 20"
            />
            <Input
              label="Instructor"
              name="instructor"
              value={formData.instructor}
              onChange={handleChange}
              placeholder="e.g. Jane Smith"
            />
            <Input
              label="Max Enrollments"
              name="maxEnrollments"
              type="number"
              value={formData.maxEnrollments}
              onChange={handleChange}
              placeholder="Optional"
            />
          </div>
        </div>

        {/* Schedule */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Schedule</h3>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Start Date"
              name="startDate"
              type="date"
              value={formData.startDate}
              onChange={handleChange}
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

        {/* Pricing */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Pricing (Optional)</h3>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Price"
              name="price"
              type="number"
              step="0.01"
              value={formData.price}
              onChange={handleChange}
              placeholder="0.00"
            />
            <Select
              label="Currency"
              name="currency"
              value={formData.currency}
              onChange={handleChange}
            >
              <option value="USD">USD</option>
              <option value="GBP">GBP</option>
              <option value="EUR">EUR</option>
              <option value="NGN">NGN</option>
            </Select>
          </div>
        </div>

        {/* Certificate */}
        <div>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="certificateOffered"
              checked={formData.certificateOffered}
              onChange={handleChange}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-gray-700">
              Offer certificate upon completion
            </span>
          </label>
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
              : course
              ? 'Update Course'
              : 'Create Course'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
