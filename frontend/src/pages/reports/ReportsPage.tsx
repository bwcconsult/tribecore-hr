import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { FileText, Users, DollarSign, Calendar } from 'lucide-react';

export default function ReportsPage() {
  const reports = [
    {
      title: 'Workforce Demographics',
      description: 'View employee distribution and demographics',
      icon: Users,
      color: 'text-blue-600',
    },
    {
      title: 'Payroll Summary',
      description: 'Analyze payroll expenses and trends',
      icon: DollarSign,
      color: 'text-green-600',
    },
    {
      title: 'Leave Utilization',
      description: 'Track leave patterns and balances',
      icon: Calendar,
      color: 'text-purple-600',
    },
    {
      title: 'Custom Reports',
      description: 'Create and export custom reports',
      icon: FileText,
      color: 'text-orange-600',
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
        <p className="text-gray-600 mt-1">Generate insights and export data</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reports.map((report) => (
          <Card key={report.title} className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start gap-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <report.icon className={`h-6 w-6 ${report.color}`} />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-lg">{report.title}</CardTitle>
                  <p className="text-sm text-gray-600 mt-1">{report.description}</p>
                </div>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
}
