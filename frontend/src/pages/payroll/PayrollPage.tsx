import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { payrollService } from '../../services/payrollService';
import { formatCurrency, formatDate } from '../../lib/utils';

export default function PayrollPage() {
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['payroll', page],
    queryFn: () => payrollService.getAll({ page, limit: 10 }),
  });

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Payroll</h1>
          <p className="text-gray-600 mt-1">Manage employee payroll and payments</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Run Payroll
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Payroll Records</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-center py-8 text-gray-500">Loading...</p>
          ) : data?.data?.length === 0 ? (
            <p className="text-center py-8 text-gray-500">No payroll records found</p>
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
                    <th className="pb-3 font-medium">Pay Date</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.data?.map((payroll: any) => (
                    <tr key={payroll.id} className="border-b last:border-0">
                      <td className="py-4 text-sm font-medium">
                        {payroll.employee?.firstName} {payroll.employee?.lastName}
                      </td>
                      <td className="py-4 text-sm">
                        {formatDate(payroll.payPeriodStart)} - {formatDate(payroll.payPeriodEnd)}
                      </td>
                      <td className="py-4 text-sm">{formatCurrency(payroll.grossPay, payroll.currency)}</td>
                      <td className="py-4 text-sm">{formatCurrency(payroll.totalDeductions, payroll.currency)}</td>
                      <td className="py-4 text-sm font-medium">{formatCurrency(payroll.netPay, payroll.currency)}</td>
                      <td className="py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          payroll.status === 'PAID' ? 'bg-green-100 text-green-800' :
                          payroll.status === 'APPROVED' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {payroll.status}
                        </span>
                      </td>
                      <td className="py-4 text-sm">{formatDate(payroll.payDate)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
