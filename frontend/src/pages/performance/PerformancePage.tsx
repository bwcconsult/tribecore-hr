import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { Plus, Edit2, Trash2, Send, CheckCircle, Star, TrendingUp, Users, Award } from 'lucide-react';
import { performanceService, PerformanceReview } from '../../services/performanceService';
import PerformanceFormModal from '../../components/performance/PerformanceFormModal';
import { toast } from 'react-hot-toast';
import { formatDate } from '../../lib/utils';

export default function PerformancePage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState<PerformanceReview | null>(null);

  const { data: reviews, isLoading } = useQuery({
    queryKey: ['performance'],
    queryFn: () => performanceService.getAll(),
  });

  const deleteMutation = useMutation({
    mutationFn: performanceService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['performance'] });
      toast.success('Performance review deleted successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete review');
    },
  });

  const submitMutation = useMutation({
    mutationFn: performanceService.submit,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['performance'] });
      toast.success('Performance review submitted!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to submit review');
    },
  });

  const completeMutation = useMutation({
    mutationFn: performanceService.complete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['performance'] });
      toast.success('Performance review marked as completed!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to complete review');
    },
  });

  const handleAdd = () => {
    setSelectedReview(null);
    setIsModalOpen(true);
  };

  const handleEdit = (review: PerformanceReview) => {
    setSelectedReview(review);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this performance review?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleSubmit = (id: string) => {
    if (window.confirm('Submit this review? The employee will be able to view it.')) {
      submitMutation.mutate(id);
    }
  };

  const handleComplete = (id: string) => {
    if (window.confirm('Mark this review as completed?')) {
      completeMutation.mutate(id);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedReview(null);
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return 'text-green-600';
    if (rating >= 3.5) return 'text-blue-600';
    if (rating >= 2.5) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getRatingLabel = (rating: number) => {
    if (rating >= 4.5) return 'Excellent';
    if (rating >= 3.5) return 'Good';
    if (rating >= 2.5) return 'Satisfactory';
    return 'Needs Improvement';
  };

  // Calculate stats
  const calculateStats = () => {
    const reviewsList = reviews?.data || [];
    
    const totalReviews = reviewsList.length;
    const completed = reviewsList.filter((r: PerformanceReview) => r.status === 'COMPLETED').length;
    const avgRating = reviewsList.length > 0
      ? (reviewsList.reduce((sum: number, r: PerformanceReview) => sum + (r.overallRating || 0), 0) / reviewsList.length)
      : 0;
    const excellentPerformers = reviewsList.filter((r: PerformanceReview) => r.overallRating >= 4.5).length;

    return { totalReviews, completed, avgRating: avgRating.toFixed(1), excellentPerformers };
  };

  const stats = calculateStats();

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= Math.round(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Performance Management</h1>
          <p className="text-gray-600 mt-1">Track and manage employee performance reviews</p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="h-4 w-4 mr-2" />
          New Review
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
        {[
          { title: 'Total Reviews', value: stats.totalReviews, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
          { title: 'Completed', value: stats.completed, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
          { title: 'Average Rating', value: `${stats.avgRating}/5.0`, icon: Star, color: 'text-yellow-600', bg: 'bg-yellow-50' },
          { title: 'Top Performers', value: stats.excellentPerformers, icon: Award, color: 'text-purple-600', bg: 'bg-purple-50' },
        ].map((stat) => (
          <Card key={stat.title}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
                </div>
                <div className={`${stat.bg} p-3 rounded-lg`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Performance Reviews Table */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Reviews</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-center py-8 text-gray-500">Loading...</p>
          ) : reviews?.data?.length === 0 ? (
            <div className="text-center py-12">
              <TrendingUp className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No performance reviews</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by creating a performance review.</p>
              <div className="mt-6">
                <Button onClick={handleAdd}>
                  <Plus className="h-4 w-4 mr-2" />
                  New Review
                </Button>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b">
                  <tr className="text-left text-sm text-gray-500">
                    <th className="pb-3 font-medium">Employee</th>
                    <th className="pb-3 font-medium">Reviewer</th>
                    <th className="pb-3 font-medium">Review Period</th>
                    <th className="pb-3 font-medium">Overall Rating</th>
                    <th className="pb-3 font-medium">Performance</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {reviews?.data?.map((review: PerformanceReview) => (
                    <tr key={review.id} className="border-b last:border-0">
                      <td className="py-4 text-sm font-medium">
                        {review.employeeName || 'Unknown'}
                      </td>
                      <td className="py-4 text-sm">
                        {review.reviewerName || 'Unknown'}
                      </td>
                      <td className="py-4 text-sm">
                        {formatDate(review.reviewPeriodStart)} - {formatDate(review.reviewPeriodEnd)}
                      </td>
                      <td className="py-4">
                        <div className="flex items-center gap-2">
                          {renderStars(review.overallRating)}
                          <span className={`text-sm font-bold ${getRatingColor(review.overallRating)}`}>
                            {review.overallRating.toFixed(1)}
                          </span>
                        </div>
                      </td>
                      <td className="py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          review.overallRating >= 4.5 ? 'bg-green-100 text-green-800' :
                          review.overallRating >= 3.5 ? 'bg-blue-100 text-blue-800' :
                          review.overallRating >= 2.5 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {getRatingLabel(review.overallRating)}
                        </span>
                      </td>
                      <td className="py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          review.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                          review.status === 'SUBMITTED' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {review.status}
                        </span>
                      </td>
                      <td className="py-4">
                        <div className="flex gap-2">
                          {review.status === 'DRAFT' && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleSubmit(review.id)}
                                disabled={submitMutation.isPending}
                                className="text-blue-600 hover:text-blue-700"
                                title="Submit"
                              >
                                <Send className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEdit(review)}
                                title="Edit"
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                          {review.status === 'SUBMITTED' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleComplete(review.id)}
                              disabled={completeMutation.isPending}
                              className="text-green-600 hover:text-green-700"
                              title="Mark as Completed"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(review.id)}
                            disabled={deleteMutation.isPending}
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <PerformanceFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        review={selectedReview}
      />
    </div>
  );
}
