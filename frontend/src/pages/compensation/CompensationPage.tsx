import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { DollarSign, TrendingUp, Award, Target, Plus } from 'lucide-react';
import axios from 'axios';
import { useAuthStore } from '../../stores/authStore';

export default function CompensationPage() {
  const { user } = useAuthStore();

  const { data: bands } = useQuery({
    queryKey: ['compensation-bands', user?.organizationId],
    queryFn: async () => {
      const response = await axios.get(`/api/compensation/bands/${user?.organizationId}`);
      return response.data;
    },
    enabled: !!user?.organizationId,
  });

  const { data: myReviews } = useQuery({
    queryKey: ['my-reviews', user?.id],
    queryFn: async () => {
      const response = await axios.get(`/api/compensation/reviews/employee/${user?.id}`);
      return response.data;
    },
    enabled: !!user?.id,
  });

  const { data: pendingReviews } = useQuery({
    queryKey: ['pending-reviews', user?.organizationId],
    queryFn: async () => {
      const response = await axios.get(`/api/compensation/reviews/pending/${user?.organizationId}`);
      return response.data;
    },
    enabled: !!user?.organizationId && user?.role === 'HR_ADMIN',
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'bg-green-100 text-green-800';
      case 'PENDING_HR': return 'bg-yellow-100 text-yellow-800';
      case 'PENDING_MANAGER': return 'bg-blue-100 text-blue-800';
      case 'DRAFT': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <DollarSign className="h-8 w-8 text-green-600" />
            Compensation & Total Rewards
          </h1>
          <p className="text-gray-600 mt-1">Manage salary bands and compensation reviews</p>
        </div>
        {user?.role === 'HR_ADMIN' && (
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Review
          </Button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Salary Bands</p>
                <p className="text-2xl font-bold">{bands?.length || 0}</p>
              </div>
              <Target className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">My Reviews</p>
                <p className="text-2xl font-bold">{myReviews?.length || 0}</p>
              </div>
              <Award className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        {user?.role === 'HR_ADMIN' && (
          <>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Pending Reviews</p>
                    <p className="text-2xl font-bold text-yellow-600">{pendingReviews?.length || 0}</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-yellow-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <button className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                    Annual Review Cycle
                  </button>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Salary Bands */}
        <Card>
          <CardHeader>
            <CardTitle>Compensation Bands</CardTitle>
          </CardHeader>
          <CardContent>
            {!bands || bands.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No compensation bands configured
              </div>
            ) : (
              <div className="space-y-3">
                {bands.map((band: any) => (
                  <div key={band.id} className="p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold">{band.bandName}</h3>
                        <p className="text-sm text-gray-600">{band.bandCode}</p>
                      </div>
                      <span className="text-xs text-gray-500">{band.currency}</span>
                    </div>
                    <div className="mt-3 grid grid-cols-3 gap-2 text-sm">
                      <div>
                        <p className="text-gray-600">Min</p>
                        <p className="font-semibold">${band.minSalary.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Mid</p>
                        <p className="font-semibold">${band.midSalary.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Max</p>
                        <p className="font-semibold">${band.maxSalary.toLocaleString()}</p>
                      </div>
                    </div>
                    {band.jobFamily && (
                      <p className="text-xs text-gray-500 mt-2">Family: {band.jobFamily}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* My Compensation Reviews */}
        <Card>
          <CardHeader>
            <CardTitle>My Compensation History</CardTitle>
          </CardHeader>
          <CardContent>
            {!myReviews || myReviews.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No compensation reviews yet
              </div>
            ) : (
              <div className="space-y-3">
                {myReviews.map((review: any) => (
                  <div key={review.id} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold">{review.reviewCycle}</h3>
                        <p className="text-sm text-gray-600">{review.fiscalYear}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(review.status)}`}>
                        {review.status}
                      </span>
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-600">Current Salary</p>
                        <p className="text-lg font-bold">
                          ${review.currentSalary.toLocaleString()}
                        </p>
                      </div>
                      {review.proposedSalary && (
                        <div>
                          <p className="text-xs text-gray-600">Proposed Salary</p>
                          <p className="text-lg font-bold text-green-600">
                            ${review.proposedSalary.toLocaleString()}
                          </p>
                        </div>
                      )}
                    </div>
                    {review.increasePercent && (
                      <div className="mt-2">
                        <span className="text-sm text-green-600 font-semibold">
                          +{review.increasePercent}% increase
                        </span>
                      </div>
                    )}
                    {review.bonusAmount && (
                      <div className="mt-2 text-sm">
                        <span className="text-gray-600">Bonus: </span>
                        <span className="font-semibold">${review.bonusAmount.toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Pending Reviews (HR Admin only) */}
      {user?.role === 'HR_ADMIN' && pendingReviews && pendingReviews.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Pending Approvals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 font-semibold">Review ID</th>
                    <th className="text-left p-3 font-semibold">Employee</th>
                    <th className="text-left p-3 font-semibold">Cycle</th>
                    <th className="text-left p-3 font-semibold">Current</th>
                    <th className="text-left p-3 font-semibold">Proposed</th>
                    <th className="text-left p-3 font-semibold">Increase</th>
                    <th className="text-left p-3 font-semibold">Status</th>
                    <th className="text-left p-3 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingReviews.map((review: any) => (
                    <tr key={review.id} className="border-b hover:bg-gray-50">
                      <td className="p-3 font-mono text-sm">{review.reviewId}</td>
                      <td className="p-3">{review.employeeId}</td>
                      <td className="p-3 text-sm">{review.reviewCycle}</td>
                      <td className="p-3 font-semibold">${review.currentSalary.toLocaleString()}</td>
                      <td className="p-3 font-semibold text-green-600">
                        ${review.proposedSalary?.toLocaleString() || '-'}
                      </td>
                      <td className="p-3 text-sm">
                        {review.increasePercent ? `+${review.increasePercent}%` : '-'}
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(review.status)}`}>
                          {review.status}
                        </span>
                      </td>
                      <td className="p-3">
                        <Button size="sm">Review</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
