import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import {
  Plus,
  Download,
  Send,
  FileText,
  CheckCircle2,
  AlertCircle,
  Users,
  Calendar,
  Filter,
  Search,
  Mail,
  FilePlus,
} from 'lucide-react';
import payslipService, { Payslip } from '../../../services/payslipService';
import { toast } from 'react-hot-toast';

export default function PayslipManagementPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedPayslips, setSelectedPayslips] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [countryFilter, setCountryFilter] = useState<string>('all');
  const [showBulkModal, setShowBulkModal] = useState(false);

  const { data: payslipsData, isLoading } = useQuery({
    queryKey: ['admin-payslips', statusFilter, countryFilter],
    queryFn: () =>
      payslipService.getPayslips({
        status: statusFilter !== 'all' ? statusFilter : undefined,
        country: countryFilter !== 'all' ? countryFilter : undefined,
        limit: 50,
      }),
  });

  const payslips = payslipsData?.data || [];

  const publishMutation = useMutation({
    mutationFn: (data: { payslipIds: string[]; sendEmail: boolean; generatePDF: boolean }) =>
      payslipService.publishPayslips(data),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['admin-payslips'] });
      const published = result.results.filter((r) => r.status === 'published').length;
      toast.success(`${published} payslips published successfully!`);
      setSelectedPayslips([]);
    },
    onError: () => {
      toast.error('Failed to publish payslips');
    },
  });

  const handleSelectAll = () => {
    if (selectedPayslips.length === payslips.length) {
      setSelectedPayslips([]);
    } else {
      setSelectedPayslips(payslips.map((p: Payslip) => p.id));
    }
  };

  const handleSelectPayslip = (id: string) => {
    setSelectedPayslips((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const handlePublish = async (sendEmail: boolean, generatePDF: boolean) => {
    if (selectedPayslips.length === 0) {
      toast.error('Please select at least one payslip');
      return;
    }

    await publishMutation.mutateAsync({
      payslipIds: selectedPayslips,
      sendEmail,
      generatePDF,
    });
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: currency || 'GBP',
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ISSUED':
        return 'bg-green-100 text-green-800';
      case 'DRAFT':
        return 'bg-gray-100 text-gray-800';
      case 'AMENDED':
        return 'bg-blue-100 text-blue-800';
      case 'VOID':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const stats = {
    total: payslips.length,
    draft: payslips.filter((p: Payslip) => p.status === 'DRAFT').length,
    issued: payslips.filter((p: Payslip) => p.status === 'ISSUED').length,
    totalValue: payslips.reduce((sum: number, p: Payslip) => sum + Number(p.netPay), 0),
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading payslips...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Payslip Management</h1>
          <p className="text-gray-600 mt-1">Generate, publish, and manage employee payslips</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => navigate('/payroll/codes-catalog')}>
            <FileText className="w-4 h-4 mr-2" />
            Codes Catalog
          </Button>
          <Button onClick={() => setShowBulkModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Bulk Generate
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Payslips</p>
                <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="bg-blue-50 p-3 rounded-full">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Draft</p>
                <p className="text-3xl font-bold text-gray-900">{stats.draft}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-full">
                <AlertCircle className="w-6 h-6 text-gray-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Issued</p>
                <p className="text-3xl font-bold text-gray-900">{stats.issued}</p>
              </div>
              <div className="bg-green-50 p-3 rounded-full">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Value</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(stats.totalValue, 'GBP')}
                </p>
              </div>
              <div className="bg-purple-50 p-3 rounded-full">
                <Calendar className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions Bar */}
      {selectedPayslips.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <p className="text-blue-900 font-medium">
              {selectedPayslips.length} payslip{selectedPayslips.length > 1 ? 's' : ''} selected
            </p>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handlePublish(false, false)}
                disabled={publishMutation.isPending}
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Publish
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handlePublish(false, true)}
                disabled={publishMutation.isPending}
              >
                <FilePlus className="w-4 h-4 mr-2" />
                Publish + PDF
              </Button>
              <Button
                size="sm"
                onClick={() => handlePublish(true, true)}
                disabled={publishMutation.isPending}
              >
                <Mail className="w-4 h-4 mr-2" />
                Publish + Email
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-4 bg-white p-4 rounded-lg shadow">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-400" />
          <span className="text-sm font-medium text-gray-700">Filters:</span>
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        >
          <option value="all">All Statuses</option>
          <option value="DRAFT">Draft</option>
          <option value="ISSUED">Issued</option>
          <option value="AMENDED">Amended</option>
          <option value="VOID">Void</option>
        </select>

        <select
          value={countryFilter}
          onChange={(e) => setCountryFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        >
          <option value="all">All Countries</option>
          <option value="UK">United Kingdom</option>
          <option value="US">United States</option>
          <option value="NG">Nigeria</option>
          <option value="ZA">South Africa</option>
        </select>
      </div>

      {/* Payslips Table */}
      <Card>
        <CardHeader>
          <CardTitle>Payslips</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedPayslips.length === payslips.length && payslips.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                    Employee
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                    Period
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                    Pay Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                    Status
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase">
                    Gross
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase">
                    Net
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                    Country
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {payslips.map((payslip: Payslip) => (
                  <tr key={payslip.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedPayslips.includes(payslip.id)}
                        onChange={() => handleSelectPayslip(payslip.id)}
                        className="rounded border-gray-300"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{payslip.employeeId}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-900">
                      {formatDate(payslip.periodStart)} - {formatDate(payslip.periodEnd)}
                    </td>
                    <td className="px-4 py-3 text-gray-900">{formatDate(payslip.payDate)}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(payslip.status)}`}>
                        {payslip.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-gray-900">
                      {formatCurrency(Number(payslip.grossPay), payslip.currency)}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-green-600">
                      {formatCurrency(Number(payslip.netPay), payslip.currency)}
                    </td>
                    <td className="px-4 py-3 text-gray-900">{payslip.country}</td>
                    <td className="px-4 py-3 text-center">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => navigate(`/payroll/payslips/${payslip.id}`)}
                      >
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {payslips.length === 0 && (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No payslips found</h3>
              <p className="text-gray-600 mb-6">
                Get started by generating payslips for your employees
              </p>
              <Button onClick={() => setShowBulkModal(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Generate Payslips
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bulk Generation Modal */}
      {showBulkModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Bulk Generate Payslips</h3>
            <p className="text-gray-600 mb-6">
              This feature will be available soon. You can generate payslips via API for now.
            </p>
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setShowBulkModal(false)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
