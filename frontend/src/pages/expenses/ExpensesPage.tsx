import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { Plus, DollarSign, Edit2, Trash2, Check, X, Clock, FileText, Receipt } from 'lucide-react';
import { expensesService, Expense } from '../../services/expensesService';
import ExpenseFormModal from '../../components/expenses/ExpenseFormModal';
import { toast } from 'react-hot-toast';
import { formatCurrency, formatDate } from '../../lib/utils';

export default function ExpensesPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);

  const { data: expenses, isLoading } = useQuery({
    queryKey: ['expenses'],
    queryFn: () => expensesService.getAll(),
  });

  const deleteMutation = useMutation({
    mutationFn: expensesService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      toast.success('Expense deleted successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete expense');
    },
  });

  const approveMutation = useMutation({
    mutationFn: expensesService.approve,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      toast.success('Expense approved!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to approve expense');
    },
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => expensesService.reject(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      toast.success('Expense rejected');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to reject expense');
    },
  });

  const reimburseMutation = useMutation({
    mutationFn: ({ id, paymentMethod }: { id: string; paymentMethod: string }) => 
      expensesService.reimburse(id, paymentMethod),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      toast.success('Expense marked as reimbursed!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to mark as reimbursed');
    },
  });

  const handleAdd = () => {
    setSelectedExpense(null);
    setIsModalOpen(true);
  };

  const handleEdit = (expense: Expense) => {
    setSelectedExpense(expense);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleApprove = (id: string) => {
    if (window.confirm('Are you sure you want to approve this expense?')) {
      approveMutation.mutate(id);
    }
  };

  const handleReject = (id: string) => {
    const reason = prompt('Please provide a reason for rejection:');
    if (reason) {
      rejectMutation.mutate({ id, reason });
    }
  };

  const handleReimburse = (id: string) => {
    const paymentMethod = prompt('Enter payment method (e.g., Bank Transfer, Check):') || 'Bank Transfer';
    if (window.confirm('Mark this expense as reimbursed?')) {
      reimburseMutation.mutate({ id, paymentMethod });
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedExpense(null);
  };

  // Calculate stats
  const calculateStats = () => {
    const expensesList = expenses?.data || [];
    
    const pending = expensesList.filter((e: Expense) => e.status === 'PENDING');
    const approved = expensesList.filter((e: Expense) => e.status === 'APPROVED');
    const reimbursed = expensesList.filter((e: Expense) => e.status === 'REIMBURSED');
    
    const pendingAmount = pending.reduce((sum: number, e: Expense) => sum + (e.amount || 0), 0);
    const approvedAmount = approved.reduce((sum: number, e: Expense) => sum + (e.amount || 0), 0);
    const reimbursedAmount = reimbursed.reduce((sum: number, e: Expense) => sum + (e.amount || 0), 0);

    return {
      pending: { amount: pendingAmount, count: pending.length },
      approved: { amount: approvedAmount, count: approved.length },
      reimbursed: { amount: reimbursedAmount, count: reimbursed.length },
    };
  };

  const stats = calculateStats();
  const currency = expenses?.data?.[0]?.currency || 'USD';

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Expenses</h1>
          <p className="text-gray-600 mt-1">Submit and manage expense claims</p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="h-4 w-4 mr-2" />
          New Expense
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[
          { title: 'Pending', data: stats.pending, icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-50' },
          { title: 'Approved', data: stats.approved, icon: Check, color: 'text-green-600', bg: 'bg-green-50' },
          { title: 'Reimbursed', data: stats.reimbursed, icon: DollarSign, color: 'text-blue-600', bg: 'bg-blue-50' },
        ].map((stat) => (
          <Card key={stat.title}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <div className={`${stat.bg} p-2 rounded-lg`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
              </div>
              <p className={`text-2xl font-bold ${stat.color}`}>
                {formatCurrency(stat.data.amount, currency)}
              </p>
              <p className="text-sm text-gray-500 mt-1">{stat.data.count} claims</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Expenses Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Expenses</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-center py-8 text-gray-500">Loading...</p>
          ) : expenses?.data?.length === 0 ? (
            <div className="text-center py-12">
              <Receipt className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No expenses</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by submitting an expense claim.</p>
              <div className="mt-6">
                <Button onClick={handleAdd}>
                  <Plus className="h-4 w-4 mr-2" />
                  New Expense
                </Button>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b">
                  <tr className="text-left text-sm text-gray-500">
                    <th className="pb-3 font-medium">Employee</th>
                    <th className="pb-3 font-medium">Date</th>
                    <th className="pb-3 font-medium">Category</th>
                    <th className="pb-3 font-medium">Merchant</th>
                    <th className="pb-3 font-medium">Amount</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium">Receipt</th>
                    <th className="pb-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses?.data?.map((expense: Expense) => (
                    <tr key={expense.id} className="border-b last:border-0">
                      <td className="py-4 text-sm font-medium">
                        {expense.employeeName || 'Unknown'}
                      </td>
                      <td className="py-4 text-sm">{formatDate(expense.date)}</td>
                      <td className="py-4 text-sm">
                        <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800">
                          {expense.category.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-4 text-sm">{expense.merchant || '-'}</td>
                      <td className="py-4 text-sm font-semibold text-gray-900">
                        {formatCurrency(expense.amount, expense.currency)}
                      </td>
                      <td className="py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          expense.status === 'REIMBURSED' ? 'bg-blue-100 text-blue-800' :
                          expense.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                          expense.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {expense.status === 'REIMBURSED' && <DollarSign className="h-3 w-3 mr-1" />}
                          {expense.status === 'APPROVED' && <Check className="h-3 w-3 mr-1" />}
                          {expense.status === 'REJECTED' && <X className="h-3 w-3 mr-1" />}
                          {expense.status === 'PENDING' && <Clock className="h-3 w-3 mr-1" />}
                          {expense.status}
                        </span>
                      </td>
                      <td className="py-4">
                        {expense.receiptUrl ? (
                          <a
                            href={expense.receiptUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <FileText className="h-4 w-4" />
                          </a>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="py-4">
                        <div className="flex gap-2">
                          {expense.status === 'PENDING' && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleApprove(expense.id)}
                                disabled={approveMutation.isPending}
                                className="text-green-600 hover:text-green-700"
                                title="Approve"
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleReject(expense.id)}
                                disabled={rejectMutation.isPending}
                                className="text-red-600 hover:text-red-700"
                                title="Reject"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEdit(expense)}
                                title="Edit"
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                          {expense.status === 'APPROVED' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleReimburse(expense.id)}
                              disabled={reimburseMutation.isPending}
                              className="text-blue-600 hover:text-blue-700"
                              title="Mark as Reimbursed"
                            >
                              <DollarSign className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(expense.id)}
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

      <ExpenseFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        expense={selectedExpense}
      />
    </div>
  );
}
