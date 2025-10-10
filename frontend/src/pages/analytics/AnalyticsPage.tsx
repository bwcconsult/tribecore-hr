import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { 
  TrendingUp, Users, DollarSign, Target, Calendar, Award, 
  Clock, Briefcase, BookOpen, Heart, FileText, BarChart3 
} from 'lucide-react';
import { employeeService } from '../../services/employeeService';
import { payrollService } from '../../services/payrollService';
import { performanceService } from '../../services/performanceService';
import { learningService } from '../../services/learningService';
import { benefitsService } from '../../services/benefitsService';
import { leaveService } from '../../services/leaveService';
import { expensesService } from '../../services/expensesService';
import { formatCurrency } from '../../lib/utils';

export default function AnalyticsPage() {
  // Fetch data from all modules
  const { data: employees } = useQuery({
    queryKey: ['employees'],
    queryFn: () => employeeService.getAll({ limit: 1000 }),
  });

  const { data: payrolls } = useQuery({
    queryKey: ['payroll'],
    queryFn: () => payrollService.getAll(),
  });

  const { data: performances } = useQuery({
    queryKey: ['performance'],
    queryFn: () => performanceService.getAll(),
  });

  const { data: courses } = useQuery({
    queryKey: ['courses'],
    queryFn: () => learningService.getAllCourses(),
  });

  const { data: benefits } = useQuery({
    queryKey: ['benefit-enrollments'],
    queryFn: () => benefitsService.getAllEnrollments(),
  });

  const { data: leaves } = useQuery({
    queryKey: ['leave'],
    queryFn: () => leaveService.getAll(),
  });

  const { data: expenses } = useQuery({
    queryKey: ['expenses'],
    queryFn: () => expensesService.getAll(),
  });

  // Calculate comprehensive analytics
  const calculateAnalytics = () => {
    const employeeList = employees?.data || [];
    const payrollList = payrolls?.data || [];
    const performanceList = performances?.data || [];
    const courseList = courses?.data || [];
    const benefitList = benefits?.data || [];
    const leaveList = leaves?.data || [];
    const expenseList = expenses?.data || [];

    // Employee Analytics
    const totalEmployees = employeeList.length;
    const activeEmployees = employeeList.filter((e: any) => e.status === 'ACTIVE').length;
    
    // Payroll Analytics
    const totalPayroll = payrollList.reduce((sum: number, p: any) => sum + (p.netPay || 0), 0);
    const avgSalary = payrollList.length > 0 ? totalPayroll / payrollList.length : 0;
    
    // Performance Analytics
    const avgPerformance = performanceList.length > 0
      ? performanceList.reduce((sum: number, p: any) => sum + (p.overallRating || 0), 0) / performanceList.length
      : 0;
    const topPerformers = performanceList.filter((p: any) => p.overallRating >= 4.5).length;
    
    // Learning Analytics
    const activeCourses = courseList.filter((c: any) => c.status === 'ACTIVE').length;
    const totalCourses = courseList.length;
    
    // Benefits Analytics
    const activeBenefits = benefitList.filter((b: any) => b.status === 'ACTIVE').length;
    const totalBenefitCost = benefitList.reduce((sum: number, b: any) => sum + (b.totalCost || 0), 0);
    
    // Leave Analytics
    const pendingLeaves = leaveList.filter((l: any) => l.status === 'PENDING').length;
    const approvedLeaves = leaveList.filter((l: any) => l.status === 'APPROVED').length;
    
    // Expense Analytics
    const totalExpenses = expenseList.reduce((sum: number, e: any) => sum + (e.amount || 0), 0);
    const pendingExpenses = expenseList.filter((e: any) => e.status === 'PENDING').length;

    // Department Breakdown
    const deptMap: { [key: string]: number } = {};
    employeeList.forEach((emp: any) => {
      deptMap[emp.department] = (deptMap[emp.department] || 0) + 1;
    });

    return {
      totalEmployees,
      activeEmployees,
      totalPayroll,
      avgSalary,
      avgPerformance,
      topPerformers,
      activeCourses,
      totalCourses,
      activeBenefits,
      totalBenefitCost,
      pendingLeaves,
      approvedLeaves,
      totalExpenses,
      pendingExpenses,
      departments: deptMap,
    };
  };

  const analytics = calculateAnalytics();
  const engagementScore = analytics.avgPerformance ? (analytics.avgPerformance / 5.0 * 100).toFixed(1) : '0';

  const kpis = [
    { 
      title: 'Total Employees', 
      value: analytics.totalEmployees, 
      subtitle: `${analytics.activeEmployees} active`,
      icon: Users, 
      color: 'text-blue-600',
      bg: 'bg-blue-50'
    },
    { 
      title: 'Avg. Salary', 
      value: formatCurrency(analytics.avgSalary, 'USD'), 
      subtitle: `Total: ${formatCurrency(analytics.totalPayroll, 'USD')}`,
      icon: DollarSign, 
      color: 'text-green-600',
      bg: 'bg-green-50'
    },
    { 
      title: 'Engagement Score', 
      value: `${engagementScore}%`, 
      subtitle: `${analytics.topPerformers} top performers`,
      icon: Target, 
      color: 'text-purple-600',
      bg: 'bg-purple-50'
    },
    { 
      title: 'Avg. Performance', 
      value: analytics.avgPerformance.toFixed(2), 
      subtitle: 'Out of 5.0',
      icon: Award, 
      color: 'text-orange-600',
      bg: 'bg-orange-50'
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Advanced Analytics</h1>
        <p className="text-gray-600 mt-1">Comprehensive workforce insights and data-driven metrics</p>
      </div>

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {kpis.map((kpi) => (
          <Card key={kpi.title}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">{kpi.title}</p>
                  <p className={`text-3xl font-bold ${kpi.color} mt-2`}>{kpi.value}</p>
                  <p className="text-xs text-gray-500 mt-1">{kpi.subtitle}</p>
                </div>
                <div className={`${kpi.bg} p-3 rounded-lg`}>
                  <kpi.icon className={`h-8 w-8 ${kpi.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Module-Specific Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* Learning Analytics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-blue-600" />
              Learning & Development
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Active Courses</span>
                <span className="text-lg font-bold text-blue-600">{analytics.activeCourses}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Courses</span>
                <span className="text-lg font-semibold">{analytics.totalCourses}</span>
              </div>
              <div className="pt-2 border-t">
                <p className="text-xs text-gray-500">
                  {analytics.activeCourses > 0 ? 'Training programs are active' : 'No active courses'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Benefits Analytics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-red-600" />
              Benefits
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Active Enrollments</span>
                <span className="text-lg font-bold text-red-600">{analytics.activeBenefits}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Monthly Cost</span>
                <span className="text-lg font-semibold">{formatCurrency(analytics.totalBenefitCost, 'USD')}</span>
              </div>
              <div className="pt-2 border-t">
                <p className="text-xs text-gray-500">
                  Total benefit program investment
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Leave Analytics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-green-600" />
              Leave Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Pending Requests</span>
                <span className="text-lg font-bold text-yellow-600">{analytics.pendingLeaves}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Approved</span>
                <span className="text-lg font-semibold text-green-600">{analytics.approvedLeaves}</span>
              </div>
              <div className="pt-2 border-t">
                <p className="text-xs text-gray-500">
                  {analytics.pendingLeaves > 0 ? `${analytics.pendingLeaves} requests need attention` : 'All requests processed'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Expense Analytics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-purple-600" />
              Expenses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Expenses</span>
                <span className="text-lg font-bold text-purple-600">{formatCurrency(analytics.totalExpenses, 'USD')}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Pending Claims</span>
                <span className="text-lg font-semibold text-yellow-600">{analytics.pendingExpenses}</span>
              </div>
              <div className="pt-2 border-t">
                <p className="text-xs text-gray-500">
                  Expense reimbursement tracking
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Department Breakdown */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-indigo-600" />
              Department Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(analytics.departments).map(([dept, count]) => (
                <div key={dept} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Briefcase className="h-4 w-4 text-gray-400" />
                    <span className="text-sm font-medium">{dept}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-indigo-600 h-2 rounded-full" 
                        style={{ width: `${(count / analytics.totalEmployees) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-bold text-indigo-600 w-12 text-right">{count}</span>
                  </div>
                </div>
              ))}
              {Object.keys(analytics.departments).length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">No department data available</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Workforce Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                  <h4 className="font-semibold text-blue-900">Headcount</h4>
                </div>
                <p className="text-sm text-blue-700">
                  {analytics.totalEmployees} total employees with {analytics.activeEmployees} currently active
                </p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  <h4 className="font-semibold text-green-900">Compensation</h4>
                </div>
                <p className="text-sm text-green-700">
                  Average salary of {formatCurrency(analytics.avgSalary, 'USD')} per employee
                </p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Award className="h-5 w-5 text-purple-600" />
                  <h4 className="font-semibold text-purple-900">Performance</h4>
                </div>
                <p className="text-sm text-purple-700">
                  {analytics.topPerformers} employees rated as top performers (4.5+)
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions Needed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.pendingLeaves > 0 && (
                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm font-medium">Pending Leave Requests</span>
                  </div>
                  <span className="text-sm font-bold text-yellow-600">{analytics.pendingLeaves}</span>
                </div>
              )}
              {analytics.pendingExpenses > 0 && (
                <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-orange-600" />
                    <span className="text-sm font-medium">Pending Expense Claims</span>
                  </div>
                  <span className="text-sm font-bold text-orange-600">{analytics.pendingExpenses}</span>
                </div>
              )}
              {analytics.activeCourses > 0 && (
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium">Active Training Courses</span>
                  </div>
                  <span className="text-sm font-bold text-blue-600">{analytics.activeCourses}</span>
                </div>
              )}
              {analytics.pendingLeaves === 0 && analytics.pendingExpenses === 0 && (
                <div className="text-center py-8">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-3">
                    <Award className="h-6 w-6 text-green-600" />
                  </div>
                  <p className="text-sm font-medium text-gray-900">All caught up!</p>
                  <p className="text-xs text-gray-500 mt-1">No pending actions required</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
