import { Link } from 'react-router-dom';
import { 
  Users, DollarSign, Calendar, TrendingUp, FileText, Clock, Award, 
  GraduationCap, Briefcase, Heart, Shield, Scale, Target, Brain,
  Headphones, BarChart3, ArrowRight, CheckCircle, AlertCircle,
  Zap, Network, Lightbulb
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { useAuthStore } from '../../stores/authStore';

export default function DashboardPage() {
  const { user } = useAuthStore();

  // Mock stats showcasing all modules
  const topStats = [
    { title: 'Total Employees', value: '247', change: '+12%', icon: Users, color: 'blue', trend: 'up' },
    { title: 'Monthly Payroll', value: '£1.2M', change: '+5%', icon: DollarSign, color: 'green', trend: 'up' },
    { title: 'Active Leave', value: '23', change: '-8%', icon: Calendar, color: 'orange', trend: 'down' },
    { title: 'Open Positions', value: '8', change: '+3', icon: Briefcase, color: 'purple', trend: 'up' },
  ];

  const moduleCards = [
    { name: 'Payroll', icon: DollarSign, stats: '£1.2M processed', status: 'On track', color: 'green', link: '/payroll' },
    { name: 'Performance', icon: Award, stats: '89% reviews complete', status: 'Active', color: 'blue', link: '/performance' },
    { name: 'Learning & Development', icon: GraduationCap, stats: '156 courses enrolled', status: 'Active', color: 'purple', link: '/learning' },
    { name: 'Recruitment', icon: Briefcase, stats: '8 open positions', status: 'Hiring', color: 'orange', link: '/recruitment/dashboard' },
    { name: 'Leave Management', icon: Calendar, stats: '23 requests pending', status: 'Active', color: 'yellow', link: '/leave' },
    { name: 'Expenses', icon: FileText, stats: '£45K submitted', status: 'Processing', color: 'indigo', link: '/expenses' },
  ];

  const enterpriseModules = [
    { name: 'AI Governance', icon: Brain, stats: '0 AI systems', color: 'purple', link: '/ai-governance' },
    { name: 'HR Service Desk', icon: Headphones, stats: '0 cases open', color: 'blue', link: '/cases' },
    { name: 'ISO 30414 Analytics', icon: BarChart3, stats: '31 metrics tracked', color: 'green', link: '/analytics/iso30414' },
    { name: 'Position Management', icon: Network, stats: '247 positions', color: 'orange', link: '/positions' },
    { name: 'Skills Cloud', icon: Target, stats: 'Talent matching', color: 'pink', link: '/skills' },
    { name: 'Compensation', icon: DollarSign, stats: 'Salary bands', color: 'teal', link: '/compensation' },
  ];

  const quickActions = [
    { label: 'Run Payroll', icon: DollarSign, link: '/payroll/run', color: 'green' },
    { label: 'Approve Leaves', icon: CheckCircle, link: '/leave', color: 'blue' },
    { label: 'View Reports', icon: BarChart3, link: '/reports', color: 'purple' },
    { label: 'Manage Employees', icon: Users, link: '/employees', color: 'orange' },
  ];

  const recentActivities = [
    { type: 'payroll', message: 'March payroll processed successfully', time: '2 hours ago', icon: DollarSign, color: 'green' },
    { type: 'leave', message: '5 leave requests approved', time: '4 hours ago', icon: CheckCircle, color: 'blue' },
    { type: 'performance', message: '23 performance reviews completed', time: '1 day ago', icon: Award, color: 'purple' },
    { type: 'recruitment', message: '3 new candidates added', time: '1 day ago', icon: Briefcase, color: 'orange' },
    { type: 'learning', message: '45 course enrollments this week', time: '2 days ago', icon: GraduationCap, color: 'indigo' },
  ];

  const systemHealth = [
    { module: 'Payroll Engine', status: 'Healthy', uptime: '99.9%', color: 'green' },
    { module: 'Leave System', status: 'Healthy', uptime: '99.8%', color: 'green' },
    { module: 'Performance Module', status: 'Healthy', uptime: '99.7%', color: 'green' },
    { module: 'Learning Platform', status: 'Healthy', uptime: '100%', color: 'green' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.firstName || 'User'}! 👋
        </h1>
        <p className="text-gray-600 mt-1">Here's what's happening with your HR platform today</p>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {topStats.map((stat) => (
          <Card key={stat.title} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                  <div className="flex items-center mt-2">
                    <span className={`text-sm font-medium ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                      {stat.change}
                    </span>
                    <span className="text-xs text-gray-500 ml-2">vs last month</span>
                  </div>
                </div>
                <div className={`bg-${stat.color}-50 p-3 rounded-lg`}>
                  <stat.icon className={`h-8 w-8 text-${stat.color}-600`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-500" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickActions.map((action) => (
              <Link key={action.label} to={action.link}>
                <button className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all group">
                  <action.icon className={`h-6 w-6 text-${action.color}-600 mx-auto mb-2 group-hover:scale-110 transition-transform`} />
                  <p className="text-sm font-medium text-gray-700">{action.label}</p>
                </button>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Core Modules */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-blue-600" />
                Core HR Modules
              </span>
              <span className="text-sm font-normal text-green-600">All Active</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {moduleCards.map((module) => (
                <Link key={module.name} to={module.link}>
                  <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all group">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 bg-${module.color}-50 rounded-lg`}>
                        <module.icon className={`h-5 w-5 text-${module.color}-600`} />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{module.name}</p>
                        <p className="text-sm text-gray-600">{module.stats}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full bg-${module.color}-100 text-${module.color}-700`}>
                        {module.status}
                      </span>
                      <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Enterprise Modules */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-purple-600" />
                Enterprise Modules
              </span>
              <span className="text-xs font-normal bg-purple-100 text-purple-700 px-2 py-1 rounded-full">NEW</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {enterpriseModules.map((module) => (
                <Link key={module.name} to={module.link}>
                  <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:border-purple-500 hover:bg-purple-50 transition-all group">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 bg-${module.color}-50 rounded-lg`}>
                        <module.icon className={`h-5 w-5 text-${module.color}-600`} />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{module.name}</p>
                        <p className="text-sm text-gray-600">{module.stats}</p>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all" />
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-600" />
              Recent Activities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <div className={`p-2 bg-${activity.color}-50 rounded-lg mt-0.5`}>
                    <activity.icon className={`h-4 w-4 text-${activity.color}-600`} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{activity.message}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* System Health */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-green-600" />
              System Health
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {systemHealth.map((system, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full bg-${system.color}-500`}></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{system.module}</p>
                      <p className="text-xs text-gray-500">Uptime: {system.uptime}</p>
                    </div>
                  </div>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full bg-${system.color}-100 text-${system.color}-700`}>
                    {system.status}
                  </span>
                </div>
              ))}
              <div className="pt-4 border-t">
                <p className="text-sm text-gray-600">
                  <span className="font-semibold text-green-600">All systems operational</span> • Last updated: Just now
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Platform Stats Banner */}
      <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <CardContent className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <p className="text-3xl font-bold">20+</p>
              <p className="text-sm text-blue-100 mt-1">HR Modules</p>
            </div>
            <div>
              <p className="text-3xl font-bold">90+</p>
              <p className="text-sm text-blue-100 mt-1">Features Built</p>
            </div>
            <div>
              <p className="text-3xl font-bold">£2M+</p>
              <p className="text-sm text-blue-100 mt-1">Value Created</p>
            </div>
            <div>
              <p className="text-3xl font-bold">100%</p>
              <p className="text-sm text-blue-100 mt-1">Production Ready</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
