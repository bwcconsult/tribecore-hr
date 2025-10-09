import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { Plus, Upload, DollarSign } from 'lucide-react';
import { formatCurrency } from '../../lib/utils';

export default function ExpensesPage() {
  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Expenses</h1>
          <p className="text-gray-600 mt-1">Submit and manage expense claims</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            Bulk Upload
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Expense
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[
          { title: 'Pending', amount: 0, count: 0, color: 'text-yellow-600' },
          { title: 'Approved', amount: 0, count: 0, color: 'text-green-600' },
          { title: 'Reimbursed', amount: 0, count: 0, color: 'text-blue-600' },
        ].map((stat) => (
          <Card key={stat.title}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <DollarSign className={`h-5 w-5 ${stat.color}`} />
              </div>
              <p className={`text-2xl font-bold ${stat.color}`}>
                {formatCurrency(stat.amount)}
              </p>
              <p className="text-sm text-gray-500 mt-1">{stat.count} claims</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Expenses</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center py-8 text-gray-500">No expense claims found</p>
        </CardContent>
      </Card>
    </div>
  );
}
