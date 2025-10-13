import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit2, Trash2, Check, DollarSign, TrendingUp, Users, FileText, Download, Receipt, Settings, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { payrollService, Payroll } from '../../services/payrollService';
import PayrollFormModal from '../../components/payroll/PayrollFormModal';
import { toast } from 'react-hot-toast';
import { formatCurrency, formatDate } from '../../lib/utils';

export default function PayrollPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPayroll, setSelectedPayroll] = useState<Payroll | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['payroll', page],
    queryFn: () => payrollService.getAll({ page, limit: 10 }),
  });

  const deleteMutation = useMutation({
    mutationFn: payrollService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payroll'] });
      toast.success('Payroll record deleted successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete payroll record');
    },
  });

  const approveMutation = useMutation({
    mutationFn: payrollService.approve,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payroll'] });
      toast.success('Payroll approved!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to approve payroll');
    },
  });

  const processMutation = useMutation({
    mutationFn: payrollService.process,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payroll'] });
      toast.success('Payroll processed successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to process payroll');
    },
  });

  const handleAdd = () => {
    setSelectedPayroll(null);
    setIsModalOpen(true);
  };

  const handleEdit = (payroll: Payroll) => {
    setSelectedPayroll(payroll);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this payroll record?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleApprove = (id: string) => {
    if (window.confirm('Are you sure you want to approve this payroll?')) {
      approveMutation.mutate(id);
    }
  };

  const handleProcess = (id: string) => {
    if (window.confirm('Are you sure you want to process this payroll payment?')) {
      processMutation.mutate(id);
    }
  };

  const handleDownloadPayslip = async (id: string) => {
    try {
      const blob = await payrollService.generatePayslip(id);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `payslip-${id}.pdf`;
      link.click();
      toast.success('Payslip downloaded!');
    } catch (error) {
      toast.error('Failed to download payslip');
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPayroll(null);
  };

  // Calculate stats
  const calculateStats = () => {
    const payrolls = data?.data || [];
    
    const totalGross = payrolls.reduce((sum: number, p: Payroll) => sum + (p.grossPay || 0), 0);
    const totalNet = payrolls.reduce((sum: number, p: Payroll) => sum + (p.netPay || 0), 0);
    const totalDeductions = payrolls.reduce((sum: number, p: Payroll) => sum + (p.totalDeductions || 0), 0);
    const employeeCount = payrolls.length;

    return { totalGross, totalNet, totalDeductions, employeeCount };
  };

  const stats = calculateStats();
  const currency = data?.data?.[0]?.currency || 'USD';

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Payroll</h1>
          <p className="text-gray-600 mt-1">Manage employee payroll and payments</p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="h-4 w-4 mr-2" />
          Run Payroll
        </Button>
      </div>

      {/* Payslip System Quick Access */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/payroll/payslips')}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Receipt className="w-5 h-5 text-blue-600" />
                  <h3 className="font-semibold text-gray-900">My Payslips</h3>
                </div>
                <p className="text-sm text-gray-600">View and download your payslips</p>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/payroll/admin/payslips')}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-5 h-5 text-purple-600" />
                  <h3 className="font-semibold text-gray-900">Manage Payslips</h3>
                </div>
                <p className="text-sm text-gray-600">Admin: Generate & publish payslips</p>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/payroll/codes-catalog')}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Settings className="w-5 h-5 text-green-600" />
                  <h3 className="font-semibold text-gray-900">Codes Catalog</h3>
                </div>
                <p className="text-sm text-gray-600">Manage earning & deduction codes</p>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
        {[
          { title: 'Total Gross Pay', amount: stats.totalGross, icon: DollarSign, color: 'text-blue-600', bg: 'bg-blue-50' },
          { title: 'Total Deductions', amount: stats.totalDeductions, icon: TrendingUp, color: 'text-red-600', bg: 'bg-red-50' },
          { title: 'Total Net Pay', amount: stats.totalNet, icon: DollarSign, color: 'text-green-600', bg: 'bg-green-50' },
          { title: 'Employees Paid', amount: stats.employeeCount, icon: Users, color: 'text-purple-600', bg: 'bg-purple-50' },
        ].map((stat) => (
          <Card key={stat.title}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">
                    {stat.title.includes('Employees') ? stat.amount : formatCurrency(stat.amount, currency)}
                  </p>
                </div>
                <div className={`${stat.bg} p-3 rounded-lg`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Payroll Records Table */}
      <Card>
        <CardHeader>
          <CardTitle>Payroll Records</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-center py-8 text-gray-500">Loading...</p>
          ) : data?.data?.length === 0 ? (
            <div className="text-center py-12">
              <DollarSign className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No payroll records</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by running payroll for your employees.</p>
              <div className="mt-6">
                <Button onClick={handleAdd}>
                  <Plus className="h-4 w-4 mr-2" />
                  Run Payroll
                </Button>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b">
                  <tr className="text-left text-sm text-gray-500">
                    <th className="pb-3 font-medium">Employee</th>
                    <th className="pb-3 font-medium">Pay Period</th>
                    <th className="pb-3 font-medium">Gross Pay</th>
                    <th className="pb-3 font-medium">Deductions</th>
                    <th className="pb-3 font-medium">Net Pay</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.data?.map((payroll: Payroll) => (
                    <tr key={payroll.id} className="border-b last:border-0">
                      <td className="py-4 text-sm font-medium">
                        {payroll.employeeName || 'Unknown'}
                      </td>
                      <td className="py-4 text-sm">
                        {formatDate(payroll.payPeriodStart)} - {formatDate(payroll.payPeriodEnd)}
                      </td>
                      <td className="py-4 text-sm font-semibold text-gray-900">
                        {formatCurrency(payroll.grossPay, payroll.currency)}
                      </td>
                      <td className="py-4 text-sm text-red-600">
                        -{formatCurrency(payroll.totalDeductions, payroll.currency)}
                      </td>
                      <td className="py-4 text-sm font-bold text-green-600">
                        {formatCurrency(payroll.netPay, payroll.currency)}
                      </td>
                      <td className="py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          payroll.status === 'PAID' ? 'bg-green-100 text-green-800' :
                          payroll.status === 'APPROVED' ? 'bg-blue-100 text-blue-800' :
                          payroll.status === 'PROCESSED' ? 'bg-purple-100 text-purple-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {payroll.status}
                        </span>
                      </td>
                      <td className="py-4">
                        <div className="flex gap-2">
                          {payroll.status === 'DRAFT' && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleApprove(payroll.id)}
                                disabled={approveMutation.isPending}
                                className="text-blue-600 hover:text-blue-700"
                                title="Approve"
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEdit(payroll)}
                                title="Edit"
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                          {payroll.status === 'APPROVED' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleProcess(payroll.id)}
                              disabled={processMutation.isPending}
                              className="text-green-600 hover:text-green-700"
                              title="Process Payment"
                            >
                              <DollarSign className="h-4 w-4" />
                            </Button>
                          )}
                          {(payroll.status === 'PAID' || payroll.status === 'PROCESSED') && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDownloadPayslip(payroll.id)}
                              className="text-purple-600 hover:text-purple-700"
                              title="Download Payslip"
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(payroll.id)}
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

      <PayrollFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        payroll={selectedPayroll}
      />
    </div>
  );
}
