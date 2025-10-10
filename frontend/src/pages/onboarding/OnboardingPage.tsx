import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { Plus, CheckCircle, Clock, AlertCircle, Edit2, Trash2, User, Calendar, TrendingUp } from 'lucide-react';
import { onboardingService, Onboarding } from '../../services/onboardingService';
import OnboardingFormModal from '../../components/onboarding/OnboardingFormModal';
import { toast } from 'react-hot-toast';
import { formatDate } from '../../lib/utils';

export default function OnboardingPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOnboarding, setSelectedOnboarding] = useState<Onboarding | null>(null);

  const { data: onboardings, isLoading } = useQuery({
    queryKey: ['onboarding'],
    queryFn: () => onboardingService.getAll(),
  });

  const deleteMutation = useMutation({
    mutationFn: onboardingService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['onboarding'] });
      toast.success('Onboarding deleted successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete onboarding');
    },
  });

  const handleAdd = () => {
    setSelectedOnboarding(null);
    setIsModalOpen(true);
  };

  const handleEdit = (onboarding: Onboarding) => {
    setSelectedOnboarding(onboarding);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this onboarding workflow?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedOnboarding(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800';
      case 'ON_HOLD':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Onboarding</h1>
          <p className="text-gray-600 mt-1">Manage employee onboarding workflows</p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="h-4 w-4 mr-2" />
          Start Onboarding
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
        {[
          { title: 'In Progress', count: 5, icon: Clock, color: 'text-blue-600', bg: 'bg-blue-50' },
          { title: 'Completed', count: 23, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
          { title: 'Overdue', count: 2, icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50' },
          { title: 'Avg Completion', count: '12 days', icon: Clock, color: 'text-purple-600', bg: 'bg-purple-50' },
        ].map((stat) => (
          <Card key={stat.title}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">{stat.count}</p>
                </div>
                <div className={`${stat.bg} p-3 rounded-lg`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Active Onboarding Workflows</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-center py-8 text-gray-500">Loading...</p>
          ) : onboardings?.data?.length === 0 ? (
            <div className="text-center py-12">
              <User className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No onboarding workflows</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by creating a new employee onboarding.</p>
              <div className="mt-6">
                <Button onClick={handleAdd}>
                  <Plus className="h-4 w-4 mr-2" />
                  Start Onboarding
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {onboardings?.data?.map((onboarding: Onboarding) => (
                <div key={onboarding.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {onboarding.employeeName || `Employee ${onboarding.employeeId}`}
                        </h3>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(onboarding.status)}`}>
                          {onboarding.status.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          Started: {formatDate(onboarding.startDate)}
                        </span>
                        {onboarding.endDate && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            Due: {formatDate(onboarding.endDate)}
                          </span>
                        )}
                        {onboarding.mentorName && (
                          <span className="flex items-center gap-1">
                            <User className="h-4 w-4" />
                            Mentor: {onboarding.mentorName}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(onboarding)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(onboarding.id)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Progress Section */}
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Onboarding Progress</span>
                      <span className="text-sm font-semibold text-blue-600">{onboarding.progress || 0}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className={`h-3 rounded-full transition-all duration-300 ${
                          (onboarding.progress || 0) === 100 
                            ? 'bg-green-600' 
                            : (onboarding.progress || 0) > 50 
                            ? 'bg-blue-600' 
                            : 'bg-yellow-500'
                        }`}
                        style={{ width: `${onboarding.progress || 0}%` }}
                      />
                    </div>
                  </div>

                  {/* Checklist Summary */}
                  {onboarding.checklist && onboarding.checklist.length > 0 && (
                    <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle className="h-4 w-4" />
                      <span>
                        {onboarding.checklist.filter(item => item.completed).length} of {onboarding.checklist.length} tasks completed
                      </span>
                    </div>
                  )}

                  {/* Notes Preview */}
                  {onboarding.notes && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600 line-clamp-2">
                        <span className="font-medium">Notes:</span> {onboarding.notes}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <OnboardingFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onboarding={selectedOnboarding}
      />
    </div>
  );
}
