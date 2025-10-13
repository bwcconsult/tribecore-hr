import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import {
  Download,
  FileText,
  Calendar,
  DollarSign,
  AlertCircle,
  CheckCircle2,
  Eye,
  Filter,
  Search,
} from 'lucide-react';
import payslipService, { Payslip } from '../../services/payslipService';
import { useAuthStore } from '../../stores/authStore';
import { toast } from 'react-hot-toast';

export default function PayslipsPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const { data: payslipsData, isLoading } = useQuery({
    queryKey: ['payslips', user?.id, selectedYear, statusFilter],
    queryFn: () =>
      payslipService.getEmployeePayslips(user?.id || '', {
        year: selectedYear,
        status: statusFilter !== 'all' ? statusFilter : undefined,
      }),
    enabled: !!user?.id,
  });

  const payslips = payslipsData?.data || [];

  const handleDownloadPDF = async (payslipId: string) => {
    try {
      const blob = await payslipService.downloadPayslipPDF(payslipId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `payslip-${payslipId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Payslip downloaded successfully');
    } catch (error) {
      toast.error('Failed to download payslip');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ISSUED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'DRAFT':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'AMENDED':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'VOID':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ISSUED':
        return <CheckCircle2 className="w-4 h-4" />;
      case 'DRAFT':
        return <FileText className="w-4 h-4" />;
      case 'AMENDED':
        return <AlertCircle className="w-4 h-4" />;
      case 'VOID':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
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

  const years = Array.from({ length: 5 }, (_, i) => {
    const year = new Date().getFullYear() - i;
    return year.toString();
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your payslips...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Payslips</h1>
          <p className="text-gray-600 mt-1">View and download your payslips</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => navigate('/payroll')}>
            Back to Payroll
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
                <p className="text-3xl font-bold text-gray-900">{payslips.length}</p>
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
                <p className="text-sm text-gray-600 mb-1">YTD Gross</p>
                <p className="text-3xl font-bold text-gray-900">
                  {payslips.length > 0
                    ? formatCurrency(
                        payslips.reduce((sum, p) => sum + Number(p.grossPay), 0),
                        payslips[0]?.currency || 'GBP',
                      )
                    : '£0'}
                </p>
              </div>
              <div className="bg-green-50 p-3 rounded-full">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">YTD Net</p>
                <p className="text-3xl font-bold text-gray-900">
                  {payslips.length > 0
                    ? formatCurrency(
                        payslips.reduce((sum, p) => sum + Number(p.netPay), 0),
                        payslips[0]?.currency || 'GBP',
                      )
                    : '£0'}
                </p>
              </div>
              <div className="bg-purple-50 p-3 rounded-full">
                <DollarSign className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Latest Pay Date</p>
                <p className="text-lg font-bold text-gray-900">
                  {payslips.length > 0 ? formatDate(payslips[0].payDate) : 'N/A'}
                </p>
              </div>
              <div className="bg-yellow-50 p-3 rounded-full">
                <Calendar className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 bg-white p-4 rounded-lg shadow">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-400" />
          <span className="text-sm font-medium text-gray-700">Filters:</span>
        </div>

        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        >
          {years.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        >
          <option value="all">All Statuses</option>
          <option value="ISSUED">Issued</option>
          <option value="DRAFT">Draft</option>
          <option value="AMENDED">Amended</option>
          <option value="VOID">Void</option>
        </select>

        <div className="ml-auto">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Download All
          </Button>
        </div>
      </div>

      {/* Payslips List */}
      {payslips && payslips.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {payslips.map((payslip: Payslip) => (
            <Card key={payslip.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                          payslip.status,
                        )}`}
                      >
                        {getStatusIcon(payslip.status)}
                        {payslip.status}
                      </span>
                      <span className="text-sm text-gray-600">
                        {formatDate(payslip.periodStart)} - {formatDate(payslip.periodEnd)}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Gross Pay</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {formatCurrency(Number(payslip.grossPay), payslip.currency)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Deductions</p>
                        <p className="text-lg font-semibold text-red-600">
                          -{formatCurrency(Number(payslip.totalDeductions), payslip.currency)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Net Pay</p>
                        <p className="text-lg font-semibold text-green-600">
                          {formatCurrency(Number(payslip.netPay), payslip.currency)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Pay Date</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {formatDate(payslip.payDate)}
                        </p>
                      </div>
                    </div>

                    {payslip.messages && payslip.messages.length > 0 && (
                      <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-blue-900">
                              {payslip.messages[0].title}
                            </p>
                            <p className="text-xs text-blue-700">{payslip.messages[0].message}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 ml-6">
                    <Button
                      size="sm"
                      onClick={() => navigate(`/payroll/payslips/${payslip.id}`)}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDownloadPDF(payslip.id)}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      PDF
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No payslips found
            </h3>
            <p className="text-gray-600 mb-6">
              {statusFilter !== 'all'
                ? `No ${statusFilter.toLowerCase()} payslips for ${selectedYear}`
                : `No payslips available for ${selectedYear}`}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
