import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit2, Trash2, Check, X, Clock, Calendar as CalendarIcon, Briefcase } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { leaveService, Leave } from '../../services/leaveService';
import LeaveFormModal from '../../components/leave/LeaveFormModal';
import { toast } from 'react-hot-toast';
import { formatDate } from '../../lib/utils';

export default function LeavePage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState<Leave | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['leave', page],
    queryFn: () => leaveService.getAll({ page, limit: 10 }),
  });

  const deleteMutation = useMutation({
    mutationFn: leaveService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leave'] });
      toast.success('Leave request deleted successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete leave request');
    },
  });

  const approveMutation = useMutation({
    mutationFn: leaveService.approve,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leave'] });
      toast.success('Leave request approved!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to approve leave request');
    },
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => leaveService.reject(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leave'] });
      toast.success('Leave request rejected');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to reject leave request');
    },
  });

  const handleAdd = () => {
    setSelectedLeave(null);
    setIsModalOpen(true);
  };

  const handleEdit = (leave: Leave) => {
    setSelectedLeave(leave);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this leave request?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleApprove = (id: string) => {
    if (window.confirm('Are you sure you want to approve this leave request?')) {
      approveMutation.mutate(id);
    }
  };

  const handleReject = (id: string) => {
    const reason = prompt('Please provide a reason for rejection:');
    if (reason) {
      rejectMutation.mutate({ id, reason });
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedLeave(null);
  };

  // Calculate stats
  const calculateStats = () => {
    const leaves = data?.data || [];
    
    const pending = leaves.filter((l: Leave) => l.status === 'PENDING').length;
    const approved = leaves.filter((l: Leave) => l.status === 'APPROVED').length;
    const rejected = leaves.filter((l: Leave) => l.status === 'REJECTED').length;
    
    const totalDays = leaves
      .filter((l: Leave) => l.status === 'APPROVED')
      .reduce((sum: number, l: Leave) => sum + (l.numberOfDays || 0), 0);

    return { pending, approved, rejected, totalDays };
  };

  const stats = calculateStats();

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Leave Management</h1>
          <p className="text-gray-600 mt-1">Manage employee leave requests</p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="h-4 w-4 mr-2" />
          Request Leave
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
        {[
          { title: 'Pending Requests', count: stats.pending, icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-50' },
          { title: 'Approved', count: stats.approved, icon: Check, color: 'text-green-600', bg: 'bg-green-50' },
          { title: 'Rejected', count: stats.rejected, icon: X, color: 'text-red-600', bg: 'bg-red-50' },
          { title: 'Total Days Taken', count: stats.totalDays, icon: CalendarIcon, color: 'text-blue-600', bg: 'bg-blue-50' },
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

      {/* Leave Requests Table */}
      <Card>
        <CardHeader>
          <CardTitle>Leave Requests</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-center py-8 text-gray-500">Loading...</p>
          ) : data?.data?.length === 0 ? (
            <div className="text-center py-12">
              <CalendarIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No leave requests</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by creating a leave request.</p>
              <div className="mt-6">
                <Button onClick={handleAdd}>
                  <Plus className="h-4 w-4 mr-2" />
                  Request Leave
                </Button>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b">
                  <tr className="text-left text-sm text-gray-500">
                    <th className="pb-3 font-medium">Employee</th>
                    <th className="pb-3 font-medium">Leave Type</th>
                    <th className="pb-3 font-medium">Start Date</th>
                    <th className="pb-3 font-medium">End Date</th>
                    <th className="pb-3 font-medium">Days</th>
                    <th className="pb-3 font-medium">Reason</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.data?.map((leave: Leave) => (
                    <tr key={leave.id} className="border-b last:border-0">
                      <td className="py-4 text-sm font-medium">
                        {leave.employeeName || 'Unknown'}
                      </td>
                      <td className="py-4 text-sm">
                        <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800">
                          <Briefcase className="h-3 w-3 mr-1" />
                          {leave.leaveType.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-4 text-sm">{formatDate(leave.startDate)}</td>
                      <td className="py-4 text-sm">{formatDate(leave.endDate)}</td>
                      <td className="py-4 text-sm font-semibold text-blue-600">
                        {leave.numberOfDays} {leave.numberOfDays === 1 ? 'day' : 'days'}
                      </td>
                      <td className="py-4 text-sm max-w-xs truncate" title={leave.reason}>
                        {leave.reason}
                      </td>
                      <td className="py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          leave.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                          leave.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {leave.status === 'APPROVED' && <Check className="h-3 w-3 mr-1" />}
                          {leave.status === 'REJECTED' && <X className="h-3 w-3 mr-1" />}
                          {leave.status === 'PENDING' && <Clock className="h-3 w-3 mr-1" />}
                          {leave.status}
                        </span>
                      </td>
                      <td className="py-4">
                        <div className="flex gap-2">
                          {leave.status === 'PENDING' && (
                            <>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleApprove(leave.id)}
                                disabled={approveMutation.isPending}
                                className="text-green-600 hover:text-green-700"
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleReject(leave.id)}
                                disabled={rejectMutation.isPending}
                                className="text-red-600 hover:text-red-700"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(leave)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(leave.id)}
                            disabled={deleteMutation.isPending}
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

      <LeaveFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        leave={selectedLeave}
      />
    </div>
  );
}
