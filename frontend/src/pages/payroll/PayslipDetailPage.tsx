import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import {
  Download,
  ArrowLeft,
  FileText,
  Calendar,
  DollarSign,
  AlertCircle,
  CheckCircle2,
  Info,
  ChevronDown,
  ChevronUp,
  Building2,
  MapPin,
  CreditCard,
  TrendingUp,
  Flag,
} from 'lucide-react';
import payslipService, { Payslip } from '../../services/payslipService';
import { toast } from 'react-hot-toast';

export default function PayslipDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [ytdExpanded, setYtdExpanded] = useState(false);
  const [showExplainability, setShowExplainability] = useState<string | null>(null);

  const { data: payslip, isLoading } = useQuery({
    queryKey: ['payslip', id],
    queryFn: () => payslipService.getPayslipById(id!),
    enabled: !!id,
  });

  const handleDownloadPDF = async () => {
    if (!id) return;
    try {
      const blob = await payslipService.downloadPayslipPDF(id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `payslip-${id}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Payslip downloaded successfully');
    } catch (error) {
      toast.error('Failed to download payslip');
    }
  };

  const formatCurrency = (amount: number, currency?: string) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: currency || payslip?.currency || 'GBP',
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading payslip...</p>
        </div>
      </div>
    );
  }

  if (!payslip) {
    return (
      <div className="text-center py-12">
        <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Payslip not found</h2>
        <Button onClick={() => navigate('/payroll/payslips')}>
          Back to Payslips
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => navigate('/payroll/payslips')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Payslip Details</h1>
            <p className="text-gray-600 mt-1">
              {formatDate(payslip.periodStart)} - {formatDate(payslip.periodEnd)}
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleDownloadPDF}>
            <Download className="w-4 h-4 mr-2" />
            Download PDF
          </Button>
        </div>
      </div>

      {/* Status & Summary Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(payslip.status)}`}>
                {payslip.status === 'ISSUED' && <CheckCircle2 className="w-4 h-4" />}
                {payslip.status}
              </span>
              {payslip.version > 1 && (
                <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
                  Version {payslip.version}
                </span>
              )}
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-600">Pay Date</p>
              <p className="text-lg font-semibold text-gray-900">{formatDate(payslip.payDate)}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-1">Gross Pay</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(Number(payslip.grossPay))}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-1">Total Deductions</p>
              <p className="text-2xl font-bold text-red-600">
                -{formatCurrency(Number(payslip.totalDeductions))}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-1">Net Pay</p>
              <p className="text-3xl font-bold text-green-600">
                {formatCurrency(Number(payslip.netPay))}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Messages */}
      {payslip.messages && payslip.messages.length > 0 && (
        <div className="space-y-2">
          {payslip.messages.map((message, index) => (
            <div key={index} className="p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-blue-900">{message.title}</p>
                <p className="text-sm text-blue-700">{message.message}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Earnings */}
      {payslip.earnings && payslip.earnings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              Earnings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Description</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase">Qty</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase">Rate</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase">Amount</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase">Info</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {payslip.earnings.map((earning) => (
                    <tr key={earning.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-gray-900">{earning.label}</p>
                          <div className="flex gap-2 mt-1">
                            {earning.taxable && (
                              <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded">Taxable</span>
                            )}
                            {earning.pensionable && (
                              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">Pensionable</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right text-gray-900">
                        {earning.qty} {earning.units}
                      </td>
                      <td className="px-4 py-3 text-right text-gray-900">
                        {formatCurrency(Number(earning.rate))}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-gray-900">
                        {formatCurrency(Number(earning.periodAmount))}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {earning.calcTrace && (
                          <button
                            onClick={() => setShowExplainability(showExplainability === earning.id ? null : earning.id)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <Info className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {payslip.earnings.map((earning) => (
                    showExplainability === earning.id && earning.calcTrace && (
                      <tr key={`${earning.id}-trace`}>
                        <td colSpan={5} className="px-4 py-3 bg-blue-50">
                          <div className="text-sm">
                            <p className="font-medium text-blue-900 mb-2">Calculation Details:</p>
                            <div className="space-y-1 text-blue-800">
                              <p><strong>Formula:</strong> {earning.calcTrace.formula}</p>
                              <p><strong>Inputs:</strong> {JSON.stringify(earning.calcTrace.inputs)}</p>
                              {earning.calcTrace.source && <p><strong>Source:</strong> {earning.calcTrace.source}</p>}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )
                  ))}
                </tbody>
                <tfoot className="bg-gray-50">
                  <tr>
                    <td colSpan={3} className="px-4 py-3 text-right font-semibold text-gray-900">
                      Total Earnings:
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-green-600">
                      {formatCurrency(payslip.earnings.reduce((sum, e) => sum + Number(e.periodAmount), 0))}
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Deductions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-red-600" />
            Deductions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Pre-Tax Deductions */}
            {payslip.preTaxDeductions && payslip.preTaxDeductions.filter(d => d.isPreTax).length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Pre-Tax Deductions</h4>
                <div className="space-y-2">
                  {payslip.preTaxDeductions.filter(d => d.isPreTax).map((deduction) => (
                    <div key={deduction.id} className="flex items-center justify-between py-2 px-4 bg-gray-50 rounded">
                      <span className="text-gray-900">{deduction.label}</span>
                      <span className="font-semibold text-red-600">
                        -{formatCurrency(Number(deduction.periodAmount))}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Taxes */}
            {payslip.taxes && payslip.taxes.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Taxes</h4>
                <div className="space-y-2">
                  {payslip.taxes.map((tax) => (
                    <div key={tax.id}>
                      <div className="flex items-center justify-between py-2 px-4 bg-gray-50 rounded">
                        <div>
                          <span className="text-gray-900">{tax.taxCode}</span>
                          <span className="text-xs text-gray-600 ml-2">({tax.jurisdiction})</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-semibold text-red-600">
                            -{formatCurrency(Number(tax.amount))}
                          </span>
                          {tax.calcTrace && (
                            <button
                              onClick={() => setShowExplainability(showExplainability === tax.id ? null : tax.id)}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              <Info className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                      {showExplainability === tax.id && tax.calcTrace && (
                        <div className="mt-2 p-4 bg-blue-50 rounded text-sm">
                          <p className="font-medium text-blue-900 mb-2">Tax Calculation:</p>
                          <div className="space-y-1 text-blue-800">
                            <p><strong>Formula:</strong> {tax.calcTrace.formula}</p>
                            <p><strong>Taxable Base:</strong> {formatCurrency(Number(tax.taxableBase))}</p>
                            {tax.rate && <p><strong>Rate:</strong> {(Number(tax.rate) * 100).toFixed(2)}%</p>}
                            {tax.calcTrace.source && <p><strong>Source:</strong> {tax.calcTrace.source}</p>}
                            {tax.calcTrace.references && (
                              <p><strong>References:</strong> {tax.calcTrace.references.join(', ')}</p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Post-Tax Deductions */}
            {payslip.postTaxDeductions && payslip.postTaxDeductions.filter(d => !d.isPreTax).length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Post-Tax Deductions</h4>
                <div className="space-y-2">
                  {payslip.postTaxDeductions.filter(d => !d.isPreTax).map((deduction) => (
                    <div key={deduction.id} className="flex items-center justify-between py-2 px-4 bg-gray-50 rounded">
                      <span className="text-gray-900">{deduction.label}</span>
                      <span className="font-semibold text-red-600">
                        -{formatCurrency(Number(deduction.periodAmount))}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-4 border-t">
              <div className="flex items-center justify-between py-2 px-4 bg-red-50 rounded">
                <span className="font-bold text-gray-900">Total Deductions:</span>
                <span className="font-bold text-red-600 text-lg">
                  -{formatCurrency(Number(payslip.totalDeductions))}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Employer Contributions */}
      {payslip.employerContributions && payslip.employerContributions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-purple-600" />
              Employer Contributions (Not deducted from your pay)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {payslip.employerContributions.map((contrib) => (
                <div key={contrib.id} className="flex items-center justify-between py-2 px-4 bg-purple-50 rounded">
                  <span className="text-gray-900">{contrib.label}</span>
                  <span className="font-semibold text-purple-600">
                    {formatCurrency(Number(contrib.amount))}
                  </span>
                </div>
              ))}
              <div className="pt-2 border-t border-purple-200">
                <div className="flex items-center justify-between py-2 px-4">
                  <span className="font-bold text-gray-900">Total Employer Contributions:</span>
                  <span className="font-bold text-purple-600 text-lg">
                    {formatCurrency(Number(payslip.totalEmployerContributions))}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Leave Balances */}
      {payslip.leaveBalances && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              Leave Balances
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(payslip.leaveBalances).map(([type, balance]: [string, any]) => (
                <div key={type} className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-3 capitalize">{type.replace('_', ' ')}</h4>
                  <div className="grid grid-cols-4 gap-2 text-center text-sm">
                    <div>
                      <p className="text-gray-600">Opening</p>
                      <p className="font-semibold text-gray-900">{balance.opening}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Accrued</p>
                      <p className="font-semibold text-green-600">+{balance.accrued}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Taken</p>
                      <p className="font-semibold text-red-600">-{balance.taken}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Closing</p>
                      <p className="font-semibold text-blue-600">{balance.closing}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* YTD Summary */}
      {payslip.ytdSnapshot && (
        <Card>
          <CardHeader>
            <button
              onClick={() => setYtdExpanded(!ytdExpanded)}
              className="w-full flex items-center justify-between hover:bg-gray-50 rounded p-2 -m-2"
            >
              <CardTitle className="flex items-center gap-2">
                <Flag className="w-5 h-5 text-indigo-600" />
                Year to Date Summary
              </CardTitle>
              {ytdExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
          </CardHeader>
          {ytdExpanded && (
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(payslip.ytdSnapshot).map(([key, value]: [string, any]) => (
                  <div key={key} className="p-4 bg-indigo-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1 capitalize">{key.replace(/_/g, ' ')}</p>
                    <p className="text-lg font-bold text-indigo-900">
                      {formatCurrency(Number(value))}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          )}
        </Card>
      )}

      {/* Payment Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-gray-600" />
            Payment Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">Payment Method</p>
              <p className="font-semibold text-gray-900">{payslip.paymentMethod.replace(/_/g, ' ')}</p>
            </div>
            {payslip.bankInstructions && (
              <>
                {payslip.bankInstructions.sortCode && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Sort Code</p>
                    <p className="font-semibold text-gray-900">{payslip.bankInstructions.sortCode}</p>
                  </div>
                )}
                {payslip.bankInstructions.accountNumber && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Account Number</p>
                    <p className="font-semibold text-gray-900">{payslip.bankInstructions.accountNumber}</p>
                  </div>
                )}
              </>
            )}
            <div>
              <p className="text-sm text-gray-600 mb-1">Currency</p>
              <p className="font-semibold text-gray-900">{payslip.currency}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Country</p>
              <p className="font-semibold text-gray-900">{payslip.country}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="text-center text-sm text-gray-600 py-4">
        <p>Generated on {formatDate(payslip.generatedAt || payslip.createdAt)}</p>
        {payslip.signedBy && (
          <p className="mt-1 text-xs">Verification: {payslip.signedBy.substring(0, 16)}...</p>
        )}
      </div>
    </div>
  );
}