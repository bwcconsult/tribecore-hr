import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import { 
  FileText, Users, DollarSign, Calendar, Download, 
  TrendingUp, Award, Clock, Briefcase, Heart, BookOpen,
  FileSpreadsheet, FileBarChart, Filter
} from 'lucide-react';
import { employeeService } from '../../services/employeeService';
import { payrollService } from '../../services/payrollService';
import { leaveService } from '../../services/leaveService';
import { performanceService } from '../../services/performanceService';
import { benefitsService } from '../../services/benefitsService';
import { expensesService } from '../../services/expensesService';
import { toast } from 'react-hot-toast';
import { formatCurrency, formatDate } from '../../lib/utils';

export default function ReportsPage() {
  const [selectedReport, setSelectedReport] = useState<string>('');
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });
  const [exportFormat, setExportFormat] = useState<'pdf' | 'csv' | 'excel'>('pdf');

  // Fetch data for reports
  const { data: employees } = useQuery({
    queryKey: ['employees'],
    queryFn: () => employeeService.getAll({ limit: 1000 }),
  });

  const { data: payrolls } = useQuery({
    queryKey: ['payroll'],
    queryFn: () => payrollService.getAll(),
  });

  const { data: leaves } = useQuery({
    queryKey: ['leave'],
    queryFn: () => leaveService.getAll(),
  });

  const { data: performances } = useQuery({
    queryKey: ['performance'],
    queryFn: () => performanceService.getAll(),
  });

  const { data: benefits } = useQuery({
    queryKey: ['benefit-enrollments'],
    queryFn: () => benefitsService.getAllEnrollments(),
  });

  const { data: expenses } = useQuery({
    queryKey: ['expenses'],
    queryFn: () => expensesService.getAll(),
  });

  const reportTypes = [
    {
      id: 'workforce',
      title: 'Workforce Demographics',
      description: 'Employee distribution, departments, and demographics',
      icon: Users,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      dataCount: employees?.data?.length || 0,
    },
    {
      id: 'payroll',
      title: 'Payroll Summary',
      description: 'Salary expenses, deductions, and payroll trends',
      icon: DollarSign,
      color: 'text-green-600',
      bg: 'bg-green-50',
      dataCount: payrolls?.data?.length || 0,
    },
    {
      id: 'leave',
      title: 'Leave Utilization',
      description: 'Leave patterns, balances, and absence tracking',
      icon: Calendar,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
      dataCount: leaves?.data?.length || 0,
    },
    {
      id: 'performance',
      title: 'Performance Analytics',
      description: 'Employee performance ratings and review insights',
      icon: Award,
      color: 'text-orange-600',
      bg: 'bg-orange-50',
      dataCount: performances?.data?.length || 0,
    },
    {
      id: 'benefits',
      title: 'Benefits Report',
      description: 'Benefits enrollment and cost analysis',
      icon: Heart,
      color: 'text-red-600',
      bg: 'bg-red-50',
      dataCount: benefits?.data?.length || 0,
    },
    {
      id: 'expenses',
      title: 'Expense Report',
      description: 'Expense claims, reimbursements, and spending',
      icon: FileText,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
      dataCount: expenses?.data?.length || 0,
    },
  ];

  const handleGenerateReport = (reportId: string) => {
    setSelectedReport(reportId);
    toast.success(`Generating ${reportTypes.find(r => r.id === reportId)?.title}...`);
  };

  const handleExportReport = async () => {
    if (!selectedReport) {
      toast.error('Please select a report first');
      return;
    }

    try {
      toast.success(`Exporting report as ${exportFormat.toUpperCase()}...`);
      // Simulate export
      setTimeout(() => {
        toast.success('Report exported successfully!');
      }, 1500);
    } catch (error) {
      toast.error('Failed to export report');
    }
  };

  const getReportData = (reportId: string) => {
    switch (reportId) {
      case 'workforce':
        return employees?.data || [];
      case 'payroll':
        return payrolls?.data || [];
      case 'leave':
        return leaves?.data || [];
      case 'performance':
        return performances?.data || [];
      case 'benefits':
        return benefits?.data || [];
      case 'expenses':
        return expenses?.data || [];
      default:
        return [];
    }
  };

  const renderReportPreview = () => {
    if (!selectedReport) return null;

    const reportData = getReportData(selectedReport);
    const reportInfo = reportTypes.find(r => r.id === selectedReport);

    return (
      <Card className="mt-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {reportInfo && <reportInfo.icon className={`h-6 w-6 ${reportInfo.color}`} />}
              <CardTitle>{reportInfo?.title} Preview</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <Select
                value={exportFormat}
                onChange={(e) => setExportFormat(e.target.value as 'pdf' | 'csv' | 'excel')}
                className="w-32"
              >
                <option value="pdf">PDF</option>
                <option value="csv">CSV</option>
                <option value="excel">Excel</option>
              </Select>
              <Button onClick={handleExportReport} size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">Total Records</p>
                <p className="text-2xl font-bold text-gray-900">{reportData.length}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Date Range</p>
                <p className="text-sm font-medium text-gray-900">
                  {formatDate(dateRange.startDate)} - {formatDate(dateRange.endDate)}
                </p>
              </div>
            </div>
            
            {reportData.length > 0 ? (
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      {Object.keys(reportData[0]).slice(0, 5).map((key) => (
                        <th key={key} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {reportData.slice(0, 5).map((row: any, idx: number) => (
                      <tr key={idx}>
                        {Object.values(row).slice(0, 5).map((value: any, colIdx: number) => (
                          <td key={colIdx} className="px-4 py-3 text-sm text-gray-900">
                            {typeof value === 'string' && value.length > 30 
                              ? value.substring(0, 30) + '...' 
                              : String(value)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-center py-8 text-gray-500">No data available for this report</p>
            )}
            
            {reportData.length > 5 && (
              <p className="text-sm text-gray-500 text-center">
                Showing 5 of {reportData.length} records. Export to view all data.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600 mt-1">Generate insights and export comprehensive reports</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline">
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Templates
          </Button>
        </div>
      </div>

      {/* Date Range Filter */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <Filter className="h-5 w-5 text-gray-400" />
            <div className="flex items-center gap-3 flex-1">
              <Input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                className="w-48"
              />
              <span className="text-gray-500">to</span>
              <Input
                type="date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                className="w-48"
              />
            </div>
            <Button variant="outline" size="sm">
              Apply Filter
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Report Types Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        {reportTypes.map((report) => (
          <Card 
            key={report.id} 
            className={`cursor-pointer hover:shadow-lg transition-all ${
              selectedReport === report.id ? 'ring-2 ring-blue-500' : ''
            }`}
            onClick={() => handleGenerateReport(report.id)}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className={`${report.bg} p-3 rounded-lg`}>
                    <report.icon className={`h-6 w-6 ${report.color}`} />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg">{report.title}</CardTitle>
                    <p className="text-sm text-gray-600 mt-1">{report.description}</p>
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <FileBarChart className="h-4 w-4" />
                  <span>{report.dataCount} records</span>
                </div>
                <Button 
                  size="sm" 
                  variant={selectedReport === report.id ? 'default' : 'outline'}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleGenerateReport(report.id);
                  }}
                >
                  {selectedReport === report.id ? 'Selected' : 'Generate'}
                </Button>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>

      {/* Report Preview */}
      {renderReportPreview()}

      {/* Quick Export Actions */}
      {selectedReport && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Export Options</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button 
                variant="outline" 
                className="h-20 flex-col gap-2"
                onClick={() => {
                  setExportFormat('pdf');
                  handleExportReport();
                }}
              >
                <FileText className="h-6 w-6 text-red-600" />
                <span>Export as PDF</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-20 flex-col gap-2"
                onClick={() => {
                  setExportFormat('csv');
                  handleExportReport();
                }}
              >
                <FileSpreadsheet className="h-6 w-6 text-green-600" />
                <span>Export as CSV</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-20 flex-col gap-2"
                onClick={() => {
                  setExportFormat('excel');
                  handleExportReport();
                }}
              >
                <FileBarChart className="h-6 w-6 text-blue-600" />
                <span>Export as Excel</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
